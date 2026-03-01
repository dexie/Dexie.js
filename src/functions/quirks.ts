import { maxString } from '../globals/constants';

export function safariMultiStoreFix(storeNames: string[]) {
  return storeNames.length === 1 ? storeNames[0] : storeNames;
}

export function getNativeGetDatabaseNamesFn(indexedDB) {
  var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
  return fn && fn.bind(indexedDB);
}

export let getMaxKey = (IdbKeyRange: typeof IDBKeyRange) => {
  try {
    IdbKeyRange.only([[]]);
    getMaxKey = () => [[]];
    return [[]];
  } catch (e) {
    getMaxKey = () => maxString;
    return maxString;
  }
}

/**
 * Check if IndexedDB 3.0 features are supported.
 * IDB 3.0 adds direction parameter to getAll()/getAllKeys() options.
 * We detect this by checking for getAllRecords() which is also part of IDB 3.0.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex/getAll
 * @see https://w3c.github.io/IndexedDB/
 */
export const hasIdb3Features = typeof IDBObjectStore !== 'undefined' &&
  typeof IDBObjectStore.prototype.getAllRecords === 'function';
