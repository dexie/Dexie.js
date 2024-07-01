import type { Table } from '../public/types/table';
import type { Dexie } from '../public/types/dexie';
import type { DexieYDocMeta, DucktypedY } from '../public/types/yjs-related';
import { getByKeyPath } from '../functions/utils';
import { docCache, destroyed, registry } from './docCache';

export function createYDocProperty(
  db: Dexie,
  Y: DucktypedY,
  table: Table,
  prop: string,
  updatesTable: string
) {
  const pkKeyPath = table.schema.primKey.keyPath;
  return {
    get(this: object) {
      const id = getByKeyPath(this, pkKeyPath);
      const cacheKey = `${table.name}[${id}].${prop}`;
      let docRef = docCache[cacheKey];
      if (docRef) return docRef.deref();

      const doc = new Y.Doc({
        collectionid: updatesTable,
        guid: ''+id,
        meta: {
          db,
          table: table.name,
          cacheKey,
        } as DexieYDocMeta,
      });

      docCache[cacheKey] = new WeakRef(doc);
      registry.register(doc, cacheKey);

      doc.on('destroy', () => {
        destroyed.add(doc);
        registry.unregister(doc);
        delete docCache[cacheKey];
      });

      return doc;
    },
  };
}
