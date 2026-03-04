import { Dexie } from "../classes/dexie";

const _refs = new Set<WeakRef<Dexie>>();
const _registry = new FinalizationRegistry((ref: WeakRef<Dexie>) => {
  _refs.delete(ref);
});


export function getConnectionsArray(): Dexie[] {
  return Array.from(_refs)
    .map(ref => ref.deref())
    .filter((db): db is Dexie => db !== undefined);
}

export function addConnection(db: Dexie) {
  const ref = new WeakRef(db._novip);
  _refs.add(ref);
  _registry.register(db, ref, ref);
  if (_refs.size > db._options.maxConnections) {
    // Remove the oldest connection (the one that was added first)
    const oldestRef = _refs.values().next().value;
    _refs.delete(oldestRef);
    _registry.unregister(oldestRef);
  }
}

export function removeConnection(db: Dexie | undefined) {
  if (!db) return;
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

