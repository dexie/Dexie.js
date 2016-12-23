/// <reference path="../../../dist/dexie.js" />
/// <reference path="../../Dexie.Observable/dist/dexie-observable.js" />
/// <reference path="../Dexie.Syncable.SyncProtocolAPI.js" />
/**
 * Dexie.Syncable.js
 * ===================
 * Dexie addon for syncing indexedDB with remote endpoints.
 *
 * version: {version} Alpha, {date}
 *
 * Disclaimber: This addon is in alpha status meaning that
 * its API and behavior may change.
 *
 */

import Dexie from "dexie";
// Depend on 'dexie-observable'
// To support both ES6,AMD,CJS and UMD (plain script), we just import it and then access it as "Dexie.Observable".
// That way, our plugin works in all UMD cases.
// If target platform would only be module based (ES6/AMD/CJS), we could have done 'import Observable from "dexie-observable"'.
import "dexie-observable";

import initGetOrCreateSyncNode from './get-or-create-sync-node';
import initEnqueue from './enqueue';
import initSaveToUncommittedChanges from './save-to-uncommitted-changes';
import initFinallyCommitAllChanges from './finally-commit-all-changes';
import initGetLocalChangesForNode from './get-local-changes-for-node/get-local-changes-for-node';
import initSyncableConnect from './syncable-connect';

var override = Dexie.override,
    Promise = Dexie.Promise,
    Observable = Dexie.Observable;

export default function Syncable (db) {
    /// <param name="db" type="Dexie"></param>

    const enqueue = initEnqueue(db);
    const syncableConnect = initSyncableConnect(db, connect);

    var activePeers = [];

    // Statuses
    var Statuses = Syncable.Statuses;

    db.on('message', function(msg) {
        // Message from other local node arrives...
        Dexie.vip(function() {
            if (msg.type === 'connect') {
                // We are master node and another non-master node wants us to do the connect.
                db.syncable.connect(msg.protocolName, msg.url, msg.options).then(msg.resolve, msg.reject);
            } else if (msg.type === 'disconnect') {
                db.syncable.disconnect(msg.url).then(msg.resolve, msg.reject);
            } else if (msg.type === 'syncStatusChanged') {
                // We are client and a master node informs us about syncStatus change.
                // Lookup the connectedProvider and call its event
                db.syncable.on.statusChanged.fire(msg.newStatus, msg.url);
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
                        return db.sendMessage('disconnect', { url: url }, masterNode.id, {wantReply: true});
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
                Observable.deleteOldChanges();
            });
        });
    };

    db.syncable.unsyncedChanges = function(url) {
        return db._syncNodes.where("url").equals(url).first(function(node) {
            return db._changes.where('rev').above(node.myRevision).toArray();
        });
    };

    function connect(protocolInstance, protocolName, url, options, dbAliveID) {
        /// <param name="protocolInstance" type="ISyncProtocol"></param>
        var existingPeer = activePeers.filter(function(peer) { return peer.url === url; });
        if (existingPeer.length > 0) {
            // Never create multiple syncNodes with same protocolName and url. Instead, let the next call to connect() return the same promise that
            // have already been started and eventually also resolved. If promise has already resolved (node connected), calling existing promise.then() will give a callback directly.
            return existingPeer[0].connectPromise;
        }

        const getOrCreateSyncNode = initGetOrCreateSyncNode(db, protocolName, url);
        var connectPromise = getOrCreateSyncNode(options).then(function(node) {
            return connectProtocol(node);
        });

        var rejectConnectPromise = null;
        var disconnected = false;
        var hasMoreToGive = { hasMoreToGive: true };
        var activePeer = {
            url: url,
            status: Statuses.OFFLINE,
            connectPromise: connectPromise,
            on: Dexie.Events(null, "disconnect"),
            disconnect: function(newStatus, error) {
                var pos = activePeers.indexOf(activePeer);
                if (pos >= 0) activePeers.splice(pos, 1);
                if (error && rejectConnectPromise) rejectConnectPromise(error);
                if (!disconnected) {
                    activePeer.on.disconnect.fire(newStatus, error);
                }
                disconnected = true;
            }
        };
        activePeers.push(activePeer);

        return connectPromise;

        function stillAlive() {
            // A better method than doing db.isOpen() because the same db instance may have been reopened, but then this sync call should be dead
            // because the new instance should be considered a fresh instance and will have another local node.
            return db._localSyncNode && db._localSyncNode.id === dbAliveID;
        }

        function connectProtocol(node) {
            /// <param name="node" type="db.observable.SyncNode"></param>
            const getLocalChangesForNode = initGetLocalChangesForNode(db, hasMoreToGive);

            function changeStatusTo(newStatus) {
                if (node.status !== newStatus) {
                    node.status = newStatus;
                    node.save().then(()=>{
                        db.syncable.on.statusChanged.fire(newStatus, url);
                        // Also broadcast message to other nodes about the status
                        db.broadcastMessage("syncStatusChanged", { newStatus: newStatus, url: url }, false);
                    }).catch('DatabaseClosedError', ()=>{});                    
                }
            }

            activePeer.on('disconnect', function(newStatus) {
                if (!isNaN(newStatus)) changeStatusTo(newStatus);
            });

            var connectedContinuation;
            changeStatusTo(Statuses.CONNECTING);
            return doSync();

            function doSync() {
                // Use enqueue() to ensure only a single promise execution at a time.
                return enqueue(doSync, function() {
                    // By returning the Promise returned by getLocalChangesForNode() a final catch() on the sync() method will also catch error occurring in entire sequence.
                    return getLocalChangesForNode_autoAckIfEmpty(node, sendChangesToProvider);
                }, dbAliveID);
            }

            function sendChangesToProvider(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                // Create a final Promise for the entire sync() operation that will resolve when provider calls onSuccess().
                // By creating finalPromise before calling protocolInstance.sync() it is possible for provider to call onError() immediately if it wants.
                var finalSyncPromise = new Promise(function(resolve, reject) {
                    rejectConnectPromise = function(err) {
                        reject(err);
                    };
                    Dexie.asap(function() {
                        try {
                            protocolInstance.sync(
                                node.syncContext,
                                url,
                                options,
                                remoteBaseRevision,
                                node.appliedRemoteRevision,
                                changes,
                                partial,
                                applyRemoteChanges,
                                onChangesAccepted,
                                function(continuation) {
                                    resolve(continuation);
                                },
                                onError);
                        } catch (ex) {
                            onError(ex, Infinity);
                        }

                        function onError(error, again) {
                            reject(error);
                            if (stillAlive()) {
                                if (!isNaN(again) && again < Infinity) {
                                    setTimeout(function() {
                                        if (stillAlive()) {
                                            changeStatusTo(Statuses.SYNCING);
                                            doSync().catch('DatabaseClosedError', abortTheProvider);
                                        }
                                    }, again);
                                    changeStatusTo(Statuses.ERROR_WILL_RETRY, error);
                                    if (connectedContinuation && connectedContinuation.disconnect) connectedContinuation.disconnect();
                                    connectedContinuation = null;
                                } else {
                                    abortTheProvider(error); // Will fire ERROR on statusChanged event.
                                }
                            }
                        }
                    });
                });

                return finalSyncPromise.then(function() {
                    // Resolve caller of db.syncable.connect() with undefined. Not with continuation!
                    return undefined;
                }).finally(()=>{
                    // In case error happens after connect, don't try reject the connect promise anymore.
                    // This is important. A Dexie unit test that verifies unhandled rejections will fail when Dexie.Syncable addon
                    // is active and this happens. It would fire unhandledrejection but that we do not want.
                    rejectConnectPromise = null;
                });

                function onChangesAccepted() {
                    Object.keys(nodeModificationsOnAck).forEach(function(keyPath) {
                        Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                    });
                    // We dont know if onSuccess() was called by provider yet. If it's already called, finalPromise.then() will execute immediately,
                    // otherwise it will execute when finalSyncPromise resolves.
                    finalSyncPromise.then(continueSendingChanges);
                    return node.save();
                }
            }

            function abortTheProvider(error) {
                activePeer.disconnect(Statuses.ERROR, error);
            }

            function getLocalChangesForNode_autoAckIfEmpty(node, cb) {
                return getLocalChangesForNode(node, function autoAck(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                    if (changes.length === 0 && 'myRevision' in nodeModificationsOnAck && nodeModificationsOnAck.myRevision !== node.myRevision) {
                        Object.keys(nodeModificationsOnAck).forEach(function(keyPath) {
                            Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                        });
                        node.save().catch('DatabaseClosedError', ()=>{});
                        return getLocalChangesForNode(node, autoAck);
                    } else {
                        return cb(changes, remoteBaseRevision, partial, nodeModificationsOnAck);
                    }
                });
            }

            function applyRemoteChanges(remoteChanges, remoteRevision, partial/*, clear*/) {
                const saveToUncommittedChanges = initSaveToUncommittedChanges(db, node);
                const finallyCommitAllChanges = initFinallyCommitAllChanges(db, node);

                return enqueue(applyRemoteChanges, function() {
                    if (!stillAlive()) return Promise.reject(new Dexie.DatabaseClosedError());
                    // FIXTHIS: Check what to do if clear() is true!
                    return (partial ? saveToUncommittedChanges(remoteChanges, remoteRevision) : finallyCommitAllChanges(remoteChanges, remoteRevision))
                        .catch(function(error) {
                            abortTheProvider(error);
                            return Promise.reject(error);
                        });
                }, dbAliveID);
            }

            //
            //
            //  Continuation Patterns Follows
            //
            //

            function continueSendingChanges(continuation) {
                if (!stillAlive()) { // Database was closed.
                    if (continuation.disconnect)
                        continuation.disconnect();
                    return;
                }

                connectedContinuation = continuation;
                activePeer.on('disconnect', function() {
                    if (connectedContinuation) {
                        if (connectedContinuation.react) {
                            try {
                                // react pattern must provide a disconnect function.
                                connectedContinuation.disconnect();
                            } catch (e) {
                            }
                        }
                        connectedContinuation = null; // Stop poll() pattern from polling again and abortTheProvider() from being called twice.
                    }
                });

                if (continuation.react) {
                    continueUsingReactPattern(continuation);
                } else {
                    continueUsingPollPattern(continuation);
                }
            }

            //  React Pattern (eager)
            function continueUsingReactPattern(continuation) {
                var changesWaiting, // Boolean
                    isWaitingForServer; // Boolean


                function onChanges() {
                    if (connectedContinuation) {
                        changeStatusTo(Statuses.SYNCING);
                        if (isWaitingForServer)
                            changesWaiting = true;
                        else {
                            reactToChanges();
                        }
                    }
                }

                db.on('changes', onChanges);

                activePeer.on('disconnect', function() {
                    db.on.changes.unsubscribe(onChanges);
                });

                function reactToChanges() {
                    if (!connectedContinuation) return;
                    changesWaiting = false;
                    isWaitingForServer = true;
                    getLocalChangesForNode_autoAckIfEmpty(node, function(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                        if (!connectedContinuation) return;
                        if (changes.length > 0) {
                            continuation.react(changes, remoteBaseRevision, partial, function onChangesAccepted() {
                                Object.keys(nodeModificationsOnAck).forEach(function(keyPath) {
                                    Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                                });
                                node.save().catch('DatabaseClosedError', ()=>{});
                                // More changes may be waiting:
                                reactToChanges();
                            });
                        } else {
                            isWaitingForServer = false;
                            if (changesWaiting) {
                                // A change jumped in between the time-spot of quering _changes and getting called back with zero changes.
                                // This is an expreemely rare scenario, and eventually impossible. But need to be here because it could happen in theory.
                                reactToChanges();
                            } else {
                                changeStatusTo(Statuses.ONLINE);
                            }
                        }
                    }).catch(ex => {
                        console.error(`Got ${ex.message} caught by reactToChanges`);
                        abortTheProvider(ex);
                    });
                }

                reactToChanges();
            }

            //  Poll Pattern
            function continueUsingPollPattern() {

                function syncAgain() {
                    getLocalChangesForNode_autoAckIfEmpty(node, function(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {

                        protocolInstance.sync(node.syncContext, url, options, remoteBaseRevision, node.appliedRemoteRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError);

                        function onChangesAccepted() {
                            Object.keys(nodeModificationsOnAck).forEach(function(keyPath) {
                                Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                            });
                            node.save().catch('DatabaseClosedError', ()=>{});
                        }

                        function onSuccess(continuation) {
                            if (!connectedContinuation) {
                                // Got disconnected before succeeding. Quit.
                                return;
                            }
                            connectedContinuation = continuation;
                            if (partial) {
                                // We only sent partial changes. Need to do another round asap.
                                syncAgain();
                            } else {
                                // We've sent all changes now (in sync!)
                                if (!isNaN(continuation.again) && continuation.again < Infinity) {
                                    // Provider wants to keep polling. Set Status to ONLINE.
                                    changeStatusTo(Statuses.ONLINE);
                                    setTimeout(function() {
                                        if (connectedContinuation) {
                                            changeStatusTo(Statuses.SYNCING);
                                            syncAgain();
                                        }
                                    }, continuation.again);
                                } else {
                                    // Provider seems finished polling. Since we are never going to poll again,
                                    // disconnect provider and set status to OFFLINE until another call to db.syncable.connect().
                                    activePeer.disconnect(Statuses.OFFLINE);
                                }
                            }
                        }

                        function onError(error, again) {
                            if (!isNaN(again) && again < Infinity) {
                                if (connectedContinuation) {
                                    setTimeout(function() {
                                        if (connectedContinuation) {
                                            changeStatusTo(Statuses.SYNCING);
                                            syncAgain();
                                        }
                                    }, again);
                                    changeStatusTo(Statuses.ERROR_WILL_RETRY);
                                } // else status is already changed since we got disconnected.
                            } else {
                                abortTheProvider(error); // Will fire ERROR on onStatusChanged.
                            }
                        }
                    }).catch(abortTheProvider);
                }

                if (hasMoreToGive.hasMoreToGive) {
                    syncAgain();
                } else if (connectedContinuation && !isNaN(connectedContinuation.again) && connectedContinuation.again < Infinity) {
                    changeStatusTo(Statuses.ONLINE);
                    setTimeout(function() {
                        if (connectedContinuation) {
                            changeStatusTo(Statuses.SYNCING);
                            syncAgain();
                        }
                    }, connectedContinuation.again);
                }
            }
        }
    }

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

Syncable.Statuses = {
    ERROR: -1, // An irrepairable error occurred and the sync provider is dead.
    OFFLINE: 0, // The sync provider hasnt yet become online, or it has been disconnected.
    CONNECTING: 1, // Trying to connect to server
    ONLINE: 2, // Connected to server and currently in sync with server
    SYNCING: 3, // Syncing with server. For poll pattern, this is every poll call. For react pattern, this is when local changes are being sent to server.
    ERROR_WILL_RETRY: 4 // An error occured such as net down but the sync provider will retry to connect.
};

Syncable.StatusTexts = {
    "-1": "ERROR",
    "0": "OFFLINE",
    "1": "CONNECTING",
    "2": "ONLINE",
    "3": "SYNCING",
    "4": "ERROR_WILL_RETRY"
};

Syncable.registeredProtocols = {}; // Map<String,ISyncProviderFactory> when key is the provider name.

Syncable.registerSyncProtocol = function(name, protocolInstance) {
    /// <summary>
    ///    Register a synchronization protocol that can synchronize databases with remote servers.
    /// </summary>
    /// <param name="name" type="String">Provider name</param>
    /// <param name="protocolInstance" type="ISyncProtocol">Implementation of ISyncProtocol</param>
    Syncable.registeredProtocols[name] = protocolInstance;
};

// Register addon in Dexie:
Dexie.Syncable = Syncable;
Dexie.addons.push(Syncable);
