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

import Dexie from 'dexie';
import 'dexie-observable';

var Promise$1 = Dexie.Promise;
function initSyncableConnect(db, connect) {
    return function syncableConnect(protocolInstance, protocolName, url, options) {
        if (db.isOpen()) {
            // Database is open
            if (!db._localSyncNode)
                throw new Error("Precondition failed: local sync node is missing. Make sure Dexie.Observable is active!");
            if (db._localSyncNode.isMaster) {
                // We are master node
                return connect(protocolInstance, protocolName, url, options, db._localSyncNode.id);
            }
            else {
                // We are not master node
                // Request master node to do the connect:
                return db.table('_syncNodes').where('isMaster').above(0).first(function (masterNode) {
                    // There will always be a master node. In theory we may self have become master node when we come here. But that's ok. We'll request ourselves.
                    return db.observable.sendMessage('connect', {
                        protocolName: protocolName,
                        url: url,
                        options: options
                    }, masterNode.id, { wantReply: true });
                });
            }
        }
        else if (db.hasBeenClosed()) {
            // Database has been closed.
            return Promise$1.reject(new Dexie.DatabaseClosedError());
        }
        else if (db.hasFailed()) {
            // Database has failed to open
            return Promise$1.reject(new Dexie.InvalidStateError("Dexie.Syncable: Cannot connect. Database has failed to open"));
        }
        else {
            // Database not yet open. It may be on its way to open, or open() hasn't yet been called.
            // Wait for it to open, then connect.
            var promise = new Promise$1(function (resolve, reject) {
                db.on("ready", function () {
                    // First, check if this is the very first time we connect to given URL.
                    // Need to know, because if it is, we should stall the promise returned to
                    // db.on('ready') to not be fulfilled until the initial sync has succeeded.
                    return db._syncNodes.get({ url: url }, function (node) {
                        // Ok, now we know whether we should await the connect promise or not.
                        // No matter, we should now connect (will maybe create the SyncNode instance
                        // representing the given URL)
                        var connectPromise = db.syncable.connect(protocolName, url, options);
                        connectPromise.then(resolve, reject); // Resolve the returned promise when connected.
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
                db.open().catch(function (ex) {
                    // If open fails, db.on('ready') may not have been called and we must
                    // reject promise with InvalidStateError
                    reject(new Dexie.InvalidStateError("Dexie.Syncable: Couldn't connect. Database failed to open", ex));
                });
            });
            return promise;
        }
    };
}

function initPersistedContext(node) {
    //
    // PersistedContext : IPersistedContext
    //
    return /** @class */ (function () {
        function PersistedContext(nodeID, otherProps) {
            this.nodeID = nodeID;
            if (otherProps)
                Dexie.extend(this, otherProps);
        }
        PersistedContext.prototype.save = function () {
            // Store this instance in the syncContext property of the node it belongs to.
            return Dexie.vip(function () {
                return node.save();
            });
        };
        return PersistedContext;
    }());
}

function initGetOrCreateSyncNode(db, protocolName, url) {
    return function getOrCreateSyncNode(options) {
        return db.transaction('rw', db._syncNodes, db._changes, function () {
            if (!url)
                throw new Error("Url cannot be empty");
            // Returning a promise from transaction scope will make the transaction promise resolve with the value of that promise.
            return db._syncNodes.where("url").equalsIgnoreCase(url).first(function (node) {
                // If we found a node it will be instanceof SyncNode as Dexie.Observable
                // maps to class
                if (node) {
                    var PersistedContext = initPersistedContext(node);
                    // Node already there. Make syncContext become an instance of PersistedContext:
                    node.syncContext = new PersistedContext(node.id, node.syncContext);
                    node.syncProtocol = protocolName; // In case it was changed (would be very strange but...) could happen...
                    node.syncOptions = options; // Options could have been changed
                    db._syncNodes.put(node);
                }
                else {
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
                    var PersistedContext_1 = initPersistedContext(node);
                    Dexie.Promise.resolve(function () {
                        // If options.initialUpload is explicitely false, set myRevision to currentRevision.
                        if (options.initialUpload === false)
                            return db._changes.toCollection().lastKey(function (currentRevision) {
                                node.myRevision = currentRevision;
                            });
                    }()).then(function () {
                        db._syncNodes.add(node).then(function (nodeID) {
                            node.syncContext = new PersistedContext_1(nodeID); // Update syncContext in db with correct nodeId.
                            db._syncNodes.put(node);
                        });
                    });
                }
                return node; // returning node will make the db.transaction()-promise resolve with this value.
            });
        });
    };
}

function initEnqueue(db) {
    return function enqueue(context, fn, instanceID) {
        function _enqueue() {
            if (!context.ongoingOperation) {
                context.ongoingOperation = Dexie.ignoreTransaction(function () {
                    return Dexie.vip(function () {
                        return fn();
                    });
                }).finally(function () {
                    delete context.ongoingOperation;
                });
            }
            else {
                context.ongoingOperation = context.ongoingOperation.then(function () {
                    return enqueue(context, fn, instanceID);
                });
            }
            return context.ongoingOperation;
        }
        if (!instanceID) {
            // Caller wants to enqueue it until database becomes open.
            if (db.isOpen()) {
                return _enqueue();
            }
            else {
                return Dexie.Promise.reject(new Dexie.DatabaseClosedError());
            }
        }
        else if (db._localSyncNode && instanceID === db._localSyncNode.id) {
            // DB is already open but queue doesn't want it to be queued if database has been closed (request bound to current instance of DB)
            return _enqueue();
        }
        else {
            return Dexie.Promise.reject(new Dexie.DatabaseClosedError());
        }
    };
}

function initSaveToUncommittedChanges(db, node) {
    return function saveToUncommittedChanges(changes, remoteRevision) {
        return db.transaction('rw!', db._uncommittedChanges, function () {
            return db._uncommittedChanges.bulkAdd(changes.map(function (change) {
                var changeWithNodeId = {
                    node: node.id,
                    type: change.type,
                    table: change.table,
                    key: change.key
                };
                if (change.obj)
                    changeWithNodeId.obj = change.obj;
                if (change.mods)
                    changeWithNodeId.mods = change.mods;
                return changeWithNodeId;
            }));
        }).then(function () {
            node.appliedRemoteRevision = remoteRevision;
            return node.save();
        });
    };
}

// Change Types
var CREATE = 1;
var UPDATE = 2;
var DELETE = 3;

function bulkUpdate(table, changes) {
    var keys = changes.map(function (c) { return c.key; });
    var map = {};
    // Retrieve current object of each change to update and map each
    // found object's primary key to the existing object:
    return table.where(':id').anyOf(keys).raw().each(function (obj, cursor) {
        map[cursor.primaryKey + ''] = obj;
    }).then(function () {
        // Filter away changes whose key wasn't found in the local database
        // (we can't update them if we do not know the existing values)
        var updatesThatApply = changes.filter(function (c) { return map.hasOwnProperty(c.key + ''); });
        // Apply modifications onto each existing object (in memory)
        // and generate array of resulting objects to put using bulkPut():
        var objsToPut = updatesThatApply.map(function (c) {
            var curr = map[c.key + ''];
            Object.keys(c.mods).forEach(function (keyPath) {
                Dexie.setByKeyPath(curr, keyPath, c.mods[keyPath]);
            });
            return curr;
        });
        return table.bulkPut(objsToPut);
    });
}

function initApplyChanges(db) {
    return function applyChanges(changes) {
        var collectedChanges = {};
        changes.forEach(function (change) {
            if (!collectedChanges.hasOwnProperty(change.table)) {
                collectedChanges[change.table] = (_a = {}, _a[CREATE] = [], _a[DELETE] = [], _a[UPDATE] = [], _a);
            }
            collectedChanges[change.table][change.type].push(change);
            var _a;
        });
        var table_names = Object.keys(collectedChanges);
        var tables = table_names.map(function (table) { return db.table(table); });
        return db.transaction("rw", tables, function () {
            table_names.forEach(function (table_name) {
                var table = db.table(table_name);
                var specifyKeys = !table.schema.primKey.keyPath;
                var createChangesToApply = collectedChanges[table_name][CREATE];
                var deleteChangesToApply = collectedChanges[table_name][DELETE];
                var updateChangesToApply = collectedChanges[table_name][UPDATE];
                if (createChangesToApply.length > 0)
                    table.bulkPut(createChangesToApply.map(function (c) { return c.obj; }), specifyKeys ?
                        createChangesToApply.map(function (c) { return c.key; }) : undefined);
                if (updateChangesToApply.length > 0)
                    bulkUpdate(table, updateChangesToApply);
                if (deleteChangesToApply.length > 0)
                    table.bulkDelete(deleteChangesToApply.map(function (c) { return c.key; }));
            });
        });
    };
}

function initFinallyCommitAllChanges(db, node) {
    var applyChanges = initApplyChanges(db);
    return function finallyCommitAllChanges(changes, remoteRevision) {
        // 1. Open a write transaction on all tables in DB
        var tablesToIncludeInTrans = db.tables.filter(function (table) { return table.name === '_changes' ||
            table.name === '_uncommittedChanges' ||
            table.schema.observable; });
        return db.transaction('rw!', tablesToIncludeInTrans, function () {
            var trans = Dexie.currentTransaction;
            var localRevisionBeforeChanges = 0;
            return db._changes.orderBy('rev').last(function (lastChange) {
                // Store what revision we were at before committing the changes
                localRevisionBeforeChanges = (lastChange && lastChange.rev) || 0;
            }).then(function () {
                // Specify the source. Important for the change consumer to ignore changes originated from self!
                trans.source = node.id;
                // 2. Apply uncommitted changes and delete each uncommitted change
                return db._uncommittedChanges.where('node').equals(node.id).toArray();
            }).then(function (uncommittedChanges) {
                return applyChanges(uncommittedChanges);
            }).then(function () {
                return db._uncommittedChanges.where('node').equals(node.id).delete();
            }).then(function () {
                // 3. Apply last chunk of changes
                return applyChanges(changes);
            }).then(function () {
                // Get what revision we are at now:
                return db._changes.orderBy('rev').last();
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
                // We are not including _syncNodes in transaction, so this save() call will execute in its own transaction.
                node.save().catch(function (err) {
                    console.warn("Dexie.Syncable: Unable to save SyncNode after applying remote changes: " + (err.stack || err));
                });
            });
        });
    };
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
    // There are at least one item in the list but the server hasn't yet become up-to-date with the 0 revision from client.
    return {
        maxClientRevision: node.remoteBaseRevisions[0].local,
        remoteBaseRevision: null
    };
}

function combineCreateAndUpdate(prevChange, nextChange) {
    var clonedChange = Dexie.deepClone(prevChange); // Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
    Object.keys(nextChange.mods).forEach(function (keyPath) {
        Dexie.setByKeyPath(clonedChange.obj, keyPath, nextChange.mods[keyPath]);
    });
    return clonedChange;
}

function combineUpdateAndUpdate(prevChange, nextChange) {
    var clonedChange = Dexie.deepClone(prevChange); // Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
    Object.keys(nextChange.mods).forEach(function (keyPath) {
        // If prev-change was changing a parent path of this keyPath, we must update the parent path rather than adding this keyPath
        var hadParentPath = false;
        Object.keys(prevChange.mods).filter(function (parentPath) { return keyPath.indexOf(parentPath + '.') === 0; }).forEach(function (parentPath) {
            Dexie.setByKeyPath(clonedChange.mods[parentPath], keyPath.substr(parentPath.length + 1), nextChange.mods[keyPath]);
            hadParentPath = true;
        });
        if (!hadParentPath) {
            // Add or replace this keyPath and its new value
            clonedChange.mods[keyPath] = nextChange.mods[keyPath];
        }
        // In case prevChange contained sub-paths to the new keyPath, we must make sure that those sub-paths are removed since
        // we must mimic what would happen if applying the two changes after each other:
        Object.keys(prevChange.mods).filter(function (subPath) { return subPath.indexOf(keyPath + '.') === 0; }).forEach(function (subPath) {
            delete clonedChange.mods[subPath];
        });
    });
    return clonedChange;
}

function mergeChange(prevChange, nextChange) {
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
}

function initGetChangesSinceRevision(db, node, hasMoreToGive) {
    return function getChangesSinceRevision(revision, maxChanges, maxRevision, cb) {
        /// <param name="cb" value="function(changes, partial, nodeModificationsOnAck) {}">Callback that will retrieve next chunk of changes and a boolean telling if it's a partial result or not. If truthy, result is partial and there are more changes to come. If falsy, these changes are the final result.</param>
        var changeSet = {};
        var numChanges = 0;
        var partial = false;
        var ignoreSource = node.id;
        var nextRevision = revision;
        return db.transaction('r', db._changes, function () {
            var query = db._changes.where('rev').between(revision, maxRevision, false, true);
            return query.until(function () {
                if (numChanges === maxChanges) {
                    partial = true;
                    return true;
                }
            }).each(function (change) {
                // Note the revision in nextRevision:
                nextRevision = change.rev;
                // change.source is set based on currentTransaction.source
                if (change.source === ignoreSource)
                    return;
                // Our _changes table contains more info than required (old objs, source etc). Just make sure to include the necessary info:
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
                }
                else {
                    // Merge the oldchange with the new change
                    var nextChange = changeToSend;
                    var mergedChange = mergeChange(prevChange, nextChange);
                    changeSet[id] = mergedChange;
                }
            });
        }).then(function () {
            var changes = Object.keys(changeSet).map(function (key) {
                return changeSet[key];
            });
            hasMoreToGive.hasMoreToGive = partial;
            return cb(changes, partial, { myRevision: nextRevision });
        });
    };
}

function initGetTableObjectsAsChanges(db, node, MAX_CHANGES_PER_CHUNK, getChangesSinceRevision, hasMoreToGive, cb) {
    return function getTableObjectsAsChanges(state, changes, collection) {
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
                obj: cursor.value
            });
            state.currentKey = cursor.key;
        }).then(function () {
            if (limitReached) {
                // Limit reached. Send partial result.
                hasMoreToGive.hasMoreToGive = true;
                return cb(changes, null, true, { dbUploadState: state });
            }
            else {
                // Done iterating this table. Check if there are more tables to go through:
                if (state.tablesToUpload.length === 0) {
                    // Done iterating all tables
                    // Now append changes occurred during our dbUpload:
                    var brmcr = getBaseRevisionAndMaxClientRevision(node);
                    return getChangesSinceRevision(state.localBaseRevision, MAX_CHANGES_PER_CHUNK - changes.length, brmcr.maxClientRevision, function (additionalChanges, partial, nodeModificationsOnAck) {
                        changes = changes.concat(additionalChanges);
                        nodeModificationsOnAck.dbUploadState = null;
                        return cb(changes, brmcr.remoteBaseRevision, partial, nodeModificationsOnAck);
                    });
                }
                else {
                    // Not done iterating all tables. Continue on next table:
                    state.currentTable = state.tablesToUpload.shift();
                    return getTableObjectsAsChanges(state, changes, db.table(state.currentTable).orderBy(':id'));
                }
            }
        });
    };
}

function initGetLocalChangesForNode(db, hasMoreToGive, partialsThreshold) {
    var MAX_CHANGES_PER_CHUNK = partialsThreshold;
    return function getLocalChangesForNode(node, cb) {
        /// <summary>
        ///     Based on given node's current revision and state, this function makes sure to retrieve next chunk of changes
        ///     for that node.
        /// </summary>
        /// <param name="node"></param>
        /// <param name="cb" value="function(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {}">Callback that will retrieve next chunk of changes and a boolean telling if it's a partial result or not. If truthy, result is partial and there are more changes to come. If falsy, these changes are the final result.</param>
        var getChangesSinceRevision = initGetChangesSinceRevision(db, node, hasMoreToGive);
        var getTableObjectsAsChanges = initGetTableObjectsAsChanges(db, node, MAX_CHANGES_PER_CHUNK, getChangesSinceRevision, hasMoreToGive, cb);
        // Only a "remote" SyncNode created by Dexie.Syncable
        // could not pass this test (remote nodes have myRevision: -1 on instantiation)
        if (node.myRevision >= 0) {
            // Node is based on a revision in our local database and will just need to get the changes that have occurred since that revision.
            var brmcr = getBaseRevisionAndMaxClientRevision(node);
            return getChangesSinceRevision(node.myRevision, MAX_CHANGES_PER_CHUNK, brmcr.maxClientRevision, function (changes, partial, nodeModificationsOnAck) {
                return cb(changes, brmcr.remoteBaseRevision, partial, nodeModificationsOnAck);
            });
        }
        else {
            // Node hasn't got anything from our local database yet. We will need to upload the entire DB to the node in the form of CREATE changes.
            // Check if we're in the middle of already doing that:
            if (node.dbUploadState === null) {
                // Initialize dbUploadState
                var tablesToUpload = db.tables.filter(function (table) {
                    return table.schema.observable;
                }).map(function (table) {
                    return table.name;
                });
                if (tablesToUpload.length === 0)
                    return Dexie.Promise.resolve(cb([], null, false, {})); // There are no synced tables at all.
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
            }
            else if (node.dbUploadState.currentKey) {
                var collection = db.table(node.dbUploadState.currentTable).where(':id').above(node.dbUploadState.currentKey);
                return getTableObjectsAsChanges(Dexie.deepClone(node.dbUploadState), [], collection);
            }
            else {
                var collection = db.table(dbUploadState.currentTable).orderBy(':id');
                return getTableObjectsAsChanges(Dexie.deepClone(node.dbUploadState), [], collection);
            }
        }
    };
}

var Statuses = {
    ERROR: -1,
    OFFLINE: 0,
    CONNECTING: 1,
    ONLINE: 2,
    SYNCING: 3,
    ERROR_WILL_RETRY: 4 // An error occurred such as net down but the sync provider will retry to connect.
};
var StatusTexts = {
    "-1": "ERROR",
    "0": "OFFLINE",
    "1": "CONNECTING",
    "2": "ONLINE",
    "3": "SYNCING",
    "4": "ERROR_WILL_RETRY"
};

var Promise$2 = Dexie.Promise;
function initConnectProtocol(db, protocolInstance, dbAliveID, options, rejectConnectPromise) {
    var enqueue = initEnqueue(db);
    var hasMoreToGive = { hasMoreToGive: true };
    function stillAlive() {
        // A better method than doing db.isOpen() because the same db instance may have been reopened, but then this sync call should be dead
        // because the new instance should be considered a fresh instance and will have another local node.
        return db._localSyncNode && db._localSyncNode.id === dbAliveID;
    }
    return function connectProtocol(node, activePeer) {
        /// <param name="node" type="db.observable.SyncNode"></param>
        var getLocalChangesForNode = initGetLocalChangesForNode(db, hasMoreToGive, protocolInstance.partialsThreshold);
        var url = activePeer.url;
        function changeStatusTo(newStatus) {
            if (node.status !== newStatus) {
                node.status = newStatus;
                node.save().then(function () {
                    db.syncable.on.statusChanged.fire(newStatus, url);
                    // Also broadcast message to other nodes about the status
                    db.observable.broadcastMessage("syncStatusChanged", { newStatus: newStatus, url: url }, false);
                }).catch('DatabaseClosedError', function () {
                });
            }
        }
        activePeer.on('disconnect', function (newStatus) {
            if (!isNaN(newStatus))
                changeStatusTo(newStatus);
        });
        var connectedContinuation;
        changeStatusTo(Statuses.CONNECTING);
        return doSync();
        function doSync() {
            // Use enqueue() to ensure only a single promise execution at a time.
            return enqueue(doSync, function () {
                // By returning the Promise returned by getLocalChangesForNode() a final catch() on the sync() method will also catch error occurring in entire sequence.
                return getLocalChangesForNode_autoAckIfEmpty(node, sendChangesToProvider);
            }, dbAliveID);
        }
        function sendChangesToProvider(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
            // Create a final Promise for the entire sync() operation that will resolve when provider calls onSuccess().
            // By creating finalPromise before calling protocolInstance.sync() it is possible for provider to call onError() immediately if it wants.
            var finalSyncPromise = new Promise$2(function (resolve, reject) {
                rejectConnectPromise.p = function (err) {
                    reject(err);
                };
                Dexie.asap(function () {
                    try {
                        protocolInstance.sync(node.syncContext, url, options, remoteBaseRevision, node.appliedRemoteRevision, changes, partial, applyRemoteChanges, onChangesAccepted, function (continuation) {
                            resolve(continuation);
                        }, onError);
                    }
                    catch (ex) {
                        onError(ex, Infinity);
                    }
                    function onError(error, again) {
                        reject(error);
                        if (stillAlive()) {
                            if (!isNaN(again) && again < Infinity) {
                                setTimeout(function () {
                                    if (stillAlive()) {
                                        changeStatusTo(Statuses.SYNCING);
                                        doSync().catch('DatabaseClosedError', abortTheProvider);
                                    }
                                }, again);
                                changeStatusTo(Statuses.ERROR_WILL_RETRY, error);
                                if (connectedContinuation && connectedContinuation.disconnect)
                                    connectedContinuation.disconnect();
                                connectedContinuation = null;
                            }
                            else {
                                abortTheProvider(error); // Will fire ERROR on statusChanged event.
                            }
                        }
                    }
                });
            });
            return finalSyncPromise.then(function () {
                // Resolve caller of db.syncable.connect() with undefined. Not with continuation!
                return undefined;
            }).finally(function () {
                // In case error happens after connect, don't try reject the connect promise anymore.
                // This is important. A Dexie unit test that verifies unhandled rejections will fail when Dexie.Syncable addon
                // is active and this happens. It would fire unhandledrejection but that we do not want.
                rejectConnectPromise.p = null;
            });
            function onChangesAccepted() {
                Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
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
                    Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
                        Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                    });
                    node.save().catch('DatabaseClosedError', function () {
                    });
                    return getLocalChangesForNode(node, autoAck);
                }
                else {
                    return cb(changes, remoteBaseRevision, partial, nodeModificationsOnAck);
                }
            });
        }
        function applyRemoteChanges(remoteChanges, remoteRevision, partial /*, clear*/) {
            var saveToUncommittedChanges = initSaveToUncommittedChanges(db, node);
            var finallyCommitAllChanges = initFinallyCommitAllChanges(db, node);
            return enqueue(applyRemoteChanges, function () {
                if (!stillAlive())
                    return Promise$2.reject(new Dexie.DatabaseClosedError());
                // FIXTHIS: Check what to do if clear() is true!
                return (partial ? saveToUncommittedChanges(remoteChanges, remoteRevision) : finallyCommitAllChanges(remoteChanges, remoteRevision))
                    .catch(function (error) {
                    abortTheProvider(error);
                    return Promise$2.reject(error);
                });
            }, dbAliveID);
        }
        //
        //
        //  Continuation Patterns Follows
        //
        //
        function continueSendingChanges(continuation) {
            if (!stillAlive()) {
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
                        }
                        catch (e) {
                        }
                    }
                    connectedContinuation = null; // Stop poll() pattern from polling again and abortTheProvider() from being called twice.
                }
            });
            if (continuation.react) {
                continueUsingReactPattern(continuation);
            }
            else {
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
            activePeer.on('disconnect', function () {
                db.on.changes.unsubscribe(onChanges);
            });
            function reactToChanges() {
                if (!connectedContinuation)
                    return;
                changesWaiting = false;
                isWaitingForServer = true;
                getLocalChangesForNode_autoAckIfEmpty(node, function (changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
                    if (!connectedContinuation)
                        return;
                    if (changes.length > 0) {
                        continuation.react(changes, remoteBaseRevision, partial, function onChangesAccepted() {
                            Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
                                Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
                            });
                            node.save().catch('DatabaseClosedError', function () {
                            });
                            // More changes may be waiting:
                            reactToChanges();
                        });
                    }
                    else {
                        isWaitingForServer = false;
                        if (changesWaiting) {
                            // A change jumped in between the time-spot of quering _changes and getting called back with zero changes.
                            // This is an expreemely rare scenario, and eventually impossible. But need to be here because it could happen in theory.
                            reactToChanges();
                        }
                        else {
                            changeStatusTo(Statuses.ONLINE);
                        }
                    }
                }).catch(function (ex) {
                    console.error("Got " + ex.message + " caught by reactToChanges");
                    abortTheProvider(ex);
                });
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
                        node.save().catch('DatabaseClosedError', function () {
                        });
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
                        }
                        else {
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
                            }
                            else {
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
                        }
                        else {
                            abortTheProvider(error); // Will fire ERROR on onStatusChanged.
                        }
                    }
                }).catch(abortTheProvider);
            }
            if (hasMoreToGive.hasMoreToGive) {
                syncAgain();
            }
            else if (connectedContinuation && !isNaN(connectedContinuation.again) && connectedContinuation.again < Infinity) {
                changeStatusTo(Statuses.ONLINE);
                setTimeout(function () {
                    if (connectedContinuation) {
                        changeStatusTo(Statuses.SYNCING);
                        syncAgain();
                    }
                }, connectedContinuation.again);
            }
            else {
                // Provider seems finished polling. Since we are never going to poll again,
                // disconnect provider and set status to OFFLINE until another call to db.syncable.connect().
                activePeer.disconnect(Statuses.OFFLINE);
            }
        }
    };
}

function initConnectFn(db, activePeers) {
    return function connect(protocolInstance, protocolName, url, options, dbAliveID) {
        /// <param name="protocolInstance" type="ISyncProtocol"></param>
        var existingPeer = activePeers.filter(function (peer) {
            return peer.url === url;
        });
        if (existingPeer.length > 0) {
            var activePeer = existingPeer[0];
            var diffObject = {};
            Dexie.getObjectDiff(activePeer.syncOptions, options, diffObject);
            // Options have been changed
            // We need to disconnect and reconnect
            if (Object.keys(diffObject).length !== 0) {
                return db.syncable.disconnect(url)
                    .then(function () {
                    return execConnect();
                });
            }
            else {
                // Never create multiple syncNodes with same protocolName and url. Instead, let the next call to connect() return the same promise that
                // have already been started and eventually also resolved. If promise has already resolved (node connected), calling existing promise.then() will give a callback directly.
                return existingPeer[0].connectPromise;
            }
        }
        function execConnect() {
            // Use an object otherwise we wouldn't be able to get the reject promise from
            // connectProtocol
            var rejectConnectPromise = { p: null };
            var connectProtocol = initConnectProtocol(db, protocolInstance, dbAliveID, options, rejectConnectPromise);
            var getOrCreateSyncNode = initGetOrCreateSyncNode(db, protocolName, url);
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
                    if (pos >= 0)
                        activePeers.splice(pos, 1);
                    if (error && rejectConnectPromise.p)
                        rejectConnectPromise.p(error);
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
// Depend on 'dexie-observable'
// To support both ES6,AMD,CJS and UMD (plain script), we just import it and then access it as "Dexie.Observable".
// That way, our plugin works in all UMD cases.
// If target platform would only be module based (ES6/AMD/CJS), we could have done 'import Observable from "dexie-observable"'.
var override = Dexie.override;
var Promise = Dexie.Promise;
var Observable = Dexie.Observable;
function Syncable(db) {
    /// <param name="db" type="Dexie"></param>
    var activePeers = [];
    var connectFn = initConnectFn(db, activePeers);
    var syncableConnect = initSyncableConnect(db, connectFn);
    db.on('message', function (msg) {
        // Message from other local node arrives...
        Dexie.vip(function () {
            if (msg.type === 'connect') {
                // We are master node and another non-master node wants us to do the connect.
                db.syncable.connect(msg.message.protocolName, msg.message.url, msg.message.options).then(msg.resolve, msg.reject);
            }
            else if (msg.type === 'disconnect') {
                db.syncable.disconnect(msg.message.url).then(msg.resolve, msg.reject);
            }
            else if (msg.type === 'syncStatusChanged') {
                // We are client and a master node informs us about syncStatus change.
                // Lookup the connectedProvider and call its event
                db.syncable.on.statusChanged.fire(msg.message.newStatus, msg.message.url);
            }
        });
    });
    db.on('cleanup', function (weBecameMaster) {
        // A cleanup (done in Dexie.Observable) may result in that a master node is removed and we become master.
        if (weBecameMaster) {
            // We took over the master role in Observable's cleanup method.
            // We should connect to remote servers now.
            // At this point, also reconnect servers with status ERROR_WILL_RETRY as well as plain ERROR.
            // Reason to reconnect to those with plain "ERROR" is that the ERROR state may occur when a database
            // connection has been closed. The new master would then be expected to reconnect.
            // Also, this is not an infinite poll(). This is rare event that a new browser tab takes over from
            // an old closed one. 
            Dexie.ignoreTransaction(function () { return Dexie.vip(function () {
                return db._syncNodes.where({ type: 'remote' })
                    .filter(function (node) { return node.status !== Statuses.OFFLINE; })
                    .toArray(function (connectedRemoteNodes) { return Promise.all(connectedRemoteNodes.map(function (node) {
                    return db.syncable.connect(node.syncProtocol, node.url, node.syncOptions).catch(function (e) {
                        console.warn("Dexie.Syncable: Could not connect to " + node.url + ". " + (e.stack || e));
                    });
                })); });
            }); }).catch('DatabaseClosedError', function () { });
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
                .and(function (node) { return node.status !== Statuses.OFFLINE; })
                .toArray(function (connectedRemoteNodes) {
                // There are connected remote nodes that we must manage (or take over to manage)
                connectedRemoteNodes.forEach(function (node) { return db.syncable.connect(node.syncProtocol, node.url, node.syncOptions)
                    .catch(function () { }); } // A failure will be triggered in on('statusChanged'). We can ignore.
                );
            }).catch('DatabaseClosedError', function () { });
        }
    }, true); // True means the ready event will survive a db reopen - db.close()/db.open()
    db.syncable = {};
    db.syncable.getStatus = function (url, cb) {
        if (db.isOpen()) {
            return Dexie.vip(function () {
                return db._syncNodes.where('url').equals(url).first(function (node) {
                    return node ? node.status : Statuses.OFFLINE;
                });
            }).then(cb);
        }
        else {
            return Promise.resolve(Syncable.Statuses.OFFLINE).then(cb);
        }
    };
    db.syncable.getOptions = function (url, cb) {
        return db.transaction('r?', db._syncNodes, function () {
            return db._syncNodes.where('url').equals(url).first(function (node) {
                return node.syncOptions;
            }).then(cb);
        });
    };
    db.syncable.list = function () {
        return db.transaction('r?', db._syncNodes, function () {
            return db._syncNodes.where('type').equals('remote').toArray(function (a) {
                return a.map(function (node) { return node.url; });
            });
        });
    };
    db.syncable.on = Dexie.Events(db, { statusChanged: "asap" });
    db.syncable.disconnect = function (url) {
        return Dexie.ignoreTransaction(function () {
            return Promise.resolve().then(function () {
                if (db._localSyncNode && db._localSyncNode.isMaster) {
                    return Promise.all(activePeers.filter(function (peer) { return peer.url === url; }).map(function (peer) {
                        return peer.disconnect(Statuses.OFFLINE);
                    }));
                }
                else {
                    return db._syncNodes.where('isMaster').above(0).first(function (masterNode) {
                        return db.observable.sendMessage('disconnect', { url: url }, masterNode.id, { wantReply: true });
                    });
                }
            }).then(function () {
                return db._syncNodes.where("url").equals(url).modify(function (node) {
                    node.status = Statuses.OFFLINE;
                });
            });
        });
    };
    db.syncable.connect = function (protocolName, url, options) {
        options = options || {}; // Make sure options is always an object because 1) Provider expects it to be. 2) We'll be persisting it and you cannot persist undefined.
        var protocolInstance = Syncable.registeredProtocols[protocolName];
        if (protocolInstance) {
            return syncableConnect(protocolInstance, protocolName, url, options);
        }
        else {
            return Promise.reject(new Error("ISyncProtocol '" + protocolName + "' is not registered in Dexie.Syncable.registerSyncProtocol()"));
        }
    };
    db.syncable.delete = function (url) {
        return db.syncable.disconnect(url).then(function () {
            return db.transaction('rw!', db._syncNodes, db._changes, db._uncommittedChanges, function () {
                // Find the node(s)
                // Several can be found, as detected by @martindiphoorn,
                // let's delete them and cleanup _uncommittedChanges and _changes 
                // accordingly.
                var nodeIDsToDelete;
                return db._syncNodes
                    .where("url").equals(url)
                    .toArray(function (nodes) { return nodes.map(function (node) { return node.id; }); })
                    .then(function (nodeIDs) {
                    nodeIDsToDelete = nodeIDs;
                    // Delete the syncNode that represents the remote endpoint.
                    return db._syncNodes.where('id').anyOf(nodeIDs).delete();
                })
                    .then(function () {
                    // In case there were uncommittedChanges belonging to this, delete them as well
                    return db._uncommittedChanges.where('node').anyOf(nodeIDsToDelete).delete();
                });
            }).then(function () {
                // Spawn background job to delete old changes, now that a node has been deleted,
                // there might be changes in _changes table that is not needed to keep anymore.
                // This is done in its own transaction, or possible several transaction to prohibit
                // starvation
                Observable.deleteOldChanges(db);
            });
        });
    };
    db.syncable.unsyncedChanges = function (url) {
        return db._syncNodes.where("url").equals(url).first(function (node) {
            return db._changes.where('rev').above(node.myRevision).toArray();
        });
    };
    db.close = override(db.close, function (origClose) {
        return function () {
            activePeers.forEach(function (peer) {
                peer.disconnect();
            });
            return origClose.apply(this, arguments);
        };
    });
    Object.defineProperty(db.observable.SyncNode.prototype, 'save', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            return db.transaction('rw?', db._syncNodes, function () {
                return db._syncNodes.put(_this);
            });
        }
    });
}
Syncable.Statuses = Statuses;
Syncable.StatusTexts = StatusTexts;
Syncable.registeredProtocols = {}; // Map<String,ISyncProviderFactory> when key is the provider name.
Syncable.registerSyncProtocol = function (name, protocolInstance) {
    /// <summary>
    ///    Register a synchronization protocol that can synchronize databases with remote servers.
    /// </summary>
    /// <param name="name" type="String">Provider name</param>
    /// <param name="protocolInstance" type="ISyncProtocol">Implementation of ISyncProtocol</param>
    var partialsThreshold = protocolInstance.partialsThreshold;
    if (typeof partialsThreshold === 'number') {
        // Don't allow NaN or negative threshold
        if (isNaN(partialsThreshold) || partialsThreshold < 0) {
            throw new Error('The given number for the threshold is not supported');
        }
        // If the threshold is 0 we will not send any client changes but will get server changes
    }
    else {
        // Use Infinity as the default so simple protocols don't have to care about partial synchronization
        protocolInstance.partialsThreshold = Infinity;
    }
    Syncable.registeredProtocols[name] = protocolInstance;
};
// Register addon in Dexie:
Dexie.Syncable = Syncable;
Dexie.addons.push(Syncable);

export default Syncable;
//# sourceMappingURL=dexie-syncable.es.js.map
