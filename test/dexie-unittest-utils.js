import Dexie from 'dexie';
import {ok, start, test, config} from 'QUnit';

// Custom QUnit config options.
config.urlConfig.push(/*{
    id: "polyfillIE", // Remarked because has no effect anymore. Find out why.
	label: "Include IE Polyfill",
    tooltip: "Enabling this will include the idb-iegap polyfill that makes" +
    " IE10&IE11 support multiEntry and compound indexes as well as compound" +
    " primary keys"
}, {
    id: "indexedDBShim", // Remarked because has no effect anymore. Need to find out why. Should invoke the shim if set!
    label: "IndexedDBShim (UseWebSQL as backend)",
    tooltip: "Enable this in Safari browsers without indexedDB support or" +
    " with poor indexedDB support"
},*/ {
    id: "dontoptimize",
    label: "Dont optimize tests",
    tooltip: "Always delete and recreate the DB between each test"
}, {
    id: "longstacks",
    label: "Long async stacks",
    tooltip: "Set Dexie.debug=true, turning on long async stacks on all" +
    " errors (Actually we use Dexie.debug='dexie' so that frames from" +
    " dexie.js are also included)"
 });

Dexie.debug = window.location.search.indexOf('longstacks') !== -1 ? 'dexie' : false;
if (window.location.search.indexOf('longstacks=tests') !== -1) Dexie.debug = true; // Don't include stuff from dexie.js.

var no_optimize = window.no_optimize || window.location.search.indexOf('dontoptimize') !== -1;

export function resetDatabase(db) {
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
                        return Promise.all(trans.storeNames.filter(function(tableName) {
                            // Don't clear 'meta tables'
                            return tableName[0] != '_' && tableName[0] != '$';
                        }).map(function (tableName) {
                            var items = {};
                            initialState[tableName] = items;
                            return db.table(tableName).each(function(item, cursor) {
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
            return Promise.all(trans.storeNames.filter(function(tableName) {
                // Don't clear 'meta tables'
                return tableName[0] != '_' && tableName[0] != '$';
            }).map(function(tableName) {
                // Read current state
                var items = {};
                return db.table(tableName).each(function(item, cursor) {
                    items[cursor.primaryKey] = { key: cursor.primaryKey, value: item };
                }).then(function() {
                    // Diff from initialState
                    // Go through initialState and diff with current state
                    var initialItems = initialState[tableName];
                    return Promise.all(Object.keys(initialItems).map(function(key) {
                        var item = items[key];
                        var initialItem = initialItems[key];
                        if (!item || JSON.stringify(item.value) != JSON.stringify(initialItem.value))
                            return (db.table(tableName).schema.primKey.keyPath ? db.table(tableName).put(initialItem.value) :
                                db.table(tableName).put(initialItem.value, initialItem.key));
                        return Promise.resolve();
                    }));
                }).then(function() {
                    // Go through current state and diff with initialState
                    var initialItems = initialState[tableName];
                    return Promise.all(Object.keys(items).map(function (key) {
                        var item = items[key];
                        var initialItem = initialItems[key];
                        if (!initialItem)
                            return db.table(tableName).delete(item.key);
                        return Promise.resolve();
                    }));
                });
            }));
        });
}

export function deleteDatabase(db) {
    var Promise = Dexie.Promise;
    return no_optimize ? db.delete() : db.transaction('rw!', db.tables, function() {
        // Got to do an operation in order for backend transaction to be created.
        var trans = Dexie.currentTransaction;
        return Promise.all(trans.storeNames.filter(function(tableName) {
            // Don't clear 'meta tables'
            return tableName[0] != '_' && tableName[0] != '$';
        }).map(function(tableName) {
            // Clear all tables
            return db.table(tableName).clear();
        }));
    });
}

var isIE = !(window.ActiveXObject) && "ActiveXObject" in window;
var isEdge = /Edge\/\d+/.test(navigator.userAgent);
var hasPolyfillIE = [].slice.call(document.getElementsByTagName("script")).some(
    s => s.src.indexOf("idb-iegap") !== -1);

export function supports (features) {
    return features.split('+').reduce((result,feature)=>{
        switch (feature.toLowerCase()) {
            case "compound":
                return result && Array.isArray(Dexie.maxKey);
            case "multientry":
                return result && (hasPolyfillIE || (!isIE && !isEdge)); // Should add Safari to
            case "deleteobjectstoreafterread":
                return result && (!isIE && !isEdge);
            case "versionchange":
                return result;
                //return result && (!isIE && !isEdge); // Should add Safari to
            case "binarykeys":
                try {
                    return result && Array.isArray(Dexie.maxKey) && indexedDB.cmp(new Uint8Array([1]), new Uint8Array([1])) === 0;
                } catch (e) {
                    return false;
                }

            default:
                throw new Error ("Unknown feature: " + feature);
        }
    }, true);
}

export function spawnedTest (name, num, promiseGenerator) {
    if (!promiseGenerator) {
        promiseGenerator = num;
        test(name, function(assert) {
            let done = assert.async();
            Dexie.spawn(promiseGenerator)
                .catch(e => ok(false, e.stack || e))
                .then(done);
        });
    } else {
        test(name, num, function(assert) {
            let done = assert.async();
            Dexie.spawn(promiseGenerator)
                .catch(e => ok(false, e.stack || e))
                .then(done);
        });
    }
}

export function promisedTest (name, num, asyncFunction) {
    if (!asyncFunction) {
        asyncFunction = num;
        test(name, (assert) => {
            let done = assert.async();
            Promise.resolve().then(asyncFunction)
              .catch(e => ok(false, e.stack || e))
              .then(done);
        });
    } else {
        test(name, num, (assert) => {
            let done = assert.async();
            Promise.resolve().then(asyncFunction)
              .catch(e => ok(false, e.stack || e))
              .then(done);
        });
    }
}
