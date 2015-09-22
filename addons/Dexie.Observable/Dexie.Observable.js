/// <reference path="../../src/Dexie.js" />
/*
 * Disclaimber: This addon is in alpha status meaning that
 * its API and behavior may change.
 */

(function(window, define, undefined) {

    "use strict";

    define("Dexie.Observable", ["Dexie"], function(Dexie) {

        /** class DatabaseChange
         *
         *  Object contained by the _changes table.
         */
        var DatabaseChange = Dexie.defineClass({
            rev: Number, // Auto-incremented primary key
            source: String, // Optional source creating the change. Set if transaction.source was set when doing the operation.
            table: String, // Table name
            key: Object, // Primary key. Any type.
            type: Number, // 1 = CREATE, 2 = UPDATE, 3 = DELETE
            obj: Object, // CREATE: obj contains the object created.
            mods: Object, // UPDATE: mods contains the modifications made to the object.
            oldObj: Object // DELETE: oldObj contains the object deleted. UPDATE: oldObj contains the old object before updates applied.
        });


        // Import some usable helper functions
        var override = Dexie.override;
        var Promise = Dexie.Promise;
        var browserIsShuttingDown = false;

        function Observable(db) {
            /// <summary>
            ///   Extension to Dexie providing Syncronization capabilities to Dexie.
            /// </summary>
            /// <param name="db" type="Dexie"></param>

            var NODE_TIMEOUT = 20000, // 20 seconds before local db instances are timed out. This is so that old changes can be deleted when not needed and to garbage collect old _syncNodes objects.
                HIBERNATE_GRACE_PERIOD = 20000, // 20 seconds
                // LOCAL_POLL: The time to wait before polling local db for changes and cleaning up old nodes. 
                // Polling for changes is a fallback only needed in certain circomstances (when the onstorage event doesnt reach all listeners - when different browser windows doesnt share the same process)
                LOCAL_POLL = 2000, // 1 second. In real-world there will be this value + the time it takes to poll().
                CREATE = 1,
                UPDATE = 2,
                DELETE = 3;

            var localStorage = Observable.localStorageImpl;

            /** class SyncNode
             *
             * Object contained in the _syncNodes table.
             */
            var SyncNode = Dexie.defineClass({
                //id: Number,
                myRevision: Number,
                type: String, // "local" or "remote"
                lastHeartBeat: Number,
                deleteTimeStamp: Number, // In case lastHeartBeat is too old, a value of now + HIBERNATE_GRACE_PERIOD will be set here. If reached before node wakes up, node will be deleted.
                url: String, // Only applicable for "remote" nodes. Only used in Dexie.Syncable.
                isMaster: Number, // 1 if true. Not using Boolean because it's not possible to index Booleans in IE implementation of IDB.

                // Below properties should be extended in Dexie.Syncable. Not here. They apply to remote nodes only (type == "remote"):
                syncProtocol: String, // Tells which implementation of ISyncProtocol to use for remote syncing. 
                syncContext: null,
                syncOptions: Object,
                connected: false, // FIXTHIS: Remove! Replace with status.
                status: Number,
                appliedRemoteRevision: null,
                remoteBaseRevisions: [{ local: Number, remote: null }],
                dbUploadState: {
                    tablesToUpload: [String],
                    currentTable: String,
                    currentKey: null,
                    localBaseRevision: Number
                }
            });


            var mySyncNode = null;

            // Allow other addons to access the local sync node. May be needed by Dexie.Syncable.
            Object.defineProperty(db, "_localSyncNode", {
                get: function() { return mySyncNode; }
            });

            var pollHandle = null;

            Dexie.fakeAutoComplete(function() {
                db.version(1).stores({
                    _syncNodes: "++id,myRevision,lastHeartBeat",
                    _changes: "++rev",
                    _intercomm: "++id,destinationNode",
                    _uncommittedChanges: "++id,node"
                });
                db._syncNodes.mapToClass(SyncNode);
                db._changes.mapToClass(DatabaseChange);
                mySyncNode = new SyncNode({
                    myRevision: 0,
                    type: "local",
                    lastHeartBeat: Date.now(),
                    deleteTimeStamp: null
                });
            });


            //
            // Override parsing the stores to add "_changes" and "_syncNodes" tables.
            //
            db.Version.prototype._parseStoresSpec = override(db.Version.prototype._parseStoresSpec, function(origFunc) {
                return function(stores, dbSchema) {
                    // Create the _changes and _syncNodes tables
                    stores["_changes"] = "++rev";
                    stores["_syncNodes"] = "++id,myRevision,lastHeartBeat,url,isMaster,type,status";
                    stores["_intercomm"] = "++id,destinationNode";
                    stores["_uncommittedChanges"] = "++id,node"; // For remote syncing when server returns a partial result.
                    // Call default implementation. Will populate the dbSchema structures.
                    origFunc.call(this, stores, dbSchema);
                    // Allow UUID primary keys using $$ prefix on primary key or indexes
                    Object.keys(dbSchema).forEach(function(tableName) {
                        var schema = dbSchema[tableName];
                        if (schema.primKey.name.indexOf('$$') === 0) {
                            schema.primKey.uuid = true;
                            schema.primKey.name = schema.primKey.name.substr(2);
                            schema.primKey.keyPath = schema.primKey.keyPath.substr(2);
                        }
                    });
                    // Now mark all observable tables
                    Object.keys(dbSchema).forEach(function(tableName) {
                        // Marked observable tables with "observable" in their TableSchema.
                        if (tableName.indexOf('_') !== 0 && tableName.indexOf('$') !== 0) {
                            dbSchema[tableName].observable = true;
                        }
                    });
                };
            });

            //
            // Make sure to subscribe to "creating", "updating" and "deleting" hooks for all observable tables that were created in the stores() method.
            //
            db._tableFactory = override(db._tableFactory, function(origCreateTable) {
                return function createTable(mode, tableSchema, transactionPromiseFactory) {
                    var table = origCreateTable.apply(this, arguments);
                    if (table.schema.observable && transactionPromiseFactory === db._transPromiseFactory) { // Only crudMonitor when creating 
                        crudMonitor(table);
                    }
                    if (table.name === "_syncNodes" && transactionPromiseFactory === db._transPromiseFactory) {
                        table.mapToClass(SyncNode);
                    }
                    return table;
                };
            });

            // changes event on db:
            db.on.addEventType({
                changes: 'asap',
                cleanup: [promisableChain, nop], // fire (nodesTable, changesTable, trans). Hook called when cleaning up nodes. Subscribers may return a Promise to to more stuff. May do additional stuff if local sync node is master.
                message: 'asap'
            });

            //
            // Overide transaction creation to always include the "_changes" store when any observable store is involved.
            //
            db._createTransaction = override(db._createTransaction, function (origFunc) {
                return function (mode, storenames, dbschema, parent) {
                    if (db.dynamicallyOpened()) return origFunc.apply(this, arguments); // Don't observe dynamically opened databases.
                    var addChanges = false;
                    if (mode === 'readwrite' && storenames.some(function(storeName) { return dbschema[storeName] && dbschema[storeName].observable; })) {
                        // At least one included store is a observable store. Make sure to also include the _changes store.
                        addChanges = true;
                        storenames = storenames.slice(0); // Clone
                        if (storenames.indexOf("_changes") === -1)
                            storenames.push("_changes"); // Otherwise, firefox will hang... (I've reported the bug to Mozilla@Bugzilla)
                    }
                    // Call original db._createTransaction()
                    var trans = origFunc.call(this, mode, storenames, dbschema, parent);
                    // If this transaction is bound to any observable table, make sure to add changes when transaction completes.
                    if (addChanges) {
                        trans._lastWrittenRevision = 0;
                        trans.on('complete', function() {
                            if (trans._lastWrittenRevision) {
                                // Changes were written in this transaction.
                                if (!parent) {
                                    // This is root-level transaction, i.e. a physical commit has happened.
                                    // Delay-trigger a wakeup call:
                                    if (wakeupObservers.timeoutHandle) clearTimeout(wakeupObservers.timeoutHandle);
                                    wakeupObservers.timeoutHandle = setTimeout(function() {
                                        delete wakeupObservers.timeoutHandle;
                                        wakeupObservers(trans._lastWrittenRevision);
                                    }, 25);
                                } else {
                                    // This is just a virtual commit of a sub transaction.
                                    // Wait with waking up observers until root transaction has committed.
                                    // Make sure to mark root transaction so that it will wakeup observers upon commit.
                                    var rootTransaction = (function findRootTransaction(trans) {
                                        return trans.parent ? findRootTransaction(trans.parent) : trans;
                                    })(parent);
                                    rootTransaction._lastWrittenRevision = Math.max(
                                        trans._lastWrittenRevision,
                                        rootTransaction.lastWrittenRevision || 0);
                                }
                            }
                        });
                        // Derive "source" property from parent transaction by default
                        if (trans.parent && trans.parent.source) trans.source = trans.parent.source;
                    }
                    return trans;
                };
            });

            // If Observable.latestRevsion[db.name] is undefined, set it to 0 so that comparing against it always works.
            // You might think that it will always be undefined before this call, but in case another Dexie instance in the same
            // window with the same database name has been created already, this static property will already be set correctly.
            Observable.latestRevision[db.name] = Observable.latestRevision[db.name] || 0;

            function wakeupObservers(lastWrittenRevision) {
                // Make sure Observable.latestRevision[db.name] is still below our value, now when some time has elapsed and other db instances in same window possibly could have made changes too.
                if (Observable.latestRevision[db.name] < lastWrittenRevision) {
                    // Set the static property lastRevision[db.name] to the revision of the last written change.
                    Observable.latestRevision[db.name] = lastWrittenRevision;
                    // Wakeup ourselves, and any other db instances on this window:
                    Dexie.ignoreTransaction(function() {
                        Observable.on('latestRevisionIncremented').fire(db.name, lastWrittenRevision);
                    });
                    // Observable.on.latestRevisionIncremented will only wakeup db's in current window.
                    // We need a storage event to wakeup other windwos.
                    // Since indexedDB lacks storage events, let's use the storage event from WebStorage just for
                    // the purpose to wakeup db instances in other windows.
                    localStorage.setItem('Dexie.Observable/latestRevision/' + db.name, lastWrittenRevision); // In IE, this will also wakeup our own window. However, onLatestRevisionIncremented will work around this by only running once per revision id.
                }
            }

            db.close = override(db.close, function(origClose) {
                return function () {
                    if (db.dynamicallyOpened()) return origClose.apply(this, arguments); // Don't observe dynamically opened databases.
                    // Teardown our framework.
                    if (wakeupObservers.timeoutHandle) {
                        clearTimeout(wakeupObservers.timeoutHandle);
                        delete wakeupObservers.timeoutHandle;
                    }
                    Observable.on('latestRevisionIncremented').unsubscribe(onLatestRevisionIncremented);
                    Observable.on('suicideNurseCall').unsubscribe(onSuicide);
                    Observable.on('intercomm').unsubscribe(onIntercomm);
                    Observable.on('beforeunload').unsubscribe(onBeforeUnload);
                    // Inform other db instances in same window that we are dying:
                    if (mySyncNode && mySyncNode.id) {
                        Observable.on.suicideNurseCall.fire(db.name, mySyncNode.id);
                        // Inform other windows as well:
                        localStorage.setItem('Dexie.Observable/deadnode:' + mySyncNode.id.toString() + '/' + db.name, "dead"); // In IE, this will also wakeup our own window. cleanup() may trigger twice per other db instance. But that doesnt to anything.
                        mySyncNode.deleteTimeStamp = 1; // One millisecond after 1970. Makes it occur in the past but still keeps it truthy.
                        mySyncNode.lastHeartBeat = 0;
                        db._syncNodes.put(mySyncNode); // This async operation may be cancelled since the browser is closing down now.
                        mySyncNode = null;
                    }

                    if (pollHandle) clearTimeout(pollHandle);
                    pollHandle = null;
                    return origClose.apply(this, arguments);
                };
            });

            // Override Dexie.delete() in order to delete Observable.latestRevision[db.name].
            db.delete = override(db.delete, function(origDelete) {
                return function() {
                    return origDelete.apply(this, arguments).then(function(result) {
                        // Reset Observable.latestRevision[db.name]
                        Observable.latestRevision[db.name] = 0;
                        return result;
                    });
                };
            });

            //
            // The Creating/Updating/Deleting hook will make sure any change is stored to the changes table
            //
            function crudMonitor(table) {
                /// <param name="table" type="db.Table"></param>
                var tableName = table.name;

                table.hook('creating').subscribe(function(primKey, obj, trans) {
                    /// <param name="trans" type="db.Transaction"></param>
                    var rv = undefined;
                    if (primKey === undefined && table.schema.primKey.uuid) {
                        primKey = rv = Observable.createUUID();
                        if (table.schema.primKey.keyPath) {
                            Dexie.setByKeyPath(obj, table.schema.primKey.keyPath, primKey);
                        }
                    }

                    var change = {
                        source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
                        table: tableName,
                        key: primKey === undefined ? null : primKey,
                        type: CREATE,
                        obj: obj
                    };

                    var promise = trans.tables._changes.add(change).then(function(rev) {
                        trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
                        return rev;
                    });

                    // Wait for onsuccess so that we have the primKey if it is auto-incremented and update the change item if so.
                    this.onsuccess = function(resultKey) {
                        if (primKey != resultKey)
                            promise._then(function() {
                                change.key = resultKey;
                                trans.tables._changes.put(change);
                            });
                    }
                    this.onerror = function(err) {
                        // If the main operation fails, make sure to regret the change
                        promise._then(function(rev) {
                            // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
                            trans.tables._changes.delete(rev);
                        });
                    }

                    return rv;
                });

                table.hook('updating').subscribe(function(mods, primKey, oldObj, trans) {
                    /// <param name="trans" type="db.Transaction"></param>
                    // mods may contain property paths with undefined as value if the property
                    // is being deleted. Since we cannot persist undefined we need to act
                    // like those changes is setting the value to null instead.
                    var modsWithoutUndefined = {};
                    // As of current Dexie version (1.0.3) hook may be called even if it wouldnt really change.
                    // Therefore we may do that kind of optimization here - to not add change entries if
                    // there's nothing to change.
                    var anythingChanged = false;
                    var newObj = Dexie.deepClone(oldObj);
                    for (var propPath in mods) {
                        var mod = mods[propPath];
                        if (typeof mod === 'undefined') {
                            Dexie.delByKeyPath(newObj, propPath);
                            modsWithoutUndefined[propPath] = null; // Null is as close we could come to deleting a property when not allowing undefined.
                            anythingChanged = true;
                        } else {
                            var currentValue = Dexie.getByKeyPath(oldObj, propPath);
                            if (mod !== currentValue && JSON.stringify(mod) !== JSON.stringify(currentValue)) {
                                Dexie.setByKeyPath(newObj, propPath, mod);
                                modsWithoutUndefined[propPath] = mod;
                                anythingChanged = true;
                            }
                        }
                    }
                    if (anythingChanged) {
                        var change = {
                            source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
                            table: tableName,
                            key: primKey,
                            type: UPDATE,
                            mods: modsWithoutUndefined,
                            oldObj: oldObj,
                            obj: newObj
                        };
                        var promise = trans.tables._changes.add(change); // Just so we get the correct revision order of the update...
                        this.onsuccess = function() {
                            promise._then(function(rev) {
                                trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
                            });
                        };
                        this.onerror = function(err) {
                            // If the main operation fails, make sure to regret the change.
                            promise._then(function(rev) {
                                // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
                                trans.tables._changes.delete(rev);
                            });
                        };
                    }
                });

                table.hook('deleting').subscribe(function(primKey, obj, trans) {
                    /// <param name="trans" type="db.Transaction"></param>
                    var promise = trans.tables._changes.add({
                        source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
                        table: tableName,
                        key: primKey,
                        type: DELETE,
                        oldObj: obj
                    }).then(function(rev) {
                        trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
                        return rev;
                    });
                    this.onerror = function() {
                        // If the main operation fails, make sure to regret the change.
                        // Using _then because if promise is already fullfilled, the standard then() would
                        // do setTimeout() and we would loose the transaction.
                        promise._then(function(rev) {
                            // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
                            trans.tables._changes.delete(rev);
                        });
                    };
                });
            }

            // When db opens, make sure to start monitor any changes before other db operations will start.
            db.on("ready", function startObserving() {
                if (db.dynamicallyOpened()) return db; // Don't observe dynamically opened databases.
                return db.table("_changes").orderBy("rev").last(function(lastChange) {
                    // Since startObserving() is called before database open() method, this will be the first database operation enqueued to db.
                    // Therefore we know that the retrieved value will be This query will
                    var latestRevision = (lastChange ? lastChange.rev : 0);
                    mySyncNode = new SyncNode({
                        myRevision: latestRevision,
                        type: "local",
                        lastHeartBeat: Date.now(),
                        deleteTimeStamp: null,
                        isMaster: 0
                    });
                    if (Observable.latestRevision[db.name] < latestRevision) {
                        // Side track . For correctness whenever setting Observable.latestRevision[db.name] we must make sure the event is fired if increased:
                        // There are other db instances in same window that hasnt yet been informed about a new revision
                        Observable.latestRevision[db.name] = latestRevision;
                        Dexie.ignoreTransaction(function() {
                            Observable.on.latestRevisionIncremented.fire(latestRevision);
                        });
                    }
                    // Add new sync node or if this is a reopening of the database after a close() call, update it.
                    return db.transaction('rw', '_syncNodes', function() {
                        db._syncNodes.where('isMaster').equals(1).count(function(anyMasterNode) {
                            if (!anyMasterNode) {
                                // There's no master node. Let's take that role then.
                                mySyncNode.isMaster = 1;
                            }
                            // Add our node to DB and start subscribing to events
                            db._syncNodes.add(mySyncNode).then(function() {
                                Observable.on('latestRevisionIncremented', onLatestRevisionIncremented); // Wakeup when a new revision is available.
                                Observable.on('beforeunload', onBeforeUnload);
                                Observable.on('suicideNurseCall', onSuicide);
                                Observable.on('intercomm', onIntercomm);
                                // Start polling for changes and do cleanups:
                                pollHandle = setTimeout(poll, LOCAL_POLL);
                            });
                        });
                    }).then(cleanup);
                    //cleanup();
                    //});
                });
            }, true); // True means the on(ready) event will survive a db reopening (db.close() / db.open()).

            var handledRevision = 0;

            function onLatestRevisionIncremented(dbname, latestRevision) {
                if (dbname === db.name) {
                    if (handledRevision >= latestRevision) return; // Make sure to only run once per revision. (Workaround for IE triggering storage event on same window)
                    handledRevision = latestRevision;
                    Dexie.vip(function() {
                        readChanges(latestRevision);
                    });
                }
            }

            function readChanges(latestRevision, recursion, wasPartial) {
                // Whenever changes are read, fire db.on("changes") with the array of changes. Eventually, limit the array to 1000 entries or so (an entire database is
                // downloaded from server AFTER we are initiated. For example, if first sync call fails, then after a while we get reconnected. However, that scenario
                // should be handled in case database is totally empty we should fail if sync is not available)
                if (!recursion && readChanges.ongoingOperation) {
                    // We are already reading changes. Prohibit a parallell execution of this which would lead to duplicate trigging of 'changes' event.
                    // Instead, the callback in toArray() will always check Observable.latestRevision[db.name] to see if it has changed and if so, re-launch readChanges().
                    // The caller should get the Promise instance from the ongoing operation so that the then() method will resolve when operation is finished.
                    return readChanges.ongoingOperation;
                }

                var partial = false;
                var ourSyncNode = mySyncNode; // Because mySyncNode can suddenly be set to null on database close, and worse, can be set to a new value if database is reopened.
                if (!ourSyncNode) {
                    return Promise.reject("Database closed");
                }
                var promise = db._changes.where("rev").above(ourSyncNode.myRevision).limit(1000).toArray(function(changes) {
                    if (changes.length > 0) {
                        var lastChange = changes[changes.length - 1];
                        partial = (changes.length === 1000); // Same as limit.
                        // Let all objects pass through the READING hook before notifying our listeners:
                        changes.forEach(function(change) {
                            var table = db.table(change.table);
                            if (change.obj) change.obj = table.hook.reading.fire(change.obj);
                            if (change.oldObj) change.oldObj = table.hook.reading.fire(change.oldObj);
                        });
                        db.on('changes').fire(changes, partial);
                        ourSyncNode.myRevision = lastChange.rev;
                    } else if (wasPartial) {
                        // No more changes, BUT since we have triggered on('changes') with partial = true,
                        // we HAVE TO trigger changes again with empty list and partial = false
                        db.on('changes').fire([], false);
                    }

                    return db.table("_syncNodes").update(ourSyncNode, {
                        lastHeartBeat: Date.now(),
                        deleteTimeStamp: null // Reset "deleteTimeStamp" flag if it was there.
                    });
                }).then(function(nodeWasUpdated) {
                    if (!nodeWasUpdated) {
                        // My node has been deleted. We must have been lazy and got removed by another node.
                        if (browserIsShuttingDown) {
                            throw new Error("Browser is shutting down");
                        } else {
                            db.close();
                            console.error("Out of sync"); // TODO: What to do? Reload the page?
                            if (window.location) window.location.reload(true);
                            throw new Error("Out of sync"); // Will make current promise reject
                        }
                    }

                    // Check if more changes have come since we started reading changes in the first place. If so, relaunch readChanges and let the ongoing promise not
                    // resolve until all changes have been read.
                    if (partial || Observable.latestRevision[db.name] > ourSyncNode.myRevision) {
                        // Either there were more than 1000 changes or additional changes where added while we were reading these changes,
                        // In either case, call readChanges() again until we're done.
                        return readChanges(Observable.latestRevision[db.name], (recursion || 0) + 1, partial);
                    }

                }).finally(function() {
                    delete readChanges.ongoingOperation;
                });

                if (!recursion) {
                    readChanges.ongoingOperation = promise;
                }
                return promise;
            }


            function poll() {
                pollHandle = null;
                var currentInstance = mySyncNode.id;
                Dexie.vip(function() { // VIP ourselves. Otherwise we might not be able to consume intercomm messages from master node before database has finished opening. This would make DB stall forever. Cannot rely on storage-event since it may not always work in some browsers of different processes.
                    readChanges(Observable.latestRevision[db.name]).then(cleanup).then(consumeIntercommMessages).finally(function() {
                        // Poll again in given interval:
                        if (mySyncNode && mySyncNode.id === currentInstance) {
                            pollHandle = setTimeout(poll, LOCAL_POLL);
                        }
                    });
                });
            }

            function cleanup() {
                var ourSyncNode = mySyncNode;
                if (!ourSyncNode) return Promise.reject("Database closed");
                return db.transaction('rw', '_syncNodes', '_changes', '_intercomm', function() {
                    // Cleanup dead local nodes that has no heartbeat for over a minute
                    // Dont do the following:
                    //nodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).and(function (node) { return node.type == "local"; }).delete();
                    // Because client may have been in hybernate mode and recently woken up. That would lead to deletion of all nodes.
                    // Instead, we should mark any old nodes for deletion in a minute or so. If they still dont wakeup after that minute we could consider them dead.
                    var weBecameMaster = false;
                    db._syncNodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).and(function(node) { return node.type === 'local'; }).modify(function(node) {
                        if (node.deleteTimeStamp && node.deleteTimeStamp < Date.now()) {
                            // Delete the node.
                            delete this.value;
                            // Cleanup localStorage "deadnode:" entry for this node (localStorage API was used to wakeup other windows (onstorage event) - an event type missing in indexedDB.)
                            localStorage.removeItem('Dexie.Observable/deadnode:' + node.id + '/' + db.name);
                            // Check if we are deleting a master node
                            if (node.isMaster) {
                                // The node we are deleting is master. We must take over that role.
                                // OK to call nodes.update(). No need to call Dexie.vip() because nodes is opened in existing transaction!
                                db._syncNodes.update(ourSyncNode, { isMaster: 1 });
                                weBecameMaster = true;
                            }
                            // Cleanup intercomm messages destinated to the node being deleted:
                            db._intercomm.where("destinationNode").equals(node.id).modify(function(msg) {
                                // OK to call intercomm. No need to call Dexie.vip() because intercomm is opened in existing transaction!
                                // Delete the message from DB and if someone is waiting for reply, let ourselved answer the request.
                                delete this.value;
                                if (msg.wantReply) {
                                    // Message wants a reply, meaning someone must take over its messages when it dies. Let us be that one!
                                    Dexie.ignoreTransaction(function() {
                                        consumeMessage(msg);
                                    });
                                }
                            });
                        } else if (!node.deleteTimeStamp) {
                            // Mark the node for deletion
                            node.deleteTimeStamp = Date.now() + HIBERNATE_GRACE_PERIOD;
                        }
                    }).then(function() {
                        // Cleanup old revisions that no node is interested of.
                        return db._syncNodes.orderBy("myRevision").first(function(oldestNode) {
                            return db._changes.where("rev").below(oldestNode.myRevision).delete();
                        });
                    }).then(function() {
                        return db.on("cleanup").fire(weBecameMaster);
                    });
                });
            }


            function onBeforeUnload(event) {
                // Mark our own sync node for deletion.
                if (!mySyncNode) return;
                browserIsShuttingDown = true;
                mySyncNode.deleteTimeStamp = 1; // One millisecond after 1970. Makes it occur in the past but still keeps it truthy.
                mySyncNode.lastHeartBeat = 0;
                db._syncNodes.put(mySyncNode); // This async operation may be cancelled since the browser is closing down now.
                Observable.wereTheOneDying = true; // If other nodes in same window wakes up by this call, make sure they dont start taking over mastership and stuff...
                // Inform other windows that we're gone, so that they may take over our role if needed. Setting localStorage item below will trigger Observable.onStorage, which will trigger onSuicie() below:
                localStorage.setItem('Dexie.Observable/deadnode:' + mySyncNode.id.toString() + '/' + db.name, "dead"); // In IE, this will also wakeup our own window. However, that is doublechecked in nursecall subscriber below.
            }

            function onSuicide(dbname, nodeID) {
                if (dbname === db.name && !Observable.wereTheOneDying) {
                    // Make sure it's dead indeed. Second bullet. Why? Because it has marked itself for deletion in the onbeforeunload event, which is fired just before window dies.
                    // It's own call to put() may have been cancelled.
                    // Note also that in IE, this event may be called twice, but that doesnt harm!
                    Dexie.vip(function() {
                        db._syncNodes.update(nodeID, { deleteTimeStamp: 1, lastHeartBeat: 0 }).then(cleanup);
                    });
                }
            }

            //
            // Intercommunication between nodes
            //
            // Enable inter-process communication between browser windows

            var requestsWaitingForReply = {};

            db.sendMessage = function(type, message, destinationNode, options) {
                /// <param name="type" type="String">Type of message</param>
                /// <param name="message">Message to send</param>
                /// <param name="destinationNode" type="Number">ID of destination node</param>
                /// <param name="options" type="Object" optional="true">{wantReply: Boolean, isFailure: Boolean, requestId: Number}. If wantReply, the returned promise will complete with the reply from remote. Otherwise it will complete when message has been successfully sent.</param>
                if (!mySyncNode) return Promise.reject("Database closed");
                options = options || {};
                var msg = { message: message, destinationNode: destinationNode, sender: mySyncNode.id, type: type };
                Dexie.extend(msg, options); // wantReply: wantReply, success: !isFailure, requestId: ...
                var tables = ["_intercomm"];
                if (options.wantReply) tables.push("_syncNodes"); // If caller wants a reply, include "_syncNodes" in transaction to check that there's a reciever there. Otherwise, new master will get it.
                return db.transaction('rw', tables, function() {
                    if (options.wantReply) {
                        // Check that there is a reciever there to take the request.
                        return db._syncNodes.where('id').equals(destinationNode).count(function(recieverAlive) {
                            if (recieverAlive)
                                return addMessage(msg);
                            else
                                return db._syncNodes.where('isMaster').above(0).first(function(masterNode) {
                                    msg.destinationNode = masterNode.id;
                                    return addMessage(msg);
                                });
                        });
                    } else {
                        addMessage(msg); // No need to return Promise. Caller dont need a reply.
                    }

                    function addMessage(msg) {
                        return db._intercomm.add(msg).then(function(messageId) {
                            localStorage.setItem("Dexie.Observable/intercomm/" + db.name, messageId.toString());
                            Dexie.ignoreTransaction(function() {
                                Observable.on.intercomm.fire(db.name);
                            });
                            if (options.wantReply) {
                                return new Promise(function(resolve, reject) {
                                    requestsWaitingForReply[messageId.toString()] = { resolve: resolve, reject: reject };
                                });
                            }
                        });
                    }
                });
            };

            db.broadcastMessage = function(type, message, bIncludeSelf) {
                if (!mySyncNode) return Promise.reject("Database closed");
                var mySyncNodeId = mySyncNode.id;
                db._syncNodes.each(function(node) {
                    if (node.type === 'local' && (bIncludeSelf || node.id !== mySyncNodeId)) {
                        db.sendMessage(type, message, node.id);
                    }
                });
            };

            db.observable = {};
            db.observable.SyncNode = SyncNode;

            function consumeIntercommMessages() {
                // Check if we got messages:
                if (!mySyncNode) return Promise.reject("Database closed");
                return db.table('_intercomm').where("destinationNode").equals(mySyncNode.id).modify(function(msg) {
                    // For each message, fire the event and remove message.
                    delete this.value;
                    Dexie.ignoreTransaction(function() {
                        consumeMessage(msg);
                    });
                });
            }

            function consumeMessage(msg) {
                if (msg.type === 'response') {
                    // This is a response. Lookup pending request and fulfill it's promise.
                    var request = requestsWaitingForReply[msg.requestId.toString()];
                    if (request) {
                        if (msg.isFailure) {
                            request.reject(msg.message.error);
                        } else {
                            request.resolve(msg.message.result);
                        }
                        delete requestsWaitingForReply[msg.requestId.toString()];
                    }
                } else {
                    // This is a message or request. Fire the event and add an API for the subscriber to use if reply is requested
                    msg.resolve = function(result) {
                        db.sendMessage('response', { result: result }, msg.sender, { requestId: msg.id });
                    };
                    msg.reject = function(error) {
                        db.sendMessage('response', { error: error.toString() }, msg.sender, { isFailure: true, requestId: msg.id });
                    };
                    var message = msg.message;
                    delete msg.message;
                    Dexie.extend(msg, message);
                    db.on.message.fire(msg);
                }
            }

            function onIntercomm(dbname) {
                // When storage event trigger us to check
                if (dbname === db.name) {
                    consumeIntercommMessages();
                }
            }

        }


//
        // Help functions
        //

        function nop() {};

        function promisableChain(f1, f2) {
            if (f1 === nop) return f2;
            return function() {
                var res = f1.apply(this, arguments);
                if (res && typeof res.then === 'function') {
                    var thiz = this, args = arguments;
                    return res.then(function() {
                        return f2.apply(thiz, args);
                    });
                }
                return f2.apply(this, arguments);
            };
        }

        //
        // Static properties and methods
        // 

        Observable.latestRevision = {}; // Latest revision PER DATABASE. Example: Observable.latestRevision.FriendsDB = 37;
        Observable.on = Dexie.events(null, "latestRevisionIncremented", "suicideNurseCall", "intercomm", "beforeunload"); // fire(dbname, value);
        Observable.createUUID = function() {
            // Decent solution from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
            var d = Date.now();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        };

        Observable._onStorage = function onStorage(event) {
            // We use the onstorage event to trigger onLatestRevisionIncremented since we will wake up when other windows modify the DB as well!
            if (event.key.indexOf("Dexie.Observable/") === 0) { // For example "Dexie.Observable/latestRevision/FriendsDB"
                var parts = event.key.split('/');
                var prop = parts[1];
                var dbname = parts[2];
                if (prop === 'latestRevision') {
                    var rev = parseInt(event.newValue, 10);
                    if (!isNaN(rev) && rev > Observable.latestRevision[dbname]) {
                        Observable.latestRevision[dbname] = rev;
                        Dexie.ignoreTransaction(function() {
                            Observable.on('latestRevisionIncremented').fire(dbname, rev);
                        });
                    }
                } else if (prop.indexOf("deadnode:") === 0) {
                    var nodeID = parseInt(prop.split(':')[1], 10);
                    if (event.newValue) {
                        Observable.on.suicideNurseCall.fire(dbname, nodeID);
                    }
                } else if (prop === 'intercomm') {
                    if (event.newValue) {
                        Observable.on.intercomm.fire(dbname);
                    }
                }
            }
        };

        Observable._onBeforeUnload = function() {
            Observable.on.beforeunload.fire();
        };

        Observable.localStorageImpl = window.localStorage;

        //
        // Map window events to static events in Dexie.Observable:
        //
        window.addEventListener("storage", Observable._onStorage);
        window.addEventListener("beforeunload", Observable._onBeforeUnload);

        return Observable;
    });
}).apply(null, 
    // AMD:
    typeof define === 'function' && define.amd ? [self || window, define] : 
    // CommonJS:
    typeof global !== 'undefined' && typeof module !== 'undefined' && typeof require != 'undefined' ?
        [global, function (name, modules, fn) { 
            module.exports = fn.apply(null, modules.map(function(id) { return require(id); }));
        }] :
    // Vanilla HTML and WebWorkers:
    [self || window, function (name, modules, fn) {   
        var addon = fn.apply(null,modules.map(function(m){return m.split('.').reduce(function(p,c){return p&&p[c];},self || window);})),
            path = name.split('.'),
            nsHost = path.slice(0,path.length-1).reduce(function(p,c){return p&&p[c];},self || window);
        Dexie.addons.push(addon);
        nsHost[path[path.length-1]] = addon;
    }]
);
