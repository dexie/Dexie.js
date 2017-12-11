import { Table } from "./table";
import { Version } from "./version";
import { DbEvents } from "./db-events";
import { TransactionMode } from "../types/transaction-mode";
import { Transaction } from "./transaction";
import { WhereClause } from "./where-clause";
import { Collection } from "./collection";

export interface Dexie {
  readonly name: string;
  readonly tables: Table<any, any>[];
  readonly verno: number;
  
  version(versionNumber: Number): Version;

  on: DbEvents;

  open(): Promise<Dexie>;

  table(tableName: string): Table<any, any>;

  table<T>(tableName: string): Table<T, any>;

  table<T, Key>(tableName: string): Table<T, Key>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, scope: () => PromiseLike<U> | U): Promise<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, scope: () => PromiseLike<U> | U): Promise<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, scope: () => PromiseLike<U> | U): Promise<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any,any>, scope: () => PromiseLike<U> | U): Promise<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any,any>, table5: Table<any,any>, scope: () => PromiseLike<U> | U): Promise<U>;

  transaction<U>(mode: TransactionMode, tables: Table<any, any>[], scope: () => PromiseLike<U> | U): Promise<U>;

  close(): void;

  delete(): Promise<void>;

  isOpen(): boolean;

  hasBeenClosed(): boolean;

  hasFailed(): boolean;

  dynamicallyOpened(): boolean;

  backendDB(): IDBDatabase;

  vip<U>(scopeFunction: () => U): U;
  
  // Make it possible to touch physical class constructors where they reside - as properties on db instance.
  // For example, checking if (x instanceof db.Table). Can't do (x instanceof Dexie.Table because it's just a virtual interface)
  Table : new()=>Table<any,any>;
  WhereClause: new()=>WhereClause<any,any>;
  Version: new()=>Version;
  Transaction: new()=>Transaction;
  Collection: new()=>Collection<any,any>;
}
