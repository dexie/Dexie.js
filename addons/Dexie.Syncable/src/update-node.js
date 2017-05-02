import Dexie from 'dexie';

export default function initUpdateNode(db) {

    /**
     * Always update a sync node atomically instead of node.save() that was
     * used before - it relied on that the current memory version of the node
     * was accurate. This function will always rely on the database. It also
     * makes sure to never downgrade a local revision (could happen before in
     * case two syncers were simultanously active in different tabs/workers and
     * one has to wait for locking the transaction while the other has newer rev
     * saved already.
     * 
     * @param nodeId {number} Primary key of the node to update
     * @param changes properties to change on the node
     */
    return function updateNode (node, changes) {
        const nodeId = node.id;
        // As the framework still keeps a local version (should only rely on db version in future),
        // we make sure the local version is updated eagerly to reflect the changes optimistically
        Object.keys(changes).forEach(keyPath =>
            modifyNodeProperty(node, keyPath, changes[keyPath]));
        return db.transaction('rw?', db._syncNodes, () => {
            return db._syncNodes.get(nodeId).then(node => {
                if (!node) return;
                // Now also perform the atomic transaction of the changes.
                // (only use this part in future)
                Object.keys(changes).forEach(keyPath =>
                    modifyNodeProperty(node, keyPath, changes[keyPath]));
                return db._syncNodes.put(node);
            });
        }).catch('DatabaseClosedError', ()=>{});
    }

    function modifyNodeProperty (node, keyPath, value) {
        switch (keyPath) {
            case "myRevision":
                // Handle special: Never downgrade local revision
                node.myRevision = isNaN(node.myRevision) ?
                    value :
                    Math.max(value, node.myRevision);
                break;
            case "add_remoteBaseRevisions":
                // Handle special: Push to existing array!
                node.remoteBaseRevisions = node.remoteBaseRevisions || [];
                node.remoteBaseRevisions.push(value);
                break;
            default:
                Dexie.setByKeyPath(node, keyPath, value);
                break;
        }
        // Garbage collect remoteBaseRevisions not in use anymore:
        if (node.remoteBaseRevisions && node.remoteBaseRevisions.length > 1) {
            for (var i = node.remoteBaseRevisions.length - 1; i > 0; --i) {
                if (node.myRevision >= node.remoteBaseRevisions[i].local) {
                    node.remoteBaseRevisions.splice(0, i);
                    break;
                }
            }
        }
    }
}
