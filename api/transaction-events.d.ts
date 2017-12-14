import { DexieEvent } from "./dexie-event";
import { DexieEventSet } from "./dexie-event-set";

export interface TransactionEvents extends DexieEventSet {
  (eventName: 'complete', subscriber: () => any): void;
  (eventName: 'abort', subscriber: () => any): void;
  (eventName: 'error', subscriber: (error:any) => any): void;
  complete: DexieEvent;
  abort: DexieEvent;
  error: DexieEvent;
}    
