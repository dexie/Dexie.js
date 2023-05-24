import { DBCoreKeyRange } from '../../public/types/dbcore';
import { isBelowUpper } from './is-within-range';


export function doesRangesOverlap(r1: DBCoreKeyRange, r2: DBCoreKeyRange) {
  return isBelowUpper(r1.lower, r2) && isBelowUpper(r2.lower, r1);
}
