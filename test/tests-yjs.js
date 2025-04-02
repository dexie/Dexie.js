import Dexie, { DexieYProvider } from 'dexie';
import { module, stop, start, equal, deepEqual, ok } from 'QUnit';
import {
  resetDatabase,
  promisedTest,
} from './dexie-unittest-utils';
import * as Y from 'yjs';
import * as awareness from 'y-protocols/awareness';

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
  // Await the transaction of doc manipulation to not
  // bring down the database before it has been stored.
  await db.transaction('rw', db.docs, () => {
    doc.getArray('arr').insert(0, ['a', 'b', 'c']);
  });
  //await provider.whenLoaded;
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


promisedTest('Test Y document compression', async () => {
  await db.docs.put({
    id: 'doc1',
    title: 'Hello',
  });
  let row = await db.docs.get('doc1');
  let doc = row.content;
  let provider = new DexieYProvider(doc);

  // Verify there are no updates in the updates table initially:
  const updateTable = db.docs.schema.yProps.find(
    (p) => p.prop === 'content'
  ).updatesTable;
  equal(await db.table(updateTable).count(), 0, 'No docs stored yet');

  // Create three updates:
  await db.transaction('rw', db.docs, () => {
    doc.getArray('arr').insert(0, ['a', 'b', 'c']);
    doc.getArray('arr').insert(0, ['1', '2', '3']);
    doc.getArray('arr').insert(0, ['x', 'y', 'z']);
  });
  // Verify we have 3 updates:
  equal(await db.table(updateTable).where('i').between(1,Infinity).count(), 3, 'Three updates stored');
  // Run the GC:
  console.debug('Running GC', await db.table(updateTable).toArray());
  await db.gc();
  console.debug('After running GC', await db.table(updateTable).toArray());
  // Verify we have 1 (compressed) update:
  equal(await db.table(updateTable).where('i').between(1,Infinity).count(), 1, 'One update stored after gc');
  // Verify the provider is still alive:
  ok(!provider.destroyed, "Provider is not destroyed");
  await db.transaction('rw', db.docs, () => {
    doc.getArray('arr').insert(0, ['a', 'b', 'c']);
    doc.getArray('arr').insert(0, ['1', '2', '3']);
    doc.getArray('arr').insert(0, ['x', 'y', 'z']);
  });
  equal(await db.table(updateTable).where('i').between(1,Infinity).count(), 4, 'Four updates stored after additional inserts');
  console.debug('Running GC', await db.table(updateTable).toArray());
  await db.gc();
  console.debug('After running GC', await db.table(updateTable).toArray());
  equal(await db.table(updateTable).where('i').between(1,Infinity).count(), 1, 'One update stored after gc');
  await db.docs.put({
    id: 'doc2',
    title: 'Hello2',
  });
  let row2 = await db.docs.get('doc2');
  let doc2 = row2.content;
  await new DexieYProvider(doc2).whenLoaded;
  await db.transaction('rw', db.docs, async () => {    
    doc2.getArray('arr2').insert(0, ['a', 'b', 'c']);
    doc2.getArray('arr2').insert(0, ['1', '2', '3']);
    doc2.getArray('arr2').insert(0, ['x', 'y', 'z']);
  });
  console.debug('After adding thigns to other doc', await db.table(updateTable).toArray());
  equal(await db.table(updateTable).where('i').between(1,Infinity).count(), 4, 'Four updates stored after additional inserts on other doc');
  await db.gc();
  console.debug('After GC where we have 2 docs', await db.table(updateTable).toArray());
  equal(await db.table(updateTable).where('i').between(1,Infinity).count(), 2, 'Two updates stored after gc (2 different docs)');

  // Now clear the docs table, which should implicitly clear the updates as well as destroying connected providers:
  await db.docs.clear();
  console.debug('After db.docs.clear()', await db.table(updateTable).toArray());
  // Verify there are no updates now:
  equal(
    await db.table(updateTable).where('i').between(1,Infinity).count(),
    0,
    'Zero update stored after clearing docs'
  );
  // Verify the provider has been destroyed:
  ok(provider.destroyed, "Provider was destroyed when document was deleted");
});


promisedTest('Test that syncers prohibit GC from compressing unsynced updates', async () => {
  await db.docs.put({
    id: 'doc1',
    title: 'Hello',
  });
  let row = await db.docs.get('doc1');
  let doc = row.content;
  let provider = new DexieYProvider(doc);

  // Verify there are no updates in the updates table initially:
  const updateTable = db.docs.schema.yProps.find(
    (p) => p.prop === 'content'
  ).updatesTable;
  equal(await db.table(updateTable).where('i').between(1,Infinity).count(), 0, 'No docs stored yet');

  // Create three updates:
  await db.transaction('rw', db.docs, () => {
    //Y.transact(doc, () => {
    doc.getArray('arr').insert(0, ['a', 'b', 'c']);
    doc.getArray('arr').insert(0, ['1', '2', '3']);
    doc.getArray('arr').insert(0, ['x', 'y', 'z']);
    //});
  });
  // Verify we have 3 updates:
  equal(await db.table(updateTable).where('i').between(1,Infinity).count(), 3, 'Three updates stored');

  // Put a syncer in place that will not sync the updates:
  await db.table(updateTable).put({
    i: "MySyncer",
    unsentFrom: await db.table(updateTable).orderBy('i').lastKey(), // Keep the last update and updates after that from being compressed
  });

  console.debug('Running GC');
  await db.gc();
  console.debug('After running GC');
  // Verify we have 2 updates (the first 2 was compressed but the last one was not):
  equal(await db.table(updateTable).where('i').between(1, Infinity).count(), 2, '2 updates stored');
  await db.docs.delete(row.id);
  // Verify we have 0 updates after deleting the row holding our Y.Doc property:
  equal(await db.table(updateTable).where('i').between(1, Infinity).count(), 0, '0 updates stored');
  ok(provider.destroyed, "Provider was destroyed when our document was deleted");
});


promisedTest('Test creating a row with a populated Y.Doc', async () => {
  const doc = new Y.Doc();
  doc.getArray('arr').insert(0, ['a', 'b', 'c']);
  await db.docs.add({
    id: "doc1",
    title: "Hello",
    content: doc
  });
  let row = await db.docs.get("doc1");
  equal(row.title, "Hello", "Title is correct");
  let doc2 = row.content;
  ok(doc2 instanceof Y.Doc, "Content is a Y.Doc");
  DexieYProvider.load(doc2);
  await doc2.whenLoaded;
  deepEqual(doc2.getArray('arr').toJSON(), ['a', 'b', 'c'], "Array is correct");
  DexieYProvider.release(doc2);
});

promisedTest('Verify error handling of misused Y.Doc properties', async () => {  
  // Setting to null:
  await db.docs.put({
    id: "doc1",
    title: "Hello",
    content: null
  }).then(() => {
    ok(false, "Expected error when trying to create an Y.Doc property with null value");
  }).catch(error => {
    ok(error instanceof TypeError, "Expected TypeError when trying to create an Y.Doc property with null value");
  });
  // Setting to undefined should be allowed (because a class with the property declared must work):
  await db.docs.put({
    id: "doc1",
    title: "Hello",
    content: undefined
  });
  ok(true, "could set the property to undefined");

  // Setting to a string:
  await db.docs.put({
    id: "doc1",
    title: "Hello",
    content: "a string"
  }).then(() => {
    ok(false, "Expected error when trying to create an Y.Doc property to a string");
  }).catch(error => {
    ok(error instanceof TypeError, "Expected TypeError when trying to create an Y.Doc property to a string");
  });
  // Setting to a Blob:
  await db.docs.put({
    id: "doc1",
    title: "Hello",
    content: new Blob([])
  }).then(() => {
    ok(false, "Expected error when trying to create an Y.Doc property to a Blob");
  }).catch(error => {
    ok(error instanceof TypeError, "Expected TypeError when trying to create an Y.Doc property to a Blob");
  });
  // Specifying an Y.Doc when adding is ok:
  await db.docs.add({
    id: "doc2",
    title: "Hola",
    content: new Y.Doc()
  });
  ok(true, "Successfully added a new Y.Doc");
  await db.docs.put({
    id: "doc3",
    title: "Thridi",
    content: new Y.Doc()
  }).then(()=>{
    ok(false, "Expected error when trying to put() with content data set on own property");
  }).catch(error => {
    ok(error instanceof TypeError, "Expected TypeError when trying to use put() with content data set on own property");
  })
  let doc2 = await db.docs.get("doc2");
  ok(doc2.content instanceof Y.Doc, "The content property is an Y.Doc");
  try {
    doc2.content = new Y.Doc();
    ok(false, "Should have thrown when trying to set content");
  } catch(error) {
    ok(true, "Failed when trying to set content of an existing doc");
  }
  doc2.title = "Quattro Pizza";
  await db.docs.put(doc2); // Verify it's ok to use put when an existing ydoc had been retrieved from DB.
  ok(true, "Could put back the doc2 we've added");
  let doc2Back = await db.docs.get("doc2");
  equal(doc2Back.title, "Quattro Pizza", "Verify that the put operation was successful for non-Y.Doc properties");
  ok(doc2Back.content === doc2.content, "Verify that the Y.Doc property is equal be reference to the previously retrieved Y.Doc as long as it isn't destroyed");
});

/*promisedTest('Test awareness', async () => {
  const doc = new Y.Doc();
  const aw = new awareness.Awareness(doc);
  console.log(Array.from(aw.getStates().keys()));
  const update = awareness.encodeAwarenessUpdate(aw, Array.from(aw.getStates().keys()));
  console.log("Update length", update.length);
});
*/