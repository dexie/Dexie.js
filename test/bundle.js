(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('dexie'), require('QUnit')) :
    typeof define === 'function' && define.amd ? define(['dexie', 'QUnit'], factory) :
    factory(global.Dexie,global.QUnit);
}(this, function (Dexie,QUnit) { 'use strict';

    Dexie = 'default' in Dexie ? Dexie['default'] : Dexie;

    Dexie.debug = window.location.search.indexOf('longstacks=true') !== -1 ? 'dexie' : false;
    if (window.location.search.indexOf('longstacks=tests') !== -1) Dexie.debug = true; // Don't include stuff from dexie.js.

    var no_optimize = window.no_optimize || window.location.search.indexOf('dontoptimize=true') !== -1;

    function resetDatabase(db) {
        /// <param name="db" type="Dexie"></param>
        var Promise = Dexie.Promise;
        return no_optimize || !db._hasBeenCreated ?
        // Full Database recreation. Takes much time!
        db.delete().then(function () {
            return db.open().then(function () {
                if (!no_optimize) {
                    db._hasBeenCreated = true;
                    var initialState = db._initialState = {};
                    // Now, snapshot the database how it looks like initially (what on.populate did)
                    return db.transaction('r', db.tables, function () {
                        var trans = Dexie.currentTransaction;
                        return Promise.all(Object.keys(trans.tables).filter(function (tableName) {
                            // Don't clear 'meta tables'
                            return tableName[0] != '_' && tableName[0] != '$';
                        }).map(function (tableName) {
                            var items = {};
                            initialState[tableName] = items;
                            return trans.tables[tableName].each(function (item, cursor) {
                                items[cursor.primaryKey] = { key: cursor.primaryKey, value: item };
                            });
                        }));
                    });
                }
            });
        }) :

        // Optimize: Don't delete and recreate database. Instead, just clear all object stores,
        // and manually run db.on.populate
        db.transaction('rw!', db.tables, function () {
            // Got to do an operation in order for backend transaction to be created.
            var trans = Dexie.currentTransaction;
            var initialState = db._initialState;
            return Promise.all(Object.keys(trans.tables).filter(function (tableName) {
                // Don't clear 'meta tables'
                return tableName[0] != '_' && tableName[0] != '$';
            }).map(function (tableName) {
                // Read current state
                var items = {};
                return trans.tables[tableName].each(function (item, cursor) {
                    items[cursor.primaryKey] = { key: cursor.primaryKey, value: item };
                }).then(function () {
                    // Diff from initialState
                    // Go through initialState and diff with current state
                    var initialItems = initialState[tableName];
                    return Promise.all(Object.keys(initialItems).map(function (key) {
                        var item = items[key];
                        var initialItem = initialItems[key];
                        if (!item || JSON.stringify(item.value) != JSON.stringify(initialItem.value)) return db.table(tableName).schema.primKey.keyPath ? trans.tables[tableName].put(initialItem.value) : trans.tables[tableName].put(initialItem.value, initialItem.key);
                        return Promise.resolve();
                    }));
                }).then(function () {
                    // Go through current state and diff with initialState
                    var initialItems = initialState[tableName];
                    return Promise.all(Object.keys(items).map(function (key) {
                        var item = items[key];
                        var initialItem = initialItems[key];
                        if (!initialItem) return trans.tables[tableName].delete(item.key);
                        return Promise.resolve();
                    }));
                });
            }));
        });
    }

    var isIE = !window.ActiveXObject && "ActiveXObject" in window;
    var isEdge = /Edge\/\d+/.test(navigator.userAgent);
    var hasPolyfillIE = [].slice.call(document.getElementsByTagName("script")).some(function (s) {
        return s.src.indexOf("idb-iegap") !== -1;
    });

    function supports(features) {
        return features.split('+').reduce(function (result, feature) {
            switch (feature.toLowerCase()) {
                case "compound":
                    return result && (hasPolyfillIE || !isIE && !isEdge); // Should add Safari to
                case "multientry":
                    return result && (hasPolyfillIE || !isIE && !isEdge); // Should add Safari to
                case "versionchange":
                    return true;
                //return result && (!isIE && !isEdge); // Should add Safari to
                default:
                    throw new Error("Unknown feature: " + feature);
            }
        }, true);
    }

    function spawnedTest(name, num, promiseGenerator) {
        if (!promiseGenerator) {
            promiseGenerator = num;
            QUnit.asyncTest(name, function () {
                Dexie.spawn(promiseGenerator).catch(function (e) {
                    return QUnit.ok(false, e.stack || e);
                }).finally(QUnit.start);
            });
        } else {
            QUnit.asyncTest(name, num, function () {
                Dexie.spawn(promiseGenerator).catch(function (e) {
                    return QUnit.ok(false, e.stack || e);
                }).finally(QUnit.start);
            });
        }
    }

    var Promise$1 = Dexie.Promise;
    var all = Promise$1.all;
    var async = Dexie.async;
    var db = new Dexie("TestDBCrudHooks");
    db.version(1).stores({
        table1: "id,idx",
        table2: ",&idx",
        table3: "++id,&idx",
        table4: "++,&idx",
        table5: ""
    });

    var ourTables = [db.table1, db.table2, db.table3, db.table4, db.table5];

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
    var reset = async(regeneratorRuntime.mark(function reset() {
        return regeneratorRuntime.wrap(function reset$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        unsubscribeHooks();
                        _context.next = 3;
                        return all(ourTables.map(function (table) {
                            return table.clear();
                        }));

                    case 3:
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

                    case 17:
                    case 'end':
                        return _context.stop();
                }
            }
        }, reset, this);
    }));

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

    function nop() {}

    function creating1(primKey, obj, transaction) {
        // You may do additional database operations using given transaction object.
        // You may also modify given obj
        // You may set this.onsuccess = function (primKey){}. Called when autoincremented key is known.
        // You may set this.onerror = callback if create operation fails.
        // If returning any value other than undefined, the returned value will be used as primary key
        transLog.push({ trans: transaction, current: Dexie.currentTransaction });
        var op = {
            op: "create",
            key: primKey,
            value: Dexie.deepClone(obj)
        };
        opLog.push(op);

        if (watchSuccess) {
            this.onsuccess = function (primKey) {
                return successLog.push(primKey);
            };
        }
        if (watchError) {
            this.onerror = function (e) {
                return errorLog.push(e);
            };
        }
        if (deliverKeys[opLog.length - 1]) return deliverKeys[opLog.length - 1];
    }

    // Check that chaining several hooks works
    function creating2(primKey, obj, transaction) {
        var op = {
            op: "create",
            key: primKey,
            value: Dexie.deepClone(obj)
        };
        opLog2.push(op);

        if (watchSuccess) {
            this.onsuccess = function (primKey) {
                return successLog2.push(primKey);
            };
        }
        if (watchError) {
            this.onerror = function (e) {
                return errorLog2.push(e);
            };
        }
        if (deliverKeys2[opLog2.length - 1]) return deliverKeys2[opLog2.length - 1];
    }

    function reading1(obj) {
        opLog.push({
            op: "read",
            obj: Dexie.deepClone(obj)
        });
        return { theObject: obj };
    }

    function reading2(obj) {
        opLog2.push({
            op: "read",
            obj: Dexie.deepClone(obj)
        });
        return obj.theObject;
    }

    function updating1(modifications, primKey, obj, transaction) {
        // You may use transaction to do additional database operations.
        // You may not do any modifications on any of the given arguments.
        // You may set this.onsuccess = callback when update operation completes.
        // You may set this.onerror = callback if update operation fails.
        // If you want to make additional modifications, return another modifications object
        // containing the additional or overridden modifications to make. Any returned
        // object will be merged to the given modifications object.
        transLog.push({ trans: transaction, current: Dexie.currentTransaction });
        var op = {
            op: "update",
            key: primKey,
            obj: Dexie.deepClone(obj),
            mods: Dexie.shallowClone(modifications)
        };
        opLog.push(op);

        if (watchSuccess) {
            this.onsuccess = function () {
                return successLog.push(undefined);
            };
        }
        if (watchError) {
            this.onerror = function (e) {
                return errorLog.push(e);
            };
        }
        if (deliverModifications) return deliverModifications;
    }

    // Chaining:
    function updating2(modifications, primKey, obj, transaction) {
        // You may use transaction to do additional database operations.
        // You may not do any modifications on any of the given arguments.
        // You may set this.onsuccess = callback when update operation completes.
        // You may set this.onerror = callback if update operation fails.
        // If you want to make additional modifications, return another modifications object
        // containing the additional or overridden modifications to make. Any returned
        // object will be merged to the given modifications object.
        var op = {
            op: "update",
            key: primKey,
            obj: Dexie.deepClone(obj),
            mods: Dexie.shallowClone(modifications)
        };
        opLog2.push(op);

        if (watchSuccess) {
            this.onsuccess = function () {
                return successLog2.push(undefined);
            };
        }
        if (watchError) {
            this.onerror = function (e) {
                return errorLog2.push(e);
            };
        }
        if (deliverModifications2) return deliverModifications2;
    }

    function deleting1(primKey, obj, transaction) {
        // You may do additional database operations using given transaction object.
        // You may set this.onsuccess = callback when delete operation completes.
        // You may set this.onerror = callback if delete operation fails.
        // Any modification to obj is ignored.
        // Any return value is ignored.
        // throwing exception will make the db operation fail.
        transLog.push({ trans: transaction, current: Dexie.currentTransaction });
        var op = {
            op: "delete",
            key: primKey,
            obj: obj
        };
        opLog.push(op);
        if (watchSuccess) {
            this.onsuccess = function () {
                return successLog.push(undefined);
            };
        }
        if (watchError) {
            this.onerror = function (e) {
                return errorLog.push(e);
            };
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
            this.onsuccess = function () {
                return successLog2.push(undefined);
            };
        }
        if (watchError) {
            this.onerror = function (e) {
                return errorLog2.push(e);
            };
        }
    }

    QUnit.module("crud-hooks", {
        setup: function () {
            QUnit.stop();
            resetDatabase(db).then(function () {
                return reset();
            }).catch(function (e) {
                QUnit.ok(false, "Error resetting database: " + e.stack);
            }).finally(QUnit.start);
        },
        teardown: function () {
            unsubscribeHooks();
        }
    });

    var expect = async(regeneratorRuntime.mark(function _callee(expected, modifyer) {
        return regeneratorRuntime.wrap(function _callee$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return reset();

                    case 2:
                        _context2.next = 4;
                        return modifyer();

                    case 4:
                        QUnit.equal(JSON.stringify(opLog, null, 2), JSON.stringify(expected, null, 2), "Expected oplog: " + JSON.stringify(expected));
                        QUnit.ok(transLog.every(function (x) {
                            return x.trans && x.current === x.trans;
                        }), "transaction argument is valid and same as Dexie.currentTransaction");
                        _context2.next = 8;
                        return reset();

                    case 8:
                        watchSuccess = true;
                        watchError = true;
                        _context2.next = 12;
                        return modifyer();

                    case 12:
                        QUnit.equal(errorLog.length + errorLog2.length, 0, "No errors should have been registered");
                        QUnit.equal(successLog.length, expected.filter(function (op) {
                            return op.op !== 'read';
                        }).length, "First hook got success events");
                        QUnit.equal(successLog2.length, expected.filter(function (op) {
                            return op.op !== 'read';
                        }).length, "Second hook got success events");
                        expected.forEach(function (x, i) {
                            if (x.op === "create" && x.key !== undefined) {
                                QUnit.equal(successLog[i], x.key, "Success events got the correct key");
                                QUnit.equal(successLog2[i], x.key, "Success events got the correct key (2)");
                            }
                        });

                        if (!expected.some(function (x) {
                            return x.op === "create" && x.key === undefined;
                        })) {
                            _context2.next = 27;
                            break;
                        }

                        _context2.next = 19;
                        return reset();

                    case 19:
                        deliverKeys = expected.map(function (x, i) {
                            return "Hook1Key" + i;
                        });
                        deliverKeys2 = expected.map(function (x, i) {
                            return "Hook2Key" + i;
                        });
                        watchSuccess = true;
                        watchError = true;
                        _context2.next = 25;
                        return modifyer();

                    case 25:
                        QUnit.equal(errorLog.length + errorLog2.length, 0, "No errors should have been registered");
                        expected.forEach(function (x, i) {
                            if (x.op === "create" && x.key === undefined) {
                                QUnit.equal(opLog[i].key, expected[i].key, "First hook got expected key delivered");
                                QUnit.equal(opLog2[i].key, deliverKeys[i], "Second hook got key delivered from first hook");
                                QUnit.equal(successLog[i], deliverKeys2[i], "Success event got delivered key from hook2");
                                QUnit.equal(successLog2[i], deliverKeys2[i], "Success event got delivered key from hook2 (2)");
                            }
                        });

                    case 27:
                        if (!expected.some(function (x) {
                            return x.op === "update";
                        })) {
                            _context2.next = 34;
                            break;
                        }

                        _context2.next = 30;
                        return reset();

                    case 30:
                        deliverModifications = { "someProp.someSubProp": "someValue" };
                        _context2.next = 33;
                        return modifyer();

                    case 33:
                        expected.forEach(function (x, i) {
                            if (x.op === "update") {
                                QUnit.equal(JSON.stringify(opLog[i].obj), JSON.stringify(opLog2[i].obj), "Object has not yet been changed in hook2");
                                QUnit.ok(Object.keys(opLog[i].mods).every(function (prop) {
                                    return JSON.stringify(opLog[i].mods[prop]) === JSON.stringify(opLog2[i].mods[prop]);
                                }), "All mods that were originally sent to hook1, are also sent to hook2");
                                QUnit.ok("someProp.someSubProp" in opLog2[i].mods, "oplog2 got first hook's additional modifications");
                            }
                        });

                    case 34:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee, this);
    }));

    var verifyErrorFlows = async(regeneratorRuntime.mark(function _callee2(modifyer) {
        return regeneratorRuntime.wrap(function _callee2$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return reset();

                    case 2:
                        QUnit.ok(true, "Verifying ERROR flows");
                        watchSuccess = true;
                        watchError = true;
                        _context3.next = 7;
                        return modifyer();

                    case 7:
                        QUnit.equal(opLog.length, opLog2.length, "Number of ops same for hook1 and hook2: " + opLog.length);
                        QUnit.equal(successLog.length + errorLog.length, opLog.length, "Either onerror or onsuccess must have been called for every op. onerror: " + errorLog.length + ". onsuccess: " + successLog.length + ". opLog: " + JSON.stringify(opLog));
                        QUnit.equal(successLog2.length + errorLog2.length, opLog2.length, "Either onerror or onsuccess must have been called for every op (hook2). onerror: " + errorLog2.length + ". onsuccess: " + successLog2.length + ". opLog: " + JSON.stringify(opLog2));

                    case 10:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee2, this);
    }));

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

    spawnedTest("creating using Table.add()", regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return expect([{
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
                        }], function () {
                            return db.transaction('rw', db.tables, function () {
                                db.table1.add({ id: 1, idx: 11 });
                                db.table2.add({ idx: 12 }, 2);
                                db.table3.add({ idx: 13 });
                                db.table4.add({ idx: 14 });
                            });
                        });

                    case 2:
                        _context5.next = 4;
                        return verifyErrorFlows(function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee3() {
                                return regeneratorRuntime.wrap(function _callee3$(_context4) {
                                    while (1) {
                                        switch (_context4.prev = _context4.next) {
                                            case 0:
                                                _context4.next = 2;
                                                return db.table1.add({ id: 1 });

                                            case 2:
                                                _context4.next = 4;
                                                return db.table1.add({ id: 1 }).catch(nop);

                                            case 4:
                                                _context4.next = 6;
                                                return db.table2.add({}, 1);

                                            case 6:
                                                _context4.next = 8;
                                                return db.table2.add({}, 1).catch(nop);

                                            case 8:
                                                _context4.next = 10;
                                                return db.table1.add({ id: {} }).catch(nop);

                                            case 10:
                                            case 'end':
                                                return _context4.stop();
                                        }
                                    }
                                }, _callee3, this);
                            })). // Trigger direct exception (invalid key type)
                            catch(nop);
                        });

                    case 4:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee4, this);
    }));

    spawnedTest("creating using Table.put()", regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.next = 2;
                        return expect([{
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
                        }], function () {
                            return db.transaction('rw', db.tables, function () {
                                db.table1.put({ id: 1, idx: 11 });
                                db.table2.put({ idx: 12 }, 2);
                                db.table3.put({ idx: 13 });
                                db.table4.put({ idx: 14 });
                            });
                        });

                    case 2:
                        _context7.next = 4;
                        return verifyErrorFlows(function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee5() {
                                return regeneratorRuntime.wrap(function _callee5$(_context6) {
                                    while (1) {
                                        switch (_context6.prev = _context6.next) {
                                            case 0:
                                                _context6.next = 2;
                                                return db.table3.put({ idx: 1 });

                                            case 2:
                                                _context6.next = 4;
                                                return db.table3.put({ idx: 1 }).catch(nop);

                                            case 4:
                                                _context6.next = 6;
                                                return db.table2.put({}, 1);

                                            case 6:
                                                _context6.next = 8;
                                                return db.table2.put({}, 1).catch(nop);

                                            case 8:
                                                _context6.next = 10;
                                                return db.table3.put({ id: {} }).catch(nop);

                                            case 10:
                                            case 'end':
                                                return _context6.stop();
                                        }
                                    }
                                }, _callee5, this);
                            })). // Trigger direct exception (invalid key type)
                            catch(nop);
                        });

                    case 4:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee6, this);
    }));

    spawnedTest("creating using Table.bulkAdd()", regeneratorRuntime.mark(function _callee9() {
        return regeneratorRuntime.wrap(function _callee9$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return expect([{
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
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee7() {
                                return regeneratorRuntime.wrap(function _callee7$(_context8) {
                                    while (1) {
                                        switch (_context8.prev = _context8.next) {
                                            case 0:
                                                db.table1.bulkAdd([{ id: 1, idx: 11 }, { id: 1.2, idx: 11.2 }]);
                                                db.table2.bulkAdd([{ idx: 12 }, { idx: 12.2 }], [2, 2.2]);
                                                db.table3.bulkAdd([{ idx: 13 }, { idx: 13.2 }]);
                                                db.table4.bulkAdd([{ idx: 14 }, { idx: 14.2 }]);

                                            case 4:
                                            case 'end':
                                                return _context8.stop();
                                        }
                                    }
                                }, _callee7, this);
                            }));
                        });

                    case 2:
                        _context10.next = 4;
                        return verifyErrorFlows(function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee8() {
                                return regeneratorRuntime.wrap(function _callee8$(_context9) {
                                    while (1) {
                                        switch (_context9.prev = _context9.next) {
                                            case 0:
                                                _context9.next = 2;
                                                return db.table1.bulkAdd([{ id: 1 }, { id: 1 }]).catch(nop);

                                            case 2:
                                                _context9.next = 4;
                                                return db.table1.bulkAdd([{ id: 2 }, { id: 2 }, { id: 3 }]).catch(nop);

                                            case 4:
                                                _context9.next = 6;
                                                return db.table2.bulkAdd([{}, {}], [1, 1]).catch(nop);

                                            case 6:
                                                _context9.next = 8;
                                                return db.table2.bulkAdd([{}, {}, {}], [2, 2, 3]).catch(nop);

                                            case 8:
                                                _context9.next = 10;
                                                return db.table1.bulkAdd([{ id: {} }]).catch(nop);

                                            case 10:
                                            case 'end':
                                                return _context9.stop();
                                        }
                                    }
                                }, _callee8, this);
                            })). // Trigger direct exception (invalid key type)
                            catch(nop);
                        });

                    case 4:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee9, this);
    }));

    spawnedTest("creating using Table.bulkPut()", regeneratorRuntime.mark(function _callee12() {
        return regeneratorRuntime.wrap(function _callee12$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        _context13.next = 2;
                        return expect([{
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
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee10() {
                                return regeneratorRuntime.wrap(function _callee10$(_context11) {
                                    while (1) {
                                        switch (_context11.prev = _context11.next) {
                                            case 0:
                                                _context11.next = 2;
                                                return db.table1.bulkPut([{ id: 1, idx: 11 }, { id: 1.2, idx: 11.2 }]);

                                            case 2:
                                                _context11.next = 4;
                                                return db.table2.bulkPut([{ idx: 12 }, { idx: 12.2 }], [2, 2.2]);

                                            case 4:
                                                _context11.next = 6;
                                                return db.table3.bulkPut([{ idx: 13 }, { idx: 13.2 }]);

                                            case 6:
                                                _context11.next = 8;
                                                return db.table4.bulkPut([{ idx: 14 }, { idx: 14.2 }]);

                                            case 8:
                                            case 'end':
                                                return _context11.stop();
                                        }
                                    }
                                }, _callee10, this);
                            }));
                        });

                    case 2:
                        _context13.next = 4;
                        return verifyErrorFlows(function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee11() {
                                return regeneratorRuntime.wrap(function _callee11$(_context12) {
                                    while (1) {
                                        switch (_context12.prev = _context12.next) {
                                            case 0:
                                                _context12.next = 2;
                                                return db.table3.bulkPut([{ idx: 1 }, { idx: 1 }]).catch(nop);

                                            case 2:
                                                _context12.next = 4;
                                                return db.table3.bulkPut([{ idx: 2 }, { idx: 2 }, { idx: 3 }]).catch(nop);

                                            case 4:
                                                _context12.next = 6;
                                                return db.table1.bulkPut([{ id: {} }]).catch(nop);

                                            case 6:
                                            case 'end':
                                                return _context12.stop();
                                        }
                                    }
                                }, _callee11, this);
                            })). // Trigger direct exception (invalid key type)
                            catch(nop);
                        });

                    case 4:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee12, this);
    }));

    //
    // READING hooks test
    // Ways to produce READs:
    //  Table.get()
    //  Collection.toArray()
    //  Collection.each()
    //  Collection.first()
    //  Collection.last()
    // But not:
    //  Table.filter() / Collection.and()

    spawnedTest("reading tests", regeneratorRuntime.mark(function _callee14() {
        var readOps, readOps2;
        return regeneratorRuntime.wrap(function _callee14$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        _context15.next = 2;
                        return expect([{
                            op: "create",
                            key: 1,
                            value: { foo: "bar" }
                        }, {
                            op: "create",
                            key: 2,
                            value: { fee: "bore" }
                        }, {
                            op: "read", // toArray() (1)
                            obj: { foo: "bar" }
                        }, {
                            op: "read", // toArray() (2)
                            obj: { fee: "bore" }
                        }, {
                            op: "read", // reverse.each() (1)
                            obj: { fee: "bore" }
                        }, {
                            op: "read", // reverse.each() (2)
                            obj: { foo: "bar" }
                        }, {
                            op: "read", // first()
                            obj: { foo: "bar" }
                        }, {
                            op: "read", // last()
                            obj: { fee: "bore" }
                        }], function () {
                            return db.transaction('rw', 'table5', regeneratorRuntime.mark(function _callee13() {
                                return regeneratorRuntime.wrap(function _callee13$(_context14) {
                                    while (1) {
                                        switch (_context14.prev = _context14.next) {
                                            case 0:
                                                _context14.next = 2;
                                                return db.table5.bulkAdd([{ foo: "bar" }, { fee: "bore" }], [1, 2]);

                                            case 2:
                                                _context14.next = 4;
                                                return db.table5.toArray();

                                            case 4:
                                                _context14.next = 6;
                                                return db.table5.reverse().each(function (x) {});

                                            case 6:
                                                _context14.next = 8;
                                                return db.table5.orderBy(':id').first();

                                            case 8:
                                                _context14.next = 10;
                                                return db.table5.orderBy(':id').last();

                                            case 10:
                                                _context14.next = 12;
                                                return db.table5.filter(function (x) {
                                                    return false;
                                                }).toArray();

                                            case 12:
                                            case 'end':
                                                return _context14.stop();
                                        }
                                    }
                                }, _callee13, this);
                            }));
                        });

                    case 2:
                        readOps = opLog.filter(function (o) {
                            return o.op === 'read';
                        }), readOps2 = opLog2.filter(function (o) {
                            return o.op === 'read';
                        });


                        QUnit.ok(readOps.every(function (o, i) {
                            return JSON.stringify(readOps2[i].obj.theObject) === JSON.stringify(o.obj);
                        }), "hook2 should have got hook1's return value");

                    case 4:
                    case 'end':
                        return _context15.stop();
                }
            }
        }, _callee14, this);
    }));

    //
    // UPDATING hooks test
    // Ways to produce UPDATEs:
    //  Table.put()
    //  Table.bulkPut()
    //  Table.update()
    //  Collection.modify()

    spawnedTest("updating using Table.put()", regeneratorRuntime.mark(function _callee17() {
        return regeneratorRuntime.wrap(function _callee17$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        _context18.next = 2;
                        return expect([{
                            op: "create",
                            key: 1,
                            value: { id: 1, address: { city: 'A' } }
                        }, {
                            op: "update",
                            key: 1,
                            obj: { id: 1, address: { city: 'A' } },
                            mods: { "address.city": "B" }
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee15() {
                                return regeneratorRuntime.wrap(function _callee15$(_context16) {
                                    while (1) {
                                        switch (_context16.prev = _context16.next) {
                                            case 0:
                                                db.table1.put({ id: 1, address: { city: 'A' } }); // create
                                                db.table1.put({ id: 1, address: { city: 'B' } }); // update

                                            case 2:
                                            case 'end':
                                                return _context16.stop();
                                        }
                                    }
                                }, _callee15, this);
                            }));
                        });

                    case 2:
                        _context18.next = 4;
                        return verifyErrorFlows(function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee16() {
                                return regeneratorRuntime.wrap(function _callee16$(_context17) {
                                    while (1) {
                                        switch (_context17.prev = _context17.next) {
                                            case 0:
                                                _context17.next = 2;
                                                return db.table3.add({ id: 1, idx: 1 });

                                            case 2:
                                                _context17.next = 4;
                                                return db.table3.put({ id: 2, idx: 1 }).catch(nop);

                                            case 4:
                                                _context17.next = 6;
                                                return db.table3.put({ id: {} }).catch(nop);

                                            case 6:
                                            case 'end':
                                                return _context17.stop();
                                        }
                                    }
                                }, _callee16, this);
                            })). // Trigger direct exception (invalid key type)
                            catch(nop);
                        });

                    case 4:
                    case 'end':
                        return _context18.stop();
                }
            }
        }, _callee17, this);
    }));

    spawnedTest("updating using Table.bulkPut()", regeneratorRuntime.mark(function _callee20() {
        return regeneratorRuntime.wrap(function _callee20$(_context21) {
            while (1) {
                switch (_context21.prev = _context21.next) {
                    case 0:
                        _context21.next = 2;
                        return expect([{
                            op: "create",
                            key: 1,
                            value: { id: 1, address: { city: 'A' } }
                        }, {
                            op: "update",
                            key: 1,
                            obj: { id: 1, address: { city: 'A' } },
                            mods: { "address.city": "B" }
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee18() {
                                return regeneratorRuntime.wrap(function _callee18$(_context19) {
                                    while (1) {
                                        switch (_context19.prev = _context19.next) {
                                            case 0:
                                                db.table1.put({ id: 1, address: { city: 'A' } }); // create
                                                db.table1.put({ id: 1, address: { city: 'B' } }); // update

                                            case 2:
                                            case 'end':
                                                return _context19.stop();
                                        }
                                    }
                                }, _callee18, this);
                            }));
                        });

                    case 2:
                        _context21.next = 4;
                        return verifyErrorFlows(function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee19() {
                                return regeneratorRuntime.wrap(function _callee19$(_context20) {
                                    while (1) {
                                        switch (_context20.prev = _context20.next) {
                                            case 0:
                                                _context20.next = 2;
                                                return db.table4.add({ idx: 1 }, 1);

                                            case 2:
                                                _context20.next = 4;
                                                return db.table4.bulkPut([{ idx: 1 }], [2]).catch(nop);

                                            case 4:
                                                _context20.next = 6;
                                                return db.table3.bulkPut([{}], [{}]).catch(nop);

                                            case 6:
                                            case 'end':
                                                return _context20.stop();
                                        }
                                    }
                                }, _callee19, this);
                            })). // Trigger direct exception (invalid key type)
                            catch(nop);
                        });

                    case 4:
                    case 'end':
                        return _context21.stop();
                }
            }
        }, _callee20, this);
    }));

    spawnedTest("updating using Table.update()", regeneratorRuntime.mark(function _callee23() {
        return regeneratorRuntime.wrap(function _callee23$(_context24) {
            while (1) {
                switch (_context24.prev = _context24.next) {
                    case 0:
                        _context24.next = 2;
                        return expect([{
                            op: "create",
                            key: 1,
                            value: { id: 1, address: { city: 'A' } }
                        }, {
                            op: "update",
                            key: 1,
                            obj: { id: 1, address: { city: 'A' } },
                            mods: { "address.city": "B" }
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee21() {
                                return regeneratorRuntime.wrap(function _callee21$(_context22) {
                                    while (1) {
                                        switch (_context22.prev = _context22.next) {
                                            case 0:
                                                _context22.next = 2;
                                                return db.table1.add({ id: 1, address: { city: 'A' } });

                                            case 2:
                                                _context22.next = 4;
                                                return db.table1.update(1, { "address.city": "B" });

                                            case 4:
                                            case 'end':
                                                return _context22.stop();
                                        }
                                    }
                                }, _callee21, this);
                            }));
                        });

                    case 2:
                        _context24.next = 4;
                        return verifyErrorFlows(function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee22() {
                                return regeneratorRuntime.wrap(function _callee22$(_context23) {
                                    while (1) {
                                        switch (_context23.prev = _context23.next) {
                                            case 0:
                                                _context23.next = 2;
                                                return db.table3.bulkAdd([{ id: 1, idx: 1 }, { id: 2, idx: 2 }]);

                                            case 2:
                                                _context23.next = 4;
                                                return db.table3.update(1, { idx: 2 }).catch(nop);

                                            case 4:
                                                _context23.next = 6;
                                                return db.table3.update(1, 3).catch(nop);

                                            case 6:
                                            case 'end':
                                                return _context23.stop();
                                        }
                                    }
                                }, _callee22, this);
                            })). // Trigger direct exception?
                            catch(nop);
                        });

                    case 4:
                    case 'end':
                        return _context24.stop();
                }
            }
        }, _callee23, this);
    }));

    spawnedTest("updating using Collection.modify()", regeneratorRuntime.mark(function _callee26() {
        return regeneratorRuntime.wrap(function _callee26$(_context27) {
            while (1) {
                switch (_context27.prev = _context27.next) {
                    case 0:
                        _context27.next = 2;
                        return expect([{
                            op: "create",
                            key: 1,
                            value: { id: 1, address: { city: 'A' } }
                        }, {
                            op: "update",
                            key: 1,
                            obj: { id: 1, address: { city: 'A' } },
                            mods: { "address.city": "B" }
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee24() {
                                return regeneratorRuntime.wrap(function _callee24$(_context25) {
                                    while (1) {
                                        switch (_context25.prev = _context25.next) {
                                            case 0:
                                                _context25.next = 2;
                                                return db.table1.add({ id: 1, address: { city: 'A' } });

                                            case 2:
                                                _context25.next = 4;
                                                return db.table1.where('id').equals(1).modify({ "address.city": "B" });

                                            case 4:
                                            case 'end':
                                                return _context25.stop();
                                        }
                                    }
                                }, _callee24, this);
                            }));
                        });

                    case 2:
                        _context27.next = 4;
                        return verifyErrorFlows(function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee25() {
                                return regeneratorRuntime.wrap(function _callee25$(_context26) {
                                    while (1) {
                                        switch (_context26.prev = _context26.next) {
                                            case 0:
                                                _context26.next = 2;
                                                return db.table3.bulkAdd([{ id: 1, idx: 1 }, { id: 2, idx: 2 }]);

                                            case 2:
                                                _context26.next = 4;
                                                return db.table3.where('id').equals(1).modify({ idx: 2 }).catch(nop);

                                            case 4:
                                                _context26.next = 6;
                                                return db.table3.where('id').equals(1).modify(function () {
                                                    throw "apa";
                                                }).catch(nop);

                                            case 6:
                                            case 'end':
                                                return _context26.stop();
                                        }
                                    }
                                }, _callee25, this);
                            })). // Trigger direct exception
                            catch(nop);
                        });

                    case 4:
                    case 'end':
                        return _context27.stop();
                }
            }
        }, _callee26, this);
    }));

    //
    // DELETING hook tests
    //
    // Ways to produce DELETEs:
    //  Table.delete(key)
    //  Table.bulkDetele(keys)
    //  Table.clear()
    //  Collection.modify()
    //  Collection.delete()

    spawnedTest("deleting using Table.delete(key)", regeneratorRuntime.mark(function _callee28() {
        return regeneratorRuntime.wrap(function _callee28$(_context29) {
            while (1) {
                switch (_context29.prev = _context29.next) {
                    case 0:
                        _context29.next = 2;
                        return expect([{
                            op: "create",
                            key: 1,
                            value: { id: 1 }
                        }, {
                            op: "delete",
                            key: 1,
                            obj: { id: 1 }
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee27() {
                                return regeneratorRuntime.wrap(function _callee27$(_context28) {
                                    while (1) {
                                        switch (_context28.prev = _context28.next) {
                                            case 0:
                                                _context28.next = 2;
                                                return db.table1.add({ id: 1 });

                                            case 2:
                                                _context28.next = 4;
                                                return db.table1.delete(1);

                                            case 4:
                                            case 'end':
                                                return _context28.stop();
                                        }
                                    }
                                }, _callee27, this);
                            }));
                        });

                    case 2:
                    case 'end':
                        return _context29.stop();
                }
            }
        }, _callee28, this);
    }));

    // delete


    // No error flows to verify. If anything is ever found, there's no way to make a deletion of it fail.
    spawnedTest("deleting using Table.bulkDelete(key)", regeneratorRuntime.mark(function _callee30() {
        return regeneratorRuntime.wrap(function _callee30$(_context31) {
            while (1) {
                switch (_context31.prev = _context31.next) {
                    case 0:
                        _context31.next = 2;
                        return expect([{
                            op: "create",
                            key: 1,
                            value: { id: 1 }
                        }, {
                            op: "delete",
                            key: 1,
                            obj: { id: 1 }
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee29() {
                                return regeneratorRuntime.wrap(function _callee29$(_context30) {
                                    while (1) {
                                        switch (_context30.prev = _context30.next) {
                                            case 0:
                                                _context30.next = 2;
                                                return db.table1.add({ id: 1 });

                                            case 2:
                                                _context30.next = 4;
                                                return db.table1.bulkDelete([1]);

                                            case 4:
                                            case 'end':
                                                return _context30.stop();
                                        }
                                    }
                                }, _callee29, this);
                            }));
                        });

                    case 2:
                    case 'end':
                        return _context31.stop();
                }
            }
        }, _callee30, this);
    }));

    // delete


    // No error flows to verify. If anything is ever found, there's no way to make a deletion of it fail.
    spawnedTest("deleting using Table.clear()", regeneratorRuntime.mark(function _callee32() {
        return regeneratorRuntime.wrap(function _callee32$(_context33) {
            while (1) {
                switch (_context33.prev = _context33.next) {
                    case 0:
                        _context33.next = 2;
                        return expect([{
                            op: "create",
                            key: 1,
                            value: { id: 1 }
                        }, {
                            op: "delete",
                            key: 1,
                            obj: { id: 1 }
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee31() {
                                return regeneratorRuntime.wrap(function _callee31$(_context32) {
                                    while (1) {
                                        switch (_context32.prev = _context32.next) {
                                            case 0:
                                                _context32.next = 2;
                                                return db.table1.add({ id: 1 });

                                            case 2:
                                                _context32.next = 4;
                                                return db.table1.clear();

                                            case 4:
                                            case 'end':
                                                return _context32.stop();
                                        }
                                    }
                                }, _callee31, this);
                            }));
                        });

                    case 2:
                    case 'end':
                        return _context33.stop();
                }
            }
        }, _callee32, this);
    }));

    // delete
    spawnedTest("deleting using Table.modify()", regeneratorRuntime.mark(function _callee34() {
        return regeneratorRuntime.wrap(function _callee34$(_context35) {
            while (1) {
                switch (_context35.prev = _context35.next) {
                    case 0:
                        _context35.next = 2;
                        return expect([{
                            op: "create",
                            key: 1,
                            value: { id: 1 }
                        }, {
                            op: "delete",
                            key: 1,
                            obj: { id: 1 }
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee33() {
                                return regeneratorRuntime.wrap(function _callee33$(_context34) {
                                    while (1) {
                                        switch (_context34.prev = _context34.next) {
                                            case 0:
                                                _context34.next = 2;
                                                return db.table1.add({ id: 1 });

                                            case 2:
                                                _context34.next = 4;
                                                return db.table1.where('id').between(0, 2).modify(function () {
                                                    delete this.value;
                                                });

                                            case 4:
                                            case 'end':
                                                return _context34.stop();
                                        }
                                    }
                                }, _callee33, this);
                            }));
                        });

                    case 2:
                    case 'end':
                        return _context35.stop();
                }
            }
        }, _callee34, this);
    }));

    // delete
    spawnedTest("deleting using Collection.delete()", regeneratorRuntime.mark(function _callee36() {
        return regeneratorRuntime.wrap(function _callee36$(_context37) {
            while (1) {
                switch (_context37.prev = _context37.next) {
                    case 0:
                        _context37.next = 2;
                        return expect([{
                            op: "create",
                            key: 1,
                            value: { id: 1 }
                        }, {
                            op: "delete",
                            key: 1,
                            obj: { id: 1 }
                        }], function () {
                            return db.transaction('rw', db.tables, regeneratorRuntime.mark(function _callee35() {
                                return regeneratorRuntime.wrap(function _callee35$(_context36) {
                                    while (1) {
                                        switch (_context36.prev = _context36.next) {
                                            case 0:
                                                _context36.next = 2;
                                                return db.table1.add({ id: 1 });

                                            case 2:
                                                _context36.next = 4;
                                                return db.table1.where('id').between(0, 2).delete();

                                            case 4:
                                            case 'end':
                                                return _context36.stop();
                                        }
                                    }
                                }, _callee35, this);
                            }));
                        });

                    case 2:
                    case 'end':
                        return _context37.stop();
                }
            }
        }, _callee36, this);
    }));

    var async$1 = Dexie.async;

    var db$1 = new Dexie("TestIssuesDB");
    db$1.version(1).stores({
        users: "id,first,last,&username,*&email,*pets",
        keyless: ",name",
        foo: "id"
        // If required for your test, add more tables here
    });

    QUnit.module("misc", {
        setup: function () {
            QUnit.stop();
            resetDatabase(db$1).catch(function (e) {
                QUnit.ok(false, "Error resetting database: " + e.stack);
            }).finally(QUnit.start);
        },
        teardown: function () {}
    });

    //
    // Misc Tests
    //

    QUnit.asyncTest("Adding object with falsy keys", function () {
        db$1.keyless.add({ name: "foo" }, 1).then(function (id) {
            QUnit.equal(id, 1, "Normal case ok - Object with key 1 was successfully added.");
            return db$1.keyless.add({ name: "bar" }, 0);
        }).then(function (id) {
            QUnit.equal(id, 0, "Could add a numeric falsy value (0)");
            return db$1.keyless.add({ name: "foobar" }, "");
        }).then(function (id) {
            QUnit.equal(id, "", "Could add a string falsy value ('')");
            return db$1.keyless.put({ name: "bar2" }, 0);
        }).then(function (id) {
            QUnit.equal(id, 0, "Could put a numeric falsy value (0)");
            return db$1.keyless.put({ name: "foobar2" }, "");
        }).then(function (id) {
            QUnit.equal(id, "", "Could put a string falsy value ('')");
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("#102 Passing an empty array to anyOf throws exception", async$1(regeneratorRuntime.mark(function _callee() {
        var count;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return db$1.users.where("username").anyOf([]).count();

                    case 3:
                        count = _context.sent;

                        QUnit.equal(count, 0, "Zarro items matched the query anyOf([])");
                        _context.next = 10;
                        break;

                    case 7:
                        _context.prev = 7;
                        _context.t0 = _context['catch'](0);

                        QUnit.ok(false, "Error when calling anyOf([]): " + _context.t0);

                    case 10:
                        _context.prev = 10;

                        QUnit.start();
                        return _context.finish(10);

                    case 13:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 7, 10, 13]]);
    })));

    spawnedTest("#248 'modifications' object in 'updating' hook can be bizarre", regeneratorRuntime.mark(function _callee2() {
        var numCreating, numUpdating, CustomDate, creatingHook, updatingHook, readingHook, testDate, testDate2, retrieved;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        readingHook = function readingHook(obj) {
                            if (obj.date && obj.date instanceof Date) {
                                obj.date = new CustomDate(obj.date);
                            }
                            return obj;
                        };

                        updatingHook = function updatingHook(modifications, primKey, obj) {
                            ++numUpdating;
                            var date = modifications.date;
                            if (date && date instanceof CustomDate) {
                                return { date: new Date(date._year, date._month, date._day) };
                            }
                        };

                        creatingHook = function creatingHook(primKey, obj) {
                            ++numCreating;
                            var date = obj.date;
                            if (date && date instanceof CustomDate) {
                                obj.date = new Date(date._year, date._month, date._day);
                            }
                        };

                        CustomDate = function CustomDate(realDate) {
                            this._year = new Date(realDate).getFullYear();
                            this._month = new Date(realDate).getMonth();
                            this._day = new Date(realDate).getDate();
                            this._millisec = new Date(realDate).getTime();
                            //...
                        };

                        numCreating = 0, numUpdating = 0;


                        db$1.foo.hook('creating', creatingHook);
                        db$1.foo.hook('reading', readingHook);
                        db$1.foo.hook('updating', updatingHook);
                        testDate = new CustomDate(new Date(2016, 5, 11));

                        QUnit.equal(testDate._year, 2016, "CustomDate has year 2016");
                        QUnit.equal(testDate._month, 5, "CustomDate has month 5");
                        QUnit.equal(testDate._day, 11, "CustomDate has day 11");
                        testDate2 = new CustomDate(new Date(2016, 5, 12));
                        _context2.prev = 13;

                        db$1.foo.add({ id: 1, date: testDate });

                        _context2.next = 17;
                        return db$1.foo.get(1);

                    case 17:
                        retrieved = _context2.sent;


                        QUnit.ok(retrieved.date instanceof CustomDate, "Got a CustomDate object when retrieving object");
                        QUnit.equal(retrieved.date._day, 11, "The CustomDate is on day 11");
                        db$1.foo.put({ id: 1, date: testDate2 });

                        _context2.next = 23;
                        return db$1.foo.get(1);

                    case 23:
                        retrieved = _context2.sent;


                        QUnit.ok(retrieved.date.constructor === CustomDate, "Got a CustomDate object when retrieving object");
                        QUnit.equal(retrieved.date._day, 12, "The CustomDate is now on day 12");

                        // Check that hooks has been called expected number of times
                        QUnit.equal(numCreating, 1, "creating hook called once");
                        QUnit.equal(numUpdating, 1, "updating hook called once");

                    case 28:
                        _context2.prev = 28;

                        db$1.foo.hook('creating').unsubscribe(creatingHook);
                        db$1.foo.hook('reading').unsubscribe(readingHook);
                        db$1.foo.hook('updating').unsubscribe(updatingHook);
                        return _context2.finish(28);

                    case 33:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[13,, 28, 33]]);
    }));

    QUnit.asyncTest("Issue: Broken Promise rejection #264", 1, function () {
        db$1.open().then(function () {
            return db$1.users.where('id').equals('does-not-exist').first();
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

    var db$2 = new Dexie("TestYieldDb");
    var async$2 = Dexie.async;
    var spawn$1 = Dexie.spawn;

    db$2.version(1).stores({
        friends: '++id,name,*groups',
        pets: '++id,name'
    });

    QUnit.module("yield", {
        setup: function () {
            QUnit.stop();
            resetDatabase(db$2).catch(function (e) {
                QUnit.ok(false, "Error resetting database: " + e.stack);
            }).finally(QUnit.start);
        },
        teardown: function () {}
    });

    QUnit.asyncTest("db.transaction() with yield", async$2(regeneratorRuntime.mark(function _callee2() {
        var finallyWasReached;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        finallyWasReached = false;
                        _context2.prev = 1;
                        _context2.next = 4;
                        return db$2.transaction('rw', 'friends', 'pets', regeneratorRuntime.mark(function _callee() {
                            var catId, dogId, gurra, gurrasPets;
                            return regeneratorRuntime.wrap(function _callee$(_context) {
                                while (1) {
                                    switch (_context.prev = _context.next) {
                                        case 0:
                                            _context.next = 2;
                                            return db$2.pets.add({ name: "Tito", kind: "cat" });

                                        case 2:
                                            catId = _context.sent;
                                            _context.next = 5;
                                            return db$2.pets.add({ name: "Josephina", kind: "dog" });

                                        case 5:
                                            dogId = _context.sent;

                                            // Add a friend who owns the pets
                                            db$2.friends.add({ name: "Gurra G", pets: [catId, dogId] });

                                            _context.next = 9;
                                            return db$2.friends.where('name').equals("Gurra G").first();

                                        case 9:
                                            gurra = _context.sent;

                                            QUnit.ok(!!gurra, "Gurra could be found with yield");

                                            // Now retrieve the pet objects that Gurra is referring to:
                                            _context.next = 13;
                                            return db$2.pets.where('id').anyOf(gurra.pets).toArray();

                                        case 13:
                                            gurrasPets = _context.sent;

                                            QUnit.equal(gurrasPets.length, 2, "Gurras all two pets could be retrieved via yield");
                                            QUnit.equal(gurrasPets[0].kind, "cat", "Gurras first pet is a cat");
                                            QUnit.equal(gurrasPets[1].kind, "dog", "Gurras second pet is a dog");

                                        case 17:
                                        case 'end':
                                            return _context.stop();
                                    }
                                }
                            }, _callee, this);
                        }));

                    case 4:
                        _context2.next = 9;
                        break;

                    case 6:
                        _context2.prev = 6;
                        _context2.t0 = _context2['catch'](1);

                        QUnit.ok(false, "Caught error: " + _context2.t0);

                    case 9:
                        _context2.prev = 9;

                        finallyWasReached = true;
                        return _context2.finish(9);

                    case 12:
                        QUnit.ok(finallyWasReached, "finally was reached");
                        QUnit.start();

                    case 14:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[1, 6, 9, 12]]);
    })));

    QUnit.asyncTest("Catching indexedDB error event", 2, async$2(regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return db$2.pets.add({ id: 1, name: "Tidi", kind: "Honeybadger" });

                    case 3:
                        QUnit.ok(true, "Should come so far");
                        _context3.next = 6;
                        return db$2.pets.add({ id: 1, name: "Todoo", kind: "Snake" });

                    case 6:
                        // Should generate an IDB error event!
                        QUnit.ok(false, "Should not come here");
                        _context3.next = 12;
                        break;

                    case 9:
                        _context3.prev = 9;
                        _context3.t0 = _context3['catch'](0);

                        QUnit.equal(_context3.t0.name, "ConstraintError", "Caught indexedDB DOMError event ConstraintError");

                    case 12:
                        QUnit.start();

                    case 13:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[0, 9]]);
    })));

    QUnit.asyncTest("Catching error prevents transaction from aborting", 5, async$2(regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.prev = 0;
                        _context5.next = 3;
                        return db$2.transaction('rw', 'pets', regeneratorRuntime.mark(function _callee4() {
                            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                                while (1) {
                                    switch (_context4.prev = _context4.next) {
                                        case 0:
                                            _context4.prev = 0;
                                            _context4.next = 3;
                                            return db$2.pets.add({ id: 1, name: "Tidi", kind: "Honeybadger" });

                                        case 3:
                                            QUnit.ok(true, "Should come so far");
                                            _context4.next = 6;
                                            return db$2.pets.add({ id: 1, name: "Todoo", kind: "Snake" });

                                        case 6:
                                            // Should generate an IDB error event!
                                            QUnit.ok(false, "Should not come here");
                                            _context4.next = 12;
                                            break;

                                        case 9:
                                            _context4.prev = 9;
                                            _context4.t0 = _context4['catch'](0);

                                            QUnit.equal(_context4.t0.name, "ConstraintError", "Caught indexedDB DOMError event ConstraintError");

                                        case 12:
                                        case 'end':
                                            return _context4.stop();
                                    }
                                }
                            }, _callee4, this, [[0, 9]]);
                        }));

                    case 3:
                        QUnit.ok(true, "Should come here - transaction committed because we caught the error");

                        _context5.next = 6;
                        return db$2.pets.get(1);

                    case 6:
                        _context5.t0 = _context5.sent;
                        QUnit.ok(_context5.t0, "A pet with ID 1 exists in DB");
                        _context5.next = 10;
                        return db$2.pets.get(1);

                    case 10:
                        _context5.t1 = _context5.sent.name;
                        QUnit.equal(_context5.t1, "Tidi", "It was Tidi in the first position");

                    case 12:
                        _context5.prev = 12;

                        QUnit.start();
                        return _context5.finish(12);

                    case 15:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this, [[0,, 12, 15]]);
    })));

    QUnit.asyncTest("Transaction not committing when not catching error event", 4, async$2(regeneratorRuntime.mark(function _callee7() {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.prev = 0;
                        _context7.next = 3;
                        return db$2.transaction('rw', 'pets', regeneratorRuntime.mark(function _callee6() {
                            return regeneratorRuntime.wrap(function _callee6$(_context6) {
                                while (1) {
                                    switch (_context6.prev = _context6.next) {
                                        case 0:
                                            _context6.next = 2;
                                            return db$2.pets.add({ id: 1, name: "Tidi", kind: "Honeybadger" });

                                        case 2:
                                            QUnit.ok(true, "Should come so far");
                                            _context6.next = 5;
                                            return db$2.pets.add({ id: 1, name: "Todoo", kind: "Snake" });

                                        case 5:
                                            // Should generate an IDB error event!
                                            QUnit.ok(false, "Should not come here");

                                        case 6:
                                        case 'end':
                                            return _context6.stop();
                                    }
                                }
                            }, _callee6, this);
                        }));

                    case 3:
                        QUnit.ok(false, "Should not come here");

                        _context7.next = 14;
                        break;

                    case 6:
                        _context7.prev = 6;
                        _context7.t0 = _context7['catch'](0);


                        QUnit.ok(true, "Transaction should fail");
                        QUnit.equal(_context7.t0.name, "ConstraintError", "Error caught was a ConstraintError!");
                        _context7.next = 12;
                        return db$2.pets.count();

                    case 12:
                        _context7.t1 = _context7.sent;
                        QUnit.equal(_context7.t1, 0, "Pets table should still be empty because transaction failed");

                    case 14:
                        _context7.prev = 14;

                        QUnit.start();
                        return _context7.finish(14);

                    case 17:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this, [[0, 6, 14, 17]]);
    })));

    QUnit.asyncTest("Should allow yielding a non-promise", async$2(regeneratorRuntime.mark(function _callee8() {
        var x;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        _context8.prev = 0;
                        _context8.next = 3;
                        return 3;

                    case 3:
                        x = _context8.sent;

                        QUnit.equal(x, 3, "Could yield a non-promise");
                        _context8.next = 10;
                        break;

                    case 7:
                        _context8.prev = 7;
                        _context8.t0 = _context8['catch'](0);

                        QUnit.ok(false, "Yielding a non-Thenable wasn't be allowed");

                    case 10:
                        _context8.prev = 10;

                        QUnit.start();
                        return _context8.finish(10);

                    case 13:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this, [[0, 7, 10, 13]]);
    })));

    QUnit.asyncTest("Should allow yielding an array with a mix of values and thenables", async$2(regeneratorRuntime.mark(function _callee9() {
        var results;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        _context9.prev = 0;
                        _context9.next = 3;
                        return [1, 2, Dexie.Promise.resolve(3)];

                    case 3:
                        results = _context9.sent;

                        QUnit.equal(results.length, 3, "Yielded array is of size 3");
                        QUnit.equal(results[0], 1, "First value is 1");
                        QUnit.equal(results[1], 2, "Second value is 2");
                        QUnit.equal(results[2], 3, "Third value is 3");
                        _context9.next = 13;
                        break;

                    case 10:
                        _context9.prev = 10;
                        _context9.t0 = _context9['catch'](0);

                        QUnit.ok(false, "Got exception when trying to do yield an array of mixed values/promises");

                    case 13:
                        _context9.prev = 13;

                        QUnit.start();
                        return _context9.finish(13);

                    case 16:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this, [[0, 10, 13, 16]]);
    })));

    QUnit.asyncTest("Should allow yielding an array of non-promises only", async$2(regeneratorRuntime.mark(function _callee10() {
        var results;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.prev = 0;
                        _context10.next = 3;
                        return [1, 2, 3];

                    case 3:
                        results = _context10.sent;

                        QUnit.equal(results.length, 3, "Yielded array is of size 3");
                        QUnit.equal(results[0], 1, "First value is 1");
                        QUnit.equal(results[1], 2, "Second value is 2");
                        QUnit.equal(results[2], 3, "Third value is 3");
                        _context10.next = 13;
                        break;

                    case 10:
                        _context10.prev = 10;
                        _context10.t0 = _context10['catch'](0);

                        QUnit.ok(false, _context10.t0);

                    case 13:
                        _context10.prev = 13;

                        QUnit.start();
                        return _context10.finish(13);

                    case 16:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this, [[0, 10, 13, 16]]);
    })));

    QUnit.asyncTest("Should allow yielding an empty array", async$2(regeneratorRuntime.mark(function _callee11() {
        var results;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        _context11.prev = 0;
                        _context11.next = 3;
                        return [];

                    case 3:
                        results = _context11.sent;

                        QUnit.equal(results.length, 0, "Yielded array is of size 0");
                        _context11.next = 10;
                        break;

                    case 7:
                        _context11.prev = 7;
                        _context11.t0 = _context11['catch'](0);

                        QUnit.ok(false, _context11.t0);

                    case 10:
                        _context11.prev = 10;

                        QUnit.start();
                        return _context11.finish(10);

                    case 13:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this, [[0, 7, 10, 13]]);
    })));

    QUnit.asyncTest("Should allow yielding an array of different kind of any kind of promise", function () {
        spawn$1(regeneratorRuntime.mark(function _callee12() {
            var results;
            return regeneratorRuntime.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            _context12.next = 2;
                            return [Promise.resolve(1), Dexie.Promise.resolve(2), Promise.resolve(3)];

                        case 2:
                            results = _context12.sent;

                            QUnit.equal(results.length, 3, "Yielded array is of size 3");
                            QUnit.equal(results[0], 1, "First value is 1");
                            QUnit.equal(results[1], 2, "Second value is 2");
                            QUnit.equal(results[2], 3, "Third value is 3");
                            return _context12.abrupt('return', 4);

                        case 8:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this);
        })).then(function (x) {
            QUnit.equal(x, 4, "Finally got the value 4");
        }).catch(function (e) {
            QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Throw after yield 1", function () {
        spawn$1(regeneratorRuntime.mark(function _callee13() {
            return regeneratorRuntime.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            _context13.prev = 0;
                            _context13.next = 3;
                            return Promise.resolve(3);

                        case 3:
                            QUnit.ok(true, "yielded a value");
                            throw "error";

                        case 7:
                            _context13.prev = 7;
                            _context13.t0 = _context13['catch'](0);

                            QUnit.ok(_context13.t0 === "error", "Catched exception: " + _context13.t0);

                        case 10:
                            return _context13.abrupt('return', 4);

                        case 11:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this, [[0, 7]]);
        })).then(function (x) {
            QUnit.equal(x, 4, "Finally got the value 4");
        }).catch(function (e) {
            QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Throw after yield 2", function () {
        Promise.resolve(spawn$1(regeneratorRuntime.mark(function _callee14() {
            return regeneratorRuntime.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            _context14.prev = 0;
                            _context14.next = 3;
                            return 3;

                        case 3:
                            QUnit.ok(true, "yielded a value");
                            throw "error";

                        case 7:
                            _context14.prev = 7;
                            _context14.t0 = _context14['catch'](0);

                            QUnit.ok(_context14.t0 === "error", "Catched exception: " + _context14.t0);

                        case 10:
                            return _context14.abrupt('return', 4);

                        case 11:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, this, [[0, 7]]);
        }))).then(function (x) {
            QUnit.equal(x, 4, "Finally got the value 4");
        }).catch(function (e) {
            QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Throw before yield", function () {
        Promise.resolve(spawn$1(regeneratorRuntime.mark(function _callee15() {
            return regeneratorRuntime.wrap(function _callee15$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            _context15.prev = 0;
                            throw "error";

                        case 4:
                            _context15.prev = 4;
                            _context15.t0 = _context15['catch'](0);

                            QUnit.ok(_context15.t0 === "error", "Catched exception: " + _context15.t0);

                        case 7:
                            return _context15.abrupt('return', 4);

                        case 8:
                        case 'end':
                            return _context15.stop();
                    }
                }
            }, _callee15, this, [[0, 4]]);
        }))).then(function (x) {
            QUnit.equal(x, 4, "Finally got the value 4");
        }).catch(function (e) {
            QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Catch rejected promise", function () {
        spawn$1(regeneratorRuntime.mark(function _callee16() {
            return regeneratorRuntime.wrap(function _callee16$(_context16) {
                while (1) {
                    switch (_context16.prev = _context16.next) {
                        case 0:
                            _context16.prev = 0;
                            _context16.next = 3;
                            return new Promise(function (resolve, reject) {
                                reject("fault fault!");
                            });

                        case 3:
                            QUnit.ok(false, "Shouldn't come here");
                            _context16.next = 9;
                            break;

                        case 6:
                            _context16.prev = 6;
                            _context16.t0 = _context16['catch'](0);

                            QUnit.ok(_context16.t0 === "fault fault!", "Catched exception: " + _context16.t0);

                        case 9:
                            return _context16.abrupt('return', 4);

                        case 10:
                        case 'end':
                            return _context16.stop();
                    }
                }
            }, _callee16, this, [[0, 6]]);
        })).then(function (x) {
            QUnit.equal(x, 4, "Finally got the value 4");
        }).catch(function (e) {
            QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Catch rejected promise in an array", function () {
        spawn$1(regeneratorRuntime.mark(function _callee17() {
            return regeneratorRuntime.wrap(function _callee17$(_context17) {
                while (1) {
                    switch (_context17.prev = _context17.next) {
                        case 0:
                            _context17.prev = 0;
                            _context17.next = 3;
                            return [1, 2, new Promise(function (resolve, reject) {
                                reject("fault fault!");
                            }), 4];

                        case 3:
                            QUnit.ok(false, "Shouldn't come here");
                            _context17.next = 9;
                            break;

                        case 6:
                            _context17.prev = 6;
                            _context17.t0 = _context17['catch'](0);

                            QUnit.ok(_context17.t0 === "fault fault!", "Catched exception: " + _context17.t0);

                        case 9:
                            return _context17.abrupt('return', 4);

                        case 10:
                        case 'end':
                            return _context17.stop();
                    }
                }
            }, _callee17, this, [[0, 6]]);
        })).then(function (x) {
            QUnit.equal(x, 4, "Finally got the value 4");
        }).catch(function (e) {
            QUnit.ok(false, "Something is rotten in the state of Denmark: " + e);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Should allow returning a promise", function () {
        spawn$1(regeneratorRuntime.mark(function _callee18() {
            return regeneratorRuntime.wrap(function _callee18$(_context18) {
                while (1) {
                    switch (_context18.prev = _context18.next) {
                        case 0:
                            return _context18.abrupt('return', Promise.resolve(3));

                        case 1:
                        case 'end':
                            return _context18.stop();
                    }
                }
            }, _callee18, this);
        })).then(function (result) {
            QUnit.equal(result, 3, "Returning a directly should also be allowed");
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Should be able to do 'return yield Promise.resolve(x);'", function () {
        spawn$1(regeneratorRuntime.mark(function _callee19() {
            return regeneratorRuntime.wrap(function _callee19$(_context19) {
                while (1) {
                    switch (_context19.prev = _context19.next) {
                        case 0:
                            _context19.next = 2;
                            return Promise.resolve(3);

                        case 2:
                            return _context19.abrupt('return', _context19.sent);

                        case 3:
                        case 'end':
                            return _context19.stop();
                    }
                }
            }, _callee19, this);
        })).then(function () {
            QUnit.ok(true, "Should be able to do 'return yield Promise.resolve(x);'");
        }).catch(function (e) {
            QUnit.ok(false, "Error occurred: " + e);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Arrow functions and let", async$2(regeneratorRuntime.mark(function _callee20() {
        var x, y;
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
            while (1) {
                switch (_context20.prev = _context20.next) {
                    case 0:
                        _context20.next = 2;
                        return [1, 2, Promise.resolve(3)];

                    case 2:
                        x = _context20.sent;
                        y = x.map(function (a) {
                            return a - 1;
                        });

                        QUnit.equal(y[0], 0);
                        QUnit.equal(y[1], 1);
                        QUnit.equal(y[2], 2);
                        QUnit.start();

                    case 8:
                    case 'end':
                        return _context20.stop();
                }
            }
        }, _callee20, this);
    })));

    QUnit.asyncTest("Calling sub async function", async$2(regeneratorRuntime.mark(function _callee21() {
        var addFriend, deleteFriends, foo, bar, numDeleted;
        return regeneratorRuntime.wrap(function _callee21$(_context23) {
            while (1) {
                switch (_context23.prev = _context23.next) {
                    case 0:
                        addFriend = async$2(regeneratorRuntime.mark(function addFriend(friend) {
                            var friendId;
                            return regeneratorRuntime.wrap(function addFriend$(_context21) {
                                while (1) {
                                    switch (_context21.prev = _context21.next) {
                                        case 0:
                                            _context21.next = 2;
                                            return db$2.friends.add(friend);

                                        case 2:
                                            friendId = _context21.sent;
                                            _context21.next = 5;
                                            return db$2.friends.get(friendId);

                                        case 5:
                                            return _context21.abrupt('return', _context21.sent);

                                        case 6:
                                        case 'end':
                                            return _context21.stop();
                                    }
                                }
                            }, addFriend, this);
                        }));
                        deleteFriends = async$2(regeneratorRuntime.mark(function deleteFriends() {
                            return regeneratorRuntime.wrap(function deleteFriends$(_context22) {
                                while (1) {
                                    switch (_context22.prev = _context22.next) {
                                        case 0:
                                            _context22.next = 2;
                                            return db$2.friends.where('name').anyOf("Foo", "Bar").delete();

                                        case 2:
                                            return _context22.abrupt('return', _context22.sent);

                                        case 3:
                                        case 'end':
                                            return _context22.stop();
                                    }
                                }
                            }, deleteFriends, this);
                        }));
                        _context23.prev = 2;
                        _context23.next = 5;
                        return addFriend({ name: "Foo" });

                    case 5:
                        foo = _context23.sent;
                        _context23.next = 8;
                        return addFriend({ name: "Bar" });

                    case 8:
                        bar = _context23.sent;

                        QUnit.ok(foo.name == "Foo", "Foo got its name");
                        QUnit.ok(bar.name == "Bar", "Bar got its name");
                        _context23.next = 13;
                        return deleteFriends();

                    case 13:
                        numDeleted = _context23.sent;

                        QUnit.ok(true, numDeleted + " friends successfully deleted");
                        _context23.next = 20;
                        break;

                    case 17:
                        _context23.prev = 17;
                        _context23.t0 = _context23['catch'](2);

                        QUnit.ok(false, _context23.t0);

                    case 20:
                        _context23.prev = 20;

                        QUnit.start();
                        return _context23.finish(20);

                    case 23:
                    case 'end':
                        return _context23.stop();
                }
            }
        }, _callee21, this, [[2, 17, 20, 23]]);
    })));

    var db$3 = new Dexie("TestDBWhereClause");
    db$3.version(1).stores({
        folders: "++id,&path",
        files: "++id,filename,extension,[filename+extension],folderId",
        people: "[name+number],name,number",
        friends: "++id,name,age",
        chart: '[patno+row+col], patno'
    });

    var Folder = db$3.folders.defineClass({
        id: Number,
        path: String,
        description: String
    });

    var File = db$3.files.defineClass({
        id: Number,
        filename: String,
        extension: String,
        folderId: Number
    });

    File.prototype.getFullPath = function () {
        var file = this;
        return db$3.folders.get(this.folderId, function (folder) {
            return folder.path + "/" + file.filename + (file.extension || "");
        });
    };

    Folder.prototype.getFiles = function () {
        return db$3.files.where('folderId').equals(this.id).toArray();
    };

    var Chart = db$3.chart.defineClass({
        patno: Number,
        row: Number,
        col: Number,
        sym: Number
    });
    Chart.prototype.save = function () {
        return db$3.chart.put(this);
    };

    var firstFolderId = 0;
    var lastFolderId = 0;
    var firstFileId = 0;
    var lastFileId = 0;
    db$3.on("populate", function (trans) {
        var folders = trans.table("folders");
        var files = trans.table("files");
        folders.add({ path: "/", description: "Root folder" }).then(function (id) {
            firstFolderId = id;
        });
        folders.add({ path: "/usr" }); // 2
        folders.add({ path: "/usr/local" }); // 3
        folders.add({ path: "/usr/local/bin" }).then(function (id) {
            // 4
            files.add({ filename: "Hello", folderId: id }).then(function (fileId) {
                firstFileId = fileId;
            });
            files.add({ filename: "hello", extension: ".exe", folderId: id });
        });
        folders.add({ path: "/usr/local/src" }).then(function (id) {
            // 5
            files.add({ filename: "world", extension: ".js", folderId: id });
            files.add({ filename: "README", extension: ".TXT", folderId: id });
        });
        folders.add({ path: "/usr/local/var" }); // 6
        folders.add({ path: "/USR/local/VAR" }); // 7
        folders.add({ path: "/var" }); // 8
        folders.add({ path: "/var/bin" }).then(function (id) {
            // 9
            lastFolderId = id;
            return files.add({ filename: "hello-there", extension: ".exe", folderId: id });
        }).then(function (id) {
            lastFileId = id;
        });
    });

    QUnit.module("WhereClause", {
        setup: function () {
            QUnit.stop();
            resetDatabase(db$3).catch(function (e) {
                QUnit.ok(false, "Error resetting database: " + e.stack);
            }).finally(QUnit.start);
        },
        teardown: function () {}
    });

    spawnedTest('Issue#31 Compound Index with anyOf', regeneratorRuntime.mark(function _callee() {
        var items;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (supports('compound')) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt('return', QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED"));

                    case 2:
                        _context.next = 4;
                        return db$3.people.bulkAdd([{
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
                        }]);

                    case 4:
                        _context.next = 6;
                        return db$3.people.where('[name+number]').anyOf([[-2, 0], [-3, 0]]) // https://github.com/dfahlander/Dexie.js/issues/31
                        .toArray();

                    case 6:
                        items = _context.sent;


                        QUnit.equal(items.length, 2, "It should contain 2 items.");
                        QUnit.equal(items[0].tag, "D", "First we should get D");
                        QUnit.equal(items[1].tag, "C", "then we should get C");

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    QUnit.asyncTest("startsWithAnyOf()", function () {

        function runTheTests(mippler) {
            /// <param name="mippler" value="function(x){return x;}"></param>

            //
            // Basic Flow:
            //
            return mippler(db$3.folders.where('path').startsWithAnyOf('/usr/local', '/var')).toArray(function (result) {
                QUnit.equal(result.length, 6, "Query should match 6 folders");
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local';
                }), '/usr/local');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/bin';
                }), '/usr/local/bin');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/src';
                }), '/usr/local/src');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/var';
                }), '/usr/local/var');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/var';
                }), '/var');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/var/bin';
                }), '/var/bin');

                //
                // Require a slash at beginning (and use an array of strings as argument instead)
                //
                return mippler(db$3.folders.where('path').startsWithAnyOf(['/usr/local/', '/var/'])).toArray();
            }).then(function (result) {
                QUnit.equal(result.length, 4, "Query should match 4 folders");
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/bin';
                }), '/usr/local/bin');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/src';
                }), '/usr/local/src');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/var';
                }), '/usr/local/var');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/var/bin';
                }), '/var/bin');

                //
                // Some specialities
                //
                return Dexie.Promise.all(mippler(db$3.folders.where('path').startsWithAnyOf([])).count(), // Empty
                mippler(db$3.folders.where('path').startsWithAnyOf('/var', '/var', '/var')).count(), // Duplicates
                mippler(db$3.folders.where('path').startsWithAnyOf('')).count(), // Empty string should match all
                mippler(db$3.folders).count(), mippler(db$3.folders.where('path').startsWithAnyOf('nonexisting')).count() // Non-existing match
                );
            }).then(function (results) {
                QUnit.equal(results[0], 0, "startsWithAnyOf([]).count() == 0");
                QUnit.equal(results[1], 2, "startsWithAnyOf('/var', '/var', '/var') == 2");
                QUnit.equal(results[2], results[3], "startsWithAnyOf('').count() == db.folders.count()");
                QUnit.equal(results[4], 0, "startsWithAnyOf('nonexisting').count() == 0");

                //
                // Error handling
                //

                return mippler(db$3.folders.where('path').startsWithAnyOf([null, '/'])).toArray(function (res) {
                    QUnit.ok(false, "Should not succeed to have null in parameter");
                }).catch(function (e) {
                    QUnit.ok(true, "As expected: failed to have null in arguments: " + e);
                });
            });
        }

        // Run tests without transaction and without reverse()
        runTheTests(function (x) {
            return x;
        }).then(function () {
            QUnit.ok(true, "FINISHED NORMAL TEST!");
            // Run tests with reverse()
            return runTheTests(function (x) {
                return x.reverse();
            });
        }).then(function () {
            QUnit.ok(true, "FINISHED REVERSE TEST!");
            // Run tests within a transaction
            return db$3.transaction('r', db$3.folders, db$3.files, function () {
                return runTheTests(function (x) {
                    return x;
                });
            });
        }).then(function () {
            QUnit.ok(true, "FINISHED TRANSACTION TEST!");
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("anyOf()", function () {
        db$3.transaction("r", db$3.files, db$3.folders, function () {

            db$3.files.where("filename").anyOf("hello", "hello-there", "README", "gösta").toArray(function (a) {
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
        db$3.files.put({ id: 9000, filename: "new file 1", folderId: firstFolderId });
        db$3.files.put({ id: 10000, filename: "new file 2", folderId: firstFolderId });
        db$3.files.where('id').anyOf([9000, 11000]).toArray(function (a) {
            QUnit.equal(a.length, 1, "Should be only one found entry");
            QUnit.equal(a[0].id, 9000, "Item no 9000 should be found");
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("anyOf(emptyArray)", function () {
        db$3.files.where('id').anyOf([]).toArray(function (a) {
            QUnit.equal(a.length, 0, "Should be empty");
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e.stack || e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("equalsIgnoreCase()", function () {

        db$3.files.where("filename").equalsIgnoreCase("hello").toArray(function (a) {
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
        db$3.folders.add(folder).then(function (folderId) {
            var filenames = ["", "\t ", "AA", "AAron", "APAN JAPAN", "APAN japaö", "APGALEN", "APaLAT", "APaÖNSKAN", "APalster", "Aaron", "Apan JapaN", "Apan Japaa", "Apan Japan", "Gösta", "apan JA", "apan JAPA", "apan JAPAA", "apan JAPANer", "apan JAPAÖ", "apan japan", "apan japanER", "östen"];

            var fileArray = filenames.map(function (filename) {
                var file = new File();
                file.filename = filename;
                file.folderId = folderId;
                return file;
            });

            db$3.transaction("rw", db$3.files, function () {
                fileArray.forEach(function (file) {
                    db$3.files.add(file);
                });

                db$3.files.where("filename").equalsIgnoreCase("apan japan").toArray(function (a) {
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
        db$3.folders.add(folder).then(function (folderId) {
            var filenames = ["", "\t ", "AA", "AAron", "APAN JAPAN", "APAN japaö", "APGALEN", "APaLAT", "APaÖNSKAN", "APalster", "Aaron", "Apan JapaN", "Apan Japaa", "Apan Japan", "Gösta", "apan JA", "apan JAPA", "apan JAPAA", "apan JAPANer", "apan JAPAÖ", "apan japan", "apan japanER", "östen"];

            var fileArray = filenames.map(function (filename) {
                var file = new File();
                file.filename = filename;
                file.folderId = folderId;
                return file;
            });

            db$3.transaction("rw", db$3.files, function () {

                fileArray.forEach(function (file) {
                    db$3.files.add(file);
                });

                db$3.files.where("filename").equalsIgnoreCase("apan japan").and(function (f) {
                    return f.folderId === folderId;
                }) // Just for fun - only look in the newly created /etc folder.
                .reverse().toArray(function (a) {
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
        if (typeof idbModules !== 'undefined' && Dexie.dependencies.indexedDB === idbModules.shimIndexedDB) {
            // Using indexedDBShim.
            QUnit.ok(false, "This test would hang with IndexedDBShim as of 2015-05-07");
            QUnit.start();
            return;
        }
        db$3.transaction("rw", db$3.files, function () {
            db$3.files.clear();
            db$3.files.add({ filename: "Hello-there-", folderId: 1 });
            db$3.files.add({ filename: "hello-there-", folderId: 1 });
            db$3.files.add({ filename: "hello-there-everyone", folderId: 1 });
            db$3.files.add({ filename: "hello-there-everyone-of-you!", folderId: 1 });
            // Ascending
            db$3.files.where("filename").equalsIgnoreCase("hello-there-everyone").toArray(function (a) {
                QUnit.equal(a.length, 1, "Should find one file");
                QUnit.equal(a[0].filename, "hello-there-everyone", "First file is " + a[0].filename);
            });
            // Descending
            db$3.files.where("filename").equalsIgnoreCase("hello-there-everyone").reverse().toArray(function (a) {
                QUnit.equal(a.length, 1, "Should find one file");
                QUnit.equal(a[0].filename, "hello-there-everyone", "First file is " + a[0].filename);
            });
        }).catch(function (e) {
            QUnit.ok(false, e.stack || e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("startsWithIgnoreCase()", function () {
        db$3.transaction("r", db$3.folders, function () {

            db$3.folders.count(function (count) {
                QUnit.ok(true, "Number of folders in database: " + count);
                db$3.folders.where("path").startsWithIgnoreCase("/").toArray(function (a) {
                    QUnit.equal(a.length, count, "Got all folder objects because all of them starts with '/'");
                });
            });

            db$3.folders.where("path").startsWithIgnoreCase("/usr").toArray(function (a) {
                QUnit.equal(a.length, 6, "6 folders found: " + a.map(function (folder) {
                    return '"' + folder.path + '"';
                }).join(', '));
            });

            db$3.folders.where("path").startsWithIgnoreCase("/usr").reverse().toArray(function (a) {
                QUnit.equal(a.length, 6, "6 folders found in reverse mode: " + a.map(function (folder) {
                    return '"' + folder.path + '"';
                }).join(', '));
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
        db$3.files.where("filename").equals("fdsojifdsjoisdf").toArray(function (a) {
            QUnit.equal(a.length, 0, "File fdsojifdsjoisdf was not found");
        }).catch(function (e) {
            QUnit.ok(false, e.stack || e);
        }).finally(QUnit.start);
    });

    if (!supports("compound")) {
        QUnit.test("compound-index", function () {
            return QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED");
        });
        QUnit.test("compound-primkey (Issue #37)", function () {
            return QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED");
        });
        QUnit.test("Issue #31 - Compound Index with anyOf", function () {
            return QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED");
        });
        QUnit.test("Erratic behavior of between #190", function () {
            return QUnit.ok(true, "SKIPPED - COMPOUND UNSUPPORTED");
        });
    } else {
        QUnit.asyncTest("compound-index", 2, function () {
            db$3.transaction("r", db$3.files, function () {
                db$3.files.where("[filename+extension]").equals(["README", ".TXT"]).toArray(function (a) {
                    QUnit.equal(a.length, 1, "Found one file by compound index search");
                    QUnit.equal(a[0].filename, "README", "The found file was README.TXT");
                });
            }).catch(function (e) {
                QUnit.ok(false, e + ". Expected to fail on IE10/IE11 - no support compound indexs.");
            }).finally(QUnit.start);
        });

        QUnit.asyncTest("compound-primkey (Issue #37)", function () {
            db$3.transaction('rw', db$3.people, function () {
                db$3.people.add({ name: "Santaclaus", number: 123 });
                db$3.people.add({ name: "Santaclaus", number: 124 });
                db$3.people.add({ name: "Santaclaus2", number: 1 });
                return db$3.people.get(["Santaclaus", 123]);
            }).then(function (santa) {
                QUnit.ok(!!santa, "Got santa");
                QUnit.equal(santa.name, "Santaclaus", "Santa's name is correct");
                QUnit.equal(santa.number, 123, "Santa's number is correct");

                return db$3.people.where("[name+number]").between(["Santaclaus", 1], ["Santaclaus", 200]).toArray();
            }).then(function (santas) {
                QUnit.equal(santas.length, 2, "Got two santas");
            }).catch(function (e) {
                QUnit.ok(false, "Failed (will fail in IE without polyfill):" + e);
            }).finally(QUnit.start);
        });

        QUnit.asyncTest("Issue #31 - Compound Index with anyOf", function () {
            db$3.files.where("[filename+extension]").anyOf([["hello", ".exe"], ["README", ".TXT"]]).toArray(function (a) {
                QUnit.equal(a.length, 2, "Should find two files");
                QUnit.equal(a[0].filename, "README", "First comes the uppercase README.TXT");
                QUnit.equal(a[1].filename, "hello", "Second comes the lowercase hello.exe");
            }).catch(function (e) {
                QUnit.ok(false, "Failed (will fail in IE without polyfill):" + e);
            }).finally(QUnit.start);
        });

        QUnit.asyncTest("Erratic behavior of between #190", function () {
            db$3.transaction("rw", db$3.chart, function () {
                var chart = [];
                for (var r = 1; r <= 2; r++) {
                    for (var c = 1; c <= 150; c++) {
                        chart.push({ patno: 1,
                            row: r,
                            col: c,
                            sym: 1 });
                    }
                }
                db$3.chart.bulkAdd(chart);
            }).then(function () {
                var grid = [],
                    x1 = 91,
                    x2 = 130;
                return db$3.chart.where("[patno+row+col]").between([1, 1, x1], [1, 1, x2], true, true).each(function (cell) {
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
        db$3.folders.where('id').above(firstFolderId + 4).toArray(function (a) {
            QUnit.equal(a.length, 4, "Four folders have id above 5");
            QUnit.equal(a[0].path, "/usr/local/var");
            QUnit.equal(a[1].path, "/USR/local/VAR");
            QUnit.equal(a[2].path, "/var");
            QUnit.equal(a[3].path, "/var/bin");
        }).then(function () {
            return db$3.folders.where('id').aboveOrEqual(firstFolderId + 4).toArray(function (a) {
                QUnit.equal(a.length, 5, "Five folders have id above or equal 5");
                QUnit.equal(a[0].path, "/usr/local/src");
                QUnit.equal(a[1].path, "/usr/local/var");
                QUnit.equal(a[2].path, "/USR/local/VAR");
                QUnit.equal(a[3].path, "/var");
                QUnit.equal(a[4].path, "/var/bin");
            });
        }).then(function () {
            return db$3.folders.where('id').below(firstFolderId + 4).toArray(function (a) {
                QUnit.equal(a.length, 4, "Four folders have id below 5");
                QUnit.equal(a[0].path, "/");
                QUnit.equal(a[1].path, "/usr");
                QUnit.equal(a[2].path, "/usr/local");
                QUnit.equal(a[3].path, "/usr/local/bin");
            });
        }).then(function () {
            return db$3.folders.where('id').belowOrEqual(firstFolderId + 4).toArray(function (a) {
                QUnit.equal(a.length, 5, "Five folders have id below or equal to 5");
                QUnit.equal(a[0].path, "/");
                QUnit.equal(a[1].path, "/usr");
                QUnit.equal(a[2].path, "/usr/local");
                QUnit.equal(a[3].path, "/usr/local/bin");
                QUnit.equal(a[4].path, "/usr/local/src");
            });
        }).then(function () {
            return db$3.folders.where('id').between(firstFolderId, firstFolderId + 1).toArray(function (a) {
                QUnit.equal(a.length, 1, "One folder between 1 and 2");
                QUnit.equal(a[0].id, firstFolderId, "Found item is number 1");
            });
        }).then(function () {
            return db$3.folders.where('id').between(firstFolderId, firstFolderId + 1, true, false).toArray(function (a) {
                QUnit.equal(a.length, 1, "One folder between 1 and 2 (including lower but not upper)");
                QUnit.equal(a[0].id, firstFolderId, "Found item is number 1");
            });
        }).then(function () {
            return db$3.folders.where('id').between(firstFolderId, firstFolderId + 1, false, true).toArray(function (a) {
                QUnit.equal(a.length, 1, "One folder between 1 and 2 (including upper but not lower)");
                QUnit.equal(a[0].id, firstFolderId + 1, "Found item is number 2");
            });
        }).then(function () {
            return db$3.folders.where('id').between(firstFolderId, firstFolderId + 1, false, false).toArray(function (a) {
                QUnit.equal(a.length, 0, "Zarro folders between 1 and 2 (neither including lower nor upper)");
            });
        }).then(function () {
            return db$3.folders.where('id').between(firstFolderId, firstFolderId + 1, true, true).toArray(function (a) {
                QUnit.equal(a.length, 2, "Two folder between 1 and 2 (including both lower and upper)");
                QUnit.equal(a[0].id, firstFolderId, "Number 1 among found items");
                QUnit.equal(a[1].id, firstFolderId + 1, "Number 2 among found items");
            });
        }).catch(function (err) {
            QUnit.ok(false, err.stack || err);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("notEqual", function () {
        db$3.folders.where('path').notEqual("/usr/local").sortBy("path", function (result) {
            result = result.map(function (x) {
                return x.path;
            });
            QUnit.equal(JSON.stringify(result, null, 4), JSON.stringify(["/", "/USR/local/VAR", "/usr",
            //"/usr/local"
            "/usr/local/bin", "/usr/local/src", "/usr/local/var", "/var", "/var/bin"], null, 4), "/usr/local should be removed");
        }).catch(function (err) {
            QUnit.ok(false, err.stack || err);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("noneOf", function () {
        db$3.folders.where('path').noneOf("/usr/local", "/", "/var/bin", "not existing key").sortBy("path", function (result) {
            result = result.map(function (x) {
                return x.path;
            });
            QUnit.equal(JSON.stringify(result, null, 4), JSON.stringify([
            //"/",
            "/USR/local/VAR", "/usr",
            //"/usr/local"
            "/usr/local/bin", "/usr/local/src", "/usr/local/var", "/var"],
            //"/var/bin"
            null, 4), "Only items not specified in query should come into result");
        }).catch(function (err) {
            QUnit.ok(false, err.stack || err);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("noneOf keys", function () {
        db$3.folders.where('path').noneOf("/usr/local", "/", "/var/bin", "not existing key").keys(function (result) {
            result = result.sort(function (a, b) {
                return a < b ? -1 : a === b ? 0 : 1;
            });
            QUnit.equal(JSON.stringify(result, null, 4), JSON.stringify([
            //"/",
            "/USR/local/VAR", "/usr",
            //"/usr/local"
            "/usr/local/bin", "/usr/local/src", "/usr/local/var", "/var"],
            //"/var/bin"
            null, 4), "Only keys not specified in query should come into result");
        }).catch(function (err) {
            QUnit.ok(false, err.stack || err);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("inAnyOfRanges", function () {
        db$3.transaction('rw', db$3.friends, function () {
            db$3.friends.bulkAdd([{ name: "Simon", age: 3 }, { name: "Tyra", age: 0 }, { name: "David", age: 42 }, { name: "Ylva", age: 40 }, { name: "Ann-Sofie", age: 72 }]).then(function () {
                //equal(errors.length, 0, "bulkAdd() succeeded");
                return db$3.friends.where('age').inAnyRange([[0, 3], [65, Infinity]]).toArray();
            }).then(function (result) {
                QUnit.equal(result.length, 2, "Should give us two persons");
                QUnit.equal(result[0].name, "Tyra", "First is Tyra");
                QUnit.equal(result[1].name, "Ann-Sofie", "Second is Ann-Sofie");
                return db$3.friends.where("age").inAnyRange([[0, 3], [65, Infinity]], { includeUppers: true }).toArray();
            }).then(function (result) {
                QUnit.equal(result.length, 3, "Should give us three persons");
                QUnit.equal(result[0].name, "Tyra", "First is Tyra");
                QUnit.equal(result[1].name, "Simon", "Second is Simon");
                QUnit.equal(result[2].name, "Ann-Sofie", "Third is Ann-Sofie");
                return db$3.friends.where("age").inAnyRange([[0, 3], [65, Infinity]], { includeLowers: false }).toArray();
            }).then(function (result) {
                QUnit.equal(result.length, 1, "Should give us one person");
                QUnit.equal(result[0].name, "Ann-Sofie", "Ann-Sofie is the only match");
                return db$3.friends.where("age").inAnyRange([[40, 40], [40, 40], [40, 41], [41, 41], [42, 42]], { includeUppers: true }).toArray();
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
        db$3.transaction('r', db$3.folders, db$3.files, function () {
            db$3.folders.where('path').anyOfIgnoreCase("/usr/local/var", "/").toArray(function (result) {
                QUnit.equal(result.length, 3);
                QUnit.equal(result[0].path, "/");
                QUnit.equal(result[1].path, "/USR/local/VAR");
                QUnit.equal(result[2].path, "/usr/local/var");
                return db$3.folders.where('path').anyOfIgnoreCase("/usr/local/var", "/").reverse().toArray();
            }).then(function (result) {
                QUnit.equal(result.length, 3);
                QUnit.equal(result[0].path, "/usr/local/var");
                QUnit.equal(result[1].path, "/USR/local/VAR");
                QUnit.equal(result[2].path, "/");
                return db$3.files.where('filename').anyOfIgnoreCase(["hello", "world", "readme"]).toArray();
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
        db$3.files.where('filename').anyOfIgnoreCase(["hello", "world", "readme"]).toArray(function (result) {
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
            return mippler(db$3.folders.where('path').startsWithAnyOfIgnoreCase('/usr/local', '/var')).toArray(function (result) {
                QUnit.equal(result.length, 7, "Query should match 7 folders");
                QUnit.ok(result.some(function (x) {
                    return x.path == '/USR/local/VAR';
                }), '/USR/local/VAR');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local';
                }), '/usr/local');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/bin';
                }), '/usr/local/bin');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/src';
                }), '/usr/local/src');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/var';
                }), '/usr/local/var');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/var';
                }), '/var');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/var/bin';
                }), '/var/bin');

                //
                // Require a slash at beginning (and use an array of strings as argument instead)
                //
                return mippler(db$3.folders.where('path').startsWithAnyOfIgnoreCase(['/usr/local/', '/var/'])).toArray();
            }).then(function (result) {
                QUnit.equal(result.length, 5, "Query should match 5 folders");
                QUnit.ok(result.some(function (x) {
                    return x.path == '/USR/local/VAR';
                }), '/USR/local/VAR');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/bin';
                }), '/usr/local/bin');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/src';
                }), '/usr/local/src');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/usr/local/var';
                }), '/usr/local/var');
                QUnit.ok(result.some(function (x) {
                    return x.path == '/var/bin';
                }), '/var/bin');

                //
                // Some specialities
                //
                return Dexie.Promise.all(mippler(db$3.folders.where('path').startsWithAnyOfIgnoreCase([])).count(), // Empty
                mippler(db$3.folders.where('path').startsWithAnyOfIgnoreCase('/var', '/var', '/var')).count(), // Duplicates
                mippler(db$3.folders.where('path').startsWithAnyOfIgnoreCase('')).count(), // Empty string should match all
                mippler(db$3.folders).count(), mippler(db$3.folders.where('path').startsWithAnyOfIgnoreCase('nonexisting')).count() // Non-existing match
                );
            }).then(function (results) {
                QUnit.equal(results[0], 0, "startsWithAnyOfIgnoreCase([]).count() == 0");
                QUnit.equal(results[1], 2, "startsWithAnyOfIgnoreCase('/var', '/var', '/var').count() == 2");
                QUnit.equal(results[2], results[3], "startsWithAnyOfIgnoreCase('').count() == db.folders.count()");
                QUnit.equal(results[4], 0, "startsWithAnyOfIgnoreCase('nonexisting').count() == 0");

                //
                // Error handling
                //

                return mippler(db$3.folders.where('path').startsWithAnyOfIgnoreCase([null, '/'])).toArray(function (res) {
                    QUnit.ok(false, "Should not succeed to have null in parameter");
                }).catch(function (e) {
                    QUnit.ok(true, "As expected: failed to have null in arguments: " + e);
                });
            });
        }

        // Run tests without transaction and without reverse()
        runTheTests(function (x) {
            return x;
        }).then(function () {
            QUnit.ok(true, "FINISHED NORMAL TEST!");
            // Run tests with reverse()
            return runTheTests(function (x) {
                return x.reverse();
            });
        }).then(function () {
            QUnit.ok(true, "FINISHED REVERSE TEST!");
            // Run tests within a transaction
            return db$3.transaction('r', db$3.folders, db$3.files, function () {
                return runTheTests(function (x) {
                    return x;
                });
            });
        }).then(function () {
            QUnit.ok(true, "FINISHED TRANSACTION TEST!");
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e);
        }).finally(QUnit.start);
    });

    var db$4 = new Dexie("TestDBCollection");
    db$4.version(1).stores({ users: "id,first,last,&username,*&email,*pets" });

    var User = db$4.users.defineClass({
        id: Number,
        first: String,
        last: String,
        username: String,
        email: [String],
        pets: [String]
    });
    db$4.on("populate", function (trans) {
        var users = trans.table("users");
        users.add({ id: 1, first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
        users.add({ id: 2, first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
    });

    QUnit.module("collection", {
        setup: function () {
            QUnit.stop();
            resetDatabase(db$4).catch(function (e) {
                QUnit.ok(false, "Error resetting database: " + e.stack);
            }).finally(QUnit.start);
        },
        teardown: function () {}
    });

    spawnedTest("and with values", regeneratorRuntime.mark(function _callee() {
        var array;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return db$4.users.where("last").inAnyRange([["a", "g"], ["A", "G"]]).and(function (user) {
                            return user.username === "dfahlander";
                        }).toArray();

                    case 2:
                        array = _context.sent;

                        QUnit.equal(array.length, 1, "Should find one user with given criteria");

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    spawnedTest("and with keys", regeneratorRuntime.mark(function _callee2() {
        var keys;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return db$4.users.where("last").inAnyRange([["a", "g"], ["A", "G"]]).and(function (user) {
                            return user.username === "dfahlander";
                        }).keys();

                    case 2:
                        keys = _context2.sent;

                        QUnit.equal(keys.length, 1, "Should find one user with given criteria");

                    case 4:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    spawnedTest("and with delete", regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return db$4.users.orderBy('username').and(function (u) {
                            return QUnit.ok(!!u, "User should exist here");
                        }).delete();

                    case 2:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    QUnit.asyncTest("each", 3, function () {
        var array = [];
        db$4.users.orderBy("id").each(function (user) {
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
        db$4.users.count(function (count) {
            QUnit.equal(count, 2, "Two objects in table");
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });
    QUnit.asyncTest("toArray", 3, function () {
        db$4.users.orderBy("last").toArray(function (a) {
            QUnit.equal(a.length, 2, "Array length is 2");
            QUnit.equal(a[0].first, "Karl", "First is Karl");
            QUnit.equal(a[1].first, "David", "Second is David");
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });
    QUnit.asyncTest("limit", 6, function () {
        db$4.transaction("r", db$4.users, function () {
            db$4.users.orderBy("last").limit(1).toArray(function (a) {
                QUnit.equal(a.length, 1, "Array length is 1");
                QUnit.equal(a[0].first, "Karl", "First is Karl");
            });

            db$4.users.orderBy("last").limit(10).toArray(function (a) {
                QUnit.equal(a.length, 2, "Array length is 2");
            });

            db$4.users.orderBy("last").limit(0).toArray(function (a) {
                QUnit.equal(a.length, 0, "Array length is 0");
            });

            db$4.users.orderBy("last").limit(-1).toArray(function (a) {
                QUnit.equal(a.length, 0, "Array length is 0");
            });

            db$4.users.orderBy("id").limit(-1).toArray(function (a) {
                QUnit.equal(a.length, 0, "Array length is 0");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("offset().limit() with advanced combinations", 22, function () {
        db$4.transaction("rw", db$4.users, function () {
            for (var i = 0; i < 10; ++i) {
                db$4.users.add({ id: 3 + i, first: "First" + i, last: "Last" + i, username: "user" + i, email: ["user" + i + "@abc.se"] });
            }

            // Using algorithm + count()
            db$4.users.where("first").startsWithIgnoreCase("first").count(function (count) {
                QUnit.equal(count, 10, "Counting all 10");
            });
            db$4.users.where("first").startsWithIgnoreCase("first").limit(5).count(function (count) {
                QUnit.equal(count, 5, "algorithm + count(): limit(5).count()");
            });
            db$4.users.where("first").startsWithIgnoreCase("first").offset(7).count(function (count) {
                QUnit.equal(count, 3, "algorithm + count(): offset(7).count()");
            });
            db$4.users.where("first").startsWithIgnoreCase("first").offset(6).limit(4).count(function (count) {
                QUnit.equal(count, 4, "algorithm + count(): offset(6).limit(4)");
            });
            db$4.users.where("first").startsWithIgnoreCase("first").offset(7).limit(4).count(function (count) {
                QUnit.equal(count, 3, "algorithm + count(): offset(7).limit(4)");
            });
            db$4.users.where("first").startsWithIgnoreCase("first").offset(17).limit(4).count(function (count) {
                QUnit.equal(count, 0, "algorithm + count(): offset(17).limit(4)");
            });
            // Using algorithm + toArray()
            db$4.users.where("first").startsWithIgnoreCase("first").limit(5).toArray(function (a) {
                QUnit.equal(a.length, 5, "algorithm + toArray(): limit(5)");
            });
            db$4.users.where("first").startsWithIgnoreCase("first").offset(7).toArray(function (a) {
                QUnit.equal(a.length, 3, "algorithm + toArray(): offset(7)");
            });
            db$4.users.where("first").startsWithIgnoreCase("first").offset(6).limit(4).toArray(function (a) {
                QUnit.equal(a.length, 4, "algorithm + toArray(): offset(6).limit(4)");
            });
            db$4.users.where("first").startsWithIgnoreCase("first").offset(7).limit(4).toArray(function (a) {
                QUnit.equal(a.length, 3, "algorithm + toArray(): offset(7).limit(4)");
            });
            db$4.users.where("first").startsWithIgnoreCase("first").offset(17).limit(4).toArray(function (a) {
                QUnit.equal(a.length, 0, "algorithm + toArray(): offset(17).limit(4)");
            });
            // Using IDBKeyRange + count()
            db$4.users.where("first").startsWith("First").count(function (count) {
                QUnit.equal(count, 10, "IDBKeyRange + count() - count all 10");
            });
            db$4.users.where("first").startsWith("First").limit(5).count(function (count) {
                QUnit.equal(count, 5, "IDBKeyRange + count(): limit(5)");
            });
            db$4.users.where("first").startsWith("First").offset(7).count(function (count) {
                QUnit.equal(count, 3, "IDBKeyRange + count(): offset(7)");
            });
            db$4.users.where("first").startsWith("First").offset(6).limit(4).count(function (count) {
                QUnit.equal(count, 4, "IDBKeyRange + count(): offset(6)");
            });
            db$4.users.where("first").startsWith("First").offset(7).limit(4).count(function (count) {
                QUnit.equal(count, 3, "IDBKeyRange + count(): offset(7).limit(4)");
            });
            db$4.users.where("first").startsWith("First").offset(17).limit(4).count(function (count) {
                QUnit.equal(count, 0, "IDBKeyRange + count(): offset(17).limit(4)");
            });
            // Using IDBKeyRange + toArray()
            db$4.users.where("first").startsWith("First").limit(5).toArray(function (a) {
                QUnit.equal(a.length, 5, "IDBKeyRange + toArray(): limit(5)");
            });
            db$4.users.where("first").startsWith("First").offset(7).toArray(function (a) {
                QUnit.equal(a.length, 3, "IDBKeyRange + toArray(): offset(7)");
            });
            db$4.users.where("first").startsWith("First").offset(6).limit(4).toArray(function (a) {
                QUnit.equal(a.length, 4, "IDBKeyRange + toArray(): offset(6).limit(4)");
            });
            db$4.users.where("first").startsWith("First").offset(7).limit(4).toArray(function (a) {
                QUnit.equal(a.length, 3, "IDBKeyRange + toArray(): offset(7).limit(4)");
            });
            db$4.users.where("first").startsWith("First").offset(17).limit(4).toArray(function (a) {
                QUnit.equal(a.length, 0, "IDBKeyRange + toArray(): offset(17).limit(4)");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("first", 1, function () {
        db$4.users.orderBy("last").first(function (karlCeder) {
            QUnit.equal(karlCeder.first, "Karl", "Got Karl");
        }).finally(QUnit.start);
    });
    QUnit.asyncTest("last", function () {
        db$4.users.orderBy("last").last(function (david) {
            QUnit.equal(david.first, "David", "Got David");
        }).finally(QUnit.start);
    });
    QUnit.asyncTest("and", 2, function () {
        db$4.transaction("r", db$4.users, function () {

            db$4.users.where("first").equalsIgnoreCase("david").and(function (user) {
                return user.email.indexOf("apa") >= 0;
            }).first(function (user) {
                QUnit.equal(user, null, "Found no user with first name 'david' and email 'apa'");
            });

            db$4.users.where("first").equalsIgnoreCase("david").and(function (user) {
                return user.email.indexOf("daw@thridi.com") >= 0;
            }).first(function (user) {
                QUnit.equal(user.first, "David", "Found user with first name 'david' and email 'daw@thridi.com'");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("reverse", function () {
        db$4.transaction("r", db$4.users, function () {
            db$4.users.orderBy("first").reverse().first(function (user) {
                QUnit.equal(user.first, "Karl", "Got Karl");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    if (!supports("multiEntry")) {
        QUnit.test("distinct", function () {
            return QUnit.ok(true, "SKIPPED - MULTIENTRY UNSUPPORTED");
        });
    } else {
        QUnit.asyncTest("distinct", function () {
            db$4.transaction("r", db$4.users, function () {

                db$4.users.where("email").startsWithIgnoreCase("d").toArray(function (a) {
                    QUnit.equal(a.length, 2, "Got two duplicates of David since he has two email addresses starting with 'd' (Fails on IE10, IE11 due to not supporting multivalued array indexes)");
                });
                db$4.users.where("email").startsWithIgnoreCase("d").distinct().toArray(function (a) {
                    QUnit.equal(a.length, 1, "Got single instance of David since we used the distinct() method. (Fails on IE10, IE11 due to not supporting multivalued array indexes)");
                });
            }).catch(function (e) {
                QUnit.ok(false, e);
            }).finally(QUnit.start);
        });
    }

    QUnit.asyncTest("modify", function () {
        db$4.transaction("rw", db$4.users, function () {
            var currentTime = new Date();
            db$4.users.toCollection().modify({
                lastUpdated: currentTime
            }).then(function (count) {
                QUnit.equal(count, 2, "Promise supplied the number of modifications made");
            });
            db$4.users.toArray(function (a) {
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
        db$4.transaction("rw", db$4.users, function () {
            var currentTime = new Date();
            db$4.users.toCollection().modify(function (user) {
                user.fullName = user.first + " " + user.last;
                user.lastUpdated = currentTime;
            });
            db$4.users.toArray(function (a) {
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
        db$4.transaction("rw", db$4.users, function () {
            var currentTime = new Date();
            db$4.users.toCollection().modify(function (user) {
                user.id = 1;
                user.fullName = user.first + " " + user.last;
                user.lastUpdated = currentTime;
            });
            db$4.users.toArray(function (a) {
                QUnit.ok(false, "Should not come here, beacuse we should get error when setting all primkey to 1");
            });
        }).catch(Dexie.ModifyError, function (e) {
            QUnit.ok(true, "Got ModifyError: " + e);
            QUnit.equal(e.successCount, 1, "Succeeded with the first entry but not the second");
        }).catch(function (e) {
            QUnit.ok(false, "Another error than the expected was thrown: " + e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("delete", 2, function () {
        db$4.users.orderBy("id").delete().then(function (count) {
            QUnit.equal(count, 2, "All two records deleted");
            return db$4.users.count(function (count) {
                QUnit.equal(count, 0, "No users in collection anymore");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("delete(2)", 3, function () {
        db$4.transaction("rw", db$4.users, function () {
            db$4.users.add({ id: 3, first: "dAvid", last: "Helenius", username: "dahel" });
            db$4.users.where("first").equalsIgnoreCase("david").delete().then(function (deleteCount) {
                QUnit.equal(deleteCount, 2, "Two items deleted (Both davids)");
            });
            db$4.users.toArray(function (a) {
                QUnit.equal(a.length, 1, "Deleted one user");
                QUnit.equal(a[0].first, "Karl", "Only Karl is there now");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("delete(3, combine with OR)", 3, function () {
        db$4.transaction("rw", db$4.users, function () {
            db$4.users.add({ id: 3, first: "dAvid", last: "Helenius", username: "dahel" });
            db$4.users.where("first").equals("dAvid").or("username").equals("kceder").delete().then(function (deleteCount) {
                QUnit.equal(deleteCount, 2, "Two items deleted (Both dAvid Helenius and Karl Cedersköld)");
            });
            db$4.users.toArray(function (a) {
                QUnit.equal(a.length, 1, "Only one item left since dAvid and Karl have been deleted");
                QUnit.equal(a[0].first, "David", "Only David Fahlander is there now!");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("keys", function () {
        db$4.users.orderBy("first").keys(function (a) {
            QUnit.ok(a.length, 2);
            QUnit.equal(a[0], "David", "First is David");
            QUnit.equal(a[1], "Karl", "Second is Karl");
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("uniqueKeys", function () {
        db$4.transaction("rw", db$4.users, function () {
            db$4.users.add({ id: 3, first: "David", last: "Helenius", username: "dahel" });
            db$4.users.orderBy("first").keys(function (a) {
                QUnit.ok(a.length, 3, "when not using uniqueKeys, length is 3");
                QUnit.equal(a[0], "David", "First is David");
                QUnit.equal(a[1], "David", "Second is David");
                QUnit.equal(a[2], "Karl", "Third is Karl");
            });
            db$4.users.orderBy("first").uniqueKeys(function (a) {
                QUnit.ok(a.length, 2, "when using uniqueKeys, length is 2");
                QUnit.equal(a[0], "David", "First is David");
                QUnit.equal(a[1], "Karl", "Second is Karl");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("primaryKeys", function () {
        db$4.users.orderBy("last").primaryKeys(function (a) {
            QUnit.ok(a.length, 2);
            QUnit.equal(a[0], 2, "Second is Karl");
            QUnit.equal(a[1], 1, "First is David");
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("primaryKeys2", function () {
        db$4.users.orderBy("first").primaryKeys(function (a) {
            QUnit.ok(a.length, 2);
            QUnit.equal(a[0], 1, "First is David");
            QUnit.equal(a[1], 2, "Second is Karl");
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("eachKey and eachUniqueKey", function () {
        db$4.transaction("rw", db$4.users, function () {
            db$4.users.add({ id: 3, first: "Ylva", last: "Fahlander", username: "yfahlander" });
            var a = [];
            db$4.users.orderBy("last").eachKey(function (lastName) {
                a.push(lastName);
            }).then(function () {
                QUnit.equal(a.length, 3, "When using eachKey, number of keys are 3");
            });
            var a2 = [];
            db$4.users.orderBy("last").eachUniqueKey(function (lastName) {
                a2.push(lastName);
            }).then(function () {
                QUnit.equal(a2.length, 2, "When using eachUniqueKey, number of keys are 2");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("or", 14, function () {
        db$4.transaction("rw", db$4.users, function () {
            db$4.users.add({ id: 3, first: "Apan", last: "Japan", username: "apanjapan" });
            db$4.users.where("first").equalsIgnoreCase("david").or("last").equals("Japan").sortBy("first", function (a) {
                QUnit.equal(a.length, 2, "Got two users");
                QUnit.equal(a[0].first, "Apan", "First is Apan");
                QUnit.equal(a[1].first, "David", "Second is David");
            });
            db$4.users.where("first").equalsIgnoreCase("david").or("last").equals("Japan").or("id").equals(2).sortBy("id", function (a) {
                QUnit.equal(a.length, 3, "Got three users");
                QUnit.equal(a[0].first, "David", "First is David");
                QUnit.equal(a[1].first, "Karl", "Second is Karl");
                QUnit.equal(a[2].first, "Apan", "Third is Apan");
            });
            var userArray = [];
            db$4.users.where("id").anyOf(1, 2, 3, 4).or("username").anyOf("dfahlander", "kceder", "apanjapan").each(function (user) {
                QUnit.ok(true, "Found: " + JSON.stringify(user));
                userArray.push(user);
            }).then(function () {
                QUnit.equal(userArray.length, 3, "Got all three users");
                QUnit.ok(userArray.some(function (user) {
                    return user.first === "David";
                }), "David was found");
                QUnit.ok(userArray.some(function (user) {
                    return user.first === "Karl";
                }), "Karl was found");
                QUnit.ok(userArray.some(function (user) {
                    return user.first === "Apan";
                }), "Apan was found");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("or-issue#15-test", function () {
        var db = new Dexie("MyDB_issue15");
        db.version(1).stores({
            phones: "++id, additionalFeatures, android, availability, battery, camera, connectivity, description, display, hardware, id, images, name, sizeAndWeight, storage"
        });
        db.on('populate', function () {
            QUnit.ok(true, "on(populate) called");
            for (var i = 0; i < 100; ++i) {
                db.phones.add({ id: 3 + i, name: "Name" + randomString(16), additionalFeatures: [randomString(10)], android: 1, availability: 0, battery: 1, camera: 1 });
            }

            function randomString(count) {
                var ms = [];
                for (var i = 0; i < count; ++i) {
                    ms.push(String.fromCharCode(32 + Math.floor(Math.random() * 96)));
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
        db$4.transaction("rw", db$4.users, function () {
            db$4.users.add({ id: 3, first: "Apa1", username: "apa1" });
            db$4.users.add({ id: 4, first: "Apa2", username: "apa2" });
            db$4.users.add({ id: 5, first: "Apa3", username: "apa3" });

            // Checking that it stops immediately when first item is the stop item:
            db$4.users.orderBy(":id").until(function (user) {
                return user.first == "David";
            }).toArray(function (a) {
                QUnit.equal(0, a.length, "Stopped immediately because David has ID 1");
            });

            // Checking that specifying includeStopEntry = true will include the stop entry.
            db$4.users.orderBy(":id").until(function (user) {
                return user.first == "David";
            }, true).toArray(function (a) {
                QUnit.equal(1, a.length, "Got the stop entry when specifying includeStopEntry = true");
                QUnit.equal("David", a[0].first, "Name is David");
            });

            // Checking that when sorting on first name and stopping on David, we'll get the apes.
            db$4.users.orderBy("first").until(function (user) {
                return user.first == "David";
            }).toArray(function (a) {
                QUnit.equal(3, a.length, "Got 3 users only (3 apes) because the Apes comes before David and Karl when ordering by first name");
                QUnit.equal("apa1", a[0].username, "First is apa1");
                QUnit.equal("apa2", a[1].username, "Second is apa2");
                QUnit.equal("apa3", a[2].username, "Third is apa3");
            });

            // Checking that reverse() affects the until() method as expected:
            db$4.users.orderBy("first").reverse().until(function (user) {
                return user.username == "apa2";
            }).toArray(function (a) {
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
        db$4.users.orderBy('last').firstKey(function (key) {
            QUnit.equal("Cedersköld", key, "First lastName is Cedersköld");
        }).catch(function (e) {
            QUnit.ok(false, e.stack || e);
        }).finally(function () {
            QUnit.start();
        });
    });

    QUnit.asyncTest("lastKey", function () {
        db$4.users.orderBy('last').lastKey(function (key) {
            QUnit.equal("Fahlander", key, "Last lastName is Fahlander");
        }).catch(function (e) {
            QUnit.ok(false, e.stack || e);
        }).finally(function () {
            QUnit.start();
        });
    });

    QUnit.asyncTest("firstKey on primary key", function () {
        db$4.users.toCollection().firstKey(function (key) {
            QUnit.equal(key, 1, "First key is 1");
        }).catch(function (e) {
            QUnit.ok(false, e.stack || e);
        }).finally(function () {
            QUnit.start();
        });
    });

    QUnit.asyncTest("lastKey on primary key", function () {
        db$4.users.toCollection().lastKey(function (key) {
            QUnit.equal(key, 2, "lastKey is 2");
        }).catch(function (e) {
            QUnit.ok(false, e.stack || e);
        }).finally(function () {
            QUnit.start();
        });
    });

    QUnit.asyncTest("Promise chain from within each() operation", 2, function () {
        db$4.transaction('r', db$4.users, function () {
            db$4.users.each(function (user) {
                db$4.users.where('id').equals(user.id).first(function (usr) {
                    return db$4.users.where('id').equals(usr.id).first();
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

    var db$5 = new Dexie("TestDBTable");
    db$5.version(1).stores({
        users: "++id,first,last,&username,*&email,*pets",
        folks: "++,first,last"
    });

    var User$1 = db$5.users.defineClass({
        id: Number,
        first: String,
        last: String,
        username: String,
        email: [String],
        pets: [String]
    });
    var idOfFirstUser = 0;
    var idOfLastUser = 0;
    db$5.on("populate", function (trans) {
        db$5.users.add({ first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] }).then(function (id) {
            idOfFirstUser = id;
        });
        db$5.users.add({ first: "Karl", last: "Faadersköld", username: "kceder", email: ["karl@ceder.what", "dadda@ceder.what"], pets: [] }).then(function (id) {
            idOfLastUser = id;
        });
    });

    QUnit.module("table", {
        setup: function () {
            QUnit.stop();
            resetDatabase(db$5).catch(function (e) {
                QUnit.ok(false, "Error resetting database: " + e.stack);
            }).finally(QUnit.start);
        },
        teardown: function () {}
    });

    QUnit.asyncTest("get", 4, function () {
        db$5.table("users").get(idOfFirstUser).then(function (obj) {
            QUnit.equal(obj.first, "David", "Got the first object");
            return db$5.users.get(idOfLastUser);
        }).then(function (obj) {
            QUnit.equal(obj.first, "Karl", "Got the second object");
            return db$5.users.get("nonexisting key");
        }).then(function (obj) {
            QUnit.ok(true, "Got then() even when getting non-existing object");
            QUnit.equal(obj, undefined, "Result is 'undefined' when not existing");
        }).catch(function (err) {
            QUnit.ok(false, "Error: " + err);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("where", function () {
        db$5.transaction("r", db$5.users, function () {
            db$5.users.where("username").equals("kceder").first(function (user) {
                QUnit.equal(user.first, "Karl", "where().equals()");
            }), db$5.users.where("id").above(idOfFirstUser).toArray(function (a) {
                QUnit.ok(a.length == 1, "where().above()");
            }), db$5.users.where("id").aboveOrEqual(idOfFirstUser).toArray(function (a) {
                QUnit.ok(a.length == 2, "where().aboveOrEqual()");
            }), db$5.users.where("id").below(idOfLastUser).count(function (count) {
                QUnit.ok(count == 1, "where().below().count()");
            }), db$5.users.where("id").below(idOfFirstUser).count(function (count) {
                QUnit.ok(count == 0, "where().below().count() should be zero");
            }), db$5.users.where("id").belowOrEqual(idOfFirstUser).count(function (count) {
                QUnit.ok(count == 1, "where().belowOrEqual()");
            }), db$5.users.where("id").between(idOfFirstUser, idOfFirstUser).count(function (count) {
                QUnit.ok(count == 0, "where().between(1, 1)");
            }), db$5.users.where("id").between(0, Infinity).count(function (count) {
                QUnit.ok(count == 2, "where().between(0, Infinity)");
            }), db$5.users.where("id").between(idOfFirstUser, idOfFirstUser, true, true).count(function (count) {
                QUnit.ok(count == 1, "where().between(1, 1, true, true)");
            }), db$5.users.where("id").between(1, -1, true, true).count(function (count) {
                QUnit.ok(count == 0, "where().between(1, -1, true, true)");
            }), db$5.users.where("id").between(idOfFirstUser, idOfLastUser).count(function (count) {
                QUnit.ok(count == 1, "where().between(1, 2)");
            }), db$5.users.where("id").between(idOfFirstUser, idOfLastUser, true, true).count(function (count) {
                QUnit.ok(count == 2, "where().between(1, 2, true, true)");
            }), db$5.users.where("id").between(idOfFirstUser, idOfLastUser, false, false).count(function (count) {
                QUnit.ok(count == 0, "where().between(1, 2, false, false)");
            });
            db$5.users.where("last").startsWith("Fah").toArray(function (a) {
                QUnit.equal(a.length, 1, "where().startsWith(existing) only matches Fahlander, not Faadersköld");
                QUnit.equal(a[0].first, "David");
            });
            db$5.users.where("last").startsWith("Faa").toArray(function (a) {
                QUnit.equal(a.length, 1, "where().startsWith(existing) only matches Faadersköld, not Fahlander");
                QUnit.equal(a[0].first, "Karl");
            });
            db$5.users.where("last").startsWith("Fa").toArray(function (a) {
                QUnit.equal(a.length, 2, "length = 2 on: where().startsWith(2 existing)");
                QUnit.equal(a[0].first, "Karl", "Karl found first on last 'Faadersköld'");
                QUnit.equal(a[1].first, "David", "David found second on last 'Fahlander'");
            });
            db$5.users.where("last").anyOf("Fahlander", "Faadersköld").toArray(function (a) {
                QUnit.equal(a.length, 2, "in() returned expected number of items");
                QUnit.equal(a[0].last, "Faadersköld", "Faadersköld is first");
            });
            db$5.users.where("last").anyOf("Fahlander", "Faadersköld").reverse().toArray(function (a) {
                QUnit.equal(a.length, 2, "in().reverse() returned expected number of items");
                QUnit.equal(a[0].last, "Fahlander", "Fahlander is first");
            });
            db$5.users.where("last").anyOf("Faadersköld").toArray(function (a) {
                QUnit.equal(a.length, 1, "in() returned expected number of items");
            });

            if (supports("multiEntry")) {
                db$5.users.where("email").equals("david@awarica.com").toArray(function (a) {
                    // Fails in IE with 0 due to that IE is not implementing to index string arrays.
                    QUnit.equal(a.length, 1, "Finding items from array members. Expect to fail on IE10/IE11.");
                });
                db$5.users.where("email").startsWith("da").distinct().toArray(function (a) {
                    // Fails on IE with 0
                    QUnit.equal(a.length, 2, "Found both because both have emails starting with 'da'. Expect to fail on IE10/IE11.");
                });
            } else {
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
        db$5.users.count(function (count) {
            QUnit.equal(count, 2, "Table.count()");
        }).catch(function (e) {
            QUnit.ok(false, e.message);
        }).finally(function () {
            QUnit.start();
        });;
    });
    QUnit.asyncTest("count with limit", function () {
        db$5.users.limit(1).count(function (count) {
            QUnit.equal(count, 1, "Table.limit().count()");
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });
    QUnit.asyncTest("limit(),orderBy(),modify(), abort(), reverse()", function () {
        db$5.transaction("rw", db$5.users, function () {
            // Modify first found user with a helloMessage
            db$5.users.orderBy("first").reverse().limit(1).modify(function (user) {
                user.helloMessage = "Hello " + user.first;
            });

            // Check that the modification went fine:
            db$5.users.orderBy("first").reverse().toArray(function (a) {
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
        db$5.users.filter(function (user) {
            return user.email.indexOf("david@awarica.com") != -1;
        }).toArray(function (davids) {
            QUnit.equal(1, davids.length, "Got one David");
            QUnit.equal("David", davids[0].first, "The name of the David is David");
        }).catch(function (e) {
            QUnit.ok(false, e.stack || e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("each", function () {
        var users = [];
        db$5.users.each(function (user) {
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
        db$5.transaction("rw", db$5.users, function () {
            var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };
            db$5.users.put(newUser).then(function (id) {
                QUnit.ok(id > idOfLastUser, "Got id " + id + " because we didnt supply an id");
                QUnit.equal(newUser.id, id, "The id property of the new user was set");
            });
            db$5.users.where("username").equals("aper").first(function (user) {
                QUnit.equal(user.last, "Persbrant", "The correct item was actually added");
                user.last = "ChangedLastName";
                var currentId = user.id;
                db$5.users.put(user).then(function (id) {
                    QUnit.equal(id, currentId, "Still got same id because we update same object");
                });
                db$5.users.where("last").equals("ChangedLastName").first(function (user) {
                    QUnit.equal(user.last, "ChangedLastName", "LastName was successfully changed");
                });
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("put-no-transaction", function () {
        var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };
        db$5.users.put(newUser).then(function (id) {
            QUnit.ok(id > idOfLastUser, "Got id " + id + " because we didnt supply an id");
            QUnit.equal(newUser.id, id, "The id property of the new user was set");
            return db$5.users.where("username").equals("aper").first(function (user) {
                QUnit.equal(user.last, "Persbrant", "The correct item was actually added");
                user.last = "ChangedLastName";
                var userId = user.id;
                return db$5.users.put(user).then(function (id) {
                    QUnit.equal(id, userId, "Still got same id because we update same object");
                    return db$5.users.where("last").equals("ChangedLastName").first(function (user) {
                        QUnit.equal(user.last, "ChangedLastName", "LastName was successfully changed");
                    });
                });
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("add", function () {
        db$5.transaction("rw", db$5.users, function () {
            var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };

            db$5.users.add(newUser).then(function (id) {
                QUnit.ok(id > idOfLastUser, "Got id " + id + " because we didnt supply an id");
                QUnit.equal(newUser.id, id, "The id property of the new user was set");
            });

            db$5.users.where("username").equals("aper").first(function (user) {
                QUnit.equal(user.last, "Persbrant", "The correct item was actually added");
            });
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e);
        }).finally(QUnit.start);
    });

    spawnedTest("bulkAdd", regeneratorRuntime.mark(function _callee() {
        var highestKey, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return db$5.users.add({ username: "fsdkljfd", email: ["fjkljslk"] });

                    case 2:
                        highestKey = _context.sent;

                        QUnit.ok(true, "Highest key was: " + highestKey);
                        // Delete test item.
                        _context.next = 6;
                        return db$5.users.delete(highestKey);

                    case 6:
                        QUnit.ok(true, "Deleted test item");
                        _context.next = 9;
                        return db$5.users.bulkAdd([{ first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] }, { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }]);

                    case 9:
                        result = _context.sent;

                        QUnit.equal(result, highestKey + 2, "Result of bulkAdd() operation was equal to highestKey + 2");

                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    spawnedTest("bulkAdd-catching errors", regeneratorRuntime.mark(function _callee3() {
        var newUsersX, newUsersY, newUsersZ;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return db$5.transaction("rw", db$5.users, function () {
                            var newUsers = [{ first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] }, { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // Should fail
                            { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }];
                            db$5.users.bulkAdd(newUsers).then(function () {
                                QUnit.ok(false, "Should not resolve when one operation failed");
                            }).catch(Dexie.BulkError, function (e) {
                                QUnit.ok(true, "Got BulkError: " + e.message);
                                QUnit.equal(e.failures.length, 1, "One error due to a duplicate username: " + e.failures[0]);
                            });

                            // Now, since we catched the error, the transaction should continue living.
                            db$5.users.where("username").startsWith("aper").count(function (count) {
                                QUnit.equal(count, 3, "Got three matches now when users are bulk-added");
                            });
                        });

                    case 2:
                        _context3.next = 4;
                        return db$5.users.where("username").startsWith('aper').count();

                    case 4:
                        _context3.t0 = _context3.sent;
                        QUnit.equal(_context3.t0, 3, "Previous transaction committed");
                        newUsersX = [{ first: "Xke1", last: "Persbrant1", username: "xper1", email: ["xper1@persbrant.net"] }, { first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"] }, { first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"] }, // Should fail
                        { first: "Xke3", last: "Persbrant3", username: "xper3", email: ["xper3@persbrant.net"] }];
                        _context3.prev = 7;
                        _context3.next = 10;
                        return db$5.transaction("rw", db$5.users, function () {
                            db$5.users.bulkAdd(newUsersX).then(function () {
                                QUnit.ok(false, "Should not resolve");
                            });
                        });

                    case 10:
                        QUnit.ok(false, "Should not come here");
                        _context3.next = 16;
                        break;

                    case 13:
                        _context3.prev = 13;
                        _context3.t1 = _context3['catch'](7);

                        QUnit.ok(true, "Got: " + _context3.t1);

                    case 16:
                        _context3.next = 18;
                        return db$5.users.where('username').startsWith('xper').count();

                    case 18:
                        _context3.t2 = _context3.sent;
                        QUnit.equal(_context3.t2, 0, "0 users! Good, means that previous transaction did not commit");
                        _context3.next = 22;
                        return db$5.users.bulkAdd(newUsersX).catch(function (e) {
                            QUnit.ok(true, "Got error. Catching it should make the successors work.");
                        });

                    case 22:
                        _context3.next = 24;
                        return db$5.users.where('username').startsWith('xper').count();

                    case 24:
                        _context3.t3 = _context3.sent;
                        QUnit.equal(_context3.t3, 3, "3 users! Good - means that previous operation catched and therefore committed");
                        newUsersY = [{ first: "Yke1", last: "Persbrant1", username: "yper1", email: ["yper1@persbrant.net"] }, { first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"] }, { first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"] }, // Should fail
                        { first: "Yke3", last: "Persbrant3", username: "yper3", email: ["yper3@persbrant.net"] }];

                        // Now check that catching the operation via try..catch should also make it succeed.

                        _context3.prev = 27;
                        _context3.next = 30;
                        return db$5.users.bulkAdd(newUsersY);

                    case 30:
                        _context3.next = 35;
                        break;

                    case 32:
                        _context3.prev = 32;
                        _context3.t4 = _context3['catch'](27);

                        QUnit.ok(true, "Got: " + _context3.t4);

                    case 35:
                        _context3.next = 37;
                        return db$5.users.where('username').startsWith('yper').count();

                    case 37:
                        _context3.t5 = _context3.sent;
                        QUnit.equal(_context3.t5, 3, "3 users! Good - means that previous operation catched (via try..yield..catch this time, and therefore committed");


                        // Now check that catching and rethrowing should indeed make it fail
                        newUsersZ = [{ first: "Zke1", last: "Persbrant1", username: "zper1", email: ["zper1@persbrant.net"] }, { first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"] }, { first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"] }, // Should fail
                        { first: "Zke3", last: "Persbrant3", username: "zper3", email: ["zper3@persbrant.net"] }];
                        _context3.next = 42;
                        return db$5.transaction('rw', db$5.users, regeneratorRuntime.mark(function _callee2() {
                            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                while (1) {
                                    switch (_context2.prev = _context2.next) {
                                        case 0:
                                            _context2.prev = 0;
                                            _context2.next = 3;
                                            return db$5.users.bulkAdd(newUsersZ);

                                        case 3:
                                            _context2.next = 8;
                                            break;

                                        case 5:
                                            _context2.prev = 5;
                                            _context2.t0 = _context2['catch'](0);
                                            throw _context2.t0;

                                        case 8:
                                        case 'end':
                                            return _context2.stop();
                                    }
                                }
                            }, _callee2, this, [[0, 5]]);
                        })).catch(Dexie.BulkError, function (e) {
                            QUnit.ok(true, "Got rethrown BulkError: " + e.stack);
                        });

                    case 42:
                        _context3.next = 44;
                        return db$5.users.where('username').startsWith('zper').count();

                    case 44:
                        _context3.t6 = _context3.sent;
                        QUnit.equal(_context3.t6, 0, "0 users! Good - means that previous operation rethrown (via try..yield..catch--throw this time, and therefore not committed");

                    case 46:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[7, 13], [27, 32]]);
    }));

    spawnedTest("bulkAdd-non-inbound-autoincrement", regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return db$5.folks.bulkAdd([{ first: "Foo", last: "Bar" }, { first: "Foo", last: "Bar2" }, { first: "Foo", last: "Bar3" }, { first: "Foo", last: "Bar4" }]);

                    case 2:
                        _context4.next = 4;
                        return db$5.folks.where('first').equals('Foo').count();

                    case 4:
                        _context4.t0 = _context4.sent;
                        QUnit.equal(_context4.t0, 4, "Should be 4 Foos");
                        _context4.next = 8;
                        return db$5.folks.where('last').equals('Bar').count();

                    case 8:
                        _context4.t1 = _context4.sent;
                        QUnit.equal(_context4.t1, 1, "Shoudl be 1 Bar");

                    case 10:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    spawnedTest("bulkAdd-catch sub transaction", regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return db$5.transaction('rw', db$5.users, function () {
                            var newUsers = [{ first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] }, { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // Should fail
                            { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }];
                            db$5.transaction('rw', db$5.users, function () {
                                db$5.users.bulkAdd(newUsers);
                            }).then(function () {
                                QUnit.ok(false, "Should not succeed with all these operations");
                            }).catch(function (e) {
                                QUnit.equal(e.failures.length, 1, "Should get one failure");
                            });
                        }).catch(function (e) {
                            QUnit.ok(true, "Outer transaction aborted due to inner transaction abort. This is ok: " + e);
                        });

                    case 2:
                        _context5.next = 4;
                        return db$5.users.where('username').startsWith('aper').count();

                    case 4:
                        _context5.t0 = _context5.sent;
                        QUnit.equal(_context5.t0, 0, "0 users! Good, means that inner transaction did not commit");

                    case 6:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    spawnedTest("bulkPut", regeneratorRuntime.mark(function _callee6() {
        var highestKey, existingFirstUserToReplace, result, ourAddedUsers, replacedDfahlander;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.next = 2;
                        return db$5.users.add({ username: "fsdkljfd", email: ["fjkljslk"] });

                    case 2:
                        highestKey = _context6.sent;

                        QUnit.ok(true, "Highest key was: " + highestKey);
                        // Delete test item.
                        _context6.next = 6;
                        return db$5.users.delete(highestKey);

                    case 6:
                        QUnit.ok(true, "Deleted test item");
                        _context6.next = 9;
                        return db$5.users.get(idOfFirstUser);

                    case 9:
                        existingFirstUserToReplace = _context6.sent;

                        QUnit.equal(existingFirstUserToReplace.username, "dfahlander", "Existing user should be dfahlander");
                        _context6.next = 13;
                        return db$5.users.bulkPut([{ first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] }, { id: idOfFirstUser, first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }]);

                    case 13:
                        result = _context6.sent;

                        QUnit.equal(result, highestKey + 2, "Result of bulkPut() operation was equal to highestKey + 2");
                        _context6.next = 17;
                        return db$5.users.where('username').startsWith("aper").toArray();

                    case 17:
                        ourAddedUsers = _context6.sent;

                        QUnit.equal(ourAddedUsers.length, 3, "Should have put 3 users there (two additions and one replaced");
                        _context6.next = 21;
                        return db$5.users.get(idOfFirstUser);

                    case 21:
                        replacedDfahlander = _context6.sent;

                        QUnit.equal(replacedDfahlander.username, "aper2", "dfahlander Should now be aper2 instead");

                    case 23:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    spawnedTest("bulkPut with overlapping objects", regeneratorRuntime.mark(function _callee7() {
        var theOne;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.next = 2;
                        return db$5.users.bulkPut([{
                            id: "sdjls83",
                            first: "Daveious"
                        }, {
                            id: "sdjls83",
                            last: "Olvono"
                        }]);

                    case 2:
                        _context7.next = 4;
                        return db$5.users.get("sdjls83");

                    case 4:
                        theOne = _context7.sent;

                        QUnit.equal(theOne.last, "Olvono", "Last item is the one inserted");
                        QUnit.ok(theOne.first === undefined, "Object doesnt have a first property");

                    case 7:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    spawnedTest("bulkPut-catching errors", regeneratorRuntime.mark(function _callee9() {
        var newUsersX, newUsersY, newUsersZ;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        _context9.next = 2;
                        return db$5.transaction("rw", db$5.users, function () {
                            var newUsers = [{ first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] }, { id: idOfLastUser, first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // update success
                            { id: idOfFirstUser, first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // update should fail
                            { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // Add should fail
                            { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }];
                            db$5.users.bulkPut(newUsers).then(function () {
                                QUnit.ok(false, "Should not resolve when one operation failed");
                            }).catch(Dexie.BulkError, function (e) {
                                QUnit.ok(true, "Got BulkError: " + e.message);
                                QUnit.equal(e.failures.length, 2, "Two errors due to a duplicate username: " + e.failures[0]);
                            });

                            // Now, since we catched the error, the transaction should continue living.
                            db$5.users.where("username").startsWith("aper").count(function (count) {
                                QUnit.equal(count, 3, "Got three matches now when users are bulk-putted");
                            });
                        });

                    case 2:
                        _context9.next = 4;
                        return db$5.users.where("username").startsWith('aper').count();

                    case 4:
                        _context9.t0 = _context9.sent;
                        QUnit.equal(_context9.t0, 3, "Previous transaction committed");
                        newUsersX = [{ first: "Xke1", last: "Persbrant1", username: "xper1", email: ["xper1@persbrant.net"] }, { id: idOfLastUser, first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"] }, { first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"] }, // Should fail (add)
                        { id: idOfFirstUser, first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"] }, // Should fail (update)
                        { first: "Xke3", last: "Persbrant3", username: "xper3", email: ["xper3@persbrant.net"] }];
                        _context9.prev = 7;
                        _context9.next = 10;
                        return db$5.transaction("rw", db$5.users, function () {
                            db$5.users.bulkPut(newUsersX).then(function () {
                                QUnit.ok(false, "Should not resolve");
                            });
                        });

                    case 10:
                        QUnit.ok(false, "Should not come here");
                        _context9.next = 16;
                        break;

                    case 13:
                        _context9.prev = 13;
                        _context9.t1 = _context9['catch'](7);

                        QUnit.ok(true, "Got: " + _context9.t1);

                    case 16:
                        _context9.next = 18;
                        return db$5.users.where('username').startsWith('xper').count();

                    case 18:
                        _context9.t2 = _context9.sent;
                        QUnit.equal(_context9.t2, 0, "0 users! Good, means that previous transaction did not commit");
                        _context9.next = 22;
                        return db$5.users.bulkPut(newUsersX).catch(function (e) {
                            QUnit.ok(true, "Got error. Catching it should make the successors work.");
                        });

                    case 22:
                        _context9.next = 24;
                        return db$5.users.where('username').startsWith('xper').count();

                    case 24:
                        _context9.t3 = _context9.sent;
                        QUnit.equal(_context9.t3, 3, "Should count to 3 users because previous operation was catched and therefore should have been committed");
                        newUsersY = [{ first: "Yke1", last: "Persbrant1", username: "yper1", email: ["yper1@persbrant.net"] }, { first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"] }, { id: idOfFirstUser, first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"] }, // Should fail
                        { first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"] }, // Should fail
                        { first: "Yke3", last: "Persbrant3", username: "yper3", email: ["yper3@persbrant.net"] }];

                        // Now check that catching the operation via try..catch should also make it succeed.

                        _context9.prev = 27;
                        _context9.next = 30;
                        return db$5.users.bulkPut(newUsersY);

                    case 30:
                        _context9.next = 35;
                        break;

                    case 32:
                        _context9.prev = 32;
                        _context9.t4 = _context9['catch'](27);

                        QUnit.ok(true, "Got: " + _context9.t4);

                    case 35:
                        _context9.next = 37;
                        return db$5.users.where('username').startsWith('yper').count();

                    case 37:
                        _context9.t5 = _context9.sent;
                        QUnit.equal(_context9.t5, 3, "Should count to 3 users because previous previous operation catched (via try..yield..catch this time, and therefore should have been committed");


                        // Now check that catching and rethrowing should indeed make it fail
                        newUsersZ = [{ first: "Zke1", last: "Persbrant1", username: "zper1", email: ["zper1@persbrant.net"] }, { first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"] }, { first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"] }, // Should fail
                        { id: idOfLastUser, first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"] }, // Should fail
                        { first: "Zke3", last: "Persbrant3", username: "zper3", email: ["zper3@persbrant.net"] }];
                        _context9.next = 42;
                        return db$5.transaction('rw', db$5.users, regeneratorRuntime.mark(function _callee8() {
                            return regeneratorRuntime.wrap(function _callee8$(_context8) {
                                while (1) {
                                    switch (_context8.prev = _context8.next) {
                                        case 0:
                                            _context8.prev = 0;
                                            _context8.next = 3;
                                            return db$5.users.bulkPut(newUsersZ);

                                        case 3:
                                            _context8.next = 8;
                                            break;

                                        case 5:
                                            _context8.prev = 5;
                                            _context8.t0 = _context8['catch'](0);
                                            throw _context8.t0;

                                        case 8:
                                        case 'end':
                                            return _context8.stop();
                                    }
                                }
                            }, _callee8, this, [[0, 5]]);
                        })).catch(Dexie.BulkError, function (e) {
                            QUnit.ok(true, "Got rethrown BulkError: " + e.stack);
                        });

                    case 42:
                        _context9.next = 44;
                        return db$5.users.where('username').startsWith('zper').count();

                    case 44:
                        _context9.t6 = _context9.sent;
                        QUnit.equal(_context9.t6, 0, "0 users! Good - means that previous operation rethrown (via try..yield..catch--throw this time, and therefore not committed");

                    case 46:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this, [[7, 13], [27, 32]]);
    }));

    spawnedTest("bulkPut-non-inbound-autoincrement", regeneratorRuntime.mark(function _callee10() {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return db$5.folks.bulkPut([{ first: "Foo", last: "Bar" }, { first: "Foo", last: "Bar2" }, { first: "Foo", last: "Bar3" }, { first: "Foo", last: "Bar4" }]);

                    case 2:
                        _context10.next = 4;
                        return db$5.folks.where('first').equals('Foo').count();

                    case 4:
                        _context10.t0 = _context10.sent;
                        QUnit.equal(_context10.t0, 4, "Should be 4 Foos");
                        _context10.next = 8;
                        return db$5.folks.where('last').equals('Bar').count();

                    case 8:
                        _context10.t1 = _context10.sent;
                        QUnit.equal(_context10.t1, 1, "Should be 1 Bar");

                    case 10:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }));

    spawnedTest("bulkPut - mixed inbound autoIncrement", regeneratorRuntime.mark(function _callee11() {
        var lastId, newLastId, foo2s;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        _context11.next = 2;
                        return db$5.users.bulkPut([{ first: "Foo", last: "Bar" }, { first: "Foo", last: "Bar2" }, { first: "Foo", last: "Bar3" }, { first: "Foo", last: "Bar4" }]);

                    case 2:
                        lastId = _context11.sent;
                        _context11.next = 5;
                        return db$5.users.where('first').equals('Foo').count();

                    case 5:
                        _context11.t0 = _context11.sent;
                        QUnit.equal(_context11.t0, 4, "Should be 4 Foos");
                        _context11.next = 9;
                        return db$5.users.where('last').equals('Bar').count();

                    case 9:
                        _context11.t1 = _context11.sent;
                        QUnit.equal(_context11.t1, 1, "Should be 1 Bar");
                        _context11.next = 13;
                        return db$5.users.bulkPut([{ id: lastId - 3, first: "Foo2", last: "BarA" }, // Will update "Foo Bar" to "Foo2 BarA"
                        { first: "Foo2", last: "BarB" }, // Will create
                        { id: lastId - 1, first: "Foo2", last: "BarC" }, // Will update "Foo Bar3" to "Foo2 BarC"
                        { first: "Foo2", last: "BarD" } // Will create
                        ]);

                    case 13:
                        newLastId = _context11.sent;

                        QUnit.equal(newLastId, lastId + 2, "Should have incremented last ID twice now");
                        _context11.next = 17;
                        return db$5.users.where('first').equals('Foo').count();

                    case 17:
                        _context11.t2 = _context11.sent;
                        QUnit.equal(_context11.t2, 2, "Should be 2 Foos now");
                        _context11.next = 21;
                        return db$5.users.where('first').equals('Foo2').count();

                    case 21:
                        _context11.t3 = _context11.sent;
                        QUnit.equal(_context11.t3, 4, "Should be 4 Foo2s now");
                        _context11.next = 25;
                        return db$5.users.where('first').equals('Foo2').toArray();

                    case 25:
                        foo2s = _context11.sent;

                        QUnit.equal(foo2s[0].last, "BarA", "BarA should be first (updated previous ID)");
                        QUnit.equal(foo2s[1].last, "BarC", "BarC should be second (updated previous ID");
                        QUnit.equal(foo2s[2].last, "BarB", "BarB should be third (got new key)");
                        QUnit.equal(foo2s[3].last, "BarD", "BarD should be forth (got new key)");

                    case 30:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    }));

    spawnedTest("bulkPut-catch sub transaction", regeneratorRuntime.mark(function _callee12() {
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        _context12.next = 2;
                        return db$5.transaction('rw', db$5.users, function () {
                            var newUsers = [{ first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] }, { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // Should fail
                            { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }];
                            db$5.transaction('rw', db$5.users, function () {
                                db$5.users.bulkPut(newUsers);
                            }).then(function () {
                                QUnit.ok(false, "Should not succeed with all these operations");
                            }).catch(function (e) {
                                QUnit.equal(e.failures.length, 1, "Should get one failure");
                            });
                        }).catch(function (e) {
                            QUnit.ok(true, "Outer transaction aborted due to inner transaction abort. This is ok: " + e);
                        });

                    case 2:
                        _context12.next = 4;
                        return db$5.users.where('username').startsWith('aper').count();

                    case 4:
                        _context12.t0 = _context12.sent;
                        QUnit.equal(_context12.t0, 0, "0 users! Good, means that inner transaction did not commit");

                    case 6:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this);
    }));

    spawnedTest("bulkDelete", regeneratorRuntime.mark(function _callee13() {
        var userKeys, userCount;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        _context13.next = 2;
                        return db$5.users.orderBy('id').keys();

                    case 2:
                        userKeys = _context13.sent;

                        QUnit.ok(userKeys.length > 0, "User keys found: " + userKeys.join(','));
                        _context13.next = 6;
                        return db$5.users.bulkDelete(userKeys);

                    case 6:
                        _context13.next = 8;
                        return db$5.users.count();

                    case 8:
                        userCount = _context13.sent;

                        QUnit.equal(userCount, 0, "Should be no users there now");

                    case 10:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee13, this);
    }));

    spawnedTest("bulkDelete - nonexisting keys", regeneratorRuntime.mark(function _callee14() {
        var userKeys, userCount;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        _context14.next = 2;
                        return db$5.users.orderBy(':id').lastKey();

                    case 2:
                        _context14.t0 = _context14.sent;
                        userKeys = ["nonexisting1", "nonexisting2", _context14.t0];
                        _context14.next = 6;
                        return db$5.users.bulkDelete(userKeys);

                    case 6:
                        _context14.next = 8;
                        return db$5.users.count();

                    case 8:
                        userCount = _context14.sent;

                        QUnit.equal(userCount, 1, "Should be one user there now. (the other should have been deleted)");

                    case 10:
                    case 'end':
                        return _context14.stop();
                }
            }
        }, _callee14, this);
    }));

    spawnedTest("bulkDelete-faulty-key", regeneratorRuntime.mark(function _callee15() {
        var userKeys;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        userKeys = [{ faulty: "ohyes" }];
                        _context15.next = 3;
                        return db$5.users.bulkDelete(userKeys).then(function () {
                            QUnit.ok(false, "Should not succeed");
                        }).catch('DataError', function (e) {
                            QUnit.ok(true, "Should get error: " + e);
                        });

                    case 3:
                    case 'end':
                        return _context15.stop();
                }
            }
        }, _callee15, this);
    }));

    QUnit.asyncTest("delete", function () {
        // Without transaction
        db$5.users.get(idOfFirstUser, function (user) {
            notEqual(user, null, "User with id 1 exists");
        }).then(function () {
            db$5.users.delete(1).then(function () {
                db$5.users.get(1, function (user) {
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
        db$5.transaction("rw", db$5.users, function () {
            db$5.users.get(idOfFirstUser, function (user) {
                notEqual(user, null, "User with id 1 exists");
            });
            db$5.users.delete(idOfFirstUser);
            db$5.users.get(idOfFirstUser, function (user) {
                QUnit.equal(user, null, "User not found anymore");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });
    QUnit.asyncTest("delete nonexisting item", 3, function () {
        var numUsers;
        db$5.users.count().then(function (count) {
            numUsers = count;
            QUnit.ok(true, "Number of users before delete: " + count);
        }).then(function () {
            return db$5.users.delete("nonexisting key");
        }).then(function () {
            QUnit.ok(true, "Success even though nothing was deleted");
        }).then(function () {
            return db$5.users.count();
        }).then(function (count) {
            QUnit.equal(numUsers, count, "Just verifying number of items in user table is still same");
        }).catch(function (err) {
            QUnit.ok(false, "Got error: " + err);
        }).finally(QUnit.start);
    });
    QUnit.asyncTest("clear", function () {
        db$5.transaction("rw", "users", function () {
            db$5.users.count(function (count) {
                QUnit.equal(count, 2, "There are 2 items in database before clearing it");
            });
            db$5.users.clear();
            db$5.users.count(function (count) {
                QUnit.equal(count, 0, "There are 0 items in database after it has been cleared");
            });
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    spawnedTest("failReadonly", regeneratorRuntime.mark(function _callee17() {
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        _context17.next = 2;
                        return db$5.transaction('r', 'users', regeneratorRuntime.mark(function _callee16() {
                            return regeneratorRuntime.wrap(function _callee16$(_context16) {
                                while (1) {
                                    switch (_context16.prev = _context16.next) {
                                        case 0:
                                            _context16.next = 2;
                                            return db$5.users.bulkAdd([{ first: "Foo", last: "Bar" }]);

                                        case 2:
                                        case 'end':
                                            return _context16.stop();
                                    }
                                }
                            }, _callee16, this);
                        })).then(function () {
                            QUnit.ok(false, "Should not happen");
                        }).catch('ReadOnlyError', function (e) {
                            QUnit.ok(true, "Got ReadOnlyError: " + e.stack);
                        });

                    case 2:
                    case 'end':
                        return _context17.stop();
                }
            }
        }, _callee17, this);
    }));

    spawnedTest("failNotIncludedStore", regeneratorRuntime.mark(function _callee19() {
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
            while (1) {
                switch (_context19.prev = _context19.next) {
                    case 0:
                        _context19.next = 2;
                        return db$5.transaction('rw', 'folks', regeneratorRuntime.mark(function _callee18() {
                            return regeneratorRuntime.wrap(function _callee18$(_context18) {
                                while (1) {
                                    switch (_context18.prev = _context18.next) {
                                        case 0:
                                            _context18.next = 2;
                                            return db$5.users.bulkAdd([{ first: "Foo", last: "Bar" }]);

                                        case 2:
                                        case 'end':
                                            return _context18.stop();
                                    }
                                }
                            }, _callee18, this);
                        })).then(function () {
                            QUnit.ok(false, "Should not happen");
                        }).catch('NotFoundError', function (e) {
                            QUnit.ok(true, "Got NotFoundError: " + e.stack);
                        });

                    case 2:
                    case 'end':
                        return _context19.stop();
                }
            }
        }, _callee19, this);
    }));

    QUnit.asyncTest("failNotIncludedStoreTrans", function () {
        db$5.transaction('rw', 'foodassaddas', function () {}).then(function () {
            QUnit.ok(false, "Should not happen");
        }).catch('NotFoundError', function (e) {
            QUnit.ok(true, "Got NotFoundError: " + e.stack);
        }).catch(function (e) {
            QUnit.ok(false, "Oops: " + e.stack);
        }).then(QUnit.start);
    });

    QUnit.module("extendability");
    QUnit.asyncTest("recursive-pause", function () {
        var db = new Dexie("TestDB");

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

        db.on('populate', function (trans) {
            var tasks = trans.table("tasks");
            var activities = trans.table("activities");
            tasks.add({ Oid: "T1", Name: "The root task" });
            tasks.add({ Oid: "T2", Name: "The child task", Parent: "T1" });
            activities.add({ Oid: "A1", Task: "T2", Tick: 0, Tock: 10, Type: 1 });
            activities.add({ Oid: "A2", Task: "T2", Tick: 100, Tock: 110, Type: 1 });
            activities.add({ Oid: "A3", Task: "T2", Tick: 200, Tock: 210, Type: 2 });
        });

        db.delete().then(function () {
            return db.open();
        }).then(function () {

            return db.transaction("rw", db.activities, db.tasks, function () {
                Dexie.Promise.newPSD(function () {
                    Dexie.currentTransaction._lock();
                    db.activities.where("Type").equals(2).modify({ Flags: 2 }).finally(function () {
                        Dexie.currentTransaction._unlock();
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
        var Promise = Dexie.Promise;
        var root, branch1, branch2;

        Promise.newPSD(function () {
            root = Promise.PSD;
            root.constructor = function () {};
            root.constructor.prototype = root;

            Promise.newPSD(function () {
                branch1 = Promise.PSD;
                branch1.constructor = function () {};
                branch1.constructor.prototype = branch1;
            });
            Promise.newPSD(function () {
                branch2 = Promise.PSD;
                branch2.constructor = function () {};
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
        var derive = Dexie.derive;

        function Root() {}
        function Branch1() {}
        function Branch2() {}

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

    QUnit.module("promise");

    //Dexie.debug = "dexie";

    function createDirectlyResolvedPromise() {
        return new Dexie.Promise(function (resolve) {
            resolve();
        });
    }

    QUnit.asyncTest("Promise basics", function () {
        new Dexie.Promise(function (resolve) {
            return resolve("value");
        }).then(function (value) {
            QUnit.equal(value, "value", "Promise should be resolved with 'value'");
        }).then(function () {
            QUnit.start();
        });
    });

    QUnit.asyncTest("return Promise.resolve() from Promise.then(...)", function () {
        new Dexie.Promise(function (resolve) {
            return resolve("value");
        }).then(function (value) {
            return Dexie.Promise.resolve(value);
        }).then(function (value) {
            QUnit.equal(value, "value", "returning Dexie.Promise.resolve() from then handler should work");
            QUnit.start();
        });
    });

    QUnit.asyncTest("return unresolved Promise from Promise.then(...)", function () {
        new Dexie.Promise(function (resolve) {
            return resolve("value");
        }).then(function (value) {
            return new Dexie.Promise(function (resolve) {
                return setTimeout(resolve, 0, "value");
            });
        }).then(function (value) {
            QUnit.equal(value, "value", "When unresolved promise is resolved, this promise should resolve with its value");
            QUnit.start();
        });
    });

    QUnit.asyncTest("Compatibility with other promises", function () {
        Dexie.Promise.resolve().then(function () {
            return window.Promise.resolve(3);
        }).then(function (x) {
            QUnit.equal(x, 3, "returning a window.Promise should be ok");
            QUnit.start();
        });
    });

    QUnit.asyncTest("When to promise resolve", function () {
        var Promise = Dexie.Promise;
        var res = [];
        Promise.follow(function () {
            new Promise(function (resolve) {
                return resolve();
            }).then(function () {
                return res.push("B1");
            });
            res.push("A1");
            new Promise(function (resolve) {
                return resolve();
            }).then(function () {
                return res.push("B2");
            });
            res.push("A2");
        }).then(function () {
            QUnit.equal(JSON.stringify(res), JSON.stringify(["A1", "A2", "B1", "B2"]), "Resolves come in expected order.");
        }).catch(function (e) {
            QUnit.ok(false, e.stack || e);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Promise.follow()", function () {
        var Promise = Dexie.Promise;
        Promise.follow(function () {
            Promise.resolve("test").then(function (x) {
                return x + ":";
            }).then(function (x) {
                return Promise.reject("rejection");
            }).then(function () {
                return QUnit.ok(false, "Should not come here");
            }).catch(function (e) {
                return QUnit.equal(e, "rejection", "Should catch rejection");
            });
        }).then(function () {
            return QUnit.ok(true, "Scope ended");
        }).catch(function (e) {
            return QUnit.ok(false, "Error: " + e.stack);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Promise.follow() 2", function () {
        var Promise = Dexie.Promise;
        Promise.follow(function () {
            Promise.resolve("test").then(function (x) {
                return x + ":";
            }).then(function (x) {
                return Promise.reject("rejection");
            }).then(function () {
                return QUnit.ok(false, "Should not come here");
            });
        }).then(function () {
            return QUnit.ok(false, "Scope should not resolve");
        }).catch(function (e) {
            return QUnit.ok(true, "Got error: " + e.stack);
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Promise.follow() 3 (empty)", function () {
        Dexie.Promise.follow(function () {}).then(function () {
            return QUnit.ok(true, "Promise resolved when nothing was done");
        }).then(QUnit.start);
    });

    QUnit.asyncTest("Promise.follow chained", function () {
        var Promise = Dexie.Promise;
        //Promise._rootExec(()=>{       
        //Promise.scheduler = (fn, args) => setTimeout(fn, 0, args[0], args[1], args[2]);

        Promise.follow(function () {
            new Promise(function (resolve) {
                return resolve();
            }).then(function () {
                return Promise.follow(function () {
                    Promise.PSD.inner = true;

                    // Chains and rejection
                    new Promise(function (resolve) {
                        return resolve();
                    }).then(function (x) {
                        return 3;
                    }).then(null, function (e) {
                        return "catched";
                    }).then(function (x) {}).then(function () {
                        throw new TypeError("oops");
                    });
                }).then(function () {
                    return QUnit.ok(false, "Promise.follow() should not resolve since an unhandled rejection should have been detected");
                });
            }).then(function () {
                return QUnit.ok(false, "Promise.follow() should not resolve since an unhandled rejection should have been detected");
            }).catch(TypeError, function (err) {
                QUnit.ok(true, "Got TypeError: " + err.stack);
            });
        }).then(function () {
            return QUnit.ok(true, "Outer Promise.follow() should resolve because inner was catched");
        }).catch(function (err) {
            QUnit.ok(false, "Should have catched TypeError: " + err.stack);
        }).then(function () {
            QUnit.start();
        });
        //});
    });

    QUnit.asyncTest("Promise.on.error should propagate once", 1, function () {
        var Promise = Dexie.Promise;
        function logErr(e) {
            QUnit.ok(true, e);
            return false;
        }
        Promise.on('error', logErr);
        var p = new Promise(function (resolve, reject) {
            reject("apa");
        }).finally(function () {}).finally(function () {});
        var p2 = p.finally(function () {});
        var p3 = p.then(function () {});
        var p4 = p.then(function () {}).then(function () {});
        Promise.all([p, p2, p3, p4]).finally(function () {
            setTimeout(function () {
                Promise.on('error').unsubscribe(logErr);
                QUnit.start();
            }, 1);
        });
    });

    QUnit.asyncTest("Promise.on.error should not propagate if catched after finally", 1, function () {
        var Promise = Dexie.Promise;
        function logErr(e) {
            QUnit.ok(false, "Should already be catched:" + e);
        }
        Promise.on('error', logErr);
        var p = new Promise(function (resolve, reject) {
            reject("apa");
        }).finally(function () {}).finally(function () {}).catch(function (e) {
            QUnit.ok(true, "Catching it here: " + e);
        });

        var p2 = p.finally(function () {});
        var p3 = p.then(function () {});
        var p4 = p.then(function () {}).then(function () {});

        Promise.all([p, p2, p3, p4]).finally(function () {
            setTimeout(function () {
                Promise.on('error').unsubscribe(logErr);
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

        var db = new Dexie("Promise-test");
        db.version(1).stores({ friends: '++id' });
        db.on('populate', function () {
            db.friends.add({ name: "one" });
            db.friends.add({ name: "two" });
            db.friends.add({ name: "three" });
        });
        db.delete().then(function () {
            return db.open();
        }).then(function () {
            var promise = db.friends.toCollection().each(function () {});
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
        Dexie.Promise.newPSD(function () {

            Dexie.Promise.PSD.hello = "promise land";

            Dexie.Promise.resolve().then(function () {
                QUnit.ok(!!Dexie.Promise.PSD, "We should have a Dexie.Promise.PSD");
                QUnit.equal(Dexie.Promise.PSD.hello, "promise land");
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

    QUnit.asyncTest("Promise.on.error", function () {
        var errors = [];
        function onError(e, p) {
            errors.push(e);
            return false;
        }
        Dexie.Promise.on('error', onError);

        new Dexie.Promise(function (resolve, reject) {
            reject("error");
        });
        setTimeout(function () {
            QUnit.equal(errors.length, 1, "Should be one error there");
            QUnit.equal(errors[0], "error", "Should be our error there");
            Dexie.Promise.on.error.unsubscribe(onError);
            QUnit.start();
        }, 40);
    });

    QUnit.asyncTest("Promise.on.error2", function () {
        var errors = [];
        function onError(e, p) {
            errors.push(e);
            return false;
        }
        Dexie.Promise.on('error', onError);

        new Dexie.Promise(function (resolve, reject) {
            new Dexie.Promise(function (resolve2, reject2) {
                reject2("error");
            }).then(resolve, function (e) {
                reject(e);
                //return Dexie.Promise.reject(e);
            });
        });

        setTimeout(function () {
            QUnit.equal(errors.length, 1, "Should be one error there");
            QUnit.equal(errors[0], "error", "Should be our error there");
            Dexie.Promise.on.error.unsubscribe(onError);
            QUnit.start();
        }, 40);
    });

    QUnit.asyncTest("Promise.on.error3", function () {
        var errors = [];
        function onError(e, p) {
            errors.push(e);
            return false;
        }
        Dexie.Promise.on('error', onError);

        new Dexie.Promise(function (resolve, reject) {
            new Dexie.Promise(function (resolve2, reject2) {
                reject2("error");
            }).then(resolve, function (e) {
                reject(e);
                //return Dexie.Promise.reject(e);
            });
        }).catch(function () {});

        setTimeout(function () {
            QUnit.equal(errors.length, 0, "Should be zarro errors there");
            Dexie.Promise.on.error.unsubscribe(onError);
            QUnit.start();
        }, 40);
    });

    var db$6 = new Dexie("TestDBTrans");
    db$6.version(1).stores({
        users: "username",
        pets: "++id,kind",
        petsPerUser: "++,user,pet"
    });

    QUnit.module("transaction", {
        setup: function () {
            QUnit.stop();
            resetDatabase(db$6).catch(function (e) {
                QUnit.ok(false, "Error resetting database: " + e.stack);
            }).finally(QUnit.start);
        },
        teardown: function () {}
    });

    QUnit.asyncTest("Transaction should fail if returning non-Dexie Promise in transaction scope", function () {
        db$6.transaction('rw', db$6.users, function () {
            return window.Promise.resolve().then(function () {
                QUnit.ok(Dexie.currentTransaction == null, "Dexie.currentTransaction == null. If this assertion fails, don't weap. Rejoice and try to understand how the hell this could be possible.");
                //return db.users.add({ username: "foobar" });
            }).then(function () {
                //return db.users.add({ username: "barfoo" });
            });
        }).then(function () {
            QUnit.ok(false, "Transaction should not commit because we were using a non-Dexie promise");
        }).catch('IncompatiblePromiseError', function (e) {
            QUnit.ok(true, "Good. Should fail with 'IncompatiblePromiseError': " + e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("empty transaction block", function () {
        db$6.transaction('rw', db$6.users, db$6.pets, function () {
            QUnit.ok(true, "Entering transaction block but dont start any transaction");
            // Leave it empty.
        }).catch(function (err) {
            QUnit.ok(false, err);
        }).finally(function () {
            setTimeout(QUnit.start, 10);
        });
    });

    QUnit.asyncTest("db.transaction()", function () {
        db$6.transaction('rw', db$6.users, function () {
            db$6.users.add({ username: "arne" });
            return db$6.users.get("arne", function (user) {
                QUnit.equal(user.username, "arne", "Got user arne the line after adding it - we must be in a transaction");
                QUnit.ok(Dexie.currentTransaction != null, "Current Transaction must be set");
            });
        }).then(function () {
            QUnit.ok(Dexie.currentTransaction == null, "Current Transaction must be null even when transaction scope returned a Promise that was bound to the transaction");
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("Table not in transaction", function () {
        db$6.pets.add({ kind: "dog" }).then(function () {
            return db$6.transaction('rw', db$6.users, function () {
                db$6.users.add({ username: "arne" });
                return db$6.pets.get(1, function (pet) {
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
        return db$6.transaction('rw', db$6.users, function () {
            db$6.pets.add({ kind: "dog" });
        }).then(function () {
            QUnit.ok(false, "Transaction should not commit because I made an error");
        }).catch(function (err) {
            QUnit.ok(true, "Got error since we tried using a table not in transaction: " + err.stack);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("Write into readonly transaction", function () {
        return db$6.transaction('r', db$6.users, function () {
            db$6.users.add({ username: "arne" }).then(function () {
                QUnit.ok(false, "Should not be able to get a here because we tried to write to users when in a readonly transaction");
            });
        }).then(function () {
            QUnit.ok(false, "Transaction should not commit because I made an error");
        }).catch(function (err) {
            QUnit.ok(true, "Got error since we tried to write to users when in a readonly transaction: " + err.stack);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("Inactive transaction", function () {
        return db$6.transaction('rw', db$6.users, function () {
            return new Dexie.Promise(function (resolve, reject) {

                // Notify log when transaction completes too early
                Dexie.currentTransaction.complete(function () {
                    QUnit.ok(true, "Transaction committing too early...");
                    // Resolve the promise after transaction commit.
                    // Flow will continue in the same Transaction scope but with an
                    // inactive transaction
                    resolve();
                });
            }).then(function () {
                // Now when transaction has already committed, try to add a user with the current transaction:
                return db$6.users.add({ username: "arne" });
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
        return db$6.transaction('rw', db$6.users, function () {
            // First make an operation so that transaction is internally created (this is the thing differing from the previous test case
            return db$6.users.add({ username: "arne" }).then(function () {

                // Create a custom promise that will use setTimeout() so that IDB transaction will commit
                return new Dexie.Promise(function (resolve, reject) {
                    // Notify log when transaction completes too early
                    Dexie.currentTransaction.complete(function () {
                        QUnit.ok(true, "Transaction committing too early...");
                        resolve();
                    });
                });
            }).then(function () {
                // Now when transaction has already committed, try to add a user with the current transaction:
                return db$6.users.add({ username: "arne" });
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
            return db$6.transaction('rw', db$6.users, db$6.pets, db$6.petsPerUser, function () {
                QUnit.ok(parentTrans._reculock > 0, "Parent transaction is locked");
                db$6.users.add(user);
                pets.forEach(function (pet) {
                    db$6.pets.add(pet).then(function (petId) {
                        return db$6.petsPerUser.add({ user: user.username, pet: petId });
                    });
                });
            }).then(function () {
                return db$6.transaction('rw', db$6.users, function () {
                    db$6.users.add({ username: user.username + "2" });
                    return "hello...";
                });
            });
        }

        db$6.transaction('rw', db$6.users, db$6.pets, db$6.petsPerUser, function () {
            var trans = Dexie.currentTransaction;
            parentTrans = Dexie.currentTransaction;
            QUnit.ok(trans._reculock === 0, "Main transaction not locked yet");
            addUser({ username: "user1" }, [{ kind: "dog" }, { kind: "cat" }]).then(function () {
                db$6.users.get("someoneelse", function (someone) {
                    QUnit.equal(someone.username, "someoneelse", "Someonelse was recently added");
                });
            });
            QUnit.ok(trans._reculock > 0, "Main transaction is now locked");
            db$6.users.get("someoneelse", function (someone) {
                QUnit.ok(!someone, "Someoneelse not yet added");
            });
            db$6.users.add({ username: "someoneelse" });
            return addUser({ username: "user2" }, [{ kind: "giraff" }]).then(function (val) {
                QUnit.ok(trans._reculock == 0, "Main transaction not locked anymore");
                return val;
            });
        }).then(function (retval) {
            QUnit.equal(retval, "hello...", "Return value went all the way down to transaction resolvance");
            QUnit.ok(Dexie.currentTransaction == null, "Dexie.currentTransaction is null");
            db$6.users.count(function (count) {
                // Transaction-less operation!
                QUnit.equal(count, 5, "There are five users in db");
            });
            db$6.pets.count(function (count) {
                // Transaction-less operation!
                QUnit.equal(count, 3, "There are three pets in db");
            });
            db$6.petsPerUser.count(function (count) {
                // Transaction-less operation!
                QUnit.equal(count, 3, "There are three pets-to-user relations");
            });
        }).then(function () {
            QUnit.ok(Dexie.currentTransaction == null, "Dexie.currentTransaction is null");
            // Start an outer transaction
            return db$6.transaction('rw', db$6.users, function () {
                // Do an add operation
                db$6.users.add({ username: "sune" }); //.then(function () {
                // Start an inner transaction
                db$6.transaction('rw', db$6.users, function () {
                    // Do an add-operation that will result in ConstraintError:
                    db$6.users.add({ username: "sune" });
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
        db$6.transaction('rw', db$6.users, db$6.pets, db$6.petsPerUser, function () {
            db$6.users.add({ username: "ojsan" });
            db$6.transaction('rw', db$6.users, db$6.pets, function () {
                db$6.users.add({ username: "ojsan2" });
                db$6.users.toCollection().delete();
                db$6.transaction('r', db$6.users, function () {
                    db$6.users.toArray(function (usersArray) {
                        QUnit.equal(usersArray.length, 0, "All users should be deleted");
                        Dexie.currentTransaction.abort();
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
        Dexie.Promise.resolve().then(function () {
            return db$6.transaction('rw', db$6.users, function () {
                db$6.users.add({ username: "bertil" });
                db$6.transaction('rw', db$6.users, db$6.pets, function () {
                    db$6.pets.add({ kind: "cat" });
                });
            });
        }).then(function () {
            QUnit.ok(false, "Shouldnt work");
        }).catch(function (err) {
            QUnit.ok(true, "Got error: " + err);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("Transaction is not in read-mode", function () {
        db$6.transaction('r', db$6.users, db$6.pets, function () {
            db$6.users.toArray();
            db$6.transaction('rw', db$6.users, db$6.pets, function () {
                db$6.pets.add({ kind: "cat" });
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
        db$6.transaction('rw', db$6.users, function () {
            db$6.users.add({ username: "bertil" });
            db$6.transaction('rw!', db$6.users, db$6.pets, function () {
                db$6.pets.add({ kind: "cat" });
            }).then(function () {
                QUnit.ok(true, "Inner transaction complete");
            }).catch(function (err) {
                QUnit.ok(false, "Got error in inner transaction: " + err);
            }).finally(function () {
                if (++counter == 2) QUnit.start();
            });
            Dexie.currentTransaction.abort(); // Aborting outer transaction should not abort inner.
        }).then(function () {
            QUnit.ok(false, "Outer transaction should not complete");
        }).catch(function (err) {
            QUnit.ok(true, "Got Abort Error: " + err);
        }).finally(function () {
            if (++counter == 2) QUnit.start();
        });
    });

    QUnit.asyncTest("'!' mode: Transaction is not in read-mode", function () {
        var counter = 0;
        db$6.transaction('r', db$6.users, db$6.pets, function () {
            db$6.users.toArray();
            db$6.transaction('rw!', db$6.users, db$6.pets, function () {
                db$6.pets.add({ kind: "cat" });
            }).then(function () {
                QUnit.ok(true, "Inner transaction complete");
            }).catch(function (err) {
                QUnit.ok(false, "Got error: " + err);
            }).finally(function () {
                if (++counter == 2) QUnit.start();
            });
        }).then(function () {
            QUnit.ok(true, "Outer transaction complete");
        }).catch(function (err) {
            QUnit.ok(false, "Got error: " + err);
        }).finally(function () {
            if (++counter == 2) QUnit.start();
        });
    });

    QUnit.asyncTest("'!' mode: Transaction bound to different db instance", function () {
        var counter = 0;
        var db2 = new Dexie("TestDB2");
        db2.version(1).stores({
            users: "username",
            pets: "++id,kind",
            petsPerUser: "++,user,pet"
        });

        db2.delete().then(function () {
            return db2.open();
        }).then(function () {
            return db$6.transaction('rw', "users", "pets", function () {
                db2.transaction('rw!', "users", "pets", function () {
                    QUnit.ok(true, "Possible to enter a transaction in db2");
                }).catch(function (err) {
                    QUnit.ok(false, "Got error: " + err);
                }).finally(function () {
                    if (++counter == 2) db2.delete().then(QUnit.start);
                    console.log("finally() in db2.transaction(). counter == " + counter);
                });
            });
        }).finally(function () {
            if (++counter == 2) db2.delete().then(QUnit.start);
            console.log("finally() in db.transaction(). counter == " + counter);
        });
    });

    //
    // Testing the "?" mode
    //

    QUnit.asyncTest("'?' mode: Table not in main transactions", function () {
        var counter = 0;
        db$6.transaction('rw', db$6.users, function () {
            db$6.users.add({ username: "bertil" });
            db$6.transaction('rw?', db$6.users, db$6.pets, function () {
                db$6.pets.add({ kind: "cat" });
            }).then(function () {
                QUnit.ok(true, "Inner transaction complete");
            }).catch(function (err) {
                QUnit.ok(false, "Got error in inner transaction: " + err);
            }).finally(function () {
                if (++counter == 2) QUnit.start();
            });
            Dexie.currentTransaction.abort(); // Aborting outer transaction should not abort inner.
        }).then(function () {
            QUnit.ok(false, "Outer transaction should not complete");
        }).catch(function (err) {
            QUnit.ok(true, "Got Abort Error: " + err);
        }).finally(function () {
            if (++counter == 2) QUnit.start();
        });
    });

    QUnit.asyncTest("'?' mode: Transaction is not in read-mode", function () {
        var counter = 0;
        db$6.transaction('r', db$6.users, db$6.pets, function () {
            db$6.users.toArray();
            db$6.transaction('rw?', db$6.users, db$6.pets, function () {
                db$6.pets.add({ kind: "cat" });
            }).then(function () {
                QUnit.ok(true, "Inner transaction complete");
            }).catch(function (err) {
                QUnit.ok(false, "Got error: " + err);
            }).finally(function () {
                if (++counter == 2) QUnit.start();
            });
        }).then(function () {
            QUnit.ok(true, "Outer transaction complete");
        }).catch(function (err) {
            QUnit.ok(false, "Got error: " + err);
        }).finally(function () {
            if (++counter == 2) QUnit.start();
        });
    });

    QUnit.asyncTest("'?' mode: Transaction bound to different db instance", function () {
        var counter = 0;
        var db2 = new Dexie("TestDB2");
        db2.version(1).stores({
            users: "username",
            pets: "++id,kind",
            petsPerUser: "++,user,pet"
        });
        db2.open();
        db$6.transaction('rw', "users", "pets", function () {
            db2.transaction('rw?', "users", "pets", function () {
                QUnit.ok(true, "Possible to enter a transaction in db2");
            }).catch(function (err) {
                QUnit.ok(false, "Got error: " + err);
            }).finally(function () {
                if (++counter == 2) db2.delete().then(QUnit.start);
            });
        }).finally(function () {
            if (++counter == 2) db2.delete().then(QUnit.start);
        });
    });

    QUnit.asyncTest("'?' mode: Three-level sub transactions", function () {
        db$6.transaction('rw', db$6.users, db$6.pets, db$6.petsPerUser, function () {
            db$6.users.add({ username: "ojsan" });
            db$6.transaction('rw?', db$6.users, db$6.pets, function () {
                db$6.users.add({ username: "ojsan2" });
                db$6.users.toCollection().delete();
                db$6.transaction('r?', db$6.users, function () {
                    db$6.users.toArray(function (usersArray) {
                        QUnit.equal(usersArray.length, 0, "All users should be deleted");
                        Dexie.currentTransaction.abort();
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
        var logDb = new Dexie("logger");
        logDb.version(1).stores({
            log: "++,time,type,message"
        });
        var lastLogAddPromise;
        logDb.open().then(function () {
            return db$6.transaction('rw', db$6.pets, function () {
                // Test that a non-transactional add in the other DB can coexist with
                // the current transaction on db:
                logDb.log.add({ time: new Date(), type: "info", message: "Now adding a dog" });
                db$6.pets.add({ kind: "dog" }).then(function (petId) {
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
        db$6.transaction('rw', db$6.users, db$6.pets, function () {
            QUnit.ok(true, "Entered parent transaction");
            QUnit.ok(true, "Now adding Gunnar in parent transaction");
            db$6.users.add({ username: "Gunnar" }).then(function () {
                QUnit.ok(true, "First add on parent transaction finished. Now adding another object in parent transaction.");
                db$6.pets.add({ kind: "cat", name: "Garfield" }).then(function () {
                    QUnit.ok(true, "Successfully added second object in parent transaction.");
                }).catch(function (err) {
                    QUnit.ok(false, "Failed to add second object in parent transaction: " + err.stack || err);
                });
            });

            db$6.transaction('rw', db$6.users, function () {
                QUnit.ok(true, "Entered sub transaction");
                return db$6.users.add({ username: "JustAnnoyingMyParentTransaction" }).then(function () {
                    QUnit.ok(true, "Add on sub transaction succeeded");
                }).catch(function (err) {
                    QUnit.ok(false, "Failed to add object in sub transaction: " + err.stack || err);
                });
            });
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("Issue #91 Promise.resolve() from within parent transaction", function () {
        db$6.transaction('rw', db$6.users, db$6.pets, function () {
            QUnit.ok(true, "Entered parent transaction");
            var trans = Dexie.currentTransaction;

            return db$6.transaction('rw', db$6.users, function () {
                QUnit.ok(true, "Entered sub transaction");
                QUnit.ok(Dexie.currentTransaction !== trans, "We are not in parent transaction");
                QUnit.ok(Dexie.currentTransaction.parent === trans, "...but in a sub transaction");
                return Dexie.Promise.resolve(3);
            }).then(function (result) {
                QUnit.equal(result, 3, "Got 3");
                QUnit.ok(Dexie.currentTransaction === trans, "Now we are in parent transaction");
                db$6.users.add({ username: "Gunnar" });
                return db$6.users.where("username").equals("Gunnar").first();
            }).then(function (result) {
                QUnit.ok(!!result, "Got result");
                QUnit.equal(result.username, "Gunnar", "Got the Gunnar we expected");
                return Dexie.Promise.resolve(result);
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
            return db$6.transaction('rw', db$6.users, db$6.pets, function () {
                console.log("Entering small child");
                return db$6.users.add({ // Here: Test succeeded if removing the 'return' statement here!
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
            return db$6.transaction('rw', db$6.users, db$6.pets, function () {
                console.log("Entering middle child");
                return db$6.pets.add({
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
            return db$6.transaction('rw', db$6.users, db$6.pets, function () {
                // Here: Test succeeded if skipping the outermost transaction scope.
                console.log("Entering root transaction");
                return db$6.transaction('rw', db$6.users, db$6.pets, function () {
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
        QUnit.ok(!Dexie.currentTransaction, "There is no ongoing transaction");
        db$6.transaction('rw', db$6.pets, function () {
            var rootLevelTransaction = Dexie.currentTransaction;
            QUnit.ok(true, "Entered root transaction scope");
            return db$6.transaction('rw', db$6.pets, function () {
                QUnit.ok(true, "Entered sub scope");
                var level2Transaction = Dexie.currentTransaction;
                QUnit.ok(level2Transaction.parent === rootLevelTransaction, "Level2 transaction's parent is the root level transaction");
                return db$6.transaction('rw', db$6.pets, function () {
                    QUnit.ok(true, "Entered sub of sub scope");
                    var innermostTransaction = Dexie.currentTransaction;
                    QUnit.ok(!!innermostTransaction, "There is an ongoing transaction (direct in 3rd level scope)");
                    QUnit.ok(innermostTransaction.parent === level2Transaction, "Parent is level2 transaction");
                    return Dexie.Promise.resolve().then(function () {
                        QUnit.ok(true, "Sub of sub scope: Promise.resolve().then() called");
                        QUnit.ok(!!Dexie.currentTransaction, "There is an ongoing transaction");
                        QUnit.ok(Dexie.currentTransaction === innermostTransaction, "Still in innermost transaction");
                        return db$6.pets.add({
                            id: 123,
                            value: 'val'
                        }).then(function (resultId) {
                            QUnit.ok(true, "Sub of sub scope: add() resolved");
                            QUnit.ok(Dexie.currentTransaction === innermostTransaction, "Still in innermost transaction");
                            return Dexie.Promise.resolve(resultId).then(function (res) {
                                return Dexie.Promise.resolve(res);
                            });
                        }).then(function (resultId) {
                            QUnit.ok(true, "Sub if sub scope: Promise.resolve() after add() resolve");
                            QUnit.ok(Dexie.currentTransaction === innermostTransaction, "Still in innermost transaction");
                            return Dexie.Promise.resolve(resultId);
                        });
                    }).then(function () {
                        QUnit.ok(true, "sub of sub scope chaining further in promise chains...");
                        QUnit.ok(Dexie.currentTransaction === innermostTransaction, "Still in innermost transaction");
                        return Dexie.Promise.resolve(db$6.pets.get(123));
                    }).then(function (pet) {
                        QUnit.ok(true, "sub of sub scope chaining further in promise chains 2...");
                        QUnit.ok(Dexie.currentTransaction === innermostTransaction, "Still in innermost transaction");
                        return Dexie.Promise.resolve(pet.id);
                    });
                }).then(function (resultId) {
                    QUnit.ok(true, "Innermost transaction completed");
                    QUnit.ok(Dexie.currentTransaction == level2Transaction, "We should now be executing within level 2 sub transaction");
                    return Dexie.Promise.resolve(resultId);
                }).then(function (resultId) {
                    QUnit.ok(Dexie.currentTransaction == level2Transaction, "We should still be executing within level 2 sub transaction");
                    return Dexie.Promise.resolve(resultId);
                }).then(function (resultId) {
                    QUnit.equal(resultId, 123, "Result was 123 as expected");
                }).then(function () {
                    return db$6.transaction('rw', db$6.pets, function () {
                        var innermostTransaction2 = Dexie.currentTransaction;
                        QUnit.ok(innermostTransaction2.parent == level2Transaction, "Another 3rd level transaction has parent set to our level2 transaction");
                        return db$6.pets.add({
                            id: 321,
                            value: 'val'
                        }).then(function (resultId2) {
                            return Dexie.Promise.resolve(resultId2);
                        }).then(function (resultId2) {
                            QUnit.ok(Dexie.currentTransaction === innermostTransaction2, "We're still in the innermostTransaction (second one)");
                            return Dexie.Promise.resolve(resultId2).then(function (x) {
                                QUnit.ok(Dexie.currentTransaction === innermostTransaction2, "We're still in the innermostTransaction (second one)");
                                return x;
                            });
                        });
                    }).then(function (resultId2) {
                        QUnit.equal(resultId2, 321, "Result2 was 321 as expected");
                        QUnit.ok(Dexie.currentTransaction === level2Transaction, "We should still be executing within level 2 sub transaction");
                        return "finalResult";
                    });
                });
            }).then(function (x) {

                QUnit.ok(Dexie.currentTransaction === rootLevelTransaction, "Now we're at the root level transaction and can do some more stuff here");

                return db$6.pets.clear().then(function () {
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
            QUnit.ok(!Dexie.currentTransaction, "No ongoing transaction now");
            QUnit.ok(true, "done");
        }).catch(function (error) {
            QUnit.ok(false, error.stack);
        }).finally(QUnit.start);
        QUnit.ok(!Dexie.currentTransaction, "After main transaction scope: Still no ongoing transaction at this scope");
    });

    QUnit.asyncTest("Promise Microtask / indexedDB transaction compatibility", function () {
        // Change line below from Dexie.Promise to window.Promise to test
        // compatibility between indexedDB transactions and window.Promise.
        // As of 2015-06-25, this works only with Chromium but not with Firefox
        // and not with IE11 because it lacks window.Promise.
        var Promise = Dexie.Promise; // window.Promise;

        db$6.transaction('rw', db$6.users, function () {
            var trans = Dexie.currentTransaction;
            return Promise.resolve(trans.users.add({ username: "apansson" })).then(function () {
                return Promise.resolve(trans.users.get("apansson"));
            }).then(function (o) {
                QUnit.equal(o.username, "apansson", "Got the correct object");
                var p = Promise.resolve(o);
                for (var i = 0; i < 100; ++i) {
                    p = p.then(function (o) {
                        return o;
                    });
                }
                return p;
            }).then(function (o) {
                return trans.users.get("apansson");
            }).then(function (o) {
                QUnit.equal(o.username, "apansson", "Got the correct object after 100 promises in a chain");
            }).catch(function (e) {
                QUnit.ok(false, "Error: " + e);
            });
        }).then(function () {
            QUnit.ok(true, "Transaction successfully committed");
        }).catch(function (e) {
            QUnit.ok(false, "Error:" + e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("Issue #137 db.table() does not respect current transaction", function () {
        db$6.transaction('rw', db$6.users, function () {
            db$6.users.add({ username: "erictheviking", color: "blue" }).then(function () {
                db$6.table('users').get('erictheviking', function (eric) {
                    QUnit.ok(eric, "Got back an object");
                    QUnit.equal(eric.color, "blue", "eric.color is still blue. If red, the getter must have been run from another transaction.");
                });
                db$6.users.put({ username: "erictheviking", color: "red" });
            });
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("Dexie.currentTransaction in CRUD hooks", 53, function () {

        function CurrentTransChecker(scope, trans) {
            return function () {
                QUnit.ok(Dexie.currentTransaction === trans, "Dexie.currentTransaction correct in " + scope);
            };
        }

        function onCreating(primKey, obj, transaction) {
            QUnit.ok(!!Dexie.currentTransaction, "Dexie.currentTransaction should exist in creating");
            QUnit.ok(Dexie.currentTransaction === transaction, "Dexie.currentTransaction correct in creating");
            this.onerror = CurrentTransChecker("creating.onerror", transaction);
            this.onsuccess = CurrentTransChecker("creating.onsuccess", transaction);
        }

        function onReading(obj) {
            QUnit.ok(!!Dexie.currentTransaction, "Dexie.currentTransaction should exist in reading");
            return obj;
        }

        function onUpdating(modifications, primKey, obj, transaction) {
            QUnit.ok(Dexie.currentTransaction === transaction, "Dexie.currentTransaction correct in updating");
            this.onerror = CurrentTransChecker("updating.onerror", transaction);
            this.onsuccess = CurrentTransChecker("updating.onsuccess", transaction);
        }

        function onDeleting(primKey, obj, transaction) {
            QUnit.ok(Dexie.currentTransaction === transaction, "Dexie.currentTransaction correct in deleting");
            this.onsuccess = CurrentTransChecker("deleting.onsuccess", transaction);
        }

        db$6.users.hook.creating.subscribe(onCreating);
        db$6.users.hook.reading.subscribe(onReading);
        db$6.users.hook.updating.subscribe(onUpdating);
        db$6.users.hook.deleting.subscribe(onDeleting);

        function doTheTests() {
            db$6.users.add({ username: "monkey1" });
            db$6.users.add({ username: "monkey1" }).catch(function (ex) {
                QUnit.ok(true, "Should fail adding a second monkey1");
            }); // Trigger creating.onerror
            // Test bulkAdd as well:
            QUnit.ok(true, "Testing bulkAdd");
            db$6.users.bulkAdd([{ username: "monkey1" }, { username: "monkey2" }]).then(function () {
                return QUnit.ok(false, "Should get error on one of the adds");
            }).catch(Dexie.BulkError, function (e) {
                QUnit.ok(true, "Got BulkError");
                QUnit.ok(e.failures.length === 1, "One error out of two: " + e);
            });
            db$6.users.where("username").equals("monkey1").modify({
                name: "Monkey 1"
            });
            db$6.users.where("username").equals("monkey1").modify(function (user) {
                user.username = "monkey2"; // trigger updating.onerror
            }).catch(function (ex) {
                QUnit.ok(true, "Should fail modifying primary key");
            });
            db$6.users.toArray();
            db$6.users.delete("monkey2");
            return db$6.users.delete("monkey1");
        };

        doTheTests().then(function () {
            QUnit.ok(true, "Now in an explicit transaction block...");
            return db$6.transaction('rw', db$6.users, function () {
                doTheTests();
            });
        }).catch(function (ex) {
            QUnit.ok(false, ex);
        }).finally(function () {
            db$6.users.hook.creating.unsubscribe(onCreating);
            db$6.users.hook.reading.unsubscribe(onReading);
            db$6.users.hook.updating.unsubscribe(onUpdating);
            db$6.users.hook.deleting.unsubscribe(onDeleting);
            QUnit.start();
        });
    });

    var async$4 = Dexie.async;

    QUnit.module("open", {
        setup: function () {
            QUnit.stop();
            Dexie.delete("TestDB").then(function () {
                QUnit.start();
            }).catch(function (e) {
                QUnit.ok(false, "Could not delete database");
            });
        },
        teardown: function () {
            QUnit.stop();Dexie.delete("TestDB").then(QUnit.start);
        }
    });

    var timeout = async$4(regeneratorRuntime.mark(function _callee(promise, ms) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return Promise.race([promise, new Promise(function (resolve, reject) {
                            return setTimeout(function () {
                                return reject("timeout");
                            }, ms);
                        })]);

                    case 2:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    spawnedTest("multiple db should not block each other", regeneratorRuntime.mark(function _callee2() {
        var db1, db2;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (supports("versionchange")) {
                            _context2.next = 3;
                            break;
                        }

                        QUnit.ok(true, "SKIPPED - versionchange UNSUPPORTED");
                        return _context2.abrupt('return');

                    case 3:
                        db1 = new Dexie("TestDB"), db2 = new Dexie("TestDB");

                        db1.version(1).stores({
                            foo: 'bar'
                        });
                        db2.version(1).stores({
                            foo: 'bar'
                        });
                        _context2.next = 8;
                        return db1.open();

                    case 8:
                        QUnit.ok(true, "db1 should open");
                        _context2.next = 11;
                        return db2.open();

                    case 11:
                        QUnit.ok(true, "db2 should open");
                        _context2.prev = 12;
                        _context2.next = 15;
                        return timeout(db1.delete(), 1500);

                    case 15:
                        QUnit.ok(true, "Succeeded to delete db1 while db2 was open");
                        _context2.next = 23;
                        break;

                    case 18:
                        _context2.prev = 18;
                        _context2.t0 = _context2['catch'](12);

                        db1.close();
                        db2.close();
                        QUnit.ok(false, "Could not delete db1 - " + _context2.t0);

                    case 23:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[12, 18]]);
    }));

    spawnedTest("Using db on node should be rejected with MissingAPIError", regeneratorRuntime.mark(function _callee3() {
        var db;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        db = new Dexie('TestDB', {
                            indexedDB: undefined,
                            IDBKeyRange: undefined
                        });

                        db.version(1).stores({ foo: 'bar' });
                        _context3.prev = 2;
                        _context3.next = 5;
                        return db.foo.toArray();

                    case 5:
                        QUnit.ok(false, "Should not get any result because API is missing.");
                        _context3.next = 11;
                        break;

                    case 8:
                        _context3.prev = 8;
                        _context3.t0 = _context3['catch'](2);

                        QUnit.ok(_context3.t0 instanceof Dexie.MissingAPIError, "Should get MissingAPIError. Got: " + _context3.t0.name);

                    case 11:
                        _context3.prev = 11;
                        _context3.next = 14;
                        return db.open();

                    case 14:
                        _context3.next = 19;
                        break;

                    case 16:
                        _context3.prev = 16;
                        _context3.t1 = _context3['catch'](11);

                        QUnit.ok(_context3.t1 instanceof Dexie.MissingAPIError, "Should get MissingAPIError. Got: " + _context3.t1.name);

                    case 19:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[2, 8], [11, 16]]);
    }));

    QUnit.asyncTest("open, add and query data without transaction", 6, function () {
        var db = new Dexie("TestDB");
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
        var db = new Dexie("TestDB");
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
        var db = new Dexie("TestDB");
        var db2 = null;
        return db.open().then(function () {
            // Could open database without specifying any version. An existing database was opened.
            QUnit.ok(false, "Expected database not to exist but it existed indeed");
            db.close();
        }).catch(Dexie.NoSuchDatabaseError, function (err) {
            // An error happened. Database did not exist.
            QUnit.ok(true, "Database did not exist");
            db = new Dexie("TestDB");
            db.version(1).stores({ dummy: "" });
            return db.open();
        }).then(function () {
            // Database was created. Now open another instance to test if it exists
            QUnit.ok(true, "Could create a dummy database");
            db2 = new Dexie("TestDB");
            return db2.open();
        }).then(function () {
            QUnit.ok(true, "Dummy Database did exist.");
            db2.close();
        }).catch(function (err) {
            QUnit.ok(false, "Error: " + err.stack || err);
        }).finally(function () {
            db.delete().then(function () {
                if (db2) return db2.delete();
            }).finally(QUnit.start);
        });
    });

    QUnit.asyncTest("open database without specifying version or schema", Dexie.Observable ? 1 : 10, function () {
        if (Dexie.Observable) {
            QUnit.ok(true, "Dexie.Observable currently not compatible with this mode");
            return QUnit.start();
        }
        var db = new Dexie("TestDB");
        var db2 = null;
        db.open().then(function () {
            QUnit.ok(false, "Should not be able to open a non-existing database when not specifying any version schema");
        }).catch(function (err) {
            QUnit.ok(true, "Got error when trying to open non-existing DB: " + err);
            // Create a non-empty database that we later on will open in other instance (see next then()-clause)...
            db = new Dexie("TestDB");
            db.version(1).stores({ friends: "++id,name", pets: "++,name,kind" });
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Could create TestDB with specified version schema.");
            db2 = new Dexie("TestDB"); // Opening another instans without specifying schema
            return db2.open().then(function () {
                QUnit.equal(db2.tables.length, 2, "We got two tables in database");
                QUnit.ok(db2.tables.every(function (table) {
                    return table.name == "friends" || table.name == "pets";
                }), "db2 contains the tables friends and pets");
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
            if (db2) db2.close();
            QUnit.start();
        });
    });

    QUnit.asyncTest("Dexie.getDatabaseNames", 11, function () {
        var defaultDatabases = [];
        var db1, db2;
        Dexie.getDatabaseNames(function (names) {
            defaultDatabases = [].slice.call(names, 0);
            QUnit.ok(true, "Current databases: " + (defaultDatabases.length ? defaultDatabases.join(',') : "(none)"));
            db1 = new Dexie("TestDB1");
            db1.version(1).stores({});
            return db1.open();
        }).then(function () {
            // One DB created
            QUnit.ok(true, "TestDB1 successfully created");
            return Dexie.getDatabaseNames();
        }).then(function (names) {
            QUnit.equal(names.length, defaultDatabases.length + 1, "Another DB has been created");
            QUnit.ok(names.indexOf("TestDB1") !== -1, "Database names now contains TestDB1");
            db2 = new Dexie("TestDB2");
            db2.version(1).stores({});
            return db2.open();
        }).then(function () {
            QUnit.ok(true, "TestDB2 successfully created");
            return Dexie.getDatabaseNames();
        }).then(function (names) {
            QUnit.equal(names.length, defaultDatabases.length + 2, "Yet another DB has been created");
            QUnit.ok(names.indexOf("TestDB2") !== -1, "Database names now contains TestDB2");
            return db1.delete();
        }).then(function () {
            return Dexie.getDatabaseNames();
        }).then(function (names) {
            QUnit.equal(names.length, defaultDatabases.length + 1, "A database has been deleted");
            QUnit.ok(!names.indexOf("TestDB1") !== -1, "TestDB1 not in database list anymore");
            return db2.delete();
        }).then(function () {
            return Dexie.getDatabaseNames();
        }).then(function (names) {
            QUnit.equal(names.length, defaultDatabases.length, "All of our databases have been deleted");
            QUnit.ok(!names.indexOf("TestDB2") !== -1, "TestDB2 not in database list anymore");
        }).catch(function (err) {
            QUnit.ok(false, err.stack || err);
        }).finally(function () {
            (db1 ? db1.delete() : Dexie.Promise.resolve()).finally(function () {
                (db2 ? db2.delete() : Dexie.Promise.resolve()).finally(QUnit.start);
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
        function CodeToExecuteInWebWorker(ok, done) {
            ok(true, "Could enter the web worker");

            Dexie.delete("codeFromWorker").then(function () {
                var db = new Dexie("codeFromWorker");
                ok(true, "Could create a Dexie instance from within a web worker");

                db.version(1).stores({ table1: "++" });
                ok(true, "Could define schema");

                db.open();
                ok(true, "Could open the database");

                return db.transaction('rw', db.table1, function () {
                    ok(true, "Could create a transaction");
                    db.table1.add({ name: "My first object" }).then(function (id) {
                        ok(true, "Could add object that got id " + id);
                    }).catch(function (err) {
                        ok(false, "Got error: " + err);
                    });
                });
            }).then(function () {
                ok(true, "Transaction committed");
            }).catch(function (err) {
                ok(false, "Transaction failed: " + err.stack);
            }).finally(done);
        }

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
        var db = new Dexie("TestDB");
        db.version(20).stores({
            t: 'id,displayName,*displayNameParts,isDeleted,countryRef,[countryRef+isDeleted],autoCreated,needsReview,[autoCreated+isDeleted],[needsReview+isDeleted],[autoCreated+needsReview+isDeleted],[autoCreated+countryRef+needsReview+isDeleted],[autoCreated+countryRef+needsReview+isDeleted],[autoCreated+robotsNoIndex+isDeleted],[autoCreated+needsReview+robotsNoIndex+isDeleted],[autoCreated+countryRef+robotsNoIndex+isDeleted],[autoCreated+countryRef+needsReview+robotsNoIndex+isDeleted]'
        });
        db.open().then(function () {
            return Dexie.Promise.all(db.t.orderBy("id").first(), db.t.orderBy("displayName").first(), db.t.orderBy("displayNameParts").first(), db.t.orderBy("isDeleted").first(), db.t.orderBy("countryRef").first(), db.t.orderBy("[countryRef+isDeleted]").first(), db.t.orderBy("autoCreated").first(), db.t.orderBy("needsReview").first(), db.t.orderBy("[autoCreated+isDeleted]").first(), db.t.orderBy("[needsReview+isDeleted]").first(), db.t.orderBy("[autoCreated+needsReview+isDeleted]").first(), db.t.orderBy("[autoCreated+countryRef+needsReview+isDeleted]").first(), db.t.orderBy("[autoCreated+robotsNoIndex+isDeleted]").first(), db.t.orderBy("[autoCreated+needsReview+robotsNoIndex+isDeleted]").first(), db.t.orderBy("[autoCreated+countryRef+robotsNoIndex+isDeleted]").first(), db.t.orderBy("[autoCreated+countryRef+needsReview+robotsNoIndex+isDeleted]").first());
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
            db = new Dexie("TestDB");
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
        Dexie.exists("TestDB").then(function (result) {
            QUnit.equal(result, false, "Should not exist yet");
            db = new Dexie("TestDB");
            db.version(1).stores({
                some: "schema"
            });
            return db.open();
        }).then(function () {
            return Dexie.exists("TestDB");
        }).then(function (result) {
            QUnit.equal(result, true, "Should exist now and has another open connection.");
            db.close();
            return Dexie.exists("TestDB");
        }).then(function (result) {
            QUnit.equal(result, true, "Should still exist");
            return Dexie.delete("TestDB");
        }).then(function () {
            return Dexie.exists("TestDB");
        }).then(function (result) {
            QUnit.equal(result, false, "Should have been deleted now");
        }).catch(function (e) {
            QUnit.ok(false, "Error: " + e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("No auto-open", function () {
        var db = new Dexie("TestDB", { autoOpen: false });
        db.version(1).stores({ foo: "id" });
        db.foo.toArray(function (res) {
            QUnit.ok(false, "Should not get result. Should have failed.");
        }).catch(function (e) {
            QUnit.ok(e instanceof Dexie.DatabaseClosedError, "Should catch DatabaseClosedError");
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
                QUnit.ok(e instanceof Dexie.DatabaseClosedError, "Got DatabaseClosedError from the db.open() call.");
            });
            var queryPromise = db.foo.toArray().then(function () {
                QUnit.ok(false, "Should not succeed to query because we closed it during the open sequence.");
            }).catch(function (e) {
                QUnit.ok(e instanceof Dexie.DatabaseClosedError, "Got DatabaseClosedError when querying: " + e);
            });
            db.close();
            return Promise.all([openPromise, queryPromise]);
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("db.close", function () {
        var db = new Dexie("TestDB");
        db.version(1).stores({ foo: "id" });
        db.foo.toArray(function (res) {
            QUnit.equal(res.length, 0, "Database auto-opened and I got a result from my query");
        }).then(function () {
            db.close();
            return db.foo.toArray();
        }).catch(function (e) {
            QUnit.ok(e instanceof Dexie.DatabaseClosedError, "Should catch DatabaseClosedError");
            return db.open();
        }).then(function () {
            console.log("The call to db.open() completed");
            return db.foo.toArray();
        }).then(function (res) {
            QUnit.equal(res.length, 0, "Database re-opened and I got a result from my query");
        }).catch(function (e) {
            QUnit.ok(false, e);
        }).finally(function () {
            db.delete().catch(function (e) {
                return console.error(e);
            }).finally(QUnit.start);
        });
    });

    spawnedTest("db.open several times", 2, regeneratorRuntime.mark(function _callee4() {
        var db;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        db = new Dexie("TestDB");

                        db.version(1).stores({ foo: "id" });
                        db.on('populate', function () {
                            throw "Failed in populate";
                        });
                        db.open().then(function () {
                            QUnit.ok(false, "Should not succeed to open");
                        }).catch(function (err) {
                            QUnit.ok(true, "Got error: " + (err.stack || err));
                        });
                        _context4.next = 6;
                        return db.open().then(function () {
                            QUnit.ok(false, "Should not succeed to open");
                        }).catch(function (err) {
                            QUnit.ok(true, "Got error: " + (err.stack || err));
                        });

                    case 6:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    var db$7 = new Dexie("TestDBException");
    db$7.version(1).stores({ users: "id,first,last,&username,&*email,*pets" });
    db$7.on("populate", function (trans) {
        var users = trans.table("users");
        users.add({ id: 1, first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
        users.add({ id: 2, first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
    });
    function dbOnErrorHandler(e) {
        QUnit.ok(false, "An error bubbled out to the db.on('error'). Should not happen because all tests should catch their errors themselves. " + e);
    }
    db$7.on("error", dbOnErrorHandler);

    QUnit.module("exception-handling", {
        setup: function () {
            QUnit.stop();
            resetDatabase(db$7).catch(function (e) {
                QUnit.ok(false, "Error resetting database: " + e.stack);
            }).finally(QUnit.start);
        },
        teardown: function () {}
    });

    QUnit.asyncTest("Uncaught promise should signal to Promise.on('error')", function () {
        // We must not use finally or catch here because then we don't test what we should.
        var onErrorSignals = 0;
        function onerror(e) {
            ++onErrorSignals;
        }
        Dexie.Promise.on('error', onerror);
        db$7.on('error').unsubscribe(dbOnErrorHandler);
        db$7.users.add({ id: 1 });
        setTimeout(function () {
            QUnit.equal(onErrorSignals, 1, "Promise.on('error') should have been signaled");
            db$7.on("error", dbOnErrorHandler);
            Dexie.Promise.on('error').unsubscribe(onerror);
            QUnit.start();
        }, 100);
    });

    spawnedTest("transaction should abort on collection error", regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return db$7.transaction("rw", db$7.users, regeneratorRuntime.mark(function _callee() {
                            var id;
                            return regeneratorRuntime.wrap(function _callee$(_context) {
                                while (1) {
                                    switch (_context.prev = _context.next) {
                                        case 0:
                                            _context.next = 2;
                                            return db$7.users.add({ id: 3, first: "Foo", last: "Bar", username: "foobar" });

                                        case 2:
                                            id = _context.sent;

                                            QUnit.equal(id, 3);
                                            _context.next = 6;
                                            return db$7.users.where('id').equals(null).toArray();

                                        case 6:
                                            QUnit.ok(false, "Should not come here");

                                        case 7:
                                        case 'end':
                                            return _context.stop();
                                    }
                                }
                            }, _callee, this);
                        })).catch(function (e) {
                            QUnit.ok(true, "Got error because WhereClause.equals(null) should throw DataError: " + e);
                        });

                    case 2:
                        _context2.next = 4;
                        return db$7.users.where('first').equals("Foo").count();

                    case 4:
                        _context2.t0 = _context2.sent;
                        QUnit.equal(_context2.t0, 0, "Should not have succeeded to add when transaction was aborted");
                        _context2.next = 8;
                        return db$7.transaction("rw", db$7.users, function () {
                            db$7.users.add({ id: 3, first: "Foo", last: "Bar", username: "foobar" });
                            db$7.users.where('id').equals(null).toArray(function (res) {
                                QUnit.ok(false, "Not possible to query null");
                            });
                        }).then(function () {
                            QUnit.ok(false, "Transaction shouldnt commit");
                        }).catch(function (e) {
                            QUnit.ok(true, "Got error because WhereClause.equals(null) should throw TypeError");
                        });

                    case 8:
                        _context2.next = 10;
                        return db$7.users.where('first').equals("Foo").count();

                    case 10:
                        _context2.t1 = _context2.sent;
                        QUnit.equal(_context2.t1, 0, "Should not have succeeded to add when transaction was aborted");

                    case 12:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    QUnit.asyncTest("eventError-transaction-catch", function () {
        db$7.transaction("rw", db$7.users, function () {
            db$7.users.add({ id: 100, username: "dfahlander" }).then(function () {
                QUnit.ok(false, "Should not be able to add two users with same username");
            });
        }).then(function () {
            QUnit.ok(false, "Transaction should not complete since an error should have occurred");
        }).catch(function (e) {
            QUnit.ok(true, "Got transaction error: " + e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("eventError-request-catch", function () {
        db$7.transaction("rw", db$7.users, function () {
            db$7.users.add({ id: 100, username: "dfahlander" }).then(function () {
                QUnit.ok(false, "Should not be able to add two users with same username");
            }).catch(function (e) {
                QUnit.ok(true, "Got request error: " + e);
            });
            db$7.users.add({ id: 101, first: "Trazan", last: "Apansson", username: "tapan", email: ["trazan@apansson.barnarne"], pets: ["monkey"] }).then(function (id) {
                QUnit.ok(id > 2, "Could continue transaction and add Trazan since last error event was catched");
            });
        }).then(function () {
            QUnit.ok(true, "Transaction should complete since the only error that occurred was catched");
        }).catch(function (e) {
            QUnit.ok(false, "Should not get transaction error since we have catched the error. Got Transaction error: " + e);
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("exceptionThrown-transaction-catch", function () {
        db$7.transaction("r", db$7.users, function () {
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
        db$7.transaction("r", db$7.users, function () {
            db$7.users.where("username").equals("apa").toArray(function () {
                db$7.users.where("username").equals("kceder").toArray().then(function () {
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
        };
        db$7.users.hook('deleting', deletingHook);
        db$7.transaction('rw', db$7.users, function () {

            function deleteKarls() {
                db$7.users.toCollection().modify(function (user) {
                    delete this.value;
                    throw "Throwing something";
                });
            }

            db$7.users.delete(1);
            deleteKarls();
        }).then(function () {
            QUnit.ok(false, "Transaction should not complete!");
        }).catch(function (err) {
            QUnit.ok(true, "Transaction aborted");
        }).finally(function () {
            db$7.users.hook('deleting').unsubscribe(deletingHook);
            QUnit.start();
        });
    });

    QUnit.asyncTest("exceptionThrown-iteration-should-not-abort-when-using-hook", function () {
        db$7.users.hook('deleting', function () {
            // Testing with
        });
        db$7.transaction('rw', db$7.users, function () {

            function deleteKarls() {
                db$7.users.toCollection().modify(function (user) {
                    delete this.value;
                    throw "Throwing something";
                }).catch(function (err) {
                    // Catching error should prevent transaction from aborting.
                });
            }

            db$7.users.delete(1);
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
        var db = new Dexie("TestUpgrader");
        db.version(1).stores({ cars: "++id,name,brand" });
        db.open().then(function () {
            // Once it opens, close it and create an upgraded version that will fail to upgrade.
            db.close();
            db = new Dexie("TestUpgrader");
            db.version(1).stores({ cars: "++id,name,brand" });
            db.version(2).upgrade(function (trans) {
                trans.cars.add({ name: "My car", brand: "Pegeut" });
            });
            db.version(3).upgrade(function (trans) {
                throw new Error("Oops. Failing in upgrade function");
            });
            return db.open();
        }).catch(function (err) {
            // Got error
            QUnit.ok(err.toString().indexOf("Oops. Failing in upgrade function") != -1, "Got error: " + err);
            // Create 3rd instance of db that will only read from the existing DB.
            // What we want to check here is that the DB is there but is still
            // only on version 1.
            db = new Dexie("TestUpgrader");
            return db.open();
        }).then(function () {
            QUnit.equal(db.verno, 1, "Database is still on version 1 since it failed to upgrade to version 2.");
        }).finally(function () {
            db.delete().then(QUnit.start);
        });
    });

    QUnit.asyncTest("exception in on('populate')", function () {
        // Create a database:
        var db = new Dexie("TestUpgrader");
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
            db = new Dexie("TestUpgrader");
            return db.open();
        }).then(function () {
            QUnit.ok(false, "The database should not have been created");
        }).catch(function (err) {
            QUnit.ok(err instanceof Dexie.NoSuchDatabaseError, "The database doesnt exist");
        }).finally(function () {
            db.delete().then(QUnit.start);
        });
    });

    QUnit.asyncTest("catch-all with db.on('error')", 6, function () {
        if (typeof idbModules !== 'undefined' && Dexie.dependencies.indexedDB === idbModules.shimIndexedDB) {
            // Using indexedDBShim.
            QUnit.ok(false, "This test would hang with IndexedDBShim as of 2015-05-07");
            QUnit.start();
            return;
        }
        var ourDB = new Dexie("TestDB2");
        ourDB.version(1).stores({ users: "++id,first,last,&username,&*email,*pets" });
        ourDB.on("populate", function () {
            ourDB.users.add({ first: "Daniel", last: "Fahlenius", username: "dfahlenius", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
            ourDB.users.add({ first: "Carl", last: "Cedersköld", username: "cceder", email: ["karl@ceder.what"], pets: [] });
        });
        var errorCount = 0;
        ourDB.on("error", function (e) {
            QUnit.ok(errorCount < 5, "Uncatched error successfully bubbled to ourDB.on('error'): " + e.stack);
            if (++errorCount == 5) {
                ourDB.delete().then(function () {
                    Dexie.Promise.on('error').unsubscribe(swallowPromiseOnError);
                    QUnit.start();
                });
            }
        });
        function swallowPromiseOnError(e) {
            return false;
        }
        Dexie.Promise.on('error', swallowPromiseOnError); // Just to get rid of default error logs for not catching.

        ourDB.delete().then(function () {
            return ourDB.open();
        }).then(function () {

            ourDB.transaction("rw", ourDB.users, function () {
                ourDB.users.add({ username: "dfahlenius" }).then(function () {
                    QUnit.ok(false, "Should not be able to add two users with same username");
                });
            }).then(function () {
                QUnit.ok(false, "Transaction should not complete since errors wasnt catched");
            });
            ourDB.transaction("rw", ourDB.users, function () {
                ourDB.users.add({ username: "dfahlenius" }).then(function () {
                    QUnit.ok(false, "Should not be able to add two users with same username");
                });
            }).then(function () {
                QUnit.ok(false, "Transaction should not complete since errors wasnt catched");
            });
            ourDB.transaction("rw", ourDB.users, function () {
                ourDB.users.add({ id: {} }).then(function () {
                    QUnit.ok(false, "Should not be able to add user with faulty key");
                });
            }).then(function () {
                QUnit.ok(false, "Transaction should not complete since errors wasnt catched");
            }).catch(function (err) {
                QUnit.ok(true, "Got error: " + err.stack);
                return Dexie.Promise.reject(err); // Returning failed promise to bubble to db.on.error.
            });

            // And outside transactions:       
            ourDB.users.add({ username: "dfahlenius" }).then(function () {
                QUnit.ok(false, "Should not be able to add two users with same username");
            });
            ourDB.users.add({ id: {} }).then(function () {
                QUnit.ok(false, "Should not be able to add user with faulty key");
            });
        });
    });

    QUnit.asyncTest("Issue #32: db.on('error') doesnt catch 'not found index' DOMExceptions", function () {
        var ourDB = new Dexie("TestDB2");
        new Dexie.Promise(function (finalResolve) {
            ourDB.version(1).stores({ users: "++id" });
            ourDB.on("populate", function () {
                db$7.users.add({ id: 100, first: "David", last: "Fahlander" });
            });
            var errorHasBubbled = false;
            ourDB.on("error", function (e) {
                errorHasBubbled = true;
                QUnit.ok(true, "Uncatched error successfully bubbled to db.on('error'): " + e);
                finalResolve();
            });

            ourDB.open().then(function () {

                // Make the db fail by not finding a correct index:
                ourDB.users.where("I am a little frog!").equals(18).toArray();

                setTimeout(function () {
                    if (!errorHasBubbled) {
                        QUnit.ok(false, "Timeout! Error never bubbled to db.on('error')");
                    }
                    finalResolve();
                }, 300);
            });
        }).then(function () {
            ourDB.delete().then(QUnit.start);
        });
    });

    QUnit.asyncTest("Error in on('populate') should abort database creation", function () {
        var popufail = new Dexie("PopufailDB");
        popufail.version(1).stores({ users: "++id,first,last,&username,&*email,*pets" });
        popufail.on('populate', function () {
            popufail.users.add({ first: NaN, last: undefined, username: function () {} }).catch(function (e) {
                QUnit.ok(true, "Got error when catching add() operation: " + e);
                return Dexie.Promise.reject(e);
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
        function CustomError() {}

        var wasCatched = false;
        new Dexie.Promise(function (resolve, reject) {
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
        function CustomError() {}

        var wasCatched = false;
        Dexie.Promise.resolve(null).then(function () {
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
            Dexie.Promise.all([
            // WhereClause.equals()
            db$7.users.where('first').equals(false) // Using a non-valid key (boolean) must fail but as a Promise rejection, not an exception.
            .toArray().catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.equals() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.above()
            db$7.users.where('first').above(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray().catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.above() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.aboveOrEqual()
            db$7.users.where('first').aboveOrEqual(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray().catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.aboveOrEqual() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.below()
            db$7.users.where('first').below(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray().catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.below() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.belowOrEqual()
            db$7.users.where('first').belowOrEqual(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray().catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.belowOrEqual() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.anyOf()
            db$7.users.where('first').anyOf([undefined, null, false]) // Using a non-valid key (undefined, false) must fail but as a Promise rejection, not an exception.
            .toArray().catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.anyOf() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.between()
            db$7.users.where('first').between(false, true) // Using a non-valid key (boolean) must fail but as a Promise rejection, not an exception.
            .toArray().catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.between() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.equalsIgnoreCase()
            db$7.users.where('first').equalsIgnoreCase(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray().catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.equalsIgnoreCase() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.startsWith()
            db$7.users.where('first').startsWith(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray().catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.startsWith() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.startsWithIgnoreCase()
            db$7.users.where('first').startsWithIgnoreCase(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray().catch(function (err) {
                QUnit.ok(true, "Invalid key passed to WhereClause.startsWithIgnoreCase() returned as a failed Promise and not an exception.");
            })]).catch(function () {
                QUnit.ok(false, "No promise should finally reject because we catch them all explicitely.");
            }).finally(QUnit.start);
        } catch (ex) {
            QUnit.ok(false, "Error was not encapsulated as a Promise failure: " + (ex.stack || ex));
            QUnit.start();
        }
    });

    QUnit.asyncTest("Issue #67 - Regression test - Transaction still fails if error in key", function () {
        db$7.transaction('rw', db$7.users, function () {
            db$7.users.where('first').above("").delete().then(function (num) {
                QUnit.ok(true, num + " users deleted");
                db$7.users.where('first').above(undefined).delete();
            });
        }).then(function () {
            QUnit.ok(false, "Transaction should not commit when we an unhandled error has happened");
        }).catch(function (err) {
            QUnit.ok(true, "Good, transaction failed as expected");
        }).finally(QUnit.start);
    });

    QUnit.asyncTest("Issue #69 Global exception handler for promises", function () {
        var errorList = [];
        function globalRejectionHandler(e) {
            console.log("Got error: " + e);
            if (errorList.indexOf(e) === -1) // Current implementation: accept multiple redundant triggers
                errorList.push(e);
        }

        Dexie.Promise.on("error", globalRejectionHandler);

        // The most simple case: Any Promise reject that is not catched should
        // be handled by the global error listener.
        new Dexie.Promise(function (resolve, reject) {
            reject("first error (by reject)");
        });

        // Also if the rejection was caused by a throw...
        new Dexie.Promise(function () {
            throw "second error (throw)";
        });

        // But when catched it should not trigger the global event:
        new Dexie.Promise(function (resolve, reject) {
            reject("third error (catched)");
        }).catch(function (e) {
            QUnit.ok(true, "Catched error explicitely: " + e);
        });

        // If catching an explicit error type that was not thrown, it should be triggered
        new Dexie.Promise(function (resolve, reject) {
            reject("Simple error 1");
        }).catch(TypeError, function (e) {
            QUnit.ok(false, "Error should not have been TypeError");
        }); // Real error slip away... should be handled by global handler

        new Dexie.Promise(function (resolve, reject) {
            reject(new TypeError("Type Error 1"));
        }).catch(TypeError, function (e) {
            QUnit.ok(true, "Catched the TypeError");
            // Now we have handled it. Not bubble to global handler!
        });

        // With finally, it should yet trigger the global event:
        new Dexie.Promise(function (resolve, reject) {
            reject("forth error (uncatched but with finally)");
        }).finally(function () {
            // From issue #43:
            // Prepare by cleaning up any unfinished previous run:
            Dexie.delete("testdb").then(function () {
                // Now just do some Dexie stuff...
                var db = new Dexie("testdb");
                db.version(1).stores({ table1: "id" });
                db.on('error', function (err) {
                    // Global 'db' error handler (will never be called 'cause the error is not in a transaction)
                    console.log("db.on.error: " + err);
                    errorList.push("Got db.on.error: " + err);
                });
                db.open().then(function () {
                    console.log("before");
                    throw "FOO"; // Here a generic error is thrown (not a DB error)
                    //console.log("after");
                });
                db.delete().finally(function () {
                    QUnit.equal(errorList.length, 5, "THere should be 4 global errors triggered");
                    QUnit.equal(errorList[0], "first error (by reject)", "first error (by reject)");
                    QUnit.equal(errorList[1], "second error (throw)", "second error (throw)");
                    QUnit.equal(errorList[2], "Simple error 1", "Simple error 1");
                    QUnit.equal(errorList[3], "forth error (uncatched but with finally)", "forth error (uncatched but with finally)");
                    QUnit.equal(errorList[4], "FOO", "FOO");
                    // cleanup:
                    Dexie.Promise.on("error").unsubscribe(globalRejectionHandler);
                    QUnit.start();
                });
            });
        });
    });

    QUnit.module("upgrading");

    var Promise$2 = Dexie.Promise;

    QUnit.asyncTest("upgrade", function () {
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
        var baseNumberOfTables = 0; // Instead of expecting an empty database to have 0 tables, we read how many an empty database has. Reason: Addons may add meta tables.

        Promise$2.resolve(function () {
            return Dexie.delete("Upgrade-test");
        }).then(function () {
            // Empty Schema
            db = new Dexie(DBNAME);
            db.version(1).stores({});
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Could create empty database without any schema");
            baseNumberOfTables = db.tables.length;
            db.close();
            db = new Dexie(DBNAME);
            db.version(1).stores({});
            db.version(2).stores({ store1: "++id" });
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Succeeded to upgrade");
            QUnit.equal(db.verno, 2, "Version = 2");
            QUnit.equal(db.table("store1").schema.primKey.name, "id", "Primary key is 'id'");
            db.close();
            //
            // Add indexes
            //
            db = new Dexie(DBNAME);
            db.version(1).stores({});
            db.version(2).stores({ store1: "++id" });
            db.version(3).stores({ store1: "++id,name" }); // Adding the name index
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Could upgrade to version 3 (adding an index to a store)");
            // Testing that the added index is working indeed:
            return db.transaction('rw', "store1", function () {
                db.store1.add({ name: "apa" });
                db.store1.where("name").equals("apa").count(function (count) {
                    QUnit.equal(count, 1, "Apa was found by its new index (The newly added index really works!)");
                });
            });
        }).then(function () {
            db.close();
            db = new Dexie(DBNAME);
            // Testing:
            //  1. Place latest version first (order should not matter)
            //  2. Removing the 'name' index.
            db.version(4).stores({ store1: "++id" });
            db.version(3).stores({ store1: "++id,name" });
            db.version(2).stores({ store1: "++id" });
            db.version(1).stores({});
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Could upgrade to version 4 (removing an index)");
            QUnit.equal(db.tables[0].schema.indexes.length, 0, "No indexes in schema now when 'name' index was removed");
            db.close();
            //
            // Testing to run an upgrader function
            //
            db = new Dexie(DBNAME);
            // (Need not to specify earlier versions than 4 because 'I have no users out there running on version below 4'.)
            db.version(4).stores({ store1: "++id" });
            db.version(5).stores({ store1: "++id,&email" }).upgrade(function (trans) {
                var counter = 0;
                trans.table("store1").toCollection().modify(function (obj) {
                    // Since we have a new primary key we must make sure it's unique on all objects
                    obj.email = "user" + ++counter + "@abc.com";
                });
            });
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Could upgrade to version 5 where an upgrader function was applied");
            return db.table("store1").toArray();
        }).then(function (array) {
            QUnit.equal(array.length, 1, "We still have the object created in version 3 there");
            QUnit.equal(array[0].email, "user1@abc.com", "The object got its upgrade function running");
            QUnit.equal(array[0].id, 1, "The object still has the same primary key");
            QUnit.equal(array[0].name, "apa", "The object still has the name 'apa' that was given to it when it was created");
            db.close();

            //
            // Now, test to change a property of an index
            //
            db = new Dexie(DBNAME);
            db.version(5).stores({ store1: "++id,&email" }); // Need not to specify an upgrader function when we know it's not gonna run (we are already on ver 5)
            db.version(6).stores({ store1: "++id,*email" }).upgrade(function (trans) {
                // Changing email index from unique to multi-valued
                trans.table("store1").toCollection().modify(function (obj) {
                    obj.email = [obj.email]; // Turning single-valued unique email into an array of emails.
                });
            });
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Could upgrade to version 6");
            QUnit.equal(db.tables.length, baseNumberOfTables + 1, "There should be 1 store now");
            return db.table('store1').get(1, function (apaUser) {
                QUnit.ok(apaUser.email instanceof Array, "email is now an array");
                QUnit.equal(apaUser.email[0], "user1@abc.com", "First email is user1@abc.com");
            });
        }).then(function () {
            // Test that it is now ok to add two different users with the same email, since we have removed the uniqueness requirement of the index
            return db.table('store1').add({ name: "apa2", email: ["user1@abc.com"] });
        }).then(function () {
            return db.table('store1').toArray();
        }).then(function (array) {
            QUnit.equal(array.length, 2, "There are now two users in db");
            QUnit.equal(array[0].email[0], array[1].email[0], "The two users share the same email value");
            db.close();

            //
            // Now, test that we may specify the changed object stores only
            //
            db = new Dexie(DBNAME);
            db.version(6).stores({ store1: "++id,*email" }); // Need not to specify an upgrader function when we know it's not gonna run (we are already on ver 5)
            db.version(7).stores({ store2: "uuid" });
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Could upgrade to version 7");
            QUnit.equal(db.tables.length, baseNumberOfTables + 2, "There should be 2 stores now");
            db.close();

            //
            // Now, test to remove an object store
            //
            db = new Dexie(DBNAME);
            db.version(6).stores({ store1: "++id,*email" }); // Need to keep version 6 or add its missing stores to version 7. Choosing to keep versoin 6.
            db.version(7).stores({ store2: "uuid" });
            db.version(8).stores({ store1: null }); // Deleting a version.
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Could upgrade to version 8 - deleting an object store");
            QUnit.equal(db.tables.length, baseNumberOfTables + 1, "There should only be 1 store now");

            // Now test: Delete DB and open it with ALL versions specs specified (check it will run in sequence)
            return db.delete();
        }).then(function () {
            db = new Dexie(DBNAME);
            db.version(1).stores({});
            db.version(2).stores({ store1: "++id" });
            db.version(3).stores({ store1: "++id,name" }); // Adding the name index
            db.version(4).stores({ store1: "++id" });
            db.version(5).stores({ store1: "++id,&email" }).upgrade(function (trans) {
                var counter = 0;
                trans.table("store1").toCollection().modify(function (obj) {
                    // Since we have a new primary key we must make sure it's unique on all objects
                    obj.email = "user" + ++counter + "@abc.com";
                });
            });
            db.version(6).stores({ store1: "++id,*email" }).upgrade(function (trans) {
                // Changing email index from unique to multi-valued
                trans.table("store1").toCollection().modify(function (obj) {
                    obj.email = [obj.email]; // Turning single-valued unique email into an array of emails.
                });
            });
            db.version(7).stores({ store2: "uuid" });
            db.version(8).stores({ store1: null });
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Could create new database");
            QUnit.equal(db.verno, 8, "Version is 8");
            QUnit.equal(db.tables.length, baseNumberOfTables + 1, "There should only be 1 store now");
            var store2Table = db.tables.filter(function (table) {
                return table.name == "store2";
            })[0];
            QUnit.ok(store2Table, "The store we have is store2");
            QUnit.equal(store2Table.schema.primKey.name, "uuid", "The prim key is uuid");
            return db.delete();
        }).then(function () {
            // Once recreate the database but now use a reverse order of the versions:
            db = new Dexie(DBNAME);
            db.version(8).stores({ store1: null });
            db.version(7).stores({ store2: "uuid" });
            db.version(6).stores({ store1: "++id,*email" }).upgrade(function (trans) {
                // Changing email index from unique to multi-valued
                trans.table("store1").toCollection().modify(function (obj) {
                    obj.email = [obj.email]; // Turning single-valued unique email into an array of emails.
                });
            });
            db.version(5).stores({ store1: "++id,&email" }).upgrade(function (trans) {
                var counter = 0;
                trans.table("store1").toCollection().modify(function (obj) {
                    // Since we have a new primary key we must make sure it's unique on all objects
                    obj.email = "user" + ++counter + "@abc.com";
                });
            });
            db.version(4).stores({ store1: "++id" });
            db.version(3).stores({ store1: "++id,name" }); // Adding the name index
            db.version(2).stores({ store1: "++id" });
            db.version(1).stores({});
            return db.open();
        }).then(function () {
            QUnit.ok(true, "Could create new database");
            QUnit.equal(db.verno, 8, "Version is 8");
            QUnit.equal(db.tables.length, baseNumberOfTables + 1, "There should only be 1 store now");
            var store2Table = db.tables.filter(function (table) {
                return table.name == "store2";
            })[0];
            QUnit.ok(store2Table, "The store we have is store2");
            QUnit.equal(store2Table.schema.primKey.name, "uuid", "The prim key is uuid");
        }).catch(function (err) {
            QUnit.ok(false, "Error: " + err);
        }).finally(function () {
            if (db) db.close();
            Dexie.delete(DBNAME).then(QUnit.start);
        });
    });

    QUnit.asyncTest("Issue #30 - Problem with existing db", function () {
        if (!supports("compound+multiEntry")) {
            QUnit.ok(true, "SKIPPED - COMPOUND + MULTIENTRY UNSUPPORTED");
            return QUnit.start();
        }
        ///<var type="Dexie" />
        var db; // Will be used as a migrated version of the db.

        // Start by deleting the db if it exists:
        Dexie.delete("raw-db").then(function () {

            // Create a bare-bone indexedDB database with custom indexes of various kinds.
            return new Dexie.Promise(function (resolve, reject) {
                var indexedDB = Dexie.dependencies.indexedDB;
                var rawdb, req;

                function error(e) {
                    if (rawdb) rawdb.close();
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
                    } catch (ex) {
                        if (rawdb) rawdb.close();
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
            db = new Dexie("raw-db", { addons: [] }); // Explicitely don't use addons here. Syncable would fail to open an existing db.
            db.version(0.2).stores({
                people: "_id",
                messages: "++,text,words,id,[size+color]",
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
            db = new Dexie("raw-db");
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
            if (db) db.close();
            Dexie.delete("raw-db").then(QUnit.start);
        });
    });

}));
//# sourceMappingURL=bundle.js.map