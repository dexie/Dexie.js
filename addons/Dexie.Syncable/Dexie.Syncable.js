/// <reference path="../../../src/Dexie.js" />
/// <reference path="../Dexie.Observable/Dexie.Observable.js" />
/// <reference path="Dexie.Syncable.SyncProtocolAPI.js" />
(function (window, publish, isBrowser, undefined) {

    var override = Dexie.override;

    Dexie.Syncable = function (db) {
    	/// <param name="db" type="Dexie"></param>
        var syncPromises = [];
        var syncProviders = [];
        var remoteProviders = [];

        var CREATE = 1,
            UPDATE = 2,
            DELETE = 3;
        var MAX_CHANGES_PER_CHUNK = 1000;
        //
        // PersistedContext : IPersistedContext
        //
        function PersistedContext(nodeID) {
            this.nodeID = nodeID;
        }
        PersistedContext.prototype.save = function () {
            // Store this instance in the syncContext property of the node it belongs to.
            return db._syncNodes.update(this.nodeID, { syncContext: this });
        }

        var weAreMaster = false;

        db.on('ready', function () {
            db.on('message', function (msg) {
                if (msg.type == 'sync') {
                    // We are master node and another non-master node wants us to do the sync.
                    var promise = db.sync(msg.protocolName, msg.url, msg.options);
                    promise.then(msg.resolve, msg.reject);
                } else if (msg.type == 'syncStatusChanged') {
                    // We are client and a master node informs us about syncStatus change.
                    // Lookup the connectedProvider and call its event
                    var remoteProvider = remoteProviders.filter(function (providerHandle) { return providerHandle.url === msg.url && providerHandle.protocolName === msg.protocolName })[0];
                    if (remoteProvider) {
                        remoteProvider._onStatusChanged.fire(msg.newStatus);
                    }
                }
            });

            weAreMaster = db._localSyncNode.isMaster; // Store this value to be able to detect if we become master

            db.on('cleanup', function (nodes, changes, intercomm, trans) {
                /// <param name="nodes" type="db.WriteableTable"></param>
                /// <param name="changes" type="db.WriteableTable"></param>
                /// <param name="intercomm" type="db.WriteableTable"></param>
                /// <param name="trans" type="db.Transaction"></param>
                if (!weAreMaster && db._localSyncNode.isMaster) {
                    // We took over the master role in Observable's cleanup method
                    weAreMaster = true;
                    nodes.filter(function (node) { return node.type == 'remote' && node.connected }).each(function (connectedRemoteNode) {
                        // There are connected remote nodes that we must take over
                        setTimeout(function () {
                            db.sync(connectedRemoteNode.syncProtocol, connectedRemoteNode.url, connectedRemoteNode.syncOptions);
                        }, 0);
                    });
                }
            });
        });


        db.sync = function (protocolName, url, options) {
            var existingPromise = syncPromises.filter(function (syncPromise) { return syncPromise.protocolName == protocolName && syncPromise.url == url; });
            if (existingPromise.length > 0) {
                // Never create multiple syncNodes with same protocolName and url. Instead, let the next call to sync() return the same promise that
                // have already been started and eventually also resolved. If promise has already resolved (node connected), calling existing promise.then() will give a callback directly.
                return existingPromise[0];
            }

            var protocolInstance = Dexie.Syncable.registeredProtocols[protocolName];

            var promise = null;
            // Add a 'status' event to the returned promise.
            var onStatusChanged = Dexie.events(finalSyncPromise, { status: 'asap' }).status;

            if (protocolInstance) {
                if (db.isOpen()) {
                    if (db._localSyncNode.isMaster) {
                        promise = sync(protocolInstance, url, options, onStatusChanged);
                    } else {
                        // Request master node to do the sync:
                        promise = db._syncNodes.where('isMaster').above(0).first(function (masterNode) {
                            // There will always be a master node. In theory we may self have become master node when we come here. But that's ok. We'll request ourselves.
                            return db.sendMessage('sync', { protocolName: protocolName, url: url, options: options }, masterNode.id, true);
                        });
                        promise.protocolName = protocolName;
                        promise.url = url;
                        promise._onStatusChanged = onStatusChanged;
                        remoteProviders.push(promise);
                        promise.catch(function (err) {
                            remoteProviders.splice(remoteProviders.indexOf(promise), 1);
                        });
                    }
                } else {
                    promise = new Promise(function (resolve, reject) {
                        db.on("ready", function syncWhenReady() {
                            db.on.ready.unsubscribe(syncWhenReady);
                            return db.sync(protocolName, url, options, onStatusChanged).then(function (result) {
                                resolve (result);
                            }).catch(function (error) {
                                // Reject the promise returned to the caller of sync():
                                reject(error);
                                // but resolve the promise that db.on("ready") waits for, because database should succeed to open even if the sync operation fails!
                            });
                        });
                    });
                }
            } else {
                throw new Error("ISyncProviderFactory " + protocolName + " is not registered in Dexie.Syncable.registerSyncProtocol()");
            }
            promise.status = Dexie.Syncable.Statuses.OFFLINE;
            promise.statusChanged = onStatusChanged.subscribe;
            promise.statusChanged(function (newStatus) {
                promise.status = newStatus;
                // Also broadcast message to other nodes about the status
                db.broadcastMessage("syncStatusChanged", { newStatus: newStatus, url: msg.url, protocolName: msg.protocolName }, false);
            });

            return promise;
        }

        //Dexie.Observable.SyncNode.prototype.get

        function sync (protocolInstance, url, options, onStatusChanged) {
            /// <param name="protocolInstance" type="ISyncProtocol"></param>
            var syncPromise = getOrCreateSyncNode().then(function (node) {
                return connectProtocol(node);
            });
            syncPromise.protocolName = protocolName;
            syncPromise.url = url;
            syncPromises.push(syncPromise);
            syncPromise.catch(function (e) {
                // If syncPromise fails, remove the promise from syncPromises so that another call to sync() tries to sync again.
                // But if promise is resolved, leave it in syncPromises so that another db.sync() call will resolve immediately when promise is online.
                syncPromises.splice(syncPromises.indexOf(syncPromise), 1);
                return Dexie.Promise.reject(e);
            });

            return syncPromise;

            function getOrCreateSyncNode() {
                return db._syncNodes.where("url").equalsIgnoreCase(url).and(function (node) { return node.syncProtocol === protocolName; }).first(function (node) {
                    if (node) {
                        // Node already there. Make syncContext become an instance of PersistedContext:
                        node.syncContext = Dexie.extend(new PersistedContext(node.id), node.syncContext);
                        return node;
                    } else {
                        // Create new node and sync everything
                        node = new Dexie.Observable.SyncNode();
                        node.myRevision = -1;
                        node.remoteRevisions = [];
                        node.type = "remote";
                        node.syncProtocol = protocolName;
                        node.syncOptions = options;
                        node.lastHeartBeat = Date.now();
                        node.dbUploadState = null;
                        return db._syncNodes.put(node).then(function (nodeId) {
                            node.syncContext = new PersistedContext(nodeId);
                            return node;
                        });
                    }
                });
            }

            function connectProtocol(node) {
                /// <param name="node" type="Dexie.Observable.SyncNode"></param>

                var connectedContinuation, providerHandle;
                onStatusChanged.fire(Dexie.Syncable.Statuses.CONNECTING);
                return doSync();

                function doSync() {
                    // Use enque() to ensure only a single promise execution at a time.
                    return enque(doSync, function () {
                        // By returning the Promise returned by getLocalChangesForNode() a final catch() on the sync() method will also catch error occurring in entire sequence.
                        return getLocalChangesForNode(node, function sendChangesToProvider(changes, remoteRevision, partial, nodeModificationsOnAck) {
                            // Create a final Promise for the entire sync() operation that will resolve when provider calls onSuccess().
                            // By creating finalPromise before calling protocolInstance.sync() it is possible for provider to call onError() immediately if it wants.
                            var finalSyncPromise = new Dexie.Promise(function (resolve, reject) {

                                protocolInstance.sync(
                                    node.syncContext,
                                    url,
                                    options,
                                    changes,
                                    remoteRevision,
                                    partial,
                                    applyRemoteChanges,
                                    onChangesAccepted,
                                    resolve,
                                    onError);

                                function onError(error, again) {
                                    reject(error);
                                    if (!isNaN(again) && again < Infinity) {
                                        setTimeout(function () {
                                            if (connectedContinuation) {
                                                onStatusChanged.fire(Dexie.Syncable.Statuses.SYNCING);
                                                doSync();
                                            }
                                        }, again);
                                        if (connectedContinuation) {
                                            onStatusChanged.fire(Dexie.Syncable.Statuses.ERROR_WILL_RETRY, error);
                                            disconnectProvider();
                                        }
                                    } else {
                                        abortTheProvider(error); // Will fire ERROR on onStatusChanged.
                                    }
                                }
                            });

                            return finalSyncPromise;

                            function onChangesAccepted() {
                                db._syncNodes.update(node, nodeModificationsOnAck);
                                // We dont know if onSuccess() was called by provider yet. If it's already called, finalPromise.then() will execute immediately,
                                // otherwise it will execute when finalSyncPromise resolves.
                                finalSyncPromise.then(continueSendingChanges);
                            }

                        });
                    });
                }


                function abortTheProvider(error) {
                    if (connectedContinuation) {
                        onStatusChanged.fire(Dexie.Syncable.Statuses.ERROR, error);
                        db._syncNodes.update(node, { connected: false });
                        disconnectProvider();
                    }
                }

                function disconnectProvider() {
                    if (connectedContinuation) {
                        if (connectedContinuation.react) {
                            try {
                                // react pattern must provide a disconnect function.
                                connectedContinuation.disconnect();
                            } catch (e) { }
                        }
                        connectedContinuation = null;// Stop poll() pattern from polling again and abortTheProvider() from being called twice.
                    }
                    if (providerHandle) {
                        syncProviders.splice(syncProviders.indexOf(providerHandle), 1);
                        providerHandle = null;
                    }
                }

                function continueSendingChanges(continuation) {
                    connectedContinuation = continuation;
                    providerHandle = {
                        disconnect: function () {
                            if (connectedContinuation) {
                                onStatusChanged.fire(Dexie.Syncable.Statuses.OFFLINE);
                                db._syncNodes.update(node, { connected: false });
                                disconnectProvider();
                            }
                        }
                    };
                    syncProviders.push(providerHandle);

                    db._syncNodes.update(node, { connected: true });

                    if (continuation.react) {
                        continueUsingReactPattern(continuation);
                    } else {
                        continueUsingPollPattern(continuation);
                    }
                }

                function continueUsingReactPattern(continuation) {
                    var changesWaiting, // Boolean
                        isWaitingForServer; // Boolean

                    db.on('changes', function () {
                        onStatusChanged.fire(Dexie.Syncable.Statuses.SYNCING);
                        if (isWaitingForServer)
                            changesWaiting = true;
                        else {
                            reactToChanges();
                        }
                    });

                    function reactToChanges() {
                        changesWaiting = false;
                        isWaitingForServer = true;
                        getLocalChangesForNode(node, function (changes, remoteRevision, partial, nodeModificationsOnAck) {
                            if (changes.length > 0) {
                                continuation.react(changes, remoteRevision, partial, function onChangesAccepted() {
                                    db._syncNodes.update(node, nodeModificationsOnAck);
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
                                    onStatusChanged.fire(Dexie.Syncable.Statuses.ONLINE);
                                }
                            }
                        }).catch(abortTheProvider);
                    }

                    reactToChanges();
                }

                function continueUsingPollPattern(continuation) {

                    function syncAgain () {
                        getLocalChangesForNode(node, function (changes, remoteRevision, partial, nodeModificationsOnAck) {

                            protocolInstance.sync(node.syncContext, url, options, changes, remoteRevision, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError);

                            function onChangesAccepted() {
                                db._syncNodes.update(node, nodeModificationsOnAck);
                            }

                            function onSuccess() {
                                if (partial && connectedContinuation) {
                                    syncAgain();
                                } else {
                                    if (connectedContinuation && !isNaN(continuation.again) && continuation.again < Infinity) {
                                        onStatusChanged.fire(Dexie.Syncable.Statuses.ONLINE);
                                        setTimeout(function () {
                                            onStatusChanged.fire(Dexie.Syncable.Statuses.SYNCING);
                                            syncAgain();
                                        }, continuation.again);
                                    } else if (isNaN(continuation.again) || continuation.again == Infinity) {
                                        disconnectProvider();
                                    }
                                }
                            }
                        }).catch(abortTheProvider);
                    }

                    syncAgain();
                }

                function getRemoteRevisionAndMaxClientRevision(node) {
                    /// <param name="node" type="Dexie.Observable.SyncNode"></param>
                    if (node.remoteRevisions.length === 0) return {
                        // No remoteRevisions have arrived yet. No limit on clientRevision and provide null as remoteRevision:
                        maxClientRevision: Infinity,
                        remoteRevision: null
                    };
                    for (var i = node.remoteRevisions.length - 1; i >= 0; --i) {
                        if (node.myRevision >= node.remoteRevisions[i].local) {
                            // Found a remoteRevision that fits node.myRevision. Return remoteRevision and eventually a roof maxClientRevision pointing out where next remoteRevision bases its changes on.
                            return {
                                maxClientRevision: i === node.remoteRevisions.length - 1 ? Infinity : node.remoteRevisions[i + 1].local,
                                remoteRevision: node.remoteRevisions[i].remote
                            }
                        }
                    }
                    // There are at least one item in the list but the server hasnt yet become up-to-date with the 0 revision from client. 
                    return {
                        maxClientRevision: node.remoteRevisions[0].local,
                        remoteRevision: null
                    };
                }

                function getLocalChangesForNode(node, cb) {
                	/// <summary>
                    ///     Based on given node's current revision and state, this function makes sure to retrieve next chunk of changes
                    ///     for that node.
                	/// </summary>
                	/// <param name="node"></param>
                    /// <param name="cb" value="function(changes, remoteRevision, partial, nodeModificationsOnAck) {}">Callback that will retrieve next chunk of changes and a boolean telling if it's a partial result or not. If truthy, result is partial and there are more changes to come. If falsy, these changes are the final result.</param>

                    if (node.myRevision >= 0) {
                        // Node is based on a revision in our local database and will just need to get the changes that has occurred since that revision.
                        var rrmc = getRemoteRevisionAndMaxClientRevision(node);
                        return getChangesSinceRevision(node.myRevision, MAX_CHANGES_PER_CHUNK, rrmc.maxClientRevision, function (changes, partial, nodeModificationsOnAck) {
                            return cb(changes, rrmc.remoteRevision, partial, nodeModificationsOnAck);
                        });
                    } else {
                        // Node hasn't got anything from our local database yet. We will need to upload entire DB to the node in the form of CREATE changes.
                        // Check if we're in the middle of already doing that:
                        if (node.dbUploadState == null) {
                            // Initiatalize dbUploadState
                            var dbUploadState = {
                                tablesToUpload: Object.keys(db._dbSchema).filter(function (name) { return db._dbSchema[name].observable; }),
                                currentTable: tablesToUpload.shift(),
                                currentKey: null
                            };
                            return db._changes.orderBy('rev').last(function (baseRevision) {
                                db._syncNodes.update(node, {"dbUploadState.baseRevision": baseRevision});
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
                        /// <param name="state" value="{tablesToUpload:[''],currentTable:'_changes',currentKey:null,baseRevision:0}"></param>
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
                                return cb(changes, null, true, {dbUploadState: state});
                            } else {
                                // Done iterating this table. Check if there are more tables to go through:
                                if (state.tablesToUpload.length == 0) {
                                    // Done iterating all tables
                                    // Now append changes occurred during our dbUpload:
                                    var rrmc = getRemoteRevisionAndMaxClientRevision(node);
                                    return getChangesSinceRevision(state.baseRevision, MAX_CHANGES_PER_CHUNK - changes.length, rrmc.maxClientRevision, function (additionalChanges, partial, nodeModificationsOnAck) {
                                        changes = changes.concat(additionalChanges);
                                        nodeModificationsOnAck.dbUploadState = null;
                                        return cb(changes, rrmc.remoteRevision, partial, nodeModificationsOnAck);
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
                            query.and(function (change) { return change.source !== ignoreSource }).until(function () {
                                if (numChanges === maxChanges) {
                                    partial = true;
                                    return true;
                                }
                            }).each(function (change) {
                                // Note the revision in nextRevision:
                                nextRevision = change.rev;
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
                                                    case UPDATE: return applyModifications(deepClone(prevChange.obj), nextChange.mods); // deep clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
                                                    case DELETE: return nextChange;  // Object created and then deleted. If it wasnt for that we MUST handle resent changes, we would skip entire change here. But what if the CREATE was sent earlier, and then CREATE/DELETE at later stage? It would become a ghost object in DB. Therefore, we MUST keep the delete change! If object doesnt exist, it wont harm!
                                                }
                                                break;
                                            case UPDATE:
                                                switch (nextChange.type) {
                                                    case CREATE: return nextChange; // Another CREATE replaces previous update.
                                                    case UPDATE: return mergeModificationSets(prevChange.mods, nextChange.mods); // Add the additional modifications to existing modification set.
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
                            return cb(changes, partial, { myRevision: nextRevision });
                        });
                    }
                }
                            

                function applyRemoteChanges(remoteChanges, remoteRevision, partial, clear) {
                    enque(applyRemoteChanges, letThrough(function () {
                        // FIXTHIS: Check what to do if clear() is true!
                        return (partial ? saveToUncommitedChanges(remoteChanges) : finallyCommitAllChanges(remoteChanges, remoteRevision))
                            .catch(function (error) {
                                onError(error, Infinity);
                            });
                    }));

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
                        })
                    }

                    function finallyCommitAllChanges(changes, remoteRevision) {

                        // 1. Open a write transaction on all tables in DB
                        return db.transaction('rw', db.tables, function () {
                            var trans = this;
                            var localRevisionBeforeChanges = 0;
                            var lastModificationPromise = null;
                            trans._changes.orderBy('rev').last(function (lastChange) {
                                // Store what revision we were at before committing the changes
                                localRevisionBeforeChanges = (lastChange && lastChange.rev) || 0;
                            }).then(function () {
                                // Specify the source. Important for the change consumer to ignore changes originated from self!
                                trans.source = node.id;
                                // 2. Apply uncommitted changes and delete each uncommitted change
                                return trans._uncommittedChanges.where('node').equals(node.id).modify(function (change) {
                                    lastModificationPromise = applyChange(change);
                                    delete this.value;
                                });
                            }).then(function () {
                                // 3. Apply last chunk of changes
                                changes.forEach(function (change) {
                                    lastModificationPromise = applyChange(change);
                                });
                                if (lastModificationPromise) return lastModificationPromise; // Wait until last modification is done, so that it's revision is created!
                            }).then(function () {
                                // Get what revision we are at now:
                                return trans._changes.orderBy('rev').last();
                            }).then(function (lastChange) {
                                var currentLocalRevision = (lastChange && lastChange.rev) || 0;
                                // 4. Update node states (remoteRevisions array and eventually myRevision)
                                return trans._syncNodes.where('id').equals(node.id).modify(function (dbNode) {
                                    // Make an atomic Array.push() into node.remoteRevisions:
                                    var remoteRevisions = dbNode.remoteRevisions || [];
                                    remoteRevisions.push({ remote: remoteRevision, local: currentLocalRevision });
                                    if (dbNode.myRevision === localRevisionBeforeChanges) {
                                        // If server was up-to-date before we added new changes from the server, update myRevision to last change
                                        // because server is still up-to-date! This is also important in order to prohibit getLocalChangesForNode() from
                                        // ever sending an empty change list to server, which would otherwise be done every second time it would send changes.
                                        dbNode.myRevision = lastChange.rev;
                                    }
                                    // Garbage collect remoteRevisions not in use anymore:
                                    if (remoteRevisions.length > 1) {
                                        for (var i = remoteRevisions.length - 1; i > 0; --i) {
                                            if (dbNode.myRevision >= remoteRevisions[i].local) {
                                                remoteRevisions.splice(0, i);
                                                break;
                                            }
                                        }
                                    }
                                    dbNode.remoteRevisions = remoteRevisions;
                                    // Also store the changes into the memory-cached node instance:
                                    node.myRevision = dbNode.myRevision;
                                    node.remoteRevisions = remoteRevisions;
                                });
                            });

                            function applyChange(change) {
                                var table = trans.tables[change.table];
                                switch (change.type) {
                                    case CREATE: return table.put(change.obj, change.key);
                                    case UPDATE: return table.update(change.key, change.mods);
                                    case DELETE: return table.delete(change.key);
                                    default: throw new Error("Change type unsupported");
                                }
                            }
                        });
                    }
                }

                function letThrough(fn) {
                    // Make ourselves VIP by setting the PSD variable letThrough = true.
                    // This will let us through to access DB even when it is blocked while the db.ready() subscribers are firing.
                    // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
                    // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
                    // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that. Therefore, we need
                    // to fix this manually here as well.
                    var outerScope = Promise.psd();
                    try {
                        Promise.PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
                        // When setting this variable we will be let through even if database is not open so we need to check that first.
                        if (!db.isOpen())
                            return Promise.reject("Database not open");
                        else
                            return fn();
                    } finally {
                        Promise.PSD = outerScope;
                    }
                }

            }
        }

        db.close = override(db.close, function (origClose) {
            syncProviders.forEach(function (provider) {
                provider.disconnect();
            });
            syncProviders.splice(0, syncProviders.length);
            syncPromises = [];
            remoteProviders = [];
            return origClose.apply(this, arguments);
        });

    }

    function enque(context, fn) {
        if (!context.ongoingOperation) {
            context.ongoingOperation = fn().then(function (res) { delete context.ongoingOperation; return res; });
            return context.ongoingOperation;
        } else {
            context.ongoingOperation = context.ongoingOperation.then(function () {
                return enque(context, fn);
            });
        }
    }

    Dexie.Syncable.Statuses = {
        ERROR_WILL_RETRY:   -2, // An error occured such as net down but the sync provider will retry to connect.
        ERROR:              -1, // An irrepairable error occurred and the sync provider is dead.
        OFFLINE:            0,  // The sync provider hasnt yet become online, or it has been disconnected.
        CONNECTING:         1,  // Trying to connect to server
        ONLINE:             2,  // Connected to server and currently in sync with server
        SYNCING:            3   // Syncing with server. For poll pattern, this is every poll call. For react pattern, this is when local changes are being sent to server.
    };

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
