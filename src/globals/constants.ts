import { Dexie } from "../classes/dexie";

export const DEXIE_VERSION = '{version}'; // Replaced by build-script.
export const maxString = String.fromCharCode(65535);
export const minKey = -Infinity; // minKey can be constant. maxKey must be a prop of Dexie (_maxKey)
export const INVALID_KEY_ARGUMENT =
  "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
export const STRING_EXPECTED = "String expected.";
export const connections: Dexie[] = [];
export const isIEOrEdge =
  typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
export const hasIEDeleteObjectStoreBug = isIEOrEdge;
export const hangsOnDeleteLargeKeyRange = isIEOrEdge;
export const dexieStackFrameFilter = frame => !/(dexie\.js|dexie\.min\.js)/.test(frame);
export const DBNAMES_DB = '__dbnames';
export const READONLY = 'readonly';
export const READWRITE = 'readwrite';
