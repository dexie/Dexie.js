import { Dexie } from '../public/types/dexie';
import type { DexieYDocMeta, DucktypedYDoc, YDocCache } from '../public/types/yjs-related';

// The Y.Doc cache containing all active documents
export function getDocCache(db: Dexie): YDocCache {
  return db._novip['_docCache'] ??= {
    cache: {} as { [key: string]: WeakRef<DucktypedYDoc>; },
    get size() {
      return Object.keys(this.cache).length;
    },
    find(table: string, primaryKey: any, ydocProp: string): DucktypedYDoc | undefined {
      const cacheKey = getYDocCacheKey(table, primaryKey, ydocProp);
      const docRef = this.cache[cacheKey];
      return docRef ? docRef.deref() : undefined;
    },
    add(doc: DucktypedYDoc): void {
      const { parentTable, parentId, parentProp } = doc.meta as DexieYDocMeta;
      if (!parentTable || !parentProp || parentId == null)
        throw new Error(`Missing Dexie-related metadata in Y.Doc`);
      const cacheKey = getYDocCacheKey(parentTable, parentId, parentProp);
      this.cache[cacheKey] = new WeakRef(doc);
      docRegistry.register(doc, { cache: this.cache, key: cacheKey });
    },
    delete(doc: DucktypedYDoc): void {
      docRegistry.unregister(doc);
      delete this.cache[
        getYDocCacheKey(doc.meta.parentTable, doc.meta.parentId, doc.meta.parentProp)
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

export function getYDocCacheKey(table: string, primaryKey: any, ydocProp: string): string {
  return `${table}[${primaryKey}].${ydocProp}`;
}
