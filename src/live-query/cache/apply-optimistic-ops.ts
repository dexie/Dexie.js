import { cmp } from '../../functions/cmp';
import { deepClone, isArray } from '../../functions/utils';
import { RangeSet, rangesOverlap } from '../../helpers/rangeset';
import { CacheEntry } from '../../public/types/cache';
import {
  DBCoreIndex,
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
  const extractPrimKey = primaryKey.extractKey;
  const extractIndex = index.extractKey;
  const extractLowLevelIndex = (index.lowLevelIndex || index).extractKey;

  let finalResult = ops.reduce((result, op) => {
    let modifedResult = result;
    const includedValues =
      op.type === 'add' || op.type === 'put'
        ? op.values.filter((v) => {
              const key = extractIndex(v);
              return multiEntry && isArray(key) // multiEntry index work like plain index unless key is array
                ? key.some((k) => isWithinRange(k, queryRange)) // multiEntry and array key
                : isWithinRange(key, queryRange); // multiEntry but not array key
            }).map(v => {
              v = deepClone(v);// v might come from user so we can't just freeze it.
              if (immutable) Object.freeze(v);
              return v;
            })
        : [];
    switch (op.type) {
      case 'add':
        modifedResult = result.concat(
          req.values
            ? includedValues
            : includedValues.map((v) => extractPrimKey(v))
        );
        break;
      case 'put':
        const keySet = new RangeSet().addKeys(
          op.values.map((v) => extractPrimKey(v))
        );
        modifedResult = result
          .filter((item) => {
            const key = req.values ? extractPrimKey(item) : item;
            return !rangesOverlap(new RangeSet(key), keySet);
          })
          .concat(
            req.values
              ? includedValues
              : includedValues.map((v) => extractPrimKey(v))
          );
        break;
      case 'delete':
        const keysToDelete = new RangeSet().addKeys(op.keys);
        modifedResult = result.filter((item) => {
          const key = req.values ? extractPrimKey(item) : item;
          return !rangesOverlap(new RangeSet(key), keysToDelete);
        });

        break;
      case 'deleteRange':
        const range = op.range;
        modifedResult = result.filter((item) => !isWithinRange(extractPrimKey(item), range));
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
