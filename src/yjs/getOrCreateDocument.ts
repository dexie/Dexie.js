import type { Table } from '../public/types/table';
import type { Dexie } from '../public/types/dexie';
import type {
  DexieYDocMeta,
  YDocCache,
  YjsLib,
} from '../public/types/yjs-related';
import { destroyedDocs } from './docCache';

export function getOrCreateDocument(
  db: Dexie,
  docCache: YDocCache,
  Y: YjsLib,
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
