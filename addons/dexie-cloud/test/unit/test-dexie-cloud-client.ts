
import {module, test, asyncTest, start, stop, strictEqual, ok, equal} from 'qunit';
import Dexie from "dexie";

module("dexie-cloud-client");

const db = new Dexie("argur");
db.version(1).stores({
  friends: "id, name"
});
db.cloud.connect("ws://localhost:3000").then(x => {
  debugger;
}).catch(error => {
  debugger;
});
db.open().then(async ()=>{
  await db.table("friends").bulkPut([{id: "a", name: "Foo", age: 33}]);
  console.log(await db.table("friends").toArray());
}).catch(console.error);


test("basic-test", ()=>{
  ok(true, "The test ran!");
});
