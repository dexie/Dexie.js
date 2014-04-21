/// <reference path="../src/Dexie.js" />
(function (window, publish, isBrowser, undefined) {
// TODO: try chain!
    "use strict"

    // Import some usable helper functions
    var override = Dexie.override;

    function Syncable (db) {
    	/// <summary>
    	///   Extension to Dexie providing Syncronization capabilities to Dexie.
    	/// </summary>
        /// <param name="db" type="Dexie"></param>

        var nodeInfo = {
            myRevision: 0,
            type: "local",
            lastHeartBeat: Date.now()
        };

        var revisionOfLastChange = 0;
        var anySyncedTable = 0;

        Dexie.fakeAutoComplete(function(){
            db.version(1).stores({ _syncNodes: "++id,rev", _changes: "++rev,tstmp" });
            db._syncNodes.defineClass({
                id: Number,
                rev: Number,
                type: String,
                lastHeartBeat: Number
            });
        });

        //
        // Override parsing the stores to allow "sync:" prefix on any object store.
        //
        db._parseStoresSpec = override(db._parseStoresSpec, function(origFunc) {
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
                        newStoresSpec = tableDef;
                    }
                });
                if (createChangesTable) {
                    // Create the _changes table
                    newStoresSpec["_changes"] = "++rev,tstmp";
                }
                // Store whether we will use syncing or not into anySyncedTable private var.
                anySyncedTable = createChangesTable;
                // Call default implementation. Will populate the dbSchema structures.
                origFunc.call(this, newStoresSpec, dbSchema);
                // Now mark all synced tables
                Object.keys(syncedTables).forEach(function (tableName) {
                    // Marked synced tables with "synced" in their TableSchema.
                    dbSchema[tableName].synced = true;
                });
            };
        });

        //
        // Overide transaction creation to always include the "_changes" store when any synced store is involved.
        //
        db._createTransaction = override (db._createTransaction, function(origFunc)  {
            return function (mode, storenames, dbschema) {
                var addChanges = false;
                if (mode === 'readwrite' && storenames.some(function (storeName) { return dbschema[storeName] && dbschema[storeName].synced; })) {
                    // At least one included store is a synced store. Make sure to also include the _changes store.
                    addChanges = true;
                    storenames.push("_changes");
                }
                // Call original db._createTransaction()
                var trans = origFunc.call(this, mode, storenames, dbschema);
                // If this transaction 
                if (addChanges) {
                    trans._changesTable = trans.table("_changes"); // Cache the changes table on the transaction for performance optimization.
                    trans._timestamp = Date.now(); // Cache the time stamp of when transaction was created for performance optimization.
                    trans.on('complete', onChangesAdded);
                }
                return trans;
            }
        });

        //
        // Make sure to subscribe to "creating", "updating" and "deleting" events for all synced tables when opening the database.
        //
        db.open = override(db.open, function(origOpen) {
            return function () {
                Object.keys(db._allTables).forEach(function (tableName) {
                    var table = db._allTables[tableName];
                    if (table.schema.synced) {
                        cudHook(table);
                        addObserveEvents(table);
                    }
                });
                return origOpen.call(this);
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
                trans._changesTable.add({
                    tstmp: trans._timestamp,
                    table: tableName,
                    key: primKey,
                    type: 1,
                    obj: obj
                }).then(function (rev) {
                    revisionOfLastChange = rev;
                });
            });
            table.hook('updating', function (mods, primKey, obj, trans) {
                /// <param name="trans" type="db.Transaction"></param>
                var modifiedObj = deepClone(obj);
                Object.keys(mods).forEach(function (keyPath) {
                    Dexie.setByKeyPath(modifiedObj, mods[keyPath]);
                });
                trans._changesTable.add({
                    tstmp: trans._timestamp,
                    table: tableName,
                    key: primKey,
                    type: 2,
                    oldObj: obj,
                    mods: mods,
                    newObj: modifiedObj
                }).then(function (rev) {
                    revisionOfLastChange = rev;
                });
            });
            table.hook('deleting', function (primKey, obj, trans) {
                /// <param name="trans" type="db.Transaction"></param>
                trans._changesTable.add({
                    tstmp: trans._timestamp,
                    table: tableName,
                    key: primKey,
                    type: 3,
                    obj: obj
                }).then(function (rev) {
                    revisionOfLastChange = rev;
                });
            });
        }

        //
        // Add on('created'), on('updated') and on ('deleted') events and listed to changes from other browser windows.
        //
        function addObserveEvents(table) {
            /// <param name="table" type="db.Table"></param>
            table.on = Dexie.events (null, 'created', 'updated', 'deleted');
        }

        function onChangesAdded() {
            if (onChangesAdded.handle) clearTimeout(onChangesAdded.handle);
            onChangesAdded.handle = setTimeout(function () {
                delete onChangesAdded.handle;
                sessionStorage.setItem('Dexie.Syncable.wakeup', revisionOfLastChange);
            }, 50);
        }

        // When db opens, make sure to start monitor any changes before other db operations will start.
        db.on("ready", function startObserving() {
            //db.version(1).stores({ _changes: "++rev,tstmp" });
            return db.table("_changes").orderBy("rev").last(function (lastRevision) {
                // Since startObserving() is called before database open() method, this will be the first database operation enqueued to db.
                // Therefore we know that the retrieved value will be This query will 
                nodeInfo.myRevision = lastRevision;
                return db.table("_syncNodes").add(nodeInfo).then(function () {
                    window.addEventListener("storage", function (event) {
                        if (event.key === 'Dexie.Syncable.wakeup') {
                            var rev = parseInt(sessionStorage.getItem('Dexie.Syncable.wakeup'), 10);
                            if (!isNaN(rev) && rev > nodeInfo.myRevision) {
                                readChanges();
                            }
                        }
                    });
                    setInterval(poll, 1000);
                });
            });

        });

        function readChanges() {
            return db._changes.where("rev").above(nodeInfo.myRevision).each(function (change) {
                var on = db._allTables[change.table].on;
                switch (change.type) {
                    case 1:
                        on.created.tryFire(change.key, change.obj);
                        break;
                    case 2:
                        on.updated.tryFire(change.key, change.oldObj, change.mods, change.newObj);
                        break;
                    case 3:
                        on.deleted.tryFire(change.key, change.data);
                        break;
                }
                nodeInfo.myRevision = change.rev;
            }).then(function () {
                db.table("_syncNodes").put(nodeInfo);
            }).catch(function (e) {
                alert(e.stack || e);
            });
        }

        function poll() {
            return readChanges().then(function () {
                db.transaction('rw', db._syncNodes, db._changes, function (nodes, changes) {
                    nodes.put(nodeInfo);
                    nodes.orderBy("myRevision").first(function (oldestRev) {
                        changes.where("rev").below(oldestRev).delete();
                    });
                }).catch(function (e) {
                    alert(e.stack || e);
                });
            });
        }

   }

    Dexie.addons.push (SyncableDexie);

}).apply(this, typeof module === 'undefined' || (typeof window !== 'undefined' && this == window) 
? [window, function (name, value) { window[name] = value; }, true ]    // Adapt to browser environment
: [global, function (name, value) { module.exports = value; }, false]); // Adapt to Node.js environment


