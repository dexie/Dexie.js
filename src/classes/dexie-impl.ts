import { Dexie } from "../interfaces/dexie";
import { DexieInternal, DbState, DbReadyPromises, WebDependencies } from "../interfaces/dexie-internal";
import { DexieOptions } from "../interfaces/dexie-constructor";
import { Table } from "../interfaces/table";
import { TableSchema } from "../interfaces/table-schema";
import { Version } from "../interfaces/version";
import { DbEvents } from "../interfaces/db-events";

export class DexieImpl implements DexieInternal {
  _i: DbState & DbReadyPromises & DexieOptions & WebDependencies;
  name: string;
  tables: Table<any, any>[];
  verno: number;
  _allTables: { [name: string]: Table<any, any>; };
  _createTransaction: (this: DexieInternal, mode: IDBTransactionMode, storeNames: ArrayLike<string>, dbschema: { [tableName: string]: TableSchema; }, parentTransaction?: Transaction) => any;
  _dbSchema: { [tableName: string]: TableSchema; };
  version(versionNumber: Number): Version {
    throw new Error("Method not implemented.");
  }
  on: DbEvents;
  open(): Promise<Dexie> {
    throw new Error("Method not implemented.");
  }
  table(tableName: string): Table<any, any>;
  table<T>(tableName: string): Table<T, any>;
  table<T, Key>(tableName: string): Table<T, Key>;
  table(tableName: any) : Table<any,any> {
    throw new Error("Method not implemented.");
  }
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, scope: () => U | PromiseLike<U>): Promise<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, scope: () => U | PromiseLike<U>): Promise<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, scope: () => U | PromiseLike<U>): Promise<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any, any>, scope: () => U | PromiseLike<U>): Promise<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any, any>, table5: Table<any, any>, scope: () => U | PromiseLike<U>): Promise<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", tables: Table<any, any>[], scope: () => U | PromiseLike<U>): Promise<U>;
  transaction(mode: any, table: any, table2: any, table3?: any, table4?: any, table5?: any, scope?: any) {
    throw new Error("Method not implemented.");
  }
  close(): void {
    throw new Error("Method not implemented.");
  }
  delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  isOpen(): boolean {
    throw new Error("Method not implemented.");
  }
  hasBeenClosed(): boolean {
    throw new Error("Method not implemented.");
  }
  hasFailed(): boolean {
    throw new Error("Method not implemented.");
  }
  dynamicallyOpened(): boolean {
    throw new Error("Method not implemented.");
  }
  backendDB(): IDBDatabase {
    throw new Error("Method not implemented.");
  }
  vip<U>(scopeFunction: () => U): U {
    throw new Error("Method not implemented.");
  }
  Table: new () => Table<any, any>;
  WhereClause: new () => WhereClause<any, any>;
  Version: new () => Version;
  Transaction: new () => Transaction;
  Collection: new () => Collection<any, any>;
}