import { module, test, strictEqual } from 'qunit';
import Dexie from 'dexie';
import { overrideParseStoresSpec } from '../../src/overrideParseStoresSpec';

module('schema');

test('new cloud tables are marked as not initially synced', () => {
  const db = new Dexie('issue2331-schema-test') as any;
  db.cloud = {};

  const parseStoresSpec = overrideParseStoresSpec(
    (stores: Record<string, string>, dbSchema: Record<string, any>) => {
      Object.assign(dbSchema, stores);
      return stores;
    },
    db
  );
  const dbSchema: Record<string, any> = {};

  parseStoresSpec({ pets: '@id' }, dbSchema);

  strictEqual(
    db.cloud.schema?.pets.initiallySynced,
    false,
    'new table starts unsynced'
  );
});
