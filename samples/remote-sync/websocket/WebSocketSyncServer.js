/** WebSocketSyncServer.

    WebSocket server that can be used as a template for how to implement a sync server that interchange changes
    between a Dexie.Syncable client and a database of any kind.

    The code is only dependant on nodejs-websocket. For simplicity reasons, it uses a non-persistent RAM database. It handles conflicts according to
    the Dexie.Syncable specification; The rules of thumb for conflict handling is that:
        1. Client- and server state must be exact the same after a sync operation.
        2. Server changes are applied after client changes - thereby winning over the latter except when client
           already has deleted an object - then the server update wont affect any object since it doesnt exist
           on client.

    In this code, the resolveConflicts() function handles changes on the server AS IF the server changes where
    applied after client changes.
 */

var ws = require("nodejs-websocket"); // This will work also in browser if "websocketserver-shim.js" is included.

// CREATE / UPDATE / DELETE constants:
var CREATE = 1,
    UPDATE = 2,
    DELETE = 3;

function SyncServer(port) {
    // This sample sync server works against a RAM database - an object of tables + an array of changes to the database

    // ----------------------------------------------------------------------------
    //
    //
    //
    //                               THE DATABASE
    //
    //
    //
    // ----------------------------------------------------------------------------
    var db = {
        tables: {},  // Tables: Each key is a table and its value is another object where each key is the primary key and value is the record / object that is stored in ram.
        changes: [], // Special table that records all changes made to the db. In this simple sample, we let it grow infinitly. In real world, we would have had a regular cleanup of old changes.
        uncommittedChanges: {}, // Map<clientID,Array<change>> Changes where partial=true buffered for being committed later on.
        revision: 0, // Current revision of the database.
        subscribers: [], // Subscribers to when database got changes. Used by server connections to be able to push out changes to their clients as they occur.

        create: function (table, key, obj, clientIdentity) {
            // Create table if it doesnt exist:
            db.tables[table] = db.tables[table] || {};
            // Put the obj into to table
            db.tables[table][key] = obj;
            // Register the change:
            db.changes.push({
                rev: ++db.revision,
                source: clientIdentity,
                type: CREATE,
                table: table,
                key: key,
                obj: obj
            });
            db.trigger();
        },
        update: function (table, key, modifications, clientIdentity) {
            if (db.tables[table]) {
                var obj = db.tables[table][key];
                if (obj) {
                    applyModifications(obj, modifications);
                    db.changes.push({
                        rev: ++db.revision,
                        source: clientIdentity,
                        type: UPDATE,
                        table: table,
                        key: key,
                        mods: modifications
                    });
                    db.trigger();
                }
            }
        },
        'delete': function (table, key, clientIdentity) {
            if (db.tables[table]) {
                if (db.tables[table][key]) {
                    delete db.tables[table][key];
                    db.changes.push({
                        rev: ++db.revision,
                        source: clientIdentity,
                        type: DELETE,
                        table: table,
                        key: key,
                    });
                    db.trigger();
                }
            }
        },
        trigger: function () {
            if (!db.trigger.delayedHandle) {
                // Delay the trigger so that it's only called once per bunch of changes instead of being called for each single change.
                db.trigger.delayedHandle = setTimeout(function () {
                    delete db.trigger.delayedHandle;
                    db.subscribers.forEach(function (subscriber) {
                        try { subscriber(); } catch (e) { }
                    });
                }, 0);
            }
        },
        subscribe: function (fn) {
            db.subscribers.push(fn);
        },
        unsubscribe: function (fn) {
            db.subscribers.splice(db.subscribers.indexOf(fn), 1);
        }
    };















    // ----------------------------------------------------------------------------
    //
    //
    //
    //                               THE SERVER
    //
    //
    //
    // ----------------------------------------------------------------------------

    var nextClientIdentity = 1;

    this.start = function () {
        ws.createServer(function (conn) {

            var syncedRevision = 0; // Used when sending changes to client. Only send changes above syncedRevision since client is already in sync with syncedRevision.

            function sendAnyChanges() {
                // Get all changes after syncedRevision that was not performed by the client we're talkin' to.
                var changes = db.changes.filter(function (change) { return change.rev > syncedRevision && change.source !== conn.clientIdentity; });
                // Compact changes so that multiple changes on same object is merged into a single change.
                var reducedSet = reduceChanges(changes, conn.clientIdentity);
                // Convert the reduced set into an array again.
                var reducedArray = Object.keys(reducedSet).map(function (key) { return reducedSet[key]; });
                // Notice the current revision of the database. We want to send it to client so it knows what to ask for next time.
                var currentRevision = db.revision;

                conn.sendText(JSON.stringify({
                    type: "changes",
                    changes: reducedArray,
                    currentRevision: currentRevision,
                    partial: false // Tell client that these are the only changes we are aware of. Since our mem DB is syncronous, we got all changes in one chunk.
                }));

                syncedRevision = currentRevision; // Make sure we only send revisions coming after this revision next time and not resend the above changes over and over.
            }

            conn.on("text", function (message) {
                var request = JSON.parse(message);
                var type = request.type;
                if (type == "clientIdentity") {
                    // Client Hello: Client says "Hello, My name is <clientIdentity>!" or "Hello, I'm newborn. Please give me a name!"
                    // Client identity is used for the following purpose:
                    //  * When client sends its changes, register the changes into server database and mark each change with the clientIdentity.
                    //  * When sending back changes to client, leave out those marked with the client id so that changes aren't echoed back.
                    // The client should initiate the connection by submitting or requesting a client identity.
                    // This should be done before sending any changes to us.

                    // Client submits his identity or requests one
                    if (request.clientIdentity) {
                        // Client has an identity that we have given earlier
                        conn.clientIdentity = request.clientIdentity;
                    } else {
                        // Client requests an identity. Provide one.
                        conn.clientIdentity = nextClientIdentity++;
                        conn.sendText(JSON.stringify({
                            type: "clientIdentity",
                            clientIdentity: conn.clientIdentity
                        }));
                    }
                } else if (type == "subscribe") {
                    // Client wants to subscribe to server changes happened or happening after given syncedRevision
                    syncedRevision = request.syncedRevision || 0;
                    // Send any changes we have currently:
                    sendAnyChanges();
                    // Start subscribing for additional changes:
                    db.subscribe(sendAnyChanges);

                } else if (type == "changes") {
                    // Client sends its changes to us.
                    var requestId = request.requestId;
                    try {
                        if (!request.changes instanceof Array) {
                            throw "Property 'changes' must be provided and must be an array";
                        }
                        if (!("baseRevision" in request)) {
                            throw "Property 'baseRevision' missing";
                        }
                        // First, if sent change set is partial. 
                        if (request.partial) {
                            // Don't commit changes just yet. Store it in the partialChanges table so far. (In real db, uncommittedChanges would be its own table with columns: {clientID, type, table, key, obj, mods}).
                            // Get or create db.uncommittedChanges array for current client
                            if (db.uncommittedChanges[conn.clientIdentity]) {
                                // Concat the changes to existing change set:
                                db.uncommittedChanges[conn.clientIdentity] = db.uncommittedChanges[conn.clientIdentity].concat(request.changes);
                            } else {
                                // Create the change set:
                                db.uncommittedChanges[conn.clientIdentity] = request.changes;
                            }
                        } else {
                            // This request is not partial. Time to commit.
                            // But first, check if we have previous changes from that client in uncommittedChanges because now is the time to commit them too.
                            if (db.uncommittedChanges[conn.clientIdentity]) {
                                request.changes = db.uncommittedChanges[conn.clientIdentity].concat(request.changes);
                                delete db.uncommittedChanges[conn.clientIdentity];
                            }

                            // ----------------------------------------------
                            //
                            //
                            //
                            // HERE COMES THE QUITE IMPORTANT SYNC ALGORITHM!
                            //
                            // 1. Reduce all server changes (not client changes) that have occurred after given
                            //    baseRevision (our changes) to a set (key/value object where key is the combination of table/primaryKey)
                            // 2. Check all client changes against reduced server
                            //    changes to detect conflict. Resolve conflicts:
                            //      If server created an object with same key as client creates, updates or deletes: Always discard client change.
                            //      If server deleted an object with same key as client creates, updates or deletes: Always discard client change.
                            //      If server updated an object with same key as client updates: Apply all properties the client updates unless they conflict with server updates
                            //      If server updated an object with same key as client creates: Apply the client create but apply the server update on top
                            //      If server updated an object with same key as client deletes: Let client win. Deletes always wins over Updates.
                            //
                            // 3. After resolving conflicts, apply client changes into server database.
                            // 4. Send an ack to the client that we have persisted its changes
                            //
                            //
                            // ----------------------------------------------
                            var baseRevision = request.baseRevision || 0;
                            var serverChanges = db.changes.filter(function (change) { return change.rev > baseRevision });
                            var reducedServerChangeSet = reduceChanges(serverChanges);
                            var resolved = resolveConflicts(request.changes, reducedServerChangeSet);

                            // Now apply the resolved changes:
                            resolved.forEach(function (change) {
                                switch (change.type) {
                                    case CREATE:
                                        db.create(change.table, change.key, change.obj, conn.clientIdentity);
                                        break;
                                    case UPDATE:
                                        db.update(change.table, change.key, change.mods, conn.clientIdentity);
                                        break;
                                    case DELETE:
                                        db.delete(change.table, change.key, conn.clientIdentity);
                                        break;
                                }
                            });
                        }

                        // Now ack client that we have recieved his changes. This should be done no matter if the're buffered into uncommittedChanges
                        // or if the're actually committed to db.
                        conn.sendText(JSON.stringify({
                            type: "ack",
                            requestId: requestId,
                        }));
                    } catch (e) {
                        conn.sendText(JSON.stringify({
                            type: "error",
                            requestId: requestId,
                            message: e.toString()
                        }));
                        conn.close();
                    }
                }

            });

            conn.on("close", function () {
                // When client disconnects, stop subscribing from db.
                db.unsubscribe(sendAnyChanges);
            });
        }).listen(port);
    }
}

function reduceChanges(changes) {
    // Converts an Array of change objects to a set of change objects based on its unique combination of (table ":" key).
    // If several changes were applied to the same object, the resulting set will only contain one change for that object.
    return changes.reduce(function (set, nextChange) {
        var id = nextChange.table + ":" + nextChange.key;
        var prevChange = set[id];
        if (!prevChange) {
            // This is the first change on this key. Add it unless it comes from the source that we are working against
            set[id] = nextChange;
        } else {
            // Merge the oldchange with the new change
            set[id] = (function () {
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
        }
        return set;
    }, {});
}

function resolveConflicts(clientChanges, serverChangeSet) {
    var resolved = [];
    clientChanges.forEach(function (clientChange) {
        var id = clientChange.table + ":" + clientChange.key;
        var serverChange = serverChangeSet[id];
        if (!serverChange) {
            // No server change on same object. Totally conflict free!
            resolved.push(clientChange);
        } else if (serverChange.type == UPDATE) {
            // Server change overlaps. Only if server change is not CREATE or DELETE, we should consider merging in the client change.
            switch (clientChange.type) {
                case CREATE:
                    // Server has updated an object with same key as client has recreated. Let the client recreation go through, but also apply server modifications.
                    applyModifications(clientChange.obj, serverChange.mods); // No need to clone clientChange.obj beofre applying modifications since noone else refers to clientChanges (it was retrieved from the socket connection in current request)
                    resolved.push(clientChange);
                    break;
                case UPDATE:
                    // Server and client has updated the same obejct. Just remove any overlapping keyPaths and only apply non-conflicting parts.
                    Object.keys(serverChange.mods).forEach(function (keyPath) {
                        // Remote this property from the client change
                        delete clientChange.mods[keyPath];
                        // Also, remote all changes to nestled objects under this keyPath from the client change:
                        Object.keys(clientChange.mods).forEach(function (clientKeyPath) {
                            if (clientKeyPath.indexOf(keyPath + '.') == 0) {
                                delete clientChange.mods[clientKeyPath];
                            }
                        });
                    });
                    // Did we delete all keyPaths in the modification set of the clientChange?
                    if (Object.keys(clientChange.mods).length > 0) {
                        // No, there were some still there. Let this wing-clipped change be applied:
                        resolved.push(clientChange);
                    }
                    break;
                case DELETE:
                    // Delete always win over update. Even client over a server
                    resolved.push(clientChange);
                    break;
            }
        } // else if serverChange.type is CREATE or DELETE, dont push anything to resolved, because the client change is not of any interest (CREATE or DELETE would eliminate any client change with same key!)
    });
    return resolved;
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function applyModifications(obj, modifications) {
    Object.keys(modifications).forEach(function (keyPath) {
        setByKeyPath(obj, keyPath, modifications[keyPath]);
    });
    return obj;
}

function combineCreateAndUpdate(prevChange, nextChange) {
    var clonedChange = deepClone(prevChange);// Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
    applyModifications(clonedChange.obj, nextChange.mods); // Apply modifications to existing object.
    return clonedChange;
}

function combineUpdateAndUpdate(prevChange, nextChange) {
    var clonedChange = deepClone(prevChange); // Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
    Object.keys(nextChange.mods).forEach(function (keyPath) {
        // If prev-change was changing a parent path of this keyPath, we must update the parent path rather than adding this keyPath
        var hadParentPath = false;
        Object.keys(prevChange.mods).filter(function (parentPath) { return keyPath.indexOf(parentPath + '.') === 0 }).forEach(function (parentPath) {
            setByKeyPath(clonedChange.mods[parentPath], keyPath.substr(parentPath.length + 1), nextChange.mods[keyPath]);
            hadParentPath = true;
        });
        if (!hadParentPath) {
            // Add or replace this keyPath and its new value
            clonedChange.mods[keyPath] = nextChange.mods[keyPath];
        }
        // In case prevChange contained sub-paths to the new keyPath, we must make sure that those sub-paths are removed since
        // we must mimic what would happen if applying the two changes after each other:
        Object.keys(prevChange.mods).filter(function (subPath) { return subPath.indexOf(keyPath + '.') === 0 }).forEach(function (subPath) {
            delete clonedChange.mods[subPath];
        });
    });
    return clonedChange;
}

function setByKeyPath(obj, keyPath, value) {
    if (!obj || typeof keyPath !== 'string') return;
    var period = keyPath.indexOf('.');
    if (period !== -1) {
        var currentKeyPath = keyPath.substr(0, period);
        var remainingKeyPath = keyPath.substr(period + 1);
        if (remainingKeyPath === "")
            obj[currentKeyPath] = value;
        else {
            var innerObj = obj[currentKeyPath];
            if (!innerObj) innerObj = (obj[currentKeyPath] = {});
            setByKeyPath(innerObj, remainingKeyPath, value);
        }
    } else {
        obj[keyPath] = value;
    }
}

module.export = SyncServer;
