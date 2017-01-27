(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('dexie'), require('dexie-relationships'), require('QUnit')) :
	typeof define === 'function' && define.amd ? define(['dexie', 'dexie-relationships', 'QUnit'], factory) :
	(factory(global.Dexie,global.dexieRelationships,global.QUnit));
}(this, (function (Dexie,dexieRelationships,QUnit) { 'use strict';

Dexie = 'default' in Dexie ? Dexie['default'] : Dexie;
dexieRelationships = 'default' in dexieRelationships ? dexieRelationships['default'] : dexieRelationships;

// Custom QUnit config options.
QUnit.config.urlConfig.push(/*{
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
if (window.location.search.indexOf('longstacks=tests') !== -1)
    Dexie.debug = true; // Don't include stuff from dexie.js.
var no_optimize = window.no_optimize || window.location.search.indexOf('dontoptimize') !== -1;
function resetDatabase(db) {
    /// <param name="db" type="Dexie"></param>
    var Promise = Dexie.Promise;
    return no_optimize || !db._hasBeenCreated ?
        // Full Database recreation. Takes much time!
        db.delete().then(function () {
            return db.open().then(function () {
                if (!no_optimize) {
                    db._hasBeenCreated = true;
                    var initialState = (db._initialState = {});
                    // Now, snapshot the database how it looks like initially (what on.populate did)
                    return db.transaction('r', db.tables, function () {
                        var trans = Dexie.currentTransaction;
                        return Promise.all(trans.storeNames.filter(function (tableName) {
                            // Don't clear 'meta tables'
                            return tableName[0] != '_' && tableName[0] != '$';
                        }).map(function (tableName) {
                            var items = {};
                            initialState[tableName] = items;
                            return db.table(tableName).each(function (item, cursor) {
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
            db.transaction('rw!', db.tables, function () {
                // Got to do an operation in order for backend transaction to be created.
                var trans = Dexie.currentTransaction;
                var initialState = db._initialState;
                return Promise.all(trans.storeNames.filter(function (tableName) {
                    // Don't clear 'meta tables'
                    return tableName[0] != '_' && tableName[0] != '$';
                }).map(function (tableName) {
                    // Read current state
                    var items = {};
                    return db.table(tableName).each(function (item, cursor) {
                        items[cursor.primaryKey] = { key: cursor.primaryKey, value: item };
                    }).then(function () {
                        // Diff from initialState
                        // Go through initialState and diff with current state
                        var initialItems = initialState[tableName];
                        return Promise.all(Object.keys(initialItems).map(function (key) {
                            var item = items[key];
                            var initialItem = initialItems[key];
                            if (!item || JSON.stringify(item.value) != JSON.stringify(initialItem.value))
                                return (db.table(tableName).schema.primKey.keyPath ? db.table(tableName).put(initialItem.value) :
                                    db.table(tableName).put(initialItem.value, initialItem.key));
                            return Promise.resolve();
                        }));
                    }).then(function () {
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

var isEdge = /Edge\/\d+/.test(navigator.userAgent);
var hasPolyfillIE = [].slice.call(document.getElementsByTagName("script")).some(function (s) { return s.src.indexOf("idb-iegap") !== -1; });


function promisedTest(name, num, asyncFunction) {
    if (!asyncFunction) {
        asyncFunction = num;
        QUnit.test(name, function (assert) {
            var done = assert.async();
            Promise.resolve().then(asyncFunction)
                .catch(function (e) { return QUnit.ok(false, e.stack || e); })
                .then(done);
        });
    }
    else {
        QUnit.test(name, num, function (assert) {
            var done = assert.async();
            Promise.resolve().then(asyncFunction)
                .catch(function (e) { return QUnit.ok(false, e.stack || e); })
                .then(done);
        });
    }
}

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = undefined;
var assert = QUnit.ok;
//
// Define DB and schema
//
var db = new Dexie('bands-simple', { addons: [dexieRelationships] });
db.version(1).stores({
    genres: "\n            id,\n            name",
    bands: "\n            id,\n            name,\n            genreId -> genres.id",
    albums: "\n            id,\n            name,\n            bandId -> bands.id,\n            year"
});
//
// Populate Database
//
db.on('populate', function () {
    // Genres
    db.genres.bulkAdd([{
            id: 1,
            name: "Rock"
        }, {
            id: 2,
            name: "Schlager"
        }]);
    // Bands
    db.bands.bulkAdd([{
            id: 1,
            name: 'Beatles',
            genreId: 1
        }, {
            id: 2,
            name: 'Abba',
            genreId: 2
        }]);
    // Albums
    db.albums.bulkAdd([{
            id: 1,
            name: 'Abbey Road',
            year: 1969,
            bandId: 1
        }, {
            id: 2,
            name: 'Let It Be',
            year: 1970,
            bandId: 1
        }, {
            id: 3,
            name: 'Super Trouper',
            bandId: 2,
            year: 1980
        }, {
            id: 4,
            name: 'Waterloo',
            bandId: 2,
            year: 1974
        }]);
});
//
// Test Module setup script
//
QUnit.module('dexie-relationships-basics', {
    setup: function () {
        QUnit.stop();
        resetDatabase(db).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).then(function () { return QUnit.start(); });
    }
});
//
// Tests goes here...
//
promisedTest('many-to-one - should be possible to retrieve an entity with a collection of referring entities attached to it', function () { return __awaiter(_this, void 0, void 0, function () {
    var bands, beatles;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.bands.where('name').equals('Beatles').with({
                    albums: 'albums'
                })];
            case 1:
                bands = _a.sent();
                // Assertions
                assert(bands.length == 1, "Should be one Beatles");
                beatles = bands[0];
                assert(!!beatles.albums, "Should have got the foreign albums collection");
                assert(beatles.albums.length === 2, "Should have 2 albums in this db");
                assert(beatles.albums[0].name === "Abbey Road", "First albums should be 'Abbey Roead'");
                assert(beatles.albums[1].name === "Let It Be", "Second album should be 'Let It Be'");
                return [2 /*return*/];
        }
    });
}); });
promisedTest('one-to-one - should be possible to retrieve entity with a foreign key to expand that foreign key', function () { return __awaiter(_this, void 0, void 0, function () {
    var albums, letItBe, waterloo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.albums.where('year').between(1970, 1974, true, true).with({
                    band: 'bandId'
                })];
            case 1:
                albums = _a.sent();
                assert(albums.length === 2, "Should retrieve two albums between 1970 to 1974");
                letItBe = albums[0], waterloo = albums[1];
                assert(letItBe.name === "Let It Be", "First album should be 'Let It Be'");
                assert(!!letItBe.band, "Should get the band resolved with the query");
                assert(letItBe.band.name === "Beatles", "The band should be Beatles");
                assert(waterloo.name === "Waterloo", "Second album should be 'Waterloo'");
                assert(!!waterloo.band, "Should get the band resolved with the query");
                assert(waterloo.band.name === "Abba", "The band should be Abba");
                return [2 /*return*/];
        }
    });
}); });
promisedTest('Multiple foreign keys of different kind - Should be possible to retrieve entities with oneToOne as well as manyToOne relations', function () { return __awaiter(_this, void 0, void 0, function () {
    var bands, beatles;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.bands.where('name').equals('Beatles').with({
                    albums: 'albums',
                    genre: 'genreId'
                })];
            case 1:
                bands = _a.sent();
                assert(bands.length == 1, "Should be one Beatles");
                beatles = bands[0];
                assert(!!beatles.albums, "Should have got the foreign albums collection");
                assert(beatles.albums.length === 2, "Should have 2 albums in this db");
                assert(beatles.albums[0].name === "Abbey Road", "First albums should be 'Abbey Roead'");
                assert(beatles.albums[1].name === "Let It Be", "Second album should be 'Let It Be'");
                assert(!!beatles.genre, "Should have got the foreign genre entity");
                assert(beatles.genre.name === "Rock", "The genre should be 'Rock' (even though that could be questionable)");
                return [2 /*return*/];
        }
    });
}); });
promisedTest('Navigation properties should be non-enumerable', function () { return __awaiter(_this, void 0, void 0, function () {
    var bands, abba;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('should be possible to put back an object to indexedDB after ' +
                    'having retrieved it with navigation properties ' +
                    'without storing the navigation properties redundantly');
                return [4 /*yield*/, db.bands.where('name').equals('Abba').with({ albums: 'albums', genre: 'genreId' })];
            case 1:
                bands = _a.sent();
                assert(bands.length === 1, "Should be one Abba");
                abba = bands[0];
                assert(!!abba.albums, "Abba should have its 'albums' foreign collection");
                assert(!!abba.genre, "Abba should have its 'genre' foreign property");
                abba.customProperty = "Hello world";
                return [4 /*yield*/, db.bands.put(abba)];
            case 2:
                _a.sent();
                abba = db.bands.where('name').equals('Abba').first();
                assert(!abba.albums, "Abba should not have the 'albums' foreign collection stored redundantly");
                assert(!abba.genre, "Abba should not have the 'genre' foreign property stored redundantly");
                return [2 /*return*/];
        }
    });
}); });
promisedTest('Sample from README - should be possible to copy and paste the sample from README', function () { return __awaiter(_this, void 0, void 0, function () {
    var rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.bands
                    .where('name').startsWithAnyOf('A', 'B')
                    .with({ albums: 'albums', genre: 'genreId' })];
            case 1:
                rows = _a.sent();
                assert(true, "Promise resolved and no exception occured");
                // Print the result:
                rows.forEach(function (band) {
                    console.log("Band Name: " + band.name);
                    console.log("Genre: " + band.genre.name);
                    console.log("Albums: " + JSON.stringify(band.albums, null, 4));
                });
                return [2 /*return*/];
        }
    });
}); });

})));
//# sourceMappingURL=test-bundle.js.map
