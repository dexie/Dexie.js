import Dexie from 'dexie';
import 'dexie-observable';
import '../../src/Dexie.Syncable';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';

/* The following is being tested:

 1. Client partials
 2. Receiving partials from the server
 3. What happens when the partialsThreshold is 0
 */
var db1 = new Dexie("db1");
var deletePromise = Dexie.delete("db1");

module("tests-syncable-partials", {
  setup: function () {
    db1.close();
    stop();
    deletePromise.then(function () {
      start()
    });
  },
  teardown: function () {
  }
});

const partialsThreshold = 100;
asyncTest("client/server partials", function () {
  var testNo = 0;
  var callbacks = [];
  Dexie.Syncable.registerSyncProtocol("testProtocol", {
    sync: function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
      var thiz = this, args = arguments;
      Dexie.vip(function () {
        try {
          callbacks[testNo++].apply(thiz, args);
        } catch (err) {
          db1.close();
          ok(false, err);
          start();
        }
      });
    },
    partialsThreshold: partialsThreshold
  });

  db1.version(1).stores({objects: "$$"});

  db1.on('populate', function () {
    db1.objects.add({name: "one"});
    db1.objects.add({name: "two"});
    db1.objects.add({name: "three"});
  });

  db1.open();

  db1.syncable.connect("testProtocol", "http://dummy.local");

  // Prepare tests
  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    // applyRemoteChanges
    applyRemoteChanges([], "revision one", false, false).then(function () {
      // onChangesAccepted
      onChangesAccepted();
    }).then(function () {
      // onSuccess
      onSuccess({again: 1});
    });
  });

  // Bulk add changes to pass the threshold
  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    // baseRevision
    equal(baseRevision, "revision one", "Now we get changes based on revision two");
    // syncedRevision
    equal(syncedRevision, "revision one", "Sync revision is 'revision two' because client has got it");
    // partial
    equal(partial, false, 'partial should be false');
    onChangesAccepted();
    db1.transaction('rw', db1.objects, function () {
      for (var i = 0; i < partialsThreshold + 1; ++i) {
        db1.objects.add({name: "bulk"});
      }
    }).then(function () {
      onSuccess({again: 1});
    });
  });

  // Make sure that we didn't receive more changes than the threshold
  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    // baseRevision
    equal(baseRevision, "revision one", "Now we get changes based on revision two");
    // syncedRevision
    equal(syncedRevision, "revision one", "Sync revision is 'revision two' because client has got it");
    // changes
    equal(changes.length, partialsThreshold, `Got ${partialsThreshold} changes`);
    equal(changes[0].obj.name, "bulk", "change is bulk");
    equal(partial, true, `More than ${partialsThreshold} changes gives partial=true`);
    onChangesAccepted();
    onSuccess({again: 1});
  });

  // Make sure we now get the rest of the changes
  // Revisions shouldn't change
  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    // baseRevision
    equal(baseRevision, "revision one", "Now we get changes based on revision two");
    // syncedRevision
    equal(syncedRevision, "revision one", "Sync revision is 'revision two' because client has got it");
    // changes
    equal(changes.length, 1, "Got 1 change");
    equal(changes[0].obj.name, "bulk", "change is bulk");
    equal(partial, false, "Last chunk with 1 change");
    onSuccess({again: 1});
  });

  // Test that a server partial is added to _uncommittedChanges and not to _changes
  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    applyRemoteChanges([{
      type: 1,
      table: "objects",
      key: "apa",
      obj: {name: "uncommittedChange"}
    }], "revision with uncommitted", true, false)
        .then(() => {
          return db1._uncommittedChanges.toArray().then((changes) => {
            strictEqual(changes.length, 1, 'Should have one uncommitted change');
            strictEqual(changes[0].key, 'apa', 'Key should match');
            deepEqual(changes[0].obj, {name: 'uncommittedChange'}, 'Saved obj should match');
            strictEqual(changes[0].table, 'objects', 'Table should match');
            strictEqual(changes[0].type, 1, 'Type should match');

            return db1._changes.toArray();
          });
        })
        .then((changes) => {
          ok(changes.every(function (change) {
            return change.obj.name !== 'uncommittedChange'
          }), 'The uncommitted change should not be in _changes');
          return db1._syncNodes.where('url').equals('http://dummy.local').toArray();
        })
        .then((nodes) => {
          strictEqual(nodes[0].appliedRemoteRevision, 'revision with uncommitted', "The node's appliedRemoteRevision should be updated");
          onSuccess({again: 1});
        });
  });

  // Test that if we don't have partial anymore -> move _uncommittedChanges to _changes
  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    applyRemoteChanges([{
      type: 1,
      table: "objects",
      key: "abba",
      obj: {name: "committedChange"}
    }], "revision one", false, false)
        .then(() => {
          return db1._uncommittedChanges.toArray().then((changes) => {
            strictEqual(changes.length, 0, 'Should have no uncommitted change');
            return db1._changes.toArray();
          });
        })
        .then((changes) => {
          ok(changes.some(function (change) {
            return change.obj.name === 'uncommittedChange'
          }), 'The uncommitted change should now be in _changes');
          ok(changes.some(function (change) {
            return change.obj.name === 'committedChange'
          }), 'The committedChange should also be in _changes');
        })
        .then(function () {
          return db1.delete();
        }).catch(function (err) {
      ok(false, "Got error: " + err);
    }).finally(start);
  });
});

asyncTest('partialsThreshold is zero', () => {
  var testNo = 0;
  var callbacks = [];
  Dexie.Syncable.registerSyncProtocol("testProtocol", {
    sync: function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
      var thiz = this, args = arguments;
      Dexie.vip(function () {
        try {
          callbacks[testNo++].apply(thiz, args);
        } catch (err) {
          db1.close();
          ok(false, err);
          start();
        }
      });
    },
    partialsThreshold: 0
  });

  db1.version(1).stores({objects: "$$"});

  db1.on('populate', function () {
    db1.objects.add({name: "one"});
    db1.objects.add({name: "two"});
  });

  db1.open();

  db1.syncable.connect("testProtocol", "http://dummy.local", {option1: "option1"});

  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial) {
    // changes
    equal(changes.length, 0, "No changes");
    equal(partial, true, "Partial since threshold is 0");
    start();
  });
});
