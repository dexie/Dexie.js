function StraightForwardDB(dbName) {
    "use strict";
    var idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    var dbTableSchema = null;
    var dbVersion = 0;
    /// <var type="Array" elementType="Version" />
    var versions = [];
    var isReady = false;
    var readyEvent = event();
    ///<var type="IDBDatabase" />
    var db = null;
    var R = "readonly", RW = "readwrite";
    var iewa; // IE WorkAound needed in IE10 & IE11 for http://connect.microsoft.com/IE/feedback/details/783672/indexeddb-getting-an-aborterror-exception-when-trying-to-delete-objectstore-inside-onupgradeneeded
    var database = this;

    function extend(obj, extended) {
        Object.keys(extended).forEach(function (key) {
            obj[key] = extended[key];
        });
    }

    function derive (Child) {
        return {from: function(Parent) {
            Child.prototype = Object.create(Parent.prototype);
            Child.prototype.constructor = Child;
            return {extend: function(extension) {
                extend (Child.prototype, extension);
            }};
        }}; 
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
        var versionInstance = new Version(versionNumber);
        versions.push(versionInstance);
        return versionInstance;
    }

    function Version(versionNumber) {
        this._cfg = {
            version: versionNumber,
            tableSchema: {},
            schemaUpgrade: null,
            contentUpgrade: null,
        }
    }

    extend(Version.prototype, {
        schema: function (schema) {
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
        },
        upgrade: function (upgradeFunction) {
            /// <param name="upgradeFunction" optional="true">Function that performs upgrading actions.</param>
            var that = this;
            fake(function () {
                upgradeFunction(new WriteableTransaction({}, {}, Object.keys(that._cfg.tableSchema))); // BUGBUG: No code completion for prev version's tables wont appear.
            });
            this._cfg.contentUpgrade = upgradeFunction;
            return this;
        }
    });

    function runUpgraders(oldVersion, trans) {
        if (oldVersion == 0) {
            dbTableSchema = versions[versions.length - 1]._cfg.tableSchema;
            // Create tables:
            Object.keys(dbTableSchema).forEach(function (tableName) {
                createTable(trans, tableName, dbTableSchema[tableName].primKey, dbTableSchema[tableName].indexes);
            });
            // Populate data
            var t = new WriteableTransaction(trans, new MultireqTransactionFactory(trans), trans.db.objectStoreNames);
            database.populate.fire(t);
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
                                    iterate(trans.objectStore(change.name).openCursor(), null, function (item) { iewa[change.name].push(item) }, function () {
                                        if (--iewa.__num == 0) {
                                            trans.abort(); // Abort transaction and re-open database re-run the upgraders now that all tables are read to mem.
                                            database.open();
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
                            var tf = new FinishableTransactionFactory(trans);
                            var t = new WriteableTransaction(trans, tf, trans.db.objectStoreNames);
                            tf.onfinish = cb;
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
        }, cb);
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

    this.open = function () {
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

        setApiOnPlace(this, new TransactionFactory(), WriteableTable, Object.keys(dbTableSchema));
        
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

    this.close = function () {
        if (db) {
            db.close();
            removeTablesApi(this);
            db = null;
        }
    }

    this.delete = function () {
        this.close();
        return Promise(function (resolve, reject) {
            var req = idb.deleteDatabase(dbName);
            req.onerror = resolve;
            req.onsuccess = reject;
        });
    }

    //
    // Events
    //

    /// <field>Populate event</field>
    this.populate = event(function () { return new WriteableTransaction(IDBTransaction.prototype, new TransactionFactory(), Object.keys(dbTableSchema)); });

    /// <field>Error event</field>
    this.error = event(Event);

    /// <field>Ready event</field>
    this.ready = function (fn) {
        if (isReady) fn(); else readyEvent(fn);
    }

    this.transaction = function (mode, tableInstances) {
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
            var tf = new MultireqTransactionFactory(trans);
            t = new Transaction(trans, tf, storeNames);
        } else if (mode == "rw") {
            var trans = db.transaction(storeNames, RW);
            var tf = new MultireqTransactionFactory(trans);
            t = new WriteableTransaction(trans, tf, storeNames);
        } else {
            throw "Invalid mode. Only 'r' or 'rw' are valid modes."
        }
        return t;
    }

    this.table = function (tableName) {
        if (Object.keys(dbTableSchema).indexOf(tableName) == -1) { throw "SFDB: Table does not exist"; return { AN_UNKNOWN_TABLE_NAME_WAS_SPECIFIED: 1 }; }
        return new WriteableTable(tableName, new TransactionFactory());
    }

    //
    //
    //
    // ------------------------- Table Object ---------------------------
    //
    //
    //
    function Table(tableName, transactionFactory, collClass) {
    	/// <param name="tableName" type="String"></param>
        /// <param name="transactionFactory" type="TransactionFactory">TransactionFactory or MultireqTransactionFactory</param>
        this.tableName = tableName;
        this._tf = transactionFactory;
        this._collClass = collClass || Collection;
    }
    extend(Table.prototype, {
        get: function (key) {
            var self = this;
            return this._tf.createPromise(function (resolve, reject) {
                var req = self._tf.create(self.tableName).objectStore(self.tableName).get(key);
                req.onerror = function (e) { reject(req.error, e); }
                req.onsuccess = function () {
                    resolve(req.result);
                };
            });
        },
        where: function (indexName) {
            return new WhereClause(this._tf, this.tableName, indexName);
        },
        count: function (cb) {
            return new Collection(new WhereClause(this._tf, this.tableName)).count(cb);
        },
        limit: function (numRows) {
            return new this._collClass(new WhereClause(this._tf, this.tableName)).limit(numRows);
        },
        each: function (fn) {
            var self = this;
            return this._tf.createPromise(function (resolve, reject) {
                var req = self._tf.create(self.tableName).objectStore(self.tableName).openCursor();
                iterate(req, null, fn, resolve, reject); // TODO: Reject with error not event. Resolve with ???
            });
        },
        toArray: function (cb) {
            var self = this;
            return this._tf.createPromise(function (resolve, reject) {
                var a = [];
                var req = self._tf.create(self.tableName).objectStore(self.tableName).openCursor();
                iterate(req, null, function (item) { a.push(item); }, function () { resolve(a); }, reject);
            }).then(cb);
        },
        orderBy: function (index) {
            return new this._collClass(new WhereClause(this.tf, this.tableName, index));
        }
    });

    //
    //
    //
    // ------------------------- class WriteableTable extends Table ---------------------------
    //
    //
    //
    function WriteableTable(tableName, transactionFactory) {
        /// <param name="tableName" type="String"></param>
        /// <param name="transactionFactory" type="TransactionFactory">TransactionFactory or MultireqTransactionFactory</param>
        this.tableName = tableName;
        this._tf = transactionFactory;
    }

    derive(WriteableTable).from(Table).extend({

        _wrop: function (method, args, onReqSuccess) {
        	/// <summary>
        	///  Perform a write operation on object store.
        	/// </summary>
            var self = this,
                tf = this._tf;

            return tf.createPromise(function (resolve, reject) {
                var trans = tf.create(self.tableName, RW);
                var store = trans.objectStore(self.tableName);
                var req = store[method].apply(store,args || []);
                req.onerror = function (e) {
                    reject(req.error, e);
                }
                if (tf.oneshot) {
                    // Transaction is a one-shot transaction and caller has not access to it. This is the case when calling
                    // put(),add() etc directy on db.table and not via db.transaction(). Let the promise.then() be called when transaction
                    // completes and not just when request completes. Otherwise caller will continue before the data has been transmitted to the database.
                    trans.oncomplete = function () {
                        resolve(req.result);
                    }
                    if (onReqSuccess) req.onsuccess = onReqSuccess;
                } else {
                    // Caller has the transaction object. then() must be called when request.onsuccess.
                    // This is because caller must be able to continue doing operations on the transaction that is already open.
                    // Also, if caller will read from recently stored data within the same transaction, he or she will get it.
                    // But if caller reads same data from another transaction, it may not be retrieved yet.
                    if (onReqSuccess) {
                        req.onsuccess = function () {
                            onReqSuccess.apply(this, arguments);
                            resolve(req.result);
                        }
                    } else {
                        req.onsuccess = function () {
                            resolve(req.result);
                        }
                    }
                }
            });
        },


        put: function (obj) {
            /// <summary>
            ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
            /// </summary>
            /// <param name="obj" type="Object">A javascript object to insert or update</param>
            return this._wrop("put", [obj], function (e) {
                var keyPath = req.source.keyPath;
                if (keyPath) obj[keyPath] = req.result;
            });
        },
        add: function (obj) {
            /// <summary>
            ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
            /// </summary>
            /// <param name="obj" type="Object">A javascript object to insert</param>
            return this._wrop("add", [obj], function (e) {
                var keyPath = req.source.keyPath;
                if (keyPath) obj[keyPath] = req.result;
            });
        },
        'delete': function (key) {
            /// <param name="key">Primary key of the object to delete</param>
            return this._wrop("delete", [key]);
        },
        clear: function () {
            return this._wrop("clear");
        },
        where: function (indexName) {
            return new WhereClause(this._tf, this.tableName, indexName, true);
        },
        modify: function (changes) {
            return new WriteableCollection(new WhereClause(this._tf, this.tableName, null, true)).modify(changes);
        }
    });


    function Transaction(trans, tf, storeNames, tableClass) {
    	/// <summary>
    	///    Transaction class
    	/// </summary>
    	/// <param name="trans" type="IDBTransaction">The underlying transaction instance</param>
        /// <param name="tf">Transaction factory</param>
        /// <param name="storeNames" type="Array">Array of table names to operate on</param>
        /// <param name="tableClass" optional="true" type="Function">Class to use for table instances</param>

        var promise = new Promise(function (resolve, reject) {
            trans.onerror = reject;
            trans.onabort = reject;
            trans.oncomplete = resolve;
        });

        this._ctx = {
            promise: promise,
            trans: trans,
            tf: tf,
            storeNames: storeNames,
            tableClass: tableClass || Table
        };
        
        this.fail = promise.catch;
        this.done = promise.then;

        setApiOnPlace(this, tf, tableClass || Table, storeNames);
    }

    extend(Transaction.prototype, {
        abort: function () {
            this._ctx.trans.abort();
        },
        table: function (tableName) {
            if (this._ctx.storeNames.indexOf(tableName) == -1) throw "SFDB: Table does not exist";
            return new this._ctx.tableClass(tableName, this._ctx.tf);
        }
    });

    function WriteableTransaction(trans, tf, storeNames) {
        /// <summary>
        ///     Transaction class with WriteableTable instances instead of readonly Table instances.
        /// </summary>
        /// <param name="trans" type="IDBTransaction">The underlying transaction instance</param>
        /// <param name="tf">Transaction factory</param>
        /// <param name="storeNames" type="Array">Array of table names to operate on</param>
        Transaction.call(this, trans, tf, storeNames, WriteableTable);
    }

    derive (WriteableTransaction).from(Transaction);



    //
    //
    //
    // ------------------------- WhereClause ---------------------------
    //
    //
    //

    function WhereClause(tf, table, index, writeable) {
        /// <param name="tf" type="TransactionFactory"></param>
        /// <param name="table" type="String"></param>
        /// <param name="index" type="String"></param>
        this._ctx = {
            tf: tf,
            table: table,
            index: index,
            collClass: writeable ? WriteableCollection : Collection
        }
    }

    extend(WhereClause.prototype, {
        between: function (lower, upper, includeLower, includeUpper) {
            /// <summary>
            ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
            /// </summary>
            /// <param name="lower"></param>
            /// <param name="upper"></param>
            /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
            /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
            /// <returns type="Collection"></returns>
            return new this.collClass(this, IDBKeyRange.bound(lower, upper, includeLower == false ? false : true, !!includeUpper));
        },
        equals: function (value) {
            return new this.collClass(this, IDBKeyRange.only(value));
        },
        above: function (value) {
            return new this.collClass(this, IDBKeyRange.lowerBound(value));
        },
        aboveOrEqual: function (value) {
            return new this.collClass(this, IDBKeyRange.lowerBound(value, true));
        },
        below: function (value) {
            return new this.collClass(this, IDBKeyRange.upperBound(value));
        },
        belowOrEqual: function (value) {
            return new this.collClass(this, IDBKeyRange.upperBound(value, true));
        }
    });








    //
    //
    //
    // ------------------------- Collection ---------------------------
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
            tf: whereCtx.tf,
            table: whereCtx.table,
            index: whereCtx.index,
            range: keyRange,
            dir: "next",
            unique: "",
            filter: null,
            /// <field type="IDBTransaction" />
            trans: null,
            oneshot: whereCtx.tf.oneshot
        }
    }

    extend(Collection.prototype, {
        _addFilter: function (fn) {
            var ctx = this._ctx;
            if (!ctx.filter) ctx.filter = fn; else {
                var prevFilter = ctx.filter;
                ctx.filter = function () { return prevFilter.apply(this, arguments) && fn.apply(this, arguments); };
            }
        },

        _getIndexOrStore: function (mode) {
            var ctx = this._ctx;
            ctx.trans = ctx.tf.create(ctx.table, mode || R);
            var store = ctx.trans.objectStore(ctx.table);
            var lowerIndex = ctx.index && ctx.index.toLowerCase();
            return (!lowerIndex || (store.keyPath && lowerIndex == store.keyPath.toLowerCase())) ? store : store.index(lowerIndex);
        },

        _openCursor: function (mode) {
            var ctx = this._ctx;
            return this._getIndexOrStore(mode).openCursor(ctx.range, ctx.dir + ctx.unique);
        },

        each: function (fn) {
            var self = this,
                ctx = this._ctx;

            return ctx.tf.createPromise(function (resolve, reject) {
                iterate(self._openCursor(), ctx.filter, fn, resolve, reject);
            });
        },

        count: function (cb) {
            var self = this,
                ctx = this._ctx;

            return ctx.tf.createPromise(function (resolve, reject) {
                var req = self._getIndexOrStore().count(ctx.range);
                req.onerror = function (e) { reject(req.error, e); }
                req.onsuccess = function (e) {
                    resolve(e.target.result);
                }
            }).then(cb);
        },

        toArray: function (cb) {
            var self = this,
                ctx = this._ctx;

            return ctx.tf.createPromise(function (resolve, reject) {
                var a = [];
                iterate(self._openCursor(), ctx.filter, function (item) { a.push(item); }, function () { resolve(a); }, reject);
            }).then(cb);
        },

        limit: function (numRows) {
            this._addFilter(function (cursor, advance, resolve) {
                if (--numRows < 0) advance(resolve);
                return true;
            });
            return this;
        },

        first: function (cb) {
            return this.limit(1).toArray(function(a){ return a[0]}).then(cb);
        },

        last: function (cb) {
            return this.desc().first(cb);
        },

        and: function(jsFunctionFilter) {
            /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
            this._addFilter(function(cursor){
                return jsFunctionFilter (cursor.value);
            });
            return this;
        },

        desc: function () {
            this._ctx.dir = (this._ctx.dir == "prev" ? "next" : "prev");
            return this;
        },

        distinct: function () {
            this._ctx.unique = "unique";
            return this;
        }
    });
    
    function WriteableCollection() {
        Collection.apply(this, arguments);
    }

    derive(WriteableCollection).from(Collection).extend({
        modify: function (changes) {
            var self = this,
                ctx = this._ctx;

            return ctx.tf.createTrappablePromise(function (resolve, reject, raise) {
                var keys = Object.keys(changes);
                var getters = keys.map(function (key) {
                    var value = changes[key];
                    return (value instanceof Function ? value : function () { return value });
                });
                var count = 0;
                self._addFilter(function (cursor) {
                    ++count;
                    var item = cursor.value;
                    for (var i = 0, l = keys.length; i < l; ++i) {
                        item[keys[i]] = getters[i](item);
                    }
                    cursor.update(item).onerror = function (e) {
                        if (raise(e.target.error, e, item)) ctx.trans.abort();
                    };
                    // No need to listen to onsuccess! What different should it make?! Who to call? notify? Not worth the cost in code exectution. Think of big queries of updating millions of records!
                    return false; // Make sure fn() is never called because we set it to null!
                });

                if (ctx.oneshot) {
                    iterate(self._openCursor(RW), ctx.filter, null, function () { }, reject);
                    ctx.trans.oncomplete = function () { resolve(count); };
                } else {
                    iterate(self._openCursor(RW), ctx.filter, null, function () { resolve(count); }, reject);
                }
            });
        },
        'delete': function () {
            var self = this,
                ctx = this._ctx;

            return ctx.tf.createTrappablePromise(function (resolve, reject, raise) {
                var count = 0;
                self._addFilter(function (cursor) {
                    ++count;
                    cursor.delete().onerror = function (e) {
                        if (raise(e.target.error, e, cursor.value)) ctx.trans.abort();
                    };
                    return false;// Make sure fn() is never called because we set it to null!
                });
                if (ctx.oneshot) {
                    iterate(self._openCursor(RW), ctx.filter, null, function () { }, reject);
                    ctx.trans.oncomplete = function () { resolve(count); };
                } else {
                    iterate(self._openCursor(RW), ctx.filter, null, function () { resolve(count); }, reject);
                }
            });
        }
    });






    //
    //
    //
    // ------------------------- Help functions ---------------------------
    //
    //
    //

    function setApiOnPlace(obj, transactionFactory, tableClass, tableNames) {
        for (var i=0,l=tableNames.length;i<l;++i) {
            var tableName = tableNames[i];
            if (!obj[tableName]) {
                obj[tableName] = new tableClass(tableName, transactionFactory);
            }
        }
    }
    function removeTablesApi(obj) {
        for (var key in obj) {
            if (obj[key] instanceof Table) delete obj[key];
        }
    }

    function fake(fn) {
        var to = setTimeout(fn, 1000);
        clearTimeout(to);
    }

    function iterate(req, filter, fn, oncomplete, reject) {
        req.onerror = function (e) { reject(req.error, e); }
        if (filter) {
            req.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    var c = function(){cursor.continue();};
                    if (filter(cursor, function (advancer) {c = advancer}, oncomplete, reject)) fn(cursor.value);
                    c();
                } else {
                    oncomplete();
                }
            }
        } else {
            req.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    fn(cursor.value);
                    cursor.continue();
                } else {
                    oncomplete();
                }
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

    function TransactionFactory() { }

    extend(TransactionFactory.prototype, {
        create: function (tableName, mode) {
            return db.transaction(tableName, mode || R);
        },
        oneshot: true,
        createPromise: function (fn, trappable) {
            return trappable ? new TrappablePromise(fn) : new Promise(fn);
        },
        createTrappablePromise: function (fn) {
            return this.promise(fn, true);
        }
    });

    function MultireqTransactionFactory(trans) {
        this.trans = trans;
    }

    derive(MultireqTransactionFactory).from(TransactionFactory).extend({
        oneshot: false,
        create: function() { return this.trans; }
    });

    function FinishableTransactionFactory(trans) {
        MultireqTransactionFactory.call(this, trans);
        this.uncompleteRequests = 0;
        this.onfinish = null;
    }

    derive(FinishableTransactionFactory).from(MultireqTransactionFactory).extend({
        createPromise: function (fn, trappable) {
        	/// <summary>
            ///   This overriding of createPromise() will keep count of any pending request on the transaction and be able
            ///   to notify when there are no more pending requests. This is important in the upgrading framework 
            ///   because the underlying implementation of IndexedDB will automatically commit any transaction as soon as there are
            ///   no pending requests left on it. We use this in order to run different version upgraders sequencially on the same transaction without
            ///   requiring the API user to call a callback or return a promise from each upgrader. This makes the upgrader functions more easy
            ///   to implement.
        	/// </summary>
        	/// <param name="fn"></param>
        	/// <param name="trappable"></param>
            var self = this;
            ++self.uncompleteRequests;
            function proxy(fn) {
                return function () {
                    fn.apply(this, arguments);
                    if (--self.uncompleteRequests == 0 && self.onfinish) self.onfinish();
                }
            }
            return MultireqTransactionFactory.prototype.createPromise(function (resolve, reject, raise) {
                arguments[0] = proxy(resolve);
                arguments[1] = proxy(reject);
                fn.apply(this, arguments);
            }, trappable);
        }
    });

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
    // In case window.Promise is not present, define an A+ and ECMASCRIPT 6 compliant Promise using code from promise-light (https://github.com/taylorhakes/promise-light) by https://github.com/taylorhakes 
    //
    var Promise = window.Promise || (function () {

        var asap = window.setImmediate || function (fn) { setTimeout(fn, 0) };

        function Promise(fn) {
            if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
            if (typeof fn !== 'function') throw new TypeError('not a function');
            this._state = null;
            this._value = null;
            this._deferreds = [];
            var self = this;

            doResolve(fn, function (data) {
                resolve.call(self, data);
            }, function (reason) {
                reject.call(self, reason);
            });
        }

        function handle(deferred) {
            var self = this;
            if (this._state === null) {
                this._deferreds.push(deferred);
                return;
            }
            asap(function () {
                var cb = self._state ? deferred.onFulfilled : deferred.onRejected;
                if (cb === null) {
                    (self._state ? deferred.resolve : deferred.reject)(self._value);
                    return;
                }
                var ret;
                try {
                    ret = cb(self._value);
                }
                catch (e) {
                    deferred.reject(e);
                    return;
                }
                deferred.resolve(ret);
            })
        }

        function resolve(newValue) {
            var self = this;
            try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
                if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                    if (typeof newValue.then === 'function') {
                        doResolve(function (resolve, reject) {
                            newValue.then(resolve, reject);
                        }, function (data) {
                            resolve.call(self, data);
                        }, function (reason) {
                            reject.call(self, reason);
                        });
                        return;
                    }
                }
                this._state = true;
                this._value = newValue;
                finale.call(this);
            } catch (e) { reject(e) }
        }

        function reject(newValue) {
            this._state = false;
            this._value = newValue;
            finale.call(this);
        }

        function finale() {
            for (var i = 0, len = this._deferreds.length; i < len; i++) {
                handle.call(this, this._deferreds[i]);
            }
            this._deferreds = null;
        }

        function Handler(onFulfilled, onRejected, resolve, reject) {
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
        function doResolve(fn, onFulfilled, onRejected) {
            var done = false;
            try {
                fn(function (value) {
                    if (done) return;
                    done = true;
                    onFulfilled(value);
                }, function (reason) {
                    if (done) return;
                    done = true;
                    onRejected(reason);
                })
            } catch (ex) {
                if (done) return;
                onRejected(ex);
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
            return new Promise(function (resolve, reject) {
                handle.call(self, new Handler(onFulfilled, onRejected, resolve, reject));
            })
        };

        Promise.prototype['catch'] = function (onRejected) {
            return this.then(null, onRejected);
        };

        Promise.resolve = function (value) {
            return new Promise(function (resolve) {
                resolve(value);
            });
        };

        Promise.reject = function (value) {
            return new Promise(function (resolve, reject) {
                reject(value);
            });
        };

        Promise.race = function (values) {
            return new Promise(function (resolve, reject) {
                values.map(function (value) {
                    value.then(resolve, reject);
                })
            });
        };

        return Promise;
    })();



    //
    //  Extension to Promise with a trap() method to enable "ignore-and-continue" for async "loops".
    //
    function TrappablePromise(fn) {
        var self = this;
        var catchers = [];
        this.trap = function (fn) {
            catchers.push(fn || null);
            return this;
        }
        Promise.call(this, function (resolve, reject) {
            fn(resolve, reject, function (error, event, item) {
                // Raise
                var catched = false, numCatchers = catchers.length;
                if (numCatchers > 0) {
                    for (var i = 0; i < numCatchers; ++i) {
                        var catcher = catchers[i];
                        if (catcher === null) {
                            catched = true; // Caller use operation.trap();
                            break;
                        }
                        if (catcher(error, event, item) === false) {
                            catched = true; // Caller use operation.trap(fn); and returns false from that function.
                            break;
                        }
                    }
                    // If come here, no catchers catched the error.
                }
                if (catched) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;// Return false to caller, who may react accordingly.
                } else {
                    // Automatically apply the error into the reject() method, so that operation.catch() is triggered.
                    reject(error, item, event);
                    return true;
                }
            });
        });
    }

    derive(TrappablePromise).from(Promise);

    this.classes = {
        Collection: Collection,
        Promise: Promise,
        Table: Table,
        Transaction: Transaction,
        TrappablePromise: TrappablePromise,
        Version: Version,
        WhereClause: WhereClause,
        WriteableCollection: WriteableCollection,
        WriteableTable: WriteableTable,
        WriteableTransaction: WriteableTransaction,
    };
}

StraightForwardDB.delete = function (databaseName) {
    return new StraightForwardDB(databaseName).delete();
}
