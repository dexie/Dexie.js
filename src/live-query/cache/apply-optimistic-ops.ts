import {
  calculateActionFunction,
  doNothing,
  runFullQueryAgain,
} from 'event-reduce-js';
import type { ChangeEvent, QueryParams } from 'event-reduce-js';
import { cmp, getUint8Array, type } from '../../functions/cmp';
import { isArray } from '../../functions/utils';
import { CacheEntry } from '../../public/types/cache';
import {
  DBCoreMutateRequest,
  DBCoreQueryRequest,
  DBCoreTable,
} from '../../public/types/dbcore';
import { isWithinRange } from './is-within-range';

/** Applies mutations to a cached query result with the EventReduce algorithm
 * (https://github.com/pubkey/event-reduce).
 *
 * Each written value is applied as a change event to the previous result:
 * moved, inserted and removed rows are put at their sort position without
 * re-sorting the whole result. When the new result cannot be derived from the
 * old one (for example when a row leaves a full limit window and the next row
 * is unknown), the cache entry is marked dirty so that it is queried again
 * once the transaction has committed, and the result is returned unchanged.
 *
 * The previous version of a row is only known when it is part of the result.
 * That is enough because a DBCore query has no offset: a row outside the result
 * either did not match the query or was sorted after a full limit window, so an
 * update of it behaves like an insert and a delete of it changes nothing.
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
  immutable: boolean
): any[] {
  if (!ops || ops.length === 0) return result;
  const index = req.query.index;
  const primaryKey = table.schema.primaryKey;
  const extractPrimKey = primaryKey.extractKey!;
  const extractIndex = index.extractKey!;
  const lowLevelIndex = index.lowLevelIndex || index;
  const extractLowLevelIndex = lowLevelIndex.extractKey!;
  const queryRange = req.query.range;
  const reverse = req.direction === 'prev' || req.direction === 'prevunique';
  const getDocumentId = (doc: any) => keyToId(extractPrimKey(doc));
  if (!req.values || primaryKey.outbound) {
    return requery(result, ops, req, table, cacheEntry);
  }

  const keyDocumentMap = new Map<string, any>();
  for (let i = 0, l = result.length; i < l; ++i) {
    const id = getDocumentId(result[i]);
    if (id === undefined) return requery(result, ops, req, table, cacheEntry);
    keyDocumentMap.set(id, result[i]);
  }
  if (index.multiEntry || ops.some((op) => op.type === 'deleteRange')) {
    return requery(result, ops, req, table, cacheEntry, keyDocumentMap);
  }

  const queryParams: QueryParams<any> = {
    primaryKey: '', // not used, ids come from getDocumentId
    getDocumentId,
    // Fields that decide the sort position. Used by EventReduce to detect
    // whether an update moved a row.
    sortFields: toPaths(lowLevelIndex.keyPath).concat(
      toPaths(primaryKey.keyPath)
    ),
    limit: req.limit && req.limit < Infinity ? req.limit : undefined,
    queryMatcher: (value) => isWithinRange(extractIndex(value), queryRange),
    // Same order as the index: index key, then primary key.
    // EventReduce needs a comparator that never returns 0.
    sortComparator: (a, b) => {
      const order =
        cmp(extractLowLevelIndex(a), extractLowLevelIndex(b)) ||
        cmp(extractPrimKey(a), extractPrimKey(b));
      return (reverse ? -order : order) < 0 ? -1 : 1;
    },
  };

  const results = result.slice();
  let changed = false;
  for (const op of ops) {
    const changeEvents: ChangeEvent<any>[] = [];
    if (op.type === 'add' || op.type === 'put') {
      for (const value of op.values) {
        const id = getDocumentId(value);
        if (id === undefined) {
          return requery(result, ops, req, table, cacheEntry, keyDocumentMap);
        }
        const previous = keyDocumentMap.get(id);
        if (previous && op.type === 'add') continue; // add() of an existing key fails
        changeEvents.push(
          previous
            ? { operation: 'UPDATE', id, doc: value, previous }
            : { operation: 'INSERT', id, doc: value, previous: null }
        );
      }
    } else if (op.type === 'delete') {
      for (const key of op.keys) {
        const id = keyToId(key);
        if (id === undefined) continue; // not a valid key: nothing is deleted
        const previous = keyDocumentMap.get(id);
        if (!previous) continue; // not in the result: nothing changes
        changeEvents.push({ operation: 'DELETE', id, doc: null, previous });
      }
    }
    for (const changeEvent of changeEvents) {
      const input = {
        queryParams,
        changeEvent,
        previousResults: results,
        keyDocumentMap,
      };
      // calculateActionFunction() keeps the action names out of the bundle.
      const action = calculateActionFunction(input);
      if (action === runFullQueryAgain) {
        cacheEntry.dirty = true;
        return result;
      }
      if (action !== doNothing) {
        changed = true;
        action(input); // mutates results and keyDocumentMap
      }
    }
  }
  if (!changed) return result;
  return immutable ? (Object.freeze(results) as any[]) : results;
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

function toPaths(keyPath: null | string | string[]): string[] {
  return keyPath == null ? [] : isArray(keyPath) ? keyPath : [keyPath];
}

/** Returns a string that is unique for each IndexedDB key, so that keys of
 * any type can be used as ids for EventReduce. Returns undefined for values
 * that are not valid keys.
 */
function keyToId(key: any): string | undefined {
  switch (type(key)) {
    case 'number':
      return key === key ? 'n' + key : undefined; // NaN is not a valid key
    case 'string':
      return 's' + key;
    case 'Date': {
      const time = key.getTime();
      return time === time ? 'd' + time : undefined;
    }
    case 'binary':
      return 'b' + getUint8Array(key).join(',');
    case 'Array': {
      const ids: string[] = [];
      for (let i = 0; i < key.length; ++i) {
        const id = keyToId(key[i]);
        if (id === undefined) return undefined;
        ids.push(id);
      }
      return 'a' + JSON.stringify(ids);
    }
  }
  return undefined;
}
