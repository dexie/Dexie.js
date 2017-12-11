import { DexieEvent } from "./dexie-event";

export interface DexieEventSet {
  (eventName: string): DexieEvent; // To be able to unsubscribe.

  addEventType (
      eventName: string,
      chainFunction?: (f1:Function,f2:Function)=>Function,
      defaultFunction?: Function): DexieEvent;
  addEventType (
      events: {[eventName:string]: ('asap' | [(f1:Function,f2:Function)=>Function, Function])})
      : DexieEvent;    
}
