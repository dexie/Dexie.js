import { module, test, strictEqual } from 'qunit';
import Dexie from 'dexie';
import { overrideParseStoresSpec } from '../../src/overrideParseStoresSpec';

module('schema');

function createParser(db: Dexie & { cloud: any }) {
  return overrideParseStoresSpec(
    (stores: Record<string, string | null>, dbSchema: Record<string, any>) => {
      for (const [tableName, schema] of Object.entries(stores)) {
        if (schema == null) {
          delete dbSchema[tableName];
        } else {
          dbSchema[tableName] = schema;
        }
      }
      return stores;
    },
    db
  ) as (
    stores: Record<string, string | null>,
    dbSchema: Record<string, any>
  ) => any;
}

test('new cloud tables are marked as not initially synced', () => {
  const db = new Dexie('issue2331-schema-test') as any;
  db.cloud = {};

  const parseStoresSpec = createParser(db);
  const dbSchema: Record<string, any> = {};

  parseStoresSpec({ pets: '@id' }, dbSchema);

  strictEqual(
    db.cloud.schema?.pets.initiallySynced,
    false,
    'new table starts unsynced'
  );
});

test('re-added cloud tables are marked as not initially synced', () => {
  const db = new Dexie('issue2331-schema-readd-test') as any;
  db.cloud = {};
  const parseStoresSpec = createParser(db);
  const dbSchema: Record<string, any> = {};

  parseStoresSpec({ pets: '@id' }, dbSchema);
  db.cloud.schema.pets.initiallySynced = true;

  // Dexie represents a table removed by a later version as a null store spec.
  parseStoresSpec({ pets: null }, dbSchema);
  strictEqual(db.cloud.schema.pets.deleted, true, 'table is marked deleted');

  parseStoresSpec({ pets: '@id' }, dbSchema);
  strictEqual(
    db.cloud.schema.pets.deleted,
    false,
    'table is marked active again'
  );
  strictEqual(
    db.cloud.schema.pets.initiallySynced,
    false,
    're-added table starts a new initial sync'
  );
});
