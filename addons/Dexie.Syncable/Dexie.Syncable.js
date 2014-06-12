/// <reference path="../../../src/Dexie.js" />
/// <reference path="../Dexie.Observable/Dexie.Observable.js" />
/// <reference path="Dexie.Syncable.SyncProtocolAPI.js" />
(function (window, publish, isBrowser, undefined) {

    var override = Dexie.override,
        Promise = Dexie.Promise,
        setByKeyPath = Dexie.setByKeyPath;

    Dexie.Syncable = function (db) {
    	/// <param name="db" type="Dexie"></param>
        var activePeers = [];

        // Change Types
        var CREATE = 1,
            UPDATE = 2,
            DELETE = 3;

        // Statuses
        var Statuses = Dexie.Syncable.Statuses;

        var MAX_CHANGES_PER_CHUNK = 1000;

        db.on('message', function (msg) {
            // Message from other local node arrives...
            db.vip(function () {
                if (msg.type == 'connect') {
                    // We are master node and another non-master node wants us to do the connect.
                    db.syncable.connect(msg.protocolName, msg.url, msg.options).then(msg.resolve, msg.reject);
                } else if (msg.type == 'disconnect') {
                    db.syncable.disconnect(msg.url);
                } else if (msg.type == 'syncStatusChanged') {
                    // We are client and a master node informs us about syncStatus change.
                    // Lookup the connectedProvider and call its event
                    db.syncable.on.statusChanged.fire(msg.newStatus, msg.url);
                }
            });
        });

        db.on('cleanup', function (nodes, changes, intercomm, trans, weBecameMaster) {
            /// <param name="nodes" type="db.WriteableTable"></param>
            /// <param name="changes" type="db.WriteableTable"></param>
            /// <param name="intercomm" type="db.WriteableTable"></param>
            /// <param name="trans" type="db.Transaction"></param>

            // A cleanup (done in Dexie.Observable) may result in that a master node is removed and we become master.
            if (weBecameMaster) {
                // We took over the master role in Observable's cleanup method
                nodes.where('type').equals('remote')
                    .and(function (node) { return node.status !== Statuses.OFFLINE && node.status !== Statuses.ERROR; })
                    .each(function (connectedRemoteNode) {
                        // There are connected remote nodes that we must take over
                        // Since we may be in the on(ready) event, we must get VIPed to continue - Promise.PSD is not derived in Collection.each() since it is a callback called outside a Promise.
                        db.vip(function () {
                            db.syncable.connect(connectedRemoteNode.syncProtocol, connectedRemoteNode.url, connectedRemoteNode.syncOptions);
                        });
                    });
            }
        });

        db.on('ready', function onReady() {
            // Again, in onReady: If we ARE master, make sure to connect to remote servers that is in a connected state.
            if (db._localSyncNode && db._localSyncNode.isMaster) {
                // Make sure to connect to remote servers that is in a connected state (NOT OFFLINE or ERROR!)
                return db._syncNodes.where('type').equals('remote')
                    .and(function (node) { return node.status !== Statuses.OFFLINE && node.status !== Statuses.ERROR; })
                    .toArray(function (connectedRemoteNodes) {
                        // There are connected remote nodes that we must take over
                        if (connectedRemoteNodes.length > 0) {
                            return Promise.all(connectedRemoteNodes.map(function (node) {
                                return db.syncable.connect(node.syncProtocol, node.url, node.syncOptions)
                                    .catch(function () {
                                        return undefined;// If a node fails to connect, don't make db.open() reject. Accept it!
                                    }); 
                            }));
                        }
                    });
            }
        });


        db.syncable = {};

        db.syncable.getStatus = function (url, cb) {
            return db.vip(function(){
                return db._syncNodes.where('url').equals(url).first(function (node) {
                    return node ? node.status : Statuses.OFFLINE;
                });
            }).then(cb);
        }

        db.syncable.list = function () {
            return db._syncNodes.where('type').equals('remote').toArray(function (a) {
                return a.map(function (node) { return node.url; });
            });
        }

        db.syncable.on = Dexie.events(db, { statusChanged: "asap" });

        db.syncable.disconnect = function (url) {
            if (db._localSyncNode && db._localSyncNode.isMaster) {
                activePeers.filter(function (peer) { return peer.url === url }).forEach(function (peer) {
                    peer.disconnect(Statuses.OFFLINE);
                });
            } else {
                db._syncNodes.where('isMaster').above(0).first(function (masterNode) {
                    db.sendMessage('disconnect', { url: url }, masterNode.id);
                });
            }
        }

        db.syncable.connect = function (protocolName, url, options) {
            options = options || {}; // Make sure options is always an object because 1) Provider expects it to be. 2) We'll be persisting it and you cannot persist undefined.
            var protocolInstance = Dexie.Syncable.registeredProtocols[protocolName];

            if (protocolInstance) {
                if (db.isOpen() && db._localSyncNode) {
                    // Database is open
                    if (db._localSyncNode.isMaster) {
                        // We are master node
                        return connect(protocolInstance, protocolName, url, options, db._localSyncNode.id);
                    } else {
                        // We are not master node
                        // Request master node to do the connect:
                        return db.table('_syncNodes').where('isMaster').above(0).first(function (masterNode) {
                            // There will always be a master node. In theory we may self have become master node when we come here. But that's ok. We'll request ourselves.
                            return db.sendMessage('connect', { protocolName: protocolName, url: url, options: options }, masterNode.id, { wantReply: true });
                        });
                    }
                } else {
                    // Database not yet open
                    // Wait for it to open
                    return new Promise(function (resolve, reject) {
                        db.on("ready", function syncWhenReady() {
                            db.on.ready.unsubscribe(syncWhenReady);
                            return db.vip(function(){
                                return db.syncable.connect(protocolName, url, options).then(resolve).catch(function (err) {
                                    // Reject the promise returned to the caller of db.syncable.connect():
                                    reject(err);
                                    // but resolve the promise that db.on("ready") waits for, because database should succeed to open even if the connect operation fails!
                                });
                            });
                        });
                    });
                }
            } else {
                throw new Error("ISyncProtocol '" + protocolName + "' is not registered in Dexie.Syncable.registerSyncProtocol()");
                return new Promise(); // For code completion
            }
        }

        function connect (protocolInstance, protocolName, url, options, dbAliveID) {
            /// <param name="protocolInstance" type="ISyncProtocol"></param>
            var existingPeer = activePeers.filter(function (peer) { return peer.url == url; });
            if (existingPeer.length > 0) {
                // Never create multiple syncNodes with same protocolName and url. Instead, let the next call to connect() return the same promise that
                // have already been started and eventually also resolved. If promise has already resolved (node connected), calling existing promise.then() will give a callback directly.
                return existingPeer[0].connectPromise;
            }

            var connectPromise = getOrCreateSyncNode().then(function (node) {
                return connectProtocol(node);
            });

            var rejectConnectPromise = null;
            var disconnected = false;
            var hasMoreToGive = true;
            var activePeer = {
                url: url,
                status: Statuses.OFFLINE,
                connectPromise: connectPromise,
                on: Dexie.events(null, "disconnect"),
                disconnect: function (newStatus, error) {
                    if (!disconnected) {
                        activePeer.on.disconnect.fire(newStatus, error);
                        var pos = activePeers.indexOf(activePeer);
                        if (pos >= 0) activePeers.splice(pos, 1);
                        if (error && rejectConnectPromise) rejectConnectPromise(error);
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

            function getOrCreateSyncNode() {
                return db.transaction('rw', db._syncNodes, function (syncNodes) {
                    // Returning a promise from transaction scope will make the transaction promise resolve with the value of that promise.
                    return syncNodes.where("url").equalsIgnoreCase(url).first(function (node) {
                        if (node) {
                            // Node already there. Make syncContext become an instance of PersistedContext:
                            node.syncContext = Dexie.extend(new PersistedContext(node.id), node.syncContext);
                            node.syncProtocol = protocolName; // In case it was changed (would be very strange but...) could happen...
                            node.save();
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
                            syncNodes.put(node).then(function (nodeId) {
                                node.syncContext = new PersistedContext(nodeId);// Update syncContext in db with correct nodeId.
                                node.save();
                            });
                        }

                        //
                        // PersistedContext : IPersistedContext
                        //
                        function PersistedContext(nodeID) {
                            this.nodeID = nodeID;
                        }
                        PersistedContext.prototype.save = function () {
                            // Store this instance in the syncContext property of the node it belongs to.
                            node.save();
                            //return db._syncNodes.update(this.nodeID, { syncContext: this });
                        }

                        return node; // returning node will make the db.transaction()-promise resolve with this value.
                    });
                });
            }

            function connectProtocol(node) {
                /// <param name="node" type="db.observable.SyncNode"></param>

                function changeStatusTo(newStatus) {
                    if (node.status != newStatus) {
                        node.status = newStatus;
                        node.save();
                        db.syncable.on.statusChanged.fire(newStatus, url);
                        // Also broadcast message to other nodes about the status
                        db.broadcastMessage("syncStatusChanged", { newStatus: newStatus, url: url }, false);
                    }
                }

                activePeer.on('disconnect', function (newStatus) {
                    if (!isNaN(newStatus)) changeStatusTo(newStatus);
                });

                var connectedContinuation;
                changeStatusTo(Statuses.CONNECTING);
                return doSync();

                function doSync() {
                    // Use enque() to ensure only a single promise execution at a time.
                    return enque(doSync, function () {
                        // By returning the Promise returned by getLocalChangesForNode() a final catch() on the sync() method will also catch error occurring in entire sequence.
                        return getLocalChangesForNode_autoAckIfEmpty(node, function sendChangesToProvider(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                            // Create a final Promise for the entire sync() operation that will resolve when provider calls onSuccess().
                            // By creating finalPromise before calling protocolInstance.sync() it is possible for provider to call onError() immediately if it wants.
                            var finalSyncPromise = new Promise(function (resolve, reject) {
                                rejectConnectPromise = function (err) {
                                    reject(err);
                                }
                                Dexie.asap(function () {
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
                                            function (continuation) {
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
                                                setTimeout(function () {
                                                    if (stillAlive()) {
                                                        changeStatusTo(Statuses.SYNCING);
                                                        doSync();
                                                    }
                                                }, again);
                                                changeStatusTo(Statuses.ERROR_WILL_RETRY, error);
                                                if (connectedContinuation.disconnect) connectedContinuation.disconnect();
                                                connectedContinuation = null;
                                            } else {
                                                abortTheProvider(error); // Will fire ERROR on statusChanged event.
                                            }
                                        }
                                    }
                                });
                            });

                            return finalSyncPromise.then(function () {
                                // Resolve caller of db.syncable.connect() with undefined. Not with continuation!
                            });

                            function onChangesAccepted() {
                                Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
                                    Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                                });
                                node.save();
                                // We dont know if onSuccess() was called by provider yet. If it's already called, finalPromise.then() will execute immediately,
                                // otherwise it will execute when finalSyncPromise resolves.
                                finalSyncPromise.then(continueSendingChanges);
                            }
                        });
                    }, dbAliveID);
                }

                function abortTheProvider(error) {
                    activePeer.disconnect(Statuses.ERROR, error);
                }

                function getBaseRevisionAndMaxClientRevision(node) {
                    /// <param name="node" type="db.observable.SyncNode"></param>
                    if (node.remoteBaseRevisions.length === 0) return {
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
                            }
                        }
                    }
                    // There are at least one item in the list but the server hasnt yet become up-to-date with the 0 revision from client. 
                    return {
                        maxClientRevision: node.remoteBaseRevisions[0].local,
                        remoteBaseRevision: null
                    };
                }

                function getLocalChangesForNode_autoAckIfEmpty(node, cb) {
                    return getLocalChangesForNode(node, function autoAck (changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                        if (changes.length === 0 && nodeModificationsOnAck.myRevision != node.myRevision) {
                            Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
                                Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                            });
                            node.save();
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
                        return getChangesSinceRevision(node.myRevision, MAX_CHANGES_PER_CHUNK, brmcr.maxClientRevision, function (changes, partial, nodeModificationsOnAck) {
                            return cb(changes, brmcr.remoteBaseRevision, partial, nodeModificationsOnAck);
                        });
                    } else {
                        // Node hasn't got anything from our local database yet. We will need to upload entire DB to the node in the form of CREATE changes.
                        // Check if we're in the middle of already doing that:
                        if (node.dbUploadState == null) {
                            // Initiatalize dbUploadState
                            var tablesToUpload = db.tables.filter(function (table) { return table.schema.observable; }).map(function (table) { return table.name; });
                            if (tablesToUpload.length === 0) return cb([], null, false, {}); // There are no synched tables at all.
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
                        return collection.until(function () {
                            if (changes.length === MAX_CHANGES_PER_CHUNK) {
                                limitReached = true;
                                return true;
                            }
                        }).each(function (item, cursor) {
                            changes.push({
                                type: CREATE,
                                table: state.currentTable,
                                key: cursor.key,
                                obj: cursor.value,
                            });
                            state.currentKey = cursor.key;
                        }).then(function () {
                            if (limitReached) {
                                // Limit reached. Send partial result.
                                hasMoreToGive = true;
                                return cb(changes, null, true, {dbUploadState: state});
                            } else {
                                // Done iterating this table. Check if there are more tables to go through:
                                if (state.tablesToUpload.length == 0) {
                                    // Done iterating all tables
                                    // Now append changes occurred during our dbUpload:
                                    var brmcr = getBaseRevisionAndMaxClientRevision(node);
                                    return getChangesSinceRevision(state.localBaseRevision, MAX_CHANGES_PER_CHUNK - changes.length, brmcr.maxClientRevision, function (additionalChanges, partial, nodeModificationsOnAck) {
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
                        return db.transaction('r', db._changes, function (_changes) {
                            var query = (maxRevision == Infinity ?
                                _changes.where('rev').above(revision) :
                                _changes.where('rev').between(revision, maxRevision, false, true));
                            query.until(function () {
                                if (numChanges === maxChanges) {
                                    partial = true;
                                    return true;
                                }
                            }).each(function (change) {
                                // Note the revision in nextRevision:
                                nextRevision = change.rev;
                                if (change.source === ignoreSource) return;
                                // Our _changes table contains more info than required (old objs, source etc). Just make sure to include the nescessary info:
                                var changeToSend = {
                                    type: change.type,
                                    table: change.table,
                                    key: change.key
                                };
                                if (change.type == CREATE)
                                    changeToSend.obj = change.obj;
                                else if (change.type == UPDATE)
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
                                    var mergedChange = (function () {
                                        switch (prevChange.type) {
                                            case CREATE:
                                                switch (nextChange.type) {
                                                    case CREATE: return nextChange; // Another CREATE replaces previous CREATE.
                                                    case UPDATE: return combineCreateAndUpdate(prevChange, nextChange); // Apply nextChange.mods into prevChange.obj
                                                    case DELETE: return nextChange;  // Object created and then deleted. If it wasnt for that we MUST handle resent changes, we would skip entire change here. But what if the CREATE was sent earlier, and then CREATE/DELETE at later stage? It would become a ghost object in DB. Therefore, we MUST keep the delete change! If object doesnt exist, it wont harm!
                                                }
                                                break;
                                            case UPDATE:
                                                switch (nextChange.type) {
                                                    case CREATE: return nextChange; // Another CREATE replaces previous update.
                                                    case UPDATE: return combineUpdateAndUpdate(prevChange, nextChange); // Add the additional modifications to existing modification set.
                                                    case DELETE: return nextChange;  // Only send the delete change. What was updated earlier is no longer of interest.
                                                }
                                                break;
                                            case DELETE:
                                                switch (nextChange.type) {
                                                    case CREATE: return nextChange; // A resurection occurred. Only create change is of interest.
                                                    case UPDATE: return prevChange; // Nothing to do. We cannot update an object that doesnt exist. Leave the delete change there.
                                                    case DELETE: return prevChange; // Still a delete change. Leave as is.
                                                }
                                                break;
                                        }
                                    })();
                                    changeSet[id] = mergedChange;
                                }
                            });
                        }).then(function () {
                            var changes = Object.keys(changeSet).map(function (key) { return changeSet[key]; });
                            hasMoreToGive = partial;
                            return cb(changes, partial, { myRevision: nextRevision });
                        });
                    }
                }
                            

                function applyRemoteChanges(remoteChanges, remoteRevision, partial, clear) {
                    return enque(applyRemoteChanges, function() {
                        return db.vip(function () {
                            if (!stillAlive()) return Promise.reject("Database not open");
                            // FIXTHIS: Check what to do if clear() is true!
                            return (partial ? saveToUncommitedChanges(remoteChanges) : finallyCommitAllChanges(remoteChanges, remoteRevision))
                                .catch(function (error) {
                                    abortTheProvider(error);
                                    return Promise.reject(error);
                                });
                        });
                    }, dbAliveID);


                    function saveToUncommitedChanges (changes) {
                        return db.transaction('rw', db._uncommittedChanges, function (uncommittedChanges) {
                            changes.forEach(function (change) {
                                var changeToAdd = {
                                    node: node.id,
                                    type: change.type,
                                    table: change.table,
                                    key: change.key
                                };
                                if (change.obj) changeToAdd.obj = change.obj;
                                if (change.mods) changeToAdd.mods = change.mods;
                                uncommittedChanges.add(changeToAdd);
                            });
                        }).then(function () {
                            node.appliedRemoteRevision = remoteRevision;
                            node.save();
                        });
                    }

                    function finallyCommitAllChanges(changes, remoteRevision) {
                        //alert("finallyCommitAllChanges() will now start its job.");
                        //var tick = Date.now();

                        // 1. Open a write transaction on all tables in DB
                        return db.transaction('rw', db.tables.filter(function (table) { return table.name == '_changes' || table.name == '_uncommittedChanges' || table.schema.observable }), function () {
                            var trans = this;
                            var localRevisionBeforeChanges = 0;
                            trans._changes.orderBy('rev').last(function (lastChange) {
                                // Store what revision we were at before committing the changes
                                localRevisionBeforeChanges = (lastChange && lastChange.rev) || 0;
                            }).then(function () {
                                // Specify the source. Important for the change consumer to ignore changes originated from self!
                                trans.source = node.id;
                                // 2. Apply uncommitted changes and delete each uncommitted change
                                return trans._uncommittedChanges.where('node').equals(node.id).toArray();
                            }).then(function (uncommittedChanges) {
                                return applyChanges(uncommittedChanges, 0);
                            }).then(function () {
                                return trans._uncommittedChanges.where('node').equals(node.id).delete();
                            }).then(function () {
                                // 3. Apply last chunk of changes
                                return applyChanges(changes, 0);
                            }).then(function () {
                                // Get what revision we are at now:
                                return trans._changes.orderBy('rev').last();
                            }).then(function (lastChange) {
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
                                node.save();
                                //var tock = Date.now();
                                //alert("finallyCommitAllChanges() has done its job. " + changes.length + " changes applied in " + ((tock - tick) / 1000) + "seconds");
                            });

                            function applyChanges(changes, offset) {
                            	/// <param name="changes" type="Array" elementType="IDatabaseChange"></param>
                            	/// <param name="offset" type="Number"></param>
                                var lastChangeType = 0;
                                var lastCreatePromise = null;
                                for (var i=offset, len = changes.length; i<len; ++i) {
                                    var change = changes[i];
                                    var table = trans.tables[change.table];
                                    if (change.type === CREATE) {
                                        // Optimize CREATE changes because on initial sync with server, the entire DB will be downloaded in forms of CREATE changes.
                                        // Instead of waiting for each change to resolve, do all CREATE changes in bulks until another type of change is stepped upon.
                                        // This case is the only case that allows i to increment and the for-loop to continue since it does not return anything.
                                        var specifyKey = !table.schema.primKey.keyPath;
                                        lastCreatePromise = (specifyKey ? table.add(change.obj, change.key) : table.add(change.obj)).catch("ConstraintError", function (e) {
                                            return (specifyKey ? table.put(change.obj, change.key) : table.put(change.obj));
                                        });
                                    } else if (lastCreatePromise) {
                                        // We did some CREATE changes but now stumbled upon another type of change.
                                        // Let's wait for the last CREATE change to resolve and then call applyChanges again at current position. Next time, lastCreatePromise will be null and a case below will happen.
                                        return lastCreatePromise.then(function () {
                                            applyChanges(changes, i);
                                        });
                                    } else if (change.type === UPDATE) {
                                        return table.update(change.key, change.mods).then(function () {
                                            // Wait for update to resolve before taking next change. Why? Because it will lock transaction anyway since we are listening to CRUD events here.
                                            applyChanges(changes, i + 1);
                                        });
                                    } else if (change.type === DELETE) {
                                        return table.delete(change.key).then(function () {
                                            // Wait for delete to resolve before taking next change. Why? Because it will lock transaction anyway since we are listening to CRUD events here.
                                            applyChanges(changes, i + 1);
                                        });
                                    }
                                }
                                return lastCreatePromise || Promise.resolve(null); // Will return null or a Promise and make the entire applyChanges promise finally resolve.
                            }

                            function applyChange(change) {
                                var table = trans.tables[change.table];
                                var specifyKey = !table.schema.primKey.keyPath;
                                switch (change.type) {
                                    case CREATE: 
                                        /*return (specifyKey ? table.add(change.obj, change.key) : table.add(change.obj)).then(function () {
                                            return true; 
                                        }).catch(function (e) {
                                            return false; // Would be more straight-forward to return a new Promise here, but there is a limitation in Dexie that makes the error bubble to transaction despite being catched in case the catch clause returns another Promise.
                                        }).then(function (added) {
                                            if (!added) {
                                                return specifyKey ? table.put(change.obj, change.key) : table.put(change.obj);
                                            }
                                        });*/
                                        /*return trans._promise('readwrite', function (resolve, reject) {
                                            (specifyKey ? table.add(change.obj, change.key) : table.add(change.obj)).then(function(val){
                                                resolve (val);
                                            }).catch(function (e) {
                                                (specifyKey ? table.put(change.obj, change.key) : table.put(change.obj)).then(resolve, reject);
                                            });
                                        }, "writelock");*/
                                        /*trans._lock();
                                        return (specifyKey ? table.add(change.obj, change.key) : table.add(change.obj)).catch(function (e) {
                                            return specifyKey ? table.put(change.obj, change.key) : table.put(change.obj);
                                        }).finally(function () {
                                            trans._unlock();
                                        });;*/
                                    case UPDATE: return table.update(change.key, change.mods);
                                    case DELETE: return table.delete(change.key);
                                    default: throw new Error("Change type unsupported");
                                }
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
                    activePeer.on('disconnect', function () {
                        if (connectedContinuation) {
                            if (connectedContinuation.react) {
                                try {
                                    // react pattern must provide a disconnect function.
                                    connectedContinuation.disconnect();
                                } catch (e) { }
                            }
                            connectedContinuation = null;// Stop poll() pattern from polling again and abortTheProvider() from being called twice.
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

                    // Override disconnect() to also unsubscribe to onChanges.
                    activePeer.on('disconnect', function () {
                        db.on.changes.unsubscribe(onChanges);
                    });

                    function reactToChanges() {
                        if (!connectedContinuation) return;
                        changesWaiting = false;
                        isWaitingForServer = true;
                        getLocalChangesForNode_autoAckIfEmpty(node, function (changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                            if (!connectedContinuation) return;
                            if (changes.length > 0) {
                                continuation.react(changes, remoteBaseRevision, partial, function onChangesAccepted() {
                                    Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
                                        Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                                    });
                                    node.save();
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
                        }).catch(abortTheProvider);
                    }

                    reactToChanges();
                }

                //  Poll Pattern
                function continueUsingPollPattern() {

                    function syncAgain() {
                        getLocalChangesForNode_autoAckIfEmpty(node, function (changes, remoteBaseRevision, partial, nodeModificationsOnAck) {

                            protocolInstance.sync(node.syncContext, url, options, remoteBaseRevision, node.appliedRemoteRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError);

                            function onChangesAccepted() {
                                Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
                                    Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                                });
                                node.save();
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
                                        setTimeout(function () {
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
                                        setTimeout(function () {
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
                        setTimeout(function () {
                            if (connectedContinuation) {
                                changeStatusTo(Statuses.SYNCING);
                                syncAgain();
                            }
                        }, connectedContinuation.again);
                    }
                }
            }
        }

        db.close = override(db.close, function (origClose) {
            return function () {
                activePeers.forEach(function (peer) {
                    peer.disconnect();
                });
                return origClose.apply(this, arguments);
            }
        });

        var syncNodeSaveQueContexts = {};
        db.observable.SyncNode.prototype.save = function () {
            var node = this;
            syncNodeSaveQueContexts[node.id] = syncNodeSaveQueContexts[node.id] || {};
            return enque(syncNodeSaveQueContexts[node.id], function () {
                return db.table('_syncNodes').put(node);
            });
        }

        function enque(context, fn, instanceID) {
            function _enque () {
                if (!context.ongoingOperation) {
                    context.ongoingOperation = fn().then(function (res) { delete context.ongoingOperation; return res; });
                } else {
                    context.ongoingOperation = context.ongoingOperation.then(function () {
                        return enque(context, fn, instanceID);
                    });
                }
                return context.ongoingOperation;
            }

            if (!instanceID) {
                // Caller wants to enque it until database becomes open.
                if (db.isOpen()) {
                    return db.vip(_enque);
                } else {
                    return Promise.reject(new Error ("Database was closed"));
                }
            } else if (db._localSyncNode && instanceID === db._localSyncNode.id) {
                // DB is already open but queuer doesnt want it to be queued if database has been closed (request bound to current instance of DB)
                return db.vip(_enque);
            } else {
                return Promise.reject(new Error("Database was closed"));
            }
        }
    }



    function combineCreateAndUpdate(prevChange, nextChange) {
        var clonedChange = Dexie.deepClone(prevChange);// Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
        Object.keys(nextChange.mods).forEach(function (keyPath) {
            setByKeyPath(clonedChange.obj, keyPath, nextChange.mods[keyPath]);
        });
        return clonedChange;
    }

    function combineUpdateAndUpdate(prevChange, nextChange) {
        var clonedChange = Dexie.deepClone(prevChange); // Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
        Object.keys(nextChange.mods).forEach(function (keyPath) {
            // If prev-change was changing a parent path of this keyPath, we must update the parent path rather than adding this keyPath
            var hadParentPath = false;
            Object.keys(prevChange.mods).filter(function (parentPath) { return keyPath.indexOf(parentPath + '.') === 0 }).forEach(function (parentPath) {
                setByKeyPath(clonedChange[parentPath], keyPath.substr(parentPath.length + 1), nextChange.mods[keyPath]);
                hadParentPath = true;
            });
            if (!hadParentPath) {
                // Add or replace this keyPath and its new value
                clonedChange.mods[keyPath] = nextChange.mods[keyPath];
            }
            // In case prevChange contained sub-paths to the new keyPath, we must make sure that those sub-paths are removed since
            // we must mimic what would happen if applying the two changes after each other:
            Object.keys(prevChange.mods).filter(function (subPath) { return subPath.indexOf(keyPath + '.') === 0 }).forEach(function (subPath) {
                delete clonedChange[subPath];
            });
        });
        return clonedChange;
    }

    Dexie.Syncable.Statuses = {
        ERROR:              -1, // An irrepairable error occurred and the sync provider is dead.
        OFFLINE:            0,  // The sync provider hasnt yet become online, or it has been disconnected.
        CONNECTING:         1,  // Trying to connect to server
        ONLINE:             2,  // Connected to server and currently in sync with server
        SYNCING:            3,  // Syncing with server. For poll pattern, this is every poll call. For react pattern, this is when local changes are being sent to server.
        ERROR_WILL_RETRY:   4,  // An error occured such as net down but the sync provider will retry to connect.
    };

    Dexie.Syncable.StatusTexts = {
        "-1": "ERROR",
        "0": "OFFLINE",
        "1": "CONNECTING",
        "2": "ONLINE",
        "3": "SYNCING",
        "4": "ERROR_WILL_RETRY"
    }

    Dexie.Syncable.registeredProtocols = {}; // Map<String,ISyncProviderFactory> when key is the provider name.

    Dexie.Syncable.registerSyncProtocol = function (name, protocolInstance) {
        /// <summary>
        ///    Register a syncronization protocol that can syncronize databases with remote servers.
        /// </summary>
        /// <param name="name" type="String">Provider name</param>
        /// <param name="protocolInstance" type="ISyncProtocol">Implementation of ISyncProtocol</param>
        Dexie.Syncable.registeredProtocols[name] = protocolInstance;
    }

    // Finally, add this addon to Dexie:
    Dexie.addons.push(Dexie.Syncable);

}).apply(this, typeof module === 'undefined' || (typeof window !== 'undefined' && this == window)
? [window, function (name, value) { window[name] = value; }, true]    // Adapt to browser environment
: [global, function (name, value) { module.exports = value; }, false]); // Adapt to Node.js environment
