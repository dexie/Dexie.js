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

import combineCreateAndUpdate from './combine-create-and-update.js';
import combineUpdateAndUpdate from './combine-update-and-update.js';

var override = Dexie.override,
    Promise = Dexie.Promise,
    setByKeyPath = Dexie.setByKeyPath,
    Observable = Dexie.Observable,
    DatabaseClosedError = Dexie.DatabaseClosedError;

export default function Syncable (db) {
    /// <param name="db" type="Dexie"></param>

    var activePeers = [];

    // Change Types
    var CREATE = 1,
        UPDATE = 2,
        DELETE = 3;

    // Statuses
    var Statuses = Syncable.Statuses;

    var MAX_CHANGES_PER_CHUNK = 1000;

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
                    return db.table('_syncNodes').where('isMaster').above(0).first(function(masterNode) {
                        // There will always be a master node. In theory we may self have become master node when we come here. But that's ok. We'll request ourselves.
                        return db.sendMessage('connect', { protocolName: protocolName, url: url, options: options }, masterNode.id, { wantReply: true });
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
                var promise = new Promise(function(resolve, reject) {
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
                    db.open().catch(ex =>{
                        // If open fails, db.on('ready') may not have been called and we must
                        // reject promise with InvalidStateError
                        reject (new Dexie.InvalidStateError(
                            `Dexie.Syncable: Couldn't connect. Database failed to open`,
                            ex
                        ));
                    }); 
                });
                return promise;
            }
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
                return db._syncNodes
                    .where("url").equals(url)
                    .toArray(nodes => nodes.map(node => node.id))
                    .then(nodeIDs =>
                        // Delete the syncNode that represents the remote endpoint.
                        db._syncNodes.where('id').anyOf(nodeIDs).delete())
                    .then (() =>
                        // In case there were uncommittedChanges belonging to this, delete them as well
                        db._uncommittedChanges.where('node').anyOf(nodeIDs).delete());
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

        var connectPromise = getOrCreateSyncNode(options).then(function(node) {
            return connectProtocol(node);
        });

        var rejectConnectPromise = null;
        var disconnected = false;
        var hasMoreToGive = true;
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

        function getOrCreateSyncNode(options) {
            return db.transaction('rw', db._syncNodes, function() {
                if (!url) throw new Error("Url cannot be empty");
                // Returning a promise from transaction scope will make the transaction promise resolve with the value of that promise.


                return db._syncNodes.where("url").equalsIgnoreCase(url).first(function(node) {
                    //
                    // PersistedContext : IPersistedContext
                    //
                    function PersistedContext(nodeID, otherProps) {
                        this.nodeID = nodeID;
                        if (otherProps) Dexie.extend(this, otherProps);
                    }

                    PersistedContext.prototype.save = function () {
                        // Store this instance in the syncContext property of the node it belongs to.
                        return Dexie.vip(function () {
                            return node.save();
                        });
                    };

                    if (node) {
                        // Node already there. Make syncContext become an instance of PersistedContext:
                        node.syncContext = new PersistedContext(node.id, node.syncContext);
                        node.syncProtocol = protocolName; // In case it was changed (would be very strange but...) could happen...
                        db._syncNodes.put(node);
                    } else {
                        // Create new node and sync everything
                        node = new db.observable.SyncNode();
                        node.myRevision = -1;
                        node.appliedRemoteRevision = null;
                        node.remoteBaseRevisions = [];
                        node.type = "remote";
                        node.syncProtocol = protocolName;
                        node.url = url;
                        node.syncOptions = options;
                        node.lastHeartBeat = Date.now();
                        node.dbUploadState = null;
                        Promise.resolve(function () {
                            // If options.initialUpload is explicitely false, set myRevision to currentRevision.
                            if (options.initialUpload === false)
                                return db._changes.lastKey(function(currentRevision) {
                                    node.myRevision = currentRevision;
                                });
                        }).then(function() {
                            db._syncNodes.add(node).then(function (nodeId) {
                                node.syncContext = new PersistedContext(nodeId); // Update syncContext in db with correct nodeId.
                                db._syncNodes.put(node);
                            });
                        });
                    }

                    return node; // returning node will make the db.transaction()-promise resolve with this value.
                });
            });
        }

        function connectProtocol(node) {
            /// <param name="node" type="db.observable.SyncNode"></param>

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
                // Use enque() to ensure only a single promise execution at a time.
                return enque(doSync, function() {
                    // By returning the Promise returned by getLocalChangesForNode() a final catch() on the sync() method will also catch error occurring in entire sequence.
                    return getLocalChangesForNode_autoAckIfEmpty(node, function sendChangesToProvider(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
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
                    });
                }, dbAliveID);
            }

            function abortTheProvider(error) {
                activePeer.disconnect(Statuses.ERROR, error);
            }

            function getBaseRevisionAndMaxClientRevision(node) {
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
                // There are at least one item in the list but the server hasnt yet become up-to-date with the 0 revision from client. 
                return {
                    maxClientRevision: node.remoteBaseRevisions[0].local,
                    remoteBaseRevision: null
                };
            }

            function getLocalChangesForNode_autoAckIfEmpty(node, cb) {
                return getLocalChangesForNode(node, function autoAck(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                    if (changes.length === 0 && 'myRevision' in nodeModificationsOnAck && nodeModificationsOnAck.myRevision !== node.myRevision) {
                        Object.keys(nodeModificationsOnAck).forEach(function(keyPath) {
                            Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                        });
                        node.save().catch('DatabaseClosedError', ex=>{});
                        return getLocalChangesForNode(node, autoAck);
                    } else {
                        return cb(changes, remoteBaseRevision, partial, nodeModificationsOnAck);
                    }
                });
            }

            function getLocalChangesForNode(node, cb) {
                /// <summary>
                ///     Based on given node's current revision and state, this function makes sure to retrieve next chunk of changes
                ///     for that node.
                /// </summary>
                /// <param name="node"></param>
                /// <param name="cb" value="function(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {}">Callback that will retrieve next chunk of changes and a boolean telling if it's a partial result or not. If truthy, result is partial and there are more changes to come. If falsy, these changes are the final result.</param>

                if (node.myRevision >= 0) {
                    // Node is based on a revision in our local database and will just need to get the changes that has occurred since that revision.
                    var brmcr = getBaseRevisionAndMaxClientRevision(node);
                    return getChangesSinceRevision(node.myRevision, MAX_CHANGES_PER_CHUNK, brmcr.maxClientRevision, function(changes, partial, nodeModificationsOnAck) {
                        return cb(changes, brmcr.remoteBaseRevision, partial, nodeModificationsOnAck);
                    });
                } else {
                    // Node hasn't got anything from our local database yet. We will need to upload entire DB to the node in the form of CREATE changes.
                    // Check if we're in the middle of already doing that:
                    if (node.dbUploadState === null) {
                        // Initiatalize dbUploadState
                        var tablesToUpload = db.tables.filter(function(table) { return table.schema.observable; }).map(function(table) { return table.name; });
                        if (tablesToUpload.length === 0) return Promise.resolve(cb([], null, false, {})); // There are no synched tables at all.
                        var dbUploadState = {
                            tablesToUpload: tablesToUpload,
                            currentTable: tablesToUpload.shift(),
                            currentKey: null
                        };
                        return db._changes.orderBy('rev').last(function(lastChange) {
                            dbUploadState.localBaseRevision = (lastChange && lastChange.rev) || 0;
                            var collection = db.table(dbUploadState.currentTable).orderBy(':id');
                            return getTableObjectsAsChanges(dbUploadState, [], collection);
                        });
                    } else if (node.dbUploadState.currentKey) {
                        var collection = db.table(node.dbUploadState.currentTable).where(':id').above(node.dbUploadState.currentKey);
                        return getTableObjectsAsChanges(Dexie.deepClone(node.dbUploadState), [], collection);
                    } else {
                        var collection = db.table(dbUploadState.currentTable).orderBy(':id');
                        return getTableObjectsAsChanges(Dexie.deepClone(node.dbUploadState), [], collection);
                    }
                }

                function getTableObjectsAsChanges(state, changes, collection) {
                    /// <param name="state" value="{tablesToUpload:[''],currentTable:'_changes',currentKey:null,localBaseRevision:0}"></param>
                    /// <param name="changes" type="Array" elementType="IDatabaseChange"></param>
                    /// <param name="collection" type="db.Collection"></param>
                    var limitReached = false;
                    return collection.until(function() {
                        if (changes.length === MAX_CHANGES_PER_CHUNK) {
                            limitReached = true;
                            return true;
                        }
                    }).each(function(item, cursor) {
                        changes.push({
                            type: CREATE,
                            table: state.currentTable,
                            key: cursor.key,
                            obj: cursor.value
                        });
                        state.currentKey = cursor.key;
                    }).then(function() {
                        if (limitReached) {
                            // Limit reached. Send partial result.
                            hasMoreToGive = true;
                            return cb(changes, null, true, { dbUploadState: state });
                        } else {
                            // Done iterating this table. Check if there are more tables to go through:
                            if (state.tablesToUpload.length === 0) {
                                // Done iterating all tables
                                // Now append changes occurred during our dbUpload:
                                var brmcr = getBaseRevisionAndMaxClientRevision(node);
                                return getChangesSinceRevision(state.localBaseRevision, MAX_CHANGES_PER_CHUNK - changes.length, brmcr.maxClientRevision, function(additionalChanges, partial, nodeModificationsOnAck) {
                                    changes = changes.concat(additionalChanges);
                                    nodeModificationsOnAck.dbUploadState = null;
                                    return cb(changes, brmcr.remoteBaseRevision, partial, nodeModificationsOnAck);
                                });
                            } else {
                                // Not done iterating all tables. Continue on next table:
                                state.currentTable = state.tablesToUpload.shift();
                                return getTableObjectsAsChanges(state, changes, db.table(state.currentTable).orderBy(':id'));
                            }
                        }
                    });
                }

                function getChangesSinceRevision(revision, maxChanges, maxRevision, cb) {
                    /// <param name="cb" value="function(changes, partial, nodeModificationsOnAck) {}">Callback that will retrieve next chunk of changes and a boolean telling if it's a partial result or not. If truthy, result is partial and there are more changes to come. If falsy, these changes are the final result.</param>
                    var changeSet = {};
                    var numChanges = 0;
                    var partial = false;
                    var ignoreSource = node.id;
                    var nextRevision = revision;
                    return db.transaction('r', db._changes, function() {
                        var query = db._changes.where('rev').between(revision, maxRevision, false, true);
                        return query.until(() => {
                            if (numChanges === maxChanges) {
                                partial = true;
                                return true;
                            }
                        }).each(function(change) {
                            // Note the revision in nextRevision:
                            nextRevision = change.rev;
                            if (change.source === ignoreSource) return;
                            // Our _changes table contains more info than required (old objs, source etc). Just make sure to include the nescessary info:
                            var changeToSend = {
                                type: change.type,
                                table: change.table,
                                key: change.key
                            };
                            if (change.type === CREATE)
                                changeToSend.obj = change.obj;
                            else if (change.type === UPDATE)
                                changeToSend.mods = change.mods;

                            var id = change.table + ":" + change.key;
                            var prevChange = changeSet[id];
                            if (!prevChange) {
                                // This is the first change on this key. Add it unless it comes from the source that we are working against
                                changeSet[id] = changeToSend;
                                ++numChanges;
                            } else {
                                // Merge the oldchange with the new change
                                var nextChange = changeToSend;
                                var mergedChange = (function() {
                                    switch (prevChange.type) {
                                    case CREATE:
                                        switch (nextChange.type) {
                                        case CREATE:
                                            return nextChange; // Another CREATE replaces previous CREATE.
                                        case UPDATE:
                                            return combineCreateAndUpdate(prevChange, nextChange); // Apply nextChange.mods into prevChange.obj
                                        case DELETE:
                                            return nextChange; // Object created and then deleted. If it wasnt for that we MUST handle resent changes, we would skip entire change here. But what if the CREATE was sent earlier, and then CREATE/DELETE at later stage? It would become a ghost object in DB. Therefore, we MUST keep the delete change! If object doesnt exist, it wont harm!
                                        }
                                        break;
                                    case UPDATE:
                                        switch (nextChange.type) {
                                        case CREATE:
                                            return nextChange; // Another CREATE replaces previous update.
                                        case UPDATE:
                                            return combineUpdateAndUpdate(prevChange, nextChange); // Add the additional modifications to existing modification set.
                                        case DELETE:
                                            return nextChange; // Only send the delete change. What was updated earlier is no longer of interest.
                                        }
                                        break;
                                    case DELETE:
                                        switch (nextChange.type) {
                                        case CREATE:
                                            return nextChange; // A resurection occurred. Only create change is of interest.
                                        case UPDATE:
                                            return prevChange; // Nothing to do. We cannot update an object that doesnt exist. Leave the delete change there.
                                        case DELETE:
                                            return prevChange; // Still a delete change. Leave as is.
                                        }
                                        break;
                                    }
                                })();
                                changeSet[id] = mergedChange;
                            }
                        });
                    }).then(function() {
                        var changes = Object.keys(changeSet).map(function(key) { return changeSet[key]; });
                        hasMoreToGive = partial;
                        return cb(changes, partial, { myRevision: nextRevision });
                    });/*.catch(ex => {
                        console.error(`Here and there... '${ex.message}'.`);
                        //return Promise.reject(ex);
                    });*/
                }
            }


            function applyRemoteChanges(remoteChanges, remoteRevision, partial, clear) {
                return enque(applyRemoteChanges, function() {
                    if (!stillAlive()) return Promise.reject(new Dexie.DatabaseClosedError());
                    // FIXTHIS: Check what to do if clear() is true!
                    return (partial ? saveToUncommitedChanges(remoteChanges) : finallyCommitAllChanges(remoteChanges, remoteRevision))
                        .catch(function(error) {
                            abortTheProvider(error);
                            return Promise.reject(error);
                        });
                }, dbAliveID);


                function saveToUncommitedChanges(changes) {
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
                }

                function finallyCommitAllChanges(changes, remoteRevision) {
                    // 1. Open a write transaction on all tables in DB
                    const tablesToIncludeInTrans = db.tables.filter(table =>
                        table.name === '_changes' ||
                        table.name === '_uncommittedChanges' ||
                        table.schema.observable);

                    return db.transaction('rw!', tablesToIncludeInTrans, () => {
                        var trans = Dexie.currentTransaction;
                        var localRevisionBeforeChanges = 0;
                        return db._changes.orderBy('rev').last(function(lastChange) {
                            // Store what revision we were at before committing the changes
                            localRevisionBeforeChanges = (lastChange && lastChange.rev) || 0;
                        }).then(() => {
                            // Specify the source. Important for the change consumer to ignore changes originated from self!
                            trans.source = node.id;
                            // 2. Apply uncommitted changes and delete each uncommitted change
                            return db._uncommittedChanges.where('node').equals(node.id).toArray();
                        }).then(function(uncommittedChanges) {
                            return applyChanges(uncommittedChanges, 0);
                        }).then(function() {
                            return db._uncommittedChanges.where('node').equals(node.id).delete();
                        }).then(function() {
                            // 3. Apply last chunk of changes
                            return applyChanges(changes, 0);
                        }).then(function() {
                            // Get what revision we are at now:
                            return db._changes.orderBy('rev').last();
                        }).then(function(lastChange) {
                            var currentLocalRevision = (lastChange && lastChange.rev) || 0;
                            // 4. Update node states (appliedRemoteRevision, remoteBaseRevisions and eventually myRevision)
                            node.appliedRemoteRevision = remoteRevision;
                            node.remoteBaseRevisions.push({ remote: remoteRevision, local: currentLocalRevision });
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
                            node.save().catch(err=>{
                                console.warn("Dexie.Syncable: Unable to save SyncNode after applying remote changes: " + (err.stack || err));
                            });
                        });

                        function applyChanges(changes, offset) {
                            const length = changes.length;
                            if (offset >= length) return Promise.resolve(null);
                            const firstChange = changes[offset];
                            let i, change;
                            for (i=offset + 1; i < length; ++i) {
                                change = changes[i];
                                if (change.type !== firstChange.type ||
                                    change.table !== firstChange.table)
                                    break;
                            }
                            const table = db.table(firstChange.table);
                            const specifyKeys = !table.schema.primKey.keyPath;
                            const changesToApply = changes.slice(offset, i);
                            const changeType = firstChange.type;
                            const bulkPromise =
                                changeType === CREATE ?
                                    table.bulkPut(changesToApply.map(c => c.obj), specifyKeys ?
                                        changesToApply.map(c => c.key) : undefined) :
                                changeType === UPDATE ?
                                    bulkUpdate(table, changesToApply) :
                                changeType === DELETE ?
                                    table.bulkDelete(changesToApply.map(c => c.key)) :
                                    Promise.resolve(null);

                            return bulkPromise.then(()=>applyChanges(changes, i));
                        }

                        function bulkUpdate(table, changes) {
                            let keys = changes.map(c => c.key);
                            let map = {};
                            // Retrieve current object of each change to update and map each
                            // found object's primary key to the existing object:
                            return table.where(':id').anyOf(keys).raw().each((obj, cursor) => {
                                map[cursor.primaryKey+''] = obj;
                            }).then(()=>{
                                // Filter away changes where whos key wasnt found in local database
                                // (we couldn't update them if we do not know the existing values)
                                let updatesThatApply = changes.filter(c => map.hasOwnProperty(c.key+''));
                                // Apply modifications onto each existing object (in memory)
                                // and generate array of resulting objects to put using bulkPut():
                                let objsToPut = updatesThatApply.map (c => {
                                    let curr = map[c.key+''];
                                    Object.keys(c.mods).forEach(keyPath => {
                                        setByKeyPath(curr, keyPath, c.mods[keyPath]);
                                    });
                                    return curr;
                                });
                                return table.bulkPut(objsToPut);
                            });
                        }
                    });
                }
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
                                node.save().catch('DatabaseClosedError', ex=>{});
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
                            node.save().catch('DatabaseClosedError', ex=>{});
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

                if (hasMoreToGive) {
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

    var syncNodeSaveQueContexts = {};
    db.observable.SyncNode.prototype.save = function() {
        return db.transaction('rw?', db._syncNodes, () => {
            return db._syncNodes.put(this);
        });
    };

    function enque(context, fn, instanceID) {
        function _enque() {
            if (!context.ongoingOperation) {
                context.ongoingOperation = Dexie.ignoreTransaction(function() {
                    return Dexie.vip(function() {
                        return fn();
                    });
                }).finally(()=> {
                    delete context.ongoingOperation;
                });
            } else {
                context.ongoingOperation = context.ongoingOperation.then(function() {
                    return enque(context, fn, instanceID);
                });
            }
            return context.ongoingOperation;
        }

        if (!instanceID) {
            // Caller wants to enque it until database becomes open.
            if (db.isOpen()) {
                return _enque();
            } else {
                return Promise.reject(new DatabaseClosedError());
            }
        } else if (db._localSyncNode && instanceID === db._localSyncNode.id) {
            // DB is already open but queuer doesnt want it to be queued if database has been closed (request bound to current instance of DB)
            return _enque();
        } else {
            return Promise.reject(new DatabaseClosedError());
        }
    }
};

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
    ///    Register a syncronization protocol that can syncronize databases with remote servers.
    /// </summary>
    /// <param name="name" type="String">Provider name</param>
    /// <param name="protocolInstance" type="ISyncProtocol">Implementation of ISyncProtocol</param>
    Syncable.registeredProtocols[name] = protocolInstance;
};

// Register addon in Dexie:
Dexie.Syncable = Syncable;
Dexie.addons.push(Syncable);
