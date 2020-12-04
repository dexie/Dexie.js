import { cmp } from '../functions/cmp';
import { SimpleRange } from '../public/types/simple-range';

export function rangesOverlap (range1: SimpleRange, range2: SimpleRange) {
  return (
    cmp(range2[0], range1[range1.length - 1]) <= 0 &&
    cmp(range2[range2.length - 1], range1[0]) >= 0
  );
}

export function isSubRange(subRange: SimpleRange, superRange: SimpleRange) {
  return (
    cmp(superRange[0], subRange[0]) <= 0 &&
    cmp(superRange[superRange.length - 1], subRange[subRange.length - 1]) >= 0
  );
}
