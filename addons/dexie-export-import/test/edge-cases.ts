import Dexie from 'dexie';
import 'dexie-export-import';
import { module, asyncTest, start, stop, strictEqual, ok, equal } from 'qunit';
import { promisedTest, readBlob, readBlobBinary, deepEqual } from './tools';
import { getSimpleImportData } from './test-data';
import { importInto } from '../src';

module('edge-cases');

const DATABASE_NAME = 'dexie-export-import-edge-cases';
const IMPORT_DATA = getSimpleImportData(DATABASE_NAME);

promisedTest('chunkedExport (issue #854)', async () => {
  const blob = new Blob([JSON.stringify(IMPORT_DATA)]);
  await Dexie.delete(DATABASE_NAME);
  const db = await Dexie.import(blob);
  const exportBlob1 = await db.export({ numRowsPerChunk: 1000 });
  ok(true, 'Could export using numRowsPerChunk: 1000');
  const exportBlob2 = await db.export({ numRowsPerChunk: 1 });
  ok(true, 'Could export using numRowsPerChunk: 1');
  const exportBlob3 = await db.export({ numRowsPerChunk: 1, prettyJson: true });
  ok(true, 'Could export using numRowsPerChunk: 1 and prettyJson: true');
  const json1 = await readBlob(exportBlob1);
  ok(true, 'Could read back first blob: ' + json1);
  const json2 = await readBlob(exportBlob2);
  ok(true, 'Could read back second blob: ' + json2);
  const json3 = await readBlob(exportBlob3);
  ok(true, 'Could read back third blob: ' + json3);
  const parsed1 = JSON.parse(json1);
  ok(true, 'Could parse first export');
  const parsed2 = JSON.parse(json2);
  ok(true, 'Could parse second export');
  const parsed3 = JSON.parse(json3);
  ok(true, 'Could parse third export');
  const rejson1 = JSON.stringify(parsed1);
  const rejson2 = JSON.stringify(parsed2);
  const rejson3 = JSON.stringify(parsed3);
  equal(rejson1, rejson2, 'First and second exports are equal');
  equal(rejson2, rejson3, 'Second and third expots are equal');
});

promisedTest('filtered-chunkedExport (issue #862)', async () => {
  const blob = new Blob([JSON.stringify(IMPORT_DATA)]);
  await Dexie.delete(DATABASE_NAME);
  const db = await Dexie.import(blob);
  const exportBlob1 = await db.export({
    numRowsPerChunk: 1000,
    filter: () => false,
  });
  ok(true, 'Could export using numRowsPerChunk: 1000');
  const exportBlob2 = await db.export({
    numRowsPerChunk: 1,
    filter: () => false,
  });
  ok(true, 'Could export using numRowsPerChunk: 1');
  const exportBlob3 = await db.export({
    numRowsPerChunk: 1,
    prettyJson: true,
    filter: () => false,
  });
  ok(true, 'Could export using numRowsPerChunk: 1 and prettyJson: true');
  const json1 = await readBlob(exportBlob1);
  ok(true, 'Could read back first blob: ' + json1);
  const json2 = await readBlob(exportBlob2);
  ok(true, 'Could read back second blob: ' + json2);
  const json3 = await readBlob(exportBlob3);
  ok(true, 'Could read back third blob: ' + json3);
  const parsed1 = JSON.parse(json1);
  ok(true, 'Could parse first export');
  const parsed2 = JSON.parse(json2);
  ok(true, 'Could parse second export');
  const parsed3 = JSON.parse(json3);
  ok(true, 'Could parse third export');
  const rejson1 = JSON.stringify(parsed1);
  const rejson2 = JSON.stringify(parsed2);
  const rejson3 = JSON.stringify(parsed3);
  equal(rejson1, rejson2, 'First and second exports are equal');
  equal(rejson2, rejson3, 'Second and third expots are equal');
});

promisedTest(
  'chunkedExport does not leave a trailing comma when a later chunk is entirely filtered out (issue #1070)',
  async () => {
    // Regression test for #1070: when `filter` matches rows in an early
    // chunk but none of the chunks that follow, the exported JSON used to
    // end with a trailing comma before the closing `]`, making it invalid
    // JSON (JSON.parse below throws on that).
    await Dexie.delete(DATABASE_NAME);
    const db = new Dexie(DATABASE_NAME);
    try {
      db.version(1).stores({ friends: '++id,name,age' });
      await db.table('friends').bulkAdd(
        Array.from({ length: 10 }, (_, i) => ({
          name: `Friend ${i + 1}`,
          age: 20 + i,
        }))
      );

      // A chunk size smaller than the table, with a filter matching only the
      // first row, guarantees at least one later chunk is filtered out
      // entirely - the scenario that triggered the bug.
      const exportBlob = await db.export({
        numRowsPerChunk: 3,
        filter: (_table, value) => value.id === 1,
      });
      const json = await readBlob(exportBlob);

      const parsed = JSON.parse(json);
      const friendsRows = parsed.data.data.find(
        (t: any) => t.tableName === 'friends'
      ).rows;
      equal(friendsRows.length, 1, 'Only the filtered-in row should be exported');
      equal(
        friendsRows[0].name,
        'Friend 1',
        'The matching row is the one that was exported'
      );
    } finally {
      db.close();
      await Dexie.delete(DATABASE_NAME);
    }
  }
);

promisedTest('import-into (issue #1342)', async () => {
  const blob = new Blob([JSON.stringify(IMPORT_DATA)]);

  await Dexie.delete(DATABASE_NAME);

  const db = new Dexie(DATABASE_NAME);
  const dbSchemes = {};
  for (const table of IMPORT_DATA.data.tables) {
    dbSchemes[table.name] = table.schema;
  }
  db.version(IMPORT_DATA.data.databaseVersion).stores(dbSchemes);

  await importInto(db, blob, {
    chunkSizeBytes: 11,
    clearTablesBeforeImport: true,
  });

  const friends = await db.table('friends').toArray();
  deepEqual(
    friends,
    IMPORT_DATA.data.data[0].rows,
    'Imported data should equal'
  );

  db.close();

  await Dexie.delete(DATABASE_NAME);
});
