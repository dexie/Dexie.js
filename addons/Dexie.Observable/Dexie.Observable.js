/// <reference path="../../src/Dexie.js" />
(function (window, publish, isBrowser, undefined) {

    "use strict"

    /** class DatabaseChange
     *
     *  Object contained by the _changes table.
     */
    var DatabaseChange = Dexie.defineClass({
        rev: Number,    // Auto-incremented primary key
        source: String, // Optional source creating the change. Set if transaction.source was set when doing the operation.
        table: String,  // Table name
        key: Object,    // Primary key. Any type.
        type: Number,   // 1 = CREATE, 2 = UPDATE, 3 = DELETE
        obj: Object,    // CREATE: obj contains the object created.
        mods: Object,   // UPDATE: mods contains the modifications made to the object.
        oldObj: Object, // DELETE: oldObj contains the object deleted. UPDATE: oldObj contains the old object before updates applied.
    });

    /** class SyncNode
     *
     * Object contained in the _syncNodes table.
     */
    var SyncNode = Dexie.defineClass({
        //id: Number,
        myRevision: Number,
        type: String,               // "local" or "remote"
        lastHeartBeat: Number,
        deleteTimeStamp: Number,    // In case lastHeartBeat is too old, a value of now + HIBERNATE_GRACE_PERIOD will be set here. If reached before node wakes up, node will be deleted.
        url: String,                // Only applicable for "remote" nodes. Only used in Dexie.Syncable.
        isMaster: Number,           // 1 if true. Not using Boolean because it's not possible to index Booleans in IE implementation of IDB.

        // Below properties should be extended in Dexie.Syncable. Not here. They apply to remote nodes only (type == "remote"):
        syncProtocol: String,       // Tells which implementation of ISyncProtocol to use for remote syncing. 
        syncContext: null,
        remoteRevision: null
    });

    function addFireAndForgetEvent(eventSet, eventName) {
        var event = (eventSet[eventName] = eventSet.addEventType(eventName));
        event.fire = function () {
            // Change the way how fire() works by doing a simple forEach rather than a functional recursion. More suitable when there might be many dynamically added/removed subscribers.
            // We call the subscribers using asap() (setImmediate/setTimeout) so that 1) One subscriber failing does not hinder next subscriber. 2) An exception will break into debugger and not just catch, 3) The read-transaction will not be locked while subscribers update HTML.
            var args = arguments;
            event.subscribers.forEach(function (fn) {
                asap(function fireEvent (){
                    fn.apply(window, arguments);
                });
            });
        }
        event.subscribe = function (fn) {
            // Change how subscribe works for the same reason as above.
            if (event.subscribers.indexOf(fn) === -1) {
                event.subscribers.push(fn);
            }
        }
        event.unsubscribe = function (fn) {
            // Change how unsubscribe works for the same reason as above.
            var idxOfFn = event.subscribers.indexOf(fn);
            if (idxOfFn !== -1) event.subscribers.splice(idxOfFn, 1);
        }
    }

    // Import some usable helper functions
    var override = Dexie.override;
    var Promise = Dexie.Promise;

    Dexie.Observable = function (db) {
    	/// <summary>
    	///   Extension to Dexie providing Syncronization capabilities to Dexie.
    	/// </summary>
        /// <param name="db" type="Dexie"></param>

        var NODE_TIMEOUT = 30000, // 30 seconds before local db instances are timed out. This is so that old changes can be deleted when not needed and to garbage collect old _syncNodes objects.
            HIBERNATE_GRACE_PERIOD = 30000, // 30 seconds
            // LOCAL_POLL: The time to wait before polling local db for changes and cleaning up old nodes. 
            // Polling for changes is a fallback only needed in certain circomstances (when the onstorage event doesnt reach all listeners - when different browser windows doesnt share the same process)
            LOCAL_POLL = 1000, // 1 second. In real-world there will be this value + the time it takes to poll().
            CREATE = 1,
            UPDATE = 2,
            DELETE = 3;

        var mySyncNode = null;

        // Allow other addons to access the local sync node. May be needed by Dexie.Syncable.
        Object.defineProperty(db, "_localSyncNode", {
            get: function () { return mySyncNode; }
        });

        var pollHandle = null;

        Dexie.fakeAutoComplete(function () {
            db.version(1).stores({
                _syncNodes: "++id,myRevision,lastHeartBeat",
                _changes: "++rev",
                _intercomm: "++id,destinationNode",
                _uncommittedChanges: "++id"
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
            return function (stores, dbSchema) {
                // Create the _changes and _syncNodes tables
                stores["_changes"] = "++rev";
                stores["_syncNodes"] = "++id,myRevision,lastHeartBeat,url,isMaster";
                stores["_intercomm"] = "++id,destinationNode";
                stores["_uncommittedChanges"] = "++id"; // For remote syncing when server returns a partial result.
                // Call default implementation. Will populate the dbSchema structures.
                origFunc.call(this, stores, dbSchema);
                // Allow UUID primary keys using $$ prefix on primary key or indexes
                Object.keys(dbSchema).forEach(function (tableName) {
                    var schema = dbSchema[tableName];
                    if (schema.primKey.name.indexOf('$$') == 0) {
                        schema.primKey.uuid = true;
                        schema.primKey.name = schema.primKey.name.substr(2);
                        schema.primKey.keyPath = schema.primKey.keyPath.substr(2);
                    }
                });
                // Now mark all observable tables
                Object.keys(dbSchema).forEach(function (tableName) {
                    // Marked observable tables with "observable" in their TableSchema.
                    if (tableName.indexOf('_') != 0 && tableName.indexOf('$') != 0) {
                        dbSchema[tableName].observable = true;
                    }
                });
            };
        });

        //
        // Make sure to subscribe to "creating", "updating" and "deleting" hooks for all observable tables that were created in the stores() method.
        //
        db.Version.prototype.stores = override(db.Version.prototype.stores, function (origFunc) {
            return function (stores) {
                var rv = origFunc.apply(this, arguments);
                Object.keys(stores).map(function (tableName) { return db._allTables[tableName]; }).forEach(function (table) {
                    if (table.schema.observable) {
                        crudMonitor(table);
                    }
                });
            };
        });

        // changes event on db:
        addFireAndForgetEvent(db.on, 'changes');

        // cleanup hook for derived classes to do additional cleanup.
        db.on.cleanup = db.on.addEventType('cleanup', promisableChain, nop); // fire (nodesTable, changesTable, trans). Hook called when cleaning up nodes. Subscribers may return a Promise to to more stuff. May do additional stuff if local sync node is master.

        // Message event for intercomm messages between nodes
        addFireAndForgetEvent(db.on, 'message');

        //
        // Overide transaction creation to always include the "_changes" store when any observable store is involved.
        //
        db._createTransaction = override (db._createTransaction, function(origFunc)  {
            return function (mode, storenames, dbschema) {
                var addChanges = false;
                if (mode === 'readwrite' && storenames.some(function (storeName) { return dbschema[storeName] && dbschema[storeName].observable; })) {
                    // At least one included store is a observable store. Make sure to also include the _changes store.
                    addChanges = true;
                    storenames = storenames.slice(0); // Clone
                    storenames.push("_changes");
                }
                // Call original db._createTransaction()
                var trans = origFunc.call(this, mode, storenames, dbschema);
                // If this transaction is bound to any observable table, make sure to add changes when transaction completes.
                if (addChanges) {
                    trans._lastWrittenRevision = 0;
                    if (Dexie.Observable.currentSource) trans.source = Dexie.Observable.currentSource;
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

        // If Dexie.Observable.latestRevsion[db.name] is undefined, set it to 0 so that comparing against it always works.
        // You might think that it will always be undefined before this call, but in case another Dexie instance in the same
        // window with the same database name has been created already, this static property will already be set correctly.
        Dexie.Observable.latestRevision[db.name] = Dexie.Observable.latestRevision[db.name] || 0;

        function wakeupObservers(lastWrittenRevision) {
            // Make sure Dexie.Observable.latestRevision[db.name] is still below our value, now when some time has elapsed and other db instances in same window possibly could have made changes too.
            if (Dexie.Observable.latestRevision[db.name] < lastWrittenRevision) {
                // Set the static property lastRevision[db.name] to the revision of the last written change.
                Dexie.Observable.latestRevision[db.name] = lastWrittenRevision;
                // Wakeup ourselves, and any other db instances on this window:
                Dexie.Observable.on('latestRevisionIncremented').fire(db.name, lastWrittenRevision);
                // Dexie.Observable.on.latestRevisionIncremented will only wakeup db's in current window.
                // We need a storage event to wakeup other windwos.
                // Since indexedDB lacks storage events, let's use the storage event from WebStorage just for
                // the purpose to wakeup db instances in other windows.
                localStorage.setItem('Dexie.Observable/latestRevision/' + db.name, lastWrittenRevision); // In IE, this will also wakeup our own window. However, onLatestRevisionIncremented will work around this by only running once per revision id.
            }
        }

        db.close = override(db.close, function (origClose) {
            return function () {
                // Teardown our framework.
                if (wakeupObservers.timeoutHandle) {
                    clearTimeout(wakeupObservers.timeoutHandle);
                    delete wakeupObservers.timeoutHandle;
                }
                Dexie.Observable.on('latestRevisionIncremented').unsubscribe(onLatestRevisionIncremented);
                Dexie.Observable.on('suicideNurseCall').unsubscribe(onSuicide);
                Dexie.Observable.on('intercomm').unsubscribe(onIntercomm);
                window.removeEventListener('beforeunload', onBeforeUnload);
                // Inform other db instances in same window that we are dying:
                if (mySyncNode) {
                    Dexie.Observable.on.suicideNurseCall.fire(db.name, mySyncNode.id);
                    // Inform other windows as well:
                    localStorage.setItem('Dexie.Observable/deadnode:' + mySyncNode.id.toString() + '/' + db.name, "dead"); // In IE, this will also wakeup our own window. cleanup() may trigger twice per other db instance. But that doesnt to anything.
                    mySyncNode = null;
                }

                if (pollHandle) clearTimeout(pollHandle);
                pollHandle = null;
                return origClose.apply(this, arguments);
            }
        });

        // Override Dexie.delete() in order to delete Dexie.Observable.latestRevision[db.name].
        db.delete = override(db.delete, function (origDelete) {
            return function () {
                return origDelete.apply(this, arguments).then(function (result) {
                    // Reset Dexie.Observable.latestRevision[db.name]
                    Dexie.Observable.latestRevision[db.name] = 0;
                    return result;
                });
            }
        });

        //
        // The Creating/Updating/Deleting hook will make sure any change is stored to the changes table
        //
        function crudMonitor(table) {
            /// <param name="table" type="db.Table"></param>
            var tableName = table.name;
            table.hook('creating').subscribe (function (primKey, obj, trans) {
                /// <param name="trans" type="db.Transaction"></param>
                var rv = undefined;
                if (primKey === undefined && table.schema.primKey.uuid) {
                    primKey = rv = Dexie.createUUID();
                }

                // Wait for onsuccess so that we have the primKey if it is auto-incremented.
                // Also, only add the change if operation succeeds. Caller might catch the error to prohibit transaction
                // from being aborted. If not waiting for onsuccess we would add the change to _changes even thought it wouldnt succeed.
                this.onsuccess = function (primKey) {
                    
                    trans.tables._changes.add({
                        source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
                        table: tableName,
                        key: primKey,
                        type: CREATE,
                        obj: obj
                    }).then(function (rev) {
                        trans._lastWrittenRevision = rev;
                    });

                };
                return rv;
            });
            table.hook('updating').subscribe(function (mods, primKey, oldObj, trans) {
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
                        source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
                        table: tableName,
                        key: primKey,
                        type: UPDATE,
                        mods: modsWithoutUndefined,
                        oldObj: oldObj,
                        obj: newObj
                    }).then(function (rev) {
                        trans._lastWrittenRevision = rev;
                    });

                };
            });
            table.hook('deleting').subscribe(function (primKey, obj, trans) {
                /// <param name="trans" type="db.Transaction"></param>
                this.onsuccess = function () {
                    trans.tables._changes.add({
                        source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
                        table: tableName,
                        key: primKey,
                        type: DELETE,
                        oldObj: obj
                    }).then(function (rev) {
                        trans._lastWrittenRevision = rev;
                    });
                }
            });
        }

        // When db opens, make sure to start monitor any changes before other db operations will start.
        db.on("ready", function startObserving() {
            //db.version(1).stores({ _changes: "++rev,tstmp" });
            return db.table("_changes").orderBy("rev").last(function (lastChange) {
                // Since startObserving() is called before database open() method, this will be the first database operation enqueued to db.
                // Therefore we know that the retrieved value will be This query will
                var latestRevision = (lastChange ? lastChange.rev : 0);
                mySyncNode = new SyncNode({
                    myRevision: latestRevision,
                    type: "local",
                    lastHeartBeat: Date.now(),
                    deleteTimeStamp: null
                });
                if (Dexie.Observable.latestRevision[db.name] < latestRevision) {
                    // Side track . For correctness whenever setting Dexie.Observable.latestRevision[db.name] we must make sure the event is fired if increased:
                    // There are other db instances in same window that hasnt yet been informed about a new revision
                    Dexie.Observable.latestRevision[db.name] = latestRevision;
                    Dexie.Observable.on.latestRevisionIncremented.fire(latestRevision);
                }
                // Add new sync node or if this is a reopening of the database after a close() call, update it.
                return db.table("_syncNodes").add(mySyncNode).then(function () {
                    Dexie.Observable.on('latestRevisionIncremented', onLatestRevisionIncremented); // Wakeup when a new revision is available.
                    window.addEventListener('beforeunload', onBeforeUnload);
                    Dexie.Observable.on.suicideNurseCall.subscribe(onSuicide);
                    Dexie.Observable.on.intercomm.subscribe(onIntercomm);
                    // Cleanup will delete dead nodes and check if we should be the master.
                    return cleanup().then(function () {
                        pollHandle = setTimeout(poll, LOCAL_POLL);
                    });
                });
            });
        });


        var handledRevision = 0;
        function onLatestRevisionIncremented(dbname, latestRevision) {
            if (dbname === db.name) {
                if (handledRevision >= latestRevision) return; // Make sure to only run once per revision. (Workaround for IE triggering storage event on same window)
                handledRevision = latestRevision;
                readChanges(latestRevision);
            }
        }
        
        function readChanges(latestRevision, recursion, wasPartial) {
            // Whenever changes are read, fire db.on("changes") with the array of changes. Eventually, limit the array to 1000 entries or so (an entire database is
            // downloaded from server AFTER we are initiated. For example, if first sync call fails, then after a while we get reconnected. However, that scenario
            // should be handled in case database is totally empty we should fail if sync is not available)
            if (!recursion && readChanges.ongoingOperation) {
                // We are already reading changes. Prohibit a parallell execution of this which would lead to duplicate trigging of 'changes' event.
                // Instead, the callback in toArray() will always check Dexie.Observable.latestRevision[db.name] to see if it has changed and if so, re-launch readChanges().
                // The caller should get the Promise instance from the ongoing operation so that the then() method will resolve when operation is finished.
                return readChanges.ongoingOperation;
            }

            var promise = db._changes.where("rev").above(mySyncNode.myRevision).limit(1000).toArray(function (changes) {
                if (mySyncNode == null) return Promise.reject(new Error("Database closed")); // In case database got closed.
                var partial = false;
                if (changes.length > 0) {
                    var lastChange = changes[changes.length - 1];
                    partial = (changes.length == 1000); // Same as limit.
                    db.on('changes').fire(changes, partial);
                    mySyncNode.myRevision = lastChange.rev;
                } else if (wasPartial) {
                    // No more changes, BUT since we have triggered on('changes') with partial = true,
                    // we HAVE TO trigger changes again with empty list and partial = false
                    db.on('changes').fire([], false);
                }

                mySyncNode.lastHeartBeat = Date.now();
                mySyncNode.deleteTimeStamp = null; // Reset "deleteTimeStamp" flag if it was there.
                db.table("_syncNodes").put(mySyncNode);

                // Check if more changes have come since we started reading changes in the first place. If so, relaunch readChanges and let the ongoing promise not
                // resolve until all changes have been read.
                if (partial || Dexie.Observable.latestRevision[db.name] > mySyncNode.myRevision) {
                    // Either there were more than 1000 changes or additional changes where added while we were reading these changes,
                    // In either case, call readChanges() again until we're done.
                    return readChanges(Dexie.Observable.latestRevision[db.name], true, partial);
                }

            }).catch(function (e) { // TODO: Remove this catch() clause. This is temporary while debugging.

                if (db.isOpen()) {
                    
                    alert(e.stack || e);
                }

            }).finally(function () {
                delete readChanges.ongoingOperation;
            });

            if (!recursion) {
                readChanges.ongoingOperation = promise;
            }
            return promise;
        }

        function poll() {
            pollHandle = null;
            if (!db.isOpen()) return;
            readChanges(Dexie.Observable.latestRevision[db.name]).then(cleanup).catch(function (e) {
                if (db.isOpen()) {
                    alert("Error in poll(): " + e.stack || e);
                }
            }).then(consumeIntercommMessages).finally(function () {
                // Poll again in given interval:
                if (db.isOpen()) {
                    pollHandle = setTimeout(poll, LOCAL_POLL);
                }
            });
        }

        function cleanup() {
            return db.transaction('rw', db._syncNodes, db._changes, db._intercomm, function (nodes, changes, intercomm, trans) {
                // Cleanup dead local nodes that has no heartbeat for over a minute
                // Dont do the following:
                //nodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).and(function (node) { return node.type == "local"; }).delete();
                // Because client may have been in hybernate mode and recently woken up. That would lead to deletion of all nodes.
                // Instead, we should mark any old nodes for deletion in a minute or so. If they still dont wakeup after that minute we could consider them dead.
                nodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).and(function (node) { return node.type === 'local' }).modify(function (node) {
                    if (node.deleteTimeStamp && node.deleteTimeStamp < Date.now()) {
                        // Delete the node.
                        delete this.value;
                        // Cleanup localStorage "deadnode:" entry for this node (localStorage API was used to wakeup other windows (onstorage event) - an event type missing in indexedDB.)
                        localStorage.removeItem('Dexie.Observable/deadnode:' + node.id + '/' + db.name);
                        // Cleanup intercomm messages
                        intercomm.where("destinationNode").equals(node.id).modify(function (msg) {
                            if (msg.delegatable) {
                                // Message was delegatable, meaning someone must take over its messages when it dies. Let us be that one!
                                db.on.message.fire(msg);
                            }
                            delete this.value;
                        });
                    } else if (!node.deleteTimeStamp) {
                        // Mark the node for deletion
                        node.deleteTimeStamp = Date.now() + HIBERNATE_GRACE_PERIOD;
                    }
                }).then(function () {
                    // Now after eventually deleting a master. Check if there is any master or not:
                    return nodes.where("isMaster").above(0).count();
                }).then(function (anyMaster) {
                    if (!anyMaster) {
                        // There's no master. Take that role!
                        mySyncNode.isMaster = 1;
                        nodes.update(mySyncNode.id, { isMaster: 1 });
                    }

                    // Cleanup old revisions that no node is interested of.
                    return nodes.orderBy("myRevision").first(function (oldestNode) {
                        return changes.where("rev").below(oldestNode.myRevision).delete();
                    });
                }).then(function () {
                    return db.on("cleanup").fire(nodes, changes, trans);
                });
            });
        }
            

        function onBeforeUnload(event) {
            // Mark our own sync node for deletion.
            mySyncNode.deleteTimeStamp = 1; // One millisecond after 1970. Makes it occur in the past but still keeps it truthy.
            mySyncNode.lastHeartBeat = 0;
            db._syncNodes.put(mySyncNode); // This async operation may be cancelled since the browser is closing down now.
            Dexie.Observable.wereTheOneDying = true; // If other nodes in same window wakes up by this call, make sure they dont start taking over mastership and stuff...
            // Inform other windows that we're gone, so that they may take over our role if needed. Setting localStorage item below will trigger Dexie.Observable.onStorage, which will trigger onSuicie() below:
            localStorage.setItem('Dexie.Observable/deadnode:' + mySyncNode.id.toString() + '/' + db.name, "dead"); // In IE, this will also wakeup our own window. However, that is doublechecked in nursecall subscriber below.
        }

        function onSuicide (dbname, nodeID) {
            if (dbname === db.name && !Dexie.Observable.wereTheOneDying) {
                // Make sure it's dead indeed. Second bullet. Why? Because it has marked itself for deletion in the onbeforeunload event, which is fired just before window dies.
                // It's own call to put() may have been cancelled.
                // Note also that in IE, this event may be called twice, but that doesnt harm!
                db._syncNodes.update(nodeID, { deleteTimeStamp: 1, lastHeartBeat: 0 }).then(cleanup);
            }
        }

        //
        // Intercommunication between nodes
        //
        // Enable inter-process communication between browser windows
        db.sendMessage = function (type, message, destinationNode) {
        	/// <param name="type" type="String">Type of message</param>
        	/// <param name="message">Message to send</param>
            /// <param name="destinationNode" type="Number">ID of destination node</param>
            var msg = { message: message, destinationNode: destinationNode, sender: mySyncNode.id, type: type };
            db._intercomm.add(msg).then(function (messageId) {
                localStorage.setItem("Dexie.Observable/intercomm/" + db.name, messageId.toString());
                Dexie.Observable.on.intercomm.fire(db.name);
            });
        }

        db.broadcastMessage = function (type, message, bIncludeSelf) {
            db._syncNodes.each(function (node) {
                if (bIncludeSelf || node.id !== mySyncNode.id) {
                    db.sendMessage(message, node.id);
                }
            });
        }

        function consumeIntercommMessages() {
            // Check if we got messages:
            return db._intercomm.where("destinationNode").equals(mySyncNode.id).modify(function (msg) {
                // For each message, fire the event and remove message.
                db.on.message.fire(msg);
                delete this.value;
            });
        }

        function onIntercomm(dbname) {
            // When storage event trigger us to check
            if (dbname === db.name) {
                consumeIntercommMessages();
            }
        }

    } // End of "Dexie.Observable = function (db) { ... }."



    //
    // Help functions
    //

    var asap = typeof (setImmediate) === 'undefined' ? function (fn, arg1, arg2, argN) {
        var args = arguments;
        setTimeout(function () { fn.apply(this, [].slice.call(args, 1)) }, 0);// If not FF13 and earlier failed, we could use this call here instead: setTimeout.call(this, [fn, 0].concat(arguments));
    } : setImmediate;

    function nop() { };

    function promisableChain(f1, f2) {
        if (f1 === nop) return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res && typeof res.then == 'function') {
                var thiz = this, args = arguments;
                return res.then(function () {
                    return f2.apply(thiz, args);
                });
            }
            return f2.apply(this, arguments);
        }
    }

    //
    // Static properties and methods
    // 

    Dexie.Observable.latestRevision = {}; // Latest revision PER DATABASE. Example: Dexie.Observable.latestRevision.FriendsDB = 37;
    Dexie.Observable.on = Dexie.events(null, "latestRevisionIncremented", "suicideNurseCall", "intercomm"); // fire(dbname, value);
    Dexie.createUUID = function () {
        // Decent solution from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        var d = Date.now();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    }
    
    Dexie.Observable._onStorage = function onStorage(event) {
        // We use the onstorage event to trigger onLatestRevisionIncremented since we will wake up when other windows modify the DB as well!
        if (event.key.indexOf("Dexie.Observable/") === 0) { // For example "Dexie.Observable/latestRevision/FriendsDB"
            var parts = event.key.split('/');
            var prop = parts[1];
            var dbname = parts[2];
            if (prop === 'latestRevision') {
                var rev = parseInt(event.newValue, 10);
                if (!isNaN(rev) && rev > Dexie.Observable.latestRevision[dbname]) {
                    Dexie.Observable.latestRevision[dbname] = rev;
                    Dexie.Observable.on('latestRevisionIncremented').fire(dbname, rev);
                }
            } else if (prop.indexOf("deadnode:") === 0) {
                var nodeID = parseInt(prop.split(':')[1], 10);
                if (event.newValue) {
                    Dexie.Observable.on.suicideNurseCall.fire(dbname, nodeID);
                }
            } else if (prop === 'intercomm') {
                if (event.newValue) {
                    Dexie.Observable.on.intercomm.fire(dbname);
                }
            }
        }
    }

    Dexie.Observable.SyncNode = SyncNode;

    window.addEventListener("storage", Dexie.Observable._onStorage);

    // Finally, add this addon to Dexie:
    Dexie.addons.push(Dexie.Observable);

}).apply(this, typeof module === 'undefined' || (typeof window !== 'undefined' && this == window) 
? [window, function (name, value) { window[name] = value; }, true ]    // Adapt to browser environment
: [global, function (name, value) { module.exports = value; }, false]); // Adapt to Node.js environment


