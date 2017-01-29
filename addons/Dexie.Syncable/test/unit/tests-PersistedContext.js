import Dexie from 'dexie';
import observable from 'dexie-observable';
// Add this so we have the SyncNode.prototype.save method
import syncable from '../../src/Dexie.Syncable';
import {module, asyncTest, test, start, stop, propEqual, deepEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../test/dexie-unittest-utils';
import initPersistedContext from '../../src/PersistedContext';

const db = new Dexie('TestDBTable', {addons: [observable, syncable]});
db.version(1).stores({foo: '++id'});

module('PersistedContext', {
  setup: () => {
    stop();
    resetDatabase(db).catch(function (e) {
      ok(false, "Error resetting database: " + e.stack);
    }).finally(start);
  },
  teardown: () => {
  }
});

asyncTest('should save any properties we add to the context into the DB', () => {
  const syncNode = new db.observable.SyncNode();
  const PersistedContext = initPersistedContext(syncNode);
  let addedNodeID;
  db._syncNodes.add(syncNode)
  .then((nodeID) => {
    addedNodeID = nodeID;
    const persistedContext = new PersistedContext(syncNode.id);
    syncNode.syncContext = persistedContext;
    persistedContext.foobar = 'foobar';
    return persistedContext.save()
  })
  .then(() => {
    return db._syncNodes.get(addedNodeID);
  })
  .then((node) => {
    deepEqual(node.syncContext, {foobar: 'foobar', nodeID: addedNodeID});
  })
  .catch(function(err) {
    ok(false, "Error: " + err);
  })
  .finally(start);
});

test('should extend the instance with the given options object', () => {
  const syncNode = new db.observable.SyncNode();
  const PersistedContext = initPersistedContext(syncNode);
  const persistedContext = new PersistedContext(1, {foo: 'bar'});
  propEqual(persistedContext, {nodeID: 1, foo: 'bar'});
});
