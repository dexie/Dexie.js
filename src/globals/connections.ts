import { type Dexie } from "../classes/dexie";

export const connections = createConnectionsManager();

function createConnectionsManager() {
  if (typeof FinalizationRegistry !== 'undefined' && typeof WeakRef !== 'undefined') {
    let _array: Dexie[] = null;
    const _refs = new Set<WeakRef<Dexie>>();
    const _registry = new FinalizationRegistry((ref: WeakRef<Dexie>) => {
      _refs.delete(ref);
    });


    const toArray = (): ReadonlyArray<Dexie> => {
      if (_array) return _array;
      _array = Array.from(_refs)
        .map(ref => ref.deref())
        .filter((db): db is Dexie => db !== undefined);
      return _array;
    }

    const add = (db: Dexie) => {
      _array = null;
      const ref = new WeakRef(db._novip);
      _refs.add(ref);
      _registry.register(db._novip, ref, ref);
      if (_refs.size > db._options.maxConnections) {
        // Remove the oldest connection (the one that was added first)
        const oldestRef = _refs.values().next().value;
        _refs.delete(oldestRef);
        _registry.unregister(oldestRef);
      }
    }

    const remove = (db: Dexie | undefined) => {
      if (!db) return;
      _array = null;
      const iterator = _refs.values();
      let result = iterator.next();

      while (!result.done) {
        const ref = result.value;
        if (ref.deref() === db._novip) {
          _refs.delete(ref);
          _registry.unregister(ref);
          return; // Early return once deleted
        }
        result = iterator.next();
      }
    }
    return { toArray, add, remove };
  } else {
    const connections: Dexie[] = [];
    const toArray = (): ReadonlyArray<Dexie> => connections;
    const add = (db: Dexie) => {
      connections.push(db._novip);
    };
    const remove = (db: Dexie | undefined) => {
      if (!db) return;
      const index = connections.indexOf(db._novip);
      if (index !== -1) {
        connections.splice(index, 1);
      }
    };
    return { toArray, add, remove };
  }
}

