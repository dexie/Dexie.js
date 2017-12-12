import { Dexie } from "../interfaces/dexie";

export const maxString = String.fromCharCode(65535);
// maxKey is an Array<Array> if indexedDB implementations supports array keys (not supported by IE,Edge or Safari at the moment)
// Otherwise maxKey is maxString. This is handy when needing an open upper border without limit.
export const maxKey = (function(){try {IDBKeyRange.only([[]]);return [[]];}catch(e){return maxString;}})();
export const minKey = -Infinity;
export const INVALID_KEY_ARGUMENT =
  "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
export const STRING_EXPECTED = "String expected.";
export const connections: Dexie[] = [];
export const isIEOrEdge =
  typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
export const hasIEDeleteObjectStoreBug = isIEOrEdge;
export const hangsOnDeleteLargeKeyRange = isIEOrEdge;
export const dexieStackFrameFilter = frame => !/(dexie\.js|dexie\.min\.js)/.test(frame);
