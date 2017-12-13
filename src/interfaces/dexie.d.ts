import { Table } from "./table";
import { Version } from "./version";
import { DbEvents } from "./db-events";
import { TransactionMode } from "../types/transaction-mode";
import { Transaction } from "./transaction";
import { WhereClause } from "./where-clause";
import { Collection } from "./collection";
import { DbSchema } from "./db-schema";
import { DexieInternal } from "./dexie-internal";
import { IndexableType } from "./indexed-db";
import { TableSchema } from "./table-schema";
import { DexieConstructor } from "./dexie-constructor";
import { PromiseExtended } from "./promise-extended";

export interface Dexie {
  readonly constructor: DexieConstructor;
  readonly name: string;
  readonly tables: Table<any, any>[];
  readonly verno: number;
  
  readonly _allTables: {[name: string]: Table<any,any>};

  _createTransaction: (
    this: Dexie,
    mode: IDBTransactionMode,
    storeNames: ArrayLike<string>,
    dbschema: DbSchema,
    parentTransaction?: Transaction | null) => Transaction;
  
  _dbSchema: DbSchema;

  version(versionNumber: Number): Version;

  on: DbEvents;

  open(): PromiseExtended<Dexie>;

  table(tableName: string): Table<any, any>;

  table<T>(tableName: string): Table<T, any>;

  table<T, Key extends IndexableType>(tableName: string): Table<T, Key>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any,any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any,any>, table5: Table<any,any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, tables: Table<any, any>[], scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  close(): void;

  delete(): PromiseExtended<void>;

  isOpen(): boolean;

  hasBeenClosed(): boolean;

  hasFailed(): boolean;

  dynamicallyOpened(): boolean;

  backendDB(): IDBDatabase;

  vip<U>(scopeFunction: () => U): U;
  
  // Make it possible to touch physical class constructors where they reside - as properties on db instance.
  // For example, checking if (x instanceof db.Table). Can't do (x instanceof Dexie.Table because it's just a virtual interface)
  Table : {prototype: Table};
  WhereClause: {prototype: WhereClause};
  Version: {prototype: Version};
  Transaction: {prototype: Transaction};
  Collection: {prototype: Collection};
}
