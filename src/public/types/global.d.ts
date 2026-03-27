/**
 * Patching in types for Chrome's extended transaction API
 * Corresponds to this change: https://chromium.googlesource.com/chromium/src/+/d762124e2b4090a7985cddc5438678de7900fcc4/third_party/blink/renderer/modules/indexeddb/idb_transaction_options.idl
 */
type ChromeTransactionDurability = 'default' | 'strict' | 'relaxed';

interface IDBTransactionOptions {
  durability?: ChromeTransactionDurability;
}

interface IDBDatabase {
  transaction(
    storeNames: string | string[],
    mode?: IDBTransactionMode,
    options?: IDBTransactionOptions
  ): IDBTransaction;
}

/**
 * Type definitions for IndexedDB 3.0 features (Interop 2026)
 * - getAll(options) and getAllKeys(options) with direction parameter
 * - getAllRecords() for retrieving records with keys
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex/getAll
 * @see https://w3c.github.io/IndexedDB/
 */
interface IDBGetAllOptions {
  query?: IDBKeyRange | IDBValidKey | null;
  count?: number;
  direction?: IDBCursorDirection;
}

interface IDBRecord<T = any> {
  key: IDBValidKey;
  primaryKey: IDBValidKey;
  value: T;
}

interface IDBObjectStore {
  // IDB 3.0: getAll/getAllKeys with options object including direction
  getAll(options: IDBGetAllOptions): IDBRequest<any[]>;
  getAllKeys(options: IDBGetAllOptions): IDBRequest<IDBValidKey[]>;
  // getAllRecords is used for feature detection
  getAllRecords?(options?: IDBGetAllOptions): IDBRequest<IDBRecord[]>;
}

interface IDBIndex {
  // IDB 3.0: getAll/getAllKeys with options object including direction
  getAll(options: IDBGetAllOptions): IDBRequest<any[]>;
  getAllKeys(options: IDBGetAllOptions): IDBRequest<IDBValidKey[]>;
  // getAllRecords is used for feature detection
  getAllRecords?(options?: IDBGetAllOptions): IDBRequest<IDBRecord[]>;
}
