import Dexie from 'dexie';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../../test/dexie-unittest-utils';
import initDeletingHook from '../../../src/hooks/deleting';
import initWakeupObservers from '../../../src/wakeup-observers';
import initOverrideCreateTransaction from '../../../src/override-create-transaction';
import {DELETE} from '../../../src/change_types';

const db = new Dexie('TestDBTable', {addons: []});
db.version(1).stores({
  foo: "id",
  _changes: "++rev"
});

const wakeupObservers = initWakeupObservers(db, {latestRevision: {}}, self.localStorage);
const overrideCreateTransaction = initOverrideCreateTransaction(db, wakeupObservers);
db._createTransaction = Dexie.override(db._createTransaction, overrideCreateTransaction);

module('deleting Hook', {
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

asyncTest('should create a DELETE change', () => {
  db.foo.schema.observable = true;
  const deletingHook = initDeletingHook(db, db.foo.name);
  const ID = 10;
  const source = 10;

  db.foo.hook('deleting', function(primKey, obj, trans) {
    trans.source = 10;
    const ctx = {onsuccess: null, onerror: null};
    deletingHook.call(ctx, primKey, obj, trans);

    this.onsuccess = function() {
      try {
        db._changes.toArray((changes) => {
          strictEqual(changes.length, 1, 'We have one change');
          strictEqual(changes[0].key, ID, 'Key should match');
          strictEqual(changes[0].type, DELETE, 'DELETE type');
          strictEqual(changes[0].table, 'foo', 'foo table');
          deepEqual(changes[0].oldObj, {foo: 'bar', id: ID}, 'oldObj should match');
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
        return db.foo.delete(ID)
      })
      .catch(function(err) {
        ok(false, "Error: " + err);
      })
      .finally(start);
});
