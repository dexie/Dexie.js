import { cmp } from '../../functions/cmp';
import { isArray } from '../../functions/utils';
import { CacheEntry } from '../../public/types/cache';
import {
  DBCoreMutateRequest,
  DBCoreQueryRequest,
  DBCoreTable,
} from '../../public/types/dbcore';
import {
  applyWithEventReduce,
  keyToId,
  toKeyDocumentMap,
  toPaths,
} from '../event-reduce-apply';
import type { ReducibleQuery } from '../event-reduce-apply';
import { isWithinRange } from './is-within-range';
import {
  applyToWindowBuffer,
  getWindowBuffer,
  setWindowBuffer,
} from './window-buffer';

/** Applies mutations to a cached query result with the EventReduce algorithm
 * (see applyWithEventReduce()).
 *
 * When the new result cannot be derived from the old one (for example when a
 * row leaves a full limit window and the next row is unknown), the cache entry
 * is marked dirty so that it is queried again once the transaction has
 * committed, and the result is returned unchanged.
 *
 * Queries with a limit keep rows after the result window in a buffer (see
 * createWindowBuffer()), so a row leaving a full window can be replaced from
 * memory until the buffer is used up.
 *
 * Queries on multiEntry indexes (where a row can be in the result more than
 * once) and deleteRange mutations are not handled by EventReduce. They mark
 * the cache entry dirty when they might affect the result.
 */
export function applyOptimisticOps(
  result: any[],
  req: DBCoreQueryRequest,
  ops: DBCoreMutateRequest[] | undefined,
  table: DBCoreTable,
  cacheEntry: CacheEntry,
  immutable: boolean,
  commit?: boolean
): any[] {
  if (!ops || ops.length === 0) return result;
  const windowBuffer = getWindowBuffer(cacheEntry);
  if (windowBuffer) {
    // Rows after the result window are kept, see createWindowBuffer().
    if (ops.some((op) => op.type === 'deleteRange')) {
      return requery(
        result,
        ops,
        req,
        table,
        cacheEntry,
        windowBuffer.keyDocumentMap
      );
    }
    const applied = applyToWindowBuffer(windowBuffer, ops);
    if (!applied) {
      cacheEntry.dirty = true;
      return result;
    }
    if (commit) setWindowBuffer(cacheEntry, applied.buffer);
    return !applied.changed
      ? result
      : immutable
        ? (Object.freeze(applied.results) as any[])
        : applied.results;
  }
  const primaryKey = table.schema.primaryKey;
  if (!req.values || primaryKey.outbound) {
    return requery(result, ops, req, table, cacheEntry);
  }
  const keyDocumentMap = toKeyDocumentMap(result, primaryKey.extractKey!);
  const query = toReducibleQuery(req, table);
  if (
    !keyDocumentMap ||
    !query ||
    ops.some((op) => op.type === 'deleteRange')
  ) {
    return requery(result, ops, req, table, cacheEntry, keyDocumentMap);
  }
  const reduced = applyWithEventReduce(result, ops, query, keyDocumentMap);
  if (!reduced) {
    cacheEntry.dirty = true;
    return result;
  }
  return reduced === result || !immutable
    ? reduced
    : (Object.freeze(reduced) as any[]);
}

/** The query of a request for EventReduce, or null if EventReduce can't
 * handle it.
 */
export function toReducibleQuery(
  req: DBCoreQueryRequest,
  table: DBCoreTable
): ReducibleQuery | null {
  const index = req.query.index;
  const primaryKey = table.schema.primaryKey;
  if (!req.values || primaryKey.outbound || index.multiEntry) return null;
  const extractPrimKey = primaryKey.extractKey!;
  const extractIndex = index.extractKey!;
  const lowLevelIndex = index.lowLevelIndex || index;
  const extractLowLevelIndex = lowLevelIndex.extractKey!;
  const queryRange = req.query.range;
  const reverse = req.direction === 'prev' || req.direction === 'prevunique';
  return {
    extractPrimKey,
    sortFields: toPaths(lowLevelIndex.keyPath).concat(
      toPaths(primaryKey.keyPath)
    ),
    limit: req.limit,
    matches: (value) => isWithinRange(extractIndex(value), queryRange),
    // Same order as the index: index key, then primary key.
    compare: (a, b) => {
      const order =
        cmp(extractLowLevelIndex(a), extractLowLevelIndex(b)) ||
        cmp(extractPrimKey(a), extractPrimKey(b));
      return reverse ? -order : order;
    },
  };
}

/** Marks the cache entry dirty, so that it is queried again once the
 * transaction has committed, when one of the mutations might change the result.
 */
function requery(
  result: any[],
  ops: DBCoreMutateRequest[],
  req: DBCoreQueryRequest,
  table: DBCoreTable,
  cacheEntry: CacheEntry,
  keyDocumentMap?: Map<string, any>
): any[] {
  const extractPrimKey = table.schema.primaryKey.extractKey;
  const extractIndex = req.query.index.extractKey;
  const isInResult = (key: any) => {
    const id = keyToId(key);
    return !keyDocumentMap || id === undefined || keyDocumentMap.has(id);
  };
  const affected = ops.some((op) => {
    switch (op.type) {
      case 'add':
      case 'put':
        return op.values.some((value) => {
          if (!extractPrimKey || !extractIndex) return true;
          const key = extractIndex(value);
          return (
            isInResult(extractPrimKey(value)) ||
            (isArray(key)
              ? key.some((k) => isWithinRange(k, req.query.range))
              : isWithinRange(key, req.query.range))
          );
        });
      case 'delete':
        return op.keys.some(isInResult);
      default:
        return true; // deleteRange
    }
  });
  if (affected) cacheEntry.dirty = true;
  return result;
}
