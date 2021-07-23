/**
 * Patching in types for Chrome's extended transaction API
 * Corresponds to this change: https://chromium.googlesource.com/chromium/src/+/d762124e2b4090a7985cddc5438678de7900fcc4/third_party/blink/renderer/modules/indexeddb/idb_transaction_options.idl
 */
type ChromeTransactionDurability = 'default' | 'strict' | 'relaxed'

interface IDBTransactionOptions {
    durability: ChromeTransactionDurability
}

interface IDBDatabase {
    transaction(storeNames: string | string[], mode?: IDBTransactionMode, options?: IDBTransactionOptions): IDBTransaction
}