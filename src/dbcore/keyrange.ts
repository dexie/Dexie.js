import { DBCoreKeyRange, DBCoreRangeType } from '../public/types/dbcore';

export const AnyRange: DBCoreKeyRange = {
  type: DBCoreRangeType.Any,
  lower: -Infinity,
  lowerOpen: false,
  upper: [[]],
  upperOpen: false
}

export const NeverRange: DBCoreKeyRange = {
  type: DBCoreRangeType.Never,
  lower: -Infinity,
  lowerOpen: true,
  upper: -Infinity,
  upperOpen: true
}
