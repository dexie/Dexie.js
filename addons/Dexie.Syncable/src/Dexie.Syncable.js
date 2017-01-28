/* ========================================================================== 
 *                           dexie-syncable.js
 * ==========================================================================
 *
 * Dexie addon for syncing indexedDB with remote endpoints.
 *
 * By David Fahlander, david.fahlander@gmail.com,
 *    Nikolas Poniros, https://github.com/nponiros
 *
 * ==========================================================================
 *
 * Version {version}, {date}
 *
 * http://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 * 
 */

import Dexie from "dexie";
// Depend on 'dexie-observable'
// To support both ES6,AMD,CJS and UMD (plain script), we just import it and then access it as "Dexie.Observable".
// That way, our plugin works in all UMD cases.
// If target platform would only be module based (ES6/AMD/CJS), we could have done 'import Observable from "dexie-observable"'.
import "dexie-observable";

import initSyncableConnect from './syncable-connect';
import initConnectFn from './connect-fn';
import {Statuses, StatusTexts} from './statuses';

var override = Dexie.override,
    Promise = Dexie.Promise,
    Observable = Dexie.Observable;

export default function Syncable (db) {
    /// <param name="db" type="Dexie"></param>

    var activePeers = [];

    const connectFn = initConnectFn(db, activePeers);
    const syncableConnect = initSyncableConnect(db, connectFn);

    db.on('message', function(msg) {
        // Message from other local node arrives...
        Dexie.vip(function() {
            if (msg.type === 'connect') {
                // We are master node and another non-master node wants us to do the connect.
                db.syncable.connect(msg.message.protocolName, msg.message.url, msg.message.options).then(msg.resolve, msg.reject);
            } else if (msg.type === 'disconnect') {
                db.syncable.disconnect(msg.message.url).then(msg.resolve, msg.reject);
            } else if (msg.type === 'syncStatusChanged') {
                // We are client and a master node informs us about syncStatus change.
                // Lookup the connectedProvider and call its event
                db.syncable.on.statusChanged.fire(msg.message.newStatus, msg.message.url);
            }
        });
    });

    db.on('cleanup', function(weBecameMaster) {
        // A cleanup (done in Dexie.Observable) may result in that a master node is removed and we become master.
        if (weBecameMaster) {
            // We took over the master role in Observable's cleanup method.
            // We should connect to remote servers now.
            // At this point, also reconnect servers with status ERROR_WILL_RETRY as well as plain ERROR.
            // Reason to reconnect to those with plain "ERROR" is that the ERROR state may occur when a database
            // connection has been closed. The new master would then be expected to reconnect.
            // Also, this is not an infinite poll(). This is rare event that a new browser tab takes over from
            // an old closed one. 
            Dexie.ignoreTransaction(()=>Dexie.vip(()=>{
                return db._syncNodes.where({type: 'remote'})
                    .filter(node => node.status !== Statuses.OFFLINE)
                    .toArray(connectedRemoteNodes => Promise.all(connectedRemoteNodes.map(node => 
                        db.syncable.connect(node.syncProtocol, node.url, node.syncOptions).catch(e => {
                            console.warn(`Dexie.Syncable: Could not connect to ${node.url}. ${e.stack || e}`);
                        })
                    )));
            })).catch('DatabaseClosedError', ()=>{});
        }
    });

    // "ready" subscriber for the master node that makes sure it will always connect to sync server
    // when the database opens. It will not wait for the connection to complete, just initiate the
    // connection so that it will continue syncing as long as the database is open.

    // Dexie.Observable's 'ready' subscriber will have been invoked prior to this, making sure
    // that db._localSyncNode exists and persisted before this subscriber kicks in.
    db.on('ready', function onReady() {
        // Again, in onReady: If we ARE master, make sure to connect to remote servers that is in a connected state.
        if (db._localSyncNode && db._localSyncNode.isMaster) {
            // Make sure to connect to remote servers that is in a connected state (NOT OFFLINE or ERROR!)
            // This "ready" subscriber will never be the one performing the initial sync request, because
            // even after calling db.syncable.connect(), there won't exist any "remote" sync node yet.
            // Instead, db.syncable.connect() will subscribe to "ready" also, and that subscriber will be
            // called after this one. There, in that subscriber, the initial sync request will take place
            // and the "remote" node will be created so that this "ready" subscriber can auto-connect the
            // next time this database is opened.
            // CONCLUSION: We can always assume that the local DB has been in sync with the server at least
            // once in the past for each "connectedRemoteNode" we find in query below.

            // Don't halt db.ready while connecting (i.e. we do not return a promise here!)
            db._syncNodes
                .where('type').equals('remote')
                .and(node => node.status !== Statuses.OFFLINE)
                .toArray(connectedRemoteNodes => {
                    // There are connected remote nodes that we must manage (or take over to manage)
                    connectedRemoteNodes.forEach(
                            node => db.syncable.connect(
                                node.syncProtocol,
                                node.url,
                                node.syncOptions)     
                            .catch (()=>{}) // A failure will be triggered in on('statusChanged'). We can ignore.
                    );
                }).catch('DatabaseClosedError', ()=>{});
        }
    }, true); // True means the ready event will survive a db reopen - db.close()/db.open()

    db.syncable = {};

    db.syncable.getStatus = function(url, cb) {
        if (db.isOpen()) {
            return Dexie.vip(function() {
                return db._syncNodes.where('url').equals(url).first(function(node) {
                    return node ? node.status : Statuses.OFFLINE;
                });
            }).then(cb);
        } else {
            return Promise.resolve(Syncable.Statuses.OFFLINE).then(cb);
        }
    };

    db.syncable.getOptions = function(url, cb) {
        return db.transaction('r?', db._syncNodes, () => {
            return db._syncNodes.where('url').equals(url).first(function(node) {
                return node.syncOptions;
            }).then(cb);
        });
    };

    db.syncable.list = function() {
        return db.transaction('r?', db._syncNodes, ()=>{
            return db._syncNodes.where('type').equals('remote').toArray(function(a) {
                return a.map(function(node) { return node.url; });
            });
        });
    };

    db.syncable.on = Dexie.Events(db, { statusChanged: "asap" });

    db.syncable.disconnect = function(url) {
        return Dexie.ignoreTransaction(()=>{
            return Promise.resolve().then(()=>{
                if (db._localSyncNode && db._localSyncNode.isMaster) {
                    return Promise.all(activePeers.filter(peer => peer.url === url).map(peer => {
                        return peer.disconnect(Statuses.OFFLINE);
                    }));
                } else {
                    return db._syncNodes.where('isMaster').above(0).first(masterNode => {
                        return db.observable.sendMessage('disconnect', { url: url }, masterNode.id, {wantReply: true});
                    });
                }
            }).then(()=>{
                return db._syncNodes.where("url").equals(url).modify(node => {
                    node.status = Statuses.OFFLINE;
                });
            });
        });
    };

    db.syncable.connect = function(protocolName, url, options) {
        options = options || {}; // Make sure options is always an object because 1) Provider expects it to be. 2) We'll be persisting it and you cannot persist undefined.
        var protocolInstance = Syncable.registeredProtocols[protocolName];
        if (protocolInstance) {
            return syncableConnect(protocolInstance, protocolName, url, options);
        } else {
            return Promise.reject(
                new Error("ISyncProtocol '" + protocolName + "' is not registered in Dexie.Syncable.registerSyncProtocol()")
            );
        }
    };

    db.syncable.delete = function(url) {
        return db.syncable.disconnect(url).then(()=>{
            return db.transaction('rw!', db._syncNodes, db._changes, db._uncommittedChanges, ()=>{
                // Find the node(s)
                // Several can be found, as detected by @martindiphoorn,
                // let's delete them and cleanup _uncommittedChanges and _changes 
                // accordingly.
                let nodeIDsToDelete;
                return db._syncNodes
                    .where("url").equals(url)
                    .toArray(nodes => nodes.map(node => node.id))
                    .then(nodeIDs => {
                        nodeIDsToDelete = nodeIDs;
                        // Delete the syncNode that represents the remote endpoint.
                        return db._syncNodes.where('id').anyOf(nodeIDs).delete()
                    })
                    .then (() =>
                        // In case there were uncommittedChanges belonging to this, delete them as well
                        db._uncommittedChanges.where('node').anyOf(nodeIDsToDelete).delete());
            }).then(()=> {
                // Spawn background job to delete old changes, now that a node has been deleted,
                // there might be changes in _changes table that is not needed to keep anymore.
                // This is done in its own transaction, or possible several transaction to prohibit
                // starvation
                Observable.deleteOldChanges(db);
            });
        });
    };

    db.syncable.unsyncedChanges = function(url) {
        return db._syncNodes.where("url").equals(url).first(function(node) {
            return db._changes.where('rev').above(node.myRevision).toArray();
        });
    };

    db.close = override(db.close, function(origClose) {
        return function() {
            activePeers.forEach(function(peer) {
                peer.disconnect();
            });
            return origClose.apply(this, arguments);
        };
    });

    Object.defineProperty(
        db.observable.SyncNode.prototype,
        'save', {
            enumerable: false,
            configurable: true,
            writable: true,
            value() {
                return db.transaction('rw?', db._syncNodes, () => {
                    return db._syncNodes.put(this);
            });
        }
     });
}

Syncable.Statuses = Statuses;

Syncable.StatusTexts = StatusTexts;

Syncable.registeredProtocols = {}; // Map<String,ISyncProviderFactory> when key is the provider name.

Syncable.registerSyncProtocol = function(name, protocolInstance) {
    /// <summary>
    ///    Register a synchronization protocol that can synchronize databases with remote servers.
    /// </summary>
    /// <param name="name" type="String">Provider name</param>
    /// <param name="protocolInstance" type="ISyncProtocol">Implementation of ISyncProtocol</param>
    const partialsThreshold = protocolInstance.partialsThreshold;
    if (typeof partialsThreshold === 'number') {
        // Don't allow NaN or negative threshold
        if (isNaN(partialsThreshold) || partialsThreshold < 0) {
            throw new Error('The given number for the threshold is not supported');
        }
        // If the threshold is 0 we will not send any client changes but will get server changes
    } else {
        // Use Infinity as the default so simple protocols don't have to care about partial synchronization
        protocolInstance.partialsThreshold = Infinity;
    }
    Syncable.registeredProtocols[name] = protocolInstance;
};

// Register addon in Dexie:
Dexie.Syncable = Syncable;
Dexie.addons.push(Syncable);
