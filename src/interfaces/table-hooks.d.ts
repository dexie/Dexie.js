import { DexieEventSet } from "./dexie-event-set";
import { DexieEvent } from "./dexie-event";

interface CreatingHookContext<T,Key> {
  onsuccess?: (primKey: Key) => void;
  onerror?: (err: any) => void;
}

interface UpdatingHookContext<T,Key> {
  onsuccess?: (updatedObj: T) => void;
  onerror?: (err: any) => void;
}

interface DeletingHookContext<T,Key> {
  onsuccess?: () => void;
  onerror?: (err: any) => void;
}

interface TableHooks<T,Key> extends DexieEventSet {
  (eventName: 'creating', subscriber: (this: CreatingHookContext<T,Key>, primKey:Key, obj:T, transaction:Transaction) => any): void;
  (eventName: 'reading', subscriber: (obj:T) => T | any): void;
  (eventName: 'updating', subscriber: (this: UpdatingHookContext<T,Key>, modifications:Object, primKey:Key, obj:T, transaction:Transaction) => any): void;
  (eventName: 'deleting', subscriber: (this: DeletingHookContext<T,Key>, primKey:Key, obj:T, transaction:Transaction) => any): void;
  creating: DexieEvent;
  reading: DexieEvent;
  updating: DexieEvent;
  deleting: DexieEvent;
}
