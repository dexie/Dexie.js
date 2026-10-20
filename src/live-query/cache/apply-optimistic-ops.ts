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
import { isWithinRange } from './is-within-range';

/** Applies mutations to a cached query result with the EventReduce algorithm
 * (see applyWithEventReduce()).
 *
 * When the new result cannot be derived from the old one (for example when a
 * row leaves a full limit window and the next row is unknown), the cache entry
 * is marked dirty so that it is queried again once the transaction has
 * committed, and the result is returned unchanged.
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
  if (!req.values || primaryKey.outbound) {
    return requery(result, ops, req, table, cacheEntry);
  }
  const extractPrimKey = primaryKey.extractKey!;
  const keyDocumentMap = toKeyDocumentMap(result, extractPrimKey);
  if (
    !keyDocumentMap ||
    index.multiEntry ||
    ops.some((op) => op.type === 'deleteRange')
  ) {
    return requery(result, ops, req, table, cacheEntry, keyDocumentMap);
  }
  const extractIndex = index.extractKey!;
  const lowLevelIndex = index.lowLevelIndex || index;
  const extractLowLevelIndex = lowLevelIndex.extractKey!;
  const queryRange = req.query.range;
  const reverse = req.direction === 'prev' || req.direction === 'prevunique';

  const reduced = applyWithEventReduce(
    result,
    ops,
    {
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
    },
    keyDocumentMap
  );
  if (!reduced) {
    cacheEntry.dirty = true;
    return result;
  }
  return reduced === result || !immutable
    ? reduced
    : (Object.freeze(reduced) as any[]);
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
