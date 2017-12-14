import { Table } from "./table";
import { IDBValidKey } from "./indexeddb";
import { TransactionMode } from "./transaction-mode";
import { PromiseExtended } from "./promise-extended";
import { WhereClause } from "./where-clause";
import { Collection } from "./collection";

export interface Database {
  readonly name: string;
  readonly tables: Table[];
  
  table<T=any, TKey extends IDBValidKey=IDBValidKey>(tableName: string): Table<T, TKey>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any,any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any,any>, table5: Table<any,any>, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, tables: Table<any, any>[], scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  // Make it possible to touch physical class constructors where they reside - as properties on db instance.
  // For example, checking if (x instanceof db.Table). Can't do (x instanceof Dexie.Table because it's just a virtual interface)
  Table : {prototype: Table};
  WhereClause: {prototype: WhereClause};
  Collection: {prototype: Collection};
}
