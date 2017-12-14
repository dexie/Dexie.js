import { Table } from "./table";
import { Database } from "./database";
import { IDBValidKey } from "./indexeddb";
import { TransactionEvents } from "./transaction-events";

export interface Transaction {
  //db: Database;
  active: boolean;
  mode: string;
  tables: { [type: string]: Table<any, any> };
  storeNames: Array<string>;
  on: TransactionEvents;
  abort(): void;
  table(tableName: string): Table<any, any>;
  table<T>(tableName: string): Table<T, any>;
  table<T, Key extends IDBValidKey>(tableName: string): Table<T, Key>;
}
