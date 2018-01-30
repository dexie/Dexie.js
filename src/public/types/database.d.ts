import { Table } from "./table";
import { TransactionMode } from "./transaction-mode";
import { PromiseExtended } from "./promise-extended";
import { WhereClause } from "./where-clause";
import { Collection } from "./collection";

export interface Database {
  readonly name: string;
  readonly tables: Table[];
  
  table<T=any, TKey=any>(tableName: string): Table<T, TKey>;

  transaction<U>(mode: TransactionMode, table: Table, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, table3: Table, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, table3: Table, table4: Table, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, table: Table, table2: Table, table3: Table, table4: Table, table5: Table, scope: () => PromiseLike<U> | U): PromiseExtended<U>;

  transaction<U>(mode: TransactionMode, tables: Table[], scope: () => PromiseLike<U> | U): PromiseExtended<U>;
}
