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
import Dexie from 'dexie';
import dexieCloud, { DexieCloudOptions } from '../../src/dexie-cloud-client';

module('migrate-to-cloud');

// Verify that an existing Dexie database with upgraders attached
// can be migrated to cloud and that dexie-cloud-addon doesn't
// forbid dexie upgraders if they are applied before entering
// cloud.
promisedTest('allow-upgrader-before-going-to-cloud', async () => {
  const DBNAME = 'allowprecloudupgrader';
  const DBURL = 'https://zv8n7bwcs.dexie.cloud'; // Shall exist in cloud.
  const DEMOUSER = 'foo@demo.local'; // Shall exist in cloud.

  function v1DB() {
    // Create a vanilla Dexie on version 1
    const db = new Dexie(DBNAME, { addons: [] }) as Dexie & {
      friends: Dexie.Table<{ guid: string }, string>;
    };
    db.version(1).stores({ friends: 'guid' });
    db.on('populate', (tx) =>
      tx.table('friends').bulkAdd([{ guid: '1' }, { guid: '2' }])
    );
    return db;
  }

  function v2DB() {
    // Create a new vanilla Dexie on version 2 with an upgrader
    const db = new Dexie(DBNAME, { addons: [] }) as Dexie & {
      friends: Dexie.Table<{ guid: string; name: string }, string>;
    };
    db.version(2)
      .stores({ friends: 'guid, name' })
      .upgrade(async (tx) => {
        ok(true, 'Executing upgrader for version 2');
        await tx
          .table('friends')
          .toCollection()
          .modify((friend) => {
            friend.name = `Name${friend.guid}`;
          });
      });
    return db;
  }

  function cloudDB(
    requireAuth: DexieCloudOptions['requireAuth'],
    { skipMigration } = { skipMigration: false }
  ) {
    // Create a new Dexie with cloud addon
    const db = new Dexie(DBNAME, { addons: [dexieCloud] }) as Dexie & {
      friends: Dexie.Table<{ guid: string; name: string }, string>;
    };
    db.version(10).stores({ friends: 'guid, name' });
    if (!skipMigration) {
      db.version(2)
        .stores({ friends: 'guid, name' })
        .upgrade(async (tx) => {
          ok(true, 'Executing upgrader for version 2');
          await tx
            .table('friends')
            .toCollection()
            .modify((friend) => {
              friend.name = `Name${friend.guid}`;
            });
        });
    }
    db.cloud.configure({
      databaseUrl: DBURL,
      requireAuth,
      nameSuffix: false, // For migrating the same local DB as the vanilla one and not just create a new local DB for cloud.
    });
    return db;
  }

  async function stepByStep() {
    ok(true, 'Opening version 1');
    // Create a vanilla Dexie on version 1
    let db = v1DB();
    let friends = await db.friends.toArray();
    equal(friends.length, 2, 'We have 2 friends in version 1');
    ok(
      friends.every((friend) => !('name' in friend)),
      'No names set in version 1'
    );
    db.close();

    ok(true, 'Opening version 2 (with an upgrader)');
    let db2 = v2DB();
    let friends2 = await db2.friends.toArray();
    equal(friends2.length, 2, 'We still have 2 friends in version 2');
    deepEqual(
      friends2,
      [
        { guid: '1', name: 'Name1' },
        { guid: '2', name: 'Name2' },
      ],
      'Names are set in version 2'
    );
    db2.close();

    ok(true, 'Opening cloud version 10');
    // Now migrate to cloud
    let dbCloud = cloudDB({ email: DEMOUSER, grant_type: 'demo' });
    await dbCloud.open();
    equal(
      dbCloud.cloud.currentUserId,
      DEMOUSER,
      'We are logged in as DEMOUSER'
    );
    let friendsCloud = await dbCloud.friends.toArray();
    deepEqual(
      friendsCloud,
      [
        { guid: '1', name: 'Name1', owner: DEMOUSER, realmId: DEMOUSER },
        { guid: '2', name: 'Name2', owner: DEMOUSER, realmId: DEMOUSER },
      ],
      'Names are set in cloud version and owner/realmId are set'
    );
    dbCloud.close();
  }

  async function stepOver2() {
    ok(
      true,
      'Opening version 1 and then directly on last version (skip version 2)'
    );
    // Create a vanilla Dexie on version 1
    let db = v1DB();
    let friends = await db.friends.toArray();
    equal(friends.length, 2, 'We have 2 friends in version 1');
    db.close();

    // Now migrate to cloud
    let dbCloud = cloudDB({ email: DEMOUSER, grant_type: 'demo' });
    await dbCloud.open();
    equal(
      dbCloud.cloud.currentUserId,
      DEMOUSER,
      'We are logged in as DEMOUSER'
    );
    let friendsCloud = await dbCloud.friends.toArray();
    deepEqual(
      friendsCloud,
      [
        { guid: '1', name: 'Name1', owner: DEMOUSER, realmId: DEMOUSER },
        { guid: '2', name: 'Name2', owner: DEMOUSER, realmId: DEMOUSER },
      ],
      'Names are set in cloud version'
    );
    dbCloud.close();
  }

  async function openLastVersionDirectly() {
    ok(true, 'Opening last version directly');
    // Open cloud
    let dbCloud = cloudDB({ email: DEMOUSER, grant_type: 'demo' });
    await dbCloud.open();
    equal(
      dbCloud.cloud.currentUserId,
      DEMOUSER,
      'We are logged in as DEMOUSER'
    );
    let friendsCloud = await dbCloud.friends.toArray();
    ok(true, `${friendsCloud.length} friends in cloud version`);
    dbCloud.close();
  }

  async function clearDataOnServer() {
    ok(true, 'Clearing data on server');
    const db = cloudDB(
      { email: DEMOUSER, grant_type: 'demo' },
      { skipMigration: true }
    );
    await db.open();
    ok(true, 'Clearing friends');
    try {
      await db.friends.clear();
    } catch (e) {
      console.error(e);
      debugger;
    }
    ok(true, 'Syncing');
    await db.cloud.sync();
    ok(true, 'Closing');
    db.close();
    ok(true, 'Deleting');
    await Dexie.delete(DBNAME);
  }

  await Dexie.delete(DBNAME);
  await clearDataOnServer();
  await openLastVersionDirectly();
  await Dexie.delete(DBNAME);
  await stepByStep();
  await Dexie.delete(DBNAME);
  await stepOver2();
  await Dexie.delete(DBNAME);
});
