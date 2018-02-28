import { KeyRange } from '../L1-dbcore/dbcore';

// NOT (IN [10, 20, 30]) ==> IN [undefined..-10, +10..-20, +20..-30, +30..undefined]
export function invertRanges (ranges: KeyRange[]) {
  const rv: KeyRange[] = [];
  let prevUpper, prevUpperOpen = true;
  ranges.forEach(({lower, upper, lowerOpen, upperOpen}) => {
    rv.push({
      lower: prevUpper,
      lowerOpen: !prevUpperOpen,
      upper: lower,
      upperOpen: !lowerOpen
    });
    prevUpper = upper;
    prevUpperOpen = upperOpen;
  });
  rv.push({
    lower: prevUpper,
    lowerOpen: !prevUpperOpen,
    upper: undefined,
    upperOpen: true
  });
  return rv;
}
