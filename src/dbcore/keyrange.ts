import { domDeps } from '../classes/dexie/dexie-dom-dependencies';
import { getMaxKey } from '../functions/quirks';
import { DBCoreKeyRange, DBCoreRangeType } from '../public/types/dbcore';

export const AnyRange: DBCoreKeyRange = {
  type: DBCoreRangeType.Any,
  lower: -Infinity,
  lowerOpen: false,
  get upper() { return getMaxKey(domDeps.IDBKeyRange) },
  upperOpen: false
}

export const NeverRange: DBCoreKeyRange = {
  type: DBCoreRangeType.Never,
  lower: -Infinity,
  lowerOpen: true,
  upper: -Infinity,
  upperOpen: true
}
