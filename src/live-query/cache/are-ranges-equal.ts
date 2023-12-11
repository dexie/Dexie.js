import { cmp } from '../../functions/cmp';
import { DBCoreKeyRange } from '../../public/types/dbcore';

export function areRangesEqual(r1: DBCoreKeyRange, r2: DBCoreKeyRange) {
  return (
    cmp(r1.lower, r2.lower) === 0 &&
    cmp(r1.upper, r2.upper) === 0 &&
    !!r1.lowerOpen === !!r2.lowerOpen &&
    !!r1.upperOpen === !!r2.upperOpen
  );
}
