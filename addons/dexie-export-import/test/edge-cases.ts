import Dexie from 'dexie';
import "dexie-export-import";
import {module, asyncTest, start, stop, strictEqual, ok, equal} from 'qunit';
import {promisedTest, readBlob, readBlobBinary, deepEqual} from './tools';
import {getSimpleImportData} from './test-data';

module("edge-cases");

const DATABASE_NAME = "dexie-export-import-edge-cases";
const IMPORT_DATA = getSimpleImportData(DATABASE_NAME);

promisedTest("chunkedExport (issue #854)", async ()=>{
  const blob = new Blob([JSON.stringify(IMPORT_DATA)]);
  await Dexie.delete(DATABASE_NAME);
  const db = await Dexie.import(blob);
  const exportBlob1 = await db.export({numRowsPerChunk: 1000});
  ok(true, "Could export using numRowsPerChunk: 1000");
  const exportBlob2 = await db.export({numRowsPerChunk: 1});
  ok(true, "Could export using numRowsPerChunk: 1");
  const exportBlob3 = await db.export({numRowsPerChunk: 1, prettyJson: true});
  ok(true, "Could export using numRowsPerChunk: 1 and prettyJson: true");
  const json1 = await readBlob(exportBlob1);
  ok(true, "Could read back first blob: " + json1);
  const json2 = await readBlob(exportBlob2);
  ok(true, "Could read back second blob: " + json2);
  const json3 = await readBlob(exportBlob3);
  ok(true, "Could read back third blob: " + json3);
  const parsed1 = JSON.parse(json1);
  ok(true, "Could parse first export");
  const parsed2 = JSON.parse(json2);
  ok(true, "Could parse second export");
  const parsed3 = JSON.parse(json3);
  ok(true, "Could parse third export");
  const rejson1 = JSON.stringify(parsed1);
  const rejson2 = JSON.stringify(parsed2);
  const rejson3 = JSON.stringify(parsed3);
  equal (rejson1, rejson2, "First and second exports are equal");
  equal (rejson2, rejson3, "Second and third expots are equal");
});

promisedTest("filtered-chunkedExport (issue #862)", async ()=>{
  const blob = new Blob([JSON.stringify(IMPORT_DATA)]);
  await Dexie.delete(DATABASE_NAME);
  const db = await Dexie.import(blob);
  const exportBlob1 = await db.export({numRowsPerChunk: 1000, filter: () => false});
  ok(true, "Could export using numRowsPerChunk: 1000");
  const exportBlob2 = await db.export({numRowsPerChunk: 1, filter: () => false});
  ok(true, "Could export using numRowsPerChunk: 1");
  const exportBlob3 = await db.export({numRowsPerChunk: 1, prettyJson: true, filter: () => false});
  ok(true, "Could export using numRowsPerChunk: 1 and prettyJson: true");
  const json1 = await readBlob(exportBlob1);
  ok(true, "Could read back first blob: " + json1);
  const json2 = await readBlob(exportBlob2);
  ok(true, "Could read back second blob: " + json2);
  const json3 = await readBlob(exportBlob3);
  ok(true, "Could read back third blob: " + json3);
  const parsed1 = JSON.parse(json1);
  ok(true, "Could parse first export");
  const parsed2 = JSON.parse(json2);
  ok(true, "Could parse second export");
  const parsed3 = JSON.parse(json3);
  ok(true, "Could parse third export");
  const rejson1 = JSON.stringify(parsed1);
  const rejson2 = JSON.stringify(parsed2);
  const rejson3 = JSON.stringify(parsed3);
  equal (rejson1, rejson2, "First and second exports are equal");
  equal (rejson2, rejson3, "Second and third expots are equal");
});