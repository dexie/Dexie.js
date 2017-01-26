import Dexie from 'dexie';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../../test/dexie-unittest-utils';
import initCreatingHook from '../../../src/hooks/creating';
import initWakeupObservers from '../../../src/wakeup-observers';
import initOverrideCreateTransaction from '../../../src/override-create-transaction';
import {CREATE} from '../../../src/change_types';

const db = new Dexie('TestDBTable', {addons: []});
db.version(1).stores({
  foo: "id",
  bar: "$$id",
  baz: "++id",
  _changes: "++rev"
});

const wakeupObservers = initWakeupObservers(db, {latestRevision: {}}, self.localStorage);
const overrideCreateTransaction = initOverrideCreateTransaction(db, wakeupObservers);
db._createTransaction = Dexie.override(db._createTransaction, overrideCreateTransaction);

module('creating Hook', {
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

asyncTest('should create a UUID key if $$ was given', () => {
  db.bar.schema.primKey.uuid = true;
  db.bar.schema.observable = true;
  const creatingHook = initCreatingHook(db, db.bar);

  db.bar.hook('creating', function(primKey, obj, trans) {
    const ctx = {onsuccess: null, onerror: null};
    const res = creatingHook.call(ctx, primKey, obj, trans);
    // Note that this regex is not spec compliant but should be good enough for this test
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    ok(regex.test(res), 'We got a UUID');

    this.onsuccess = function(resKey) {
      try {
        strictEqual(res, resKey, 'Key from success and hook should match');
        db._changes.toArray((changes) => {
          strictEqual(changes.length, 1, 'We have one change');
          strictEqual(changes[0].key, resKey, 'Key should match');
          strictEqual(changes[0].type, CREATE, 'CREATE type');
          strictEqual(changes[0].table, 'bar', 'bar table');
          // Normally $$ would be removed from the id in overrideParseStoresSpec
          deepEqual(changes[0].obj, {foo: 'bar', $$id: resKey}, 'obj should match');
          strictEqual(changes[0].source, null, 'We have no source');
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

  db.bar.add({foo: 'bar'})
      .catch(function(err) {
        ok(false, "Error: " + err);
      })
      .finally(start);
});

asyncTest('should not create a key if one was given', () => {
  db.foo.schema.observable = true;
  const creatingHook = initCreatingHook(db, db.foo);
  const ID = 1;
  const source = 10;

  db.foo.hook('creating', function(primKey, obj, trans) {
    trans.source = source;
    const ctx = {onsuccess: null, onerror: null};
    const res = creatingHook.call(ctx, primKey, obj, trans);
    strictEqual(res, undefined, 'ID was given return undefined');

    this.onsuccess = function(resKey) {
      try {
        strictEqual(resKey, ID, 'We got the given ID');
        db._changes.toArray((changes) => {
          strictEqual(changes.length, 1, 'We have one change');
          strictEqual(changes[0].key, ID, 'Key should match');
          strictEqual(changes[0].type, CREATE, 'CREATE type');
          strictEqual(changes[0].table, 'foo', 'foo table');
          deepEqual(changes[0].obj, {foo: 'bar', id: ID}, 'obj should match');
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
      .catch(function(err) {
        ok(false, "Error: " + err);
      })
      .finally(start);
});

asyncTest('should use the auto-incremented key if ++ was given', () => {
  db.baz.schema.observable = true;
  const creatingHook = initCreatingHook(db, db.baz);
  const ID = 1;

  db.baz.hook('creating', function(primKey, obj, trans) {
    const ctx = {onsuccess: null, onerror: null};
    const res = creatingHook.call(ctx, primKey, obj, trans);
    strictEqual(res, undefined, 'ID was auto-increment return undefined');

    this.onsuccess = function(resKey) {
      try {
        strictEqual(resKey, ID, 'We got the given ID');
        db._changes.toArray((changes) => {
          strictEqual(changes.length, 1, 'We have one change');
          strictEqual(changes[0].key, null, 'Key should be null');
          strictEqual(changes[0].type, CREATE, 'CREATE type');
          strictEqual(changes[0].table, 'baz', 'baz table');
          deepEqual(changes[0].obj, {foo: 'bar'}, 'obj should match');
          strictEqual(changes[0].source, null, 'We have no source');
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

  db.baz.add({foo: 'bar'})
      .catch(function(err) {
        ok(false, "Error: " + err);
      })
      .finally(start);
});
