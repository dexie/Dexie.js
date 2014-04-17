/* Minimalistic IndexedDB Wrapper with Bullet Proof Transactions
   =============================================================

   By David Fahlander, david.fahlander@gmail.com

   Version 0.9.7 - DATE, YEAR.

   Tested successfully on Chrome, IE11, Firefox and Opera.

   Official Website: https://github.com/dfahlander/Dexie.js/wiki/Dexie.js

   Licensed under the Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
*/
(function (window, publish, isBrowser, undefined) {

    "use strict";

    function extend(obj, extension) {
        if (typeof extension !== 'object') extension = extension(); // Allow to supply a function returning the extension. Useful for simplifying private scopes.
        Object.keys(extension).forEach(function (key) {
            obj[key] = extension[key];
        });
    }

    function derive(Child) {
        return {
            from: function (Parent) {
                Child.prototype = Object.create(Parent.prototype);
                Child.prototype.constructor = Child;
                return {
                    extend: function (extension) {
                        extend(Child.prototype, typeof extension !== 'object' ? extension(Parent.prototype) : extension);
                    }
                };
            }
        };
    }

    function override(origFunction, overridedFunction) {
        return function () { overridedFunction.apply(origFunction, arguments); };
    }

    function Dexie(dbName) {

        // Resolve all external dependencies:
        var deps = Dexie.dependencies;
        var indexedDB = deps.indexedDB,
            IDBKeyRange = deps.IDBKeyRange,
            IDBTransaction = deps.IDBTransaction;

        var DOMError = deps.DOMError,
            TypeError = deps.TypeError,
            RangeError = deps.RangeError,
            Error = deps.Error;

        var globalSchema = null;
        var dbVersion = 0;
        var versions = [];
        var dbStoreNames = [];
        var allTables = {};
        ///<var type="IDBDatabase" />
        var idbdb = null; // Instance of IDBDatabase
        var dbOpenError = null;
        var isBeingOpened = false;
        var READONLY = "readonly", READWRITE = "readwrite";
        var iewa; // IE WorkAound needed in IE10 & IE11 for http://connect.microsoft.com/IE/feedback/details/783672/indexeddb-getting-an-aborterror-exception-when-trying-to-delete-objectstore-inside-onupgradeneeded
        var db = this;
        var pausedResumeables = [];
        var use_proto = (function () { function F() { }; var a = new F(); try { a.__proto__ = Object.prototype; return !(a instanceof F) } catch (e) { return false; } })()

        function init() {
            // If browser (not node.js or other), subscribe to versionchange event and reload page
            if (isBrowser) db.on("versionchange", function (ev) {
                if (ev.newVersion && ev.newVersion > dbVersion) { // Only reload page if versionchange event isnt a deletion of db. Or if it's triggered with same verno as we already have due to delete/recreate calls.
                    // Default behavior for versionchange event is to reload the page.
                    // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
                    db.close();
                    window.location.reload(true);
                    /* The logic behind this default handler is:
                        1. Since this event means that the db is upgraded in another IDBDatabase instance (in tab or window that has a newer version of the code),
                           it makes sense to reload our page and force reload from cache. When reloaded, we get the newest version of the code - making app in synch with db.
                        2. There wont be an infinite loop here even if our page still get the old version, becuase the next time onerror will be triggered and not versionchange.
                        3. If not solving this by default, the API user would be obligated to handle versionchange, and would have to be on place in every example of Dexie code.
                    */
                };
            });
        }

        //
        //
        //
        // ------------------------- Versioning Framework---------------------------
        //
        //
        //

        this.version = function (versionNumber) {
            /// <param name="versionNumber" type="Number"></param>
            /// <returns type="Version"></returns>
            if (idbdb) throw new Error("Cannot add version when database is open");
            dbVersion = Math.max(dbVersion, versionNumber);
            var versionInstance = versions.filter(function (v) { return v._cfg.version == versionNumber; })[0];
            if (versionInstance) return versionInstance;
            versionInstance = new Version(versionNumber);
            versions.push(versionInstance);
            return versionInstance;
        }

        function Version(versionNumber) {
            this._cfg = {
                version: versionNumber,
                dbschema: null,
                schemaUpgrade: null,
                contentUpgrade: null,
            }
        }

        extend(Version.prototype, {
            stores: function (stores) {
                /// <summary>
                ///   Defines the schema for a particular version
                /// </summary>
                /// <param name="stores" type="Object">
                /// Example: <br/>
                ///   {users: "id++,first,last,&username,*email", <br/>
                ///   passwords: "id++,&username"}<br/>
                /// <br/>
                /// Syntax: {Table: "[primaryKey][++],[&][*]index1,[&][*]index2,..."}<br/><br/>
                /// Special characters:<br/>
                ///  "&"  means unique key, <br/>
                ///  "*"  means value is multiEntry, <br/>
                ///  "++" means auto-increment and only applicable for primary key <br/>
                /// </param>
                var dbschema = (this._cfg.dbschema = this._cfg.dbschema || {});
                this._parseStoresSpec(stores, dbschema);
                // Update the latest schema to this version
                var latestSchema = getCurrentDBSchema();
                if (globalSchema != latestSchema) {
                    // Update API
                    globalSchema = latestSchema;
                    removeTablesApi([allTables, db]);
                    setApiOnPlace(allTables, db._transPromiseFactory, Object.keys(latestSchema), READWRITE, latestSchema);
                    setApiOnPlace(db, db._transPromiseFactory, Object.keys(latestSchema), READWRITE, latestSchema, true);
                }
                dbStoreNames = Object.keys(latestSchema);

                return this;
            },
            upgrade: function (upgradeFunction) {
                /// <param name="upgradeFunction" optional="true">Function that performs upgrading actions.</param>
                var self = this;
                fakeAutoComplete(function () {
                    upgradeFunction(db._createTransaction (READWRITE, Object.keys(self._cfg.dbschema), self._cfg.dbschema));// BUGBUG: No code completion for prev version's tables wont appear.
                });
                this._cfg.contentUpgrade = upgradeFunction;
                return this;
            },
            _parseStoresSpec: function (stores, inOutSchema) {
                Object.keys(stores).forEach(function (tableName) {
                    var instanceTemplate = {};
                    var indexes = parseIndexSyntax(stores[tableName]);
                    var primKey = indexes.shift();
                    if (primKey.multi) throw new Error("Primary key cannot be multi-valued");
                    if (primKey.keyPath && primKey.auto) setByKeyPath(instanceTemplate, primKey.keyPath, 0);
                    indexes.forEach(function (idx) {
                        if (idx.auto) throw new Error("Only primary key can be marked as autoIncrement (++)");
                        if (!idx.keyPath) throw new Error("Index must have a name and cannot be an empty string");
                        setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () { return "" }) : "");
                    });
                    inOutSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
                });
            }
        });

        function runUpgraders(oldVersion, trans, reject) {
            if (oldVersion == 0) {
                //globalSchema = versions[versions.length - 1]._cfg.dbschema;
                // Create tables:
                Object.keys(globalSchema).forEach(function (tableName) {
                    createTable(trans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
                });
                // Populate data
                var t = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
                t.idbtrans = trans;
                t.active = true;
                t.idbtrans.onerror = eventRejectHandler(reject,  ["populating database"]);
                db.on("populate").fire(t);
            } else {
                // Upgrade version to version, step-by-step from oldest to newest version.
                // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
                var queue = [];
                globalSchema = null;
                var versToRun = versions.filter(function (v) { return v._cfg.version > oldVersion; });
                versToRun.forEach(function (version) {
                    /// <param name="version" type="Version"></param>
                    var oldSchema = globalSchema;
                    var newSchema = version._cfg.dbschema;
                    globalSchema = newSchema;
                    if (!oldSchema) {
                        queue.push(function (trans, cb) {
                            // Create tables:
                            Object.keys(newSchema).forEach(function (tableName) {
                                createTable(trans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
                            });
                            cb();
                        });
                    } else {
                        var diff = getSchemaDiff(oldSchema, newSchema);
                        diff.add.forEach(function (tuple) {
                            queue.push(function (trans, cb) {
                                createTable(trans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                            });
                            cb();
                        });
                        diff.change.forEach(function (change) {
                            if (change.recreate) {
                                // Recreate tables
                                if (hasIEDeleteObjectStoreBug()) {
                                    if (!iewa || !iewa[change.name]) {
                                        iewa = iewa || { __num: 0 };
                                        ++iewa.__num;
                                        iewa[change.name] = [];
                                        iterate(trans.objectStore(change.name).openCursor(), null, function (item) { iewa[change.name].push(item) }, function () {
                                            if (--iewa.__num == 0) {
                                                trans.abort(); // Abort transaction and re-open db re-run the upgraders now that all tables are read to mem.
                                                db.open();
                                            }
                                        });
                                    }
                                }

                                queue.push(function (trans, cb) {
                                    recreateTable(trans, change.name, change.def.primKey, change.def.indexes, cb);
                                });
                            } else {
                                queue.push(function (trans, cb) {
                                    var store = trans.objectStore(change.name);
                                    change.add.forEach(function (idx) {
                                        addIndex(store, idx);
                                    });
                                    change.change.forEach(function (idx) {
                                        store.deleteIndex(idx.name);
                                        addIndex(store, idx);
                                    });
                                    change.del.forEach(function (idxName) {
                                        store.deleteIndex(idxName);
                                    });
                                    cb();
                                });
                            }
                        });
                        if (newSchema._cfg.contentUpgrade) {
                            queue.push(function (trans, cb) {
                                var t = db._createTransaction(READWRITE, [].slice.call(trans.db.objectStoreNames, 0), newSchema);
                                t.idbtrans = trans;
                                t.active = true;
                                var uncompletedRequests = 0;
                                t._promise = override (function (mode, fn, writeLock) {
                                    ++uncompletedRequests;
                                    function proxy(fn) {
                                        return function () {
                                            fn.apply(this, arguments);
                                            if (--uncompletedRequests == 0) cb(); // A called db operation has completed without starting a new operation. The flow is finished, now run next upgrader.
                                        }
                                    }
                                    return this.call(t, function (resolve, reject, trans) {
                                        arguments[0] = proxy(resolve);
                                        arguments[1] = proxy(reject);
                                        fn.apply(this, arguments);
                                    });

                                    return this.apply(t, arguments).finally(function () {
                                        if (--uncompletedRequests === 0) cb();
                                    });
                                }, t._promise);
                                trans.onerror = eventRejectHandler(reject, ["running upgrader function for version", version._cfg.version]);
                                newSchema._cfg.contentUpgrade(t);
                                if (uncompletedRequests === 0) cb(); // contentUpgrade() didnt call any db operations at all.
                            });
                        }
                        if (diff.del.length) {
                            if (!hasIEDeleteObjectStoreBug()) { // Dont delete old tables if ieBug is present. Let tables be left in DB so far. This needs to be taken care of.
                                queue.push(function (trans, cb) {
                                    // Delete old tables
                                    diff.del.forEach(function (tableName) {
                                        trans.db.deleteObjectStore(tableName);
                                    });
                                    cb();
                                });
                            }
                        }
                    }
                });

                // Now, create a queue execution engine
                var runNextQueuedFunction = function () {
                    if (queue.length)
                        queue.shift()(trans, runNextQueuedFunction);
                };

                if (iewa && iewa.__num > 0) return; // MSIE 10 & 11 workaround. Halt this run - we are in progress of copying tables into memory. When that is done, we will abort transaction and re-open db again.

                runNextQueuedFunction();
            }
        }

        function getSchemaDiff(oldSchema, newSchema) {
            var diff = {
                del: [], // Array of table names
                add: [], // Array of [tableName, newDefinition]
                change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
            };
            for (var table in oldSchema) {
                if (!newSchema[table]) diff.del.push(table);
            }
            for (var table in newSchema) {
                var oldDef = oldSchema[table],
                    newDef = newSchema[table];
                if (!oldDef) diff.add.push([table, newDef]);
                else {
                    var change = {
                        name: table,
                        def: newSchema[table],
                        recreate: false,
                        del: [],
                        add: [],
                        change: []
                    };
                    if (oldDef.primKey.src != newDef.primKey.src) {
                        // Primary key has changed. Remove and re-add table.
                        change.recreate = true;
                        diff.change.push(change);
                    } else {
                        var oldIndexes = oldDef.indexes.reduce(function (prev, current) { prev[current.name] = current; return prev; }, {});
                        var newIndexes = newDef.indexes.reduce(function (prev, current) { prev[current.name] = current; return prev; }, {});
                        for (var idxName in oldIndexes) {
                            if (!newIndexes[idxName]) change.del.push(idxName);
                        }
                        for (var idxName in newIndexes) {
                            var oldIdx = oldIndexes[idxName],
                                newIdx = newIndexes[idxName];
                            if (!oldIdx) change.add.push(newIdx);
                            else if (oldIdx.src != newIdx.src) change.change.push(newIdx);
                        }
                        if (change.recreate || change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                            diff.change.push(change);
                        }
                    }
                }
            }
            return diff;
        }


        function copyTable(oldStore, newStore, cb) {
            /// <param name="oldStore" type="IDBObjectStore"></param>
            /// <param name="newStore" type="IDBObjectStore"></param>
            iterate(oldStore.openCursor(), null, function (item) {
                newStore.add(item);
            }, cb);
        }

        function createTable(trans, tableName, primKey, indexes) {
            /// <param name="trans" type="IDBTransaction"></param>
            var store = trans.db.createObjectStore(tableName, { keyPath: primKey.keyPath, autoIncrement: primKey.auto });
            indexes.forEach(function (idx) { addIndex(store, idx); });
            return store;
        }

        function addIndex(store, idx) {
            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
        }

        function recreateTable(trans, tableName, primKey, indexes, cb) {
            /// <param name="trans" type="IDBTransaction"></param>
            if (iewa) {
                //trans.db.deleteObjectStore(tableName);
                var store = createTable(trans, tableName, primKey, indexes);
                iewa[tableName].forEach(function (item) {
                    store.add(item);
                });
                delete iewa[tableName];
                if (Object.keys(iewa).length == 0) iewa = null;
                cb();
            } else {
                // Create temp table
                var tmpStore = createTable(trans, "_temp-" + tableName, primKey, []);
                // Copy old to temp
                copyTable(trans.objectStore(tableName), tmpStore, function () {
                    // Delete old
                    trans.db.deleteObjectStore(tableName);
                    // Create new
                    var recreatedStore = createTable(trans, tableName, primKey, indexes);
                    // Copy temp to new
                    copyTable(tmpStore, recreatedStore, function () {
                        // Delete temp
                        trans.db.deleteObjectStore("_temp-" + tableName);
                        cb();
                    });
                });
            }
        }

        //
        //
        //      Dexie Protected API
        //
        //

        this._allTables = allTables;

        this._backendDB = function () {
            return idbdb;
        }

        this._tableFactory = function createTable (mode, tableSchema, transactionPromiseFactory) {
        	/// <param name="tableSchema" type="TableSchema"></param>
            if (mode === READONLY)
                return new Table(tableSchema.name, transactionPromiseFactory, tableSchema, Collection);
            else
                return new WriteableTable(tableSchema.name, transactionPromiseFactory, tableSchema);
        }

        this._createTransaction = function (mode, storeNames, dbschema) {
            return new Transaction(mode, storeNames, dbschema);
        }

        this._transPromiseFactory = function transactionPromiseFactory(mode, storeNames, fn) { // Last argument is "writeLocked". But this doesnt apply to oneshot direct db operations, so we ignore it.
            if (!idbdb && !dbOpenError) {
                // Database is paused. Wait til resumed.
                return new Promise(function (resolve, reject) {
                    pausedResumeables.push({
                        resume: function () {
                            db._transPromiseFactory(mode, storeNames, fn).then(resolve, reject);
                        }
                    });
                });
            } else {
                var trans = db._createTransaction(mode, storeNames, globalSchema);
                return trans._promise(mode, function (resolve, reject) {
                    fn(function (value) {
                        // Instead of resolving value directly, wait with resolving it until transaction has completed.
                        // Otherwise the data would not be in the DB if requesting it in the then() operation.
                        // Specifically, to ensure that the following expression will work:
                        //
                        //   db.friends.put({name: "Arne"}).then(function () {
                        //       db.friends.where("name").equals("Arne").count(function(count) {
                        //           assert (count === 1);
                        //       });
                        //   });
                        //
                        trans.complete(function () {
                            resolve(value);
                        });
                    }, reject, trans);
                });
            }
        }

        this._whenReady = function (fn) {
            if (!idbdb && !dbOpenError) {
                return new Promise(function (resolve, reject) {
                    fakeAutoComplete(function () { new Promise(function () { fn(resolve, reject); }); });
                    pausedResumeables.push({
                        resume: function () {
                            new Promise(function () {
                                fn(resolve, reject);
                            });
                        }
                    });
                });
            }
            return new Promise(fn);
        },

        //
        //
        //
        //
        //      Dexie API
        //
        //
        //

        this.open = function () {
            return new Promise(function (resolve, reject) {
                if (idbdb) throw new Error("Database already open");
                function openError(err) {
                    isBeingOpened = false;
                    dbOpenError = err;
                    reject(dbOpenError);
                    pausedResumeables.forEach(function (resumable) {
                        // Resume all stalled operations. They will fail once they wake up.
                        resumable.resume();
                    });
                }
                try {
                    dbOpenError = null;
                    isBeingOpened = true;

                    // Make sure caller has specified at least one version
                    if (versions.length == 0) throw new Error("No versions specified. Need to call version(ver) method");
                    // Make sure at least the oldest version specifies a table schema
                    if (!versions[0]._cfg.dbschema) throw new Error("No schema specified. Need to call dbInstance.version(ver).stores(schema) on at least the lowest version.");
                    // Sort versions and make all Version instances have a schema (its own or previous if not specified)
                    versions.sort(lowerVersionFirst).reduce(function (prev, ver) {
                        if (!ver._cfg.dbschema) ver._cfg.dbschema = prev._cfg.dbschema;
                        return ver;
                    });

                    // Multiply dbVersion with 10 will be needed to workaround upgrading bug in IE: 
                    // IE fails when deleting objectStore after reading from it.
                    // A future version of Dexie.js will stopover an intermediate version to workaround this.
                    // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.
                    if (!indexedDB) throw new Error("indexedDB API not found. If using IE10+, make sure to run your code on a server URL (not locally). If using Safari, make sure to include indexedDB polyfill.");
                    var req = indexedDB.open(dbName, dbVersion * 10);
                    req.onerror = eventToError(openError);
                    req.onblocked = db.on("blocked").fire;
                    req.onupgradeneeded = function (e) {
                        req.transaction.onerror = eventToError(reject);
                        runUpgraders(e.oldVersion / 10, req.transaction, reject);
                    };
                    req.onsuccess = function (e) {
                        isBeingOpened = false;
                        idbdb = req.result;
                        idbdb.onversionchange = db.on("versionchange").fire;
                        pausedResumeables.forEach(function (resumable) {
                            // If anyone has made operations on a table instance before the db was opened, the operations will start executing now.
                            resumable.resume();
                        });
                        pausedResumeables = [];
                    };
                } catch (err) {
                    openError(err);
                }
            });
        }

        this.close = function () {
            if (idbdb) {
                idbdb.close();
                idbdb = null;
                dbOpenError = null;
            }
        }

        this.delete = function () {
            return new Promise(function (resolve, reject) {
                function doDelete() {
                    db.close();
                    var req = indexedDB.deleteDatabase(dbName);
                    req.onsuccess = resolve;
                    req.onerror = eventRejectHandler(reject, ["deleting", dbName]);
                    req.onblocked = db.on("blocked").fire;
                }
                if (isBeingOpened) {
                    pausedResumeables.push({ resume: doDelete });
                } else {
                    doDelete();
                }
            });
        }

        //
        // Events
        //
        this.on = events(this, "error", "populate", "blocked", "versionchange");

        fakeAutoComplete(function () {
            db.on("populate").fire(db._createTransaction(READWRITE, dbStoreNames, globalSchema));
            db.on("error").fire(new Error());
        });

        this.transaction = function (mode, tableInstances, scopeFunc) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
            /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
            /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>

            // Let table arguments be all arguments between mode and last argument.
            tableInstances = [].slice.call(arguments, 1, arguments.length - 1);
            // Let scopeFunc be the last argument
            scopeFunc = arguments[arguments.length - 1];
            return db._whenReady(function (resolve, reject) {
                var outerPSD = Promise.psd(); // Need to make sure Promise.PSD.prohibitDB does not continue over to the then() callback of our returned Promise! Callers may use direct DB access after transaction completes!
                try {
                    // Prohibit direct table access on db instance. This is to help people resolve
                    // issues when changing non-transactional code into code encapsulated in a transaction block.
                    // It very easily happens that one forgets to change all db calls from db.friends.add() to just friends.add(). 
                    // This "Promise Specific Data" member informs the table getter that we are in a transaction block. It will then throw an Error if trying to access db.friends.
                    Promise.PSD.prohibitDB = true; 

                    //
                    // Get storeNames from arguments. Either through given table instances, or through given table names.
                    //
                    var tables = Array.isArray(tableInstances[0]) ? tableInstances.reduce(function (a, b) { return a.concat(b) }) : tableInstances;
                    var storeNames = tables.map(function (tableInstance) {
                        if (typeof tableInstance == "string") {
                            if (!globalSchema[tableInstance]) { throw new Error("Invalid table name: " + tableInstance); return { INVALID_TABLE_NAME: 1 } }; // Return statement is for IDE code completion.
                            return tableInstance;
                        } else {
                            if (!(tableInstance instanceof Table)) { throw new TypeError("Invalid type. Arguments following mode must be instances of Table or String"); return { IVALID_TYPE: 1 }; }
                            return tableInstance.name;
                        }
                    });

                    //
                    // Resolve mode. Allow shortcuts "r" and "rw".
                    //
                    if (mode == "r" || mode == READONLY)
                        mode = READONLY;
                    else if (mode == "rw" || mode == READWRITE)
                        mode = READWRITE;
                    else
                        throw new RangeError("Invalid transaction mode");

                    //
                    // Create Transaction instance
                    //
                    var trans = db._createTransaction(mode, storeNames, globalSchema);

                    //
                    // Supply table instances bound to the new Transaction and provide them as callback arguments
                    //
                    var tableArgs = storeNames.map(function (name) { return trans.table(name); });
                    // Let last argument be the Transaction instance itself
                    tableArgs.push(trans);

                    // If transaction completes, resolve the Promise
                    trans.complete(resolve);
                    // If transaction fails, reject the Promise and bubble to db if noone catched this rejection.
                    trans.error(function (e) {
                        var catched = reject(e);
                        if (!catched) db.on("error").fire(e); // If not catched, bubble error to db.on("error").
                    });

                    // Finally, call the scope function with our table and transaction arguments.
                    try {
                        scopeFunc.apply(null, tableArgs);
                    } catch (e) {
                        // If exception occur, abort the transaction and reject Promise.
                        trans.abort();
                        asap(function () {
                            // reject() would always return false if not calling using asap() since we are in the constructor,
                            if (!reject(e)) db.on("error").fire(e); // If not catched, bubble exception to db.on("error");
                        });
                    }
                } finally {
                    Promise.PSD = outerPSD;
                }
            });
        }

        this.table = function (tableName) {
            if (!allTables.hasOwnProperty(tableName)) { throw new Error("Table does not exist"); return { AN_UNKNOWN_TABLE_NAME_WAS_SPECIFIED: 1 }; }
            return allTables[tableName];
        }

        //
        //
        //
        // Table Class
        //
        //
        //
        function Table(name, transactionPromiseFactory, tableSchema, collClass) {
            /// <param name="name" type="String"></param>
            this.name = name;
            this.schema = tableSchema;
            this.hook = allTables[name] ? allTables[name].hook : events(null, {
                "creating": [modifyableFunctionChain, nop],
                "reading":  [pureFunctionChain, mirror],
                "updating": [modifyableFunctionChain, nop],
                "deleting": [nonStoppableEventChain, nop]
            });
            this._tpf = transactionPromiseFactory;
            this._collClass = collClass || Collection;
        }

        extend(Table.prototype, function () {
            //
            // Table Private Functions
            //

            function parseType(type) {
                if (typeof type == 'function') {
                    return new type();
                } else if (Array.isArray(type)) {
                    return [parseType(type[0])];
                } else if (typeof type == 'object') {
                    var rv = {};
                    applyStructure(rv, type);
                    return rv;
                } else {
                    return type;
                }
            }

            function applyStructure(obj, structure) {
                Object.keys(structure).forEach(function (member) {
                    var value = parseType(structure[member]);
                    obj[member] = value;
                });
            }

            return {
                //
                // Table Protected Methods
                //

                _trans: function getTransaction(mode, fn, writeLocked) {
                    return this._tpf(mode, [this.name], fn, writeLocked);
                },
                _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
                    var self = this;
                    return this._tpf(mode, [this.name], function (resolve, reject, trans) {
                        fn(resolve, reject, trans.idbtrans.objectStore(self.name), trans);
                    }, writeLocked);
                },

                //
                // Table Public Methods
                //
                get: function (key, cb) {
                    var self = this;
                    fakeAutoComplete(function () { cb(self.schema.instanceTemplate) });
                    return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                        var req = idbstore.get(key);
                        req.onerror = eventRejectHandler(reject, ["getting", key, "from", self.name]);
                        req.onsuccess = function () {
                            resolve(self.hook.reading.fire(req.result));
                        };
                    }).then(cb);
                },
                where: function (indexName) {
                    return new WhereClause(this, indexName);
                },
                count: function (cb) {
                    return new this._collClass(new WhereClause(this)).count(cb);
                },
                limit: function (numRows) {
                    return new this._collClass(new WhereClause(this)).limit(numRows);
                },
                each: function (fn) {
                    var self = this;
                    fakeAutoComplete(function () { fn(self.schema.instanceTemplate) });
                    return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                        var req = idbstore.openCursor();
                        req.onerror = eventRejectHandler(reject, ["calling", "Table.each()", "on", self.name]);
                        iterate(req, null, fn, resolve, reject, self.hook.reading.fire);
                    });
                },
                toArray: function (cb) {
                    var self = this;
                    fakeAutoComplete(function () { cb([self.schema.instanceTemplate]) });
                    return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                        var a = [];
                        var req = idbstore.openCursor();
                        req.onerror = eventRejectHandler(reject, ["calling", "Table.toArray()", "on", self.name]);
                        iterate(req, null, function (item) { a.push(item); }, function () { resolve(a); }, reject, self.hook.reading.fire);
                    }).then(cb);
                },
                orderBy: function (index) {
                    return new this._collClass(new WhereClause(this, index));
                },

                toCollection: function () {
                    return new this._collClass(new WhereClause(this));
                },

                mapToClass: function (constructor, structure) {
                    /// <summary>
                    ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
                    ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
                    /// </summary>
                    /// <param name="constructor">Constructor function representing the class.</param>
                    /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
                    /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
                    if (this.schema.mappedClass) throw new Error("Table already mapped");
                    this.schema.mappedClass = constructor;
                    var instanceTemplate = Object.create(constructor.prototype);
                    if (structure) {
                        // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
                        applyStructure(instanceTemplate, structure); 
                    }
                    this.schema.instanceTemplate = instanceTemplate;

                    // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
                    // no matter which method to use for reading (Table.get() or Table.where(...)... )
                    this.hook("reading", use_proto ?
                        function makeInherited (obj) {
                            if (!obj) return obj; // No valid object. (Value is null). Return as is.
                            // The JS engine supports __proto__. Just change that pointer on the existing object. A little more efficient way.
                            obj.__proto__ = constructor.prototype;
                            return obj;
                        } : function makeInherited (obj) {
                            if (!obj) return obj; // No valid object. (Value is null). Return as is.
                            // __proto__ not supported - do it by the standard: return a new object and clone the members from the old one.
                            var res = Object.create(proto);
                            for (var m in obj) if (obj.hasOwnProperty(m)) res[m] = obj[m];
                            return res;
                        });
                    return constructor;
                },
                defineClass: function (structure) {
                    /// <summary>
                    ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
                    ///     as well as making it possible to extend the prototype of the returned constructor function.
                    /// </summary>
                    /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
                    /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>

                    // The defined class has a constructor taking an optional argument with all properties to set.
                    function Class(properties) {
                        /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
                        /// </param>
                        if (properties) extend(this, properties);
                    }
                    Class.name = this.name; // Set the name of the class to the table name by default. This is an EcmaScript 6 feature. Not supported by IE11 yet.
                    applyStructure(Class.prototype, structure);
                    if (this.schema.primKey.keyPath) delByKeyPath(Class.prototype, this.schema.primKey.keyPath); // add() and put() fails on Chrome if primKey template lies on prototype due to a bug in its implementation of getByKeyPath(), that it accepts getting from prototype chain.
                    return this.mapToClass(Class, structure);
                }
            };
        });

        //
        //
        //
        // WriteableTable Class (extends Table)
        //
        //
        //
        function WriteableTable(name, transactionPromiseFactory, tableSchema, collClass) {
            Table.call(this, name, transactionPromiseFactory, tableSchema, collClass || WriteableCollection);
        }

        derive(WriteableTable).from(Table).extend(function () {
            return {
                add: function (obj, key) {
                    /// <summary>
                    ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
                    /// </summary>
                    /// <param name="obj" type="Object">A javascript object to insert</param>
                    /// <param name="key" optional="true">Primary key</param>
                    var self = this,
                        creatingHook = this.hook.creating.fire;
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                        if (creatingHook !== nop) {
                            var effectiveKey = key || (idbstore.keyPath && getByKeyPath(obj, idbstore.keyPath));
                            var keyToUse = creatingHook(effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
                            if (effectiveKey === undefined && keyToUse !== undefined) {
                                if (idbstore.keyPath)
                                    setByKeyPath(obj, idbstore.keyPath, keyToUse);
                                else
                                    key = keyToUse;
                            }
                        }
                        var req = key ? idbstore.add(obj, key) : idbstore.add(obj);
                        req.onerror = eventRejectHandler(reject, ["adding", obj, "into", self.name]);
                        req.onsuccess = function (ev) {
                            var keyPath = idbstore.keyPath;
                            if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
                            resolve(req.result);
                        };
                    });
                },

                put: function (obj, key) {
                    /// <summary>
                    ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
                    /// </summary>
                    /// <param name="obj" type="Object">A javascript object to insert or update</param>
                    /// <param name="key" optional="true">Primary key</param>
                    var self = this;
                    if (this.hook.creating.subscribers.length || this.hook.deleting.subscribers.length) {
                        //
                        // People listens to when("creating") or when("deleting") events!
                        // We must implement put() using WriteableCollection.modify() and WriteableTable.add() in order to call the correct events!
                        //
                        return this._trans(READWRITE, function (resolve, reject, trans) {
                            // Since key is optional, make sure we get it from obj if not provided
                            key = key || (idbstore.keyPath && getByKeyPath(obj, idbstore.keyPath));
                            if (key === undefined) {
                                // No primary key. Must use add().
                                self.add(obj).then(resolve, reject);
                            } else {
                                // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
                                trans._lock();
                                self.where(":id").equals(key).modify(function (value) {
                                    // Replace extisting value with our object
                                    // CRUD event firing handled in WriteableCollection.modify()
                                    this.value = obj;
                                }).then(function (count) {
                                    if (count === 0) {
                                        // Object's key was not found. Add the object instead.
                                        // CRUD event firing will be done in add()
                                        return self.add(obj, key); // Resolving with another Promise. Returned Promise will then resolve with the new key.
                                    } else {
                                        return key; // Resolve with the provided key.
                                    }
                                }).finally(function () {
                                    trans._unlock();
                                }).then(resolve, reject);
                            }
                        });// true = Pause transaction factory during the entire operation. Needed because operation is splitted into modify() and add().
                    } else {
                        // Use the standard IDB put() method.
                        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                            var req = key ? idbstore.put(obj, key) : idbstore.put(obj);
                            req.onerror = eventRejectHandler(reject, ["putting", obj, "into", self.name]);
                            req.onsuccess = function (ev) {
                                var keyPath = idbstore.keyPath;
                                if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
                                resolve(req.result);
                            };
                        });
                    }
                },

                'delete': function (key) {
                    /// <param name="key">Primary key of the object to delete</param>
                    if (this.hook.deleting.subscribers.length) {
                        // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                        // call the CRUD event. Only WriteableCollection.delete() will know whether an object was actually deleted.
                        return this.where(":id").equals(key).delete();
                    } else {
                        // No one listens. Use standard IDB delete() method.
                        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                            var req = idbstore.delete(key);
                            req.onerror = eventRejectHandler(reject, ["deleting", key, "from", idbstore.name]);
                            req.onsuccess = function (ev) {
                                resolve(req.result);
                            };
                        });
                    }
                },

                clear: function () {
                    if (this.hook.deleting.subscribers.length) {
                        // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
                        // call the CRUD event. Only WriteableCollection.delete() will knows which objects that are actually deleted.
                        this.toCollection().delete();
                    } else {
                        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                            var req = idbstore.clear();
                            req.onerror = eventRejectHandler(reject, ["clearing", idbstore.name]);
                            req.onsuccess = function (ev) {
                                resolve(req.result);
                            };
                        });
                    }
                },

                modify: function (changes) {
                    return new this._collClass(new WhereClause(this)).modify(changes);
                },

                update: function (key, changes) {
                    return this.where(":id").equals(key).modify(changes);
                },
            }
        });

        //
        //
        //
        // Transaction Class
        //
        //
        //
        function Transaction(mode, storeNames, dbschema) {
            /// <summary>
            ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
            /// </summary>
            /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
            /// <param name="storeNames" type="Array">Array of table names to operate on</param>
            var self = this;
            this.mode = mode;
            this.storeNames = storeNames;
            this.idbtrans = null;
            this.on = events(this, ["complete", "error"], "abort");
            this._reculock = 0;
            this._blockedFuncs = [];
            this._psd = null;
            this.active = false;
            this._dbschema = dbschema;
            this._tpf = function transactionPromiseFactory (mode, storeNames, fn, writeLocked) {
                // Creates a Promise instance and calls fn (resolve, reject, trans) where trans is the instance of this transaction object.
                // Support for write-locking the transaction during the promise life time from creation to success/failure.
                // This is actually not needed when just using single operations on IDB, since IDB implements this internally.
                // However, when implementing a write operation as a series of operations on top of IDB(collection.delete() and collection.modify() for example),
                // lock is indeed needed if Dexie APIshould behave in a consistent manner for the API user.
                // Another example of this is if we want to support create/update/delete events,
                // we need to implement put() using a series of other IDB operations but still need to lock the transaction all the way.
                return self._promise(mode, fn, writeLocked);
            }

            //setApiOnPlace([this, this.tables], transactionPromiseFactory, storeNames, mode, dbschema); // Removed the auto-table population on Transactions in Dexie version 0.95 since the performance cost
            //is not worth the syntactic sugar of it. db.transaction() yet provides the table instances as arguments. Only on("populate") and upgrade() functions will be affected.
        }

        extend(Transaction.prototype, {

            //
            // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
            //

            _lock: function () {
                // Temporary set all requests into a pending queue if they are called before database is ready.
                ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
                if (this._reculock === 1) this._psd = Promise.PSD && Promise.PSD.constructor;
                return this;
            },
            _unlock: function () {
                if (--this._reculock === 0) {
                    this._psd = null;
                    while (this._blockedFuncs.length > 0 && !this._locked()) {
                        var fn = this._blockedFuncs.shift();
                        try { fn(); } catch (e) { }
                    }
                }
                return this;
            },
            _locked: function () {
                // Checks if any write-lock is applied on this transaction.
                // To simplify the Dexie API for extension implementations, we support recursive locks.
                // This is accomplished by using "Promise Specific Data" (PSD).
                // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
                // Promise.PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
                //         * callback given to the Promise() constructor  (function (resolve, reject){...})
                //         * callbacks given to then()/catch()/finally() methods (function (value){...})
                // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
                // Derivation is done so that the inner PSD __proto__ points to the outer PSD and the inner PSD is instanceof the constructor of the outer PSD.
                return this._reculock && (!this._psd || !(Promise.PSD instanceof this._psd));
            },
            _promise: function (mode, fn, bWriteLock) {
                var self = this;
                // Read lock always
                if (!this._locked()) {
                    var p = new Promise(function (resolve, reject) {
                        if (!self.idbtrans && mode) {
                            if (!idbdb) throw dbOpenError;
                            var idbtrans = self.idbtrans = idbdb.transaction(self.storeNames, self.mode);
                            self.active = true;
                            idbtrans.onerror = function (e) {
                                self.on("error").fire(e && e.target.error);
                                e.preventDefault(); // Prohibit default bubbling to window.error
                                self.abort(); // Make sure transaction is aborted since we preventDefault.
                            }
                            idbtrans.onabort = function (e) {
                                self.active = false;
                                self.on("abort").fire(e);
                            }
                            idbtrans.oncomplete = function (e) {
                                self.active = false;
                                self.on("complete").fire(e);
                            }
                        }
                        if (bWriteLock) self._lock(); // Write lock if write operation is requested
                        fn(resolve, reject, self);
                    });
                    if (bWriteLock) p.finally(function () {
                        self._unlock();
                    });
                    p.onuncatched = function (e) {
                        // Bubble to transaction. Even though IDB does this internally, it would just do it for error events and not for caught exceptions.
                        self.on("error").fire(e);
                        self.abort();
                    }
                    return p;
                } else {
                    // Transaction is write-locked. Wait for mutex.
                    return new Promise(function (resolve, reject) {
                        self._blockedFuncs.push(function () {
                            self._promise(mode, fn, bWriteLock).then(resolve, reject);
                        });
                    });
                }
            },

            //
            // Transaction Public Methods
            //

            complete: function(cb) {
                return this.on("complete", cb);
            },
            error: function (cb) {
                return this.on("error", cb);
            },
            abort: function () {
                if (this.idbtrans && this.active) try { // TODO: if !this.idbtrans, enqueue an abort() operation.
                    this.active = false;
                    this.idbtrans.abort();
                } catch (e) { }
            },
            table: function (name) {
                if (!this._dbschema.hasOwnProperty(name)) { throw new Error("Table does not exist"); return { AN_UNKNOWN_TABLE_NAME_WAS_SPECIFIED: 1 }; }
                return db._tableFactory(this.mode, this._dbschema[name], this._tpf);
            }
        });


        //
        //
        //
        // WhereClause
        //
        //
        //
        function WhereClause(table, index, orCollection) {
            /// <param name="table" type="Table"></param>
            /// <param name="index" type="String" optional="true"></param>
            /// <param name="orCollection" type="Collection" optional="true"></param>
            this._ctx = {
                table: table,
                index: index === ":id" ? null : index,
                collClass: table._collClass,
                or: orCollection
            }
        }

        extend(WhereClause.prototype, function () {

            // WhereClause private methods

            function fail(collection, err) {
                try { throw err; } catch (e) {
                    collection._ctx.error = e;
                }
                return collection;
            }

            function getSortedSet(args) {
                return Array.prototype.slice.call(Array.isArray(args[0]) ? args[0] : args, 0).sort();
            }

            function upperFactory(dir) {
                return dir === "next" ? function (s) { return s.toUpperCase(); } : function (s) { return s.toLowerCase(); }
            }
            function lowerFactory(dir) {
                return dir === "next" ? function (s) { return s.toLowerCase(); } : function (s) { return s.toUpperCase(); }
            }
            function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
                var length = Math.min(key.length, lowerNeedle.length);
                var llp = -1;
                for (var i = 0; i < length; ++i) {
                    var lwrKeyChar = lowerKey[i];
                    if (lwrKeyChar !== lowerNeedle[i]) {
                        if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
                        if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
                        if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                        return null;
                    }
                    if (cmp(key[i], lwrKeyChar) < 0) llp = i;
                }
                if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
                if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
                return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
            }

            function addIgnoreCaseAlgorithm(c, match, needle) {
                /// <param name="needle" type="String"></param>
                var upper, lower, compare, upperNeedle, lowerNeedle, direction;
                function initDirection(dir) {
                    upper = upperFactory(dir);
                    lower = lowerFactory(dir);
                    compare = (dir === "next" ? ascending : descending);
                    upperNeedle = upper(needle);
                    lowerNeedle = lower(needle);
                    direction = dir;
                }
                initDirection("next");
                c._ondirectionchange = function (direction) {
                    // This event onlys occur before filter is called the first time.
                    initDirection(direction);
                };
                c._addAlgorithm(function (cursor, advance, resolve) {
                    /// <param name="cursor" type="IDBCursor"></param>
                    /// <param name="advance" type="Function"></param>
                    /// <param name="resolve" type="Function"></param>
                    var key = cursor.key;
                    if (typeof key !== 'string') return false;
                    var lowerKey = lower(key);
                    if (match(lowerKey, lowerNeedle)) {
                        advance(function () { cursor.continue(); });
                        return true;
                    } else {
                        var nextNeedle = nextCasing(key, lowerKey, upperNeedle, lowerNeedle, compare, direction);
                        if (nextNeedle) {
                            advance(function () { cursor.continue(nextNeedle); });
                        } else {
                            advance(resolve);
                        }
                        return false;
                    }
                });
            }

            //
            // WhereClause public methods
            //
            return {
                between: function (lower, upper, includeLower, includeUpper) {
                    /// <summary>
                    ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
                    /// </summary>
                    /// <param name="lower"></param>
                    /// <param name="upper"></param>
                    /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
                    /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
                    /// <returns type="Collection"></returns>
                    includeLower = includeLower !== false;   // Default to true
                    includeUpper = includeUpper === true;    // Default to false
                    if ((lower > upper) ||
                        (lower == upper && (includeLower || includeUpper) && !(includeLower && includeUpper)))
                        return new this._ctx.collClass(this, IDBKeyRange.only(lower)).limit(0); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
                    return new this._ctx.collClass(this, IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper));
                },
                equals: function (value) {
                    return new this._ctx.collClass(this, IDBKeyRange.only(value));
                },
                above: function (value) {
                    return new this._ctx.collClass(this, IDBKeyRange.lowerBound(value, true));
                },
                aboveOrEqual: function (value) {
                    return new this._ctx.collClass(this, IDBKeyRange.lowerBound(value));
                },
                below: function (value) {
                    return new this._ctx.collClass(this, IDBKeyRange.upperBound(value, true));
                },
                belowOrEqual: function (value) {
                    return new this._ctx.collClass(this, IDBKeyRange.upperBound(value));
                },
                startsWith: function (str) {
                    /// <param name="str" type="String"></param>
                    if (typeof str != 'string') return fail(new Collection(this), new TypeError("String expected"));
                    return this.between(str, str + String.fromCharCode(65535), true, true);
                },
                startsWithIgnoreCase: function (str) {
                    /// <param name="str" type="String"></param>
                    if (typeof str != 'string') return fail(new Collection(this), new TypeError("String expected"));
                    if (str === "") return this.startsWith(str);
                    var c = new this._ctx.collClass(this);
                    addIgnoreCaseAlgorithm(c, function (a, b) { return a.indexOf(b) === 0; }, str);
                    c._ondirectionchange = function () { fail(c, new Error("desc() not supported with WhereClause.startsWithIgnoreCase()")); };
                    return c;
                },
                equalsIgnoreCase: function (str) {
                    /// <param name="str" type="String"></param>
                    if (typeof str != 'string') return fail(new Collection(this), new TypeError("String expected"));
                    var c = new this._ctx.collClass(this);
                    addIgnoreCaseAlgorithm(c, function (a, b) { return a === b; }, str);
                    return c;
                },
                anyOf: function (valueArray) {
                    var set = getSortedSet(arguments);
                    var c = new this._ctx.collClass(this);
                    var sorter = ascending;
                    c._ondirectionchange = function (direction) {
                        sorter = (direction === "next" ? ascending : descending);
                        set.sort(sorter);
                    };
                    var i = 0;
                    c._addAlgorithm(function (cursor, advance, resolve) {
                        var key = cursor.key;
                        while (sorter(key, set[i]) > 0) {
                            // The cursor has passed beyond this key. Check next.
                            ++i;
                            if (i === set.length) {
                                // There is no next. Stop searching.
                                advance(resolve);
                                return false;
                            }
                        }
                        if (key === set[i]) {
                            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                            advance(function () { cursor.continue(); });
                            return true;
                        } else {
                            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                            advance(function () { cursor.continue(set[i]); });
                            return false;
                        }
                    });
                    return c;
                }
            };
        });




        //
        //
        //
        // Collection Class
        //
        //
        //
        function Collection(whereClause, keyRange) {
            /// <summary>
            /// 
            /// </summary>
            /// <param name="whereClause" type="WhereClause">Where clause instance</param>
            /// <param name="keyRange" type="IDBKeyRange" optional="true"></param>
            var whereCtx = whereClause._ctx;
            this._ctx = {
                table: whereCtx.table,
                index: whereCtx.index,
                range: keyRange,
                op: "openCursor",
                dir: "next",
                unique: "",
                algorithm: null,
                filter: null,
                offset: 0,
                limit: Infinity,
                error: null, // If set, any promise must be rejected with this error
                or: whereCtx.or
            }
        }

        extend(Collection.prototype, function () {

            //
            // Collection Private Functions
            //

            function addFilter(ctx, fn) {
                ctx.filter = combine(ctx.filter, fn);
            }

            function getIndexOrStore(ctx, store) {
                var index = ctx.index;
                return (!index || (store.keyPath && index === store.keyPath)) ? store : store.index(index);
            }

            function openCursor(ctx, store) {
                return getIndexOrStore(ctx, store)[ctx.op](ctx.range || null, ctx.dir + ctx.unique);
            }

            function iter(ctx, fn, resolve, reject, idbstore) {
                if (!ctx.or) {
                    iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, ctx.filter), fn, resolve, reject, ctx.table.hook.reading.fire);
                } else {
                    (function () {
                        var filter = ctx.filter;
                        var set = {};
                        var primKey = ctx.table.schema.primKey.keyPath;
                        var resolved = 0;

                        function resolveboth() {
                            if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
                        }

                        function union(item, cursor, advance) {
                            if (!filter || filter(cursor, advance, resolveboth, reject)) {
                                var key = JSON.stringify(cursor.primaryKey);
                                if (!set.hasOwnProperty(key)) {
                                    set[key] = true;
                                    fn(item, cursor, advance);
                                }
                            }
                        }

                        ctx.or._iterate(union, resolveboth, reject, idbstore);
                        iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, ctx.table.hook.reading.fire);
                    })();
                }
            }
            function getInstanceTemplate(ctx) {
                return ctx.table.schema.instanceTemplate;
            }


            return {

                //
                // Collection Protected Functions
                //

                _read: function (fn, cb) {
                    var ctx = this._ctx;
                    if (ctx.error)
                        return ctx.table._trans(null, function rejector(resolve, reject) { reject(ctx.error); });
                    else
                        return ctx.table._idbstore(READONLY, fn).then(cb);
                },
                _write: function (fn) {
                    var ctx = this._ctx;
                    if (ctx.error)
                        return ctx.table._trans(null, function rejector(resolve, reject) { reject(ctx.error); });
                    else
                        return ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
                },
                _addAlgorithm: function (fn) {
                    var ctx = this._ctx;
                    ctx.algorithm = combine(ctx.algorithm, fn);
                },

                _iterate: function (fn, resolve, reject, idbstore) {
                    return iter(this._ctx, fn, resolve, reject, idbstore);
                },

                //
                // Collection Public methods
                //

                each: function (fn) {
                    var ctx = this._ctx;

                    fakeAutoComplete(function () { fn(getInstanceTemplate(ctx)); });

                    return this._read(function (resolve, reject, idbstore) {
                        iter(ctx, fn, resolve, reject, idbstore);
                    });
                },

                count: function (cb) {
                    fakeAutoComplete(function () { cb(0); });
                    var self = this,
                        ctx = this._ctx;

                    if (ctx.filter || ctx.algorithm || ctx.or) {
                        // When filters are applied or 'ored' collections are used, we must count manually
                        var count = 0;
                        return this._read(function (resolve, reject, idbstore) {
                            iter(ctx, function () { ++count; return false; }, function () { resolve(count); }, reject, idbstore);
                        }, cb);
                    } else {
                        // Otherwise, we can use the count() method if the index.
                        return this._read(function (resolve, reject, idbstore) {
                            var idx = getIndexOrStore(ctx, idbstore);
                            var req = (ctx.range ? idx.count(ctx.range) : idx.count());
                            req.onerror = eventRejectHandler(reject, ["calling", "count()", "on", self.name]);
                            req.onsuccess = function (e) {
                                resolve(Math.min(e.target.result, Math.max(0, ctx.limit - ctx.offset)));
                            }
                        }, cb);
                    }
                },

                sortBy: function (keyPath, cb) {
                    /// <param name="keyPath" type="String"></param>
                    var ctx = this._ctx;
                    fakeAutoComplete(function () { cb([getInstanceTemplate(ctx)]); });
                    var parts = keyPath.split('.').reverse(),
                        lastPart = parts[0],
                        lastIndex = parts.length - 1;
                    function getval(obj, i) {
                        if (i) return getval(obj[parts[i]], i - 1);
                        return obj[lastPart];
                    }
                    var order = this._ctx.dir === "next" ? 1 : -1;

                    function sorter(a, b) {
                        var aVal = getval(a, lastIndex),
                            bVal = getval(b, lastIndex);
                        return aVal < bVal ? -order : aVal > bVal ? order : 0;
                    }
                    return this.toArray(function (a) {
                        return a.sort(sorter);
                    }).then(cb);
                },

                toArray: function (cb) {
                    var ctx = this._ctx;

                    fakeAutoComplete(function () { cb([getInstanceTemplate(ctx)]); });

                    return this._read(function (resolve, reject, idbstore) {
                        var a = [];
                        iter(ctx, function (item) { a.push(item); }, function arrayComplete() {
                            resolve(a);
                        }, reject, idbstore);
                    }, cb);
                },

                offset: function (offset) {
                    var ctx = this._ctx;
                    if (offset <= 0) return this;
                    ctx.offset += offset; // For count()
                    if (!ctx.or && !ctx.algorithm && !ctx.filter) {
                        addFilter(ctx, function offsetFilter(cursor, advance, resolve) {
                            if (offset === 0) return true;
                            if (offset === 1) { --offset; return false; }
                            advance(function () { cursor.advance(offset); offset = 0; });
                            return false;
                        });
                    } else {
                        addFilter(ctx, function offsetFilter(cursor, advance, resolve) {
                            return (--offset < 0);
                        });
                    }
                    return this;
                },

                limit: function (numRows) {
                    this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
                    addFilter(this._ctx, function (cursor, advance, resolve) {
                        if (--numRows <= 0) advance(resolve); // Stop after this item has been included
                        return numRows >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
                    });
                    return this;
                },

                first: function (cb) {
                    var self = this;
                    fakeAutoComplete(function () { cb(getInstanceTemplate(self._ctx)); });
                    return this.limit(1).toArray(function (a) { return a[0] }).then(cb);
                },

                last: function (cb) {
                    return this.desc().first(cb);
                },

                and: function (filterFunction) {
                    /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
                    var self = this;
                    fakeAutoComplete(function () { filterFunction(getInstanceTemplate(self._ctx)); });
                    addFilter(this._ctx, function (cursor) {
                        return filterFunction(cursor.value);
                    });
                    return this;
                },

                or: function (indexName) {
                    return new WhereClause(this._ctx.table, indexName, this);
                },

                desc: function () {
                    this._ctx.dir = (this._ctx.dir == "prev" ? "next" : "prev");
                    if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
                    return this;
                },

                eachKey: function (cb) {
                    var self = this;
                    fakeAutoComplete(function () { cb(getInstanceTemplate(self._ctx)[self._ctx.index]); });
                    this._ctx.op = "openKeyCursor";
                    return this.each(function (val, cursor) { cb(cursor.key, cursor); });
                },

                eachUniqueKey: function (cb) {
                    this._ctx.unique = "unique";
                    return this.eachKey(cb);
                },

                keys: function (cb) {
                    fakeAutoComplete(function () { cb([getInstanceTemplate(ctx)[self._ctx.index]]); });
                    var self = this,
                        ctx = this._ctx;
                    this._ctx.op = "openKeyCursor";
                    var a = [];
                    return this.each(function (item, cursor) {
                        a.push(cursor.key);
                    }).then(function () {
                        return a;
                    }).then(cb);
                },

                uniqueKeys: function (cb) {
                    this._ctx.unique = "unique";
                    return this.keys(cb);
                },

                distinct: function () {
                    var set = {};
                    addFilter(this._ctx, function (cursor) {
                        var strKey = JSON.stringify(cursor.primaryKey);
                        var found = set.hasOwnProperty(strKey);
                        set[strKey] = true;
                        return !found;
                    });
                    return this;
                }
            };
        });

        //
        //
        // WriteableCollection Class
        //
        //
        function WriteableCollection() {
            Collection.apply(this, arguments);
        }

        derive(WriteableCollection).from(Collection).extend({

            //
            // WriteableCollection Public Methods
            //

            modify: function (changes) {
                var self = this,
                    ctx = this._ctx,
                    hook = ctx.table.hook,
                    creatingHook = hook.creating.fire,
                    updatingHook = hook.updating.fire,
                    deletingHook = hook.deleting.fire;

                return this._write(function (resolve, reject, idbstore, trans) {
                    var modifyer;
                    if (typeof changes === 'function') {
                        if (creatingHook === nop && deletingHook === nop) {
                            modifyer = changes;
                        } else {
                            modifyer = function (item) {
                                deletingHook(this.primKey, item, trans);
                                changes.call(this, item);
                                if (this.hasOwnProperty("value")) {
                                    // Not deleted, just replaced. Fire when('creating') event.
                                    creatingHook(this.primKey, this.value, trans);
                                }
                            }
                        }
                    } else if (updatingHook === nop) {
                        var keyPaths = Object.keys(changes);
                        var numKeys = keyPaths.length;
                        modifyer = function (item) {
                            for (var i = 0; i < numKeys; ++i) {
                                var keyPath = keyPaths[i];
                                setByKeyPath(item, keyPath, changes[keyPath]);
                            }
                        }
                    } else {
                        var origChanges = changes;
                        changes = clone(origChanges);
                        modifyer = function (item) {
                            var changed = updatingHook(changes, this.primKey, item, trans);
                            Object.keys(changes).forEach(function (keyPath) {
                                setByKeyPath(item, keyPath, changes[keyPath]);
                            });
                            if (changed) changes = clone(origChanges);
                        }
                    }

                    var count = 0;
                    var successCount = 0;
                    var iterationComplete = false;
                    var failures = [];

                    function modifyItem(item, cursor, advance) {
                        var p = { primKey: cursor.primaryKey, value: item };
                        modifyer.call(p, item);
                        var bDelete = !p.hasOwnProperty("value");
                        var req = (bDelete ? cursor.delete() : cursor.update(p.value));
                        ++count;
                        req.onerror = eventRejectHandler(function (e) {
                            failures.push(e);
                            return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
                        }, function () { return bDelete ? ["deleting", item, "from", ctx.table.name] : ["modifying", item, "on", ctx.table.name]; });
                        req.onsuccess = function () {
                            ++successCount;
                            checkFinished();
                        }
                    }

                    function doReject(e) {
                        if (e) failures.push(e);
                        return reject(new MultiModifyError("Error modifying one or more objects", failures, successCount));
                    }

                    function checkFinished() {
                        if (iterationComplete && successCount + failures.length === count) {
                            if (failures.length > 0)
                                doReject();
                            else
                                resolve(successCount);
                        }
                    }
                    self._iterate(modifyItem, function () {
                        iterationComplete = true;
                        checkFinished();
                    }, doReject, idbstore);
                });
            },

            'delete': function () {
                return this.modify(function () { delete this.value; });
            }
        });


        //
        //
        //
        // ------------------------- Help functions ---------------------------
        //
        //
        //

        function lowerVersionFirst(a, b) {
            return a._cfg.version - b._cfg.version;
        }

        function getCurrentDBSchema() {
            return versions.sort(lowerVersionFirst).reduce(function (prev, curr) {
                return (curr._cfg.dbschema ? curr : prev);
            })._cfg.dbschema;
        }

        function setApiOnPlace(obj, transactionPromiseFactory, tableNames, mode, dbschema, enableProhibitedDB) {
            tableNames.forEach(function (tableName) {
                if (!obj[tableName]) {
                    var tableInstance = db._tableFactory(mode, dbschema[tableName], transactionPromiseFactory);
                    if (enableProhibitedDB) {
                        Object.defineProperty(obj, tableName, {
                            configurable: true,
                            enumerable: true,
                            get: function () {
                                if (Promise.PSD && Promise.PSD.prohibitDB) {
                                    throw new Error("Dont call db." + tableName + " directly. Use tables from db.transaction() instead.");
                                    return { ALL_TABLES_PROHIBITED_IN_TRANSCATION_SCOPE: 1 }; // For code completion in IDE.
                                }
                                return tableInstance;
                            }
                        });
                    } else {
                        obj[tableName] = tableInstance;
                    }
                }
            });
        }

        function removeTablesApi(objs) {
            objs.forEach(function (obj) {
                for (var key in obj) {
                    if (obj[key] instanceof Table) delete obj[key];
                }
            });
        }

        function fakeAutoComplete(fn) {
            var to = setTimeout(fn, 1000);
            clearTimeout(to);
        }

        function iterate(req, filter, fn, resolve, reject, readingHook) {
            readingHook = readingHook || mirror;
            if (!req.onerror) req.onerror = eventRejectHandler(reject);
            if (filter) {
                req.onsuccess = trycatch(function filter_record(e) {
                    var cursor = req.result;
                    if (cursor) {
                        var c = function () { cursor.continue(); };
                        if (filter(cursor, function (advancer) { c = advancer }, resolve, reject))
                            fn(readingHook(cursor.value), cursor, function (advancer) { c = advancer });
                        c();
                    } else {
                        resolve();
                    }
                }, reject);
            } else {
                req.onsuccess = trycatch(function filter_record(e) {
                    var cursor = req.result;
                    if (cursor) {
                        var c = function () { cursor.continue(); };
                        fn(readingHook(cursor.value), cursor, function (advancer) { c = advancer });
                        c();
                    } else {
                        resolve();
                    }
                }, reject);
            }
        }

        function parseIndexSyntax(indexes) {
            /// <param name="indexes" type="String"></param>
            /// <returns type="Array" elementType="IndexSpec"></returns>
            var rv = [];
            indexes.split(',').forEach(function (index) {
                if (!index) return;
                var name = index.replace("&", "").replace("++", "").replace("*", "");
                var keyPath = (name.indexOf('[') !== 0 ? name : index.substring(1, index.indexOf(']')).split('+'));

                rv.push(new IndexSpec(
                    name,
                    keyPath || null,
                    index.indexOf('&') != -1,
                    index.indexOf('*') != -1,
                    index.indexOf("++") != -1,
                    Array.isArray(keyPath),
                    keyPath.indexOf('.') != -1
                ));
            });
            return rv;
        }

        function ascending(a, b) {
            return a < b ? -1 : a > b ? 1 : 0;
        }

        function descending(a, b) {
            return a < b ? 1 : a > b ? -1 : 0;
        }

        function combine(filter1, filter2) {
            return filter1 ? filter2 ? function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments) } : filter1 : filter2;
        }

        function clone(obj) {
            var rv = {};
            for (var m in obj) {
                if (obj.hasOwnProperty(m)) rv[m] = obj[m];
            }
            return rv;
        }

        function eventToError(fn) {
            return function (e) {
                return fn(e && e.target && e.target.error);
            }
        }

        function eventRejectHandler(reject, sentance) {
            return function (event) {
                var origErrObj = (event && event.target.error) || { toString: "" },
                    errObj = origErrObj;                
                if (sentance) {
                    errObj = Object.create(origErrObj);
                    errObj.toString = function () {
                        return origErrObj.toString() + " occurred when " + sentance.map(function (word) {
                            switch (typeof (word)) {
                                case 'function': return word();
                                case 'string': return word;
                                default: return JSON.stringify(word);
                            }
                        }).join(" ");
                    };
                }
                var catched = reject(errObj);
                if (catched) {
                    // Rejection was catched. Stop error from propagating to IDBTransaction.
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }
            };
        }

        function hasIEDeleteObjectStoreBug() {
            // Assume bug is present in IE10 and IE11 but dont expect it in next version of IE (IE12)
            return navigator.userAgent.indexOf("Trident / 7.0; rv: 11.0") >= 0 || navigator.userAgent.indexOf("MSIE") >= 0;
        }

        extend(this, {
            Collection: Collection,
            Table: Table,
            Transaction: Transaction,
            Version: Version,
            WhereClause: WhereClause,
            WriteableCollection: WriteableCollection,
            WriteableTable: WriteableTable,
        });

        init();

        Dexie.addons.forEach(function (fn) {
            fn (db);
        });
    }

    //
    // Promise Class
    //
    // A variant of promise-light (https://github.com/taylorhakes/promise-light) by https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
    //
    // Modified by David Fahlander to be indexedDB compliant (See discussion: https://github.com/promises-aplus/promises-spec/issues/45) .
    // This implementation will not use setTimeout or setImmediate when it's not needed. The behavior is 100% Promise/A+ compliant since
    // the caller of new Promise() can be certain that the promise wont be triggered the lines after constructing the promise. We fix this by using the member variable constructing to check
    // whether the object is being constructed when reject or resolve is called. If so, the use setTimeout/setImmediate to fulfill the promise, otherwise, we know that it's not needed.
    //
    // This topic was also discussed in the following thread: https://github.com/promises-aplus/promises-spec/issues/45 and this implementation solves that issue.
    //
    // Another feature with this Promise implementation is that reject will return false in case no one catched the reject call. This is used
    // to stopPropagation() on the IDBRequest error event in case it was catched but not otherwise.
    //
    // Also, the event new Promise().onuncatched is called in case no one catches a reject call. This is used for us to manually bubble any request
    // errors to the transaction. We must not rely on IndexedDB implementation to do this, because it only does so when the source of the rejection
    // is an error event on a request, not in case an ordinary exception is thrown.
    var Promise = (function () {

        // The use of asap in handle() is remarked because we must NOT use setTimeout(fn,0) because it causes premature commit of indexedDB transactions - which is according to indexedDB specification.
        var asap = typeof (setImmediate) === 'undefined' ? function (fn, arg1, arg2, argN) {
            var args = arguments;
            setTimeout(function () { fn.apply(this, [].slice.call(args, 1)) }, 0);// If not FF13 and earlier failed, we could use this call here instead: setTimeout.call(this, [fn, 0].concat(arguments));
        } : function (fn, arg1, arg2, argN) {
            setImmediate.apply(this, arguments); // IE10+ and node.
        };

        function Promise(fn) {
            if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
            if (typeof fn !== 'function') throw new TypeError('not a function');
            this._state = null; // null (=pending), false (=rejected) or true (=resolved)
            this._value = null; // error or result
            this._deferreds = [];
            this._catched = false; // for onuncatched
            var self = this;
            var constructing = true;
            var outerPSD = Promise.psd();
            this._PSD = Promise.PSD;

            try {
                doResolve(this, fn, function (data) {
                    if (constructing)
                        asap(resolve, self, data);
                    else
                        resolve(self, data);
                }, function (reason) {
                    if (constructing) {
                        asap(reject, self, reason);
                        return false;
                    } else {
                        return reject(self, reason);
                    }
                });
            } finally {
                constructing = false;
                Promise.PSD = outerPSD;
            }
        }

        function handle(deferred) {
            var self = this;
            if (this._state === null) {
                this._deferreds.push(deferred);
                return;
            }

            var cb = self._state ? deferred.onFulfilled : deferred.onRejected;
            if (cb === null) {
                // This Deferred doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
                return (self._state ? deferred.resolve : deferred.reject)(self._value);
            }
            var ret;
            try {
                ret = cb(self._value);
                if (!self._state && (!ret || typeof ret.then !== 'function')) setCatched(self);
            } catch (e) {
                var catched = deferred.reject(e);
                if (!catched && self.onuncatched) {
                    try { self.onuncatched(e); } catch (e) { }
                }
                return;
            }
            deferred.resolve(ret);
        }

        function setCatched(promise) {
            promise._catched = true;
            if (promise._parent) setCatched(promise._parent);
        }

        function resolve(promise, newValue) {
            var outerPSD = Promise.PSD;
            Promise.PSD = promise._PSD;
            try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === promise) throw new TypeError('A promise cannot be resolved with itself.');
                if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                    if (typeof newValue.then === 'function') {
                        doResolve(promise, function (resolve, reject) {
                            newValue.then(resolve, reject);
                        }, function (data) {
                            resolve(promise, data);
                        }, function (reason) {
                            reject(promise, reason);
                        });
                        return;
                    }
                }
                promise._state = true;
                promise._value = newValue;
                finale.call(promise);
            } catch (e) { reject(e) } finally {
                Promise.PSD = outerPSD;
            }
        }

        function reject(promise, newValue) {
            var outerPSD = Promise.PSD;
            Promise.PSD = promise._PSD;
            promise._state = false;
            promise._value = newValue;

            finale.call(promise);
            if (!promise._catched && promise.onuncatched) {
                try { promise.onuncatched(promise._value); } catch (e) { }
            }
            Promise.PSD = outerPSD;
            return promise._catched;
        }

        function finale() {
            for (var i = 0, len = this._deferreds.length; i < len; i++) {
                handle.call(this, this._deferreds[i]);
            }
            this._deferreds = null; // ok because _deferreds can impossibly be accessed anymore (reject or resolve will never be called again, and handle() will not touch it since _state !== null.
        }

        function Deferred(onFulfilled, onRejected, resolve, reject) {
            this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
            this.onRejected = typeof onRejected === 'function' ? onRejected : null;
            this.resolve = resolve;
            this.reject = reject;
        }

        /**
         * Take a potentially misbehaving resolver function and make sure
         * onFulfilled and onRejected are only called once.
         *
         * Makes no guarantees about asynchrony.
         */
        function doResolve(promise, fn, onFulfilled, onRejected) {
            var done = false;
            try {
                fn(function Promise_resolve(value) {
                    if (done) return;
                    done = true;
                    onFulfilled(value);
                }, function Promise_reject(reason) {
                    if (done) return promise._catched;
                    done = true;
                    return onRejected(reason);
                })
            } catch (ex) {
                if (done) return;
                return onRejected(ex);
            }
        }

        Promise.all = function () {
            var args = Array.prototype.slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments);

            return new Promise(function (resolve, reject) {
                if (args.length === 0) return resolve([]);
                var remaining = args.length;
                function res(i, val) {
                    try {
                        if (val && (typeof val === 'object' || typeof val === 'function')) {
                            var then = val.then;
                            if (typeof then === 'function') {
                                then.call(val, function (val) { res(i, val) }, reject);
                                return;
                            }
                        }
                        args[i] = val;
                        if (--remaining === 0) {
                            resolve(args);
                        }
                    } catch (ex) {
                        reject(ex);
                    }
                }
                for (var i = 0; i < args.length; i++) {
                    res(i, args[i]);
                }
            });
        };

        /* Prototype Methods */
        Promise.prototype.then = function (onFulfilled, onRejected) {
            var self = this;
            var p = new Promise(function (resolve, reject) {
                handle.call(self, new Deferred(onFulfilled, onRejected, resolve, reject));
            });
            p._PSD = this._PSD;
            p.onuncatched = this.onuncatched;
            p._parent = this; // Used for recursively calling onuncatched event on self and all parents.
            return p;
        };

        Promise.prototype['catch'] = function (onRejected) {
            if (arguments.length === 1) return this.then(null, onRejected);
            // First argument is the Error type to catch
            var type = arguments[0], callback = arguments[1];
            return this.then(null, function (e) {
                if (e instanceof type) return callback(e); else return Promise.reject(e);
            });
        };

        Promise.prototype['finally'] = function (onFinally) {
            this.then(function (value) {
                onFinally();
            }, function (err) {
                return Promise.reject(err);
            });
            return this;
        };

        Promise.prototype.onuncatched = null; // Optional event triggered if promise is rejected but no one listened.

        Promise.resolve = function (value) {
            var p = new Promise(function () { });
            p._state = true;
            p._value = value;
        };

        Promise.reject = function (value) {
            var p = new Promise(function () { });
            p._state = false;
            p._value = value;
            return p;
        };

        Promise.race = function (values) {
            return new Promise(function (resolve, reject) {
                values.map(function (value) {
                    value.then(resolve, reject);
                })
            });
        };

        Promise.PSD = null; // Promise Specific Data - a TLS Pattern (Thread Local Storage) for Promises.

        Promise.psd = function () {
            // Create new PSD scope (Promise Specific Data)
            var outerScope = Promise.PSD;
            function F() { }
            if (outerScope) F.prototype = outerScope;
            Promise.PSD = new F();
            Promise.PSD.constructor = F;
            return outerScope;
        }

        return Promise;
    })();


    //
    //
    // ------ Exportable Help Functions -------
    //
    //

    function nop() {}
    function mirror(val) { return val; }

    function pureFunctionChain(f1, f2) {
        // Enables chained events that takes ONE argument and returns it to the next function in chain.
        // This pattern is used in the when("reading") event.
        if (f1 === mirror) return f2;
        return function (val) {
            return f2(f1(val));
        }
    }

    function modifyableFunctionChain(f1, f2) {
        // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
        // This pattern is used in the when("creating") and when("updating") events.
        if (f1 === nop) return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res !== undefined) arguments[0] = res;
            var res2 = f2.apply(this, arguments);
            return res2 !== undefined ? res2 : res;
        }
    }

    function stoppableEventChain(f1, f2) {
        // Enables chained events that may return false to stop the event chain.
        if (f1 === nop) return f2;
        return function () {
            if (f1.apply(this, arguments) === false) return false;
            return f2.apply(this, arguments);
        }
    }

    function nonStoppableEventChain(f1, f2) {
        if (f1 === nop) return f2;
        return function () {
            f2.apply(this, arguments);
            f1.apply(this, arguments);
        }
    }

    function events(ctx, eventNames) {
        var args = arguments;
        var evs = {};
        function add(eventName, chainFunction, defaultFunction) {
            if (Array.isArray(eventName)) return addEventGroup(eventName);
            if (typeof eventName === 'object') return addConfiguredEvents(eventName);
            if (!chainFunction) chainFunction = stoppableEventChain;
            if (!defaultFunction) defaultFunction = nop;
            
            var context = {
                subscribers: [],
                fire: defaultFunction,
                subscribe: function (cb) {
                    context.subscribers.push(cb);
                    context.fire = chainFunction(context.fire, cb);
                },
                unsubscribe: function (cb) {
                    context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
                    context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
                }
            };
            evs[eventName] = context;
            return context;
        }

        function addConfiguredEvents(cfg) {
            // events(this, {reading: [functionChain, nop]});
            Object.keys(cfg).forEach(function(eventName) {
                add(eventName, cfg[eventName][0], cfg[eventName][1]);
            });
        }

        function addEventGroup(eventGroup) {
            // promise-based event group (i.e. we promise to call one and only one of the events in the pair, and to only call it once.
            var done = false;
            eventGroup.forEach(function (name) {
                add(name).subscribe(checkDone);
            });
            function checkDone() {
                if (done) return false;
                done = true;
            }
        }

        for (var i = 1, l = args.length; i < l; ++i) {
            add(args[i]);
        }

        var rv = function (eventName, subscriber) {
            if (subscriber) {
                // Subscribe
                evs[eventName].subscribe(subscriber);
                return ctx;
            } else if (typeof (eventName) === 'string') {
                // Return interface allowing to fire or unsubscribe from event
                return evs[eventName];
            }
        }
        extend(rv, evs);
        rv.addEventType = add;
        return rv;
    }

    function assert(b) {
        if (!b) throw new Error("Assertion failed");
    }

    function asap(fn) {
        if (window.setImmediate) setImmediate(fn); else setTimeout(fn, 0);
    }

    function trycatch(fn, reject) {
        return function () {
            try {
                fn.apply(this, arguments);
            } catch (e) {
                reject(e);
            };
        };
    }

    function getByKeyPath(obj, keyPath) {
        // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
        if (obj.hasOwnProperty(keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
        if (!keyPath) return obj;
        if (typeof keyPath !== 'string') {
        //if (Array.isArray(keyPath)) {
            var rv = [];
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                var val = getByKeyPath(obj, keyPath[i]);
                if (val === undefined) return;
                rv.push(val);
            }
            return val;
        }
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var innerObj = obj[keyPath.substr(0, period)];
            return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        //return obj.hasOwnProperty(keyPath) ? obj[keyPath] : undefined;
        return undefined;
    }

    function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === undefined) return;
        var bDelete = arguments[3];
        if (Array.isArray(keyPath)) {
            assert(Array.isArray(value));
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                setByKeyPath(obj, keyPath[i], value[i]);
            }
        } else {
            var period = keyPath.indexOf('.');
            if (period !== -1) {
                var currentKeyPath = keyPath.substr(0, period);
                var remainingKeyPath = keyPath.substr(period + 1);
                if (remainingKeyPath === "")
                    if (bDelete) delete obj[currentKeyPath]; else obj[currentKeyPath] = value;
                else {
                    var innerObj = obj[currentKeyPath];
                    if (!innerObj) innerObj = (obj[currentKeyPath] = {});
                    setByKeyPath(innerObj, remainingKeyPath, value, bDelete);
                }
            } else {
                if (bDelete) delete obj[keyPath]; else obj[keyPath] = value;
            }
        }
    }

    function delByKeyPath(obj, keyPath) {
        setByKeyPath(obj, keyPath, null, true);
    }

    //
    // IndexSpec struct
    //
    function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
        /// <param name="name" type="String"></param>
        /// <param name="keyPath" type="String"></param>
        /// <param name="unique" type="Boolean"></param>
        /// <param name="multi" type="Boolean"></param>
        /// <param name="auto" type="Boolean"></param>
        /// <param name="compound" type="Boolean"></param>
        /// <param name="dotted" type="Boolean"></param>
        this.name = name;
        this.keyPath = keyPath;
        this.unique = unique;
        this.multi = multi;
        this.auto = auto;
        this.compound = compound;
        this.dotted = dotted;
        this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPath;
    }

    //
    // TableSchema struct
    //
    function TableSchema(name, primKey, indexes, instanceTemplate) {
        /// <param name="name" type="String"></param>
        /// <param name="primKey" type="IndexSpec"></param>
        /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
        /// <param name="instanceTemplate" type="Object"></param>
        this.name = name;
        this.primKey = primKey || new IndexSpec();
        this.indexes = indexes || [new IndexSpec()];
        this.instanceTemplate = instanceTemplate;
        this.mappedClass = null;
    }

    //
    // MultiModifyError Class (extends Error)
    //
    function MultiModifyError(msg, failures, successCount) {
        Error.call(this, msg);
        this.name = "MultiModifyError";
        this.failures = failures;
        this.successCount = successCount;
    }
    derive(MultiModifyError).from(Error);


    //
    // Static delete() method.
    //
    Dexie.delete = function (databaseName) {
        var db = new Dexie(databaseName),
            promise = db.delete();
        promise.onblocked = function (fn) {
            db.on("blocked", fn);
            return this;
        };
        return promise;
    }
    
    // Export our Promise implementation since it can be handy as a standalone Promise implementation
    Dexie.Promise = Promise;
    // Export our derive/extend/override methodology
    Dexie.derive = derive;
    Dexie.extend = extend;
    Dexie.override = override;
    // Export our events() function - can be handy as a toolkit
    Dexie.events = events;
    Dexie.getByKeyPath = getByKeyPath;
    Dexie.setByKeyPath = setByKeyPath;
    Dexie.delByKeyPath = delByKeyPath;
    Dexie.addons = [];
	// Export our static classes
    Dexie.MultiModifyError = MultiModifyError;
    Dexie.IndexSpec = IndexSpec;
    Dexie.TableSchema = TableSchema;
    //
    // Dependencies
    //
    // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
    //
    // In node.js, however, these properties must be set "manually" before instansiating a new Dexie(). For node.js, you need to require indexeddb-js or similar and then set these deps.
    //
    Dexie.dependencies = {
        // Required:
        indexedDB: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
        IDBKeyRange: window.IDBKeyRange || window.webkitIDBKeyRange,
        IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction,
        // Optional:
        Error: window.Error || String,
        SyntaxError: window.SyntaxError || String,
        TypeError: window.TypeError || String,
        RangeError: window.RangeError || String,
        DOMError: window.DOMError || String
    }

    // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
    Dexie.version = 0.97;





    // Publish the Dexie to browser or NodeJS environment.
    publish("Dexie", Dexie);

}).apply(this, typeof module === 'undefined' || (typeof window !== 'undefined' && this == window)
    ? [window, function (name, value) { window[name] = value; }, true]    // Adapt to browser environment
    : [global, function (name, value) { module.exports = value; }, false]); // Adapt to Node.js environment

