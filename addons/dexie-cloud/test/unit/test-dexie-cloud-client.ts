
import {module, test, asyncTest, start, stop, strictEqual, ok, equal} from 'qunit';
import {promisedTest} from "../promisedTest";
import Dexie from "dexie";
import dexieCloud from '../../src/dexie-cloud-client';

module("dexie-cloud-client");

const db = new Dexie("argur", {addons: [dexieCloud]});
db.version(1).stores({
  friends: "@id, name"
});
/*db.cloud.configure({
  databaseUrl: "ws://localhost:3000"
}).then(x => {
  debugger;
}).catch(error => {
  debugger;
});*/

/*db.open().then(async ()=>{
  const id = await db.table("friends").bulkPut([{name: "Foo", age: 33}]);
  console.log(await db.table("friends").toArray());
}).catch(console.error);*/


promisedTest("basic-test", async ()=>{
  await Dexie.delete("argur");
  await db.open();
  const id = await db.table("friends").add({name: "Foo"});
  ok(true, `id was ${id}`);
  let obj = await db.table("friends").get(id);
  equal(obj.name, "Foo", "We have the right name");
  await db.table("friends").put({id, name: "Bar"});
  obj = await db.table("friends").get(id);
  equal(obj.name, "Bar", "We have the new name");
});
