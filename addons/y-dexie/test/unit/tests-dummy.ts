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
import * as Y from 'yjs';

module('dummy');

promisedTest('dummy-test', async () => {
  const db = new Dexie('dummy-test');
  db.version(1).stores({ friends: 'guid' });
  await db.open();
  ok(true, 'Dexie database created successfully');
  await db.delete();
  ok(true, 'Dexie database deleted successfully');
  const yDoc = new Y.Doc();
  ok(yDoc instanceof Y.Doc, 'Y.js document created successfully');
});
