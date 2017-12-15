import { Dexie as IDexie} from "./public/types/dexie";
import { DexieInternal, DbReadyState, WebDependencies } from "./public/types/dexie-internal";
import { DexieOptions } from "./public/types/dexie-constructor";
import { Table } from "./table";
import { Table as ITable } from "./public/types/table";
import { TableSchema } from "./public/types/table-schema";
import { Version } from "./public/types/version";
import { DbEvents } from "./public/types/db-events";
import { IDBValidKey } from './public/types/indexeddb';
import { Transaction } from './transaction';
import { WhereClause } from './where-clause';
import { Collection } from './collection';
import { TableConstructor } from './table-constructor';
import { WhereClauseConstructor } from './where-clause-constructor';
import { VersionConstructor } from './version-constructor';
import { TransactionConstructor } from './transaction-constructor';
import { CollectionConstructor } from './collection-constructor';
import { PromiseExtended } from './public/types/promise-extended';

export class Dexie implements DexieInternal {
  _i: DbReadyState & DexieOptions & WebDependencies;
  name: string;
  tables: Table[];
  verno: number;
  _allTables: { [name: string]: Table; };
  _createTransaction: (this: DexieInternal, mode: IDBTransactionMode, storeNames: ArrayLike<string>, dbschema: { [tableName: string]: TableSchema; }, parentTransaction?: Transaction) => any;
  _dbSchema: { [tableName: string]: TableSchema; };

  Table: TableConstructor;
  WhereClause: WhereClauseConstructor;
  Version: VersionConstructor;
  Transaction: TransactionConstructor;
  Collection: CollectionConstructor;
  
  version(versionNumber: Number): Version {
    throw new Error("Method not implemented.");
  }
  on: DbEvents;
  open(): PromiseExtended<Dexie> {
    throw new Error("Method not implemented.");
  }
  table<T = any, TKey extends IDBValidKey = IDBValidKey>(tableName: string): ITable<T, TKey>;
  table(tableName: string): Table {
    throw new Error("Method not implemented.");
  }
  /*transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any, any>, scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any, any>, table5: Table<any, any>, scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", tables: Table<any, any>[], scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction(mode: any, table: any, table2: any, table3?: any, table4?: any, table5?: any, scope?: any) {
    throw new Error("Method not implemented.");
  }*/
  transaction(...args) : PromiseExtended {
    throw new Error("Method not implemented.");
  }

  close(): void {
    throw new Error("Method not implemented.");
  }
  delete(): PromiseExtended<void> {
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
}
