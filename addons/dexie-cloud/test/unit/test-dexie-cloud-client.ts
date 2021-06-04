import {
  module,
  test,
  asyncTest,
  start,
  stop,
  strictEqual,
  ok,
  equal
} from 'qunit';
import { promisedTest } from '../promisedTest';
import Dexie from 'dexie';
import dexieCloud from '../../src/dexie-cloud-client';

module('dexie-cloud-client');
Dexie.addons = []; // Prohibit dexie-observable and dexie-syncable from registering themselves.

const db = new Dexie('argur', { addons: [dexieCloud] });
db.version(2).stores({
  friends: '@id, name',
  products: '@id, title, realmId'
});

/*db.open().then(async ()=>{
  const id = await db.table("friends").bulkPut([{name: "Foo", age: 33}]);
  console.log(await db.table("friends").toArray());
}).catch(console.error);*/

promisedTest('basic-test', async () => {
  await Dexie.delete(db.name);
  db.cloud.configure({
    databaseUrl: 'http://localhost:3000/ziud0envo',
    requireAuth: true
  });
  console.log('Waiting for open to resolve');
  await db.open();
  console.log('open resolved. Adding a friend:');
  const id = await db.table('friends').add({ name: 'Foo' });
  console.log('Friend added and got id', id);
  ok(true, `id was ${id}`);
  let obj = await db.table('friends').get(id);
  equal(obj.name, 'Foo', 'We have the right name');
  await db.table('friends').put({ id, name: 'Bar' });
  console.log("Friend updated with name = 'Bar'", id);
  obj = await db.table('friends').get(id);
  equal(obj.name, 'Bar', 'We have the new name');
  const numFriends = await db.table('friends').count();
  ok(true, `Num friends: ${numFriends}`);

  console.log('Before login', db.cloud.currentUserId, db.cloud.currentUser);
  await db.cloud.login('foo@demo.local');
  console.log('Done login', db.cloud.currentUserId, db.cloud.currentUser);
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log("Deleting friend");
  await db.table('friends').delete(id);
  await new Promise(resolve => setTimeout(resolve, 1500));
  await db.table('products').add({title: "My private new fantastic product that wont be accepted by server", realmId: "rlm-public"});
  console.log("Products before", await db.table('products').toArray());
  await db.table('products').where({realmId: db.cloud.currentUserId}).delete();
  console.log("Products after", await db.table('products').toArray());
  await new Promise(resolve => setTimeout(resolve, 4000));
  console.log("Products", await db.table('products').toArray());
  console.log("Friends", await db.table('friends').toArray());
});
