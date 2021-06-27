import Dexie from 'dexie';
import observable from 'dexie-observable';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../test/dexie-unittest-utils';
import initFinallyCommitAllChanges from '../../src/finally-commit-all-changes';
import {CREATE, DELETE, UPDATE} from '../../src/change_types';

const db = new Dexie('TestDBTable', {addons: [observable]});
db.version(1).stores({
  foo: "id"
});

const nodeID = 1;

let syncNode;
let finallyCommitAllChanges;
module('finallyCommitAllChanges', {
  setup: () => {
    stop();

    db.observable.SyncNode.prototype.save = function() { return { catch() {} }; };
    syncNode = new db.observable.SyncNode();
    syncNode.id = nodeID;
    syncNode.remoteBaseRevisions = [];
    finallyCommitAllChanges = initFinallyCommitAllChanges(db, syncNode);

    // Do a full DB reset to clean _changes table
    db._hasBeenCreated = false;
    resetDatabase(db).catch(function (e) {
      ok(false, "Error resetting database: " + e.stack);
    }).finally(start);
  },
  teardown: () => {
  }
});

asyncTest('should call node.save()', () => {
  let wasCalled = false;
  db.observable.SyncNode.prototype.save = function() {
    wasCalled = true;
    return { catch() {} };
  };
  finallyCommitAllChanges([], 1)
    .then(() => {
      ok(wasCalled);
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should apply _uncommittedChanges and remove them from that table', () => {
  const createChange = {
    key: 1,
    node: nodeID,
    type: CREATE,
    obj: { id: 1, foo: 'bar' },
    table: 'foo'
  };
  db._uncommittedChanges
    .add(createChange)
    .then(() => {
      return finallyCommitAllChanges([], 1);
    })
    .then(() => {
      return db.foo.get(createChange.key);
    })
    .then((obj) => {
      deepEqual(obj, createChange.obj, 'Change was found in table "foo"');
      return db._uncommittedChanges.where('node').equals(nodeID).count();
    })
    .then((count) => {
      strictEqual(count, 0, 'No more entries in _uncommittedChanges for the given nodeID');
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});


asyncTest('should put the changes into the given table', () => {
  const createChange = {
    key: 2,
    node: nodeID,
    type: CREATE,
    obj: { id: 2, foo: 'barbaz' },
    table: 'foo'
  };
  return finallyCommitAllChanges([createChange], 1)
    .then(() => {
      return db.foo.get(createChange.key);
    })
    .then((obj) => {
      deepEqual(obj, createChange.obj, 'Change was found in table "foo"');
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should set the nodeID as source for the currentTransaction', () => {
  db.observable.SyncNode.prototype.save = function() {
    strictEqual(Dexie.currentTransaction.source, nodeID);
    return { catch() {} };
  };
  finallyCommitAllChanges([], 1)
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should update remoteBaseRevisions and remove any old revisions', () => {
  const createChange = {
    key: 1,
    node: nodeID,
    type: CREATE,
    obj: { id: 1, foo: 'bar' },
    table: 'foo'
  };
  syncNode.remoteBaseRevisions = [{local: 1, remote: 2}];
  syncNode.myRevision = 2;

  const remoteRevision = 3;
  finallyCommitAllChanges([createChange], remoteRevision)
    .then(() => {
      strictEqual(syncNode.remoteBaseRevisions.length, 1, 'Only one remoteBaseRevision');
      // We had no changes yet so the next local revision is 1
      deepEqual(syncNode.remoteBaseRevisions, [{local: 1, remote: remoteRevision}], 'Make sure remoteBaseRevisions contains the correct object');
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should update node.appliedRemoteRevision', () => {
  const remoteRevision = 3;
  finallyCommitAllChanges([], remoteRevision)
    .then(() => {
      strictEqual(syncNode.appliedRemoteRevision, remoteRevision);
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should update myRevision to the latest rev we got', () => {
  const createChange = {
    rev: 1,
    key: 1,
    node: nodeID,
    type: CREATE,
    obj: { id: 1, foo: 'bar' },
    table: 'foo'
  };
  syncNode.remoteBaseRevisions = [{local: 1, remote: 2}];
  // We had no revision before and no changes
  syncNode.myRevision = 0;

  const remoteRevision = 3;
  finallyCommitAllChanges([createChange], remoteRevision)
    .then(() => {
      strictEqual(syncNode.myRevision, createChange.rev);
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});
