export default function initSaveToUncommittedChanges(db, node) {
  return function saveToUncommittedChanges(changes, remoteRevision) {
    return db.transaction('rw!', db._uncommittedChanges, () => {
      return db._uncommittedChanges.bulkAdd(changes.map(change => {
        let changeWithNodeId = {
          node: node.id,
          type: change.type,
          table: change.table,
          key: change.key
        };
        if (change.obj) changeWithNodeId.obj = change.obj;
        if (change.mods) changeWithNodeId.mods = change.mods;
        return changeWithNodeId;
      }));
    }).then(() => {
      node.appliedRemoteRevision = remoteRevision;
      return node.save();
    });
  };
}
