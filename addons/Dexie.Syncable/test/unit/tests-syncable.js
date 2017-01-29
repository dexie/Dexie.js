import Dexie from 'dexie';
import 'dexie-observable';
import '../../src/Dexie.Syncable';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';

/* The following is being tested:

 1. A dummy implementation of ISyncProtocol is registered so that the unit test can interact with the database correctly.
 2. Test status changes
 3. Test disconnect/reconnect and that we get changes which happened as we were disconnected
 */
var db1 = new Dexie("db1");
var db2 = new Dexie("db1");
var deletePromise = Dexie.delete("db1");

module("tests-syncable", {
  setup: function () {
    db1.close();
    db2.close();
    stop();
    deletePromise.then(function () {
      start()
    });
  },
  teardown: function () {
  }
});

asyncTest("connect(), disconnect()", function () {
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
    partialsThreshold: 1000
  });

  db1.version(1).stores({objects: "$$"});
  db2.version(1).stores({objects: "$$"});

  db1.on('populate', function () {
    db1.objects.add({name: "one"});
    db1.objects.add({name: "two"});
    db1.objects.add({name: "three"}).then(function (key) {
      db1.objects.update(key, {name: "four"});
    });
  });

  db1.syncable.on('statusChanged', function (newStatus) {
    ok(true, "Status changed to " + Dexie.Syncable.StatusTexts[newStatus]);
  });
  db2.syncable.on('statusChanged', function (newStatus) {
    ok(true, "Status changed to " + Dexie.Syncable.StatusTexts[newStatus]);
  });

  db1.open();

  var connectPromise = db1.syncable.connect("testProtocol", "http://dummy.local", {option1: "option1"});

  // Test first sync call
  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    // url
    equal(url, "http://dummy.local", "URL got through");
    // options
    equal(options.option1, "option1", "Options got through");
    // baseRevision
    equal(baseRevision, null, "Base revision is null");
    // syncedRevision
    equal(syncedRevision, null, "Sync revision is null");
    // changes
    equal(changes.length, 3, "Three changes (change number four should be reduced into change no 3");
    ok(changes.every(function (change) {
      return change.type == 1
    }), "All three changes are create changes");
    ok(changes.some(function (change) {
      return change.obj.name == "one"
    }), "'one' is among changes");
    ok(changes.some(function (change) {
      return change.obj.name == "two"
    }), "'two' is among changes");
    ok(changes.some(function (change) {
      return change.obj.name == "four"
    }), "'four' is among changes");
    // partial
    equal(partial, false, "Not partial since number of changes are below 1000");
    // applyRemoteChanges
    applyRemoteChanges([{
      type: 1,
      table: "objects",
      key: "apa",
      obj: {name: "five"}
    }], "revision one", false, false).then(function () {
      // Create a local change between remoteChanges application
      return db1.objects.add({name: "six"});
    }).then(function () {
      return applyRemoteChanges([{
        type: 1,
        table: "objects",
        key: "apa2",
        obj: {name: "seven"}
      }], "revision two", false, false);
    }).then(function () {
      // onChangesAccepted
      onChangesAccepted();
      return db1.objects.add({name: "eight"});
    }).then(function () {
      // onSuccess
      onSuccess({again: 1});
    });
  });

  connectPromise.then(function () {
    db1.objects.count(function (count) {
      equal(count, 7, "There should be seven objects in db after sync");
      // From populate:
      // 1: one
      // 2: two
      // 3: four
      // 4: applyRemoteChanges: "five" ("apa")
      // 5: db.objects.add("six")
      // 6: applyRemoteChanges: "seven" ("apa2")
      // 7: db.objects.add("eight");
    });
    db1.objects.get("apa2", function (seven) {
      equal(seven.name, "seven", "Have got the change from the server. If not, check that promise does not fire until all changes have committed.");
    });
  }).catch('DatabaseClosedError', function () {
    console.warn("DatabaseClosedError");
  }).catch(function (ex) {
    ok(false, "Could not connect. Error: " + (ex.stack || ex));
  });

  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    // url
    equal(url, "http://dummy.local", "URL still there");
    // options
    equal(options.option1, "option1", "Options still there");
    // baseRevision
    equal(baseRevision, "revision one", "First chunk of changes is based on revision one because 'six' was created based on revision one");
    // syncedRevision
    equal(syncedRevision, "revision two", "Sync revision is 'revision two' because client has got it");
    // changes
    equal(changes.length, 1, "Even though there's two changes, we should only get the first one because they are based on different revisions");
    equal(changes[0].obj.name, "six", "First change is six");
    equal(partial, false);
    onChangesAccepted();
    onSuccess({again: 1});
  });

  // Prepare disconnect test
  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    // baseRevision
    equal(baseRevision, "revision two", "Now we get changes based on revision two");
    // syncedRevision
    equal(syncedRevision, "revision two", "Sync revision is 'revision two' because client has got it");
    // changes
    equal(changes.length, 1, "Got another change");
    equal(changes[0].obj.name, "eight", "change is eight");
    equal(partial, false);
    onChangesAccepted();

    // Test disconnect()
    db1.syncable.disconnect("http://dummy.local");
    onSuccess({again: 1}); // Framework should ignore again: 1 since it's disconnected.
    setTimeout(reconnect, 500);
    db1.objects.add({name: "changeAfterDisconnect"});
  });

  function reconnect() {
    db1.close();
    db1 = db2;
    db1.open().then(function () {
      return db1.objects.add({name: "changeBeforeReconnect"});
    }).then(function () {
      return db1.syncable.getStatus("http://dummy.local", function (status) {
        equal(status, Dexie.Syncable.Statuses.OFFLINE, "Status is OFFLINE");
      });
    }).then(function () {
      db1.syncable.connect("testProtocol", "http://dummy.local");
    });
  }

  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    // baseRevision
    equal(baseRevision, "revision two", "baseRevision Still revision two");
    // syncedRevision
    equal(syncedRevision, "revision two", "syncedRevision Still revision two");
    // changes
    equal(changes.length, 2, "Got 2 changes after reconnect.");
    equal(changes[0].obj.name, "changeAfterDisconnect", "change one is changeAfterDisconnect");
    equal(changes[1].obj.name, "changeBeforeReconnect", "change two is changeBeforeReconnect");
    onChangesAccepted();

    onSuccess({again: 10000}); // Wait a looong time for calling us again (so that we have the time to close and reopen and then force a sync sooner)

    setTimeout(function () {
      db1.syncable.getStatus("http://dummy.local", function (status) {
        // Close and open again and it will be status connected at once
        equal(status, Dexie.Syncable.Statuses.ONLINE, "Status is ONLINE");
      }).then(function () {
        // Close and open again and it will be status connected at once
        return db1.delete();
      }).catch(function (err) {
        ok(false, "Got error: " + err);
      }).finally(start);
    }, 100);
  });
});

asyncTest('delete()', () => {
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
    partialsThreshold: 10
  });

  db1.version(1).stores({objects: "$$"});

  db1.on('populate', function () {
    db1.objects.add({name: "one"});
    db1.objects.add({name: "two"});
  });

  db1.open();

  const url = "http://urlToDelete.local";
  db1.syncable.connect("testProtocol", url);

  db1.syncable.on('statusChanged', function (newStatus) {
    ok(true, "Status changed to " + Dexie.Syncable.StatusTexts[newStatus]);
  });

  const originalDisconnect = db1.syncable.disconnect;

  let disconnectWasCalled = false;
  db1.syncable.disconnect = function (url) {
    disconnectWasCalled = true;
    return originalDisconnect(url);
  };

  const originalDeleteOldChanges = Dexie.Observable.deleteOldChanges;

  let deleteOldChangesWasCalled = false;
  Dexie.Observable.deleteOldChanges = function (db) {
    deleteOldChangesWasCalled = true;
    return originalDeleteOldChanges(db);
  };

  callbacks.push(function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    // Add some uncommitted changes
    applyRemoteChanges([{
      type: 1,
      table: "objects",
      key: "apa",
      obj: {name: "uncommittedChangeBeforeDelete"}
    }], "revision with uncommitted", true, false)
        .then(() => {
          return db1.syncable.delete(url);
        })
        .then(() => {
          ok(disconnectWasCalled, 'We got disconnected');
          return db1._uncommittedChanges.toArray();
        })
        .then((uncommittedChanges) => {
          ok(uncommittedChanges.every(function (change) {
            return change.obj.name !== 'uncommittedChangeBeforeDelete'
          }), 'The uncommitted change should not be in _uncommittedChanges anymore');
          return db1._syncNodes.where('url').equals(url).toArray();
        })
        .then((nodes) => {
          strictEqual(nodes.length, 0, 'All nodes with this url should be deleted');
          ok(deleteOldChangesWasCalled, 'Observable.deleteOldChanges was called');
        })
        .catch(function (err) {
          ok(false, "Got error: " + err);
        }).finally(start);
    onSuccess(); // Stop syncing
  });
});
