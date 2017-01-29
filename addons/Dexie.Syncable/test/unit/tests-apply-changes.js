import Dexie from 'dexie';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../test/dexie-unittest-utils';
import initApplyChanges from '../../src/apply-changes';
import {CREATE, DELETE, UPDATE} from '../../src/change_types';

const db = new Dexie('TestDBTable', {addons: []});
db.version(1).stores({
  foo: "id",
  bar: "++id"
});

const applyChanges = initApplyChanges(db);
module('applyChanges', {
  setup: () => {
    stop();
    resetDatabase(db).catch(function (e) {
      ok(false, "Error resetting database: " + e.stack);
    }).finally(start);
  },
  teardown: () => {
  }
});

asyncTest('should resolve with "null" if the offset is equal to the number of changes', () => {
  // Base case for the recursion
  applyChanges([], 0)
    .then((val) => {
      strictEqual(val, null);
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should be able to handle changes belonging to different tables', () => {
  const fooCreateChange = {
    key: 1,
    table: 'foo',
    obj: { foo: 'bar', id: 1 },
    type: CREATE
  };
  const barCreateChange = {
    table: 'bar',
    obj: { foo: 'baz' },
    type: CREATE
  };
  const changes = [fooCreateChange, barCreateChange];
  applyChanges(changes, 0)
    .then(() => {
      return db.table('foo').get(fooCreateChange.key);
    })
    .then((obj) => {
      // Works when key is given
      deepEqual(obj, fooCreateChange.obj, 'fooCreateChange found in table');
      return db.table('bar').toArray();
    })
    .then((objects) => {
      // Works with auto-incremented key
      strictEqual(objects[0].foo, barCreateChange.obj.foo, 'barCreateChange found in table');
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should be able to handle different types of changes', () => {
  const tableData = [{ id: 2, foo: 'foobar' }, { id: 3, foo: 'bar' }];
  const createChange = {
    key: 1,
    table: 'foo',
    obj: { foo: 'bar', id: 1 },
    type: CREATE
  };
  const updateChange = {
    key: 2,
    table: 'foo',
    mods: { foo: 'baz' },
    type: UPDATE
  };
  const deleteChange = {
    key: 3,
    table: 'foo',
    type: DELETE
  };
  const changes = [createChange, updateChange, deleteChange];
  db.table('foo').bulkPut(tableData)
    .then(() => {
      return applyChanges(changes, 0);
    })
    .then(() => {
      return db.table('foo').get(createChange.key);
    })
    .then((obj) => {
      deepEqual(obj, createChange.obj, 'createChange found in table');
      return db.table('foo').get(updateChange.key);
    })
    .then((obj) => {
      strictEqual(obj.foo, 'baz', 'updateChange found in table');
      return db.table('foo').get(deleteChange.key);
    })
    .then((obj) => {
      strictEqual(obj, undefined, 'deleteChange was executed on table');
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});
