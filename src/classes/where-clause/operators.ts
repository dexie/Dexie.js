import { NeverRange } from '../../dbcore/keyrange';
import { cmp, cmpreverse } from '../../functions/cmp';
import { getArrayOf, NO_CHAR_ARRAY } from '../../functions/utils';
import {
  DBCoreCursor,
  DBCoreKeyRange,
  DBCoreRangeType,
} from '../../public/types/dbcore';
import { createRange, rangeEqual } from './where-clause-helpers';

export interface Criteria {
  range: DBCoreKeyRange;
  algorithm?: (
    cursor: DBCoreCursor,
    advance: (advancer: ()=>void) => void,
    resolve: () => void
  ) => boolean;
}

export const operators = {
  $eq: (value: any) => [rangeEqual(value)],
  $gt: (lower: any) => [createRange(lower, undefined, true)],
  $gte: (lower: any) => [createRange(lower, undefined)],
  $lt: (upper: any) => [createRange(undefined, upper, false, true)],
  $lte: (upper: any) => [createRange(undefined, upper)],
  $in(needles: any) {
    const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments) as any[];
    if (set.length === 0) return NeverRange;
    if (set.length === 1) return rangeEqual(set[0]);
    set.sort(needles);
    return [
      createRange(set[0], set[set.length - 1]),
      (reverse?: boolean) => {
        let i = 0;
        let compare = cmp;
        if (reverse) {
          set.sort(cmpreverse);
          compare = cmpreverse;
        }
        return (
          cursor: DBCoreCursor,
          advance: (advancer: ()=>void) => void,
          resolve: () => void
        ) => {
          const key = cursor.key;
          while (compare(key, set[i]) > 0) {
            // The cursor has passed beyond this key. Check next.
            ++i;
            if (i === set.length) {
              // There is no next. Stop searching.
              advance(resolve);
              return false;
            }
          }
          if (compare(key, set[i]) === 0) {
            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
            return true;
          } else {
            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
            advance(() => {
              cursor.continue(set[i]);
            });
            return false;
          }
        };
      },
    ];
  },
  // TODO: Add the other dexie operators (except those that alias the above):
  // equalsIgnoreCase(), anyOfIgnoreCase(), etc.... Use same names prefixed with $.
  // Don't alias anything else than what mongo has
};
