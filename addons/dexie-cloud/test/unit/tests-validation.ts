import {
  module,
  ok,
} from 'qunit';
import { promisedTest } from '../promisedTest';
import Dexie from 'dexie';
import dexieCloud from '../../src/dexie-cloud-client';

module('validation');

const DATABASE_URL = 'http://localhost:3000/ziud0envo';

promisedTest('validate-permissions-format', async () => {
  const testDb = new Dexie('permissionsTestDb', { addons: [dexieCloud] });
  await Dexie.delete(testDb.name);
  testDb.version(1).stores({
    members: "@id, realmId",
    roles: "[realmId+name]"
  });
  testDb.cloud.configure({
    databaseUrl: DATABASE_URL,
    requireAuth: false
  });
  await testDb.open();

  try {
    // 1. Valid permissions should succeed
    try {
      await testDb.table('members').add({
        id: 'm1',
        realmId: 'r1',
        email: 'valid@example.com',
        permissions: {
          add: ['todoLists'],
          manage: '*',
          update: {
            todoLists: ['title']
          }
        }
      });
      ok(true, "Valid permissions accepted");
    } catch (err) {
      ok(false, "Valid permissions should have been accepted: " + err);
    }

    // 2. Invalid permissions (manage: true) should throw TypeError
    try {
      await testDb.table('members').add({
        id: 'm2',
        realmId: 'r1',
        email: 'invalid@example.com',
        permissions: {
          manage: true as any
        }
      });
      ok(false, "Invalid manage: true should have been rejected");
    } catch (err: any) {
      ok(err instanceof TypeError, "Rejected invalid permissions with TypeError: " + err.message);
    }

    // 3. Invalid update permissions (string instead of array) should throw TypeError
    try {
      await testDb.table('members').add({
        id: 'm3',
        realmId: 'r1',
        email: 'invalid2@example.com',
        permissions: {
          update: {
            todoLists: 'not-an-array' as any
          }
        }
      });
      ok(false, "Invalid update property format should have been rejected");
    } catch (err: any) {
      ok(err instanceof TypeError, "Rejected invalid update properties with TypeError: " + err.message);
    }

    // 4. Invalid roles permissions (non-object permissions) should throw TypeError
    try {
      await testDb.table('roles').add({
        realmId: 'r1',
        name: 'r1',
        permissions: 'not-an-object' as any
      });
      ok(false, "Invalid non-object permissions on role should have been rejected");
    } catch (err: any) {
      ok(err instanceof TypeError, "Rejected invalid role permissions with TypeError: " + err.message);
    }
  } finally {
    testDb.close();
  }
});
