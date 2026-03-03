import { Dexie } from "../classes/dexie";
import { assert } from "../functions/utils";

/**
 * ConnectionTracker tracks open Dexie instances. It uses WeakRefs so instances can be
 * GC'ed when no longer referenced externally.
 */
export class ConnectionTracker {
  private _refs = new Set<WeakRef<Dexie>>();
  private _registry = new FinalizationRegistry((ref: WeakRef<Dexie>) => {
    this._refs.delete(ref);
  });

  push(db: Dexie): number {
    const iterator = this._refs.values();
    let result = iterator.next();

    // Assert that the connection is not already tracked
    while (!result.done) {
      assert(result.value.deref() !== db);
      result = iterator.next();
    }

    const ref = new WeakRef(db);
    this._refs.add(ref);
    this._registry.register(db, ref, ref);
    return this.length;
  }

  delete(db: Dexie) {
    const iterator = this._refs.values();
    let result = iterator.next();

    while (!result.done) {
      const ref = result.value;
      if (ref.deref() === db) {
        this._refs.delete(ref);
        this._registry.unregister(ref);
        return; // Early return once deleted
      }
      result = iterator.next();
    }
  }

  get length() {
    let count = 0;
    this._refs.forEach((ref) => {
      if (ref.deref()) {
        count++;
      } else {
        this._refs.delete(ref);
        this._registry.unregister(ref);
      }
    });
    return count;
  }

  filter(callbackfn: (value: Dexie, index: number, array: Dexie[]) => boolean, thisArg?: any): Dexie[] {
    return this.toArray().filter(callbackfn, thisArg);
  }

  forEach(callbackfn: (value: Dexie, index: number, array: Dexie[]) => void, thisArg?: any): void {
    this.toArray().forEach(callbackfn, thisArg);
  }

  map<U>(callbackfn: (value: Dexie, index: number, array: Dexie[]) => U, thisArg?: any): U[] {
    return this.toArray().map(callbackfn, thisArg);
  }

  [Symbol.iterator]() {
    return this.toArray()[Symbol.iterator]();
  }

  toArray(): Dexie[] {
    const result: Dexie[] = [];
    
    this._refs.forEach((ref) => {
      const db = ref.deref();
      if (db) {
        result.push(db);
      } else {
        this._refs.delete(ref);
        this._registry.unregister(ref);
      }
    });
    
    return result;
  }
}

export type ConnectionsList = Dexie[] & {
  delete(db: Dexie): void;
};

export function createConnectionsList(): ConnectionsList {
  const hasWeakSupport = typeof WeakRef !== 'undefined' && typeof Set !== 'undefined' && typeof FinalizationRegistry !== 'undefined';
  if (hasWeakSupport) {
    return new ConnectionTracker() as any as ConnectionsList;
  }

  // When there is no support for weak refs, fall back to a simple array.
  const fallback = [] as any;
  fallback.delete = function(db: Dexie) {
    const arr = this as Dexie[];
    const idx = arr.indexOf(db);
    if (idx >= 0) arr.splice(idx, 1);
  };
  return fallback as ConnectionsList;
}
