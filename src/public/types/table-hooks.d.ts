import { DexieEventSet } from "./dexie-event-set";
import { DexieEvent } from "./dexie-event";
import { Transaction } from "./transaction";
import { IndexableType } from "./indexable-type";

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

interface TableHooks<T=any,TKey=IndexableType> extends DexieEventSet {
  (eventName: 'creating', subscriber: (this: CreatingHookContext<T,TKey>, primKey:TKey, obj:T, transaction:Transaction) => any): void;
  (eventName: 'reading', subscriber: (obj:T) => T | any): void;
  (eventName: 'updating', subscriber: (this: UpdatingHookContext<T,TKey>, modifications:Object, primKey:TKey, obj:T, transaction:Transaction) => any): void;
  (eventName: 'deleting', subscriber: (this: DeletingHookContext<T,TKey>, primKey:TKey, obj:T, transaction:Transaction) => any): void;
  creating: DexieEvent;
  reading: DexieEvent;
  updating: DexieEvent;
  deleting: DexieEvent;
}
