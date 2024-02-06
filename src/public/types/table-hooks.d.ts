import { DexieEventSet } from "./dexie-event-set";
import { DexieEvent } from "./dexie-event";
import { Transaction } from "./transaction";
import { IndexableType } from "./indexable-type";
import { Pojo } from "./pojo";

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

interface TableHooks<T=any,TKey=IndexableType,TInsertType=T> extends DexieEventSet {
  (eventName: 'creating', subscriber: (this: CreatingHookContext<TInsertType,TKey>, primKey:TKey, obj:TInsertType, transaction:Transaction) => void | undefined | TKey): void;
  (eventName: 'reading', subscriber: (obj:Pojo<T>) => Pojo<T> | any): void;
  (eventName: 'updating', subscriber: (this: UpdatingHookContext<Pojo<T>,TKey>, modifications:Object, primKey:TKey, obj:T, transaction:Transaction) => any): void;
  (eventName: 'deleting', subscriber: (this: DeletingHookContext<Pojo<T>,TKey>, primKey:TKey, obj:Pojo<T>, transaction:Transaction) => any): void;
  creating: DexieEvent;
  reading: DexieEvent;
  updating: DexieEvent;
  deleting: DexieEvent;
}
