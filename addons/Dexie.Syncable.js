/// <reference path="../src/Dexie.js" />
/// <reference path="Dexie.Syncable.SyncProviderAPI.js" />
(function (window, publish, isBrowser, undefined) {

    "use strict"

    /** class DatabaseChange
     *
     *  Object contained by the _changes table.
     */
    var DatabaseChange = Dexie.defineClass({
        tstmp: Number,  // Time stamp of change
        table: String,  // Table name
        key: Object,    // Primary key. Any type.
        type: Number,   // 1 = CREATE, 2 = UPDATE, 3 = DELETE
        mods: Object,   // CREATE: mods contains the object. UPDATE: mods contains the modifications made to the object.
        oldObj: Object, // UPDATE: oldObj contains the old object before updates applied. DELETE: oldObj contains the object that was deleted.
        newObj: Object  // UPDATE: newObj contains the new object after modifications were applied.
    });

    /** class SyncNode
     *
     * Object contained in the _syncNodes table.
     */
    var SyncNode = Dexie.defineClass({
        id: Number,
        myRevision: Number,
        type: String,               // "local" or "remote"
        lastHeartBeat: Number,
        deleteTimeStamp: Number,    // In case lastHeartBeat is too old, a value of now + HIBERNATE_GRACE_PERIOD will be set here. If reached before node wakes up, node will be deleted.

        // Below properties apply to remote nodes only (type == "remote"):
        syncProvider: String, // Tells which implementation of ISyncProvider to use for remote syncing. 
        syncContext: null
    });

    // Import some usable helper functions
    var override = Dexie.override;

    Dexie.Syncable = function (db) {
    	/// <summary>
    	///   Extension to Dexie providing Syncronization capabilities to Dexie.
    	/// </summary>
        /// <param name="db" type="Dexie"></param>

        var NODE_TIMEOUT = 30000, // 30 seconds before local db instances are timed out. This is so that old changes can be deleted when not needed and to garbage collect old _syncNodes objects.
            HIBERNATE_GRACE_PERIOD = 30000, // 30 seconds
            POLL_INTERVAL = 1000; // 1 second. In real-world there will be this value + the time it takes to poll().

        //
        // ProviderContext : IPersistedContext
        //
        function ProviderContext(nodeID) {
            this.nodeID = nodeID;
        }
        ProviderContext.prototype.save = function () {
            // Store this instance in the syncContext property of the node it belongs to.
            return db._changes.where("id").equals(this.nodeID).modify({ syncContext: this });
        }

        var mySyncNode = new SyncNode({
            myRevision: 0,
            type: "local",
            lastHeartBeat: Date.now(),
            deleteTimeStamp: null
        });

        var anySyncedTable = 0;
        var pollHandle = null;

        Dexie.fakeAutoComplete(function(){
            db.version(1).stores({
                _syncNodes: "++id,myRevision,lastHeartBeat",
                _changes: "++rev,tstmp"
            });
            //db._changes.mapToClass(DatabaseChange);
            //db._syncNodes.mapToClass(SyncNode);
        });



        //
        // Override parsing the stores to allow "sync:" prefix on any object store.
        //
        db.Version.prototype._parseStoresSpec = override(db.Version.prototype._parseStoresSpec, function(origFunc) {
            return function (stores, dbSchema) {
                // Override parsing the stores to add the "_changes" table as well as allowing "sync:" prefix to any table.
                var syncedTables = {};
                var newStoresSpec = {};
                var createChangesTable = false;
                Object.keys(stores).forEach(function (tableName) {
                    var tableDef = stores[tableName];
                    if (tableDef.indexOf("sync:") == 0) {
                        syncedTables[tableName] = true;
                        var pColon = tableDef.indexOf(':');
                        newStoresSpec[tableName] = tableDef.substr(pColon + 1);
                        createChangesTable = true;
                    } else {
                        newStoresSpec[tableName] = tableDef;
                    }
                    if (Dexie.Syncable.syncAll) {
                        // Static property telling Dexie.Syncable to work on all tables, even those not marked as syncable.
                        // This property can be useful reusing the unit tests for Dexie with Dexie.Syncable applied.
                        createChangesTable = true;
                        syncedTables[tableName] = true;
                    }
                });
                if (createChangesTable) {
                    // Create the _changes and _syncNodes tables
                    newStoresSpec["_changes"] = "++rev,tstmp";
                    newStoresSpec["_syncNodes"] = "++id,myRevision,lastHeartBeat";
                }
                // Store whether we will use syncing or not into anySyncedTable private var.
                anySyncedTable = createChangesTable;
                // Call default implementation. Will populate the dbSchema structures.
                origFunc.call(this, newStoresSpec, dbSchema);
                // Allow GUID primary keys using $$ prefix on primary key or indexes
                Object.keys(dbSchema).forEach(function (tableName) {
                    var schema = dbSchema[tableName];
                    //schema = new Dexie.TableSchema();
                    if (schema.primKey.name.indexOf('$$') == 0) {
                        schema.primKey.uuid = true;
                        schema.primKey.name = schema.primKey.name.substr(2);
                        schema.primKey.keyPath = schema.primKey.keyPath.substr(2);
                    }
                });
                // Now mark all synced tables
                Object.keys(syncedTables).forEach(function (tableName) {
                    // Marked synced tables with "synced" in their TableSchema.
                    dbSchema[tableName].synced = true;
                });
            };
        });

        // Override Version.stores() in order to map our classes.
        db.Version.prototype.stores = override(db.Version.prototype.stores, function (origFunc) {
            return function () {
                var rv = origFunc.apply(this, arguments);
                db._changes.mapToClass(DatabaseChange);
                db._syncNodes.mapToClass(SyncNode);
                return rv;
            };
        });

        db._tableFactory = override(db._tableFactory, function (origFunc) {
            return function (mode, tableSchema, transactionPromiseFactory) {
                var table = origFunc.apply(this, arguments);
                if (tableSchema.synced) {
                    addObserveEvents(table);
                }
                return table;
            }
        });

        db.createUUID = function () {
            // From http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
            var d = Date.now();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        }

        //
        // Overide transaction creation to always include the "_changes" store when any synced store is involved.
        //
        db._createTransaction = override (db._createTransaction, function(origFunc)  {
            return function (mode, storenames, dbschema) {
                var addChanges = false;
                if (mode === 'readwrite' && storenames.some(function (storeName) { return dbschema[storeName] && dbschema[storeName].synced; })) {
                    // At least one included store is a synced store. Make sure to also include the _changes store.
                    addChanges = true;
                    storenames = storenames.slice(0); // Clone
                    storenames.push("_changes");
                }
                // Call original db._createTransaction()
                var trans = origFunc.call(this, mode, storenames, dbschema);
                // If this transaction 
                if (addChanges) {
                    trans._timestamp = Date.now(); // Cache the time stamp of when transaction was created for performance optimization.
                    trans._lastWrittenRevision = 0;
                    trans.on('complete', function () {
                        if (trans._lastWrittenRevision) {
                            // Changes were written in this transaction.
                            // Delay-trigger a wakeup call:
                            if (wakeupObservers.timeoutHandle) clearTimeout(wakeupObservers.timeoutHandle);
                            wakeupObservers.timeoutHandle = setTimeout(function () {
                                delete wakeupObservers.timeoutHandle;
                                wakeupObservers(trans._lastWrittenRevision);
                            }, 25);
                        }
                    });
                }
                return trans;
            }
        });

        function wakeupObservers(lastWrittenRevision) {
            // Make sure Dexie.Syncable.latestRevision is still below our value, now when some time has elapsed and other db instances in same window possibly could have made changes too.
            if (Dexie.Syncable.latestRevision < lastWrittenRevision) {
                // Set the static property lastRevision to the revision of the last written change.
                Dexie.Syncable.latestRevision = lastWrittenRevision;
                // Wakeup ourselves, and any other db instances on this window:
                Dexie.Syncable.onLatestRevisionIncremented.fire(lastWrittenRevision);
                // Wakeup db instances in other windows:
                localStorage.setItem('Dexie.Syncable.latestRevision', lastWrittenRevision); // In IE, this will wakeup our own window as well. However, onLatestRevisionIncremented will work around this by only running once per revision id.
            }
        }


        //
        // Make sure to subscribe to "creating", "updating" and "deleting" events for all synced tables when opening the database.
        //
        db.open = override(db.open, function(origOpen) {
            return function () {
                Object.keys(db._allTables).forEach(function (tableName) {
                    var table = db._allTables[tableName];
                    if (table.schema.synced) {
                        cudHook(table);
                    }
                });
                return origOpen.call(this);
            }
        });

        db.close = override(db.close, function (origClose) {
            return function () {
                // Teardown our framework.
                if (wakeupObservers.timeoutHandle) {
                    clearTimeout(wakeupObservers.timeoutHandle);
                    delete wakeupObservers.timeoutHandle;
                }
                Dexie.Syncable.onLatestRevisionIncremented.unsubscribe(readChanges);
                if (pollHandle) clearTimeout(pollHandle);
                pollHandle = null;
                return origClose.apply(this, arguments);
            }
        });

        //
        // The Creating/Updating/Deleting hook will make sure any change is stored to the changes table
        //
        function cudHook(table) {
            /// <param name="table" type="db.Table"></param>
            var tableName = table.name;
            table.hook('creating', function (primKey, obj, trans) {
                /// <param name="trans" type="db.Transaction"></param>
                var rv = undefined;
                if (primKey === undefined && table.schema.primKey.uuid) {
                    primKey = rv = db.createUUID();
                }
                // Wait for onsuccess so that we have the primKey if it is auto-incremented.
                // Also, only add the change if operation succeeds. Caller might catch the error to prohibit transaction
                // from being aborted. If not waiting for onsuccess we would add the change to _changes even thought it wouldnt succeed.
                this.onsuccess = function (primKey) {
                    trans.tables._changes.add({
                        tstmp: trans._timestamp,
                        table: tableName,
                        key: primKey,
                        type: 1,
                        mods: obj
                    }).then(function (rev) {
                        trans._lastWrittenRevision = rev;
                    });
                };
                return rv;
            });
            table.hook('updating', function (mods, primKey, oldObj, trans) {
                /// <param name="trans" type="db.Transaction"></param>
                this.onsuccess = function (newObj) {
                    // Only add change if the operation succeeds.
                    var modsWithoutUndefined = Dexie.deepClone(mods);
                    for (var prop in modsWithoutUndefined) {
                        if (typeof modsWithoutUndefined[prop] === 'undefined') {
                            modsWithoutUndefined[prop] = null; // Null is as close we could come to deleting a property when not allowing undefined.
                        }
                    }
                    trans.tables._changes.add({
                        tstmp: trans._timestamp,
                        table: tableName,
                        key: primKey,
                        type: 2,
                        mods: modsWithoutUndefined,
                        oldObj: oldObj,
                        newObj: newObj
                    }).then(function (rev) {
                        trans._lastWrittenRevision = rev;
                    });
                };
            });
            table.hook('deleting', function (primKey, obj, trans) {
                /// <param name="trans" type="db.Transaction"></param>
                this.onsuccess = function () {
                    trans.tables._changes.add({
                        tstmp: trans._timestamp,
                        table: tableName,
                        key: primKey,
                        type: 3,
                        oldObj: obj
                    }).then(function (rev) {
                        trans._lastWrittenRevision = rev;
                    });
                }
            });
        }

        //
        // Add on('created'), on('updated') and on ('deleted') events and listed to changes from other browser windows.
        //
        function addObserveEvents(table) {
            /// <param name="table" type="db.Table"></param>
            table.on = db._allTables[table.name] ? db._allTables[table.name].on : Dexie.events(null, {
                'created': [tryCatchEventChain, nop],
                'updated': [tryCatchEventChain, nop],
                'deleted': [tryCatchEventChain, nop]
            });
        }

        // When db opens, make sure to start monitor any changes before other db operations will start.
        db.on("ready", function startObserving() {
            //db.version(1).stores({ _changes: "++rev,tstmp" });
            return db.table("_changes").orderBy("rev").last(function (lastChange) {
                // Since startObserving() is called before database open() method, this will be the first database operation enqueued to db.
                // Therefore we know that the retrieved value will be This query will 
                mySyncNode.myRevision = lastChange && lastChange.rev || 0;
                return db.table("_syncNodes").add(mySyncNode).then(function () {
                    Dexie.Syncable.onLatestRevisionIncremented.subscribe(onLatestRevisionIncremented); // Call readChanges whenever a new revision is in place.
                    pollHandle = setTimeout(poll, POLL_INTERVAL);
                });
            });
        });


        var handledRevision = 0;
        function onLatestRevisionIncremented(latestRevision) {
            if (handledRevision >= latestRevision) return; // Make sure to only run once per revision. (Workaround for IE triggering storage event on same window)
            handledRevision = latestRevision;
            readChanges(latestRevision);
        }

        function NotInSyncError() {
            Error.apply(this, arguments);
        }
        Dexie.derive(NotInSyncError).from(Error);
        
        function readChanges(latestRevision) {
            if (readChanges.isReadingChanges) {
                // We are already reading changes. Prohibit a parallell execution of this which would lead to duplicate trigging of CUD events.
                // Instead, the finally() clause will always check Dexie.Syncable.latestRevision to see if it has changed and if so, re-launch readChanges().
                return Dexie.Promise.reject(); // Inform caller not to continue.
            }
            readChanges.isReadingChanges = true;
            var expectedRevision = mySyncNode.myRevision + 1;

            return db._changes.where("rev").between(mySyncNode.myRevision, latestRevision, false, true).each(function (change) {

                if (change.rev !== expectedRevision) throw new NotInSyncError("Not in sync! Need to reload page");
                var on = db._allTables[change.table].on;
                switch (change.type) {
                    case 1:
                        on.created.fire(change.key, change.mods);
                        break;
                    case 2:
                        on.updated.fire(change.key, change.mods, change.oldObj, change.newObj);
                        break;
                    case 3:
                        on.deleted.fire(change.key, change.oldObj);
                        break;
                }
                mySyncNode.myRevision = change.rev;
                expectedRevision = mySyncNode.myRevision + 1;

            }).then(function () {

                mySyncNode.lastHeartBeat = Date.now();
                mySyncNode.deleteTimeStamp = null; // Reset "deleteTimeStamp" flag if it was there.
                db.table("_syncNodes").put(mySyncNode);

            }).catch(NotInSyncError, function (e) {

                if (confirm("Not in sync anymore! Reload page?")) {
                    // Note: This is a theoretical situation that would occur if the client has frozen for too long for some reason
                    window.location.reload();
                } else {
                    // User doesnt want to reload page. We must silently ignore all lost changes and recreate our node:
                    db.transaction("rw", db._changes, db._syncNodes, function (changes, syncNodes) {
                        changes.orderBy("rev").last(function (lastRev) {
                            mySyncNode.myRevision = lastRev;
                            // Put back our sync node that has probably been deleted by other node.
                            syncNodes.put(mySyncNode);
                        });
                    });
                }

            }).catch(function (e) {

                if (db.isOpen()) {
                    alert(e.stack || e);
                }

            }).finally(function () {
                readChanges.isReadingChanges = false;
                if (db.isOpen() && Dexie.Syncable.latestRevision > latestRevision) {
                    // Additional changes where added while we were reading these changes
                    return readChanges(Dexie.Syncable.latestRevision);
                }
            });
        }

        function poll() {
            pollHandle = null,
            readChanges(Dexie.Syncable.latestRevision).then(function () {
                if (db.isOpen()) {
                    db.transaction('rw', db._syncNodes, db._changes, function (nodes, changes) {
                        // Cleanup dead local nodes that has no heartbeat for over a minute
                        // Dont do the following:
                        //nodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).and(function (node) { return node.type == "local"; }).delete();
                        // Because client may have been in hybernate mode and recently woken up. That would lead to deletion of all nodes.
                        // Instead, we should mark any old nodes for deletion and update their heartbeat value ourselves to give them a chance to clear the delete-mark.
                        nodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).and(function (node) { return node.type == "local"; }).modify(function (node) {
                            if (node.deleteTimeStamp && node.deleteTimeStamp < Date.now()) {
                                // Delete the node
                                delete this.value;
                            } else if (!node.deleteTimeStamp) {
                                // Mark the node for deletion
                                node.deleteTimeStamp = Date.now() + HIBERNATE_GRACE_PERIOD;
                            }
                        });
                        // Cleanup old revisions that no node is interested of.
                        nodes.orderBy("myRevision").first(function (oldestRev) {
                            changes.where("rev").below(oldestRev.myRevision).delete();
                        });
                    }).catch(function (e) {
                        if (db.isOpen()) {
                            alert("Error in poll(): " + e.stack || e);
                        }
                    }).finally(function () {
                        // Poll again in given interval:
                        if (db.isOpen()) {
                            pollHandle = setTimeout(poll, POLL_INTERVAL);
                        }
                    });
                }
            });
        }

    }

    var asap = typeof (setImmediate) === 'undefined' ? function (fn, arg1, arg2, argN) {
        var args = arguments;
        setTimeout(function () { fn.apply(this, [].slice.call(args, 1)) }, 0);// If not FF13 and earlier failed, we could use this call here instead: setTimeout.call(this, [fn, 0].concat(arguments));
    } : setImmediate;

    function nop() { };

    function tryCatchEventChain(f1, f2) {
        // Enables chained events that may return false to stop the event chain.
        if (f1 === nop) return (function () {
            var subscribers = [f2];
            function fire () {
                //var args = [null];
                //args.push.apply(args, arguments);
                for (var i = 0, l = subscribers.length; i < l; ++i) {
                    /*args[0] = subscribers[i];
                    asap.apply(this, args);*/
                    try {
                        subscribers[i].apply(this, arguments);
                    } catch (e) { }
                }
            }
            fire.subscribers = subscribers;
            return fire;
        })();
        f1.subscribers.push(f2);
        return f1;
    }

    Dexie.Syncable.latestRevision = 0;
    Dexie.Syncable.onLatestRevisionIncremented = Dexie.events(null, "latestRevisionIncremented").latestRevisionIncremented;
    Dexie.Syncable.syncAll = false;

    window.addEventListener("storage", function(event) {
        // We use the onstorage event to trigger onLatestRevisionIncremented since we will wake up when other windows modify the DB as well!
        if (event.key === 'Dexie.Syncable.latestRevision') {
            var rev = parseInt(event.newValue, 10);
            if (!isNaN(rev) && rev > Dexie.Syncable.latestRevision) {
                Dexie.Syncable.latestRevision = rev;
                Dexie.Syncable.onLatestRevisionIncremented.fire(Dexie.Syncable.latestRevision);
            }
        }
    });

    Dexie.addons.push (Dexie.Syncable);

}).apply(this, typeof module === 'undefined' || (typeof window !== 'undefined' && this == window) 
? [window, function (name, value) { window[name] = value; }, true ]    // Adapt to browser environment
: [global, function (name, value) { module.exports = value; }, false]); // Adapt to Node.js environment


