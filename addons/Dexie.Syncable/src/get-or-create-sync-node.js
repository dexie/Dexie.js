import Dexie from 'dexie';

import initPersistedContext from './PersistedContext';

export default function initGetOrCreateSyncNode(db, protocolName, url) {
  return function getOrCreateSyncNode(options) {
    return db.transaction('rw', db._syncNodes, db._changes, function () {
      if (!url) throw new Error("Url cannot be empty");

      // Returning a promise from transaction scope will make the transaction promise resolve with the value of that promise.
      return db._syncNodes.where("url").equalsIgnoreCase(url).first(function (node) {
        // If we found a node it will be instanceof SyncNode as Dexie.Observable
        // maps to class
        if (node) {
          const PersistedContext = initPersistedContext(node);
          // Node already there. Make syncContext become an instance of PersistedContext:
          node.syncContext = new PersistedContext(node.id, node.syncContext);
          node.syncProtocol = protocolName; // In case it was changed (would be very strange but...) could happen...
          node.syncOptions = options; // Options could have been changed
          db._syncNodes.put(node);
        } else {
          // Create new node and sync everything
          node = new db.observable.SyncNode();
          node.myRevision = -1;
          node.appliedRemoteRevision = null;
          node.remoteBaseRevisions = [];
          node.type = "remote";
          node.syncProtocol = protocolName;
          node.url = url;
          node.syncOptions = options;
          node.lastHeartBeat = Date.now();
          node.dbUploadState = null;
          const PersistedContext = initPersistedContext(node);
          Dexie.Promise.resolve(function () {
            // If options.initialUpload is explicitely false, set myRevision to currentRevision.
            if (options.initialUpload === false)
              return db._changes.toCollection().lastKey(function (currentRevision) {
                node.myRevision = currentRevision;
              });
          }()).then(function () {
            db._syncNodes.add(node).then(function (nodeID) {
              node.syncContext = new PersistedContext(nodeID); // Update syncContext in db with correct nodeId.
              db._syncNodes.put(node);
            });
          });
        }

        return node; // returning node will make the db.transaction()-promise resolve with this value.
      });
    });
  };
}
