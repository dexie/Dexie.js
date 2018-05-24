/* ========================================================================== 
 *                           dexie-observable.js
 * ==========================================================================
 *
 * Dexie addon for observing database changes not just on local db instance
 * but also on other instances, tabs and windows.
 *
 * Comprises a base framework for dexie-syncable.js
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

function nop() { }
function promisableChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res && typeof res.then === 'function') {
            var thiz = this, args = arguments;
            return res.then(function () {
                return f2.apply(thiz, args);
            });
        }
        return f2.apply(this, arguments);
    };
}
function createUUID() {
    // Decent solution from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    var d = Date.now();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
}

function initOverrideCreateTransaction(db, wakeupObservers) {
    return function overrideCreateTransaction(origFunc) {
        return function (mode, storenames, dbschema, parent) {
            if (db.dynamicallyOpened())
                return origFunc.apply(this, arguments); // Don't observe dynamically opened databases.
            var addChanges = false;
            if (mode === 'readwrite' && storenames.some(function (storeName) {
                return dbschema[storeName] && dbschema[storeName].observable;
            })) {
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
                trans.on('complete', function () {
                    if (trans._lastWrittenRevision) {
                        // Changes were written in this transaction.
                        if (!parent) {
                            // This is root-level transaction, i.e. a physical commit has happened.
                            // Delay-trigger a wakeup call:
                            if (wakeupObservers.timeoutHandle)
                                clearTimeout(wakeupObservers.timeoutHandle);
                            wakeupObservers.timeoutHandle = setTimeout(function () {
                                delete wakeupObservers.timeoutHandle;
                                wakeupObservers(trans._lastWrittenRevision);
                            }, 25);
                        }
                        else {
                            // This is just a virtual commit of a sub transaction.
                            // Wait with waking up observers until root transaction has committed.
                            // Make sure to mark root transaction so that it will wakeup observers upon commit.
                            var rootTransaction = (function findRootTransaction(trans) {
                                return trans.parent ? findRootTransaction(trans.parent) : trans;
                            })(parent);
                            rootTransaction._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rootTransaction.lastWrittenRevision || 0);
                        }
                    }
                });
                // Derive "source" property from parent transaction by default
                if (trans.parent && trans.parent.source)
                    trans.source = trans.parent.source;
            }
            return trans;
        };
    };
}

function initWakeupObservers(db, Observable, localStorage) {
    return function wakeupObservers(lastWrittenRevision) {
        // Make sure Observable.latestRevision[db.name] is still below our value, now when some time has elapsed and other db instances in same window possibly could have made changes too.
        if (Observable.latestRevision[db.name] < lastWrittenRevision) {
            // Set the static property lastRevision[db.name] to the revision of the last written change.
            Observable.latestRevision[db.name] = lastWrittenRevision;
            // Wakeup ourselves, and any other db instances on this window:
            Dexie.ignoreTransaction(function () {
                Observable.on('latestRevisionIncremented').fire(db.name, lastWrittenRevision);
            });
            // Observable.on.latestRevisionIncremented will only wakeup db's in current window.
            // We need a storage event to wakeup other windwos.
            // Since indexedDB lacks storage events, let's use the storage event from WebStorage just for
            // the purpose to wakeup db instances in other windows.
            if (localStorage)
                localStorage.setItem('Dexie.Observable/latestRevision/' + db.name, lastWrittenRevision); // In IE, this will also wakeup our own window. However, onLatestRevisionIncremented will work around this by only running once per revision id.
        }
    };
}

// Change Types
var CREATE = 1;
var UPDATE = 2;
var DELETE = 3;

function initCreatingHook(db, table) {
    return function creatingHook(primKey, obj, trans) {
        /// <param name="trans" type="db.Transaction"></param>
        var rv = undefined;
        if (primKey === undefined && table.schema.primKey.uuid) {
            primKey = rv = createUUID();
            if (table.schema.primKey.keyPath) {
                Dexie.setByKeyPath(obj, table.schema.primKey.keyPath, primKey);
            }
        }
        var change = {
            source: trans.source || null,
            table: table.name,
            key: primKey === undefined ? null : primKey,
            type: CREATE,
            obj: obj
        };
        var promise = db._changes.add(change).then(function (rev) {
            trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
            return rev;
        });
        // Wait for onsuccess so that we have the primKey if it is auto-incremented and update the change item if so.
        this.onsuccess = function (resultKey) {
            if (primKey != resultKey)
                promise._then(function () {
                    change.key = resultKey;
                    db._changes.put(change);
                });
        };
        this.onerror = function () {
            // If the main operation fails, make sure to regret the change
            promise._then(function (rev) {
                // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
                db._changes.delete(rev);
            });
        };
        return rv;
    };
}

function initUpdatingHook(db, tableName) {
    return function updatingHook(mods, primKey, oldObj, trans) {
        /// <param name="trans" type="db.Transaction"></param>
        // mods may contain property paths with undefined as value if the property
        // is being deleted. Since we cannot persist undefined we need to act
        // like those changes is setting the value to null instead.
        var modsWithoutUndefined = {};
        // As of current Dexie version (1.0.3) hook may be called even if it wouldn't really change.
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
            }
            else {
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
                source: trans.source || null,
                table: tableName,
                key: primKey,
                type: UPDATE,
                mods: modsWithoutUndefined,
                oldObj: oldObj,
                obj: newObj
            };
            var promise = db._changes.add(change); // Just so we get the correct revision order of the update...
            this.onsuccess = function () {
                promise._then(function (rev) {
                    trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
                });
            };
            this.onerror = function () {
                // If the main operation fails, make sure to regret the change.
                promise._then(function (rev) {
                    // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
                    db._changes.delete(rev);
                });
            };
        }
    };
}

function initDeletingHook(db, tableName) {
    return function deletingHook(primKey, obj, trans) {
        /// <param name="trans" type="db.Transaction"></param>
        var promise = db._changes.add({
            source: trans.source || null,
            table: tableName,
            key: primKey,
            type: DELETE,
            oldObj: obj
        }).then(function (rev) {
            trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
            return rev;
        })
            .catch(function (e) {
            console.log(obj);
            console.log(e.stack);
        });
        this.onerror = function () {
            // If the main operation fails, make sure to regret the change.
            // Using _then because if promise is already fullfilled, the standard then() would
            // do setTimeout() and we would loose the transaction.
            promise._then(function (rev) {
                // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
                db._changes.delete(rev);
            });
        };
    };
}

function initCrudMonitor(db) {
    //
    // The Creating/Updating/Deleting hook will make sure any change is stored to the changes table
    //
    return function crudMonitor(table) {
        /// <param name="table" type="db.Table"></param>
        if (table.hook._observing)
            return;
        table.hook._observing = true;
        var tableName = table.name;
        table.hook('creating').subscribe(initCreatingHook(db, table));
        table.hook('updating').subscribe(initUpdatingHook(db, tableName));
        table.hook('deleting').subscribe(initDeletingHook(db, tableName));
    };
}

function initOnStorage(Observable) {
    return function onStorage(event) {
        // We use the onstorage event to trigger onLatestRevisionIncremented since we will wake up when other windows modify the DB as well!
        if (event.key.indexOf("Dexie.Observable/") === 0) {
            var parts = event.key.split('/');
            var prop = parts[1];
            var dbname = parts[2];
            if (prop === 'latestRevision') {
                var rev = parseInt(event.newValue, 10);
                if (!isNaN(rev) && rev > Observable.latestRevision[dbname]) {
                    Observable.latestRevision[dbname] = rev;
                    Dexie.ignoreTransaction(function () {
                        Observable.on('latestRevisionIncremented').fire(dbname, rev);
                    });
                }
            }
            else if (prop.indexOf("deadnode:") === 0) {
                var nodeID = parseInt(prop.split(':')[1], 10);
                if (event.newValue) {
                    Observable.on.suicideNurseCall.fire(dbname, nodeID);
                }
            }
            else if (prop === 'intercomm') {
                if (event.newValue) {
                    Observable.on.intercomm.fire(dbname);
                }
            }
        }
    };
}

function initOverrideOpen(db, SyncNode, crudMonitor) {
    return function overrideOpen(origOpen) {
        return function () {
            //
            // Make sure to subscribe to "creating", "updating" and "deleting" hooks for all observable tables that were created in the stores() method.
            //
            Object.keys(db._allTables).forEach(function (tableName) {
                var table = db._allTables[tableName];
                if (table.schema.observable) {
                    crudMonitor(table);
                }
                if (table.name === "_syncNodes") {
                    table.mapToClass(SyncNode);
                }
            });
            return origOpen.apply(this, arguments);
        };
    };
}

var Promise$1 = Dexie.Promise;
function initIntercomm(db, Observable, SyncNode, mySyncNode, localStorage) {
    //
    // Intercommunication between nodes
    //
    // Enable inter-process communication between browser windows using localStorage storage event (is registered in Dexie.Observable)
    var requestsWaitingForReply = {};
    /**
     * @param {string} type Type of message
     * @param message Message to send
     * @param {number} destinationNode ID of destination node
     * @param {{wantReply: boolean, isFailure: boolean, requestId: number}} options If {wantReply: true}, the returned promise will complete with the reply from remote. Otherwise it will complete when message has been successfully sent.</param>
     */
    db.observable.sendMessage = function (type, message, destinationNode, options) {
        /// <param name="type" type="String">Type of message</param>
        /// <param name="message">Message to send</param>
        /// <param name="destinationNode" type="Number">ID of destination node</param>
        /// <param name="options" type="Object" optional="true">{wantReply: Boolean, isFailure: Boolean, requestId: Number}. If wantReply, the returned promise will complete with the reply from remote. Otherwise it will complete when message has been successfully sent.</param>
        options = options || {};
        if (!mySyncNode.node)
            return options.wantReply ?
                Promise$1.reject(new Dexie.DatabaseClosedError()) :
                Promise$1.resolve(); // If caller doesn't want a reply, it won't catch errors either.
        var msg = { message: message, destinationNode: destinationNode, sender: mySyncNode.node.id, type: type };
        Dexie.extend(msg, options); // wantReply: wantReply, success: !isFailure, requestId: ...
        return Dexie.ignoreTransaction(function () {
            var tables = ["_intercomm"];
            if (options.wantReply)
                tables.push("_syncNodes"); // If caller wants a reply, include "_syncNodes" in transaction to check that there's a receiver there. Otherwise, new master will get it.
            var promise = db.transaction('rw', tables, function () {
                if (options.wantReply) {
                    // Check that there is a receiver there to take the request.
                    return db._syncNodes.where('id').equals(destinationNode).count(function (receiverAlive) {
                        if (receiverAlive)
                            return db._intercomm.add(msg);
                        else
                            return db._syncNodes.where('isMaster').above(0).first(function (masterNode) {
                                msg.destinationNode = masterNode.id;
                                return db._intercomm.add(msg);
                            });
                    });
                }
                else {
                    // If caller doesn't need a response, we don't have to make sure that it gets one.
                    return db._intercomm.add(msg);
                }
            }).then(function (messageId) {
                var rv = null;
                if (options.wantReply) {
                    rv = new Promise$1(function (resolve, reject) {
                        requestsWaitingForReply[messageId.toString()] = { resolve: resolve, reject: reject };
                    });
                }
                if (localStorage) {
                    localStorage.setItem("Dexie.Observable/intercomm/" + db.name, messageId.toString());
                }
                Observable.on.intercomm.fire(db.name);
                return rv;
            });
            if (!options.wantReply) {
                promise.catch(function () {
                });
                return;
            }
            else {
                // Forward rejection to caller if it waits for reply.
                return promise;
            }
        });
    };
    // Send a message to all local _syncNodes
    db.observable.broadcastMessage = function (type, message, bIncludeSelf) {
        if (!mySyncNode.node)
            return;
        var mySyncNodeId = mySyncNode.node.id;
        Dexie.ignoreTransaction(function () {
            db._syncNodes.toArray(function (nodes) {
                return Promise$1.all(nodes
                    .filter(function (node) { return node.type === 'local' && (bIncludeSelf || node.id !== mySyncNodeId); })
                    .map(function (node) { return db.observable.sendMessage(type, message, node.id); }));
            }).catch(function () {
            });
        });
    };
    function consumeIntercommMessages() {
        // Check if we got messages:
        if (!mySyncNode.node)
            return Promise$1.reject(new Dexie.DatabaseClosedError());
        return Dexie.ignoreTransaction(function () {
            return db.transaction('rw', '_intercomm', function () {
                return db._intercomm.where({ destinationNode: mySyncNode.node.id }).toArray(function (messages) {
                    messages.forEach(function (msg) { return consumeMessage(msg); });
                    return db._intercomm.where('id').anyOf(messages.map(function (msg) { return msg.id; })).delete();
                });
            });
        });
    }
    function consumeMessage(msg) {
        if (msg.type === 'response') {
            // This is a response. Lookup pending request and fulfill its promise.
            var request = requestsWaitingForReply[msg.requestId.toString()];
            if (request) {
                if (msg.isFailure) {
                    request.reject(msg.message.error);
                }
                else {
                    request.resolve(msg.message.result);
                }
                delete requestsWaitingForReply[msg.requestId.toString()];
            }
        }
        else {
            // This is a message or request. Fire the event and add an API for the subscriber to use if reply is requested
            msg.resolve = function (result) {
                db.observable.sendMessage('response', { result: result }, msg.sender, { requestId: msg.id });
            };
            msg.reject = function (error) {
                db.observable.sendMessage('response', { error: error.toString() }, msg.sender, { isFailure: true, requestId: msg.id });
            };
            db.on.message.fire(msg);
        }
    }
    // Listener for 'intercomm' events
    // Gets fired when we get a 'storage' event from local storage or when sendMessage is called
    // 'storage' is used to communicate between tabs (sendMessage changes the localStorage to trigger the event)
    // sendMessage is used to communicate in the same tab and to trigger a storage event
    function onIntercomm(dbname) {
        // When storage event trigger us to check
        if (dbname === db.name) {
            consumeIntercommMessages().catch('DatabaseClosedError', function () { });
        }
    }
    return {
        onIntercomm: onIntercomm,
        consumeIntercommMessages: consumeIntercommMessages
    };
}

function overrideParseStoresSpec(origFunc) {
    return function (stores, dbSchema) {
        // Create the _changes and _syncNodes tables
        stores["_changes"] = "++rev";
        stores["_syncNodes"] = "++id,myRevision,lastHeartBeat,&url,isMaster,type,status";
        stores["_intercomm"] = "++id,destinationNode";
        stores["_uncommittedChanges"] = "++id,node"; // For remote syncing when server returns a partial result.
        // Call default implementation. Will populate the dbSchema structures.
        origFunc.call(this, stores, dbSchema);
        // Allow UUID primary keys using $$ prefix on primary key or indexes
        Object.keys(dbSchema).forEach(function (tableName) {
            var schema = dbSchema[tableName];
            if (schema.primKey.name.indexOf('$$') === 0) {
                schema.primKey.uuid = true;
                schema.primKey.name = schema.primKey.name.substr(2);
                schema.primKey.keyPath = schema.primKey.keyPath.substr(2);
            }
        });
        // Now mark all observable tables
        Object.keys(dbSchema).forEach(function (tableName) {
            // Marked observable tables with "observable" in their TableSchema.
            if (tableName.indexOf('_') !== 0 && tableName.indexOf('$') !== 0) {
                dbSchema[tableName].observable = true;
            }
        });
    };
}

function deleteOldChanges(db) {
    // This is a background job and should never be done within
    // a caller's transaction. Use Dexie.ignoreTransaction() to ensure that.
    // We should not return the Promise but catch it ourselves instead.
    // To prohibit starving the database we want to lock transactions as short as possible
    // and since we're not in a hurry, we could do this job in chunks and reschedule a
    // continuation every 500 ms.
    var CHUNK_SIZE = 100;
    Dexie.ignoreTransaction(function () {
        return db._syncNodes.orderBy("myRevision").first(function (oldestNode) {
            return db._changes
                .where("rev").below(oldestNode.myRevision)
                .limit(CHUNK_SIZE)
                .primaryKeys();
        }).then(function (keysToDelete) {
            if (keysToDelete.length === 0)
                return; // Done.
            return db._changes.bulkDelete(keysToDelete).then(function () {
                // If not done garbage collecting, reschedule a continuation of it until done.
                if (keysToDelete.length === CHUNK_SIZE) {
                    // Limit reached. Changes are there are more job to do. Schedule again:
                    setTimeout(function () { return db.isOpen() && deleteOldChanges(db); }, 500);
                }
            });
        });
    }).catch(function () {
        // The operation is not crucial. A failure could almost only be due to that database has been closed.
        // No need to log this.
    });
}

/* ==========================================================================
 *                           dexie-observable.js
 * ==========================================================================
 *
 * Dexie addon for observing database changes not just on local db instance
 * but also on other instances, tabs and windows.
 *
 * Comprises a base framework for dexie-syncable.js
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
var global = self;
/** class DatabaseChange
    *
    *  Object contained by the _changes table.
    */
var DatabaseChange = Dexie.defineClass({
    rev: Number,
    source: String,
    table: String,
    key: Object,
    type: Number,
    obj: Object,
    mods: Object,
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
    LOCAL_POLL = 500, // 500 ms. In real-world there will be this value + the time it takes to poll(). A small value is needed in Workers where we cannot rely on storage event.
    HEARTBEAT_INTERVAL = NODE_TIMEOUT - 5000;
    var localStorage = Observable.localStorageImpl;
    /** class SyncNode
        *
        * Object contained in the _syncNodes table.
        */
    var SyncNode = Dexie.defineClass({
        //id: Number,
        myRevision: Number,
        type: String,
        lastHeartBeat: Number,
        deleteTimeStamp: Number,
        url: String,
        isMaster: Number,
        // Below properties should be extended in Dexie.Syncable. Not here. They apply to remote nodes only (type == "remote"):
        syncProtocol: String,
        syncContext: null,
        syncOptions: Object,
        connected: false,
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
    db.observable = {};
    db.observable.SyncNode = SyncNode;
    var wakeupObservers = initWakeupObservers(db, Observable, localStorage);
    var overrideCreateTransaction = initOverrideCreateTransaction(db, wakeupObservers);
    var crudMonitor = initCrudMonitor(db);
    var overrideOpen = initOverrideOpen(db, SyncNode, crudMonitor);
    var mySyncNode = { node: null };
    var intercomm = initIntercomm(db, Observable, SyncNode, mySyncNode, localStorage);
    var onIntercomm = intercomm.onIntercomm;
    var consumeIntercommMessages = intercomm.consumeIntercommMessages;
    // Allow other addons to access the local sync node. May be needed by Dexie.Syncable.
    Object.defineProperty(db, "_localSyncNode", {
        get: function () { return mySyncNode.node; }
    });
    var pollHandle = null, heartbeatHandle = null;
    if (Dexie.fake) {
        // This code will never run.
        // It's here just to enable auto-complete in visual studio - helps a lot when writing code.
        db.version(1).stores({
            _syncNodes: "++id,myRevision,lastHeartBeat",
            _changes: "++rev",
            _intercomm: "++id,destinationNode",
            _uncommittedChanges: "++id,node"
        });
        db._syncNodes.mapToClass(SyncNode);
        db._changes.mapToClass(DatabaseChange);
        mySyncNode.node = new SyncNode({
            myRevision: 0,
            type: "local",
            lastHeartBeat: Date.now(),
            deleteTimeStamp: null
        });
    }
    //
    // Override parsing the stores to add "_changes" and "_syncNodes" tables.
    // It also adds UUID support for the primary key and sets tables as observable tables.
    //
    db.Version.prototype._parseStoresSpec = override(db.Version.prototype._parseStoresSpec, overrideParseStoresSpec);
    // changes event on db:
    db.on.addEventType({
        changes: 'asap',
        cleanup: [promisableChain, nop],
        message: 'asap'
    });
    //
    // Override transaction creation to always include the "_changes" store when any observable store is involved.
    //
    db._createTransaction = override(db._createTransaction, overrideCreateTransaction);
    // If Observable.latestRevsion[db.name] is undefined, set it to 0 so that comparing against it always works.
    // You might think that it will always be undefined before this call, but in case another Dexie instance in the same
    // window with the same database name has been created already, this static property will already be set correctly.
    Observable.latestRevision[db.name] = Observable.latestRevision[db.name] || 0;
    //
    // Override open to setup hooks for db changes and map the _syncNodes table to class
    //
    db.open = override(db.open, overrideOpen);
    db.close = override(db.close, function (origClose) {
        return function () {
            if (db.dynamicallyOpened())
                return origClose.apply(this, arguments); // Don't observe dynamically opened databases.
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
            if (mySyncNode.node && mySyncNode.node.id) {
                Observable.on.suicideNurseCall.fire(db.name, mySyncNode.node.id);
                // Inform other windows as well:
                if (localStorage) {
                    localStorage.setItem('Dexie.Observable/deadnode:' + mySyncNode.node.id.toString() + '/' + db.name, "dead"); // In IE, this will also wakeup our own window. cleanup() may trigger twice per other db instance. But that doesnt to anything.
                }
                mySyncNode.node.deleteTimeStamp = 1; // One millisecond after 1970. Makes it occur in the past but still keeps it truthy.
                mySyncNode.node.lastHeartBeat = 0;
                db._syncNodes.put(mySyncNode.node); // This async operation may be cancelled since the browser is closing down now.
                mySyncNode.node = null;
            }
            if (pollHandle)
                clearTimeout(pollHandle);
            pollHandle = null;
            if (heartbeatHandle)
                clearTimeout(heartbeatHandle);
            heartbeatHandle = null;
            return origClose.apply(this, arguments);
        };
    });
    // Override Dexie.delete() in order to delete Observable.latestRevision[db.name].
    db.delete = override(db.delete, function (origDelete) {
        return function () {
            return origDelete.apply(this, arguments).then(function (result) {
                // Reset Observable.latestRevision[db.name]
                Observable.latestRevision[db.name] = 0;
                return result;
            });
        };
    });
    // When db opens, make sure to start monitor any changes before other db operations will start.
    db.on("ready", function startObserving() {
        if (db.dynamicallyOpened())
            return db; // Don't observe dynamically opened databases.
        return db.table("_changes").orderBy("rev").last(function (lastChange) {
            // Since startObserving() is called before database open() method, this will be the first database operation enqueued to db.
            // Therefore we know that the retrieved value will be This query will
            var latestRevision = (lastChange ? lastChange.rev : 0);
            mySyncNode.node = new SyncNode({
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
                Dexie.ignoreTransaction(function () {
                    Observable.on.latestRevisionIncremented.fire(latestRevision);
                });
            }
            // Add new sync node or if this is a reopening of the database after a close() call, update it.
            return db.transaction('rw', '_syncNodes', function () {
                return db._syncNodes
                    .where('isMaster').equals(1)
                    .first(function (currentMaster) {
                    if (!currentMaster) {
                        // There's no master. We must be the master
                        mySyncNode.node.isMaster = 1;
                    }
                    else if (currentMaster.lastHeartBeat < Date.now() - NODE_TIMEOUT) {
                        // Master have been inactive for too long
                        // Take over mastership
                        mySyncNode.node.isMaster = 1;
                        currentMaster.isMaster = 0;
                        return db._syncNodes.put(currentMaster);
                    }
                }).then(function () {
                    // Add our node to DB and start subscribing to events
                    return db._syncNodes.add(mySyncNode.node).then(function () {
                        Observable.on('latestRevisionIncremented', onLatestRevisionIncremented); // Wakeup when a new revision is available.
                        Observable.on('beforeunload', onBeforeUnload);
                        Observable.on('suicideNurseCall', onSuicide);
                        Observable.on('intercomm', onIntercomm);
                        // Start polling for changes and do cleanups:
                        pollHandle = setTimeout(poll, LOCAL_POLL);
                        // Start heartbeat
                        heartbeatHandle = setTimeout(heartbeat, HEARTBEAT_INTERVAL);
                    });
                });
            }).then(function () {
                cleanup();
            });
        });
    }, true); // True means the on(ready) event will survive a db reopening (db.close() / db.open()).
    var handledRevision = 0;
    function onLatestRevisionIncremented(dbname, latestRevision) {
        if (dbname === db.name) {
            if (handledRevision >= latestRevision)
                return; // Make sure to only run once per revision. (Workaround for IE triggering storage event on same window)
            handledRevision = latestRevision;
            Dexie.vip(function () {
                readChanges(latestRevision).catch('DatabaseClosedError', function () {
                    // Handle database closed error gracefully while reading changes.
                    // Don't trigger 'unhandledrejection'.
                    // Even though we intercept the close() method, it might be called when in the middle of
                    // reading changes and then that flow will cancel with DatabaseClosedError.
                });
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
        var ourSyncNode = mySyncNode.node; // Because mySyncNode can suddenly be set to null on database close, and worse, can be set to a new value if database is reopened.
        if (!ourSyncNode) {
            return Promise.reject(new Dexie.DatabaseClosedError());
        }
        var LIMIT = 1000;
        var promise = db._changes.where("rev").above(ourSyncNode.myRevision).limit(LIMIT).toArray(function (changes) {
            if (changes.length > 0) {
                var lastChange = changes[changes.length - 1];
                partial = (changes.length === LIMIT);
                db.on('changes').fire(changes, partial);
                ourSyncNode.myRevision = lastChange.rev;
            }
            else if (wasPartial) {
                // No more changes, BUT since we have triggered on('changes') with partial = true,
                // we HAVE TO trigger changes again with empty list and partial = false
                db.on('changes').fire([], false);
            }
            var ourNodeStillExists = false;
            return db._syncNodes.where(':id').equals(ourSyncNode.id).modify(function (syncNode) {
                ourNodeStillExists = true;
                syncNode.lastHeartBeat = Date.now(); // Update heart beat (not nescessary, but why not!)
                syncNode.deleteTimeStamp = null; // Reset "deleteTimeStamp" flag if it was there.
                syncNode.myRevision = Math.max(syncNode.myRevision, ourSyncNode.myRevision);
            }).then(function () { return ourNodeStillExists; });
        }).then(function (ourNodeStillExists) {
            if (!ourNodeStillExists) {
                // My node has been deleted. We must have been lazy and got removed by another node.
                if (browserIsShuttingDown) {
                    throw new Error("Browser is shutting down");
                }
                else {
                    db.close();
                    console.error("Out of sync"); // TODO: What to do? Reload the page?
                    if (global.location)
                        global.location.reload(true);
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
        }).finally(function () {
            delete readChanges.ongoingOperation;
        });
        if (!recursion) {
            readChanges.ongoingOperation = promise;
        }
        return promise;
    }
    /**
     * The reason we need heartbeat in parallell with poll() is due to the risk of long-running
     * transactions while syncing changes from server to client in Dexie.Syncable. That transaction will
     * include _changes (which will block readChanges()) but not _syncNodes. So this heartbeat will go on
     * during that changes are being applied and update our lastHeartBeat property while poll() is waiting.
     * When cleanup() (who also is blocked by the sync) wakes up, it won't kill the master node because this
     * heartbeat job will have updated the master node's heartbeat during the long-running sync transaction.
     *
     * If we did not have this heartbeat, and a server send lots of changes that took more than NODE_TIMEOUT
     * (20 seconds), another node waking up after the sync would kill the master node and take over because
     * it would believe it was dead.
     */
    function heartbeat() {
        heartbeatHandle = null;
        var currentInstance = mySyncNode.node && mySyncNode.node.id;
        if (!currentInstance)
            return;
        db.transaction('rw!', db._syncNodes, function () {
            db._syncNodes.where({ id: currentInstance }).first(function (ourSyncNode) {
                if (!ourSyncNode) {
                    // We do not exist anymore. Call db.close() to teardown polls etc.
                    if (db.isOpen())
                        db.close();
                    return;
                }
                ourSyncNode.lastHeartBeat = Date.now();
                ourSyncNode.deleteTimeStamp = null; // Reset "deleteTimeStamp" flag if it was there.
                return db._syncNodes.put(ourSyncNode);
            });
        }).catch('DatabaseClosedError', function () {
            // Ignore silently
        }).finally(function () {
            if (mySyncNode.node && mySyncNode.node.id === currentInstance && db.isOpen()) {
                heartbeatHandle = setTimeout(heartbeat, HEARTBEAT_INTERVAL);
            }
        });
    }
    function poll() {
        pollHandle = null;
        var currentInstance = mySyncNode.node && mySyncNode.node.id;
        if (!currentInstance)
            return;
        Dexie.vip(function () {
            readChanges(Observable.latestRevision[db.name]).then(cleanup).then(consumeIntercommMessages)
                .catch('DatabaseClosedError', function () {
                // Handle database closed error gracefully while reading changes.
                // Don't trigger 'unhandledrejection'.
                // Even though we intercept the close() method, it might be called when in the middle of
                // reading changes and then that flow will cancel with DatabaseClosedError.
            })
                .finally(function () {
                // Poll again in given interval:
                if (mySyncNode.node && mySyncNode.node.id === currentInstance && db.isOpen()) {
                    pollHandle = setTimeout(poll, LOCAL_POLL);
                }
            });
        });
    }
    function cleanup() {
        var ourSyncNode = mySyncNode.node;
        if (!ourSyncNode)
            return Promise.reject(new Dexie.DatabaseClosedError());
        return db.transaction('rw', '_syncNodes', '_changes', '_intercomm', function () {
            // Cleanup dead local nodes that has no heartbeat for over a minute
            // Dont do the following:
            //nodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).and(function (node) { return node.type == "local"; }).delete();
            // Because client may have been in hybernate mode and recently woken up. That would lead to deletion of all nodes.
            // Instead, we should mark any old nodes for deletion in a minute or so. If they still dont wakeup after that minute we could consider them dead.
            var weBecameMaster = false;
            db._syncNodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).filter(function (node) { return node.type === 'local'; }).modify(function (node) {
                if (node.deleteTimeStamp && node.deleteTimeStamp < Date.now()) {
                    // Delete the node.
                    delete this.value;
                    // Cleanup localStorage "deadnode:" entry for this node (localStorage API was used to wakeup other windows (onstorage event) - an event type missing in indexedDB.)
                    if (localStorage) {
                        localStorage.removeItem('Dexie.Observable/deadnode:' + node.id + '/' + db.name);
                    }
                    // Check if we are deleting a master node
                    if (node.isMaster) {
                        // The node we are deleting is master. We must take over that role.
                        // OK to call nodes.update(). No need to call Dexie.vip() because nodes is opened in existing transaction!
                        db._syncNodes.update(ourSyncNode, { isMaster: 1 });
                        weBecameMaster = true;
                    }
                    // Cleanup intercomm messages destinated to the node being deleted.
                    // Those that waits for reply should be redirected to us.
                    db._intercomm.where({ destinationNode: node.id }).modify(function (msg) {
                        if (msg.wantReply)
                            msg.destinationNode = ourSyncNode.id;
                        else
                            // Delete the message from DB and if someone is waiting for reply, let ourselved answer the request.
                            delete this.value;
                    });
                }
                else if (!node.deleteTimeStamp) {
                    // Mark the node for deletion
                    node.deleteTimeStamp = Date.now() + HIBERNATE_GRACE_PERIOD;
                }
            }).then(function () {
                // Cleanup old revisions that no node is interested of.
                Observable.deleteOldChanges(db);
                return db.on("cleanup").fire(weBecameMaster);
            });
        });
    }
    function onBeforeUnload() {
        // Mark our own sync node for deletion.
        if (!mySyncNode.node)
            return;
        browserIsShuttingDown = true;
        mySyncNode.node.deleteTimeStamp = 1; // One millisecond after 1970. Makes it occur in the past but still keeps it truthy.
        mySyncNode.node.lastHeartBeat = 0;
        db._syncNodes.put(mySyncNode.node); // This async operation may be cancelled since the browser is closing down now.
        Observable.wereTheOneDying = true; // If other nodes in same window wakes up by this call, make sure they dont start taking over mastership and stuff...
        // Inform other windows that we're gone, so that they may take over our role if needed. Setting localStorage item below will trigger Observable.onStorage, which will trigger onSuicie() below:
        if (localStorage) {
            localStorage.setItem('Dexie.Observable/deadnode:' + mySyncNode.node.id.toString() + '/' + db.name, "dead"); // In IE, this will also wakeup our own window. However, that is doublechecked in nursecall subscriber below.
        }
    }
    function onSuicide(dbname, nodeID) {
        if (dbname === db.name && !Observable.wereTheOneDying) {
            // Make sure it's dead indeed. Second bullet. Why? Because it has marked itself for deletion in the onbeforeunload event, which is fired just before window dies.
            // It's own call to put() may have been cancelled.
            // Note also that in IE, this event may be called twice, but that doesnt harm!
            Dexie.vip(function () {
                db._syncNodes.update(nodeID, { deleteTimeStamp: 1, lastHeartBeat: 0 }).then(cleanup);
            });
        }
    }
}
//
// Static properties and methods
// 
Observable.latestRevision = {}; // Latest revision PER DATABASE. Example: Observable.latestRevision.FriendsDB = 37;
Observable.on = Dexie.Events(null, "latestRevisionIncremented", "suicideNurseCall", "intercomm", "beforeunload"); // fire(dbname, value);
Observable.createUUID = createUUID;
Observable.deleteOldChanges = deleteOldChanges;
Observable._onStorage = initOnStorage(Observable);
Observable._onBeforeUnload = function () {
    Observable.on.beforeunload.fire();
};
try {
    Observable.localStorageImpl = global.localStorage;
}
catch (ex) { }
//
// Map window events to static events in Dexie.Observable:
//
if (global.addEventListener) {
    global.addEventListener("storage", Observable._onStorage);
    global.addEventListener("beforeunload", Observable._onBeforeUnload);
}
// Register addon:
Dexie.Observable = Observable;
Dexie.addons.push(Observable);

export default Observable;
//# sourceMappingURL=dexie-observable.es.js.map
