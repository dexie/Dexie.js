import { cmp } from '../../functions/cmp';
import { IndexableType } from '../../public';
import { DBCoreKeyRange } from '../../public/types/dbcore';

export function isAboveLower(key: IndexableType, range: DBCoreKeyRange) {
  return range.lower === undefined
    ? true // lower is less than anything because it is undefined
    : range.lowerOpen
    ? cmp(key, range.lower) > 0 // lowerOpen: Exclude lower bound
    : cmp(key, range.lower) >= 0; // !lowerOpen: Include lower bound
}

export function isBelowUpper(key: IndexableType, range: DBCoreKeyRange) {
  return range.upper === undefined
    ? true // upper is greater than anything because it is undefined
    : range.upperOpen
    ? cmp(key, range.upper) < 0 // upperOpen: Exclude upper bound
    : cmp(key, range.upper) <= 0; // !upperOpen: Include upper bound
}

export function isWithinRange(key: IndexableType, range: DBCoreKeyRange) {
  return isAboveLower(key, range) && isBelowUpper(key, range);
}
