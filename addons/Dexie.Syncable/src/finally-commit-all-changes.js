import Dexie from 'dexie';
import initApplyChanges from './apply-changes';

export default function initFinallyCommitAllChanges(db, node) {
  const applyChanges = initApplyChanges(db);

  return function finallyCommitAllChanges(changes, remoteRevision) {
    // 1. Open a write transaction on all tables in DB
    const tablesToIncludeInTrans = db.tables.filter(table => table.name === '_changes' ||
      table.name === '_uncommittedChanges' ||
      table.schema.observable);

    return db.transaction('rw!', tablesToIncludeInTrans, () => {
      var trans = Dexie.currentTransaction;
      var localRevisionBeforeChanges = 0;
      return db._changes.orderBy('rev').last(function (lastChange) {
        // Store what revision we were at before committing the changes
        localRevisionBeforeChanges = (lastChange && lastChange.rev) || 0;
      }).then(() => {
        // Specify the source. Important for the change consumer to ignore changes originated from self!
        trans.source = node.id;
        // 2. Apply uncommitted changes and delete each uncommitted change
        return db._uncommittedChanges.where('node').equals(node.id).toArray();
      }).then(function (uncommittedChanges) {
        return applyChanges(uncommittedChanges, 0);
      }).then(function () {
        return db._uncommittedChanges.where('node').equals(node.id).delete();
      }).then(function () {
        // 3. Apply last chunk of changes
        return applyChanges(changes, 0);
      }).then(function () {
        // Get what revision we are at now:
        return db._changes.orderBy('rev').last();
      }).then(function (lastChange) {
        var currentLocalRevision = (lastChange && lastChange.rev) || 0;
        // 4. Update node states (appliedRemoteRevision, remoteBaseRevisions and eventually myRevision)
        node.appliedRemoteRevision = remoteRevision;
        node.remoteBaseRevisions.push({remote: remoteRevision, local: currentLocalRevision});
        if (node.myRevision === localRevisionBeforeChanges) {
          // If server was up-to-date before we added new changes from the server, update myRevision to last change
          // because server is still up-to-date! This is also important in order to prohibit getLocalChangesForNode() from
          // ever sending an empty change list to server, which would otherwise be done every second time it would send changes.
          node.myRevision = currentLocalRevision;
        }
        // Garbage collect remoteBaseRevisions not in use anymore:
        if (node.remoteBaseRevisions.length > 1) {
          for (var i = node.remoteBaseRevisions.length - 1; i > 0; --i) {
            if (node.myRevision >= node.remoteBaseRevisions[i].local) {
              node.remoteBaseRevisions.splice(0, i);
              break;
            }
          }
        }
        // We are not including _syncNodes in transaction, so this save() call will execute in its own transaction.
        node.save().catch(err=> {
          console.warn("Dexie.Syncable: Unable to save SyncNode after applying remote changes: " + (err.stack || err));
        });
      });
    });
  };
}
