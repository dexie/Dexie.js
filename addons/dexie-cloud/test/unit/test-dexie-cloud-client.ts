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
const DATABASE_URL = 'http://localhost:3000/ziud0envo';

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
    databaseUrl: DATABASE_URL,
    requireAuth: false
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
  await db.cloud.login({grant_type: "demo", userId: 'foo@demo.local'});
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

promisedTest('add-realm', async ()=> {
  const db = new Dexie('argur2', { addons: [dexieCloud] });
  await Dexie.delete(db.name);
  db.version(1).stores({
    todoLists: '@id, realmId, title',
    todoItems: '@id, realmId, title, todoListId',

    // Access Control tables
    realms: "@realmId",
    members: "@id, realmId", // Optionally, index things also, like "realmId" or "email".
    roles: "[realmId+name]",    
  });
  db.cloud.configure({
    databaseUrl: DATABASE_URL,
    requireAuth: false
  });

  await db.open();
  console.log('DB opened...', db.cloud.currentUserId, db.cloud.currentUser);
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Before login', db.cloud.currentUserId, db.cloud.currentUser);
  await db.cloud.login({grant_type: "demo", userId: 'foo@demo.local'});
  console.log('Done login', db.cloud.currentUserId, db.cloud.currentUser);
  await db.cloud.sync();
  console.log("In sync now");

  //const allMyRealms = await db.table("realms").toCollection().primaryKeys();
  /*console.log("Cleaning up EVERYTHING!");
  await db.transaction('rw', 'todoLists', 'todoItems', 'members', 'realms', ()=>{
    db.table('todoLists').where('realmId').notEqual('rlm-public').delete();
    db.table('todoItems').where('realmId').notEqual('rlm-public').delete();
    db.table('members').where('realmId').notEqual('rlm-public').delete();
    db.table('realms').where('realmId').notEqual('rlm-public').delete();
  });*/

  await db.cloud.sync();

  // Add a realm
  const realmId = await db.transaction('rw', 'realms', 'members', 'todoLists', 'todoItems', async ()=>{
    const realmId = await db.realms.add({
      name: "My new realm"
    });
    await db.members.bulkAdd([{
      realmId,
      userId: db.cloud.currentUserId
    },{
      realmId,
      email: "david@dexie.org",
      name: "David (dexie)",
      invite: true,
      permissions: {
        manage: "*"
      }
    }]);
    const todoListId = await db.table("todoLists").add({
      title: "My todo list",
      realmId,
    });
    const todoItems = await db.table("todoItems").bulkAdd([{
      realmId,
      todoListId,
      title: "Make Dexie Cloud work"
    }]);
    return realmId;
  });

  console.log("Before syncing new realm and todo list");
  await db.cloud.sync();
  console.log("After syncing new realm and todo list.");
  console.log("Now adding another member for invite");
  await Promise.all([db.table("members").add({
    realmId,
    email: "david.fahlander@gmail.com",
    name: "David (gmail)",
    permissions: {
      manage: "*"
    }    
  }),
  db.table("members").add({
    realmId,
    userId: "gkjlgfdfg" // Should fail
  })]);
  await db.cloud.sync();
  console.log("Added two transactions where the second should have failed by now");

  console.log("Now cleaning up all:");
  await db.transaction('rw', 'realms', 'members', 'todoLists', 'todoItems', async ()=>{
    db.table('todoItems').where({realmId}).delete();
    db.table('todoLists').where({realmId}).delete();
    db.table('members').where({realmId}).delete();
    db.table('realms').where({realmId}).delete();
  });
  console.log("Before syncing the realm removal");
  await db.cloud.sync();
  console.log("After syncing the realm removal");
});

/*promisedTest('require-auth', async () => {
  await Dexie.delete(db.name);
  db.cloud.configure({
    databaseUrl: DATABASE_URL,
    requireAuth: true
  });
  console.log('Waiting for open to resolve');
  await db.open();
  console.log('open resolved. Listing friends:');
  const friends = await db.table('friends').toArray();
  console.log('Got friends', friends);
});
*/