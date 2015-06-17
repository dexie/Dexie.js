/// <reference path="run-unit-tests.html" />
var no_optimize = window.no_optimize || window.location.search.indexOf('dontoptimize=true') != -1;

function resetDatabase(db) {
    /// <param name="db" type="Dexie"></param>
    var Promise = Dexie.Promise;
    return no_optimize || !db._hasBeenCreated ?
        // Full Database recreation. Takes much time!
        db.delete().then(function () {
            return db.open().then(function() {
                if (!no_optimize) {
                    db._hasBeenCreated = true;
                    var initialState = (db._initialState = {});
                    // Now, snapshot the database how it looks like initially (what on.populate did)
                    return db.transaction('r', db.tables, function() {
                        var trans = Dexie.currentTransaction;
                        return Promise.all(Object.keys(trans.tables).filter(function(tableName) {
                            // Don't clear 'meta tables'
                            return tableName[0] != '_' && tableName[0] != '$';
                        }).map(function (tableName) {
                            var items = {};
                            initialState[tableName] = items;
                            return trans.tables[tableName].each(function(item, cursor) {
                                items[cursor.primaryKey] = { key: cursor.primaryKey, value: item };
                            });
                        }));
                    });
                }
            });
        })

        :

        // Optimize: Don't delete and recreate database. Instead, just clear all object stores,
        // and manually run db.on.populate
        db.transaction('rw!', db.tables, function() {
            // Got to do an operation in order for backend transaction to be created.
            var trans = Dexie.currentTransaction;
            var initialState = db._initialState;
            return Promise.all(Object.keys(trans.tables).filter(function(tableName) {
                // Don't clear 'meta tables'
                return tableName[0] != '_' && tableName[0] != '$';
            }).map(function(tableName) {
                // Read current state
                var items = {};
                return trans.tables[tableName].each(function(item, cursor) {
                    items[cursor.primaryKey] = { key: cursor.primaryKey, value: item };
                }).then(function() {
                    // Diff from initialState
                    // Go through initialState and diff with current state
                    var initialItems = initialState[tableName];
                    return Promise.all(Object.keys(initialItems).map(function(key) {
                        var item = items[key];
                        var initialItem = initialItems[key];
                        if (!item || JSON.stringify(item.value) != JSON.stringify(initialItem.value))
                            return (db.table(tableName).schema.primKey.keyPath ? trans.tables[tableName].put(initialItem.value) :
                                trans.tables[tableName].put(initialItem.value, initialItem.key));
                        return Promise.resolve();
                    }));
                }).then(function() {
                    // Go through current state and diff with initialState
                    var initialItems = initialState[tableName];
                    return Promise.all(Object.keys(items).map(function (key) {
                        var item = items[key];
                        var initialItem = initialItems[key];
                        if (!initialItem)
                            return trans.tables[tableName].delete(item.key);
                        return Promise.resolve();
                    }));
                });
            }));
        });
}

function deleteDatabase(db) {
    var Promise = Dexie.Promise;
    return no_optimize ? db.delete() : db.transaction('rw!', db.tables, function() {
        // Got to do an operation in order for backend transaction to be created.
        var trans = Dexie.currentTransaction;
        return Promise.all(Object.keys(trans.tables).filter(function(tableName) {
            // Don't clear 'meta tables'
            return tableName[0] != '_' && tableName[0] != '$';
        }).map(function(tableName) {
            // Clear all tables
            return trans.tables[tableName].clear();
        }));
    });
}
