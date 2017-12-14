// Type definitions for Dexie v{version}
// Project: https://github.com/dfahlander/Dexie.js
// Definitions by: David Fahlander <http://github.com/dfahlander>
  
/*export * from './types/indexable-type';
export * from './types/transaction-mode';
export * from './interfaces/collection';
export * from './interfaces/db-events';
export * from './interfaces/dexie-constructor';
export * from './interfaces/dexie-event-set';
export * from './interfaces/dexie-event';
export * from './interfaces/index-spec';
export * from './interfaces/table-hooks';
export * from './interfaces/table-schema';
export * from './interfaces/table';
export * from './interfaces/transaction';
export * from './interfaces/version';
export * from './interfaces/where-clause';*/

import {Dexie as _Dexie} from './interfaces/dexie';
import {DexieOptions} from './interfaces/dexie-constructor';
import { DexieConstructor } from './interfaces/dexie-constructor';
import { PromiseExtended } from './interfaces/promise-extended';
import {Version as _Version} from './interfaces/version';
import {Transaction as _Transaction} from './interfaces/transaction';
import { DexieEvent as _DexieEvent } from './interfaces/dexie-event';
import { DexieVersionChangeEvent as _DexieVersionChangeEvent } from './interfaces/db-events';
import { Table as _Table} from './interfaces/table';
import { IDBValidKey } from './interfaces/indexed-db';

/*export declare class Dexie {
  //constructor (databaseName: string, options?: DexieOptions)
}*/

export declare module Dexie {
  interface Promise extends PromiseExtended {}
  interface Version extends _Version {}
  interface Transaction extends _Transaction {}
  interface DexieEvent extends _DexieEvent {}
  interface DexieVersionChangeEvent extends _DexieVersionChangeEvent {}
  interface Table<T,TKey extends IDBValidKey> extends _Table<T,TKey> {}
}

export {
  IDBValidKey,
  _Table as Table,
  _Dexie as Dexie
};

export declare var Dexie: DexieConstructor;
//export interface Dexie extends _Dexie {}

export default Dexie;
