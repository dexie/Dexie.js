import { Table } from "./table";
import { Database } from "./database";
import { TransactionEvents } from "./transaction-events";

export interface Transaction {
  db: Database;
  active: boolean;
  mode: IDBTransactionMode;
  //tables: { [type: string]: Table<any, any> }; Deprecated since 2.0. Obsolete from v3.0.
  storeNames: Array<string>;
  parent?: Transaction;
  on: TransactionEvents;
  abort(): void;
  table(tableName: string): Table<any, any>;
  table<T>(tableName: string): Table<T, any>;
  table<T, Key>(tableName: string): Table<T, Key>;
}
