import Dexie from 'dexie';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../test/dexie-unittest-utils';
import bulkUpdate from '../../src/bulk-update';
import {UPDATE} from '../../src/change_types';

const db = new Dexie('TestDBTable', {addons: []});
db.version(1).stores({
  foo: "id"
});

db.on("populate", function () {
  db.table('foo').add({foo: 'bar', id: 1});
  db.table('foo').add({bar: 'baz', foo: { bar: 'foobar' }, id: 2});
});

module('bulkUpdate', {
  setup: () => {
    stop();
    resetDatabase(db).catch(function (e) {
      ok(false, "Error resetting database: " + e.stack);
    }).finally(start);
  },
  teardown: () => {
  }
});

asyncTest('should ignore any changes for which we didn\'t find an object in the table', () => {
  const changes = [{
    key: 3,
    mods: {id: 3, foo: 'bar'},
    table: 'foo',
    type: UPDATE
  }];
  bulkUpdate(db.table('foo'), changes)
    .then(() => {
      return db.table('foo').count();
    })
    .then((count) => {
      strictEqual(count, 2, 'No changes made to the table');
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should update the object in the table according to the changes', () => {
  const updateKey1 = {
    key: 1,
    mods: {id: 1, foo: 'bar'},
    table: 'foo',
    type: UPDATE
  };
  const updateKey2 = {
    key: 2,
    mods: {id: 2, bar: 'bar', 'foo.bar': 'bazzz'},
    table: 'foo',
    type: UPDATE
  };
  const changes = [updateKey1, updateKey2];
  bulkUpdate(db.table('foo'), changes)
    .then(() => {
      return db.table('foo').get(updateKey1.key);
    })
    .then((obj) => {
      deepEqual(obj, updateKey1.mods, 'Key 1 updated');
      return db.table('foo').get(updateKey2.key);
    })
    .then((obj) => {
      deepEqual(obj, {id: 2, bar: 'bar', foo: {bar: 'bazzz'}}, 'Key 2 updated');
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});
