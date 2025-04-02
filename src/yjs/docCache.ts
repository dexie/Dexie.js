import { Dexie } from '../public/types/dexie';
import type { DexieYDocMeta, YjsDoc, YDocCache } from '../public/types/yjs-related';

// The finalization registry
const docRegistry = new FinalizationRegistry<{cache: any, key: string}>(({cache, key}) => {
  delete cache[key];
});

// The Y.Doc cache containing all active documents
export function getDocCache(db: Dexie): YDocCache {
  return db._novip['_docCache'] ??= {
    cache: {} as { [key: string]: WeakRef<YjsDoc>; },
    get size() {
      return Object.keys(this.cache).length;
    },
    find(table: string, primaryKey: any, ydocProp: string): YjsDoc | undefined {
      const cacheKey = getYDocCacheKey(table, primaryKey, ydocProp);
      const docRef = this.cache[cacheKey];
      return docRef ? docRef.deref() : undefined;
    },
    add(doc: YjsDoc): void {
      const { parentTable, parentId, parentProp } = doc.meta as DexieYDocMeta;
      if (!parentTable || !parentProp || parentId == null)
        throw new Error(`Missing Dexie-related metadata in Y.Doc`);
      const cacheKey = getYDocCacheKey(parentTable, parentId, parentProp);
      const existingDoc = this.cache[cacheKey]?.deref();
      if (existingDoc) {
        docRegistry.unregister(existingDoc); // Don't run garbage collection on this doc as it is being replaced.
      }
      this.cache[cacheKey] = new WeakRef(doc);
      docRegistry.register(doc, { cache: this.cache, key: cacheKey }, doc);
    },
    delete(doc: YjsDoc): void {
      docRegistry.unregister(doc); // Don't run garbage collection on this doc as it is being deleted here and now.
      const cacheKey = getYDocCacheKey(doc.meta.parentTable, doc.meta.parentId, doc.meta.parentProp);
      const cacheEntry = this.cache[cacheKey];
      if (cacheEntry?.deref() === doc) {
        delete this.cache[cacheKey]; // Remove the entry from the cache only if it is the same doc.
      }
    },
  };
}

// Emulate a private boolean property "destroyed" on Y.Doc instances that we manage
// in createYDocProperty.ts:
export const destroyedDocs = new WeakSet<object>();

export function throwIfDestroyed(doc: any) {
  if (destroyedDocs.has(doc))
    throw new Error(`Y.Doc ${doc.meta.parentId} has been destroyed`);
}

export function getYDocCacheKey(table: string, primaryKey: any, ydocProp: string): string {
  return `${table}[${primaryKey}].${ydocProp}`;
}
