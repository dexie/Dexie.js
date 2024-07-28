import { Dexie } from '../public/types/dexie';
import type { DucktypedYDoc } from '../public/types/yjs-related';

// The Y.Doc cache containing all active documents
export function getDocCache(db: Dexie) {
  return db._novip['_docCache'] ??= {
    cache: {} as { [key: string]: WeakRef<DucktypedYDoc>; },
    get size() {
      return Object.keys(this.cache).length;
    },
    find(updatesTable: string, parentId: any): DucktypedYDoc | undefined {
      const cacheKey = getYDocCacheKey(updatesTable, parentId);
      const docRef = this.cache[cacheKey];
      return docRef ? docRef.deref() : undefined;
    },
    add(doc: DucktypedYDoc): void {
      const { updatesTable, parentId } = doc.meta;
      if (!updatesTable || parentId == null)
        throw new Error(`Missing Dexie-related metadata in Y.Doc`);
      const cacheKey = getYDocCacheKey(updatesTable, parentId);
      this.cache[cacheKey] = new WeakRef(doc);
      docRegistry.register(doc, { cache: this.cache, key: cacheKey });
    },
    delete(doc: DucktypedYDoc): void {
      docRegistry.unregister(doc);
      delete this.cache[
        getYDocCacheKey(doc.meta.updatesTable, doc.meta.parentId)
      ];
    },
  };
}
//export let docCache: { [key: string]: WeakRef<DucktypedYDoc>; } = {};
// The finalization registry
const docRegistry = new FinalizationRegistry<{cache: any, key: string}>(({cache, key}) => {
  delete cache[key];
});
// The weak map
//export const doc2ProviderWeakMap = new WeakMap<object, WeakRef<DexieYProvider<any>>>();
export const destroyed = new WeakSet<object>();

export function throwIfDestroyed(doc: object) {
  if (destroyed.has(doc))
    throw new Error('Y.Doc has been destroyed');
}

export function getYDocCacheKey(yTable: string, parentId: any): string {
  return `${yTable}[${parentId}]`;
}
