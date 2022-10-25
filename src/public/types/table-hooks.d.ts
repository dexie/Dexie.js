import { DexieEventSet } from "./dexie-event-set";
import { DexieEvent } from "./dexie-event";
import { Transaction } from "./transaction";
import { IndexableType } from "./indexable-type";

interface CreatingHookContext<T,TKey> {
  onsuccess?: (primKey: TKey) => void;
  onerror?: (err: any) => void;
}

interface UpdatingHookContext<T,TKey> {
  onsuccess?: (updatedObj: T) => void;
  onerror?: (err: any) => void;
}

interface DeletingHookContext<T,TKey> {
  onsuccess?: () => void;
  onerror?: (err: any) => void;
}

interface TableHooks<T = any, TKey extends IndexableType = any, TEntity = T> extends DexieEventSet {
  (eventName: 'creating', subscriber: (this: CreatingHookContext<T,TKey>, primKey:TKey, obj:T, transaction:Transaction) => void | undefined | TKey): void;
  (eventName: 'reading', subscriber: (obj:TEntity) => T | any): void;
  (eventName: 'updating', subscriber: (this: UpdatingHookContext<T,TKey>, modifications:Object, primKey:TKey, obj:T, transaction:Transaction) => any): void;
  (eventName: 'deleting', subscriber: (this: DeletingHookContext<T,TKey>, primKey:TKey, obj:T, transaction:Transaction) => any): void;
  creating: DexieEvent;
  reading: DexieEvent;
  updating: DexieEvent;
  deleting: DexieEvent;
}
