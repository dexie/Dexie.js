import { Table } from './table';
import { Version } from './version';
import { DbEvents, DbEventFns } from './db-events';
import { TransactionMode } from './transaction-mode';
import { Transaction } from './transaction';
import { WhereClause } from './where-clause';
import { Collection } from './collection';
import { DbSchema } from './db-schema';
import { DexieOptions } from './dexie-constructor';
import { PromiseExtended } from './promise-extended';
import { IndexableType } from './indexable-type';
import { DBCore } from './dbcore';
import { Middleware, DexieStacks } from './middleware';

export type TableProp<DX> = {
  [K in keyof DX]: DX[K] extends {schema: any, get: any, put: any, add: any, where: any} ? K : never;
}[keyof DX] & string;

type TXWithTables<DX extends Dexie> = Dexie extends DX
? Transaction // If not subclassed, just expect a Transaction without table props
: Transaction & { [P in TableProp<DX>]: DX[P] };


export interface Dexie {
  readonly name: string;
  readonly tables: Table[];
  readonly verno: number;
  readonly vip: Dexie;

  readonly _allTables: { [name: string]: Table<any, IndexableType> };
  readonly _options: DexieOptions;

  readonly core: DBCore;

  _createTransaction: (
    this: Dexie,
    mode: IDBTransactionMode,
    storeNames: ArrayLike<string>,
    dbschema: DbSchema,
    parentTransaction?: Transaction | null
  ) => Transaction;

  readonly _novip: Dexie;

  _dbSchema: DbSchema;

  version(versionNumber: number): Version;

  on: DbEvents;

  once: DbEventFns;

  open(): PromiseExtended<Dexie>;

  table<T = any, TKey = IndexableType, TInsertType=T>(tableName: string): Table<T, TKey, TInsertType>;

  transaction<U>(
    mode: TransactionMode,
    tables: readonly (string | Table)[],
    scope: (
      trans: TXWithTables<this>
    ) => PromiseLike<U> | U
  ): PromiseExtended<U>;

  transaction<U>(
    mode: TransactionMode,
    table: string | Table,
    scope: (trans: TXWithTables<this>) => PromiseLike<U> | U
  ): PromiseExtended<U>;
  transaction<U>(
    mode: TransactionMode,
    table: string | Table,
    table2: string | Table,
    scope: (trans: TXWithTables<this>) => PromiseLike<U> | U
  ): PromiseExtended<U>;
  transaction<U>(
    mode: TransactionMode,
    table: string | Table,
    table2: string | Table,
    table3: string | Table,
    scope: (trans: TXWithTables<this>) => PromiseLike<U> | U
  ): PromiseExtended<U>;
  transaction<U>(
    mode: TransactionMode,
    table: string | Table,
    table2: string | Table,
    table3: string | Table,
    table4: string | Table,
    scope: (trans: TXWithTables<this>) => PromiseLike<U> | U
  ): PromiseExtended<U>;
  transaction<U>(
    mode: TransactionMode,
    table: string | Table,
    table2: string | Table,
    table3: string | Table,
    table5: string | Table,
    scope: (trans: TXWithTables<this>) => PromiseLike<U> | U
  ): PromiseExtended<U>;
  
  close(closeOptions?: {disableAutoOpen: boolean}): void;

  delete(closeOptions?: {disableAutoOpen: boolean}): PromiseExtended<void>;

  isOpen(): boolean;

  hasBeenClosed(): boolean;

  hasFailed(): boolean;

  dynamicallyOpened(): boolean;

  backendDB(): IDBDatabase;

  use(middleware: Middleware<DBCore>): this;
  // Add more supported stacks here... : use(middleware: Middleware<HookStack>): this;
  unuse({ stack, create }: Middleware<{ stack: keyof DexieStacks }>): this;
  unuse({ stack, name }: { stack: keyof DexieStacks; name: string }): this;

  gc(): Promise<void>;

  // Make it possible to touch physical class constructors where they reside - as properties on db instance.
  // For example, checking if (x instanceof db.Table). Can't do (x instanceof Dexie.Table because it's just a virtual interface)
  Table: { prototype: Table };
  WhereClause: { prototype: WhereClause };
  Version: { prototype: Version };
  Transaction: { prototype: Transaction };
  Collection: { prototype: Collection };
}
