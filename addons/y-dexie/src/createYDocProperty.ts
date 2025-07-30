import { Dexie, Table } from 'dexie';
import { getDocCache } from './docCache';
import { getOrCreateDocument } from './getOrCreateDocument';

const { getByKeyPath } = Dexie;

export function createYDocProperty(
  db: Dexie,
  table: Table,
  prop: string,
  updatesTable: string
) {
  const pkKeyPath = table.schema.primKey.keyPath;
  if (!pkKeyPath) {
    throw new Error(
      `Cannot create Y.Doc property for ${table.name}.${prop} because the table has no inbound primary key. See https://dexie.org/docs/inbound`
    );
  }
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
        table.name,
        prop,
        updatesTable,
        id
      );
    },
  };
}
