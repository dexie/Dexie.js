export default function getBaseRevisionAndMaxClientRevision(node) {
  /// <param name="node" type="db.observable.SyncNode"></param>
  if (node.remoteBaseRevisions.length === 0)
    return {
      // No remoteBaseRevisions have arrived yet. No limit on clientRevision and provide null as remoteBaseRevision:
      maxClientRevision: Infinity,
      remoteBaseRevision: null
    };
  for (var i = node.remoteBaseRevisions.length - 1; i >= 0; --i) {
    if (node.myRevision >= node.remoteBaseRevisions[i].local) {
      // Found a remoteBaseRevision that fits node.myRevision. Return remoteBaseRevision and eventually a roof maxClientRevision pointing out where next remoteBaseRevision bases its changes on.
      return {
        maxClientRevision: i === node.remoteBaseRevisions.length - 1 ? Infinity : node.remoteBaseRevisions[i + 1].local,
        remoteBaseRevision: node.remoteBaseRevisions[i].remote
      };
    }
  }
  // There are at least one item in the list but the server hasn't yet become up-to-date with the 0 revision from client.
  return {
    maxClientRevision: node.remoteBaseRevisions[0].local,
    remoteBaseRevision: null
  };
}
