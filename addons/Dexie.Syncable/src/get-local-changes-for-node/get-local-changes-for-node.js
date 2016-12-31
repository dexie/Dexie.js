import Dexie from 'dexie';

import getBaseRevisionAndMaxClientRevision from './get-base-revision-and-max-client-revision';
import initGetChangesSinceRevision from './get-changes-since-revision';
import initGetTableObjectsAsChanges from './get-table-objects-as-changes';

export default function initGetLocalChangesForNode(db, hasMoreToGive, partialsThreshold) {
  var MAX_CHANGES_PER_CHUNK = partialsThreshold;

  return function getLocalChangesForNode(node, cb) {
    /// <summary>
    ///     Based on given node's current revision and state, this function makes sure to retrieve next chunk of changes
    ///     for that node.
    /// </summary>
    /// <param name="node"></param>
    /// <param name="cb" value="function(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {}">Callback that will retrieve next chunk of changes and a boolean telling if it's a partial result or not. If truthy, result is partial and there are more changes to come. If falsy, these changes are the final result.</param>

    const getChangesSinceRevision = initGetChangesSinceRevision(db, node, hasMoreToGive);
    const getTableObjectsAsChanges = initGetTableObjectsAsChanges(db, node, MAX_CHANGES_PER_CHUNK, getChangesSinceRevision, hasMoreToGive, cb);

    // Only a "remote" SyncNode created by Dexie.Syncable
    // could not pass this test (remote nodes have myRevision: -1 on instantiation)
    if (node.myRevision >= 0) {
      // Node is based on a revision in our local database and will just need to get the changes that have occurred since that revision.
      var brmcr = getBaseRevisionAndMaxClientRevision(node);
      return getChangesSinceRevision(node.myRevision, MAX_CHANGES_PER_CHUNK, brmcr.maxClientRevision, function (changes, partial, nodeModificationsOnAck) {
        return cb(changes, brmcr.remoteBaseRevision, partial, nodeModificationsOnAck);
      });
    } else {
      // Node hasn't got anything from our local database yet. We will need to upload the entire DB to the node in the form of CREATE changes.
      // Check if we're in the middle of already doing that:
      if (node.dbUploadState === null) {
        // Initialize dbUploadState
        var tablesToUpload = db.tables.filter(function (table) {
          return table.schema.observable;
        }).map(function (table) {
          return table.name;
        });
        if (tablesToUpload.length === 0) return Dexie.Promise.resolve(cb([], null, false, {})); // There are no synced tables at all.
        var dbUploadState = {
          tablesToUpload: tablesToUpload,
          currentTable: tablesToUpload.shift(),
          currentKey: null
        };
        return db._changes.orderBy('rev').last(function (lastChange) {
          dbUploadState.localBaseRevision = (lastChange && lastChange.rev) || 0;
          var collection = db.table(dbUploadState.currentTable).orderBy(':id');
          return getTableObjectsAsChanges(dbUploadState, [], collection);
        });
      } else if (node.dbUploadState.currentKey) {
        const collection = db.table(node.dbUploadState.currentTable).where(':id').above(node.dbUploadState.currentKey);
        return getTableObjectsAsChanges(Dexie.deepClone(node.dbUploadState), [], collection);
      } else {
        const collection = db.table(dbUploadState.currentTable).orderBy(':id');
        return getTableObjectsAsChanges(Dexie.deepClone(node.dbUploadState), [], collection);
      }
    }
  };
}
