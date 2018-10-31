import Dexie from 'dexie';
import "dexie-export-import";
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok, equal} from 'qunit';
import {promisedTest} from './tools';
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
    equal(error.name, "ConstraintError", "Should fail with ConstraintError");    
  }

  await db.import(blob, { overwriteValues: true });
  const friends2 = await db.table("friends").toArray();
  deepEqual(IMPORT_DATA.data.data[0].rows, friends2, "Imported data should equal");

  await Dexie.delete(DATABASE_NAME);
});

//promisedTest("")