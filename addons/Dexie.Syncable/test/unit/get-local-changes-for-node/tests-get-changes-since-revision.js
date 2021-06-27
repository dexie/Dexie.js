import Dexie from 'dexie';
import 'dexie-observable';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../../test/dexie-unittest-utils';
import initGetChangesSinceRevision from '../../../src/get-local-changes-for-node/get-changes-since-revision';
import {CREATE, UPDATE} from '../../../src/change_types';

const db = new Dexie('TestDBTable');
db.version(1).stores({
  foo: "id"
});

const syncNode = new db.observable.SyncNode();
const nodeID = 1;
syncNode.id = nodeID;
const hasMoreToGive = {hasMoreToGive: false};
const getChangesSinceRevision = initGetChangesSinceRevision(db, syncNode, hasMoreToGive);
module('getChangesSinceRevision', {
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

asyncTest('should return relevant (between revision and maxRevision) changes', () => {
  const createChange1 = {
    rev: 1,
    key: 1,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange2 = {
    rev: 2,
    key: 2,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange3 = {
    rev: 3,
    key: 3,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange4 = {
    rev: 4,
    key: 4,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const revision = 1;
  const maxChanges = 10;
  const maxRevision = 3;
  function cb(changes, partial, revisionObject) {
    strictEqual(revisionObject.myRevision, createChange3.rev, 'myRevision');
    strictEqual(partial, false, 'is not a partial change');
    strictEqual(changes.length, 2, 'get only 2 changes');
    deepEqual(changes, [{
      key: 2,
      table: 'foo',
      type: CREATE,
      obj: {foo: 'bar'}
    }, {
      key: 3,
      table: 'foo',
      type: CREATE,
      obj: {foo: 'bar'}
    }], 'changes');
    deepEqual(hasMoreToGive, {hasMoreToGive: false}, 'hasMoreToGive remains false');
  }
  const changesToAdd = [createChange1, createChange2, createChange3, createChange4];
  db._changes.bulkAdd(changesToAdd)
    .then(() => {
      return getChangesSinceRevision(revision, maxChanges, maxRevision, cb)
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should ignore a change if it was set by this node', () => {
  const createChange1 = {
    rev: 1,
    key: 1,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange2 = {
    rev: 2,
    key: 2,
    type: CREATE,
    source: 1,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange3 = {
    rev: 3,
    key: 3,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange4 = {
    rev: 4,
    key: 4,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const revision = 1;
  const maxChanges = 10;
  const maxRevision = 3;
  function cb(changes/*, partial, revisionObject*/) {
    strictEqual(changes.length, 1, 'get only 1 changes');
    deepEqual(changes, [{
      key: 3,
      table: 'foo',
      type: CREATE,
      obj: {foo: 'bar'}
    }], 'changes');
  }
  const changesToAdd = [createChange1, createChange2, createChange3, createChange4];
  db._changes.bulkAdd(changesToAdd)
    .then(() => {
      return getChangesSinceRevision(revision, maxChanges, maxRevision, cb)
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should merge changes', () => {
  const createChange1 = {
    rev: 2,
    key: 2,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange2 = {
    rev: 3,
    key: 2,
    type: UPDATE,
    source: 2,
    table: 'foo',
    mods: {foo: 'baz'}
  };
  const revision = 1;
  const maxChanges = 10;
  const maxRevision = 3;
  function cb(changes/*, partial, revisionObject*/) {
    strictEqual(changes.length, 1, 'get only 1 changes');
    deepEqual(changes, [{
      key: 2,
      table: 'foo',
      type: CREATE,
      obj: {foo: 'baz'}
    }], 'changes');
  }
  const changesToAdd = [createChange1, createChange2];
  db._changes.bulkAdd(changesToAdd)
    .then(() => {
      return getChangesSinceRevision(revision, maxChanges, maxRevision, cb)
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should set hasMoreToGive to true if we have more changes than maxChanges', () => {
  const createChange1 = {
    rev: 1,
    key: 1,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange2 = {
    rev: 2,
    key: 2,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange3 = {
    rev: 3,
    key: 3,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange4 = {
    rev: 4,
    key: 4,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const revision = 1;
  const maxChanges = 2;
  const maxRevision = 4;
  hasMoreToGive.hasMoreToGive = false;
  function cb(changes, partial, revisionObject) {
    strictEqual(revisionObject.myRevision, createChange3.rev, 'myRevision');
    strictEqual(partial, true, 'is a partial change');
    strictEqual(changes.length, 2, 'get only 2 changes');
    deepEqual(hasMoreToGive, {hasMoreToGive: true}, 'hasMoreToGive is true');
  }
  const changesToAdd = [createChange1, createChange2, createChange3, createChange4];
  db._changes.bulkAdd(changesToAdd)
      .then(() => {
        return getChangesSinceRevision(revision, maxChanges, maxRevision, cb)
      })
      .catch(function(err) {
        ok(false, "Error: " + err);
      })
      .finally(start);
});


asyncTest('should set hasMoreToGive to true but give no changes if maxChanges is 0', () => {
  const createChange1 = {
    rev: 1,
    key: 1,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange2 = {
    rev: 2,
    key: 2,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange3 = {
    rev: 3,
    key: 3,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const createChange4 = {
    rev: 4,
    key: 4,
    type: CREATE,
    source: 2,
    table: 'foo',
    obj: {foo: 'bar'}
  };
  const revision = 1;
  const maxChanges = 0;
  const maxRevision = 4;
  hasMoreToGive.hasMoreToGive = false;
  function cb(changes, partial, revisionObject) {
    strictEqual(revisionObject.myRevision, revision, 'revision should not change');
    strictEqual(partial, true, 'is a partial change');
    strictEqual(changes.length, 0, 'get no changes');
    deepEqual(hasMoreToGive, {hasMoreToGive: true}, 'hasMoreToGive is true');
  }
  const changesToAdd = [createChange1, createChange2, createChange3, createChange4];
  db._changes.bulkAdd(changesToAdd)
      .then(() => {
        return getChangesSinceRevision(revision, maxChanges, maxRevision, cb)
      })
      .catch(function(err) {
        ok(false, "Error: " + err);
      })
      .finally(start);
});
