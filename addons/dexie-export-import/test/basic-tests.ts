import Dexie from 'dexie';
import "dexie-export-import";
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok, equal} from 'qunit';
import {promisedTest, readBlob} from './tools';
//const {module, asyncTest, start, stop, strictEqual, deepEqual, ok} = QUnit;
import {DexieExportJsonStructure} from '../src/json-structure';

module("basic-tests");

const DATABASE_NAME = "dexie-export-import-basic-tests";
const IMPORT_DATA: DexieExportJsonStructure = {
  formatName: "dexie",
  formatVersion: 1,
  data: {
    databaseName: DATABASE_NAME,
    databaseVersion: 1,
    tables: [{
      name: "friends",
      schema: "++id,name,age",
      rowCount: NaN
    }],
    data: [{
      inbound: true,
      tableName: "friends",
      rows: [{
        id: 1,
        name: "Foo",
        age: 33
      },{
        id: 2,
        name: "Bar",
        age: 44,
      },{
        id: 3,
        name: "Bee",
        age: 55
      }]
    }]
  }
}
// Set correct row count:
IMPORT_DATA.data.tables[0].rowCount = IMPORT_DATA.data.data[0].rows.length;

promisedTest("simple-import", async ()=>{
  const blob = new Blob([JSON.stringify(IMPORT_DATA)]);

  await Dexie.delete(DATABASE_NAME);
  const db = await Dexie.import(blob, {
    chunkSizeBytes: 11,
  });

  const friends = await db.table("friends").toArray();
  deepEqual(IMPORT_DATA.data.data[0].rows, friends, "Imported data should equal");
  
  try {
    await db.import(blob);
    ok(false, "Should not work to reimport without overwriteValues option set");
  } catch (error) {
    equal(error.name, "BulkError", "Should fail with BulkError");    
  }

  await db.import(blob, { overwriteValues: true });
  const friends2 = await db.table("friends").toArray();
  deepEqual(IMPORT_DATA.data.data[0].rows, friends2, "Imported data should equal");

  await Dexie.delete(DATABASE_NAME);
});

promisedTest("export-format", async() => {
  await Dexie.delete(DATABASE_NAME);
  const db = new Dexie(DATABASE_NAME);
  db.version(1).stores({
    outbound: '',
    inbound: 'id'
  });
  await db.table('outbound').bulkAdd([{
    date: new Date(1),
    blob: new Blob(["something"]),
    binary: new Uint8Array([1,2,3]),
    text: "foo",
    check: false,
  },{
    foo: "bar"
  },{
    bar: "foo"
  }], [
    new Date(1),
    2,
    "3"
  ]);
  await db.table("inbound").bulkAdd([{
    id: 1,
    date: new Date(1),
    blob: new Blob(["something"]),
    binary: new Uint8Array([1,2,3]),
    text: "foo",
    check: false
  },{
    id: 2,
    foo: "bar"
  },{
    id: 3,
    bar: "foo"
  }]);

  const blob = await db.export({prettyJson: true});
  const json = await readBlob(blob);
  console.log("json", json)
  const parsed = JSON.parse(json);
  console.log("parsed", parsed);
});
