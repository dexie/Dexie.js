import { Table } from "./table";
import { Dexie } from "./dexie";
import { TransactionEvents } from "./transaction-events";
import { IndexableType } from "./indexable-type";

export interface Transaction {
  db: Dexie;
  active: boolean;
  mode: IDBTransactionMode;
  //tables: { [type: string]: Table<any, any> }; Deprecated since 2.0. Obsolete from v3.0.
  storeNames: Array<string>;
  parent?: Transaction;
  on: TransactionEvents;
  abort(): void;
  table(tableName: string): Table;
  table<T>(tableName: string): Table<T>;
  table<T, TKey extends IndexableType, TEntity>(tableName: string): Table<T, TKey, TEntity>;
}
