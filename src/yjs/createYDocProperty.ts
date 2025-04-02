import type { Table } from '../public/types/table';
import type { Dexie } from '../public/types/dexie';
import type { DexieYDocMeta, YjsLib } from '../public/types/yjs-related';
import { getByKeyPath } from '../functions/utils';
import { destroyedDocs, getDocCache } from './docCache';
import { getOrCreateDocument } from './getOrCreateDocument';

export function createYDocProperty(
  db: Dexie,
  Y: YjsLib,
  table: Table,
  prop: string,
  updatesTable: string
) {
  const pkKeyPath = table.schema.primKey.keyPath;
  const docCache = getDocCache(db);
  return {
    set() {
      throw new TypeError(`Y.Doc properties are read-only`);
    },
    get(this: object) {
      const id = getByKeyPath(this, pkKeyPath);
      return getOrCreateDocument(
        db,
        docCache,
        Y,
        table.name,
        prop,
        updatesTable,
        id
      );
    },
  };
}
