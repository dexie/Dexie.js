import Dexie from 'dexie';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../../test/dexie-unittest-utils';
import initUpdatingHook from '../../../src/hooks/updating';
import initWakeupObservers from '../../../src/wakeup-observers';
import initOverrideCreateTransaction from '../../../src/override-create-transaction';
import {UPDATE} from '../../../src/change_types';

const db = new Dexie('TestDBTable', {addons: []});
db.version(1).stores({
  foo: "id",
  _changes: "++rev"
});

const wakeupObservers = initWakeupObservers(db, {latestRevision: {}}, self.localStorage);
const overrideCreateTransaction = initOverrideCreateTransaction(db, wakeupObservers);
db._createTransaction = Dexie.override(db._createTransaction, overrideCreateTransaction);

module('updating Hook', {
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

asyncTest('should create an UPDATE change', () => {
  db.foo.schema.observable = true;
  const updatingHook = initUpdatingHook(db, db.foo.name);
  const ID = 1;
  const source = 10;

  db.foo.hook('updating', function hook(mods, primKey, obj, trans) {
    // Remove this hook now otherwise other tests might call it
    db.foo.hook('updating').unsubscribe(hook);

    trans.source = source;
    const ctx = {onsuccess: null, onerror: null};
    updatingHook.call(ctx, mods, primKey, obj, trans);

    this.onsuccess = function() {
      try {
        db._changes.toArray((changes) => {
          strictEqual(changes.length, 1, 'We have one change');
          strictEqual(changes[0].key, ID, 'Key should match');
          strictEqual(changes[0].type, UPDATE, 'UPDATE type');
          strictEqual(changes[0].table, 'foo', 'foo table');
          deepEqual(changes[0].obj, {foo: 'baz', id: ID}, 'obj should match');
          strictEqual(changes[0].source, source, 'We have source');
          ok(typeof trans._lastWrittenRevision !== 'undefined', '_lastWrittenRevision should be defined');
        })
            .catch((e) => {
              ok(false, 'Error: ' + e);
            })
      } catch (e) {
        ok(false, 'Error: ' + e);
      }
    };

    this.onerror = function(e) {
      ok(false, 'Error: ' + e);
    }
  });

  db.foo.add({id: ID, foo: 'bar'})
      .then(() => {
        return db.foo.update(ID, {foo: 'baz'});
      })
      .catch(function(err) {
        ok(false, "Error: " + err);
      })
      .finally(start);
});

asyncTest('should not create an UPDATE change if the mods are already in the old object', () => {
  db.foo.schema.observable = true;
  const updatingHook = initUpdatingHook(db, db.foo.name);
  const ID = 2;
  const source = 10;

  db.foo.hook('updating', function hook(mods, primKey, obj, trans) {
    // Remove this hook now otherwise other tests might call it
    db.foo.hook('updating').unsubscribe(hook);

    trans.source = source;
    const ctx = {onsuccess: null, onerror: null};
    updatingHook.call(ctx, mods, primKey, obj, trans);

    this.onsuccess = function() {
      try {
        db._changes.toArray((changes) => {
          strictEqual(changes.length, 0, 'We have no change');
        })
            .catch((e) => {
              ok(false, 'Error: ' + e);
            })
      } catch (e) {
        ok(false, 'Error: ' + e);
      }
    };

    this.onerror = function(e) {
      ok(false, 'Error: ' + e);
    }
  });

  db.foo.add({id: ID, foo: 'bar'})
      .then(() => {
        return db.foo.update(ID, {foo: 'bar'});
      })
      .catch(function(err) {
        ok(false, "Error: " + err);
      })
      .finally(start);
});

