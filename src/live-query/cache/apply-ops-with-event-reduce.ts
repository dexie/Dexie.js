import { calculateActionName, runAction } from 'event-reduce-js';
import type { ChangeEvent, QueryParams } from 'event-reduce-js';
import { cmp } from '../../functions/cmp';
import { isArray } from '../../functions/utils';
import { CacheEntry } from '../../public/types/cache';
import {
  DBCoreMutateRequest,
  DBCoreQueryRequest,
  DBCoreTable,
} from '../../public/types/dbcore';
import { isWithinRange } from './is-within-range';

type ResultKey = string | number;

function isResultKey(key: any): key is ResultKey {
  return typeof key === 'string' || typeof key === 'number';
}

/** Applies mutations to a cached query result with the EventReduce algorithm
 * (https://github.com/pubkey/event-reduce).
 *
 * Each written value is applied as a change event to the previous result:
 * moved, inserted and removed rows are put at their sort position without
 * re-sorting the whole result, and EventReduce detects when the new result
 * cannot be derived from the old one (for example when a row leaves a full
 * limit window and the next row is unknown). In that case the cache entry is
 * marked dirty so that it is queried again.
 *
 * The previous version of a row is only known when it is part of the result.
 * That is enough because a DBCore query has no offset: a row outside the result
 * either did not match the query or was sorted after a full limit window, so an
 * update of it behaves like an insert and a delete of it changes nothing.
 *
 * Returns undefined when the request or the mutations are not supported
 * (multiEntry indexes, compound, nested or non-string/number primary keys,
 * deleteRange), and the caller falls back to its own algorithm.
 */
export function applyOpsWithEventReduce(
  result: any[],
  req: DBCoreQueryRequest,
  ops: DBCoreMutateRequest[],
  table: DBCoreTable,
  cacheEntry: CacheEntry
): any[] | undefined {
  const index = req.query.index;
  const primaryKey = table.schema.primaryKey;
  const primaryKeyPath = primaryKey.keyPath;
  if (
    !req.values ||
    index.multiEntry ||
    primaryKey.outbound ||
    typeof primaryKeyPath !== 'string' ||
    primaryKeyPath.indexOf('.') !== -1 ||
    ops.some((op) => op.type === 'deleteRange')
  ) {
    return undefined;
  }
  const extractPrimKey = primaryKey.extractKey!;
  const extractIndex = index.extractKey!;
  const lowLevelIndex = index.lowLevelIndex || index;
  const extractLowLevelIndex = lowLevelIndex.extractKey!;
  const queryRange = req.query.range;
  const reverse = req.direction === 'prev' || req.direction === 'prevunique';
  const indexKeyPath = lowLevelIndex.keyPath;

  const queryParams: QueryParams<any> = {
    primaryKey: primaryKeyPath,
    // Fields that decide the sort position. Used by EventReduce to detect
    // whether an update moved a row.
    sortFields: (indexKeyPath == null
      ? []
      : isArray(indexKeyPath)
        ? indexKeyPath
        : [indexKeyPath]
    ).concat(primaryKeyPath),
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

  const keyDocumentMap = new Map<ResultKey, any>();
  for (let i = 0, l = result.length; i < l; ++i) {
    const key = extractPrimKey(result[i]);
    if (!isResultKey(key)) return undefined;
    keyDocumentMap.set(key, result[i]);
  }

  let results = result.slice();
  let changed = false;
  for (const op of ops) {
    const changeEvents: ChangeEvent<any>[] = [];
    if (op.type === 'add' || op.type === 'put') {
      for (const value of op.values) {
        const key = extractPrimKey(value);
        if (!isResultKey(key)) return undefined;
        const previous = keyDocumentMap.get(key);
        if (previous && op.type === 'add') continue; // add() of an existing key fails
        changeEvents.push(
          previous
            ? { operation: 'UPDATE', id: key as string, doc: value, previous }
            : {
                operation: 'INSERT',
                id: key as string,
                doc: value,
                previous: null,
              }
        );
      }
    } else if (op.type === 'delete') {
      for (const key of op.keys) {
        if (!isResultKey(key)) return undefined;
        const previous = keyDocumentMap.get(key);
        if (!previous) continue; // not in the result: nothing changes
        changeEvents.push({
          operation: 'DELETE',
          id: key as string,
          doc: null,
          previous,
        });
      }
    }
    for (const changeEvent of changeEvents) {
      const action = calculateActionName({
        queryParams,
        changeEvent,
        previousResults: results,
        keyDocumentMap: keyDocumentMap as Map<string, any>,
      });
      if (action === 'runFullQueryAgain') {
        cacheEntry.dirty = true;
        return undefined;
      }
      if (action !== 'doNothing') {
        changed = true;
        results = runAction(
          action,
          queryParams,
          changeEvent,
          results,
          keyDocumentMap as Map<string, any>
        );
      }
    }
  }
  return changed ? results : result;
}
