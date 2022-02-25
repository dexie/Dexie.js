import { DexieEventSet } from "./dexie-event-set";
import { DexieEvent } from "./dexie-event";
import { Transaction } from "./transaction";
import { Dexie } from "./dexie";
import { IntervalTree } from "./rangeset";

export interface DexieOnReadyEvent {
  subscribe(fn: (vipDb: Dexie) => any, bSticky: boolean): void;
  unsubscribe(fn: (vipDb: Dexie) => any): void;
  fire(vipDb: Dexie): any;
}

export interface DexieVersionChangeEvent {
  subscribe(fn: (event: IDBVersionChangeEvent) => any): void;
  unsubscribe(fn: (event: IDBVersionChangeEvent) => any): void;
  fire(event: IDBVersionChangeEvent): any;
}

export interface DexiePopulateEvent {
  subscribe(fn: (trans: Transaction) => any): void;
  unsubscribe(fn: (trans: Transaction) => any): void;
  fire(trans: Transaction): any;
}

export interface DexieCloseEvent {
  subscribe(fn: (event: Event) => any): void;
  unsubscribe(fn: (event: Event) => any): void;
  fire(event: Event): any;
}

export interface DbEvents extends DexieEventSet {
  (eventName: 'ready', subscriber: (vipDb: Dexie) => any, bSticky?: boolean): void;
  (eventName: 'populate', subscriber: (trans: Transaction) => any): void;
  (eventName: 'blocked', subscriber: (event: IDBVersionChangeEvent) => any): void;
  (eventName: 'versionchange', subscriber: (event: IDBVersionChangeEvent) => any): void;
  (eventName: 'close', subscriber: (event: Event) => any): void;
  ready: DexieOnReadyEvent;
  populate: DexiePopulateEvent;
  blocked: DexieEvent;
  versionchange: DexieVersionChangeEvent;
  close: DexieCloseEvent;
}

/** Set of mutated parts of the database
 */
export type ObservabilitySet = {
  /** Database part having been mutated.
   * 
   * This structure is produced in observability-middleware.ts
   * and consumed in live-query.ts.
   * 
   * Format of 'part':
   * 
   *   `idb://${dbName}/${tableName}/${indexName}`
   * 
   * * dbName is the database name
   * * tableName is the table name
   * * indexName is any of:
   *    1. An empty string - represents the primary keys of the affected objs
   *    2. ":dels" - represents primary keys of deleted objects in the table
   *    3. The keyPath of an index, such as "name", "age" or "address.city" -
   *       represents indexes that, if used in a query, might affect the
   *       result of that query.
   * 
   * IntervalTree
   *    * See definition of IntervalTree type in rangeset.d.ts
   *    * See rangesOverlap() in rangeset.ts that can be used to compare two
   *      IntervalTrees and detect collissions.
   *    * See RangeSet class that can be used to create an IntervalTree and add
   *      ranges to it.
   */
  [part: string]: IntervalTree;
};

export interface DexieOnStorageMutatedEvent {
  subscribe(fn: (parts: ObservabilitySet) => any): void;
  unsubscribe(fn: (parts: ObservabilitySet) => any): void;
  fire(parts: ObservabilitySet): any;
}

export interface GlobalDexieEvents extends DexieEventSet {
  (eventName: 'storagemutated', subscriber: (parts: ObservabilitySet) => any): void;
  storagemutated: DexieOnStorageMutatedEvent;
}
