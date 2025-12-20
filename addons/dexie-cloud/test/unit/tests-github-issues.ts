import {
  module,
  test,
  asyncTest,
  start,
  stop,
  strictEqual,
  ok,
  equal,
  deepEqual,
} from 'qunit';
import { promisedTest } from '../promisedTest';
import Dexie, { add, remove } from 'dexie';
import dexieCloud, { DexieCloudOptions, DexieCloudTable, getTiedRealmId } from '../../src/dexie-cloud-client';

const DBURL = 'https://zv8n7bwcs.dexie.cloud'; // Shall exist in cloud.

module('github-issues');

promisedTest('https://github.com/dexie/Dexie.js/issues/2228', async () => {
  const DBNAME = 'Issue2228_DB';
  const db = new Dexie(DBNAME, { addons: [dexieCloud] }) as Dexie & {
    items2228: DexieCloudTable<{ id: string; drinks: string[] }, 'id'>;
  };
  db.version(1).stores({ items2228: '@id' });
  db.cloud.configure({
    databaseUrl: DBURL,
    requireAuth: { email: 'issue2228@demo.local', grant_type: 'demo' }
  });
  await db.open();

  ok(true, 'Cleared existing items in items2228 table');
  await db.items2228.clear();
  ok(true, 'Now syncing to cloud');
  await db.cloud.sync({purpose: 'push', wait: true });

  await db.items2228.update('nonExistingId', { drinks: add(['coffee']) });
  await db.items2228.update('nonExistingId', { drinks: remove(['coffee']) });

  ok(true, 'Now syncing to cloud after adding and removing from non-existing item');
  await db.cloud.sync({purpose: 'push', wait: true });

  const itemId = await db.items2228.add({ drinks: ['coffee', 'tea'] });
  ok(true, `Added item with id ${itemId} and drinks ['coffee', 'tea']`);

  await db.items2228.update(itemId, { drinks: add(['milk']) });
  await db.items2228.update(itemId, { drinks: remove(['milk']) });

  ok(true, 'Now syncing to cloud after adding and removing from existing item');
  await db.cloud.sync({purpose: 'push', wait: true });

  ok(true, 'Test completed successfully');
  db.close();
  await Dexie.delete(DBNAME);
  console.log('Database deleted successfully');
});

/** Dexie issue #2185
 * 
 * Here are the steps to reproduce the issue:

    1. Add `item1`
    2. Add `item2`
    3. Share `item2` with another user.
    4. Export data, ensuring all Dexie Cloud-related tables are excluded using `skipTables`
    5. Delete `item2` (or both `item1` and `item2`)
    6. Import the previously exported data.
    7. The deleted items temporarily reappear in the local database.
    8. The subsequent sync removes them again.
 */
promisedTest('https://github.com/dexie/Dexie.js/issues/2185', async () => {
  const DBNAME = 'issue2185';
  const DBURL = 'https://zv8n7bwcs.dexie.cloud'; // Shall exist in cloud.
  const DEMOUSER1 = 'foo@demo.local'; // This user is imported into the cloud database using `npx dexie-cloud import dexie-cloud-import.json`
  const DEMOUSER2 = 'bar@demo.local'; // This user is also imported from the same file.
  const REALM_ID = 'rlm~issue2185';

  const db = new Dexie(DBNAME, { addons: [dexieCloud] }) as Dexie & {
    items2185: DexieCloudTable<{ id: string; name: string }, 'id'>;
  };
  db.version(1).stores({ items2185: '@id, name' });
  db.cloud.configure({
    databaseUrl: DBURL,
    requireAuth: { email: DEMOUSER1, grant_type: 'demo' }
  });
  await db.open();
  ok(true, 'DB opened and synced successfully');
  // Clear any existing data
  await db.transaction('rw', db.items2185, db.members, db.realms, tx => {
    tx.items2185.clear();
    tx.members.where({ realmId: REALM_ID }).delete();
    tx.realms.delete(REALM_ID);
  });
  ok(true, 'Existing data cleared successfully');
  await db.cloud.sync({purpose: 'push', wait: true });
  ok(true, 'Cloud sync completed successfully. Now ready to execute the test steps');
  
  // 1. Add `item1`
  const item1Id = await db.items2185.add({ name: 'Item 1' });
  // 2. Add `item2`
  const item2Id = await db.items2185.add({ name: 'Item 2' });
  // 3. Share `item2` with another user
  await db.transaction('rw', db.items2185, db.members, db.realms, async () => {
    const realmId = await db.realms.add({ name: 'Test Realm', realmId: REALM_ID });
    db.members.bulkAdd([{
      realmId,
      email: DEMOUSER1,
      permissions: { manage: '*' }
    },{
      realmId,
      email: DEMOUSER2,
      permissions: { manage: '*' }
    }]);
    db.items2185.update(item2Id, { realmId });
  });

  await db.cloud.sync();
  // 4. Export data, ensuring all Dexie Cloud-related tables are excluded using `skipTables`
  // (do it without dexie-export-import addon to avoid adding a dependency in this test)
  let items = await db.items2185.toArray();
  let realms = [await db.realms.get(REALM_ID)];
  let members = await db.members.where({ realmId: REALM_ID }).toArray();
  const exportJSON = JSON.stringify({
    items,
    //realms,
    //members
  });
  // 5. Delete `item2` (or both `item1` and `item2`)
  await db.items2185.clear();
  await db.cloud.sync();
  const itemsAfterClear = await db.items2185.toArray();
  deepEqual(itemsAfterClear, [], 'Items cleared successfully');
  // 6. Import the previously exported data
  const importedData = JSON.parse(exportJSON);
  await db.transaction('rw', db.items2185, db.realms, db.members, async () => {
    await db.items2185.bulkAdd(importedData.items);
  });
  // 7. The deleted items temporarily reappear in the local database.
  items = await db.items2185.toArray();
  equal(items.length, 2, 'Two items imported successfully');
  // 8. The subsequent sync must not remove them again.
  await db.cloud.sync({purpose: 'push', wait: true });
  const itemsAfterSync = await db.items2185.toArray();
  equal(itemsAfterSync.length, 2, 'Items NOT removed after sync');

  // Clean up
  await db.transaction('rw', db.items2185, db.members, db.realms, tx => {
    tx.items2185.clear();
    tx.members.where({ realmId: REALM_ID }).delete();
    tx.realms.delete(REALM_ID);
  });
  await db.cloud.sync({purpose: 'push', wait: true });
  ok(true, 'Test completed successfully');
  db.close();
  await Dexie.delete(DBNAME);
  console.log('Database deleted successfully');
});


function strip(...props: string[]) {
  return (obj: any) => {
    const newObj: any = {};
    for (const key in obj) {
      if (!props.includes(key)) {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  };
}

