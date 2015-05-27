/// <reference path="run-unit-tests.html" />
var no_optimize = window.no_optimize || window.location.search.indexOf('dontoptimize=true') != -1;

function resetDatabase(db) {
    /// <param name="db" type="Dexie"></param>
    var Promise = Dexie.Promise;
    return no_optimize || !db._hasBeenCreated ?
        // Full Database recreation. Takes much time!
        db.delete().then(function () {
            return db.open().then(function() {
                if (!no_optimize) db._hasBeenCreated = true;
            });
        })

        :

        // Optimize: Don't delete and recreate database. Instead, just clear all object stores,
        // and manually run db.on.populate
        db.transaction('rw!', db.tables, function() {
            // Got to do an operation in order for backend transaction to be created.
            var trans = Dexie.currentTransaction;
            return Promise.all(Object.keys(trans.tables).filter(function (tableName) {
                // Don't clear 'meta tables'
                return tableName[0] != '_' && tableName[0] != '$';
            }).map(function (tableName) {
                // Clear all tables
                return trans.tables[tableName].clear();
            })).then(function() {
                // Create a sub stransaction that runs onpopulate callback.
                return db.transaction('rw', db.tables, function() {
                    return db.on.populate.fire.call(db, Dexie.currentTransaction);
                });
            });
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
