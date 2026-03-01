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
 * Check if getAllRecords() is supported.
 * getAllRecords() is a new IndexedDB API (Interop 2026) that provides
 * 2-5x faster reads, especially for reverse iteration.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex/getAllRecords
 */
export const hasGetAllRecords = typeof IDBObjectStore !== 'undefined' &&
  typeof IDBObjectStore.prototype.getAllRecords === 'function';
