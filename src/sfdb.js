/// <reference path="/js/common/jquery.js" />
function StraightForwardDB(dbName, version) {
    var idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    var dbVersion = version || 1;
    var upgraders = [];
    var sfdb = this;
    var tableSchema;
    var isReady = false;
    var readyEvent = event();
    ///<var type="IDBDatabase" />
    var db;
    var R = "readonly", RW = "readwrite";

    this.version = function (ver, schema, upgradeFunc) {
    	/// <summary>
    	///   Defines the schema for a particular version
    	/// </summary>
        /// <param name="ver" type="Number"></param>
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
        /// <param name="upgradeFunc" optional="true">Function that performs upgrading actions.</param>
        /// <returns type="StraightForwardDB"></returns>
        if (ver > dbVersion) {
            dbVersion = ver;
            tableSchema = schema;
        }
        upgraders.sort(function(a,b){return a.version - b.version;});
        var lastSchema = upgraders.length > 0 ? upgraders[upgraders.length - 1].schema : null;
        var diff = getSchemaDiff(schema, lastSchema);
        upgraders.push({
            version: ver, schema: schema, diff: diff, fn: function (ctx) {
                /// <param name="ctx" type="UpgradeTransaction"></param>
                db.transaction("").objectStore("");
                // TODO:
                // 1) diff oldSchema, newSchema --> tablesToAdd, tablesToRemove, indexesToAdd, indexesToRemove, special:
                //      * autoincrement or primKey changed: throw()
                //     special cases for indexes:
                //      * multiEntry or unique changed: removeIndex, addIndex: throw()
            }
        });
        return this;
    }

    function getSchemaDiff(newSchema, oldSchema) {
        var diff = {
            del: [],
            add: [],
            change: []
        };
        for (var table in oldSchema) {
            if (!newSchema[table]) diff.del.push(table);
        }
        for (var table in newSchema) {
            if (!oldSchema[table]) diff.add.push([table, newSchema[table]]);
            else if (oldSchema[table].toLowerCase() != newSchema[table].toLowerCase()) {
                // TODO: Get index diff. If something unchangeable is changed, throw!
                var oldIndexes = parseIndexSyntax(oldSchema[table]);
                var newIndexes = parseIndexSyntax(newSchema[table]);

                //oldIndexes.reduce(
            }
        }
    }

    function createTables(trans) {
        /// <param name="trans" type="UpgradeTransaction"></param>
        for (var tableName in tableSchema) {
            if (tableSchema.hasOwnProperty(tableName)) {
                trans.createTable(tableName, tableSchema[tableName]);
            }
        }
    }

    this.upgradeTo = function (version, fn) {
        fake(function () { fn(new UpgradeTransaction(IDBTransaction.prototype)); });
        assert(version > 1); // Upgrade functions never needed for version 1. Schema states which stores and indexes to create. To fill database with content, use populate() instead.
        assert(version <= dbVersion);// Only create upgraders up to current version. In case you want to create an upgrade function for future versions, please remark the code.
        upgraders.push({ version: version, fn: fn });
    }


    this.schema = function (schema) {
        /// <summary>
        ///     Specify your tables, primary keys and indexes. Note that you do not have to specify other columns than those you
        ///     wish to index.
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
        /// <returns type="StraightForwardDB"></returns>
        tableSchema = schema;
        return this;
    }

    this.open = function () {
        setApiOnPlace(this, defaultTransactionFactory, WriteableTable); //function () {throw "SFDB: Database not  to use yet."});
        setApiOnPlace(UpgradeTransaction.prototype, function () { return IDBTransaction.prototype; }, UpgradeableTable); // For code completion only. Will be overridden by direct population later on.

        var req = idb.open(dbName, dbVersion);
        req.onerror = function (e) {
            onError(e);
        }
        req.onupgradeneeded = function (e) {
            // 1. Create object stores
            db = req.result;
            var upgradeTransaction = new UpgradeTransaction(req.transaction);
            setApiOnPlace(upgradeTransaction, function () { return req.transaction; }, UpgradeableTable);
            if (e.oldVersion == 0) {
                // Database first-time creation!
                createTables(upgradeTransaction);
                sfdb.populate.fire(upgradeTransaction);
            } else {
                upgraders.sort(function (a, b) { return a.version - b.version; });
                // TODO: Not in for-loop! When each upgrader is complete (can be after a callback), call the next upgrader.
                for (var i = 0; i < upgraders.length; ++i) {
                    if (e.oldVersion < upgraders[i].version) {
                        upgraders[i].fn(upgradeTransaction);
                    }
                }
            }
        }
        req.onsuccess = function (e) {
            db = req.result;
            setApiOnPlace(sfdb, defaultTransactionFactory, WriteableTable);
            isReady = true;
            readyEvent.fire(e);
        }
        return this;
    }

    this.close = function () {
        db.close();
    }

    this.delete = function (cb) {
        var deferred = Deferred();
        var req = idb.deleteDatabase(dbName);
        req.onerror = deferred.reject;
        req.onsuccess = deferred.resolve;
        return deferred;
    }

    //
    // Events
    //
    // Note: For code completion of populate event (UpgradeTransaction), keep events below function schema().

    /// <field>Populate event</field>
    this.populate = event(UpgradeTransaction);

    /// <field>Error event</field>
    this.error = event(Event);

    /// <field>Ready event</field>
    this.ready = function (fn) {
        if (isReady) fn(); else readyEvent(fn);
    }

    this.transaction = function (mode, tables) {
    	/// <summary>
    	/// 
    	/// </summary>
    	/// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
        /// <param name="tables" type="WriteableTable" parameterArray="true">Table instances to include in transaction</param>
        // Throw if no given table name doesnt exist.
        var storeNames = [];
        for (var i=1;i<arguments.length;++i) {
            var tableInstance = arguments[i];
            if (!(tableInstance instanceof WriteableTable)) throw "SFDB: Invalid parameter. Point out your table instances from your StraightForwardDB instance";
            storeNames.push(tableInstance.tableName);
        }
        var t;
        if (mode == "r") {
            var trans = db.transaction(storeNames, R);
            t = new Transaction(trans);
            setApiOnPlace(t, function () { return trans; }, Table, storeNames);
        } else if (mode == "rw") {
            var trans = db.transaction(storeNames, RW);
            t = new WriteableTransaction(trans);
            setApiOnPlace(t, function () { return trans; }, WriteableTable, storeNames);
        } else {
            throw "Invalid mode. Only 'r' or 'rw' are valid modes."
        }
        return t;
    }








    //
    //
    //
    // ------------------------- class Table ---------------------------
    //
    //
    //
    function Table(tableName, transactionFactory) {
    	/// <param name="tableName" type="String"></param>
    	/// <param name="transactionFactory" value="function(){return IDBTransaction.prototype}"></param>
        this.tableName = tableName;
        this.tf = transactionFactory;
    }
    Table.prototype.get = function (key) {
        var d = Deferred();
        var req = this.tf(this.tableName).objectStore(this.tableName).get(key);
        req.onerror = d.reject;
        req.onsuccess = function (e) {
            d.resolve(e.target.result);
        };
        return d;
    }
    Table.prototype.where = function (indexName) {
        return new WhereClause(this.tf, this.tableName, indexName, false);
    }
    Table.prototype.all = function () {
        return new Collection(this.tf, this.tableName);
    }
    Table.prototype.each = function (fn) {
        var d = Deferred();
        var req = this.tf(this.tableName).objectStore(this.tableName).openCursor();
        iterate(req, null, fn, d.reject, d.resolve, -1);
        return d;
    }
    Table.prototype.toArray = function (cb) {
        var d = Deferred();
        var a = [];
        if (cb) d.done(cb); // cb is just a shortcut for .toArray().done(cb);
        var req = this.tf(this.tableName).objectStore(this.tableName).openCursor();
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
        /// <param name="transactionFactory" value="function(){return IDBTransaction.prototype}"></param>
        this.tableName = tableName;
        this.tf = transactionFactory;
    }

    WriteableTable.prototype = derive(Table);

    function createPromise(trans, req, tf, onReqSuccess) {
        deferred = Deferred();
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
        var trans = this.tf(this.tableName, RW);
        var store = trans.objectStore(this.tableName);
        var req = store.put(obj);
        return createPromise(trans, req, this.tf);
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
        var trans = this.tf(this.tableName, RW);
        var store = trans.objectStore(this.tableName);
        var req = store.add(obj);
        return createPromise(trans, req, this.tf, function (e) {
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
        var store = this.tf(this.tableName, RW).objectStore(this.tableName);
        var req = store.delete(key);
        return createPromise(trans, req, this.tf);
    }

    WriteableTable.prototype.clear = function (cb) {
        var trans = this.tf(this.tableName, RW);
        var store = trans.objectStore(this.tableName);
        var req = store.clear();
        return createPromise(trans, req, this.tf);
    }

    WriteableTable.prototype.all = function () {
        return new Collection(this.tf, this.tableName, null, null, true);
    }
    WriteableTable.prototype.where = function (indexName) {
        return new WhereClause(this.tf, this.tableName, indexName, true);
    }


    //
    //
    //
    // ------------------------- class UpgradeableTable extends WriteableTable ---------------------------
    //
    //
    //
    function UpgradeableTable(tableName, transactionFactory) {
        /// <param name="transactionFactory" value="function(){return IDBTransaction.prototype;}"></param>
        this.tableName = tableName;
        this.tf = transactionFactory;
    }
    UpgradeableTable.prototype = derive(WriteableTable);

    UpgradeableTable.prototype.createIndex = function (index) {
        parseIndexSyntax(index).forEach(function (idx) {
            if (!idx.keyPath) throw "SFDB: index must have a name and cannot be an empty string";
            if (idx.auto) throw "SFDB: Only the primary key can be auto incremented (++). Not indexes.";
            this.tf().objectStore(this.tableName).createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
        });
    }

    UpgradeableTable.prototype.dropIndex = function (index) {
        parseIndexSyntax(index).forEach(function (idx) {
            this.tf().objectStore(this.tableName).deleteIndex(idx.keyPath);
        });
    }





    //
    //
    //
    // ------------------------- class Transaction ---------------------------
    //
    //
    //
    function Transaction(trans) {
        var thiz = this;
        var d = Deferred();

        this.abort = function () {
            trans.abort();
        }

        this.fail = d.fail;
        this.done = d.done;
        this.notify = d.notify;

        trans.onerror = d.reject;
        trans.onabort = d.reject;
        trans.oncomplete = d.resolve;
        return thiz;
    }

    function WriteableTransaction(trans) {
        var thiz = Transaction.call(this, trans);
    }

    function UpgradeTransaction(trans) {
        /// <param name="trans" type="IDBTransaction"></param>
        var thiz = WriteableTransaction.call(this, trans);
        thiz.createTable = function (tableName, indexes) {
            var idxs = parseIndexSyntax(indexes);
            var primaryKey = idxs[0];
            if (primaryKey.multi) throw "SFDB: Primary key cannot be multi valued";
            var store = trans.db.createObjectStore(tableName, { keyPath: primaryKey.keyPath, autoIncrement: primaryKey.auto });
            for (var i = 1; i < idxs.length; ++i) {
                var idx = idxs[i];
                if (!idx.keyPath) throw "SFDB: index must have a name and cannot be an empty string";
                if (idx.auto) throw "SFDB: Only the primary key can be auto incremented (++). Not indexes.";
                store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
            }
            return new UpgradeableTable(tableName, function () { return trans; });
        }
        thiz.getTableByName = function (tableName) {
            if (!trans.db.objectStoreNames.contains(tableName)) throw "SFDB: Table does not exist";
            return new UpgradeableTable(tableName, function () { return trans; });
        }
        thiz.dropTable = function (tableName) {
            trans.db.deleteObjectStore(tableName);
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
    	/// <param name="tf" value="function(){return IDBTransaction.prototype;}"></param>
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
            trans = tf(table, mode);
            var store = trans.objectStore(table);
            var lowerIndex = index && index.toLowerCase();
            var dbIndex = (index && store.keyPath && lowerIndex != store.keyPath.toLowerCase() ? store.index(index.toLowerCase()) : store);
            return dbIndex.openCursor(keyRange, dir+unique);
        }

        this.each = function (fn) {
            deferred = Deferred();
            iterate(openCursor(), filter, fn, deferred.reject, deferred.resolve, limit);
            return deferred;
        }

        this.count = function (cb) {
            deferred = Deferred();
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
            deferred = Deferred();
            var a = [];
            if (cb) deferred.done(cb); // cb is just a shortcut for .toArray().done(cb);
            iterate(openCursor(), filter, function (item) { a.push(item); }, deferred.reject, function () { deferred.resolve(a); }, limit);
            return deferred;
        }

        this.first = function () {
            deferred = Deferred();
            iterate(openCursor(), filter, function (item) { deferred.resolve(item); return false; }, deferred.reject, function () { }, limit);
            return deferred;
        }

        if (writeable) {
            this.modify = function (changes) {
                deferred = CatchableDeferred(true);
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
                deferred = CatchableDeferred(true);
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
    function derive(type) {
        function F() { }
        F.prototype = type.prototype;
        return new F();
    }

    function setApiOnPlace(obj, transactionFactory, tableClass, tableNames) {
        for (var tableName in tableSchema) {
            if (tableSchema.hasOwnProperty(tableName)) {
                if (!tableNames || tableNames.indexOf(tableName) != -1) {
                    //var memberName = obj[tableName] ? "tbl" + tableName[0].toUpperCase() + tableName.substr(1) : tableName;
                    obj[tableName] = new tableClass(tableName, transactionFactory);
                }
            }
        }
    }

    function fake(fn) {
        //var to = setTimeout(fn, 1000);
        //clearTimeout(to);
    }

    function onError(e) {
        sfdb.error.fire(e);
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
            rv.push({
                name: keyPath && keyPath.toLowerCase(),
                keyPath: keyPath || null,
                unique: index.indexOf('!') == 0,
                multi: index.indexOf('*') == 0,
                auto: index.indexOf("++") != -1
            });
        });
        return rv;
    }

    function defaultTransactionFactory(tableName, mode) {
        return db.transaction(tableName, mode || R);
    }
    defaultTransactionFactory.oneshot = true; // Tells all operations to not resolve complete() until entire transaction is complete. This is because DB may be busy even if a request completes. Also, transaction could be aborted in a later stage.

    function assert(b) {
        if (!b) throw "Assertion failed";
    }

    function event(type) {
        var l = [];
        var rv = function (cb) {
            fake(function () { cb(type.prototype);}); // For code completion
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
        if (window.jQuery) return jQuery.Deferred(func);

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

    function Callbacks(once) {
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

}
