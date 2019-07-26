import { DexieEventSet } from "./dexie-event-set";
import { DexieEvent } from "./dexie-event";
import { Transaction } from "./transaction";

export interface DexieOnReadyEvent {
  subscribe(fn: () => any, bSticky: boolean): void;
  unsubscribe(fn: () => any): void;
  fire(): any;
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

export interface DbEvents extends DexieEventSet {
  (eventName: 'ready', subscriber: () => any, bSticky?: boolean): void;
  (eventName: 'populate', subscriber: (trans: Transaction) => any): void;
  (eventName: 'blocked', subscriber: (event: IDBVersionChangeEvent) => any): void;
  (eventName: 'versionchange', subscriber: (event: IDBVersionChangeEvent) => any): void;
  ready: DexieOnReadyEvent;
  populate: DexiePopulateEvent;
  blocked: DexieEvent;
  versionchange: DexieVersionChangeEvent;        
}
