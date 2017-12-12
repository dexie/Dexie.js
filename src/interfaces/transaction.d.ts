import { Dexie } from "./dexie";
import { Table } from "./table";

export interface Transaction {
  active: boolean;
  db: Dexie;
  mode: string;
  idbtrans: IDBTransaction;
  tables: { [type: string]: Table<any, any> };
  storeNames: Array<string>;
  on: TransactionEvents;
  abort(): void;
  table(tableName: string): Table<any, any>;
  table<T>(tableName: string): Table<T, any>;
  table<T, Key>(tableName: string): Table<T, Key>;
}
