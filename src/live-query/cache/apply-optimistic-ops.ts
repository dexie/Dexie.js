import { cmp } from '../../functions/cmp';
import { isArray } from '../../functions/utils';
import { RangeSet } from '../../helpers/rangeset';
import { CacheEntry } from '../../public/types/cache';
import {
  DBCoreMutateRequest,
  DBCoreQueryRequest,
  DBCoreTable,
} from '../../public/types/dbcore';
import { isWithinRange } from './is-within-range';

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
  const { multiEntry } = index;
  const queryRange = req.query.range;
  const primaryKey = table.schema.primaryKey;
  const extractPrimKey = primaryKey.extractKey!;
  const extractIndex = index.extractKey!;
  const extractLowLevelIndex = (index.lowLevelIndex || index).extractKey!;

  let finalResult = ops.reduce((result, op) => {
    let modifedResult = result;
    const includedValues: any[] = [];
    if (op.type === 'add' || op.type === 'put') {
      const includedPKs = new RangeSet(); // For ignoring duplicates
      for (let i = op.values.length - 1; i >= 0; --i) {
        // backwards to prioritize last value of same PK
        const value = op.values[i];
        const pk = extractPrimKey(value);
        if (includedPKs.hasKey(pk)) continue;
        const key = extractIndex(value);
        if (
          multiEntry && isArray(key)
            ? key.some((k) => isWithinRange(k, queryRange))
            : isWithinRange(key, queryRange)
        ) {
          includedPKs.addKey(pk);
          includedValues.push(value);
        }
      }
    }
    switch (op.type) {
      case 'add': {
        const existingKeys = new RangeSet().addKeys(
          req.values ? result.map((v) => extractPrimKey(v)) : result
        );

        modifedResult = result.concat(
          req.values
            ? includedValues.filter((v) => {
                const key = extractPrimKey(v);
                if (existingKeys.hasKey(key)) return false;
                existingKeys.addKey(key);
                return true;
              })
            : includedValues
                .map((v) => extractPrimKey(v))
                .filter((k) => {
                  if (existingKeys.hasKey(k)) return false;
                  existingKeys.addKey(k);
                  return true;
                })
        );
        break;
      }
      case 'put': {
        const keySet = new RangeSet().addKeys(
          op.values.map((v) => extractPrimKey(v))
        );
        modifedResult = result
          .filter(
            // Remove all items that are being replaced
            (item) => !keySet.hasKey(req.values ? extractPrimKey(item) : item)
          )
          .concat(
            // Add all items that are being put (sorting will be done later)
            req.values
              ? includedValues
              : includedValues.map((v) => extractPrimKey(v))
          );
        break;
      }
      case 'delete':
        const keysToDelete = new RangeSet().addKeys(op.keys);
        modifedResult = result.filter(
          (item) =>
            !keysToDelete.hasKey(req.values ? extractPrimKey(item) : item)
        );

        break;
      case 'deleteRange':
        const range = op.range;
        modifedResult = result.filter(
          (item) => !isWithinRange(extractPrimKey(item), range)
        );
        break;
    }
    return modifedResult;
  }, result);

  // If no changes were made, we can return the original result.
  if (finalResult === result) return result;

  // Sort the result on sortIndex:
  finalResult.sort((a, b) =>
    cmp(extractLowLevelIndex(a), extractLowLevelIndex(b)) ||
    cmp(extractPrimKey(a), extractPrimKey(b))
  );

  // If we have a limit we need to respect it:
  if (req.limit && req.limit < Infinity) {
    if (finalResult.length > req.limit) {
      finalResult.length = req.limit; // Cut of any extras after sorting correctly.
    } else if (result.length === req.limit && finalResult.length < req.limit) {
      // We're missing some items because of the limit. We need to add them back.
      // The easiest way is to mark the cache entry as dirty, which will cause
      // it to be requeried after the write-transaction successfully completes.
      cacheEntry.dirty = true;
    }
  }
  return immutable ? Object.freeze(finalResult) as any[] : finalResult;
}
