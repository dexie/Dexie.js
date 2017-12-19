import { IDBKeyRangeConstructor } from '../public/types/indexeddb';
import { maxString } from '../globals/constants';

export function safariMultiStoreFix(storeNames: string[]) {
  return storeNames.length === 1 ? storeNames[0] : storeNames;
}

export function getNativeGetDatabaseNamesFn(indexedDB) {
  var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
  return fn && fn.bind(indexedDB);
}

export function getMaxKey (IDBKeyRange: IDBKeyRangeConstructor) {
  try {
    IDBKeyRange.only([[]]);
    return [[]];
  } catch (e) {
    return maxString;
  }
}
