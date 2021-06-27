import Dexie from 'dexie';
import 'dexie-observable';
import '../../src/Dexie.Syncable';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';

/* The following is being tested:

 1. getOptions method
 2. changing options on an existing connected node by using connect() with a different options object than before
 3. changing options on an existing disconnected node by using connect() with a different options object than before
 */
const db = new Dexie("optionsTestDB");
const deletePromise = Dexie.delete("optionsTestDB");

module("tests-changing-options", {
  setup: function () {
    db.close();
    stop();
    deletePromise.then(function () {
      start()
    });
  },
  teardown: function () {
  }
});

asyncTest('Change options on an existing node', function () {
  const protocolName = 'testProtocolChanges';
  const serverUrl = 'http://dummy.local';
  const syncProtocol = {
    sync: undefined,
    partialsThreshold: 1000
  };

  Dexie.Syncable.registerSyncProtocol(protocolName, syncProtocol);

  db.version(1).stores({objects: "$$"});
  db.open();

  syncProtocol.sync = function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess) {
    propEqual(options, {option1: 'option1'}, 'sync got the correct options');
    onSuccess({again: 1000});
  };

  db.syncable.connect(protocolName, serverUrl, {option1: "option1"})
      .then(() => {
        return db.syncable.getOptions(serverUrl);
      })
      .then((options) => {
        propEqual(options, {option1: 'option1'}, 'getOptions got the correct options');

        syncProtocol.sync = function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess) {
          propEqual(options, {newOptions: 'other options'}, 'sync got the new options');
          onSuccess({again: 1000});
        };

        // Test changing options on an already connected node
        // We are already connected but are changing options
        // We expect that the next getOptions/sync call has the new options
        return db.syncable.connect(protocolName, serverUrl, {newOptions: 'other options'});
      })
      .then(() => {
        return db.syncable.getOptions(serverUrl);
      })
      .then((options) => {
        propEqual(options, {newOptions: 'other options'}, 'getOptions got the new options');
        // Test changing options on a disconnected existing node
        return db.syncable.disconnect(serverUrl);
      })
      .then(() => {
        syncProtocol.sync = function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess) {
          propEqual(options, {evenNewerOptions: 'super new options'}, 'sync got the even newer options');
          onSuccess({again: 1000});
        };

        return db.syncable.connect(protocolName, serverUrl, {evenNewerOptions: 'super new options'});
      })
      .then(() => {
        return db.syncable.getOptions(serverUrl);
      })
      .then((options) => {
        propEqual(options, {evenNewerOptions: 'super new options'}, 'getOptions got the even newer options');
      })
      .catch(function (err) {
        ok(false, "Error: " + err);
      })
      .finally(start);
});
