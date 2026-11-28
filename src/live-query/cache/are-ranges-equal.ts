import { cmp } from '../../functions/cmp';
import { DBCoreKeyRange } from '../../public/types/dbcore';

export function areRangesEqual(r1: DBCoreKeyRange, r2: DBCoreKeyRange) {
  return (
    areBoundsEqual(r1.lower, r2.lower) &&
    areBoundsEqual(r1.upper, r2.upper) &&
    !!r1.lowerOpen === !!r2.lowerOpen &&
    !!r1.upperOpen === !!r2.upperOpen
  );
}

/** An undefined bound means the range is open-ended on that side.
 * cmp() returns NaN for undefined, so it cannot be used for those. */
function areBoundsEqual(a: any, b: any) {
  return a === undefined || b === undefined ? a === b : cmp(a, b) === 0;
}
