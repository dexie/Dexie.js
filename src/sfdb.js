/// <reference path="/js/common/jquery.js" />
function StraightForwardDB(dbName) {
    var idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    var dbTableSchema = null;
    var dbVersion = 0;
    /// <var type="Array" elementType="Version" />
    var versions = [];
    var upgraders = [];
    var tables = derive(this);
    var api = derive(tables);
    var isReady = false;
    var readyEvent = event();
    ///<var type="IDBDatabase" />
    var db = null;
    var R = "readonly", RW = "readwrite";
    var iewa; // IE WorkAound needed in IE10 & IE11 for http://connect.microsoft.com/IE/feedback/details/783672/indexeddb-getting-an-aborterror-exception-when-trying-to-delete-objectstore-inside-onupgradeneeded


    //
    //
    //
    // ------------------------- Versioning Framework---------------------------
    //
    //
    //

    api.version = function (versionNumber) {
        /// <param name="versionNumber" type="Number"></param>
        /// <returns type="Version"></returns>
        var versionInstance = new Version(versionNumber);
        versions.push(versionInstance);
        return versionInstance;
    }

    function Version(versionNumber) {
        var thiz = this;
        this._cfg = {
            version: versionNumber,
            tableSchema: {},
            schemaUpgrade: null,
            contentUpgrade: null,
        }
        this.schema = function (schema) {
            /// <summary>
            ///   Defines the schema for a particular version
            /// </summary>
            /// <param name="schema" type="Object">
            /// Example: <br/>
            ///   {users: "id++,first,last,!username,*email", <br/>
            ///   passwords: "id++,!username"}<br/>
            /// <br/>
            /// Syntax: {Table: "[primaryKey][++],[!][*]index1,[!][*]index2,..."}<br/><br/>
            /// Special characters:<br/>
            ///  "!"  means unique key, <br/>
            ///  "*"  means value is multiEntry, <br/>
            ///  "++" means auto-increment and only applicable for primary key <br/>
            /// </param>
            var tableSchema = this._cfg.tableSchema;
            Object.keys(schema).forEach(function (tableName) {
                var indexes = parseIndexSyntax(schema[tableName]);
                var primKey = indexes.shift();
                if (primKey.multi) throw "SFDB: Primary key cannot be multi-valued";
                indexes.forEach(function (idx) {
                    if (idx.auto) throw "SFDB: Only primary key can be marked as autoIncrement (++)";
                    if (!idx.keyPath) throw "SFDB: index must have a name and cannot be an empty string";
                });
                tableSchema[tableName] = {
                    primKey: primKey,
                    indexes: indexes
                };
            });
            return this;
        }
        this.upgrade = function (upgradeFunction) {
            /// <param name="upgradeFunction" optional="true">Function that performs upgrading actions.</param>
            fake(function () {
                upgradeFunction(new WriteableTransaction({}, {}, Object.keys(thiz._cfg.tableSchema))); // BUGBUG: No code completion for prev version's tables wont appear.
            });
            this._cfg.contentUpgrade = upgradeFunction;
            return this;
        }
    }

    function runUpgraders(oldVersion, trans) {
        if (oldVersion == 0) {
            dbTableSchema = versions[versions.length - 1]._cfg.tableSchema;
            // Create tables:
            Object.keys(dbTableSchema).forEach(function (tableName) {
                createTable(trans, tableName, dbTableSchema[tableName].primKey, dbTableSchema[tableName].indexes);
            });
            // Populate data
            var t = new WriteableTransaction(trans, new MultirequestTransactionFactory(trans), trans.db.objectStoreNames);
            api.populate.fire(t);
        } else {
            // Upgrade version to version, step-by-step from oldest to newest version.
            // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
            var queue = [];
            dbTableSchema = null;
            var versToRun = versions.filter(function (v) { return v._cfg.version > oldVersion; });
            versToRun.forEach(function (version) {
                /// <param name="version" type="Version"></param>
                var oldSchema = dbTableSchema;
                var newSchema = version._cfg.tableSchema;
                dbTableSchema = newSchema;
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
                                    iterate(trans.objectStore(change.name).openCursor(), null, function (item) { iewa[change.name].push(item) }, null, function () {
                                        if (--iewa.__num == 0) {
                                            trans.abort(); // Abort transaction and re-open database re-run the upgraders now that all tables are read to mem.
                                            api.open();
                                        }
                                    }, -1);
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
                            var tf = new MultirequestTransactionFactory(trans);
                            var t = new WriteableTransaction(trans, tf, trans.db.objectStoreNames);
                            tf.onbeforecomplete = cb;
                            newSchema._cfg.contentUpgrade(t);
                            if (tf.uncompleteRequests == 0) cb();
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

            if (iewa && iewa.__num > 0) return; // MSIE 10 & 11 workaround. Halt this run - we are in progress of copying tables into memory. When that is done, we will abort transaction and re-open database again.

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
        }, null, cb, -1);
    }

    function createTable (trans, tableName, primKey, indexes) {
        /// <param name="trans" type="IDBTransaction"></param>
        var store = trans.db.createObjectStore(tableName, { keyPath: primKey.keyPath, autoIncrement: primKey.auto });
        indexes.forEach(function(idx){addIndex(store, idx);});
        return store;
    }

    function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, {unique: idx.unique, multiEntry: idx.multi});
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
    //
    //
    //      StraightForwardDB API
    //
    //
    //

    api.open = function () {
        if (db) throw "SFDB: Database already open";
        // Make sure caller has specified at least one version
        if (versions.length == 0) throw "SFDB: No versions specified. Need to call version(ver) method";
        // Sort versions by version number
        versions.sort(function (a, b) { return a._cfg.version - b._cfg.version; });
        // Make sure at least the oldest version specifies a table schema
        if (!versions[0]._cfg.tableSchema) throw "SFDB: No schema specified. Need to call dbInstance.version(ver).schema(schema) on at least the lowest version.";
        // Make all Version instances have a schema (its own or previous if not specified)
        versions.forEach(function (ver) {
            dbVersion = ver._cfg.version;
            if (ver._cfg.tableSchema)
                dbTableSchema = ver._cfg.tableSchema; // If a version specify schema, set this schema to dbTableSchema (at last we will have the last versions' schema there)
            else
                ver._cfg.tableSchema = dbTableSchema; // If a version doesnt specify schema, derive previous version's schema
        });

        setApiOnPlace(tables, new OneshotTransactionFactory(), WriteableTable, Object.keys(dbTableSchema));
        
        var req = idb.open(dbName, dbVersion * 10); // Multiply with 10 will be needed to workaround various bugs in different implementations of indexedDB.
        req.onerror = this.error.fire;
        req.onupgradeneeded = function (e) {
            runUpgraders(e.oldVersion / 10, req.transaction);
        }
        req.onsuccess = function (e) {
            db = req.result;
            isReady = true;
            readyEvent.fire(e);
        }
        return this;
    }

    api.close = function () {
        if (db) {
            db.close();
            Object.keys(tables).forEach(function (table) {
                delete tables[table];
            });
            db = null;
        }
    }

    api.delete = function () {
        api.close();
        var deferred = Deferred();
        var req = idb.deleteDatabase(dbName);
        req.onerror = deferred.reject;
        req.onsuccess = deferred.resolve;
        return deferred;
    }

    //
    // Events
    //

    /// <field>Populate event</field>
    api.populate = event(function () { return new WriteableTransaction(IDBTransaction.prototype, new OneshotTransactionFactory(), Object.keys(dbTableSchema)); });

    /// <field>Error event</field>
    api.error = event(Event);

    /// <field>Ready event</field>
    api.ready = function (fn) {
        if (isReady) fn(); else readyEvent(fn);
    }

    api.transaction = function (mode, tableInstances) {
    	/// <summary>
    	/// 
    	/// </summary>
    	/// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
        /// <param name="tableInstances" type="WriteableTable" parameterArray="true">Table instances to include in transaction, or strings representing the table names</param>
        // Throw if no given table name doesnt exist.
        var storeNames = [];
        for (var i=1;i<arguments.length;++i) {
            var tableInstance = arguments[i];
            if (typeof (tableInstance) == "string") {
                if (!dbTableSchema[tableInstance]) throw "SFDB: Invalid table name: " + tableInstance; return { INVALID_TABLE_NAME: 1 }; // Return statement is for IDE code completion.
                storeNames.push(tableInstance);
            } else {
                if (!(tableInstance instanceof WriteableTable)) throw "SFDB: Invalid parameter. Point out your table instances from your StraightForwardDB instance";
                storeNames.push(tableInstance.tableName);
            }
        }
        var t;
        if (mode == "r") {
            var trans = db.transaction(storeNames, R);
            var tf = new MultirequestTransactionFactory(trans);
            t = new Transaction(trans, tf, storeNames);
        } else if (mode == "rw") {
            var trans = db.transaction(storeNames, RW);
            var tf = new MultirequestTransactionFactory(trans);
            t = new WriteableTransaction(trans, tf, storeNames);
        } else {
            throw "Invalid mode. Only 'r' or 'rw' are valid modes."
        }
        return t;
    }

    api.table = function (tableName) {
        if (Object.keys(dbTableSchema).indexOf(tableName) == -1) { throw "SFDB: Table does not exist"; return { AN_UNKNOWN_TABLE_NAME_WAS_SPECIFIED: 1 }; }
        return new WriteableTable(tableName, new OneshotTransactionFactory());
    }



    //
    //
    //
    // ------------------------- Table Object ---------------------------
    //
    //
    //
    function Table(tableName, transactionFactory) {
    	/// <param name="tableName" type="String"></param>
        /// <param name="transactionFactory" type="OneshotTransactionFactory">OneshotTransactionFactory or MultirequestTransactionFactory</param>
        this.tableName = tableName;
        this._tf = transactionFactory;
    }
    Table.prototype.get = function (key) {
        var d = this._tf.deferred();
        var req = this._tf.trans(this.tableName).objectStore(this.tableName).get(key);
        req.onerror = d.reject;
        req.onsuccess = function (e) {
            d.resolve(e.target.result);
        };
        return d;
    }
    Table.prototype.where = function (indexName) {
        return new WhereClause(this._tf, this.tableName, indexName, false);
    }
    Table.prototype.count = function (cb) {
        return new Collection(this._tf, this.tableName).count(cb);
    }
    Table.prototype.limit = function (numRows) {
        return new Collection(this._tf, this.tableName).limit(numRows);
    }
    Table.prototype.each = function (fn) {
        var d = this._tf.deferred();
        var req = this._tf.trans(this.tableName).objectStore(this.tableName).openCursor();
        iterate(req, null, fn, d.reject, d.resolve, -1);
        return d;
    }
    Table.prototype.toArray = function (cb) {
        var d = this._tf.deferred();
        var a = [];
        if (cb) d.done(cb); // cb is just a shortcut for .toArray().done(cb);
        var req = this._tf.trans(this.tableName).objectStore(this.tableName).openCursor();
        iterate(req, null, function (item) { a.push(item); }, d.reject, function () { d.resolve(a); }, -1);
        return d;
    }
    Table.prototype.orderBy = function (index) {
        return new Collection(this.tf, this.tableName, index);
    }

    //
    //
    //
    // ------------------------- class WriteableTable extends Table ---------------------------
    //
    //
    //
    function WriteableTable(tableName, transactionFactory) {
        /// <param name="tableName" type="String"></param>
        /// <param name="transactionFactory" type="OneshotTransactionFactory">OneshotTransactionFactory or MultirequestTransactionFactory</param>
        this.tableName = tableName;
        this._tf = transactionFactory;
    }

    WriteableTable.prototype = derive(Table.prototype);

    function createPromise(trans, req, tf, onReqSuccess) {
        deferred = tf.deferred();
        req.onerror = deferred.reject;
        if (tf.oneshot) {
            // Transaction is a one-shot transaction and caller has not access to it. This is the case when calling
            // put(),add() etc directy on db.table and not via db.transaction(). We must return a deferred object to 
            // that user can act upon transaction completion. This is not needed when caller has the transaction
            // object.
            trans.oncomplete = deferred.resolve;
            if (onReqSuccess) req.onsuccess = onReqSuccess;
        } else {
            // complete() must be called when request.onsuccess.
            // If req.onsuccess already is bound to a function, use this poor-man's implementation of addEventListener() to onsuccess.
            if (onReqSuccess) {
                req.onsuccess = function () {
                    onReqSuccess.apply(this, arguments);
                    deferred.resolve.apply(this, arguments);
                }
            } else {
                req.onsuccess = deferred.resolve;
            }
        }
        return deferred;
    }

    WriteableTable.prototype.put = function (obj, cb) {
        /// <summary>
        ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
        /// </summary>
        /// <param name="obj" type="Object">A javascript object to insert or update</param>
        /// <param name="cb" type="Function" optional="true">
        ///     function (key, err) {} where key is the value of the objects manually or auto-generated primary key. If an error occurs, key will be null and err will contain the error.
        ///     Note that the transaction may still not be completed and could still potentially fail even the request succeeded at this point.
        ///     Use the transaction() method to get more control over entire transation.
        /// </param>
        var trans = this._tf.trans(this.tableName, RW);
        var store = trans.objectStore(this.tableName);
        var req = store.put(obj);
        return createPromise(trans, req, this._tf);
    }

    WriteableTable.prototype.add = function (obj) {
        /// <summary>
        ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
        /// </summary>
        /// <param name="obj" type="Object">A javascript object to insert</param>
        /// <param name="cb" type="Function" optional="true">
        ///     function (key, err) {} where key is the value of the objects manually or auto-generated primary key. If an error occurs, key will be null and err will contain the error.
        ///     Note that the transaction may still not be completed and could still potentially fail even the request succeeded at this point.
        ///     Use the transaction() method to get more control over entire transation.
        /// </param>
        var trans = this._tf.trans(this.tableName, RW);
        var store = trans.objectStore(this.tableName);
        var req = store.add(obj);
        return createPromise(trans, req, this._tf, function (e) {
            var target = e.target;
            var keyPath = target.source.keyPath;
            if (keyPath) {
                obj[keyPath] = target.result;
            }
            deferred.notify(obj, target.result);
        });
    }

    WriteableTable.prototype.delete = function (key) {
        /// <param name="key">Primary key of the object to delete</param>
        var store = this._tf.trans(this.tableName, RW).objectStore(this.tableName);
        var req = store.delete(key);
        return createPromise(trans, req, this._tf);
    }

    WriteableTable.prototype.clear = function (cb) {
        var trans = this._tf.trans(this.tableName, RW);
        var store = trans.objectStore(this.tableName);
        var req = store.clear();
        return createPromise(trans, req, this._tf);
    }

    // TODO: compress code by generalise these calls.
    WriteableTable.prototype.where = function (indexName) {
        return new WhereClause(this._tf, this.tableName, indexName, true);
    }
    WriteableTable.prototype.limit = function (numRows) {
        return new Collection(this._tf, this.tableName, null, null, true).limit(numRows);
    }
    WriteableTable.prototype.modify = function (changes) {
        return new Collection(this._tf, this.tableName, null, null, true).modify(changes);
    }


    //
    //
    //
    // ------------------------- class Transaction ---------------------------
    //
    //
    //
    function TransactionBase(trans, tf) {
        var thiz = this;
        var d = Deferred();

        thiz.fail = d.fail;
        thiz.done = d.done;

        trans.onerror = d.reject;
        trans.onabort = d.reject;
        trans.oncomplete = d.resolve;

        thiz.abort = function () {
            trans.abort();
        }
        return thiz;
    }
    function Transaction(trans, tf, storeNames) {
        var thiz = TransactionBase.call(this, trans, tf);
        setApiOnPlace(thiz, tf, Table, storeNames);
        thiz.table = function (tableName) {
            if (!trans.db.objectStoreNames.contains(tableName)) throw "SFDB: Table does not exist";
            return new Table(tableName, tf);
        }

        return thiz;
    }

    function WriteableTransaction(trans, tf, storeNames) {
        var thiz = TransactionBase.call(this, trans, tf);
        setApiOnPlace(thiz, tf, WriteableTable, storeNames);
        thiz.table = function (tableName) {
            if (!trans.db.objectStoreNames.contains(tableName)) throw "SFDB: Table does not exist";
            return new WriteableTable(tableName, tf);
        }
        return thiz;
    }










    //
    //
    //
    // ------------------------- WhereClause ---------------------------
    //
    //
    //

    function WhereClause(tf, table, index, writeable) {
        /// <param name="tf" value="function(tableName, mode){return IDBTransaction.prototype;}"></param>
        /// <param name="table" type="String"></param>
        /// <param name="index" type="String"></param>

        this.between = function (lower, upper, includeLower, includeUpper) {
        	/// <summary>
        	///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
        	/// </summary>
        	/// <param name="lower"></param>
        	/// <param name="upper"></param>
        	/// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
        	/// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
        	/// <returns type="Collection"></returns>
            return new Collection(tf, table, index, IDBKeyRange.bound(lower, upper, includeLower == false ? false : true, !!includeUpper), writeable);
        }
        this.equals = function(value) {
            return new Collection(tf, table, index, IDBKeyRange.only(value), writeable);
        }
        this.above = function(value) {
            return new Collection(tf, table, index, IDBKeyRange.lowerBound(value), writeable);
        }
        this.aboveOrEqual = function(value) {
            return new Collection(tf, table, index, IDBKeyRange.lowerBound(value, true), writeable);
        }
        this.below = function(value) {
            return new Collection(tf, table, index, IDBKeyRange.upperBound(value), writeable);
        }
        this.belowOrEqual = function(value) {
            return new Collection(tf, table, index, IDBKeyRange.upperBound(value, true), writeable);
        }
    }








    //
    //
    //
    // ------------------------- Collection ---------------------------
    //
    //
    //

    function Collection(tf, table, index, keyRange, writeable) {
    	/// <summary>
    	/// 
    	/// </summary>
        /// <param name="tf" type="OneshotTransactionFactory">OneshotTransactionFactory or MultirequestTransactionFactory</param>
    	/// <param name="table" type="String"></param>
    	/// <param name="index" type="String" optional="true"></param>
        /// <param name="keyRange" type="IDBKeyRange" optional="true"></param>
        /// <param name="writeable" optional="true"></param>
        var limit = -1;
        var dir = "next";
        var unique = "";
        var filter = null;
        var mode = R;
        /// <var type="CatchableDeferred">Deferred instance. Can be a CatchableDeferred.</var>
        var deferred;
        /// <var type="IDBTransaction" />
        var trans;
        var oneshot = tf.oneshot;

        function addFilter(fn) {
            if (!filter) filter = fn; else {
                var prevFilter = filter;
                filter = function(){return prevFilter.apply(this,arguments) && fn.apply(this,arguments);};
            }
        }

        function openCursor() {
            trans = tf.trans(table, mode);
            var store = trans.objectStore(table);
            var lowerIndex = index && index.toLowerCase();
            var dbIndex = (index && store.keyPath && lowerIndex != store.keyPath.toLowerCase() ? store.index(index.toLowerCase()) : store);
            return dbIndex.openCursor(keyRange, dir+unique);
        }

        this.each = function (fn) {
            deferred = tf.deferred();
            iterate(openCursor(), filter, fn, deferred.reject, deferred.resolve, limit);
            return deferred;
        }

        this.count = function (cb) {
            deferred = tf.deferred();
            // TODO: If limit, unique or filter, use iterate() instead!
            var trans = tf(table, R);
            var store = trans.objectStore(table);
            var lowerIndex = index && index.toLowerCase();
            var dbIndex = (index && store.keyPath && lowerIndex != store.keyPath.toLowerCase() ? store.index(index.toLowerCase()) : store);
            var req = dbIndex.count(keyRange);
            if (cb) deferred.done(cb);
            req.onerror = deferred.reject;
            req.onsuccess = function (e) {
                deferred.resolve(e.target.result);
            }
            return deferred;
        }

        this.toArray = function (cb) {
            deferred = tf.deferred();
            var a = [];
            if (cb) deferred.done(cb); // cb is just a shortcut for .toArray().done(cb);
            iterate(openCursor(), filter, function (item) { a.push(item); }, deferred.reject, function () { deferred.resolve(a); }, limit);
            return deferred;
        }

        this.first = function (cb) {
            deferred = tf.deferred();
            deferred.done(cb);
            iterate(openCursor(), filter, function (item) { deferred.resolve(item); return false; }, deferred.reject, function () { }, limit);
            return deferred;
        }

        if (writeable) {
            this.modify = function (changes) {
                deferred = tf.deferred(true);
                mode = RW;
                var keys = Object.keys(changes);
                addFilter(function (cursor) {
                    var item = cursor.value;
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        var key = keys[i];
                        var value = changes[key];
                        item[key] = (value instanceof Function ? value(item) : value);
                    }
                    cursor.update(item).onerror = function (e) { deferred.throw(e, item); };
                    // No need to listen to onsuccess! What different should it make?! Who to call? deferred.notify()? Not worth the cost in code exectution. Think of big queries of updating millions of records!
                    return false; // Make sure fn() is never called because we set it to null!
                });
                if (oneshot) {
                    iterate(openCursor(), filter, null, deferred.reject, function () { }, limit);
                    trans.oncomplete = deferred.resolve;
                } else {
                    iterate(openCursor(), filter, null, deferred.reject, deferred.resolve, limit);
                }
                return deferred;
            }
            this.delete = function () {
                deferred = tf.deferred(true);
                mode = RW;
                addFilter(function (cursor) {
                    cursor.delete().onerror = function (e) { deferred.throw(e, cursor.value); };
                    return false;// Make sure fn() is never called because we set it to null!
                });
                if (oneshot) {
                    iterate(openCursor(), filter, null, deferred.reject, function () { }, limit);
                    trans.oncomplete = deferred.resolve;
                } else {
                    iterate(openCursor(), filter, null, deferred.reject, deferred.resolve, limit);
                }
                return deferred;
            }
        }

        this.limit = function (numRows) {
            limit = numRows;
            return this;
        }

        this.and = function(jsFunctionFilter) {
            /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
            addFilter(function(cursor){
                return jsFunctionFilter (cursor.value);
            });
            return this;
        }
        this.desc = function () { dir = "prev"; return this;}
        this.distinct = function () { unique = "unique"; return this;}
    }
    








    //
    //
    //
    // ------------------------- Help functions ---------------------------
    //
    //
    //
    function derive(obj) {
        function F() { }
        F.prototype = obj;
        return new F();
    }

    function setApiOnPlace(obj, transactionFactory, tableClass, tableNames) {
        for (var i=0,l=tableNames.length;i<l;++i) {
            var tableName = tableNames[i];
            obj[tableName] = new tableClass(tableName, transactionFactory);
        }
    }

    function fake(fn) {
        var to = setTimeout(fn, 1000);
        clearTimeout(to);
    }

    function iterate(req, filter, fn, error, complete, limit) {
        var countdown = limit + 1; // TODO: Lift out limit/countdown outside loop by adding a filter instead!
        req.onerror = error;
        req.onsuccess = function (e) {
            var cursor = e.target.result;
            if (cursor) {
                var c = true;
                if (!filter || filter(cursor)) {
                    if (fn(cursor.value) == false) c = false;
                    if (--countdown == 0) c = false;
                }
                if (c) cursor.continue(); else complete();
            } else {
                complete();
            }
        }
    }

    function parseIndexSyntax(indexes) {
        /// <param name="indexes" type="String"></param>
        /// <returns value="[{name:'',keyPath:'',unique:false,multi:false,auto:false}]"></returns>
        var rv = [];
        indexes.split(',').forEach(function (index) {
            if (!index || index.indexOf('[') == 0) return;
            var keyPath = index.replace("!", "").replace("++", "").replace("*", "");
            var idx = {
                name: keyPath && keyPath.toLowerCase(),
                keyPath: keyPath || null,
                unique: index.indexOf('!') == 0,
                multi: index.indexOf('*') == 0,
                auto: index.indexOf("++") != -1
            };
            idx.src = (idx.unique ? '!' : '') + (idx.multi ? '*' : '') + (idx.auto ? "++" : "") + idx.keyPath;
            rv.push(idx);
        });
        return rv;
    }

    function OneshotTransactionFactory() {
        this.trans = function(tableName, mode) {
        	/// <returns type="IDBTransaction"></returns>
            return db.transaction(tableName, mode || R);
        }
        this.oneshot = true;
        this.deferred = function(catchable) {
        	/// <returns type="CatchableDeferred"></returns>
            return catchable ? CatchableDeferred(true) : Deferred();
        }
    }

    function MultirequestTransactionFactory(trans) {
        var thiz = this;
        this.uncompleteRequests = 0;
        this.trans = function() { return trans; }
        this.onbeforecomplete = null;
        this.deferred = function(catchable) {
            ++thiz.uncompleteRequests;
            var d = (catchable ? CatchableDeferred(true) : Deferred());
            function proxy (meth){
                var origFunc = d[meth];
                d[meth] = function() {
                    origFunc.apply(this,arguments);
                    if (--thiz.uncompleteRequests == 0 && thiz.onbeforecomplete) {
                        thiz.onbeforecomplete();
                    }
                }
            }
            proxy("resolve");
            proxy("reject");
            return d;
        }
    }

    function assert(b) {
        if (!b) throw "Assertion failed";
    }

    function event(constructor) {
        var l = [];
        var rv = function (cb) {
            fake(function () { cb(constructor());}); // For code completion
            if (l.indexOf(cb) == -1) l.push(cb);
            return this;
        };
        rv.fire = function (eventObj) {
            var a = arguments;
            l.forEach(function (cb) { cb.apply(window, a); });
        }
        rv.off = function (cb) {
            var i = l.indexOf(cb);
            if (i != -1) l.splice(i, 1);
        }
        return rv;
    }

    function hasIEDeleteObjectStoreBug() {
        // Assume bug is present in IE10 and IE11 but dont expect it in next version of IE (IE12)
        return navigator.userAgent.indexOf("Trident / 7.0; rv: 11.0") >= 0 || navigator.userAgent.indexOf("MSIE") >= 0;
    }

    //
    //
    //  Deferred promise. See http://wiki.commonjs.org/wiki/Promises/A
    //
    //
    function Deferred(func) {
        // In case jQuery is included. Use it's Deferred to enable compatibility with jQuery.when().
        // BUG: Better approach would be to make sure this implementation is compatible.
        //if (window.jQuery) return jQuery.Deferred(func);

        var tuples = [
                ['resolve', 'done', new Callbacks(true), 'resolved'],
                ['reject', 'fail', new Callbacks(true), 'rejected'],
                ['notify', 'progress', new Callbacks(false)],
        ],
            state = 'pending',
            promise = {
                state: function () {
                    return state;
                },
                then: function ( /* doneHandler , failedHandler , progressHandler */) {
                    var fns = arguments;

                    return Deferred(function (newDefer) {
                        tuples.forEach(function (tuple, i) {
                            var fn = fns[i];

                            deferred[tuple[1]](typeof fn === 'function' ?
                                function () {
                                    var returned = fn.apply(this, arguments);

                                    if (returned && typeof returned.promise === 'function') {
                                        returned.promise()
                                            .done(newDefer.resolve)
                                            .fail(newDefer.reject)
                                            .progress(newDefer.notify);
                                    }
                                } : newDefer[tuple[0]]
                            );
                        });
                    }).promise();
                },
                promise: function (obj) {
                    if (obj) {
                        Object.keys(promise)
                            .forEach(function (key) {
                                obj[key] = promise[key];
                            });

                        return obj;
                    }
                    return promise;
                }
            },
            deferred = {};

        tuples.forEach(function (tuple, i) {
            var list = tuple[2],
                actionState = tuple[3];

            promise[tuple[1]] = list.add;

            if (actionState) {
                list.add(function () {
                    state = actionState;
                });
            }

            deferred[tuple[0]] = list.fire;
        });

        promise.promise(deferred);

        if (func) {
            func.call(deferred, deferred);
        }

        return deferred;
    };

    //
    //  Extension to Deferred() with a catch() method to enable "ignore-and-continue" for asyncronic for loops.
    //
    function CatchableDeferred(handleEventCancellation) {
        var deferred = Deferred();
        var catchers = [];
        deferred.catch = function (fn) {
            catchers.push(fn || null);
            return deferred;
        }
        deferred.throw = function (e) {
            var catched = false, numCatchers = catchers.length;
            if (numCatchers > 0) {
                for (var i = 0; i < numCatchers; ++i) {
                    var catcher = catchers[i];
                    if (catcher === null) {
                        catched = true; // Caller use operation.catch();
                        break;
                    }
                    if (catcher.apply(this, arguments) === false) {
                        catched = true; // Caller use operation.catch(fn); and returns false from that function.
                        break;
                    }
                }
                // If come here, no catchers catched the error.
            }
            if (catched) {
                if (handleEventCancellation) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                return false;// Return false to caller, who may react accordingly.
            } else {
                // Automatically apply the error into the reject() method, so that operation.fail() is triggered.
                deferred.reject.apply(this, arguments);
                return true;
            }
        }
        return deferred;
    }

    function Callbacks(once, stopOnFalse) {
        var state, list = [];

        function fire(context, args) {
            if (list) {
                args = args || [];
                state = state || [context, args];

                for (var i = 0, il = list.length ; i < il ; i++) {
                    list[i].apply(state[0], state[1]);
                }

                if (once) {
                    list = [];
                }
            }
        }

        this.add = function () {
            for (var i = 0, l = arguments.length ; i < l ; i++) {
                list.push(arguments[i]);
            }

            if (state) {
                fire();
            }

            return this;
        };

        this.fire = function () {
            fire(this, arguments);
            return this;
        };
    };

    return api;
}

StraightForwardDB.delete = function (databaseName) {
    return new StraightForwardDB(databaseName).delete();
}

