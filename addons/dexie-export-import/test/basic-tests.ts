import Dexie from 'dexie';
import "dexie-export-import";
import {module, asyncTest, start, stop, strictEqual, ok, equal} from 'qunit';
import {promisedTest, readBlob, readBlobBinary, deepEqual} from './tools';
import {getSimpleImportData} from './test-data';

module("basic-tests");

const DATABASE_NAME = "dexie-export-import-basic-tests";
const IMPORT_DATA = getSimpleImportData(DATABASE_NAME);

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
  db.close();

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
    bool: false,
  },{
    foo: "bar"
  },{
    bar: "foo"
  }], [
    new Date(1),
    2,
    "3"
  ]);
  const fullByteArray = new Uint8Array(256);
  for (let i=0;i<256;++i) {
    fullByteArray[i] = i;
  }
  await db.table("inbound").bulkAdd([{
    id: 1,
    date: new Date(1),
    fullBlob: new Blob([fullByteArray]),
    binary: new Uint8Array([1,2,3]),
    text: "foo",
    bool: false
  },{
    id: 2,
    foo: "bar"
  },{
    id: 3,
    bar: "foo"
  }]);

  const blob = await db.export({prettyJson: true});
  const json = await readBlob(blob);
  console.log("json", json);
  const parsed = JSON.parse(json);
  
  await db.delete();
  const importedDB = await Dexie.import(blob);
  const outboundKeys = await importedDB.table('outbound').toCollection().primaryKeys();
  const inboundValues = await importedDB.table('inbound').toArray();
  equal (outboundKeys[0], 2, "First key should be 2");
  ok('getTime' in (outboundKeys[1] as Date), "Second outbound key should be a Date instance");
  equal((outboundKeys[1] as Date).getTime(), 1, "The time '1' should be the value of the Date key");
  equal (outboundKeys[2], "3", "Third key should be '3'");

  equal( inboundValues[0].id, 1, "First id should be 1");
  equal( inboundValues[0].date.getTime(), 1, "First Date should be 1");
  const ab = await readBlobBinary(inboundValues[0].fullBlob);
  const ba = new Uint8Array(ab);
  console.log("byte array", ba);
  deepEqual([].slice.call(ba), [].slice.call(fullByteArray), "The whole byte spectrum supported after redecoding blob");
  //equal(firstBlobStr, "something", "First Blob should be 'something'");
  equal( inboundValues[0].binary[0], 1, "First binary[0] should be 1");
  equal( inboundValues[0].binary[1], 2, "First binary[0] should be 2");
  equal( inboundValues[0].binary[2], 3, "First binary[0] should be 3");
  equal( inboundValues[0].text, "foo", "First text should be 'foo'");
  importedDB.close();

  await Dexie.delete(DATABASE_NAME);
});
