// Import types from the public API
import { Dexie as IDexie} from "./public/types/dexie";
import { DexieOptions } from "./public/types/dexie-constructor";
import { DbEvents } from "./public/types/db-events";
import { IDBValidKey } from './public/types/indexeddb';
import { PromiseExtended } from './public/types/promise-extended';
import { Table as ITable} from './public/types/table';

// Internal imports
import { Table } from "./table";
import { TableConstructor } from './table-constructor';
import { TableSchema } from "./public/types/table-schema";
import { Collection } from './collection';
import { CollectionConstructor } from './collection-constructor';
import { WhereClause } from './where-clause';
import { WhereClauseConstructor } from './where-clause-constructor';
import { Transaction } from './transaction';
import { TransactionConstructor } from './transaction-constructor';
import { Version } from "./version";
import { VersionConstructor } from './version-constructor';

export interface DbReadyState {
  dbOpenError: any;
  isBeingOpened: boolean;
  onReadyBeingFired: boolean;
  openComplete: boolean;
  dbReadyResolve: ()=>void;
  dbReadyPromise: Promise<any>;
  cancelOpen: ()=>void;
  openCanceller: Promise<any>;
}

export interface WebDependencies {
  indexedDB?: IDBFactory,
  IDBKeyRange?: {new(): IDBKeyRange}
}

export interface VersionsAndSchemas {
  versions: Version[];
  dbStoreNames: string[];
}


export class Dexie implements IDexie {
  _i: DbReadyState & DexieOptions & WebDependencies & VersionsAndSchemas;
  name: string;
  tables: Table[];
  verno: number;
  idbdb: IDBDatabase | null;

  _allTables: { [name: string]: Table; };
  _createTransaction: (this: Dexie, mode: IDBTransactionMode, storeNames: ArrayLike<string>, dbschema: { [tableName: string]: TableSchema; }, parentTransaction?: Transaction) => any;
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
  table<T=any, TKey extends IDBValidKey=IDBValidKey>(tableName: string): ITable<T, TKey>;
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
  backendDB() {
    return this.idbdb;
  }
  vip<U>(scopeFunction: () => U): U {
    throw new Error("Method not implemented.");
  }
}
