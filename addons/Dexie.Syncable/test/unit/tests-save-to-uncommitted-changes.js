import Dexie from 'dexie';
import observable from 'dexie-observable';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../test/dexie-unittest-utils';
import initSaveToUncommittedChanges from '../../src/save-to-uncommitted-changes';
import {CREATE, DELETE, UPDATE} from '../../src/change_types';

const db = new Dexie('TestDBTable', {addons: [observable]});
db.version(1).stores({
  foo: "id"
});

const nodeID = 1;
db.observable.SyncNode.prototype.save = function() {
  return {
    then(cb){ cb(); }
  };
};
let syncNode;
let saveToUncommittedChanges;
module('saveToUncommittedChanges', {
  setup: () => {
    stop();

    syncNode = new db.observable.SyncNode();
    syncNode.id = nodeID;
    saveToUncommittedChanges = initSaveToUncommittedChanges(db, syncNode);

    resetDatabase(db).catch(function (e) {
      ok(false, "Error resetting database: " + e.stack);
    }).finally(start);
  },
  teardown: () => {
  }
});

asyncTest('should save the given changes in the _uncommittedChanges table', () => {
  const create = {
    key: 1,
    table: 'foo',
    type: CREATE,
    obj: {foo: 'bar'}
  };
  const update = {
    key: 2,
    table: 'foo',
    type: UPDATE,
    mods: {bar: 'baz'}
  };
  const remove = {
    key: 3,
    table: 'foo',
    type: DELETE
  };
  const changes = [create, update, remove];
  saveToUncommittedChanges(changes, 10)
    .then(() => {
      return db._uncommittedChanges.toArray();
    })
    .then((changes) => {
      strictEqual(changes.length, 3, 'Number of changes matches');
      deepEqual(changes[0], {
        id: 1,
        key: 1,
        type: CREATE,
        node: nodeID,
        table: 'foo',
        obj: {foo: 'bar'}
      }, 'Create change');
      deepEqual(changes[1], {
        id: 2,
        key: 2,
        type: UPDATE,
        node: nodeID,
        table: 'foo',
        mods: {bar: 'baz'}
      }, 'Update change');
      deepEqual(changes[2], {
        id: 3,
        key: 3,
        type: DELETE,
        node: nodeID,
        table: 'foo'
      }, 'Delete change');
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should add the remoteRevision to the given node', () => {
  const remoteRevision = 20;
  saveToUncommittedChanges([], remoteRevision)
    .then(() => {
      strictEqual(syncNode.appliedRemoteRevision, remoteRevision);
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});
