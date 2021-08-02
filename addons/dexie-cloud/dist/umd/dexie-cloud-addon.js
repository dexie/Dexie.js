(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('dexie'), require('rxjs')) :
    typeof define === 'function' && define.amd ? define(['exports', 'dexie', 'rxjs'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.DexieCloud = {}, global.Dexie, global.rxjs));
}(this, (function (exports, Dexie, rxjs) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Dexie__default = /*#__PURE__*/_interopDefaultLegacy(Dexie);

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

    var extendStatics$1 = function(d, b) {
        extendStatics$1 = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics$1(d, b);
    };

    function __extends$1(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics$1(d, b);
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

    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }

    /* ==========================================================================
     *                           dexie-cloud-addom.js
     * ==========================================================================
     *
     * Dexie addon that syncs IndexedDB with Dexie Cloud.
     *
     * By David Fahlander, david@dexie.org
     *
     * ==========================================================================
     *
     * Version 1.0.0-beta.6, Mon Aug 02 2021
     *
     * https://dexie.org
     *
     * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
     *
     */
    //@ts-check
    var randomFillSync = crypto.getRandomValues;
    function assert(b) {
        if (!b)
            throw new Error('Assertion Failed');
    }
    function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === undefined)
            return;
        if ('isFrozen' in Object && Object.isFrozen(obj))
            return;
        if (typeof keyPath !== 'string' && 'length' in keyPath) {
            assert(typeof value !== 'string' && 'length' in value);
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                setByKeyPath(obj, keyPath[i], value[i]);
            }
        }
        else {
            var period = keyPath.indexOf('.');
            if (period !== -1) {
                var currentKeyPath = keyPath.substr(0, period);
                var remainingKeyPath = keyPath.substr(period + 1);
                if (remainingKeyPath === '')
                    if (value === undefined) {
                        if (Array.isArray(obj)) {
                            if (!isNaN(parseInt(currentKeyPath)))
                                obj.splice(parseInt(currentKeyPath), 1);
                        }
                        else
                            delete obj[currentKeyPath];
                        // @ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
                    }
                    else
                        obj[currentKeyPath] = value;
                else {
                    //@ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
                    var innerObj = obj[currentKeyPath];
                    //@ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
                    if (!innerObj)
                        innerObj = obj[currentKeyPath] = {};
                    setByKeyPath(innerObj, remainingKeyPath, value);
                }
            }
            else {
                if (value === undefined) {
                    if (Array.isArray(obj) && !isNaN(parseInt(keyPath)))
                        // @ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
                        obj.splice(keyPath, 1);
                    //@ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
                    else
                        delete obj[keyPath];
                    //@ts-ignore: even if currentKeyPath would be numeric string and obj would be array - it works.
                }
                else
                    obj[keyPath] = value;
            }
        }
    }
    var randomString$1 = typeof self === 'undefined' ? function (bytes) {
        // Node
        var buf = Buffer.alloc(bytes);
        randomFillSync(buf);
        return buf.toString("base64");
    } : function (bytes) {
        // Web
        var buf = new Uint8Array(bytes);
        crypto.getRandomValues(buf);
        return btoa(String.fromCharCode.apply(null, buf));
    };
    /** Verifies that given primary key is valid.
     * The reason we narrow validity for valid keys are twofold:
     *  1: Make sure to only support types that can be used as an object index in DBKeyMutationSet.
     *     For example, ArrayBuffer cannot be used (gives "object ArrayBuffer") but Uint8Array can be
     *     used (gives comma-delimited list of included bytes).
     *  2: Avoid using plain numbers and Dates as keys when they are synced, as they are not globally unique.
     *  3: Since we store the key as a VARCHAR server side in current version, try not promote types that stringifies to become very long server side.
     *
     * @param id
     * @returns
     */
    function isValidSyncableID(id) {
        if (typeof id === "string")
            return true;
        //if (validIDTypes[toStringTag(id)]) return true;
        //if (Array.isArray(id)) return id.every((part) => isValidSyncableID(part));
        if (Array.isArray(id) && id.some(function (key) { return isValidSyncableID(key); }) && id.every(isValidSyncableIDPart))
            return true;
        return false;
    }
    /** Verifies that given key part is valid.
     *  1: Make sure that arrays of this types are stringified correclty and works with DBKeyMutationSet.
     *     For example, ArrayBuffer cannot be used (gives "object ArrayBuffer") but Uint8Array can be
     *     used (gives comma-delimited list of included bytes).
     *  2: Since we store the key as a VARCHAR server side in current version, try not promote types that stringifies to become very long server side.
    */
    function isValidSyncableIDPart(part) {
        return typeof part === "string" || typeof part === "number" || Array.isArray(part) && part.every(isValidSyncableIDPart);
    }
    function isValidAtID(id, idPrefix) {
        return !idPrefix || (typeof id === "string" && id.startsWith(idPrefix));
    }
    function applyOperation(target, table, op) {
        var tbl = target[table] || (target[table] = {});
        switch (op.type) {
            case "insert":
            // TODO: Don't treat insert and upsert the same?
            case "upsert":
                op.keys.forEach(function (key, idx) {
                    tbl[key] = {
                        type: "ups",
                        val: op.values[idx],
                    };
                });
                break;
            case "update":
            case "modify": {
                op.keys.forEach(function (key, idx) {
                    var changeSpec = op.type === "update"
                        ? op.changeSpecs[idx]
                        : op.changeSpec;
                    var entry = tbl[key];
                    if (!entry) {
                        tbl[key] = {
                            type: "upd",
                            mod: changeSpec,
                        };
                    }
                    else {
                        switch (entry.type) {
                            case "ups":
                                // Adjust the existing upsert with additional updates
                                for (var _g = 0, _h = Object.entries(changeSpec); _g < _h.length; _g++) {
                                    var _j = _h[_g], propPath = _j[0], value = _j[1];
                                    setByKeyPath(entry.val, propPath, value);
                                }
                                break;
                            case "del":
                                // No action.
                                break;
                            case "upd":
                                // Adjust existing update with additional updates
                                Object.assign(entry.mod, changeSpec); // May work for deep props as well - new keys is added later, right? Does the prop order persist along TSON and all? But it will not be 100% when combined with some server code (seach for "address.city": "Stockholm" comment)
                                break;
                        }
                    }
                });
                break;
            }
            case "delete":
                op.keys.forEach(function (key) {
                    tbl[key] = {
                        type: "del",
                    };
                });
                break;
        }
        return target;
    }
    function applyOperations(target, ops) {
        for (var _g = 0, ops_1 = ops; _g < ops_1.length; _g++) {
            var _h = ops_1[_g], table = _h.table, muts = _h.muts;
            for (var _j = 0, muts_1 = muts; _j < muts_1.length; _j++) {
                var mut = muts_1[_j];
                applyOperation(target, table, mut);
            }
        }
    }
    function subtractChanges(target, // Server change set
    changesToSubtract // additional mutations on client during syncWithServer()
    ) {
        var _a, _b, _c;
        for (var _g = 0, _h = Object.entries(changesToSubtract); _g < _h.length; _g++) {
            var _j = _h[_g], table = _j[0], mutationSet = _j[1];
            for (var _k = 0, _l = Object.entries(mutationSet); _k < _l.length; _k++) {
                var _m = _l[_k], key = _m[0], mut = _m[1];
                switch (mut.type) {
                    case 'ups':
                        {
                            var targetMut = (_a = target[table]) === null || _a === void 0 ? void 0 : _a[key];
                            if (targetMut) {
                                switch (targetMut.type) {
                                    case 'ups':
                                        delete target[table][key];
                                        break;
                                    case 'del':
                                        // Leave delete operation.
                                        // (Don't resurrect objects unintenionally (using tx(get, put) pattern locally))
                                        break;
                                    case 'upd':
                                        delete target[table][key];
                                        break;
                                }
                            }
                        }
                        break;
                    case 'del':
                        (_b = target[table]) === null || _b === void 0 ? true : delete _b[key];
                        break;
                    case 'upd': {
                        var targetMut = (_c = target[table]) === null || _c === void 0 ? void 0 : _c[key];
                        if (targetMut) {
                            switch (targetMut.type) {
                                case 'ups':
                                    // Adjust the server upsert with locally updated values.
                                    for (var _o = 0, _p = Object.entries(mut.mod); _o < _p.length; _o++) {
                                        var _q = _p[_o], propPath = _q[0], value = _q[1];
                                        setByKeyPath(targetMut.val, propPath, value);
                                    }
                                    break;
                                case 'del':
                                    // Leave delete.
                                    break;
                                case 'upd':
                                    // Remove the local update props from the server update mutation.
                                    for (var _r = 0, _s = Object.keys(mut.mod); _r < _s.length; _r++) {
                                        var propPath = _s[_r];
                                        delete targetMut.mod[propPath];
                                    }
                                    break;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    /** Convert a DBKeyMutationSet (which is an internal format capable of looking up changes per ID)
     * ...into a DBOperationsSet (which is more optimal for performing DB operations into DB (bulkAdd() etc))
     *
     * @param inSet
     * @returns DBOperationsSet representing inSet
     */
    function toDBOperationSet(inSet) {
        // Fictive transaction:
        var txid = randomString$1(16);
        // Convert data into a temporary map to collect mutations of same table and type
        var map = {};
        for (var _g = 0, _h = Object.entries(inSet); _g < _h.length; _g++) {
            var _j = _h[_g], table = _j[0], ops = _j[1];
            for (var _k = 0, _l = Object.entries(ops); _k < _l.length; _k++) {
                var _m = _l[_k], key = _m[0], op = _m[1];
                var mapEntry = map[table] || (map[table] = {});
                var ops_2 = mapEntry[op.type] || (mapEntry[op.type] = []);
                ops_2.push(Object.assign({ key: key }, op)); // DBKeyMutation doesn't contain key, so we need to bring it in.
            }
        }
        // Start computing the resulting format:
        var result = [];
        for (var _o = 0, _p = Object.entries(map); _o < _p.length; _o++) {
            var _q = _p[_o], table = _q[0], ops = _q[1];
            var resultEntry = {
                table: table,
                muts: [],
            };
            for (var _r = 0, _s = Object.entries(ops); _r < _s.length; _r++) {
                var _t = _s[_r], optype = _t[0], muts = _t[1];
                switch (optype) {
                    case "ups": {
                        var op = {
                            type: "upsert",
                            keys: muts.map(function (mut) { return mut.key; }),
                            values: muts.map(function (mut) { return mut.val; }),
                            txid: txid
                        };
                        resultEntry.muts.push(op);
                        break;
                    }
                    case "upd": {
                        var op = {
                            type: "update",
                            keys: muts.map(function (mut) { return mut.key; }),
                            changeSpecs: muts.map(function (mut) { return mut.mod; }),
                            txid: txid
                        };
                        resultEntry.muts.push(op);
                        break;
                    }
                    case "del": {
                        var op = {
                            type: "delete",
                            keys: muts.map(function (mut) { return mut.key; }),
                            txid: txid,
                        };
                        resultEntry.muts.push(op);
                        break;
                    }
                }
            }
            result.push(resultEntry);
        }
        return result;
    }
    function getDbNameFromDbUrl(dbUrl) {
        var url = new URL(dbUrl);
        return url.pathname === "/"
            ? url.hostname.split('.')[0]
            : url.pathname.split('/')[1];
    }
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
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
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
    var empty$1 = {
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
    var isArray = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();
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
            if (isArray(_subscriptions)) {
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
                    _this.destination = empty$1;
                    break;
                case 1:
                    if (!destinationOrNext) {
                        _this.destination = empty$1;
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
                if (observerOrNext !== empty$1) {
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
            return new Subscriber(empty$1);
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
            var observable = new Observable();
            observable.source = this;
            observable.operator = operator;
            return observable;
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
            promiseCtor = Promise;
        }
        if (!promiseCtor) {
            throw new Error('no Promise impl found');
        }
        return promiseCtor;
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
            var iterator$1 = iterable[iterator]();
            do {
                var item = void 0;
                try {
                    item = iterator$1.next();
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
            if (typeof iterator$1.return === 'function') {
                subscriber.add(function () {
                    if (iterator$1.return) {
                        iterator$1.return();
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
    function innerSubscribe(result, innerSubscriber) {
        if (innerSubscriber.closed) {
            return undefined;
        }
        if (result instanceof Observable) {
            return result.subscribe(innerSubscriber);
        }
        var subscription;
        try {
            subscription = subscribeTo(result)(innerSubscriber);
        }
        catch (error) {
            innerSubscriber.error(error);
        }
        return subscription;
    }
    /** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
    var Action = /*@__PURE__*/ (function (_super) {
        __extends(Action, _super);
        function Action(scheduler, work) {
            return _super.call(this) || this;
        }
        Action.prototype.schedule = function (state, delay) {
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
    /** PURE_IMPORTS_START _AsyncAction,_AsyncScheduler PURE_IMPORTS_END */
    var asyncScheduler = /*@__PURE__*/ new AsyncScheduler(AsyncAction);
    var async = asyncScheduler;
    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isScheduler(value) {
        return value && typeof value.schedule === 'function';
    }
    /** PURE_IMPORTS_START tslib,_innerSubscribe PURE_IMPORTS_END */
    function catchError(selector) {
        return function catchErrorOperatorFunction(source) {
            var operator = new CatchOperator(selector);
            var caught = source.lift(operator);
            return (operator.caught = caught);
        };
    }
    var CatchOperator = /*@__PURE__*/ (function () {
        function CatchOperator(selector) {
            this.selector = selector;
        }
        CatchOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
        };
        return CatchOperator;
    }());
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
    /** PURE_IMPORTS_START _Observable,_Subscription,_symbol_observable PURE_IMPORTS_END */
    function scheduleObservable(input, scheduler) {
        return new Observable(function (subscriber) {
            var sub = new Subscription();
            sub.add(scheduler.schedule(function () {
                var observable$1 = input[observable]();
                sub.add(observable$1.subscribe({
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
            var iterator$1;
            sub.add(function () {
                if (iterator$1 && typeof iterator$1.return === 'function') {
                    iterator$1.return();
                }
            });
            sub.add(scheduler.schedule(function () {
                iterator$1 = input[iterator]();
                sub.add(scheduler.schedule(function () {
                    if (subscriber.closed) {
                        return;
                    }
                    var value;
                    var done;
                    try {
                        var result = iterator$1.next();
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
    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function isDate(value) {
        return value instanceof Date && !isNaN(+value);
    }
    /** PURE_IMPORTS_START _Observable PURE_IMPORTS_END */
    var EMPTY = /*@__PURE__*/ new Observable(function (subscriber) { return subscriber.complete(); });
    function empty(scheduler) {
        return scheduler ? emptyScheduled(scheduler) : EMPTY;
    }
    function emptyScheduled(scheduler) {
        return new Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
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
                    return empty();
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
    /** PURE_IMPORTS_START tslib,_scheduler_async,_util_isDate,_Subscriber,_Notification PURE_IMPORTS_END */
    function delay(delay, scheduler) {
        if (scheduler === void 0) {
            scheduler = async;
        }
        var absoluteDelay = isDate(delay);
        var delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(delay);
        return function (source) { return source.lift(new DelayOperator(delayFor, scheduler)); };
    }
    var DelayOperator = /*@__PURE__*/ (function () {
        function DelayOperator(delay, scheduler) {
            this.delay = delay;
            this.scheduler = scheduler;
        }
        DelayOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));
        };
        return DelayOperator;
    }());
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
    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var ArgumentOutOfRangeErrorImpl = /*@__PURE__*/ (function () {
        function ArgumentOutOfRangeErrorImpl() {
            Error.call(this);
            this.message = 'argument out of range';
            this.name = 'ArgumentOutOfRangeError';
            return this;
        }
        ArgumentOutOfRangeErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
        return ArgumentOutOfRangeErrorImpl;
    })();
    var ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;
    /** PURE_IMPORTS_START tslib,_Subscriber PURE_IMPORTS_END */
    function filter(predicate, thisArg) {
        return function filterOperatorFunction(source) {
            return source.lift(new FilterOperator(predicate, thisArg));
        };
    }
    var FilterOperator = /*@__PURE__*/ (function () {
        function FilterOperator(predicate, thisArg) {
            this.predicate = predicate;
            this.thisArg = thisArg;
        }
        FilterOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
        };
        return FilterOperator;
    }());
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
    /** PURE_IMPORTS_START tslib,_Subscriber,_util_ArgumentOutOfRangeError,_observable_empty PURE_IMPORTS_END */
    function take(count) {
        return function (source) {
            if (count === 0) {
                return empty();
            }
            else {
                return source.lift(new TakeOperator(count));
            }
        };
    }
    var TakeOperator = /*@__PURE__*/ (function () {
        function TakeOperator(total) {
            this.total = total;
            if (this.total < 0) {
                throw new ArgumentOutOfRangeError;
            }
        }
        TakeOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new TakeSubscriber(subscriber, this.total));
        };
        return TakeOperator;
    }());
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
    /** PURE_IMPORTS_START tslib,_map,_observable_from,_innerSubscribe PURE_IMPORTS_END */
    function switchMap(project, resultSelector) {
        if (typeof resultSelector === 'function') {
            return function (source) { return source.pipe(switchMap(function (a, i) { return from(project(a, i)).pipe(map(function (b, ii) { return resultSelector(a, b, i, ii); })); })); };
        }
        return function (source) { return source.lift(new SwitchMapOperator(project)); };
    }
    var SwitchMapOperator = /*@__PURE__*/ (function () {
        function SwitchMapOperator(project) {
            this.project = project;
        }
        SwitchMapOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new SwitchMapSubscriber(subscriber, this.project));
        };
        return SwitchMapOperator;
    }());
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
    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    function noop() { }
    /** PURE_IMPORTS_START tslib,_Subscriber,_util_noop,_util_isFunction PURE_IMPORTS_END */
    function tap(nextOrObserver, error, complete) {
        return function tapOperatorFunction(source) {
            return source.lift(new DoOperator(nextOrObserver, error, complete));
        };
    }
    var DoOperator = /*@__PURE__*/ (function () {
        function DoOperator(nextOrObserver, error, complete) {
            this.nextOrObserver = nextOrObserver;
            this.error = error;
            this.complete = complete;
        }
        DoOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new TapSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
        };
        return DoOperator;
    }());
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
    /** PURE_IMPORTS_START  PURE_IMPORTS_END */
    var TimeoutErrorImpl = /*@__PURE__*/ (function () {
        function TimeoutErrorImpl() {
            Error.call(this);
            this.message = 'Timeout has occurred';
            this.name = 'TimeoutError';
            return this;
        }
        TimeoutErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
        return TimeoutErrorImpl;
    })();
    var TimeoutError = TimeoutErrorImpl;
    /** PURE_IMPORTS_START tslib,_scheduler_async,_util_isDate,_innerSubscribe PURE_IMPORTS_END */
    function timeoutWith(due, withObservable, scheduler) {
        if (scheduler === void 0) {
            scheduler = async;
        }
        return function (source) {
            var absoluteTimeout = isDate(due);
            var waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(due);
            return source.lift(new TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler));
        };
    }
    var TimeoutWithOperator = /*@__PURE__*/ (function () {
        function TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler) {
            this.waitFor = waitFor;
            this.absoluteTimeout = absoluteTimeout;
            this.withObservable = withObservable;
            this.scheduler = scheduler;
        }
        TimeoutWithOperator.prototype.call = function (subscriber, source) {
            return source.subscribe(new TimeoutWithSubscriber(subscriber, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler));
        };
        return TimeoutWithOperator;
    }());
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
    function timeout(due, scheduler) {
        if (scheduler === void 0) {
            scheduler = async;
        }
        return timeoutWith(due, throwError(new TimeoutError()), scheduler);
    }
    var b64decode = typeof Buffer !== "undefined"
        ? function (base64) { return Buffer.from(base64, "base64"); }
        : function (base64) {
            var binary_string = atob(base64);
            var len = binary_string.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i);
            }
            return bytes;
        };
    var b64encode = typeof Buffer !== "undefined"
        ? function (b) { return ArrayBuffer.isView(b)
            ? Buffer.from(b.buffer, b.byteOffset, b.byteLength).toString("base64")
            : Buffer.from(b).toString("base64"); }
        : function (b) { return btoa(String.fromCharCode.apply(null, b)); };
    function interactWithUser(userInteraction, req) {
        return new Promise(function (resolve, reject) {
            var interactionProps = __assign(__assign({}, req), { onSubmit: function (res) {
                    userInteraction.next(undefined);
                    resolve(res);
                }, onCancel: function () {
                    userInteraction.next(undefined);
                    reject(new Dexie__default['default'].AbortError("User cancelled"));
                } });
            userInteraction.next(interactionProps);
            // Start subscribing for external updates to db.cloud.userInteraction, and if so, cancel this request.
            /*const subscription = userInteraction.subscribe((currentInteractionProps) => {
              if (currentInteractionProps !== interactionProps) {
                if (subscription) subscription.unsubscribe();
                if (!done) {
                  reject(new Dexie.AbortError("User cancelled"));
                }
              }
            });*/
        });
    }
    function alertUser(userInteraction, title) {
        var alerts = [];
        for (var _g = 2; _g < arguments.length; _g++) {
            alerts[_g - 2] = arguments[_g];
        }
        return interactWithUser(userInteraction, {
            type: 'message-alert',
            title: title,
            alerts: alerts,
            fields: {}
        });
    }
    function promptForEmail(userInteraction, title, emailHint) {
        return __awaiter(this, void 0, void 0, function () {
            var email;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        email = emailHint || '';
                        _g.label = 1;
                    case 1:
                        if (!(!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,10}$/.test(email))) return [3 /*break*/, 3];
                        return [4 /*yield*/, interactWithUser(userInteraction, {
                                type: 'email',
                                title: title,
                                alerts: email
                                    ? [
                                        {
                                            type: 'error',
                                            messageCode: 'INVALID_EMAIL',
                                            message: 'Please enter a valid email address',
                                            messageParams: {},
                                        },
                                    ]
                                    : [],
                                fields: {
                                    email: {
                                        type: 'email',
                                        placeholder: 'you@somedomain.com',
                                    },
                                },
                            })];
                    case 2:
                        email = (_g.sent()).email;
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, email];
                }
            });
        });
    }
    function promptForOTP(userInteraction, email, alert) {
        return __awaiter(this, void 0, void 0, function () {
            var alerts, otp;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        alerts = [
                            {
                                type: 'info',
                                messageCode: 'OTP_SENT',
                                message: "A One-Time password has been sent to {email}",
                                messageParams: { email: email },
                            },
                        ];
                        if (alert) {
                            alerts.push(alert);
                        }
                        return [4 /*yield*/, interactWithUser(userInteraction, {
                                type: 'otp',
                                title: 'Enter OTP',
                                alerts: alerts,
                                fields: {
                                    otp: {
                                        type: 'otp',
                                        label: 'OTP',
                                        placeholder: 'Paste OTP here',
                                    },
                                },
                            })];
                    case 1:
                        otp = (_g.sent()).otp;
                        return [2 /*return*/, otp];
                }
            });
        });
    }
    function loadAccessToken(db) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, currentUser, accessToken, accessTokenExpiration, refreshToken, refreshTokenExpiration, claims, expTime, refreshExpTime, refreshedLogin;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, db.getCurrentUser()];
                    case 1:
                        currentUser = _g.sent();
                        accessToken = currentUser.accessToken, accessTokenExpiration = currentUser.accessTokenExpiration, refreshToken = currentUser.refreshToken, refreshTokenExpiration = currentUser.refreshTokenExpiration, claims = currentUser.claims;
                        if (!accessToken)
                            return [2 /*return*/];
                        expTime = (_a = accessTokenExpiration === null || accessTokenExpiration === void 0 ? void 0 : accessTokenExpiration.getTime()) !== null && _a !== void 0 ? _a : Infinity;
                        if (expTime > Date.now()) {
                            return [2 /*return*/, accessToken];
                        }
                        if (!refreshToken) {
                            throw new Error("Refresh token missing");
                        }
                        refreshExpTime = (_b = refreshTokenExpiration === null || refreshTokenExpiration === void 0 ? void 0 : refreshTokenExpiration.getTime()) !== null && _b !== void 0 ? _b : Infinity;
                        if (refreshExpTime <= Date.now()) {
                            throw new Error("Refresh token has expired");
                        }
                        return [4 /*yield*/, refreshAccessToken(db.cloud.options.databaseUrl, currentUser)];
                    case 2:
                        refreshedLogin = _g.sent();
                        return [4 /*yield*/, db.table('$logins').update(claims.sub, {
                                accessToken: refreshedLogin.accessToken,
                                accessTokenExpiration: refreshedLogin.accessTokenExpiration,
                            })];
                    case 3:
                        _g.sent();
                        return [2 /*return*/, refreshedLogin.accessToken];
                }
            });
        });
    }
    function authenticate(url, context, fetchToken, userInteraction, hints) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!(context.accessToken &&
                            context.accessTokenExpiration.getTime() > Date.now())) return [3 /*break*/, 1];
                        return [2 /*return*/, context];
                    case 1:
                        if (!(context.refreshToken &&
                            (!context.refreshTokenExpiration ||
                                context.refreshTokenExpiration.getTime() > Date.now()))) return [3 /*break*/, 3];
                        return [4 /*yield*/, refreshAccessToken(url, context)];
                    case 2: return [2 /*return*/, _g.sent()];
                    case 3: return [4 /*yield*/, userAuthenticate(context, fetchToken, userInteraction, hints)];
                    case 4: return [2 /*return*/, _g.sent()];
                }
            });
        });
    }
    function refreshAccessToken(url, login) {
        return __awaiter(this, void 0, void 0, function () {
            var time_stamp, signing_algorithm, textEncoder, data, binarySignature, signature, tokenRequest, res, response;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!login.refreshToken)
                            throw new Error("Cannot refresh token - refresh token is missing.");
                        if (!login.nonExportablePrivateKey)
                            throw new Error("login.nonExportablePrivateKey is missing - cannot sign refresh token without a private key.");
                        time_stamp = Date.now();
                        signing_algorithm = 'RSASSA-PKCS1-v1_5';
                        textEncoder = new TextEncoder();
                        data = textEncoder.encode(login.refreshToken + time_stamp);
                        return [4 /*yield*/, crypto.subtle.sign(signing_algorithm, login.nonExportablePrivateKey, data)];
                    case 1:
                        binarySignature = _g.sent();
                        signature = b64encode(binarySignature);
                        tokenRequest = {
                            grant_type: 'refresh_token',
                            refresh_token: login.refreshToken,
                            scopes: ['ACCESS_DB'],
                            signature: signature,
                            signing_algorithm: signing_algorithm,
                            time_stamp: time_stamp,
                        };
                        return [4 /*yield*/, fetch(url + "/token", {
                                body: JSON.stringify(tokenRequest),
                                method: 'post',
                                headers: { 'Content-Type': 'application/json' },
                                mode: 'cors',
                            })];
                    case 2:
                        res = _g.sent();
                        if (res.status !== 200)
                            throw new Error("RefreshToken: Status " + res.status + " from " + url + "/token");
                        return [4 /*yield*/, res.json()];
                    case 3:
                        response = _g.sent();
                        login.accessToken = response.accessToken;
                        login.accessTokenExpiration = response.accessTokenExpiration
                            ? new Date(response.accessTokenExpiration)
                            : undefined;
                        return [2 /*return*/, login];
                }
            });
        });
    }
    function userAuthenticate(context, fetchToken, userInteraction, hints) {
        return __awaiter(this, void 0, void 0, function () {
            var _g, privateKey, publicKey, publicKeySPKI, publicKeyPEM, response2, error_1;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, crypto.subtle.generateKey({
                            name: 'RSASSA-PKCS1-v1_5',
                            modulusLength: 2048,
                            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                            hash: { name: 'SHA-256' },
                        }, false, // Non-exportable...
                        ['sign', 'verify'])];
                    case 1:
                        _g = _h.sent(), privateKey = _g.privateKey, publicKey = _g.publicKey;
                        context.nonExportablePrivateKey = privateKey; //...but storable!
                        return [4 /*yield*/, crypto.subtle.exportKey('spki', publicKey)];
                    case 2:
                        publicKeySPKI = _h.sent();
                        publicKeyPEM = spkiToPEM(publicKeySPKI);
                        context.publicKey = publicKey;
                        _h.label = 3;
                    case 3:
                        _h.trys.push([3, 7, , 9]);
                        return [4 /*yield*/, fetchToken({
                                public_key: publicKeyPEM,
                                hints: hints,
                            })];
                    case 4:
                        response2 = _h.sent();
                        if (response2.type !== 'tokens')
                            throw new Error("Unexpected response type from token endpoint: " + response2.type);
                        context.accessToken = response2.accessToken;
                        context.accessTokenExpiration = new Date(response2.accessTokenExpiration);
                        context.refreshToken = response2.refreshToken;
                        if (response2.refreshTokenExpiration) {
                            context.refreshTokenExpiration = new Date(response2.refreshTokenExpiration);
                        }
                        context.userId = response2.claims.sub;
                        context.email = response2.claims.email;
                        context.name = response2.claims.name;
                        context.claims = response2.claims;
                        if (!(response2.alerts && response2.alerts.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, interactWithUser(userInteraction, {
                                type: 'message-alert',
                                title: 'Authentication Alert',
                                fields: {},
                                alerts: response2.alerts,
                            })];
                    case 5:
                        _h.sent();
                        _h.label = 6;
                    case 6: return [2 /*return*/, context];
                    case 7:
                        error_1 = _h.sent();
                        return [4 /*yield*/, alertUser(userInteraction, 'Authentication Failed', {
                                type: 'error',
                                messageCode: 'GENERIC_ERROR',
                                message: "We're having a problem to authenticate rigth now.",
                                messageParams: {}
                            }).catch(function () { })];
                    case 8:
                        _h.sent();
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    function spkiToPEM(keydata) {
        var keydataB64 = b64encode(keydata);
        var keydataB64Pem = formatAsPem(keydataB64);
        return keydataB64Pem;
    }
    function formatAsPem(str) {
        var finalString = '-----BEGIN PUBLIC KEY-----\n';
        while (str.length > 0) {
            finalString += str.substring(0, 64) + '\n';
            str = str.substring(64);
        }
        finalString = finalString + '-----END PUBLIC KEY-----';
        return finalString;
    }
    // Emulate true-private property db. Why? So it's not stored in DB.
    var wm$1 = new WeakMap();
    var AuthPersistedContext = /** @class */ (function () {
        function AuthPersistedContext(db, userLogin) {
            wm$1.set(this, db);
            Object.assign(this, userLogin);
        }
        AuthPersistedContext.load = function (db, userId) {
            return db
                .table("$logins")
                .get(userId)
                .then(function (userLogin) { return new AuthPersistedContext(db, userLogin || {
                userId: userId,
                claims: {
                    sub: userId
                },
                lastLogin: new Date(0)
            }); });
        };
        AuthPersistedContext.prototype.save = function () {
            return __awaiter(this, void 0, void 0, function () {
                var db;
                return __generator(this, function (_g) {
                    db = wm$1.get(this);
                    db.table("$logins").put(this);
                    return [2 /*return*/];
                });
            });
        };
        return AuthPersistedContext;
    }());
    var HttpError = /** @class */ (function (_super_1) {
        __extends$1(HttpError, _super_1);
        function HttpError(res, message) {
            var _this_1 = _super_1.call(this, message || res.status + " " + res.statusText) || this;
            _this_1.httpStatus = res.status;
            return _this_1;
        }
        Object.defineProperty(HttpError.prototype, "name", {
            get: function () {
                return "HttpError";
            },
            enumerable: false,
            configurable: true
        });
        return HttpError;
    }(Error));
    function otpFetchTokenCallback(db) {
        var userInteraction = db.cloud.userInteraction;
        return function otpAuthenticate(_g) {
            var public_key = _g.public_key, hints = _g.hints;
            return __awaiter(this, void 0, void 0, function () {
                var _a, tokenRequest, url, demo_user, email, res1, errMsg, response, otp, res2, errorText, _h, errMsg, response2;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            url = (_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.databaseUrl;
                            if (!url)
                                throw new Error("No database URL given.");
                            if (!((hints === null || hints === void 0 ? void 0 : hints.grant_type) === 'demo')) return [3 /*break*/, 2];
                            return [4 /*yield*/, promptForEmail(userInteraction, 'Enter a demo user email', (hints === null || hints === void 0 ? void 0 : hints.email) || (hints === null || hints === void 0 ? void 0 : hints.userId))];
                        case 1:
                            demo_user = _j.sent();
                            tokenRequest = {
                                demo_user: demo_user,
                                grant_type: 'demo',
                                scopes: ['ACCESS_DB'],
                                public_key: public_key,
                            };
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, promptForEmail(userInteraction, 'Enter email address', hints === null || hints === void 0 ? void 0 : hints.email)];
                        case 3:
                            email = _j.sent();
                            tokenRequest = {
                                email: email,
                                grant_type: 'otp',
                                scopes: ['ACCESS_DB'],
                                public_key: public_key,
                            };
                            _j.label = 4;
                        case 4: return [4 /*yield*/, fetch(url + "/token", {
                                body: JSON.stringify(tokenRequest),
                                method: 'post',
                                headers: { 'Content-Type': 'application/json', mode: 'cors' },
                            })];
                        case 5:
                            res1 = _j.sent();
                            if (!(res1.status !== 200)) return [3 /*break*/, 8];
                            return [4 /*yield*/, res1.text()];
                        case 6:
                            errMsg = _j.sent();
                            return [4 /*yield*/, alertUser(userInteraction, "Token request failed", {
                                    type: 'error',
                                    messageCode: 'GENERIC_ERROR',
                                    message: errMsg,
                                    messageParams: {}
                                }).catch(function () { })];
                        case 7:
                            _j.sent();
                            throw new HttpError(res1, errMsg);
                        case 8: return [4 /*yield*/, res1.json()];
                        case 9:
                            response = _j.sent();
                            if (!(response.type === 'tokens')) return [3 /*break*/, 10];
                            // Demo user request can get a "tokens" response right away
                            return [2 /*return*/, response];
                        case 10:
                            if (!(tokenRequest.grant_type === 'otp')) return [3 /*break*/, 22];
                            if (response.type !== 'otp-sent')
                                throw new Error("Unexpected response from " + url + "/token");
                            return [4 /*yield*/, promptForOTP(userInteraction, tokenRequest.email)];
                        case 11:
                            otp = _j.sent();
                            tokenRequest.otp = otp || '';
                            tokenRequest.otp_id = response.otp_id;
                            return [4 /*yield*/, fetch(url + "/token", {
                                    body: JSON.stringify(tokenRequest),
                                    method: 'post',
                                    headers: { 'Content-Type': 'application/json' },
                                    mode: 'cors',
                                })];
                        case 12:
                            res2 = _j.sent();
                            _j.label = 13;
                        case 13:
                            if (!(res2.status === 401)) return [3 /*break*/, 17];
                            return [4 /*yield*/, res2.text()];
                        case 14:
                            errorText = _j.sent();
                            _h = tokenRequest;
                            return [4 /*yield*/, promptForOTP(userInteraction, tokenRequest.email, {
                                    type: 'error',
                                    messageCode: 'INVALID_OTP',
                                    message: errorText,
                                    messageParams: {}
                                })];
                        case 15:
                            _h.otp = _j.sent();
                            return [4 /*yield*/, fetch(url + "/token", {
                                    body: JSON.stringify(tokenRequest),
                                    method: 'post',
                                    headers: { 'Content-Type': 'application/json' },
                                    mode: 'cors',
                                })];
                        case 16:
                            res2 = _j.sent();
                            return [3 /*break*/, 13];
                        case 17:
                            if (!(res2.status !== 200)) return [3 /*break*/, 20];
                            return [4 /*yield*/, res2.text()];
                        case 18:
                            errMsg = _j.sent();
                            return [4 /*yield*/, alertUser(userInteraction, "OTP Authentication Failed", {
                                    type: 'error',
                                    messageCode: 'GENERIC_ERROR',
                                    message: errMsg,
                                    messageParams: {}
                                }).catch(function () { })];
                        case 19:
                            _j.sent();
                            throw new HttpError(res2, errMsg);
                        case 20: return [4 /*yield*/, res2.json()];
                        case 21:
                            response2 = _j.sent();
                            return [2 /*return*/, response2];
                        case 22: throw new Error("Unexpected response from " + url + "/token");
                    }
                });
            });
        };
    }
    /** This function changes or sets the current user as requested.
     *
     * Use cases:
     * * Initially on db.ready after reading the current user from db.$logins.
     *   This will make sure that any unsynced operations from the previous user is synced before
     *   changing the user.
     * * Upon user request
     *
     * @param db
     * @param newUser
     */
    function setCurrentUser(db, user) {
        return __awaiter(this, void 0, void 0, function () {
            var $logins;
            var _this_1 = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (user.userId === db.cloud.currentUserId)
                            return [2 /*return*/]; // Already this user.
                        $logins = db.table('$logins');
                        return [4 /*yield*/, db.transaction('rw', $logins, function (tx) { return __awaiter(_this_1, void 0, void 0, function () {
                                var existingLogins;
                                return __generator(this, function (_g) {
                                    switch (_g.label) {
                                        case 0: return [4 /*yield*/, $logins.toArray()];
                                        case 1:
                                            existingLogins = _g.sent();
                                            return [4 /*yield*/, Promise.all(existingLogins.filter(function (login) { return login.userId !== user.userId && login.isLoggedIn; }).map(function (login) {
                                                    login.isLoggedIn = false;
                                                    return $logins.put(login);
                                                }))];
                                        case 2:
                                            _g.sent();
                                            user.isLoggedIn = true;
                                            user.lastLogin = new Date();
                                            return [4 /*yield*/, user.save()];
                                        case 3:
                                            _g.sent();
                                            console.debug("Saved new user", user.email);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _g.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                if (db.cloud.currentUserId === user.userId) {
                                    resolve(null);
                                }
                                else {
                                    var subscription_1 = db.cloud.currentUser.subscribe(function (currentUser) {
                                        if (currentUser.userId === user.userId) {
                                            subscription_1.unsubscribe();
                                            resolve(null);
                                        }
                                    });
                                }
                            })];
                    case 2:
                        _g.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function login(db, hints) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, context;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, db.getCurrentUser()];
                    case 1:
                        currentUser = _g.sent();
                        if (currentUser.isLoggedIn) {
                            if (hints) {
                                if (hints.email && db.cloud.currentUser.value.email !== hints.email) {
                                    throw new Error("Must logout before changing user");
                                }
                                if (hints.userId && db.cloud.currentUserId !== hints.userId) {
                                    throw new Error("Must logout before changing user");
                                }
                            }
                            // Already authenticated according to given hints.
                            return [2 /*return*/];
                        }
                        context = new AuthPersistedContext(db, {
                            claims: {},
                            lastLogin: new Date(0),
                        });
                        return [4 /*yield*/, authenticate(db.cloud.options.databaseUrl, context, db.cloud.options.fetchTokens || otpFetchTokenCallback(db), db.cloud.userInteraction, hints)];
                    case 2:
                        _g.sent();
                        return [4 /*yield*/, context.save()];
                    case 3:
                        _g.sent();
                        return [4 /*yield*/, setCurrentUser(db, context)];
                    case 4:
                        _g.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    var UNAUTHORIZED_USER = {
        userId: "unauthorized",
        name: "Unauthorized",
        claims: {
            sub: "unauthorized",
        },
        lastLogin: new Date(0)
    };
    try {
        Object.freeze(UNAUTHORIZED_USER);
        Object.freeze(UNAUTHORIZED_USER.claims);
    }
    catch (_a) { }
    var swHolder = {};
    var swContainer = self.document && navigator.serviceWorker; // self.document is to verify we're not the SW ourself
    if (swContainer)
        swContainer.ready.then(function (registration) { return (swHolder.registration = registration); });
    if (typeof self !== 'undefined' && 'clients' in self && !self.document) {
        // We are the service worker. Propagate messages to all our clients.
        addEventListener('message', function (ev) {
            var _a, _b;
            if ((_b = (_a = ev.data) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.startsWith('sw-broadcast-')) {
                __spreadArray([], self['clients'].matchAll({ includeUncontrolled: true })).forEach(function (client) { var _a; return client.id !== ((_a = ev.source) === null || _a === void 0 ? void 0 : _a.id) && client.postMessage(ev.data); });
            }
        });
    }
    var SWBroadcastChannel = /** @class */ (function () {
        function SWBroadcastChannel(name) {
            this.name = name;
        }
        SWBroadcastChannel.prototype.subscribe = function (listener) {
            var _this_1 = this;
            if (!swContainer)
                return function () { };
            var forwarder = function (ev) {
                var _a;
                if (((_a = ev.data) === null || _a === void 0 ? void 0 : _a.type) === "sw-broadcast-" + _this_1.name) {
                    listener(ev.data.message);
                }
            };
            swContainer.addEventListener('message', forwarder);
            return function () { return swContainer.removeEventListener('message', forwarder); };
        };
        SWBroadcastChannel.prototype.postMessage = function (message) {
            var _this_1 = this;
            var _a;
            if (typeof self['clients'] === 'object') {
                // We're a service worker. Propagate to our browser clients.
                __spreadArray([], self['clients'].matchAll({ includeUncontrolled: true })).forEach(function (client) { return client.postMessage({
                    type: "sw-broadcast-" + _this_1.name,
                    message: message
                }); });
            }
            else if (swHolder.registration) {
                // We're a client (browser window or other worker)
                // Post to SW so it can repost to all its clients and to itself
                (_a = swHolder.registration.active) === null || _a === void 0 ? void 0 : _a.postMessage({
                    type: "sw-broadcast-" + this.name,
                    message: message
                });
            }
        };
        return SWBroadcastChannel;
    }());
    var BroadcastedAndLocalEvent = /** @class */ (function (_super_1) {
        __extends$1(BroadcastedAndLocalEvent, _super_1);
        function BroadcastedAndLocalEvent(name) {
            var _this_1 = this;
            var bc = typeof BroadcastChannel === "undefined"
                ? new SWBroadcastChannel(name) : new BroadcastChannel(name);
            _this_1 = _super_1.call(this, function (subscriber) {
                function onCustomEvent(ev) {
                    subscriber.next(ev.detail);
                }
                function onMessageEvent(ev) {
                    console.debug("BroadcastedAndLocalEvent: onMessageEvent", ev);
                    subscriber.next(ev.data);
                }
                var unsubscribe;
                self.addEventListener("lbc-" + name, onCustomEvent);
                if (bc instanceof SWBroadcastChannel) {
                    unsubscribe = bc.subscribe(function (message) { return subscriber.next(message); });
                }
                else {
                    console.debug("BroadcastedAndLocalEvent: bc.addEventListener()", name, "bc is a", bc);
                    bc.addEventListener("message", onMessageEvent);
                }
                return function () {
                    self.removeEventListener("lbc-" + name, onCustomEvent);
                    if (bc instanceof SWBroadcastChannel) {
                        unsubscribe();
                    }
                    else {
                        bc.removeEventListener("message", onMessageEvent);
                    }
                };
            }) || this;
            _this_1.name = name;
            _this_1.bc = bc;
            return _this_1;
        }
        BroadcastedAndLocalEvent.prototype.next = function (message) {
            console.debug("BroadcastedAndLocalEvent: bc.postMessage()", __assign({}, message), "bc is a", this.bc);
            this.bc.postMessage(message);
            var ev = new CustomEvent("lbc-" + this.name, { detail: message });
            self.dispatchEvent(ev);
        };
        return BroadcastedAndLocalEvent;
    }(rxjs.Observable));
    var wm = new WeakMap();
    var DEXIE_CLOUD_SCHEMA = {
        realms: '@realmId',
        members: '@id',
        roles: '[realmId+name]',
        $jobs: '',
        $syncState: '',
        $baseRevs: '[tableName+clientRev]',
        $logins: 'claims.sub, lastLogin',
    };
    var static_counter = 0;
    function DexieCloudDB(dx) {
        if ('vip' in dx)
            dx = dx['vip']; // Avoid race condition. Always map to a vipped dexie that don't block during db.on.ready().
        var db = wm.get(dx.cloud);
        if (!db) {
            var localSyncEvent = new rxjs.BehaviorSubject({});
            var syncStateChangedEvent_1 = new BroadcastedAndLocalEvent("syncstatechanged-" + dx.name);
            localSyncEvent['id'] = ++static_counter;
            var initiallySynced_1 = false;
            db = {
                get name() {
                    return dx.name;
                },
                close: function () {
                    return dx.close();
                },
                transaction: dx.transaction.bind(dx),
                table: dx.table.bind(dx),
                get tables() {
                    return dx.tables;
                },
                cloud: dx.cloud,
                get $jobs() {
                    return dx.table('$jobs');
                },
                get $syncState() {
                    return dx.table('$syncState');
                },
                get $baseRevs() {
                    return dx.table('$baseRevs');
                },
                get $logins() {
                    return dx.table('$logins');
                },
                get realms() {
                    return dx.realms;
                },
                get members() {
                    return dx.members;
                },
                get roles() {
                    return dx.roles;
                },
                get initiallySynced() {
                    return initiallySynced_1;
                },
                localSyncEvent: localSyncEvent,
                get syncStateChangedEvent() {
                    return syncStateChangedEvent_1;
                },
                dx: dx,
            };
            var helperMethods = {
                getCurrentUser: function () {
                    return db.$logins
                        .toArray()
                        .then(function (logins) { return logins.find(function (l) { return l.isLoggedIn; }) || UNAUTHORIZED_USER; });
                },
                getPersistedSyncState: function () {
                    return db.$syncState.get('syncState');
                },
                getSchema: function () {
                    return db.$syncState.get('schema');
                },
                getOptions: function () {
                    return db.$syncState.get('options');
                },
                setInitiallySynced: function (value) {
                    initiallySynced_1 = value;
                },
                reconfigure: function () {
                    syncStateChangedEvent_1 = new BroadcastedAndLocalEvent("syncstatechanged-" + dx.name);
                }
            };
            Object.assign(db, helperMethods);
            wm.set(dx.cloud, db);
        }
        return db;
    }
    // @ts-ignore
    var isFirefox = typeof InstallTrigger !== 'undefined';
    var isSafari = typeof navigator !== 'undefined' &&
        /Safari\//.test(navigator.userAgent) &&
        !/Chrom(e|ium)\/|Edge\//.test(navigator.userAgent);
    var safariVersion = isSafari
        ? // @ts-ignore
            [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1]
        : NaN;
    // What we know: Safari 14.1 (version 605) crashes when using dexie-cloud's service worker.
    // We don't know what exact call is causing this. Have tried safari-14-idb-fix with no luck.
    // Something we do in the service worker is triggering the crash.
    // When next Safari version (606) is out we will start enabling SW again, hoping that the bug is solved.
    // If not, we might increment 605 to 606.
    var DISABLE_SERVICEWORKER_STRATEGY = (isSafari && safariVersion <= 605) || // Disable for Safari for now.
        isFirefox; // Disable for Firefox for now. Seems to have a bug in reading CryptoKeys from IDB from service workers
    /* Helper function to subscribe to database close no matter if it was unexpectedly closed or manually using db.close()
     */
    function dbOnClosed(db, handler) {
        db.on.close.subscribe(handler);
        var origClose = db.close;
        db.close = function () {
            origClose.call(this);
            handler();
        };
        return function () {
            db.on.close.unsubscribe(handler);
            db.close = origClose;
        };
    }
    var IS_SERVICE_WORKER = typeof self !== "undefined" && "clients" in self && !self.document;
    function throwVersionIncrementNeeded() {
        throw new Dexie__default['default'].SchemaError("Version increment needed to allow dexie-cloud change tracking");
    }
    function b64LexEncode(b) {
        return b64ToLex(b64encode(b));
    }
    function b64LexDecode(b64Lex) {
        return b64decode(lexToB64(b64Lex));
    }
    function b64ToLex(base64) {
        var encoded = "";
        for (var i = 0, length = base64.length; i < length; i++) {
            encoded += ENCODE_TABLE[base64[i]];
        }
        return encoded;
    }
    function lexToB64(base64lex) {
        // only accept string input
        if (typeof base64lex !== "string") {
            throw new Error("invalid decoder input: " + base64lex);
        }
        var base64 = "";
        for (var i = 0, length = base64lex.length; i < length; i++) {
            base64 += DECODE_TABLE[base64lex[i]];
        }
        return base64;
    }
    var DECODE_TABLE = {
        "-": "=",
        "0": "A",
        "1": "B",
        "2": "C",
        "3": "D",
        "4": "E",
        "5": "F",
        "6": "G",
        "7": "H",
        "8": "I",
        "9": "J",
        A: "K",
        B: "L",
        C: "M",
        D: "N",
        E: "O",
        F: "P",
        G: "Q",
        H: "R",
        I: "S",
        J: "T",
        K: "U",
        L: "V",
        M: "W",
        N: "X",
        O: "Y",
        P: "Z",
        Q: "a",
        R: "b",
        S: "c",
        T: "d",
        U: "e",
        V: "f",
        W: "g",
        X: "h",
        Y: "i",
        Z: "j",
        _: "k",
        a: "l",
        b: "m",
        c: "n",
        d: "o",
        e: "p",
        f: "q",
        g: "r",
        h: "s",
        i: "t",
        j: "u",
        k: "v",
        l: "w",
        m: "x",
        n: "y",
        o: "z",
        p: "0",
        q: "1",
        r: "2",
        s: "3",
        t: "4",
        u: "5",
        v: "6",
        w: "7",
        x: "8",
        y: "9",
        z: "+",
        "|": "/",
    };
    var ENCODE_TABLE = {};
    for (var _g = 0, _h = Object.keys(DECODE_TABLE); _g < _h.length; _g++) {
        var c_1 = _h[_g];
        ENCODE_TABLE[DECODE_TABLE[c_1]] = c_1;
    }
    var toString = {}.toString;
    function toStringTag(o) {
        return toString.call(o).slice(8, -1);
    }
    function getEffectiveKeys(primaryKey, req) {
        var _a;
        if (req.type === 'delete')
            return req.keys;
        return ((_a = req.keys) === null || _a === void 0 ? void 0 : _a.slice()) || req.values.map(primaryKey.extractKey);
    }
    function applyToUpperBitFix(orig, bits) {
        return ((bits & 1 ? orig[0].toUpperCase() : orig[0].toLowerCase()) +
            (bits & 2 ? orig[1].toUpperCase() : orig[1].toLowerCase()) +
            (bits & 4 ? orig[2].toUpperCase() : orig[2].toLowerCase()));
    }
    var consonants = /b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|x|y|z/i;
    function isUpperCase(ch) {
        return ch >= 'A' && ch <= 'Z';
    }
    function generateTablePrefix(tableName, allPrefixes) {
        var rv = tableName[0].toLocaleLowerCase(); // "users" = "usr", "friends" = "frn", "realms" = "rlm", etc.
        for (var i_1 = 1, l_1 = tableName.length; i_1 < l_1 && rv.length < 3; ++i_1) {
            if (consonants.test(tableName[i_1]) || isUpperCase(tableName[i_1]))
                rv += tableName[i_1].toLowerCase();
        }
        while (allPrefixes.has(rv)) {
            if (/\d/g.test(rv)) {
                rv = rv.substr(0, rv.length - 1) + (rv[rv.length - 1] + 1);
                if (rv.length > 3)
                    rv = rv.substr(0, 3);
                else
                    continue;
            }
            else if (rv.length < 3) {
                rv = rv + '2';
                continue;
            }
            var bitFix = 1;
            var upperFixed = rv;
            while (allPrefixes.has(upperFixed) && bitFix < 8) {
                upperFixed = applyToUpperBitFix(rv, bitFix);
                ++bitFix;
            }
            if (bitFix < 8)
                rv = upperFixed;
            else {
                var nextChar = (rv.charCodeAt(2) + 1) & 127;
                rv = rv.substr(0, 2) + String.fromCharCode(nextChar);
                // Here, in theory we could get an infinite loop if having 127*8 table names with identical 3 first consonants.
            }
        }
        return rv;
    }
    var time = 0;
    /**
     *
     * @param prefix A unique 3-letter short-name of the table.
     * @param shardKey 3 last letters from another ID if colocation is requested. Verified on server on inserts - guarantees unique IDs across shards.
     *  The shardKey part of the key represent the shardId where it was first created. An object with this
     *  primary key can later on be moved to another shard without being altered. The reason for having
     *  the origin shardKey as part of the key, is that the server will not need to check uniqueness constraint
     *  across all shards on every insert. Updates / moves across shards are already controlled by the server
     *  in the sense that the objects needs to be there already - we only need this part for inserts.
     * @returns
     */
    function generateKey(prefix, shardKey) {
        var a = new Uint8Array(18);
        var timePart = new Uint8Array(a.buffer, 0, 6);
        var now = Date.now(); // Will fit into 6 bytes until year 10 895.
        if (time >= now) {
            // User is bulk-creating objects the same millisecond.
            // Increment the time part by one millisecond for each item.
            // If bulk-creating 1,000,000 rows client-side in 10 seconds,
            // the last time-stamp will be 990 seconds in future, which is no biggie at all.
            // The point is to create a nice order of the generated IDs instead of
            // using random ids.
            ++time;
        }
        else {
            time = now;
        }
        timePart[0] = time / 1099511627776; // Normal division (no bitwise operator) --> works with >= 32 bits.
        timePart[1] = time / 4294967296;
        timePart[2] = time / 16777216;
        timePart[3] = time / 65536;
        timePart[4] = time / 256;
        timePart[5] = time;
        var randomPart = new Uint8Array(a.buffer, 6);
        crypto.getRandomValues(randomPart);
        var id = new Uint8Array(a.buffer);
        return prefix + b64LexEncode(id) + (shardKey || '');
    }
    function createIdGenerationMiddleware(db) {
        return {
            stack: 'dbcore',
            name: 'idGenerationMiddleware',
            level: 1,
            create: function (core) {
                return __assign(__assign({}, core), { table: function (tableName) {
                        var table = core.table(tableName);
                        function generateOrVerifyAtKeys(req, idPrefix) {
                            var valueClones = null;
                            var keys = getEffectiveKeys(table.schema.primaryKey, req);
                            keys.forEach(function (key, idx) {
                                if (key === undefined) {
                                    // Generate the key
                                    var colocatedId = req.values[idx].realmId || db.cloud.currentUserId;
                                    var shardKey = colocatedId.substr(colocatedId.length - 3);
                                    keys[idx] = generateKey(idPrefix, shardKey);
                                    if (!table.schema.primaryKey.outbound) {
                                        if (!valueClones)
                                            valueClones = req.values.slice();
                                        valueClones[idx] = Dexie__default['default'].deepClone(valueClones[idx]);
                                        Dexie__default['default'].setByKeyPath(valueClones[idx], table.schema.primaryKey.keyPath, // TODO: fix typings in dexie-constructor.d.ts!
                                        keys[idx]);
                                    }
                                }
                                else if (typeof key !== 'string' ||
                                    !key.startsWith(idPrefix)) {
                                    // Key was specified by caller. Verify it complies with id prefix.
                                    throw new Dexie__default['default'].ConstraintError("The ID \"" + key + "\" is not valid for table \"" + tableName + "\". " +
                                        ("Primary '@' keys requires the key to be prefixed with \"" + idPrefix + ".\n\"") +
                                        "If you want to generate IDs programmatically, remove '@' from the schema to get rid of this constraint. Dexie Cloud supports custom IDs as long as they are random and globally unique.");
                                }
                            });
                            return table.mutate(__assign(__assign({}, req), { keys: keys, values: valueClones || req.values }));
                        }
                        return __assign(__assign({}, table), { mutate: function (req) {
                                var _a, _b;
                                // @ts-ignore
                                if (req.trans.disableChangeTracking) {
                                    // Disable ID policy checks and ID generation
                                    return table.mutate(req);
                                }
                                if (req.type === 'add' || req.type === 'put') {
                                    var cloudTableSchema = (_a = db.cloud.schema) === null || _a === void 0 ? void 0 : _a[tableName];
                                    if (!(cloudTableSchema === null || cloudTableSchema === void 0 ? void 0 : cloudTableSchema.generatedGlobalId)) {
                                        if (cloudTableSchema === null || cloudTableSchema === void 0 ? void 0 : cloudTableSchema.markedForSync) {
                                            // Just make sure primary key is of a supported type:
                                            var keys = getEffectiveKeys(table.schema.primaryKey, req);
                                            keys.forEach(function (key, idx) {
                                                if (!isValidSyncableID(key)) {
                                                    var type = Array.isArray(key) ? key.map(toStringTag).join(',') : toStringTag(key);
                                                    throw new Dexie__default['default'].ConstraintError("Invalid primary key type " + type + " for table " + tableName + ". Tables marked for sync has primary keys of type string or Array of string (and optional numbers)");
                                                }
                                            });
                                        }
                                    }
                                    else {
                                        if (((_b = db.cloud.options) === null || _b === void 0 ? void 0 : _b.databaseUrl) && !db.initiallySynced) {
                                            // A database URL is configured but no initial sync has been performed.
                                            var keys_1 = getEffectiveKeys(table.schema.primaryKey, req);
                                            // Check if the operation would yield any INSERT. If so, complain! We never want wrong ID prefixes stored.
                                            return table.getMany({ keys: keys_1, trans: req.trans, cache: "immutable" }).then(function (results) {
                                                if (results.length < keys_1.length) {
                                                    // At least one of the given objects would be created. Complain since
                                                    // the generated ID would be based on a locally computed ID prefix only - we wouldn't
                                                    // know if the server would give the same ID prefix until an initial sync has been
                                                    // performed.
                                                    throw new Error("Unable to create new objects without an initial sync having been performed.");
                                                }
                                                return table.mutate(req);
                                            });
                                        }
                                        return generateOrVerifyAtKeys(req, cloudTableSchema.idPrefix);
                                    }
                                }
                                return table.mutate(req);
                            } });
                    } });
            }
        };
    }
    function createImplicitPropSetterMiddleware(db) {
        return {
            stack: 'dbcore',
            name: 'implicitPropSetterMiddleware',
            level: 1,
            create: function (core) {
                return __assign(__assign({}, core), { table: function (tableName) {
                        var table = core.table(tableName);
                        return __assign(__assign({}, table), { mutate: function (req) {
                                var _a, _b, _c;
                                var trans = req.trans;
                                if (((_b = (_a = db.cloud.schema) === null || _a === void 0 ? void 0 : _a[tableName]) === null || _b === void 0 ? void 0 : _b.markedForSync) &&
                                    ((_c = trans.currentUser) === null || _c === void 0 ? void 0 : _c.isLoggedIn)) {
                                    if (req.type === 'add' || req.type === 'put') {
                                        // If user is logged in, make sure "owner" and "realmId" props are set properly.
                                        // If not logged in, this will be set upon syncification of the tables (next sync after login)
                                        for (var _g = 0, _h = req.values; _g < _h.length; _g++) {
                                            var obj = _h[_g];
                                            if (!('owner' in obj)) {
                                                obj.owner = trans.currentUser.userId;
                                            }
                                            if (!('realmId' in obj)) {
                                                obj.realmId = trans.currentUser.userId;
                                            }
                                        }
                                    }
                                }
                                return table.mutate(req);
                            } });
                    } });
            }
        };
    }
    function getMutationTable(tableName) {
        return "$" + tableName + "_mutations";
    }
    function randomString(bytes) {
        var buf = new Uint8Array(bytes);
        crypto.getRandomValues(buf);
        return btoa(String.fromCharCode.apply(null, buf));
    }
    function allSettled(possiblePromises) {
        return new Promise(function (resolve) {
            if (possiblePromises.length === 0)
                resolve([]);
            var remaining = possiblePromises.length;
            var results = new Array(remaining);
            possiblePromises.forEach(function (p, i) { return Promise.resolve(p).then(function (value) { return results[i] = { status: "fulfilled", value: value }; }, function (reason) { return results[i] = { status: "rejected", reason: reason }; })
                .then(function () { return --remaining || resolve(results); }); });
        });
    }
    var counter$1 = 0;
    function guardedTable(table) {
        var prop = "$lock" + (++counter$1);
        return __assign(__assign({}, table), { count: readLock(table.count, prop), get: readLock(table.get, prop), getMany: readLock(table.getMany, prop), openCursor: readLock(table.openCursor, prop), query: readLock(table.query, prop), mutate: writeLock(table.mutate, prop) });
    }
    function readLock(fn, prop) {
        return function readLocker(req) {
            var _g = req.trans[prop] || (req.trans[prop] = { writers: [], readers: [] }), readers = _g.readers, writers = _g.writers;
            var numWriters = writers.length;
            var promise = (numWriters > 0
                ? writers[numWriters - 1].then(function () { return fn(req); }, function () { return fn(req); })
                : fn(req)).finally(function () { return readers.splice(readers.indexOf(promise)); });
            readers.push(promise);
            return promise;
        };
    }
    function writeLock(fn, prop) {
        return function writeLocker(req) {
            var _g = req.trans[prop] || (req.trans[prop] = { writers: [], readers: [] }), readers = _g.readers, writers = _g.writers;
            var promise = (writers.length > 0
                ? writers[writers.length - 1].then(function () { return fn(req); }, function () { return fn(req); })
                : readers.length > 0
                    ? allSettled(readers).then(function () { return fn(req); })
                    : fn(req)).finally(function () { return writers.shift(); });
            writers.push(promise);
            return promise;
        };
    }
    //const hasSW = 'serviceWorker' in navigator;
    var hasComplainedAboutSyncEvent = false;
    function registerSyncEvent(db) {
        return __awaiter(this, void 0, void 0, function () {
            var sw, e_1;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, navigator.serviceWorker.ready];
                    case 1:
                        sw = _g.sent();
                        if (!sw.sync) return [3 /*break*/, 3];
                        return [4 /*yield*/, sw.sync.register("dexie-cloud:" + db.name)];
                    case 2:
                        _g.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        if (sw.active) {
                            // Fallback to postMessage (Firefox, Safari):
                            sw.active.postMessage({
                                type: 'dexie-cloud-sync',
                                dbName: db.name
                            });
                        }
                        else {
                            console.error("Dexie Cloud: There's no active service worker. Can this ever happen??");
                        }
                        _g.label = 4;
                    case 4: return [2 /*return*/];
                    case 5:
                        e_1 = _g.sent();
                        if (!hasComplainedAboutSyncEvent) {
                            console.debug("Dexie Cloud: Could not register sync event", e_1);
                            hasComplainedAboutSyncEvent = true;
                        }
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function registerPeriodicSyncEvent(db) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, periodicSync, e_2, e_3;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, navigator.serviceWorker.ready];
                    case 1:
                        periodicSync = (_g.sent()).periodicSync;
                        if (!periodicSync) return [3 /*break*/, 6];
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, periodicSync.register("dexie-cloud:" + db.name, (_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.periodicSync)];
                    case 3:
                        _g.sent();
                        console.debug("Dexie Cloud: Successfully registered periodicsync event for " + db.name);
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _g.sent();
                        console.debug("Dexie Cloud: Failed to register periodic sync. Your PWA must be installed to allow background sync.", e_2);
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        console.debug("Dexie Cloud: periodicSync not supported.");
                        _g.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        e_3 = _g.sent();
                        console.debug("Dexie Cloud: Could not register periodicSync for " + db.name, e_3);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    var outstandingTransactions = new rxjs.BehaviorSubject(new Set());
    /** Tracks all mutations in the same transaction as the mutations -
     * so it is guaranteed that no mutation goes untracked - and if transaction
     * aborts, the mutations won't be tracked.
     *
     * The sync job will use the tracked mutations as the source of truth when pushing
     * changes to server and cleanup the tracked mutations once the server has
     * ackowledged that it got them.
     */
    function createMutationTrackingMiddleware(_g) {
        var currentUserObservable = _g.currentUserObservable, db = _g.db;
        return {
            stack: 'dbcore',
            name: 'MutationTrackingMiddleware',
            level: 1,
            create: function (core) {
                var ordinaryTables = core.schema.tables.filter(function (t) { return !/^\$/.test(t.name); });
                var mutTableMap;
                try {
                    mutTableMap = new Map(ordinaryTables.map(function (tbl) { return [
                        tbl.name,
                        core.table("$" + tbl.name + "_mutations")
                    ]; }));
                }
                catch (_a) {
                    throwVersionIncrementNeeded();
                }
                return __assign(__assign({}, core), { transaction: function (tables, mode) {
                        var tx;
                        if (mode === 'readwrite') {
                            var mutationTables = tables
                                .filter(function (tbl) { var _a, _b; return (_b = (_a = db.cloud.schema) === null || _a === void 0 ? void 0 : _a[tbl]) === null || _b === void 0 ? void 0 : _b.markedForSync; })
                                .map(function (tbl) { return getMutationTable(tbl); });
                            tx = core.transaction(__spreadArray(__spreadArray([], tables), mutationTables), mode);
                        }
                        else {
                            tx = core.transaction(tables, mode);
                        }
                        if (mode === 'readwrite') {
                            // Give each transaction a globally unique id.
                            tx.txid = randomString(16);
                            // Introduce the concept of current user that lasts through the entire transaction.
                            // This is important because the tracked mutations must be connected to the user.
                            tx.currentUser = currentUserObservable.value;
                            outstandingTransactions.value.add(tx);
                            outstandingTransactions.next(outstandingTransactions.value);
                            var removeTransaction_1 = function () {
                                tx.removeEventListener('complete', txComplete_1);
                                tx.removeEventListener('error', removeTransaction_1);
                                tx.removeEventListener('abort', removeTransaction_1);
                                outstandingTransactions.value.delete(tx);
                                outstandingTransactions.next(outstandingTransactions.value);
                            };
                            var txComplete_1 = function () {
                                var _a;
                                if (tx.mutationsAdded && ((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.databaseUrl)) {
                                    if (db.cloud.usingServiceWorker) {
                                        console.debug('registering sync event');
                                        registerSyncEvent(db);
                                    }
                                    else {
                                        db.localSyncEvent.next({});
                                    }
                                }
                                removeTransaction_1();
                            };
                            tx.addEventListener('complete', txComplete_1);
                            tx.addEventListener('error', removeTransaction_1);
                            tx.addEventListener('abort', removeTransaction_1);
                        }
                        return tx;
                    }, table: function (tableName) {
                        var table = core.table(tableName);
                        if (/^\$/.test(tableName)) {
                            if (tableName.endsWith('_mutations')) {
                                // In case application code adds items to ..._mutations tables,
                                // make sure to set the mutationsAdded flag on transaction.
                                // This is also done in mutateAndLog() as that function talks to a
                                // lower level DBCore and wouldn't be catched by this code.
                                return __assign(__assign({}, table), { mutate: function (req) {
                                        if (req.type === 'add' || req.type === 'put') {
                                            req.trans.mutationsAdded = true;
                                        }
                                        return table.mutate(req);
                                    } });
                            }
                            else if (tableName === '$logins') {
                                return __assign(__assign({}, table), { mutate: function (req) {
                                        console.debug('Mutating $logins table', req);
                                        return table
                                            .mutate(req)
                                            .then(function (res) {
                                            console.debug('Mutating $logins');
                                            req.trans.mutationsAdded = true;
                                            console.debug('$logins mutated');
                                            return res;
                                        })
                                            .catch(function (err) {
                                            console.debug('Failed mutation $logins', err);
                                            return Promise.reject(err);
                                        });
                                    } });
                            }
                            else {
                                return table;
                            }
                        }
                        var schema = table.schema;
                        var mutsTable = mutTableMap.get(tableName);
                        return guardedTable(__assign(__assign({}, table), { mutate: function (req) {
                                var _a;
                                var trans = req.trans;
                                if (!trans.txid)
                                    return table.mutate(req); // Upgrade transactions not guarded by us.
                                if (trans.disableChangeTracking)
                                    return table.mutate(req);
                                if (!((_a = trans.currentUser) === null || _a === void 0 ? void 0 : _a.isLoggedIn)) {
                                    // Unauthorized user should not log mutations.
                                    // Instead, after login all local data should be logged at once.
                                    return table.mutate(req);
                                }
                                return req.type === 'deleteRange'
                                    ? table
                                        // Query the actual keys (needed for server sending correct rollback to us)
                                        .query({
                                        query: { range: req.range, index: schema.primaryKey },
                                        trans: req.trans,
                                        values: false
                                    })
                                        // Do a delete request instead, but keep the criteria info for the server to execute
                                        .then(function (res) {
                                        return mutateAndLog({
                                            type: 'delete',
                                            keys: res.result,
                                            trans: req.trans,
                                            criteria: { index: null, range: req.range }
                                        });
                                    })
                                    : mutateAndLog(req);
                            } }));
                        function mutateAndLog(req) {
                            var trans = req.trans;
                            trans.mutationsAdded = true;
                            var txid = trans.txid, userId = trans.currentUser.userId;
                            var type = req.type;
                            return table.mutate(req).then(function (res) {
                                var hasFailures = res.numFailures, failures = res.failures;
                                var keys = type === 'delete' ? req.keys : res.results;
                                var values = 'values' in req ? req.values : [];
                                var changeSpecs = 'changeSpecs' in req ? req.changeSpecs : [];
                                if (hasFailures) {
                                    keys = keys.filter(function (_, idx) { return !failures[idx]; });
                                    values = values.filter(function (_, idx) { return !failures[idx]; });
                                    changeSpecs = changeSpecs.filter(function (_, idx) { return !failures[idx]; });
                                }
                                var ts = Date.now();
                                var mut = req.type === 'delete'
                                    ? {
                                        type: 'delete',
                                        ts: ts,
                                        keys: keys,
                                        criteria: req.criteria,
                                        txid: txid,
                                        userId: userId
                                    }
                                    : req.type === 'add'
                                        ? {
                                            type: 'insert',
                                            ts: ts,
                                            keys: keys,
                                            txid: txid,
                                            userId: userId,
                                            values: values
                                        }
                                        : req.criteria && req.changeSpec
                                            ? {
                                                // Common changeSpec for all keys
                                                type: 'modify',
                                                ts: ts,
                                                keys: keys,
                                                criteria: req.criteria,
                                                changeSpec: req.changeSpec,
                                                txid: txid,
                                                userId: userId
                                            }
                                            : req.changeSpecs
                                                ? {
                                                    // One changeSpec per key
                                                    type: 'update',
                                                    ts: ts,
                                                    keys: keys,
                                                    changeSpecs: changeSpecs,
                                                    txid: txid,
                                                    userId: userId
                                                }
                                                : {
                                                    type: 'upsert',
                                                    ts: ts,
                                                    keys: keys,
                                                    values: values,
                                                    txid: txid,
                                                    userId: userId
                                                };
                                return keys.length > 0 || ('criteria' in req && req.criteria)
                                    ? mutsTable
                                        .mutate({ type: 'add', trans: trans, values: [mut] }) // Log entry
                                        .then(function () { return res; }) // Return original response
                                    : res;
                            });
                        }
                    } });
            }
        };
    }
    function overrideParseStoresSpec(origFunc, dexie) {
        return function (stores, dbSchema) {
            var storesClone = __assign(__assign({}, DEXIE_CLOUD_SCHEMA), stores);
            var cloudSchema = dexie.cloud.schema || (dexie.cloud.schema = {});
            var allPrefixes = new Set();
            Object.keys(storesClone).forEach(function (tableName) {
                var schemaSrc = storesClone[tableName];
                var cloudTableSchema = cloudSchema[tableName] || (cloudSchema[tableName] = {});
                if (schemaSrc != null) {
                    if (/^\@/.test(schemaSrc)) {
                        storesClone[tableName] = storesClone[tableName].substr(1);
                        cloudTableSchema.generatedGlobalId = true;
                        cloudTableSchema.idPrefix = generateTablePrefix(tableName, allPrefixes);
                        allPrefixes.add(cloudTableSchema.idPrefix);
                    }
                    if (!/^\$/.test(tableName)) {
                        storesClone["$" + tableName + "_mutations"] = '++rev';
                        cloudTableSchema.markedForSync = true;
                    }
                    if (cloudTableSchema.deleted) {
                        cloudTableSchema.deleted = false;
                    }
                }
                else {
                    cloudTableSchema.deleted = true;
                    cloudTableSchema.markedForSync = false;
                    storesClone["$" + tableName + "_mutations"] = null;
                }
            });
            var rv = origFunc.call(this, storesClone, dbSchema);
            return rv;
        };
    }
    var SECONDS = 1000;
    var MINUTES = 60 * SECONDS;
    var myId = randomString(16);
    var GUARDED_JOB_HEARTBEAT = 1 * SECONDS;
    var GUARDED_JOB_TIMEOUT = 1 * MINUTES;
    function performGuardedJob(db, jobName, jobsTableName, job, _g) {
        var _h = _g === void 0 ? {} : _g, awaitRemoteJob = _h.awaitRemoteJob;
        return __awaiter(this, void 0, void 0, function () {
            function aquireLock() {
                return __awaiter(this, void 0, void 0, function () {
                    var gotTheLock, jobDoneObservable, err_1;
                    var _this_1 = this;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0: return [4 /*yield*/, db.transaction('rw!', jobsTableName, function () { return __awaiter(_this_1, void 0, void 0, function () {
                                    var currentWork;
                                    return __generator(this, function (_g) {
                                        switch (_g.label) {
                                            case 0: return [4 /*yield*/, jobsTable.get(jobName)];
                                            case 1:
                                                currentWork = _g.sent();
                                                if (!!currentWork) return [3 /*break*/, 3];
                                                // No one else is working. Let's record that we are.
                                                return [4 /*yield*/, jobsTable.add({
                                                        nodeId: myId,
                                                        started: new Date(),
                                                        heartbeat: new Date()
                                                    }, jobName)];
                                            case 2:
                                                // No one else is working. Let's record that we are.
                                                _g.sent();
                                                return [2 /*return*/, true];
                                            case 3:
                                                if (!(currentWork.heartbeat.getTime() <
                                                    Date.now() - GUARDED_JOB_TIMEOUT)) return [3 /*break*/, 5];
                                                console.warn("Latest " + jobName + " worker seem to have died.\n", "The dead job started:", currentWork.started, "\n", "Last heart beat was:", currentWork.heartbeat, '\n', "We're now taking over!");
                                                // Now, take over!
                                                return [4 /*yield*/, jobsTable.put({
                                                        nodeId: myId,
                                                        started: new Date(),
                                                        heartbeat: new Date()
                                                    }, jobName)];
                                            case 4:
                                                // Now, take over!
                                                _g.sent();
                                                return [2 /*return*/, true];
                                            case 5: return [2 /*return*/, false];
                                        }
                                    });
                                }); })];
                            case 1:
                                gotTheLock = _g.sent();
                                if (gotTheLock)
                                    return [2 /*return*/, true];
                                if (!awaitRemoteJob) return [3 /*break*/, 6];
                                _g.label = 2;
                            case 2:
                                _g.trys.push([2, 4, , 6]);
                                jobDoneObservable = rxjs.from(Dexie.liveQuery(function () { return jobsTable.get(jobName); })).pipe(timeout(GUARDED_JOB_TIMEOUT), filter(function (job) { return !job; }));
                                return [4 /*yield*/, jobDoneObservable.toPromise()];
                            case 3:
                                _g.sent();
                                return [2 /*return*/, false];
                            case 4:
                                err_1 = _g.sent();
                                if (err_1.name !== 'TimeoutError') {
                                    throw err_1;
                                }
                                return [4 /*yield*/, aquireLock()];
                            case 5: 
                            // Timeout stopped us! Try aquire the lock now.
                            // It will likely succeed this time unless
                            // another client took it.
                            return [2 /*return*/, _g.sent()];
                            case 6: return [2 /*return*/, false];
                        }
                    });
                });
            }
            var jobsTable, heartbeat;
            var _this_1 = this;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        jobsTable = db.table(jobsTableName);
                        return [4 /*yield*/, aquireLock()];
                    case 1:
                        if (!_j.sent()) return [3 /*break*/, 6];
                        heartbeat = setInterval(function () {
                            jobsTable.update(jobName, function (job) { return job.nodeId === myId && (job.heartbeat = new Date()); });
                        }, GUARDED_JOB_HEARTBEAT);
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, , 4, 6]);
                        return [4 /*yield*/, job()];
                    case 3: return [2 /*return*/, _j.sent()];
                    case 4:
                        // Stop heartbeat
                        clearInterval(heartbeat);
                        // Remove the persisted job state:
                        return [4 /*yield*/, db.transaction('rw!', jobsTableName, function () { return __awaiter(_this_1, void 0, void 0, function () {
                                var currentWork;
                                return __generator(this, function (_g) {
                                    switch (_g.label) {
                                        case 0: return [4 /*yield*/, jobsTable.get(jobName)];
                                        case 1:
                                            currentWork = _g.sent();
                                            if (currentWork && currentWork.nodeId === myId) {
                                                jobsTable.delete(jobName);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 5:
                        // Remove the persisted job state:
                        _j.sent();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function getSyncableTables(db) {
        return Object.entries(db.cloud.schema || {})
            .filter(function (_g) {
            var markedForSync = _g[1].markedForSync;
            return markedForSync;
        })
            .map(function (_g) {
            var tbl = _g[0];
            return db.table(tbl);
        });
    }
    function listSyncifiedChanges(tablesToSyncify, currentUser, schema, alreadySyncedRealms) {
        return __awaiter(this, void 0, void 0, function () {
            var ignoredRealms_1, inserts;
            var _this_1 = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!currentUser.isLoggedIn) return [3 /*break*/, 2];
                        if (!(tablesToSyncify.length > 0)) return [3 /*break*/, 2];
                        ignoredRealms_1 = new Set(alreadySyncedRealms || []);
                        return [4 /*yield*/, Promise.all(tablesToSyncify.map(function (table) { return __awaiter(_this_1, void 0, void 0, function () {
                                var extractKey, dexieCloudTableSchema, query, unsyncedObjects, mut;
                                return __generator(this, function (_g) {
                                    switch (_g.label) {
                                        case 0:
                                            extractKey = table.core.schema.primaryKey.extractKey;
                                            if (!extractKey)
                                                return [2 /*return*/, { table: table.name, muts: [] }]; // Outbound tables are not synced.
                                            dexieCloudTableSchema = schema[table.name];
                                            query = (dexieCloudTableSchema === null || dexieCloudTableSchema === void 0 ? void 0 : dexieCloudTableSchema.generatedGlobalId)
                                                ? table.filter(function (item) { return !ignoredRealms_1.has(item.realmId || "") && isValidSyncableID(extractKey(item)); })
                                                : table.filter(function (item) { return !ignoredRealms_1.has(item.realmId || "") && isValidAtID(extractKey(item), dexieCloudTableSchema === null || dexieCloudTableSchema === void 0 ? void 0 : dexieCloudTableSchema.idPrefix); });
                                            return [4 /*yield*/, query.toArray()];
                                        case 1:
                                            unsyncedObjects = _g.sent();
                                            if (unsyncedObjects.length > 0) {
                                                mut = {
                                                    type: "insert",
                                                    values: unsyncedObjects,
                                                    keys: unsyncedObjects.map(extractKey),
                                                    userId: currentUser.userId,
                                                };
                                                return [2 /*return*/, {
                                                        table: table.name,
                                                        muts: [mut],
                                                    }];
                                            }
                                            else {
                                                return [2 /*return*/, {
                                                        table: table.name,
                                                        muts: []
                                                    }];
                                            }
                                    }
                                });
                            }); }))];
                    case 1:
                        inserts = _g.sent();
                        return [2 /*return*/, inserts.filter(function (op) { return op.muts.length > 0; })];
                    case 2: return [2 /*return*/, []];
                }
            });
        });
    }
    function getTablesToSyncify(db, syncState) {
        var syncedTables = (syncState === null || syncState === void 0 ? void 0 : syncState.syncedTables) || [];
        var syncableTables = getSyncableTables(db);
        var tablesToSyncify = syncableTables.filter(function (tbl) { return !syncedTables.includes(tbl.name); });
        return tablesToSyncify;
    }
    function getTableFromMutationTable(mutationTable) {
        var _a;
        var tableName = (_a = /^\$(.*)_mutations$/.exec(mutationTable)) === null || _a === void 0 ? void 0 : _a[1];
        if (!tableName)
            throw new Error("Given mutationTable " + mutationTable + " is not correct");
        return tableName;
    }
    function listClientChanges(mutationTables, db, _g) {
        var _h = _g === void 0 ? {} : _g, _j = _h.since, since = _j === void 0 ? {} : _j, _k = _h.limit, limit = _k === void 0 ? Infinity : _k;
        return __awaiter(this, void 0, void 0, function () {
            var allMutsOnTables;
            var _this_1 = this;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0: return [4 /*yield*/, Promise.all(mutationTables.map(function (mutationTable) { return __awaiter(_this_1, void 0, void 0, function () {
                            var tableName, lastRevision, query, muts;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        tableName = getTableFromMutationTable(mutationTable.name);
                                        lastRevision = since[tableName];
                                        query = lastRevision
                                            ? mutationTable.where("rev").above(lastRevision)
                                            : mutationTable;
                                        if (limit < Infinity)
                                            query = query.limit(limit);
                                        return [4 /*yield*/, query.toArray()];
                                    case 1:
                                        muts = _g.sent();
                                        //const objTable = db.table(tableName);
                                        /*for (const mut of muts) {
                                          if (mut.type === "insert" || mut.type === "upsert") {
                                            mut.values = await objTable.bulkGet(mut.keys);
                                          }
                                        }*/
                                        return [2 /*return*/, {
                                                table: tableName,
                                                muts: muts,
                                            }];
                                }
                            });
                        }); }))];
                    case 1:
                        allMutsOnTables = _l.sent();
                        // Filter out those tables that doesn't have any mutations:
                        return [2 /*return*/, allMutsOnTables.filter(function (_g) {
                                var muts = _g.muts;
                                return muts.length > 0;
                            })];
                }
            });
        });
    }
    var toStr = {}.toString;
    function getToStringTag(val) {
        return toStr.call(val).slice(8, -1);
    }
    function escapeDollarProps(value) {
        var keys = Object.keys(value);
        var dollarKeys = null;
        for (var i_2 = 0, l_2 = keys.length; i_2 < l_2; ++i_2) {
            if (keys[i_2][0] === "$") {
                dollarKeys = dollarKeys || [];
                dollarKeys.push(keys[i_2]);
            }
        }
        if (!dollarKeys)
            return value;
        var clone = __assign({}, value);
        for (var _g = 0, dollarKeys_1 = dollarKeys; _g < dollarKeys_1.length; _g++) {
            var k_1 = dollarKeys_1[_g];
            delete clone[k_1];
            clone["$" + k_1] = value[k_1];
        }
        return clone;
    }
    var ObjectDef = {
        replace: escapeDollarProps,
    };
    function TypesonSimplified() {
        var typeDefsInputs = [];
        for (var _g = 0; _g < arguments.length; _g++) {
            typeDefsInputs[_g] = arguments[_g];
        }
        var typeDefs = typeDefsInputs.reduce(function (p, c) { return (__assign(__assign({}, p), c)); }, typeDefsInputs.reduce(function (p, c) { return (__assign(__assign({}, c), p)); }, {}));
        var protoMap = new WeakMap();
        return {
            stringify: function (value, alternateChannel, space) {
                var json = JSON.stringify(value, function (key) {
                    var realVal = this[key];
                    var typeDef = getTypeDef(realVal);
                    return typeDef
                        ? typeDef.replace(realVal, alternateChannel, typeDefs)
                        : realVal;
                }, space);
                return json;
            },
            parse: function (tson, alternateChannel) {
                var parent = null;
                var unescapeParentKeys = [];
                return JSON.parse(tson, function (key, value) {
                    //
                    // Parent Part
                    //
                    var type = value === null || value === void 0 ? void 0 : value.$t;
                    if (type) {
                        var typeDef = typeDefs[type];
                        value = typeDef
                            ? typeDef.revive(value, alternateChannel, typeDefs)
                            : value;
                    }
                    if (value === parent) {
                        // Do what the kid told us to
                        if (unescapeParentKeys.length > 0) {
                            // Unescape dollar props
                            value = __assign({}, value);
                            for (var _g = 0, unescapeParentKeys_1 = unescapeParentKeys; _g < unescapeParentKeys_1.length; _g++) {
                                var k_2 = unescapeParentKeys_1[_g];
                                value[k_2.substr(1)] = value[k_2];
                                delete value[k_2];
                            }
                        }
                        unescapeParentKeys = [];
                        return value;
                    }
                    //
                    // Child part
                    //
                    if (key[0] === "$" && key !== "$t") {
                        parent = this;
                        unescapeParentKeys.push(key);
                    }
                    return value;
                });
            },
        };
        function getTypeDef(realVal) {
            var type = typeof realVal;
            switch (typeof realVal) {
                case "object":
                case "function": {
                    // "object", "function", null
                    if (realVal === null)
                        return null;
                    var proto = Object.getPrototypeOf(realVal);
                    if (!proto)
                        return ObjectDef;
                    var typeDef = protoMap.get(proto);
                    if (typeDef !== undefined)
                        return typeDef; // Null counts to! So the caching of Array.prototype also counts.
                    var toStringTag_1 = getToStringTag(realVal);
                    var entry = Object.entries(typeDefs).find(function (_g) {
                        var typeName = _g[0], typeDef = _g[1];
                        var _a, _b;
                        return (_b = (_a = typeDef === null || typeDef === void 0 ? void 0 : typeDef.test) === null || _a === void 0 ? void 0 : _a.call(typeDef, realVal, toStringTag_1)) !== null && _b !== void 0 ? _b : typeName === toStringTag_1;
                    });
                    typeDef = entry === null || entry === void 0 ? void 0 : entry[1];
                    if (!typeDef) {
                        typeDef = Array.isArray(realVal)
                            ? null
                            : typeof realVal === "function"
                                ? typeDefs.function || null
                                : ObjectDef;
                    }
                    protoMap.set(proto, typeDef);
                    return typeDef;
                }
                default:
                    return typeDefs[type];
            }
        }
    }
    var BisonBinaryTypes = {
        Blob: {
            test: function (blob, toStringTag) { return toStringTag === "Blob"; },
            replace: function (blob, altChannel) {
                var i = altChannel.length;
                altChannel.push(blob);
                return {
                    $t: "Blob",
                    mimeType: blob.type,
                    i: i,
                };
            },
            revive: function (_g, altChannel) {
                var i = _g.i, mimeType = _g.mimeType;
                return new Blob([altChannel[i]], { type: mimeType });
            },
        },
    };
    var numberDef = {
        number: {
            replace: function (num) {
                switch (true) {
                    case isNaN(num):
                        return { $t: "number", v: "NaN" };
                    case num === Infinity:
                        return { $t: "number", v: "Infinity" };
                    case num === -Infinity:
                        return { $t: "number", v: "-Infinity" };
                    default:
                        return num;
                }
            },
            revive: function (_g) {
                var v = _g.v;
                return Number(v);
            },
        },
    };
    var bigIntDef = {
        bigint: {
            replace: function (realVal) {
                return { $t: "bigint", v: "" + realVal };
            },
            revive: function (obj) { return BigInt(obj.v); },
        },
    };
    var DateDef = {
        Date: {
            replace: function (date) { return ({
                $t: "Date",
                v: isNaN(date.getTime()) ? "NaN" : date.toISOString(),
            }); },
            revive: function (_g) {
                var v = _g.v;
                return new Date(v === "NaN" ? NaN : Date.parse(v));
            },
        },
    };
    var SetDef = {
        Set: {
            replace: function (set) { return ({
                $t: "Set",
                v: Array.from(set.entries()),
            }); },
            revive: function (_g) {
                var v = _g.v;
                return new Set(v);
            },
        },
    };
    var MapDef = {
        Map: {
            replace: function (map) { return ({
                $t: "Map",
                v: Array.from(map.entries()),
            }); },
            revive: function (_g) {
                var v = _g.v;
                return new Map(v);
            },
        },
    };
    var _global = typeof globalThis !== "undefined"
        ? globalThis
        : typeof self !== "undefined"
            ? self
            : typeof global === "undefined"
                ? global
                : undefined;
    var TypedArraysDefs = [
        "Int8Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "Int16Array",
        "Uint16Array",
        "Int32Array",
        "Uint32Array",
        "Float32Array",
        "Float64Array",
        "DataView",
        "BigInt64Array",
        "BigUint64Array",
    ].reduce(function (specs, typeName) {
        var _g;
        return (__assign(__assign({}, specs), (_g = {}, _g[typeName] = {
            // Replace passes the the typed array into $t, buffer so that
            // the ArrayBuffer typedef takes care of further handling of the buffer:
            // {$t:"Uint8Array",buffer:{$t:"ArrayBuffer",idx:0}}
            // CHANGED ABOVE! Now shortcutting that for more sparse format of the typed arrays
            // to contain the b64 property directly.
            replace: function (a, _, typeDefs) {
                var result = {
                    $t: typeName,
                    v: typeDefs.ArrayBuffer.replace(a.byteOffset === 0 && a.byteLength === a.buffer.byteLength
                        ? a.buffer
                        : a.buffer.slice(a.byteOffset, a.byteOffset + a.byteLength), _, typeDefs).v,
                };
                return result;
            },
            revive: function (_g, _, typeDefs) {
                var v = _g.v;
                var TypedArray = _global[typeName];
                return (TypedArray &&
                    new TypedArray(typeDefs.ArrayBuffer.revive({ v: v }, _, typeDefs)));
            },
        }, _g)));
    }, {});
    var ArrayBufferDef = {
        ArrayBuffer: {
            replace: function (ab) { return ({
                $t: "ArrayBuffer",
                v: b64LexEncode(ab),
            }); },
            revive: function (_g) {
                var v = _g.v;
                var ba = b64LexDecode(v);
                return ba.buffer.byteLength === ba.byteLength
                    ? ba.buffer
                    : ba.buffer.slice(ba.byteOffset, ba.byteOffset + ba.byteLength);
            },
        },
    };
    var FakeBlob = /** @class */ (function () {
        function FakeBlob(buf, type) {
            this.buf = buf;
            this.type = type;
        }
        return FakeBlob;
    }());
    function readBlobSync(b) {
        var req = new XMLHttpRequest();
        req.overrideMimeType("text/plain; charset=x-user-defined");
        req.open("GET", URL.createObjectURL(b), false); // Sync
        req.send();
        if (req.status !== 200 && req.status !== 0) {
            throw new Error("Bad Blob access: " + req.status);
        }
        return req.responseText;
    }
    function string2ArrayBuffer(str) {
        var array = new Uint8Array(str.length);
        for (var i_3 = 0; i_3 < str.length; ++i_3) {
            array[i_3] = str.charCodeAt(i_3); // & 0xff;
        }
        return array.buffer;
    }
    var BlobDef = {
        Blob: {
            test: function (blob, toStringTag) { return toStringTag === "Blob" || blob instanceof FakeBlob; },
            replace: function (blob) { return ({
                $t: "Blob",
                v: blob instanceof FakeBlob
                    ? b64encode(blob.buf)
                    : b64encode(string2ArrayBuffer(readBlobSync(blob))),
                type: blob.type,
            }); },
            revive: function (_g) {
                var type = _g.type, v = _g.v;
                var ab = b64decode(v);
                return typeof Blob !== undefined
                    ? new Blob([ab])
                    : new FakeBlob(ab.buffer, type);
            },
        },
    };
    var builtin = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, numberDef), bigIntDef), DateDef), SetDef), MapDef), TypedArraysDefs), ArrayBufferDef), BlobDef);
    function Bison() {
        var typeDefsInputs = [];
        for (var _g = 0; _g < arguments.length; _g++) {
            typeDefsInputs[_g] = arguments[_g];
        }
        var tson = TypesonSimplified.apply(void 0, __spreadArray([builtin, BisonBinaryTypes], typeDefsInputs));
        return {
            toBinary: function (value) {
                var _g = this.stringify(value), blob = _g[0], json = _g[1];
                var lenBuf = new ArrayBuffer(4);
                new DataView(lenBuf).setUint32(0, blob.size);
                return new Blob([lenBuf, blob, json]);
            },
            stringify: function (value) {
                var binaries = [];
                var json = tson.stringify(value, binaries);
                var blob = new Blob(binaries.map(function (b) {
                    var lenBuf = new ArrayBuffer(4);
                    new DataView(lenBuf).setUint32(0, "byteLength" in b ? b.byteLength : b.size);
                    return new Blob([lenBuf, b]);
                }));
                return [blob, json];
            },
            parse: function (json, binData) {
                return __awaiter(this, void 0, void 0, function () {
                    var pos, arrayBuffers, buf, view, len, ab;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                pos = 0;
                                arrayBuffers = [];
                                return [4 /*yield*/, readBlobBinary(binData)];
                            case 1:
                                buf = _g.sent();
                                view = new DataView(buf);
                                while (pos < buf.byteLength) {
                                    len = view.getUint32(pos);
                                    pos += 4;
                                    ab = buf.slice(pos, pos + len);
                                    pos += len;
                                    arrayBuffers.push(ab);
                                }
                                return [2 /*return*/, tson.parse(json, arrayBuffers)];
                        }
                    });
                });
            },
            fromBinary: function (blob) {
                return __awaiter(this, void 0, void 0, function () {
                    var len, _g, binData, json;
                    return __generator(this, function (_h) {
                        switch (_h.label) {
                            case 0:
                                _g = DataView.bind;
                                return [4 /*yield*/, readBlobBinary(blob.slice(0, 4))];
                            case 1:
                                len = new (_g.apply(DataView, [void 0, _h.sent()]))().getUint32(0);
                                binData = blob.slice(4, len + 4);
                                return [4 /*yield*/, readBlob(blob.slice(len + 4))];
                            case 2:
                                json = _h.sent();
                                return [4 /*yield*/, this.parse(json, binData)];
                            case 3: return [2 /*return*/, _h.sent()];
                        }
                    });
                });
            },
        };
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
    function readBlobBinary(blob) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onabort = function (ev) { return reject(new Error("file read aborted")); };
            reader.onerror = function (ev) { return reject(ev.target.error); };
            reader.onload = function (ev) { return resolve(ev.target.result); };
            reader.readAsArrayBuffer(blob);
        });
    }
    /** The undefined type is not part of builtin but can be manually added.
     * The reason for supporting undefined is if the following object should be revived correctly:
     *
     *    {foo: undefined}
     *
     * Without including this typedef, the revived object would just be {}.
     * If including this typedef, the revived object would be {foo: undefined}.
     */
    var undefinedDef = {
        undefined: {
            replace: function () {
            },
            revive: function () { return undefined; },
        },
    };
    // Since server revisions are stored in bigints, we need to handle clients without
    // bigint support to not fail when serverRevision is passed over to client.
    // We need to not fail when reviving it and we need to somehow store the information.
    // Since the revived version will later on be put into indexedDB we have another
    // issue: When reading it back from indexedDB we will get a poco object that we
    // cannot replace correctly when sending it to server. So we will also need
    // to do an explicit workaround in the protocol where a bigint is supported.
    // The workaround should be there regardless if browser supports BigInt or not, because
    // the serverRev might have been stored in IDB before the browser was upgraded to support bigint.
    //
    // if (typeof serverRev.rev !== "bigint")
    //   if (hasBigIntSupport)
    //     serverRev.rev = bigIntDef.bigint.revive(server.rev)
    //   else
    //     serverRev.rev = new FakeBigInt(server.rev)
    var hasBigIntSupport = typeof BigInt !== 'undefined';
    var FakeBigInt = /** @class */ (function () {
        function FakeBigInt(value) {
            this.v = value;
        }
        FakeBigInt.compare = function (a, b) {
            if (typeof a === "bigint")
                return a < b ? -1 : a > b ? 1 : 0;
            if (typeof b === "bigint")
                throw new TypeError("Can't compare real bigint with FakeBigInt");
            // Here, we can only compare in best effort.
            return Number(a) < Number(b) ? -1 : Number(a) > Number(b) ? 1 : 0;
        };
        FakeBigInt.prototype.toString = function () {
            return this.v;
        };
        return FakeBigInt;
    }());
    var defs = __assign(__assign({}, undefinedDef), (hasBigIntSupport
        ? {}
        : {
            bigint: {
                test: function (val) { return val instanceof FakeBigInt; },
                replace: function (fakeBigInt) {
                    return __assign({ $t: 'bigint' }, fakeBigInt);
                },
                revive: function (_g) {
                    var v = _g.v;
                    return new FakeBigInt(v);
                }
            }
        }));
    var TSON = TypesonSimplified(builtin, defs);
    var BISON = Bison(defs);
    //import {BisonWebStreamReader} from "dreambase-library/dist/typeson-simplified/BisonWebStreamReader";
    function syncWithServer(changes, syncState, baseRevs, db, databaseUrl, schema) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, accessToken, syncRequest, res, _g, _h, _j, text, syncRes;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        headers = {
                            Accept: 'application/json, application/x-bison, application/x-bison-stream',
                            'Content-Type': 'application/tson'
                        };
                        return [4 /*yield*/, loadAccessToken(db)];
                    case 1:
                        accessToken = _k.sent();
                        if (accessToken) {
                            headers.Authorization = "Bearer " + accessToken;
                        }
                        syncRequest = {
                            dbID: syncState === null || syncState === void 0 ? void 0 : syncState.remoteDbId,
                            schema: schema || {},
                            lastPull: syncState ? {
                                serverRevision: syncState.serverRevision,
                                realms: syncState.realms,
                                inviteRealms: syncState.inviteRealms
                            } : undefined,
                            baseRevs: baseRevs,
                            //baseRevisions: syncState?.baseRevisions || [],
                            changes: changes
                        };
                        console.debug("Sync request", syncRequest);
                        db.syncStateChangedEvent.next({
                            phase: 'pushing',
                        });
                        return [4 /*yield*/, fetch(databaseUrl + "/sync", {
                                method: 'post',
                                headers: headers,
                                body: TSON.stringify(syncRequest)
                            })];
                    case 2:
                        res = _k.sent();
                        //const contentLength = Number(res.headers.get('content-length'));
                        db.syncStateChangedEvent.next({
                            phase: 'pulling'
                        });
                        if (!res.ok) {
                            throw new HttpError(res);
                        }
                        _g = res.headers.get('content-type');
                        switch (_g) {
                            case 'application/x-bison': return [3 /*break*/, 3];
                            case 'application/x-bison-stream': return [3 /*break*/, 5];
                            case 'application/json': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        _j = (_h = BISON).fromBinary;
                        return [4 /*yield*/, res.blob()];
                    case 4: return [2 /*return*/, _j.apply(_h, [_k.sent()])];
                    case 5: return [4 /*yield*/, res.text()];
                    case 6:
                        text = _k.sent();
                        syncRes = TSON.parse(text);
                        return [2 /*return*/, syncRes];
                }
            });
        });
    }
    function modifyLocalObjectsWithNewUserId(syncifiedTables, currentUser, alreadySyncedRealms) {
        return __awaiter(this, void 0, void 0, function () {
            var ignoredRealms, _g, syncifiedTables_1, table;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        ignoredRealms = new Set(alreadySyncedRealms || []);
                        _g = 0, syncifiedTables_1 = syncifiedTables;
                        _h.label = 1;
                    case 1:
                        if (!(_g < syncifiedTables_1.length)) return [3 /*break*/, 9];
                        table = syncifiedTables_1[_g];
                        if (!(table.name === "members")) return [3 /*break*/, 3];
                        // members
                        return [4 /*yield*/, table.toCollection().modify(function (member) {
                                if (!ignoredRealms.has(member.realmId) && member.userId === UNAUTHORIZED_USER.userId) {
                                    member.userId = currentUser.userId;
                                }
                            })];
                    case 2:
                        // members
                        _h.sent();
                        return [3 /*break*/, 8];
                    case 3:
                        if (!(table.name === "roles")) return [3 /*break*/, 4];
                        return [3 /*break*/, 8];
                    case 4:
                        if (!(table.name === "realms")) return [3 /*break*/, 6];
                        // realms
                        return [4 /*yield*/, table.toCollection().modify(function (realm) {
                                if (!ignoredRealms.has(realm.realmId) && !realm.owner || realm.owner === UNAUTHORIZED_USER.userId) {
                                    realm.owner = currentUser.userId;
                                }
                            })];
                    case 5:
                        // realms
                        _h.sent();
                        return [3 /*break*/, 8];
                    case 6: 
                    // application entities
                    return [4 /*yield*/, table.toCollection().modify(function (obj) {
                            if (!obj.realmId || !ignoredRealms.has(obj.realmId)) {
                                if (!obj.owner || obj.owner === UNAUTHORIZED_USER.userId)
                                    obj.owner = currentUser.userId;
                                if (!obj.realmId || obj.realmId === UNAUTHORIZED_USER.userId) {
                                    obj.realmId = currentUser.userId;
                                }
                            }
                        })];
                    case 7:
                        // application entities
                        _h.sent();
                        _h.label = 8;
                    case 8:
                        _g++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    function bulkUpdate(table, keys, changeSpecs) {
        return __awaiter(this, void 0, void 0, function () {
            var objs, resultKeys, resultObjs;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, table.bulkGet(keys)];
                    case 1:
                        objs = _g.sent();
                        resultKeys = [];
                        resultObjs = [];
                        keys.forEach(function (key, idx) {
                            var obj = objs[idx];
                            if (obj) {
                                for (var _g = 0, _h = Object.entries(changeSpecs[idx]); _g < _h.length; _g++) {
                                    var _j = _h[_g], keyPath = _j[0], value = _j[1];
                                    if (keyPath === table.schema.primKey.keyPath) {
                                        throw new Error("Cannot change primary key");
                                    }
                                    Dexie__default['default'].setByKeyPath(obj, keyPath, value);
                                }
                                resultKeys.push(key);
                                resultObjs.push(obj);
                            }
                        });
                        return [4 /*yield*/, (table.schema.primKey.keyPath == null
                                ? table.bulkPut(resultObjs, resultKeys)
                                : table.bulkPut(resultObjs))];
                    case 2:
                        _g.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function throwIfCancelled(cancelToken) {
        if (cancelToken === null || cancelToken === void 0 ? void 0 : cancelToken.cancelled)
            throw new Dexie__default['default'].AbortError("Operation was cancelled");
    }
    /* Need this because navigator.onLine seems to say "false" when it is actually online.
      This function relies initially on navigator.onLine but then uses online and offline events
      which seem to be more reliable.
    */
    var isOnline = navigator.onLine;
    self.addEventListener('online', function () { return isOnline = true; });
    self.addEventListener('offline', function () { return isOnline = false; });
    var isSyncing = new WeakSet();
    var CURRENT_SYNC_WORKER = 'currentSyncWorker';
    function sync(db, options, schema, syncOptions) {
        var _this_1 = this;
        return _sync
            .apply(this, arguments)
            .then(function () {
            db.syncStateChangedEvent.next({
                phase: 'in-sync',
            });
        })
            .catch(function (error) { return __awaiter(_this_1, void 0, void 0, function () {
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        console.debug('Error from _sync', {
                            isOnline: isOnline,
                            syncOptions: syncOptions,
                            error: error,
                        });
                        if (!(isOnline &&
                            (syncOptions === null || syncOptions === void 0 ? void 0 : syncOptions.retryImmediatelyOnFetchError) &&
                            (error === null || error === void 0 ? void 0 : error.name) === 'TypeError' &&
                            /fetch/.test(error === null || error === void 0 ? void 0 : error.message))) return [3 /*break*/, 3];
                        db.syncStateChangedEvent.next({
                            phase: 'error',
                            error: error
                        });
                        // Retry again in 500 ms but if it fails again, don't retry.
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                    case 1:
                        // Retry again in 500 ms but if it fails again, don't retry.
                        _g.sent();
                        return [4 /*yield*/, sync(db, options, schema, __assign(__assign({}, syncOptions), { retryImmediatelyOnFetchError: false }))];
                    case 2: return [2 /*return*/, _g.sent()];
                    case 3: 
                    // Make sure that no matter whether sync() explodes or not,
                    // always update the timestamp. Also store the error.
                    return [4 /*yield*/, db.$syncState.update('syncState', {
                            timestamp: new Date(),
                            error: '' + error,
                        })];
                    case 4:
                        // Make sure that no matter whether sync() explodes or not,
                        // always update the timestamp. Also store the error.
                        _g.sent();
                        db.syncStateChangedEvent.next({
                            phase: isOnline ? 'error' : 'offline',
                            error: error
                        });
                        return [2 /*return*/, Promise.reject(error)];
                }
            });
        }); });
    }
    function _sync(db, options, schema, _g) {
        var _h = _g === void 0 ? {
            isInitialSync: false,
        } : _g, isInitialSync = _h.isInitialSync, cancelToken = _h.cancelToken, justCheckIfNeeded = _h.justCheckIfNeeded;
        return __awaiter(this, void 0, void 0, function () {
            var _a, databaseUrl, currentUser, tablesToSync, mutationTables, persistedSyncState, tablesToSyncify, doSyncify, _j, clientChangeSet, syncState, baseRevs, syncIsNeeded, latestRevisions, res, done;
            var _this_1 = this;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        if (!justCheckIfNeeded) {
                            console.debug('SYNC STARTED', { isInitialSync: isInitialSync });
                        }
                        if (!((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.databaseUrl))
                            throw new Error("Internal error: sync must not be called when no databaseUrl is configured");
                        databaseUrl = options.databaseUrl;
                        return [4 /*yield*/, db.getCurrentUser()];
                    case 1:
                        currentUser = _k.sent();
                        tablesToSync = currentUser.isLoggedIn ? getSyncableTables(db) : [];
                        mutationTables = tablesToSync.map(function (tbl) { return db.table(getMutationTable(tbl.name)); });
                        return [4 /*yield*/, db.getPersistedSyncState()];
                    case 2:
                        persistedSyncState = _k.sent();
                        tablesToSyncify = !isInitialSync && currentUser.isLoggedIn
                            ? getTablesToSyncify(db, persistedSyncState)
                            : [];
                        throwIfCancelled(cancelToken);
                        doSyncify = tablesToSyncify.length > 0;
                        if (!doSyncify) return [3 /*break*/, 4];
                        if (justCheckIfNeeded)
                            return [2 /*return*/, true];
                        console.debug('sync doSyncify is true');
                        return [4 /*yield*/, db.transaction('rw', tablesToSyncify, function (tx) { return __awaiter(_this_1, void 0, void 0, function () {
                                return __generator(this, function (_g) {
                                    switch (_g.label) {
                                        case 0:
                                            // @ts-ignore
                                            tx.idbtrans.disableChangeTracking = true;
                                            // @ts-ignore
                                            tx.idbtrans.disableAccessControl = true; // TODO: Take care of this flag in access control middleware!
                                            return [4 /*yield*/, modifyLocalObjectsWithNewUserId(tablesToSyncify, currentUser, persistedSyncState === null || persistedSyncState === void 0 ? void 0 : persistedSyncState.realms)];
                                        case 1:
                                            _g.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        _k.sent();
                        throwIfCancelled(cancelToken);
                        _k.label = 4;
                    case 4: return [4 /*yield*/, db.transaction('r', db.tables, function () { return __awaiter(_this_1, void 0, void 0, function () {
                            var syncState, baseRevs, clientChanges, syncificationInserts;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0: return [4 /*yield*/, db.getPersistedSyncState()];
                                    case 1:
                                        syncState = _g.sent();
                                        return [4 /*yield*/, db.$baseRevs.toArray()];
                                    case 2:
                                        baseRevs = _g.sent();
                                        return [4 /*yield*/, listClientChanges(mutationTables)];
                                    case 3:
                                        clientChanges = _g.sent();
                                        throwIfCancelled(cancelToken);
                                        if (!doSyncify) return [3 /*break*/, 5];
                                        return [4 /*yield*/, listSyncifiedChanges(tablesToSyncify, currentUser, schema, persistedSyncState === null || persistedSyncState === void 0 ? void 0 : persistedSyncState.realms)];
                                    case 4:
                                        syncificationInserts = _g.sent();
                                        throwIfCancelled(cancelToken);
                                        clientChanges = clientChanges.concat(syncificationInserts);
                                        return [2 /*return*/, [clientChanges, syncState, baseRevs]];
                                    case 5: return [2 /*return*/, [clientChanges, syncState, baseRevs]];
                                }
                            });
                        }); })];
                    case 5:
                        _j = _k.sent(), clientChangeSet = _j[0], syncState = _j[1], baseRevs = _j[2];
                        if (justCheckIfNeeded) {
                            syncIsNeeded = clientChangeSet.some(function (set) { return set.muts.some(function (mut) { return mut.keys.length > 0; }); });
                            console.debug('Sync is needed:', syncIsNeeded);
                            return [2 /*return*/, syncIsNeeded];
                        }
                        latestRevisions = getLatestRevisionsPerTable(clientChangeSet, syncState === null || syncState === void 0 ? void 0 : syncState.latestRevisions);
                        //
                        // Push changes to server
                        //
                        throwIfCancelled(cancelToken);
                        return [4 /*yield*/, syncWithServer(clientChangeSet, syncState, baseRevs, db, databaseUrl, schema)];
                    case 6:
                        res = _k.sent();
                        console.debug('Sync response', res);
                        return [4 /*yield*/, db.transaction('rw', db.tables, function (tx) { return __awaiter(_this_1, void 0, void 0, function () {
                                var _g, _h, tableName, addedClientChanges, _loop_1, _j, mutationTables_1, mutTable, syncState, newSyncState, filteredChanges;
                                return __generator(this, function (_k) {
                                    switch (_k.label) {
                                        case 0:
                                            // @ts-ignore
                                            tx.idbtrans.disableChangeTracking = true;
                                            // @ts-ignore
                                            tx.idbtrans.disableAccessControl = true; // TODO: Take care of this flag in access control middleware!
                                            // Update db.cloud.schema from server response.
                                            // Local schema MAY include a subset of tables, so do not force all tables into local schema.
                                            for (_g = 0, _h = Object.keys(schema); _g < _h.length; _g++) {
                                                tableName = _h[_g];
                                                if (res.schema[tableName]) {
                                                    // Write directly into configured schema. This code can only be executed alone.
                                                    schema[tableName] = res.schema[tableName];
                                                }
                                            }
                                            return [4 /*yield*/, db.$syncState.put(schema, 'schema')];
                                        case 1:
                                            _k.sent();
                                            return [4 /*yield*/, listClientChanges(mutationTables, db, {
                                                    since: latestRevisions,
                                                })];
                                        case 2:
                                            addedClientChanges = _k.sent();
                                            _loop_1 = function (mutTable) {
                                                var tableName, latestRev;
                                                return __generator(this, function (_l) {
                                                    switch (_l.label) {
                                                        case 0:
                                                            tableName = getTableFromMutationTable(mutTable.name);
                                                            if (!!addedClientChanges.some(function (ch) { return ch.table === tableName && ch.muts.length > 0; })) return [3 /*break*/, 2];
                                                            // No added mutations for this table during the time we sent changes
                                                            // to the server.
                                                            // It is therefore safe to clear all changes (which is faster than
                                                            // deleting a range)
                                                            return [4 /*yield*/, Promise.all([
                                                                    mutTable.clear(),
                                                                    db.$baseRevs.where({ tableName: tableName }).delete(),
                                                                ])];
                                                        case 1:
                                                            // No added mutations for this table during the time we sent changes
                                                            // to the server.
                                                            // It is therefore safe to clear all changes (which is faster than
                                                            // deleting a range)
                                                            _l.sent();
                                                            return [3 /*break*/, 5];
                                                        case 2:
                                                            if (!latestRevisions[mutTable.name]) return [3 /*break*/, 4];
                                                            latestRev = latestRevisions[mutTable.name] || 0;
                                                            //await mutTable.where('rev').belowOrEqual(latestRev).reverse().offset(1).delete();
                                                            return [4 /*yield*/, Promise.all([
                                                                    mutTable.where('rev').belowOrEqual(latestRev).delete(),
                                                                    db.$baseRevs
                                                                        .where(':id')
                                                                        .between([tableName, -Infinity], [tableName, latestRev + 1], true, true)
                                                                        .reverse()
                                                                        .offset(1) // Keep one entry (the one mapping muts that came during fetch --> previous server revision)
                                                                        .delete(),
                                                                ])];
                                                        case 3:
                                                            //await mutTable.where('rev').belowOrEqual(latestRev).reverse().offset(1).delete();
                                                            _l.sent();
                                                            return [3 /*break*/, 5];
                                                        case 4:
                                                            _l.label = 5;
                                                        case 5: return [2 /*return*/];
                                                    }
                                                });
                                            };
                                            _j = 0, mutationTables_1 = mutationTables;
                                            _k.label = 3;
                                        case 3:
                                            if (!(_j < mutationTables_1.length)) return [3 /*break*/, 6];
                                            mutTable = mutationTables_1[_j];
                                            return [5 /*yield**/, _loop_1(mutTable)];
                                        case 4:
                                            _k.sent();
                                            _k.label = 5;
                                        case 5:
                                            _j++;
                                            return [3 /*break*/, 3];
                                        case 6:
                                            // Update latestRevisions object according to additional changes:
                                            getLatestRevisionsPerTable(addedClientChanges, latestRevisions);
                                            // Update/add new entries into baseRevs map.
                                            // * On tables without mutations since last serverRevision,
                                            //   this will update existing entry.
                                            // * On tables where mutations have been recorded since last
                                            //   serverRevision, this will create a new entry.
                                            // The purpose of this operation is to mark a start revision (per table)
                                            // so that all client-mutations that come after this, will be mapped to current
                                            // server revision.
                                            return [4 /*yield*/, db.$baseRevs.bulkPut(Object.keys(schema)
                                                    .filter(function (table) { return schema[table].markedForSync; })
                                                    .map(function (tableName) {
                                                    var lastClientRevOnPreviousServerRev = latestRevisions[tableName] || 0;
                                                    return {
                                                        tableName: tableName,
                                                        clientRev: lastClientRevOnPreviousServerRev + 1,
                                                        serverRev: res.serverRevision,
                                                    };
                                                }))];
                                        case 7:
                                            // Update/add new entries into baseRevs map.
                                            // * On tables without mutations since last serverRevision,
                                            //   this will update existing entry.
                                            // * On tables where mutations have been recorded since last
                                            //   serverRevision, this will create a new entry.
                                            // The purpose of this operation is to mark a start revision (per table)
                                            // so that all client-mutations that come after this, will be mapped to current
                                            // server revision.
                                            _k.sent();
                                            return [4 /*yield*/, db.getPersistedSyncState()];
                                        case 8:
                                            syncState = _k.sent();
                                            //
                                            // Delete objects from removed realms
                                            //
                                            return [4 /*yield*/, deleteObjectsFromRemovedRealms(db, res, syncState)];
                                        case 9:
                                            //
                                            // Delete objects from removed realms
                                            //
                                            _k.sent();
                                            newSyncState = syncState || {
                                                syncedTables: [],
                                                latestRevisions: {},
                                                realms: [],
                                                inviteRealms: [],
                                            };
                                            newSyncState.syncedTables = tablesToSync
                                                .map(function (tbl) { return tbl.name; })
                                                .concat(tablesToSyncify.map(function (tbl) { return tbl.name; }));
                                            newSyncState.latestRevisions = latestRevisions;
                                            newSyncState.remoteDbId = res.dbId;
                                            newSyncState.initiallySynced = true;
                                            newSyncState.realms = res.realms;
                                            newSyncState.inviteRealms = res.inviteRealms;
                                            newSyncState.serverRevision = res.serverRevision;
                                            newSyncState.timestamp = new Date();
                                            delete newSyncState.error;
                                            filteredChanges = filterServerChangesThroughAddedClientChanges(res.changes, addedClientChanges);
                                            //
                                            // apply server changes
                                            //
                                            return [4 /*yield*/, applyServerChanges(filteredChanges, db)];
                                        case 10:
                                            //
                                            // apply server changes
                                            //
                                            _k.sent();
                                            //
                                            // Update syncState
                                            //
                                            db.$syncState.put(newSyncState, 'syncState');
                                            return [2 /*return*/, addedClientChanges.length === 0];
                                    }
                                });
                            }); })];
                    case 7:
                        done = _k.sent();
                        if (!!done) return [3 /*break*/, 9];
                        console.debug('MORE SYNC NEEDED. Go for it again!');
                        return [4 /*yield*/, _sync(db, options, schema, { isInitialSync: isInitialSync, cancelToken: cancelToken })];
                    case 8: return [2 /*return*/, _k.sent()];
                    case 9:
                        console.debug('SYNC DONE', { isInitialSync: isInitialSync });
                        return [2 /*return*/, false]; // Not needed anymore
                }
            });
        });
    }
    function deleteObjectsFromRemovedRealms(db, res, prevState) {
        return __awaiter(this, void 0, void 0, function () {
            var deletedRealms, previousRealmSet, updatedRealmSet, _g, previousRealmSet_1, realmId, deletedRealmSet_1, tables, _h, tables_1, table;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        deletedRealms = [];
                        previousRealmSet = prevState
                            ? prevState.realms.concat(prevState.inviteRealms)
                            : [];
                        updatedRealmSet = new Set(__spreadArray(__spreadArray([], res.realms), res.inviteRealms));
                        for (_g = 0, previousRealmSet_1 = previousRealmSet; _g < previousRealmSet_1.length; _g++) {
                            realmId = previousRealmSet_1[_g];
                            if (!updatedRealmSet.has(realmId))
                                deletedRealms.push(realmId);
                        }
                        if (!(deletedRealms.length > 0)) return [3 /*break*/, 6];
                        deletedRealmSet_1 = new Set(deletedRealms);
                        tables = getSyncableTables(db);
                        _h = 0, tables_1 = tables;
                        _j.label = 1;
                    case 1:
                        if (!(_h < tables_1.length)) return [3 /*break*/, 6];
                        table = tables_1[_h];
                        if (!table.schema.indexes.some(function (idx) { return idx.keyPath === 'realmId' ||
                            (Array.isArray(idx.keyPath) && idx.keyPath[0] === 'realmId'); })) return [3 /*break*/, 3];
                        // There's an index to use:
                        return [4 /*yield*/, table.where('realmId').anyOf(deletedRealms).delete()];
                    case 2:
                        // There's an index to use:
                        _j.sent();
                        return [3 /*break*/, 5];
                    case 3: 
                    // No index to use:
                    return [4 /*yield*/, table
                            .filter(function (obj) { return !!(obj === null || obj === void 0 ? void 0 : obj.realmId) && deletedRealmSet_1.has(obj.realmId); })
                            .delete()];
                    case 4:
                        // No index to use:
                        _j.sent();
                        _j.label = 5;
                    case 5:
                        _h++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function getLatestRevisionsPerTable(clientChangeSet, lastRevisions) {
        if (lastRevisions === void 0) { lastRevisions = {}; }
        for (var _g = 0, clientChangeSet_1 = clientChangeSet; _g < clientChangeSet_1.length; _g++) {
            var _h = clientChangeSet_1[_g], table = _h.table, muts = _h.muts;
            var lastRev = muts.length > 0 ? muts[muts.length - 1].rev || 0 : 0;
            lastRevisions[table] = lastRev;
        }
        return lastRevisions;
    }
    function applyServerChanges(changes, db) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_2, _g, changes_1, _h, tableName, muts;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        console.debug('Applying server changes', changes, Dexie__default['default'].currentTransaction);
                        _loop_2 = function (tableName, muts) {
                            var table, primaryKey, _loop_3, _k, muts_2, mut;
                            return __generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0:
                                        table = db.table(tableName);
                                        primaryKey = table.core.schema.primaryKey;
                                        _loop_3 = function (mut) {
                                            var _m;
                                            return __generator(this, function (_o) {
                                                switch (_o.label) {
                                                    case 0:
                                                        _m = mut.type;
                                                        switch (_m) {
                                                            case 'insert': return [3 /*break*/, 1];
                                                            case 'upsert': return [3 /*break*/, 6];
                                                            case 'modify': return [3 /*break*/, 11];
                                                            case 'update': return [3 /*break*/, 16];
                                                            case 'delete': return [3 /*break*/, 18];
                                                        }
                                                        return [3 /*break*/, 20];
                                                    case 1:
                                                        if (!primaryKey.outbound) return [3 /*break*/, 3];
                                                        return [4 /*yield*/, table.bulkAdd(mut.values, mut.keys)];
                                                    case 2:
                                                        _o.sent();
                                                        return [3 /*break*/, 5];
                                                    case 3:
                                                        mut.keys.forEach(function (key, i) {
                                                            Dexie__default['default'].setByKeyPath(mut.values[i], primaryKey.keyPath, key);
                                                        });
                                                        return [4 /*yield*/, table.bulkAdd(mut.values)];
                                                    case 4:
                                                        _o.sent();
                                                        _o.label = 5;
                                                    case 5: return [3 /*break*/, 20];
                                                    case 6:
                                                        if (!primaryKey.outbound) return [3 /*break*/, 8];
                                                        return [4 /*yield*/, table.bulkPut(mut.values, mut.keys)];
                                                    case 7:
                                                        _o.sent();
                                                        return [3 /*break*/, 10];
                                                    case 8:
                                                        mut.keys.forEach(function (key, i) {
                                                            Dexie__default['default'].setByKeyPath(mut.values[i], primaryKey.keyPath, key);
                                                        });
                                                        return [4 /*yield*/, table.bulkPut(mut.values)];
                                                    case 9:
                                                        _o.sent();
                                                        _o.label = 10;
                                                    case 10: return [3 /*break*/, 20];
                                                    case 11:
                                                        if (!(mut.keys.length === 1)) return [3 /*break*/, 13];
                                                        return [4 /*yield*/, table.update(mut.keys[0], mut.changeSpec)];
                                                    case 12:
                                                        _o.sent();
                                                        return [3 /*break*/, 15];
                                                    case 13: return [4 /*yield*/, table.where(':id').anyOf(mut.keys).modify(mut.changeSpec)];
                                                    case 14:
                                                        _o.sent();
                                                        _o.label = 15;
                                                    case 15: return [3 /*break*/, 20];
                                                    case 16: return [4 /*yield*/, bulkUpdate(table, mut.keys, mut.changeSpecs)];
                                                    case 17:
                                                        _o.sent();
                                                        return [3 /*break*/, 20];
                                                    case 18: return [4 /*yield*/, table.bulkDelete(mut.keys)];
                                                    case 19:
                                                        _o.sent();
                                                        return [3 /*break*/, 20];
                                                    case 20: return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _k = 0, muts_2 = muts;
                                        _l.label = 1;
                                    case 1:
                                        if (!(_k < muts_2.length)) return [3 /*break*/, 4];
                                        mut = muts_2[_k];
                                        return [5 /*yield**/, _loop_3(mut)];
                                    case 2:
                                        _l.sent();
                                        _l.label = 3;
                                    case 3:
                                        _k++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        _g = 0, changes_1 = changes;
                        _j.label = 1;
                    case 1:
                        if (!(_g < changes_1.length)) return [3 /*break*/, 4];
                        _h = changes_1[_g], tableName = _h.table, muts = _h.muts;
                        return [5 /*yield**/, _loop_2(tableName, muts)];
                    case 2:
                        _j.sent();
                        _j.label = 3;
                    case 3:
                        _g++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function filterServerChangesThroughAddedClientChanges(serverChanges, addedClientChanges) {
        var changes = {};
        applyOperations(changes, serverChanges);
        var localPostChanges = {};
        applyOperations(localPostChanges, addedClientChanges);
        subtractChanges(changes, localPostChanges);
        return toDBOperationSet(changes);
    }
    function performInitialSync(db, cloudOptions, cloudSchema) {
        return __awaiter(this, void 0, void 0, function () {
            var _this_1 = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        console.debug("Performing initial sync");
                        return [4 /*yield*/, performGuardedJob(db, 'initialSync', '$jobs', function () { return __awaiter(_this_1, void 0, void 0, function () {
                                var syncState;
                                return __generator(this, function (_g) {
                                    switch (_g.label) {
                                        case 0: return [4 /*yield*/, db.getPersistedSyncState()];
                                        case 1:
                                            syncState = _g.sent();
                                            if (!!(syncState === null || syncState === void 0 ? void 0 : syncState.initiallySynced)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, sync(db, cloudOptions, cloudSchema, { isInitialSync: true })];
                                        case 2:
                                            _g.sent();
                                            _g.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }, { awaitRemoteJob: true } // Don't return until the job is done!
                            )];
                    case 1:
                        _g.sent();
                        console.debug("Done initial sync");
                        return [2 /*return*/];
                }
            });
        });
    }
    var USER_INACTIVITY_TIMEOUT = 300000; // 300_000;
    // This observable will be emitted to later down....
    var userIsActive = new rxjs.BehaviorSubject(true);
    //
    // First create some corner-stone observables to build the flow on
    //
    // document.onvisibilitychange:
    var visibilityStateIsChanged = typeof document !== 'undefined'
        ? rxjs.fromEvent(document, 'visibilitychange')
        : rxjs.of({});
    // document.onvisibilitychange makes document hidden:
    var documentBecomesHidden = visibilityStateIsChanged.pipe(filter(function () { return document.visibilityState === 'hidden'; }));
    // document.onvisibilitychange makes document visible
    var documentBecomesVisible = visibilityStateIsChanged.pipe(filter(function () { return document.visibilityState === 'hidden'; }));
    // Any of various user-activity-related events happen:
    var userDoesSomething = typeof window !== 'undefined'
        ? rxjs.merge(documentBecomesVisible, rxjs.fromEvent(window, 'mousemove'), rxjs.fromEvent(window, 'keydown'), rxjs.fromEvent(window, 'wheel'), rxjs.fromEvent(window, 'touchmove'))
        : rxjs.of({});
    if (typeof document !== 'undefined') {
        //
        // Now, create a final observable and start subscribing to it in order
        // to make it emit values to userIsActive BehaviourSubject (which is the
        // most important global hot observable we have here)
        //
        // Live test: https://jsitor.com/LboCDHgbn
        //
        rxjs.merge(rxjs.of(true), // Make sure something is always emitted from start
        documentBecomesHidden, // so that we can eagerly emit false!
        userDoesSomething)
            .pipe(
        // No matter event source, compute whether user is visible using visibilityState:
        map(function () { return document.visibilityState === 'visible'; }), 
        // Make sure to emit it
        tap(function (isActive) {
            if (userIsActive.value !== isActive) {
                // Emit new value unless it already has that value
                userIsActive.next(isActive);
            }
        }), 
        // Now, if true was emitted, make sure to set a timeout to emit false
        // unless new user activity things happen (in that case, the timeout will be cancelled!)
        switchMap(function (isActive) { return isActive
            ? rxjs.of(true).pipe(delay(USER_INACTIVITY_TIMEOUT), tap(function () { return userIsActive.next(false); }))
            : rxjs.of(false); }))
            .subscribe(function () { }); // Unless we subscribe nothing will be propagated to userIsActive observable
    }
    var TokenExpiredError = /** @class */ (function (_super_1) {
        __extends$1(TokenExpiredError, _super_1);
        function TokenExpiredError() {
            var _this_1 = _super_1.apply(this, arguments) || this;
            _this_1.name = "TokenExpiredError";
            return _this_1;
        }
        return TokenExpiredError;
    }(Error));
    var SERVER_PING_TIMEOUT = 20000;
    var CLIENT_PING_INTERVAL = 30000;
    var FAIL_RETRY_WAIT_TIME = 60000;
    var WSObservable = /** @class */ (function (_super_1) {
        __extends$1(WSObservable, _super_1);
        function WSObservable(databaseUrl, rev, token, tokenExpiration) {
            return _super_1.call(this, function (subscriber) { return new WSConnection(databaseUrl, rev, token, tokenExpiration, subscriber); }) || this;
        }
        return WSObservable;
    }(rxjs.Observable));
    var counter = 0;
    var WSConnection = /** @class */ (function (_super_1) {
        __extends$1(WSConnection, _super_1);
        function WSConnection(databaseUrl, rev, token, tokenExpiration, subscriber) {
            var _this_1 = _super_1.call(this, function () { return _this_1.teardown(); }) || this;
            _this_1.id = ++counter;
            console.debug('New WebSocket Connection', _this_1.id, token ? 'authorized' : 'unauthorized');
            _this_1.databaseUrl = databaseUrl;
            _this_1.rev = rev;
            _this_1.token = token;
            _this_1.tokenExpiration = tokenExpiration;
            _this_1.subscriber = subscriber;
            _this_1.lastUserActivity = new Date();
            _this_1.connect();
            return _this_1;
        }
        WSConnection.prototype.teardown = function () {
            this.disconnect();
            console.debug('Teardown WebSocket Connection', this.id);
        };
        WSConnection.prototype.disconnect = function () {
            if (this.pinger) {
                clearInterval(this.pinger);
                this.pinger = null;
            }
            if (this.ws) {
                try {
                    this.ws.close();
                }
                catch (_a) { }
            }
            this.ws = null;
        };
        WSConnection.prototype.reconnect = function () {
            this.disconnect();
            this.connect();
        };
        WSConnection.prototype.connect = function () {
            return __awaiter(this, void 0, void 0, function () {
                var wsUrl, searchParams, ws;
                var _this_1 = this;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            this.lastServerActivity = new Date();
                            if (this.pauseUntil && this.pauseUntil > new Date())
                                return [2 /*return*/];
                            if (this.ws) {
                                throw new Error("Called connect() when a connection is already open");
                            }
                            if (!this.databaseUrl)
                                throw new Error("Cannot connect without a database URL");
                            if (this.closed) {
                                return [2 /*return*/];
                            }
                            if (this.tokenExpiration && this.tokenExpiration < new Date()) {
                                this.subscriber.error(new TokenExpiredError()); // Will be handled in connectWebSocket.ts.
                                return [2 /*return*/];
                            }
                            this.pinger = setInterval(function () { return __awaiter(_this_1, void 0, void 0, function () {
                                var _this_1 = this;
                                return __generator(this, function (_g) {
                                    if (this.closed) {
                                        console.debug('pinger check', this.id, 'CLOSED.');
                                        this.teardown();
                                        return [2 /*return*/];
                                    }
                                    console.debug('pinger check', this.id, 'user is active');
                                    if (this.ws) {
                                        try {
                                            this.ws.send(JSON.stringify({ type: 'ping' }));
                                            setTimeout(function () {
                                                console.debug('pinger setTimeout', _this_1.id, _this_1.pinger ? "alive" : 'dead');
                                                if (!_this_1.pinger)
                                                    return;
                                                if (_this_1.closed) {
                                                    console.debug('pinger setTimeout', _this_1.id, 'subscription is closed');
                                                    _this_1.teardown();
                                                    return;
                                                }
                                                if (_this_1.lastServerActivity <
                                                    new Date(Date.now() - SERVER_PING_TIMEOUT)) {
                                                    // Server inactive. Reconnect if user is active.
                                                    console.debug('pinger: server is inactive');
                                                    console.debug('pinger reconnecting');
                                                    _this_1.reconnect();
                                                }
                                                else {
                                                    console.debug('pinger: server still active');
                                                }
                                            }, SERVER_PING_TIMEOUT);
                                        }
                                        catch (_a) {
                                            console.debug('pinger catch error', this.id, 'reconnecting');
                                            this.reconnect();
                                        }
                                    }
                                    else {
                                        console.debug('pinger', this.id, 'reconnecting');
                                        this.reconnect();
                                    }
                                    return [2 /*return*/];
                                });
                            }); }, CLIENT_PING_INTERVAL);
                            wsUrl = new URL(this.databaseUrl);
                            wsUrl.protocol = wsUrl.protocol === 'http:' ? 'ws' : 'wss';
                            searchParams = new URLSearchParams();
                            if (this.subscriber.closed)
                                return [2 /*return*/];
                            searchParams.set('rev', this.rev);
                            if (this.token) {
                                searchParams.set('token', this.token);
                            }
                            // Connect the WebSocket to given url:
                            console.debug('dexie-cloud WebSocket create');
                            ws = (this.ws = new WebSocket(wsUrl + "/revision?" + searchParams));
                            //ws.binaryType = "arraybuffer"; // For future when subscribing to actual changes.
                            ws.onclose = function (event) {
                                if (!_this_1.pinger)
                                    return;
                                console.debug('dexie-cloud WebSocket onclosed');
                                _this_1.reconnect();
                            };
                            ws.onmessage = function (event) {
                                if (!_this_1.pinger)
                                    return;
                                console.debug('dexie-cloud WebSocket onmessage', event.data);
                                _this_1.lastServerActivity = new Date();
                                try {
                                    var msg = JSON.parse(event.data);
                                    if (msg.type === 'error') {
                                        throw new Error("dexie-cloud WebSocket Error " + msg.error);
                                    }
                                    if (msg.type === 'rev') {
                                        _this_1.rev = msg.rev; // No meaning but seems reasonable.
                                    }
                                    if (msg.type !== 'pong') {
                                        _this_1.subscriber.next(msg);
                                    }
                                }
                                catch (e) {
                                    _this_1.disconnect();
                                    _this_1.pauseUntil = new Date(Date.now() + FAIL_RETRY_WAIT_TIME);
                                }
                            };
                            _g.label = 1;
                        case 1:
                            _g.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    ws.onopen = function (event) {
                                        console.debug('dexie-cloud WebSocket onopen');
                                        resolve(null);
                                    };
                                    ws.onerror = function (event) {
                                        var error = event.error || new Error('WebSocket Error');
                                        console.debug('dexie-cloud WebSocket error', error);
                                        _this_1.disconnect();
                                        reject(error);
                                    };
                                })];
                        case 2:
                            _g.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _g.sent();
                            this.pauseUntil = new Date(Date.now() + FAIL_RETRY_WAIT_TIME);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return WSConnection;
    }(rxjs.Subscription));
    function triggerSync(db) {
        if (db.cloud.usingServiceWorker) {
            registerSyncEvent(db);
        }
        else {
            db.localSyncEvent.next({});
        }
    }
    function connectWebSocket(db) {
        var _this_1 = this;
        var _a;
        if (!((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.databaseUrl)) {
            throw new Error("No database URL to connect WebSocket to");
        }
        function createObservable() {
            return userIsActive.pipe(filter(function (isActive) { return isActive; }), // Reconnect when user becomes active
            switchMap(function () { return db.cloud.currentUser; }), // Reconnect whenever current user changes
            filter(function () { var _a, _b; return (_b = (_a = db.cloud.persistedSyncState) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.serverRevision; }), // Don't connect before there's no initial sync performed.
            switchMap(function (userLogin) {
                var _a, _b;
                return new WSObservable(db.cloud.options.databaseUrl, (_b = (_a = db.cloud.persistedSyncState) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.serverRevision, userLogin.accessToken, userLogin.accessTokenExpiration);
            }), catchError(function (error) {
                return rxjs.from(handleError(error)).pipe(switchMap(function () { return createObservable(); }), catchError(function (error) {
                    // Failed to refresh token (network error or so)
                    console.error("WebSocket observable: error but revive when user does some active thing...", error);
                    return rxjs.of(true).pipe(delay(3000), // Give us some breath between errors
                    switchMap(function () { return userDoesSomething; }), take(1), // Don't reconnect whenever user does something
                    switchMap(function () { return createObservable(); }) // Relaunch the flow
                    );
                }));
                function handleError(error) {
                    return __awaiter(this, void 0, void 0, function () {
                        var user, refreshedLogin;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0:
                                    if (!((error === null || error === void 0 ? void 0 : error.name) === 'TokenExpiredError')) return [3 /*break*/, 3];
                                    console.debug('WebSocket observable: Token expired. Refreshing token...');
                                    user = db.cloud.currentUser.value;
                                    return [4 /*yield*/, refreshAccessToken(db.cloud.options.databaseUrl, user)];
                                case 1:
                                    refreshedLogin = _g.sent();
                                    return [4 /*yield*/, db.table('$logins').update(user.userId, {
                                            accessToken: refreshedLogin.accessToken,
                                            accessTokenExpiration: refreshedLogin.accessTokenExpiration,
                                        })];
                                case 2:
                                    _g.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    console.error('WebSocket observable:', error);
                                    throw error;
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                }
            }));
        }
        return createObservable().subscribe(function (msg) { return __awaiter(_this_1, void 0, void 0, function () {
            var _a, _b, syncState;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, db.getPersistedSyncState()];
                    case 1:
                        syncState = _g.sent();
                        switch (msg.type) {
                            case 'rev':
                                if (!(syncState === null || syncState === void 0 ? void 0 : syncState.serverRevision) ||
                                    FakeBigInt.compare(syncState.serverRevision, typeof BigInt === 'undefined'
                                        ? new FakeBigInt(msg.rev)
                                        : BigInt(msg.rev)) < 0) {
                                    triggerSync(db);
                                }
                                break;
                            case 'realm-added':
                                {
                                    if (!((_a = syncState === null || syncState === void 0 ? void 0 : syncState.realms) === null || _a === void 0 ? void 0 : _a.includes(msg.realm))) {
                                        triggerSync(db);
                                    }
                                }
                                break;
                            case 'realm-removed':
                                if ((_b = syncState === null || syncState === void 0 ? void 0 : syncState.realms) === null || _b === void 0 ? void 0 : _b.includes(msg.realm)) {
                                    triggerSync(db);
                                }
                                break;
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    }
    function isSyncNeeded(db) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (!(((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.databaseUrl) && db.cloud.schema)) return [3 /*break*/, 2];
                        return [4 /*yield*/, sync(db, db.cloud.options, db.cloud.schema, { justCheckIfNeeded: true })];
                    case 1:
                        _g = _h.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _g = false;
                        _h.label = 3;
                    case 3: return [2 /*return*/, _g];
                }
            });
        });
    }
    function syncIfPossible(db, cloudOptions, cloudSchema, options) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (isSyncing.has(db)) {
                            // Still working. Existing work will make sure to complete its job
                            // and after that, check if new mutations have arrived, and if so complete
                            // those as well. So if isSyncing.has(db) is true, we can rely that nothing at
                            // all will be needed to perform at this time.
                            // Exceptions: If onling sync throws an exception, it's caller will take care of
                            // the retry procedure - we shouldn't do that also (would be redundant).
                            return [2 /*return*/];
                        }
                        // Skipping check for navigator.onLine - turns out to be false in Opera even when online.
                        /*if (typeof navigator !== 'undefined' && !navigator.onLine) {
                          // We're not online.
                          // If LocalSyncWorker is used, a retry will automatically happen when we become
                          // online.
                          return;
                        }*/
                        /*if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
                          console.debug("syncIfPossible: not visible", options);
                          return; // We're a window but not visible
                        }*/
                        isSyncing.add(db);
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 7, , 8]);
                        if (!db.cloud.usingServiceWorker) return [3 /*break*/, 4];
                        if (!IS_SERVICE_WORKER) return [3 /*break*/, 3];
                        return [4 /*yield*/, sync(db, cloudOptions, cloudSchema, options)];
                    case 2:
                        _g.sent();
                        _g.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4: 
                    // We use a flow that is better suited for the case when multiple workers want to
                    // do the same thing.
                    return [4 /*yield*/, performGuardedJob(db, CURRENT_SYNC_WORKER, '$jobs', function () { return sync(db, cloudOptions, cloudSchema, options); })];
                    case 5:
                        // We use a flow that is better suited for the case when multiple workers want to
                        // do the same thing.
                        _g.sent();
                        _g.label = 6;
                    case 6:
                        isSyncing.delete(db);
                        console.debug("Done sync");
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _g.sent();
                        isSyncing.delete(db);
                        console.error("Failed to sync client changes", error_3);
                        throw error_3; // Make sure we rethrow error so that sync event is retried.
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    function LocalSyncWorker(db, cloudOptions, cloudSchema) {
        var localSyncEventSubscription = null;
        //let syncHandler: ((event: Event) => void) | null = null;
        //let periodicSyncHandler: ((event: Event) => void) | null = null;
        var cancelToken = { cancelled: false };
        function syncAndRetry(retryNum) {
            if (retryNum === void 0) { retryNum = 1; }
            syncIfPossible(db, cloudOptions, cloudSchema, {
                cancelToken: cancelToken,
                retryImmediatelyOnFetchError: true, // workaround for "net::ERR_NETWORK_CHANGED" in chrome.
            }).catch(function (e) {
                console.error('error in syncIfPossible()', e);
                if (cancelToken.cancelled) {
                    stop();
                }
                else if (retryNum < 3) {
                    // Mimic service worker sync event: retry 3 times
                    // * first retry after 5 minutes
                    // * second retry 15 minutes later
                    setTimeout(function () { return syncAndRetry(retryNum + 1); }, [0, 5, 15][retryNum] * MINUTES);
                }
            });
        }
        var start = function () {
            // Sync eagerly whenever a change has happened (+ initially when there's no syncState yet)
            // This initial subscribe will also trigger an sync also now.
            console.debug('Starting LocalSyncWorker', db.localSyncEvent['id']);
            localSyncEventSubscription = db.localSyncEvent.subscribe(function () {
                try {
                    syncAndRetry();
                }
                catch (err) {
                    console.error('What-the....', err);
                }
            });
            //setTimeout(()=>db.localSyncEvent.next({}), 5000);
        };
        var stop = function () {
            console.debug('Stopping LocalSyncWorker');
            cancelToken.cancelled = true;
            if (localSyncEventSubscription)
                localSyncEventSubscription.unsubscribe();
        };
        return {
            start: start,
            stop: stop,
        };
    }
    function updateSchemaFromOptions(schema, options) {
        if (schema && options) {
            if (options.unsyncedTables) {
                for (var _g = 0, _h = options.unsyncedTables; _g < _h.length; _g++) {
                    var tableName = _h[_g];
                    if (schema[tableName]) {
                        schema[tableName].markedForSync = false;
                    }
                }
            }
        }
    }
    function verifySchema(db) {
        var _a, _b;
        for (var _g = 0, _h = db.tables; _g < _h.length; _g++) {
            var table = _h[_g];
            if ((_b = (_a = db.cloud.schema) === null || _a === void 0 ? void 0 : _a[table.name]) === null || _b === void 0 ? void 0 : _b.markedForSync) {
                if (table.schema.primKey.auto) {
                    throw new Dexie__default['default'].SchemaError("Table " + table.name + " is both autoIncremented and synced. " +
                        ("Use db.cloud.configure({unsyncedTables: [" + JSON.stringify(table.name) + "]}) to blacklist it from sync"));
                }
                if (!table.schema.primKey.keyPath) {
                    throw new Dexie__default['default'].SchemaError("Table " + table.name + " cannot be both synced and outbound. " +
                        ("Use db.cloud.configure({unsyncedTables: [" + JSON.stringify(table.name) + "]}) to blacklist it from sync"));
                }
            }
        }
    }
    var n, u$1, i$1, t$1, r$1 = {}, f$1 = [], e$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
    function c$1(n, l) { for (var u in l)
        n[u] = l[u]; return n; }
    function s$1(n) { var l = n.parentNode; l && l.removeChild(n); }
    function a$1(n, l, u) { var i, t, o, r = arguments, f = {}; for (o in l)
        "key" == o ? i = l[o] : "ref" == o ? t = l[o] : f[o] = l[o]; if (arguments.length > 3)
        for (u = [u], o = 3; o < arguments.length; o++)
            u.push(r[o]); if (null != u && (f.children = u), "function" == typeof n && null != n.defaultProps)
        for (o in n.defaultProps)
            void 0 === f[o] && (f[o] = n.defaultProps[o]); return v$1(n, f, i, t, null); }
    function v$1(l, u, i, t, o) { var r = { type: l, props: u, key: i, ref: t, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: null == o ? ++n.__v : o }; return null != n.vnode && n.vnode(r), r; }
    function y(n) { return n.children; }
    function p$1(n, l) { this.props = n, this.context = l; }
    function d$1(n, l) { if (null == l)
        return n.__ ? d$1(n.__, n.__.__k.indexOf(n) + 1) : null; for (var u; l < n.__k.length; l++)
        if (null != (u = n.__k[l]) && null != u.__e)
            return u.__e; return "function" == typeof n.type ? d$1(n) : null; }
    function _(n) { var l, u; if (null != (n = n.__) && null != n.__c) {
        for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++)
            if (null != (u = n.__k[l]) && null != u.__e) {
                n.__e = n.__c.base = u.__e;
                break;
            }
        return _(n);
    } }
    function k$1(l) { (!l.__d && (l.__d = !0) && u$1.push(l) && !b$1.__r++ || t$1 !== n.debounceRendering) && ((t$1 = n.debounceRendering) || i$1)(b$1); }
    function b$1() { for (var n; b$1.__r = u$1.length;)
        n = u$1.sort(function (n, l) { return n.__v.__b - l.__v.__b; }), u$1 = [], n.some(function (n) { var l, u, i, t, o, r; n.__d && (o = (t = (l = n).__v).__e, (r = l.__P) && (u = [], (i = c$1({}, t)).__v = t.__v + 1, I(r, t, i, l.__n, void 0 !== r.ownerSVGElement, null != t.__h ? [o] : null, u, null == o ? d$1(t) : o, t.__h), T(u, t), t.__e != o && _(t))); }); }
    function m$1(n, l, u, i, t, o, e, c, s, a) { var h, p, _, k, b, m, w, A = i && i.__k || f$1, P = A.length; for (u.__k = [], h = 0; h < l.length; h++)
        if (null != (k = u.__k[h] = null == (k = l[h]) || "boolean" == typeof k ? null : "string" == typeof k || "number" == typeof k || "bigint" == typeof k ? v$1(null, k, null, null, k) : Array.isArray(k) ? v$1(y, { children: k }, null, null, null) : k.__b > 0 ? v$1(k.type, k.props, k.key, null, k.__v) : k)) {
            if (k.__ = u, k.__b = u.__b + 1, null === (_ = A[h]) || _ && k.key == _.key && k.type === _.type)
                A[h] = void 0;
            else
                for (p = 0; p < P; p++) {
                    if ((_ = A[p]) && k.key == _.key && k.type === _.type) {
                        A[p] = void 0;
                        break;
                    }
                    _ = null;
                }
            I(n, k, _ = _ || r$1, t, o, e, c, s, a), b = k.__e, (p = k.ref) && _.ref != p && (w || (w = []), _.ref && w.push(_.ref, null, k), w.push(p, k.__c || b, k)), null != b ? (null == m && (m = b), "function" == typeof k.type && null != k.__k && k.__k === _.__k ? k.__d = s = g$1(k, s, n) : s = x$1(n, k, _, A, b, s), a || "option" !== u.type ? "function" == typeof u.type && (u.__d = s) : n.value = "") : s && _.__e == s && s.parentNode != n && (s = d$1(_));
        } for (u.__e = m, h = P; h--;)
        null != A[h] && ("function" == typeof u.type && null != A[h].__e && A[h].__e == u.__d && (u.__d = d$1(i, h + 1)), L(A[h], A[h])); if (w)
        for (h = 0; h < w.length; h++)
            z(w[h], w[++h], w[++h]); }
    function g$1(n, l, u) { var i, t; for (i = 0; i < n.__k.length; i++)
        (t = n.__k[i]) && (t.__ = n, l = "function" == typeof t.type ? g$1(t, l, u) : x$1(u, t, t, n.__k, t.__e, l)); return l; }
    function x$1(n, l, u, i, t, o) { var r, f, e; if (void 0 !== l.__d)
        r = l.__d, l.__d = void 0;
    else if (null == u || t != o || null == t.parentNode)
        n: if (null == o || o.parentNode !== n)
            n.appendChild(t), r = null;
        else {
            for (f = o, e = 0; (f = f.nextSibling) && e < i.length; e += 2)
                if (f == t)
                    break n;
            n.insertBefore(t, o), r = o;
        } return void 0 !== r ? r : t.nextSibling; }
    function A(n, l, u, i, t) { var o; for (o in u)
        "children" === o || "key" === o || o in l || C(n, o, null, u[o], i); for (o in l)
        t && "function" != typeof l[o] || "children" === o || "key" === o || "value" === o || "checked" === o || u[o] === l[o] || C(n, o, l[o], u[o], i); }
    function P(n, l, u) { "-" === l[0] ? n.setProperty(l, u) : n[l] = null == u ? "" : "number" != typeof u || e$1.test(l) ? u : u + "px"; }
    function C(n, l, u, i, t) { var o; n: if ("style" === l)
        if ("string" == typeof u)
            n.style.cssText = u;
        else {
            if ("string" == typeof i && (n.style.cssText = i = ""), i)
                for (l in i)
                    u && l in u || P(n.style, l, "");
            if (u)
                for (l in u)
                    i && u[l] === i[l] || P(n.style, l, u[l]);
        }
    else if ("o" === l[0] && "n" === l[1])
        o = l !== (l = l.replace(/Capture$/, "")), l = l.toLowerCase() in n ? l.toLowerCase().slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + o] = u, u ? i || n.addEventListener(l, o ? H : $, o) : n.removeEventListener(l, o ? H : $, o);
    else if ("dangerouslySetInnerHTML" !== l) {
        if (t)
            l = l.replace(/xlink[H:h]/, "h").replace(/sName$/, "s");
        else if ("href" !== l && "list" !== l && "form" !== l && "tabIndex" !== l && "download" !== l && l in n)
            try {
                n[l] = null == u ? "" : u;
                break n;
            }
            catch (n) { }
        "function" == typeof u || (null != u && (!1 !== u || "a" === l[0] && "r" === l[1]) ? n.setAttribute(l, u) : n.removeAttribute(l));
    } }
    function $(l) { this.l[l.type + !1](n.event ? n.event(l) : l); }
    function H(l) { this.l[l.type + !0](n.event ? n.event(l) : l); }
    function I(l, u, i, t, o, r, f, e, s) { var a, v, h, d, _, k, b, g, w, x, A, P = u.type; if (void 0 !== u.constructor)
        return null; null != i.__h && (s = i.__h, e = u.__e = i.__e, u.__h = null, r = [e]), (a = n.__b) && a(u); try {
        n: if ("function" == typeof P) {
            if (g = u.props, w = (a = P.contextType) && t[a.__c], x = a ? w ? w.props.value : a.__ : t, i.__c ? b = (v = u.__c = i.__c).__ = v.__E : ("prototype" in P && P.prototype.render ? u.__c = v = new P(g, x) : (u.__c = v = new p$1(g, x), v.constructor = P, v.render = M), w && w.sub(v), v.props = g, v.state || (v.state = {}), v.context = x, v.__n = t, h = v.__d = !0, v.__h = []), null == v.__s && (v.__s = v.state), null != P.getDerivedStateFromProps && (v.__s == v.state && (v.__s = c$1({}, v.__s)), c$1(v.__s, P.getDerivedStateFromProps(g, v.__s))), d = v.props, _ = v.state, h)
                null == P.getDerivedStateFromProps && null != v.componentWillMount && v.componentWillMount(), null != v.componentDidMount && v.__h.push(v.componentDidMount);
            else {
                if (null == P.getDerivedStateFromProps && g !== d && null != v.componentWillReceiveProps && v.componentWillReceiveProps(g, x), !v.__e && null != v.shouldComponentUpdate && !1 === v.shouldComponentUpdate(g, v.__s, x) || u.__v === i.__v) {
                    v.props = g, v.state = v.__s, u.__v !== i.__v && (v.__d = !1), v.__v = u, u.__e = i.__e, u.__k = i.__k, u.__k.forEach(function (n) { n && (n.__ = u); }), v.__h.length && f.push(v);
                    break n;
                }
                null != v.componentWillUpdate && v.componentWillUpdate(g, v.__s, x), null != v.componentDidUpdate && v.__h.push(function () { v.componentDidUpdate(d, _, k); });
            }
            v.context = x, v.props = g, v.state = v.__s, (a = n.__r) && a(u), v.__d = !1, v.__v = u, v.__P = l, a = v.render(v.props, v.state, v.context), v.state = v.__s, null != v.getChildContext && (t = c$1(c$1({}, t), v.getChildContext())), h || null == v.getSnapshotBeforeUpdate || (k = v.getSnapshotBeforeUpdate(d, _)), A = null != a && a.type === y && null == a.key ? a.props.children : a, m$1(l, Array.isArray(A) ? A : [A], u, i, t, o, r, f, e, s), v.base = u.__e, u.__h = null, v.__h.length && f.push(v), b && (v.__E = v.__ = null), v.__e = !1;
        }
        else
            null == r && u.__v === i.__v ? (u.__k = i.__k, u.__e = i.__e) : u.__e = j$1(i.__e, u, i, t, o, r, f, s);
        (a = n.diffed) && a(u);
    }
    catch (l) {
        u.__v = null, (s || null != r) && (u.__e = e, u.__h = !!s, r[r.indexOf(e)] = null), n.__e(l, u, i);
    } }
    function T(l, u) { n.__c && n.__c(u, l), l.some(function (u) { try {
        l = u.__h, u.__h = [], l.some(function (n) { n.call(u); });
    }
    catch (l) {
        n.__e(l, u.__v);
    } }); }
    function j$1(n, l, u, i, t, o, e, c) { var a, v, h, y, p = u.props, d = l.props, _ = l.type, k = 0; if ("svg" === _ && (t = !0), null != o)
        for (; k < o.length; k++)
            if ((a = o[k]) && (a === n || (_ ? a.localName == _ : 3 == a.nodeType))) {
                n = a, o[k] = null;
                break;
            } if (null == n) {
        if (null === _)
            return document.createTextNode(d);
        n = t ? document.createElementNS("http://www.w3.org/2000/svg", _) : document.createElement(_, d.is && d), o = null, c = !1;
    } if (null === _)
        p === d || c && n.data === d || (n.data = d);
    else {
        if (o = o && f$1.slice.call(n.childNodes), v = (p = u.props || r$1).dangerouslySetInnerHTML, h = d.dangerouslySetInnerHTML, !c) {
            if (null != o)
                for (p = {}, y = 0; y < n.attributes.length; y++)
                    p[n.attributes[y].name] = n.attributes[y].value;
            (h || v) && (h && (v && h.__html == v.__html || h.__html === n.innerHTML) || (n.innerHTML = h && h.__html || ""));
        }
        if (A(n, d, p, t, c), h)
            l.__k = [];
        else if (k = l.props.children, m$1(n, Array.isArray(k) ? k : [k], l, u, i, t && "foreignObject" !== _, o, e, n.firstChild, c), null != o)
            for (k = o.length; k--;)
                null != o[k] && s$1(o[k]);
        c || ("value" in d && void 0 !== (k = d.value) && (k !== n.value || "progress" === _ && !k) && C(n, "value", k, p.value, !1), "checked" in d && void 0 !== (k = d.checked) && k !== n.checked && C(n, "checked", k, p.checked, !1));
    } return n; }
    function z(l, u, i) { try {
        "function" == typeof l ? l(u) : l.current = u;
    }
    catch (l) {
        n.__e(l, i);
    } }
    function L(l, u, i) { var t, o, r; if (n.unmount && n.unmount(l), (t = l.ref) && (t.current && t.current !== l.__e || z(t, null, u)), i || "function" == typeof l.type || (i = null != (o = l.__e)), l.__e = l.__d = void 0, null != (t = l.__c)) {
        if (t.componentWillUnmount)
            try {
                t.componentWillUnmount();
            }
            catch (l) {
                n.__e(l, u);
            }
        t.base = t.__P = null;
    } if (t = l.__k)
        for (r = 0; r < t.length; r++)
            t[r] && L(t[r], u, i); null != o && s$1(o); }
    function M(n, l, u) { return this.constructor(n, u); }
    function N(l, u, i) { var t, o, e; n.__ && n.__(l, u), o = (t = "function" == typeof i) ? null : i && i.__k || u.__k, e = [], I(u, l = (!t && i || u).__k = a$1(y, null, [l]), o || r$1, r$1, void 0 !== u.ownerSVGElement, !t && i ? [i] : o ? null : u.firstChild ? f$1.slice.call(u.childNodes) : null, e, !t && i ? i : o ? o.__e : u.firstChild, t), T(e, l); }
    n = { __e: function (n, l) { for (var u, i, t; l = l.__;)
            if ((u = l.__c) && !u.__)
                try {
                    if ((i = u.constructor) && null != i.getDerivedStateFromError && (u.setState(i.getDerivedStateFromError(n)), t = u.__d), null != u.componentDidCatch && (u.componentDidCatch(n), t = u.__d), t)
                        return u.__E = u;
                }
                catch (l) {
                    n = l;
                } throw n; }, __v: 0 }, p$1.prototype.setState = function (n, l) { var u; u = null != this.__s && this.__s !== this.state ? this.__s : this.__s = c$1({}, this.state), "function" == typeof n && (n = n(c$1({}, u), this.props)), n && c$1(u, n), null != n && this.__v && (l && this.__h.push(l), k$1(this)); }, p$1.prototype.forceUpdate = function (n) { this.__v && (this.__e = !0, n && this.__h.push(n), k$1(this)); }, p$1.prototype.render = y, u$1 = [], i$1 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, b$1.__r = 0, 0;
    var Styles = {
        Error: {
            color: "red",
        },
        Alert: {
            error: {
                color: "red"
            },
            warning: {
                color: "yellow"
            },
            info: {
                color: "black"
            }
        },
        Darken: {
            position: "fixed",
            top: 0,
            left: 0,
            opacity: 0.5,
            backgroundColor: "#000",
            width: "100vw",
            height: "100vh",
            zIndex: 150,
            webkitBackdropFilter: "blur(2px)",
            backdropFilter: "blur(2px)",
        },
        DialogOuter: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 150,
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
        },
        DialogInner: {
            position: "relative",
            color: "#222",
            backgroundColor: "#fff",
            padding: "30px",
            marginBottom: "2em",
            maxWidth: "90%",
            maxHeight: "90%",
            overflowY: "auto",
            border: "3px solid #3d3d5d",
            borderRadius: "8px",
            boxShadow: "0 0 80px 10px #666",
            width: "auto"
        },
        Input: {
            height: "35px",
            width: "17em",
            borderColor: "#ccf4",
            outline: "none",
            fontSize: "17pt",
            padding: "8px"
        }
    };
    function Dialog(_g) {
        var children = _g.children;
        return (a$1("div", null, a$1("div", { style: Styles.Darken }), a$1("div", { style: Styles.DialogOuter }, a$1("div", { style: Styles.DialogInner }, children))));
    }
    var t, u, r, o = 0, i = [], c = n.__b, f = n.__r, e = n.diffed, a = n.__c, v = n.unmount;
    function m(t, r) { n.__h && n.__h(u, t, o || r), o = 0; var i = u.__H || (u.__H = { __: [], __h: [] }); return t >= i.__.length && i.__.push({}), i.__[t]; }
    function l(n) { return o = 1, p(w, n); }
    function p(n, r, o) { var i = m(t++, 2); return i.t = n, i.__c || (i.__ = [o ? o(r) : w(void 0, r), function (n) { var t = i.t(i.__[0], n); i.__[0] !== t && (i.__ = [t, i.__[1]], i.__c.setState({})); }], i.__c = u), i.__; }
    function h(r, o) { var i = m(t++, 4); !n.__s && k(i.__H, o) && (i.__ = r, i.__H = o, u.__h.push(i)); }
    function s(n) { return o = 5, d(function () { return { current: n }; }, []); }
    function d(n, u) { var r = m(t++, 7); return k(r.__H, u) && (r.__ = n(), r.__H = u, r.__h = n), r.__; }
    function x() { i.forEach(function (t) { if (t.__P)
        try {
            t.__H.__h.forEach(g), t.__H.__h.forEach(j), t.__H.__h = [];
        }
        catch (u) {
            t.__H.__h = [], n.__e(u, t.__v);
        } }), i = []; }
    n.__b = function (n) { u = null, c && c(n); }, n.__r = function (n) { f && f(n), t = 0; var r = (u = n.__c).__H; r && (r.__h.forEach(g), r.__h.forEach(j), r.__h = []); }, n.diffed = function (t) { e && e(t); var o = t.__c; o && o.__H && o.__H.__h.length && (1 !== i.push(o) && r === n.requestAnimationFrame || ((r = n.requestAnimationFrame) || function (n) { var t, u = function () { clearTimeout(r), b && cancelAnimationFrame(t), setTimeout(n); }, r = setTimeout(u, 100); b && (t = requestAnimationFrame(u)); })(x)), u = void 0; }, n.__c = function (t, u) { u.some(function (t) { try {
        t.__h.forEach(g), t.__h = t.__h.filter(function (n) { return !n.__ || j(n); });
    }
    catch (r) {
        u.some(function (n) { n.__h && (n.__h = []); }), u = [], n.__e(r, t.__v);
    } }), a && a(t, u); }, n.unmount = function (t) { v && v(t); var u = t.__c; if (u && u.__H)
        try {
            u.__H.__.forEach(g);
        }
        catch (t) {
            n.__e(t, u.__v);
        } };
    var b = "function" == typeof requestAnimationFrame;
    function g(n) { var t = u; "function" == typeof n.__c && n.__c(), u = t; }
    function j(n) { var t = u; n.__c = n.__(), u = t; }
    function k(n, t) { return !n || n.length !== t.length || t.some(function (t, u) { return t !== n[u]; }); }
    function w(n, t) { return "function" == typeof t ? t(n) : t; }
    function resolveText(_g) {
        var message = _g.message; _g.messageCode; var messageParams = _g.messageParams;
        return message.replace(/\{\w+\}/ig, function (n) { return messageParams[n.substr(1, n.length - 2)]; });
    }
    function LoginDialog(_g) {
        var title = _g.title, alerts = _g.alerts, fields = _g.fields, onCancel = _g.onCancel, onSubmit = _g.onSubmit;
        var _h = l({}), params = _h[0], setParams = _h[1];
        var firstFieldRef = s();
        h(function () { var _a; return (_a = firstFieldRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, []);
        return (a$1(Dialog, null, a$1(y, null, a$1("h3", { style: Styles.WindowHeader }, title), alerts.map(function (alert) { return (a$1("p", { style: Styles.Alert[alert.type] }, resolveText(alert))); }), a$1("form", { onSubmit: function (ev) {
                ev.preventDefault();
                onSubmit(params);
            } }, Object.entries(fields).map(function (_g, idx) {
            var fieldName = _g[0], _h = _g[1], type = _h.type, label = _h.label, placeholder = _h.placeholder;
            return (a$1("label", { style: Styles.Label }, label ? label + ": " : '', a$1("input", { ref: idx === 0 ? firstFieldRef : undefined, type: type, name: fieldName, autoComplete: "on", style: Styles.Input, autoFocus: true, placeholder: placeholder, value: params[fieldName] || '', onInput: function (ev) {
                    var _g;
                    var _a;
                    return setParams(__assign(__assign({}, params), (_g = {}, _g[fieldName] = valueTransformer(type, (_a = ev.target) === null || _a === void 0 ? void 0 : _a['value']), _g)));
                } })));
        }))), a$1("div", { style: Styles.ButtonsDiv }, a$1("button", { type: "submit", style: Styles.Button, onClick: function () { return onSubmit(params); } }, "Submit"), a$1("button", { style: Styles.Button, onClick: onCancel }, "Cancel"))));
    }
    function valueTransformer(type, value) {
        switch (type) {
            case "email": return value.toLowerCase();
            case "otp": return value.toUpperCase();
            default: return value;
        }
    }
    var LoginGui = /** @class */ (function (_super_1) {
        __extends$1(LoginGui, _super_1);
        function LoginGui(props) {
            var _this_1 = _super_1.call(this, props) || this;
            _this_1.observer = function (userInteraction) { return _this_1.setState({ userInteraction: userInteraction }); };
            _this_1.state = { userInteraction: undefined };
            return _this_1;
        }
        LoginGui.prototype.componentDidMount = function () {
            this.subscription = rxjs.from(this.props.db.cloud.userInteraction).subscribe(this.observer);
        };
        LoginGui.prototype.componentWillUnmount = function () {
            if (this.subscription) {
                this.subscription.unsubscribe();
                delete this.subscription;
            }
        };
        LoginGui.prototype.render = function (props, _g) {
            var userInteraction = _g.userInteraction;
            if (!userInteraction)
                return null;
            //if (props.db.cloud.userInteraction.observers.length > 1) return null; // Someone else subscribes.
            return a$1(LoginDialog, Object.assign({}, userInteraction));
        };
        return LoginGui;
    }(p$1));
    function setupDefaultGUI(db) {
        var el = document.createElement('div');
        document.body.appendChild(el);
        N(a$1(LoginGui, { db: db.vip }), el);
        var closed = false;
        return {
            unsubscribe: function () {
                el.remove();
                closed = true;
            },
            get closed() {
                return closed;
            }
        };
    }
    // TODO:
    /*
        * Gjort klart allt kring user interaction förutom att mounta default-ui på ett element.
        * Också att kolla först om nån annan subscribar och i så fall inte göra nåt.
    */
    function dexieCloud(dexie) {
        var _this_1 = this;
        var origIdbName = dexie.name;
        //
        //
        //
        var currentUserEmitter = new rxjs.BehaviorSubject(UNAUTHORIZED_USER);
        var subscriptions = [];
        // local sync worker - used when there's no service worker.
        var localSyncWorker = null;
        dexie.on('ready', function (dexie) { return __awaiter(_this_1, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, onDbReady(dexie)];
                    case 1:
                        _g.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _g.sent();
                        console.error(error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, true // true = sticky
        );
        /** Void starting subscribers after a close has happened. */
        var closed = false;
        function throwIfClosed() {
            if (closed)
                throw new Dexie__default['default'].DatabaseClosedError();
        }
        dbOnClosed(dexie, function () {
            subscriptions.forEach(function (subscription) { return subscription.unsubscribe(); });
            closed = true;
            localSyncWorker && localSyncWorker.stop();
            localSyncWorker = null;
            currentUserEmitter.next(UNAUTHORIZED_USER);
        });
        dexie.cloud = {
            version: '1.0.0-beta.6',
            options: null,
            schema: null,
            serverState: null,
            get currentUserId() {
                return currentUserEmitter.value.userId || UNAUTHORIZED_USER.userId;
            },
            currentUser: currentUserEmitter,
            syncState: new rxjs.BehaviorSubject({ phase: 'initial' }),
            persistedSyncState: new rxjs.BehaviorSubject(undefined),
            userInteraction: new rxjs.BehaviorSubject(undefined),
            login: function (hint) {
                return __awaiter(this, void 0, void 0, function () {
                    var db;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                db = DexieCloudDB(dexie);
                                return [4 /*yield*/, db.cloud.sync()];
                            case 1:
                                _g.sent();
                                return [4 /*yield*/, login(db, hint)];
                            case 2:
                                _g.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            },
            configure: function (options) {
                dexie.cloud.options = options;
                if (options.databaseUrl) {
                    // @ts-ignore
                    dexie.name = origIdbName + "-" + getDbNameFromDbUrl(options.databaseUrl);
                    DexieCloudDB(dexie).reconfigure(); // Update observable from new dexie.name
                }
                updateSchemaFromOptions(dexie.cloud.schema, dexie.cloud.options);
            },
            sync: function (_g) {
                var _h = _g === void 0 ? { wait: true, force: false } : _g, wait = _h.wait, force = _h.force;
                return __awaiter(this, void 0, void 0, function () {
                    var db, syncState_1, newSyncState, syncState_2;
                    var _this_1 = this;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0:
                                if (wait === undefined)
                                    wait = true;
                                db = DexieCloudDB(dexie);
                                if (!force) return [3 /*break*/, 3];
                                syncState_1 = db.cloud.persistedSyncState.value;
                                triggerSync(db);
                                if (!wait) return [3 /*break*/, 2];
                                return [4 /*yield*/, db.cloud.persistedSyncState
                                        .pipe(filter(function (newSyncState) { return (newSyncState === null || newSyncState === void 0 ? void 0 : newSyncState.timestamp) != null &&
                                        (!syncState_1 || newSyncState.timestamp > syncState_1.timestamp); }), take(1))
                                        .toPromise()];
                            case 1:
                                newSyncState = _j.sent();
                                if (newSyncState === null || newSyncState === void 0 ? void 0 : newSyncState.error) {
                                    throw new Error("Sync error: " + newSyncState.error);
                                }
                                _j.label = 2;
                            case 2: return [3 /*break*/, 6];
                            case 3: return [4 /*yield*/, isSyncNeeded(db)];
                            case 4:
                                if (!_j.sent()) return [3 /*break*/, 6];
                                syncState_2 = db.cloud.persistedSyncState.value;
                                triggerSync(db);
                                if (!wait) return [3 /*break*/, 6];
                                console.debug('db.cloud.login() is waiting for sync completion...');
                                return [4 /*yield*/, rxjs.from(Dexie.liveQuery(function () { return __awaiter(_this_1, void 0, void 0, function () {
                                        var syncNeeded, newSyncState;
                                        return __generator(this, function (_g) {
                                            switch (_g.label) {
                                                case 0: return [4 /*yield*/, isSyncNeeded(db)];
                                                case 1:
                                                    syncNeeded = _g.sent();
                                                    return [4 /*yield*/, db.getPersistedSyncState()];
                                                case 2:
                                                    newSyncState = _g.sent();
                                                    if ((newSyncState === null || newSyncState === void 0 ? void 0 : newSyncState.timestamp) !== (syncState_2 === null || syncState_2 === void 0 ? void 0 : syncState_2.timestamp) &&
                                                        (newSyncState === null || newSyncState === void 0 ? void 0 : newSyncState.error))
                                                        throw new Error("Sync error: " + newSyncState.error);
                                                    return [2 /*return*/, syncNeeded];
                                            }
                                        });
                                    }); }))
                                        .pipe(filter(function (isNeeded) { return !isNeeded; }), take(1))
                                        .toPromise()];
                            case 5:
                                _j.sent();
                                console.debug('Done waiting for sync completion because we have nothing to push anymore');
                                _j.label = 6;
                            case 6: return [2 /*return*/];
                        }
                    });
                });
            },
        };
        dexie.Version.prototype['_parseStoresSpec'] = Dexie__default['default'].override(dexie.Version.prototype['_parseStoresSpec'], function (origFunc) { return overrideParseStoresSpec(origFunc, dexie); });
        dexie.use(createMutationTrackingMiddleware({
            currentUserObservable: dexie.cloud.currentUser,
            db: DexieCloudDB(dexie),
        }));
        dexie.use(createImplicitPropSetterMiddleware(DexieCloudDB(dexie)));
        dexie.use(createIdGenerationMiddleware(DexieCloudDB(dexie)));
        function onDbReady(dexie) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c, _d, _e, _f, db, swRegistrations, _g, initiallySynced;
                var _this_1 = this;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            closed = false; // As Dexie calls us, we are not closed anymore. Maybe reopened? Remember db.ready event is registered with sticky flag!
                            db = DexieCloudDB(dexie);
                            // Setup default GUI:
                            if (!IS_SERVICE_WORKER) {
                                if (!((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.customLoginGui)) {
                                    subscriptions.push(setupDefaultGUI(dexie));
                                }
                                subscriptions.push(db.syncStateChangedEvent.subscribe(dexie.cloud.syncState));
                            }
                            //verifyConfig(db.cloud.options); Not needed (yet at least!)
                            // Verify the user has allowed version increment.
                            if (!db.tables.every(function (table) { return table.core; })) {
                                throwVersionIncrementNeeded();
                            }
                            if (!('serviceWorker' in navigator)) return [3 /*break*/, 2];
                            return [4 /*yield*/, navigator.serviceWorker.getRegistrations()];
                        case 1:
                            _g = _h.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            _g = [];
                            _h.label = 3;
                        case 3:
                            swRegistrations = _g;
                            return [4 /*yield*/, db.transaction('rw', db.$syncState, function () { return __awaiter(_this_1, void 0, void 0, function () {
                                    var _a, _b, _g, options, schema, _h, persistedOptions, persistedSchema, persistedSyncState, newPersistedSchema, _j, _k, _l, table, tblSchema, newTblSchema;
                                    return __generator(this, function (_m) {
                                        switch (_m.label) {
                                            case 0:
                                                _g = db.cloud, options = _g.options, schema = _g.schema;
                                                return [4 /*yield*/, Promise.all([
                                                        db.getOptions(),
                                                        db.getSchema(),
                                                        db.getPersistedSyncState(),
                                                    ])];
                                            case 1:
                                                _h = _m.sent(), persistedOptions = _h[0], persistedSchema = _h[1], persistedSyncState = _h[2];
                                                if (!!options) return [3 /*break*/, 2];
                                                // Options not specified programatically (use case for SW!)
                                                // Take persisted options:
                                                db.cloud.options = persistedOptions || null;
                                                return [3 /*break*/, 4];
                                            case 2:
                                                if (!(!persistedOptions ||
                                                    JSON.stringify(persistedOptions) !== JSON.stringify(options))) return [3 /*break*/, 4];
                                                // Update persisted options:
                                                return [4 /*yield*/, db.$syncState.put(options, 'options')];
                                            case 3:
                                                // Update persisted options:
                                                _m.sent();
                                                _m.label = 4;
                                            case 4:
                                                if (((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.tryUseServiceWorker) &&
                                                    'serviceWorker' in navigator &&
                                                    swRegistrations.length > 0 &&
                                                    !DISABLE_SERVICEWORKER_STRATEGY) {
                                                    // * Configured for using service worker if available.
                                                    // * Browser supports service workers
                                                    // * There are at least one service worker registration
                                                    console.debug('Dexie Cloud Addon: Using service worker');
                                                    db.cloud.usingServiceWorker = true;
                                                }
                                                else {
                                                    // Not configured for using service worker or no service worker
                                                    // registration exists. Don't rely on service worker to do any job.
                                                    // Use LocalSyncWorker instead.
                                                    if (((_b = db.cloud.options) === null || _b === void 0 ? void 0 : _b.tryUseServiceWorker) && !IS_SERVICE_WORKER) {
                                                        console.debug('dexie-cloud-addon: Not using service worker.', swRegistrations.length === 0
                                                            ? 'No SW registrations found.'
                                                            : 'serviceWorker' in navigator && DISABLE_SERVICEWORKER_STRATEGY
                                                                ? "Avoiding SW background sync and SW periodic bg sync for this browser due to browser bugs."
                                                                : 'navigator.serviceWorker not present');
                                                    }
                                                    db.cloud.usingServiceWorker = false;
                                                }
                                                updateSchemaFromOptions(schema, db.cloud.options);
                                                updateSchemaFromOptions(persistedSchema, db.cloud.options);
                                                if (!!schema) return [3 /*break*/, 5];
                                                // Database opened dynamically (use case for SW!)
                                                // Take persisted schema:
                                                db.cloud.schema = persistedSchema || null;
                                                return [3 /*break*/, 7];
                                            case 5:
                                                if (!(!persistedSchema ||
                                                    JSON.stringify(persistedSchema) !== JSON.stringify(schema))) return [3 /*break*/, 7];
                                                newPersistedSchema = persistedSchema || {};
                                                for (_j = 0, _k = Object.entries(schema); _j < _k.length; _j++) {
                                                    _l = _k[_j], table = _l[0], tblSchema = _l[1];
                                                    newTblSchema = newPersistedSchema[table];
                                                    if (!newTblSchema) {
                                                        newPersistedSchema[table] = __assign({}, tblSchema);
                                                    }
                                                    else {
                                                        newTblSchema.markedForSync = tblSchema.markedForSync;
                                                        tblSchema.deleted = newTblSchema.deleted;
                                                        newTblSchema.generatedGlobalId = tblSchema.generatedGlobalId;
                                                    }
                                                }
                                                return [4 /*yield*/, db.$syncState.put(newPersistedSchema, 'schema')];
                                            case 6:
                                                _m.sent();
                                                // Make sure persisted table prefixes are being used instead of computed ones:
                                                // Let's assign all props as the newPersistedSchems should be what we should be working with.
                                                Object.assign(schema, newPersistedSchema);
                                                _m.label = 7;
                                            case 7: return [2 /*return*/, persistedSyncState === null || persistedSyncState === void 0 ? void 0 : persistedSyncState.initiallySynced];
                                        }
                                    });
                                }); })];
                        case 4:
                            initiallySynced = _h.sent();
                            if (initiallySynced) {
                                db.setInitiallySynced(true);
                            }
                            verifySchema(db);
                            if (!(((_b = db.cloud.options) === null || _b === void 0 ? void 0 : _b.databaseUrl) && !initiallySynced)) return [3 /*break*/, 6];
                            return [4 /*yield*/, performInitialSync(db, db.cloud.options, db.cloud.schema)];
                        case 5:
                            _h.sent();
                            db.setInitiallySynced(true);
                            _h.label = 6;
                        case 6:
                            // Manage CurrentUser observable:
                            throwIfClosed();
                            if (!IS_SERVICE_WORKER) {
                                subscriptions.push(Dexie.liveQuery(function () { return db.getCurrentUser(); }).subscribe(currentUserEmitter));
                                // Manage PersistendSyncState observable:
                                subscriptions.push(Dexie.liveQuery(function () { return db.getPersistedSyncState(); }).subscribe(db.cloud.persistedSyncState));
                            }
                            if (!((_c = db.cloud.options) === null || _c === void 0 ? void 0 : _c.requireAuth)) return [3 /*break*/, 8];
                            return [4 /*yield*/, login(db)];
                        case 7:
                            _h.sent();
                            _h.label = 8;
                        case 8:
                            if (localSyncWorker)
                                localSyncWorker.stop();
                            localSyncWorker = null;
                            throwIfClosed();
                            if (db.cloud.usingServiceWorker && ((_d = db.cloud.options) === null || _d === void 0 ? void 0 : _d.databaseUrl)) {
                                registerSyncEvent(db).catch(function () { });
                                registerPeriodicSyncEvent(db).catch(function () { });
                            }
                            else if (((_e = db.cloud.options) === null || _e === void 0 ? void 0 : _e.databaseUrl) &&
                                db.cloud.schema &&
                                !IS_SERVICE_WORKER) {
                                // There's no SW. Start SyncWorker instead.
                                localSyncWorker = LocalSyncWorker(db, db.cloud.options, db.cloud.schema);
                                localSyncWorker.start();
                            }
                            // Listen to online event and do sync.
                            throwIfClosed();
                            if (!IS_SERVICE_WORKER) {
                                subscriptions.push(rxjs.fromEvent(self, 'online').subscribe(function () {
                                    console.debug('online!');
                                    db.syncStateChangedEvent.next({
                                        phase: 'not-in-sync',
                                    });
                                    triggerSync(db);
                                }), rxjs.fromEvent(self, 'offline').subscribe(function () {
                                    console.debug('offline!');
                                    db.syncStateChangedEvent.next({
                                        phase: 'offline',
                                    });
                                }));
                            }
                            // Connect WebSocket only if we're a browser window
                            if (typeof window !== 'undefined' &&
                                !IS_SERVICE_WORKER &&
                                ((_f = db.cloud.options) === null || _f === void 0 ? void 0 : _f.databaseUrl)) {
                                subscriptions.push(connectWebSocket(db));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
    }
    dexieCloud.version = '1.0.0-beta.6';
    Dexie__default['default'].Cloud = dexieCloud;

    exports.default = dexieCloud;
    exports.dexieCloud = dexieCloud;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=dexie-cloud-addon.js.map
