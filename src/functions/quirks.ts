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

export const isModernChromeInternal = (userAgent: string) => {
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  return chromeMatch && parseInt(chromeMatch[1], 10) >= 115;
}

/** 
 * Chrome 115 allows a page to enter the BFCache with active connections
 * and transactions, as long as they're not blocking others. Additionally,
 * it supports the "versionchange" event natively. As a result, there
 * is no need to track Dexie connections in a global array to support
 * BFCache or "versionchange" on modern Chrome.
 */
export const isModernChrome = typeof navigator !== 'undefined' &&
  isModernChromeInternal(navigator.userAgent);
