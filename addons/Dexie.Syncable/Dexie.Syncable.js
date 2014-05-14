/// <reference path="../../../src/Dexie.js" />
/// <reference path="../Dexie.Observable/Dexie.Observable.js" />
/// <reference path="Dexie.Syncable.SyncProtocolAPI.js" />
(function (window, publish, isBrowser, undefined) {

    var override = Dexie.override;

    Dexie.Syncable = function (db) {
    	/// <param name="db" type="Dexie"></param>
        var syncPromises = [];
        var syncProviders = [];
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
            //return db._syncNodes.where("id").equals(this.nodeID).modify({ syncContext: this });
        }


        db.on('ready', function () {
            db.on.message.subscribe(function (msg) {
                if (msg.type == 'sync') {
                    db.sync(msg.protocolName, msg.url, msg.options).then(msg.resolve, msg.reject);
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

            if (protocolInstance) {
                if (db.isOpen()) {
                    if (db._localSyncNode.isMaster) {
                        return sync(protocolInstance, url, options);
                    } else {
                        // Request master node to do the sync:
                        return db._syncNodes.where('isMaster').above(0).first(function (masterNode) {
                            // There will always be a master node. In theory we may self have become master node when we come here. But that's ok. We'll request ourselves.
                            return db.sendMessage('sync', { protocolName: protocolName, url: url, options: options }, masterNode.id, true);
                        });
                    }
                } else {
                    return new Promise(function (resolve, reject) {
                        db.on("ready", function syncWhenReady() {
                            db.on.ready.unsubscribe(syncWhenReady);
                            return db.sync (protocolName, url, options).then(function (result) {
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
        }

        //Dexie.Observable.SyncNode.prototype.get

        function sync (protocolInstance, url, options) {
            /// <param name="protocolInstance" type="ISyncProtocol"></param>
            var syncPromise = getOrCreateSyncNode().then(function (node) {
                return connectProtocol(node);
            });
            syncPromise.protocolName = protocolName;
            syncPromise.url = url;
            syncPromises.push(syncPromise);
            syncPromise.catch(function (e) {
                // If syncPromise fails, remove the promise from syncPromises so that another call to sync() tries to sync again.
                syncPromises.splice(syncPromises.indexOf(syncPromise), 1);
                return Promise.reject(e);
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

                var resolveSyncPromise,
                    rejectSyncPromise,
                    connectedContinuation;


                return doSync();

                function doSync() {
                    // Use enque() to ensure only a single promise execution at a time.
                    return enque(doSync, function () {
                        // By returning the Promise returned by getLocalChangesForNode() a final catch() on the sync() method will also catch error occurring in entire sequence.
                        return getLocalChangesForNode(node, function sendChangesToProvider(changes, remoteRevision, partial, nodeModificationsOnAck) {
                            // Create a final Promise for the entire sync() operation that will resolve when provider calls onSuccess().
                            // By creating finalPromise before calling protocolInstance.sync() it is possible for provider to call onError() immediately if it wants.
                            var finalSyncPromise = new Dexie.Promise(function (resolve, reject) {
                                rejectSyncPromise = reject;
                                protocolInstance.sync(node.syncContext, url, options, changes, remoteRevision, partial, applyRemoteChanges, onChangesAccepted, resolve, onError);
                            });

                            return finalSyncPromise;

                            function onChangesAccepted() {
                                db._syncNodes.update(node, nodeModificationsOnAck);
                                // We dont know if onSuccess() was called by provied yet. If it's already called, finalPromise.then() will execute immediately.
                                finalSyncPromise.then(continueSendingChanges);
                                /*finalSyncPromise.then(function (continuation) {
                                    if (partial) {
                                        // Not finished sending changes to provider. Finish off that first and then start listening to changes

                                        // Not all local changes where retrieved. Continue retrieving!
                                        getLocalChangesForNode(node, sendChangesToProvider).catch(abortTheProvider); // If error occur when sending changes, make sure to abort the provider
                                    } else {
                                        // FIXTHIS: Start subscribing on db.on.changes
                                    }
                                });*/
                            }
                        });
                    });
                }

                function onError(error, again) {
                    rejectSyncPromise(error);
                    if (!isNaN(again) && again < Infinity) {
                        setTimeout(doSync, again);
                    }
                    abortTheProvider(error);
                }

                function abortTheProvider(error) {
                    if (connectedContinuation && connectedContinuation.react) {
                        try {
                            connectedContinuation.disconnect();
                        } catch (e) { }
                        connectedContinuation.again = Infinity; // Stop poll() pattern from polling again.
                        connectedContinuation = null;
                    }
                    // FIXTHIS: Notify some framework thingie (status or whatever) that the error has occurred.
                }

                function continueSendingChanges(continuation) {
                    connectedContinuation = continuation;
                    if (continuation.react) {
                        continueUsingReactPattern(continuation);
                    } else {
                        continuaUsingPollPattern(continuation);
                    }
                }

                function continueUsingReactPattern(continuation) {
                    var changesWaiting, // Boolean
                        isWaitingForServer; // Boolean

                    db.on('changes', function () {
                        if (isWaitingForServer)
                            changesWaiting = true;
                        else
                            reactToChanges();
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
                                    if (connectedContinuation && !isNaN(continuation.again)) {
                                        setTimeout(syncAgain, continuation.again);
                                    }
                                }
                            }
                        }).catch(abortTheProvider);
                    }
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
                            trans._changes.orderBy('rev').last(function (lastChange) {
                                // Store what revision we were at before committing the changes
                                localRevisionBeforeChanges = (lastChange && lastChange.rev) || 0;
                            }).then(function () {
                                // Specify the source. Important for the change consumer to ignore changes originated from self!
                                trans.source = node.id;
                                // 2. Apply uncommitted changes and delete each uncommitted change
                                return trans._uncommittedChanges.where('node').equals(node.id).modify(function (change) {
                                    applyChange(change);
                                    delete this.value;
                                });
                            }).then(function () {
                                // 3. Apply last chunk of changes
                                changes.forEach(applyChange);
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
                                        // In server was up-to-date before we added new changes from the server, update myRevision to last change
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
                                    case CREATE:
                                        table.put(change.obj, change.key);
                                        break;
                                    case UPDATE:
                                        table.update(change.key, change.mods);
                                        break;
                                    case DELETE:
                                        table.delete(change.key);
                                        break;
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
            syncProviders.splice(0, syncPromises.length);
            syncPromises = [];
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
