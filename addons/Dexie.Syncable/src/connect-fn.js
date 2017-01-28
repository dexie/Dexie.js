import Dexie from 'dexie';

import initGetOrCreateSyncNode from './get-or-create-sync-node';
import initConnectProtocol from './connect-protocol';
import {Statuses} from './statuses';

export default function initConnectFn(db, activePeers) {
  return function connect(protocolInstance, protocolName, url, options, dbAliveID) {
    /// <param name="protocolInstance" type="ISyncProtocol"></param>
    var existingPeer = activePeers.filter(function (peer) {
      return peer.url === url;
    });
    if (existingPeer.length > 0) {
      const activePeer = existingPeer[0];
      const diffObject = {};
      Dexie.getObjectDiff(activePeer.syncOptions, options, diffObject);
      // Options have been changed
      // We need to disconnect and reconnect
      if (Object.keys(diffObject).length !== 0) {
        return db.syncable.disconnect(url)
          .then(() => {
            return execConnect();
          })
      } else {
        // Never create multiple syncNodes with same protocolName and url. Instead, let the next call to connect() return the same promise that
        // have already been started and eventually also resolved. If promise has already resolved (node connected), calling existing promise.then() will give a callback directly.
        return existingPeer[0].connectPromise;
      }
    }

    function execConnect() {
      // Use an object otherwise we wouldn't be able to get the reject promise from
      // connectProtocol
      var rejectConnectPromise = {p: null};
      const connectProtocol = initConnectProtocol(db, protocolInstance, dbAliveID, options, rejectConnectPromise);
      const getOrCreateSyncNode = initGetOrCreateSyncNode(db, protocolName, url);
      var connectPromise = getOrCreateSyncNode(options).then(function (node) {
        return connectProtocol(node, activePeer);
      });

      var disconnected = false;
      var activePeer = {
        url: url,
        status: Statuses.OFFLINE,
        connectPromise: connectPromise,
        syncOptions: options,
        on: Dexie.Events(null, "disconnect"),
        disconnect: function (newStatus, error) {
          var pos = activePeers.indexOf(activePeer);
          if (pos >= 0) activePeers.splice(pos, 1);
          if (error && rejectConnectPromise.p) rejectConnectPromise.p(error);
          if (!disconnected) {
            activePeer.on.disconnect.fire(newStatus, error);
          }
          disconnected = true;
        }
      };
      activePeers.push(activePeer);

      return connectPromise;
    }

    return execConnect();
  };
}
