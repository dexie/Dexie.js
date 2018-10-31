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

    var _this = undefined;
    qunit.module("simple-import");
    var DATABASE_NAME = "dexie-simple-import";
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
        var blob, db, friends;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    blob = new Blob([JSON.stringify(IMPORT_DATA)]);
                    return [4 /*yield*/, Dexie.delete(DATABASE_NAME)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, Dexie.import(blob, {
                            chunkSizeBytes: 16,
                        })];
                case 2:
                    db = _a.sent();
                    return [4 /*yield*/, db.table("friends").toArray()];
                case 3:
                    friends = _a.sent();
                    qunit.deepEqual(IMPORT_DATA.data.data[0].rows, friends, "Imported data should equal");
                    return [2 /*return*/];
            }
        });
    }); });

})));
//# sourceMappingURL=bundle.js.map
