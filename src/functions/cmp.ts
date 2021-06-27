import { domDeps } from '../classes/dexie/dexie-dom-dependencies';
import { exceptions } from '../errors';
import { IndexableType } from '../public';

let _cmp: (a: any, b: any) => number;
export function cmp(a: IndexableType, b: IndexableType): number {
  if (_cmp) return _cmp(a, b);
  const {indexedDB} = domDeps;
  if (!indexedDB) throw new exceptions.MissingAPI();
  _cmp = (a, b) => {
    try {
      return a == null || b == null ? NaN : indexedDB.cmp(a, b);
    } catch {
      return NaN;
    }
  }
  return _cmp(a, b);
}
