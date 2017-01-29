import Dexie from 'dexie';
import observable from 'dexie-observable';
// Add this so we have the SyncNode.prototype.save method
import syncable from '../../src/Dexie.Syncable';
import {module, asyncTest, test, start, stop, propEqual, deepEqual, strictEqual, ok} from 'QUnit';
import {resetDatabase} from '../../../../test/dexie-unittest-utils';
import initGetOrCreateSyncNode from '../../src/get-or-create-sync-node';

const db = new Dexie('TestDBTable', {addons: [observable, syncable]});
db.version(1).stores({foo: '++id'});

const protocolName = 'protocolName';
const url = 'http://foo.invalid';
const getOrCreateSyncNode = initGetOrCreateSyncNode(db, protocolName, url);
module('getOrCreateSyncNode', {
  setup: () => {
    stop();
    resetDatabase(db).catch(function (e) {
      ok(false, "Error resetting database: " + e.stack);
    }).finally(start);
  },
  teardown: () => {
  }
});

asyncTest('should throw an error if no URL was passed', () => {
  const getOrCreateSyncNode = initGetOrCreateSyncNode(db, protocolName);
  getOrCreateSyncNode({})
    .catch((e) => {
      strictEqual(e.message, 'Url cannot be empty');
    })
    .finally(start);
});

asyncTest('should return a new node if none exists for the given URL', () => {
  const nodeOpts = {foo: 'bar'};
  let nodeID;
  getOrCreateSyncNode(nodeOpts)
    .then((node) => {
      nodeID = node.id;
      ok(node instanceof db.observable.SyncNode, 'returned node is instance of SyncNode');
      strictEqual(node.syncProtocol, protocolName, 'syncProtocol is protocol name');
      strictEqual(node.url, url, 'url is the url we passed to init');
      deepEqual(node.syncOptions, nodeOpts, 'syncOptions are the same as the options we passed');
      strictEqual(node.myRevision, -1, 'myRevision is -1');
      propEqual(node.syncContext, {nodeID}, 'syncContext contains the correct nodeID');
      return db._syncNodes.get(nodeID);
    })
    .then((node) => {
      strictEqual(node.id, nodeID, 'Node was saved in the DB');
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should return an existing node if one exists for the given URL', () => {
  const nodeOpts = {foo: 'bar'};
  let nodeID;
  // Don't reuse the save URL, it would cause an error because the index is not unique
  const otherUrl = 'http://bar.invalid';
  const getOrCreateSyncNode = initGetOrCreateSyncNode(db, protocolName, otherUrl);
  const syncNode = new db.observable.SyncNode();
  syncNode.url = otherUrl;
  let addedNodeID;
  db._syncNodes.add(syncNode)
    .then((nodeID) => {
      addedNodeID = nodeID;
      return getOrCreateSyncNode(nodeOpts)
    })
    .then((node) => {
      ok(node instanceof db.observable.SyncNode, 'returned node is instance of SyncNode');
      strictEqual(node.id, addedNodeID, 'We got the correct node back');
      propEqual(node.syncContext, {nodeID: addedNodeID}, 'syncContext contains the correct nodeID');
      propEqual(node.syncOptions, nodeOpts, 'node contains the given options');
      return db._syncNodes.get(addedNodeID);
    })
    .then((node) => {
      strictEqual(node.syncContext.nodeID, addedNodeID, 'Node was saved in the DB with the correct context');
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});

asyncTest('should set myRevision to the last _changes if initialUpload is false', () => {
  const nodeOpts = {initialUpload: false};
  // Don't reuse the save URL, it would cause an error because the index is not unique
  const otherUrl = 'http://baz.invalid';
  const getOrCreateSyncNode = initGetOrCreateSyncNode(db, protocolName, otherUrl);
  db._changes.add({key: 1, obj: {foo: 'bar'}, table: 'foo', type: 1})
    .then(() => {
      return getOrCreateSyncNode(nodeOpts);
    })
    .then((node) => {
      strictEqual(node.myRevision, 1);
    })
    .catch(function(err) {
      ok(false, "Error: " + err);
    })
    .finally(start);
});
