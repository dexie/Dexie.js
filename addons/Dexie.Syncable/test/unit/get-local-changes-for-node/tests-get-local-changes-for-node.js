import Dexie from 'dexie';
import 'dexie-observable';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../../../../test/dexie-unittest-utils';
import initGetLocalChangesForNode from '../../../src/get-local-changes-for-node/get-local-changes-for-node';
import {CREATE} from '../../../src/change_types';

const db = new Dexie('TestDBTable');
db.version(1).stores({
  foo: "id",
  bar: "id"
});

const syncNode = new db.observable.SyncNode();
const nodeID = 1;
syncNode.id = nodeID;
const hasMoreToGive = {hasMoreToGive: false};
module('getLocalChangesForNode', {
  setup: () => {
    stop();

    // Do a full DB reset to clean _changes table
    db._hasBeenCreated = false;
    resetDatabase(db).catch(function (e) {
      ok(false, "Error resetting database: " + e.stack);
    }).finally(start);
  },
  teardown: () => {
  }
});

asyncTest('should get the contents of our tables and create CREATE changes if node.myRevision is -1', () => {
  syncNode.myRevision = -1;
  syncNode.dbUploadState = null;
  syncNode.remoteBaseRevisions = [];
  const getLocalChangesForNode = initGetLocalChangesForNode(db, hasMoreToGive);
  const fooTableObject = {
    id: 1,
    foo: 'bar'
  };
  const barTableObject = {
    id: 1,
    bar: 'foo'
  };
  function cb(changes/*, remoteBaseRevision, partial, nodeModificationsOnAck*/) {
    strictEqual(changes.length, 2, 'We have 2 changes');
    deepEqual(changes, [{
      key: 1,
      obj: fooTableObject,
      type: CREATE,
      table: 'foo'
    }, {
      key: 1,
      obj: barTableObject,
      type: CREATE,
      table: 'bar'
    }], 'Changes match the objects in the tables');
    deepEqual(hasMoreToGive, {hasMoreToGive: false}, 'it should\'t change hasMoreToGive');
  }
  db.foo.add(fooTableObject)
    .then(() => {
      return db.bar.add(barTableObject);
    })
    .then(() => {
      return getLocalChangesForNode(syncNode, cb);
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should return changes in _changes if myRevision >= 0', () => {
  syncNode.myRevision = -1;
  syncNode.dbUploadState = null;
  syncNode.remoteBaseRevisions = [];
  const getLocalChangesForNode = initGetLocalChangesForNode(db, hasMoreToGive);
  const fooTableObject1 = {
    id: 1,
    foo: 'bar'
  };
  const fooTableObject2 = {
    id: 2,
    foo: 'foobar'
  };
  function cb(changes/*, remoteBaseRevision, partial, nodeModificationsOnAck*/) {
    strictEqual(changes.length, 2, 'We have 2 changes');
    deepEqual(changes, [{
      key: 1,
      obj: fooTableObject1,
      type: CREATE,
      table: 'foo'
    }, {
      key: 2,
      obj: fooTableObject2,
      type: CREATE,
      table: 'foo'
    }], 'Changes match the objects in the tables');
    deepEqual(hasMoreToGive, {hasMoreToGive: false}, 'it should\'t change hasMoreToGive');
  }
  // This also adds changes to _changes
  db.foo.bulkAdd([fooTableObject1, fooTableObject2])
    .then(() => {
      return getLocalChangesForNode(syncNode, cb);
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});
