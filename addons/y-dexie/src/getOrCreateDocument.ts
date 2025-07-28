import type { Dexie } from 'dexie';
import { destroyedDocs } from './docCache';
import { YDocCache } from './types/YDocCache';
import * as Y from 'yjs';
import { DexieYDocMeta } from './types/DexieYDocMeta';

export function getOrCreateDocument(
  db: Dexie,
  docCache: YDocCache,
  tableName: string,
  prop: string,
  updatesTable: string,
  id: any
) {
  let doc = docCache.find(tableName, id, prop);
  if (doc) return doc;

  doc = new Y.Doc({
    meta: {
      db,
      updatesTable,
      parentProp: prop,
      parentTable: tableName,
      parentId: id,
    } satisfies DexieYDocMeta,
  });

  docCache.add(doc);

  doc.on('destroy', () => {
    destroyedDocs.add(doc);
    docCache.delete(doc);
  });

  return doc;
}
