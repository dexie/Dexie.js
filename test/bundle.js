(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('dexie'), require('QUnit')) :
	typeof define === 'function' && define.amd ? define(['dexie', 'QUnit'], factory) :
	(factory(global.Dexie,global.QUnit));
}(this, (function (Dexie,QUnit) { 'use strict';

var Dexie__default = 'default' in Dexie ? Dexie['default'] : Dexie;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};









function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
}

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
Dexie__default.debug = window.location.search.indexOf('longstacks') !== -1 ? 'dexie' : false;
if (window.location.search.indexOf('longstacks=tests') !== -1)
    Dexie__default.debug = true; // Don't include stuff from dexie.js.
var no_optimize = window.no_optimize || window.location.search.indexOf('dontoptimize') !== -1;
var ArrayBuffer$1 = window.ArrayBuffer;
function stringify(idbKey) {
    var res = '' + (idbKey && idbKey.constructor && idbKey.constructor === ArrayBuffer$1 ?
        new Uint8Array(idbKey) : idbKey);
    return res;
}
function resetDatabase(db) {
    /// <param name="db" type="Dexie"></param>
    var Promise = Dexie__default.Promise;
    return no_optimize || !db._hasBeenCreated ?
        // Full Database recreation. Takes much time!
        db.delete().then(function () {
            return db.open().then(function () {
                if (!no_optimize) {
                    db._hasBeenCreated = true;
                    var initialState = (db._initialState = {});
                    // Now, snapshot the database how it looks like initially (what on.populate did)
                    return db.transaction('r', db.tables, function () {
                        var trans = Dexie__default.currentTransaction;
                        return Promise.all(trans.storeNames.filter(function (tableName) {
                            // Don't clear 'meta tables'
                            return tableName[0] != '_' && tableName[0] != '$';
                        }).map(function (tableName) {
                            var items = {};
                            initialState[tableName] = items;
                            return db.table(tableName).each(function (item, cursor) {
                                items[stringify(cursor.primaryKey)] = { key: cursor.primaryKey, value: item };
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
                var trans = Dexie__default.currentTransaction;
                var initialState = db._initialState;
                return Promise.all(trans.storeNames.filter(function (tableName) {
                    // Don't clear 'meta tables'
                    return tableName[0] != '_' && tableName[0] != '$';
                }).map(function (tableName) {
                    // Read current state
                    var items = {};
                    return db.table(tableName).each(function (item, cursor) {
                        items[stringify(cursor.primaryKey)] = { key: cursor.primaryKey, value: item };
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
                        var keysToDelete = Object.keys(items)
                            .filter(function (key) { return !initialItems[key]; })
                            .map(function (key) { return items[key].key; });
                        if (keysToDelete.length > 0) {
                            return db.table(tableName).bulkDelete(keysToDelete);
                        }
                    });
                }));
            });
}

var isIE = !(window.ActiveXObject) && "ActiveXObject" in window;
var isEdge = /Edge\/\d+/.test(navigator.userAgent);
var hasPolyfillIE = [].slice.call(document.getElementsByTagName("script")).some(function (s) { return s.src.indexOf("idb-iegap") !== -1; });
function supports(features) {
    return features.split('+').reduce(function (result, feature) {
        switch (feature.toLowerCase()) {
            case "compound":
                return result && Array.isArray(Dexie__default.maxKey);
            case "multientry":
                return result && (hasPolyfillIE || (!isIE && !isEdge)); // Should add Safari to
            case "deleteobjectstoreafterread":
                return result && (!isIE && !isEdge);
            case "versionchange":
                return result;
            //return result && (!isIE && !isEdge); // Should add Safari to
            case "binarykeys":
                try {
                    return result && Array.isArray(Dexie__default.maxKey) && indexedDB.cmp(new Uint8Array([1]), new Uint8Array([1])) === 0;
                }
                catch (e) {
                    return false;
                }
            case "domevents":
                return typeof window === 'object' && window.addEventListener;
            default:
                throw new Error("Unknown feature: " + feature);
        }
    }, true);
}
function spawnedTest(name, num, promiseGenerator) {
    if (!promiseGenerator) {
        promiseGenerator = num;
        QUnit.test(name, function (assert) {
            var done = assert.async();
            Dexie__default.spawn(promiseGenerator)
                .catch(function (e) { return QUnit.ok(false, e.stack || e); })
                .then(done);
        });
    }
    else {
        QUnit.test(name, num, function (assert) {
            var done = assert.async();
            Dexie__default.spawn(promiseGenerator)
                .catch(function (e) { return QUnit.ok(false, e.stack || e); })
                .then(done);
        });
    }
}
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

var db = new Dexie__default("TestDBTable");
db.version(1).stores({
    users: "++id,first,last,&username,*&email,*pets",
    folks: "++,first,last",
    schema: "" // Test issue #1039
});
var User = db.users.defineClass({
    id: Number,
    first: String,
    last: String,
    username: String,
    email: [String],
    pets: [String],
});
var idOfFirstUser = 0;
var idOfLastUser = 0;
db.on("populate", function (trans) {
    db.users.add({ first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] }).then(function (id) {
        idOfFirstUser = id;
    });
    db.users.add({ first: "Karl", last: "Faadersköld", username: "kceder", email: ["karl@ceder.what", "dadda@ceder.what"], pets: [] }).then(function (id) {
        idOfLastUser = id;
    });
});
QUnit.module("table", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
    }
});
promisedTest("Issue #841 - put() ignores date changes", function () { return __awaiter(void 0, void 0, void 0, function () {
    var updateAssertions, date1, date2, first1, first2, id, obj;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                updateAssertions = function (mods) {
                    QUnit.equal(mods.first, first2, "first value should be " + first2 + " but is " + mods.first);
                    QUnit.equal(!!mods.date, true, "date should be included in modifications");
                    if (mods.date) {
                        QUnit.equal(mods.date.getTime(), date2.getTime(), "date should be " + date2 + " but is " + mods.date);
                    }
                };
                db.folks.hook("updating", updateAssertions);
                date1 = new Date("2019-05-03");
                date2 = new Date("2020-01-01");
                first1 = "Foo1";
                first2 = "Foo2";
                QUnit.ok(date1.getTime() !== date2.getTime(), "Just verifying input data so that date1 !== date2");
                QUnit.ok(first1 != first2, "first1 different first2");
                return [4 /*yield*/, db.folks.add({ first: first1, last: "Bar", date: date1 })];
            case 1:
                id = _a.sent();
                return [4 /*yield*/, db.folks.get(id)];
            case 2:
                obj = _a.sent();
                QUnit.equal(obj.date.getTime(), date1.getTime(), "Date should first equal date1");
                QUnit.equal(obj.first, first1, "first should be '" + first1 + "'");
                obj.first = first2;
                obj.date = date2;
                return [4 /*yield*/, db.folks.put(obj, id)];
            case 3:
                _a.sent();
                return [4 /*yield*/, db.folks.get(id)];
            case 4:
                obj = _a.sent();
                QUnit.equal(obj.first, first2, "first should have been successfully updated to '" + first2 + "'");
                QUnit.equal(obj.date.getTime(), date2.getTime(), "Date should have been successfully updated to be date2");
                db.folks.hook("updating").unsubscribe(updateAssertions);
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Issue #966 - put() with dotted field in update hook", function () { return __awaiter(void 0, void 0, void 0, function () {
    var updateAssertions, id, obj;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                updateAssertions = function (mods) {
                    QUnit.equal(mods["nested.field"], "value", "mods.nested.field should contain 'value'");
                    QUnit.equal(mods.nested, undefined, "mods.nested field should be empty");
                    return __assign({}, mods);
                };
                db.folks.hook("updating", updateAssertions);
                return [4 /*yield*/, db.folks.add({ first: "first", last: "last" })];
            case 1:
                id = _a.sent();
                return [4 /*yield*/, db.folks.put({ first: "first", last: "last", "nested.field": "value" }, id)];
            case 2:
                _a.sent();
                return [4 /*yield*/, db.folks.get(id)];
            case 3:
                obj = _a.sent();
                QUnit.equal(obj["nested.field"], "value", "obj.nested.field should have been successfully updated to 'value'");
                QUnit.equal(obj.nested, undefined, "obj.nested field should have remained undefined");
                db.folks.hook("updating").unsubscribe(updateAssertions);
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Verify #1130 doesn't break contract of hook('updating')", function () { return __awaiter(void 0, void 0, void 0, function () {
    var updateHook, id, foo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                updateHook = function (mods) {
                    return { "address.postalCode": 111 };
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, , 5, 6]);
                return [4 /*yield*/, db.folks.add({
                        first: "Foo",
                        last: "Bar",
                        address: {
                            city: "Stockholm",
                            street: "Folkungagatan"
                        }
                    })];
            case 2:
                id = _a.sent();
                db.folks.hook("updating", updateHook);
                return [4 /*yield*/, db.folks.update(id, {
                        "address.streetNo": 23
                    })];
            case 3:
                _a.sent();
                return [4 /*yield*/, db.folks.get(id)];
            case 4:
                foo = _a.sent();
                QUnit.equal(foo.address.city, "Stockholm", "Correct city Stockholm");
                QUnit.equal(foo.address.street, "Folkungagatan", "Correct street Folkungagatan");
                QUnit.equal(foo.address.streetNo, 23, "Correct streetNo: 23");
                QUnit.equal(foo.address.postalCode, 111, "Hooks should have added postal code");
                return [3 /*break*/, 6];
            case 5:
                db.folks.hook("updating").unsubscribe(updateHook);
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
QUnit.asyncTest("get", 4, function () {
    db.table("users").get(idOfFirstUser).then(function (obj) {
        QUnit.equal(obj.first, "David", "Got the first object");
        return db.users.get(idOfLastUser);
    }).then(function (obj) {
        QUnit.equal(obj.first, "Karl", "Got the second object");
        return db.users.get("nonexisting key");
    }).then(function (obj) {
        QUnit.ok(true, "Got then() even when getting non-existing object");
        QUnit.equal(obj, undefined, "Result is 'undefined' when not existing");
    }).catch(function (err) {
        QUnit.ok(false, "Error: " + err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("where", function () {
    db.transaction("r", db.users, function () {
        db.users.where("username").equals("kceder").first(function (user) {
            QUnit.equal(user.first, "Karl", "where().equals()");
        }), db.users.where("id").above(idOfFirstUser).toArray(function (a) {
                QUnit.ok(a.length == 1, "where().above()");
            }), db.users.where("id").aboveOrEqual(idOfFirstUser).toArray(function (a) {
                QUnit.ok(a.length == 2, "where().aboveOrEqual()");
            }), db.users.where("id").below(idOfLastUser).count(function (count) {
                QUnit.ok(count == 1, "where().below().count()");
            }), db.users.where("id").below(idOfFirstUser).count(function (count) {
                QUnit.ok(count == 0, "where().below().count() should be zero");
            }), db.users.where("id").belowOrEqual(idOfFirstUser).count(function (count) {
                QUnit.ok(count == 1, "where().belowOrEqual()");
            }), db.users.where("id").between(idOfFirstUser, idOfFirstUser).count(function (count) {
                QUnit.ok(count == 0, "where().between(1, 1)");
            }), db.users.where("id").between(0, Infinity).count(function (count) {
                QUnit.ok(count == 2, "where().between(0, Infinity)");
            }), db.users.where("id").between(idOfFirstUser, idOfFirstUser, true, true).count(function (count) {
                QUnit.ok(count == 1, "where().between(1, 1, true, true)");
            }), db.users.where("id").between(1, -1, true, true).count(function (count) {
                QUnit.ok(count == 0, "where().between(1, -1, true, true)");
            }), db.users.where("id").between(idOfFirstUser, idOfLastUser).count(function (count) {
                QUnit.ok(count == 1, "where().between(1, 2)");
            }), db.users.where("id").between(idOfFirstUser, idOfLastUser, true, true).count(function (count) {
                QUnit.ok(count == 2, "where().between(1, 2, true, true)");
            }), db.users.where("id").between(idOfFirstUser, idOfLastUser, false, false).count(function (count) {
                QUnit.ok(count == 0, "where().between(1, 2, false, false)");
            });
        db.users.where("last").startsWith("Fah").toArray(function (a) {
            QUnit.equal(a.length, 1, "where().startsWith(existing) only matches Fahlander, not Faadersköld");
            QUnit.equal(a[0].first, "David");
        });
        db.users.where("last").startsWith("Faa").toArray(function (a) {
            QUnit.equal(a.length, 1, "where().startsWith(existing) only matches Faadersköld, not Fahlander");
            QUnit.equal(a[0].first, "Karl");
        });
        db.users.where("last").startsWith("Fa").toArray(function (a) {
            QUnit.equal(a.length, 2, "length = 2 on: where().startsWith(2 existing)");
            QUnit.equal(a[0].first, "Karl", "Karl found first on last 'Faadersköld'");
            QUnit.equal(a[1].first, "David", "David found second on last 'Fahlander'");
        });
        db.users.where("last").anyOf("Fahlander", "Faadersköld").toArray(function (a) {
            QUnit.equal(a.length, 2, "in() returned expected number of items");
            QUnit.equal(a[0].last, "Faadersköld", "Faadersköld is first");
        });
        db.users.where("last").anyOf("Fahlander", "Faadersköld").reverse().toArray(function (a) {
            QUnit.equal(a.length, 2, "in().reverse() returned expected number of items");
            QUnit.equal(a[0].last, "Fahlander", "Fahlander is first");
        });
        db.users.where("last").anyOf("Faadersköld").toArray(function (a) {
            QUnit.equal(a.length, 1, "in() returned expected number of items");
        });
        if (supports("multiEntry")) {
            db.users.where("email").equals("david@awarica.com").toArray(function (a) {
                QUnit.equal(a.length, 1, "Finding items from array members. Expect to fail on IE10/IE11.");
            });
            db.users.where("email").startsWith("da").distinct().toArray(function (a) {
                QUnit.equal(a.length, 2, "Found both because both have emails starting with 'da'. Expect to fail on IE10/IE11.");
            });
        }
        else {
            QUnit.ok(true, "SKIPPED - MULTIENTRY UNSUPPORTED");
            QUnit.ok(true, "SKIPPED - MULTIENTRY UNSUPPORTED");
        }
    }).catch(function (e) {
        QUnit.ok(false, "Transaction failed: " + e);
    }).finally(function () {
        QUnit.start();
    });
});
QUnit.asyncTest("count", function () {
    db.users.count(function (count) {
        QUnit.equal(count, 2, "Table.count()");
    }).catch(function (e) {
        QUnit.ok(false, e.message);
    }).finally(function () {
        QUnit.start();
    });
    
});
QUnit.asyncTest("count with limit", function () {
    db.users.limit(1).count(function (count) {
        QUnit.equal(count, 1, "Table.limit().count()");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("limit(),orderBy(),modify(), abort(), reverse()", function () {
    db.transaction("rw", db.users, function () {
        // Modify first found user with a helloMessage
        db.users.orderBy("first").reverse().limit(1).modify(function (user) {
            user.helloMessage = "Hello " + user.first;
        });
        // Check that the modification went fine:
        db.users.orderBy("first").reverse().toArray(function (a) {
            QUnit.equal(a[0].first, "Karl", "First item is Karl");
            QUnit.equal(a[0].helloMessage, "Hello Karl", "Karl got helloMessage 'Hello Karl'");
            QUnit.equal(a[1].first, "David", "Second item is David");
            QUnit.ok(!a[1].helloMessage, "David was not modified due to limit()");
        });
    }).catch(function (e) {
        QUnit.ok(false, "Error: " + e);
    }).finally(function () {
        QUnit.start();
    });
});
QUnit.asyncTest("filter", function () {
    db.users.filter(function (user) { return user.email.indexOf("david@awarica.com") != -1; }).toArray(function (davids) {
        QUnit.equal(1, davids.length, "Got one David");
        QUnit.equal("David", davids[0].first, "The name of the David is David");
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("each", function () {
    var users = [];
    db.users.each(function (user) {
        users.push(user);
    }).then(function () {
        QUnit.equal(users.length, 2, "Got 2 users");
        QUnit.equal(users[0].first, "David", "Got David");
        QUnit.equal(users[1].first, "Karl", "Got Karl");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("put", function () {
    db.transaction("rw", db.users, function () {
        var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };
        db.users.put(newUser).then(function (id) {
            QUnit.ok(id > idOfLastUser, "Got id " + id + " because we didnt supply an id");
            QUnit.equal(newUser.id, id, "The id property of the new user was set");
        });
        db.users.where("username").equals("aper").first(function (user) {
            QUnit.equal(user.last, "Persbrant", "The correct item was actually added");
            user.last = "ChangedLastName";
            var currentId = user.id;
            db.users.put(user).then(function (id) {
                QUnit.equal(id, currentId, "Still got same id because we update same object");
            });
            db.users.where("last").equals("ChangedLastName").first(function (user) {
                QUnit.equal(user.last, "ChangedLastName", "LastName was successfully changed");
            });
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("put-no-transaction", function () {
    var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };
    db.users.put(newUser).then(function (id) {
        QUnit.ok(id > idOfLastUser, "Got id " + id + " because we didnt supply an id");
        QUnit.equal(newUser.id, id, "The id property of the new user was set");
        return db.users.where("username").equals("aper").first(function (user) {
            QUnit.equal(user.last, "Persbrant", "The correct item was actually added");
            user.last = "ChangedLastName";
            var userId = user.id;
            return db.users.put(user).then(function (id) {
                QUnit.equal(id, userId, "Still got same id because we update same object");
                return db.users.where("last").equals("ChangedLastName").first(function (user) {
                    QUnit.equal(user.last, "ChangedLastName", "LastName was successfully changed");
                });
            });
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("add", function () {
    db.transaction("rw", db.users, function () {
        var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };
        db.users.add(newUser).then(function (id) {
            QUnit.ok(id > idOfLastUser, "Got id " + id + " because we didnt supply an id");
            QUnit.equal(newUser.id, id, "The id property of the new user was set");
        });
        db.users.where("username").equals("aper").first(function (user) {
            QUnit.equal(user.last, "Persbrant", "The correct item was actually added");
        });
    }).catch(function (e) {
        QUnit.ok(false, "Error: " + e);
    }).finally(QUnit.start);
});
spawnedTest("bulkAdd", function () {
    var highestKey, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.users.add({ username: "fsdkljfd", email: ["fjkljslk"] })];
            case 1:
                highestKey = _a.sent();
                QUnit.ok(true, "Highest key was: " + highestKey);
                // Delete test item.
                return [4 /*yield*/, db.users.delete(highestKey)];
            case 2:
                // Delete test item.
                _a.sent();
                QUnit.ok(true, "Deleted test item");
                return [4 /*yield*/, db.users.bulkAdd([
                        { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
                        { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }
                    ])];
            case 3:
                result = _a.sent();
                QUnit.equal(result, highestKey + 2, "Result of bulkAdd() operation was equal to highestKey + 2");
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkAdd-all-results", function () {
    var dbBulkAddAll, highestKey, allKeys, expectedKeys, allKeys2, expectedKeys2, allKeys3, lastKey, lastKey, lastKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dbBulkAddAll = new Dexie__default("TestDBTableBulkAddAllResults");
                dbBulkAddAll.version(1).stores({
                    dudes: "++,first,last"
                });
                return [4 /*yield*/, dbBulkAddAll.dudes.add({ username: "fsdkljfd", email: "fjkljslk", find: "bulkAddAll" })];
            case 1:
                highestKey = _a.sent();
                return [4 /*yield*/, dbBulkAddAll.dudes.bulkAdd([
                        { first: "Åke1", last: "Persbrant1", find: "bulkAddAll" },
                        { first: "Åke2", last: "Persbrant2", find: "bulkAddAll" }
                    ], { allKeys: true })];
            case 2:
                allKeys = _a.sent();
                expectedKeys = [highestKey + 1, highestKey + 2];
                deepEqual(allKeys, expectedKeys, "Result of bulkAdd(objects, { allKeys: true }) operation was equal to [highestKey + 1, highestKey + 2]");
                return [4 /*yield*/, dbBulkAddAll.dudes.add({ username: "fsdkljfd", email: "fjkljslk", find: "bulkAddAll" })];
            case 3:
                // should be able to get all keys with options object as third argument
                highestKey = _a.sent();
                return [4 /*yield*/, dbBulkAddAll.dudes.bulkAdd([
                        { first: "Åke1", last: "Persbrant1", find: "bulkAddAll" },
                        { first: "Åke2", last: "Persbrant2", find: "bulkAddAll" }
                    ], undefined, { allKeys: true })];
            case 4:
                allKeys2 = _a.sent();
                expectedKeys2 = [highestKey + 1, highestKey + 2];
                deepEqual(allKeys2, expectedKeys2, "Result of bulkAdd(objects, undefined, { allKeys: true }) operation was equal to [highestKey + 1, highestKey + 2]");
                return [4 /*yield*/, dbBulkAddAll.dudes.bulkAdd([
                        { first: "Åke1", last: "Persbrant1" },
                        { first: "Åke2", last: "Persbrant2" }
                    ], ['sd5fs2df', 'dasfsd3fs7df'], { allKeys: true })];
            case 5:
                allKeys3 = _a.sent();
                deepEqual(allKeys3, ['sd5fs2df', 'dasfsd3fs7df'], "Result of bulkAdd(objects, ['sd5fs2df', 'dasfsd3fs7df'], { allKeys: true }) operation was equal to ['sd5fs2df', 'dasfsd3fs7df']");
                return [4 /*yield*/, dbBulkAddAll.dudes.add({ username: "fsdkljfd", email: "fjkljslk", find: "bulkAddAll" })];
            case 6:
                // should return last key with 1 argument and options: { allKeys: false }
                highestKey = _a.sent();
                return [4 /*yield*/, dbBulkAddAll.dudes.bulkAdd([
                        { first: "Åke1", last: "Persbrant1" },
                        { first: "Åke2", last: "Persbrant2" }
                    ], { allKeys: false })];
            case 7:
                lastKey = _a.sent();
                QUnit.equal(lastKey, highestKey + 2, "Result of bulkAdd(objects, { allKeys: false }) operation was equal to highestKey + 2");
                return [4 /*yield*/, dbBulkAddAll.dudes.bulkAdd([
                        { first: "Åke1", last: "Persbrant1" },
                        { first: "Åke2", last: "Persbrant2" }
                    ], ['cv4btr45fbrt', 'b33vn3fytn'], { allKeys: false })];
            case 8:
                lastKey = _a.sent();
                QUnit.equal(lastKey, 'b33vn3fytn', "Result of bulkAdd(objects, ['cv4btr45fbrt', 'b33vn3fytn'], { allKeys: false }) operation was equal to 'b33vn3fytn'");
                return [4 /*yield*/, dbBulkAddAll.dudes.bulkAdd([
                        { first: "Åke1", last: "Persbrant1" },
                        { first: "Åke2", last: "Persbrant2" }
                    ], ['dfgd2vdfh4d', 'ty1jxdbd9'])];
            case 9:
                lastKey = _a.sent();
                QUnit.equal(lastKey, 'ty1jxdbd9', "Result of bulkAdd(objects, ['dfgd2vdfh4d', 'ty1jxdbd9']) operation was equal to 'ty1jxdbd9'");
                return [4 /*yield*/, dbBulkAddAll.delete()];
            case 10:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkAdd-catching errors", function () {
    var _a, newUsersX, e_1, _b, _c, newUsersY, e_2, _d, newUsersZ, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [4 /*yield*/, db.transaction("rw", db.users, function () {
                    var newUsers = [
                        { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
                        { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
                        { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
                        { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }
                    ];
                    db.users.bulkAdd(newUsers).then(function () {
                        QUnit.ok(false, "Should not resolve when one operation failed");
                    }).catch(Dexie__default.BulkError, function (e) {
                        QUnit.ok(true, "Got BulkError: " + e.message);
                        QUnit.equal(e.failures.length, 1, "One error due to a duplicate username: " + e.failures[0]);
                    });
                    // Now, since we catched the error, the transaction should continue living.
                    db.users.where("username").startsWith("aper").count(function (count) {
                        QUnit.equal(count, 3, "Got three matches now when users are bulk-added");
                    });
                })];
            case 1:
                _f.sent();
                _a = QUnit.equal;
                return [4 /*yield*/, db.users.where("username").startsWith('aper').count()];
            case 2:
                _a.apply(void 0, [_f.sent(), 3, "Previous transaction committed"]);
                newUsersX = [
                    { first: "Xke1", last: "Persbrant1", username: "xper1", email: ["xper1@persbrant.net"] },
                    { first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"] },
                    { first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"] },
                    { first: "Xke3", last: "Persbrant3", username: "xper3", email: ["xper3@persbrant.net"] }
                ];
                _f.label = 3;
            case 3:
                _f.trys.push([3, 5, , 6]);
                return [4 /*yield*/, db.transaction("rw", db.users, function () {
                        db.users.bulkAdd(newUsersX).then(function () {
                            QUnit.ok(false, "Should not resolve");
                        });
                    })];
            case 4:
                _f.sent();
                QUnit.ok(false, "Should not come here");
                return [3 /*break*/, 6];
            case 5:
                e_1 = _f.sent();
                QUnit.ok(true, "Got: " + e_1);
                return [3 /*break*/, 6];
            case 6:
                _b = QUnit.equal;
                return [4 /*yield*/, db.users.where('username').startsWith('xper').count()];
            case 7:
                _b.apply(void 0, [_f.sent(), 0, "0 users! Good, means that previous transaction did not commit"]);
                return [4 /*yield*/, db.users.bulkAdd(newUsersX).catch(function (e) {
                        QUnit.ok(true, "Got error. Catching it should make the successors work.");
                    })];
            case 8:
                _f.sent();
                _c = QUnit.equal;
                return [4 /*yield*/, db.users.where('username').startsWith('xper').count()];
            case 9:
                _c.apply(void 0, [_f.sent(), 3, "3 users! Good - means that previous operation catched and therefore committed"]);
                newUsersY = [
                    { first: "Yke1", last: "Persbrant1", username: "yper1", email: ["yper1@persbrant.net"] },
                    { first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"] },
                    { first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"] },
                    { first: "Yke3", last: "Persbrant3", username: "yper3", email: ["yper3@persbrant.net"] }
                ];
                _f.label = 10;
            case 10:
                _f.trys.push([10, 12, , 13]);
                return [4 /*yield*/, db.users.bulkAdd(newUsersY)];
            case 11:
                _f.sent();
                return [3 /*break*/, 13];
            case 12:
                e_2 = _f.sent();
                QUnit.ok(true, "Got: " + e_2);
                return [3 /*break*/, 13];
            case 13:
                _d = QUnit.equal;
                return [4 /*yield*/, db.users.where('username').startsWith('yper').count()];
            case 14:
                _d.apply(void 0, [_f.sent(), 3, "3 users! Good - means that previous operation catched (via try..yield..catch this time, and therefore committed"]);
                newUsersZ = [
                    { first: "Zke1", last: "Persbrant1", username: "zper1", email: ["zper1@persbrant.net"] },
                    { first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"] },
                    { first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"] },
                    { first: "Zke3", last: "Persbrant3", username: "zper3", email: ["zper3@persbrant.net"] }
                ];
                return [4 /*yield*/, db.transaction('rw', db.users, function () {
                        var e_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, db.users.bulkAdd(newUsersZ)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_3 = _a.sent();
                                    throw e_3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }).catch(Dexie__default.BulkError, function (e) {
                        QUnit.ok(true, "Got rethrown BulkError: " + e.stack);
                    })];
            case 15:
                _f.sent();
                _e = QUnit.equal;
                return [4 /*yield*/, db.users.where('username').startsWith('zper').count()];
            case 16:
                _e.apply(void 0, [_f.sent(), 0, "0 users! Good - means that previous operation rethrown (via try..yield..catch--throw this time, and therefore not committed"]);
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkAdd-non-inbound-autoincrement", function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, db.folks.bulkAdd([
                    { first: "Foo", last: "Bar" },
                    { first: "Foo", last: "Bar2" },
                    { first: "Foo", last: "Bar3" },
                    { first: "Foo", last: "Bar4" }
                ])];
            case 1:
                _c.sent();
                _a = QUnit.equal;
                return [4 /*yield*/, db.folks.where('first').equals('Foo').count()];
            case 2:
                _a.apply(void 0, [_c.sent(), 4, "Should be 4 Foos"]);
                _b = QUnit.equal;
                return [4 /*yield*/, db.folks.where('last').equals('Bar').count()];
            case 3:
                _b.apply(void 0, [_c.sent(), 1, "Shoudl be 1 Bar"]);
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkAdd-catch sub transaction", function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, db.transaction('rw', db.users, function () {
                    var newUsers = [
                        { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
                        { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
                        { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
                        { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }
                    ];
                    db.transaction('rw', db.users, function () {
                        db.users.bulkAdd(newUsers);
                    }).then(function () {
                        QUnit.ok(false, "Should not succeed with all these operations");
                    }).catch(function (e) {
                        QUnit.equal(e.failures.length, 1, "Should get one failure");
                    });
                }).catch(function (e) {
                    QUnit.ok(true, "Outer transaction aborted due to inner transaction abort. This is ok: " + e);
                })];
            case 1:
                _b.sent();
                _a = QUnit.equal;
                return [4 /*yield*/, db.users.where('username').startsWith('aper').count()];
            case 2:
                _a.apply(void 0, [_b.sent(), 0, "0 users! Good, means that inner transaction did not commit"]);
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkPut", function () {
    var highestKey, existingFirstUserToReplace, result, ourAddedUsers, replacedDfahlander;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.users.add({ username: "fsdkljfd", email: ["fjkljslk"] })];
            case 1:
                highestKey = _a.sent();
                QUnit.ok(true, "Highest key was: " + highestKey);
                // Delete test item.
                return [4 /*yield*/, db.users.delete(highestKey)];
            case 2:
                // Delete test item.
                _a.sent();
                QUnit.ok(true, "Deleted test item");
                return [4 /*yield*/, db.users.get(idOfFirstUser)];
            case 3:
                existingFirstUserToReplace = _a.sent();
                QUnit.equal(existingFirstUserToReplace.username, "dfahlander", "Existing user should be dfahlander");
                return [4 /*yield*/, db.users.bulkPut([
                        { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
                        { id: idOfFirstUser, first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
                        { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }
                    ])];
            case 4:
                result = _a.sent();
                QUnit.equal(result, highestKey + 2, "Result of bulkPut() operation was equal to highestKey + 2");
                return [4 /*yield*/, db.users.where('username').startsWith("aper").toArray()];
            case 5:
                ourAddedUsers = _a.sent();
                QUnit.equal(ourAddedUsers.length, 3, "Should have put 3 users there (two additions and one replaced");
                return [4 /*yield*/, db.users.get(idOfFirstUser)];
            case 6:
                replacedDfahlander = _a.sent();
                QUnit.equal(replacedDfahlander.username, "aper2", "dfahlander Should now be aper2 instead");
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkPut-all-results", function () {
    var dbBulkPutAll, highestKey, allKeys, ourAddedUsers, replacedRecord, allKeys2, ourAddedUsers2, replacedRecord2, allKeys3, ourAddedUsers3, replacedRecord3, lastKey, lastKey, lastKey;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dbBulkPutAll = new Dexie__default("TestDBTableBulkPutAllResults");
                dbBulkPutAll.version(1).stores({
                    users: "++id,first,last,find",
                    mates: "++id,first,last,find",
                    dudes: "++,first,last,find",
                });
                return [4 /*yield*/, dbBulkPutAll.users.add({ first: "fsdkljfd", last: "fjkljslk", find: "bulkPutAll" })];
            case 1:
                highestKey = _a.sent();
                return [4 /*yield*/, dbBulkPutAll.users.bulkPut([
                        { first: "Åke1", last: "Persbrant1", find: "bulkPutAll" },
                        { id: highestKey, first: "Åke2", last: "Persbrant2", find: "bulkPutAll" },
                        { first: "Åke3", last: "Persbrant3", find: "bulkPutAll" }
                    ], { allKeys: true })];
            case 2:
                allKeys = _a.sent();
                deepEqual(allKeys, [highestKey + 1, highestKey, highestKey + 2], "Result of bulkAdd(objects, { allKeys: true }) operation was equal to [highestKey + 1, highestKey, highestKey + 2]");
                return [4 /*yield*/, dbBulkPutAll.users.where('find').startsWith("bulkPutAll").toArray()];
            case 3:
                ourAddedUsers = _a.sent();
                QUnit.equal(ourAddedUsers.length, 3, "Should have put 3 users there (two additions and one replaced");
                return [4 /*yield*/, dbBulkPutAll.users.get(highestKey)];
            case 4:
                replacedRecord = _a.sent();
                QUnit.equal(replacedRecord.last, "Persbrant2", "fjkljslk should now be Persbrant2 instead");
                return [4 /*yield*/, dbBulkPutAll.mates.add({ first: "fsdkljfd", last: "fjkljslk", find: "bulkPutAll" })];
            case 5:
                // should be able to get all keys with options object as third argument (mates)
                highestKey = _a.sent();
                return [4 /*yield*/, dbBulkPutAll.mates.bulkPut([
                        { first: "Åke1", last: "Persbrant1", find: "bulkPutAll" },
                        { id: highestKey, first: "Åke2", last: "Persbrant2", find: "bulkPutAll" },
                        { first: "Åke3", last: "Persbrant3", find: "bulkPutAll" }
                    ], undefined, { allKeys: true })];
            case 6:
                allKeys2 = _a.sent();
                deepEqual(allKeys2, [highestKey + 1, highestKey, highestKey + 2], "Result of bulkPut(objects, undefined, { allKeys: true }) operation was equal to [highestKey + 1, highestKey, highestKey + 2]");
                return [4 /*yield*/, dbBulkPutAll.mates.where('find').startsWith("bulkPutAll").toArray()];
            case 7:
                ourAddedUsers2 = _a.sent();
                QUnit.equal(ourAddedUsers2.length, 3, "Should have put 3 users there (two additions and one replaced");
                return [4 /*yield*/, dbBulkPutAll.mates.get(highestKey)];
            case 8:
                replacedRecord2 = _a.sent();
                QUnit.equal(replacedRecord2.last, "Persbrant2", "fjkljslk should now be Persbrant2 instead");
                return [4 /*yield*/, dbBulkPutAll.dudes.add({ first: "fsdkljfd", last: "fjkljslk", find: "bulkPutAll" })];
            case 9:
                // should be able to get all keys with options object as third argument with keys array (dudes)
                highestKey = _a.sent();
                return [4 /*yield*/, dbBulkPutAll.dudes.bulkPut([
                        { first: "Åke1", last: "Persbrant1", find: "bulkPutAll" },
                        { id: highestKey, first: "Åke2", last: "Persbrant2", find: "bulkPutAll" },
                        { first: "Åke3", last: "Persbrant3", find: "bulkPutAll" }
                    ], ['sd5fs2df', highestKey, 'dasfsd3fs7df'], { allKeys: true })];
            case 10:
                allKeys3 = _a.sent();
                deepEqual(allKeys3, ['sd5fs2df', highestKey, 'dasfsd3fs7df'], "Result of bulkPut(objects, ['sd5fs2df', highestKey, 'dasfsd3fs7df'], { allKeys: true }) operation was equal to ['sd5fs2df', highestKey, 'dasfsd3fs7df']");
                return [4 /*yield*/, dbBulkPutAll.dudes.where('find').startsWith("bulkPutAll").toArray()];
            case 11:
                ourAddedUsers3 = _a.sent();
                QUnit.equal(ourAddedUsers3.length, 3, "Should have put 3 users there (two additions and one replaced");
                return [4 /*yield*/, dbBulkPutAll.dudes.get(highestKey)];
            case 12:
                replacedRecord3 = _a.sent();
                QUnit.equal(replacedRecord3.last, "Persbrant2", "fjkljslk should now be Persbrant2 instead");
                return [4 /*yield*/, dbBulkPutAll.dudes.add({ username: "fsdkljfd", email: "fjkljslk", find: "bulkAddAll" })];
            case 13:
                // should return last key with 1 argument and options: { allKeys: false }
                highestKey = _a.sent();
                return [4 /*yield*/, dbBulkPutAll.dudes.bulkAdd([
                        { first: "Åke1", last: "Persbrant1" },
                        { first: "Åke2", last: "Persbrant2" }
                    ], { allKeys: false })];
            case 14:
                lastKey = _a.sent();
                QUnit.equal(lastKey, highestKey + 2, "Result of bulkAdd(objects, { allKeys: false }) operation was equal to highestKey + 2");
                return [4 /*yield*/, dbBulkPutAll.dudes.bulkAdd([
                        { first: "Åke1", last: "Persbrant1" },
                        { first: "Åke2", last: "Persbrant2" }
                    ], ['cv4btr45fbrt', 'b33vn3fytn'], { allKeys: false })];
            case 15:
                lastKey = _a.sent();
                QUnit.equal(lastKey, 'b33vn3fytn', "Result of bulkAdd(objects, ['cv4btr45fbrt', 'b33vn3fytn'], { allKeys: false }) operation was equal to 'b33vn3fytn'");
                return [4 /*yield*/, dbBulkPutAll.dudes.bulkAdd([
                        { first: "Åke1", last: "Persbrant1" },
                        { first: "Åke2", last: "Persbrant2" }
                    ], ['dfgd2vdfh4d', 'ty1jxdbd9'])];
            case 16:
                lastKey = _a.sent();
                QUnit.equal(lastKey, 'ty1jxdbd9', "Result of bulkAdd(objects, ['dfgd2vdfh4d', 'ty1jxdbd9']) operation was equal to 'ty1jxdbd9'");
                return [4 /*yield*/, dbBulkPutAll.delete()];
            case 17:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkPut with overlapping objects", function () {
    var theOne;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.users.bulkPut([{
                        id: "sdjls83",
                        first: "Daveious"
                    }, {
                        id: "sdjls83",
                        last: "Olvono"
                    }])];
            case 1:
                _a.sent();
                return [4 /*yield*/, db.users.get("sdjls83")];
            case 2:
                theOne = _a.sent();
                QUnit.equal(theOne.last, "Olvono", "Last item is the one inserted");
                QUnit.ok(theOne.first === undefined, "Object doesnt have a first property");
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkPut-catching errors", function () {
    var _a, newUsersX, e_4, _b, _c, newUsersY, e_5, _d, newUsersZ, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0: return [4 /*yield*/, db.transaction("rw", db.users, function () {
                    var newUsers = [
                        { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
                        { id: idOfLastUser, first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
                        { id: idOfFirstUser, first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
                        { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
                        { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }
                    ];
                    db.users.bulkPut(newUsers).then(function () {
                        QUnit.ok(false, "Should not resolve when one operation failed");
                    }).catch(Dexie__default.BulkError, function (e) {
                        QUnit.ok(true, "Got BulkError: " + e.message);
                        QUnit.equal(e.failures.length, 2, "Two errors due to a duplicate username: " + e.failures[0]);
                    });
                    // Now, since we catched the error, the transaction should continue living.
                    db.users.where("username").startsWith("aper").count(function (count) {
                        QUnit.equal(count, 3, "Got three matches now when users are bulk-putted");
                    });
                })];
            case 1:
                _f.sent();
                _a = QUnit.equal;
                return [4 /*yield*/, db.users.where("username").startsWith('aper').count()];
            case 2:
                _a.apply(void 0, [_f.sent(), 3, "Previous transaction committed"]);
                newUsersX = [
                    { first: "Xke1", last: "Persbrant1", username: "xper1", email: ["xper1@persbrant.net"] },
                    { id: idOfLastUser, first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"] },
                    { first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"] },
                    { id: idOfFirstUser, first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"] },
                    { first: "Xke3", last: "Persbrant3", username: "xper3", email: ["xper3@persbrant.net"] }
                ];
                _f.label = 3;
            case 3:
                _f.trys.push([3, 5, , 6]);
                return [4 /*yield*/, db.transaction("rw", db.users, function () {
                        db.users.bulkPut(newUsersX).then(function () {
                            QUnit.ok(false, "Should not resolve");
                        });
                    })];
            case 4:
                _f.sent();
                QUnit.ok(false, "Should not come here");
                return [3 /*break*/, 6];
            case 5:
                e_4 = _f.sent();
                QUnit.ok(true, "Got: " + e_4);
                return [3 /*break*/, 6];
            case 6:
                _b = QUnit.equal;
                return [4 /*yield*/, db.users.where('username').startsWith('xper').count()];
            case 7:
                _b.apply(void 0, [_f.sent(), 0, "0 users! Good, means that previous transaction did not commit"]);
                return [4 /*yield*/, db.users.bulkPut(newUsersX).catch(function (e) {
                        QUnit.ok(true, "Got error. Catching it should make the successors work.");
                    })];
            case 8:
                _f.sent();
                _c = QUnit.equal;
                return [4 /*yield*/, db.users.where('username').startsWith('xper').count()];
            case 9:
                _c.apply(void 0, [_f.sent(), 3,
                    "Should count to 3 users because previous operation was catched and therefore should have been committed"]);
                newUsersY = [
                    { first: "Yke1", last: "Persbrant1", username: "yper1", email: ["yper1@persbrant.net"] },
                    { first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"] },
                    { id: idOfFirstUser, first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"] },
                    { first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"] },
                    { first: "Yke3", last: "Persbrant3", username: "yper3", email: ["yper3@persbrant.net"] }
                ];
                _f.label = 10;
            case 10:
                _f.trys.push([10, 12, , 13]);
                return [4 /*yield*/, db.users.bulkPut(newUsersY)];
            case 11:
                _f.sent();
                return [3 /*break*/, 13];
            case 12:
                e_5 = _f.sent();
                QUnit.ok(true, "Got: " + e_5);
                return [3 /*break*/, 13];
            case 13:
                _d = QUnit.equal;
                return [4 /*yield*/, db.users.where('username').startsWith('yper').count()];
            case 14:
                _d.apply(void 0, [_f.sent(), 3,
                    "Should count to 3 users because previous previous operation catched (via try..yield..catch this time, and therefore should have been committed"]);
                newUsersZ = [
                    { first: "Zke1", last: "Persbrant1", username: "zper1", email: ["zper1@persbrant.net"] },
                    { first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"] },
                    { first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"] },
                    { id: idOfLastUser, first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"] },
                    { first: "Zke3", last: "Persbrant3", username: "zper3", email: ["zper3@persbrant.net"] }
                ];
                return [4 /*yield*/, db.transaction('rw', db.users, function () {
                        var e_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, db.users.bulkPut(newUsersZ)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_6 = _a.sent();
                                    throw e_6;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }).catch(Dexie__default.BulkError, function (e) {
                        QUnit.ok(true, "Got rethrown BulkError: " + e.stack);
                    })];
            case 15:
                _f.sent();
                _e = QUnit.equal;
                return [4 /*yield*/, db.users.where('username').startsWith('zper').count()];
            case 16:
                _e.apply(void 0, [_f.sent(), 0, "0 users! Good - means that previous operation rethrown (via try..yield..catch--throw this time, and therefore not committed"]);
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkPut-non-inbound-autoincrement", function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, db.folks.bulkPut([
                    { first: "Foo", last: "Bar" },
                    { first: "Foo", last: "Bar2" },
                    { first: "Foo", last: "Bar3" },
                    { first: "Foo", last: "Bar4" }
                ])];
            case 1:
                _c.sent();
                _a = QUnit.equal;
                return [4 /*yield*/, db.folks.where('first').equals('Foo').count()];
            case 2:
                _a.apply(void 0, [_c.sent(), 4, "Should be 4 Foos"]);
                _b = QUnit.equal;
                return [4 /*yield*/, db.folks.where('last').equals('Bar').count()];
            case 3:
                _b.apply(void 0, [_c.sent(), 1, "Should be 1 Bar"]);
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkPut - mixed inbound autoIncrement", function () {
    var lastId, _a, _b, newLastId, _c, _d, foo2s;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, db.users.bulkPut([
                    { first: "Foo", last: "Bar" },
                    { first: "Foo", last: "Bar2" },
                    { first: "Foo", last: "Bar3" },
                    { first: "Foo", last: "Bar4" }
                ])];
            case 1:
                lastId = _e.sent();
                _a = QUnit.equal;
                return [4 /*yield*/, db.users.where('first').equals('Foo').count()];
            case 2:
                _a.apply(void 0, [_e.sent(), 4, "Should be 4 Foos"]);
                _b = QUnit.equal;
                return [4 /*yield*/, db.users.where('last').equals('Bar').count()];
            case 3:
                _b.apply(void 0, [_e.sent(), 1, "Should be 1 Bar"]);
                return [4 /*yield*/, db.users.bulkPut([
                        { id: lastId - 3, first: "Foo2", last: "BarA" },
                        { first: "Foo2", last: "BarB" },
                        { id: lastId - 1, first: "Foo2", last: "BarC" },
                        { first: "Foo2", last: "BarD" } // Will create
                    ])];
            case 4:
                newLastId = _e.sent();
                QUnit.equal(newLastId, lastId + 2, "Should have incremented last ID twice now");
                _c = QUnit.equal;
                return [4 /*yield*/, db.users.where('first').equals('Foo').count()];
            case 5:
                _c.apply(void 0, [_e.sent(), 2, "Should be 2 Foos now"]);
                _d = QUnit.equal;
                return [4 /*yield*/, db.users.where('first').equals('Foo2').count()];
            case 6:
                _d.apply(void 0, [_e.sent(), 4, "Should be 4 Foo2s now"]);
                return [4 /*yield*/, db.users.where('first').equals('Foo2').toArray()];
            case 7:
                foo2s = _e.sent();
                QUnit.equal(foo2s[0].last, "BarA", "BarA should be first (updated previous ID)");
                QUnit.equal(foo2s[1].last, "BarC", "BarC should be second (updated previous ID");
                QUnit.equal(foo2s[2].last, "BarB", "BarB should be third (got new key)");
                QUnit.equal(foo2s[3].last, "BarD", "BarD should be forth (got new key)");
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkPut-catch sub transaction", function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, db.transaction('rw', db.users, function () {
                    var newUsers = [
                        { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
                        { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
                        { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
                        { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }
                    ];
                    db.transaction('rw', db.users, function () {
                        db.users.bulkPut(newUsers);
                    }).then(function () {
                        QUnit.ok(false, "Should not succeed with all these operations");
                    }).catch(function (e) {
                        QUnit.equal(e.failures.length, 1, "Should get one failure");
                    });
                }).catch(function (e) {
                    QUnit.ok(true, "Outer transaction aborted due to inner transaction abort. This is ok: " + e);
                })];
            case 1:
                _b.sent();
                _a = QUnit.equal;
                return [4 /*yield*/, db.users.where('username').startsWith('aper').count()];
            case 2:
                _a.apply(void 0, [_b.sent(), 0, "0 users! Good, means that inner transaction did not commit"]);
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkDelete", function () {
    var userKeys, userCount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.users.orderBy('id').keys()];
            case 1:
                userKeys = _a.sent();
                QUnit.ok(userKeys.length > 0, "User keys found: " + userKeys.join(','));
                return [4 /*yield*/, db.users.bulkDelete(userKeys)];
            case 2:
                _a.sent();
                return [4 /*yield*/, db.users.count()];
            case 3:
                userCount = _a.sent();
                QUnit.equal(userCount, 0, "Should be no users there now");
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkDelete - nonexisting keys", function () {
    var userKeys, _a, userCount;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = ["nonexisting1", "nonexisting2"];
                return [4 /*yield*/, db.users.orderBy(':id').lastKey()];
            case 1:
                userKeys = _a.concat([_b.sent()]);
                return [4 /*yield*/, db.users.bulkDelete(userKeys)];
            case 2:
                _b.sent();
                return [4 /*yield*/, db.users.count()];
            case 3:
                userCount = _b.sent();
                QUnit.equal(userCount, 1, "Should be one user there now. (the other should have been deleted)");
                return [2 /*return*/];
        }
    });
});
spawnedTest("bulkDelete-faulty-key", function () {
    var userKeys;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userKeys = [{ faulty: "ohyes" }];
                return [4 /*yield*/, db.users.bulkDelete(userKeys).then(function () {
                        QUnit.ok(false, "Should not succeed");
                    }).catch('DataError', function (e) {
                        QUnit.ok(true, "Should get error: " + e);
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
QUnit.asyncTest("delete", function () {
    // Without transaction
    db.users.get(idOfFirstUser, function (user) {
        notEqual(user, null, "User with id 1 exists");
    }).then(function () {
        db.users.delete(1).then(function () {
            db.users.get(1, function (user) {
                QUnit.equal(user, null, "User not found anymore");
                QUnit.start();
            });
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
        QUnit.start();
    });
});
QUnit.asyncTest("delete(using transaction)", function () {
    // With transaction
    db.transaction("rw", db.users, function () {
        db.users.get(idOfFirstUser, function (user) {
            notEqual(user, null, "User with id 1 exists");
        });
        db.users.delete(idOfFirstUser);
        db.users.get(idOfFirstUser, function (user) {
            QUnit.equal(user, null, "User not found anymore");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("delete nonexisting item", 3, function () {
    var numUsers;
    db.users.count().then(function (count) {
        numUsers = count;
        QUnit.ok(true, "Number of users before delete: " + count);
    }).then(function () {
        return db.users.delete("nonexisting key");
    }).then(function () {
        QUnit.ok(true, "Success even though nothing was deleted");
    }).then(function () {
        return db.users.count();
    }).then(function (count) {
        QUnit.equal(numUsers, count, "Just verifying number of items in user table is still same");
    }).catch(function (err) {
        QUnit.ok(false, "Got error: " + err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("clear", function () {
    db.transaction("rw", "users", function () {
        db.users.count(function (count) {
            QUnit.equal(count, 2, "There are 2 items in database before clearing it");
        });
        db.users.clear();
        db.users.count(function (count) {
            QUnit.equal(count, 0, "There are 0 items in database after it has been cleared");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
spawnedTest("failReadonly", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.transaction('r', 'users', function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db.users.bulkAdd([{ first: "Foo", last: "Bar" }])];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }).then(function () {
                    QUnit.ok(false, "Should not happen");
                }).catch('ReadOnlyError', function (e) {
                    QUnit.ok(true, "Got ReadOnlyError: " + e.stack);
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("failNotIncludedStore", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.transaction('rw', 'folks', function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db.users.bulkAdd([{ first: "Foo", last: "Bar" }])];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }).then(function () {
                    QUnit.ok(false, "Should not happen");
                }).catch('NotFoundError', function (e) {
                    QUnit.ok(true, "Got NotFoundError: " + e.stack);
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
QUnit.asyncTest("failNotIncludedStoreTrans", function () {
    db.transaction('rw', 'foodassaddas', function () {
    }).then(function () {
        QUnit.ok(false, "Should not happen");
    }).catch('NotFoundError', function (e) {
        QUnit.ok(true, "Got NotFoundError: " + e.stack);
    }).catch(function (e) {
        QUnit.ok(false, "Oops: " + e.stack);
    }).then(QUnit.start);
});
// Must use this rather than QUnit's deepEqual() because that one fails on Safari when run via karma-browserstack-launcher
function deepEqual(a, b, description) {
    QUnit.equal(JSON.stringify(a, null, 2), JSON.stringify(b, null, 2), description);
}
promisedTest("bulkGet()", function () { return __awaiter(void 0, void 0, void 0, function () {
    var bulkData, i, keys, retrieved, _a, u1, u2, u3, u4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                bulkData = [];
                for (i = 0; i < 400; ++i) {
                    bulkData.push({ id: i, first: "Foo" + i, last: "Bar" + i });
                }
                QUnit.ok("Putting " + bulkData.length + " users into the table");
                return [4 /*yield*/, db.users.bulkPut(bulkData)];
            case 1:
                _b.sent();
                QUnit.ok("Done putting users. Now getting them using bulkGet()");
                keys = bulkData.map(function (_a) {
                    var id = _a.id;
                    return id;
                });
                return [4 /*yield*/, db.users.bulkGet(keys)];
            case 2:
                retrieved = _b.sent();
                deepEqual(retrieved, bulkData, "Put and retrieved should be the same");
                QUnit.ok("Now validating that is should be possible to request nonexisting keys but yet get all results in the order of the given keys");
                return [4 /*yield*/, db.users.bulkGet(["x", "y", 100, "z"])];
            case 3:
                _a = _b.sent(), u1 = _a[0], u2 = _a[1], u3 = _a[2], u4 = _a[3];
                QUnit.ok(u1 === undefined, "First result should be undefined, as there where no object with that key");
                QUnit.ok(u2 === undefined, "Second objects -''-");
                QUnit.ok(u3 && u3.first === 'Foo100', "Third should be Foo100");
                QUnit.ok(u4 === undefined, "Forth should be undefined");
                return [2 /*return*/];
        }
    });
}); });

var db$1 = new Dexie__default("TestDBCollection");
db$1.version(1).stores({ users: "id,first,last,&username,*&email,*pets" });
var User$1 = db$1.users.defineClass({
    id: Number,
    first: String,
    last: String,
    username: String,
    email: [String],
    pets: [String],
});
db$1.on("populate", function () {
    db$1.users.add({ id: 1, first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
    db$1.users.add({ id: 2, first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
});
QUnit.module("collection", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db$1).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
    }
});
spawnedTest("and with values", function () {
    var array;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db$1.users.where("last").inAnyRange([["a", "g"], ["A", "G"]])
                    .and(function (user) { return user.username === "dfahlander"; })
                    .toArray()];
            case 1:
                array = _a.sent();
                QUnit.equal(array.length, 1, "Should find one user with given criteria");
                return [2 /*return*/];
        }
    });
});
spawnedTest("and with keys", function () {
    var keys;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db$1.users.where("last").inAnyRange([["a", "g"], ["A", "G"]])
                    .and(function (user) { return user.username === "dfahlander"; })
                    .keys()];
            case 1:
                keys = _a.sent();
                QUnit.equal(keys.length, 1, "Should find one user with given criteria");
                return [2 /*return*/];
        }
    });
});
spawnedTest("and with delete", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db$1.users.orderBy('username')
                    .and(function (u) { return QUnit.ok(!!u, "User should exist here"); })
                    .delete()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
QUnit.asyncTest("each", 3, function () {
    var array = [];
    db$1.users.orderBy("id").each(function (user) {
        array.push(user);
    }).then(function () {
        QUnit.equal(array.length, 2, "Got two users");
        QUnit.equal(array[0].first, "David", "First is David");
        QUnit.equal(array[1].first, "Karl", "Second is Karl");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("count", 1, function () {
    db$1.users.count(function (count) {
        QUnit.equal(count, 2, "Two objects in table");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("toArray", 3, function () {
    db$1.users.orderBy("last").toArray(function (a) {
        QUnit.equal(a.length, 2, "Array length is 2");
        QUnit.equal(a[0].first, "Karl", "First is Karl");
        QUnit.equal(a[1].first, "David", "Second is David");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("limit", 6, function () {
    db$1.transaction("r", db$1.users, function () {
        db$1.users.orderBy("last").limit(1).toArray(function (a) {
            QUnit.equal(a.length, 1, "Array length is 1");
            QUnit.equal(a[0].first, "Karl", "First is Karl");
        });
        db$1.users.orderBy("last").limit(10).toArray(function (a) {
            QUnit.equal(a.length, 2, "Array length is 2");
        });
        db$1.users.orderBy("last").limit(0).toArray(function (a) {
            QUnit.equal(a.length, 0, "Array length is 0");
        });
        db$1.users.orderBy("last").limit(-1).toArray(function (a) {
            QUnit.equal(a.length, 0, "Array length is 0");
        });
        db$1.users.orderBy("id").limit(-1).toArray(function (a) {
            QUnit.equal(a.length, 0, "Array length is 0");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("offset().limit() with advanced combinations", 22, function () {
    db$1.transaction("rw", db$1.users, function () {
        for (var i = 0; i < 10; ++i) {
            db$1.users.add({ id: 3 + i, first: "First" + i, last: "Last" + i, username: "user" + i, email: ["user" + i + "@abc.se"] });
        }
        // Using algorithm + count()
        db$1.users.where("first").startsWithIgnoreCase("first").count(function (count) {
            QUnit.equal(count, 10, "Counting all 10");
        });
        db$1.users.where("first").startsWithIgnoreCase("first").limit(5).count(function (count) {
            QUnit.equal(count, 5, "algorithm + count(): limit(5).count()");
        });
        db$1.users.where("first").startsWithIgnoreCase("first").offset(7).count(function (count) {
            QUnit.equal(count, 3, "algorithm + count(): offset(7).count()");
        });
        db$1.users.where("first").startsWithIgnoreCase("first").offset(6).limit(4).count(function (count) {
            QUnit.equal(count, 4, "algorithm + count(): offset(6).limit(4)");
        });
        db$1.users.where("first").startsWithIgnoreCase("first").offset(7).limit(4).count(function (count) {
            QUnit.equal(count, 3, "algorithm + count(): offset(7).limit(4)");
        });
        db$1.users.where("first").startsWithIgnoreCase("first").offset(17).limit(4).count(function (count) {
            QUnit.equal(count, 0, "algorithm + count(): offset(17).limit(4)");
        });
        // Using algorithm + toArray()
        db$1.users.where("first").startsWithIgnoreCase("first").limit(5).toArray(function (a) {
            QUnit.equal(a.length, 5, "algorithm + toArray(): limit(5)");
        });
        db$1.users.where("first").startsWithIgnoreCase("first").offset(7).toArray(function (a) {
            QUnit.equal(a.length, 3, "algorithm + toArray(): offset(7)");
        });
        db$1.users.where("first").startsWithIgnoreCase("first").offset(6).limit(4).toArray(function (a) {
            QUnit.equal(a.length, 4, "algorithm + toArray(): offset(6).limit(4)");
        });
        db$1.users.where("first").startsWithIgnoreCase("first").offset(7).limit(4).toArray(function (a) {
            QUnit.equal(a.length, 3, "algorithm + toArray(): offset(7).limit(4)");
        });
        db$1.users.where("first").startsWithIgnoreCase("first").offset(17).limit(4).toArray(function (a) {
            QUnit.equal(a.length, 0, "algorithm + toArray(): offset(17).limit(4)");
        });
        // Using IDBKeyRange + count()
        db$1.users.where("first").startsWith("First").count(function (count) {
            QUnit.equal(count, 10, "IDBKeyRange + count() - count all 10");
        });
        db$1.users.where("first").startsWith("First").limit(5).count(function (count) {
            QUnit.equal(count, 5, "IDBKeyRange + count(): limit(5)");
        });
        db$1.users.where("first").startsWith("First").offset(7).count(function (count) {
            QUnit.equal(count, 3, "IDBKeyRange + count(): offset(7)");
        });
        db$1.users.where("first").startsWith("First").offset(6).limit(4).count(function (count) {
            QUnit.equal(count, 4, "IDBKeyRange + count(): offset(6)");
        });
        db$1.users.where("first").startsWith("First").offset(7).limit(4).count(function (count) {
            QUnit.equal(count, 3, "IDBKeyRange + count(): offset(7).limit(4)");
        });
        db$1.users.where("first").startsWith("First").offset(17).limit(4).count(function (count) {
            QUnit.equal(count, 0, "IDBKeyRange + count(): offset(17).limit(4)");
        });
        // Using IDBKeyRange + toArray()
        db$1.users.where("first").startsWith("First").limit(5).toArray(function (a) {
            QUnit.equal(a.length, 5, "IDBKeyRange + toArray(): limit(5)");
        });
        db$1.users.where("first").startsWith("First").offset(7).toArray(function (a) {
            QUnit.equal(a.length, 3, "IDBKeyRange + toArray(): offset(7)");
        });
        db$1.users.where("first").startsWith("First").offset(6).limit(4).toArray(function (a) {
            QUnit.equal(a.length, 4, "IDBKeyRange + toArray(): offset(6).limit(4)");
        });
        db$1.users.where("first").startsWith("First").offset(7).limit(4).toArray(function (a) {
            QUnit.equal(a.length, 3, "IDBKeyRange + toArray(): offset(7).limit(4)");
        });
        db$1.users.where("first").startsWith("First").offset(17).limit(4).toArray(function (a) {
            QUnit.equal(a.length, 0, "IDBKeyRange + toArray(): offset(17).limit(4)");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("first", 1, function () {
    db$1.users.orderBy("last").first(function (karlCeder) {
        QUnit.equal(karlCeder.first, "Karl", "Got Karl");
    }).finally(QUnit.start);
});
QUnit.asyncTest("last", function () {
    db$1.users.orderBy("last").last(function (david) {
        QUnit.equal(david.first, "David", "Got David");
    }).finally(QUnit.start);
});
QUnit.asyncTest("and", 2, function () {
    db$1.transaction("r", db$1.users, function () {
        db$1.users.where("first")
            .equalsIgnoreCase("david")
            .and(function (user) {
            return user.email.indexOf("apa") >= 0;
        })
            .first(function (user) {
            QUnit.equal(user, null, "Found no user with first name 'david' and email 'apa'");
        });
        db$1.users.where("first")
            .equalsIgnoreCase("david")
            .and(function (user) {
            return user.email.indexOf("daw@thridi.com") >= 0;
        })
            .first(function (user) {
            QUnit.equal(user.first, "David", "Found user with first name 'david' and email 'daw@thridi.com'");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("reverse", function () {
    db$1.transaction("r", db$1.users, function () {
        db$1.users.orderBy("first").reverse().first(function (user) {
            QUnit.equal(user.first, "Karl", "Got Karl");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
if (!supports("multiEntry")) {
    QUnit.test("distinct", function () { return QUnit.ok(true, "SKIPPED - MULTIENTRY UNSUPPORTED"); });
}
else {
    QUnit.asyncTest("distinct", function () {
        db$1.transaction("r", db$1.users, function () {
            db$1.users.where("email").startsWithIgnoreCase("d").toArray(function (a) {
                QUnit.equal(a.length, 2, "Got two duplicates of David since he has two email addresses starting with 'd' (Fails on IE10, IE11 due to not supporting multivalued array indexes)");
            });
            db$1.users.where("email").startsWithIgnoreCase("d").distinct().toArray(function (a) {
                QUnit.equal(a.length, 1, "Got single instance of David since we used the distinct() method. (Fails on IE10, IE11 due to not supporting multivalued array indexes)");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });
}
QUnit.asyncTest("modify", function () {
    db$1.transaction("rw", db$1.users, function () {
        var currentTime = new Date();
        db$1.users.toCollection().modify({
            lastUpdated: currentTime
        }).then(function (count) {
            QUnit.equal(count, 2, "Promise supplied the number of modifications made");
        });
        db$1.users.toArray(function (a) {
            QUnit.equal(a.length, 2, "Length ok");
            QUnit.equal(a[0].first, "David", "First is David");
            QUnit.equal(a[0].lastUpdated.getTime(), currentTime.getTime(), "Could set new member lastUpdated on David");
            QUnit.equal(a[1].lastUpdated.getTime(), currentTime.getTime(), "Could set new member lastUpdated on Karl");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("modify-using-function", function () {
    db$1.transaction("rw", db$1.users, function () {
        var currentTime = new Date();
        db$1.users.toCollection().modify(function (user) {
            user.fullName = user.first + " " + user.last;
            user.lastUpdated = currentTime;
        });
        db$1.users.toArray(function (a) {
            QUnit.equal(a.length, 2);
            QUnit.equal(a[0].first, "David");
            QUnit.equal(a[0].fullName, "David Fahlander", "Could modify David with a getter function");
            QUnit.equal(a[0].lastUpdated.getTime(), currentTime.getTime(), "Could set new member lastUpdated on David");
            QUnit.equal(a[1].lastUpdated.getTime(), currentTime.getTime(), "Could set new member lastUpdated on Karl");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("modify-causing-error", 2, function () {
    db$1.transaction("rw", db$1.users, function () {
        var currentTime = new Date();
        db$1.users.toCollection().modify(function (user) {
            user.id = 1;
            user.fullName = user.first + " " + user.last;
            user.lastUpdated = currentTime;
        });
        db$1.users.toArray(function (a) {
            QUnit.ok(false, "Should not come here, beacuse we should get error when setting all primkey to 1");
        });
    }).catch(Dexie__default.ModifyError, function (e) {
        QUnit.ok(true, "Got ModifyError: " + e);
        QUnit.equal(e.successCount, 1, "Succeeded with the first entry but not the second");
    }).catch(function (e) {
        QUnit.ok(false, "Another error than the expected was thrown: " + e);
    }).finally(QUnit.start);
});
promisedTest("modify-primary-key", function () { return __awaiter(void 0, void 0, void 0, function () {
    var res, user88;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db$1.users.add({ id: 87, first: "Olle" })];
            case 1:
                _a.sent();
                return [4 /*yield*/, db$1.users.where({ id: 87 }).modify(function (user) { return user.id = 88; })];
            case 2:
                res = _a.sent();
                QUnit.ok(res, "Successfully modified the primary key of a user");
                return [4 /*yield*/, db$1.users.get(88)];
            case 3:
                user88 = _a.sent();
                QUnit.ok(!!user88, "Should be able to retrieve user 88 using db.users.get(88)");
                QUnit.equal(user88.first, "Olle", "Retrieved user should be David");
                return [2 /*return*/];
        }
    });
}); });
//
// Issue #594 (A Safari issue)
//
promisedTest("modify-with-where(issue-594)", function () { return __awaiter(void 0, void 0, void 0, function () {
    var numDavids, numModifications, davids;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db$1.users.add({ id: 3, first: "David", last: "Fahlander2", username: "dfahlander2", email: ["david2@awarica.com"], pets: [] });
                db$1.users.add({ id: 4, first: "David", last: "Fahlander3", username: "dfahlander3", email: ["david3@awarica.com"], pets: [] });
                return [4 /*yield*/, db$1.users.where('first').equals("David").toArray()];
            case 1:
                numDavids = (_a.sent()).length;
                QUnit.equal(numDavids, 3, "There should be 3 Davids");
                return [4 /*yield*/, db$1.users.where('first').equals("David").modify(function (object) { object.anotherProperty = 'test'; })];
            case 2:
                numModifications = _a.sent();
                QUnit.equal(numModifications, 3, "There should have been 3 modifications");
                return [4 /*yield*/, db$1.users.where({ first: 'David' }).toArray()];
            case 3:
                davids = _a.sent();
                QUnit.ok(davids.every(function (david) { return david.anotherProperty === 'test'; }), "All Davids where modified indeed");
                return [2 /*return*/];
        }
    });
}); });
QUnit.asyncTest("delete", 2, function () {
    db$1.users.orderBy("id").delete().then(function (count) {
        QUnit.equal(count, 2, "All two records deleted");
        return db$1.users.count(function (count) {
            QUnit.equal(count, 0, "No users in collection anymore");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("delete(2)", 3, function () {
    db$1.transaction("rw", db$1.users, function () {
        db$1.users.add({ id: 3, first: "dAvid", last: "Helenius", username: "dahel" });
        db$1.users.where("first").equalsIgnoreCase("david").delete().then(function (deleteCount) {
            QUnit.equal(deleteCount, 2, "Two items deleted (Both davids)");
        });
        db$1.users.toArray(function (a) {
            QUnit.equal(a.length, 1, "Deleted one user");
            QUnit.equal(a[0].first, "Karl", "Only Karl is there now");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("delete(3, combine with OR)", 3, function () {
    db$1.transaction("rw", db$1.users, function () {
        db$1.users.add({ id: 3, first: "dAvid", last: "Helenius", username: "dahel" });
        db$1.users.where("first").equals("dAvid").or("username").equals("kceder").delete().then(function (deleteCount) {
            QUnit.equal(deleteCount, 2, "Two items deleted (Both dAvid Helenius and Karl Cedersköld)");
        });
        db$1.users.toArray(function (a) {
            QUnit.equal(a.length, 1, "Only one item left since dAvid and Karl have been deleted");
            QUnit.equal(a[0].first, "David", "Only David Fahlander is there now!");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("keys", 3, function () {
    db$1.users.orderBy("first").keys(function (a) {
        QUnit.equal(a.length, 2, "There should be two results");
        QUnit.equal(a[0], "David", "First is David");
        QUnit.equal(a[1], "Karl", "Second is Karl");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("uniqueKeys", 7, function () {
    db$1.transaction("rw", db$1.users, function () {
        db$1.users.add({ id: 3, first: "David", last: "Helenius", username: "dahel" });
        db$1.users.orderBy("first").keys(function (a) {
            QUnit.equal(a.length, 3, "When not using uniqueKeys, length is 3");
            QUnit.equal(a[0], "David", "First is David");
            QUnit.equal(a[1], "David", "Second is David");
            QUnit.equal(a[2], "Karl", "Third is Karl");
        });
        db$1.users.orderBy("first").uniqueKeys(function (a) {
            QUnit.equal(a.length, 2, "When using uniqueKeys, length is 2");
            QUnit.equal(a[0], "David", "First is David");
            QUnit.equal(a[1], "Karl", "Second is Karl");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("primaryKeys", 3, function () {
    db$1.users.orderBy("last").primaryKeys(function (a) {
        QUnit.equal(a.length, 2, "There should be two results");
        QUnit.equal(a[0], 2, "Second is Karl");
        QUnit.equal(a[1], 1, "First is David");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("primaryKeys2", 3, function () {
    db$1.users.orderBy("first").primaryKeys(function (a) {
        QUnit.equal(a.length, 2, "There should be two results");
        QUnit.equal(a[0], 1, "First is David");
        QUnit.equal(a[1], 2, "Second is Karl");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("eachKey and eachUniqueKey", function () {
    db$1.transaction("rw", db$1.users, function () {
        db$1.users.add({ id: 3, first: "Ylva", last: "Fahlander", username: "yfahlander" });
        var a = [];
        db$1.users.orderBy("last").eachKey(function (lastName) {
            a.push(lastName);
        }).then(function () {
            QUnit.equal(a.length, 3, "When using eachKey, number of keys are 3");
        });
        var a2 = [];
        db$1.users.orderBy("last").eachUniqueKey(function (lastName) {
            a2.push(lastName);
        }).then(function () {
            QUnit.equal(a2.length, 2, "When using eachUniqueKey, number of keys are 2");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("or", 14, function () {
    db$1.transaction("rw", db$1.users, function () {
        db$1.users.add({ id: 3, first: "Apan", last: "Japan", username: "apanjapan" });
        db$1.users.where("first").equalsIgnoreCase("david").or("last").equals("Japan").sortBy("first", function (a) {
            QUnit.equal(a.length, 2, "Got two users");
            QUnit.equal(a[0].first, "Apan", "First is Apan");
            QUnit.equal(a[1].first, "David", "Second is David");
        });
        db$1.users.where("first").equalsIgnoreCase("david").or("last").equals("Japan").or("id").equals(2).sortBy("id", function (a) {
            QUnit.equal(a.length, 3, "Got three users");
            QUnit.equal(a[0].first, "David", "First is David");
            QUnit.equal(a[1].first, "Karl", "Second is Karl");
            QUnit.equal(a[2].first, "Apan", "Third is Apan");
        });
        var userArray = [];
        db$1.users.where("id").anyOf(1, 2, 3, 4).or("username").anyOf("dfahlander", "kceder", "apanjapan").each(function (user) {
            QUnit.ok(true, "Found: " + JSON.stringify(user));
            userArray.push(user);
        }).then(function () {
            QUnit.equal(userArray.length, 3, "Got all three users");
            QUnit.ok(userArray.some(function (user) { return user.first === "David"; }), "David was found");
            QUnit.ok(userArray.some(function (user) { return user.first === "Karl"; }), "Karl was found");
            QUnit.ok(userArray.some(function (user) { return user.first === "Apan"; }), "Apan was found");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("or-issue#15-test", function () {
    var db = new Dexie__default("MyDB_issue15");
    db.version(1).stores({
        phones: "++id, additionalFeatures, android, availability, battery, camera, connectivity, description, display, hardware, id, images, name, sizeAndWeight, storage"
    });
    db.on('populate', function () {
        QUnit.ok(true, "on(populate) called");
        for (var i = 0; i < 100; ++i) {
            db.phones.add({ id: 3 + i, name: "Name" + randomString(16), additionalFeatures: [randomString(10)], android: 1, availability: 0, battery: 1, camera: 1 });
        }
        var seed = 1;
        function pseudoRandom() {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }
        function randomString(count) {
            var ms = [];
            for (var i = 0; i < count; ++i) {
                ms.push(String.fromCharCode(32 + Math.floor(pseudoRandom() * 95)));
            }
            return ms.join('');
        }
    });
    db.open().catch(function (err) {
        QUnit.ok(false, "DB ERROR: " + err);
    });
    var numRuns = 10;
    for (var i = 0; i < numRuns; ++i) {
        db.phones.where("name").startsWithIgnoreCase("name").or("id").below(50).toArray(function (a) {
            QUnit.equal(a.length, 100, "Found 100 phones");
        }).catch(function (err) {
            QUnit.ok(false, "error:" + err.stack);
        }).finally(function () {
            if (--numRuns == 0) {
                // All test runs finished. Delete DB and exit unit test.
                db.delete();
                QUnit.start();
            }
        });
    }
});
QUnit.asyncTest("until", function () {
    db$1.transaction("rw", db$1.users, function () {
        db$1.users.add({ id: 3, first: "Apa1", username: "apa1" });
        db$1.users.add({ id: 4, first: "Apa2", username: "apa2" });
        db$1.users.add({ id: 5, first: "Apa3", username: "apa3" });
        // Checking that it stops immediately when first item is the stop item:
        db$1.users.orderBy(":id").until(function (user) { return user.first == "David"; }).toArray(function (a) {
            QUnit.equal(0, a.length, "Stopped immediately because David has ID 1");
        });
        // Checking that specifying includeStopEntry = true will include the stop entry.
        db$1.users.orderBy(":id").until(function (user) { return user.first == "David"; }, true).toArray(function (a) {
            QUnit.equal(1, a.length, "Got the stop entry when specifying includeStopEntry = true");
            QUnit.equal("David", a[0].first, "Name is David");
        });
        // Checking that when sorting on first name and stopping on David, we'll get the apes.
        db$1.users.orderBy("first").until(function (user) { return user.first == "David"; }).toArray(function (a) {
            QUnit.equal(3, a.length, "Got 3 users only (3 apes) because the Apes comes before David and Karl when ordering by first name");
            QUnit.equal("apa1", a[0].username, "First is apa1");
            QUnit.equal("apa2", a[1].username, "Second is apa2");
            QUnit.equal("apa3", a[2].username, "Third is apa3");
        });
        // Checking that reverse() affects the until() method as expected:
        db$1.users.orderBy("first").reverse().until(function (user) { return user.username == "apa2"; }).toArray(function (a) {
            QUnit.equal(3, a.length, "Got 3 users only (David, Karl and Apa3)");
            QUnit.equal("Karl", a[0].first, "When reverse(), First is Karl.");
            QUnit.equal("David", a[1].first, "When reverse(), Second is David");
            QUnit.equal("Apa3", a[2].first, "When reverse(), Third is Apa3");
        });
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("firstKey", function () {
    db$1.users.orderBy('last').firstKey(function (key) {
        QUnit.equal("Cedersköld", key, "First lastName is Cedersköld");
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).finally(function () {
        QUnit.start();
    });
});
QUnit.asyncTest("lastKey", function () {
    db$1.users.orderBy('last').lastKey(function (key) {
        QUnit.equal("Fahlander", key, "Last lastName is Fahlander");
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).finally(function () {
        QUnit.start();
    });
});
QUnit.asyncTest("firstKey on primary key", function () {
    db$1.users.toCollection().firstKey(function (key) {
        QUnit.equal(key, 1, "First key is 1");
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).finally(function () {
        QUnit.start();
    });
});
QUnit.asyncTest("lastKey on primary key", function () {
    db$1.users.toCollection().lastKey(function (key) {
        QUnit.equal(key, 2, "lastKey is 2");
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).finally(function () {
        QUnit.start();
    });
});
QUnit.asyncTest("Promise chain from within each() operation", 2, function () {
    db$1.transaction('r', db$1.users, function () {
        db$1.users.each(function (user) {
            db$1.users.where('id').equals(user.id).first(function (usr) {
                return db$1.users.where('id').equals(usr.id).first();
            }).then(function (u) {
                return u;
            }).then(function (u2) {
                QUnit.equal(u2.id, user.id, "Could get the same user after some chains of Promise.resolve()");
            });
        });
    }).catch(function (err) {
        QUnit.ok(false, err.stack || err);
    }).finally(QUnit.start);
});

var async = Dexie__default.async;
var db$2 = new Dexie__default("TestDBWhereClause");
db$2.version(1).stores({
    folders: "++id,&path",
    files: "++id,filename,extension,[filename+extension],folderId",
    people: "[name+number],name,number",
    friends: "++id,name,age",
    chart: '[patno+row+col], patno',
    chaps: "++id,[name+number]",
    multiMulti: "id,*tags,*categories"
});
var Folder = db$2.folders.defineClass({
    id: Number,
    path: String,
    description: String
});
var File = db$2.files.defineClass({
    id: Number,
    filename: String,
    extension: String,
    folderId: Number
});
File.prototype.getFullPath = function () {
    var file = this;
    return db$2.folders.get(this.folderId, function (folder) {
        return folder.path + "/" + file.filename + (file.extension || "");
    });
};
Folder.prototype.getFiles = function () {
    return db$2.files.where('folderId').equals(this.id).toArray();
};
var Chart = db$2.chart.defineClass({
    patno: Number,
    row: Number,
    col: Number,
    sym: Number
});
Chart.prototype.save = function () {
    return db$2.chart.put(this);
};
var firstFolderId = 0;
db$2.on("populate", function () {
    var folders = db$2.table("folders");
    var files = db$2.table("files");
    folders.add({ path: "/", description: "Root folder" }).then(function (id) {
        firstFolderId = id;
    });
    folders.add({ path: "/usr" }); // 2
    folders.add({ path: "/usr/local" }); // 3
    folders.add({ path: "/usr/local/bin" }).then(function (id) {
        files.add({ filename: "Hello", folderId: id }).then(function (fileId) {
            
        });
        files.add({ filename: "hello", extension: ".exe", folderId: id });
    });
    folders.add({ path: "/usr/local/src" }).then(function (id) {
        files.add({ filename: "world", extension: ".js", folderId: id });
        files.add({ filename: "README", extension: ".TXT", folderId: id });
    });
    folders.add({ path: "/usr/local/var" }); // 6
    folders.add({ path: "/USR/local/VAR" }); // 7
    folders.add({ path: "/var" }); // 8
    folders.add({ path: "/var/bin" }).then(function (id) {
        return files.add({ filename: "hello-there", extension: ".exe", folderId: id });
    }).then(function (id) {
        
    });
});
QUnit.module("WhereClause", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db$2).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
    }
});
spawnedTest('Issue#31 Compound Index with anyOf', function () {
    var items;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!supports('compound'))
                    return [2 /*return*/, QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED")];
                return [4 /*yield*/, db$2.people.bulkAdd([{
                            name: 0,
                            number: 0,
                            tag: "A"
                        }, {
                            name: -1,
                            number: 0,
                            tag: "B"
                        }, {
                            name: -2,
                            number: 0,
                            tag: "C"
                        }, {
                            name: -3,
                            number: 0,
                            tag: "D"
                        }])];
            case 1:
                _a.sent();
                return [4 /*yield*/, db$2.people
                        .where('[name+number]')
                        .anyOf([[-2, 0], [-3, 0]]) // https://github.com/dfahlander/Dexie.js/issues/31
                        .toArray()];
            case 2:
                items = _a.sent();
                QUnit.equal(items.length, 2, "It should contain 2 items.");
                QUnit.equal(items[0].tag, "D", "First we should get D");
                QUnit.equal(items[1].tag, "C", "then we should get C");
                return [2 /*return*/];
        }
    });
});
QUnit.asyncTest("startsWithAnyOf()", function () {
    function runTheTests(mippler) {
        /// <param name="mippler" value="function(x){return x;}"></param>
        //
        // Basic Flow:
        //
        return mippler(db$2.folders
            .where('path').startsWithAnyOf('/usr/local', '/var'))
            .toArray(function (result) {
            QUnit.equal(result.length, 6, "Query should match 6 folders");
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local'; }), '/usr/local');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/bin'; }), '/usr/local/bin');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/src'; }), '/usr/local/src');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/var'; }), '/usr/local/var');
            QUnit.ok(result.some(function (x) { return x.path == '/var'; }), '/var');
            QUnit.ok(result.some(function (x) { return x.path == '/var/bin'; }), '/var/bin');
            //
            // Require a slash at beginning (and use an array of strings as argument instead)
            //
            return mippler(db$2.folders
                .where('path').startsWithAnyOf(['/usr/local/', '/var/']))
                .toArray();
        }).then(function (result) {
            QUnit.equal(result.length, 4, "Query should match 4 folders");
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/bin'; }), '/usr/local/bin');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/src'; }), '/usr/local/src');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/var'; }), '/usr/local/var');
            QUnit.ok(result.some(function (x) { return x.path == '/var/bin'; }), '/var/bin');
            //
            // Some specialities
            //
            return Dexie__default.Promise.all(mippler(db$2.folders.where('path').startsWithAnyOf([])).count(), // Empty
            mippler(db$2.folders.where('path').startsWithAnyOf('/var', '/var', '/var')).count(), // Duplicates
            mippler(db$2.folders.where('path').startsWithAnyOf('')).count(), // Empty string should match all
            mippler(db$2.folders).count(), mippler(db$2.folders.where('path').startsWithAnyOf('nonexisting')).count() // Non-existing match
            );
        }).then(function (results) {
            QUnit.equal(results[0], 0, "startsWithAnyOf([]).count() == 0");
            QUnit.equal(results[1], 2, "startsWithAnyOf('/var', '/var', '/var') == 2");
            QUnit.equal(results[2], results[3], "startsWithAnyOf('').count() == db.folders.count()");
            QUnit.equal(results[4], 0, "startsWithAnyOf('nonexisting').count() == 0");
            //
            // Error handling
            //
            return mippler(db$2.folders.where('path').startsWithAnyOf([null, '/'])).toArray(function (res) {
                QUnit.ok(false, "Should not succeed to have null in parameter");
            }).catch(function (e) {
                QUnit.ok(true, "As expected: failed to have null in arguments: " + e);
            });
        });
    }
    // Run tests without transaction and without reverse()
    runTheTests(function (x) { return x; }).then(function () {
        QUnit.ok(true, "FINISHED NORMAL TEST!");
        // Run tests with reverse()
        return runTheTests(function (x) { return x.reverse(); });
    }).then(function () {
        QUnit.ok(true, "FINISHED REVERSE TEST!");
        // Run tests within a transaction
        return db$2.transaction('r', db$2.folders, db$2.files, function () {
            return runTheTests(function (x) { return x; });
        });
    }).then(function () {
        QUnit.ok(true, "FINISHED TRANSACTION TEST!");
    }).catch(function (e) {
        QUnit.ok(false, "Error: " + e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("anyOf()", function () {
    db$2.transaction("r", db$2.files, db$2.folders, function () {
        db$2.files.where("filename").anyOf("hello", "hello-there", "README", "gösta").toArray(function (a) {
            QUnit.equal(a.length, 3, "Should find 3 files");
            QUnit.equal(a[0].filename, "README", "First match is README because capital R comes before lower 'h' in lexical sort");
            QUnit.equal(a[1].filename, "hello", "Second match is hello");
            QUnit.equal(a[2].filename, "hello-there", "Third match is hello-there");
            a[0].getFullPath().then(function (fullPath) {
                QUnit.equal(fullPath, "/usr/local/src/README.TXT", "Full path of README.TXT is: " + fullPath);
            });
            a[1].getFullPath().then(function (fullPath) {
                QUnit.equal(fullPath, "/usr/local/bin/hello.exe", "Full path of hello.exe is: " + fullPath);
            });
            a[2].getFullPath().then(function (fullPath) {
                QUnit.equal("/var/bin/hello-there.exe", fullPath, "Full path of hello-there.exe is: " + fullPath);
            });
        });
    }).catch(function (e) {
        QUnit.ok(false, "Error: " + e.stack || e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("anyOf(integerArray)", function () {
    // Testing bug #11 Integer Indexes in anyOf handled incorrectly
    db$2.files.put({ id: 9000, filename: "new file 1", folderId: firstFolderId });
    db$2.files.put({ id: 10000, filename: "new file 2", folderId: firstFolderId });
    db$2.files.where('id').anyOf([9000, 11000]).toArray(function (a) {
        QUnit.equal(a.length, 1, "Should be only one found entry");
        QUnit.equal(a[0].id, 9000, "Item no 9000 should be found");
    }).finally(QUnit.start);
});
QUnit.asyncTest("anyOf(emptyArray)", function () {
    db$2.files.where('id').anyOf([]).toArray(function (a) {
        QUnit.equal(a.length, 0, "Should be empty");
    }).catch(function (e) {
        QUnit.ok(false, "Error: " + e.stack || e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("equalsIgnoreCase()", function () {
    db$2.files.where("filename").equalsIgnoreCase("hello").toArray(function (a) {
        QUnit.equal(a.length, 2, "Got two files");
        QUnit.equal(a[0].filename, "Hello", "First file is Hello");
        QUnit.equal(a[1].filename, "hello", "Second file is hello");
        QUnit.start();
    });
});
QUnit.asyncTest("equalsIgnoreCase() 2", function () {
    var folder = new Folder();
    folder.path = "/etc";
    folder.description = "Slasktratten";
    db$2.folders.add(folder).then(function (folderId) {
        var filenames = ["", "\t ", "AA", "AAron", "APAN JAPAN", "APAN japaö", "APGALEN", "APaLAT", "APaÖNSKAN", "APalster",
            "Aaron", "Apan JapaN", "Apan Japaa", "Apan Japan", "Gösta",
            "apan JA", "apan JAPA", "apan JAPAA", "apan JAPANer",
            "apan JAPAÖ", "apan japan", "apan japanER", "östen"];
        var fileArray = filenames.map(function (filename) {
            var file = new File();
            file.filename = filename;
            file.folderId = folderId;
            return file;
        });
        db$2.transaction("rw", db$2.files, function () {
            fileArray.forEach(function (file) {
                db$2.files.add(file);
            });
            db$2.files.where("filename").equalsIgnoreCase("apan japan").toArray(function (a) {
                QUnit.equal(a.length, 4, "There should be 4 files with that name");
                QUnit.equal(a[0].filename, "APAN JAPAN", "APAN JAPAN");
                QUnit.equal(a[1].filename, "Apan JapaN", "Apan JapaN");
                QUnit.equal(a[2].filename, "Apan Japan", "Apan Japan");
                QUnit.equal(a[3].filename, "apan japan", "apan japan");
            });
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e.stack || e);
        }).finally(QUnit.start);
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
        QUnit.start();
    });
});
QUnit.asyncTest("equalsIgnoreCase() 2 descending", function () {
    var folder = new Folder();
    folder.path = "/etc";
    folder.description = "Slasktratten";
    db$2.folders.add(folder).then(function (folderId) {
        var filenames = ["", "\t ", "AA", "AAron", "APAN JAPAN", "APAN japaö", "APGALEN", "APaLAT", "APaÖNSKAN", "APalster",
            "Aaron", "Apan JapaN", "Apan Japaa", "Apan Japan", "Gösta",
            "apan JA", "apan JAPA", "apan JAPAA", "apan JAPANer",
            "apan JAPAÖ", "apan japan", "apan japanER", "östen"];
        var fileArray = filenames.map(function (filename) {
            var file = new File();
            file.filename = filename;
            file.folderId = folderId;
            return file;
        });
        db$2.transaction("rw", db$2.files, function () {
            fileArray.forEach(function (file) {
                db$2.files.add(file);
            });
            db$2.files
                .where("filename").equalsIgnoreCase("apan japan")
                .and(function (f) { return f.folderId === folderId; }) // Just for fun - only look in the newly created /etc folder.
                .reverse()
                .toArray(function (a) {
                QUnit.equal(a.length, 4, "There should be 4 files with that name in " + folder.path);
                QUnit.equal(a[0].filename, "apan japan", "apan japan");
                QUnit.equal(a[1].filename, "Apan Japan", "Apan Japan");
                QUnit.equal(a[2].filename, "Apan JapaN", "Apan JapaN");
                QUnit.equal(a[3].filename, "APAN JAPAN", "APAN JAPAN");
            });
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e.stack || e);
            QUnit.start();
        }).finally(QUnit.start);
    });
});
QUnit.asyncTest("equalsIgnoreCase() 3 (first key shorter than needle)", function () {
    if (typeof idbModules !== 'undefined' && Dexie__default.dependencies.indexedDB === idbModules.shimIndexedDB) {
        // Using indexedDBShim.
        QUnit.ok(false, "This test would hang with IndexedDBShim as of 2015-05-07");
        QUnit.start();
        return;
    }
    db$2.transaction("rw", db$2.files, function () {
        db$2.files.clear();
        db$2.files.add({ filename: "Hello-there-", folderId: 1 });
        db$2.files.add({ filename: "hello-there-", folderId: 1 });
        db$2.files.add({ filename: "hello-there-everyone", folderId: 1 });
        db$2.files.add({ filename: "hello-there-everyone-of-you!", folderId: 1 });
        // Ascending
        db$2.files.where("filename").equalsIgnoreCase("hello-there-everyone").toArray(function (a) {
            QUnit.equal(a.length, 1, "Should find one file");
            QUnit.equal(a[0].filename, "hello-there-everyone", "First file is " + a[0].filename);
        });
        // Descending
        db$2.files.where("filename").equalsIgnoreCase("hello-there-everyone").reverse().toArray(function (a) {
            QUnit.equal(a.length, 1, "Should find one file");
            QUnit.equal(a[0].filename, "hello-there-everyone", "First file is " + a[0].filename);
        });
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("startsWithIgnoreCase()", function () {
    db$2.transaction("r", db$2.folders, function () {
        db$2.folders.count(function (count) {
            QUnit.ok(true, "Number of folders in database: " + count);
            db$2.folders.where("path").startsWithIgnoreCase("/").toArray(function (a) {
                QUnit.equal(a.length, count, "Got all folder objects because all of them starts with '/'");
            });
        });
        db$2.folders.where("path").startsWithIgnoreCase("/usr").toArray(function (a) {
            QUnit.equal(a.length, 6, "6 folders found: " + a.map(function (folder) { return '"' + folder.path + '"'; }).join(', '));
        });
        db$2.folders.where("path").startsWithIgnoreCase("/usr").reverse().toArray(function (a) {
            QUnit.equal(a.length, 6, "6 folders found in reverse mode: " + a.map(function (folder) { return '"' + folder.path + '"'; }).join(', '));
        });
    }).then(function () {
        QUnit.ok(true, "Transaction complete");
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).finally(function () {
        QUnit.start();
    });
});
QUnit.asyncTest("queryingNonExistingObj", function () {
    db$2.files.where("filename").equals("fdsojifdsjoisdf").toArray(function (a) {
        QUnit.equal(a.length, 0, "File fdsojifdsjoisdf was not found");
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).finally(QUnit.start);
});
if (!supports("compound")) {
    QUnit.test("compound-index", function () { return QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED"); });
    QUnit.test("compound-primkey (Issue #37)", function () { return QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED"); });
    QUnit.test("Issue #31 - Compound Index with anyOf", function () { return QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED"); });
    QUnit.test("Erratic behavior of between #190", function () { return QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED"); });
}
else {
    QUnit.asyncTest("compound-index", 2, function () {
        db$2.transaction("r", db$2.files, function () {
            db$2.files.where("[filename+extension]").equals(["README", ".TXT"]).toArray(function (a) {
                QUnit.equal(a.length, 1, "Found one file by compound index search");
                QUnit.equal(a[0].filename, "README", "The found file was README.TXT");
            });
        }).catch(function (e) {
            QUnit.ok(false, e + ". Expected to fail on IE10/IE11 - no support compound indexs.");
        }).finally(QUnit.start);
    });
    QUnit.asyncTest("compound-primkey (Issue #37)", function () {
        db$2.transaction('rw', db$2.people, function () {
            db$2.people.add({ name: "Santaclaus", number: 123 });
            db$2.people.add({ name: "Santaclaus", number: 124 });
            db$2.people.add({ name: "Santaclaus2", number: 1 });
            return db$2.people.get(["Santaclaus", 123]);
        }).then(function (santa) {
            QUnit.ok(!!santa, "Got santa");
            QUnit.equal(santa.name, "Santaclaus", "Santa's name is correct");
            QUnit.equal(santa.number, 123, "Santa's number is correct");
            return db$2.people.where("[name+number]").between(["Santaclaus", 1], ["Santaclaus", 200]).toArray();
        }).then(function (santas) {
            QUnit.equal(santas.length, 2, "Got two santas");
        }).catch(function (e) {
            QUnit.ok(false, "Failed (will fail in IE without polyfill):" + e);
        }).finally(QUnit.start);
    });
    QUnit.asyncTest("Issue #31 - Compound Index with anyOf", function () {
        db$2.files
            .where("[filename+extension]")
            .anyOf([["hello", ".exe"], ["README", ".TXT"]])
            .toArray(function (a) {
            QUnit.equal(a.length, 2, "Should find two files");
            QUnit.equal(a[0].filename, "README", "First comes the uppercase README.TXT");
            QUnit.equal(a[1].filename, "hello", "Second comes the lowercase hello.exe");
        }).catch(function (e) {
            QUnit.ok(false, "Failed (will fail in IE without polyfill):" + e);
        }).finally(QUnit.start);
    });
    QUnit.asyncTest("Erratic behavior of between #190", function () {
        db$2.transaction("rw", db$2.chart, function () {
            var chart = [];
            for (var r = 1; r <= 2; r++) {
                for (var c = 1; c <= 150; c++) {
                    chart.push({ patno: 1,
                        row: r,
                        col: c,
                        sym: 1 });
                }
            }
            db$2.chart.bulkAdd(chart);
        }).then(function () {
            var grid = [], x1 = 91, x2 = 130;
            return db$2.chart.where("[patno+row+col]").between([1, 1, x1], [1, 1, x2], true, true).each(function (cell) {
                grid.push(cell.sym);
            }).then(function () {
                QUnit.equal(grid.length, 40, "Should find 40 cells");
                //console.log("range " + x1 + "-" + x2 + " found " + grid.length);
            });
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e + " (Will fail in IE and Edge due to lack of compound primary keys)");
        }).finally(QUnit.start);
    });
}
QUnit.asyncTest("above, aboveOrEqual, below, belowOrEqual, between", 32, function () {
    db$2.folders.where('id').above(firstFolderId + 4).toArray(function (a) {
        QUnit.equal(a.length, 4, "Four folders have id above 5");
        QUnit.equal(a[0].path, "/usr/local/var");
        QUnit.equal(a[1].path, "/USR/local/VAR");
        QUnit.equal(a[2].path, "/var");
        QUnit.equal(a[3].path, "/var/bin");
    }).then(function () {
        return db$2.folders.where('id').aboveOrEqual(firstFolderId + 4).toArray(function (a) {
            QUnit.equal(a.length, 5, "Five folders have id above or equal 5");
            QUnit.equal(a[0].path, "/usr/local/src");
            QUnit.equal(a[1].path, "/usr/local/var");
            QUnit.equal(a[2].path, "/USR/local/VAR");
            QUnit.equal(a[3].path, "/var");
            QUnit.equal(a[4].path, "/var/bin");
        });
    }).then(function () {
        return db$2.folders.where('id').below(firstFolderId + 4).toArray(function (a) {
            QUnit.equal(a.length, 4, "Four folders have id below 5");
            QUnit.equal(a[0].path, "/");
            QUnit.equal(a[1].path, "/usr");
            QUnit.equal(a[2].path, "/usr/local");
            QUnit.equal(a[3].path, "/usr/local/bin");
        });
    }).then(function () {
        return db$2.folders.where('id').belowOrEqual(firstFolderId + 4).toArray(function (a) {
            QUnit.equal(a.length, 5, "Five folders have id below or equal to 5");
            QUnit.equal(a[0].path, "/");
            QUnit.equal(a[1].path, "/usr");
            QUnit.equal(a[2].path, "/usr/local");
            QUnit.equal(a[3].path, "/usr/local/bin");
            QUnit.equal(a[4].path, "/usr/local/src");
        });
    }).then(function () {
        return db$2.folders.where('id').between(firstFolderId, firstFolderId + 1).toArray(function (a) {
            QUnit.equal(a.length, 1, "One folder between 1 and 2");
            QUnit.equal(a[0].id, firstFolderId, "Found item is number 1");
        });
    }).then(function () {
        return db$2.folders.where('id').between(firstFolderId, firstFolderId + 1, true, false).toArray(function (a) {
            QUnit.equal(a.length, 1, "One folder between 1 and 2 (including lower but not upper)");
            QUnit.equal(a[0].id, firstFolderId, "Found item is number 1");
        });
    }).then(function () {
        return db$2.folders.where('id').between(firstFolderId, firstFolderId + 1, false, true).toArray(function (a) {
            QUnit.equal(a.length, 1, "One folder between 1 and 2 (including upper but not lower)");
            QUnit.equal(a[0].id, firstFolderId + 1, "Found item is number 2");
        });
    }).then(function () {
        return db$2.folders.where('id').between(firstFolderId, firstFolderId + 1, false, false).toArray(function (a) {
            QUnit.equal(a.length, 0, "Zarro folders between 1 and 2 (neither including lower nor upper)");
        });
    }).then(function () {
        return db$2.folders.where('id').between(firstFolderId, firstFolderId + 1, true, true).toArray(function (a) {
            QUnit.equal(a.length, 2, "Two folder between 1 and 2 (including both lower and upper)");
            QUnit.equal(a[0].id, firstFolderId, "Number 1 among found items");
            QUnit.equal(a[1].id, firstFolderId + 1, "Number 2 among found items");
        });
    }).catch(function (err) {
        QUnit.ok(false, err.stack || err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("notEqual", function () {
    db$2.folders.where('path').notEqual("/usr/local").sortBy("path", function (result) {
        result = result.map(function (x) { return x.path; });
        QUnit.equal(JSON.stringify(result, null, 4), JSON.stringify([
            "/",
            "/USR/local/VAR",
            "/usr",
            //"/usr/local"
            "/usr/local/bin",
            "/usr/local/src",
            "/usr/local/var",
            "/var",
            "/var/bin"
        ], null, 4), "/usr/local should be removed");
    }).catch(function (err) {
        QUnit.ok(false, err.stack || err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("noneOf", function () {
    db$2.folders.where('path').noneOf("/usr/local", "/", "/var/bin", "not existing key").sortBy("path", function (result) {
        result = result.map(function (x) { return x.path; });
        QUnit.equal(JSON.stringify(result, null, 4), JSON.stringify([
            //"/",
            "/USR/local/VAR",
            "/usr",
            //"/usr/local"
            "/usr/local/bin",
            "/usr/local/src",
            "/usr/local/var",
            "/var",
        ], null, 4), "Only items not specified in query should come into result");
    }).catch(function (err) {
        QUnit.ok(false, err.stack || err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("noneOf keys", function () {
    db$2.folders.where('path').noneOf("/usr/local", "/", "/var/bin", "not existing key").keys(function (result) {
        result = result.sort(function (a, b) { return a < b ? -1 : a === b ? 0 : 1; });
        QUnit.equal(JSON.stringify(result, null, 4), JSON.stringify([
            //"/",
            "/USR/local/VAR",
            "/usr",
            //"/usr/local"
            "/usr/local/bin",
            "/usr/local/src",
            "/usr/local/var",
            "/var",
        ], null, 4), "Only keys not specified in query should come into result");
    }).catch(function (err) {
        QUnit.ok(false, err.stack || err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("inAnyOfRanges", function () {
    db$2.transaction('rw', db$2.friends, function () {
        db$2.friends.bulkAdd([
            { name: "Simon", age: 3 },
            { name: "Tyra", age: 0 },
            { name: "David", age: 42 },
            { name: "Ylva", age: 40 },
            { name: "Ann-Sofie", age: 72 }
        ]).then(function () {
            //equal(errors.length, 0, "bulkAdd() succeeded");
            return db$2.friends.where('age').inAnyRange([[0, 3], [65, Infinity]]).toArray();
        }).then(function (result) {
            QUnit.equal(result.length, 2, "Should give us two persons");
            QUnit.equal(result[0].name, "Tyra", "First is Tyra");
            QUnit.equal(result[1].name, "Ann-Sofie", "Second is Ann-Sofie");
            return db$2.friends.where("age").inAnyRange([[0, 3], [65, Infinity]], { includeUppers: true }).toArray();
        }).then(function (result) {
            QUnit.equal(result.length, 3, "Should give us three persons");
            QUnit.equal(result[0].name, "Tyra", "First is Tyra");
            QUnit.equal(result[1].name, "Simon", "Second is Simon");
            QUnit.equal(result[2].name, "Ann-Sofie", "Third is Ann-Sofie");
            return db$2.friends.where("age").inAnyRange([[0, 3], [65, Infinity]], { includeLowers: false }).toArray();
        }).then(function (result) {
            QUnit.equal(result.length, 1, "Should give us one person");
            QUnit.equal(result[0].name, "Ann-Sofie", "Ann-Sofie is the only match");
            return db$2.friends.where("age").inAnyRange([[40, 40], [40, 40], [40, 41], [41, 41], [42, 42]], { includeUppers: true }).toArray();
        }).then(function (result) {
            QUnit.equal(result.length, 2, "Should give us two persons");
            QUnit.equal(result[0].name, "Ylva", "First is Ylva");
            QUnit.equal(result[1].name, "David", "Second is David");
        });
    }).catch(function (err) {
        QUnit.ok(false, err.stack || err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("anyOfIgnoreCase", function () {
    db$2.transaction('r', db$2.folders, db$2.files, function () {
        db$2.folders.where('path').anyOfIgnoreCase("/usr/local/var", "/").toArray(function (result) {
            QUnit.equal(result.length, 3);
            QUnit.equal(result[0].path, "/");
            QUnit.equal(result[1].path, "/USR/local/VAR");
            QUnit.equal(result[2].path, "/usr/local/var");
            return db$2.folders.where('path').anyOfIgnoreCase("/usr/local/var", "/").reverse().toArray();
        }).then(function (result) {
            QUnit.equal(result.length, 3);
            QUnit.equal(result[0].path, "/usr/local/var");
            QUnit.equal(result[1].path, "/USR/local/VAR");
            QUnit.equal(result[2].path, "/");
            return db$2.files.where('filename').anyOfIgnoreCase(["hello", "world", "readme"]).toArray();
        }).then(function (result) {
            QUnit.equal(result.length, 4);
            QUnit.equal(result[0].filename, "Hello");
            QUnit.equal(result[1].filename, "README");
            QUnit.equal(result[2].filename, "hello");
            QUnit.equal(result[3].filename, "world");
        });
    }).catch(function (err) {
        QUnit.ok(false, err.stack || err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("anyOfIgnoreCase(2)", function () {
    db$2.files.where('filename').anyOfIgnoreCase(["hello", "world", "readme"]).toArray(function (result) {
        QUnit.equal(result.length, 4);
        QUnit.equal(result[0].filename, "Hello");
        QUnit.equal(result[1].filename, "README");
        QUnit.equal(result[2].filename, "hello");
        QUnit.equal(result[3].filename, "world");
    }).catch(function (err) {
        QUnit.ok(false, err.stack || err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("startsWithAnyOfIgnoreCase()", function () {
    function runTheTests(mippler) {
        /// <param name="mippler" value="function(x){return x;}"></param>
        //
        // Basic Flow:
        //
        return mippler(db$2.folders
            .where('path').startsWithAnyOfIgnoreCase('/usr/local', '/var'))
            .toArray(function (result) {
            QUnit.equal(result.length, 7, "Query should match 7 folders");
            QUnit.ok(result.some(function (x) { return x.path == '/USR/local/VAR'; }), '/USR/local/VAR');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local'; }), '/usr/local');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/bin'; }), '/usr/local/bin');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/src'; }), '/usr/local/src');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/var'; }), '/usr/local/var');
            QUnit.ok(result.some(function (x) { return x.path == '/var'; }), '/var');
            QUnit.ok(result.some(function (x) { return x.path == '/var/bin'; }), '/var/bin');
            //
            // Require a slash at beginning (and use an array of strings as argument instead)
            //
            return mippler(db$2.folders
                .where('path').startsWithAnyOfIgnoreCase(['/usr/local/', '/var/']))
                .toArray();
        }).then(function (result) {
            QUnit.equal(result.length, 5, "Query should match 5 folders");
            QUnit.ok(result.some(function (x) { return x.path == '/USR/local/VAR'; }), '/USR/local/VAR');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/bin'; }), '/usr/local/bin');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/src'; }), '/usr/local/src');
            QUnit.ok(result.some(function (x) { return x.path == '/usr/local/var'; }), '/usr/local/var');
            QUnit.ok(result.some(function (x) { return x.path == '/var/bin'; }), '/var/bin');
            //
            // Some specialities
            //
            return Dexie__default.Promise.all(mippler(db$2.folders.where('path').startsWithAnyOfIgnoreCase([])).count(), // Empty
            mippler(db$2.folders.where('path').startsWithAnyOfIgnoreCase('/var', '/var', '/var')).count(), // Duplicates
            mippler(db$2.folders.where('path').startsWithAnyOfIgnoreCase('')).count(), // Empty string should match all
            mippler(db$2.folders).count(), mippler(db$2.folders.where('path').startsWithAnyOfIgnoreCase('nonexisting')).count() // Non-existing match
            );
        }).then(function (results) {
            QUnit.equal(results[0], 0, "startsWithAnyOfIgnoreCase([]).count() == 0");
            QUnit.equal(results[1], 2, "startsWithAnyOfIgnoreCase('/var', '/var', '/var').count() == 2");
            QUnit.equal(results[2], results[3], "startsWithAnyOfIgnoreCase('').count() == db.folders.count()");
            QUnit.equal(results[4], 0, "startsWithAnyOfIgnoreCase('nonexisting').count() == 0");
            //
            // Error handling
            //
            return mippler(db$2.folders.where('path').startsWithAnyOfIgnoreCase([null, '/'])).toArray(function (res) {
                QUnit.ok(false, "Should not succeed to have null in parameter");
            }).catch(function (e) {
                QUnit.ok(true, "As expected: failed to have null in arguments: " + e);
            });
        });
    }
    // Run tests without transaction and without reverse()
    runTheTests(function (x) { return x; }).then(function () {
        QUnit.ok(true, "FINISHED NORMAL TEST!");
        // Run tests with reverse()
        return runTheTests(function (x) { return x.reverse(); });
    }).then(function () {
        QUnit.ok(true, "FINISHED REVERSE TEST!");
        // Run tests within a transaction
        return db$2.transaction('r', db$2.folders, db$2.files, function () {
            return runTheTests(function (x) { return x; });
        });
    }).then(function () {
        QUnit.ok(true, "FINISHED TRANSACTION TEST!");
    }).catch(function (e) {
        QUnit.ok(false, "Error: " + e);
    }).finally(QUnit.start);
});
promisedTest("where({key: value})", function () { return __awaiter(void 0, void 0, void 0, function () {
    var readme, noResult, ullaBella1, ullaBella2, ullaBella3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db$2.files.where({ filename: "README" }).first()];
            case 1:
                readme = _a.sent();
                QUnit.ok(readme, 'Should get a result for db.files.get({filename: "README"});');
                QUnit.equal(readme.extension, ".TXT", "Should get README.TXT");
                return [4 /*yield*/, db$2.files.get({ filename: "README", extension: ".TXT" })];
            case 2:
                readme = _a.sent();
                QUnit.ok(readme, 'Should get a result for db.files.get({filename: "README", extension: ".TXT"});');
                return [4 /*yield*/, db$2.files.get({ filename: "apa", extension: "otto" })];
            case 3:
                noResult = _a.sent();
                QUnit.ok(!noResult, "Should not get a result when querying non-existing stuff");
                // Friends have single indexes on "name" and "age"
                return [4 /*yield*/, db$2.friends.add({ name: "Ulla Bella", number: 888, age: 88 })];
            case 4:
                // Friends have single indexes on "name" and "age"
                _a.sent();
                // People have compound index for [name, number]
                return [4 /*yield*/, db$2.chaps.add({ name: "Ulla Bella", number: 888, age: 88 })];
            case 5:
                // People have compound index for [name, number]
                _a.sent();
                // Folders haven't indexed any of "name", "number" or "age"
                return [4 /*yield*/, db$2.folders.add({ name: "Ulla Bella", number: 888, age: 88 })];
            case 6:
                // Folders haven't indexed any of "name", "number" or "age"
                _a.sent();
                return [4 /*yield*/, db$2.friends.get({ name: "Ulla Bella", number: 888 })];
            case 7:
                ullaBella1 = _a.sent();
                QUnit.ok(!!ullaBella1, "Should be able to query multiple columns even when only one of them is indexed");
                return [4 /*yield*/, db$2.chaps.get({ name: "Ulla Bella", number: 888 })];
            case 8:
                ullaBella2 = _a.sent();
                QUnit.ok(!!ullaBella2, "Should be able to query multiple columns. This time utilizing compound index.");
                return [4 /*yield*/, db$2.chaps.get({ number: 888, name: "Ulla Bella" })];
            case 9:
                ullaBella3 = _a.sent();
                QUnit.ok(!!ullaBella3, "Should be able to utilize compound index no matter the order of criterias.");
                return [4 /*yield*/, db$2.folders.get({ name: "Ulla Bella", number: 888 }).then(function (ulla) {
                        QUnit.ok(false, "Should not get Ulla Bella when no index was found");
                    }).catch('SchemaError', function (e) {
                        QUnit.ok(true, "Got SchemaError because we're not utilizing any index at all: " + e);
                    })];
            case 10:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
promisedTest("orderBy(['idx1','idx2'])", function () { return __awaiter(void 0, void 0, void 0, function () {
    var files;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!supports("compound")) {
                    QUnit.ok(true, "Browser does not support compound indexes. Ignoring test.");
                    return [2 /*return*/];
                }
                db$2.files.add({ filename: "hello", extension: ".bat" });
                return [4 /*yield*/, db$2.files.orderBy(["filename", "extension"]).toArray()];
            case 1:
                files = _a.sent();
                QUnit.equal(files.length, 5, "Should be 5 files in total that has both filename and extension");
                QUnit.equal(files.map(function (f) { return f.filename + f.extension; }).join(','), "README.TXT,hello.bat,hello.exe,hello-there.exe,world.js", 'Files should be ordered according to the orderBy query');
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Issue #696 - Query on multiple multi-entry indexes doesn't seem to work", function () { return __awaiter(void 0, void 0, void 0, function () {
    var cat_a, cat_a_tag_a;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!supports("multientry")) {
                    QUnit.ok(true, "No support for multiEntry in browser. Skippping.");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, db$2.multiMulti.bulkAdd([
                        { id: 1, name: "Foo", age: 42, categories: ['cat_a', 'cat_b'], tags: ['tag_a', 'tag_b'] },
                        { id: 2, name: "Bar", age: 32, categories: ['cat_b', 'cat_c'], tags: ['tag_b', 'tag_c'] }
                    ])];
            case 1:
                _a.sent();
                return [4 /*yield*/, db$2.multiMulti.where({ categories: 'cat_a' }).distinct().toArray()];
            case 2:
                cat_a = _a.sent();
                QUnit.equal(cat_a.length, 1, "Should get one item");
                return [4 /*yield*/, db$2.multiMulti.where({ 'categories': 'cat_a', 'tags': 'tag_a' })
                        .distinct()
                        .toArray()];
            case 3:
                cat_a_tag_a = _a.sent();
                QUnit.equal(cat_a_tag_a.length, 1, "Should get one item here as well");
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Virtual Index", function () { return __awaiter(void 0, void 0, void 0, function () {
    var davids, daves;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!supports('compound'))
                    return [2 /*return*/, QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED")];
                return [4 /*yield*/, db$2.chaps.bulkAdd([{
                            name: "David",
                            number: 2
                        }, {
                            name: "David",
                            number: 3
                        }, {
                            name: "David",
                            number: 1
                        }, {
                            name: "Mambo",
                            number: 5
                        }])];
            case 1:
                _a.sent();
                return [4 /*yield*/, db$2.chaps.where({ name: "David" }).toArray()];
            case 2:
                davids = _a.sent();
                QUnit.equal(davids.length, 3, "There should be 3 Davids in the result");
                return [4 /*yield*/, db$2.chaps.where('name').equalsIgnoreCase('david').toArray()];
            case 3:
                daves = _a.sent();
                QUnit.equal(JSON.stringify(daves.map(function (_a) {
                    var name = _a.name, number = _a.number;
                    return ({ name: name, number: number });
                }), null, 2), JSON.stringify([
                    { name: "David", number: 1 },
                    { name: "David", number: 2 },
                    { name: "David", number: 3 }
                ], null, 2), "equalsIgnoreCase() should work with virtual indexes");
                return [2 /*return*/];
        }
    });
}); });
promisedTest("WhereClause.equals(invalid key)", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db$2.files.where("filename").equals(null).first().then(function () {
                    QUnit.ok(false, "db.files.where('filename').equals(null) must fail but it didnt!");
                }).catch(function (error) {
                    QUnit.ok(true, "db.files.where('filename').equals(null) failed as expected (with " + error + ")");
                })];
            case 1:
                _a.sent();
                return [4 /*yield*/, db$2.files.where("filename").equals(undefined).first().then(function () {
                        QUnit.ok(false, "db.files.where('filename').equals(undefined) must fail but it didnt!");
                    }).catch(function (error) {
                        QUnit.ok(true, "db.files.where('filename').equals(undefined) failed as expected (with " + error + ")");
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, db$2.files.where("filename").equals(function () { }).first().then(function () {
                        QUnit.ok(false, "db.files.where('filename').equals(function(){}) must fail but it didnt!");
                    }).catch(function (error) {
                        QUnit.ok(true, "db.files.where('filename').equals(function(){}) failed as expected (with " + error + ")");
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });

var db$3 = new Dexie__default("TestDBTrans");
db$3.version(1).stores({
    users: "username",
    pets: "++id,kind",
    petsPerUser: "++,user,pet"
});
QUnit.module("transaction", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db$3).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
    }
});
var NativePromise = window.Promise;
QUnit.asyncTest("Transaction should work when returning native Promise in transaction scope", function () {
    if (!NativePromise) {
        QUnit.ok(true, "Current Browser doesn't have a native Promise");
        return QUnit.start();
    }
    db$3.transaction('rw', db$3.users, function (trans) {
        QUnit.ok(Dexie__default.currentTransaction === trans, "First argument to transaction callback should be the transaction instance itself");
        return NativePromise.resolve().then(function () {
            QUnit.ok(Dexie__default.currentTransaction === trans, "Dexie.currentTransaction should persted through the native promise!");
        }).then(function () {
            return db$3.users.add({ username: "barfoo" }); // Will only work on Chrome, Opera and Edge as of Oktober 6, 2016.
        }).then(function () {
            QUnit.ok(Dexie__default.currentTransaction === trans, "Dexie.currentTransaction should persted through the native promise!");
            return db$3.users.count();
        });
    }).then(function (count) {
        QUnit.ok(true, "User count: " + count + ". REJOICE! YOUR BROWSER'S INDEXEDDB PLAYS BALL WITH PROMISES!");
    }).catch('TransactionInactiveError', function (e) {
        QUnit.ok(true, "Your browser has native incompatibility between native Promise and IndexedDB. This is why we still avoid returning native promises.");
    }).catch(function (e) {
        QUnit.ok(false, "Failed: " + (e.stack || e));
    }).finally(QUnit.start);
});
QUnit.asyncTest("empty transaction block", function () {
    db$3.transaction('rw', db$3.users, db$3.pets, function () {
        QUnit.ok(true, "Entering transaction block but dont start any transaction");
        // Leave it empty. 
    }).catch(function (err) {
        QUnit.ok(false, err);
    }).finally(function () {
        setTimeout(QUnit.start, 10);
    });
});
QUnit.asyncTest("db.transaction()", function () {
    db$3.transaction('rw', db$3.users, function () {
        db$3.users.add({ username: "arne" });
        return db$3.users.get("arne", function (user) {
            QUnit.equal(user.username, "arne", "Got user arne the line after adding it - we must be in a transaction");
            QUnit.ok(Dexie__default.currentTransaction != null, "Current Transaction must be set");
        });
    }).then(function () {
        QUnit.ok(Dexie__default.currentTransaction == null, "Current Transaction must be null even when transaction scope returned a Promise that was bound to the transaction");
    }).finally(QUnit.start);
});
QUnit.asyncTest("Table not in transaction", function () {
    db$3.pets.add({ kind: "dog" }).then(function () {
        return db$3.transaction('rw', db$3.users, function () {
            db$3.users.add({ username: "arne" });
            return db$3.pets.get(1, function (pet) {
                QUnit.ok(false, "Should not be able to get a pet because pets is not in transaction");
            });
        }).then(function () {
            QUnit.ok(false, "Transaction should not commit because I made an error");
        }).catch(function (err) {
            QUnit.ok(true, "Got error since we tried using a table not in transaction: " + err.stack);
        });
    }).finally(QUnit.start);
});
QUnit.asyncTest("Table not in transaction 2", function () {
    return db$3.transaction('rw', db$3.users, function () {
        db$3.pets.add({ kind: "dog" });
    }).then(function () {
        QUnit.ok(false, "Transaction should not commit because I made an error");
    }).catch(function (err) {
        QUnit.ok(true, "Got error since we tried using a table not in transaction: " + err.stack);
    }).finally(QUnit.start);
});
QUnit.asyncTest("Write into readonly transaction", function () {
    return db$3.transaction('r', db$3.users, function () {
        db$3.users.add({ username: "arne" }).then(function () {
            QUnit.ok(false, "Should not be able to get a here because we tried to write to users when in a readonly transaction");
        });
    }).then(function () {
        QUnit.ok(false, "Transaction should not commit because I made an error");
    }).catch(function (err) {
        QUnit.ok(true, "Got error since we tried to write to users when in a readonly transaction: " + err.stack);
    }).finally(QUnit.start);
});
QUnit.asyncTest("Inactive transaction", function () {
    return db$3.transaction('rw', db$3.users, function () {
        return new Dexie__default.Promise(function (resolve, reject) {
            // Notify log when transaction completes too early
            Dexie__default.currentTransaction.complete(function () {
                QUnit.ok(true, "Transaction committing too early...");
                // Resolve the promise after transaction commit.
                // Flow will continue in the same Transaction scope but with an
                // inactive transaction
                resolve();
            });
        }).then(function () {
            // Now when transaction has already committed, try to add a user with the current transaction:
            return db$3.users.add({ username: "arne" });
        }).then(function () {
            QUnit.ok(false, "Should not be able to get a here transaction has become inactive");
        });
    }).then(function () {
        QUnit.ok(false, "Should not be able to get a here transaction has become inactive");
    }).catch(function (err) {
        QUnit.ok(true, "Got error because the transaction has already committed: " + err.stack);
    }).finally(QUnit.start);
});
QUnit.asyncTest("Inactive transaction 2", function () {
    return db$3.transaction('rw', db$3.users, function () {
        // First make an operation so that transaction is internally created (this is the thing differing from the previous test case
        return db$3.users.add({ username: "arne" }).then(function () {
            // Create a custom promise that will use setTimeout() so that IDB transaction will commit
            return new Dexie__default.Promise(function (resolve, reject) {
                // Notify log when transaction completes too early
                Dexie__default.currentTransaction.complete(function () {
                    QUnit.ok(true, "Transaction committing too early...");
                    resolve();
                });
            });
        }).then(function () {
            // Now when transaction has already committed, try to add a user with the current transaction:
            return db$3.users.add({ username: "arne" });
        }).then(function () {
            QUnit.ok(false, "Should not be able to get a here transaction has become inactive");
        });
    }).then(function () {
        QUnit.ok(false, "Should not be able to get a here transaction has become inactive");
    }).catch(function (err) {
        QUnit.ok(true, "Got error because the transaction has already committed: " + err.stack);
    }).finally(QUnit.start);
});
QUnit.asyncTest("sub-transactions", function () {
    var parentTrans;
    function addUser(user, pets) {
        return db$3.transaction('rw', db$3.users, db$3.pets, db$3.petsPerUser, function () {
            QUnit.ok(parentTrans._reculock > 0, "Parent transaction is locked");
            db$3.users.add(user);
            pets.forEach(function (pet) {
                db$3.pets.add(pet).then(function (petId) {
                    return db$3.petsPerUser.add({ user: user.username, pet: petId });
                });
            });
        }).then(function () {
            return db$3.transaction('rw', db$3.users, function () {
                db$3.users.add({ username: user.username + "2" });
                return "hello...";
            });
        });
    }
    db$3.transaction('rw', db$3.users, db$3.pets, db$3.petsPerUser, function () {
        var trans = Dexie__default.currentTransaction;
        parentTrans = Dexie__default.currentTransaction;
        QUnit.ok(trans._reculock === 0, "Main transaction not locked yet");
        addUser({ username: "user1" }, [{ kind: "dog" }, { kind: "cat" }]).then(function () {
            db$3.users.get("someoneelse", function (someone) {
                QUnit.equal(someone.username, "someoneelse", "Someonelse was recently added");
            });
        });
        QUnit.ok(trans._reculock > 0, "Main transaction is now locked");
        db$3.users.get("someoneelse", function (someone) {
            QUnit.ok(!someone, "Someoneelse not yet added");
        });
        db$3.users.add({ username: "someoneelse" });
        return addUser({ username: "user2" }, [{ kind: "giraff" }]).then(function (val) {
            QUnit.ok(trans._reculock == 0, "Main transaction not locked anymore");
            return val;
        });
    }).then(function (retval) {
        QUnit.equal(retval, "hello...", "Return value went all the way down to transaction resolvance");
        QUnit.ok(Dexie__default.currentTransaction == null, "Dexie.currentTransaction is null");
        db$3.users.count(function (count) {
            QUnit.equal(count, 5, "There are five users in db");
        });
        db$3.pets.count(function (count) {
            QUnit.equal(count, 3, "There are three pets in db");
        });
        db$3.petsPerUser.count(function (count) {
            QUnit.equal(count, 3, "There are three pets-to-user relations");
        });
    }).then(function () {
        QUnit.ok(Dexie__default.currentTransaction == null, "Dexie.currentTransaction is null");
        // Start an outer transaction
        return db$3.transaction('rw', db$3.users, function () {
            // Do an add operation
            db$3.users.add({ username: "sune" }); //.then(function () {
            // Start an inner transaction
            db$3.transaction('rw', db$3.users, function () {
                // Do an add-operation that will result in ConstraintError:
                db$3.users.add({ username: "sune" });
            }).then(function () {
                QUnit.ok(false, "Transaction shouldn't have committed");
            }).catch("ConstraintError", function (err) {
                QUnit.ok(true, "Got ContraintError when trying to add multiple users with same username");
            }).catch(function (err) {
                QUnit.ok(false, "Got unknown error: " + err);
            });
            //});
        }).catch("ConstraintError", function (err) {
            // Yes, it should fail beause of limited rollback support on nested transactions:
            // https://github.com/dfahlander/Dexie.js/wiki/Dexie.transaction()#limitations-with-nested-transactions
            QUnit.ok(true, "Got constraint error on outer transaction as well");
        });
    }).catch(function (err) {
        QUnit.ok(false, "Error: " + err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("Three-level sub transactions", function () {
    db$3.transaction('rw', db$3.users, db$3.pets, db$3.petsPerUser, function () {
        db$3.users.add({ username: "ojsan" });
        db$3.transaction('rw', db$3.users, db$3.pets, function () {
            db$3.users.add({ username: "ojsan2" });
            db$3.users.toCollection().delete();
            db$3.transaction('r', db$3.users, function () {
                db$3.users.toArray(function (usersArray) {
                    QUnit.equal(usersArray.length, 0, "All users should be deleted");
                    Dexie__default.currentTransaction.abort();
                });
            });
        });
    }).then(function () {
        QUnit.ok(false, "Shouldnt work");
    }).catch(function (err) {
        QUnit.ok(true, "Got error: " + err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("Table not in main transactions", function () {
    Dexie__default.Promise.resolve().then(function () {
        return db$3.transaction('rw', db$3.users, function () {
            db$3.users.add({ username: "bertil" });
            db$3.transaction('rw', db$3.users, db$3.pets, function () {
                db$3.pets.add({ kind: "cat" });
            });
        });
    }).then(function () {
        QUnit.ok(false, "Shouldnt work");
    }).catch(function (err) {
        QUnit.ok(true, "Got error: " + err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("Transaction is not in read-mode", function () {
    db$3.transaction('r', db$3.users, db$3.pets, function () {
        db$3.users.toArray();
        db$3.transaction('rw', db$3.users, db$3.pets, function () {
            db$3.pets.add({ kind: "cat" });
        });
    }).then(function () {
        QUnit.ok(false, "Shouldnt work");
    }).catch(function (err) {
        QUnit.ok(true, "Got error: " + err);
    }).finally(QUnit.start);
});
//
// Testing the "!" mode
//
QUnit.asyncTest("'!' mode: Table not in main transactions", function () {
    var counter = 0;
    db$3.transaction('rw', db$3.users, function () {
        db$3.users.add({ username: "bertil" });
        db$3.transaction('rw!', db$3.users, db$3.pets, function () {
            db$3.pets.add({ kind: "cat" });
        }).then(function () {
            QUnit.ok(true, "Inner transaction complete");
        }).catch(function (err) {
            QUnit.ok(false, "Got error in inner transaction: " + err);
        }).finally(function () {
            if (++counter == 2)
                QUnit.start();
        });
        Dexie__default.currentTransaction.abort(); // Aborting outer transaction should not abort inner.
    }).then(function () {
        QUnit.ok(false, "Outer transaction should not complete");
    }).catch(function (err) {
        QUnit.ok(true, "Got Abort Error: " + err);
    }).finally(function () {
        if (++counter == 2)
            QUnit.start();
    });
});
QUnit.asyncTest("'!' mode: Transaction is not in read-mode", function () {
    var counter = 0;
    db$3.transaction('r', db$3.users, db$3.pets, function () {
        db$3.users.toArray();
        db$3.transaction('rw!', db$3.users, db$3.pets, function () {
            db$3.pets.add({ kind: "cat" });
        }).then(function () {
            QUnit.ok(true, "Inner transaction complete");
        }).catch(function (err) {
            QUnit.ok(false, "Got error: " + err);
        }).finally(function () {
            if (++counter == 2)
                QUnit.start();
        });
    }).then(function () {
        QUnit.ok(true, "Outer transaction complete");
    }).catch(function (err) {
        QUnit.ok(false, "Got error: " + err);
    }).finally(function () {
        if (++counter == 2)
            QUnit.start();
    });
});
QUnit.asyncTest("'!' mode: Transaction bound to different db instance", function () {
    var counter = 0;
    var db2 = new Dexie__default("TestDB2");
    db2.version(1).stores({
        users: "username",
        pets: "++id,kind",
        petsPerUser: "++,user,pet"
    });
    db2.delete()
        .then(function () { return db2.open(); })
        .then(function () { return db$3.transaction('rw', "users", "pets", function () {
        db2.transaction('rw!', "users", "pets", function () {
            QUnit.ok(true, "Possible to enter a transaction in db2");
        }).catch(function (err) {
            QUnit.ok(false, "Got error: " + err);
        }).finally(function () {
            if (++counter == 2)
                db2.delete().then(QUnit.start);
            console.log("finally() in db2.transaction(). counter == " + counter);
        });
    }); }).finally(function () {
        if (++counter == 2)
            db2.delete().then(QUnit.start);
        console.log("finally() in db.transaction(). counter == " + counter);
    });
});
//
// Testing the "?" mode
//
QUnit.asyncTest("'?' mode: Table not in main transactions", function () {
    var counter = 0;
    db$3.transaction('rw', db$3.users, function () {
        db$3.users.add({ username: "bertil" });
        db$3.transaction('rw?', db$3.users, db$3.pets, function () {
            db$3.pets.add({ kind: "cat" });
        }).then(function () {
            QUnit.ok(true, "Inner transaction complete");
        }).catch(function (err) {
            QUnit.ok(false, "Got error in inner transaction: " + err);
        }).finally(function () {
            if (++counter == 2)
                QUnit.start();
        });
        Dexie__default.currentTransaction.abort(); // Aborting outer transaction should not abort inner.
    }).then(function () {
        QUnit.ok(false, "Outer transaction should not complete");
    }).catch(function (err) {
        QUnit.ok(true, "Got Abort Error: " + err);
    }).finally(function () {
        if (++counter == 2)
            QUnit.start();
    });
});
QUnit.asyncTest("'?' mode: Transaction is not in read-mode", function () {
    var counter = 0;
    db$3.transaction('r', db$3.users, db$3.pets, function () {
        db$3.users.toArray();
        db$3.transaction('rw?', db$3.users, db$3.pets, function () {
            db$3.pets.add({ kind: "cat" });
        }).then(function () {
            QUnit.ok(true, "Inner transaction complete");
        }).catch(function (err) {
            QUnit.ok(false, "Got error: " + err);
        }).finally(function () {
            if (++counter == 2)
                QUnit.start();
        });
    }).then(function () {
        QUnit.ok(true, "Outer transaction complete");
    }).catch(function (err) {
        QUnit.ok(false, "Got error: " + err);
    }).finally(function () {
        if (++counter == 2)
            QUnit.start();
    });
});
QUnit.asyncTest("'?' mode: Transaction bound to different db instance", function () {
    var counter = 0;
    var db2 = new Dexie__default("TestDB2");
    db2.version(1).stores({
        users: "username",
        pets: "++id,kind",
        petsPerUser: "++,user,pet"
    });
    db2.open();
    db$3.transaction('rw', "users", "pets", function () {
        db2.transaction('rw?', "users", "pets", function () {
            QUnit.ok(true, "Possible to enter a transaction in db2");
        }).catch(function (err) {
            QUnit.ok(false, "Got error: " + err);
        }).finally(function () {
            if (++counter == 2)
                db2.delete().then(QUnit.start);
        });
    }).finally(function () {
        if (++counter == 2)
            db2.delete().then(QUnit.start);
    });
});
QUnit.asyncTest("'?' mode: Three-level sub transactions", function () {
    db$3.transaction('rw', db$3.users, db$3.pets, db$3.petsPerUser, function () {
        db$3.users.add({ username: "ojsan" });
        db$3.transaction('rw?', db$3.users, db$3.pets, function () {
            db$3.users.add({ username: "ojsan2" });
            db$3.users.toCollection().delete();
            db$3.transaction('r?', db$3.users, function () {
                db$3.users.toArray(function (usersArray) {
                    QUnit.equal(usersArray.length, 0, "All users should be deleted");
                    Dexie__default.currentTransaction.abort();
                });
            });
        });
    }).then(function () {
        QUnit.ok(false, "Shouldnt work");
    }).catch(function (err) {
        QUnit.ok(true, "Got error: " + err);
    }).finally(QUnit.start);
});
QUnit.asyncTest("Transactions in multiple databases", function () {
    var logDb = new Dexie__default("logger");
    logDb.version(1).stores({
        log: "++,time,type,message"
    });
    var lastLogAddPromise;
    logDb.open().then(function () {
        return db$3.transaction('rw', db$3.pets, function () {
            // Test that a non-transactional add in the other DB can coexist with
            // the current transaction on db:
            logDb.log.add({ time: new Date(), type: "info", message: "Now adding a dog" });
            db$3.pets.add({ kind: "dog" }).then(function (petId) {
                // Test that a transactional add in the other DB can coexist with
                // the current transaction on db:
                lastLogAddPromise = logDb.transaction('rw!', logDb.log, function () {
                    logDb.log.add({ time: new Date(), type: "info", message: "Added dog got key " + petId });
                });
            });
        });
    }).then(function () {
        return lastLogAddPromise; // Need to wait for the transaction of the other database to complete as well.
    }).then(function () {
        return logDb.log.toArray();
    }).then(function (logItems) {
        QUnit.equal(logItems.length, 2, "Log has two items");
        QUnit.equal(logItems[0].message, "Now adding a dog", "First message in log is: " + logItems[0].message);
        QUnit.ok(logItems[1].message.indexOf("Added dog got key ") === 0, "Second message in log is: " + logItems[1].message);
    }).catch(function (err) {
        QUnit.ok(false, err);
    }).finally(function () {
        return logDb.delete();
    }).finally(QUnit.start);
});
QUnit.asyncTest("Issue #71 If returning a Promise from from a sub transaction, parent transaction will abort", function () {
    db$3.transaction('rw', db$3.users, db$3.pets, function () {
        QUnit.ok(true, "Entered parent transaction");
        QUnit.ok(true, "Now adding Gunnar in parent transaction");
        db$3.users.add({ username: "Gunnar" }).then(function () {
            QUnit.ok(true, "First add on parent transaction finished. Now adding another object in parent transaction.");
            db$3.pets.add({ kind: "cat", name: "Garfield" }).then(function () {
                QUnit.ok(true, "Successfully added second object in parent transaction.");
            }).catch(function (err) {
                QUnit.ok(false, "Failed to add second object in parent transaction: " + err.stack || err);
            });
        });
        db$3.transaction('rw', db$3.users, function () {
            QUnit.ok(true, "Entered sub transaction");
            return db$3.users.add({ username: "JustAnnoyingMyParentTransaction" }).then(function () {
                QUnit.ok(true, "Add on sub transaction succeeded");
            }).catch(function (err) {
                QUnit.ok(false, "Failed to add object in sub transaction: " + err.stack || err);
            });
        });
    }).finally(QUnit.start);
});
QUnit.asyncTest("Issue #91 Promise.resolve() from within parent transaction", function () {
    db$3.transaction('rw', db$3.users, db$3.pets, function () {
        QUnit.ok(true, "Entered parent transaction");
        var trans = Dexie__default.currentTransaction;
        return db$3.transaction('rw', db$3.users, function () {
            QUnit.ok(true, "Entered sub transaction");
            QUnit.ok(Dexie__default.currentTransaction !== trans, "We are not in parent transaction");
            QUnit.ok(Dexie__default.currentTransaction.parent === trans, "...but in a sub transaction");
            return Dexie__default.Promise.resolve(3);
        }).then(function (result) {
            QUnit.equal(result, 3, "Got 3");
            QUnit.ok(Dexie__default.currentTransaction === trans, "Now we are in parent transaction");
            db$3.users.add({ username: "Gunnar" });
            return db$3.users.where("username").equals("Gunnar").first();
        }).then(function (result) {
            QUnit.ok(!!result, "Got result");
            QUnit.equal(result.username, "Gunnar", "Got the Gunnar we expected");
            return Dexie__default.Promise.resolve(result);
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e.stack);
        });
    }).then(function (result) {
        QUnit.ok(!!result, "Got result");
        QUnit.equal(result.username, "Gunnar", "Got the Gunnar we expected");
    }).catch(function (e) {
        QUnit.ok(false, "Error at root scope: " + e.stack);
    }).finally(QUnit.start);
});
QUnit.asyncTest("Issue #95 Nested transactions fails if parent transaction don't execute any operation", function () {
    function smallChild() {
        return db$3.transaction('rw', db$3.users, db$3.pets, function () {
            console.log("Entering small child");
            return db$3.users.add({
                username: 123,
                value: 'val'
            }).then(function (res) {
                QUnit.ok(true, "smallChild() could add user with primary key " + res);
                return res;
            }).catch(function (err) {
                QUnit.ok(false, 'SCCA' + err);
            });
        }).then(function (res) {
            QUnit.ok(true, "smallChild's 3rd level nested transaction commited with result " + res);
        }).catch(function (err) {
            QUnit.ok(false, 'SCTR' + err);
        });
    }
    function middleChild() {
        return db$3.transaction('rw', db$3.users, db$3.pets, function () {
            console.log("Entering middle child");
            return db$3.pets.add({
                id: 321,
                value: 'anotherval'
            }).catch(function (err) {
                QUnit.ok(false, 'MCCA' + err);
            });
        }).catch(function (err) {
            QUnit.ok(false, 'MCTR' + err);
        });
    }
    function bigParent() {
        // Nesting transaction without starting the real indexedDB transaction cause an error?
        return db$3.transaction('rw', db$3.users, db$3.pets, function () {
            console.log("Entering root transaction");
            return db$3.transaction('rw', db$3.users, db$3.pets, function () {
                console.log("Entering first sub transaction");
                return smallChild().then(function () {
                    return middleChild();
                }).catch(function (err) {
                    QUnit.ok(false, 'BPCA ' + err);
                });
            }).catch(function (err) {
                QUnit.ok(false, 'BPTRI ' + err);
            });
        }).catch(function (err) {
            QUnit.ok(false, 'BPTRX ' + err);
        });
    }
    bigParent().then(function (res) {
        QUnit.ok(true, "done");
    }).catch(function (e) {
        QUnit.ok(false, "Final error: " + e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("Issue #91 / #95 with Dexie.Promise.resolve() mixed in here and there...", function () {
    QUnit.ok(!Dexie__default.currentTransaction, "There is no ongoing transaction");
    db$3.transaction('rw', db$3.pets, function () {
        var rootLevelTransaction = Dexie__default.currentTransaction;
        QUnit.ok(true, "Entered root transaction scope");
        return db$3.transaction('rw', db$3.pets, function () {
            QUnit.ok(true, "Entered sub scope");
            var level2Transaction = Dexie__default.currentTransaction;
            QUnit.ok(level2Transaction.parent === rootLevelTransaction, "Level2 transaction's parent is the root level transaction");
            return db$3.transaction('rw', db$3.pets, function () {
                QUnit.ok(true, "Entered sub of sub scope");
                var innermostTransaction = Dexie__default.currentTransaction;
                QUnit.ok(!!innermostTransaction, "There is an ongoing transaction (direct in 3rd level scope)");
                QUnit.ok(innermostTransaction.parent === level2Transaction, "Parent is level2 transaction");
                return Dexie__default.Promise.resolve().then(function () {
                    QUnit.ok(true, "Sub of sub scope: Promise.resolve().then() called");
                    QUnit.ok(!!Dexie__default.currentTransaction, "There is an ongoing transaction");
                    QUnit.ok(Dexie__default.currentTransaction === innermostTransaction, "Still in innermost transaction");
                    return db$3.pets.add({
                        id: 123,
                        value: 'val'
                    }).then(function (resultId) {
                        QUnit.ok(true, "Sub of sub scope: add() resolved");
                        QUnit.ok(Dexie__default.currentTransaction === innermostTransaction, "Still in innermost transaction");
                        return Dexie__default.Promise.resolve(resultId).then(function (res) {
                            return Dexie__default.Promise.resolve(res);
                        });
                    }).then(function (resultId) {
                        QUnit.ok(true, "Sub if sub scope: Promise.resolve() after add() resolve");
                        QUnit.ok(Dexie__default.currentTransaction === innermostTransaction, "Still in innermost transaction");
                        return Dexie__default.Promise.resolve(resultId);
                    });
                }).then(function () {
                    QUnit.ok(true, "sub of sub scope chaining further in promise chains...");
                    QUnit.ok(Dexie__default.currentTransaction === innermostTransaction, "Still in innermost transaction");
                    return Dexie__default.Promise.resolve(db$3.pets.get(123));
                }).then(function (pet) {
                    QUnit.ok(true, "sub of sub scope chaining further in promise chains 2...");
                    QUnit.ok(Dexie__default.currentTransaction === innermostTransaction, "Still in innermost transaction");
                    return Dexie__default.Promise.resolve(pet.id);
                });
            }).then(function (resultId) {
                QUnit.ok(true, "Innermost transaction completed");
                QUnit.ok(Dexie__default.currentTransaction == level2Transaction, "We should now be executing within level 2 sub transaction");
                return Dexie__default.Promise.resolve(resultId);
            }).then(function (resultId) {
                QUnit.ok(Dexie__default.currentTransaction == level2Transaction, "We should still be executing within level 2 sub transaction");
                return Dexie__default.Promise.resolve(resultId);
            }).then(function (resultId) {
                QUnit.equal(resultId, 123, "Result was 123 as expected");
            }).then(function () {
                return db$3.transaction('rw', db$3.pets, function () {
                    var innermostTransaction2 = Dexie__default.currentTransaction;
                    QUnit.ok(innermostTransaction2.parent == level2Transaction, "Another 3rd level transaction has parent set to our level2 transaction");
                    return db$3.pets.add({
                        id: 321,
                        value: 'val'
                    }).then(function (resultId2) {
                        return Dexie__default.Promise.resolve(resultId2);
                    }).then(function (resultId2) {
                        QUnit.ok(Dexie__default.currentTransaction === innermostTransaction2, "We're still in the innermostTransaction (second one)");
                        return Dexie__default.Promise.resolve(resultId2).then(function (x) {
                            QUnit.ok(Dexie__default.currentTransaction === innermostTransaction2, "We're still in the innermostTransaction (second one)");
                            return x;
                        });
                    });
                }).then(function (resultId2) {
                    QUnit.equal(resultId2, 321, "Result2 was 321 as expected");
                    QUnit.ok(Dexie__default.currentTransaction === level2Transaction, "We should still be executing within level 2 sub transaction");
                    return "finalResult";
                });
            });
        }).then(function (x) {
            QUnit.ok(Dexie__default.currentTransaction === rootLevelTransaction, "Now we're at the root level transaction and can do some more stuff here");
            return db$3.pets.clear().then(function () {
                return x;
            }).then(function (y) {
                QUnit.ok(true, "Could clear the pets table for example.");
                return y;
            }).catch(function (e) {
                QUnit.ok(false, "oops, this was not what I expected!: " + e);
            });
        });
    }).then(function (finalResult) {
        QUnit.equal(finalResult, "finalResult", "Got the final result");
        QUnit.ok(!Dexie__default.currentTransaction, "No ongoing transaction now");
        QUnit.ok(true, "done");
    }).catch(function (error) {
        QUnit.ok(false, error.stack);
    }).finally(QUnit.start);
    QUnit.ok(!Dexie__default.currentTransaction, "After main transaction scope: Still no ongoing transaction at this scope");
});
QUnit.asyncTest("Issue #137 db.table() does not respect current transaction", function () {
    db$3.transaction('rw', db$3.users, function () {
        db$3.users.add({ username: "erictheviking", color: "blue" }).then(function () {
            db$3.table('users').get('erictheviking', function (eric) {
                QUnit.ok(eric, "Got back an object");
                QUnit.equal(eric.color, "blue", "eric.color is still blue. If red, the getter must have been run from another transaction.");
            });
            db$3.users.put({ username: "erictheviking", color: "red" });
        });
    }).catch(function (e) {
        QUnit.ok(false, "Error: " + e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("Dexie.currentTransaction in CRUD hooks", 83 /* If fails on num assertions, it's ok to change to expected if all looks fine */, function () {
    function CurrentTransChecker(scope, trans) {
        return function () {
            QUnit.ok(Dexie__default.currentTransaction === trans, "Dexie.currentTransaction correct in " + scope);
        };
    }
    function onCreating(primKey, obj, transaction) {
        QUnit.ok(!!Dexie__default.currentTransaction, "Dexie.currentTransaction should exist in creating");
        QUnit.ok(Dexie__default.currentTransaction === transaction, "Dexie.currentTransaction correct in creating");
        this.onerror = CurrentTransChecker("creating.onerror", transaction);
        this.onsuccess = CurrentTransChecker("creating.onsuccess", transaction);
    }
    function onReading(obj) {
        QUnit.ok(!!Dexie__default.currentTransaction, "Dexie.currentTransaction should exist in reading");
        return obj;
    }
    function onUpdating(modifications, primKey, obj, transaction) {
        QUnit.ok(Dexie__default.currentTransaction === transaction, "Dexie.currentTransaction correct in updating");
        this.onerror = CurrentTransChecker("updating.onerror", transaction);
        this.onsuccess = CurrentTransChecker("updating.onsuccess", transaction);
    }
    function onDeleting(primKey, obj, transaction) {
        QUnit.ok(Dexie__default.currentTransaction === transaction, "Dexie.currentTransaction correct in deleting");
        this.onsuccess = CurrentTransChecker("deleting.onsuccess", transaction);
    }
    db$3.users.hook.creating.subscribe(onCreating);
    db$3.users.hook.reading.subscribe(onReading);
    db$3.users.hook.updating.subscribe(onUpdating);
    db$3.users.hook.deleting.subscribe(onDeleting);
    function doTheTests() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db$3.users.add({ username: "monkey1" })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db$3.users.add({ username: "monkey1" }).catch(function (ex) {
                                QUnit.ok(true, "Should fail adding a second monkey1");
                            })];
                    case 2:
                        _a.sent(); // Trigger creating.onerror
                        // Test bulkAdd as well:
                        QUnit.ok(true, "Testing bulkAdd");
                        return [4 /*yield*/, db$3.users.bulkAdd([{ username: "monkey1" }, { username: "monkey2" }])
                                .then(function () { return QUnit.ok(false, "Should get error on one of the adds"); })
                                .catch(Dexie__default.BulkError, function (e) {
                                QUnit.ok(true, "Got BulkError");
                                QUnit.ok(e.failures.length === 1, "One error out of two: " + e);
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, db$3.users.where("username").equals("monkey1").modify({
                                name: "Monkey 1"
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, db$3.users.where("username").equals("monkey1").modify(function (user) {
                                user.username = "monkey2"; // trigger updating.onerror
                            }).catch(function (ex) {
                                QUnit.ok(true, "Should fail modifying primary key to an already existing primary key");
                            })];
                    case 5:
                        _a.sent();
                        QUnit.ok(true, "Will now be modifying primary key of monkey1...");
                        return [4 /*yield*/, db$3.users.where("username").equals("monkey1").modify(function (user) {
                                user.username = "monkey88"; // trigger updating.onerror
                            }).then(function (res) {
                                QUnit.ok(true, "Should succeed modifying primary key to non-existing primary key, resulting in deletion and creation: " + res);
                            }).catch(function (ex) {
                                QUnit.ok(false, "Should succeed modifying primary key to non-existing primary key, resulting in deletion and creation: " + ex);
                            })];
                    case 6:
                        _a.sent();
                        QUnit.ok(true, "Will now modify monkey88 back to monkey1 again...");
                        return [4 /*yield*/, db$3.users.where({ username: "monkey88" }).modify({ username: "monkey1" })];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, db$3.users.toArray()];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, db$3.users.delete("monkey2")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, db$3.users.delete("monkey1")];
                    case 10:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    
    doTheTests().then(function () {
        var _this = this;
        QUnit.ok(true, "Now in an explicit transaction block...");
        return db$3.transaction('rw', db$3.users, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, doTheTests()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    }).catch(function (ex) {
        QUnit.ok(false, ex);
    }).then(function () {
        db$3.users.hook.creating.unsubscribe(onCreating);
        db$3.users.hook.reading.unsubscribe(onReading);
        db$3.users.hook.updating.unsubscribe(onUpdating);
        db$3.users.hook.deleting.unsubscribe(onDeleting);
        QUnit.start();
    });
});
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
promisedTest("waitFor()", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db$3.transaction('rw', db$3.users, function (trans) { return __awaiter(void 0, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // Wait for a promise:
                            return [4 /*yield*/, trans.waitFor(sleep(100))];
                            case 1:
                                // Wait for a promise:
                                _a.sent();
                                // Do an operation on transaction
                                return [4 /*yield*/, trans.users.put({ username: "testingtesting" })];
                            case 2:
                                // Do an operation on transaction
                                _a.sent();
                                return [4 /*yield*/, trans.waitFor(sleep(100))];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, trans.users.get("testingtesting")];
                            case 4:
                                result = _a.sent();
                                QUnit.ok(result && result.username === "testingtesting", "Should be able to continue transaction after waiting for non-indexedDB promise");
                                QUnit.ok(true, "Waiting spin count:" + trans._spinCount);
                                // With timeout
                                return [4 /*yield*/, Dexie__default.waitFor(sleep(2000), 10) // Timeout of 10 ms.
                                        .then(function () { return QUnit.ok(false, "Should have timed out!"); })
                                        .catch('TimeoutError', function (ex) { return QUnit.ok(true, "Timed out as expected"); })];
                            case 5:
                                // With timeout
                                _a.sent();
                                // Wait for function
                                return [4 /*yield*/, Dexie__default.waitFor(function () { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    QUnit.ok(Dexie__default.currentTransaction === null, "We should not be in the transaction zone here because transaction can be in a temporary inactive state here");
                                                    return [4 /*yield*/, sleep(10)];
                                                case 1:
                                                    _a.sent();
                                                    QUnit.ok(true, "Slept 10 ms");
                                                    // Let's test if we can access the transaction from here.
                                                    // The transaction should be alive indeed but not in an active state.
                                                    return [4 /*yield*/, trans.users.count().then(function () {
                                                            // This happens on IE11
                                                            QUnit.ok(true, "Could access transaction within the wait callback. Nice for you, but you were just lucky!");
                                                        }).catch(function (ex) {
                                                            // This happens on Firefox and Chrome
                                                            QUnit.ok(true, "Could NOT access transaction within the wait callback. As expected. Error: " + ex);
                                                        })];
                                                case 2:
                                                    // Let's test if we can access the transaction from here.
                                                    // The transaction should be alive indeed but not in an active state.
                                                    _a.sent();
                                                    QUnit.ok(Dexie__default.currentTransaction === null, "We should not be in the transaction zone here because transaction can be in inactive state here");
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                            case 6:
                                // Wait for function
                                _a.sent();
                                return [4 /*yield*/, trans.users.get("testingtesting")];
                            case 7:
                                result = _a.sent();
                                QUnit.ok(result && result.username === "testingtesting", "Should still be able to operate on the transaction");
                                QUnit.ok(true, "Waiting spin count:" + trans._spinCount);
                                QUnit.ok(Dexie__default.currentTransaction === trans, "Zone info should still be correct");
                                // Subtransaction
                                return [4 /*yield*/, db$3.transaction('r', db$3.users, function (subTrans) {
                                        var count;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    QUnit.ok(subTrans !== trans, "Should be in a sub transaction");
                                                    QUnit.ok(Dexie__default.currentTransaction === subTrans, "Should be in a sub transaction");
                                                    return [4 /*yield*/, trans.users.count()];
                                                case 1:
                                                    count = _a.sent();
                                                    QUnit.ok(true, "Should be able to operate on sub transaction. User count = " + count);
                                                    return [4 /*yield*/, subTrans.waitFor(sleep(10))];
                                                case 2:
                                                    _a.sent();
                                                    QUnit.ok(true, "Should be able to call waitFor() on sub transaction");
                                                    return [4 /*yield*/, trans.users.count()];
                                                case 3:
                                                    count = _a.sent();
                                                    QUnit.ok(true, "Should be able to operate on sub transaction. User count = " + count);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    })];
                            case 8:
                                // Subtransaction
                                _a.sent();
                                // Calling waitFor multiple times in parallell
                                return [4 /*yield*/, Promise.all([
                                        trans.waitFor(sleep(10)),
                                        trans.waitFor(sleep(10)),
                                        trans.waitFor(sleep(10))
                                    ])];
                            case 9:
                                // Calling waitFor multiple times in parallell
                                _a.sent();
                                QUnit.ok(true, "Could wait for several tasks in parallell");
                                return [4 /*yield*/, trans.users.get("testingtesting")];
                            case 10:
                                result = _a.sent();
                                QUnit.ok(result && result.username === "testingtesting", "Should still be able to operate on the transaction");
                                return [2 /*return*/];
                        }
                    });
                }); }).then(function () { return QUnit.ok(true, "Transaction committed"); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Dexie.waitFor() outside transaction", function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, codeExecuted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Dexie__default.waitFor(sleep(10).then(function () { return true; }))];
            case 1:
                result = _a.sent();
                QUnit.ok(result, "Could call waitFor outside a transaction as well");
                codeExecuted = false;
                return [4 /*yield*/, Dexie__default.waitFor(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, sleep(10)];
                                case 1:
                                    _a.sent();
                                    codeExecuted = true;
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _a.sent();
                QUnit.ok(codeExecuted, "Could call waitFor(function) outside a transation as well");
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Dexie.waitFor() TransactionInactiveError", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db$3.transaction('r', db$3.users, function () { return __awaiter(void 0, void 0, void 0, function () {
                    var err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, sleep(100)];
                            case 1:
                                _a.sent(); // Force transaction to become inactive
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, Dexie__default.waitFor(sleep(10))];
                            case 3:
                                _a.sent();
                                QUnit.ok(false, 'After sleeping, transaction just cannot be alive.');
                                return [3 /*break*/, 5];
                            case 4:
                                err_1 = _a.sent();
                                QUnit.ok(err_1.name == 'TransactionInactiveError' || err_1.name == 'InvalidStateError', "Got TransactionInactiveError or InvalidStateError as expected");
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); }).then(function () {
                    QUnit.ok(false, 'The transaction should not possibly succeed even though catching, because it was too late.');
                }).catch('PrematureCommitError', function (err) {
                    QUnit.ok(true, 'Got PrematureCommitError as expected');
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Promise.follow() should omit promises spawned under Dexie.ignoreTransaction()", function () { return __awaiter(void 0, void 0, void 0, function () {
    var resolve, reject, p, log;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                p = new Promise(function (res, rej) { resolve = res; reject = rej; });
                log = [];
                return [4 /*yield*/, db$3.transaction('r', db$3.users, function () {
                        // Since we do not return a promise here,
                        // Promise.follow() will be used for awaitint all tasks.
                        // However, tasks spawned under Dexie.ignoreTransacion() should not be included in promises to wait for.
                        Dexie__default.ignoreTransaction(function () {
                            return new Dexie__default.Promise(function (resolve) { return setTimeout(resolve, 50); }).then(function () {
                                return db$3.pets.put({ kind: "dog" });
                            }).then(function () {
                                return db$3.pets.count();
                            }).then(function (numPets) {
                                QUnit.ok(true, "num pets: " + numPets);
                                log.push("inner-task-done");
                            }).then(resolve, reject);
                        });
                        // The following promise should be awaited for though (because new Promise is spawned from withing a zone or sub-zone to current transaction.)
                        new Dexie__default.Promise(function (resolve) { return setTimeout(resolve, 25); }).then(function () {
                            //return db.users.get(1);
                        }).then(function () {
                            QUnit.ok(true, "followed promise done");
                            log.push("spawned-promise-done");
                        }).catch(function (e) {
                            QUnit.ok(false, e);
                        });
                    })];
            case 1:
                _a.sent();
                log.push("outer-task-done");
                QUnit.ok(true, "transaction done");
                return [4 /*yield*/, p];
            case 2:
                _a.sent();
                QUnit.equal(log.join(','), "spawned-promise-done,outer-task-done,inner-task-done", "outer-task-done should have happened before inner-task-done");
                return [2 /*return*/];
        }
    });
}); });
promisedTest("db.transaction() should not wait for non-awaited new top-level transactions to commit", function () { return __awaiter(void 0, void 0, void 0, function () {
    var resolve, reject, p, log;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                p = new Promise(function (res, rej) { resolve = res; reject = rej; });
                log = [];
                return [4 /*yield*/, db$3.transaction('r', db$3.users, function () {
                        // Since we do not return a promise here,
                        // Promise.follow() will be used for awaitint all tasks.
                        // However, if we spawn a new top-level transaction. It should be omitted and not waited for:
                        db$3.transaction('rw!', db$3.pets, function () {
                            return db$3.pets.put({ kind: "dog" }).then(function () {
                                return db$3.pets.count();
                            }).then(function (numPets) {
                                QUnit.ok(true, "num pets: " + numPets);
                            }).then(function () {
                                return Dexie__default.waitFor(sleep(50)); // In IE, it sometimes happens that outer transaction is slow to commit (even though it doesnt to anything)
                            }).then(function () {
                                log.push("inner-transaction-done");
                            }).then(resolve, reject);
                        });
                    })];
            case 1:
                _a.sent();
                log.push("outer-transaction-done");
                QUnit.ok(true, "transaction done");
                return [4 /*yield*/, p];
            case 2:
                _a.sent();
                QUnit.equal(log.join(','), "outer-transaction-done,inner-transaction-done", "outer-transaction-done should have happened before inner-transaction-done");
                return [2 /*return*/];
        }
    });
}); });

var async$1 = Dexie__default.async;
QUnit.module("open", {
    setup: function () {
        QUnit.stop();
        Dexie__default.delete("TestDB").then(function () {
            QUnit.start();
        }).catch(function (e) {
            QUnit.ok(false, "Could not delete database");
        });
    },
    teardown: function () {
        QUnit.stop();
        Dexie__default.delete("TestDB").then(QUnit.start);
    }
});
var timeout = async$1(function (promise, ms) {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.race([promise, new Promise(function (resolve, reject) { return setTimeout(function () { return reject("timeout"); }, ms); })])];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("multiple db should not block each other", function () {
    var db1, db2, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!supports("versionchange")) {
                    QUnit.ok(true, "SKIPPED - versionchange UNSUPPORTED");
                    return [2 /*return*/];
                }
                db1 = new Dexie__default("TestDB"), db2 = new Dexie__default("TestDB");
                db1.version(1).stores({
                    foo: 'bar'
                });
                db2.version(1).stores({
                    foo: 'bar'
                });
                return [4 /*yield*/, db1.open()];
            case 1:
                _a.sent();
                QUnit.ok(true, "db1 should open");
                return [4 /*yield*/, db2.open()];
            case 2:
                _a.sent();
                QUnit.ok(true, "db2 should open");
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, timeout(db1.delete(), 1500)];
            case 4:
                _a.sent();
                QUnit.ok(true, "Succeeded to delete db1 while db2 was open");
                return [3 /*break*/, 6];
            case 5:
                e_1 = _a.sent();
                db1.close();
                db2.close();
                QUnit.ok(false, "Could not delete db1 - " + e_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
});
spawnedTest("Using db on node should be rejected with MissingAPIError", function () {
    var db, e_2, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = new Dexie__default('TestDB', {
                    indexedDB: undefined,
                    IDBKeyRange: undefined
                });
                db.version(1).stores({ foo: 'bar' });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.foo.toArray()];
            case 2:
                _a.sent();
                QUnit.ok(false, "Should not get any result because API is missing.");
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                QUnit.ok(e_2 instanceof Dexie__default.MissingAPIError, "Should get MissingAPIError. Got: " + e_2.name);
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, db.open()];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                e_3 = _a.sent();
                QUnit.ok(e_3 instanceof Dexie__default.MissingAPIError, "Should get MissingAPIError. Got: " + e_3.name);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
});
QUnit.asyncTest("open, add and query data without transaction", 6, function () {
    var db = new Dexie__default("TestDB");
    db.version(1).stores({ employees: "++id,first,last" });
    QUnit.ok(true, "Simple version() and stores() passed");
    db.open().catch(function (e) {
        QUnit.ok(false, "Could not open database: " + (e.stack || e));
        QUnit.start();
    });
    db.employees.add({ first: "David", last: "Fahlander" }).then(function () {
        QUnit.ok(true, "Could add employee");
        db.employees.where("first").equals("David").toArray(function (a) {
            QUnit.ok(true, "Could retrieve employee based on where() clause");
            var first = a[0].first;
            var last = a[0].last;
            QUnit.ok(first == "David" && last == "Fahlander", "Could get the same object");
            QUnit.equal(a.length, 1, "Length of returned answer is 1");
            QUnit.ok(a[0].id, "Got an autoincremented id value from the object");
            db.close();
            QUnit.start();
        });
    });
});
QUnit.asyncTest("open, add and query data using transaction", function () {
    var db = new Dexie__default("TestDB");
    db.version(1).stores({ employees: "++id,first,last" });
    db.open().catch(function () {
        QUnit.ok(false, "Could not open database");
        QUnit.start();
    });
    db.transaction("rw", db.employees, function () {
        // Add employee
        db.employees.add({ first: "David", last: "Fahlander" });
        // Query employee
        db.employees.where("first").equals("David").toArray(function (a) {
            QUnit.equal(a.length, 1, "Could retrieve employee based on where() clause");
            var first = a[0].first;
            var last = a[0].last;
            QUnit.ok(first == "David" && last == "Fahlander", "Could get the same object");
            QUnit.equal(a.length, 1, "Length of returned answer is 1");
            QUnit.ok(a[0].id, "Got an autoincremented id value from the object");
        });
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(function () {
        db.close();
        QUnit.start();
    });
});
QUnit.asyncTest("test-if-database-exists", 3, function () {
    var db = new Dexie__default("TestDB");
    var db2 = null;
    return db.open().then(function () {
        // Could open database without specifying any version. An existing database was opened.
        QUnit.ok(false, "Expected database not to exist but it existed indeed");
        db.close();
    }).catch(Dexie__default.NoSuchDatabaseError, function (err) {
        // An error happened. Database did not exist.
        QUnit.ok(true, "Database did not exist");
        db = new Dexie__default("TestDB");
        db.version(1).stores({ dummy: "" });
        return db.open();
    }).then(function () {
        // Database was created. Now open another instance to test if it exists
        QUnit.ok(true, "Could create a dummy database");
        db2 = new Dexie__default("TestDB");
        return db2.open();
    }).then(function () {
        QUnit.ok(true, "Dummy Database did exist.");
        db2.close();
    }).catch(function (err) {
        QUnit.ok(false, "Error: " + err.stack || err);
    }).finally(function () {
        db.delete().then(function () {
            if (db2)
                return db2.delete();
        }).finally(QUnit.start);
    });
});
QUnit.asyncTest("open database without specifying version or schema", Dexie__default.Observable ? 1 : 10, function () {
    if (Dexie__default.Observable) {
        QUnit.ok(true, "Dexie.Observable currently not compatible with this mode");
        return QUnit.start();
    }
    var db = new Dexie__default("TestDB");
    var db2 = null;
    db.open().then(function () {
        QUnit.ok(false, "Should not be able to open a non-existing database when not specifying any version schema");
    }).catch(function (err) {
        QUnit.ok(true, "Got error when trying to open non-existing DB: " + err);
        // Create a non-empty database that we later on will open in other instance (see next then()-clause)...
        db = new Dexie__default("TestDB");
        db.version(1).stores({ friends: "++id,name", pets: "++,name,kind" });
        return db.open();
    }).then(function () {
        QUnit.ok(true, "Could create TestDB with specified version schema.");
        db2 = new Dexie__default("TestDB"); // Opening another instans without specifying schema
        return db2.open().then(function () {
            QUnit.equal(db2.tables.length, 2, "We got two tables in database");
            QUnit.ok(db2.tables.every(function (table) { return table.name == "friends" || table.name == "pets"; }), "db2 contains the tables friends and pets");
            QUnit.equal(db2.table("friends").schema.primKey.name, "id", "Primary key of friends is 'id'");
            QUnit.ok(true, "Primary key of friends is auto-incremented: " + db2.table("friends").schema.primKey.auto); // Just logging. Not important for functionality. I know this fails on IE11.
            QUnit.equal(db2.table("friends").schema.indexes[0].name, "name", "First index of friends table is the 'name' index");
            QUnit.ok(!db2.table("pets").schema.primKey.name, "Primary key of pets has no name (not inline)");
            QUnit.ok(true, "Primary key of pets is auto-incremented: " + db2.table("pets").schema.primKey.auto); // Just logging. Not important for functionality. I know this fails on IE11.
            QUnit.equal(db2.table("pets").schema.indexes.length, 2, "Pets table has two indexes");
        });
    }).catch(function (err) {
        QUnit.ok(false, "Error: " + err);
    }).finally(function () {
        db.close();
        if (db2)
            db2.close();
        QUnit.start();
    });
});
QUnit.asyncTest("Dexie.getDatabaseNames", 13, function () {
    var defaultDatabases = [];
    var db1, db2;
    Dexie__default.getDatabaseNames(function (names) {
        defaultDatabases = [].slice.call(names, 0);
        QUnit.ok(true, "Current databases: " + (defaultDatabases.length ? defaultDatabases.join(',') : "(none)"));
        db1 = new Dexie__default("TestDB1");
        db1.version(1).stores({});
        return db1.open();
    }).then(function () {
        // One DB created
        QUnit.ok(true, "TestDB1 successfully created");
        return Dexie__default.getDatabaseNames();
    }).then(function (names) {
        QUnit.equal(names.length, defaultDatabases.length + 1, "Another DB has been created");
        QUnit.ok(names.indexOf("TestDB1") !== -1, "Database names now contains TestDB1");
        db2 = new Dexie__default("TestDB2");
        db2.version(1).stores({});
        return db2.open();
    }).then(function () {
        QUnit.ok(true, "TestDB2 successfully created");
        return Dexie__default.getDatabaseNames();
    }).then(function (names) {
        QUnit.equal(names.length, defaultDatabases.length + 2, "Yet another DB has been created");
        QUnit.ok(names.indexOf("TestDB2") !== -1, "Database names now contains TestDB2");
        return db1.delete();
    }).then(function () {
        return Dexie__default.getDatabaseNames();
    }).then(function (names) {
        QUnit.equal(names.length, defaultDatabases.length + 1, "A database has been deleted");
        QUnit.ok(!names.indexOf("TestDB1") !== -1, "TestDB1 not in database list anymore");
        return db2.delete();
    }).then(function () {
        return Dexie__default.getDatabaseNames();
    }).then(function (names) {
        QUnit.equal(names.length, defaultDatabases.length, "All of our databases have been deleted");
        QUnit.ok(!names.indexOf("TestDB2") !== -1, "TestDB2 not in database list anymore");
    }).then(function (names) {
        return Dexie__default.exists("nonexistingDB");
    }).then(function (exists) {
        QUnit.ok(!exists, "'nonexistingDB' should not exist indeed");
        return Dexie__default.getDatabaseNames();
    }).then(function (names) {
        QUnit.ok(!names.indexOf("nonexistingDB") !== -1, "nonexistingDB must not have been recorded when calling Dexie.exists()");
    }).catch(function (err) {
        QUnit.ok(false, err.stack || err);
    }).finally(function () {
        (db1 ? db1.delete() : Dexie__default.Promise.resolve()).finally(function () {
            (db2 ? db2.delete() : Dexie__default.Promise.resolve()).finally(QUnit.start);
        });
    });
});
QUnit.asyncTest("Issue #76 Dexie inside Web Worker", function () {
    //
    // Imports to include from the web worker:
    //
    var imports = window.workerImports || ["../dist/dexie.js"];
    //
    // Code to execute in the web worker:
    //
    var CodeToExecuteInWebWorker = "function CodeToExecuteInWebWorker(ok, done) {\n        ok(true, \"Could enter the web worker\");\n        if (!self.Promise) self.Promise = Dexie.Promise;\n\n        Dexie.delete(\"codeFromWorker\").then(function() {\n            var db = new Dexie(\"codeFromWorker\");\n            ok(true, \"Could create a Dexie instance from within a web worker\");\n\n            db.version(1).stores({ table1: \"++\" });\n            ok(true, \"Could define schema\");\n\n            db.open();\n            ok(true, \"Could open the database\");\n            \n            return db.transaction('rw', db.table1, function() {\n                ok(true, \"Could create a transaction\");\n                db.table1.add({ name: \"My first object\" }).then(function(id) {\n                    ok(true, \"Could add object that got id \" + id);\n                    // Verify we workaround Safari issues with getAll() in workers\n                    // ... as discussed in PR #579.\n                    return db.table1.toArray();\n                }).then(function(){\n                    ok(true, \"Could all toArray() on a table (verified workaround for Safari 10.1 issue with getAll())\");\n                }).catch(function(err) {\n                    ok(false, \"Got error: \" + err);\n                });\n            });\n        }).then(function () {\n            ok(true, \"Transaction committed\");\n        }).catch(function(err) {\n            ok(false, \"Transaction failed: \" + err.stack);\n        }).finally(done);\n    }";
    //
    // Frameworking...
    //
    if (!window.Worker) {
        QUnit.ok(false, "WebWorkers not supported");
        QUnit.start();
        return;
    }
    var worker = new Worker(window.workerSource || "worker.js");
    worker.postMessage({
        imports: imports,
        code: CodeToExecuteInWebWorker.toString()
    });
    worker.onmessage = function (e) {
        switch (e.data[0]) {
            case "ok":
                QUnit.ok(e.data[1], e.data[2]);
                break;
            case "done":
                worker.terminate();
                QUnit.start();
                break;
        }
    };
    worker.onerror = function (e) {
        worker.terminate();
        QUnit.ok(false, "Worker errored: " + e.message);
        QUnit.start();
    };
});
QUnit.asyncTest("Issue#100 - not all indexes are created", function () {
    var db = new Dexie__default("TestDB");
    db.version(20)
        .stores({
        t: 'id,displayName,*displayNameParts,isDeleted,countryRef,[countryRef+isDeleted],autoCreated,needsReview,[autoCreated+isDeleted],[needsReview+isDeleted],[autoCreated+needsReview+isDeleted],[autoCreated+countryRef+needsReview+isDeleted],[autoCreated+countryRef+needsReview+isDeleted],[autoCreated+robotsNoIndex+isDeleted],[autoCreated+needsReview+robotsNoIndex+isDeleted],[autoCreated+countryRef+robotsNoIndex+isDeleted],[autoCreated+countryRef+needsReview+robotsNoIndex+isDeleted]',
    });
    db.open().then(function () {
        return Dexie__default.Promise.all(db.t.orderBy("id").first(), db.t.orderBy("displayName").first(), db.t.orderBy("displayNameParts").first(), db.t.orderBy("isDeleted").first(), db.t.orderBy("countryRef").first(), db.t.orderBy("[countryRef+isDeleted]").first(), db.t.orderBy("autoCreated").first(), db.t.orderBy("needsReview").first(), db.t.orderBy("[autoCreated+isDeleted]").first(), db.t.orderBy("[needsReview+isDeleted]").first(), db.t.orderBy("[autoCreated+needsReview+isDeleted]").first(), db.t.orderBy("[autoCreated+countryRef+needsReview+isDeleted]").first(), db.t.orderBy("[autoCreated+robotsNoIndex+isDeleted]").first(), db.t.orderBy("[autoCreated+needsReview+robotsNoIndex+isDeleted]").first(), db.t.orderBy("[autoCreated+countryRef+robotsNoIndex+isDeleted]").first(), db.t.orderBy("[autoCreated+countryRef+needsReview+robotsNoIndex+isDeleted]").first());
    }).then(function (res) {
        QUnit.ok(false, "Should not succeed with creating the same index twice");
    }).catch(function (err) {
        QUnit.ok(true, "Catched error trying to create duplicate indexes: " + err);
        return db.t.toArray();
    }).then(function (a) {
        QUnit.ok(false, "Database should have failed here");
    }).catch(function (err) {
        QUnit.ok(true, "Got exception when trying to work agains DB: " + err);
    }).then(function () {
        // Close the database and open dynamically to check that
        // it should not exist when failed to open.
        db.close();
        db = new Dexie__default("TestDB");
        return db.open();
    }).then(function () {
        QUnit.ok(false, "Should not succeed to open the database. It should not have been created.");
        QUnit.equal(db.tables.length, 0, "At least expect no tables to have been created on the database");
    }).catch(function (err) {
        QUnit.ok(true, "Should not succeed to dynamically open db because it should not exist");
    }).finally(QUnit.start);
});
QUnit.asyncTest("Dexie.exists", function () {
    var db = null;
    Dexie__default.exists("TestDB").then(function (result) {
        QUnit.equal(result, false, "Should not exist yet");
        db = new Dexie__default("TestDB");
        db.version(1).stores({
            some: "schema"
        });
        return db.open();
    }).then(function () {
        return Dexie__default.exists("TestDB");
    }).then(function (result) {
        QUnit.equal(result, true, "Should exist now and has another open connection.");
        db.close();
        return Dexie__default.exists("TestDB");
    }).then(function (result) {
        QUnit.equal(result, true, "Should still exist");
        return Dexie__default.delete("TestDB");
    }).then(function () {
        return Dexie__default.exists("TestDB");
    }).then(function (result) {
        QUnit.equal(result, false, "Should have been deleted now");
    }).catch(function (e) {
        QUnit.ok(false, "Error: " + e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("No auto-open", function () {
    var db = new Dexie__default("TestDB", { autoOpen: false });
    db.version(1).stores({ foo: "id" });
    db.foo.toArray(function (res) {
        QUnit.ok(false, "Should not get result. Should have failed.");
    }).catch(function (e) {
        QUnit.ok(e instanceof Dexie__default.DatabaseClosedError, "Should catch DatabaseClosedError");
    }).then(function () {
        db.open();
        return db.foo.toArray();
    }).then(function (res) {
        QUnit.equal(res.length, 0, "Got an answer now when opened.");
        db.close();
        var openPromise = db.open().then(function () {
            //console.log("Why are we here? " + Dexie.Promise.reject().stack);
            QUnit.ok(false, "Should not succeed to open because we closed it during the open sequence.");
        }).catch(function (e) {
            QUnit.ok(e instanceof Dexie__default.DatabaseClosedError, "Got DatabaseClosedError from the db.open() call.");
        });
        var queryPromise = db.foo.toArray().then(function () {
            QUnit.ok(false, "Should not succeed to query because we closed it during the open sequence.");
        }).catch(function (e) {
            QUnit.ok(e instanceof Dexie__default.DatabaseClosedError, "Got DatabaseClosedError when querying: " + e);
        });
        db.close();
        return Promise.all([openPromise, queryPromise]);
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("db.close", function () {
    var db = new Dexie__default("TestDB");
    db.version(1).stores({ foo: "id" });
    db.foo.toArray(function (res) {
        QUnit.equal(res.length, 0, "Database auto-opened and I got a result from my query");
    }).then(function () {
        db.close();
        return db.foo.toArray();
    }).catch(function (e) {
        QUnit.ok(e instanceof Dexie__default.DatabaseClosedError, "Should catch DatabaseClosedError");
        return db.open();
    }).then(function () {
        console.log("The call to db.open() completed");
        return db.foo.toArray();
    }).then(function (res) {
        QUnit.equal(res.length, 0, "Database re-opened and I got a result from my query");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(function () {
        db.delete().catch(function (e) { return console.error(e); }).finally(QUnit.start);
    });
});
spawnedTest("db.open several times", 2, function () {
    var db;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = new Dexie__default("TestDB");
                db.version(1).stores({ foo: "id" });
                db.on('populate', function () { throw "Failed in populate"; });
                db.open().then(function () {
                    QUnit.ok(false, "Should not succeed to open");
                }).catch(function (err) {
                    QUnit.ok(true, "Got error: " + (err.stack || err));
                });
                return [4 /*yield*/, db.open().then(function () {
                        QUnit.ok(false, "Should not succeed to open");
                    }).catch(function (err) {
                        QUnit.ok(true, "Got error: " + (err.stack || err));
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
QUnit.asyncTest("#306 db.on('ready') subscriber should be called also if db is already open", function () {
    var db = new Dexie__default("TestDB");
    db.version(1).stores({ foo: "id" });
    db.on('ready', function () {
        QUnit.ok(true, "Early db.on('ready') subscriber called.");
    });
    var lateSubscriberCalled = false;
    db.open().then(function () {
        QUnit.ok(true, "db successfully opened");
        db.on('ready', function () {
            lateSubscriberCalled = true;
        });
    }).then(function () {
        QUnit.ok(lateSubscriberCalled, "Late db.on('ready') subscriber should also be called.");
    }).catch(function (err) {
        QUnit.ok(false, err.stack || err);
    }).finally(QUnit.start);
});
promisedTest("#392 db.on('ready') don't fire if subscribed while waiting other promise-returning subscriber", function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, first, second, third;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = new Dexie__default('TestDB');
                db.version(1).stores({ foobar: 'id' });
                first = false, second = false, third = false;
                // first is registered before open
                db.on('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        first = true;
                        // second is registered while first is executing
                        db.on('ready', function () {
                            second = true;
                        });
                        return [2 /*return*/];
                    });
                }); });
                return [4 /*yield*/, db.open()];
            case 1:
                _a.sent();
                db.on('ready', function () { return third = true; });
                return [4 /*yield*/, Dexie__default.Promise.resolve()];
            case 2:
                _a.sent();
                QUnit.ok(first, "First subscriber should have been called");
                QUnit.ok(second, "Second subscriber should have been called");
                QUnit.ok(third, "Third subscriber should have been called");
                return [2 /*return*/];
        }
    });
}); });

var db$4 = new Dexie__default("TestYieldDb");
var async$2 = Dexie__default.async;
var spawn = Dexie__default.spawn;
db$4.version(1).stores({
    friends: '++id,name,*groups',
    pets: '++id,name'
});
QUnit.module("yield", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db$4).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
    }
});
QUnit.asyncTest("db.transaction() with yield", async$2(function () {
    var finallyWasReached, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                finallyWasReached = false;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, db$4.transaction('rw', 'friends', 'pets', function () {
                        var catId, dogId, gurra, gurrasPets;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$4.pets.add({ name: "Tito", kind: "cat" })];
                                case 1:
                                    catId = _a.sent();
                                    return [4 /*yield*/, db$4.pets.add({ name: "Josephina", kind: "dog" })];
                                case 2:
                                    dogId = _a.sent();
                                    // Add a friend who owns the pets
                                    db$4.friends.add({ name: "Gurra G", pets: [catId, dogId] });
                                    return [4 /*yield*/, db$4.friends.where('name').equals("Gurra G").first()];
                                case 3:
                                    gurra = _a.sent();
                                    QUnit.ok(!!gurra, "Gurra could be found with yield");
                                    return [4 /*yield*/, db$4.pets.where('id').anyOf(gurra.pets).toArray()];
                                case 4:
                                    gurrasPets = _a.sent();
                                    QUnit.equal(gurrasPets.length, 2, "Gurras all two pets could be retrieved via yield");
                                    QUnit.equal(gurrasPets[0].kind, "cat", "Gurras first pet is a cat");
                                    QUnit.equal(gurrasPets[1].kind, "dog", "Gurras second pet is a dog");
                                    return [2 /*return*/];
                            }
                        });
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3:
                e_1 = _a.sent();
                QUnit.ok(false, "Caught error: " + e_1);
                return [3 /*break*/, 5];
            case 4:
                finallyWasReached = true;
                return [7 /*endfinally*/];
            case 5:
                QUnit.ok(finallyWasReached, "finally was reached");
                QUnit.start();
                return [2 /*return*/];
        }
    });
}));
QUnit.asyncTest("Catching indexedDB error event", 2, async$2(function () {
    var e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, db$4.pets.add({ id: 1, name: "Tidi", kind: "Honeybadger" })];
            case 1:
                _a.sent();
                QUnit.ok(true, "Should come so far");
                return [4 /*yield*/, db$4.pets.add({ id: 1, name: "Todoo", kind: "Snake" })];
            case 2:
                _a.sent(); // Should generate an IDB error event!
                QUnit.ok(false, "Should not come here");
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                QUnit.equal(e_2.name, "ConstraintError", "Caught indexedDB DOMError event ConstraintError");
                return [3 /*break*/, 4];
            case 4:
                QUnit.start();
                return [2 /*return*/];
        }
    });
}));
QUnit.asyncTest("Catching error prevents transaction from aborting", 5, async$2(function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, , 4, 5]);
                return [4 /*yield*/, db$4.transaction('rw', 'pets', function () {
                        var e_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, db$4.pets.add({ id: 1, name: "Tidi", kind: "Honeybadger" })];
                                case 1:
                                    _a.sent();
                                    QUnit.ok(true, "Should come so far");
                                    return [4 /*yield*/, db$4.pets.add({ id: 1, name: "Todoo", kind: "Snake" })];
                                case 2:
                                    _a.sent(); // Should generate an IDB error event!
                                    QUnit.ok(false, "Should not come here");
                                    return [3 /*break*/, 4];
                                case 3:
                                    e_3 = _a.sent();
                                    QUnit.equal(e_3.name, "ConstraintError", "Caught indexedDB DOMError event ConstraintError");
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    })];
            case 1:
                _c.sent();
                QUnit.ok(true, "Should come here - transaction committed because we caught the error");
                _a = QUnit.ok;
                return [4 /*yield*/, db$4.pets.get(1)];
            case 2:
                _a.apply(void 0, [(_c.sent()), "A pet with ID 1 exists in DB"]);
                _b = QUnit.equal;
                return [4 /*yield*/, db$4.pets.get(1)];
            case 3:
                _b.apply(void 0, [(_c.sent()).name, "Tidi", "It was Tidi in the first position"]);
                return [3 /*break*/, 5];
            case 4:
                QUnit.start();
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}));
QUnit.asyncTest("Transaction not committing when not catching error event", 4, async$2(function () {
    var e_4, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, 4, 5]);
                return [4 /*yield*/, db$4.transaction('rw', 'pets', function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$4.pets.add({ id: 1, name: "Tidi", kind: "Honeybadger" })];
                                case 1:
                                    _a.sent();
                                    QUnit.ok(true, "Should come so far");
                                    return [4 /*yield*/, db$4.pets.add({ id: 1, name: "Todoo", kind: "Snake" })];
                                case 2:
                                    _a.sent(); // Should generate an IDB error event!
                                    QUnit.ok(false, "Should not come here");
                                    return [2 /*return*/];
                            }
                        });
                    })];
            case 1:
                _b.sent();
                QUnit.ok(false, "Should not come here");
                return [3 /*break*/, 5];
            case 2:
                e_4 = _b.sent();
                QUnit.ok(true, "Transaction should fail");
                QUnit.equal(e_4.name, "ConstraintError", "Error caught was a ConstraintError!");
                _a = QUnit.equal;
                return [4 /*yield*/, db$4.pets.count()];
            case 3:
                _a.apply(void 0, [(_b.sent()), 0, "Pets table should still be empty because transaction failed"]);
                return [3 /*break*/, 5];
            case 4:
                QUnit.start();
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}));
QUnit.asyncTest("Should allow yielding a non-promise", async$2(function () {
    var x, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                return [4 /*yield*/, 3];
            case 1:
                x = _a.sent();
                QUnit.equal(x, 3, "Could yield a non-promise");
                return [3 /*break*/, 4];
            case 2:
                e_5 = _a.sent();
                QUnit.ok(false, "Yielding a non-Thenable wasn't be allowed");
                return [3 /*break*/, 4];
            case 3:
                QUnit.start();
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}));
QUnit.asyncTest("Should allow yielding an array with a mix of values and thenables", async$2(function () {
    var results, e_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                return [4 /*yield*/, [1, 2, Dexie__default.Promise.resolve(3)]];
            case 1:
                results = _a.sent();
                QUnit.equal(results.length, 3, "Yielded array is of size 3");
                QUnit.equal(results[0], 1, "First value is 1");
                QUnit.equal(results[1], 2, "Second value is 2");
                QUnit.equal(results[2], 3, "Third value is 3");
                return [3 /*break*/, 4];
            case 2:
                e_6 = _a.sent();
                QUnit.ok(false, "Got exception when trying to do yield an array of mixed values/promises");
                return [3 /*break*/, 4];
            case 3:
                QUnit.start();
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}));
QUnit.asyncTest("Should allow yielding an array of non-promises only", async$2(function () {
    var results, e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                return [4 /*yield*/, [1, 2, 3]];
            case 1:
                results = _a.sent();
                QUnit.equal(results.length, 3, "Yielded array is of size 3");
                QUnit.equal(results[0], 1, "First value is 1");
                QUnit.equal(results[1], 2, "Second value is 2");
                QUnit.equal(results[2], 3, "Third value is 3");
                return [3 /*break*/, 4];
            case 2:
                e_7 = _a.sent();
                QUnit.ok(false, e_7);
                return [3 /*break*/, 4];
            case 3:
                QUnit.start();
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}));
QUnit.asyncTest("Should allow yielding an empty array", async$2(function () {
    var results, e_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                return [4 /*yield*/, []];
            case 1:
                results = _a.sent();
                QUnit.equal(results.length, 0, "Yielded array is of size 0");
                return [3 /*break*/, 4];
            case 2:
                e_8 = _a.sent();
                QUnit.ok(false, e_8);
                return [3 /*break*/, 4];
            case 3:
                QUnit.start();
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}));
QUnit.asyncTest("Should allow yielding an array of different kind of any kind of promise", function () {
    spawn(function () {
        var results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, [Promise.resolve(1), Dexie__default.Promise.resolve(2), Promise.resolve(3)]];
                case 1:
                    results = _a.sent();
                    QUnit.equal(results.length, 3, "Yielded array is of size 3");
                    QUnit.equal(results[0], 1, "First value is 1");
                    QUnit.equal(results[1], 2, "Second value is 2");
                    QUnit.equal(results[2], 3, "Third value is 3");
                    return [2 /*return*/, 4];
            }
        });
    }).then(function (x) {
        QUnit.equal(x, 4, "Finally got the value 4");
    }).catch(function (e) {
        QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(QUnit.start);
});
QUnit.asyncTest("Throw after yield 1", function () {
    spawn(function () {
        var e_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.resolve(3)];
                case 1:
                    _a.sent();
                    QUnit.ok(true, "yielded a value");
                    throw "error";
                case 2:
                    e_9 = _a.sent();
                    QUnit.ok(e_9 === "error", "Catched exception: " + e_9);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, 4];
            }
        });
    }).then(function (x) {
        QUnit.equal(x, 4, "Finally got the value 4");
    }).catch(function (e) {
        QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(QUnit.start);
});
QUnit.asyncTest("Throw after yield 2", function () {
    Promise.resolve(spawn(function () {
        var e_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, 3];
                case 1:
                    _a.sent();
                    QUnit.ok(true, "yielded a value");
                    throw "error";
                case 2:
                    e_10 = _a.sent();
                    QUnit.ok(e_10 === "error", "Catched exception: " + e_10);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, 4];
            }
        });
    })).then(function (x) {
        QUnit.equal(x, 4, "Finally got the value 4");
    }).catch(function (e) {
        QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(QUnit.start);
});
QUnit.asyncTest("Throw before yield", function () {
    Promise.resolve(spawn(function () {
        return __generator(this, function (_a) {
            try {
                throw "error";
            }
            catch (e) {
                QUnit.ok(e === "error", "Catched exception: " + e);
            }
            return [2 /*return*/, 4];
        });
    })).then(function (x) {
        QUnit.equal(x, 4, "Finally got the value 4");
    }).catch(function (e) {
        QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(QUnit.start);
});
QUnit.asyncTest("Catch rejected promise", function () {
    spawn(function () {
        var e_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, new Promise(function (resolve, reject) { reject("fault fault!"); })];
                case 1:
                    _a.sent();
                    QUnit.ok(false, "Shouldn't come here");
                    return [3 /*break*/, 3];
                case 2:
                    e_11 = _a.sent();
                    QUnit.ok(e_11 === "fault fault!", "Catched exception: " + e_11);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, 4];
            }
        });
    }).then(function (x) {
        QUnit.equal(x, 4, "Finally got the value 4");
    }).catch(function (e) {
        QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(QUnit.start);
});
QUnit.asyncTest("Catch rejected promise in an array", function () {
    spawn(function () {
        var e_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, [1, 2, new Promise(function (resolve, reject) { reject("fault fault!"); }), 4]];
                case 1:
                    _a.sent();
                    QUnit.ok(false, "Shouldn't come here");
                    return [3 /*break*/, 3];
                case 2:
                    e_12 = _a.sent();
                    QUnit.ok(e_12 === "fault fault!", "Catched exception: " + e_12);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, 4];
            }
        });
    }).then(function (x) {
        QUnit.equal(x, 4, "Finally got the value 4");
    }).catch(function (e) {
        QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(QUnit.start);
});
QUnit.asyncTest("Should allow returning a promise", function () {
    spawn(function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve(3)];
        });
    }).then(function (result) {
        QUnit.equal(result, 3, "Returning a directly should also be allowed");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).then(QUnit.start);
});
QUnit.asyncTest("Should be able to do 'return yield Promise.resolve(x);'", function () {
    spawn(function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve(3)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }).then(function () {
        QUnit.ok(true, "Should be able to do 'return yield Promise.resolve(x);'");
    }).catch(function (e) {
        QUnit.ok(false, "Error occurred: " + e);
    }).then(QUnit.start);
});
QUnit.asyncTest("Arrow functions and let", async$2(function () {
    var x, y;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, [1, 2, Promise.resolve(3)]];
            case 1:
                x = _a.sent();
                y = x.map(function (a) { return a - 1; });
                QUnit.equal(y[0], 0);
                QUnit.equal(y[1], 1);
                QUnit.equal(y[2], 2);
                QUnit.start();
                return [2 /*return*/];
        }
    });
}));
QUnit.asyncTest("Calling sub async function", async$2(function () {
    var addFriend, deleteFriends, foo, bar, numDeleted, e_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                addFriend = async$2(function addFriend(friend) {
                    var friendId;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$4.friends.add(friend)];
                            case 1:
                                friendId = _a.sent();
                                return [4 /*yield*/, db$4.friends.get(friendId)];
                            case 2: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
                deleteFriends = async$2(function deleteFriends() {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$4.friends.where('name').anyOf("Foo", "Bar").delete()];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, 6, 7]);
                return [4 /*yield*/, addFriend({ name: "Foo" })];
            case 2:
                foo = _a.sent();
                return [4 /*yield*/, addFriend({ name: "Bar" })];
            case 3:
                bar = _a.sent();
                QUnit.ok(foo.name == "Foo", "Foo got its name");
                QUnit.ok(bar.name == "Bar", "Bar got its name");
                return [4 /*yield*/, deleteFriends()];
            case 4:
                numDeleted = _a.sent();
                QUnit.ok(true, numDeleted + " friends successfully deleted");
                return [3 /*break*/, 7];
            case 5:
                e_13 = _a.sent();
                QUnit.ok(false, e_13);
                return [3 /*break*/, 7];
            case 6:
                QUnit.start();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}));

var keys = Object.keys;
var isArray = Array.isArray;
var _global = typeof self !== 'undefined' ? self :
    typeof window !== 'undefined' ? window :
        global;
if (typeof Promise !== 'undefined' && !_global.Promise) {
    // In jsdom, this it can be the case that Promise is not put on the global object.
    // If so, we need to patch the global object for the rest of the code to work as expected.
    // Other dexie code expects Promise to be on the global object (like normal browser environments)
    _global.Promise = Promise;
}
function extend(obj, extension) {
    if (typeof extension !== 'object')
        return obj;
    keys(extension).forEach(function (key) {
        obj[key] = extension[key];
    });
    return obj;
}
var getProto = Object.getPrototypeOf;
var _hasOwn = {}.hasOwnProperty;
function hasOwn(obj, prop) {
    return _hasOwn.call(obj, prop);
}
function props(proto, extension) {
    if (typeof extension === 'function')
        extension = extension(getProto(proto));
    keys(extension).forEach(function (key) {
        setProp(proto, key, extension[key]);
    });
}
var defineProperty = Object.defineProperty;
function setProp(obj, prop, functionOrGetSet, options) {
    defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ?
        { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } :
        { value: functionOrGetSet, configurable: true, writable: true }, options));
}
function derive(Child) {
    return {
        from: function (Parent) {
            Child.prototype = Object.create(Parent.prototype);
            setProp(Child.prototype, "constructor", Child);
            return {
                extend: props.bind(null, Child.prototype)
            };
        }
    };
}
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
function getPropertyDescriptor(obj, prop) {
    var pd = getOwnPropertyDescriptor(obj, prop);
    var proto;
    return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
}





/** Generate an object (hash map) based on given array.
 * @param extractor Function taking an array item and its index and returning an array of 2 items ([key, value]) to
 *        instert on the resulting object for each item in the array. If this function returns a falsy value, the
 *        current item wont affect the resulting object.
 */
function arrayToObject(array, extractor) {
    return array.reduce(function (result, item, i) {
        var nameAndValue = extractor(item, i);
        if (nameAndValue)
            result[nameAndValue[0]] = nameAndValue[1];
        return result;
    }, {});
}

function tryCatch(fn, onerror, args) {
    try {
        fn.apply(null, args);
    }
    catch (ex) {
        onerror && onerror(ex);
    }
}




var concat = [].concat;
function flatten(a) {
    return concat.apply([], a);
}
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
var intrinsicTypeNames = "Boolean,String,Date,RegExp,Blob,File,FileList,ArrayBuffer,DataView,Uint8ClampedArray,ImageData,Map,Set"
    .split(',').concat(flatten([8, 16, 32, 64].map(function (num) { return ["Int", "Uint", "Float"].map(function (t) { return t + num + "Array"; }); }))).filter(function (t) { return _global[t]; });
var intrinsicTypes = intrinsicTypeNames.map(function (t) { return _global[t]; });
var intrinsicTypeNameSet = arrayToObject(intrinsicTypeNames, function (x) { return [x, true]; });




// If first argument is iterable or array-like, return it as an array
var iteratorSymbol = typeof Symbol !== 'undefined' ?
    Symbol.iterator :
    '@@iterator';
var getIteratorOf = typeof iteratorSymbol === "symbol" ? function (x) {
    var i;
    return x != null && (i = x[iteratorSymbol]) && i.apply(x);
} : function () { return null; };
var NO_CHAR_ARRAY = {};
// Takes one or several arguments and returns an array based on the following criteras:
// * If several arguments provided, return arguments converted to an array in a way that
//   still allows javascript engine to optimize the code.
// * If single argument is an array, return a clone of it.
// * If this-pointer equals NO_CHAR_ARRAY, don't accept strings as valid iterables as a special
//   case to the two bullets below.
// * If single argument is an iterable, convert it to an array and return the resulting array.
// * If single argument is array-like (has length of type number), convert it to an array.
function getArrayOf(arrayLike) {
    var i, a, x, it;
    if (arguments.length === 1) {
        if (isArray(arrayLike))
            return arrayLike.slice();
        if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string')
            return [arrayLike];
        if ((it = getIteratorOf(arrayLike))) {
            a = [];
            while (x = it.next(), !x.done)
                a.push(x.value);
            return a;
        }
        if (arrayLike == null)
            return [arrayLike];
        i = arrayLike.length;
        if (typeof i === 'number') {
            a = new Array(i);
            while (i--)
                a[i] = arrayLike[i];
            return a;
        }
        return [arrayLike];
    }
    i = arguments.length;
    a = new Array(i);
    while (i--)
        a[i] = arguments[i];
    return a;
}

function nop() { }
function mirror(val) { return val; }

function callBoth(on1, on2) {
    return function () {
        on1.apply(this, arguments);
        on2.apply(this, arguments);
    };
}

// By default, debug will be true only if platform is a web platform and its page is served from localhost.
// When debug = true, error's stacks will contain asyncronic long stacks.
var debug = typeof location !== 'undefined' &&
    // By default, use debug mode if served from localhost.
    /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);

var libraryFilter = function () { return true; };
var NEEDS_THROW_FOR_STACK = !new Error("").stack;
function getErrorWithStack() {
    if (NEEDS_THROW_FOR_STACK)
        try {
            // Doing something naughty in strict mode here to trigger a specific error
            // that can be explicitely ignored in debugger's exception settings.
            // If we'd just throw new Error() here, IE's debugger's exception settings
            // will just consider it as "exception thrown by javascript code" which is
            // something you wouldn't want it to ignore.
            throw new Error(); // Fallback if above line don't throw.
        }
        catch (e) {
            return e;
        }
    return new Error();
}
function prettyStack(exception, numIgnoredFrames) {
    var stack = exception.stack;
    if (!stack)
        return "";
    numIgnoredFrames = (numIgnoredFrames || 0);
    if (stack.indexOf(exception.name) === 0)
        numIgnoredFrames += (exception.name + exception.message).split('\n').length;
    return stack.split('\n')
        .slice(numIgnoredFrames)
        .filter(libraryFilter)
        .map(function (frame) { return "\n" + frame; })
        .join('');
}
// TODO: Replace this in favor of a decorator instead.

var dexieErrorNames = [
    'Modify',
    'Bulk',
    'OpenFailed',
    'VersionChange',
    'Schema',
    'Upgrade',
    'InvalidTable',
    'MissingAPI',
    'NoSuchDatabase',
    'InvalidArgument',
    'SubTransaction',
    'Unsupported',
    'Internal',
    'DatabaseClosed',
    'PrematureCommit',
    'ForeignAwait'
];
var idbDomErrorNames = [
    'Unknown',
    'Constraint',
    'Data',
    'TransactionInactive',
    'ReadOnly',
    'Version',
    'NotFound',
    'InvalidState',
    'InvalidAccess',
    'Abort',
    'Timeout',
    'QuotaExceeded',
    'Syntax',
    'DataClone'
];
var errorList = dexieErrorNames.concat(idbDomErrorNames);
var defaultTexts = {
    VersionChanged: "Database version changed by other database connection",
    DatabaseClosed: "Database has been closed",
    Abort: "Transaction aborted",
    TransactionInactive: "Transaction has already completed or failed",
    MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
};
//
// DexieError - base class of all out exceptions.
//
function DexieError(name, msg) {
    // Reason we don't use ES6 classes is because:
    // 1. It bloats transpiled code and increases size of minified code.
    // 2. It doesn't give us much in this case.
    // 3. It would require sub classes to call super(), which
    //    is not needed when deriving from Error.
    this._e = getErrorWithStack();
    this.name = name;
    this.message = msg;
}
derive(DexieError).from(Error).extend({
    stack: {
        get: function () {
            return this._stack ||
                (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
        }
    },
    toString: function () { return this.name + ": " + this.message; }
});
function getMultiErrorMessage(msg, failures) {
    return msg + ". Errors: " + Object.keys(failures)
        .map(function (key) { return failures[key].toString(); })
        .filter(function (v, i, s) { return s.indexOf(v) === i; }) // Only unique error strings
        .join('\n');
}
//
// ModifyError - thrown in Collection.modify()
// Specific constructor because it contains members failures and failedKeys.
//
function ModifyError(msg, failures, successCount, failedKeys) {
    this._e = getErrorWithStack();
    this.failures = failures;
    this.failedKeys = failedKeys;
    this.successCount = successCount;
    this.message = getMultiErrorMessage(msg, failures);
}
derive(ModifyError).from(DexieError);
function BulkError(msg, failures) {
    this._e = getErrorWithStack();
    this.name = "BulkError";
    this.failures = failures;
    this.message = getMultiErrorMessage(msg, failures);
}
derive(BulkError).from(DexieError);
//
//
// Dynamically generate error names and exception classes based
// on the names in errorList.
//
//
// Map of {ErrorName -> ErrorName + "Error"}
var errnames = errorList.reduce(function (obj, name) { return (obj[name] = name + "Error", obj); }, {});
// Need an alias for DexieError because we're gonna create subclasses with the same name.
var BaseException = DexieError;
// Map of {ErrorName -> exception constructor}
var exceptions = errorList.reduce(function (obj, name) {
    // Let the name be "DexieError" because this name may
    // be shown in call stack and when debugging. DexieError is
    // the most true name because it derives from DexieError,
    // and we cannot change Function.name programatically without
    // dynamically create a Function object, which would be considered
    // 'eval-evil'.
    var fullName = name + "Error";
    function DexieError(msgOrInner, inner) {
        this._e = getErrorWithStack();
        this.name = fullName;
        if (!msgOrInner) {
            this.message = defaultTexts[name] || fullName;
            this.inner = null;
        }
        else if (typeof msgOrInner === 'string') {
            this.message = "" + msgOrInner + (!inner ? '' : '\n ' + inner);
            this.inner = inner || null;
        }
        else if (typeof msgOrInner === 'object') {
            this.message = msgOrInner.name + " " + msgOrInner.message;
            this.inner = msgOrInner;
        }
    }
    derive(DexieError).from(BaseException);
    obj[name] = DexieError;
    return obj;
}, {});
// Use ECMASCRIPT standard exceptions where applicable:
exceptions.Syntax = SyntaxError;
exceptions.Type = TypeError;
exceptions.Range = RangeError;
var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
    obj[name + "Error"] = exceptions[name];
    return obj;
}, {});

var fullNameExceptions = errorList.reduce(function (obj, name) {
    if (["Syntax", "Type", "Range"].indexOf(name) === -1)
        obj[name + "Error"] = exceptions[name];
    return obj;
}, {});
fullNameExceptions.ModifyError = ModifyError;
fullNameExceptions.DexieError = DexieError;
fullNameExceptions.BulkError = BulkError;

/*
 * Copyright (c) 2014-2017 David Fahlander
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/LICENSE-2.0
 */
//
// Promise and Zone (PSD) for Dexie library
//
// I started out writing this Promise class by copying promise-light (https://github.com/taylorhakes/promise-light) by
// https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
//
// In previous versions this was fixed by not calling setTimeout when knowing that the resolve() or reject() came from another
// tick. In Dexie v1.4.0, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
// another strategy now that simplifies everything a lot: to always execute callbacks in a new micro-task, but have an own micro-task
// engine that is indexedDB compliant across all browsers.
// Promise class has also been optimized a lot with inspiration from bluebird - to avoid closures as much as possible.
// Also with inspiration from bluebird, asyncronic stacks in debug mode.
//
// Specific non-standard features of this Promise class:
// * Custom zone support (a.k.a. PSD) with ability to keep zones also when using native promises as well as
//   native async / await.
// * Promise.follow() method built upon the custom zone engine, that allows user to track all promises created from current stack frame
//   and below + all promises that those promises creates or awaits.
// * Detect any unhandled promise in a PSD-scope (PSD.onunhandled). 
//
// David Fahlander, https://github.com/dfahlander
//
// Just a pointer that only this module knows about.
// Used in Promise constructor to emulate a private constructor.
var INTERNAL = {};
// Async stacks (long stacks) must not grow infinitely.
var LONG_STACKS_CLIP_LIMIT = 100;
var MAX_LONG_STACKS = 20;
var ZONE_ECHO_LIMIT = 100;
var _a = typeof Promise === 'undefined' ?
    [] :
    (function () {
        var globalP = Promise.resolve();
        if (typeof crypto === 'undefined' || !crypto.subtle)
            return [globalP, getProto(globalP), globalP];
        // Generate a native promise (as window.Promise may have been patched)
        var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
        return [
            nativeP,
            getProto(nativeP),
            globalP
        ];
    })();
var resolvedNativePromise = _a[0];
var nativePromiseProto = _a[1];
var resolvedGlobalPromise = _a[2];
var nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
var NativePromise$1 = resolvedNativePromise && resolvedNativePromise.constructor;
var patchGlobalPromise = !!resolvedGlobalPromise;
var stack_being_generated = false;
/* The default function used only for the very first promise in a promise chain.
   As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
   emulated in this module. For indexedDB compatibility, this means that every method needs to
   execute at least one promise before doing an indexedDB operation. Dexie will always call
   db.ready().then() for every operation to make sure the indexedDB event is started in an
   indexedDB-compatible emulated micro task loop.
*/
var schedulePhysicalTick = resolvedGlobalPromise ?
    function () { resolvedGlobalPromise.then(physicalTick); }
    :
        _global.setImmediate ?
            // setImmediate supported. Those modern platforms also supports Function.bind().
            setImmediate.bind(null, physicalTick) :
            _global.MutationObserver ?
                // MutationObserver supported
                function () {
                    var hiddenDiv = document.createElement("div");
                    (new MutationObserver(function () {
                        physicalTick();
                        hiddenDiv = null;
                    })).observe(hiddenDiv, { attributes: true });
                    hiddenDiv.setAttribute('i', '1');
                } :
                // No support for setImmediate or MutationObserver. No worry, setTimeout is only called
                // once time. Every tick that follows will be our emulated micro tick.
                // Could have uses setTimeout.bind(null, 0, physicalTick) if it wasnt for that FF13 and below has a bug 
                function () { setTimeout(physicalTick, 0); };
// Configurable through Promise.scheduler.
// Don't export because it would be unsafe to let unknown
// code call it unless they do try..catch within their callback.
// This function can be retrieved through getter of Promise.scheduler though,
// but users must not do Promise.scheduler = myFuncThatThrowsException
var asap$1 = function (callback, args) {
    microtickQueue.push([callback, args]);
    if (needsNewPhysicalTick) {
        schedulePhysicalTick();
        needsNewPhysicalTick = false;
    }
};
var isOutsideMicroTick = true;
var needsNewPhysicalTick = true;
var unhandledErrors = [];
var rejectingErrors = [];
var currentFulfiller = null;
var rejectionMapper = mirror; // Remove in next major when removing error mapping of DOMErrors and DOMExceptions
var globalPSD = {
    id: 'global',
    global: true,
    ref: 0,
    unhandleds: [],
    onunhandled: globalError,
    pgp: false,
    env: {},
    finalize: function () {
        this.unhandleds.forEach(function (uh) {
            try {
                globalError(uh[0], uh[1]);
            }
            catch (e) { }
        });
    }
};
var PSD = globalPSD;
var microtickQueue = []; // Callbacks to call in this or next physical tick.
var numScheduledCalls = 0; // Number of listener-calls left to do in this physical tick.
var tickFinalizers = []; // Finalizers to call when there are no more async calls scheduled within current physical tick.
function DexiePromise(fn) {
    if (typeof this !== 'object')
        throw new TypeError('Promises must be constructed via new');
    this._listeners = [];
    this.onuncatched = nop; // Deprecate in next major. Not needed. Better to use global error handler.
    // A library may set `promise._lib = true;` after promise is created to make resolve() or reject()
    // execute the microtask engine implicitely within the call to resolve() or reject().
    // To remain A+ compliant, a library must only set `_lib=true` if it can guarantee that the stack
    // only contains library code when calling resolve() or reject().
    // RULE OF THUMB: ONLY set _lib = true for promises explicitely resolving/rejecting directly from
    // global scope (event handler, timer etc)!
    this._lib = false;
    // Current async scope
    var psd = (this._PSD = PSD);
    if (debug) {
        this._stackHolder = getErrorWithStack();
        this._prev = null;
        this._numPrev = 0; // Number of previous promises (for long stacks)
    }
    if (typeof fn !== 'function') {
        if (fn !== INTERNAL)
            throw new TypeError('Not a function');
        // Private constructor (INTERNAL, state, value).
        // Used internally by Promise.resolve() and Promise.reject().
        this._state = arguments[1];
        this._value = arguments[2];
        if (this._state === false)
            handleRejection(this, this._value); // Map error, set stack and addPossiblyUnhandledError().
        return;
    }
    this._state = null; // null (=pending), false (=rejected) or true (=resolved)
    this._value = null; // error or result
    ++psd.ref; // Refcounting current scope
    executePromiseTask(this, fn);
}
// Prepare a property descriptor to put onto Promise.prototype.then
var thenProp = {
    get: function () {
        var psd = PSD, microTaskId = totalEchoes;
        function then(onFulfilled, onRejected) {
            var _this = this;
            var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
            var cleanup = possibleAwait && !decrementExpectedAwaits();
            var rv = new DexiePromise(function (resolve, reject) {
                propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
            });
            debug && linkToPreviousPromise(rv, this);
            return rv;
        }
        then.prototype = INTERNAL; // For idempotense, see setter below.
        return then;
    },
    // Be idempotent and allow another framework (such as zone.js or another instance of a Dexie.Promise module) to replace Promise.prototype.then
    // and when that framework wants to restore the original property, we must identify that and restore the original property descriptor.
    set: function (value) {
        setProp(this, 'then', value && value.prototype === INTERNAL ?
            thenProp : // Restore to original property descriptor.
            {
                get: function () {
                    return value; // Getter returning provided value (behaves like value is just changed)
                },
                set: thenProp.set // Keep a setter that is prepared to restore original.
            });
    }
};
props(DexiePromise.prototype, {
    then: thenProp,
    _then: function (onFulfilled, onRejected) {
        // A little tinier version of then() that don't have to create a resulting promise.
        propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
    },
    catch: function (onRejected) {
        if (arguments.length === 1)
            return this.then(null, onRejected);
        // First argument is the Error type to catch
        var type = arguments[0], handler = arguments[1];
        return typeof type === 'function' ? this.then(null, function (err) {
            // Catching errors by its constructor type (similar to java / c++ / c#)
            // Sample: promise.catch(TypeError, function (e) { ... });
            return err instanceof type ? handler(err) : PromiseReject(err);
        })
            : this.then(null, function (err) {
                // Catching errors by the error.name property. Makes sense for indexedDB where error type
                // is always DOMError but where e.name tells the actual error type.
                // Sample: promise.catch('ConstraintError', function (e) { ... });
                return err && err.name === type ? handler(err) : PromiseReject(err);
            });
    },
    finally: function (onFinally) {
        return this.then(function (value) {
            onFinally();
            return value;
        }, function (err) {
            onFinally();
            return PromiseReject(err);
        });
    },
    stack: {
        get: function () {
            if (this._stack)
                return this._stack;
            try {
                stack_being_generated = true;
                var stacks = getStack(this, [], MAX_LONG_STACKS);
                var stack = stacks.join("\nFrom previous: ");
                if (this._state !== null)
                    this._stack = stack; // Stack may be updated on reject.
                return stack;
            }
            finally {
                stack_being_generated = false;
            }
        }
    },
    timeout: function (ms, msg) {
        var _this = this;
        return ms < Infinity ?
            new DexiePromise(function (resolve, reject) {
                var handle = setTimeout(function () { return reject(new exceptions.Timeout(msg)); }, ms);
                _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
            }) : this;
    }
});
if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
    setProp(DexiePromise.prototype, Symbol.toStringTag, 'Dexie.Promise');
// Now that Promise.prototype is defined, we have all it takes to set globalPSD.env.
// Environment globals snapshotted on leaving global zone
globalPSD.env = snapShot();
function Listener(onFulfilled, onRejected, resolve, reject, zone) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
    this.psd = zone;
}
// Promise Static Properties
props(DexiePromise, {
    all: function () {
        var values = getArrayOf.apply(null, arguments) // Supports iterables, implicit arguments and array-like.
            .map(onPossibleParallellAsync); // Handle parallell async/awaits 
        return new DexiePromise(function (resolve, reject) {
            if (values.length === 0)
                resolve([]);
            var remaining = values.length;
            values.forEach(function (a, i) { return DexiePromise.resolve(a).then(function (x) {
                values[i] = x;
                if (!--remaining)
                    resolve(values);
            }, reject); });
        });
    },
    resolve: function (value) {
        if (value instanceof DexiePromise)
            return value;
        if (value && typeof value.then === 'function')
            return new DexiePromise(function (resolve, reject) {
                value.then(resolve, reject);
            });
        var rv = new DexiePromise(INTERNAL, true, value);
        linkToPreviousPromise(rv, currentFulfiller);
        return rv;
    },
    reject: PromiseReject,
    race: function () {
        var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
        return new DexiePromise(function (resolve, reject) {
            values.map(function (value) { return DexiePromise.resolve(value).then(resolve, reject); });
        });
    },
    PSD: {
        get: function () { return PSD; },
        set: function (value) { return PSD = value; }
    },
    totalEchoes: { get: function () { return totalEchoes; } },
    //task: {get: ()=>task},
    newPSD: newScope,
    usePSD: usePSD,
    scheduler: {
        get: function () { return asap$1; },
        set: function (value) { asap$1 = value; }
    },
    rejectionMapper: {
        get: function () { return rejectionMapper; },
        set: function (value) { rejectionMapper = value; } // Map reject failures
    },
    follow: function (fn, zoneProps) {
        return new DexiePromise(function (resolve, reject) {
            return newScope(function (resolve, reject) {
                var psd = PSD;
                psd.unhandleds = []; // For unhandled standard- or 3rd party Promises. Checked at psd.finalize()
                psd.onunhandled = reject; // Triggered directly on unhandled promises of this library.
                psd.finalize = callBoth(function () {
                    var _this = this;
                    // Unhandled standard or 3rd part promises are put in PSD.unhandleds and
                    // examined upon scope completion while unhandled rejections in this Promise
                    // will trigger directly through psd.onunhandled
                    run_at_end_of_this_or_next_physical_tick(function () {
                        _this.unhandleds.length === 0 ? resolve() : reject(_this.unhandleds[0]);
                    });
                }, psd.finalize);
                fn();
            }, zoneProps, resolve, reject);
        });
    }
});
if (NativePromise$1) {
    if (NativePromise$1.allSettled)
        setProp(DexiePromise, "allSettled", function () {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function (resolve) {
                if (possiblePromises.length === 0)
                    resolve([]);
                var remaining = possiblePromises.length;
                var results = new Array(remaining);
                possiblePromises.forEach(function (p, i) { return DexiePromise.resolve(p).then(function (value) { return results[i] = { status: "fulfilled", value: value }; }, function (reason) { return results[i] = { status: "rejected", reason: reason }; })
                    .then(function () { return --remaining || resolve(results); }); });
            });
        });
    if (NativePromise$1.any && typeof AggregateError !== 'undefined')
        setProp(DexiePromise, "any", function () {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function (resolve, reject) {
                if (possiblePromises.length === 0)
                    reject(new AggregateError([]));
                var remaining = possiblePromises.length;
                var failures = new Array(remaining);
                possiblePromises.forEach(function (p, i) { return DexiePromise.resolve(p).then(function (value) { return resolve(value); }, function (failure) {
                    failures[i] = failure;
                    if (!--remaining)
                        reject(new AggregateError(failures));
                }); });
            });
        });
}
/**
* Take a potentially misbehaving resolver function and make sure
* onFulfilled and onRejected are only called once.
*
* Makes no guarantees about asynchrony.
*/
function executePromiseTask(promise, fn) {
    // Promise Resolution Procedure:
    // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    try {
        fn(function (value) {
            if (promise._state !== null)
                return; // Already settled
            if (value === promise)
                throw new TypeError('A promise cannot be resolved with itself.');
            var shouldExecuteTick = promise._lib && beginMicroTickScope();
            if (value && typeof value.then === 'function') {
                executePromiseTask(promise, function (resolve, reject) {
                    value instanceof DexiePromise ?
                        value._then(resolve, reject) :
                        value.then(resolve, reject);
                });
            }
            else {
                promise._state = true;
                promise._value = value;
                propagateAllListeners(promise);
            }
            if (shouldExecuteTick)
                endMicroTickScope();
        }, handleRejection.bind(null, promise)); // If Function.bind is not supported. Exception is handled in catch below
    }
    catch (ex) {
        handleRejection(promise, ex);
    }
}
function handleRejection(promise, reason) {
    rejectingErrors.push(reason);
    if (promise._state !== null)
        return;
    var shouldExecuteTick = promise._lib && beginMicroTickScope();
    reason = rejectionMapper(reason);
    promise._state = false;
    promise._value = reason;
    debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(function () {
        var origProp = getPropertyDescriptor(reason, "stack");
        reason._promise = promise;
        setProp(reason, "stack", {
            get: function () {
                return stack_being_generated ?
                    origProp && (origProp.get ?
                        origProp.get.apply(reason) :
                        origProp.value) :
                    promise.stack;
            }
        });
    });
    // Add the failure to a list of possibly uncaught errors
    addPossiblyUnhandledError(promise);
    propagateAllListeners(promise);
    if (shouldExecuteTick)
        endMicroTickScope();
}
function propagateAllListeners(promise) {
    //debug && linkToPreviousPromise(promise);
    var listeners = promise._listeners;
    promise._listeners = [];
    for (var i = 0, len = listeners.length; i < len; ++i) {
        propagateToListener(promise, listeners[i]);
    }
    var psd = promise._PSD;
    --psd.ref || psd.finalize(); // if psd.ref reaches zero, call psd.finalize();
    if (numScheduledCalls === 0) {
        // If numScheduledCalls is 0, it means that our stack is not in a callback of a scheduled call,
        // and that no deferreds where listening to this rejection or success.
        // Since there is a risk that our stack can contain application code that may
        // do stuff after this code is finished that may generate new calls, we cannot
        // call finalizers here.
        ++numScheduledCalls;
        asap$1(function () {
            if (--numScheduledCalls === 0)
                finalizePhysicalTick(); // Will detect unhandled errors
        }, []);
    }
}
function propagateToListener(promise, listener) {
    if (promise._state === null) {
        promise._listeners.push(listener);
        return;
    }
    var cb = promise._state ? listener.onFulfilled : listener.onRejected;
    if (cb === null) {
        // This Listener doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
        return (promise._state ? listener.resolve : listener.reject)(promise._value);
    }
    ++listener.psd.ref;
    ++numScheduledCalls;
    asap$1(callListener, [cb, promise, listener]);
}
function callListener(cb, promise, listener) {
    try {
        // Set static variable currentFulfiller to the promise that is being fullfilled,
        // so that we connect the chain of promises (for long stacks support)
        currentFulfiller = promise;
        // Call callback and resolve our listener with it's return value.
        var ret, value = promise._value;
        if (promise._state) {
            // cb is onResolved
            ret = cb(value);
        }
        else {
            // cb is onRejected
            if (rejectingErrors.length)
                rejectingErrors = [];
            ret = cb(value);
            if (rejectingErrors.indexOf(value) === -1)
                markErrorAsHandled(promise); // Callback didnt do Promise.reject(err) nor reject(err) onto another promise.
        }
        listener.resolve(ret);
    }
    catch (e) {
        // Exception thrown in callback. Reject our listener.
        listener.reject(e);
    }
    finally {
        // Restore env and currentFulfiller.
        currentFulfiller = null;
        if (--numScheduledCalls === 0)
            finalizePhysicalTick();
        --listener.psd.ref || listener.psd.finalize();
    }
}
function getStack(promise, stacks, limit) {
    if (stacks.length === limit)
        return stacks;
    var stack = "";
    if (promise._state === false) {
        var failure = promise._value, errorName, message;
        if (failure != null) {
            errorName = failure.name || "Error";
            message = failure.message || failure;
            stack = prettyStack(failure, 0);
        }
        else {
            errorName = failure; // If error is undefined or null, show that.
            message = "";
        }
        stacks.push(errorName + (message ? ": " + message : "") + stack);
    }
    if (debug) {
        stack = prettyStack(promise._stackHolder, 2);
        if (stack && stacks.indexOf(stack) === -1)
            stacks.push(stack);
        if (promise._prev)
            getStack(promise._prev, stacks, limit);
    }
    return stacks;
}
function linkToPreviousPromise(promise, prev) {
    // Support long stacks by linking to previous completed promise.
    var numPrev = prev ? prev._numPrev + 1 : 0;
    if (numPrev < LONG_STACKS_CLIP_LIMIT) { // Prohibit infinite Promise loops to get an infinite long memory consuming "tail".
        promise._prev = prev;
        promise._numPrev = numPrev;
    }
}
/* The callback to schedule with setImmediate() or setTimeout().
   It runs a virtual microtick and executes any callback registered in microtickQueue.
 */
function physicalTick() {
    beginMicroTickScope() && endMicroTickScope();
}
function beginMicroTickScope() {
    var wasRootExec = isOutsideMicroTick;
    isOutsideMicroTick = false;
    needsNewPhysicalTick = false;
    return wasRootExec;
}
/* Executes micro-ticks without doing try..catch.
   This can be possible because we only use this internally and
   the registered functions are exception-safe (they do try..catch
   internally before calling any external method). If registering
   functions in the microtickQueue that are not exception-safe, this
   would destroy the framework and make it instable. So we don't export
   our asap method.
*/
function endMicroTickScope() {
    var callbacks, i, l;
    do {
        while (microtickQueue.length > 0) {
            callbacks = microtickQueue;
            microtickQueue = [];
            l = callbacks.length;
            for (i = 0; i < l; ++i) {
                var item = callbacks[i];
                item[0].apply(null, item[1]);
            }
        }
    } while (microtickQueue.length > 0);
    isOutsideMicroTick = true;
    needsNewPhysicalTick = true;
}
function finalizePhysicalTick() {
    var unhandledErrs = unhandledErrors;
    unhandledErrors = [];
    unhandledErrs.forEach(function (p) {
        p._PSD.onunhandled.call(null, p._value, p);
    });
    var finalizers = tickFinalizers.slice(0); // Clone first because finalizer may remove itself from list.
    var i = finalizers.length;
    while (i)
        finalizers[--i]();
}
function run_at_end_of_this_or_next_physical_tick(fn) {
    function finalizer() {
        fn();
        tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
    }
    tickFinalizers.push(finalizer);
    ++numScheduledCalls;
    asap$1(function () {
        if (--numScheduledCalls === 0)
            finalizePhysicalTick();
    }, []);
}
function addPossiblyUnhandledError(promise) {
    // Only add to unhandledErrors if not already there. The first one to add to this list
    // will be upon the first rejection so that the root cause (first promise in the
    // rejection chain) is the one listed.
    if (!unhandledErrors.some(function (p) { return p._value === promise._value; }))
        unhandledErrors.push(promise);
}
function markErrorAsHandled(promise) {
    // Called when a reject handled is actually being called.
    // Search in unhandledErrors for any promise whos _value is this promise_value (list
    // contains only rejected promises, and only one item per error)
    var i = unhandledErrors.length;
    while (i)
        if (unhandledErrors[--i]._value === promise._value) {
            // Found a promise that failed with this same error object pointer,
            // Remove that since there is a listener that actually takes care of it.
            unhandledErrors.splice(i, 1);
            return;
        }
}
function PromiseReject(reason) {
    return new DexiePromise(INTERNAL, false, reason);
}

//
// variables used for native await support
//
var task = { awaits: 0, echoes: 0, id: 0 }; // The ongoing macro-task when using zone-echoing.
var taskCounter = 0; // ID counter for macro tasks.
var zoneStack = []; // Stack of left zones to restore asynchronically.
var zoneEchoes = 0; // zoneEchoes is a must in order to persist zones between native await expressions.
var totalEchoes = 0; // ID counter for micro-tasks. Used to detect possible native await in our Promise.prototype.then.
var zone_id_counter = 0;
function newScope(fn, props$$1, a1, a2) {
    var parent = PSD, psd = Object.create(parent);
    psd.parent = parent;
    psd.ref = 0;
    psd.global = false;
    psd.id = ++zone_id_counter;
    // Prepare for promise patching (done in usePSD):
    var globalEnv = globalPSD.env;
    psd.env = patchGlobalPromise ? {
        Promise: DexiePromise,
        PromiseProp: { value: DexiePromise, configurable: true, writable: true },
        all: DexiePromise.all,
        race: DexiePromise.race,
        allSettled: DexiePromise.allSettled,
        any: DexiePromise.any,
        resolve: DexiePromise.resolve,
        reject: DexiePromise.reject,
        nthen: getPatchedPromiseThen(globalEnv.nthen, psd),
        gthen: getPatchedPromiseThen(globalEnv.gthen, psd) // global then
    } : {};
    if (props$$1)
        extend(psd, props$$1);
    // unhandleds and onunhandled should not be specifically set here.
    // Leave them on parent prototype.
    // unhandleds.push(err) will push to parent's prototype
    // onunhandled() will call parents onunhandled (with this scope's this-pointer though!)
    ++parent.ref;
    psd.finalize = function () {
        --this.parent.ref || this.parent.finalize();
    };
    var rv = usePSD(psd, fn, a1, a2);
    if (psd.ref === 0)
        psd.finalize();
    return rv;
}
// Function to call if scopeFunc returns NativePromise
// Also for each NativePromise in the arguments to Promise.all()
function incrementExpectedAwaits() {
    if (!task.id)
        task.id = ++taskCounter;
    ++task.awaits;
    task.echoes += ZONE_ECHO_LIMIT;
    return task.id;
}
// Function to call when 'then' calls back on a native promise where onAwaitExpected() had been called.
// Also call this when a native await calls then method on a promise. In that case, don't supply
// sourceTaskId because we already know it refers to current task.
function decrementExpectedAwaits() {
    if (!task.awaits)
        return false;
    if (--task.awaits === 0)
        task.id = 0;
    task.echoes = task.awaits * ZONE_ECHO_LIMIT; // Will reset echoes to 0 if awaits is 0.
    return true;
}
if (('' + nativePromiseThen).indexOf('[native code]') === -1) {
    // If the native promise' prototype is patched, we cannot rely on zone echoing.
    // Disable that here:
    incrementExpectedAwaits = decrementExpectedAwaits = nop;
}
// Call from Promise.all() and Promise.race()
function onPossibleParallellAsync(possiblePromise) {
    if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise$1) {
        incrementExpectedAwaits();
        return possiblePromise.then(function (x) {
            decrementExpectedAwaits();
            return x;
        }, function (e) {
            decrementExpectedAwaits();
            return rejection(e);
        });
    }
    return possiblePromise;
}
function zoneEnterEcho(targetZone) {
    ++totalEchoes;
    //console.log("Total echoes ", totalEchoes);
    if (!task.echoes || --task.echoes === 0) {
        task.echoes = task.id = 0; // Cancel zone echoing.
    }
    zoneStack.push(PSD);
    switchToZone(targetZone, true);
}
function zoneLeaveEcho() {
    var zone = zoneStack[zoneStack.length - 1];
    zoneStack.pop();
    switchToZone(zone, false);
}
function switchToZone(targetZone, bEnteringZone) {
    var currentZone = PSD;
    if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
        // Enter or leave zone asynchronically as well, so that tasks initiated during current tick
        // will be surrounded by the zone when they are invoked.
        enqueueNativeMicroTask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
    }
    if (targetZone === PSD)
        return;
    PSD = targetZone; // The actual zone switch occurs at this line.
    // Snapshot on every leave from global zone.
    if (currentZone === globalPSD)
        globalPSD.env = snapShot();
    if (patchGlobalPromise) {
        // Let's patch the global and native Promises (may be same or may be different)
        var GlobalPromise_1 = globalPSD.env.Promise;
        // Swich environments (may be PSD-zone or the global zone. Both apply.)
        var targetEnv = targetZone.env;
        // Change Promise.prototype.then for native and global Promise (they MAY differ on polyfilled environments, but both can be accessed)
        // Must be done on each zone change because the patched method contains targetZone in its closure.
        nativePromiseProto.then = targetEnv.nthen;
        GlobalPromise_1.prototype.then = targetEnv.gthen;
        if (currentZone.global || targetZone.global) {
            // Leaving or entering global zone. It's time to patch / restore global Promise.
            // Set this Promise to window.Promise so that transiled async functions will work on Firefox, Safari and IE, as well as with Zonejs and angular.
            Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp);
            // Support Promise.all() etc to work indexedDB-safe also when people are including es6-promise as a module (they might
            // not be accessing global.Promise but a local reference to it)
            GlobalPromise_1.all = targetEnv.all;
            GlobalPromise_1.race = targetEnv.race;
            GlobalPromise_1.resolve = targetEnv.resolve;
            GlobalPromise_1.reject = targetEnv.reject;
            if (targetEnv.allSettled)
                GlobalPromise_1.allSettled = targetEnv.allSettled;
            if (targetEnv.any)
                GlobalPromise_1.any = targetEnv.any;
        }
    }
}
function snapShot() {
    var GlobalPromise = _global.Promise;
    return patchGlobalPromise ? {
        Promise: GlobalPromise,
        PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
        all: GlobalPromise.all,
        race: GlobalPromise.race,
        allSettled: GlobalPromise.allSettled,
        any: GlobalPromise.any,
        resolve: GlobalPromise.resolve,
        reject: GlobalPromise.reject,
        nthen: nativePromiseProto.then,
        gthen: GlobalPromise.prototype.then
    } : {};
}
function usePSD(psd, fn, a1, a2, a3) {
    var outerScope = PSD;
    try {
        switchToZone(psd, true);
        return fn(a1, a2, a3);
    }
    finally {
        switchToZone(outerScope, false);
    }
}
function enqueueNativeMicroTask(job) {
    //
    // Precondition: nativePromiseThen !== undefined
    //
    nativePromiseThen.call(resolvedNativePromise, job);
}
function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
    return typeof fn !== 'function' ? fn : function () {
        var outerZone = PSD;
        if (possibleAwait)
            incrementExpectedAwaits();
        switchToZone(zone, true);
        try {
            return fn.apply(this, arguments);
        }
        finally {
            switchToZone(outerZone, false);
            if (cleanup)
                enqueueNativeMicroTask(decrementExpectedAwaits);
        }
    };
}
function getPatchedPromiseThen(origThen, zone) {
    return function (onResolved, onRejected) {
        return origThen.call(this, nativeAwaitCompatibleWrap(onResolved, zone), nativeAwaitCompatibleWrap(onRejected, zone));
    };
}
var UNHANDLEDREJECTION = "unhandledrejection";
function globalError(err, promise) {
    var rv;
    try {
        rv = promise.onuncatched(err);
    }
    catch (e) { }
    if (rv !== false)
        try {
            var event, eventData = { promise: promise, reason: err };
            if (_global.document && document.createEvent) {
                event = document.createEvent('Event');
                event.initEvent(UNHANDLEDREJECTION, true, true);
                extend(event, eventData);
            }
            else if (_global.CustomEvent) {
                event = new CustomEvent(UNHANDLEDREJECTION, { detail: eventData });
                extend(event, eventData);
            }
            if (event && _global.dispatchEvent) {
                dispatchEvent(event);
                if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
                    // No native support for PromiseRejectionEvent but user has set window.onunhandledrejection. Manually call it.
                    try {
                        _global.onunhandledrejection(event);
                    }
                    catch (_) { }
            }
            if (debug && event && !event.defaultPrevented) {
                console.warn("Unhandled rejection: " + (err.stack || err));
            }
        }
        catch (e) { }
}
var rejection = DexiePromise.reject;

var _resolve = NativePromise$1.resolve.bind(NativePromise$1);
var _then = NativePromise$1.prototype.then;
var IdbPromiseIncompatibleError = /** @class */ (function (_super) {
    __extends(IdbPromiseIncompatibleError, _super);
    function IdbPromiseIncompatibleError() {
        var _this = _super.call(this, "IndexedDB and Promise are incompatible on this browser") || this;
        _this.name = "IdbPromiseIncompatibleError";
        return _this;
    }
    return IdbPromiseIncompatibleError;
}(Error));
function isIdbAndPromiseCompatible() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = new Dexie__default("idbPromiseCompatTest");
                    db.version(1).stores({ foo: 'bar' });
                    return [4 /*yield*/, db.delete()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, db.open()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.transaction('r', db.foo, function () { return __awaiter(_this, void 0, void 0, function () {
                            var x, p, i, result, ex_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db.foo.count()];
                                    case 1:
                                        x = _a.sent();
                                        p = _resolve(0);
                                        for (i = 0; i < 10; ++i) {
                                            p = _then.call(p, function (x) { return x + 1; });
                                        }
                                        return [4 /*yield*/, p];
                                    case 2:
                                        result = _a.sent();
                                        console.log("Result: " + result + " (should be 10");
                                        _a.label = 3;
                                    case 3:
                                        _a.trys.push([3, 5, , 6]);
                                        return [4 /*yield*/, db.foo.count()];
                                    case 4:
                                        _a.sent();
                                        db.close();
                                        return [2 /*return*/, true];
                                    case 5:
                                        ex_1 = _a.sent();
                                        db.close();
                                        throw new IdbPromiseIncompatibleError();
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}

var idbAndPromiseCompatible;
var hasNativeAsyncFunctions = false;
try {
    hasNativeAsyncFunctions = !!new Function("return (async ()=>{})();")().then;
}
catch (e) { }
var db$5 = new Dexie__default("TestDBTranx");
db$5.version(1).stores({
    items: "id"
});
QUnit.module("asyncawait", {
    setup: function (assert) {
        // Execute this promise when needed:
        if (idbAndPromiseCompatible === undefined) {
            // Initialize this promise.
            idbAndPromiseCompatible = isIdbAndPromiseCompatible();
        }
        var done = assert.async();
        resetDatabase(db$5).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(done);
    },
    teardown: function () {
    }
});
QUnit.test("Should be able to use global Promise within transaction scopes", function (assert) {
    var done = assert.async();
    db$5.transaction('rw', db$5.items, function (trans) {
        return window.Promise.resolve().then(function () {
            QUnit.ok(Dexie__default.currentTransaction == trans, "Transaction scopes should persist through Promise.resolve()");
            return db$5.items.add({ id: "foobar" });
        }).then(function () {
            return Promise.resolve();
        }).then(function () {
            QUnit.ok(Dexie__default.currentTransaction == trans, "Transaction scopes should persist through Promise.resolve()");
            return db$5.items.get('foobar');
        });
    }).then(function (foobar) {
        QUnit.equal(foobar.id, 'foobar', "Transaction should have lived throughout the Promise.resolve() chain");
    }).catch(function (e) {
        QUnit.ok(false, "Error: " + (e.stack || e));
    }).finally(done);
});
QUnit.test("Should be able to use native async await", function (assert) {
    var done = assert.async();
    Dexie__default.Promise.resolve(idbAndPromiseCompatible).then(function () {
        var f = new Function('ok', 'equal', 'Dexie', 'db', "return db.transaction('rw', db.items, async ()=>{\n            let trans = Dexie.currentTransaction;\n            ok(!!trans, \"Should have a current transaction\");\n            await db.items.add({id: 'foo'});\n            ok(Dexie.currentTransaction === trans, \"Transaction persisted between await calls of Dexie.Promise\");\n            await Dexie.Promise.resolve();\n            ok(Dexie.currentTransaction === trans, \"Transaction persisted between await calls of Dexie.Promise synch\");\n            await window.Promise.resolve();\n            ok(Dexie.currentTransaction === trans, \"Transaction persisted between await calls of global Promise\");\n            await 3;\n            ok(Dexie.currentTransaction === trans, \"Transaction persisted between await calls of primitive(!)\");\n            await db.transaction('r', db.items, async innerTrans => {\n                ok(!!innerTrans, \"SHould have inner transaction\");\n                equal(Dexie.currentTransaction, innerTrans, \"Inner transaction should be there\");\n                equal(innerTrans.parent, trans, \"Parent transaction should be correct\");\n                let x = await db.items.get(1);\n                ok(Dexie.currentTransaction === innerTrans, \"Transaction persisted in inner transaction\");\n            });\n            ok(Dexie.currentTransaction === trans, \"Transaction persisted between await calls of sub transaction\");\n            await (async ()=>{\n                return await db.items.get(1);\n            })();\n            ok(Dexie.currentTransaction === trans, \"Transaction persisted between await calls of async function\");\n            await (async ()=>{\n                await Promise.all([db.transaction('r', db.items, async() => {\n                    await db.items.get(1);\n                    await db.items.get(2);\n                }), db.transaction('r', db.items, async() => {\n                    return await db.items.get(1);\n                })]);\n            })();\n            ok(Dexie.currentTransaction === trans, \"Transaction persisted between await calls of async function 2\");\n\n            await window.Promise.resolve().then(()=>{\n                ok(Dexie.currentTransaction === trans, \"Transaction persisted after window.Promise.resolve().then()\");\n                return (async ()=>{})(); // Resolve with native promise\n            }).then(()=>{\n                ok(Dexie.currentTransaction === trans, \"Transaction persisted after native promise completion\");\n                return window.Promise.resolve();\n            }).then(()=>{\n                ok(Dexie.currentTransaction === trans, \"Transaction persisted after window.Promise.resolve().then()\");\n                return (async ()=>{})();\n            });\n            ok(Dexie.currentTransaction === trans, \"Transaction persisted between await calls of mixed promises\");\n            \n            try {\n                let foo = await db.items.get('foo');\n                ok(true, \"YOUR BROWSER HAS COMPATIBILITY BETWEEN NATIVE PROMISES AND INDEXEDDB!\");\n            } catch (e) {\n                ok(true, \"Browser has no compatibility between native promises and indexedDB.\");\n            }\n        })");
        return f(QUnit.ok, QUnit.equal, Dexie__default, db$5);
    }).catch('IdbPromiseIncompatibleError', function (e) {
        QUnit.ok(true, "Promise and IndexedDB is incompatible on this browser. Native async await fails in idb transaction by reality");
    }).catch(function (e) {
        if (hasNativeAsyncFunctions)
            QUnit.ok(false, "Error: " + (e.stack || e));
        else
            QUnit.ok(true, "This browser does not support native async functions");
    }).then(done);
});
QUnit.test("Should be able to use native async await from upgrade handler (issue #612)", function (assert) {
    var done = assert.async();
    Dexie__default.Promise.resolve(idbAndPromiseCompatible).then(function () {
        var f = new Function('ok', 'equal', 'Dexie', "\n        return Dexie.delete('issue612').then(async ()=>{\n          const log = [];\n          const db = new Dexie('issue612');\n          db.version(1).stores({foo: 'id'});\n          await db.open();\n          await db.foo.add({id: 1, name: \"Foo Bar\"});\n          db.close();\n          db.version(2).stores({foo: 'id, firstName, lastName'}).upgrade(async tx => {\n            log.push(\"2:1\");\n            await tx.foo.toCollection().modify(x => {\n                const [firstName, lastName] = x.name.split(' ');\n                x.firstName = firstName;\n                x.lastName = lastName;\n                ++x.v\n            });\n            log.push(\"2:2\");\n          });\n          db.version(3).upgrade(async tx => {\n            log.push(\"3:1\");\n            await tx.foo.toArray();\n            log.push(\"3:2\");\n          });\n          await db.open();\n          const count = await db.foo.where({firstName: 'Foo'}).count();\n          equal(count, 1, \"Should find base on the upgraded index\");\n          equal(log.join(','), \"2:1,2:2,3:1,3:2\", \"Execution order of upgraders should be correct\");\n          db.close();\n        });");
        return f(QUnit.ok, QUnit.equal, Dexie__default);
    }).catch('IdbPromiseIncompatibleError', function (e) {
        QUnit.ok(true, "Promise and IndexedDB is incompatible on this browser. Native async await fails in idb transaction by reality");
    }).catch(function (e) {
        if (hasNativeAsyncFunctions)
            QUnit.ok(false, "Error: " + (e.stack || e));
        else
            QUnit.ok(true, "This browser does not support native async functions");
    }).then(function () {
        return Dexie__default.delete("issue612");
    }).then(done);
});
var NativePromise$2 = (function () {
    try {
        return new Function("return (async ()=>{})().constructor")();
    }
    catch (e) {
        return window.Promise;
    }
})();
QUnit.test("Must not leak PSD zone", function (assert) {
    return __awaiter(this, void 0, void 0, function () {
        var done, compatiblity, F;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    done = assert.async();
                    return [4 /*yield*/, idbAndPromiseCompatible.catch(function (e) {
                            return false;
                        })];
                case 1:
                    compatiblity = _a.sent();
                    if (!compatiblity) {
                        QUnit.ok(true, "Promise and IndexedDB is incompatible on this browser. Native async await fails \"by design\"");
                        done();
                        return [2 /*return*/];
                    }
                    if (!hasNativeAsyncFunctions) {
                        QUnit.ok(true, "Browser doesnt support native async-await");
                        done();
                        return [2 /*return*/];
                    }
                    F = new Function('ok', 'equal', 'Dexie', 'db', "\n        ok(Dexie.currentTransaction === null, \"Should not have an ongoing transaction to start with\");\n        var trans1, trans2;\n        var p1 = db.transaction('r', db.items, async ()=> {\n            var trans = trans1 = Dexie.currentTransaction;\n            await db.items.get(1); // Just to prohibit IDB bug in Safari - must use transaction in initial tick!\n            await 3;\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 1.0 - after await 3\");\n            await 4;\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 1.0 - after await 4\");\n            await 5;\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 1.0 - after await 5\");\n            await db.items.get(1);\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 1.1 - after db.items.get(1)\");\n            await 6;\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 1.1 - after await 6\");\n            await subFunc(1);\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 1.2 - after async subFunc()\");\n            await Promise.all([subFunc(11), subFunc(12), subFunc(13)]);\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 1.3 - after Promise.all()\");\n            await subFunc2_syncResult();\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 1.4 - after async subFunc_syncResult()\");\n            await Promise.all([subFunc2_syncResult(), subFunc2_syncResult(), subFunc2_syncResult()]);\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 1.5 - after Promise.all(sync results)\");\n        });\n        var p2 = db.transaction('r', db.items, async ()=> {\n            var trans = trans2 = Dexie.currentTransaction;\n            await db.items.get(1); // Just to prohibit IDB bug in Safari - must use transaction in initial tick!\n            ok(trans1 !== trans2, \"Parallell transactions must be different from each other\");\n            await 3;\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 2.0 - after await 3\");\n            await db.items.get(1);\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 2.1 - after db.items.get(1)\");\n            await subFunc(2);\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 2.2 - after async subFunc()\");\n            await Promise.all([subFunc(21), subFunc(22), subFunc(23)]);\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 2.3 - after Promise.all()\");\n            await subFunc2_syncResult();\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 2.4 - after async subFunc_syncResult()\");\n            await Promise.all([subFunc2_syncResult(), subFunc2_syncResult(), subFunc2_syncResult()]);\n            ok(Dexie.currentTransaction === trans, \"Should still be in same transaction 2.5 - after Promise.all(sync results)\");\n        });\n        //var p2 = Promise.resolve();\n        ok(Dexie.currentTransaction === null, \"Should not have an ongoing transaction after transactions\");\n\n        async function subFunc(n) {\n            await 3;\n            let result = await db.items.get(2);\n            return result;\n        }\n\n        async function subFunc2_syncResult() {\n            let result = await 3;\n            return result;\n        }\n        \n        return Promise.all([p1, p2]);\n    ");
                    F(QUnit.ok, QUnit.equal, Dexie__default, db$5).catch(function (e) { return QUnit.ok(false, e.stack || e); }).then(done);
                    return [2 /*return*/];
            }
        });
    });
});
QUnit.test("Must not leak PSD zone2", function (assert) {
    return __awaiter(this, void 0, void 0, function () {
        var done;
        return __generator(this, function (_a) {
            done = assert.async();
            QUnit.ok(Dexie__default.currentTransaction === null, "Should not have an ongoing transaction to start with");
            db$5.transaction('rw', db$5.items, function () {
                var trans = Dexie__default.currentTransaction;
                QUnit.ok(trans !== null, "Should have a current transaction");
                var otherZonePromise;
                Dexie__default.ignoreTransaction(function () {
                    QUnit.ok(Dexie__default.currentTransaction == null, "No Transaction in this zone");
                    function promiseFlow() {
                        return NativePromise$2.resolve().then(function () {
                            if (Dexie__default.currentTransaction !== null)
                                QUnit.ok(false, "PSD zone leaked");
                            return new NativePromise$2(function (resolve) { return NativePromise$2.resolve().then(resolve); });
                        });
                    }
                    
                    otherZonePromise = promiseFlow();
                    for (var i = 0; i < 100; ++i) {
                        otherZonePromise = otherZonePromise.then(promiseFlow);
                    }
                });
                // In parallell with the above 2*100 async tasks are being executed and verified,
                // maintain the transaction zone below:        
                return db$5.items.get(1).then(function () {
                    return idbAndPromiseCompatible;
                }).then(function () {
                    QUnit.ok(Dexie__default.currentTransaction === trans, "Still same transaction 1");
                    // Make sure native async functions maintains the zone:
                    var f = new Function('ok', 'equal', 'Dexie', 'trans', 'NativePromise', 'db', "return (async ()=>{\n                ok(Dexie.currentTransaction === trans, \"Still same transaction 1.1\");\n                await Promise.resolve();\n                ok(Dexie.currentTransaction === trans, \"Still same transaction 1.2\");\n                await Dexie.Promise.resolve();\n                ok(Dexie.currentTransaction === trans, \"Still same transaction 1.3\");\n                await window.Promise.resolve();\n                ok(Dexie.currentTransaction === trans, \"Still same transaction 1.4\");\n                await db.items.get(1);\n            })()");
                    return f(QUnit.ok, QUnit.equal, Dexie__default, trans, NativePromise$2, db$5);
                }).catch(function (e) {
                    // Could not test native async functions in this browser.
                    if (e.name === 'IdbPromiseIncompatibleError') {
                        QUnit.ok(true, "Promise and IndexedDB is incompatible on this browser. Native async await fails \"by design\" for indexedDB transactions");
                    }
                    else if (hasNativeAsyncFunctions)
                        QUnit.ok(false, "Error: " + (e.stack || e));
                    else
                        QUnit.ok(true, "This browser does not support native async functions");
                }).then(function () {
                    // NativePromise
                    QUnit.ok(Dexie__default.currentTransaction === trans, "Still same transaction 2");
                    return Promise.resolve();
                }).then(function () {
                    // window.Promise
                    QUnit.ok(Dexie__default.currentTransaction === trans, "Still same transaction 3");
                    return Dexie__default.Promise.resolve();
                }).then(function () {
                    // Dexie.Promise
                    QUnit.ok(Dexie__default.currentTransaction === trans, "Still same transaction 4");
                    return otherZonePromise; // wait for the foreign zone promise to complete.
                }).then(function () {
                    QUnit.ok(Dexie__default.currentTransaction === trans, "Still same transaction 5");
                });
            }).catch(function (e) {
                QUnit.ok(false, "Error: " + (e.stack || e));
            }).then(done);
            return [2 /*return*/];
        });
    });
});
QUnit.test("Should be able to await Promise.all()", function (assert) { return __awaiter(void 0, void 0, void 0, function () {
    var done, compatible;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                done = assert.async();
                if (!hasNativeAsyncFunctions) {
                    QUnit.ok(true, "Browser doesnt support native async-await");
                    done();
                    return [2 /*return*/];
                }
                return [4 /*yield*/, idbAndPromiseCompatible.catch(function () { return false; })];
            case 1:
                compatible = _a.sent();
                if (!compatible) {
                    QUnit.ok(true, "Promise and IndexedDB is incompatible on this browser. Native async await fails \"by design\" for indexedDB transactions");
                    done();
                    return [2 /*return*/];
                }
                (new Function('ok', 'equal', 'Dexie', 'db', "return db.transaction('r', db.items, async (trans)=>{\n        ok(Dexie.currentTransaction === trans, \"Correct initial transaction.\");\n        await db.items.get(1); // Just to prohibit IDB bug in Safari - must use transaction in initial tick!\n        var promises = [];\n        for (var i=0; i<50; ++i) {\n            promises.push(subAsync1(trans));\n        }\n        for (var i=0; i<50; ++i) {\n            promises.push(subAsync2(trans));\n        }\n        await Promise.all(promises);\n        ok(Dexie.currentTransaction === trans, \"Still same transaction 1 - after await Promise.all([100 promises...]);\");\n        await Promise.all([1,2,3, db.items.get(2)]);\n        ok(Dexie.currentTransaction === trans, \"Still same transaction 2 - after Promise.all(1,2,3,db.items.get(2))\");\n        await db.items.get(1);\n        ok(Dexie.currentTransaction === trans, \"Still same transaction 3 - after await db.items.get(1);\");\n        await 3;\n        ok(Dexie.currentTransaction === trans, \"Still same transaction 4 - after await 3;\");\n    });\n\n    async function subAsync1 (trans) {\n        await 1;\n        await 2;\n        await 3;\n        if (Dexie.currentTransaction !== trans) ok(false, \"Not in transaction\");\n    }\n\n    async function subAsync2 (trans) {\n        await 1;\n        await 2;\n        if (Dexie.currentTransaction !== trans) ok(false, \"Not in transaction 2\");\n        await db.items.get(1);\n    }\n    "))(QUnit.ok, QUnit.equal, Dexie__default, db$5)
                    .catch(function (e) {
                    QUnit.ok(false, e.stack || e);
                }).then(done);
                return [2 /*return*/];
        }
    });
}); });
spawnedTest("Should use Promise.all where applicable", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db$5.transaction('rw', db$5.items, function () {
                    var x, all;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, Promise.resolve(3)];
                            case 1:
                                x = _a.sent();
                                return [4 /*yield*/, db$5.items.bulkAdd([{ id: 'a' }, { id: 'b' }])];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, Promise.all([db$5.items.get('a'), db$5.items.get('b')])];
                            case 3:
                                all = _a.sent();
                                QUnit.equal(all.length, 2);
                                QUnit.equal(all[0].id, 'a');
                                QUnit.equal(all[1].id, 'b');
                                return [4 /*yield*/, Promise.all([db$5.items.get('a'), db$5.items.get('b')])];
                            case 4:
                                all = _a.sent();
                                QUnit.equal(all.length, 2);
                                QUnit.equal(all[0].id, 'a');
                                QUnit.equal(all[1].id, 'b');
                                return [2 /*return*/];
                        }
                    });
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("Even when keeping a reference to global Promise, still maintain PSD zone states", function () {
    var Promise;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                Promise = window.Promise;
                return [4 /*yield*/, db$5.transaction('rw', db$5.items, function () {
                        var trans = Dexie__default.currentTransaction;
                        QUnit.ok(trans !== null, "Have a transaction");
                        return Promise.resolve().then(function () {
                            QUnit.ok(Dexie__default.currentTransaction === trans, "Still have the same current transaction.");
                            return Promise.resolve().then(function () { return Promise.resolve(); });
                        }).then(function () {
                            QUnit.ok(Dexie__default.currentTransaction === trans, "Still have the same current transaction after multiple global.Promise.resolve() calls");
                        });
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("Sub Transactions with async await", function () {
    var compatible, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, idbAndPromiseCompatible.catch(function () { return false; })];
            case 1:
                compatible = _a.sent();
                if (!compatible) {
                    QUnit.ok(true, "Promise and IndexedDB is incompatible on this browser. Native async await fails \"by design\" for indexedDB transactions");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, new Function('equal', 'ok', 'Dexie', 'db', "return (async ()=>{\n            await db.items.bulkAdd([{id: 1}, {id:2}, {id: 3}]);\n            let result = await db.transaction('rw', db.items, async ()=>{\n                let items = await db.items.toArray();\n                let numItems = await db.transaction('r', db.items, async ()=>{\n                    equal(await db.items.count(), await db.items.count(), \"Two awaits of count should equal\");\n                    equal(await db.items.count(), 3, \"Should be 3 items\");\n                    return await db.items.count();\n                });\n                let numItems2 = await db.transaction('r', db.items, async ()=>{\n                    equal(await db.items.count(), await db.items.count(), \"Two awaits of count should equal\");\n                    equal(await db.items.count(), 3, \"Should be 3 items\");\n                    return await db.items.count();\n                });\n                equal (numItems, numItems2, \"The total two inner transactions should be possible to run after each other\");\n                return numItems;\n            });\n            equal (result, 3, \"Result should be 3\");\n        })();")(QUnit.equal, QUnit.ok, Dexie__default, db$5)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                QUnit.ok(e_1.name === 'SyntaxError', "No support for native async functions in this browser");
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
});
promisedTest("Should patch global Promise within transaction scopes but leave them intact outside", function () { return __awaiter(void 0, void 0, void 0, function () {
    var GlobalPromise;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                QUnit.ok(Promise !== Dexie__default.Promise, "At global scope. Promise should not be Dexie.Promise");
                QUnit.ok(window.Promise !== Dexie__default.Promise, "At global scope. Promise should not be Dexie.Promise");
                GlobalPromise = window.Promise;
                return [4 /*yield*/, db$5.transaction('rw', db$5.items, function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            QUnit.ok(Promise === Dexie__default.Promise, "Within transaction scope, Promise should be Dexie.Promise.");
                            QUnit.ok(window.Promise === Dexie__default.Promise, "Within transaction scope, window.Promise should be Dexie.Promise.");
                            QUnit.ok(GlobalPromise !== Promise, "Promises are different");
                            QUnit.ok(GlobalPromise.resolve === Promise.resolve, "If holding a reference to the real global promise and doing Promise.resolve() it should be Dexie.Promise.resolve withing transaction scopes");
                            QUnit.ok(GlobalPromise.reject === Promise.reject, "If holding a reference to the real global promise and doing Promise.reject() it should be Dexie.Promise.reject withing transaction scopes");
                            QUnit.ok(GlobalPromise.all === Promise.all, "If holding a reference to the real global promise and doing Promise.all() it should be Dexie.Promise.all withing transaction scopes");
                            QUnit.ok(GlobalPromise.race === Promise.race, "If holding a reference to the real global promise and doing Promise.race() it should be Dexie.Promise.race withing transaction scopes");
                            return [2 /*return*/];
                        });
                    }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Should be able to use transpiled async await", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db$5.transaction('rw', db$5.items, function () { return __awaiter(void 0, void 0, void 0, function () {
                    var trans;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                trans = Dexie__default.currentTransaction;
                                QUnit.ok(!!trans, "Should have a current transaction");
                                return [4 /*yield*/, db$5.items.add({ id: 'foo' })];
                            case 1:
                                _a.sent();
                                QUnit.ok(Dexie__default.currentTransaction === trans, "Transaction persisted between await calls of Dexie.Promise");
                                return [4 /*yield*/, Promise.resolve()];
                            case 2:
                                _a.sent();
                                QUnit.ok(Dexie__default.currentTransaction === trans, "Transaction persisted between await calls of Promise.resolve()");
                                return [4 /*yield*/, 3];
                            case 3:
                                _a.sent();
                                QUnit.ok(Dexie__default.currentTransaction === trans, "Transaction persisted after await 3");
                                return [4 /*yield*/, db$5.transaction('r', db$5.items, function (innerTrans) { return __awaiter(void 0, void 0, void 0, function () {
                                        var x;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    QUnit.ok(!!innerTrans, "Should have inner transaction");
                                                    QUnit.equal(Dexie__default.currentTransaction, innerTrans, "Inner transaction should be there");
                                                    QUnit.equal(innerTrans.parent, trans, "Parent transaction should be correct");
                                                    return [4 /*yield*/, db$5.items.get(1)];
                                                case 1:
                                                    x = _a.sent();
                                                    QUnit.ok(Dexie__default.currentTransaction === innerTrans, "Transaction persisted in inner transaction");
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                            case 4:
                                _a.sent();
                                QUnit.ok(Dexie__default.currentTransaction === trans, "Transaction persisted between await calls of sub transaction");
                                return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, db$5.items.get(1)];
                                                case 1: return [2 /*return*/, _a.sent()];
                                            }
                                        });
                                    }); })()];
                            case 5:
                                _a.sent();
                                QUnit.ok(Dexie__default.currentTransaction === trans, "Transaction persisted between await calls of async function");
                                return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, Promise.all([db$5.transaction('r', db$5.items, function () { return __awaiter(void 0, void 0, void 0, function () {
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0: return [4 /*yield*/, db$5.items.get(1)];
                                                                    case 1:
                                                                        _a.sent();
                                                                        return [4 /*yield*/, db$5.items.get(2)];
                                                                    case 2:
                                                                        _a.sent();
                                                                        return [2 /*return*/];
                                                                }
                                                            });
                                                        }); }), db$5.transaction('r', db$5.items, function () { return __awaiter(void 0, void 0, void 0, function () {
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0: return [4 /*yield*/, db$5.items.get(1)];
                                                                    case 1: return [2 /*return*/, _a.sent()];
                                                                }
                                                            });
                                                        }); })])];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })()];
                            case 6:
                                _a.sent();
                                QUnit.ok(Dexie__default.currentTransaction === trans, "Transaction persisted between await calls of async function 2");
                                return [4 /*yield*/, Promise.resolve().then(function () {
                                        QUnit.ok(Dexie__default.currentTransaction === trans, "Transaction persisted after window.Promise.resolve().then()");
                                        return (function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                            return [2 /*return*/];
                                        }); }); })(); // Resolve with native promise
                                    }).then(function () {
                                        QUnit.ok(Dexie__default.currentTransaction === trans, "Transaction persisted after native promise completion");
                                        return Promise.resolve();
                                    }).then(function () {
                                        QUnit.ok(Dexie__default.currentTransaction === trans, "Transaction persisted after window.Promise.resolve().then()");
                                        return (function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                            return [2 /*return*/];
                                        }); }); })();
                                    })];
                            case 7:
                                _a.sent();
                                QUnit.ok(Dexie__default.currentTransaction === trans, "Transaction persisted between await calls of mixed promises");
                                return [2 /*return*/];
                        }
                    });
                }); }).catch('PrematureCommitError', function () {
                    QUnit.ok(true, "PROMISE IS INCOMPATIBLE WITH INDEXEDDB (https://github.com/dfahlander/Dexie.js/issues/317). Ignoring test.");
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Should be able to use some simpe native async await even without zone echoing ", function () { return __awaiter(void 0, void 0, void 0, function () {
    var compatible;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!hasNativeAsyncFunctions) {
                    QUnit.ok(true, "Browser doesnt support native async-await");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, idbAndPromiseCompatible.catch(function () { return false; })];
            case 1:
                compatible = _a.sent();
                if (!compatible) {
                    QUnit.ok(true, "Promise and IndexedDB is incompatible on this browser. Native async await fails \"by design\" for indexedDB transactions");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (new Function('ok', 'equal', 'Dexie', 'db', "return db.transaction('r', db.items, trans=> (async (trans) => {\n        ok(Dexie.currentTransaction === trans, \"Correct initial transaction.\");\n        await Promise.all([1,2,3, db.items.get(2), Promise.resolve()]);\n        ok(Dexie.currentTransaction === trans, \"Still same transaction 1 - after Promise.all(1,2,3,db.items.get(2))\");\n        await db.items.get(1);\n        ok(Dexie.currentTransaction === trans, \"Still same transaction 2 - after await db.items.get(1);\");\n    })(trans));"))(QUnit.ok, QUnit.equal, Dexie__default, db$5)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
var GlobalPromise = window.Promise;
promisedTest("Should behave outside transactions as well", function () { return __awaiter(void 0, void 0, void 0, function () {
    var compatible;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!hasNativeAsyncFunctions) {
                    QUnit.ok(true, "Browser doesnt support native async-await");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, idbAndPromiseCompatible.catch(function () { return false; })];
            case 1:
                compatible = _a.sent();
                if (!compatible) {
                    QUnit.ok(true, "Promise and IndexedDB is incompatible on this browser. Native async await fails \"by design\" for indexedDB transactions");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (new Function('ok', 'equal', 'Dexie', 'db', 'GlobalPromise', "async function doSomething() {\n        ok(!Dexie.currentTransaction, \"Should be at global scope.\");\n        ok(window.Promise !== Dexie.Promise, \"window.Promise should be original\");\n        ok(window.Promise === GlobalPromise, \"window.Promise should be original indeed\");\n        await db.items.get(1);\n        ok(!Dexie.currentTransaction, \"Should be at global scope.\");\n        await 3;\n        ok(!Dexie.currentTransaction, \"Should be at global scope.\");\n        await db.items.put({id:1, aj: \"aj\"});\n        ok(true, \"Could put an item\");\n        await db.items.update(1, {aj: \"oj\"});\n        ok(true, \"Could query an item\");\n        ok(!Dexie.currentTransaction, \"Should be at global scope.\");\n        await 4;\n        ok(!Dexie.currentTransaction, \"Should be at global scope.\");\n    }\n\n    return doSomething();\n    "))(QUnit.ok, QUnit.equal, Dexie__default, db$5, GlobalPromise)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });

var db$6 = new Dexie__default("TestDBException");
db$6.version(1).stores({ users: "id,first,last,&username,&*email,*pets" });
db$6.on("populate", function (trans) {
    db$6.users.add({ id: 1, first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
    db$6.users.add({ id: 2, first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
});
QUnit.module("exception-handling", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db$6).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
    }
});
QUnit.asyncTest("Uncaught promise should signal 'unhandledrejection'", function () {
    // We must not use finally or catch here because then we don't test what we should.
    if (!supports("domevents")) {
        QUnit.ok(true, "Skipping - DOM events not supported");
        QUnit.start();
    }
    var onErrorSignals = 0;
    function onerror(ev) {
        ++onErrorSignals;
        ev.preventDefault();
    }
    var prevUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = onerror;
    db$6.users.add({ id: 1 });
    setTimeout(function () {
        QUnit.equal(onErrorSignals, 1, "unhandledrejection should have been signaled");
        window.onunhandledrejection = prevUnhandledRejection;
        QUnit.start();
    }, 100);
});
spawnedTest("transaction should abort on collection error", function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, db$6.transaction("rw", db$6.users, function () {
                    var id;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$6.users.add({ id: 3, first: "Foo", last: "Bar", username: "foobar" })];
                            case 1:
                                id = _a.sent();
                                QUnit.equal(id, 3);
                                return [4 /*yield*/, db$6.users.where('id').equals(null).toArray()];
                            case 2:
                                _a.sent();
                                QUnit.ok(false, "Should not come here");
                                return [2 /*return*/];
                        }
                    });
                }).catch(function (e) {
                    QUnit.ok(true, "Got error because WhereClause.equals(null) should throw DataError: " + e);
                })];
            case 1:
                _c.sent();
                _a = QUnit.equal;
                return [4 /*yield*/, db$6.users.where('first').equals("Foo").count()];
            case 2:
                _a.apply(void 0, [_c.sent(), 0, "Should not have succeeded to add when transaction was aborted"]);
                return [4 /*yield*/, db$6.transaction("rw", db$6.users, function () {
                        db$6.users.add({ id: 3, first: "Foo", last: "Bar", username: "foobar" });
                        db$6.users.where('id').equals(null).toArray(function (res) {
                            QUnit.ok(false, "Not possible to query null");
                        });
                    }).then(function () {
                        QUnit.ok(false, "Transaction shouldnt commit");
                    }).catch(function (e) {
                        QUnit.ok(true, "Got error because WhereClause.equals(null) should throw TypeError");
                    })];
            case 3:
                _c.sent();
                _b = QUnit.equal;
                return [4 /*yield*/, db$6.users.where('first').equals("Foo").count()];
            case 4:
                _b.apply(void 0, [_c.sent(), 0, "Should not have succeeded to add when transaction was aborted"]);
                return [2 /*return*/];
        }
    });
});
QUnit.asyncTest("eventError-transaction-catch", function () {
    db$6.transaction("rw", db$6.users, function () {
        db$6.users.add({ id: 100, username: "dfahlander" }).then(function () {
            QUnit.ok(false, "Should not be able to add two users with same username");
        });
    }).then(function () {
        QUnit.ok(false, "Transaction should not complete since an error should have occurred");
    }).catch(function (e) {
        QUnit.ok(true, "Got transaction error: " + e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("eventError-request-catch", function () {
    db$6.transaction("rw", db$6.users, function () {
        db$6.users.add({ id: 100, username: "dfahlander" }).then(function () {
            QUnit.ok(false, "Should not be able to add two users with same username");
        }).catch(function (e) {
            QUnit.ok(true, "Got request error: " + e);
        });
        db$6.users.add({ id: 101, first: "Trazan", last: "Apansson", username: "tapan", email: ["trazan@apansson.barnarne"], pets: ["monkey"] }).then(function (id) {
            QUnit.ok(id > 2, "Could continue transaction and add Trazan since last error event was catched");
        });
    }).then(function () {
        QUnit.ok(true, "Transaction should complete since the only error that occurred was catched");
    }).catch(function (e) {
        QUnit.ok(false, "Should not get transaction error since we have catched the error. Got Transaction error: " + e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("exceptionThrown-transaction-catch", function () {
    db$6.transaction("r", db$6.users, function () {
        throw new SyntaxError("Why not throw an exception for a change?");
    }).then(function () {
        QUnit.ok(false, "Transaction should not complete since an error should have occurred");
    }).catch(TypeError, function (e) {
        QUnit.ok(false, "Should not happen. The thrown error was not a TypeError");
    }).catch(SyntaxError, function (e) {
        QUnit.ok(true, "Transaction got SyntaxError: " + e);
    }).catch(function (e) {
        QUnit.ok(false, "Should not come here! The error should already have been catched above()");
    }).finally(QUnit.start);
});
QUnit.asyncTest("exceptionThrown-request-catch", function () {
    db$6.transaction("r", db$6.users, function () {
        db$6.users.where("username").equals("apa").toArray(function () {
            db$6.users.where("username").equals("kceder").toArray().then(function () {
                return "a";
            }).then(function () {
                NonExistingSymbol.EnotherIdioticError = "Why not make an exception for a change?";
            });
        });
    }).then(function () {
        QUnit.ok(false, "Transaction should not complete since an error should have occurred");
    }).catch(function (e) {
        QUnit.ok(true, "Transaction got error: " + e);
    }).finally(QUnit.start);
});
QUnit.asyncTest("exceptionThrown-iteration-should-abort-when-using-hook", function () {
    function deletingHook() {
        // Testing with 
    }
    
    db$6.users.hook('deleting', deletingHook);
    db$6.transaction('rw', db$6.users, function () {
        function deleteKarls() {
            db$6.users.toCollection().modify(function (user) {
                delete this.value;
                throw "Throwing something";
            });
        }
        db$6.users.delete(1);
        deleteKarls();
    }).then(function () {
        QUnit.ok(false, "Transaction should not complete!");
    }).catch(function (err) {
        QUnit.ok(true, "Transaction aborted");
    }).finally(function () {
        db$6.users.hook('deleting').unsubscribe(deletingHook);
        QUnit.start();
    });
});
QUnit.asyncTest("exceptionThrown-iteration-should-not-abort-when-using-hook", function () {
    db$6.users.hook('deleting', function () {
        // Testing with 
    });
    db$6.transaction('rw', db$6.users, function () {
        function deleteKarls() {
            db$6.users.toCollection().modify(function (user) {
                delete this.value;
                throw "Throwing something";
            }).catch(function (err) {
                // Catching error should prevent transaction from aborting.
            });
        }
        db$6.users.delete(1);
        deleteKarls();
    }).then(function () {
        QUnit.ok(true, "Transaction completed");
    }).catch(function (err) {
        QUnit.ok(false, "Transaction should not abort!");
    }).finally(QUnit.start);
});
/*asyncTest("promise-test", function () {
    var p = new Dexie.Promise(function (resolve, reject) {
        setTimeout(function () {
            reject("apa error");
        }, 0);
    });
    p.catch(function (err) {
        return Dexie.Promise.reject(err);
    });
    p.then(function(){}).catch(function (err) {
        return Dexie.Promise.reject(err);
    });
    p.onuncatched = function () {
        debugger;
    }
    p.finally(start);
});*/
QUnit.asyncTest("exception in upgrader", function () {
    // Create a database:
    var db = new Dexie__default("TestUpgrader");
    db.version(1).stores({ cars: "++id,name,brand" });
    db.open().then(function () {
        // Once it opens, close it and create an upgraded version that will fail to upgrade.
        db.close();
        db = new Dexie__default("TestUpgrader");
        db.version(1).stores({ cars: "++id,name,brand" });
        db.version(2).upgrade(function () { db.cars.add({ name: "My car", brand: "Pegeut" }); });
        db.version(3).upgrade(function () {
            throw new Error("Oops. Failing in upgrade function");
        });
        return db.open();
    }).catch(function (err) {
        // Got error
        QUnit.ok(err.toString().indexOf("Oops. Failing in upgrade function") != -1, "Got error: " + err);
        // Create 3rd instance of db that will only read from the existing DB.
        // What we want to check here is that the DB is there but is still
        // only on version 1.
        db = new Dexie__default("TestUpgrader");
        return db.open();
    }).then(function () {
        QUnit.equal(db.verno, 1, "Database is still on version 1 since it failed to upgrade to version 2.");
    }).finally(function () {
        db.delete().then(QUnit.start);
    });
});
QUnit.asyncTest("exception in on('populate')", function () {
    // Create a database:
    var db = new Dexie__default("TestUpgrader");
    db.version(1).stores({ cars: "++id,name,brand" });
    db.on('populate', function () {
        throw new Error("Oops. Failing in upgrade function");
    });
    db.open().catch(function (err) {
        // Got error
        QUnit.ok(err.toString().indexOf("Oops. Failing in upgrade function") != -1, "Got error: " + err.stack);
        // Create 3rd instance of db that will only read from the existing DB.
        // What we want to check here is that the DB is there but is still
        // only on version 1.
        db = new Dexie__default("TestUpgrader");
        return db.open();
    }).then(function () {
        QUnit.ok(false, "The database should not have been created");
    }).catch(function (err) {
        QUnit.ok(err instanceof Dexie__default.NoSuchDatabaseError, "The database doesnt exist");
    }).finally(function () {
        db.delete().then(QUnit.start);
    });
});
QUnit.asyncTest("Error in on('populate') should abort database creation", function () {
    var popufail = new Dexie__default("PopufailDB");
    popufail.version(1).stores({ users: "++id,first,last,&username,&*email,*pets" });
    popufail.on('populate', function () {
        popufail.users.add({ first: NaN, last: undefined, username: function () { } }).catch(function (e) {
            QUnit.ok(true, "Got error when catching add() operation: " + e);
            return Dexie__default.Promise.reject(e);
        });
    });
    popufail.open().catch(function (err) {
        QUnit.ok(true, "Got error (as expected):" + err);
    });
    popufail.users.count(function (count) {
        QUnit.ok(false, "Could query database even though an error happened in the populate event!");
    }).catch(function (err) {
        QUnit.ok(true, "Got error when trying to query: " + err);
    }).finally(function () {
        popufail.delete();
        QUnit.start();
    });
});
QUnit.asyncTest("Issue#73 Catching default error where specific error has already been declared in a previous catch clause(A)", function () {
    function CustomError() { }
    var wasCatched = false;
    new Dexie__default.Promise(function (resolve, reject) {
        setTimeout(function () {
            reject(new Error("apa"));
        }, 0);
    }).then(function () {
        QUnit.ok(false, "Should not come here");
    }).catch(CustomError, function (e) {
        QUnit.ok(false, "Should not come here");
    }).catch(function (e) {
        wasCatched = true;
    }).finally(function () {
        QUnit.ok(wasCatched, "The error was catched in the generic catcher");
        QUnit.start();
    });
});
QUnit.asyncTest("Issue#73 Catching default error where specific error has already been declared in a previous catch clause(B)", function () {
    function CustomError() { }
    var wasCatched = false;
    Dexie__default.Promise.resolve(null).then(function () {
        throw new Error("apa");
    }).then(function () {
        QUnit.ok(false, "Should not come here");
    }).catch(CustomError, function (e) {
        QUnit.ok(false, "Should not come here");
    }).catch(function (e) {
        wasCatched = true;
    }).finally(function () {
        QUnit.ok(wasCatched, "The error was catched in the generic catcher");
        QUnit.start();
    });
});
QUnit.asyncTest("Issue #67 - Exception can be thrown in WhereClause methods", function () {
    try {
        Dexie__default.Promise.all([
            // WhereClause.equals()
            db$6.users.where('first').equals(false) // Using a non-valid key (boolean) must fail but as a Promise rejection, not an exception.
                .toArray()
                .catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.equals() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.above()
            db$6.users.where('first').above(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
                .toArray()
                .catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.above() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.aboveOrEqual()
            db$6.users.where('first').aboveOrEqual(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
                .toArray()
                .catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.aboveOrEqual() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.below()
            db$6.users.where('first').below(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
                .toArray()
                .catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.below() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.belowOrEqual()
            db$6.users.where('first').belowOrEqual(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
                .toArray()
                .catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.belowOrEqual() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.anyOf()
            db$6.users.where('first').anyOf([undefined, null, false]) // Using a non-valid key (undefined, false) must fail but as a Promise rejection, not an exception.
                .toArray()
                .catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.anyOf() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.between()
            db$6.users.where('first').between(false, true) // Using a non-valid key (boolean) must fail but as a Promise rejection, not an exception.
                .toArray()
                .catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.between() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.equalsIgnoreCase()
            db$6.users.where('first').equalsIgnoreCase(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
                .toArray()
                .catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.equalsIgnoreCase() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.startsWith()
            db$6.users.where('first').startsWith(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
                .toArray()
                .catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.startsWith() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.startsWithIgnoreCase()
            db$6.users.where('first').startsWithIgnoreCase(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
                .toArray()
                .catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.startsWithIgnoreCase() returned as a failed Promise and not an exception.");
            })
        ]).catch(function () {
            QUnit.ok(false, "No promise should finally reject because we catch them all explicitely.");
        }).finally(QUnit.start);
    }
    catch (ex) {
        QUnit.ok(false, "Error was not encapsulated as a Promise failure: " + (ex.stack || ex));
        QUnit.start();
    }
});
QUnit.asyncTest("Issue #67 - Regression test - Transaction still fails if error in key", function () {
    db$6.transaction('rw', db$6.users, function () {
        db$6.users.where('first').above("").delete().then(function (num) {
            QUnit.ok(true, num + " users deleted");
            db$6.users.where('first').above(undefined).delete();
        });
    }).then(function () {
        QUnit.ok(false, "Transaction should not commit when we an unhandled error has happened");
    }).catch(function (err) {
        QUnit.ok(true, "Good, transaction failed as expected");
    }).finally(QUnit.start);
});
QUnit.asyncTest("Issue #67 - Regression test 2 - other error in key", function () {
    db$6.transaction('rw', db$6.users, function () {
        db$6.users.where('first').above("").delete().then(function (num) {
            QUnit.ok(true, num + " users deleted");
            db$6.users.where('first').above(false).delete();
        });
    }).then(function () {
        QUnit.ok(false, "Transaction should not commit when we an unhandled error has happened");
    }).catch(function (err) {
        QUnit.ok(true, "Good, transaction failed as expected");
    }).finally(QUnit.start);
});
QUnit.asyncTest("Issue #69 Global exception handler for promises", function () {
    if (!supports("domevents")) {
        QUnit.ok(true, "Skipping - DOM events not supported");
        QUnit.start();
    }
    var errorList = [];
    function globalRejectionHandler(ev) {
        console.log("Got error: " + ev.reason);
        if (errorList.indexOf(ev.reason) === -1) // Current implementation: accept multiple redundant triggers
            errorList.push(ev.reason);
        ev.preventDefault();
    }
    window.addEventListener('unhandledrejection', globalRejectionHandler);
    // The most simple case: Any Promise reject that is not catched should
    // be handled by the global error listener.
    new Dexie__default.Promise(function (resolve, reject) {
        reject("first error (by reject)");
    });
    // Also if the rejection was caused by a throw...
    new Dexie__default.Promise(function () {
        throw "second error (throw)";
    });
    // But when catched it should not trigger the global event:
    new Dexie__default.Promise(function (resolve, reject) {
        reject("third error (catched)");
    }).catch(function (e) {
        QUnit.ok(true, "Catched error explicitely: " + e);
    });
    // If catching an explicit error type that was not thrown, it should be triggered
    new Dexie__default.Promise(function (resolve, reject) {
        reject("Simple error 1");
    }).catch(TypeError, function (e) {
        QUnit.ok(false, "Error should not have been TypeError");
    }); // Real error slip away... should be handled by global handler
    new Dexie__default.Promise(function (resolve, reject) {
        reject(new TypeError("Type Error 1"));
    }).catch(TypeError, function (e) {
        QUnit.ok(true, "Catched the TypeError");
        // Now we have handled it. Not bubble to global handler!
    });
    Dexie__default.Promise.resolve(Promise.reject(new Error("Converting a rejected standard promise to Dexie.Promise but don't catch it")))
        .finally(function () {
        // With finally, it should yet trigger the global event:
        return new Dexie__default.Promise(function (resolve, reject) {
            reject("forth error (uncatched but with finally)");
        });
    }).finally(function () {
        // From issue #43:
        // Prepare by cleaning up any unfinished previous run:
        Dexie__default.delete("testdb").then(function () {
            // Now just do some Dexie stuff...
            var db = new Dexie__default("testdb");
            db.version(1).stores({ table1: "id" });
            db.open().then(function () {
                console.log("before");
                throw new Error("FOO"); // Here a generic error is thrown (not a DB error)
                //console.log("after");
            });
            db.delete().finally(function () {
                QUnit.equal(errorList.length, 6, "THere should be 6 global errors triggered");
                QUnit.equal(errorList[0], "first error (by reject)", "first error (by reject)");
                QUnit.equal(errorList[1], "second error (throw)", "second error (throw)");
                QUnit.equal(errorList[2], "Simple error 1", "Simple error 1");
                QUnit.equal(errorList[3].message, "Converting a rejected standard promise to Dexie.Promise but don't catch it", "Converting a rejected standard promise to Dexie.Promise but don't catch it");
                QUnit.equal(errorList[4], "forth error (uncatched but with finally)", "forth error (uncatched but with finally)");
                QUnit.equal(errorList[5].message, "FOO", "FOO");
                errorList.slice(6).map(function (e, i) { return "Unexpected error: " + ((i + 6) + ": " + e.stack); }).forEach(function (txt) {
                    console.error(txt);
                    QUnit.ok(false, txt);
                });
                // cleanup:
                window.removeEventListener('unhandledrejection', globalRejectionHandler);
                QUnit.start();
            });
        });
    });
});

QUnit.module("upgrading");
var Promise$1 = Dexie__default.Promise;
// tests:
// * separate tests with a commented line of --- up to column 80.
// * put test result checking as a then of the relevant db.open call.
// * db.close at the top of a new section.
// another top-level then should indicate another part of the sequence
// of upgrade actions.
// put db.delete() in its own clause.
QUnit.test("upgrade", function (assert) {
    var done = assert.async();
    // To test:
    // V Start with empty schema
    // V Add indexes
    // V Remove indexes
    // V Specify the changed object stores only
    // V Run an upgrader function
    // V Run a series of upgrader functions (done when creating DB from scratch with ALL version specs and at least two of them have upgrader functions)
    // V Add object store
    // V Remove object store
    // V Reverse order of specifying versions
    // V Delete DB and open it with ALL version specs specified (check it will run in sequence)
    // V Delete DB and open it with all version specs again but in reverse order
    var DBNAME = "Upgrade-test";
    var db = null;
    // Instead of expecting an empty database to have 0 tables, we read
    // how many an empty database has.
    // Reason: Addons may add meta tables.
    var baseNumberOfTables = 0;
    var baseTables = [];
    // Ensure Dexie verno and backing IDB version are as expected.
    function checkVersion(version) {
        QUnit.equal(db.verno, version, "DB should be version " + version);
        QUnit.equal(db.backendDB().version, version * 10, "idb should be version " + version * 10);
    }
    // Ensure object store names are as expected.
    function checkObjectStores(expected) {
        // Add baseTables.
        expected = expected.concat(baseTables).sort();
        // Already sorted.
        var idbNames = [].slice.call(db.backendDB().objectStoreNames);
        var dexieNames = db.tables.map(function (t) { return t.name; }).sort();
        QUnit.deepEqual(dexieNames, expected, "Dexie.tables must match expected.");
        if (supports("deleteObjectStoreAfterRead")) {
            // Special treatment for IE/Edge where Dexie avoids deleting the actual store to avoid a bug.
            // This special treatment in the unit tests may not need to be here if we can work around Dexie issue #1.
            QUnit.deepEqual(idbNames, expected, "IDB object stores must match expected.");
        }
    }
    Promise$1.resolve(function () {
        return Dexie__default.delete(DBNAME);
    }).then(function () {
        // --------------------------------------------------------------------
        // Test: Empty schema
        db = new Dexie__default(DBNAME);
        db.version(1).stores({});
        return db.open().then(function () {
            QUnit.ok(true, "Could create empty database without any schema");
            // Set so add-on tables don't invalidate checks.
            baseNumberOfTables = db.tables.length;
            baseTables = db.tables.map(function (t) { return t.name; });
        });
    }).then(function () {
        // --------------------------------------------------------------------
        // Test: Adding version.
        db = new Dexie__default(DBNAME);
        db.version(1).stores({});
        db.version(2).stores({ store1: "++id" });
        return db.open().then(function () {
            QUnit.ok(true, "Could upgrade to version 2");
            checkVersion(2);
            //equal(db.verno, 2, "DB should be version 2");
            QUnit.equal(db.table("store1").schema.primKey.name, "id", "Primary key is 'id'");
        });
    }).then(function () {
        db.close();
        // --------------------------------------------------------------------
        // Test: Adding an index to a store
        db = new Dexie__default(DBNAME);
        db.version(1).stores({});
        db.version(2).stores({ store1: "++id" });
        // Adding the name index
        db.version(3).stores({ store1: "++id,name" });
        return db.open().then(function () {
            QUnit.ok(true, "Could upgrade to version 3 (adding an index to a store)");
            checkVersion(3);
        });
    }).then(function () {
        // Testing that the added index is working indeed:
        return db.transaction('rw', "store1", function () {
            db.store1.add({ name: "apa" });
            db.store1.where("name").equals("apa").count(function (count) {
                QUnit.equal(count, 1, "Apa was found by its new index (The newly added index really works!)");
            });
        });
    }).then(function () {
        db.close();
        // --------------------------------------------------------------------
        // Testing:
        //  1. Place latest version first (order should not matter)
        //  2. Removing the 'name' index.
        db = new Dexie__default(DBNAME);
        db.version(4).stores({ store1: "++id" });
        db.version(3).stores({ store1: "++id,name" });
        db.version(2).stores({ store1: "++id" });
        db.version(1).stores({});
        return db.open().then(function () {
            QUnit.ok(true, "Could upgrade to version 4 (removing an index)");
            checkVersion(4);
            QUnit.equal(db.tables[0].schema.indexes.length, 0, "No indexes in schema now when 'name' index was removed");
        });
    }).then(function () {
        db.close();
        // --------------------------------------------------------------------
        // Test: Running an upgrader function.
        db = new Dexie__default(DBNAME);
        var upgraders = 0;
        // (Need not to specify earlier versions than 4 because 'I have no users out there running on version below 4'.)
        db.version(4).stores({ store1: "++id" });
        db.version(5).stores({ store1: "++id,&email" }).upgrade(function (trans) {
            upgraders++;
            var counter = 0;
            db.store1.toCollection().modify(function (obj) {
                // Since we have a new primary key we must make sure it's unique on all objects
                obj.email = "user" + (++counter) + "@abc.com";
            });
        });
        return db.open().then(function () {
            QUnit.ok(true, "Could upgrade to version 5 where an upgrader function was applied");
            checkVersion(5);
            QUnit.equal(upgraders, 1, "1 upgrade function should have run.");
        });
    }).then(function () {
        return db.table("store1").toArray().then(function (array) {
            QUnit.equal(array.length, 1, "We still have the object created in version 3 there");
            QUnit.equal(array[0].email, "user1@abc.com", "The object got its upgrade function running");
            QUnit.equal(array[0].id, 1, "The object still has the same primary key");
            QUnit.equal(array[0].name, "apa", "The object still has the name 'apa' that was given to it when it was created");
        });
    }).then(function () {
        db.close();
        // --------------------------------------------------------------------
        // Test: Changing a property of an index
        db = new Dexie__default(DBNAME);
        db.version(5).stores({ store1: "++id,&email" });
        // Changing email index from unique to multi-valued
        db.version(6).stores({ store1: "++id,*email" }).upgrade(function (t) {
            t.table("store1").toCollection().modify(function (obj) {
                // Turning single-valued unique email into an array of
                // emails.
                obj.email = [obj.email];
            });
        });
        return db.open().then(function () {
            QUnit.ok(true, "Could upgrade to version 6");
            checkVersion(6);
            checkObjectStores(["store1"]);
        });
    }).then(function () {
        return db.table('store1').get(1, function (apaUser) {
            QUnit.ok(Array.isArray(apaUser.email), "email is now an array");
            QUnit.equal(apaUser.email[0], "user1@abc.com", "First email is user1@abc.com");
        });
    }).then(function () {
        // Test that it is now ok to add two different users with the same email, since we have removed the uniqueness requirement of the index
        return db.table('store1').add({ name: "apa2", email: ["user1@abc.com"] });
    }).then(function () {
        return db.table('store1').toArray().then(function (array) {
            QUnit.equal(array.length, 2, "There are now two users in db");
            QUnit.equal(array[0].email[0], array[1].email[0], "The two users share the same email value");
        });
    }).then(function (array) {
        db.close();
        // --------------------------------------------------------------------
        // Test: Only changed object stores need to be specified.
        db = new Dexie__default(DBNAME);
        // No need to specify an upgrade function when we know it's not
        // gonna run (we are already on ver 5)
        db.version(6).stores({ store1: "++id,*email" });
        db.version(7).stores({ store2: "uuid" });
        return db.open().then(function () {
            QUnit.ok(true, "Could upgrade to version 7");
            checkVersion(7);
            checkObjectStores(["store1", "store2"]);
        });
    }).then(function () {
        db.close();
        // --------------------------------------------------------------------
        // Test: Object store removal.
        db = new Dexie__default(DBNAME);
        // Need to keep version 6 or add its missing stores to version 7,
        // 7. Choosing to keep version 6.
        db.version(6).stores({ store1: "++id,*email" });
        db.version(7).stores({ store2: "uuid" });
        // Deleting a version.
        db.version(8).stores({ store1: null });
        return db.open().then(function () {
            QUnit.ok(true, "Could upgrade to version 8 - deleting an object store");
            checkVersion(8);
            checkObjectStores(["store2"]);
        });
    }).then(function () {
        // --------------------------------------------------------------------
        // Test: Use a removed object store while running an upgrade function.
        /*db = new Dexie(DBNAME);
        db.version(7).stores({ store2: "uuid" });
        db.version(8).stores({ store1: null });
        db.version(9).stores({ store1: "++id,email" });
        db.version(10).stores({ store1: null }).upgrade(t => {
            checkTransactionObjectStores(t, ["store1"]);
            // TODO: actually use the object store.
            ok(true, "Upgrade transaction contains deleted store.");
        });
        return db.open().then(() => {
            ok(true, "Could upgrade to version 10 - deleting an object store with upgrade function");
            checkVersion(10);
            checkObjectStores(["store2"]);
        });*/
    }).then(function () {
        // Reset.
        return db.delete();
    }).then(function () {
        // --------------------------------------------------------------------
        // Test:
        // 1. Upgrade transactions should have the correct object
        //    stores available. (future version)
        db = new Dexie__default(DBNAME);
        db.version(1).stores({
            store1: "++id,name"
        });
        return db.open().then(function () {
            // Populate db.
            return db.store1.put({ name: "A B" });
        });
    }).then(function () {
        db.close();
        // Add upgrade functions.
        // Track number of upgrade functions run.
        var upgraders = 0;
        db.version(2).stores({
            store2: "++id,firstname,lastname"
        }).upgrade(function (t) {
            /*checkTransactionObjectStores(t,
                ["store1", "store2"]);*/
            QUnit.ok(true, "Upgrade transaction has stores deleted later.");
            upgraders++;
            // TODO: copy value to store2.
        });
        db.version(3).stores({
            store1: null,
            store3: "++id"
        }).upgrade(function (t) {
            /*checkTransactionObjectStores(t,
                ["store1", "store2", "store3"]);*/
            upgraders++;
            // TODO: Add some value to store3.
        });
        return db.open().then(function () {
            checkVersion(3);
            QUnit.equal(upgraders, 2, "2 upgrade functions should have run.");
            checkObjectStores(["store2", "store3"]);
            // TODO: Check that the data is as-expected.
        });
    }).then(function () {
        return db.delete();
    }).then(function () {
        // --------------------------------------------------------------------
        // Test: Dexie identifies the correct table name and schema given a
        // sequence of versions to go through.
        db = new Dexie__default(DBNAME);
        db.version(1).stores({});
        db.version(2).stores({ store1: "++id" });
        // Adding the name index
        db.version(3).stores({ store1: "++id,name" });
        db.version(4).stores({ store1: "++id" });
        db.version(5).stores({ store1: "++id,&email" }).upgrade(function (t) {
            var counter = 0;
            t.table("store1").toCollection().modify(function (obj) {
                // Since we have a new primary key we must make sure
                // it's unique on all objects
                obj.email = "user" + (++counter) + "@abc.com";
            });
        });
        // Changing email index from unique to multi-valued
        db.version(6).stores({ store1: "++id,*email" }).upgrade(function (t) {
            t.table("store1").toCollection().modify(function (obj) {
                // Turning single-valued unique email into an array of
                // emails.
                obj.email = [obj.email];
            });
        });
        db.version(7).stores({ store2: "uuid" });
        db.version(8).stores({ store1: null });
        return db.open().then(function () {
            QUnit.ok(true, "Could create new database");
            checkVersion(8);
            checkObjectStores(["store2"]);
            QUnit.equal(db.table("store2").schema.primKey.name, "uuid", "The prim key is uuid");
        });
    }).then(function () {
        return db.delete();
    }).then(function () {
        // --------------------------------------------------------------------
        // Test: Order of version declaration should not matter.
        db = new Dexie__default(DBNAME);
        db.version(8).stores({ store1: null });
        db.version(7).stores({ store2: "uuid" });
        db.version(6).stores({ store1: "++id,*email" }).upgrade(function () {
            db.store1.toCollection().modify(function (obj) {
                obj.email = [obj.email]; // Turning single-valued unique email into an array of emails.
            });
        });
        db.version(5).stores({ store1: "++id,&email" }).upgrade(function () {
            var counter = 0;
            db.store1.toCollection().modify(function (obj) {
                // Since we have a new primary key we must make sure it's unique on all objects
                obj.email = "user" + (++counter) + "@abc.com";
            });
        });
        db.version(4).stores({ store1: "++id" });
        db.version(3).stores({ store1: "++id,name" }); // Adding the name index
        db.version(2).stores({ store1: "++id" });
        db.version(1).stores({});
        return db.open().then(function () {
            QUnit.ok(true, "Could create new database");
            checkVersion(8);
            checkObjectStores(["store2"]);
            QUnit.equal(db.table("store2").schema.primKey.name, "uuid", "The prim key is uuid");
        });
    }).catch(function (err) {
        QUnit.ok(false, "Error: " + err);
    }).finally(function () {
        if (db)
            db.close();
        Dexie__default.delete(DBNAME).then(done);
    });
});
QUnit.test("Issue #30 - Problem with existing db", function (assert) {
    var done = assert.async();
    if (!supports("compound+multiEntry")) {
        QUnit.ok(true, "SKIPPED - COMPOUND + MULTIENTRY UNSUPPORTED");
        return done();
    }
    ///<var type="Dexie" />
    var db; // Will be used as a migrated version of the db.
    // Start by deleting the db if it exists:
    Dexie__default.delete("raw-db").then(function () {
        // Create a bare-bone indexedDB database with custom indexes of various kinds.
        return new Dexie__default.Promise(function (resolve, reject) {
            var indexedDB = Dexie__default.dependencies.indexedDB;
            var rawdb, req;
            function error(e) {
                if (rawdb)
                    rawdb.close();
                reject(e.target.error);
            }
            req = indexedDB.open("raw-db", 2);
            req.onupgradeneeded = function (ev) {
                try {
                    console.log("onupgradeneeded called");
                    rawdb = req.result;
                    // Stores
                    var people = rawdb.createObjectStore("people", { keyPath: "_id", autoIncrement: false });
                    var messages = rawdb.createObjectStore("messages", { autoIncrement: true });
                    var umbrellas = rawdb.createObjectStore("umbrellas", { keyPath: ["date", "time"] });
                    // Indexes:
                    messages.createIndex("text_index", "text", { unique: false, multiEntry: false });
                    messages.createIndex("words_index", "words", { unique: false, multiEntry: true });
                    messages.createIndex("id_index", "id", { unique: true, multiEntry: false });
                    umbrellas.createIndex("size_color_index", ["size", "color"], {
                        unique: false,
                        multiEntry: false
                    });
                    // Data:
                    people.add({ _id: "9AF56447-66CE-470A-A70F-674A32EF2D51", name: "Kalle" });
                    messages.add({ text: "Here is a text", words: ["here", "is", "a", "text"], id: 1 });
                    umbrellas.add({
                        date: "2014-11-20",
                        time: "22:18",
                        size: 98,
                        color: "pink",
                        name: "My Fine Umbrella!"
                    });
                }
                catch (ex) {
                    if (rawdb)
                        rawdb.close();
                    reject(ex);
                }
            };
            req.onsuccess = function () {
                console.log("onsuccess called");
                rawdb = req.result;
                rawdb.close();
                resolve();
            };
            req.onerror = error;
        });
    }).then(function () {
        // Try open the database using Dexie:
        db = new Dexie__default("raw-db", { addons: [] }); // Explicitely don't use addons here. Syncable would fail to open an existing db.
        db.version(0.2).stores({
            people: "_id",
            messages: "++,text,*words,&id",
            umbrellas: "[date+time],[size+color]"
        });
        return db.open();
    }).then(function () {
        // Verify "people" data
        return db.people.toArray(function (people) {
            QUnit.equal(people.length, 1, "One person in people");
            QUnit.equal(people[0].name, "Kalle", "The persons' name is Kalle");
        });
    }).then(function () {
        // Verify "messages" data
        return db.messages.toArray(function (messages) {
            QUnit.equal(messages.length, 1, "One message in messages");
            QUnit.equal(messages[0].text, "Here is a text", "The message has the correct text");
            QUnit.equal(messages[0].words.length, 4, "The message has 4 words");
        });
    }).then(function () {
        // Verify "umbrellas" data
        return db.umbrellas.toArray(function (umbrellas) {
            QUnit.equal(umbrellas.length, 1, "One umbrella in umbrellas");
            QUnit.equal(umbrellas[0].name, "My Fine Umbrella!", "The umbrella has the correct name");
            QUnit.equal(umbrellas[0].date, "2014-11-20", "The umbrella has the correct date");
            QUnit.equal(umbrellas[0].time, "22:18", "The umbrella has the correct time");
            QUnit.equal(umbrellas[0].size, 98, "The umbrella has the currect size");
            QUnit.equal(umbrellas[0].color, "pink", "The umbrella has the correct color");
        });
    }).then(function () {
        // Test messages indexes
        return db.messages.orderBy("text").first(function (message) {
            QUnit.ok(!!message, "Could find a message when iterating the 'text' index");
        });
    }).then(function () {
        // Test words index
        return db.messages.where("words").equals("is").first(function (message) {
            QUnit.ok(!!message, "Could find a message when querying the 'words' index");
        });
    }).then(function () {
        // Test id index
        return db.messages.where("id").equals(1).count(function (count) {
            QUnit.equal(count, 1, "Could count id's");
        });
    }).then(function () {
        // Test umbrella compound primary key
        return db.umbrellas.get(["2014-11-20", "22:18"], function (umbrella) {
            QUnit.ok(!!umbrella, "Umbrella was found by compound primary key");
            QUnit.equal(umbrella.color, "pink", "Umbrella has the correct color");
        });
    }).then(function () {
        // Test umbrella compound index
        return db.umbrellas.where("[size+color]").above([98, "pina"]).count(function (count) {
            QUnit.equal(count, 1, "Could count umbrellas based on a query on compound index");
        });
    }).then(function () {
        // Now, let's upgrade the migrated database
        db.close();
        db = new Dexie__default("raw-db");
        // First, as required with Dexie so far, specify the existing stores:
        db.version(0.2).stores({
            people: "_id",
            messages: "++,text,words,id,[size+color]",
            umbrellas: "[date+time],[size+color]"
        });
        // Then, add the 'name' index to people:
        db.version(3).stores({
            people: "_id,name"
        });
        return db.open();
    }).then(function () {
        // Now test the new name index:
        return db.people.where("name").equalsIgnoreCase("kalle").first();
    }).then(function (kalle) {
        QUnit.ok(!!kalle, "Could find at least one object by its name index");
        QUnit.equal(kalle.name, "Kalle", "The found object was Kalle indeed");
    }).catch(function (err) {
        QUnit.ok(false, "Error: " + err);
    }).finally(function () {
        if (db)
            db.close();
        Dexie__default.delete("raw-db").then(done);
    });
});
promisedTest("Issue #713 - how to change table name", function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, db2, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Dexie__default.delete("issue713")];
            case 1:
                _a.sent();
                db = new Dexie__default('issue713');
                _a.label = 2;
            case 2:
                _a.trys.push([2, , 5, 7]);
                db.version(1).stores({
                    friends: '++id, name, age'
                });
                return [4 /*yield*/, db.friends.bulkAdd([
                        { name: "Foo", age: 25 },
                        { name: "Bar", age: 75 }
                    ])];
            case 3:
                _a.sent();
                db.close();
                db2 = new Dexie__default('issue713');
                db2.version(1).stores({
                    friends: '++id, name, age'
                });
                db2.version(2).stores({
                    friends2: 'id, name, age'
                }).upgrade(function (tx) {
                    return tx.friends.toArray().then(function (objs) {
                        return tx.friends2.bulkAdd(objs);
                    });
                });
                db2.version(3).stores({
                    friends: null
                });
                return [4 /*yield*/, db2.friends2.toArray()];
            case 4:
                result = _a.sent();
                QUnit.equal(result.length, 2, "Should get 2 friends");
                QUnit.equal(result[0].name, "Foo", "First friend is 'Foo'");
                QUnit.equal(result[1].name, "Bar", "First friend is 'Bar'");
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, db.delete()];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
promisedTest("Issue #713 - how to change table name (short)", function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, db2, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Dexie__default.delete("issue713Short")];
            case 1:
                _a.sent();
                db = new Dexie__default('issue713Short');
                _a.label = 2;
            case 2:
                _a.trys.push([2, , 5, 7]);
                db.version(1).stores({
                    friends: '++id, name, age'
                });
                return [4 /*yield*/, db.friends.bulkAdd([
                        { name: "Foo", age: 25 },
                        { name: "Bar", age: 75 }
                    ])];
            case 3:
                _a.sent();
                db.close();
                db2 = new Dexie__default('issue713Short');
                db2.version(1).stores({
                    friends: '++id, name, age'
                });
                db2.version(2).stores({
                    friends2: 'id, name, age',
                    friends: null // delete after upgrader
                }).upgrade(function (tx) {
                    return tx.friends.toArray().then(function (objs) {
                        return tx.friends2.bulkAdd(objs);
                    });
                });
                return [4 /*yield*/, db2.friends2.toArray()];
            case 4:
                result = _a.sent();
                QUnit.equal(result.length, 2, "Should get 2 friends");
                QUnit.equal(result[0].name, "Foo", "First friend is 'Foo'");
                QUnit.equal(result[1].name, "Bar", "First friend is 'Bar'");
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, db.delete()];
            case 6:
                _a.sent();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
promisedTest("Changing primary key", function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, foos, foo2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (isIE || isEdge) {
                    QUnit.ok(true, "Skipping this test for IE and Edge - it has a bug that prevents it from renaming a table");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, Dexie__default.delete("changePrimKey")];
            case 1:
                _a.sent();
                db = new Dexie__default("changePrimKey");
                db.version(1).stores({
                    foos: '++id'
                });
                return [4 /*yield*/, db.foos.bulkAdd([{ name: "Hola" }, { name: "Hello" }])];
            case 2:
                _a.sent();
                db.close();
                // To change primary key, let's start by copying the table
                // and then deleting and recreating the original table
                // to copy it back again
                db = new Dexie__default("changePrimKey");
                db.version(1).stores({
                    foos: '++id'
                });
                // Add version 2 that copies the data to foos2
                db.version(2).stores({
                    foos2: 'objId'
                }).upgrade(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                    var foos;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, tx.foos.toArray()];
                            case 1:
                                foos = _a.sent();
                                return [4 /*yield*/, tx.foos2.bulkAdd(foos.map(function (foo) { return ({
                                        objId: "obj:" + foo.id,
                                        hello: foo.name
                                    }); }))];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                // Add version 3 that deletes old "foos"
                db.version(3).stores({
                    foos: null
                });
                // Add version 4 that recreates "foos" with wanted primary key
                // and do the copying again
                db.version(4).stores({
                    foos: 'objId, hello'
                }).upgrade(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                    var foos;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, tx.foos2.toArray()];
                            case 1:
                                foos = _a.sent();
                                return [4 /*yield*/, tx.foos.bulkAdd(foos)];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                // Finally delete the temp table
                db.version(5).stores({
                    foos2: null
                });
                return [4 /*yield*/, db.foos.toArray()];
            case 3:
                foos = _a.sent();
                QUnit.equal(foos.length, 2, "Should have 2 rows");
                QUnit.equal(foos[0].objId, "obj:1", "A primary key with an object ID 1 is there");
                QUnit.equal(foos[1].objId, "obj:2", "A primary key with an object ID 2 is there");
                return [4 /*yield*/, db.foos.get({ hello: "Hello" })];
            case 4:
                foo2 = _a.sent();
                QUnit.ok(foo2 != null, "Should get a match");
                QUnit.equal(foo2.objId, "obj:2", "The expected ID was returned");
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Changing primary key (short)", function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, foos, foo2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (isIE || isEdge) {
                    QUnit.ok(true, "Skipping this test for IE and Edge - it has a bug that prevents it from renaming a table");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, Dexie__default.delete("changePrimKeyShort")];
            case 1:
                _a.sent();
                db = new Dexie__default("changePrimKeyShort");
                db.version(1).stores({
                    foos: '++id'
                });
                return [4 /*yield*/, db.foos.bulkAdd([{ name: "Hola" }, { name: "Hello" }])];
            case 2:
                _a.sent();
                db.close();
                // To change primary key, let's start by copying the table
                // and then deleting and recreating the original table
                // to copy it back again
                db = new Dexie__default("changePrimKeyShort");
                db.version(1).stores({
                    foos: '++id'
                });
                // Add version 2 that copies the data to foos2
                db.version(2).stores({
                    foos: null,
                    foos2: 'objId'
                }).upgrade(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                    var foos;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, tx.foos.toArray()];
                            case 1:
                                foos = _a.sent();
                                return [4 /*yield*/, tx.foos2.bulkAdd(foos.map(function (foo) { return ({
                                        objId: "obj:" + foo.id,
                                        hello: foo.name
                                    }); }))];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                // Add version 3 that recreates "foos" with wanted primary key
                // and do the copying again
                db.version(3).stores({
                    foos: 'objId, hello',
                    foos2: null // delete after upgrader
                }).upgrade(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                    var foos;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, tx.foos2.toArray()];
                            case 1:
                                foos = _a.sent();
                                return [4 /*yield*/, tx.foos.bulkAdd(foos)];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, db.foos.toArray()];
            case 3:
                foos = _a.sent();
                QUnit.equal(foos.length, 2, "Should have 2 rows");
                QUnit.equal(foos[0].objId, "obj:1", "A primary key with an object ID 1 is there");
                QUnit.equal(foos[1].objId, "obj:2", "A primary key with an object ID 2 is there");
                return [4 /*yield*/, db.foos.get({ hello: "Hello" })];
            case 4:
                foo2 = _a.sent();
                QUnit.ok(foo2 != null, "Should get a match");
                QUnit.equal(foo2.objId, "obj:2", "The expected ID was returned");
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Issue 919: Store not found when versions declared in decending order", function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0: return [4 /*yield*/, Dexie__default.delete("issue919")];
            case 1:
                _g.sent();
                db = new Dexie__default("issue919");
                db.version(1).stores({
                    friends: "++id,name,age"
                });
                return [4 /*yield*/, db.open()];
            case 2:
                _g.sent();
                // succeeds
                _a = QUnit.ok;
                _b = [true];
                _c = "Could open v1: ";
                return [4 /*yield*/, db.friends.toArray()];
            case 3:
                // succeeds
                _a.apply(void 0, _b.concat([_c + (_g.sent())]));
                db.close();
                db = new Dexie__default("issue919");
                // add a new store, `friends` store remains as before
                db.version(2).stores({
                    enemies: "++id,name"
                });
                db.version(1).stores({
                    friends: "++id,name,age"
                });
                return [4 /*yield*/, db.open()];
            case 4:
                _g.sent();
                // fails with: NotFoundError: `The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.`
                _d = QUnit.ok;
                _e = [true];
                _f = "Could open version 2: ";
                return [4 /*yield*/, db.friends.toArray()];
            case 5:
                // fails with: NotFoundError: `The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.`
                _d.apply(void 0, _e.concat([_f + (_g.sent())]));
                return [4 /*yield*/, db.delete()];
            case 6:
                _g.sent();
                return [2 /*return*/];
        }
    });
}); });
promisedTest("PR #959: Dexie should no more require users to keep old versions if they don't attach an upgrader to it", function () { return __awaiter(void 0, void 0, void 0, function () {
    var DBNAME, db, foo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                DBNAME = "pr959";
                return [4 /*yield*/, Dexie__default.delete(DBNAME)];
            case 1:
                _a.sent();
                db = new Dexie__default(DBNAME);
                db.version(1).stores({
                    friends: "id"
                });
                return [4 /*yield*/, db.open()];
            case 2:
                _a.sent();
                QUnit.ok(true, "Could open v1");
                return [4 /*yield*/, db.friends.add({ id: 1, name: "Foo 959" })];
            case 3:
                _a.sent();
                db.close();
                db = new Dexie__default(DBNAME);
                db.version(2).stores({
                    friends: "id, name"
                });
                return [4 /*yield*/, db.open()];
            case 4:
                _a.sent();
                QUnit.ok(true, "Could open v2 without having v1 specified. Name should now be indexed.");
                return [4 /*yield*/, db.friends.where("name").startsWith("Foo").first()];
            case 5:
                foo = _a.sent();
                QUnit.ok(!!foo, "Could find friend using newly added index");
                QUnit.equal(foo.id, 1, "Got the right foo here");
                db.close();
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Issue #959 - Should migrate successfully with an explicit unique modifier of the primary key", function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, result, result2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Dexie__default.delete("issue959")];
            case 1:
                _a.sent();
                db = new Dexie__default("issue959");
                db.version(1).stores({
                    friends: "&name, age"
                });
                return [4 /*yield*/, db.friends.bulkAdd([
                        { name: "Foo", age: 25, weight: 70 },
                        { name: "Bar", age: 75, weight: 100 }
                    ])];
            case 2:
                _a.sent();
                db.close();
                db = new Dexie__default("issue959");
                db.version(1).stores({
                    friends: "&name, age"
                });
                db.version(2).stores({
                    friends: "&name, age, weight"
                });
                return [4 /*yield*/, db.friends.orderBy("age").toArray()];
            case 3:
                result = _a.sent();
                QUnit.equal(result.length, 2, "Should get 2 friends");
                QUnit.equal(result[0].name, "Foo", "First friend is 'Foo'");
                QUnit.equal(result[1].name, "Bar", "First friend is 'Bar'");
                return [4 /*yield*/, db.friends.get({ weight: 100 })];
            case 4:
                result2 = _a.sent();
                QUnit.ok(result2 != null, "Should get a match");
                QUnit.equal(result2.name, "Bar", "The expected friends was returned");
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Issue 1145 - Regression: SchemaError during version upgrade", function () { return __awaiter(void 0, void 0, void 0, function () {
    var DBNAME, db, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                DBNAME = "issue1145";
                return [4 /*yield*/, Dexie__default.delete(DBNAME)];
            case 1:
                _a.sent();
                db = new Dexie__default(DBNAME);
                db.version(1).stores({ Y: "id" });
                return [4 /*yield*/, db.open()];
            case 2:
                _a.sent();
                return [4 /*yield*/, db.close()];
            case 3:
                _a.sent();
                db.version(2).upgrade(function (trans) {
                    QUnit.ok(true, "Starting version 2 upgrade.");
                    return trans.Y.count();
                });
                db.version(3).stores({
                    Y: "id,X",
                });
                db.version(4).upgrade(function (trans) {
                    QUnit.ok(true, "Starting version 4 upgrade.");
                    return trans.Y.where("X").equals("value").toArray();
                });
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, 7, 9]);
                return [4 /*yield*/, db.open()];
            case 5:
                _a.sent();
                QUnit.ok(true, "Open successful");
                return [3 /*break*/, 9];
            case 6:
                e_1 = _a.sent();
                QUnit.ok(false, "Open Failed:: " + e_1);
                return [3 /*break*/, 9];
            case 7: return [4 /*yield*/, db.delete()];
            case 8:
                _a.sent();
                return [7 /*endfinally*/];
            case 9: return [2 /*return*/];
        }
    });
}); });

var async$3 = Dexie__default.async;
var db$7 = new Dexie__default("TestIssuesDB");
db$7.version(1).stores({
    users: "id,first,last,&username,*&email,*pets",
    keyless: ",name",
    foo: "id",
    bars: "++id,text"
    // If required for your test, add more tables here
});
QUnit.module("misc", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db$7).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
    }
});
//
// Misc Tests
//
promisedTest("issue#729", function () { return __awaiter(void 0, void 0, void 0, function () {
    var onConsoleWarn, warnDescriptor, err_1, f, err_2, f, err_3, f, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                onConsoleWarn = function (txt) {
                    QUnit.ok(false, 'console warn happened: ' + txt);
                };
                warnDescriptor = Object.getOwnPropertyDescriptor(console, 'warn');
                console.warn = onConsoleWarn;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db$7.foo.bulkPut([{
                            id: 1,
                            foo: 'foo',
                        }, {
                            id: 2,
                            foo: 'bar',
                        }
                    ])];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                QUnit.ok(false, "Couldn't populate data: " + err_1);
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, db$7.foo.add({ id: 1, foo: "bar" })];
            case 5:
                f = _a.sent();
                return [3 /*break*/, 7];
            case 6:
                err_2 = _a.sent();
                QUnit.ok(true, "Got the err:" + err_2);
                return [3 /*break*/, 7];
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4 /*yield*/, db$7.foo.get(false)];
            case 8:
                f = _a.sent();
                return [3 /*break*/, 10];
            case 9:
                err_3 = _a.sent();
                QUnit.ok(true, "Got the err:" + err_3);
                return [3 /*break*/, 10];
            case 10:
                _a.trys.push([10, 12, , 13]);
                return [4 /*yield*/, db$7.foo.where({ id: 1 })
                        .modify({ id: 2, foo: "bar" })];
            case 11:
                f = _a.sent();
                return [3 /*break*/, 13];
            case 12:
                err_4 = _a.sent();
                QUnit.ok(true, "Got the err:" + err_4);
                return [3 /*break*/, 13];
            case 13:
                if (warnDescriptor) {
                    Object.defineProperty(console, 'warn', warnDescriptor);
                }
                else {
                    delete console.warn;
                }
                return [2 /*return*/];
        }
    });
}); });
QUnit.asyncTest("Adding object with falsy keys", function () {
    db$7.keyless.add({ name: "foo" }, 1).then(function (id) {
        QUnit.equal(id, 1, "Normal case ok - Object with key 1 was successfully added.");
        return db$7.keyless.add({ name: "bar" }, 0);
    }).then(function (id) {
        QUnit.equal(id, 0, "Could add a numeric falsy value (0)");
        return db$7.keyless.add({ name: "foobar" }, "");
    }).then(function (id) {
        QUnit.equal(id, "", "Could add a string falsy value ('')");
        return db$7.keyless.put({ name: "bar2" }, 0);
    }).then(function (id) {
        QUnit.equal(id, 0, "Could put a numeric falsy value (0)");
        return db$7.keyless.put({ name: "foobar2" }, "");
    }).then(function (id) {
        QUnit.equal(id, "", "Could put a string falsy value ('')");
    }).catch(function (e) {
        QUnit.ok(false, e);
    }).finally(QUnit.start);
});
promisedTest("#770", function () { return __awaiter(void 0, void 0, void 0, function () {
    var dbName, db, runnedVersions, otherDB, otherDbRows, origDbRows, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dbName = 'TestDB-' + Math.random();
                db = new Dexie__default(dbName, { addons: [] });
                runnedVersions = [];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, 8, 11]);
                db.version(1).stores({ test: 'id' });
                return [4 /*yield*/, db.test.put({ id: 1 })];
            case 2:
                _a.sent();
                return [4 /*yield*/, db.open()];
            case 3:
                _a.sent();
                db.close();
                db = new Dexie__default(dbName, { addons: [] });
                db.version(1).stores({ test: 'id' });
                db.version(2).stores({ test: 'id' }).upgrade(function (t) { return __awaiter(void 0, void 0, void 0, function () {
                    var rowsToCopy;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                runnedVersions.push(2);
                                return [4 /*yield*/, t.test.toArray()];
                            case 1:
                                rowsToCopy = _a.sent();
                                return [4 /*yield*/, Dexie__default.waitFor((function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var otherDB;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    otherDB = new Dexie__default(dbName + '-another-unrelated-db', { addons: [] });
                                                    otherDB.version(1).stores({ foo: 'id' });
                                                    return [4 /*yield*/, otherDB.open()];
                                                case 1:
                                                    _a.sent();
                                                    return [4 /*yield*/, otherDB.foo.bulkAdd(rowsToCopy)];
                                                case 2:
                                                    _a.sent();
                                                    otherDB.close();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })())];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                db.version(3).stores({ test: 'id' }).upgrade(function (t) {
                    runnedVersions.push(3);
                });
                return [4 /*yield*/, db.open()];
            case 4:
                _a.sent();
                QUnit.deepEqual(runnedVersions, [2, 3], "Versions 3 did indeed proceed (as well as version 2)");
                otherDB = new Dexie__default(dbName + '-another-unrelated-db', { addons: [] });
                otherDB.version(1).stores({ foo: 'id' });
                return [4 /*yield*/, otherDB.foo.toArray()];
            case 5:
                otherDbRows = _a.sent();
                return [4 /*yield*/, db.test.toArray()];
            case 6:
                origDbRows = _a.sent();
                QUnit.deepEqual(otherDbRows, origDbRows, "All rows was copied atomically");
                db.close();
                otherDB.close();
                return [3 /*break*/, 11];
            case 7:
                err_5 = _a.sent();
                QUnit.ok(false, "Error " + err_5);
                return [3 /*break*/, 11];
            case 8: return [4 /*yield*/, db.delete()];
            case 9:
                _a.sent();
                return [4 /*yield*/, new Dexie__default(dbName + '-another-unrelated-db', { addons: [] }).delete()];
            case 10:
                _a.sent();
                return [7 /*endfinally*/];
            case 11: return [2 /*return*/];
        }
    });
}); });
QUnit.asyncTest("#102 Passing an empty array to anyOf throws exception", async$3(function () {
    var count, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, 3, 4]);
                return [4 /*yield*/, db$7.users.where("username").anyOf([]).count()];
            case 1:
                count = _a.sent();
                QUnit.equal(count, 0, "Zarro items matched the query anyOf([])");
                return [3 /*break*/, 4];
            case 2:
                err_6 = _a.sent();
                QUnit.ok(false, "Error when calling anyOf([]): " + err_6);
                return [3 /*break*/, 4];
            case 3:
                QUnit.start();
                return [7 /*endfinally*/];
            case 4: return [2 /*return*/];
        }
    });
}));
spawnedTest("#248 'modifications' object in 'updating' hook can be bizarre", function () {
    function CustomDate(realDate) {
        this._year = new Date(realDate).getFullYear();
        this._month = new Date(realDate).getMonth();
        this._day = new Date(realDate).getDate();
        this._millisec = new Date(realDate).getTime();
        //...
    }
    function creatingHook(primKey, obj) {
        ++numCreating;
        var date = obj.date;
        if (date && date instanceof CustomDate) {
            obj.date = new Date(date._year, date._month, date._day);
        }
    }
    function updatingHook(modifications, primKey, obj) {
        ++numUpdating;
        var date = modifications.date;
        if (date && date instanceof CustomDate) {
            return { date: new Date(date._year, date._month, date._day) };
        }
    }
    function isDate(obj) {
        // obj instanceof Date does NOT work with Safari when Date are retrieved from IDB.
        return obj.getTime && obj.getDate && obj.getFullYear;
    }
    function readingHook(obj) {
        if (obj.date && isDate(obj.date)) {
            obj.date = new CustomDate(obj.date);
        }
        return obj;
    }
    var numCreating, numUpdating, testDate, testDate2, retrieved;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                numCreating = 0, numUpdating = 0;
                db$7.foo.hook('creating', creatingHook);
                db$7.foo.hook('reading', readingHook);
                db$7.foo.hook('updating', updatingHook);
                testDate = new CustomDate(new Date(2016, 5, 11));
                QUnit.equal(testDate._year, 2016, "CustomDate has year 2016");
                QUnit.equal(testDate._month, 5, "CustomDate has month 5");
                QUnit.equal(testDate._day, 11, "CustomDate has day 11");
                testDate2 = new CustomDate(new Date(2016, 5, 12));
                _a.label = 1;
            case 1:
                _a.trys.push([1, , 4, 5]);
                db$7.foo.add({ id: 1, date: testDate });
                return [4 /*yield*/, db$7.foo.get(1)];
            case 2:
                retrieved = _a.sent();
                QUnit.ok(retrieved.date instanceof CustomDate, "Got a CustomDate object when retrieving object");
                QUnit.equal(retrieved.date._day, 11, "The CustomDate is on day 11");
                db$7.foo.put({ id: 1, date: testDate2 });
                return [4 /*yield*/, db$7.foo.get(1)];
            case 3:
                retrieved = _a.sent();
                QUnit.ok(retrieved.date.constructor === CustomDate, "Got a CustomDate object when retrieving object");
                QUnit.equal(retrieved.date._day, 12, "The CustomDate is now on day 12");
                // Check that hooks has been called expected number of times
                QUnit.equal(numCreating, 1, "creating hook called once");
                QUnit.equal(numUpdating, 1, "updating hook called once");
                return [3 /*break*/, 5];
            case 4:
                db$7.foo.hook('creating').unsubscribe(creatingHook);
                db$7.foo.hook('reading').unsubscribe(readingHook);
                db$7.foo.hook('updating').unsubscribe(updatingHook);
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
});
QUnit.asyncTest("Issue: Broken Promise rejection #264", 1, function () {
    db$7.open().then(function () {
        return db$7.users.where('id')
            .equals('does-not-exist')
            .first();
    }).then(function (result) {
        return Promise.reject(undefined);
    }).catch(function (err) {
        QUnit.equal(err, undefined, "Should catch the rejection");
    }).then(function (res) {
        QUnit.start();
    }).catch(function (err) {
        QUnit.start();
    });
});
QUnit.asyncTest("#323 @gitawego's post. Should not fail unexpectedly on readonly properties", function () {
    var Foo = /** @class */ (function () {
        function Foo() {
        }
        Object.defineProperty(Foo.prototype, "synced", {
            get: function () { return false; },
            enumerable: true,
            configurable: true
        });
        return Foo;
    }());
    db$7.foo.mapToClass(Foo);
    db$7.transaction('rw', db$7.foo, function () {
        db$7.foo.put({ id: 1 });
        db$7.foo.where('id').equals(1).modify({
            synced: true
        });
    }).catch(function (e) {
        QUnit.ok(false, "Could not update it: " + (e.stack || e));
    }).then(function () {
        QUnit.ok(true, "Could update it");
        return db$7.foo.get(1);
    }).then(function (foo) {
        return db$7.foo.get(1);
    }).then(function (foo) {
        console.log("Wow, it could get it even though it's mapped to a class that forbids writing that property.");
    }).catch(function (e) {
        QUnit.ok(true, "Got error from get: " + (e.stack || e));
    }).then(function () {
        return db$7.foo.toArray();
    }).then(function (array) {
        console.log("Got array of length: " + array.length);
    }).catch(function (e) {
        QUnit.ok(true, "Got error from toArray: " + (e.stack || e));
        return db$7.foo.each(function (item) { return console.log(item); });
    }).then(function (array) {
        console.log("Could do each");
    }).catch(function (e) {
        QUnit.ok(true, "Got error from each(): " + (e.stack || e));
        return db$7.foo.toCollection().sortBy('synced');
    }).then(function (array) {
        console.log("Could do sortBy");
    }).catch(function (e) {
        QUnit.ok(true, "Got error from sortBy(): " + (e.stack || e));
    }).finally(QUnit.start);
});
spawnedTest("#360 DB unresponsive after multiple Table.update() or Collection.modify()", function () {
    var NUM_UPDATES, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                NUM_UPDATES = 2000;
                return [4 /*yield*/, db$7.transaction('rw', db$7.foo, function () {
                        var i;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$7.foo.put({ id: 1, value: 0 })];
                                case 1:
                                    _a.sent();
                                    for (i = 0; i < NUM_UPDATES; ++i) {
                                        db$7.foo.where('id').equals(1).modify(function (item) { return ++item.value; });
                                    }
                                    return [4 /*yield*/, db$7.foo.get(1)];
                                case 2: return [2 /*return*/, _a.sent()];
                            }
                        });
                    })];
            case 1:
                result = _a.sent();
                QUnit.equal(result.value, NUM_UPDATES, "Should have updated id 1 a " + NUM_UPDATES + " times");
                return [2 /*return*/];
        }
    });
});
spawnedTest("delByKeyPath not working correctly for arrays", function () {
    var obj, obj2, jsonResult, jsonResult2;
    return __generator(this, function (_a) {
        obj = { deepObject: { someArray: ["a", "b"] } };
        obj2 = { deepObject: { someArray: ["a", "b", "c"] } };
        jsonResult = JSON.stringify(obj);
        console.log("jsonResult = ", jsonResult);
        Dexie__default.delByKeyPath(obj2, "deepObject.someArray.2");
        jsonResult2 = JSON.stringify(obj2);
        console.log("jsonResult2 = ", jsonResult2);
        QUnit.equal(jsonResult, jsonResult2, "Should be equal " + jsonResult + " " + jsonResult2);
        return [2 /*return*/];
    });
});
QUnit.asyncTest("#1079 mapToClass", function () {
    var Foo = /** @class */ (function () {
        function Foo() {
        }
        return Foo;
    }());
    db$7.foo.mapToClass(Foo);
    db$7.transaction('rw', db$7.foo, function () {
        db$7.foo.put({ id: 1 });
    }).catch(function (e) {
        QUnit.ok(true, "Unexpected error from put: " + (e.stack || e));
    }).then(function () {
        return db$7.foo.get(1);
    }).then(function (getResult) {
        QUnit.ok(getResult instanceof Foo, "Result of get not mapped to class");
    }).catch(function (e) {
        QUnit.ok(true, "Unexpected error from get: " + (e.stack || e));
    }).then(function () {
        return db$7.foo.bulkGet([1]);
    }).then(function (bulkGetResult) {
        QUnit.ok(bulkGetResult.length === 1, "Unexpected array length " + bulkGetResult.length + " from bulkGet");
        QUnit.ok(bulkGetResult[0] instanceof Foo, "Result of bulkGet not mapped to class");
    }).catch(function (e) {
        QUnit.ok(true, "Unexpected error from bulkGet: " + (e.stack || e));
    }).finally(QUnit.start);
});
QUnit.asyncTest("PR #1108", function () { return __awaiter(void 0, void 0, void 0, function () {
    var origConsoleWarn, warnings, DBNAME, db_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                origConsoleWarn = console.warn;
                warnings = [];
                console.warn = function (msg) { warnings.push(msg); return origConsoleWarn.apply(this, arguments); };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, 6, 7]);
                DBNAME = "PR1108";
                db_1 = new Dexie__default(DBNAME);
                db_1.version(1).stores({
                    foo: "id"
                });
                return [4 /*yield*/, db_1.open()];
            case 2:
                _a.sent();
                QUnit.ok(!warnings.some(function (x) { return /SchemaDiff/.test(x); }), DBNAME + " could be opened without SchemaDiff warnings");
                db_1.close();
                // Adding an index without updating version number:
                db_1 = new Dexie__default(DBNAME);
                db_1.version(1).stores({
                    foo: "id,name"
                });
                warnings = [];
                return [4 /*yield*/, db_1.open()];
            case 3:
                _a.sent();
                QUnit.ok(warnings.some(function (x) { return /SchemaDiff/.test(x); }), "Should warn when a new index was declared without incrementing version number");
                db_1.close();
                warnings = [];
                // Adding a table without updating version number:
                db_1 = new Dexie__default(DBNAME);
                db_1.version(1).stores({
                    foo: "id",
                    bar: ""
                });
                return [4 /*yield*/, db_1.open()];
            case 4:
                _a.sent();
                QUnit.ok(warnings.some(function (x) { return /SchemaDiff/.test(x); }), "Should warn when a new table was declared without incrementing version number");
                db_1.close();
                warnings = [];
                return [3 /*break*/, 7];
            case 5:
                error_1 = _a.sent();
                QUnit.ok(false, error_1);
                return [3 /*break*/, 7];
            case 6:
                console.warn = origConsoleWarn;
                QUnit.start();
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); });
QUnit.asyncTest("Issue #1112", function () { return __awaiter(void 0, void 0, void 0, function () {
    function Bar(text) {
        this.id = undefined;
        this.text = text;
    }
    var id1, id2, id3, id4, bar3, bar3_2, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, 9, 10]);
                return [4 /*yield*/, db$7.bars.add(new Bar("hello1"))];
            case 1:
                id1 = _a.sent();
                QUnit.ok(!isNaN(id1), "got a real autoincremented id for my bar using add()");
                return [4 /*yield*/, db$7.bars.put(new Bar("hello2"))];
            case 2:
                id2 = _a.sent();
                QUnit.ok(!isNaN(id2), "got a real autoincremented id for my bar using put()");
                return [4 /*yield*/, db$7.bars.bulkAdd([new Bar("hello3")])];
            case 3:
                id3 = _a.sent();
                QUnit.ok(!isNaN(id3), "got a real autoincremented id for my bar using bulkAdd()");
                return [4 /*yield*/, db$7.bars.bulkPut([new Bar("hello4")])];
            case 4:
                id4 = _a.sent();
                QUnit.ok(!isNaN(id4), "got a real autoincremented id for my bar using bulkPut()");
                return [4 /*yield*/, db$7.bars.get(id3)];
            case 5:
                bar3 = _a.sent();
                QUnit.equal(bar3.text, "hello3", "Should get the object with text hello3");
                bar3.text = "hello3 modified";
                return [4 /*yield*/, db$7.bars.put(bar3)];
            case 6:
                _a.sent();
                return [4 /*yield*/, db$7.bars.get(id3)];
            case 7:
                bar3_2 = _a.sent();
                QUnit.equal(bar3_2.text, "hello3 modified", "Could successfully change a prop and put back.");
                return [3 /*break*/, 10];
            case 8:
                error_2 = _a.sent();
                QUnit.ok(false, error_2);
                return [3 /*break*/, 10];
            case 9:
                QUnit.start();
                return [7 /*endfinally*/];
            case 10: return [2 /*return*/];
        }
    });
}); });

QUnit.module("promise");
//Dexie.debug = "dexie";
function createDirectlyResolvedPromise() {
    return new Dexie__default.Promise(function (resolve) {
        resolve();
    });
}
QUnit.asyncTest("Promise basics", function () {
    new Dexie__default.Promise(function (resolve) { return resolve("value"); })
        .then(function (value) {
        QUnit.equal(value, "value", "Promise should be resolved with 'value'");
    }).then(function () {
        QUnit.start();
    });
});
QUnit.asyncTest("return Promise.resolve() from Promise.then(...)", function () {
    new Dexie__default.Promise(function (resolve) { return resolve("value"); })
        .then(function (value) {
        return Dexie__default.Promise.resolve(value);
    }).then(function (value) {
        QUnit.equal(value, "value", "returning Dexie.Promise.resolve() from then handler should work");
        QUnit.start();
    });
});
QUnit.asyncTest("return unresolved Promise from Promise.then(...)", function () {
    new Dexie__default.Promise(function (resolve) { return resolve("value"); })
        .then(function (value) {
        return new Dexie__default.Promise(function (resolve) { return setTimeout(resolve, 0, "value"); });
    }).then(function (value) {
        QUnit.equal(value, "value", "When unresolved promise is resolved, this promise should resolve with its value");
        QUnit.start();
    });
});
QUnit.asyncTest("Compatibility with other promises", function () {
    Dexie__default.Promise.resolve().then(function () {
        return window.Promise.resolve(3);
    }).then(function (x) {
        QUnit.equal(x, 3, "returning a window.Promise should be ok");
        QUnit.start();
    });
});
QUnit.asyncTest("When to promise resolve", function () {
    var Promise = Dexie__default.Promise;
    var res = [];
    Promise.follow(function () {
        new Promise(function (resolve) { return resolve(); }).then(function () { return res.push("B1"); });
        res.push("A1");
        new Promise(function (resolve) { return resolve(); }).then(function () { return res.push("B2"); });
        res.push("A2");
    }).then(function () {
        QUnit.equal(JSON.stringify(res), JSON.stringify([
            "A1",
            "A2",
            "B1",
            "B2"
        ]), "Resolves come in expected order.");
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).then(QUnit.start);
});
QUnit.asyncTest("Promise.follow()", function () {
    var Promise = Dexie__default.Promise;
    Promise.follow(function () {
        Promise.resolve("test")
            .then(function (x) { return x + ":"; })
            .then(function (x) { return Promise.reject("rejection"); })
            .then(function () { return QUnit.ok(false, "Should not come here"); })
            .catch(function (e) { return QUnit.equal(e, "rejection", "Should catch rejection"); });
    }).then(function () { return QUnit.ok(true, "Scope ended"); })
        .catch(function (e) { return QUnit.ok(false, "Error: " + e.stack); })
        .then(QUnit.start);
});
QUnit.asyncTest("Promise.follow() 2", function () {
    var Promise = Dexie__default.Promise;
    Promise.follow(function () {
        Promise.resolve("test")
            .then(function (x) { return x + ":"; })
            .then(function (x) { return Promise.reject("rejection"); })
            .then(function () { return QUnit.ok(false, "Should not come here"); });
    }).then(function () { return QUnit.ok(false, "Scope should not resolve"); })
        .catch(function (e) { return QUnit.ok(true, "Got error: " + e.stack); })
        .then(QUnit.start);
});
QUnit.asyncTest("Promise.follow() 3 (empty)", function () {
    Dexie__default.Promise.follow(function () { })
        .then(function () { return QUnit.ok(true, "Promise resolved when nothing was done"); })
        .then(QUnit.start);
});
QUnit.asyncTest("Promise.follow chained", function () {
    var Promise = Dexie__default.Promise;
    //Promise._rootExec(()=>{        
    //Promise.scheduler = (fn, args) => setTimeout(fn, 0, args[0], args[1], args[2]);
    Promise.follow(function () {
        new Promise(function (resolve) { return resolve(); }).then(function () { return Promise.follow(function () {
            Promise.PSD.inner = true;
            // Chains and rejection
            new Promise(function (resolve) { return resolve(); })
                .then(function (x) { return 3; })
                .then(null, function (e) { return "catched"; })
                .then(function (x) { })
                .then(function () { throw new TypeError("oops"); });
        }).then(function () { return QUnit.ok(false, "Promise.follow() should not resolve since an unhandled rejection should have been detected"); }); }).then(function () { return QUnit.ok(false, "Promise.follow() should not resolve since an unhandled rejection should have been detected"); })
            .catch(TypeError, function (err) {
            QUnit.ok(true, "Got TypeError: " + err.stack);
        });
    }).then(function () { return QUnit.ok(true, "Outer Promise.follow() should resolve because inner was catched"); })
        .catch(function (err) {
        QUnit.ok(false, "Should have catched TypeError: " + err.stack);
    }).then(function () {
        QUnit.start();
    });
    //});
});
QUnit.asyncTest("onunhandledrejection should propagate once", 1, function () {
    if (!supports("domevents")) {
        QUnit.ok(true, "Skipping - DOM events not supported");
        QUnit.start();
        return;
    }
    var Promise = Dexie__default.Promise;
    function logErr(ev) {
        QUnit.ok(true, ev.reason);
        return false;
    }
    window.addEventListener('unhandledrejection', logErr);
    var p = new Promise(function (resolve, reject) {
        reject("apa");
    }).finally(function () {
    }).finally(function () {
    });
    var p2 = p.finally(function () { });
    var p3 = p.then(function () { });
    var p4 = p.then(function () {
    }).then(function () {
    });
    Promise.all([p, p2, p3, p4]).finally(function () {
        setTimeout(function () {
            window.removeEventListener('unhandledrejection', logErr);
            QUnit.start();
        }, 1);
    });
});
QUnit.asyncTest("onunhandledrejection should not propagate if catched after finally", 1, function () {
    if (!supports("domevents")) {
        QUnit.ok(true, "Skipping - DOM events not supported");
        QUnit.start();
        return;
    }
    var Promise = Dexie__default.Promise;
    function logErr(ev) {
        QUnit.ok(false, "Should already be catched:" + ev.reason);
    }
    window.addEventListener('unhandledrejection', logErr);
    var p = new Promise(function (resolve, reject) {
        reject("apa");
    }).finally(function () {
    }).finally(function () {
    }).catch(function (e) {
        QUnit.ok(true, "Catching it here: " + e);
    });
    var p2 = p.finally(function () { });
    var p3 = p.then(function () { });
    var p4 = p.then(function () {
    }).then(function () {
    });
    Promise.all([p, p2, p3, p4]).finally(function () {
        setTimeout(function () {
            window.removeEventListener('unhandledrejection', logErr);
            QUnit.start();
        }, 1);
    });
});
QUnit.asyncTest("Issue#27(A) - Then handlers are called synchronously for already resolved promises", function () {
    // Test with plain Dexie.Promise()
    var expectedLog = ['1', '3', '2', 'a', 'c', 'b'];
    var log = [];
    var promise = createDirectlyResolvedPromise();
    log.push('1');
    promise.then(function () {
        log.push('2');
        log.push('a');
        promise.then(function () {
            log.push('b');
            check();
        });
        log.push('c');
        check();
    });
    log.push('3');
    check();
    function check() {
        if (log.length == expectedLog.length) {
            for (var i = 0; i < log.length; ++i) {
                QUnit.equal(log[i], expectedLog[i], "Position " + i + " is " + log[i] + " and was expected to be " + expectedLog[i]);
            }
            QUnit.start();
        }
    }
});
QUnit.asyncTest("Issue#27(B) - Then handlers are called synchronously for already resolved promises", function () {
    // Test with a Promise returned from the Dexie library
    var expectedLog = ['1', '3', '2', 'a', 'c', 'b'];
    var log = [];
    var db = new Dexie__default("Promise-test");
    db.version(1).stores({ friends: '++id' });
    db.on('populate', function () {
        db.friends.add({ name: "one" });
        db.friends.add({ name: "two" });
        db.friends.add({ name: "three" });
    });
    db.delete().then(function () {
        return db.open();
    }).then(function () {
        var promise = db.friends.toCollection().each(function () { });
        log.push('1');
        promise.then(function () {
            log.push('2');
            log.push('a');
            promise.then(function () {
                log.push('b');
                check();
            }).catch(function (e) {
                QUnit.ok(false, "error: " + e);
                QUnit.start();
            });
            log.push('c');
            check();
        }).catch(function (e) {
            QUnit.ok(false, "error: " + e);
            QUnit.start();
        });
        log.push('3');
        check();
        function check() {
            if (log.length == expectedLog.length) {
                for (var i = 0; i < log.length; ++i) {
                    QUnit.equal(log[i], expectedLog[i], "Position " + i + " is " + log[i] + " and was expected to be " + expectedLog[i]);
                }
                db.delete().then(QUnit.start);
            }
        }
    });
});
QUnit.asyncTest("Issue #97 A transaction may be lost after calling Dexie.Promise.resolve().then(...)", function () {
    Dexie__default.Promise.newPSD(function () {
        Dexie__default.Promise.PSD.hello = "promise land";
        Dexie__default.Promise.resolve().then(function () {
            QUnit.ok(!!Dexie__default.Promise.PSD, "We should have a Dexie.Promise.PSD");
            QUnit.equal(Dexie__default.Promise.PSD.hello, "promise land");
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e);
        }).finally(QUnit.start);
    });
});
/*asyncTest("setTimeout vs setImmediate", ()=>{
    var log=[];
    setImmediate(()=>{
        log.push("setImmediate");
        if (log.length == 2) end();
    });
    setTimeout(()=>{
        log.push("setTimeout");
        if (log.length == 2) end();
    }, 40);
    function end() {
        equal(log[0], "setImmediate", "setImmediate first");
        equal(log[1], "setTimeout", "setTimeout second");
        start();
    }
});*/
QUnit.asyncTest("unhandledrejection", function () {
    if (!supports("domevents")) {
        QUnit.ok(true, "Skipping - DOM events not supported");
        QUnit.start();
        return;
    }
    var errors = [];
    function onError(ev) {
        errors.push(ev.reason);
        ev.preventDefault();
    }
    window.addEventListener('unhandledrejection', onError);
    new Dexie__default.Promise(function (resolve, reject) {
        reject("error");
    });
    setTimeout(function () {
        QUnit.equal(errors.length, 1, "Should be one error there");
        QUnit.equal(errors[0], "error", "Should be our error there");
        window.removeEventListener('unhandledrejection', onError);
        QUnit.start();
    }, 40);
});
QUnit.asyncTest("unhandledrejection2", function () {
    if (!supports("domevents")) {
        QUnit.ok(true, "Skipping - DOM events not supported");
        QUnit.start();
        return;
    }
    var errors = [];
    function onError(ev) {
        errors.push(ev.reason);
        ev.preventDefault();
    }
    window.addEventListener('unhandledrejection', onError);
    new Dexie__default.Promise(function (resolve, reject) {
        new Dexie__default.Promise(function (resolve2, reject2) {
            reject2("error");
        }).then(resolve, function (e) {
            reject(e);
            //return Dexie.Promise.reject(e);
        });
    });
    setTimeout(function () {
        QUnit.equal(errors.length, 1, "Should be one error there");
        QUnit.equal(errors[0], "error", "Should be our error there");
        window.removeEventListener('unhandledrejection', onError);
        QUnit.start();
    }, 40);
});
QUnit.asyncTest("unhandledrejection3", function () {
    if (!supports("domevents")) {
        QUnit.ok(true, "Skipping - DOM events not supported");
        QUnit.start();
        return;
    }
    var errors = [];
    function onError(ev) {
        errors.push(ev.reason);
        ev.preventDefault();
    }
    window.addEventListener('unhandledrejection', onError);
    new Dexie__default.Promise(function (resolve, reject) {
        new Dexie__default.Promise(function (resolve2, reject2) {
            reject2("error");
        }).then(resolve, function (e) {
            reject(e);
            //return Dexie.Promise.reject(e);
        });
    }).catch(function () { });
    setTimeout(function () {
        QUnit.equal(errors.length, 0, "Should be zarro errors there");
        window.removeEventListener('unhandledrejection', onError);
        QUnit.start();
    }, 40);
});

QUnit.module("extendability");
QUnit.asyncTest("recursive-pause", function () {
    var db = new Dexie__default("TestDB");
    db.version(1).stores({
        activities: "Oid,Task,Tick,Tock,Type,Flags",
        tasks: "Oid,Name,Parent"
    });
    var Activity = db.activities.defineClass({
        Oid: String,
        Task: String,
        Tick: Number,
        Tock: Number,
        Type: Number,
        Flags: Number
    });
    db.on('populate', function () {
        db.tasks.add({ Oid: "T1", Name: "The root task" });
        db.tasks.add({ Oid: "T2", Name: "The child task", Parent: "T1" });
        db.activities.add({ Oid: "A1", Task: "T2", Tick: 0, Tock: 10, Type: 1 });
        db.activities.add({ Oid: "A2", Task: "T2", Tick: 100, Tock: 110, Type: 1 });
        db.activities.add({ Oid: "A3", Task: "T2", Tick: 200, Tock: 210, Type: 2 });
    });
    db.delete().then(function () {
        return db.open();
    }).then(function () {
        return db.transaction("rw", db.activities, db.tasks, function () {
            Dexie__default.Promise.newPSD(function () {
                Dexie__default.currentTransaction._lock();
                db.activities.where("Type").equals(2).modify({ Flags: 2 }).finally(function () {
                    Dexie__default.currentTransaction._unlock();
                });
            });
            db.activities.where("Flags").equals(2).count(function (count) {
                QUnit.equal(count, 1, "Should have put one entry there now");
            });
            db.activities.where("Flags").equals(2).each(function (act) {
                QUnit.equal(act.Type, 2, "The entry is correct");
            });
        });
    }).catch(function (e) {
        QUnit.ok(false, e.stack || e);
    }).finally(function () {
        db.delete().then(QUnit.start);
    });
});
test("protochain", function () {
    var Promise = Dexie__default.Promise;
    var root, branch1, branch2;
    Promise.newPSD(function () {
        root = Promise.PSD;
        root.constructor = function () { };
        root.constructor.prototype = root;
        Promise.newPSD(function () {
            branch1 = Promise.PSD;
            branch1.constructor = function () { };
            branch1.constructor.prototype = branch1;
        });
        Promise.newPSD(function () {
            branch2 = Promise.PSD;
            branch2.constructor = function () { };
            branch2.constructor.prototype = branch2;
        });
    });
    QUnit.ok(branch1 instanceof root.constructor, "branch1 instanceof root.constructor");
    QUnit.ok(branch2 instanceof root.constructor, "branch2 instanceof root.constructor");
    QUnit.ok(!(root instanceof branch1.constructor), "!(root instanceof branch1.constructor)");
    QUnit.ok(!(root instanceof branch2.constructor), "!(root instanceof branch2.constructor)");
    QUnit.ok(!(branch1 instanceof branch2.constructor), "!(branch1 instanceof branch2.constructor)");
    QUnit.ok(!(branch2 instanceof branch1.constructor), "!(branch2 instanceof branch1.constructor)");
});
test("protochain2", function () {
    var derive = Dexie__default.derive;
    function Root() { }
    function Branch1() { }
    function Branch2() { }
    derive(Branch1).from(Root);
    derive(Branch2).from(Root);
    var root = new Root();
    var branch1 = new Branch1();
    var branch2 = new Branch2();
    QUnit.ok(branch1 instanceof root.constructor, "branch1 instanceof root.constructor");
    QUnit.ok(branch2 instanceof root.constructor, "branch2 instanceof root.constructor");
    QUnit.ok(!(root instanceof branch1.constructor), "!(root instanceof branch1.constructor)");
    QUnit.ok(!(root instanceof branch2.constructor), "!(root instanceof branch2.constructor)");
    QUnit.ok(!(branch1 instanceof branch2.constructor), "!(branch1 instanceof branch2.constructor)");
    QUnit.ok(!(branch2 instanceof branch1.constructor), "!(branch2 instanceof branch1.constructor)");
});

/**
 * Created by David on 3/31/2016.
 */
var Promise$2 = Dexie__default.Promise;
var all = Promise$2.all;
var async$4 = Dexie__default.async;
var spawn$1 = Dexie__default.spawn;
var db$8 = new Dexie__default("TestDBCrudHooks");
db$8.version(1).stores({
    table1: "id,idx",
    table2: ",&idx",
    table3: "++id,&idx",
    table4: "++,&idx",
    table5: ""
});
var ourTables = [db$8.table1, db$8.table2, db$8.table3, db$8.table4, db$8.table5];
var opLog = [];
var successLog = [];
var errorLog = [];
var watchSuccess = false;
var watchError = false;
var deliverKeys = [];
var deliverModifications = null;
var deliverKeys2 = [];
var deliverModifications2 = null;
var opLog2 = [];
var successLog2 = [];
var errorLog2 = [];
var transLog = [];
function unsubscribeHooks() {
    ourTables.forEach(function (table) {
        table.hook('creating').unsubscribe(creating2);
        table.hook('creating').unsubscribe(creating1);
        table.hook('reading').unsubscribe(reading1);
        table.hook('reading').unsubscribe(reading2);
        table.hook('updating').unsubscribe(updating1);
        table.hook('updating').unsubscribe(updating2);
        table.hook('deleting').unsubscribe(deleting2);
        table.hook('deleting').unsubscribe(deleting1);
    });
}
function subscrubeHooks() {
    ourTables.forEach(function (table) {
        table.hook('creating', creating1);
        table.hook('creating', creating2);
        table.hook('reading', reading1);
        table.hook('reading', reading2);
        table.hook('updating', updating1);
        table.hook('updating', updating2);
        table.hook('deleting', deleting1);
        table.hook('deleting', deleting2);
    });
}
var reset = async$4(function reset() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                unsubscribeHooks();
                return [4 /*yield*/, all(ourTables.map(function (table) { return table.clear(); }))];
            case 1:
                _a.sent();
                subscrubeHooks();
                opLog = [];
                successLog = [];
                errorLog = [];
                watchSuccess = false;
                watchError = false;
                deliverKeys = [];
                deliverModifications = null;
                deliverKeys2 = [];
                deliverModifications2 = null;
                opLog2 = [];
                successLog2 = [];
                errorLog2 = [];
                transLog = [];
                return [2 /*return*/];
        }
    });
});
/*function stack() {
    if (Error.captureStackTrace) {
        let obj = {};
        Error.captureStackTrace(obj, stack);
        return obj.stack;
    }
    var e = new Error("");
    if (e.stack) return e.stack;
    try{throw e}catch(ex){return ex.stack || "";}
}*/
function nop$1() { }
function creating1(primKey, obj, transaction) {
    // You may do additional database operations using given transaction object.
    // You may also modify given obj
    // You may set this.onsuccess = function (primKey){}. Called when autoincremented key is known.
    // You may set this.onerror = callback if create operation fails.
    // If returning any value other than undefined, the returned value will be used as primary key
    transLog.push({ trans: transaction, current: Dexie__default.currentTransaction });
    var op = {
        op: "create",
        key: primKey,
        value: Dexie__default.deepClone(obj)
    };
    opLog.push(op);
    if (watchSuccess) {
        this.onsuccess = function (primKey) { return successLog.push(primKey); };
    }
    if (watchError) {
        this.onerror = function (e) { return errorLog.push(e); };
    }
    if (deliverKeys[opLog.length - 1])
        return deliverKeys[opLog.length - 1];
}
// Check that chaining several hooks works
function creating2(primKey, obj, transaction) {
    var op = {
        op: "create",
        key: primKey,
        value: Dexie__default.deepClone(obj)
    };
    opLog2.push(op);
    if (watchSuccess) {
        this.onsuccess = function (primKey) { return successLog2.push(primKey); };
    }
    if (watchError) {
        this.onerror = function (e) { return errorLog2.push(e); };
    }
    if (deliverKeys2[opLog2.length - 1])
        return deliverKeys2[opLog2.length - 1];
}
function reading1(obj) {
    opLog.push({
        op: "read",
        obj: Dexie__default.deepClone(obj)
    });
    return { theObject: obj };
}
function reading2(obj) {
    opLog2.push({
        op: "read",
        obj: Dexie__default.deepClone(obj)
    });
    return obj.theObject;
}
function updating1(modifications, primKey, obj, transaction) {
    // You may use transaction to do additional database operations.
    // You may not do any modifications on any of the given arguments.
    // You may set this.onsuccess = function (updatedObj){} when update operation completes.
    // You may set this.onerror = callback if update operation fails.
    // If you want to make additional modifications, return another modifications object
    // containing the additional or overridden modifications to make. Any returned
    // object will be merged to the given modifications object.
    transLog.push({ trans: transaction, current: Dexie__default.currentTransaction });
    var op = {
        op: "update",
        key: primKey,
        obj: Dexie__default.deepClone(obj),
        mods: Dexie__default.shallowClone(modifications),
    };
    opLog.push(op);
    if (watchSuccess) {
        this.onsuccess = function (updatedObj) { return successLog.push(updatedObj); };
    }
    if (watchError) {
        this.onerror = function (e) { return errorLog.push(e); };
    }
    if (deliverModifications)
        return deliverModifications;
}
// Chaining:
function updating2(modifications, primKey, obj, transaction) {
    // You may use transaction to do additional database operations.
    // You may not do any modifications on any of the given arguments.
    // You may set this.onsuccess = function (updatedObj){} when update operation completes.
    // You may set this.onerror = callback if update operation fails.
    // If you want to make additional modifications, return another modifications object
    // containing the additional or overridden modifications to make. Any returned
    // object will be merged to the given modifications object.
    var op = {
        op: "update",
        key: primKey,
        obj: Dexie__default.deepClone(obj),
        mods: Dexie__default.shallowClone(modifications)
    };
    opLog2.push(op);
    if (watchSuccess) {
        this.onsuccess = function (updatedObj) { return successLog2.push(updatedObj); };
    }
    if (watchError) {
        this.onerror = function (e) { return errorLog2.push(e); };
    }
    if (deliverModifications2)
        return deliverModifications2;
}
function deleting1(primKey, obj, transaction) {
    // You may do additional database operations using given transaction object.
    // You may set this.onsuccess = callback when delete operation completes.
    // You may set this.onerror = callback if delete operation fails.
    // Any modification to obj is ignored.
    // Any return value is ignored.
    // throwing exception will make the db operation fail.
    transLog.push({ trans: transaction, current: Dexie__default.currentTransaction });
    var op = {
        op: "delete",
        key: primKey,
        obj: obj
    };
    opLog.push(op);
    if (watchSuccess) {
        this.onsuccess = function () { return successLog.push(undefined); };
    }
    if (watchError) {
        this.onerror = function (e) { return errorLog.push(e); };
    }
}
// Chaining:
function deleting2(primKey, obj, transaction) {
    // You may do additional database operations using given transaction object.
    // You may set this.onsuccess = callback when delete operation completes.
    // You may set this.onerror = callback if delete operation fails.
    // Any modification to obj is ignored.
    // Any return value is ignored.
    // throwing exception will make the db operation fail.
    var op = {
        op: "delete",
        key: primKey,
        obj: obj
    };
    opLog2.push(op);
    if (watchSuccess) {
        this.onsuccess = function () { return successLog2.push(undefined); };
    }
    if (watchError) {
        this.onerror = function (e) { return errorLog2.push(e); };
    }
}
QUnit.module("crud-hooks", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db$8).then(function () { return reset(); }).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
        unsubscribeHooks();
    }
});
var expect = async$4(function (expected, modifyer) {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, reset()];
            case 1:
                _a.sent();
                return [4 /*yield*/, modifyer()];
            case 2:
                _a.sent();
                QUnit.equal(JSON.stringify(opLog, null, 2), JSON.stringify(expected.map(function (x) { return (__assign(__assign({}, x), { updatedObj: undefined })); }), null, 2), "Expected oplog: " + JSON.stringify(expected));
                QUnit.ok(transLog.every(function (x) { return x.trans && x.current === x.trans; }), "transaction argument is valid and same as Dexie.currentTransaction");
                return [4 /*yield*/, reset()];
            case 3:
                _a.sent();
                watchSuccess = true;
                watchError = true;
                return [4 /*yield*/, modifyer()];
            case 4:
                _a.sent();
                QUnit.equal(errorLog.length + errorLog2.length, 0, "No errors should have been registered");
                QUnit.equal(successLog.length, expected.filter(function (op) { return op.op !== 'read'; }).length, "First hook got success events");
                QUnit.equal(successLog2.length, expected.filter(function (op) { return op.op !== 'read'; }).length, "Second hook got success events");
                expected.forEach(function (x, i) {
                    if (x.op === "create" && x.key !== undefined) {
                        QUnit.equal(successLog[i], x.key, "Success events got the correct key");
                        QUnit.equal(successLog2[i], x.key, "Success events got the correct key (2)");
                    }
                    if (x.op === "update") {
                        QUnit.equal(JSON.stringify(successLog[i]), JSON.stringify(x.updatedObj), "Success events got the updated object");
                        QUnit.equal(JSON.stringify(successLog2[i]), JSON.stringify(x.updatedObj), "Success events got the updated object (2)");
                    }
                });
                if (!expected.some(function (x) { return x.op === "create" && x.key === undefined; })) return [3 /*break*/, 7];
                // Test to deliver prim key from both hooks and expect the second hook's key to win.
                return [4 /*yield*/, reset()];
            case 5:
                // Test to deliver prim key from both hooks and expect the second hook's key to win.
                _a.sent();
                deliverKeys = expected.map(function (x, i) { return "Hook1Key" + i; });
                deliverKeys2 = expected.map(function (x, i) { return "Hook2Key" + i; });
                watchSuccess = true;
                watchError = true;
                return [4 /*yield*/, modifyer()];
            case 6:
                _a.sent();
                QUnit.equal(errorLog.length + errorLog2.length, 0, "No errors should have been registered");
                expected.forEach(function (x, i) {
                    if (x.op === "create" && x.key === undefined) {
                        QUnit.equal(opLog[i].key, expected[i].key, "First hook got expected key delivered");
                        QUnit.equal(opLog2[i].key, deliverKeys[i], "Second hook got key delivered from first hook");
                        QUnit.equal(successLog[i], deliverKeys2[i], "Success event got delivered key from hook2");
                        QUnit.equal(successLog2[i], deliverKeys2[i], "Success event got delivered key from hook2 (2)");
                    }
                });
                _a.label = 7;
            case 7:
                if (!expected.some(function (x) { return x.op === "update"; })) return [3 /*break*/, 10];
                return [4 /*yield*/, reset()];
            case 8:
                _a.sent();
                deliverModifications = { "someProp.someSubProp": "someValue" };
                return [4 /*yield*/, modifyer()];
            case 9:
                _a.sent();
                expected.forEach(function (x, i) {
                    if (x.op === "update") {
                        QUnit.equal(JSON.stringify(opLog[i].obj), JSON.stringify(opLog2[i].obj), "Object has not yet been changed in hook2");
                        QUnit.ok(Object.keys(opLog[i].mods).every(function (prop) {
                            return JSON.stringify(opLog[i].mods[prop]) ===
                                JSON.stringify(opLog2[i].mods[prop]);
                        }), "All mods that were originally sent to hook1, are also sent to hook2");
                        QUnit.ok("someProp.someSubProp" in opLog2[i].mods, "oplog2 got first hook's additional modifications");
                    }
                });
                _a.label = 10;
            case 10: return [2 /*return*/];
        }
    });
});
var verifyErrorFlows = async$4(function (modifyer) {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, reset()];
            case 1:
                _a.sent();
                QUnit.ok(true, "Verifying ERROR flows");
                watchSuccess = true;
                watchError = true;
                return [4 /*yield*/, modifyer()];
            case 2:
                _a.sent();
                QUnit.equal(opLog.length, opLog2.length, "Number of ops same for hook1 and hook2: " + opLog.length);
                QUnit.equal(successLog.length + errorLog.length, opLog.length, "Either onerror or onsuccess must have been called for every op. onerror: " +
                    errorLog.length + ". onsuccess: " + successLog.length + ". opLog: " + JSON.stringify(opLog));
                QUnit.equal(successLog2.length + errorLog2.length, opLog2.length, "Either onerror or onsuccess must have been called for every op (hook2). onerror: " +
                    errorLog2.length + ". onsuccess: " + successLog2.length + ". opLog: " + JSON.stringify(opLog2));
                return [2 /*return*/];
        }
    });
});
//
//
//   Tests goes here...
//
//
//
// CREATING hook tests...
//
// Ways to produce CREATEs:
//  Table.add()
//  Table.put()
//  Table.bulkAdd()
//  Table.bulkPut()
spawnedTest("creating using Table.add()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1, idx: 11 }
                    }, {
                        op: "create",
                        key: 2,
                        value: { idx: 12 }
                    }, {
                        op: "create",
                        value: { idx: 13 }
                    }, {
                        op: "create",
                        value: { idx: 14 }
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    db$8.table1.add({ id: 1, idx: 11 });
                    db$8.table2.add({ idx: 12 }, 2);
                    db$8.table3.add({ idx: 13 });
                    db$8.table4.add({ idx: 14 });
                }); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, verifyErrorFlows(function () { return db$8.transaction('rw', db$8.tables, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$8.table1.add({ id: 1 })];
                                case 1:
                                    _a.sent(); // success
                                    return [4 /*yield*/, db$8.table1.add({ id: 1 }).catch(nop$1)];
                                case 2:
                                    _a.sent(); // Trigger error event (constraint)
                                    return [4 /*yield*/, db$8.table2.add({}, 1)];
                                case 3:
                                    _a.sent(); // sucesss
                                    return [4 /*yield*/, db$8.table2.add({}, 1).catch(nop$1)];
                                case 4:
                                    _a.sent(); // Trigger error event (constraint)
                                    return [4 /*yield*/, db$8.table1.add({ id: {} }).catch(nop$1)];
                                case 5:
                                    _a.sent(); // Trigger direct exception (invalid key type)
                                    return [2 /*return*/];
                            }
                        });
                    }).catch(nop$1); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("creating using Table.put()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1, idx: 11 }
                    }, {
                        op: "create",
                        key: 2,
                        value: { idx: 12 }
                    }, {
                        op: "create",
                        value: { idx: 13 }
                    }, {
                        op: "create",
                        value: { idx: 14 }
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            //console.log("Putting {id:1, idx: 11} into table1");
                            return [4 /*yield*/, db$8.table1.put({ id: 1, idx: 11 })];
                            case 1:
                                //console.log("Putting {id:1, idx: 11} into table1");
                                _a.sent();
                                //console.log("Putting {idx: 12} for key 2 into table2");
                                return [4 /*yield*/, db$8.table2.put({ idx: 12 }, 2)];
                            case 2:
                                //console.log("Putting {idx: 12} for key 2 into table2");
                                _a.sent();
                                //console.log("Putting {idx: 13} into table3");
                                return [4 /*yield*/, db$8.table3.put({ idx: 13 })];
                            case 3:
                                //console.log("Putting {idx: 13} into table3");
                                _a.sent();
                                //console.log("Putting {idx: 14} into table4");
                                return [4 /*yield*/, db$8.table4.put({ idx: 14 })];
                            case 4:
                                //console.log("Putting {idx: 14} into table4");
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, verifyErrorFlows(function () { return db$8.transaction('rw', db$8.tables, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$8.table3.put({ idx: 1 })];
                                case 1:
                                    _a.sent(); // success
                                    return [4 /*yield*/, db$8.table3.put({ idx: 1 }).catch(nop$1)];
                                case 2:
                                    _a.sent(); // Trigger error event (constraint)
                                    return [4 /*yield*/, db$8.table2.put({}, 1)];
                                case 3:
                                    _a.sent(); // sucesss
                                    return [4 /*yield*/, db$8.table2.put({}, 1).catch(nop$1)];
                                case 4:
                                    _a.sent(); // Trigger error event (constraint)
                                    return [4 /*yield*/, db$8.table3.put({ id: {} }).catch(nop$1)];
                                case 5:
                                    _a.sent(); // Trigger direct exception (invalid key type)
                                    return [2 /*return*/];
                            }
                        });
                    }).catch(nop$1); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("creating using Table.bulkAdd()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1, idx: 11 }
                    }, {
                        op: "create",
                        key: 1.2,
                        value: { id: 1.2, idx: 11.2 }
                    }, {
                        op: "create",
                        key: 2,
                        value: { idx: 12 }
                    }, {
                        op: "create",
                        key: 2.2,
                        value: { idx: 12.2 }
                    }, {
                        op: "create",
                        value: { idx: 13 }
                    }, {
                        op: "create",
                        value: { idx: 13.2 }
                    }, {
                        op: "create",
                        value: { idx: 14 }
                    }, {
                        op: "create",
                        value: { idx: 14.2 }
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        db$8.table1.bulkAdd([{ id: 1, idx: 11 }, { id: 1.2, idx: 11.2 }]);
                        db$8.table2.bulkAdd([{ idx: 12 }, { idx: 12.2 }], [2, 2.2]);
                        db$8.table3.bulkAdd([{ idx: 13 }, { idx: 13.2 }]);
                        db$8.table4.bulkAdd([{ idx: 14 }, { idx: 14.2 }]);
                        return [2 /*return*/];
                    });
                }); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, verifyErrorFlows(function () { return db$8.transaction('rw', db$8.tables, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$8.table1.bulkAdd([{ id: 1 }, { id: 1 }]).catch(nop$1)];
                                case 1:
                                    _a.sent(); // 1. success, 2. error event.
                                    return [4 /*yield*/, db$8.table1.bulkAdd([{ id: 2 }, { id: 2 }, { id: 3 }]).catch(nop$1)];
                                case 2:
                                    _a.sent(); // 1. success, 2. error event., 3. success
                                    return [4 /*yield*/, db$8.table2.bulkAdd([{}, {}], [1, 1]).catch(nop$1)];
                                case 3:
                                    _a.sent(); // 1. success, 2. error event.
                                    return [4 /*yield*/, db$8.table2.bulkAdd([{}, {}, {}], [2, 2, 3]).catch(nop$1)];
                                case 4:
                                    _a.sent(); // 1. success, 2. error event. 3. success.
                                    return [4 /*yield*/, db$8.table1.bulkAdd([{ id: {} }]).catch(nop$1)];
                                case 5:
                                    _a.sent(); // Trigger direct exception (invalid key type)
                                    return [2 /*return*/];
                            }
                        });
                    }).catch(nop$1); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("creating using Table.bulkPut()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1, idx: 11 }
                    }, {
                        op: "create",
                        key: 1.2,
                        value: { id: 1.2, idx: 11.2 }
                    }, {
                        op: "create",
                        key: 2,
                        value: { idx: 12 }
                    }, {
                        op: "create",
                        key: 2.2,
                        value: { idx: 12.2 }
                    }, {
                        op: "create",
                        value: { idx: 13 }
                    }, {
                        op: "create",
                        value: { idx: 13.2 }
                    }, {
                        op: "create",
                        value: { idx: 14 }
                    }, {
                        op: "create",
                        value: { idx: 14.2 }
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$8.table1.bulkPut([{ id: 1, idx: 11 }, { id: 1.2, idx: 11.2 }])];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, db$8.table2.bulkPut([{ idx: 12 }, { idx: 12.2 }], [2, 2.2])];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, db$8.table3.bulkPut([{ idx: 13 }, { idx: 13.2 }])];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, db$8.table4.bulkPut([{ idx: 14 }, { idx: 14.2 }])];
                            case 4:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, verifyErrorFlows(function () { return db$8.transaction('rw', db$8.tables, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$8.table3.bulkPut([{ idx: 1 }, { idx: 1 }]).catch(nop$1)];
                                case 1:
                                    _a.sent(); // 1. success, 2. error event.
                                    return [4 /*yield*/, db$8.table3.bulkPut([{ idx: 2 }, { idx: 2 }, { idx: 3 }]).catch(nop$1)];
                                case 2:
                                    _a.sent(); // 1. success, 2. error event., 3. success
                                    return [4 /*yield*/, db$8.table1.bulkPut([{ id: {} }]).catch(nop$1)];
                                case 3:
                                    _a.sent(); // Trigger direct exception (invalid key type)
                                    return [2 /*return*/];
                            }
                        });
                    }).catch(nop$1); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
//
// READING hooks test
// Ways to produce READs:
//  Table.get()
//  Table.bulkGet()
//  Collection.toArray()
//  Collection.each()
//  Collection.first()
//  Collection.last()
// But not:
//  Table.filter() / Collection.and()
spawnedTest("reading tests", function () {
    var readOps, readOps2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { foo: "bar" }
                    }, {
                        op: "create",
                        key: 2,
                        value: { fee: "bore" }
                    }, {
                        op: "read",
                        obj: { foo: "bar" }
                    }, {
                        op: "read",
                        obj: { fee: "bore" }
                    }, {
                        op: "read",
                        obj: { fee: "bore" }
                    }, {
                        op: "read",
                        obj: { foo: "bar" }
                    }, {
                        op: "read",
                        obj: { foo: "bar" }
                    }, {
                        op: "read",
                        obj: { fee: "bore" }
                    }, {
                        op: "read",
                        obj: { foo: "bar" }
                    }, {
                        op: "read",
                        obj: { fee: "bore" }
                    }], function () { return db$8.transaction('rw', 'table5', function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$8.table5.bulkAdd([{ foo: "bar" }, { fee: "bore" }], [1, 2])];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, db$8.table5.toArray()];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, db$8.table5.reverse().each(function (x) { })];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, db$8.table5.orderBy(':id').first()];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, db$8.table5.orderBy(':id').last()];
                            case 5:
                                _a.sent();
                                return [4 /*yield*/, db$8.table5.bulkGet([1, 2])];
                            case 6:
                                _a.sent();
                                return [4 /*yield*/, db$8.table5.filter(function (x) { return false; }).toArray()];
                            case 7:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                readOps = opLog.filter(function (o) { return o.op === 'read'; }), readOps2 = opLog2.filter(function (o) { return o.op === 'read'; });
                QUnit.ok(readOps.every(function (o, i) {
                    return JSON.stringify(readOps2[i].obj.theObject) === JSON.stringify(o.obj);
                }), "hook2 should have got hook1's return value");
                return [2 /*return*/];
        }
    });
});
//
// UPDATING hooks test
// Ways to produce UPDATEs:
//  Table.put()
//  Table.bulkPut()
//  Table.update()
//  Collection.modify()
spawnedTest("updating using Table.put()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1, address: { city: 'A' } }
                    }, {
                        op: "update",
                        key: 1,
                        obj: { id: 1, address: { city: 'A' } },
                        mods: { "address.city": "B" },
                        updatedObj: { id: 1, address: { city: 'B' } },
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        db$8.table1.put({ id: 1, address: { city: 'A' } }); // create
                        db$8.table1.put({ id: 1, address: { city: 'B' } }); // update
                        return [2 /*return*/];
                    });
                }); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, verifyErrorFlows(function () { return db$8.transaction('rw', db$8.tables, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$8.table3.add({ id: 1, idx: 1 })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, db$8.table3.put({ id: 2, idx: 1 }).catch(nop$1)];
                                case 2:
                                    _a.sent(); // error event (constraint)
                                    return [4 /*yield*/, db$8.table3.put({ id: {} }).catch(nop$1)];
                                case 3:
                                    _a.sent(); // Trigger direct exception (invalid key type)
                                    return [2 /*return*/];
                            }
                        });
                    }).catch(nop$1); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("updating using Table.bulkPut()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1, address: { city: 'A' } }
                    }, {
                        op: "update",
                        key: 1,
                        obj: { id: 1, address: { city: 'A' } },
                        mods: { "address.city": "B" },
                        updatedObj: { id: 1, address: { city: 'B' } },
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        db$8.table1.put({ id: 1, address: { city: 'A' } }); // create
                        db$8.table1.put({ id: 1, address: { city: 'B' } }); // update
                        return [2 /*return*/];
                    });
                }); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, verifyErrorFlows(function () { return db$8.transaction('rw', db$8.tables, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$8.table4.add({ idx: 1 }, 1)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, db$8.table4.bulkPut([{ idx: 1 }], [2]).catch(nop$1)];
                                case 2:
                                    _a.sent(); // error event (DataError)
                                    return [4 /*yield*/, db$8.table3.bulkPut([{}], [{}]).catch(nop$1)];
                                case 3:
                                    _a.sent(); // Trigger direct exception (invalid key type)
                                    return [2 /*return*/];
                            }
                        });
                    }).catch(nop$1); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("updating using Table.update()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1, address: { city: 'A' } }
                    }, {
                        op: "update",
                        key: 1,
                        obj: { id: 1, address: { city: 'A' } },
                        mods: { "address.city": "B" },
                        updatedObj: { id: 1, address: { city: 'B' } },
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$8.table1.add({ id: 1, address: { city: 'A' } })];
                            case 1:
                                _a.sent(); // create
                                return [4 /*yield*/, db$8.table1.update(1, { "address.city": "B" })];
                            case 2:
                                _a.sent(); // update
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, verifyErrorFlows(function () { return db$8.transaction('rw', db$8.tables, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$8.table3.bulkAdd([{ id: 1, idx: 1 }, { id: 2, idx: 2 }])];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, db$8.table3.update(1, { idx: 2 }).catch(nop$1)];
                                case 2:
                                    _a.sent(); // error event (constraint)
                                    return [4 /*yield*/, db$8.table3.update(1, 3).catch(nop$1)];
                                case 3:
                                    _a.sent(); // Trigger direct exception?
                                    return [2 /*return*/];
                            }
                        });
                    }).catch(nop$1); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("updating using Collection.modify()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1, address: { city: 'A' } }
                    }, {
                        op: "update",
                        key: 1,
                        obj: { id: 1, address: { city: 'A' } },
                        mods: { "address.city": "B" },
                        updatedObj: { id: 1, address: { city: 'B' } },
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$8.table1.add({ id: 1, address: { city: 'A' } })];
                            case 1:
                                _a.sent(); // create
                                return [4 /*yield*/, db$8.table1.where('id').equals(1).modify({ "address.city": "B" })];
                            case 2:
                                _a.sent(); // update
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [4 /*yield*/, verifyErrorFlows(function () { return db$8.transaction('rw', db$8.tables, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, db$8.table3.bulkAdd([{ id: 1, idx: 1 }, { id: 2, idx: 2 }])];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, db$8.table3.where('id').equals(1).modify({ idx: 2 }).catch(nop$1)];
                                case 2:
                                    _a.sent(); // error event (constraint)
                                    return [4 /*yield*/, db$8.table3.where('id').equals(1).modify(function () { throw "apa"; }).catch(nop$1)];
                                case 3:
                                    _a.sent(); // Trigger direct exception
                                    return [2 /*return*/];
                            }
                        });
                    }).catch(nop$1); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
//
// DELETING hook tests
//
// Ways to produce DELETEs:
//  Table.delete(key)
//  Table.bulkDetele(keys)
//  Table.clear()
//  Collection.modify()
//  Collection.delete()
spawnedTest("deleting using Table.delete(key)", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1 }
                    }, {
                        op: "delete",
                        key: 1,
                        obj: { id: 1 }
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$8.table1.add({ id: 1 })];
                            case 1:
                                _a.sent(); // create
                                return [4 /*yield*/, db$8.table1.delete(1)];
                            case 2:
                                _a.sent(); // delete
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("deleting using Table.bulkDelete(key)", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1 }
                    }, {
                        op: "delete",
                        key: 1,
                        obj: { id: 1 }
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$8.table1.add({ id: 1 })];
                            case 1:
                                _a.sent(); // create
                                return [4 /*yield*/, db$8.table1.bulkDelete([1])];
                            case 2:
                                _a.sent(); // delete
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("deleting using Table.clear()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1 }
                    }, {
                        op: "delete",
                        key: 1,
                        obj: { id: 1 }
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$8.table1.add({ id: 1 })];
                            case 1:
                                _a.sent(); // create
                                return [4 /*yield*/, db$8.table1.clear()];
                            case 2:
                                _a.sent(); // delete
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("deleting using Table.modify()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1 }
                    }, {
                        op: "delete",
                        key: 1,
                        obj: { id: 1 }
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$8.table1.add({ id: 1 })];
                            case 1:
                                _a.sent(); // create
                                return [4 /*yield*/, db$8.table1.where('id').between(0, 2).modify(function () {
                                        delete this.value;
                                    })];
                            case 2:
                                _a.sent(); // delete
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});
spawnedTest("deleting using Collection.delete()", function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, expect([{
                        op: "create",
                        key: 1,
                        value: { id: 1 }
                    }, {
                        op: "delete",
                        key: 1,
                        obj: { id: 1 }
                    }], function () { return db$8.transaction('rw', db$8.tables, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db$8.table1.add({ id: 1 })];
                            case 1:
                                _a.sent(); // create
                                return [4 /*yield*/, db$8.table1.where('id').between(0, 2).delete()];
                            case 2:
                                _a.sent(); // delete
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
});

var db$9 = new Dexie__default("TestDBBinary");
db$9.version(1).stores({
    items: "id"
});
QUnit.module("blobs", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db$9).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
    }
});
function readBlob(blob) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onloadend = function (ev) { return resolve(ev.target.result); };
        reader.onerror = function (ev) { return reject(ev.target.error); };
        reader.onabort = function (ev) { return reject(new Error("Blob Aborted")); };
        reader.readAsArrayBuffer(blob);
    });
}
function arraysAreEqual(a1, a2) {
    var length = a1.length;
    if (a2.length !== length)
        return false;
    for (var i = 0; i < length; ++i) {
        if (a1[i] !== a2[i])
            return false;
    }
    return true;
}
promisedTest("Test blobs", function () { return __awaiter(void 0, void 0, void 0, function () {
    var binaryData, blob, back, arrayBuffer, resultBinaryData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                binaryData = new Uint8Array([1, 2, 3, 4]);
                blob = new Blob([binaryData], { type: 'application/octet-binary' });
                return [4 /*yield*/, db$9.items.add({ id: 1, blob: blob })];
            case 1:
                _a.sent();
                return [4 /*yield*/, db$9.items.get(1)];
            case 2:
                back = _a.sent();
                return [4 /*yield*/, readBlob(back.blob)];
            case 3:
                arrayBuffer = _a.sent();
                resultBinaryData = new Uint8Array(arrayBuffer);
                QUnit.ok(arraysAreEqual(resultBinaryData, binaryData), "Arrays should be equal");
                return [2 /*return*/];
        }
    });
}); });
promisedTest("Test blob with creating hook applied", function () { return __awaiter(void 0, void 0, void 0, function () {
    function updatingHook(modifications, primKey, obj, trans) {
        QUnit.ok(modifications.blob instanceof Blob, "When hook is called, the modifications should point to a Blob object");
    }
    var binaryData, blob, back, arrayBuffer, resultBinaryData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, , 5, 6]);
                db$9.items.hook('updating', updatingHook);
                binaryData = new Uint8Array([1, 2, 3, 4]);
                blob = new Blob([binaryData], { type: 'application/octet-binary' });
                return [4 /*yield*/, db$9.items.add({ id: 1 })];
            case 1:
                _a.sent();
                return [4 /*yield*/, db$9.items.put({ id: 1, blob: blob })];
            case 2:
                _a.sent();
                return [4 /*yield*/, db$9.items.get(1)];
            case 3:
                back = _a.sent();
                return [4 /*yield*/, readBlob(back.blob)];
            case 4:
                arrayBuffer = _a.sent();
                resultBinaryData = new Uint8Array(arrayBuffer);
                QUnit.ok(arraysAreEqual(resultBinaryData, binaryData), "Arrays should be equal");
                return [3 /*break*/, 6];
            case 5:
                db$9.items.hook('updating').unsubscribe(updatingHook);
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });

var db$10 = new Dexie__default("TestDBBinaryKeys");
db$10.version(1).stores({
    items: "id,data"
});
db$10.on('populate', function () {
    db$10.items.bulkAdd([
        { id: 'Uint8Array', data: new Uint8Array([1, 2, 3]) },
        { id: 'ArrayBuffer', data: new Uint8Array([4, 5, 6]).buffer },
    ]);
});
QUnit.module("binarykeys", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db$10).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
    }
});
promisedTest('Binary Primary Key (Int32Array)', function () { return __awaiter(void 0, void 0, void 0, function () {
    var id, back;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!supports("binarykeys")) {
                    QUnit.ok(true, "This browser does not support IndexedDB 2.0");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, , 4, 6]);
                id = new Int32Array([4, 2]);
                QUnit.equal(id[0], 4, "Sanity check 1");
                QUnit.equal(id[1], 2, "Sanity check 2");
                return [4 /*yield*/, db$10.items.add({ id: id, data: "string" })];
            case 2:
                _a.sent();
                return [4 /*yield*/, db$10.items.where({ id: new Int32Array([4, 2]) }).first()];
            case 3:
                back = _a.sent();
                QUnit.equal(back.data, "string", "Should retrieve an object by its binary primary key");
                QUnit.equal(back.id[0], 4, "Should get correct value 4");
                QUnit.equal(back.id[1], 2, "Should get correcg value 2");
                return [3 /*break*/, 6];
            case 4: 
            // Cleanup. This is only needed because of a firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1395071
            return [4 /*yield*/, db$10.items.clear()];
            case 5:
                // Cleanup. This is only needed because of a firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1395071
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
promisedTest('Binary Primary Key (Float32Array)', function () { return __awaiter(void 0, void 0, void 0, function () {
    var id, back;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!supports("binarykeys")) {
                    QUnit.ok(true, "This browser does not support IndexedDB 2.0");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, , 4, 6]);
                id = new Float32Array([4.3, 2.5]);
                QUnit.equal(Math.round(id[0] * 100), 4.3 * 100, "Sanity check 1");
                QUnit.equal(Math.round(id[1] * 100), 2.5 * 100, "Sanity check 2");
                return [4 /*yield*/, db$10.items.add({ id: id, data: "string" })];
            case 2:
                _a.sent();
                return [4 /*yield*/, db$10.items // avoiding db.items.get(key) because it triggers bug in Firefox 55.
                        .where({ id: new Float32Array([4.3, 2.5]) })
                        .first()];
            case 3:
                back = _a.sent();
                QUnit.equal(back.data, "string", "Should retrieve an object by its binary primary key");
                QUnit.equal(Math.round(back.id[0] * 100), 4.3 * 100, "Should get correct float value 4.3");
                QUnit.equal(Math.round(back.id[1] * 100), 2.5 * 100, "Should get correcg float value 2.5");
                return [3 /*break*/, 6];
            case 4: 
            // Cleanup. This is only needed because of a firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1395071
            return [4 /*yield*/, db$10.items.clear()];
            case 5:
                // Cleanup. This is only needed because of a firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1395071
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
promisedTest('Binary Index', function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, x;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!supports("binarykeys")) {
                    QUnit.ok(true, "This browser does not support IndexedDB 2.0");
                    return [2 /*return*/];
                }
                _a = QUnit.equal;
                return [4 /*yield*/, db$10.items.where('data').equals(new Uint8Array([1, 2, 3])).count()];
            case 1:
                _a.apply(void 0, [_b.sent(), 1, "Should be able to query on binary key"]);
                return [4 /*yield*/, db$10.items.where('data')
                        .anyOf([new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])])
                        .toArray()];
            case 2:
                x = _b.sent();
                QUnit.equal(x.length, 2, "Should find both keys even though the second has another binary type (IndexedDB should not distinguish them)");
                return [2 /*return*/];
        }
    });
}); });
promisedTest('OR-query', function () { return __awaiter(void 0, void 0, void 0, function () {
    var a;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!supports("binarykeys")) {
                    QUnit.ok(true, "This browser does not support IndexedDB 2.0");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, , 4, 6]);
                return [4 /*yield*/, db$10.items.bulkAdd([
                        {
                            id: new Float32Array([6.3, 10.5]),
                            data: "something"
                        },
                        {
                            id: new Uint8Array([1, 2, 3]),
                            data: "somethingelse"
                        }
                    ])];
            case 2:
                _a.sent();
                return [4 /*yield*/, db$10.items.where('data').equals("something")
                        .or('id').equals(new Uint8Array([1, 2, 3]))
                        .toArray()];
            case 3:
                a = _a.sent();
                QUnit.equal(a.length, 2, "Should get two entries");
                QUnit.ok(a.some(function (x) { return x.data === "something"; }), "Should get 'something' in the result");
                QUnit.ok(a.some(function (x) { return x.data === "somethingelse"; }), "Should get 'somethingelse' in the result");
                return [3 /*break*/, 6];
            case 4: 
            // Cleanup. This is only needed because of a firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1395071
            return [4 /*yield*/, db$10.items.clear()];
            case 5:
                // Cleanup. This is only needed because of a firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1395071
                _a.sent();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var sortedJson = createCommonjsModule(function (module, exports) {
var NON_SORTABLE_TYPES = ['undefined', 'string', 'number', 'boolean', 'function'];
var DEFAULT_SORT_OPTIONS = {
  sortBy   : undefined,
  sortKey  : true,
  sortArray: false,

  stringify: false,
  replacer : null,
  space    : null,
};

var _sortify = function(obj, options) {
  for (var i = 0; i < NON_SORTABLE_TYPES.length; i++) {
    if (NON_SORTABLE_TYPES[i] === typeof obj || obj === null) {
      return obj;
    }
  }

  if (Array.isArray(obj)) {
    if (options.sortArray === true) {
      obj.sort(options.sortBy);
    }

    for (var i = 0; i < obj.length; i++) {
      obj[i] = _sortify(obj[i], options);
    }

    return obj;

  } else {
    if (options.sortKey === true) {
      var sortedObj = {};
      var keyList = [];

      for (var k in obj) {
        keyList.push(k);
      }
      keyList.sort(options.sortBy);

      for (var i = 0; i < keyList.length; i++) {
        var k = keyList[i];
        var v = obj[k];

        sortedObj[k] = _sortify(v, options);
      }

      return sortedObj;

    } else {
      for (var k in obj) {
        obj[k] = _sortify(obj[k], options);
      }

      return obj;
    }
  }
};

exports.sortify = function(obj, options) {
  if (!options) {
    options = {};
  }

  for (var k in DEFAULT_SORT_OPTIONS) if (DEFAULT_SORT_OPTIONS.hasOwnProperty(k)) {
    var v  = DEFAULT_SORT_OPTIONS[k];

    if (!(k in options)) {
      options[k] = v;
    }
  }

  var result = _sortify(obj, options);
  if (options.stringify === true) {
    result = JSON.stringify(result, options.replacer, options.space);
  }

  return result;
};

/* Deprecated Code below */
var _stringify = function(obj, compareFunction) {
  if (typeof obj == 'string') {
    return '"' + obj + '"';
  }
  else if (typeof obj == 'number') {
    return obj;
  }
  else if (typeof obj == 'boolean') {
    return obj;
  }
  else if (typeof obj == 'function') {
    return '"<FUNCTION>"';
  }
  else if (typeof obj == 'object') {
    if (Array.isArray(obj)) {
      var parts = [];
      for (var i = 0; i < obj.length; i++) {
        var v = exports.stringify(obj[i], compareFunction);
        parts.push(v);
      }

      return '[' + parts.join(',') + ']';
    }
    else {
      var keyList = [];
      for (var k in obj) {
        keyList.push(k);
      }
      keyList.sort(compareFunction);

      var parts = [];
      for (var i = 0; i < keyList.length; i++) {
        var k = keyList[i];
        var v = exports.stringify(obj[k], compareFunction);

        parts.push('"' + k + '":' + v);
      }
      return '{' + parts.join(',') + '}';
    }
  }
  else {
    return '"<UNKNOW>"';
  }
};

exports.stringify = function(obj, compareFunction) {
  console.log("The stringify() function is DEPRECATED. Please use sortify() instead.");

  return _stringify(obj, compareFunction);
};
});

var sortedJson_1 = sortedJson.sortify;
var sortedJson_2 = sortedJson.stringify;

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isFunction(x) {
    return typeof x === 'function';
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var _enable_super_gross_mode_that_will_cause_bad_things = false;
var config = {
    Promise: undefined,
    set useDeprecatedSynchronousErrorHandling(value) {
        if (value) {
            var error = /*@__PURE__*/ new Error();
            /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
        }
        else if (_enable_super_gross_mode_that_will_cause_bad_things) {
            /*@__PURE__*/ console.log('RxJS: Back to a better error behavior. Thank you. <3');
        }
        _enable_super_gross_mode_that_will_cause_bad_things = value;
    },
    get useDeprecatedSynchronousErrorHandling() {
        return _enable_super_gross_mode_that_will_cause_bad_things;
    },
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function hostReportError(err) {
    setTimeout(function () { throw err; }, 0);
}

/** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */
var empty = {
    closed: true,
    next: function (value) { },
    error: function (err) {
        if (config.useDeprecatedSynchronousErrorHandling) {
            throw err;
        }
        else {
            hostReportError(err);
        }
    },
    complete: function () { }
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var isArray$1 = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isObject(x) {
    return x !== null && typeof x === 'object';
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var UnsubscriptionErrorImpl = /*@__PURE__*/ (function () {
    function UnsubscriptionErrorImpl(errors) {
        Error.call(this);
        this.message = errors ?
            errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
        return this;
    }
    UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return UnsubscriptionErrorImpl;
})();
var UnsubscriptionError = UnsubscriptionErrorImpl;

/** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */
var Subscription = /*@__PURE__*/ (function () {
    function Subscription(unsubscribe) {
        this.closed = false;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (unsubscribe) {
            this._ctorUnsubscribe = true;
            this._unsubscribe = unsubscribe;
        }
    }
    Subscription.prototype.unsubscribe = function () {
        var errors;
        if (this.closed) {
            return;
        }
        var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this.closed = true;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (_parentOrParents instanceof Subscription) {
            _parentOrParents.remove(this);
        }
        else if (_parentOrParents !== null) {
            for (var index = 0; index < _parentOrParents.length; ++index) {
                var parent_1 = _parentOrParents[index];
                parent_1.remove(this);
            }
        }
        if (isFunction(_unsubscribe)) {
            if (_ctorUnsubscribe) {
                this._unsubscribe = undefined;
            }
            try {
                _unsubscribe.call(this);
            }
            catch (e) {
                errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
            }
        }
        if (isArray$1(_subscriptions)) {
            var index = -1;
            var len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject(sub)) {
                    try {
                        sub.unsubscribe();
                    }
                    catch (e) {
                        errors = errors || [];
                        if (e instanceof UnsubscriptionError) {
                            errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                        }
                        else {
                            errors.push(e);
                        }
                    }
                }
            }
        }
        if (errors) {
            throw new UnsubscriptionError(errors);
        }
    };
    Subscription.prototype.add = function (teardown) {
        var subscription = teardown;
        if (!teardown) {
            return Subscription.EMPTY;
        }
        switch (typeof teardown) {
            case 'function':
                subscription = new Subscription(teardown);
            case 'object':
                if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                    return subscription;
                }
                else if (this.closed) {
                    subscription.unsubscribe();
                    return subscription;
                }
                else if (!(subscription instanceof Subscription)) {
                    var tmp = subscription;
                    subscription = new Subscription();
                    subscription._subscriptions = [tmp];
                }
                break;
            default: {
                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
            }
        }
        var _parentOrParents = subscription._parentOrParents;
        if (_parentOrParents === null) {
            subscription._parentOrParents = this;
        }
        else if (_parentOrParents instanceof Subscription) {
            if (_parentOrParents === this) {
                return subscription;
            }
            subscription._parentOrParents = [_parentOrParents, this];
        }
        else if (_parentOrParents.indexOf(this) === -1) {
            _parentOrParents.push(this);
        }
        else {
            return subscription;
        }
        var subscriptions = this._subscriptions;
        if (subscriptions === null) {
            this._subscriptions = [subscription];
        }
        else {
            subscriptions.push(subscription);
        }
        return subscription;
    };
    Subscription.prototype.remove = function (subscription) {
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.closed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());
function flattenUnsubscriptionErrors(errors) {
    return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var rxSubscriber = /*@__PURE__*/ (function () {
    return typeof Symbol === 'function'
        ? /*@__PURE__*/ Symbol('rxSubscriber')
        : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();
})();

/** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */
var Subscriber = /*@__PURE__*/ (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destinationOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this.syncErrorValue = null;
        _this.syncErrorThrown = false;
        _this.syncErrorThrowable = false;
        _this.isStopped = false;
        switch (arguments.length) {
            case 0:
                _this.destination = empty;
                break;
            case 1:
                if (!destinationOrNext) {
                    _this.destination = empty;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                        _this.destination = destinationOrNext;
                        destinationOrNext.add(_this);
                    }
                    else {
                        _this.syncErrorThrowable = true;
                        _this.destination = new SafeSubscriber(_this, destinationOrNext);
                    }
                    break;
                }
            default:
                _this.syncErrorThrowable = true;
                _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                break;
        }
        return _this;
    }
    Subscriber.prototype[rxSubscriber] = function () { return this; };
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype._unsubscribeAndRecycle = function () {
        var _parentOrParents = this._parentOrParents;
        this._parentOrParents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parentOrParents = _parentOrParents;
        return this;
    };
    return Subscriber;
}(Subscription));
var SafeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this._parentSubscriber = _parentSubscriber;
        var next;
        var context = _this;
        if (isFunction(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== empty) {
                context = Object.create(observerOrNext);
                if (isFunction(context.unsubscribe)) {
                    _this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = _this.unsubscribe.bind(_this);
            }
        }
        _this._context = context;
        _this._next = next;
        _this._error = error;
        _this._complete = complete;
        return _this;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parentSubscriber = this._parentSubscriber;
            if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
            if (this._error) {
                if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parentSubscriber.syncErrorThrowable) {
                this.unsubscribe();
                if (useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                hostReportError(err);
            }
            else {
                if (useDeprecatedSynchronousErrorHandling) {
                    _parentSubscriber.syncErrorValue = err;
                    _parentSubscriber.syncErrorThrown = true;
                }
                else {
                    hostReportError(err);
                }
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        var _this = this;
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._complete) {
                var wrappedComplete = function () { return _this._complete.call(_this._context); };
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            if (config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError(err);
            }
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        if (!config.useDeprecatedSynchronousErrorHandling) {
            throw new Error('bad call');
        }
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                parent.syncErrorValue = err;
                parent.syncErrorThrown = true;
                return true;
            }
            else {
                hostReportError(err);
                return true;
            }
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parentSubscriber = this._parentSubscriber;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */
function canReportError(observer) {
    while (observer) {
        var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
        if (closed_1 || isStopped) {
            return false;
        }
        else if (destination && destination instanceof Subscriber) {
            observer = destination;
        }
        else {
            observer = null;
        }
    }
    return true;
}

/** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */
function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[rxSubscriber]) {
            return nextOrObserver[rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new Subscriber(empty);
    }
    return new Subscriber(nextOrObserver, error, complete);
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var observable = /*@__PURE__*/ (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function identity(x) {
    return x;
}

/** PURE_IMPORTS_START _identity PURE_IMPORTS_END */

function pipeFromArray(fns) {
    if (fns.length === 0) {
        return identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}

/** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */
var Observable = /*@__PURE__*/ (function () {
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable$$1 = new Observable();
        observable$$1.source = this;
        observable$$1.operator = operator;
        return observable$$1;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = toSubscriber(observerOrNext, error, complete);
        if (operator) {
            sink.add(operator.call(sink, this.source));
        }
        else {
            sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                this._subscribe(sink) :
                this._trySubscribe(sink));
        }
        if (config.useDeprecatedSynchronousErrorHandling) {
            if (sink.syncErrorThrowable) {
                sink.syncErrorThrowable = false;
                if (sink.syncErrorThrown) {
                    throw sink.syncErrorValue;
                }
            }
        }
        return sink;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                sink.syncErrorThrown = true;
                sink.syncErrorValue = err;
            }
            if (canReportError(sink)) {
                sink.error(err);
            }
            else {
                console.warn(err);
            }
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscription;
            subscription = _this.subscribe(function (value) {
                try {
                    next(value);
                }
                catch (err) {
                    reject(err);
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var source = this.source;
        return source && source.subscribe(subscriber);
    };
    Observable.prototype[observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        if (operations.length === 0) {
            return this;
        }
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
function getPromiseCtor(promiseCtor) {
    if (!promiseCtor) {
        promiseCtor = config.Promise || Promise;
    }
    if (!promiseCtor) {
        throw new Error('no Promise impl found');
    }
    return promiseCtor;
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var ObjectUnsubscribedErrorImpl = /*@__PURE__*/ (function () {
    function ObjectUnsubscribedErrorImpl() {
        Error.call(this);
        this.message = 'object unsubscribed';
        this.name = 'ObjectUnsubscribedError';
        return this;
    }
    ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return ObjectUnsubscribedErrorImpl;
})();
var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
var SubjectSubscription = /*@__PURE__*/ (function (_super) {
    __extends(SubjectSubscription, _super);
    function SubjectSubscription(subject, subscriber) {
        var _this = _super.call(this) || this;
        _this.subject = subject;
        _this.subscriber = subscriber;
        _this.closed = false;
        return _this;
    }
    SubjectSubscription.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.closed = true;
        var subject = this.subject;
        var observers = subject.observers;
        this.subject = null;
        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
            return;
        }
        var subscriberIndex = observers.indexOf(this.subscriber);
        if (subscriberIndex !== -1) {
            observers.splice(subscriberIndex, 1);
        }
    };
    return SubjectSubscription;
}(Subscription));

/** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */
var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SubjectSubscriber, _super);
    function SubjectSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        return _this;
    }
    return SubjectSubscriber;
}(Subscriber));
var Subject = /*@__PURE__*/ (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.observers = [];
        _this.closed = false;
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype[rxSubscriber] = function () {
        return new SubjectSubscriber(this);
    };
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype.next = function (value) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        if (!this.isStopped) {
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].next(value);
            }
        }
    };
    Subject.prototype.error = function (err) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        this.hasError = true;
        this.thrownError = err;
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].error(err);
        }
        this.observers.length = 0;
    };
    Subject.prototype.complete = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].complete();
        }
        this.observers.length = 0;
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = true;
        this.closed = true;
        this.observers = null;
    };
    Subject.prototype._trySubscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else {
            return _super.prototype._trySubscribe.call(this, subscriber);
        }
    };
    Subject.prototype._subscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else if (this.hasError) {
            subscriber.error(this.thrownError);
            return Subscription.EMPTY;
        }
        else if (this.isStopped) {
            subscriber.complete();
            return Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            return new SubjectSubscription(this, subscriber);
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable));
var AnonymousSubject = /*@__PURE__*/ (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var destination = this.destination;
        if (destination && destination.next) {
            destination.next(value);
        }
    };
    AnonymousSubject.prototype.error = function (err) {
        var destination = this.destination;
        if (destination && destination.error) {
            this.destination.error(err);
        }
    };
    AnonymousSubject.prototype.complete = function () {
        var destination = this.destination;
        if (destination && destination.complete) {
            this.destination.complete();
        }
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var source = this.source;
        if (source) {
            return this.source.subscribe(subscriber);
        }
        else {
            return Subscription.EMPTY;
        }
    };
    return AnonymousSubject;
}(Subject));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
function refCount() {
    return function refCountOperatorFunction(source) {
        return source.lift(new RefCountOperator(source));
    };
}
var RefCountOperator = /*@__PURE__*/ (function () {
    function RefCountOperator(connectable) {
        this.connectable = connectable;
    }
    RefCountOperator.prototype.call = function (subscriber, source) {
        var connectable = this.connectable;
        connectable._refCount++;
        var refCounter = new RefCountSubscriber(subscriber, connectable);
        var subscription = source.subscribe(refCounter);
        if (!refCounter.closed) {
            refCounter.connection = connectable.connect();
        }
        return subscription;
    };
    return RefCountOperator;
}());
var RefCountSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(RefCountSubscriber, _super);
    function RefCountSubscriber(destination, connectable) {
        var _this = _super.call(this, destination) || this;
        _this.connectable = connectable;
        return _this;
    }
    RefCountSubscriber.prototype._unsubscribe = function () {
        var connectable = this.connectable;
        if (!connectable) {
            this.connection = null;
            return;
        }
        this.connectable = null;
        var refCount = connectable._refCount;
        if (refCount <= 0) {
            this.connection = null;
            return;
        }
        connectable._refCount = refCount - 1;
        if (refCount > 1) {
            this.connection = null;
            return;
        }
        var connection = this.connection;
        var sharedConnection = connectable._connection;
        this.connection = null;
        if (sharedConnection && (!connection || sharedConnection === connection)) {
            sharedConnection.unsubscribe();
        }
    };
    return RefCountSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subject,_Observable,_Subscriber,_Subscription,_operators_refCount PURE_IMPORTS_END */
var ConnectableObservable = /*@__PURE__*/ (function (_super) {
    __extends(ConnectableObservable, _super);
    function ConnectableObservable(source, subjectFactory) {
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.subjectFactory = subjectFactory;
        _this._refCount = 0;
        _this._isComplete = false;
        return _this;
    }
    ConnectableObservable.prototype._subscribe = function (subscriber) {
        return this.getSubject().subscribe(subscriber);
    };
    ConnectableObservable.prototype.getSubject = function () {
        var subject = this._subject;
        if (!subject || subject.isStopped) {
            this._subject = this.subjectFactory();
        }
        return this._subject;
    };
    ConnectableObservable.prototype.connect = function () {
        var connection = this._connection;
        if (!connection) {
            this._isComplete = false;
            connection = this._connection = new Subscription();
            connection.add(this.source
                .subscribe(new ConnectableSubscriber(this.getSubject(), this)));
            if (connection.closed) {
                this._connection = null;
                connection = Subscription.EMPTY;
            }
        }
        return connection;
    };
    ConnectableObservable.prototype.refCount = function () {
        return refCount()(this);
    };
    return ConnectableObservable;
}(Observable));

var ConnectableSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ConnectableSubscriber, _super);
    function ConnectableSubscriber(destination, connectable) {
        var _this = _super.call(this, destination) || this;
        _this.connectable = connectable;
        return _this;
    }
    ConnectableSubscriber.prototype._error = function (err) {
        this._unsubscribe();
        _super.prototype._error.call(this, err);
    };
    ConnectableSubscriber.prototype._complete = function () {
        this.connectable._isComplete = true;
        this._unsubscribe();
        _super.prototype._complete.call(this);
    };
    ConnectableSubscriber.prototype._unsubscribe = function () {
        var connectable = this.connectable;
        if (connectable) {
            this.connectable = null;
            var connection = connectable._connection;
            connectable._refCount = 0;
            connectable._subject = null;
            connectable._connection = null;
            if (connection) {
                connection.unsubscribe();
            }
        }
    };
    return ConnectableSubscriber;
}(SubjectSubscriber));
var RefCountSubscriber$1 = /*@__PURE__*/ (function (_super) {
    __extends(RefCountSubscriber, _super);
    function RefCountSubscriber(destination, connectable) {
        var _this = _super.call(this, destination) || this;
        _this.connectable = connectable;
        return _this;
    }
    RefCountSubscriber.prototype._unsubscribe = function () {
        var connectable = this.connectable;
        if (!connectable) {
            this.connection = null;
            return;
        }
        this.connectable = null;
        var refCount$$1 = connectable._refCount;
        if (refCount$$1 <= 0) {
            this.connection = null;
            return;
        }
        connectable._refCount = refCount$$1 - 1;
        if (refCount$$1 > 1) {
            this.connection = null;
            return;
        }
        var connection = this.connection;
        var sharedConnection = connectable._connection;
        this.connection = null;
        if (sharedConnection && (!connection || sharedConnection === connection)) {
            sharedConnection.unsubscribe();
        }
    };
    return RefCountSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_Subscription,_Observable,_Subject PURE_IMPORTS_END */

var GroupBySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(GroupBySubscriber, _super);
    function GroupBySubscriber(destination, keySelector, elementSelector, durationSelector, subjectSelector) {
        var _this = _super.call(this, destination) || this;
        _this.keySelector = keySelector;
        _this.elementSelector = elementSelector;
        _this.durationSelector = durationSelector;
        _this.subjectSelector = subjectSelector;
        _this.groups = null;
        _this.attemptedToUnsubscribe = false;
        _this.count = 0;
        return _this;
    }
    GroupBySubscriber.prototype._next = function (value) {
        var key;
        try {
            key = this.keySelector(value);
        }
        catch (err) {
            this.error(err);
            return;
        }
        this._group(value, key);
    };
    GroupBySubscriber.prototype._group = function (value, key) {
        var groups = this.groups;
        if (!groups) {
            groups = this.groups = new Map();
        }
        var group = groups.get(key);
        var element;
        if (this.elementSelector) {
            try {
                element = this.elementSelector(value);
            }
            catch (err) {
                this.error(err);
            }
        }
        else {
            element = value;
        }
        if (!group) {
            group = (this.subjectSelector ? this.subjectSelector() : new Subject());
            groups.set(key, group);
            var groupedObservable = new GroupedObservable(key, group, this);
            this.destination.next(groupedObservable);
            if (this.durationSelector) {
                var duration = void 0;
                try {
                    duration = this.durationSelector(new GroupedObservable(key, group));
                }
                catch (err) {
                    this.error(err);
                    return;
                }
                this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
            }
        }
        if (!group.closed) {
            group.next(element);
        }
    };
    GroupBySubscriber.prototype._error = function (err) {
        var groups = this.groups;
        if (groups) {
            groups.forEach(function (group, key) {
                group.error(err);
            });
            groups.clear();
        }
        this.destination.error(err);
    };
    GroupBySubscriber.prototype._complete = function () {
        var groups = this.groups;
        if (groups) {
            groups.forEach(function (group, key) {
                group.complete();
            });
            groups.clear();
        }
        this.destination.complete();
    };
    GroupBySubscriber.prototype.removeGroup = function (key) {
        this.groups.delete(key);
    };
    GroupBySubscriber.prototype.unsubscribe = function () {
        if (!this.closed) {
            this.attemptedToUnsubscribe = true;
            if (this.count === 0) {
                _super.prototype.unsubscribe.call(this);
            }
        }
    };
    return GroupBySubscriber;
}(Subscriber));
var GroupDurationSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(GroupDurationSubscriber, _super);
    function GroupDurationSubscriber(key, group, parent) {
        var _this = _super.call(this, group) || this;
        _this.key = key;
        _this.group = group;
        _this.parent = parent;
        return _this;
    }
    GroupDurationSubscriber.prototype._next = function (value) {
        this.complete();
    };
    GroupDurationSubscriber.prototype._unsubscribe = function () {
        var _a = this, parent = _a.parent, key = _a.key;
        this.key = this.parent = null;
        if (parent) {
            parent.removeGroup(key);
        }
    };
    return GroupDurationSubscriber;
}(Subscriber));
var GroupedObservable = /*@__PURE__*/ (function (_super) {
    __extends(GroupedObservable, _super);
    function GroupedObservable(key, groupSubject, refCountSubscription) {
        var _this = _super.call(this) || this;
        _this.key = key;
        _this.groupSubject = groupSubject;
        _this.refCountSubscription = refCountSubscription;
        return _this;
    }
    GroupedObservable.prototype._subscribe = function (subscriber) {
        var subscription = new Subscription();
        var _a = this, refCountSubscription = _a.refCountSubscription, groupSubject = _a.groupSubject;
        if (refCountSubscription && !refCountSubscription.closed) {
            subscription.add(new InnerRefCountSubscription(refCountSubscription));
        }
        subscription.add(groupSubject.subscribe(subscriber));
        return subscription;
    };
    return GroupedObservable;
}(Observable));
var InnerRefCountSubscription = /*@__PURE__*/ (function (_super) {
    __extends(InnerRefCountSubscription, _super);
    function InnerRefCountSubscription(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        parent.count++;
        return _this;
    }
    InnerRefCountSubscription.prototype.unsubscribe = function () {
        var parent = this.parent;
        if (!parent.closed && !this.closed) {
            _super.prototype.unsubscribe.call(this);
            parent.count -= 1;
            if (parent.count === 0 && parent.attemptedToUnsubscribe) {
                parent.unsubscribe();
            }
        }
    };
    return InnerRefCountSubscription;
}(Subscription));

/** PURE_IMPORTS_START tslib,_Subject,_util_ObjectUnsubscribedError PURE_IMPORTS_END */
var BehaviorSubject = /*@__PURE__*/ (function (_super) {
    __extends(BehaviorSubject, _super);
    function BehaviorSubject(_value) {
        var _this = _super.call(this) || this;
        _this._value = _value;
        return _this;
    }
    Object.defineProperty(BehaviorSubject.prototype, "value", {
        get: function () {
            return this.getValue();
        },
        enumerable: true,
        configurable: true
    });
    BehaviorSubject.prototype._subscribe = function (subscriber) {
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        if (subscription && !subscription.closed) {
            subscriber.next(this._value);
        }
        return subscription;
    };
    BehaviorSubject.prototype.getValue = function () {
        if (this.hasError) {
            throw this.thrownError;
        }
        else if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else {
            return this._value;
        }
    };
    BehaviorSubject.prototype.next = function (value) {
        _super.prototype.next.call(this, this._value = value);
    };
    return BehaviorSubject;
}(Subject));

/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
var Action = /*@__PURE__*/ (function (_super) {
    __extends(Action, _super);
    function Action(scheduler, work) {
        return _super.call(this) || this;
    }
    Action.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        return this;
    };
    return Action;
}(Subscription));

/** PURE_IMPORTS_START tslib,_Action PURE_IMPORTS_END */
var AsyncAction = /*@__PURE__*/ (function (_super) {
    __extends(AsyncAction, _super);
    function AsyncAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.pending = false;
        return _this;
    }
    AsyncAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (this.closed) {
            return this;
        }
        this.state = state;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, delay);
        }
        this.pending = true;
        this.delay = delay;
        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
        return this;
    };
    AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        return setInterval(scheduler.flush.bind(scheduler, this), delay);
    };
    AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay !== null && this.delay === delay && this.pending === false) {
            return id;
        }
        clearInterval(id);
        return undefined;
    };
    AsyncAction.prototype.execute = function (state, delay) {
        if (this.closed) {
            return new Error('executing a cancelled action');
        }
        this.pending = false;
        var error = this._execute(state, delay);
        if (error) {
            return error;
        }
        else if (this.pending === false && this.id != null) {
            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
        }
    };
    AsyncAction.prototype._execute = function (state, delay) {
        var errored = false;
        var errorValue = undefined;
        try {
            this.work(state);
        }
        catch (e) {
            errored = true;
            errorValue = !!e && e || new Error(e);
        }
        if (errored) {
            this.unsubscribe();
            return errorValue;
        }
    };
    AsyncAction.prototype._unsubscribe = function () {
        var id = this.id;
        var scheduler = this.scheduler;
        var actions = scheduler.actions;
        var index = actions.indexOf(this);
        this.work = null;
        this.state = null;
        this.pending = false;
        this.scheduler = null;
        if (index !== -1) {
            actions.splice(index, 1);
        }
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, null);
        }
        this.delay = null;
    };
    return AsyncAction;
}(Action));

/** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */
var QueueAction = /*@__PURE__*/ (function (_super) {
    __extends(QueueAction, _super);
    function QueueAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    QueueAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay > 0) {
            return _super.prototype.schedule.call(this, state, delay);
        }
        this.delay = delay;
        this.state = state;
        this.scheduler.flush(this);
        return this;
    };
    QueueAction.prototype.execute = function (state, delay) {
        return (delay > 0 || this.closed) ?
            _super.prototype.execute.call(this, state, delay) :
            this._execute(state, delay);
    };
    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        return scheduler.flush(this);
    };
    return QueueAction;
}(AsyncAction));

var Scheduler = /*@__PURE__*/ (function () {
    function Scheduler(SchedulerAction, now) {
        if (now === void 0) {
            now = Scheduler.now;
        }
        this.SchedulerAction = SchedulerAction;
        this.now = now;
    }
    Scheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) {
            delay = 0;
        }
        return new this.SchedulerAction(this, work).schedule(state, delay);
    };
    Scheduler.now = function () { return Date.now(); };
    return Scheduler;
}());

/** PURE_IMPORTS_START tslib,_Scheduler PURE_IMPORTS_END */
var AsyncScheduler = /*@__PURE__*/ (function (_super) {
    __extends(AsyncScheduler, _super);
    function AsyncScheduler(SchedulerAction, now) {
        if (now === void 0) {
            now = Scheduler.now;
        }
        var _this = _super.call(this, SchedulerAction, function () {
            if (AsyncScheduler.delegate && AsyncScheduler.delegate !== _this) {
                return AsyncScheduler.delegate.now();
            }
            else {
                return now();
            }
        }) || this;
        _this.actions = [];
        _this.active = false;
        _this.scheduled = undefined;
        return _this;
    }
    AsyncScheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) {
            delay = 0;
        }
        if (AsyncScheduler.delegate && AsyncScheduler.delegate !== this) {
            return AsyncScheduler.delegate.schedule(work, delay, state);
        }
        else {
            return _super.prototype.schedule.call(this, work, delay, state);
        }
    };
    AsyncScheduler.prototype.flush = function (action) {
        var actions = this.actions;
        if (this.active) {
            actions.push(action);
            return;
        }
        var error;
        this.active = true;
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (action = actions.shift());
        this.active = false;
        if (error) {
            while (action = actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsyncScheduler;
}(Scheduler));

/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
var QueueScheduler = /*@__PURE__*/ (function (_super) {
    __extends(QueueScheduler, _super);
    function QueueScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return QueueScheduler;
}(AsyncScheduler));

/** PURE_IMPORTS_START _QueueAction,_QueueScheduler PURE_IMPORTS_END */
var queueScheduler = /*@__PURE__*/ new QueueScheduler(QueueAction);
var queue = queueScheduler;

/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
var EMPTY = /*@__PURE__*/ new Observable(function (subscriber) { return subscriber.complete(); });
function empty$1(scheduler) {
    return scheduler ? emptyScheduled(scheduler) : EMPTY;
}
function emptyScheduled(scheduler) {
    return new Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isScheduler(value) {
    return value && typeof value.schedule === 'function';
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var subscribeToArray = function (array) {
    return function (subscriber) {
        for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
            subscriber.next(array[i]);
        }
        subscriber.complete();
    };
};

/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
function scheduleArray(input, scheduler) {
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        var i = 0;
        sub.add(scheduler.schedule(function () {
            if (i === input.length) {
                subscriber.complete();
                return;
            }
            subscriber.next(input[i++]);
            if (!subscriber.closed) {
                sub.add(this.schedule());
            }
        }));
        return sub;
    });
}

/** PURE_IMPORTS_START _Observable,_util_subscribeToArray,_scheduled_scheduleArray PURE_IMPORTS_END */
function fromArray(input, scheduler) {
    if (!scheduler) {
        return new Observable(subscribeToArray(input));
    }
    else {
        return scheduleArray(input, scheduler);
    }
}

/** PURE_IMPORTS_START _util_isScheduler,_fromArray,_scheduled_scheduleArray PURE_IMPORTS_END */
function of() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args[args.length - 1];
    if (isScheduler(scheduler)) {
        args.pop();
        return scheduleArray(args, scheduler);
    }
    else {
        return fromArray(args);
    }
}

/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
function throwError(error, scheduler) {
    if (!scheduler) {
        return new Observable(function (subscriber) { return subscriber.error(error); });
    }
    else {
        return new Observable(function (subscriber) { return scheduler.schedule(dispatch, 0, { error: error, subscriber: subscriber }); });
    }
}
function dispatch(_a) {
    var error = _a.error, subscriber = _a.subscriber;
    subscriber.error(error);
}

/** PURE_IMPORTS_START _observable_empty,_observable_of,_observable_throwError PURE_IMPORTS_END */
var NotificationKind;
/*@__PURE__*/ (function (NotificationKind) {
    NotificationKind["NEXT"] = "N";
    NotificationKind["ERROR"] = "E";
    NotificationKind["COMPLETE"] = "C";
})(NotificationKind || (NotificationKind = {}));
var Notification = /*@__PURE__*/ (function () {
    function Notification(kind, value, error) {
        this.kind = kind;
        this.value = value;
        this.error = error;
        this.hasValue = kind === 'N';
    }
    Notification.prototype.observe = function (observer) {
        switch (this.kind) {
            case 'N':
                return observer.next && observer.next(this.value);
            case 'E':
                return observer.error && observer.error(this.error);
            case 'C':
                return observer.complete && observer.complete();
        }
    };
    Notification.prototype.do = function (next, error, complete) {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return next && next(this.value);
            case 'E':
                return error && error(this.error);
            case 'C':
                return complete && complete();
        }
    };
    Notification.prototype.accept = function (nextOrObserver, error, complete) {
        if (nextOrObserver && typeof nextOrObserver.next === 'function') {
            return this.observe(nextOrObserver);
        }
        else {
            return this.do(nextOrObserver, error, complete);
        }
    };
    Notification.prototype.toObservable = function () {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return of(this.value);
            case 'E':
                return throwError(this.error);
            case 'C':
                return empty$1();
        }
        throw new Error('unexpected notification kind value');
    };
    Notification.createNext = function (value) {
        if (typeof value !== 'undefined') {
            return new Notification('N', value);
        }
        return Notification.undefinedValueNotification;
    };
    Notification.createError = function (err) {
        return new Notification('E', undefined, err);
    };
    Notification.createComplete = function () {
        return Notification.completeNotification;
    };
    Notification.completeNotification = new Notification('C');
    Notification.undefinedValueNotification = new Notification('N', undefined);
    return Notification;
}());

/** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */

var ObserveOnSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ObserveOnSubscriber, _super);
    function ObserveOnSubscriber(destination, scheduler, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        var _this = _super.call(this, destination) || this;
        _this.scheduler = scheduler;
        _this.delay = delay;
        return _this;
    }
    ObserveOnSubscriber.dispatch = function (arg) {
        var notification = arg.notification, destination = arg.destination;
        notification.observe(destination);
        this.unsubscribe();
    };
    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
        var destination = this.destination;
        destination.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
    };
    ObserveOnSubscriber.prototype._next = function (value) {
        this.scheduleMessage(Notification.createNext(value));
    };
    ObserveOnSubscriber.prototype._error = function (err) {
        this.scheduleMessage(Notification.createError(err));
        this.unsubscribe();
    };
    ObserveOnSubscriber.prototype._complete = function () {
        this.scheduleMessage(Notification.createComplete());
        this.unsubscribe();
    };
    return ObserveOnSubscriber;
}(Subscriber));
var ObserveOnMessage = /*@__PURE__*/ (function () {
    function ObserveOnMessage(notification, destination) {
        this.notification = notification;
        this.destination = destination;
    }
    return ObserveOnMessage;
}());

/** PURE_IMPORTS_START tslib,_Subject,_scheduler_queue,_Subscription,_operators_observeOn,_util_ObjectUnsubscribedError,_SubjectSubscription PURE_IMPORTS_END */
var ReplaySubject = /*@__PURE__*/ (function (_super) {
    __extends(ReplaySubject, _super);
    function ReplaySubject(bufferSize, windowTime, scheduler) {
        if (bufferSize === void 0) {
            bufferSize = Number.POSITIVE_INFINITY;
        }
        if (windowTime === void 0) {
            windowTime = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this) || this;
        _this.scheduler = scheduler;
        _this._events = [];
        _this._infiniteTimeWindow = false;
        _this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
        _this._windowTime = windowTime < 1 ? 1 : windowTime;
        if (windowTime === Number.POSITIVE_INFINITY) {
            _this._infiniteTimeWindow = true;
            _this.next = _this.nextInfiniteTimeWindow;
        }
        else {
            _this.next = _this.nextTimeWindow;
        }
        return _this;
    }
    ReplaySubject.prototype.nextInfiniteTimeWindow = function (value) {
        if (!this.isStopped) {
            var _events = this._events;
            _events.push(value);
            if (_events.length > this._bufferSize) {
                _events.shift();
            }
        }
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype.nextTimeWindow = function (value) {
        if (!this.isStopped) {
            this._events.push(new ReplayEvent(this._getNow(), value));
            this._trimBufferThenGetEvents();
        }
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype._subscribe = function (subscriber) {
        var _infiniteTimeWindow = this._infiniteTimeWindow;
        var _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
        var scheduler = this.scheduler;
        var len = _events.length;
        var subscription;
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else if (this.isStopped || this.hasError) {
            subscription = Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            subscription = new SubjectSubscription(this, subscriber);
        }
        if (scheduler) {
            subscriber.add(subscriber = new ObserveOnSubscriber(subscriber, scheduler));
        }
        if (_infiniteTimeWindow) {
            for (var i = 0; i < len && !subscriber.closed; i++) {
                subscriber.next(_events[i]);
            }
        }
        else {
            for (var i = 0; i < len && !subscriber.closed; i++) {
                subscriber.next(_events[i].value);
            }
        }
        if (this.hasError) {
            subscriber.error(this.thrownError);
        }
        else if (this.isStopped) {
            subscriber.complete();
        }
        return subscription;
    };
    ReplaySubject.prototype._getNow = function () {
        return (this.scheduler || queue).now();
    };
    ReplaySubject.prototype._trimBufferThenGetEvents = function () {
        var now = this._getNow();
        var _bufferSize = this._bufferSize;
        var _windowTime = this._windowTime;
        var _events = this._events;
        var eventsCount = _events.length;
        var spliceCount = 0;
        while (spliceCount < eventsCount) {
            if ((now - _events[spliceCount].time) < _windowTime) {
                break;
            }
            spliceCount++;
        }
        if (eventsCount > _bufferSize) {
            spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
        }
        if (spliceCount > 0) {
            _events.splice(0, spliceCount);
        }
        return _events;
    };
    return ReplaySubject;
}(Subject));
var ReplayEvent = /*@__PURE__*/ (function () {
    function ReplayEvent(time, value) {
        this.time = time;
        this.value = value;
    }
    return ReplayEvent;
}());

/** PURE_IMPORTS_START tslib,_Subject,_Subscription PURE_IMPORTS_END */
var AsyncSubject = /*@__PURE__*/ (function (_super) {
    __extends(AsyncSubject, _super);
    function AsyncSubject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.value = null;
        _this.hasNext = false;
        _this.hasCompleted = false;
        return _this;
    }
    AsyncSubject.prototype._subscribe = function (subscriber) {
        if (this.hasError) {
            subscriber.error(this.thrownError);
            return Subscription.EMPTY;
        }
        else if (this.hasCompleted && this.hasNext) {
            subscriber.next(this.value);
            subscriber.complete();
            return Subscription.EMPTY;
        }
        return _super.prototype._subscribe.call(this, subscriber);
    };
    AsyncSubject.prototype.next = function (value) {
        if (!this.hasCompleted) {
            this.value = value;
            this.hasNext = true;
        }
    };
    AsyncSubject.prototype.error = function (error) {
        if (!this.hasCompleted) {
            _super.prototype.error.call(this, error);
        }
    };
    AsyncSubject.prototype.complete = function () {
        this.hasCompleted = true;
        if (this.hasNext) {
            _super.prototype.next.call(this, this.value);
        }
        _super.prototype.complete.call(this);
    };
    return AsyncSubject;
}(Subject));

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var nextHandle = 1;
var RESOLVED = /*@__PURE__*/ (function () { return /*@__PURE__*/ Promise.resolve(); })();
var activeHandles = {};
function findAndClearHandle(handle) {
    if (handle in activeHandles) {
        delete activeHandles[handle];
        return true;
    }
    return false;
}
var Immediate = {
    setImmediate: function (cb) {
        var handle = nextHandle++;
        activeHandles[handle] = true;
        RESOLVED.then(function () { return findAndClearHandle(handle) && cb(); });
        return handle;
    },
    clearImmediate: function (handle) {
        findAndClearHandle(handle);
    },
};

/** PURE_IMPORTS_START tslib,_util_Immediate,_AsyncAction PURE_IMPORTS_END */
var AsapAction = /*@__PURE__*/ (function (_super) {
    __extends(AsapAction, _super);
    function AsapAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler.scheduled || (scheduler.scheduled = Immediate.setImmediate(scheduler.flush.bind(scheduler, null)));
    };
    AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        if (scheduler.actions.length === 0) {
            Immediate.clearImmediate(id);
            scheduler.scheduled = undefined;
        }
        return undefined;
    };
    return AsapAction;
}(AsyncAction));

/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
var AsapScheduler = /*@__PURE__*/ (function (_super) {
    __extends(AsapScheduler, _super);
    function AsapScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AsapScheduler.prototype.flush = function (action) {
        this.active = true;
        this.scheduled = undefined;
        var actions = this.actions;
        var error;
        var index = -1;
        var count = actions.length;
        action = action || actions.shift();
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (++index < count && (action = actions.shift()));
        this.active = false;
        if (error) {
            while (++index < count && (action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsapScheduler;
}(AsyncScheduler));

/** PURE_IMPORTS_START _AsapAction,_AsapScheduler PURE_IMPORTS_END */
var asapScheduler = /*@__PURE__*/ new AsapScheduler(AsapAction);
var asap$2 = asapScheduler;

/** PURE_IMPORTS_START _AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
var asyncScheduler = /*@__PURE__*/ new AsyncScheduler(AsyncAction);

/** PURE_IMPORTS_START tslib,_AsyncAction PURE_IMPORTS_END */
var AnimationFrameAction = /*@__PURE__*/ (function (_super) {
    __extends(AnimationFrameAction, _super);
    function AnimationFrameAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler.scheduled || (scheduler.scheduled = requestAnimationFrame(function () { return scheduler.flush(null); }));
    };
    AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if ((delay !== null && delay > 0) || (delay === null && this.delay > 0)) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        if (scheduler.actions.length === 0) {
            cancelAnimationFrame(id);
            scheduler.scheduled = undefined;
        }
        return undefined;
    };
    return AnimationFrameAction;
}(AsyncAction));

/** PURE_IMPORTS_START tslib,_AsyncScheduler PURE_IMPORTS_END */
var AnimationFrameScheduler = /*@__PURE__*/ (function (_super) {
    __extends(AnimationFrameScheduler, _super);
    function AnimationFrameScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnimationFrameScheduler.prototype.flush = function (action) {
        this.active = true;
        this.scheduled = undefined;
        var actions = this.actions;
        var error;
        var index = -1;
        var count = actions.length;
        action = action || actions.shift();
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (++index < count && (action = actions.shift()));
        this.active = false;
        if (error) {
            while (++index < count && (action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AnimationFrameScheduler;
}(AsyncScheduler));

/** PURE_IMPORTS_START _AnimationFrameAction,_AnimationFrameScheduler PURE_IMPORTS_END */
var animationFrameScheduler = /*@__PURE__*/ new AnimationFrameScheduler(AnimationFrameAction);

/** PURE_IMPORTS_START tslib,_AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
var VirtualTimeScheduler = /*@__PURE__*/ (function (_super) {
    __extends(VirtualTimeScheduler, _super);
    function VirtualTimeScheduler(SchedulerAction, maxFrames) {
        if (SchedulerAction === void 0) {
            SchedulerAction = VirtualAction;
        }
        if (maxFrames === void 0) {
            maxFrames = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this, SchedulerAction, function () { return _this.frame; }) || this;
        _this.maxFrames = maxFrames;
        _this.frame = 0;
        _this.index = -1;
        return _this;
    }
    VirtualTimeScheduler.prototype.flush = function () {
        var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
        var error, action;
        while ((action = actions[0]) && action.delay <= maxFrames) {
            actions.shift();
            this.frame = action.delay;
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        }
        if (error) {
            while (action = actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    VirtualTimeScheduler.frameTimeFactor = 10;
    return VirtualTimeScheduler;
}(AsyncScheduler));
var VirtualAction = /*@__PURE__*/ (function (_super) {
    __extends(VirtualAction, _super);
    function VirtualAction(scheduler, work, index) {
        if (index === void 0) {
            index = scheduler.index += 1;
        }
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.index = index;
        _this.active = true;
        _this.index = scheduler.index = index;
        return _this;
    }
    VirtualAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        if (!this.id) {
            return _super.prototype.schedule.call(this, state, delay);
        }
        this.active = false;
        var action = new VirtualAction(this.scheduler, this.work);
        this.add(action);
        return action.schedule(state, delay);
    };
    VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        this.delay = scheduler.frame + delay;
        var actions = scheduler.actions;
        actions.push(this);
        actions.sort(VirtualAction.sortActions);
        return true;
    };
    VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) {
            delay = 0;
        }
        return undefined;
    };
    VirtualAction.prototype._execute = function (state, delay) {
        if (this.active === true) {
            return _super.prototype._execute.call(this, state, delay);
        }
    };
    VirtualAction.sortActions = function (a, b) {
        if (a.delay === b.delay) {
            if (a.index === b.index) {
                return 0;
            }
            else if (a.index > b.index) {
                return 1;
            }
            else {
                return -1;
            }
        }
        else if (a.delay > b.delay) {
            return 1;
        }
        else {
            return -1;
        }
    };
    return VirtualAction;
}(AsyncAction));

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function noop() { }

/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

/** PURE_IMPORTS_START  PURE_IMPORTS_END */

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var EmptyErrorImpl = /*@__PURE__*/ (function () {
    function EmptyErrorImpl() {
        Error.call(this);
        this.message = 'no elements in sequence';
        this.name = 'EmptyError';
        return this;
    }
    EmptyErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return EmptyErrorImpl;
})();
var EmptyError = EmptyErrorImpl;

/** PURE_IMPORTS_START  PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
function map(project, thisArg) {
    return function mapOperation(source) {
        if (typeof project !== 'function') {
            throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
        }
        return source.lift(new MapOperator(project, thisArg));
    };
}
var MapOperator = /*@__PURE__*/ (function () {
    function MapOperator(project, thisArg) {
        this.project = project;
        this.thisArg = thisArg;
    }
    MapOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
    };
    return MapOperator;
}());
var MapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(MapSubscriber, _super);
    function MapSubscriber(destination, project, thisArg) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.count = 0;
        _this.thisArg = thisArg || _this;
        return _this;
    }
    MapSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.project.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return MapSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_canReportError,_util_isArray,_util_isScheduler PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_AsyncSubject,_operators_map,_util_canReportError,_util_isScheduler,_util_isArray PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
var OuterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(OuterSubscriber, _super);
    function OuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.destination.next(innerValue);
    };
    OuterSubscriber.prototype.notifyError = function (error, innerSub) {
        this.destination.error(error);
    };
    OuterSubscriber.prototype.notifyComplete = function (innerSub) {
        this.destination.complete();
    };
    return OuterSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
var InnerSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(InnerSubscriber, _super);
    function InnerSubscriber(parent, outerValue, outerIndex) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.outerValue = outerValue;
        _this.outerIndex = outerIndex;
        _this.index = 0;
        return _this;
    }
    InnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
    };
    InnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error, this);
        this.unsubscribe();
    };
    InnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete(this);
        this.unsubscribe();
    };
    return InnerSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _hostReportError PURE_IMPORTS_END */
var subscribeToPromise = function (promise) {
    return function (subscriber) {
        promise.then(function (value) {
            if (!subscriber.closed) {
                subscriber.next(value);
                subscriber.complete();
            }
        }, function (err) { return subscriber.error(err); })
            .then(null, hostReportError);
        return subscriber;
    };
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function getSymbolIterator() {
    if (typeof Symbol !== 'function' || !Symbol.iterator) {
        return '@@iterator';
    }
    return Symbol.iterator;
}
var iterator = /*@__PURE__*/ getSymbolIterator();

/** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
var subscribeToIterable = function (iterable) {
    return function (subscriber) {
        var iterator$$1 = iterable[iterator]();
        do {
            var item = void 0;
            try {
                item = iterator$$1.next();
            }
            catch (err) {
                subscriber.error(err);
                return subscriber;
            }
            if (item.done) {
                subscriber.complete();
                break;
            }
            subscriber.next(item.value);
            if (subscriber.closed) {
                break;
            }
        } while (true);
        if (typeof iterator$$1.return === 'function') {
            subscriber.add(function () {
                if (iterator$$1.return) {
                    iterator$$1.return();
                }
            });
        }
        return subscriber;
    };
};

/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
var subscribeToObservable = function (obj) {
    return function (subscriber) {
        var obs = obj[observable]();
        if (typeof obs.subscribe !== 'function') {
            throw new TypeError('Provided object does not correctly implement Symbol.observable');
        }
        else {
            return obs.subscribe(subscriber);
        }
    };
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isPromise(value) {
    return !!value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
}

/** PURE_IMPORTS_START _subscribeToArray,_subscribeToPromise,_subscribeToIterable,_subscribeToObservable,_isArrayLike,_isPromise,_isObject,_symbol_iterator,_symbol_observable PURE_IMPORTS_END */
var subscribeTo = function (result) {
    if (!!result && typeof result[observable] === 'function') {
        return subscribeToObservable(result);
    }
    else if (isArrayLike(result)) {
        return subscribeToArray(result);
    }
    else if (isPromise(result)) {
        return subscribeToPromise(result);
    }
    else if (!!result && typeof result[iterator] === 'function') {
        return subscribeToIterable(result);
    }
    else {
        var value = isObject(result) ? 'an invalid object' : "'" + result + "'";
        var msg = "You provided " + value + " where a stream was expected."
            + ' You can provide an Observable, Promise, Array, or Iterable.';
        throw new TypeError(msg);
    }
};

/** PURE_IMPORTS_START _InnerSubscriber,_subscribeTo,_Observable PURE_IMPORTS_END */
function subscribeToResult(outerSubscriber, result, outerValue, outerIndex, innerSubscriber) {
    if (innerSubscriber === void 0) {
        innerSubscriber = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);
    }
    if (innerSubscriber.closed) {
        return undefined;
    }
    if (result instanceof Observable) {
        return result.subscribe(innerSubscriber);
    }
    return subscribeTo(result)(innerSubscriber);
}

/** PURE_IMPORTS_START tslib,_util_isScheduler,_util_isArray,_OuterSubscriber,_util_subscribeToResult,_fromArray PURE_IMPORTS_END */
var NONE = {};

var CombineLatestSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(CombineLatestSubscriber, _super);
    function CombineLatestSubscriber(destination, resultSelector) {
        var _this = _super.call(this, destination) || this;
        _this.resultSelector = resultSelector;
        _this.active = 0;
        _this.values = [];
        _this.observables = [];
        return _this;
    }
    CombineLatestSubscriber.prototype._next = function (observable) {
        this.values.push(NONE);
        this.observables.push(observable);
    };
    CombineLatestSubscriber.prototype._complete = function () {
        var observables = this.observables;
        var len = observables.length;
        if (len === 0) {
            this.destination.complete();
        }
        else {
            this.active = len;
            this.toRespond = len;
            for (var i = 0; i < len; i++) {
                var observable = observables[i];
                this.add(subscribeToResult(this, observable, undefined, i));
            }
        }
    };
    CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
        if ((this.active -= 1) === 0) {
            this.destination.complete();
        }
    };
    CombineLatestSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
        var values = this.values;
        var oldVal = values[outerIndex];
        var toRespond = !this.toRespond
            ? 0
            : oldVal === NONE ? --this.toRespond : this.toRespond;
        values[outerIndex] = innerValue;
        if (toRespond === 0) {
            if (this.resultSelector) {
                this._tryResultSelector(values);
            }
            else {
                this.destination.next(values.slice());
            }
        }
    };
    CombineLatestSubscriber.prototype._tryResultSelector = function (values) {
        var result;
        try {
            result = this.resultSelector.apply(this, values);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return CombineLatestSubscriber;
}(OuterSubscriber));

/** PURE_IMPORTS_START _Observable,_Subscription,_symbol_observable PURE_IMPORTS_END */
function scheduleObservable(input, scheduler) {
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        sub.add(scheduler.schedule(function () {
            var observable$$1 = input[observable]();
            sub.add(observable$$1.subscribe({
                next: function (value) { sub.add(scheduler.schedule(function () { return subscriber.next(value); })); },
                error: function (err) { sub.add(scheduler.schedule(function () { return subscriber.error(err); })); },
                complete: function () { sub.add(scheduler.schedule(function () { return subscriber.complete(); })); },
            }));
        }));
        return sub;
    });
}

/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */
function schedulePromise(input, scheduler) {
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        sub.add(scheduler.schedule(function () {
            return input.then(function (value) {
                sub.add(scheduler.schedule(function () {
                    subscriber.next(value);
                    sub.add(scheduler.schedule(function () { return subscriber.complete(); }));
                }));
            }, function (err) {
                sub.add(scheduler.schedule(function () { return subscriber.error(err); }));
            });
        }));
        return sub;
    });
}

/** PURE_IMPORTS_START _Observable,_Subscription,_symbol_iterator PURE_IMPORTS_END */
function scheduleIterable(input, scheduler) {
    if (!input) {
        throw new Error('Iterable cannot be null');
    }
    return new Observable(function (subscriber) {
        var sub = new Subscription();
        var iterator$$1;
        sub.add(function () {
            if (iterator$$1 && typeof iterator$$1.return === 'function') {
                iterator$$1.return();
            }
        });
        sub.add(scheduler.schedule(function () {
            iterator$$1 = input[iterator]();
            sub.add(scheduler.schedule(function () {
                if (subscriber.closed) {
                    return;
                }
                var value;
                var done;
                try {
                    var result = iterator$$1.next();
                    value = result.value;
                    done = result.done;
                }
                catch (err) {
                    subscriber.error(err);
                    return;
                }
                if (done) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(value);
                    this.schedule();
                }
            }));
        }));
        return sub;
    });
}

/** PURE_IMPORTS_START _symbol_observable PURE_IMPORTS_END */
function isInteropObservable(input) {
    return input && typeof input[observable] === 'function';
}

/** PURE_IMPORTS_START _symbol_iterator PURE_IMPORTS_END */
function isIterable(input) {
    return input && typeof input[iterator] === 'function';
}

/** PURE_IMPORTS_START _scheduleObservable,_schedulePromise,_scheduleArray,_scheduleIterable,_util_isInteropObservable,_util_isPromise,_util_isArrayLike,_util_isIterable PURE_IMPORTS_END */
function scheduled(input, scheduler) {
    if (input != null) {
        if (isInteropObservable(input)) {
            return scheduleObservable(input, scheduler);
        }
        else if (isPromise(input)) {
            return schedulePromise(input, scheduler);
        }
        else if (isArrayLike(input)) {
            return scheduleArray(input, scheduler);
        }
        else if (isIterable(input) || typeof input === 'string') {
            return scheduleIterable(input, scheduler);
        }
    }
    throw new TypeError((input !== null && typeof input || input) + ' is not observable');
}

/** PURE_IMPORTS_START _Observable,_util_subscribeTo,_scheduled_scheduled PURE_IMPORTS_END */
function from(input, scheduler) {
    if (!scheduler) {
        if (input instanceof Observable) {
            return input;
        }
        return new Observable(subscribeTo(input));
    }
    else {
        return scheduled(input, scheduler);
    }
}

/** PURE_IMPORTS_START tslib,_Subscriber,_Observable,_util_subscribeTo PURE_IMPORTS_END */
var SimpleInnerSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SimpleInnerSubscriber, _super);
    function SimpleInnerSubscriber(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        return _this;
    }
    SimpleInnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(value);
    };
    SimpleInnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error);
        this.unsubscribe();
    };
    SimpleInnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete();
        this.unsubscribe();
    };
    return SimpleInnerSubscriber;
}(Subscriber));
var ComplexInnerSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ComplexInnerSubscriber, _super);
    function ComplexInnerSubscriber(parent, outerValue, outerIndex) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.outerValue = outerValue;
        _this.outerIndex = outerIndex;
        return _this;
    }
    ComplexInnerSubscriber.prototype._next = function (value) {
        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this);
    };
    ComplexInnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error);
        this.unsubscribe();
    };
    ComplexInnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete(this);
        this.unsubscribe();
    };
    return ComplexInnerSubscriber;
}(Subscriber));
var SimpleOuterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SimpleOuterSubscriber, _super);
    function SimpleOuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SimpleOuterSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    SimpleOuterSubscriber.prototype.notifyError = function (err) {
        this.destination.error(err);
    };
    SimpleOuterSubscriber.prototype.notifyComplete = function () {
        this.destination.complete();
    };
    return SimpleOuterSubscriber;
}(Subscriber));
var ComplexOuterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ComplexOuterSubscriber, _super);
    function ComplexOuterSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComplexOuterSubscriber.prototype.notifyNext = function (_outerValue, innerValue, _outerIndex, _innerSub) {
        this.destination.next(innerValue);
    };
    ComplexOuterSubscriber.prototype.notifyError = function (error) {
        this.destination.error(error);
    };
    ComplexOuterSubscriber.prototype.notifyComplete = function (_innerSub) {
        this.destination.complete();
    };
    return ComplexOuterSubscriber;
}(Subscriber));
function innerSubscribe(result, innerSubscriber) {
    if (innerSubscriber.closed) {
        return undefined;
    }
    if (result instanceof Observable) {
        return result.subscribe(innerSubscriber);
    }
    return subscribeTo(result)(innerSubscriber);
}

/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */

var MergeMapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(MergeMapSubscriber, _super);
    function MergeMapSubscriber(destination, project, concurrent) {
        if (concurrent === void 0) {
            concurrent = Number.POSITIVE_INFINITY;
        }
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.concurrent = concurrent;
        _this.hasCompleted = false;
        _this.buffer = [];
        _this.active = 0;
        _this.index = 0;
        return _this;
    }
    MergeMapSubscriber.prototype._next = function (value) {
        if (this.active < this.concurrent) {
            this._tryNext(value);
        }
        else {
            this.buffer.push(value);
        }
    };
    MergeMapSubscriber.prototype._tryNext = function (value) {
        var result;
        var index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.active++;
        this._innerSub(result);
    };
    MergeMapSubscriber.prototype._innerSub = function (ish) {
        var innerSubscriber = new SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        var innerSubscription = innerSubscribe(ish, innerSubscriber);
        if (innerSubscription !== innerSubscriber) {
            destination.add(innerSubscription);
        }
    };
    MergeMapSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            this.destination.complete();
        }
        this.unsubscribe();
    };
    MergeMapSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    MergeMapSubscriber.prototype.notifyComplete = function () {
        var buffer = this.buffer;
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            this.destination.complete();
        }
    };
    return MergeMapSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START _mergeMap,_util_identity PURE_IMPORTS_END */

/** PURE_IMPORTS_START _mergeAll PURE_IMPORTS_END */

/** PURE_IMPORTS_START _of,_operators_concatAll PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_util_isArray,_operators_map,_util_isObject,_from PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_util_isArray,_util_isFunction,_operators_map PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_util_identity,_util_isScheduler PURE_IMPORTS_END */

/** PURE_IMPORTS_START _defer,_empty PURE_IMPORTS_END */

/** PURE_IMPORTS_START _isArray PURE_IMPORTS_END */
function isNumeric(val) {
    return !isArray$1(val) && (val - parseFloat(val) + 1) >= 0;
}

/** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_util_isScheduler,_operators_mergeAll,_fromArray PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_util_noop PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_from,_util_isArray,_empty PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_Subscription PURE_IMPORTS_END */

/** PURE_IMPORTS_START  PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var FilterSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(FilterSubscriber, _super);
    function FilterSubscriber(destination, predicate, thisArg) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.thisArg = thisArg;
        _this.count = 0;
        return _this;
    }
    FilterSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.predicate.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        if (result) {
            this.destination.next(value);
        }
    };
    return FilterSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _util_not,_util_subscribeTo,_operators_filter,_Observable PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_util_isArray,_fromArray,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */

var RaceSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(RaceSubscriber, _super);
    function RaceSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.hasFirst = false;
        _this.observables = [];
        _this.subscriptions = [];
        return _this;
    }
    RaceSubscriber.prototype._next = function (observable) {
        this.observables.push(observable);
    };
    RaceSubscriber.prototype._complete = function () {
        var observables = this.observables;
        var len = observables.length;
        if (len === 0) {
            this.destination.complete();
        }
        else {
            for (var i = 0; i < len && !this.hasFirst; i++) {
                var observable = observables[i];
                var subscription = subscribeToResult(this, observable, undefined, i);
                if (this.subscriptions) {
                    this.subscriptions.push(subscription);
                }
                this.add(subscription);
            }
            this.observables = null;
        }
    };
    RaceSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
        if (!this.hasFirst) {
            this.hasFirst = true;
            for (var i = 0; i < this.subscriptions.length; i++) {
                if (i !== outerIndex) {
                    var subscription = this.subscriptions[i];
                    subscription.unsubscribe();
                    this.remove(subscription);
                }
            }
            this.subscriptions = null;
        }
        this.destination.next(innerValue);
    };
    return RaceSubscriber;
}(OuterSubscriber));

/** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_scheduler_async,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Observable,_from,_empty PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_fromArray,_util_isArray,_Subscriber,_.._internal_symbol_iterator,_innerSubscribe PURE_IMPORTS_END */

var ZipSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ZipSubscriber, _super);
    function ZipSubscriber(destination, resultSelector, values) {
        if (values === void 0) {
            values = Object.create(null);
        }
        var _this = _super.call(this, destination) || this;
        _this.resultSelector = resultSelector;
        _this.iterators = [];
        _this.active = 0;
        _this.resultSelector = (typeof resultSelector === 'function') ? resultSelector : undefined;
        return _this;
    }
    ZipSubscriber.prototype._next = function (value) {
        var iterators = this.iterators;
        if (isArray$1(value)) {
            iterators.push(new StaticArrayIterator(value));
        }
        else if (typeof value[iterator] === 'function') {
            iterators.push(new StaticIterator(value[iterator]()));
        }
        else {
            iterators.push(new ZipBufferIterator(this.destination, this, value));
        }
    };
    ZipSubscriber.prototype._complete = function () {
        var iterators = this.iterators;
        var len = iterators.length;
        this.unsubscribe();
        if (len === 0) {
            this.destination.complete();
            return;
        }
        this.active = len;
        for (var i = 0; i < len; i++) {
            var iterator$$1 = iterators[i];
            if (iterator$$1.stillUnsubscribed) {
                var destination = this.destination;
                destination.add(iterator$$1.subscribe());
            }
            else {
                this.active--;
            }
        }
    };
    ZipSubscriber.prototype.notifyInactive = function () {
        this.active--;
        if (this.active === 0) {
            this.destination.complete();
        }
    };
    ZipSubscriber.prototype.checkIterators = function () {
        var iterators = this.iterators;
        var len = iterators.length;
        var destination = this.destination;
        for (var i = 0; i < len; i++) {
            var iterator$$1 = iterators[i];
            if (typeof iterator$$1.hasValue === 'function' && !iterator$$1.hasValue()) {
                return;
            }
        }
        var shouldComplete = false;
        var args = [];
        for (var i = 0; i < len; i++) {
            var iterator$$1 = iterators[i];
            var result = iterator$$1.next();
            if (iterator$$1.hasCompleted()) {
                shouldComplete = true;
            }
            if (result.done) {
                destination.complete();
                return;
            }
            args.push(result.value);
        }
        if (this.resultSelector) {
            this._tryresultSelector(args);
        }
        else {
            destination.next(args);
        }
        if (shouldComplete) {
            destination.complete();
        }
    };
    ZipSubscriber.prototype._tryresultSelector = function (args) {
        var result;
        try {
            result = this.resultSelector.apply(this, args);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return ZipSubscriber;
}(Subscriber));
var StaticIterator = /*@__PURE__*/ (function () {
    function StaticIterator(iterator$$1) {
        this.iterator = iterator$$1;
        this.nextResult = iterator$$1.next();
    }
    StaticIterator.prototype.hasValue = function () {
        return true;
    };
    StaticIterator.prototype.next = function () {
        var result = this.nextResult;
        this.nextResult = this.iterator.next();
        return result;
    };
    StaticIterator.prototype.hasCompleted = function () {
        var nextResult = this.nextResult;
        return Boolean(nextResult && nextResult.done);
    };
    return StaticIterator;
}());
var StaticArrayIterator = /*@__PURE__*/ (function () {
    function StaticArrayIterator(array) {
        this.array = array;
        this.index = 0;
        this.length = 0;
        this.length = array.length;
    }
    StaticArrayIterator.prototype[iterator] = function () {
        return this;
    };
    StaticArrayIterator.prototype.next = function (value) {
        var i = this.index++;
        var array = this.array;
        return i < this.length ? { value: array[i], done: false } : { value: null, done: true };
    };
    StaticArrayIterator.prototype.hasValue = function () {
        return this.array.length > this.index;
    };
    StaticArrayIterator.prototype.hasCompleted = function () {
        return this.array.length === this.index;
    };
    return StaticArrayIterator;
}());
var ZipBufferIterator = /*@__PURE__*/ (function (_super) {
    __extends(ZipBufferIterator, _super);
    function ZipBufferIterator(destination, parent, observable) {
        var _this = _super.call(this, destination) || this;
        _this.parent = parent;
        _this.observable = observable;
        _this.stillUnsubscribed = true;
        _this.buffer = [];
        _this.isComplete = false;
        return _this;
    }
    ZipBufferIterator.prototype[iterator] = function () {
        return this;
    };
    ZipBufferIterator.prototype.next = function () {
        var buffer = this.buffer;
        if (buffer.length === 0 && this.isComplete) {
            return { value: null, done: true };
        }
        else {
            return { value: buffer.shift(), done: false };
        }
    };
    ZipBufferIterator.prototype.hasValue = function () {
        return this.buffer.length > 0;
    };
    ZipBufferIterator.prototype.hasCompleted = function () {
        return this.buffer.length === 0 && this.isComplete;
    };
    ZipBufferIterator.prototype.notifyComplete = function () {
        if (this.buffer.length > 0) {
            this.isComplete = true;
            this.parent.notifyInactive();
        }
        else {
            this.destination.complete();
        }
    };
    ZipBufferIterator.prototype.notifyNext = function (innerValue) {
        this.buffer.push(innerValue);
        this.parent.checkIterators();
    };
    ZipBufferIterator.prototype.subscribe = function () {
        return innerSubscribe(this.observable, new SimpleInnerSubscriber(this));
    };
    return ZipBufferIterator;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START  PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var AuditSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(AuditSubscriber, _super);
    function AuditSubscriber(destination, durationSelector) {
        var _this = _super.call(this, destination) || this;
        _this.durationSelector = durationSelector;
        _this.hasValue = false;
        return _this;
    }
    AuditSubscriber.prototype._next = function (value) {
        this.value = value;
        this.hasValue = true;
        if (!this.throttled) {
            var duration = void 0;
            try {
                var durationSelector = this.durationSelector;
                duration = durationSelector(value);
            }
            catch (err) {
                return this.destination.error(err);
            }
            var innerSubscription = innerSubscribe(duration, new SimpleInnerSubscriber(this));
            if (!innerSubscription || innerSubscription.closed) {
                this.clearThrottle();
            }
            else {
                this.add(this.throttled = innerSubscription);
            }
        }
    };
    AuditSubscriber.prototype.clearThrottle = function () {
        var _a = this, value = _a.value, hasValue = _a.hasValue, throttled = _a.throttled;
        if (throttled) {
            this.remove(throttled);
            this.throttled = undefined;
            throttled.unsubscribe();
        }
        if (hasValue) {
            this.value = undefined;
            this.hasValue = false;
            this.destination.next(value);
        }
    };
    AuditSubscriber.prototype.notifyNext = function () {
        this.clearThrottle();
    };
    AuditSubscriber.prototype.notifyComplete = function () {
        this.clearThrottle();
    };
    return AuditSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START _scheduler_async,_audit,_observable_timer PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var BufferSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(BufferSubscriber, _super);
    function BufferSubscriber(destination, closingNotifier) {
        var _this = _super.call(this, destination) || this;
        _this.buffer = [];
        _this.add(innerSubscribe(closingNotifier, new SimpleInnerSubscriber(_this)));
        return _this;
    }
    BufferSubscriber.prototype._next = function (value) {
        this.buffer.push(value);
    };
    BufferSubscriber.prototype.notifyNext = function () {
        var buffer = this.buffer;
        this.buffer = [];
        this.destination.next(buffer);
    };
    return BufferSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var BufferCountSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(BufferCountSubscriber, _super);
    function BufferCountSubscriber(destination, bufferSize) {
        var _this = _super.call(this, destination) || this;
        _this.bufferSize = bufferSize;
        _this.buffer = [];
        return _this;
    }
    BufferCountSubscriber.prototype._next = function (value) {
        var buffer = this.buffer;
        buffer.push(value);
        if (buffer.length == this.bufferSize) {
            this.destination.next(buffer);
            this.buffer = [];
        }
    };
    BufferCountSubscriber.prototype._complete = function () {
        var buffer = this.buffer;
        if (buffer.length > 0) {
            this.destination.next(buffer);
        }
        _super.prototype._complete.call(this);
    };
    return BufferCountSubscriber;
}(Subscriber));
var BufferSkipCountSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(BufferSkipCountSubscriber, _super);
    function BufferSkipCountSubscriber(destination, bufferSize, startBufferEvery) {
        var _this = _super.call(this, destination) || this;
        _this.bufferSize = bufferSize;
        _this.startBufferEvery = startBufferEvery;
        _this.buffers = [];
        _this.count = 0;
        return _this;
    }
    BufferSkipCountSubscriber.prototype._next = function (value) {
        var _a = this, bufferSize = _a.bufferSize, startBufferEvery = _a.startBufferEvery, buffers = _a.buffers, count = _a.count;
        this.count++;
        if (count % startBufferEvery === 0) {
            buffers.push([]);
        }
        for (var i = buffers.length; i--;) {
            var buffer = buffers[i];
            buffer.push(value);
            if (buffer.length === bufferSize) {
                buffers.splice(i, 1);
                this.destination.next(buffer);
            }
        }
    };
    BufferSkipCountSubscriber.prototype._complete = function () {
        var _a = this, buffers = _a.buffers, destination = _a.destination;
        while (buffers.length > 0) {
            var buffer = buffers.shift();
            if (buffer.length > 0) {
                destination.next(buffer);
            }
        }
        _super.prototype._complete.call(this);
    };
    return BufferSkipCountSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_scheduler_async,_Subscriber,_util_isScheduler PURE_IMPORTS_END */

var Context = /*@__PURE__*/ (function () {
    function Context() {
        this.buffer = [];
    }
    return Context;
}());
var BufferTimeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(BufferTimeSubscriber, _super);
    function BufferTimeSubscriber(destination, bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.bufferTimeSpan = bufferTimeSpan;
        _this.bufferCreationInterval = bufferCreationInterval;
        _this.maxBufferSize = maxBufferSize;
        _this.scheduler = scheduler;
        _this.contexts = [];
        var context = _this.openContext();
        _this.timespanOnly = bufferCreationInterval == null || bufferCreationInterval < 0;
        if (_this.timespanOnly) {
            var timeSpanOnlyState = { subscriber: _this, context: context, bufferTimeSpan: bufferTimeSpan };
            _this.add(context.closeAction = scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
        }
        else {
            var closeState = { subscriber: _this, context: context };
            var creationState = { bufferTimeSpan: bufferTimeSpan, bufferCreationInterval: bufferCreationInterval, subscriber: _this, scheduler: scheduler };
            _this.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
            _this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
        }
        return _this;
    }
    BufferTimeSubscriber.prototype._next = function (value) {
        var contexts = this.contexts;
        var len = contexts.length;
        var filledBufferContext;
        for (var i = 0; i < len; i++) {
            var context_1 = contexts[i];
            var buffer = context_1.buffer;
            buffer.push(value);
            if (buffer.length == this.maxBufferSize) {
                filledBufferContext = context_1;
            }
        }
        if (filledBufferContext) {
            this.onBufferFull(filledBufferContext);
        }
    };
    BufferTimeSubscriber.prototype._error = function (err) {
        this.contexts.length = 0;
        _super.prototype._error.call(this, err);
    };
    BufferTimeSubscriber.prototype._complete = function () {
        var _a = this, contexts = _a.contexts, destination = _a.destination;
        while (contexts.length > 0) {
            var context_2 = contexts.shift();
            destination.next(context_2.buffer);
        }
        _super.prototype._complete.call(this);
    };
    BufferTimeSubscriber.prototype._unsubscribe = function () {
        this.contexts = null;
    };
    BufferTimeSubscriber.prototype.onBufferFull = function (context) {
        this.closeContext(context);
        var closeAction = context.closeAction;
        closeAction.unsubscribe();
        this.remove(closeAction);
        if (!this.closed && this.timespanOnly) {
            context = this.openContext();
            var bufferTimeSpan = this.bufferTimeSpan;
            var timeSpanOnlyState = { subscriber: this, context: context, bufferTimeSpan: bufferTimeSpan };
            this.add(context.closeAction = this.scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
        }
    };
    BufferTimeSubscriber.prototype.openContext = function () {
        var context = new Context();
        this.contexts.push(context);
        return context;
    };
    BufferTimeSubscriber.prototype.closeContext = function (context) {
        this.destination.next(context.buffer);
        var contexts = this.contexts;
        var spliceIndex = contexts ? contexts.indexOf(context) : -1;
        if (spliceIndex >= 0) {
            contexts.splice(contexts.indexOf(context), 1);
        }
    };
    return BufferTimeSubscriber;
}(Subscriber));
function dispatchBufferTimeSpanOnly(state) {
    var subscriber = state.subscriber;
    var prevContext = state.context;
    if (prevContext) {
        subscriber.closeContext(prevContext);
    }
    if (!subscriber.closed) {
        state.context = subscriber.openContext();
        state.context.closeAction = this.schedule(state, state.bufferTimeSpan);
    }
}
function dispatchBufferCreation(state) {
    var bufferCreationInterval = state.bufferCreationInterval, bufferTimeSpan = state.bufferTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler;
    var context = subscriber.openContext();
    var action = this;
    if (!subscriber.closed) {
        subscriber.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber: subscriber, context: context }));
        action.schedule(state, bufferCreationInterval);
    }
}
function dispatchBufferClose(arg) {
    var subscriber = arg.subscriber, context = arg.context;
    subscriber.closeContext(context);
}

/** PURE_IMPORTS_START tslib,_Subscription,_util_subscribeToResult,_OuterSubscriber PURE_IMPORTS_END */

var BufferToggleSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(BufferToggleSubscriber, _super);
    function BufferToggleSubscriber(destination, openings, closingSelector) {
        var _this = _super.call(this, destination) || this;
        _this.closingSelector = closingSelector;
        _this.contexts = [];
        _this.add(subscribeToResult(_this, openings));
        return _this;
    }
    BufferToggleSubscriber.prototype._next = function (value) {
        var contexts = this.contexts;
        var len = contexts.length;
        for (var i = 0; i < len; i++) {
            contexts[i].buffer.push(value);
        }
    };
    BufferToggleSubscriber.prototype._error = function (err) {
        var contexts = this.contexts;
        while (contexts.length > 0) {
            var context_1 = contexts.shift();
            context_1.subscription.unsubscribe();
            context_1.buffer = null;
            context_1.subscription = null;
        }
        this.contexts = null;
        _super.prototype._error.call(this, err);
    };
    BufferToggleSubscriber.prototype._complete = function () {
        var contexts = this.contexts;
        while (contexts.length > 0) {
            var context_2 = contexts.shift();
            this.destination.next(context_2.buffer);
            context_2.subscription.unsubscribe();
            context_2.buffer = null;
            context_2.subscription = null;
        }
        this.contexts = null;
        _super.prototype._complete.call(this);
    };
    BufferToggleSubscriber.prototype.notifyNext = function (outerValue, innerValue) {
        outerValue ? this.closeBuffer(outerValue) : this.openBuffer(innerValue);
    };
    BufferToggleSubscriber.prototype.notifyComplete = function (innerSub) {
        this.closeBuffer(innerSub.context);
    };
    BufferToggleSubscriber.prototype.openBuffer = function (value) {
        try {
            var closingSelector = this.closingSelector;
            var closingNotifier = closingSelector.call(this, value);
            if (closingNotifier) {
                this.trySubscribe(closingNotifier);
            }
        }
        catch (err) {
            this._error(err);
        }
    };
    BufferToggleSubscriber.prototype.closeBuffer = function (context) {
        var contexts = this.contexts;
        if (contexts && context) {
            var buffer = context.buffer, subscription = context.subscription;
            this.destination.next(buffer);
            contexts.splice(contexts.indexOf(context), 1);
            this.remove(subscription);
            subscription.unsubscribe();
        }
    };
    BufferToggleSubscriber.prototype.trySubscribe = function (closingNotifier) {
        var contexts = this.contexts;
        var buffer = [];
        var subscription = new Subscription();
        var context = { buffer: buffer, subscription: subscription };
        contexts.push(context);
        var innerSubscription = subscribeToResult(this, closingNotifier, context);
        if (!innerSubscription || innerSubscription.closed) {
            this.closeBuffer(context);
        }
        else {
            innerSubscription.context = context;
            this.add(innerSubscription);
            subscription.add(innerSubscription);
        }
    };
    return BufferToggleSubscriber;
}(OuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscription,_innerSubscribe PURE_IMPORTS_END */

var BufferWhenSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(BufferWhenSubscriber, _super);
    function BufferWhenSubscriber(destination, closingSelector) {
        var _this = _super.call(this, destination) || this;
        _this.closingSelector = closingSelector;
        _this.subscribing = false;
        _this.openBuffer();
        return _this;
    }
    BufferWhenSubscriber.prototype._next = function (value) {
        this.buffer.push(value);
    };
    BufferWhenSubscriber.prototype._complete = function () {
        var buffer = this.buffer;
        if (buffer) {
            this.destination.next(buffer);
        }
        _super.prototype._complete.call(this);
    };
    BufferWhenSubscriber.prototype._unsubscribe = function () {
        this.buffer = undefined;
        this.subscribing = false;
    };
    BufferWhenSubscriber.prototype.notifyNext = function () {
        this.openBuffer();
    };
    BufferWhenSubscriber.prototype.notifyComplete = function () {
        if (this.subscribing) {
            this.complete();
        }
        else {
            this.openBuffer();
        }
    };
    BufferWhenSubscriber.prototype.openBuffer = function () {
        var closingSubscription = this.closingSubscription;
        if (closingSubscription) {
            this.remove(closingSubscription);
            closingSubscription.unsubscribe();
        }
        var buffer = this.buffer;
        if (this.buffer) {
            this.destination.next(buffer);
        }
        this.buffer = [];
        var closingNotifier;
        try {
            var closingSelector = this.closingSelector;
            closingNotifier = closingSelector();
        }
        catch (err) {
            return this.error(err);
        }
        closingSubscription = new Subscription();
        this.closingSubscription = closingSubscription;
        this.add(closingSubscription);
        this.subscribing = true;
        closingSubscription.add(innerSubscribe(closingNotifier, new SimpleInnerSubscriber(this)));
        this.subscribing = false;
    };
    return BufferWhenSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var CatchSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(CatchSubscriber, _super);
    function CatchSubscriber(destination, selector, caught) {
        var _this = _super.call(this, destination) || this;
        _this.selector = selector;
        _this.caught = caught;
        return _this;
    }
    CatchSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var result = void 0;
            try {
                result = this.selector(err, this.caught);
            }
            catch (err2) {
                _super.prototype.error.call(this, err2);
                return;
            }
            this._unsubscribeAndRecycle();
            var innerSubscriber = new SimpleInnerSubscriber(this);
            this.add(innerSubscriber);
            var innerSubscription = innerSubscribe(result, innerSubscriber);
            if (innerSubscription !== innerSubscriber) {
                this.add(innerSubscription);
            }
        }
    };
    return CatchSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START _observable_combineLatest PURE_IMPORTS_END */

/** PURE_IMPORTS_START _util_isArray,_observable_combineLatest,_observable_from PURE_IMPORTS_END */

/** PURE_IMPORTS_START _observable_concat PURE_IMPORTS_END */

/** PURE_IMPORTS_START _mergeMap PURE_IMPORTS_END */

/** PURE_IMPORTS_START _concatMap PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var CountSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(CountSubscriber, _super);
    function CountSubscriber(destination, predicate, source) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.source = source;
        _this.count = 0;
        _this.index = 0;
        return _this;
    }
    CountSubscriber.prototype._next = function (value) {
        if (this.predicate) {
            this._tryPredicate(value);
        }
        else {
            this.count++;
        }
    };
    CountSubscriber.prototype._tryPredicate = function (value) {
        var result;
        try {
            result = this.predicate(value, this.index++, this.source);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        if (result) {
            this.count++;
        }
    };
    CountSubscriber.prototype._complete = function () {
        this.destination.next(this.count);
        this.destination.complete();
    };
    return CountSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var DebounceSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DebounceSubscriber, _super);
    function DebounceSubscriber(destination, durationSelector) {
        var _this = _super.call(this, destination) || this;
        _this.durationSelector = durationSelector;
        _this.hasValue = false;
        return _this;
    }
    DebounceSubscriber.prototype._next = function (value) {
        try {
            var result = this.durationSelector.call(this, value);
            if (result) {
                this._tryNext(value, result);
            }
        }
        catch (err) {
            this.destination.error(err);
        }
    };
    DebounceSubscriber.prototype._complete = function () {
        this.emitValue();
        this.destination.complete();
    };
    DebounceSubscriber.prototype._tryNext = function (value, duration) {
        var subscription = this.durationSubscription;
        this.value = value;
        this.hasValue = true;
        if (subscription) {
            subscription.unsubscribe();
            this.remove(subscription);
        }
        subscription = innerSubscribe(duration, new SimpleInnerSubscriber(this));
        if (subscription && !subscription.closed) {
            this.add(this.durationSubscription = subscription);
        }
    };
    DebounceSubscriber.prototype.notifyNext = function () {
        this.emitValue();
    };
    DebounceSubscriber.prototype.notifyComplete = function () {
        this.emitValue();
    };
    DebounceSubscriber.prototype.emitValue = function () {
        if (this.hasValue) {
            var value = this.value;
            var subscription = this.durationSubscription;
            if (subscription) {
                this.durationSubscription = undefined;
                subscription.unsubscribe();
                this.remove(subscription);
            }
            this.value = undefined;
            this.hasValue = false;
            _super.prototype._next.call(this, value);
        }
    };
    return DebounceSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async PURE_IMPORTS_END */

var DebounceTimeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DebounceTimeSubscriber, _super);
    function DebounceTimeSubscriber(destination, dueTime, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.dueTime = dueTime;
        _this.scheduler = scheduler;
        _this.debouncedSubscription = null;
        _this.lastValue = null;
        _this.hasValue = false;
        return _this;
    }
    DebounceTimeSubscriber.prototype._next = function (value) {
        this.clearDebounce();
        this.lastValue = value;
        this.hasValue = true;
        this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext$2, this.dueTime, this));
    };
    DebounceTimeSubscriber.prototype._complete = function () {
        this.debouncedNext();
        this.destination.complete();
    };
    DebounceTimeSubscriber.prototype.debouncedNext = function () {
        this.clearDebounce();
        if (this.hasValue) {
            var lastValue = this.lastValue;
            this.lastValue = null;
            this.hasValue = false;
            this.destination.next(lastValue);
        }
    };
    DebounceTimeSubscriber.prototype.clearDebounce = function () {
        var debouncedSubscription = this.debouncedSubscription;
        if (debouncedSubscription !== null) {
            this.remove(debouncedSubscription);
            debouncedSubscription.unsubscribe();
            this.debouncedSubscription = null;
        }
    };
    return DebounceTimeSubscriber;
}(Subscriber));
function dispatchNext$2(subscriber) {
    subscriber.debouncedNext();
}

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var DefaultIfEmptySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DefaultIfEmptySubscriber, _super);
    function DefaultIfEmptySubscriber(destination, defaultValue) {
        var _this = _super.call(this, destination) || this;
        _this.defaultValue = defaultValue;
        _this.isEmpty = true;
        return _this;
    }
    DefaultIfEmptySubscriber.prototype._next = function (value) {
        this.isEmpty = false;
        this.destination.next(value);
    };
    DefaultIfEmptySubscriber.prototype._complete = function () {
        if (this.isEmpty) {
            this.destination.next(this.defaultValue);
        }
        this.destination.complete();
    };
    return DefaultIfEmptySubscriber;
}(Subscriber));

/** PURE_IMPORTS_START  PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_scheduler_async,_util_isDate,_Subscriber,_Notification PURE_IMPORTS_END */

var DelaySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DelaySubscriber, _super);
    function DelaySubscriber(destination, delay, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.delay = delay;
        _this.scheduler = scheduler;
        _this.queue = [];
        _this.active = false;
        _this.errored = false;
        return _this;
    }
    DelaySubscriber.dispatch = function (state) {
        var source = state.source;
        var queue = source.queue;
        var scheduler = state.scheduler;
        var destination = state.destination;
        while (queue.length > 0 && (queue[0].time - scheduler.now()) <= 0) {
            queue.shift().notification.observe(destination);
        }
        if (queue.length > 0) {
            var delay_1 = Math.max(0, queue[0].time - scheduler.now());
            this.schedule(state, delay_1);
        }
        else {
            this.unsubscribe();
            source.active = false;
        }
    };
    DelaySubscriber.prototype._schedule = function (scheduler) {
        this.active = true;
        var destination = this.destination;
        destination.add(scheduler.schedule(DelaySubscriber.dispatch, this.delay, {
            source: this, destination: this.destination, scheduler: scheduler
        }));
    };
    DelaySubscriber.prototype.scheduleNotification = function (notification) {
        if (this.errored === true) {
            return;
        }
        var scheduler = this.scheduler;
        var message = new DelayMessage(scheduler.now() + this.delay, notification);
        this.queue.push(message);
        if (this.active === false) {
            this._schedule(scheduler);
        }
    };
    DelaySubscriber.prototype._next = function (value) {
        this.scheduleNotification(Notification.createNext(value));
    };
    DelaySubscriber.prototype._error = function (err) {
        this.errored = true;
        this.queue = [];
        this.destination.error(err);
        this.unsubscribe();
    };
    DelaySubscriber.prototype._complete = function () {
        this.scheduleNotification(Notification.createComplete());
        this.unsubscribe();
    };
    return DelaySubscriber;
}(Subscriber));
var DelayMessage = /*@__PURE__*/ (function () {
    function DelayMessage(time, notification) {
        this.time = time;
        this.notification = notification;
    }
    return DelayMessage;
}());

/** PURE_IMPORTS_START tslib,_Subscriber,_Observable,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */

var DelayWhenSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DelayWhenSubscriber, _super);
    function DelayWhenSubscriber(destination, delayDurationSelector) {
        var _this = _super.call(this, destination) || this;
        _this.delayDurationSelector = delayDurationSelector;
        _this.completed = false;
        _this.delayNotifierSubscriptions = [];
        _this.index = 0;
        return _this;
    }
    DelayWhenSubscriber.prototype.notifyNext = function (outerValue, _innerValue, _outerIndex, _innerIndex, innerSub) {
        this.destination.next(outerValue);
        this.removeSubscription(innerSub);
        this.tryComplete();
    };
    DelayWhenSubscriber.prototype.notifyError = function (error, innerSub) {
        this._error(error);
    };
    DelayWhenSubscriber.prototype.notifyComplete = function (innerSub) {
        var value = this.removeSubscription(innerSub);
        if (value) {
            this.destination.next(value);
        }
        this.tryComplete();
    };
    DelayWhenSubscriber.prototype._next = function (value) {
        var index = this.index++;
        try {
            var delayNotifier = this.delayDurationSelector(value, index);
            if (delayNotifier) {
                this.tryDelay(delayNotifier, value);
            }
        }
        catch (err) {
            this.destination.error(err);
        }
    };
    DelayWhenSubscriber.prototype._complete = function () {
        this.completed = true;
        this.tryComplete();
        this.unsubscribe();
    };
    DelayWhenSubscriber.prototype.removeSubscription = function (subscription) {
        subscription.unsubscribe();
        var subscriptionIdx = this.delayNotifierSubscriptions.indexOf(subscription);
        if (subscriptionIdx !== -1) {
            this.delayNotifierSubscriptions.splice(subscriptionIdx, 1);
        }
        return subscription.outerValue;
    };
    DelayWhenSubscriber.prototype.tryDelay = function (delayNotifier, value) {
        var notifierSubscription = subscribeToResult(this, delayNotifier, value);
        if (notifierSubscription && !notifierSubscription.closed) {
            var destination = this.destination;
            destination.add(notifierSubscription);
            this.delayNotifierSubscriptions.push(notifierSubscription);
        }
    };
    DelayWhenSubscriber.prototype.tryComplete = function () {
        if (this.completed && this.delayNotifierSubscriptions.length === 0) {
            this.destination.complete();
        }
    };
    return DelayWhenSubscriber;
}(OuterSubscriber));
var SubscriptionDelayObservable = /*@__PURE__*/ (function (_super) {
    __extends(SubscriptionDelayObservable, _super);
    function SubscriptionDelayObservable(source, subscriptionDelay) {
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.subscriptionDelay = subscriptionDelay;
        return _this;
    }
    SubscriptionDelayObservable.prototype._subscribe = function (subscriber) {
        this.subscriptionDelay.subscribe(new SubscriptionDelaySubscriber(subscriber, this.source));
    };
    return SubscriptionDelayObservable;
}(Observable));
var SubscriptionDelaySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SubscriptionDelaySubscriber, _super);
    function SubscriptionDelaySubscriber(parent, source) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.source = source;
        _this.sourceSubscribed = false;
        return _this;
    }
    SubscriptionDelaySubscriber.prototype._next = function (unused) {
        this.subscribeToSource();
    };
    SubscriptionDelaySubscriber.prototype._error = function (err) {
        this.unsubscribe();
        this.parent.error(err);
    };
    SubscriptionDelaySubscriber.prototype._complete = function () {
        this.unsubscribe();
        this.subscribeToSource();
    };
    SubscriptionDelaySubscriber.prototype.subscribeToSource = function () {
        if (!this.sourceSubscribed) {
            this.sourceSubscribed = true;
            this.unsubscribe();
            this.source.subscribe(this.parent);
        }
    };
    return SubscriptionDelaySubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var DeMaterializeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DeMaterializeSubscriber, _super);
    function DeMaterializeSubscriber(destination) {
        return _super.call(this, destination) || this;
    }
    DeMaterializeSubscriber.prototype._next = function (value) {
        value.observe(this.destination);
    };
    return DeMaterializeSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var DistinctSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DistinctSubscriber, _super);
    function DistinctSubscriber(destination, keySelector, flushes) {
        var _this = _super.call(this, destination) || this;
        _this.keySelector = keySelector;
        _this.values = new Set();
        if (flushes) {
            _this.add(innerSubscribe(flushes, new SimpleInnerSubscriber(_this)));
        }
        return _this;
    }
    DistinctSubscriber.prototype.notifyNext = function () {
        this.values.clear();
    };
    DistinctSubscriber.prototype.notifyError = function (error) {
        this._error(error);
    };
    DistinctSubscriber.prototype._next = function (value) {
        if (this.keySelector) {
            this._useKeySelector(value);
        }
        else {
            this._finalizeNext(value, value);
        }
    };
    DistinctSubscriber.prototype._useKeySelector = function (value) {
        var key;
        var destination = this.destination;
        try {
            key = this.keySelector(value);
        }
        catch (err) {
            destination.error(err);
            return;
        }
        this._finalizeNext(key, value);
    };
    DistinctSubscriber.prototype._finalizeNext = function (key, value) {
        var values = this.values;
        if (!values.has(key)) {
            values.add(key);
            this.destination.next(value);
        }
    };
    return DistinctSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var DistinctUntilChangedSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(DistinctUntilChangedSubscriber, _super);
    function DistinctUntilChangedSubscriber(destination, compare, keySelector) {
        var _this = _super.call(this, destination) || this;
        _this.keySelector = keySelector;
        _this.hasKey = false;
        if (typeof compare === 'function') {
            _this.compare = compare;
        }
        return _this;
    }
    DistinctUntilChangedSubscriber.prototype.compare = function (x, y) {
        return x === y;
    };
    DistinctUntilChangedSubscriber.prototype._next = function (value) {
        var key;
        try {
            var keySelector = this.keySelector;
            key = keySelector ? keySelector(value) : value;
        }
        catch (err) {
            return this.destination.error(err);
        }
        var result = false;
        if (this.hasKey) {
            try {
                var compare = this.compare;
                result = compare(this.key, key);
            }
            catch (err) {
                return this.destination.error(err);
            }
        }
        else {
            this.hasKey = true;
        }
        if (!result) {
            this.key = key;
            this.destination.next(value);
        }
    };
    return DistinctUntilChangedSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _distinctUntilChanged PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_util_EmptyError,_Subscriber PURE_IMPORTS_END */

var ThrowIfEmptySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ThrowIfEmptySubscriber, _super);
    function ThrowIfEmptySubscriber(destination, errorFactory) {
        var _this = _super.call(this, destination) || this;
        _this.errorFactory = errorFactory;
        _this.hasValue = false;
        return _this;
    }
    ThrowIfEmptySubscriber.prototype._next = function (value) {
        this.hasValue = true;
        this.destination.next(value);
    };
    ThrowIfEmptySubscriber.prototype._complete = function () {
        if (!this.hasValue) {
            var err = void 0;
            try {
                err = this.errorFactory();
            }
            catch (e) {
                err = e;
            }
            this.destination.error(err);
        }
        else {
            return this.destination.complete();
        }
    };
    return ThrowIfEmptySubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError,_observable_empty PURE_IMPORTS_END */

var TakeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(TakeSubscriber, _super);
    function TakeSubscriber(destination, total) {
        var _this = _super.call(this, destination) || this;
        _this.total = total;
        _this.count = 0;
        return _this;
    }
    TakeSubscriber.prototype._next = function (value) {
        var total = this.total;
        var count = ++this.count;
        if (count <= total) {
            this.destination.next(value);
            if (count === total) {
                this.destination.complete();
                this.unsubscribe();
            }
        }
    };
    return TakeSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _util_ArgumentOutOfRangeError,_filter,_throwIfEmpty,_defaultIfEmpty,_take PURE_IMPORTS_END */

/** PURE_IMPORTS_START _observable_concat,_observable_of PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var EverySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(EverySubscriber, _super);
    function EverySubscriber(destination, predicate, thisArg, source) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.thisArg = thisArg;
        _this.source = source;
        _this.index = 0;
        _this.thisArg = thisArg || _this;
        return _this;
    }
    EverySubscriber.prototype.notifyComplete = function (everyValueMatch) {
        this.destination.next(everyValueMatch);
        this.destination.complete();
    };
    EverySubscriber.prototype._next = function (value) {
        var result = false;
        try {
            result = this.predicate.call(this.thisArg, value, this.index++, this.source);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        if (!result) {
            this.notifyComplete(false);
        }
    };
    EverySubscriber.prototype._complete = function () {
        this.notifyComplete(true);
    };
    return EverySubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var SwitchFirstSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SwitchFirstSubscriber, _super);
    function SwitchFirstSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.hasCompleted = false;
        _this.hasSubscription = false;
        return _this;
    }
    SwitchFirstSubscriber.prototype._next = function (value) {
        if (!this.hasSubscription) {
            this.hasSubscription = true;
            this.add(innerSubscribe(value, new SimpleInnerSubscriber(this)));
        }
    };
    SwitchFirstSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (!this.hasSubscription) {
            this.destination.complete();
        }
    };
    SwitchFirstSubscriber.prototype.notifyComplete = function () {
        this.hasSubscription = false;
        if (this.hasCompleted) {
            this.destination.complete();
        }
    };
    return SwitchFirstSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */

var ExhaustMapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ExhaustMapSubscriber, _super);
    function ExhaustMapSubscriber(destination, project) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.hasSubscription = false;
        _this.hasCompleted = false;
        _this.index = 0;
        return _this;
    }
    ExhaustMapSubscriber.prototype._next = function (value) {
        if (!this.hasSubscription) {
            this.tryNext(value);
        }
    };
    ExhaustMapSubscriber.prototype.tryNext = function (value) {
        var result;
        var index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.hasSubscription = true;
        this._innerSub(result);
    };
    ExhaustMapSubscriber.prototype._innerSub = function (result) {
        var innerSubscriber = new SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        var innerSubscription = innerSubscribe(result, innerSubscriber);
        if (innerSubscription !== innerSubscriber) {
            destination.add(innerSubscription);
        }
    };
    ExhaustMapSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (!this.hasSubscription) {
            this.destination.complete();
        }
        this.unsubscribe();
    };
    ExhaustMapSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    ExhaustMapSubscriber.prototype.notifyError = function (err) {
        this.destination.error(err);
    };
    ExhaustMapSubscriber.prototype.notifyComplete = function () {
        this.hasSubscription = false;
        if (this.hasCompleted) {
            this.destination.complete();
        }
    };
    return ExhaustMapSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var ExpandSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ExpandSubscriber, _super);
    function ExpandSubscriber(destination, project, concurrent, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.concurrent = concurrent;
        _this.scheduler = scheduler;
        _this.index = 0;
        _this.active = 0;
        _this.hasCompleted = false;
        if (concurrent < Number.POSITIVE_INFINITY) {
            _this.buffer = [];
        }
        return _this;
    }
    ExpandSubscriber.dispatch = function (arg) {
        var subscriber = arg.subscriber, result = arg.result, value = arg.value, index = arg.index;
        subscriber.subscribeToProjection(result, value, index);
    };
    ExpandSubscriber.prototype._next = function (value) {
        var destination = this.destination;
        if (destination.closed) {
            this._complete();
            return;
        }
        var index = this.index++;
        if (this.active < this.concurrent) {
            destination.next(value);
            try {
                var project = this.project;
                var result = project(value, index);
                if (!this.scheduler) {
                    this.subscribeToProjection(result, value, index);
                }
                else {
                    var state = { subscriber: this, result: result, value: value, index: index };
                    var destination_1 = this.destination;
                    destination_1.add(this.scheduler.schedule(ExpandSubscriber.dispatch, 0, state));
                }
            }
            catch (e) {
                destination.error(e);
            }
        }
        else {
            this.buffer.push(value);
        }
    };
    ExpandSubscriber.prototype.subscribeToProjection = function (result, value, index) {
        this.active++;
        var destination = this.destination;
        destination.add(innerSubscribe(result, new SimpleInnerSubscriber(this)));
    };
    ExpandSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.hasCompleted && this.active === 0) {
            this.destination.complete();
        }
        this.unsubscribe();
    };
    ExpandSubscriber.prototype.notifyNext = function (innerValue) {
        this._next(innerValue);
    };
    ExpandSubscriber.prototype.notifyComplete = function () {
        var buffer = this.buffer;
        this.active--;
        if (buffer && buffer.length > 0) {
            this._next(buffer.shift());
        }
        if (this.hasCompleted && this.active === 0) {
            this.destination.complete();
        }
    };
    return ExpandSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_Subscription PURE_IMPORTS_END */

var FinallySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(FinallySubscriber, _super);
    function FinallySubscriber(destination, callback) {
        var _this = _super.call(this, destination) || this;
        _this.add(new Subscription(callback));
        return _this;
    }
    return FinallySubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var FindValueSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(FindValueSubscriber, _super);
    function FindValueSubscriber(destination, predicate, source, yieldIndex, thisArg) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.source = source;
        _this.yieldIndex = yieldIndex;
        _this.thisArg = thisArg;
        _this.index = 0;
        return _this;
    }
    FindValueSubscriber.prototype.notifyComplete = function (value) {
        var destination = this.destination;
        destination.next(value);
        destination.complete();
        this.unsubscribe();
    };
    FindValueSubscriber.prototype._next = function (value) {
        var _a = this, predicate = _a.predicate, thisArg = _a.thisArg;
        var index = this.index++;
        try {
            var result = predicate.call(thisArg || this, value, index, this.source);
            if (result) {
                this.notifyComplete(this.yieldIndex ? index : value);
            }
        }
        catch (err) {
            this.destination.error(err);
        }
    };
    FindValueSubscriber.prototype._complete = function () {
        this.notifyComplete(this.yieldIndex ? -1 : undefined);
    };
    return FindValueSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _operators_find PURE_IMPORTS_END */

/** PURE_IMPORTS_START _util_EmptyError,_filter,_take,_defaultIfEmpty,_throwIfEmpty,_util_identity PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var IgnoreElementsSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(IgnoreElementsSubscriber, _super);
    function IgnoreElementsSubscriber() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IgnoreElementsSubscriber.prototype._next = function (unused) {
    };
    return IgnoreElementsSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var IsEmptySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(IsEmptySubscriber, _super);
    function IsEmptySubscriber(destination) {
        return _super.call(this, destination) || this;
    }
    IsEmptySubscriber.prototype.notifyComplete = function (isEmpty) {
        var destination = this.destination;
        destination.next(isEmpty);
        destination.complete();
    };
    IsEmptySubscriber.prototype._next = function (value) {
        this.notifyComplete(false);
    };
    IsEmptySubscriber.prototype._complete = function () {
        this.notifyComplete(true);
    };
    return IsEmptySubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError,_observable_empty PURE_IMPORTS_END */

var TakeLastSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(TakeLastSubscriber, _super);
    function TakeLastSubscriber(destination, total) {
        var _this = _super.call(this, destination) || this;
        _this.total = total;
        _this.ring = new Array();
        _this.count = 0;
        return _this;
    }
    TakeLastSubscriber.prototype._next = function (value) {
        var ring = this.ring;
        var total = this.total;
        var count = this.count++;
        if (ring.length < total) {
            ring.push(value);
        }
        else {
            var index = count % total;
            ring[index] = value;
        }
    };
    TakeLastSubscriber.prototype._complete = function () {
        var destination = this.destination;
        var count = this.count;
        if (count > 0) {
            var total = this.count >= this.total ? this.total : this.count;
            var ring = this.ring;
            for (var i = 0; i < total; i++) {
                var idx = (count++) % total;
                destination.next(ring[idx]);
            }
        }
        destination.complete();
    };
    return TakeLastSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _util_EmptyError,_filter,_takeLast,_throwIfEmpty,_defaultIfEmpty,_util_identity PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var MapToSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(MapToSubscriber, _super);
    function MapToSubscriber(destination, value) {
        var _this = _super.call(this, destination) || this;
        _this.value = value;
        return _this;
    }
    MapToSubscriber.prototype._next = function (x) {
        this.destination.next(this.value);
    };
    return MapToSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_Notification PURE_IMPORTS_END */

var MaterializeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(MaterializeSubscriber, _super);
    function MaterializeSubscriber(destination) {
        return _super.call(this, destination) || this;
    }
    MaterializeSubscriber.prototype._next = function (value) {
        this.destination.next(Notification.createNext(value));
    };
    MaterializeSubscriber.prototype._error = function (err) {
        var destination = this.destination;
        destination.next(Notification.createError(err));
        destination.complete();
    };
    MaterializeSubscriber.prototype._complete = function () {
        var destination = this.destination;
        destination.next(Notification.createComplete());
        destination.complete();
    };
    return MaterializeSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var ScanSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ScanSubscriber, _super);
    function ScanSubscriber(destination, accumulator, _seed, hasSeed) {
        var _this = _super.call(this, destination) || this;
        _this.accumulator = accumulator;
        _this._seed = _seed;
        _this.hasSeed = hasSeed;
        _this.index = 0;
        return _this;
    }
    Object.defineProperty(ScanSubscriber.prototype, "seed", {
        get: function () {
            return this._seed;
        },
        set: function (value) {
            this.hasSeed = true;
            this._seed = value;
        },
        enumerable: true,
        configurable: true
    });
    ScanSubscriber.prototype._next = function (value) {
        if (!this.hasSeed) {
            this.seed = value;
            this.destination.next(value);
        }
        else {
            return this._tryNext(value);
        }
    };
    ScanSubscriber.prototype._tryNext = function (value) {
        var index = this.index++;
        var result;
        try {
            result = this.accumulator(this.seed, value, index);
        }
        catch (err) {
            this.destination.error(err);
        }
        this.seed = result;
        this.destination.next(result);
    };
    return ScanSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _scan,_takeLast,_defaultIfEmpty,_util_pipe PURE_IMPORTS_END */

/** PURE_IMPORTS_START _reduce PURE_IMPORTS_END */

/** PURE_IMPORTS_START _observable_merge PURE_IMPORTS_END */

/** PURE_IMPORTS_START _mergeMap PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var MergeScanSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(MergeScanSubscriber, _super);
    function MergeScanSubscriber(destination, accumulator, acc, concurrent) {
        var _this = _super.call(this, destination) || this;
        _this.accumulator = accumulator;
        _this.acc = acc;
        _this.concurrent = concurrent;
        _this.hasValue = false;
        _this.hasCompleted = false;
        _this.buffer = [];
        _this.active = 0;
        _this.index = 0;
        return _this;
    }
    MergeScanSubscriber.prototype._next = function (value) {
        if (this.active < this.concurrent) {
            var index = this.index++;
            var destination = this.destination;
            var ish = void 0;
            try {
                var accumulator = this.accumulator;
                ish = accumulator(this.acc, value, index);
            }
            catch (e) {
                return destination.error(e);
            }
            this.active++;
            this._innerSub(ish);
        }
        else {
            this.buffer.push(value);
        }
    };
    MergeScanSubscriber.prototype._innerSub = function (ish) {
        var innerSubscriber = new SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        var innerSubscription = innerSubscribe(ish, innerSubscriber);
        if (innerSubscription !== innerSubscriber) {
            destination.add(innerSubscription);
        }
    };
    MergeScanSubscriber.prototype._complete = function () {
        this.hasCompleted = true;
        if (this.active === 0 && this.buffer.length === 0) {
            if (this.hasValue === false) {
                this.destination.next(this.acc);
            }
            this.destination.complete();
        }
        this.unsubscribe();
    };
    MergeScanSubscriber.prototype.notifyNext = function (innerValue) {
        var destination = this.destination;
        this.acc = innerValue;
        this.hasValue = true;
        destination.next(innerValue);
    };
    MergeScanSubscriber.prototype.notifyComplete = function () {
        var buffer = this.buffer;
        this.active--;
        if (buffer.length > 0) {
            this._next(buffer.shift());
        }
        else if (this.active === 0 && this.hasCompleted) {
            if (this.hasValue === false) {
                this.destination.next(this.acc);
            }
            this.destination.complete();
        }
    };
    return MergeScanSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START _reduce PURE_IMPORTS_END */

/** PURE_IMPORTS_START _observable_ConnectableObservable PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_observable_from,_util_isArray,_innerSubscribe PURE_IMPORTS_END */


var OnErrorResumeNextSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(OnErrorResumeNextSubscriber, _super);
    function OnErrorResumeNextSubscriber(destination, nextSources) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        _this.nextSources = nextSources;
        return _this;
    }
    OnErrorResumeNextSubscriber.prototype.notifyError = function () {
        this.subscribeToNextSource();
    };
    OnErrorResumeNextSubscriber.prototype.notifyComplete = function () {
        this.subscribeToNextSource();
    };
    OnErrorResumeNextSubscriber.prototype._error = function (err) {
        this.subscribeToNextSource();
        this.unsubscribe();
    };
    OnErrorResumeNextSubscriber.prototype._complete = function () {
        this.subscribeToNextSource();
        this.unsubscribe();
    };
    OnErrorResumeNextSubscriber.prototype.subscribeToNextSource = function () {
        var next = this.nextSources.shift();
        if (!!next) {
            var innerSubscriber = new SimpleInnerSubscriber(this);
            var destination = this.destination;
            destination.add(innerSubscriber);
            var innerSubscription = innerSubscribe(next, innerSubscriber);
            if (innerSubscription !== innerSubscriber) {
                destination.add(innerSubscription);
            }
        }
        else {
            this.destination.complete();
        }
    };
    return OnErrorResumeNextSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var PairwiseSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(PairwiseSubscriber, _super);
    function PairwiseSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.hasPrev = false;
        return _this;
    }
    PairwiseSubscriber.prototype._next = function (value) {
        var pair;
        if (this.hasPrev) {
            pair = [this.prev, value];
        }
        else {
            this.hasPrev = true;
        }
        this.prev = value;
        if (pair) {
            this.destination.next(pair);
        }
    };
    return PairwiseSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _util_not,_filter PURE_IMPORTS_END */

/** PURE_IMPORTS_START _map PURE_IMPORTS_END */

/** PURE_IMPORTS_START _Subject,_multicast PURE_IMPORTS_END */

/** PURE_IMPORTS_START _BehaviorSubject,_multicast PURE_IMPORTS_END */

/** PURE_IMPORTS_START _AsyncSubject,_multicast PURE_IMPORTS_END */

/** PURE_IMPORTS_START _ReplaySubject,_multicast PURE_IMPORTS_END */

/** PURE_IMPORTS_START _util_isArray,_observable_race PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Subscriber,_observable_empty PURE_IMPORTS_END */

var RepeatSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(RepeatSubscriber, _super);
    function RepeatSubscriber(destination, count, source) {
        var _this = _super.call(this, destination) || this;
        _this.count = count;
        _this.source = source;
        return _this;
    }
    RepeatSubscriber.prototype.complete = function () {
        if (!this.isStopped) {
            var _a = this, source = _a.source, count = _a.count;
            if (count === 0) {
                return _super.prototype.complete.call(this);
            }
            else if (count > -1) {
                this.count = count - 1;
            }
            source.subscribe(this._unsubscribeAndRecycle());
        }
    };
    return RepeatSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subject,_innerSubscribe PURE_IMPORTS_END */

var RepeatWhenSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(RepeatWhenSubscriber, _super);
    function RepeatWhenSubscriber(destination, notifier, source) {
        var _this = _super.call(this, destination) || this;
        _this.notifier = notifier;
        _this.source = source;
        _this.sourceIsBeingSubscribedTo = true;
        return _this;
    }
    RepeatWhenSubscriber.prototype.notifyNext = function () {
        this.sourceIsBeingSubscribedTo = true;
        this.source.subscribe(this);
    };
    RepeatWhenSubscriber.prototype.notifyComplete = function () {
        if (this.sourceIsBeingSubscribedTo === false) {
            return _super.prototype.complete.call(this);
        }
    };
    RepeatWhenSubscriber.prototype.complete = function () {
        this.sourceIsBeingSubscribedTo = false;
        if (!this.isStopped) {
            if (!this.retries) {
                this.subscribeToRetries();
            }
            if (!this.retriesSubscription || this.retriesSubscription.closed) {
                return _super.prototype.complete.call(this);
            }
            this._unsubscribeAndRecycle();
            this.notifications.next(undefined);
        }
    };
    RepeatWhenSubscriber.prototype._unsubscribe = function () {
        var _a = this, notifications = _a.notifications, retriesSubscription = _a.retriesSubscription;
        if (notifications) {
            notifications.unsubscribe();
            this.notifications = undefined;
        }
        if (retriesSubscription) {
            retriesSubscription.unsubscribe();
            this.retriesSubscription = undefined;
        }
        this.retries = undefined;
    };
    RepeatWhenSubscriber.prototype._unsubscribeAndRecycle = function () {
        var _unsubscribe = this._unsubscribe;
        this._unsubscribe = null;
        _super.prototype._unsubscribeAndRecycle.call(this);
        this._unsubscribe = _unsubscribe;
        return this;
    };
    RepeatWhenSubscriber.prototype.subscribeToRetries = function () {
        this.notifications = new Subject();
        var retries;
        try {
            var notifier = this.notifier;
            retries = notifier(this.notifications);
        }
        catch (e) {
            return _super.prototype.complete.call(this);
        }
        this.retries = retries;
        this.retriesSubscription = innerSubscribe(retries, new SimpleInnerSubscriber(this));
    };
    return RepeatWhenSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var RetrySubscriber = /*@__PURE__*/ (function (_super) {
    __extends(RetrySubscriber, _super);
    function RetrySubscriber(destination, count, source) {
        var _this = _super.call(this, destination) || this;
        _this.count = count;
        _this.source = source;
        return _this;
    }
    RetrySubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _a = this, source = _a.source, count = _a.count;
            if (count === 0) {
                return _super.prototype.error.call(this, err);
            }
            else if (count > -1) {
                this.count = count - 1;
            }
            source.subscribe(this._unsubscribeAndRecycle());
        }
    };
    return RetrySubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subject,_innerSubscribe PURE_IMPORTS_END */

var RetryWhenSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(RetryWhenSubscriber, _super);
    function RetryWhenSubscriber(destination, notifier, source) {
        var _this = _super.call(this, destination) || this;
        _this.notifier = notifier;
        _this.source = source;
        return _this;
    }
    RetryWhenSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var errors = this.errors;
            var retries = this.retries;
            var retriesSubscription = this.retriesSubscription;
            if (!retries) {
                errors = new Subject();
                try {
                    var notifier = this.notifier;
                    retries = notifier(errors);
                }
                catch (e) {
                    return _super.prototype.error.call(this, e);
                }
                retriesSubscription = innerSubscribe(retries, new SimpleInnerSubscriber(this));
            }
            else {
                this.errors = undefined;
                this.retriesSubscription = undefined;
            }
            this._unsubscribeAndRecycle();
            this.errors = errors;
            this.retries = retries;
            this.retriesSubscription = retriesSubscription;
            errors.next(err);
        }
    };
    RetryWhenSubscriber.prototype._unsubscribe = function () {
        var _a = this, errors = _a.errors, retriesSubscription = _a.retriesSubscription;
        if (errors) {
            errors.unsubscribe();
            this.errors = undefined;
        }
        if (retriesSubscription) {
            retriesSubscription.unsubscribe();
            this.retriesSubscription = undefined;
        }
        this.retries = undefined;
    };
    RetryWhenSubscriber.prototype.notifyNext = function () {
        var _unsubscribe = this._unsubscribe;
        this._unsubscribe = null;
        this._unsubscribeAndRecycle();
        this._unsubscribe = _unsubscribe;
        this.source.subscribe(this);
    };
    return RetryWhenSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var SampleSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SampleSubscriber, _super);
    function SampleSubscriber() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hasValue = false;
        return _this;
    }
    SampleSubscriber.prototype._next = function (value) {
        this.value = value;
        this.hasValue = true;
    };
    SampleSubscriber.prototype.notifyNext = function () {
        this.emitValue();
    };
    SampleSubscriber.prototype.notifyComplete = function () {
        this.emitValue();
    };
    SampleSubscriber.prototype.emitValue = function () {
        if (this.hasValue) {
            this.hasValue = false;
            this.destination.next(this.value);
        }
    };
    return SampleSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async PURE_IMPORTS_END */

var SampleTimeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SampleTimeSubscriber, _super);
    function SampleTimeSubscriber(destination, period, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.period = period;
        _this.scheduler = scheduler;
        _this.hasValue = false;
        _this.add(scheduler.schedule(dispatchNotification, period, { subscriber: _this, period: period }));
        return _this;
    }
    SampleTimeSubscriber.prototype._next = function (value) {
        this.lastValue = value;
        this.hasValue = true;
    };
    SampleTimeSubscriber.prototype.notifyNext = function () {
        if (this.hasValue) {
            this.hasValue = false;
            this.destination.next(this.lastValue);
        }
    };
    return SampleTimeSubscriber;
}(Subscriber));
function dispatchNotification(state) {
    var subscriber = state.subscriber, period = state.period;
    subscriber.notifyNext();
    this.schedule(state, period);
}

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var SequenceEqualSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SequenceEqualSubscriber, _super);
    function SequenceEqualSubscriber(destination, compareTo, comparator) {
        var _this = _super.call(this, destination) || this;
        _this.compareTo = compareTo;
        _this.comparator = comparator;
        _this._a = [];
        _this._b = [];
        _this._oneComplete = false;
        _this.destination.add(compareTo.subscribe(new SequenceEqualCompareToSubscriber(destination, _this)));
        return _this;
    }
    SequenceEqualSubscriber.prototype._next = function (value) {
        if (this._oneComplete && this._b.length === 0) {
            this.emit(false);
        }
        else {
            this._a.push(value);
            this.checkValues();
        }
    };
    SequenceEqualSubscriber.prototype._complete = function () {
        if (this._oneComplete) {
            this.emit(this._a.length === 0 && this._b.length === 0);
        }
        else {
            this._oneComplete = true;
        }
        this.unsubscribe();
    };
    SequenceEqualSubscriber.prototype.checkValues = function () {
        var _c = this, _a = _c._a, _b = _c._b, comparator = _c.comparator;
        while (_a.length > 0 && _b.length > 0) {
            var a = _a.shift();
            var b = _b.shift();
            var areEqual = false;
            try {
                areEqual = comparator ? comparator(a, b) : a === b;
            }
            catch (e) {
                this.destination.error(e);
            }
            if (!areEqual) {
                this.emit(false);
            }
        }
    };
    SequenceEqualSubscriber.prototype.emit = function (value) {
        var destination = this.destination;
        destination.next(value);
        destination.complete();
    };
    SequenceEqualSubscriber.prototype.nextB = function (value) {
        if (this._oneComplete && this._a.length === 0) {
            this.emit(false);
        }
        else {
            this._b.push(value);
            this.checkValues();
        }
    };
    SequenceEqualSubscriber.prototype.completeB = function () {
        if (this._oneComplete) {
            this.emit(this._a.length === 0 && this._b.length === 0);
        }
        else {
            this._oneComplete = true;
        }
    };
    return SequenceEqualSubscriber;
}(Subscriber));
var SequenceEqualCompareToSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SequenceEqualCompareToSubscriber, _super);
    function SequenceEqualCompareToSubscriber(destination, parent) {
        var _this = _super.call(this, destination) || this;
        _this.parent = parent;
        return _this;
    }
    SequenceEqualCompareToSubscriber.prototype._next = function (value) {
        this.parent.nextB(value);
    };
    SequenceEqualCompareToSubscriber.prototype._error = function (err) {
        this.parent.error(err);
        this.unsubscribe();
    };
    SequenceEqualCompareToSubscriber.prototype._complete = function () {
        this.parent.completeB();
        this.unsubscribe();
    };
    return SequenceEqualCompareToSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _multicast,_refCount,_Subject PURE_IMPORTS_END */

/** PURE_IMPORTS_START _ReplaySubject PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Subscriber,_util_EmptyError PURE_IMPORTS_END */

var SingleSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SingleSubscriber, _super);
    function SingleSubscriber(destination, predicate, source) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.source = source;
        _this.seenValue = false;
        _this.index = 0;
        return _this;
    }
    SingleSubscriber.prototype.applySingleValue = function (value) {
        if (this.seenValue) {
            this.destination.error('Sequence contains more than one element');
        }
        else {
            this.seenValue = true;
            this.singleValue = value;
        }
    };
    SingleSubscriber.prototype._next = function (value) {
        var index = this.index++;
        if (this.predicate) {
            this.tryNext(value, index);
        }
        else {
            this.applySingleValue(value);
        }
    };
    SingleSubscriber.prototype.tryNext = function (value, index) {
        try {
            if (this.predicate(value, index, this.source)) {
                this.applySingleValue(value);
            }
        }
        catch (err) {
            this.destination.error(err);
        }
    };
    SingleSubscriber.prototype._complete = function () {
        var destination = this.destination;
        if (this.index > 0) {
            destination.next(this.seenValue ? this.singleValue : undefined);
            destination.complete();
        }
        else {
            destination.error(new EmptyError);
        }
    };
    return SingleSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var SkipSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SkipSubscriber, _super);
    function SkipSubscriber(destination, total) {
        var _this = _super.call(this, destination) || this;
        _this.total = total;
        _this.count = 0;
        return _this;
    }
    SkipSubscriber.prototype._next = function (x) {
        if (++this.count > this.total) {
            this.destination.next(x);
        }
    };
    return SkipSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError PURE_IMPORTS_END */

var SkipLastSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SkipLastSubscriber, _super);
    function SkipLastSubscriber(destination, _skipCount) {
        var _this = _super.call(this, destination) || this;
        _this._skipCount = _skipCount;
        _this._count = 0;
        _this._ring = new Array(_skipCount);
        return _this;
    }
    SkipLastSubscriber.prototype._next = function (value) {
        var skipCount = this._skipCount;
        var count = this._count++;
        if (count < skipCount) {
            this._ring[count] = value;
        }
        else {
            var currentIndex = count % skipCount;
            var ring = this._ring;
            var oldValue = ring[currentIndex];
            ring[currentIndex] = value;
            this.destination.next(oldValue);
        }
    };
    return SkipLastSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var SkipUntilSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SkipUntilSubscriber, _super);
    function SkipUntilSubscriber(destination, notifier) {
        var _this = _super.call(this, destination) || this;
        _this.hasValue = false;
        var innerSubscriber = new SimpleInnerSubscriber(_this);
        _this.add(innerSubscriber);
        _this.innerSubscription = innerSubscriber;
        var innerSubscription = innerSubscribe(notifier, innerSubscriber);
        if (innerSubscription !== innerSubscriber) {
            _this.add(innerSubscription);
            _this.innerSubscription = innerSubscription;
        }
        return _this;
    }
    SkipUntilSubscriber.prototype._next = function (value) {
        if (this.hasValue) {
            _super.prototype._next.call(this, value);
        }
    };
    SkipUntilSubscriber.prototype.notifyNext = function () {
        this.hasValue = true;
        if (this.innerSubscription) {
            this.innerSubscription.unsubscribe();
        }
    };
    SkipUntilSubscriber.prototype.notifyComplete = function () {
    };
    return SkipUntilSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var SkipWhileSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SkipWhileSubscriber, _super);
    function SkipWhileSubscriber(destination, predicate) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.skipping = true;
        _this.index = 0;
        return _this;
    }
    SkipWhileSubscriber.prototype._next = function (value) {
        var destination = this.destination;
        if (this.skipping) {
            this.tryCallPredicate(value);
        }
        if (!this.skipping) {
            destination.next(value);
        }
    };
    SkipWhileSubscriber.prototype.tryCallPredicate = function (value) {
        try {
            var result = this.predicate(value, this.index++);
            this.skipping = Boolean(result);
        }
        catch (err) {
            this.destination.error(err);
        }
    };
    return SkipWhileSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _observable_concat,_util_isScheduler PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Observable,_scheduler_asap,_util_isNumeric PURE_IMPORTS_END */
var SubscribeOnObservable = /*@__PURE__*/ (function (_super) {
    __extends(SubscribeOnObservable, _super);
    function SubscribeOnObservable(source, delayTime, scheduler) {
        if (delayTime === void 0) {
            delayTime = 0;
        }
        if (scheduler === void 0) {
            scheduler = asap$2;
        }
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.delayTime = delayTime;
        _this.scheduler = scheduler;
        if (!isNumeric(delayTime) || delayTime < 0) {
            _this.delayTime = 0;
        }
        if (!scheduler || typeof scheduler.schedule !== 'function') {
            _this.scheduler = asap$2;
        }
        return _this;
    }
    SubscribeOnObservable.create = function (source, delay, scheduler) {
        if (delay === void 0) {
            delay = 0;
        }
        if (scheduler === void 0) {
            scheduler = asap$2;
        }
        return new SubscribeOnObservable(source, delay, scheduler);
    };
    SubscribeOnObservable.dispatch = function (arg) {
        var source = arg.source, subscriber = arg.subscriber;
        return this.add(source.subscribe(subscriber));
    };
    SubscribeOnObservable.prototype._subscribe = function (subscriber) {
        var delay = this.delayTime;
        var source = this.source;
        var scheduler = this.scheduler;
        return scheduler.schedule(SubscribeOnObservable.dispatch, delay, {
            source: source, subscriber: subscriber
        });
    };
    return SubscribeOnObservable;
}(Observable));

/** PURE_IMPORTS_START _observable_SubscribeOnObservable PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */

var SwitchMapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SwitchMapSubscriber, _super);
    function SwitchMapSubscriber(destination, project) {
        var _this = _super.call(this, destination) || this;
        _this.project = project;
        _this.index = 0;
        return _this;
    }
    SwitchMapSubscriber.prototype._next = function (value) {
        var result;
        var index = this.index++;
        try {
            result = this.project(value, index);
        }
        catch (error) {
            this.destination.error(error);
            return;
        }
        this._innerSub(result);
    };
    SwitchMapSubscriber.prototype._innerSub = function (result) {
        var innerSubscription = this.innerSubscription;
        if (innerSubscription) {
            innerSubscription.unsubscribe();
        }
        var innerSubscriber = new SimpleInnerSubscriber(this);
        var destination = this.destination;
        destination.add(innerSubscriber);
        this.innerSubscription = innerSubscribe(result, innerSubscriber);
        if (this.innerSubscription !== innerSubscriber) {
            destination.add(this.innerSubscription);
        }
    };
    SwitchMapSubscriber.prototype._complete = function () {
        var innerSubscription = this.innerSubscription;
        if (!innerSubscription || innerSubscription.closed) {
            _super.prototype._complete.call(this);
        }
        this.unsubscribe();
    };
    SwitchMapSubscriber.prototype._unsubscribe = function () {
        this.innerSubscription = undefined;
    };
    SwitchMapSubscriber.prototype.notifyComplete = function () {
        this.innerSubscription = undefined;
        if (this.isStopped) {
            _super.prototype._complete.call(this);
        }
    };
    SwitchMapSubscriber.prototype.notifyNext = function (innerValue) {
        this.destination.next(innerValue);
    };
    return SwitchMapSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START _switchMap,_util_identity PURE_IMPORTS_END */

/** PURE_IMPORTS_START _switchMap PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */

var TakeUntilSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(TakeUntilSubscriber, _super);
    function TakeUntilSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.seenValue = false;
        return _this;
    }
    TakeUntilSubscriber.prototype.notifyNext = function () {
        this.seenValue = true;
        this.complete();
    };
    TakeUntilSubscriber.prototype.notifyComplete = function () {
    };
    return TakeUntilSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */

var TakeWhileSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(TakeWhileSubscriber, _super);
    function TakeWhileSubscriber(destination, predicate, inclusive) {
        var _this = _super.call(this, destination) || this;
        _this.predicate = predicate;
        _this.inclusive = inclusive;
        _this.index = 0;
        return _this;
    }
    TakeWhileSubscriber.prototype._next = function (value) {
        var destination = this.destination;
        var result;
        try {
            result = this.predicate(value, this.index++);
        }
        catch (err) {
            destination.error(err);
            return;
        }
        this.nextOrComplete(value, result);
    };
    TakeWhileSubscriber.prototype.nextOrComplete = function (value, predicateResult) {
        var destination = this.destination;
        if (Boolean(predicateResult)) {
            destination.next(value);
        }
        else {
            if (this.inclusive) {
                destination.next(value);
            }
            destination.complete();
        }
    };
    return TakeWhileSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_util_noop,_util_isFunction PURE_IMPORTS_END */

var TapSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(TapSubscriber, _super);
    function TapSubscriber(destination, observerOrNext, error, complete) {
        var _this = _super.call(this, destination) || this;
        _this._tapNext = noop;
        _this._tapError = noop;
        _this._tapComplete = noop;
        _this._tapError = error || noop;
        _this._tapComplete = complete || noop;
        if (isFunction(observerOrNext)) {
            _this._context = _this;
            _this._tapNext = observerOrNext;
        }
        else if (observerOrNext) {
            _this._context = observerOrNext;
            _this._tapNext = observerOrNext.next || noop;
            _this._tapError = observerOrNext.error || noop;
            _this._tapComplete = observerOrNext.complete || noop;
        }
        return _this;
    }
    TapSubscriber.prototype._next = function (value) {
        try {
            this._tapNext.call(this._context, value);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(value);
    };
    TapSubscriber.prototype._error = function (err) {
        try {
            this._tapError.call(this._context, err);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.error(err);
    };
    TapSubscriber.prototype._complete = function () {
        try {
            this._tapComplete.call(this._context);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        return this.destination.complete();
    };
    return TapSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */


var ThrottleSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ThrottleSubscriber, _super);
    function ThrottleSubscriber(destination, durationSelector, _leading, _trailing) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        _this.durationSelector = durationSelector;
        _this._leading = _leading;
        _this._trailing = _trailing;
        _this._hasValue = false;
        return _this;
    }
    ThrottleSubscriber.prototype._next = function (value) {
        this._hasValue = true;
        this._sendValue = value;
        if (!this._throttled) {
            if (this._leading) {
                this.send();
            }
            else {
                this.throttle(value);
            }
        }
    };
    ThrottleSubscriber.prototype.send = function () {
        var _a = this, _hasValue = _a._hasValue, _sendValue = _a._sendValue;
        if (_hasValue) {
            this.destination.next(_sendValue);
            this.throttle(_sendValue);
        }
        this._hasValue = false;
        this._sendValue = undefined;
    };
    ThrottleSubscriber.prototype.throttle = function (value) {
        var duration = this.tryDurationSelector(value);
        if (!!duration) {
            this.add(this._throttled = innerSubscribe(duration, new SimpleInnerSubscriber(this)));
        }
    };
    ThrottleSubscriber.prototype.tryDurationSelector = function (value) {
        try {
            return this.durationSelector(value);
        }
        catch (err) {
            this.destination.error(err);
            return null;
        }
    };
    ThrottleSubscriber.prototype.throttlingDone = function () {
        var _a = this, _throttled = _a._throttled, _trailing = _a._trailing;
        if (_throttled) {
            _throttled.unsubscribe();
        }
        this._throttled = undefined;
        if (_trailing) {
            this.send();
        }
    };
    ThrottleSubscriber.prototype.notifyNext = function () {
        this.throttlingDone();
    };
    ThrottleSubscriber.prototype.notifyComplete = function () {
        this.throttlingDone();
    };
    return ThrottleSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_scheduler_async,_throttle PURE_IMPORTS_END */

var ThrottleTimeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(ThrottleTimeSubscriber, _super);
    function ThrottleTimeSubscriber(destination, duration, scheduler, leading, trailing) {
        var _this = _super.call(this, destination) || this;
        _this.duration = duration;
        _this.scheduler = scheduler;
        _this.leading = leading;
        _this.trailing = trailing;
        _this._hasTrailingValue = false;
        _this._trailingValue = null;
        return _this;
    }
    ThrottleTimeSubscriber.prototype._next = function (value) {
        if (this.throttled) {
            if (this.trailing) {
                this._trailingValue = value;
                this._hasTrailingValue = true;
            }
        }
        else {
            this.add(this.throttled = this.scheduler.schedule(dispatchNext$3, this.duration, { subscriber: this }));
            if (this.leading) {
                this.destination.next(value);
            }
            else if (this.trailing) {
                this._trailingValue = value;
                this._hasTrailingValue = true;
            }
        }
    };
    ThrottleTimeSubscriber.prototype._complete = function () {
        if (this._hasTrailingValue) {
            this.destination.next(this._trailingValue);
            this.destination.complete();
        }
        else {
            this.destination.complete();
        }
    };
    ThrottleTimeSubscriber.prototype.clearThrottle = function () {
        var throttled = this.throttled;
        if (throttled) {
            if (this.trailing && this._hasTrailingValue) {
                this.destination.next(this._trailingValue);
                this._trailingValue = null;
                this._hasTrailingValue = false;
            }
            throttled.unsubscribe();
            this.remove(throttled);
            this.throttled = null;
        }
    };
    return ThrottleTimeSubscriber;
}(Subscriber));
function dispatchNext$3(arg) {
    var subscriber = arg.subscriber;
    subscriber.clearThrottle();
}

/** PURE_IMPORTS_START _scheduler_async,_scan,_observable_defer,_map PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_scheduler_async,_util_isDate,_innerSubscribe PURE_IMPORTS_END */

var TimeoutWithSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(TimeoutWithSubscriber, _super);
    function TimeoutWithSubscriber(destination, absoluteTimeout, waitFor, withObservable, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.absoluteTimeout = absoluteTimeout;
        _this.waitFor = waitFor;
        _this.withObservable = withObservable;
        _this.scheduler = scheduler;
        _this.scheduleTimeout();
        return _this;
    }
    TimeoutWithSubscriber.dispatchTimeout = function (subscriber) {
        var withObservable = subscriber.withObservable;
        subscriber._unsubscribeAndRecycle();
        subscriber.add(innerSubscribe(withObservable, new SimpleInnerSubscriber(subscriber)));
    };
    TimeoutWithSubscriber.prototype.scheduleTimeout = function () {
        var action = this.action;
        if (action) {
            this.action = action.schedule(this, this.waitFor);
        }
        else {
            this.add(this.action = this.scheduler.schedule(TimeoutWithSubscriber.dispatchTimeout, this.waitFor, this));
        }
    };
    TimeoutWithSubscriber.prototype._next = function (value) {
        if (!this.absoluteTimeout) {
            this.scheduleTimeout();
        }
        _super.prototype._next.call(this, value);
    };
    TimeoutWithSubscriber.prototype._unsubscribe = function () {
        this.action = undefined;
        this.scheduler = null;
        this.withObservable = null;
    };
    return TimeoutWithSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START _scheduler_async,_util_TimeoutError,_timeoutWith,_observable_throwError PURE_IMPORTS_END */

/** PURE_IMPORTS_START _scheduler_async,_map PURE_IMPORTS_END */

/** PURE_IMPORTS_START _reduce PURE_IMPORTS_END */

/** PURE_IMPORTS_START tslib,_Subject,_innerSubscribe PURE_IMPORTS_END */

var WindowSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(WindowSubscriber, _super);
    function WindowSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.window = new Subject();
        destination.next(_this.window);
        return _this;
    }
    WindowSubscriber.prototype.notifyNext = function () {
        this.openWindow();
    };
    WindowSubscriber.prototype.notifyError = function (error) {
        this._error(error);
    };
    WindowSubscriber.prototype.notifyComplete = function () {
        this._complete();
    };
    WindowSubscriber.prototype._next = function (value) {
        this.window.next(value);
    };
    WindowSubscriber.prototype._error = function (err) {
        this.window.error(err);
        this.destination.error(err);
    };
    WindowSubscriber.prototype._complete = function () {
        this.window.complete();
        this.destination.complete();
    };
    WindowSubscriber.prototype._unsubscribe = function () {
        this.window = null;
    };
    WindowSubscriber.prototype.openWindow = function () {
        var prevWindow = this.window;
        if (prevWindow) {
            prevWindow.complete();
        }
        var destination = this.destination;
        var newWindow = this.window = new Subject();
        destination.next(newWindow);
    };
    return WindowSubscriber;
}(SimpleOuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subscriber,_Subject PURE_IMPORTS_END */

var WindowCountSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(WindowCountSubscriber, _super);
    function WindowCountSubscriber(destination, windowSize, startWindowEvery) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        _this.windowSize = windowSize;
        _this.startWindowEvery = startWindowEvery;
        _this.windows = [new Subject()];
        _this.count = 0;
        destination.next(_this.windows[0]);
        return _this;
    }
    WindowCountSubscriber.prototype._next = function (value) {
        var startWindowEvery = (this.startWindowEvery > 0) ? this.startWindowEvery : this.windowSize;
        var destination = this.destination;
        var windowSize = this.windowSize;
        var windows = this.windows;
        var len = windows.length;
        for (var i = 0; i < len && !this.closed; i++) {
            windows[i].next(value);
        }
        var c = this.count - windowSize + 1;
        if (c >= 0 && c % startWindowEvery === 0 && !this.closed) {
            windows.shift().complete();
        }
        if (++this.count % startWindowEvery === 0 && !this.closed) {
            var window_1 = new Subject();
            windows.push(window_1);
            destination.next(window_1);
        }
    };
    WindowCountSubscriber.prototype._error = function (err) {
        var windows = this.windows;
        if (windows) {
            while (windows.length > 0 && !this.closed) {
                windows.shift().error(err);
            }
        }
        this.destination.error(err);
    };
    WindowCountSubscriber.prototype._complete = function () {
        var windows = this.windows;
        if (windows) {
            while (windows.length > 0 && !this.closed) {
                windows.shift().complete();
            }
        }
        this.destination.complete();
    };
    WindowCountSubscriber.prototype._unsubscribe = function () {
        this.count = 0;
        this.windows = null;
    };
    return WindowCountSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START tslib,_Subject,_scheduler_async,_Subscriber,_util_isNumeric,_util_isScheduler PURE_IMPORTS_END */

var CountedSubject = /*@__PURE__*/ (function (_super) {
    __extends(CountedSubject, _super);
    function CountedSubject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._numberOfNextedValues = 0;
        return _this;
    }
    CountedSubject.prototype.next = function (value) {
        this._numberOfNextedValues++;
        _super.prototype.next.call(this, value);
    };
    Object.defineProperty(CountedSubject.prototype, "numberOfNextedValues", {
        get: function () {
            return this._numberOfNextedValues;
        },
        enumerable: true,
        configurable: true
    });
    return CountedSubject;
}(Subject));
var WindowTimeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(WindowTimeSubscriber, _super);
    function WindowTimeSubscriber(destination, windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        _this.windowTimeSpan = windowTimeSpan;
        _this.windowCreationInterval = windowCreationInterval;
        _this.maxWindowSize = maxWindowSize;
        _this.scheduler = scheduler;
        _this.windows = [];
        var window = _this.openWindow();
        if (windowCreationInterval !== null && windowCreationInterval >= 0) {
            var closeState = { subscriber: _this, window: window, context: null };
            var creationState = { windowTimeSpan: windowTimeSpan, windowCreationInterval: windowCreationInterval, subscriber: _this, scheduler: scheduler };
            _this.add(scheduler.schedule(dispatchWindowClose, windowTimeSpan, closeState));
            _this.add(scheduler.schedule(dispatchWindowCreation, windowCreationInterval, creationState));
        }
        else {
            var timeSpanOnlyState = { subscriber: _this, window: window, windowTimeSpan: windowTimeSpan };
            _this.add(scheduler.schedule(dispatchWindowTimeSpanOnly, windowTimeSpan, timeSpanOnlyState));
        }
        return _this;
    }
    WindowTimeSubscriber.prototype._next = function (value) {
        var windows = this.windows;
        var len = windows.length;
        for (var i = 0; i < len; i++) {
            var window_1 = windows[i];
            if (!window_1.closed) {
                window_1.next(value);
                if (window_1.numberOfNextedValues >= this.maxWindowSize) {
                    this.closeWindow(window_1);
                }
            }
        }
    };
    WindowTimeSubscriber.prototype._error = function (err) {
        var windows = this.windows;
        while (windows.length > 0) {
            windows.shift().error(err);
        }
        this.destination.error(err);
    };
    WindowTimeSubscriber.prototype._complete = function () {
        var windows = this.windows;
        while (windows.length > 0) {
            var window_2 = windows.shift();
            if (!window_2.closed) {
                window_2.complete();
            }
        }
        this.destination.complete();
    };
    WindowTimeSubscriber.prototype.openWindow = function () {
        var window = new CountedSubject();
        this.windows.push(window);
        var destination = this.destination;
        destination.next(window);
        return window;
    };
    WindowTimeSubscriber.prototype.closeWindow = function (window) {
        window.complete();
        var windows = this.windows;
        windows.splice(windows.indexOf(window), 1);
    };
    return WindowTimeSubscriber;
}(Subscriber));
function dispatchWindowTimeSpanOnly(state) {
    var subscriber = state.subscriber, windowTimeSpan = state.windowTimeSpan, window = state.window;
    if (window) {
        subscriber.closeWindow(window);
    }
    state.window = subscriber.openWindow();
    this.schedule(state, windowTimeSpan);
}
function dispatchWindowCreation(state) {
    var windowTimeSpan = state.windowTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler, windowCreationInterval = state.windowCreationInterval;
    var window = subscriber.openWindow();
    var action = this;
    var context = { action: action, subscription: null };
    var timeSpanState = { subscriber: subscriber, window: window, context: context };
    context.subscription = scheduler.schedule(dispatchWindowClose, windowTimeSpan, timeSpanState);
    action.add(context.subscription);
    action.schedule(state, windowCreationInterval);
}
function dispatchWindowClose(state) {
    var subscriber = state.subscriber, window = state.window, context = state.context;
    if (context && context.action && context.subscription) {
        context.action.remove(context.subscription);
    }
    subscriber.closeWindow(window);
}

/** PURE_IMPORTS_START tslib,_Subject,_Subscription,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */

var WindowToggleSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(WindowToggleSubscriber, _super);
    function WindowToggleSubscriber(destination, openings, closingSelector) {
        var _this = _super.call(this, destination) || this;
        _this.openings = openings;
        _this.closingSelector = closingSelector;
        _this.contexts = [];
        _this.add(_this.openSubscription = subscribeToResult(_this, openings, openings));
        return _this;
    }
    WindowToggleSubscriber.prototype._next = function (value) {
        var contexts = this.contexts;
        if (contexts) {
            var len = contexts.length;
            for (var i = 0; i < len; i++) {
                contexts[i].window.next(value);
            }
        }
    };
    WindowToggleSubscriber.prototype._error = function (err) {
        var contexts = this.contexts;
        this.contexts = null;
        if (contexts) {
            var len = contexts.length;
            var index = -1;
            while (++index < len) {
                var context_1 = contexts[index];
                context_1.window.error(err);
                context_1.subscription.unsubscribe();
            }
        }
        _super.prototype._error.call(this, err);
    };
    WindowToggleSubscriber.prototype._complete = function () {
        var contexts = this.contexts;
        this.contexts = null;
        if (contexts) {
            var len = contexts.length;
            var index = -1;
            while (++index < len) {
                var context_2 = contexts[index];
                context_2.window.complete();
                context_2.subscription.unsubscribe();
            }
        }
        _super.prototype._complete.call(this);
    };
    WindowToggleSubscriber.prototype._unsubscribe = function () {
        var contexts = this.contexts;
        this.contexts = null;
        if (contexts) {
            var len = contexts.length;
            var index = -1;
            while (++index < len) {
                var context_3 = contexts[index];
                context_3.window.unsubscribe();
                context_3.subscription.unsubscribe();
            }
        }
    };
    WindowToggleSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        if (outerValue === this.openings) {
            var closingNotifier = void 0;
            try {
                var closingSelector = this.closingSelector;
                closingNotifier = closingSelector(innerValue);
            }
            catch (e) {
                return this.error(e);
            }
            var window_1 = new Subject();
            var subscription = new Subscription();
            var context_4 = { window: window_1, subscription: subscription };
            this.contexts.push(context_4);
            var innerSubscription = subscribeToResult(this, closingNotifier, context_4);
            if (innerSubscription.closed) {
                this.closeWindow(this.contexts.length - 1);
            }
            else {
                innerSubscription.context = context_4;
                subscription.add(innerSubscription);
            }
            this.destination.next(window_1);
        }
        else {
            this.closeWindow(this.contexts.indexOf(outerValue));
        }
    };
    WindowToggleSubscriber.prototype.notifyError = function (err) {
        this.error(err);
    };
    WindowToggleSubscriber.prototype.notifyComplete = function (inner) {
        if (inner !== this.openSubscription) {
            this.closeWindow(this.contexts.indexOf(inner.context));
        }
    };
    WindowToggleSubscriber.prototype.closeWindow = function (index) {
        if (index === -1) {
            return;
        }
        var contexts = this.contexts;
        var context = contexts[index];
        var window = context.window, subscription = context.subscription;
        contexts.splice(index, 1);
        window.complete();
        subscription.unsubscribe();
    };
    return WindowToggleSubscriber;
}(OuterSubscriber));

/** PURE_IMPORTS_START tslib,_Subject,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */

var WindowSubscriber$1 = /*@__PURE__*/ (function (_super) {
    __extends(WindowSubscriber, _super);
    function WindowSubscriber(destination, closingSelector) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        _this.closingSelector = closingSelector;
        _this.openWindow();
        return _this;
    }
    WindowSubscriber.prototype.notifyNext = function (_outerValue, _innerValue, _outerIndex, _innerIndex, innerSub) {
        this.openWindow(innerSub);
    };
    WindowSubscriber.prototype.notifyError = function (error) {
        this._error(error);
    };
    WindowSubscriber.prototype.notifyComplete = function (innerSub) {
        this.openWindow(innerSub);
    };
    WindowSubscriber.prototype._next = function (value) {
        this.window.next(value);
    };
    WindowSubscriber.prototype._error = function (err) {
        this.window.error(err);
        this.destination.error(err);
        this.unsubscribeClosingNotification();
    };
    WindowSubscriber.prototype._complete = function () {
        this.window.complete();
        this.destination.complete();
        this.unsubscribeClosingNotification();
    };
    WindowSubscriber.prototype.unsubscribeClosingNotification = function () {
        if (this.closingNotification) {
            this.closingNotification.unsubscribe();
        }
    };
    WindowSubscriber.prototype.openWindow = function (innerSub) {
        if (innerSub === void 0) {
            innerSub = null;
        }
        if (innerSub) {
            this.remove(innerSub);
            innerSub.unsubscribe();
        }
        var prevWindow = this.window;
        if (prevWindow) {
            prevWindow.complete();
        }
        var window = this.window = new Subject();
        this.destination.next(window);
        var closingNotifier;
        try {
            var closingSelector = this.closingSelector;
            closingNotifier = closingSelector();
        }
        catch (e) {
            this.destination.error(e);
            this.window.error(e);
            return;
        }
        this.add(this.closingNotification = subscribeToResult(this, closingNotifier));
    };
    return WindowSubscriber;
}(OuterSubscriber));

/** PURE_IMPORTS_START tslib,_OuterSubscriber,_util_subscribeToResult PURE_IMPORTS_END */

var WithLatestFromSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(WithLatestFromSubscriber, _super);
    function WithLatestFromSubscriber(destination, observables, project) {
        var _this = _super.call(this, destination) || this;
        _this.observables = observables;
        _this.project = project;
        _this.toRespond = [];
        var len = observables.length;
        _this.values = new Array(len);
        for (var i = 0; i < len; i++) {
            _this.toRespond.push(i);
        }
        for (var i = 0; i < len; i++) {
            var observable = observables[i];
            _this.add(subscribeToResult(_this, observable, undefined, i));
        }
        return _this;
    }
    WithLatestFromSubscriber.prototype.notifyNext = function (_outerValue, innerValue, outerIndex) {
        this.values[outerIndex] = innerValue;
        var toRespond = this.toRespond;
        if (toRespond.length > 0) {
            var found = toRespond.indexOf(outerIndex);
            if (found !== -1) {
                toRespond.splice(found, 1);
            }
        }
    };
    WithLatestFromSubscriber.prototype.notifyComplete = function () {
    };
    WithLatestFromSubscriber.prototype._next = function (value) {
        if (this.toRespond.length === 0) {
            var args = [value].concat(this.values);
            if (this.project) {
                this._tryProject(args);
            }
            else {
                this.destination.next(args);
            }
        }
    };
    WithLatestFromSubscriber.prototype._tryProject = function (args) {
        var result;
        try {
            result = this.project.apply(this, args);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return WithLatestFromSubscriber;
}(OuterSubscriber));

/** PURE_IMPORTS_START _observable_zip PURE_IMPORTS_END */

/** PURE_IMPORTS_START _observable_zip PURE_IMPORTS_END */

/** PURE_IMPORTS_START  PURE_IMPORTS_END */

var db$11 = new Dexie__default("TestLiveQuery");
db$11.version(2).stores({
    items: "id, name",
    foo: "++id",
    outbound: "++,name"
});
db$11.on('populate', function () {
    db$11.items.bulkAdd([
        { id: 1 },
        { id: 2 },
        { id: 3 }
    ]);
    db$11.outbound.bulkAdd([
        { num: 1, name: "A" },
        { num: 2, name: "B" },
        { num: 3, name: "C" }
    ], [1, 2, 3]);
});
function objectify(map) {
    var rv = {};
    map.forEach(function (value, name) {
        rv[name] = value;
    });
    return rv;
}
function deepEqual$1(actual, expected, description) {
    actual = sortedJson.sortify(actual, { sortArray: false });
    expected = sortedJson.sortify(expected, { sortArray: false });
    QUnit.equal(JSON.stringify(actual, null, 2), JSON.stringify(expected, null, 2), description);
}
var Signal = /** @class */ (function () {
    function Signal() {
        var _this = this;
        this.promise = new Promise(function (resolve) { return _this.resolve = resolve; });
    }
    return Signal;
}());
QUnit.module("live-query", {
    setup: function () {
        QUnit.stop();
        resetDatabase(db$11).catch(function (e) {
            QUnit.ok(false, "Error resetting database: " + e.stack);
        }).finally(QUnit.start);
    },
    teardown: function () {
    }
});
/*promisedTest("txcommitted event", async ()=>{
  let signal = new Signal();
  let os = {};
  function txCommitted(observabilitySet) {
    Dexie.extendObservabilitySet(os, observabilitySet);
    signal.resolve(observabilitySet);
  }
  await db.open();
  Dexie.on('txcommitted', txCommitted);
  await db.transaction('rw', db.items, db.foo, async ()=>{
    await db.items.add({id: 4, name: "aiwo1"});
    await db.items.add({id: 7, name: "kjlj"});
    await db.foo.add({name: "jkll"});
    await db.items.update(1, {name: "A"});
  });
  while (!os.TestLiveQuery || !os.TestLiveQuery.items || !hasKey(os.TestLiveQuery.items.keys, 4)) {
    // When Dexie.Observable is active, we might see intermediate transactions taking place
    // before our transaction.
    signal = new Signal();
    await signal.promise;
    console.log("got new os:", os);
  }
  ok(!!os.TestLiveQuery, "Got changes in our table name TestLiveQuery");
  let itemsChanges = os.TestLiveQuery.items;
  ok(itemsChanges, "Got changes for items table");
  deepEqual(itemsChanges.keys, rangeSet([[4], [7], [1]]), "Item changes on concattenated keys");
  deepEqual(itemsChanges.indexes, {"": rangeSet([[4],[7]]),name: rangeSet([["aiwo1"],["kjlj"],["A"]])}, "Index changes present");

  // Foo changes (auto-incremented id)
  let fooChanges = os.TestLiveQuery.foo;
  ok(fooChanges, "Got changes for foo table");

  os = {};
  let fooIds = await db.foo.toCollection().primaryKeys();
  await db.transaction('rw', db.items, db.foo, async ()=>{
    await db.items.update(4, {name: "aiwo2"});
    await db.foo.where('id').between(0, 1000).delete();
  });
  while (!os.TestLiveQuery || !os.TestLiveQuery.items || !hasKey(os.TestLiveQuery.items.keys, 4)) {
    // When Dexie.Observable is active, we might see intermediate transactions taking place
    // before our transaction.
    signal = new Signal();
    await signal.promise;
  }
  itemsChanges = os.TestLiveQuery.items;
  ok(hasKey(itemsChanges.keys, 4), "Item 4 was updated");
  ok(hasKey(itemsChanges.indexes.name, "aiwo1"), "Old value of name index were triggered");
  ok(hasKey(itemsChanges.indexes.name, "aiwo2"), "New value of name index were triggered");

  fooChanges = os.TestLiveQuery.foo;
  ok(!!fooChanges, "Foo table changed");
  if (hasKey(fooChanges.keys, 0) && hasKey(fooChanges.keys, 1000)) {
    // Without addons:
    deepEqual(fooChanges.keys, rangeSet([[0, 1000]]), "Got a range update of foo keys 0..1000");
  } else {
    // With hooks / addons or browser workarounds:
    deepEqual(fooChanges.keys, rangeSet(fooIds.map(id => [id])), "Got individual delete updates of foo keys ", fooIds.join(','));
  }

  Dexie.on('txcommitted').unsubscribe(txCommitted);
});*/
promisedTest("subscribe to range", function () { return __awaiter(void 0, void 0, void 0, function () {
    var signal, subscription, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                signal = new Signal();
                subscription = Dexie.liveQuery(function () { return db$11.items.toArray(); }).subscribe(function (result) {
                    signal.resolve(result);
                });
                return [4 /*yield*/, signal.promise];
            case 1:
                result = _a.sent();
                deepEqual$1(result, [{ id: 1 }, { id: 2 }, { id: 3 }], "First callback should give initally populated content");
                signal = new Signal();
                db$11.items.add({ id: -1 });
                return [4 /*yield*/, signal.promise];
            case 2:
                result = _a.sent();
                deepEqual$1(result, [{ id: -1 }, { id: 1 }, { id: 2 }, { id: 3 }], "2nd callback should give updated content");
                signal = new Signal();
                db$11.items.delete(2);
                return [4 /*yield*/, signal.promise];
            case 3:
                result = _a.sent();
                deepEqual$1(result, [{ id: -1 }, { id: 1 }, { id: 3 }], "3rd callback should wake up when deletion was made");
                subscription.unsubscribe();
                return [2 /*return*/];
        }
    });
}); });
promisedTest("subscribe to keys", function () { return __awaiter(void 0, void 0, void 0, function () {
    var signal1, signal2, count1, count2, sub1, res1, sub2, res2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                signal1 = new Signal(), signal2 = new Signal();
                count1 = 0, count2 = 0;
                sub1 = Dexie.liveQuery(function () { return db$11.items.get(1); }).subscribe(function (result) {
                    ++count1;
                    signal1.resolve(result);
                });
                return [4 /*yield*/, signal1.promise];
            case 1:
                res1 = _a.sent();
                QUnit.equal(res1.id, 1, "First result for ID 1 ok");
                QUnit.equal(count1, 1, "Callback called once");
                sub2 = Dexie.liveQuery(function () { return db$11.items.get(2); }).subscribe(function (result) {
                    ++count2;
                    signal2.resolve(result);
                });
                return [4 /*yield*/, signal2.promise];
            case 2:
                res2 = _a.sent();
                QUnit.equal(res2.id, 2, "2nd result for ID 2 ok");
                QUnit.equal(count2, 1, "2nd callback called once");
                QUnit.equal(count1, 1, "First callback wasn't called again");
                // Now mutate using update - verify listeners don't wake up on other than the keys the subscribe
                signal1 = new Signal();
                signal2 = new Signal();
                return [4 /*yield*/, db$11.items.update(1, { name: "one" })];
            case 3:
                _a.sent();
                QUnit.ok(true, "Could update item 1");
                return [4 /*yield*/, signal1.promise];
            case 4:
                res1 = _a.sent();
                QUnit.equal(count1, 2, "First should have been called 2 times now");
                QUnit.equal(count2, 1, "2nd callback should still only have been called once");
                QUnit.equal(res1.name, "one", "We got the updated value from the expression");
                return [4 /*yield*/, db$11.items.update(2, { name: "two" })];
            case 5:
                _a.sent();
                return [4 /*yield*/, signal2.promise];
            case 6:
                res2 = _a.sent();
                QUnit.equal(count1, 2, "First should have been called 2 times now");
                QUnit.equal(count2, 2, "2nd callback should have been called twice also");
                QUnit.equal(res2.name, "two", "We got the updated value from the 2nd expression");
                // Now mutate using delete
                signal1 = new Signal();
                signal2 = new Signal();
                return [4 /*yield*/, db$11.items.delete(1)];
            case 7:
                _a.sent();
                return [4 /*yield*/, signal1.promise];
            case 8:
                res1 = _a.sent();
                QUnit.equal(count1, 3, "First should have been called 3 times now");
                QUnit.equal(count2, 2, "2nd callback should still only have been called twice");
                QUnit.ok(res1 === undefined, "The updated result of db.items.get(1) should return undefined after the deletion");
                return [4 /*yield*/, db$11.items.delete(2)];
            case 9:
                _a.sent();
                return [4 /*yield*/, signal2.promise];
            case 10:
                res2 = _a.sent();
                QUnit.equal(count1, 3, "First should still have been called 3 times");
                QUnit.equal(count2, 3, "2nd callback should have been called 3 times also now");
                QUnit.ok(res2 === undefined, "The updated result of db.items.get(2) should return undefined after the deletion");
                // Verify that no more callbacks are called after unsubscribing
                sub1.unsubscribe();
                sub2.unsubscribe();
                return [4 /*yield*/, db$11.items.update(1, { name: "fljkds" })];
            case 11:
                _a.sent();
                QUnit.equal(count1, 3, "No more calls after having unsubscribed");
                return [4 /*yield*/, db$11.items.update(1, { name: "sfdfs" })];
            case 12:
                _a.sent();
                QUnit.equal(count1, 3, "Just double-checking - no more calls after having unsubscribed");
                return [2 /*return*/];
        }
    });
}); });
promisedTest("subscribe and error occur", function () { return __awaiter(void 0, void 0, void 0, function () {
    var signal, subscription, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                signal = new Signal();
                subscription = Dexie.liveQuery(function () { return db$11.items.get(NaN); } // NaN is not a valid key
                ).subscribe({
                    next: function (result) { return signal.resolve("success"); },
                    error: function (result) { return signal.resolve("error"); },
                    complete: function () { return signal.resolve("complete"); }
                });
                QUnit.ok(!subscription.closed, "Subscription should not yet be closed");
                return [4 /*yield*/, signal.promise];
            case 1:
                result = _a.sent();
                QUnit.equal(result, "error", "The observable's error callback should have been called");
                QUnit.ok(subscription.closed, "Subscription should have been closed after error has occurred");
                subscription.unsubscribe();
                return [2 /*return*/];
        }
    });
}); });
/* Use cases to cover:

  Queries
    get
    getMany
    query
    queryKeys
    itemsStartsWithAOffset3
    openKeyCursor
    count
    queryOutbound
    queryOutboundByPKey
    openCursorOutbound

  Mutations
    add
    addAuto
    update
    delete
    deleteRange
 */
var abbaKey = 0;
var fruitCount = 0; // A bug in Safari <= 13.1 makes it unable to count on the name index (adds 1 extra)
var mutsAndExpects = function () { return [
    // add
    [
        function () { return db$11.items.add({ id: -1, name: "A" }); },
        {
            itemsToArray: [{ id: -1, name: "A" }, { id: 1 }, { id: 2 }, { id: 3 }],
            itemsGet1And2: [{ id: 1 }, { id: -1, name: "A" }],
            itemsStartsWithA: [{ id: -1, name: "A" }],
            itemsStartsWithAPrimKeys: [-1],
            itemsStartsWithAOffset3: [],
            itemsStartsWithAKeys: ["A"],
            itemsStartsWithACount: fruitCount + 1
        }
    ],
    // addAuto
    [
        function () { return db$11.outbound.add({ name: "Abba" }).then(function (id) { return abbaKey = id; }); },
        {
            outboundToArray: [{ num: 1, name: "A" }, { num: 2, name: "B" }, { num: 3, name: "C" }, { name: "Abba" }],
            outboundStartsWithA: [{ name: "A", num: 1 }, { name: "Abba" }]
        }
    ], [
        function () { return db$11.outbound.bulkAdd([{ name: "Benny" }, { name: "C" }], [-1, 0]); },
        {
            outboundToArray: [{ name: "Benny" }, { name: "C" }, { num: 1, name: "A" }, { num: 2, name: "B" }, { num: 3, name: "C" }, { name: "Abba" }],
            outboundIdBtwnMinus1And2: [{ name: "Benny" }, { name: "C" }, { name: "A", num: 1 }, { name: "B", num: 2 }],
            outboundAnyOf_BCD_keys: ["B", "C", "C"]
        }
    ],
    // update
    [
        function () { return db$11.outbound.update(abbaKey, { name: "Zlatan" }); },
        {
            outboundToArray: [{ name: "Benny" }, { name: "C" }, { num: 1, name: "A" }, { num: 2, name: "B" }, { num: 3, name: "C" }, { name: "Zlatan" }],
            outboundStartsWithA: [{ name: "A", num: 1 }]
        }
    ],
    [
        // Testing that keys-only queries don't get bothered
        function () { return db$11.items.update(-1, { foo: "bar" }); },
        {
            itemsToArray: [{ id: -1, name: "A", foo: "bar" }, { id: 1 }, { id: 2 }, { id: 3 }],
            itemsGet1And2: [{ id: 1 }, { id: -1, name: "A", foo: "bar" }],
            itemsStartsWithA: [{ id: -1, name: "A", foo: "bar" }],
        }
    ],
    [
        // Update an index property (name) should trigger
        // listeners to that index:
        function () { return db$11.items.update(-1, { foo: undefined, name: "B" }); },
        {
            itemsToArray: [{ id: -1, name: "B" }, { id: 1 }, { id: 2 }, { id: 3 }],
            itemsGet1And2: [{ id: 1 }, { id: -1, name: "B" }],
            itemsStartsWithA: [],
            itemsStartsWithAPrimKeys: [],
            itemsStartsWithAOffset3: [],
            itemsStartsWithAKeys: [],
            itemsStartsWithACount: fruitCount
        }
    ],
    [
        // Restoring and re-checking.
        function () { return db$11.items.update(-1, { name: "A" }); },
        {
            itemsToArray: [{ id: -1, name: "A" }, { id: 1 }, { id: 2 }, { id: 3 }],
            itemsGet1And2: [{ id: 1 }, { id: -1, name: "A" }],
            itemsStartsWithA: [{ id: -1, name: "A" }],
            itemsStartsWithAPrimKeys: [-1],
            itemsStartsWithAOffset3: [],
            itemsStartsWithAKeys: ["A"],
            itemsStartsWithACount: fruitCount + 1
        }
    ],
    // add again
    [
        function () { return db$11.items.bulkAdd([{ id: 4, name: "Abbot" }, { id: 5, name: "Assot" }, { id: 6, name: "Ambros" }]).then(function (lastId) { }); },
        {
            itemsToArray: [{ id: -1, name: "A" }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4, name: "Abbot" }, { id: 5, name: "Assot" }, { id: 6, name: "Ambros" }],
            itemsStartsWithA: [{ id: -1, name: "A" }, { id: 4, name: "Abbot" }, { id: 6, name: "Ambros" }, { id: 5, name: "Assot" }],
            itemsStartsWithAPrimKeys: [-1, 4, 6, 5],
            itemsStartsWithAOffset3: [{ id: 5, name: "Assot" }],
            itemsStartsWithAKeys: ["A", "Abbot", "Ambros", "Assot"],
            itemsStartsWithACount: fruitCount + 4
        }
    ],
    // delete:
    [
        function () { return db$11.transaction('rw', db$11.items, db$11.outbound, function () {
            db$11.items.delete(-1);
        }); },
        {
            itemsToArray: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4, name: "Abbot" }, { id: 5, name: "Assot" }, { id: 6, name: "Ambros" }],
            itemsGet1And2: [{ id: 1 }, null],
            itemsStartsWithA: [{ id: 4, name: "Abbot" }, { id: 6, name: "Ambros" }, { id: 5, name: "Assot" }],
            itemsStartsWithAPrimKeys: [4, 6, 5],
            itemsStartsWithAKeys: ["Abbot", "Ambros", "Assot"],
            itemsStartsWithACount: fruitCount + 3
        },
        // Allowed extras:
        // If hooks is listened to we'll get an even more correct update of the itemsStartsWithAOffset3 query
        // since oldVal will be available and offset-queries will be correcly triggered for deleted index keys before the offset.
        {
            itemsStartsWithAOffset3: []
        }
    ],
    // Special case for more fine grained keys observation of put (not knowing oldObjs
    [
        function () { return db$11.items.put({ id: 5, name: "Azlan" }); },
        {
            itemsToArray: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4, name: "Abbot" }, { id: 5, name: "Azlan" }, { id: 6, name: "Ambros" }],
            itemsStartsWithA: [{ id: 4, name: "Abbot" }, { id: 6, name: "Ambros" }, { id: 5, name: "Azlan" }],
            itemsStartsWithAKeys: ["Abbot", "Ambros", "Azlan"],
        }, {
            // Things that optionally can be matched in result (if no hooks specified):
            itemsStartsWithAPrimKeys: [4, 6, 5],
            itemsStartsWithACount: fruitCount + 3,
            itemsStartsWithAOffset3: []
        }
    ],
    [
        function () { return db$11.transaction('rw', db$11.items, db$11.outbound, function () {
            db$11.items.bulkPut([{ id: 5 }]);
        }); },
        {
            itemsToArray: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4, name: "Abbot" }, { id: 5 }, { id: 6, name: "Ambros" }],
            itemsStartsWithA: [{ id: 4, name: "Abbot" }, { id: 6, name: "Ambros" }],
            itemsStartsWithAPrimKeys: [4, 6],
            itemsStartsWithAKeys: ["Abbot", "Ambros"],
            itemsStartsWithACount: fruitCount + 2
        }, {
            itemsStartsWithAOffset3: [] // This is
        }
    ],
    [
        function () { return db$11.transaction('rw', db$11.items, db$11.outbound, function () {
            db$11.items.delete(5);
            db$11.outbound.bulkDelete([abbaKey, -1, 0]);
        }); },
        {
            itemsToArray: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4, name: "Abbot" }, { id: 6, name: "Ambros" }],
            // (allOutbound was:
            //  [{name:"Benny"},{name: "C"},{num:1,name:"A"},{num:2,name:"B"},{num:3,name:"C"},{name:"Zlatan"}])
            // )
            outboundToArray: [{ num: 1, name: "A" }, { num: 2, name: "B" }, { num: 3, name: "C" }],
            //outboundStartsWithA: [{num:1,name:"A"}],
            outboundIdBtwnMinus1And2: [{ num: 1, name: "A" }, { num: 2, name: "B" }],
            outboundAnyOf_BCD_keys: ["B", "C"]
        },
        {
            itemsStartsWithACount: fruitCount + 2
        }
    ]
    // deleteRange: TODO this
]; };
promisedTest("Full use case matrix", function () { return __awaiter(void 0, void 0, void 0, function () {
    var queries, expectedInitialResults, flyingNow, signal, actualResults, observables, subscriptions, prevActual_1, _loop_1, _i, _a, _b, mut, expects, allowedExtra;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, db$11.items.where('name').startsWith('A').count()];
            case 1:
                // A bug in Safari <= 13.1 makes it unable to count on the name index (adds 1 extra)
                fruitCount = _c.sent();
                if (fruitCount > 0)
                    console.log("fruitCount: " + fruitCount);
                queries = {
                    itemsToArray: function () { return db$11.items.toArray(); },
                    itemsGet1And2: function () { return Promise.all(db$11.items.get(1), db$11.items.get(-1)); },
                    itemsBulkGet123: function () { return db$11.items.bulkGet([1, 2, 3]); },
                    itemsStartsWithA: function () { return db$11.items.where('name').startsWith("A").toArray(); },
                    itemsStartsWithAPrimKeys: function () { return db$11.items.where('name').startsWith("A").primaryKeys(); },
                    itemsStartsWithAOffset3: function () { return db$11.items.where('name').startsWith("A").offset(3).toArray(); },
                    itemsStartsWithAKeys: function () { return db$11.items.where('name').startsWith("A").keys(); },
                    itemsStartsWithACount: function () { return db$11.items.where('name').startsWith("A").count(); },
                    outboundToArray: function () { return db$11.outbound.toArray(); },
                    outboundStartsWithA: function () { return db$11.outbound.where('name').startsWith("A").toArray(); },
                    outboundIdBtwnMinus1And2: function () { return db$11.outbound.where(':id').between(-1, 2, true, true).toArray(); },
                    outboundAnyOf_BCD_keys: function () { return db$11.outbound.where('name').anyOf("B", "C", "D").keys(); },
                };
                expectedInitialResults = {
                    itemsToArray: [{ id: 1 }, { id: 2 }, { id: 3 }],
                    itemsGet1And2: [{ id: 1 }, undefined],
                    itemsBulkGet123: [{ id: 1 }, { id: 2 }, { id: 3 }],
                    itemsStartsWithA: [],
                    itemsStartsWithAPrimKeys: [],
                    itemsStartsWithAOffset3: [],
                    itemsStartsWithAKeys: [],
                    itemsStartsWithACount: fruitCount,
                    outboundToArray: [
                        { num: 1, name: "A" },
                        { num: 2, name: "B" },
                        { num: 3, name: "C" }
                    ],
                    outboundStartsWithA: [{ num: 1, name: "A" }],
                    outboundIdBtwnMinus1And2: [{ num: 1, name: "A" }, { num: 2, name: "B" }],
                    outboundAnyOf_BCD_keys: ["B", "C"]
                };
                flyingNow = 0;
                signal = new Signal();
                actualResults = objectify(new Map(Object.keys(queries).map(function (name) { return [name, undefined]; })));
                observables = new Map(Object.keys(queries).map(function (name) { return [
                    name,
                    Dexie.liveQuery(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var res;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    ++flyingNow;
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, , 3, 4]);
                                    return [4 /*yield*/, queries[name]()];
                                case 2:
                                    res = _a.sent();
                                    actualResults[name] = res;
                                    return [2 /*return*/, res];
                                case 3:
                                    if (--flyingNow === 0)
                                        signal.resolve();
                                    return [7 /*endfinally*/];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })
                ]; }));
                subscriptions = Object.keys(queries).map(function (name) { return observables.get(name).subscribe({
                    next: function (res) { },
                    error: function (error) { return QUnit.ok(false, '' + error); }
                }); });
                _c.label = 2;
            case 2:
                _c.trys.push([2, , 8, 9]);
                return [4 /*yield*/, signal.promise];
            case 3:
                _c.sent();
                deepEqual$1(actualResults, expectedInitialResults, "Initial results as expected");
                prevActual_1 = Dexie__default.deepClone(actualResults);
                _loop_1 = function (mut, expects, allowedExtra) {
                    var expected;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                actualResults = {};
                                signal = new Signal();
                                mut();
                                return [4 /*yield*/, signal.promise];
                            case 1:
                                _a.sent();
                                expected = Dexie__default.deepClone(expects);
                                if (allowedExtra)
                                    Array.isArray(allowedExtra) ? allowedExtra.forEach(function (key) {
                                        if (actualResults[key])
                                            expected[key] = prevActual_1[key];
                                    }) : Object.keys(allowedExtra).forEach(function (key) {
                                        if (actualResults[key])
                                            expected[key] = allowedExtra[key];
                                    });
                                deepEqual$1(actualResults, expected, mut.toString() + " ==> " + JSON.stringify(expects, null, 2));
                                Object.assign(prevActual_1, actualResults);
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, _a = mutsAndExpects();
                _c.label = 4;
            case 4:
                if (!(_i < _a.length)) return [3 /*break*/, 7];
                _b = _a[_i], mut = _b[0], expects = _b[1], allowedExtra = _b[2];
                return [5 /*yield**/, _loop_1(mut, expects, allowedExtra)];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7: return [3 /*break*/, 9];
            case 8:
                subscriptions.forEach(function (s) { return s.unsubscribe(); });
                return [7 /*endfinally*/];
            case 9: return [2 /*return*/];
        }
    });
}); });
promisedTest("RxJS compability", function () { return __awaiter(void 0, void 0, void 0, function () {
    var signal, o, s, result, res2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                signal = new Signal();
                o = from(Dexie.liveQuery(function () { return db$11.items.toArray(); })).pipe(map(function (items) { return items.map(function (item) { return item.id; }); }));
                s = o.subscribe(function (results) { return signal.resolve(results); });
                return [4 /*yield*/, signal.promise];
            case 1:
                result = _a.sent();
                deepEqual$1(result, [1, 2, 3], "We should have get a mapped result");
                signal = new Signal();
                db$11.items.add({ id: 4 });
                return [4 /*yield*/, signal.promise];
            case 2:
                res2 = _a.sent();
                deepEqual$1(res2, [1, 2, 3, 4], "We should have get an updated mapped result");
                s.unsubscribe();
                return [2 /*return*/];
        }
    });
}); });

Dexie__default.test = true; // Improve code coverage

//import "./tests-performance.js"; Not required. Should make other performance tests separately instead.

})));
//# sourceMappingURL=bundle.js.map
