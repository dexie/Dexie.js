import { cmp } from '../functions/cmp';
import { deepClone, getByKeyPath, setByKeyPath } from '../functions/utils';
import DexiePromise, { PSD } from '../helpers/promise';
import { RangeSet } from '../helpers/rangeset';
import { ObservabilitySet } from '../public/types/db-events';
import {
  DBCore,
  DBCoreIndex,
  DBCoreKeyRange,
  DBCoreMutateRequest,
  DBCoreMutateResponse,
  DBCoreRangeType,
} from '../public/types/dbcore';
import { Middleware } from '../public/types/middleware';
import type { Collection } from '../classes/collection';
import type { Transaction } from '../classes/transaction';
import { isWithinRange } from './cache/is-within-range';
import {
  applyWithEventReduce,
  keyToId,
  ReducibleMutation,
  ReducibleQuery,
  toKeyDocumentMap,
  toPaths,
  toQueryParams,
} from './event-reduce-apply';
import { applyToWindowBuffer } from './cache/window-buffer';
import {
  createResultWindowBuffer,
  getRecommendedResultWindowBufferSize,
  getResultWindowBufferQuery,
  getResultWindowBufferResults,
  resetResultWindowBuffer,
} from 'event-reduce-js';
import type { ResultWindowBuffer } from 'event-reduce-js';
import type { LiveQueryContext } from './live-query';

/*
 * Reduced queries
 * ===============
 * A liveQuery runs its querier again whenever a write overlaps with what the
 * querier has read. Collections that are read with a cursor (because they use
 * filter(), offset() or sortBy()) are then read again from IndexedDB.
 *
 * Instead, each liveQuery subscription keeps the previous result of such a
 * collection in a "slot". The writes committed since the last run are applied
 * to it with EventReduce. Only when the new result cannot be derived from the
 * old one (for example when a row leaves a full limit window), or when the
 * table was changed by another tab or another Dexie instance, the collection is
 * read from IndexedDB again.
 *
 * Collections with a limit keep some rows before and after the result window
 * (EventReduce's result window buffer). A row leaving the window is then
 * replaced from memory until the buffer is used up.
 *
 * Slots are matched between runs of the same subscription by the shape of the
 * collection: table, index, range, direction, offset, limit, sortBy() key path
 * and the source code of the filter() functions. Filter functions are expected
 * to be pure: they are only run again on changed rows. A filter that depends on
 * outer variables which change without a new subscription is only re-evaluated
 * for the changed rows, not for all of them.
 */

type CollectionContext = Collection['_ctx'];

interface ReducedQuerySlot {
  tableKey: string;
  /** null until the collection has been read from IndexedDB. */
  results: any[] | null;
  keyDocumentMap: Map<string, any> | null;
  /** Rows around the result window of collections with a limit, so that rows
   * moving into the window can be taken from memory. */
  buffer: ResultWindowBuffer<any> | null;
  /** Committed writes on the table since results was last updated. */
  pending: ReducibleMutation[];
  pendingValues: number;
  /** Set when the table was changed in a way that is not in pending. */
  invalid: boolean;
  runId: number;
}

/** State of one liveQuery subscription. */
export interface ReducedQueryState {
  slots: Map<string, ReducedQuerySlot>;
  runId: number;
}

/** State of one run of a liveQuery querier. */
export interface ReducedQueryRun {
  state: ReducedQueryState;
  runId: number;
  occurrences: Map<string, number>;
}

/** When more values than this are written before the next run, the collection
 * is read again instead of applying all of them one by one. */
const MAX_PENDING_VALUES = 1000;

const slotsByTable = new Map<string, Set<ReducedQuerySlot>>();

export function createReducedQueryState(): ReducedQueryState {
  return { slots: new Map(), runId: 0 };
}

export function beginReducedQueryRun(
  state: ReducedQueryState
): ReducedQueryRun {
  return { state, runId: ++state.runId, occurrences: new Map() };
}

/** Removes the slots that the last run of the querier did not use anymore. */
export function endReducedQueryRun(run: ReducedQueryRun) {
  const { state, runId } = run;
  if (state.runId !== runId) return; // A newer run has started.
  state.slots.forEach((slot, key) => {
    if (slot.runId !== runId) removeSlot(state, key, slot);
  });
}

export function disposeReducedQueryState(state: ReducedQueryState) {
  state.slots.forEach((slot, key) => removeSlot(state, key, slot));
}

function removeSlot(
  state: ReducedQueryState,
  key: string,
  slot: ReducedQuerySlot
) {
  state.slots.delete(key);
  const slots = slotsByTable.get(slot.tableKey);
  if (slots) {
    slots.delete(slot);
    if (slots.size === 0) slotsByTable.delete(slot.tableKey);
  }
}

/** Called when tables were changed by another tab, worker or Dexie instance,
 * or when the database was (re)created. Those writes are not known here, so the
 * affected collections have to be read from IndexedDB again.
 */
export function invalidateReducedQueries(updatedParts: ObservabilitySet) {
  if (updatedParts.all) {
    slotsByTable.forEach((slots) => slots.forEach(invalidate));
    return;
  }
  for (const part in updatedParts) {
    const match = /^idb\:\/\/(.*)\/(.*)\//.exec(part);
    if (match) {
      const slots = slotsByTable.get(match[1] + '/' + match[2]);
      if (slots) slots.forEach(invalidate);
    }
  }
}

function invalidate(slot: ReducedQuerySlot) {
  slot.invalid = true;
  slot.pending = [];
  slot.pendingValues = 0;
}

function deliver(tableKey: string, mutations: ReducibleMutation[]) {
  const slots = slotsByTable.get(tableKey);
  if (!slots) return;
  let values = 0;
  for (const mutation of mutations) {
    values +=
      mutation.type === 'deleteRange'
        ? MAX_PENDING_VALUES
        : 'values' in mutation
          ? mutation.values.length
          : mutation.keys.length;
  }
  slots.forEach((slot) => {
    if (slot.invalid) return;
    slot.pendingValues += values;
    if (slot.pendingValues > MAX_PENDING_VALUES) {
      invalidate(slot);
    } else {
      slot.pending.push(...mutations);
    }
  });
}

/** Records the writes of each transaction and hands them to the reduced
 * queries of the written tables once the transaction has committed.
 */
export const reducedQueriesMiddleware: Middleware<DBCore> = {
  stack: 'dbcore',
  level: 0,
  name: 'ReducedQueries',
  create: (core) => {
    const dbName = core.schema.name;
    const transactions = new WeakMap<
      object,
      Map<string, { primaryKey: DBCoreIndex; mutations: CapturedMutation[] }>
    >();
    return {
      ...core,
      transaction(stores, mode, options) {
        const idbtrans = core.transaction(stores, mode, options) as any;
        if (mode === 'readwrite') {
          // Listen before Dexie's Transaction sets oncomplete, which fires the
          // storagemutated event that makes live queries run again. The writes
          // must have been delivered to the reduced queries by then.
          idbtrans.addEventListener('complete', () => {
            const tables = transactions.get(idbtrans);
            if (tables) {
              transactions.delete(idbtrans);
              tables.forEach(({ primaryKey, mutations }, key) =>
                deliver(key, toReducibleMutations(primaryKey, mutations))
              );
            }
          });
        }
        return idbtrans;
      },
      table(tableName) {
        const table = core.table(tableName);
        const { primaryKey } = table.schema;
        if (primaryKey.outbound) return table; // Not supported by reduced queries.
        const tableKey = dbName + '/' + tableName;
        return {
          ...table,
          mutate(req: DBCoreMutateRequest): Promise<DBCoreMutateResponse> {
            return table.mutate(req).then((res) => {
              let tables = transactions.get(req.trans);
              if (!tables) transactions.set(req.trans, (tables = new Map()));
              let entry = tables.get(tableKey);
              if (!entry)
                tables.set(tableKey, (entry = { primaryKey, mutations: [] }));
              entry.mutations.push({ req, res });
              return res;
            });
          },
        };
      },
    };
  },
};

interface CapturedMutation {
  req: DBCoreMutateRequest;
  res: DBCoreMutateResponse;
}

function toReducibleMutations(
  primaryKey: DBCoreIndex,
  captured: CapturedMutation[]
): ReducibleMutation[] {
  return captured.map(({ req, res }): ReducibleMutation => {
    switch (req.type) {
      case 'add':
      case 'put': {
        const values: any[] = [];
        req.values.forEach((value, i) => {
          if (res.failures[i]) return;
          // Clone so that later changes of the caller's object are not seen.
          const clone = deepClone(value);
          if (primaryKey.extractKey(clone) == null && res.results) {
            setByKeyPath(clone, primaryKey.keyPath, res.results[i]); // auto-incremented
          }
          values.push(clone);
        });
        return { type: req.type, values };
      }
      case 'delete':
        return { type: 'delete', keys: req.keys };
      default:
        return { type: 'deleteRange' };
    }
  });
}

/** Reads a collection inside a liveQuery from the previous result of the same
 * collection plus the writes committed since then.
 *
 * Returns undefined when the collection is not read inside a liveQuery or
 * cannot be reduced, and the caller reads it from IndexedDB as usual.
 */
export function readReducedCollection(
  ctx: CollectionContext,
  trans: Transaction,
  sortByKeyPath: string | null,
  /** Reads the collection, or its rows with another offset and limit. */
  readFromDb: (offset?: number, limit?: number) => PromiseLike<any[]>
): PromiseLike<any[]> | undefined {
  const run = (PSD as LiveQueryContext).reducedQueries;
  const subscr = (PSD as LiveQueryContext).subscr;
  if (!run || !subscr || !isReducible(ctx, trans, sortByKeyPath)) return;
  const table = ctx.table;
  const db = table.db;
  const core = table.core;
  const schema = core.schema;
  const primaryKey = schema.primaryKey;
  const index = ctx.isPrimKey
    ? primaryKey
    : schema.getIndexByKeyPath(ctx.index as any);
  if (!index || index.multiEntry || primaryKey.outbound) return;

  const range = ctx.range;
  const jsFilters = ctx.jsFilters || [];
  const signature = JSON.stringify([
    db.name,
    table.name,
    index.name || '',
    rangeId(range),
    ctx.dir,
    ctx.offset,
    ctx.limit === Infinity ? null : ctx.limit,
    sortByKeyPath,
    jsFilters.map((fn) => '' + fn),
  ]);
  const occurrence = run.occurrences.get(signature) || 0;
  run.occurrences.set(signature, occurrence + 1);
  const key = signature + '#' + occurrence;
  const tableKey = db.name + '/' + table.name;
  let slot = run.state.slots.get(key);
  if (!slot) {
    slot = {
      tableKey,
      results: null,
      keyDocumentMap: null,
      buffer: null,
      pending: [],
      pendingValues: 0,
      invalid: false,
      runId: run.runId,
    };
    run.state.slots.set(key, slot);
    // Register before reading, so that no committed write can be missed.
    let slots = slotsByTable.get(tableKey);
    if (!slots) slotsByTable.set(tableKey, (slots = new Set()));
    slots.add(slot);
  }
  slot.runId = run.runId;

  const extractPrimKey = primaryKey.extractKey!;
  const fullRange = new RangeSet(db.core.MIN_KEY, db.core.MAX_KEY);
  const done = (results: any[]) => {
    observe(
      subscr,
      db.name,
      table.name,
      index,
      range,
      fullRange,
      ctx.offset > 0,
      jsFilters.length > 0,
      results,
      extractPrimKey,
      db.core.MIN_KEY,
      db.core.MAX_KEY
    );
    return deepClone(results);
  };
  const query = toReducibleQuery(
    ctx,
    index,
    primaryKey,
    jsFilters,
    sortByKeyPath
  );
  const readAgain = () => {
    const current = slot!;
    current.pending = [];
    current.pendingValues = 0;
    current.invalid = false;
    const bufferSize =
      ctx.limit < Infinity
        ? getRecommendedResultWindowBufferSize(ctx.limit)
        : 0;
    const buffer = (current.buffer = bufferSize
      ? createResultWindowBuffer(toQueryParams(query), {
          limitBufferSize: bufferSize,
          skipBufferSize: bufferSize,
        })
      : null);
    const bufferQuery =
      buffer &&
      getResultWindowBufferQuery(buffer, {
        skip: ctx.offset,
        limit: ctx.limit,
      });
    return readFromDb(bufferQuery?.skip, bufferQuery?.limit).then((rows) => {
      const map = toKeyDocumentMap(rows, extractPrimKey);
      if (map && buffer) {
        resetResultWindowBuffer(buffer, rows);
        current.results = getResultWindowBufferResults(buffer);
        current.keyDocumentMap = buffer.keyDocumentMap;
      } else {
        current.results = map ? rows : null;
        current.keyDocumentMap = map || null;
      }
      return done(current.results || rows);
    });
  };

  if (!slot.results || !slot.keyDocumentMap || slot.invalid) return readAgain();
  if (slot.pending.length === 0)
    return DexiePromise.resolve(done(slot.results));

  let reduced: any[] | null;
  if (slot.buffer) {
    const applied = applyToWindowBuffer(
      slot.buffer,
      slot.pending,
      ctx.offset > 0
    );
    if (!applied) return readAgain();
    slot.buffer = applied.buffer;
    slot.keyDocumentMap = applied.buffer.keyDocumentMap;
    reduced = applied.results;
  } else {
    reduced = applyWithEventReduce(
      slot.results,
      slot.pending,
      query,
      slot.keyDocumentMap
    );
  }
  if (!reduced) return readAgain();
  slot.results = reduced;
  slot.pending = [];
  slot.pendingValues = 0;
  return DexiePromise.resolve(done(reduced));
}

function isReducible(
  ctx: CollectionContext,
  trans: Transaction,
  sortByKeyPath: string | null
) {
  return (
    trans.mode === 'readonly' && // An explicit rw transaction may have uncommitted writes.
    ctx.table.db._options.cache !== 'disabled' &&
    !ctx.error &&
    ctx.range.type !== DBCoreRangeType.Never &&
    !ctx.or && // Multiple ranges
    !ctx.algorithm && // anyOf(), startsWithIgnoreCase() and similar
    !ctx.unique &&
    !ctx.keysOnly &&
    !ctx.valueMapper && // mapToClass() or hook('reading')
    !ctx.limitBeforeOffset && // limit() before offset() cannot be expressed
    // Only filter() / and() filters, no until() or distinct():
    (ctx.filterCount || 0) === (ctx.jsFilters ? ctx.jsFilters.length : 0) &&
    // sortBy() sorts the result of the limited collection:
    (!sortByKeyPath || (ctx.offset === 0 && ctx.limit === Infinity))
  );
}

function toReducibleQuery(
  ctx: CollectionContext,
  index: DBCoreIndex,
  primaryKey: DBCoreIndex,
  jsFilters: Function[],
  sortByKeyPath: string | null
): ReducibleQuery {
  const extractPrimKey = primaryKey.extractKey!;
  const extractIndex = index.extractKey!;
  const lowLevelIndex = index.lowLevelIndex || index;
  const extractLowLevelIndex = lowLevelIndex.extractKey!;
  const range = ctx.range;
  const direction = ctx.dir === 'prev' ? -1 : 1;
  // The order of the cursor: index key, then primary key.
  const cursorOrder = (a: any, b: any) =>
    direction *
    (cmp(extractLowLevelIndex(a), extractLowLevelIndex(b)) ||
      cmp(extractPrimKey(a), extractPrimKey(b)));
  const sortFields = toPaths(lowLevelIndex.keyPath).concat(
    toPaths(primaryKey.keyPath)
  );
  return {
    extractPrimKey,
    sortFields: sortByKeyPath ? [sortByKeyPath].concat(sortFields) : sortFields,
    limit: ctx.limit,
    skip: ctx.offset,
    matches: (value) => {
      const key = extractIndex(value);
      return (
        cmp(key, key) === 0 && // Rows without a valid key are not in the index.
        isWithinRange(key, range) &&
        jsFilters.every((fn) => fn(value))
      );
    },
    compare: sortByKeyPath
      ? (a, b) => {
          // Like sortBy(): a stable sort of the cursor's order by the key path.
          const order = cmp(
            getByKeyPath(a, sortByKeyPath),
            getByKeyPath(b, sortByKeyPath)
          );
          return (order === order ? direction * order : 0) || cursorOrder(a, b);
        }
      : cursorOrder,
  };
}

/** Subscribes the liveQuery to the same changes as reading the collection
 * with a cursor would.
 */
function observe(
  subscr: ObservabilitySet,
  dbName: string,
  tableName: string,
  index: DBCoreIndex,
  range: DBCoreKeyRange,
  fullRange: RangeSet,
  hasOffset: boolean,
  hasFilter: boolean,
  results: any[],
  extractPrimKey: (value: any) => any,
  minKey: any,
  maxKey: any
) {
  const getRangeSet = (indexName: string) => {
    const part = `idb://${dbName}/${tableName}/${indexName}`;
    return (subscr[part] || (subscr[part] = new RangeSet())) as RangeSet;
  };
  if (index.lowLevelIndex) {
    // A virtual index (the prefix of a compound index) is read and written
    // as the compound index, whose keys are not comparable with the range.
    getRangeSet(index.lowLevelIndex.name || '').add(fullRange);
  } else {
    getRangeSet(index.name || '').add(
      new RangeSet(range.lower ?? minKey, range.upper ?? maxKey)
    );
  }
  if (hasFilter) {
    // filter() reads every row of the range. A change of any of them can
    // make it match, also when its indexed value did not change.
    getRangeSet('').add(new RangeSet(minKey, maxKey));
  } else if (!index.isPrimaryKey) {
    getRangeSet('').addKeys(results.map(extractPrimKey));
  }
  if (hasOffset) {
    // A delete or move of any row in front of the window shifts the window,
    // also when the writer did not know the previous index value of the row.
    getRangeSet(':dels').add(fullRange);
  }
}

function rangeId(range: DBCoreKeyRange) {
  return [
    range.type,
    keyToId(range.lower) || '',
    !!range.lowerOpen,
    keyToId(range.upper) || '',
    !!range.upperOpen,
  ];
}
