type IDBTransactionDurability = 'default' | 'strict' | 'relaxed'

interface IDBTransactionOptions {
    durability: IDBTransactionDurability
}

interface IDBDatabase {
    transaction(storeNames: string | string[], mode?: IDBTransactionMode, options?: IDBTransactionOptions): IDBTransaction
}