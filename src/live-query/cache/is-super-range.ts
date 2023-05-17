import { cmp } from '../../functions/cmp';
import { DBCoreKeyRange } from '../../public/types/dbcore';

export function compareLowers(lower1: any, lower2: any, lowerOpen1: boolean, lowerOpen2: boolean) {
  if (lower1 === undefined) return lower2 !== undefined ? -1 : 0;
  if (lower2 === undefined) return 1; // since lower1 !== undefined
  const c = cmp(lower1, lower2);
  if (c === 0) {
    if (lowerOpen1 && lowerOpen2) return 0;
    if (lowerOpen1) return 1
    if (lowerOpen2) return -1;
  }
  return c;
}

export function compareUppers(upper1: any, upper2: any, upperOpen1: boolean, upperOpen2: boolean) {
  if (upper1 === undefined) return upper2 !== undefined ? 1 : 0;
  if (upper2 === undefined) return -1; // since upper1 !== undefined
  const c = cmp(upper1, upper2);
  if (c === 0) {
    if (upperOpen1 && upperOpen2) return 0;
    if (upperOpen1) return -1
    if (upperOpen2) return 1;
  }
  return c;
}

export function isSuperRange(r1: DBCoreKeyRange, r2: DBCoreKeyRange) {
  return (
    compareLowers(r1.lower, r2.lower, r1.lowerOpen, r2.lowerOpen) <= 0 &&
    compareUppers(r1.upper, r2.upper, r1.upperOpen, r2.upperOpen) >= 0
  );
}