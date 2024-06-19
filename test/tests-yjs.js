import Dexie, { liveQuery } from 'dexie';
import { module, stop, start, asyncTest, equal, deepEqual, ok } from 'QUnit';
import {
  resetDatabase,
  spawnedTest,
  promisedTest,
  supports,
  isIE,
  isEdge,
} from './dexie-unittest-utils';
import * as Y from 'yjs';

const db = new Dexie('TestYjs', { Y });
db.version(1).stores({
  docs: 'id, title, content:Y',
});

module('yjs', {
  setup: () => {
    stop();
    resetDatabase(db)
      .catch((e) => {
        ok(false, 'Error resetting database: ' + e.stack);
      })
      .finally(start);
  },
  teardown: () => {},
});

promisedTest('Test Y.js basic support', async () => {
  await db.docs.put({
    id: "doc1",
    title: "Hello",
  });
  const doc = await db.docs.get("doc1");
  equal(doc.title, "Hello", "Title is correct");
  ok(doc.content instanceof Y.Doc, "Content is a Y.Doc");
});
