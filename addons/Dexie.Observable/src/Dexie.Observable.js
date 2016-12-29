/// <reference path="../../../dist/dexie.js" />

/**
 * Dexie.Observable.js
 * ===================
 * Dexie addon for observing database changes not just on local db instance but also on other instances and windows.
 *
 * version: {version} Alpha, {date}
 *
 * Disclaimber: This addon is in alpha status meaning that
 * its API and behavior may change.
 *
 */
import Dexie from 'dexie';
import { nop, promisableChain, createUUID } from './utils';

import initCreatingHook from './hooks/creating';
import initUpdatingHook from './hooks/updating';
import initDeletingHook from './hooks/deleting';

import initOverrideCreateTransaction from './override-create-transaction';
import initWakeupObservers from './wakeup-observers';

import initOnStorage from './on-storage';

import overrideParseStoresSpec from './override-parse-stores-spec';

import deleteOldChanges from './delete-old-changes';

var global = self;

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

export default function Observable(db) {
    /// <summary>
    ///   Extension to Dexie providing Syncronization capabilities to Dexie.
    /// </summary>
    /// <param name="db" type="Dexie"></param>

    var NODE_TIMEOUT = 20000, // 20 seconds before local db instances are timed out. This is so that old changes can be deleted when not needed and to garbage collect old _syncNodes objects.
        HIBERNATE_GRACE_PERIOD = 20000, // 20 seconds
        // LOCAL_POLL: The time to wait before polling local db for changes and cleaning up old nodes. 
        // Polling for changes is a fallback only needed in certain circomstances (when the onstorage event doesnt reach all listeners - when different browser windows doesnt share the same process)
        LOCAL_POLL = 2000; // 1 second. In real-world there will be this value + the time it takes to poll().
        //HEARTBEAT_INTERVAL = NODE_TIMEOUT - 5000;

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

    const wakeupObservers = initWakeupObservers(db, Observable, localStorage);
    const overrideCreateTransaction = initOverrideCreateTransaction(db, wakeupObservers);

    var mySyncNode = null;

    // Allow other addons to access the local sync node. May be needed by Dexie.Syncable.
    Object.defineProperty(db, "_localSyncNode", {
        get: function() { return mySyncNode; }
    });

    var pollHandle = null;

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
        mySyncNode = new SyncNode({
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
        cleanup: [promisableChain, nop], // fire (nodesTable, changesTable, trans). Hook called when cleaning up nodes. Subscribers may return a Promise to to more stuff. May do additional stuff if local sync node is master.
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

    db.open = override(db.open, origOpen => {
        return function () {
            //
            // Make sure to subscribe to "creating", "updating" and "deleting" hooks for all observable tables that were created in the stores() method.
            //
            Object.keys(db._allTables).forEach(tableName => {
                let table = db._allTables[tableName];
                if (table.schema.observable) { 
                    crudMonitor(table);
                }
                if (table.name === "_syncNodes") {
                    table.mapToClass(SyncNode);
                }
            });
            return origOpen.apply(this, arguments);            
        }
    });

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
                if (localStorage) {
                    localStorage.setItem('Dexie.Observable/deadnode:' + mySyncNode.id.toString() + '/' + db.name, "dead"); // In IE, this will also wakeup our own window. cleanup() may trigger twice per other db instance. But that doesnt to anything.
                }
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
        if (table.hook._observing) return;
        table.hook._observing = true;

        const tableName = table.name;
        table.hook('creating').subscribe(initCreatingHook(db, table));

        table.hook('updating').subscribe(initUpdatingHook(db, tableName));

        table.hook('deleting').subscribe(initDeletingHook(db, tableName));
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
            return db.transaction('rw', '_syncNodes', () => {
                return db._syncNodes
                    .where('isMaster').equals(1)
                    .first(currentMaster => {
                        if (!currentMaster) {
                            // There's no master. We must be the master
                            mySyncNode.isMaster = 1;
                        } else if (currentMaster.lastHeartBeat < Date.now() - NODE_TIMEOUT) {
                            // Master have been inactive for too long
                            // Take over mastership
                            mySyncNode.isMaster = 1;
                            currentMaster.isMaster = 0;
                            return db._syncNodes.put(currentMaster);
                        }
                    }).then(()=>{
                        // Add our node to DB and start subscribing to events
                        return db._syncNodes.add(mySyncNode).then(function() {
                            Observable.on('latestRevisionIncremented', onLatestRevisionIncremented); // Wakeup when a new revision is available.
                            Observable.on('beforeunload', onBeforeUnload);
                            Observable.on('suicideNurseCall', onSuicide);
                            Observable.on('intercomm', onIntercomm);
                            // Start polling for changes and do cleanups:
                            pollHandle = setTimeout(poll, LOCAL_POLL);
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
            if (handledRevision >= latestRevision) return; // Make sure to only run once per revision. (Workaround for IE triggering storage event on same window)
            handledRevision = latestRevision;
            Dexie.vip(function() {
                readChanges(latestRevision).catch('DatabaseClosedError', ()=>{
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
        var ourSyncNode = mySyncNode; // Because mySyncNode can suddenly be set to null on database close, and worse, can be set to a new value if database is reopened.
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
            } else if (wasPartial) {
                // No more changes, BUT since we have triggered on('changes') with partial = true,
                // we HAVE TO trigger changes again with empty list and partial = false
                db.on('changes').fire([], false);
            }

            let ourNodeStillExists = false;
            return db._syncNodes.where(':id').equals(ourSyncNode.id).modify(syncNode => {
                ourNodeStillExists = true;
                syncNode.lastHeartBeat = Date.now(); // Update heart beat (not nescessary, but why not!)
                syncNode.deleteTimeStamp = null; // Reset "deleteTimeStamp" flag if it was there.
                syncNode.myRevision = Math.max(syncNode.myRevision, ourSyncNode.myRevision);
            }).then(()=>ourNodeStillExists);
        }).then(ourNodeStillExists =>{
            if (!ourNodeStillExists) {
                // My node has been deleted. We must have been lazy and got removed by another node.
                if (browserIsShuttingDown) {
                    throw new Error("Browser is shutting down");
                } else {
                    db.close();
                    console.error("Out of sync"); // TODO: What to do? Reload the page?
                    if (global.location) global.location.reload(true);
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

    /*function heartbeat() {
        var ourSyncNodeId = mySyncNode && mySyncNode.id;
        if (!ourSyncNodeId) return;
        db.transaction('rw!', db._syncNodes, ()=>{
            db._syncNodes.where({id: ourSyncNodeId}).first(ourSyncNode => {
                if (!ourSyncNode) {
                    // We do not exist anymore. Call db.close() to teardown polls etc.
                    if (db.isOpen()) db.close();
                    return;
                }
                ourSyncNode.lastHeartBeat = Date.now();
                ourSyncNode.deleteTimeStamp = null; // Reset "deleteTimeStamp" flag if it was there.
                return db._syncNodes.put(ourSyncNode);
            });
        }).then(()=>{
            setTimeout(heartbeat, HEARTBEAT_INTERVAL);
        });
    }*/

    function poll() {
        pollHandle = null;
        var currentInstance = mySyncNode && mySyncNode.id;
        if (!currentInstance) return;
        Dexie.vip(function() { // VIP ourselves. Otherwise we might not be able to consume intercomm messages from master node before database has finished opening. This would make DB stall forever. Cannot rely on storage-event since it may not always work in some browsers of different processes.
            readChanges(Observable.latestRevision[db.name]).then(cleanup).then(consumeIntercommMessages)
            .catch('DatabaseClosedError', ()=>{
                // Handle database closed error gracefully while reading changes.
                // Don't trigger 'unhandledrejection'.
                // Even though we intercept the close() method, it might be called when in the middle of
                // reading changes and then that flow will cancel with DatabaseClosedError.
            })
            .finally(function() {
                // Poll again in given interval:
                if (mySyncNode && mySyncNode.id === currentInstance) {
                    pollHandle = setTimeout(poll, LOCAL_POLL);
                }
            });
        });
    }

    
    function cleanup() {
        var ourSyncNode = mySyncNode;
        if (!ourSyncNode) return Promise.reject(new Dexie.DatabaseClosedError());
        return db.transaction('rw', '_syncNodes', '_changes', '_intercomm', function() {
            // Cleanup dead local nodes that has no heartbeat for over a minute
            // Dont do the following:
            //nodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).and(function (node) { return node.type == "local"; }).delete();
            // Because client may have been in hybernate mode and recently woken up. That would lead to deletion of all nodes.
            // Instead, we should mark any old nodes for deletion in a minute or so. If they still dont wakeup after that minute we could consider them dead.
            var weBecameMaster = false;
            db._syncNodes.where("lastHeartBeat").below(Date.now() - NODE_TIMEOUT).filter(node => node.type === 'local').modify(function(node) {
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
                    db._intercomm.where({destinationNode: node.id}).modify(function(msg) {
                        if (msg.wantReply)
                            msg.destinationNode = ourSyncNode.id;
                        else
                            // Delete the message from DB and if someone is waiting for reply, let ourselved answer the request.
                            delete this.value;
                    });
                } else if (!node.deleteTimeStamp) {
                    // Mark the node for deletion
                    node.deleteTimeStamp = Date.now() + HIBERNATE_GRACE_PERIOD;
                }
            }).then(function() {
                // Cleanup old revisions that no node is interested of.
                Observable.deleteOldChanges(db);
                return db.on("cleanup").fire(weBecameMaster);
            });
        });
    }

    function onBeforeUnload() {
        // Mark our own sync node for deletion.
        if (!mySyncNode) return;
        browserIsShuttingDown = true;
        mySyncNode.deleteTimeStamp = 1; // One millisecond after 1970. Makes it occur in the past but still keeps it truthy.
        mySyncNode.lastHeartBeat = 0;
        db._syncNodes.put(mySyncNode); // This async operation may be cancelled since the browser is closing down now.
        Observable.wereTheOneDying = true; // If other nodes in same window wakes up by this call, make sure they dont start taking over mastership and stuff...
        // Inform other windows that we're gone, so that they may take over our role if needed. Setting localStorage item below will trigger Observable.onStorage, which will trigger onSuicie() below:
        if (localStorage) {
            localStorage.setItem('Dexie.Observable/deadnode:' + mySyncNode.id.toString() + '/' + db.name, "dead"); // In IE, this will also wakeup our own window. However, that is doublechecked in nursecall subscriber below.
        }
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

    /**
     * @param {string} type Type of message
     * @param message Message to send
     * @param {number} destinationNode ID of destination node
     * @param {{wantReply: boolean, isFailure: boolean, requestId: number}} options If {wantReply: true}, the returned promise will complete with the reply from remote. Otherwise it will complete when message has been successfully sent.</param>
     */
    db.sendMessage = function(type, message, destinationNode, options) {
        /// <param name="type" type="String">Type of message</param>
        /// <param name="message">Message to send</param>
        /// <param name="destinationNode" type="Number">ID of destination node</param>
        /// <param name="options" type="Object" optional="true">{wantReply: Boolean, isFailure: Boolean, requestId: Number}. If wantReply, the returned promise will complete with the reply from remote. Otherwise it will complete when message has been successfully sent.</param>
        options = options || {};
        var msg = { message: message, destinationNode: destinationNode, sender: mySyncNode.id, type: type };
        Dexie.extend(msg, options); // wantReply: wantReply, success: !isFailure, requestId: ...
        if (!mySyncNode)
            return options.wantReply ?
                Promise.reject(new Dexie.DatabaseClosedError()) :
                Promise.resolve(); // If caller dont want reply, it wont catch errors either.

        return Dexie.ignoreTransaction(()=>{
            var tables = ["_intercomm"];
            if (options.wantReply) tables.push("_syncNodes"); // If caller wants a reply, include "_syncNodes" in transaction to check that there's a reciever there. Otherwise, new master will get it.
            var promise = db.transaction('rw', tables, () => {
                if (options.wantReply) {
                    // Check that there is a reciever there to take the request.
                    return db._syncNodes.where('id').equals(destinationNode).count(recieverAlive => {
                        if (recieverAlive)
                            return db._intercomm.add(msg);
                        else
                            return db._syncNodes.where('isMaster').above(0).first(function(masterNode) {
                                msg.destinationNode = masterNode.id;
                                return db._intercomm.add(msg)
                            });
                    });
                } else {
                    // If caller doesnt need a response, we must not make sure to get one.
                    return db._intercomm.add(msg); 
                }
            }).then (messageId => {
                var rv = null;
                if (options.wantReply) {
                    rv = new Promise(function(resolve, reject) {
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
                promise.catch(()=>{});
                return;
            } else {
                // Forward rejection to caller if it waits for reply.
                return promise;
            }
        });
    };

    db.broadcastMessage = function(type, message, bIncludeSelf) {
        if (!mySyncNode) return;
        var mySyncNodeId = mySyncNode.id;
        Dexie.ignoreTransaction(()=>{
            db._syncNodes.toArray(nodes => {
                return Promise.all(nodes
                    .filter(node => node.type === 'local' && (bIncludeSelf || node.id !== mySyncNodeId))
                    .map(node => db.sendMessage(type, message, node.id))); 
            }).catch(()=>{});
        });
    };

    db.observable = {};
    db.observable.SyncNode = SyncNode;

    function consumeIntercommMessages() {
        // Check if we got messages:
        if (!mySyncNode) return Promise.reject(new Dexie.DatabaseClosedError());
        return Dexie.ignoreTransaction(()=>{
            return db._intercomm.where({destinationNode: mySyncNode.id}).toArray(messages => {
                messages.forEach(msg => consumeMessage(msg));
                return db._intercomm.where('id').anyOf(messages.map(msg => msg.id)).delete();
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
            consumeIntercommMessages().catch('DatabaseClosedError', ()=>{});
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

Observable._onBeforeUnload = function() {
    Observable.on.beforeunload.fire();
};

try {
    Observable.localStorageImpl = global.localStorage;
} catch (ex){}

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
