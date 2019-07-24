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
import { DBCore } from "./dbcore";
import { Middleware, DexieStacks } from "./middleware";

export interface Dexie extends Database {
  readonly name: string;
  readonly tables: Table[];
  readonly verno: number;
  
  readonly _allTables: {[name: string]: Table<any,IndexableType>};

  readonly core: DBCore;

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

  transaction<U>(mode: TransactionMode, table: Table, scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;
  transaction<U>(mode: TransactionMode, table: string, scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;
  transaction<U>(mode: TransactionMode, table: string, table2: string, scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, table3: Table, scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;
  transaction<U>(mode: TransactionMode, table: string, table2: string, table3: string, scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, table3: Table, table4: Table, scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;
  transaction<U>(mode: TransactionMode, table: string, table2: string, table3: string, table4: string, scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, table3: Table, table4: Table, table5: Table, scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;
  transaction<U>(mode: TransactionMode, table: string, table2: string, table3: string, table4: string, table5: string, scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, tables: Table[], scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;
  transaction<U>(mode: TransactionMode, tables: string[], scope: (trans: Transaction) => PromiseLike<U> | U): PromiseExtended<U>;

  close(): void;

  delete(): PromiseExtended<void>;

  isOpen(): boolean;

  hasBeenClosed(): boolean;

  hasFailed(): boolean;

  dynamicallyOpened(): boolean;

  backendDB(): IDBDatabase;

  use(middleware: Middleware<DBCore>): this;
  // Add more supported stacks here... : use(middleware: Middleware<HookStack>): this;
  unuse({stack, create}: Middleware<{stack: keyof DexieStacks}>): this;
  unuse({stack, name}: {stack: keyof DexieStacks, name: string}): this;
  
  // Make it possible to touch physical class constructors where they reside - as properties on db instance.
  // For example, checking if (x instanceof db.Table). Can't do (x instanceof Dexie.Table because it's just a virtual interface)
  Table : {prototype: Table};
  WhereClause: {prototype: WhereClause};
  Version: {prototype: Version};
  Transaction: {prototype: Transaction};
  Collection: {prototype: Collection};
}
