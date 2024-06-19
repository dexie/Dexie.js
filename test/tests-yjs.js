import Dexie, { DexieYProvider } from 'dexie';
import { module, stop, start, equal, deepEqual, ok } from 'QUnit';
import {
  resetDatabase,
  promisedTest,
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
  let row = await db.docs.get("doc1");
  equal(row.title, "Hello", "Title is correct");
  let doc = row.content;
  ok(doc instanceof Y.Doc, "Content is a Y.Doc");

  let row2 = await db.docs.get("doc1");
  let doc2 = row2.content;
  equal(doc, doc2, "The two doc instances are the same");

  let rows = await db.docs.toArray();
  equal(rows[0].content, doc, "The two doc instances are the same");

  // Now destroy the doc:
  doc.destroy();
  row2 = await db.docs.get("doc1");
  doc2 = row2.content;
  ok(doc !== doc2, "After destroying doc, a new instance is retrieved");

  // Delete document
  await db.docs.delete("doc1");
});

promisedTest('Test DexieYProvider', async () => {
  await db.docs.put({
    id: "doc2",
    title: "Hello2",
  });
  let row = await db.docs.get("doc2");
  /* @type {Y.Doc} */
  let doc = row.content;
  let provider = new DexieYProvider(doc);
  doc.getArray('arr').insert(0, ['a', 'b', 'c']);
  await provider.whenLoaded;
  doc.destroy();
  db.close({disableAutoOpen: false});
  await db.open();
  row = await db.docs.get("doc2");
  doc = row.content;
  provider = new DexieYProvider(doc);
  await doc.whenLoaded;
  // Verify that we got the same data:
  deepEqual(doc.getArray('arr').toJSON(), ['a', 'b', 'c'], "Array is correct after reload");
  // Verify we have updates in the update table (this part can be deleted if implementation is changed)
  let updates = await db.table('$docs.content_updates').toArray();
  ok(updates.length > 0, "Got updates in update table");
  await db.docs.clear();
  updates = await db.table('$docs.content_updates').toArray();
  equal(updates.length, 0, "No updates in update table after deleting document");
});
