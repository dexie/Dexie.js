import { Table } from "./table";
import { Version } from "./version";
import { DbEvents } from "./db-events";
import { TransactionMode } from "./transaction-mode";
import { Transaction } from "./transaction";
import { WhereClause } from "./where-clause";
import { Collection } from "./collection";
import { DbSchema } from "./db-schema";
import { TableSchema } from "./table-schema";
import { DexieConstructor } from "./dexie-constructor";
import { PromiseExtended } from "./promise-extended";
import { Database } from "./database";
import { IndexableType } from "./indexable-type";

export interface Dexie extends Database {
  readonly name: string;
  readonly tables: Table[];
  readonly verno: number;
  
  readonly _allTables: {[name: string]: Table<any,any>};

  _createTransaction: (
    this: Dexie,
    mode: IDBTransactionMode,
    storeNames: ArrayLike<string>,
    dbschema: DbSchema,
    parentTransaction?: Transaction | null) => Transaction;
  
  _dbSchema: DbSchema;

  version(versionNumber: number): Version;

  on: DbEvents;

  open(): PromiseExtended<Dexie>;

  table<T=any, TKey=IndexableType>(tableName: string): Table<T, TKey>;

  transaction<U>(mode: TransactionMode, table: Table, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, table3: Table, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, table3: Table, table4: Table<any,any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, table3: Table, table4: Table<any,any>, table5: Table<any,any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, tables: Table[], scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  close(): void;

  delete(): PromiseExtended<void>;

  isOpen(): boolean;

  hasBeenClosed(): boolean;

  hasFailed(): boolean;

  dynamicallyOpened(): boolean;

  backendDB(): IDBDatabase;
  
  // Make it possible to touch physical class constructors where they reside - as properties on db instance.
  // For example, checking if (x instanceof db.Table). Can't do (x instanceof Dexie.Table because it's just a virtual interface)
  Table : {prototype: Table};
  WhereClause: {prototype: WhereClause};
  Version: {prototype: Version};
  Transaction: {prototype: Transaction};
  Collection: {prototype: Collection};
}
