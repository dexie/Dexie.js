import { cmp } from '../../functions/cmp';
import { isArray } from '../../functions/utils';
import { CacheEntry } from '../../public/types/cache';
import {
  DBCoreMutateRequest,
  DBCoreQueryRequest,
  DBCoreTable,
} from '../../public/types/dbcore';
import type { ResultWindowBuffer } from 'event-reduce-js';
import { applyToWindowBuffer, keyToId, toPaths } from '../event-reduce-apply';
import type { ReducibleQuery } from '../event-reduce-apply';
import { isWithinRange } from './is-within-range';
import { getEntryBuffer } from './window-buffer';

/** Applies mutations to a cached query result with EventReduce, see
 * applyToWindowBuffer(). The commit applies them to the entry's buffer; the
 * optimistic results of reads apply them to a copy.
 *
 * When the new result cannot be derived from the buffer (for example when a
 * row leaves a full limit window and the buffer is used up), the cache entry
 * is marked dirty so that it is queried again, and the result is returned
 * unchanged.
 *
 * Queries that EventReduce does not handle (multiEntry indexes, outbound
 * primary keys, keys only) and deleteRange mutations mark the cache entry
 * dirty when they might affect the result.
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
  const buffer = getEntryBuffer(cacheEntry);
  if (!buffer || ops.some((op) => op.type === 'deleteRange')) {
    return requery(result, ops, req, table, cacheEntry, buffer);
  }
  const applied = applyToWindowBuffer(buffer, ops, !commit);
  if (!applied) {
    cacheEntry.dirty = true;
    return result;
  }
  return !applied.changed
    ? result
    : immutable
      ? (Object.freeze(applied.results) as any[])
      : applied.results;
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
  buffer: ResultWindowBuffer<any> | undefined
): any[] {
  const extractPrimKey = table.schema.primaryKey.extractKey;
  const extractIndex = req.query.index.extractKey;
  // The ids of the rows that are known, if they can be known.
  const ids =
    buffer?.keyDocumentMap ||
    (req.values && !table.schema.primaryKey.outbound
      ? new Set(result.map((value) => keyToId(extractPrimKey(value))))
      : null);
  const isInResult = (key: any) => {
    const id = keyToId(key);
    return !ids || id === undefined || ids.has(id);
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
