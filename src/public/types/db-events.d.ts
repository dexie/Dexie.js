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

export type ObservabilitySet = {
  // `idb:${dbName}/${tableName}/changedRowContents` - keys.
  // `idb:${dbName}/${tableName}/changedIndexes/${indexName}` - indexes
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
