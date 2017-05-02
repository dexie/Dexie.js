import Dexie from 'dexie';
import initApplyChanges from './apply-changes';
import initUpdateNode from './update-node';

export default function initFinallyCommitAllChanges(db, node) {
  const applyChanges = initApplyChanges(db);
  const updateNode = initUpdateNode(db);

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
        return applyChanges(uncommittedChanges);
      }).then(function () {
        return db._uncommittedChanges.where('node').equals(node.id).delete();
      }).then(function () {
        // 3. Apply last chunk of changes
        return applyChanges(changes);
      }).then(function () {
        // Get what revision we are at now:
        return db._changes.orderBy('rev').last();
      }).then(function (lastChange) {
        var currentLocalRevision = (lastChange && lastChange.rev) || 0;
        // 4. Update node states (appliedRemoteRevision, remoteBaseRevisions and eventually myRevision)
        var nodeUpdates = {
          appliedRemoteRevision: remoteRevision,
          add_remoteBaseRevisions: {remote: remoteRevision, local: currentLocalRevision},
        };
        if (node.myRevision === localRevisionBeforeChanges) {
          // If server was up-to-date before we added new changes from the server, update myRevision to last change
          // because server is still up-to-date! This is also important in order to prohibit getLocalChangesForNode() from
          // ever sending an empty change list to server, which would otherwise be done every second time it would send changes.
          nodeUpdates.myRevision = currentLocalRevision;
        }
        updateNode(node, nodeUpdates).catch(err=> {
          console.warn("Dexie.Syncable: Unable to save SyncNode after applying remote changes: " + (err.stack || err));
        });
      });
    });
  };
}
