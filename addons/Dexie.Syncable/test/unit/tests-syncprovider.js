import Dexie from 'dexie';
import 'dexie-observable';
import '../../src/Dexie.Syncable';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';

/*  To Test:
 * db.sync() using WebSocketSyncProtocol and WebSocketSyncServer with two db's of different names in same window.
 * Add object to db1
 * Make sure it appears in db2
 * Add 1100 objects to db2
 * Make sure they all appear in db1  - ALSO DEBUG THAT:
 * db2 sends it's changes as two chunks where first one is partial and second final
 * SyncServer gets partial and applies to uncommittedChanges
 * SyncServer gets final and commits changes, as well as triggers db1 provider, who
 * calls applyRemoteChanges on all objects.
 * db1.on('changes') gets triggered.
 * Add 1000 objects the same way and debug that:
 * db2 sents it's changes as one or two chunks depending on how I implemented it.
 * Add another db with same name as one of the two dbs.
 * Make sure that the third DB is not master
 * Make sure that sync() on third db will call master and make it sync, or connect to existing syncing.
 * Make sure that the third DB gets changes added to other remote db.
 * Take down master and make sure third DB becomes master and can continue syncing.
 */

/* WebSocketSyncProtocol
 * Was copied from /samples/remote-sync/websocket/WebSocketSyncProtocol.js
 * The tests would hang with the original file. Probably because of different instances of
 * Dexie and Dexie.Syncable (there were no registered protocols in the test when using directly the file from samples)
 */

// Constants:
var RECONNECT_DELAY = 5000;
Dexie.Syncable.registerSyncProtocol("websocket", {

  sync: function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
    var requestId = 0;
    var acceptCallbacks = {};
    var ws = new WebSocket(url);
    function sendChanges(changes, baseRevision, partial, onChangesAccepted) {
      ++requestId;
      acceptCallbacks[requestId.toString()] = onChangesAccepted;
      ws.send(JSON.stringify({
        type: 'changes',
        changes: changes,
        partial: partial,
        baseRevision: baseRevision,
        requestId: requestId
      }));
    }

    ws.onopen = function (event) {
      ws.send(JSON.stringify({
        type: "clientIdentity",
        clientIdentity: context.clientIdentity || null
      }));
      sendChanges(changes, baseRevision, partial, onChangesAccepted);
      ws.send(JSON.stringify({
        type: "subscribe",
        syncedRevision: syncedRevision
      }));
    }
    ws.onerror = function (event) {
      ws.close();
      onError(event.message, RECONNECT_DELAY);
    }
    ws.onclose = function (event) {
      onError("Socket closed: " + event.reason, RECONNECT_DELAY);
    }
    var isFirstRound = true;
    ws.onmessage = function (event) {
      try {
        var requestFromServer = JSON.parse(event.data);
        if (requestFromServer.type == "changes") {
          applyRemoteChanges(requestFromServer.changes, requestFromServer.currentRevision, requestFromServer.partial);
          if (isFirstRound && !requestFromServer.partial) {
            onSuccess({
              react: function (changes, baseRevision, partial, onChangesAccepted) {
                sendChanges(changes, baseRevision, partial, onChangesAccepted);
              },
              disconnect: function () {
                ws.close();
              }
            });
            isFirstRound = false;
          }
        } else if (requestFromServer.type == "ack") {
          var requestId = requestFromServer.requestId;
          var acceptCallback = acceptCallbacks[requestId.toString()];
          acceptCallback(); // Tell framework that server has acknowledged the changes sent.
          delete acceptCallbacks[requestId.toString()];
        } else if (requestFromServer.type == "clientIdentity") {
          context.clientIdentity = requestFromServer.clientIdentity;
          context.save();
        } else if (requestFromServer.type == "error") {
          var requestId = requestFromServer.requestId;
          ws.close();
          onError(requestFromServer.message, Infinity); // Don't reconnect - an error in application level means we have done something wrong.
        }
      } catch (e) {
        ws.close();
        onError(e, Infinity); // Something went crazy. Server sends invalid format or our code is buggy. Dont reconnect - it would continue failing.
      }
    }
  }
});

module("tests-syncprovider", {
  setup: function () {
    stop();
    Dexie.Promise.all(Dexie.delete("SyncProviderTest"), Dexie.delete("OtherClientDB")).then(function () {
      start();
    }).catch(function (e) {
      ok(false, "Could not delete database");
    });
  },
  teardown: function () {
    stop();
    Dexie.Promise.all(Dexie.delete("SyncProviderTest"), Dexie.delete("OtherClientDB")
    ).catch('DatabaseClosedError', function () {
    }).then(function () {
      start();
    });
  }
});

asyncTest("testSyncProvider", function () {
  var CREATE = 1,
      UPDATE = 2,
      DELETE = 3;

  var db = new Dexie("SyncProviderTest");
  db.version(1).stores({
    friends: "$$id,name",
    pets: "$$id,kind,name"
  });

  // Setup the sync server
  var server = new SyncServer(5000);
  server.start();

  // Connect our db client to it
  db.syncable.connect("websocket", "http://dummy:5000");
  db.syncable.on('statusChanged', function (newStatus, url) {
    console.log("Sync State Changed: " + Dexie.Syncable.StatusTexts[newStatus]);
  });

  // Open database
  db.open();

  // Create another database to sync with:
  var db2 = new Dexie("OtherClientDB");
  db2.version(1).stores({
    friends: "$$id",
    pets: "$$id"
  });

  db2.syncable.connect("websocket", "http://dummy:5000");
  db2.open().then(function () {
    console.log("db2 opened");
  });

  db2.on('changes', function (changes, partial) {
    console.log("db2.on('changes'): changes.length: " + changes.length + "\tpartial: " + (partial ? "true" : "false"));
    changes.forEach(function (change) {
      //console.log(JSON.stringify(change));
      db2.checkChange(change);
    });
  });

  db.on('changes', function (changes, partial) {
    console.log("db.on('changes'): changes.length: " + changes.length + "\tpartial: " + (partial ? "true" : "false"));
    changes.forEach(function (change) {
      if (db.checkChange) db.checkChange(change);
    });
  });

  function waitFor(db, params) {
    return new Dexie.Promise(function (resolve, reject) {
      db.checkChange = function (change) {
        var checker = {};
        Dexie.extend(checker, change);
        if (change.type == CREATE) Dexie.extend(checker, change.obj);
        if (change.type == UPDATE) Dexie.extend(checker, change.mods);
        var found = true;
        Object.keys(params).forEach(function (param) {
          if (!(param in checker)) found = false;
          if (params[param] != checker[param]) found = false;
        });
        if (found) resolve();
      }
    });
  }

  db.friends.add({name: "David"});

  waitFor(db2, {type: CREATE, name: "David"}).then(function () {
    ok(true, "The CREATE of friend 'David' was sent all the way to server and then back again to db2.");
    db.friends.where('name').equals('David').modify({name: "Ylva"});
    return waitFor(db2, {type: UPDATE, name: "Ylva"});
  }).then(function () {
    ok(true, "The UPDATE of friend 'David' to 'Ylva' was sent all the way around as well");
    return db.friends.where('name').equals('Ylva').first(function (friend) {
      return friend.id;
    })
  }).then(function (id) {
    db.friends.delete(id);
    return waitFor(db2, {type: DELETE, key: id});
  }).then(function () {
    ok(true, "The DELETE of friend 'Ylva' was sent all the way around as well");
    // Now send 1100 create requests
    var petsToAdd = new Array(1100);
    for (var i = 0; i < petsToAdd.length; ++i) {
      petsToAdd[i] = {name: "Josephina" + (i + 1), kind: "Dog"};
    }
    return db2.pets.bulkAdd(petsToAdd);
  }).then(function () {
    ok(true, "Successfully added 1100 pets into db2. Now wait for the last change to be synced into db1.");
    return waitFor(db, {type: CREATE, name: "Josephina1100"});
  }).then(function () {
    ok(true, "All 1100 dogs where sent all the way around (db2-->db this time)");
    // Now check that db2 contains all dogs and that its _uncommittedChanges is emptied
    return db.pets.count(function (count) {
      equal(count, 1100, "DB2 has 1100 pets now");
    });
  }).then(function () {
    return db._uncommittedChanges.count(function (count) {
      equal(count, 0, "DB2 has no uncommitted changes anymore");
    });
  }).then(function () {
    ok(true, "Now send 1000 create this time (exact number of max changes per chunk)");
    var petsToAdd = new Array(1000);
    for (var i = 0; i < petsToAdd.length; ++i) {
      petsToAdd[i] = {name: "Tito" + (i + 1), kind: "Cat"};
    }
    return db.pets.bulkAdd(petsToAdd);
  }).then(function () {
    ok(true, "Successfully added 1000 cats. Now wait for them to arrive in db2.");
    return waitFor(db2, {type: CREATE, name: "Tito1000"});
  }).then(function () {
    ok(true, "All 1000 cats where sent all the way around (db-->db2 this time)");
  }).finally(function () {
    console.log("Closing down");
    db.close();
    db2.close();
    start();
  });
});
