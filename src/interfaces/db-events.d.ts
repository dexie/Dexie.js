import { DexieEventSet } from "./dexie-event-set";
import { DexieEvent } from "./dexie-event";

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

export interface DbEvents extends DexieEventSet {
  (eventName: 'ready', subscriber: () => any, bSticky?: boolean): void;
  (eventName: 'populate', subscriber: () => any): void;
  (eventName: 'blocked', subscriber: () => any): void;
  (eventName: 'versionchange', subscriber: (event: IDBVersionChangeEvent) => any): void;
  ready: DexieOnReadyEvent;
  populate: DexieEvent;
  blocked: DexieEvent;
  versionchange: DexieVersionChangeEvent;        
}
