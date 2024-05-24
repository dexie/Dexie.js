import { Table } from "./table";
import { Dexie } from "./dexie";
import { TransactionEvents } from "./transaction-events";

export interface Transaction {
  db: Dexie;
  active: boolean;
  mode: IDBTransactionMode;
  idbtrans: IDBTransaction;
  //tables: { [type: string]: Table<any, any> }; Deprecated since 2.0. Obsolete from v3.0.
  storeNames: Array<string>;
  explicit?: boolean;
  parent?: Transaction;
  on: TransactionEvents;
  abort(): void;
  table(tableName: string): Table<any, any>;
  table<T>(tableName: string): Table<T, any>;
  table<T, Key>(tableName: string): Table<T, Key>;
  table<T, Key, TInsertType>(tableName: string): Table<T, Key, TInsertType>;
}
