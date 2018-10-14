import { KeyRange, RangeType } from '../public/types/dbcore';

var x: KeyRange;

export const AnyRange: KeyRange = {
  type: RangeType.Any,
  lower: -Infinity,
  lowerOpen: false,
  upper: [[]], // BUGBUG: depends on indexeddb impl.
  upperOpen: false
}

export const NeverRange: KeyRange = {
  type: RangeType.Never,
  lower: -Infinity,
  lowerOpen: true,
  upper: -Infinity,
  upperOpen: true
}
