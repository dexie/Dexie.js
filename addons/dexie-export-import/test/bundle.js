(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('qunit'), require('dexie'), require('dexie-export-import')) :
    typeof define === 'function' && define.amd ? define(['qunit', 'dexie', 'dexie-export-import'], factory) :
    (factory(global.QUnit,global.Dexie));
}(this, (function (qunit,Dexie) { 'use strict';

    Dexie = Dexie && Dexie.hasOwnProperty('default') ? Dexie['default'] : Dexie;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
    }

    function promisedTest(name, tester) {
        var _this = this;
        qunit.asyncTest(name, function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, tester()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        qunit.ok(false, "Got error: " + error_1);
                        return [3 /*break*/, 4];
                    case 3:
                        qunit.start();
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    }
    function readBlob(blob) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onabort = function (ev) { return reject(new Error("file read aborted")); };
            reader.onerror = function (ev) { return reject(ev.target.error); };
            reader.onload = function (ev) { return resolve(ev.target.result); };
            reader.readAsText(blob);
        });
    }

    var _this = undefined;
    qunit.module("basic-tests");
    var DATABASE_NAME = "dexie-export-import-basic-tests";
    var IMPORT_DATA = {
        formatName: "dexie",
        formatVersion: 1,
        data: {
            databaseName: DATABASE_NAME,
            databaseVersion: 1,
            tables: [{
                    name: "friends",
                    schema: "++id,name,age",
                    rowCount: NaN
                }],
            data: [{
                    inbound: true,
                    tableName: "friends",
                    rows: [{
                            id: 1,
                            name: "Foo",
                            age: 33
                        }, {
                            id: 2,
                            name: "Bar",
                            age: 44,
                        }, {
                            id: 3,
                            name: "Bee",
                            age: 55
                        }]
                }]
        }
    };
    // Set correct row count:
    IMPORT_DATA.data.tables[0].rowCount = IMPORT_DATA.data.data[0].rows.length;
    promisedTest("simple-import", function () { return __awaiter(_this, void 0, void 0, function () {
        var blob, db, friends, error_1, friends2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    blob = new Blob([JSON.stringify(IMPORT_DATA)]);
                    return [4 /*yield*/, Dexie.delete(DATABASE_NAME)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, Dexie.import(blob, {
                            chunkSizeBytes: 11,
                        })];
                case 2:
                    db = _a.sent();
                    return [4 /*yield*/, db.table("friends").toArray()];
                case 3:
                    friends = _a.sent();
                    qunit.deepEqual(IMPORT_DATA.data.data[0].rows, friends, "Imported data should equal");
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, db.import(blob)];
                case 5:
                    _a.sent();
                    qunit.ok(false, "Should not work to reimport without overwriteValues option set");
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    qunit.equal(error_1.name, "BulkError", "Should fail with BulkError");
                    return [3 /*break*/, 7];
                case 7: return [4 /*yield*/, db.import(blob, { overwriteValues: true })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, db.table("friends").toArray()];
                case 9:
                    friends2 = _a.sent();
                    qunit.deepEqual(IMPORT_DATA.data.data[0].rows, friends2, "Imported data should equal");
                    return [4 /*yield*/, Dexie.delete(DATABASE_NAME)];
                case 10:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    promisedTest("export-format", function () { return __awaiter(_this, void 0, void 0, function () {
        var db, blob, json, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Dexie.delete(DATABASE_NAME)];
                case 1:
                    _a.sent();
                    db = new Dexie(DATABASE_NAME);
                    db.version(1).stores({
                        outbound: '',
                        inbound: 'id'
                    });
                    return [4 /*yield*/, db.table('outbound').bulkAdd([{
                                date: new Date(1),
                                blob: new Blob(["something"]),
                                binary: new Uint8Array([1, 2, 3]),
                                text: "foo",
                                check: false,
                            }, {
                                foo: "bar"
                            }, {
                                bar: "foo"
                            }], [
                            new Date(1),
                            2,
                            "3"
                        ])];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, db.table("inbound").bulkAdd([{
                                id: 1,
                                date: new Date(1),
                                blob: new Blob(["something"]),
                                binary: new Uint8Array([1, 2, 3]),
                                text: "foo",
                                check: false
                            }, {
                                id: 2,
                                foo: "bar"
                            }, {
                                id: 3,
                                bar: "foo"
                            }])];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, db.export({ prettyJson: true })];
                case 4:
                    blob = _a.sent();
                    return [4 /*yield*/, readBlob(blob)];
                case 5:
                    json = _a.sent();
                    console.log("json", json);
                    parsed = JSON.parse(json);
                    console.log("parsed", parsed);
                    return [2 /*return*/];
            }
        });
    }); });

})));
//# sourceMappingURL=bundle.js.map
