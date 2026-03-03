import { Dexie } from "../classes/dexie";

export const DEXIE_VERSION = '{version}'; // Replaced by build-script.
export const maxString = String.fromCharCode(65535);
export const minKey = -Infinity; // minKey can be constant. maxKey must be a prop of Dexie (_maxKey)
export const INVALID_KEY_ARGUMENT =
  "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
export const STRING_EXPECTED = "String expected.";
import { createConnectionsList, ConnectionsList } from "../helpers/connection-tracker";

// Global connection list.
// If weak references are supported, this is a ConnectionTracker.
// Otherwise, it falls back to a standard Array with a polyfilled delete().
export const connections: ConnectionsList = createConnectionsList();

export const DEFAULT_MAX_CONNECTIONS = 1000;
export const dexieStackFrameFilter = frame => !/(dexie\.js|dexie\.min\.js)/.test(frame);
export const DBNAMES_DB = '__dbnames';
export const READONLY = 'readonly';
export const READWRITE = 'readwrite';

