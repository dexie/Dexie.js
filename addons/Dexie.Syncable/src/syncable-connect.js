import Dexie from 'dexie';

const Promise = Dexie.Promise;

export default function initSyncableConnect(db, connect) {
  return function syncableConnect(protocolInstance, protocolName, url, options) {
    if (db.isOpen()) {
      // Database is open
      if (!db._localSyncNode)
        throw new Error("Precondition failed: local sync node is missing. Make sure Dexie.Observable is active!");

      if (db._localSyncNode.isMaster) {
        // We are master node
        return connect(protocolInstance, protocolName, url, options, db._localSyncNode.id);
      } else {
        // We are not master node
        // Request master node to do the connect:
        return db.table('_syncNodes').where('isMaster').above(0).first(function (masterNode) {
          // There will always be a master node. In theory we may self have become master node when we come here. But that's ok. We'll request ourselves.
          return db.observable.sendMessage('connect', {
            protocolName: protocolName,
            url: url,
            options: options
          }, masterNode.id, {wantReply: true});
        });
      }
    } else if (db.hasBeenClosed()) {
      // Database has been closed.
      return Promise.reject(new Dexie.DatabaseClosedError());
    } else if (db.hasFailed()) {
      // Database has failed to open
      return Promise.reject(new Dexie.InvalidStateError(
          "Dexie.Syncable: Cannot connect. Database has failed to open"));
    } else {
      // Database not yet open. It may be on its way to open, or open() hasn't yet been called.
      // Wait for it to open, then connect.
      var promise = new Promise(function (resolve, reject) {
        db.on("ready", () => {
          // First, check if this is the very first time we connect to given URL.
          // Need to know, because if it is, we should stall the promise returned to
          // db.on('ready') to not be fulfilled until the initial sync has succeeded.
          return db._syncNodes.get({url}, node => {
            // Ok, now we know whether we should await the connect promise or not.
            // No matter, we should now connect (will maybe create the SyncNode instance
            // representing the given URL)
            let connectPromise = db.syncable.connect(protocolName, url, options);
            connectPromise.then(resolve, reject);// Resolve the returned promise when connected.
            // Ok, so let's see if we should suspend DB queries until connected or not:
            if (node && node.appliedRemoteRevision) {
              // The very first initial sync has been done so we need not wait
              // for the connect promise to complete. It can continue in background.
              // Returning here will resume db.on('ready') and resume all queries that
              // the application has put to the database.
              return;
            }
            // This was the very first time we connect to the remote server,
            // we must make sure that the initial sync request succeeeds before resuming
            // database queries that the application code puts onto the database.
            // If OFFLINE or other error, don't allow the application to proceed.
            // We are assuming that an initial sync is essential for the application to
            // function correctly.
            return connectPromise;
          });
        });
        // Force open() to happen. Otherwise connect() may stall forever.
        db.open().catch(ex => {
          // If open fails, db.on('ready') may not have been called and we must
          // reject promise with InvalidStateError
          reject(new Dexie.InvalidStateError(
              `Dexie.Syncable: Couldn't connect. Database failed to open`,
              ex
          ));
        });
      });
      return promise;
    }
  };
}
