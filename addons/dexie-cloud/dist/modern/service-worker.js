import Dexie, { liveQuery } from 'dexie';
import { Observable as Observable$1, BehaviorSubject, from as from$1, fromEvent, of as of$1, merge, Subscription as Subscription$1 } from 'rxjs';

const UNAUTHORIZED_USER = {
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

const swHolder = {};
const swContainer = self.document && navigator.serviceWorker; // self.document is to verify we're not the SW ourself
if (swContainer)
    swContainer.ready.then((registration) => (swHolder.registration = registration));
if (typeof self !== 'undefined' && 'clients' in self && !self.document) {
    // We are the service worker. Propagate messages to all our clients.
    addEventListener('message', (ev) => {
        var _a, _b;
        if ((_b = (_a = ev.data) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.startsWith('sw-broadcast-')) {
            [...self['clients'].matchAll({ includeUncontrolled: true })].forEach((client) => { var _a; return client.id !== ((_a = ev.source) === null || _a === void 0 ? void 0 : _a.id) && client.postMessage(ev.data); });
        }
    });
}
class SWBroadcastChannel {
    constructor(name) {
        this.name = name;
    }
    subscribe(listener) {
        if (!swContainer)
            return () => { };
        const forwarder = (ev) => {
            var _a;
            if (((_a = ev.data) === null || _a === void 0 ? void 0 : _a.type) === `sw-broadcast-${this.name}`) {
                listener(ev.data.message);
            }
        };
        swContainer.addEventListener('message', forwarder);
        return () => swContainer.removeEventListener('message', forwarder);
    }
    postMessage(message) {
        var _a;
        if (typeof self['clients'] === 'object') {
            // We're a service worker. Propagate to our browser clients.
            [...self['clients'].matchAll({ includeUncontrolled: true })].forEach((client) => client.postMessage({
                type: `sw-broadcast-${this.name}`,
                message
            }));
        }
        else if (swHolder.registration) {
            // We're a client (browser window or other worker)
            // Post to SW so it can repost to all its clients and to itself
            (_a = swHolder.registration.active) === null || _a === void 0 ? void 0 : _a.postMessage({
                type: `sw-broadcast-${this.name}`,
                message
            });
        }
    }
}

class BroadcastedAndLocalEvent extends Observable$1 {
    constructor(name) {
        const bc = typeof BroadcastChannel === "undefined"
            ? new SWBroadcastChannel(name) : new BroadcastChannel(name);
        super(subscriber => {
            function onCustomEvent(ev) {
                subscriber.next(ev.detail);
            }
            function onMessageEvent(ev) {
                console.debug("BroadcastedAndLocalEvent: onMessageEvent", ev);
                subscriber.next(ev.data);
            }
            let unsubscribe;
            self.addEventListener(`lbc-${name}`, onCustomEvent);
            if (bc instanceof SWBroadcastChannel) {
                unsubscribe = bc.subscribe(message => subscriber.next(message));
            }
            else {
                console.debug("BroadcastedAndLocalEvent: bc.addEventListener()", name, "bc is a", bc);
                bc.addEventListener("message", onMessageEvent);
            }
            return () => {
                self.removeEventListener(`lbc-${name}`, onCustomEvent);
                if (bc instanceof SWBroadcastChannel) {
                    unsubscribe();
                }
                else {
                    bc.removeEventListener("message", onMessageEvent);
                }
            };
        });
        this.name = name;
        this.bc = bc;
    }
    next(message) {
        console.debug("BroadcastedAndLocalEvent: bc.postMessage()", { ...message }, "bc is a", this.bc);
        this.bc.postMessage(message);
        const ev = new CustomEvent(`lbc-${this.name}`, { detail: message });
        self.dispatchEvent(ev);
    }
}

const wm$1 = new WeakMap();
const DEXIE_CLOUD_SCHEMA = {
    realms: '@realmId',
    members: '@id',
    roles: '[realmId+name]',
    $jobs: '',
    $syncState: '',
    $baseRevs: '[tableName+clientRev]',
    $logins: 'claims.sub, lastLogin',
};
let static_counter = 0;
function DexieCloudDB(dx) {
    if ('vip' in dx)
        dx = dx['vip']; // Avoid race condition. Always map to a vipped dexie that don't block during db.on.ready().
    let db = wm$1.get(dx.cloud);
    if (!db) {
        const localSyncEvent = new BehaviorSubject({});
        let syncStateChangedEvent = new BroadcastedAndLocalEvent(`syncstatechanged-${dx.name}`);
        localSyncEvent['id'] = ++static_counter;
        let initiallySynced = false;
        db = {
            get name() {
                return dx.name;
            },
            close() {
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
                return initiallySynced;
            },
            localSyncEvent,
            get syncStateChangedEvent() {
                return syncStateChangedEvent;
            },
            dx,
        };
        const helperMethods = {
            getCurrentUser() {
                return db.$logins
                    .toArray()
                    .then((logins) => logins.find((l) => l.isLoggedIn) || UNAUTHORIZED_USER);
            },
            getPersistedSyncState() {
                return db.$syncState.get('syncState');
            },
            getSchema() {
                return db.$syncState.get('schema');
            },
            getOptions() {
                return db.$syncState.get('options');
            },
            setInitiallySynced(value) {
                initiallySynced = value;
            },
            reconfigure() {
                syncStateChangedEvent = new BroadcastedAndLocalEvent(`syncstatechanged-${dx.name}`);
            }
        };
        Object.assign(db, helperMethods);
        wm$1.set(dx.cloud, db);
    }
    return db;
}

//@ts-check
const randomFillSync = crypto.getRandomValues;

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
const randomString$1 = typeof self === 'undefined' ? (bytes) => {
    // Node
    const buf = Buffer.alloc(bytes);
    randomFillSync(buf);
    return buf.toString("base64");
} : (bytes) => {
    // Web
    const buf = new Uint8Array(bytes);
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
    if (Array.isArray(id) && id.some(key => isValidSyncableID(key)) && id.every(isValidSyncableIDPart))
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
    const tbl = target[table] || (target[table] = {});
    switch (op.type) {
        case "insert":
        // TODO: Don't treat insert and upsert the same?
        case "upsert":
            op.keys.forEach((key, idx) => {
                tbl[key] = {
                    type: "ups",
                    val: op.values[idx],
                };
            });
            break;
        case "update":
        case "modify": {
            op.keys.forEach((key, idx) => {
                const changeSpec = op.type === "update"
                    ? op.changeSpecs[idx]
                    : op.changeSpec;
                const entry = tbl[key];
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
                            for (const [propPath, value] of Object.entries(changeSpec)) {
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
            op.keys.forEach((key) => {
                tbl[key] = {
                    type: "del",
                };
            });
            break;
    }
    return target;
}

function applyOperations(target, ops) {
    for (const { table, muts } of ops) {
        for (const mut of muts) {
            applyOperation(target, table, mut);
        }
    }
}

function subtractChanges(target, // Server change set
changesToSubtract // additional mutations on client during syncWithServer()
) {
    var _a, _b, _c;
    for (const [table, mutationSet] of Object.entries(changesToSubtract)) {
        for (const [key, mut] of Object.entries(mutationSet)) {
            switch (mut.type) {
                case 'ups':
                    {
                        const targetMut = (_a = target[table]) === null || _a === void 0 ? void 0 : _a[key];
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
                    const targetMut = (_c = target[table]) === null || _c === void 0 ? void 0 : _c[key];
                    if (targetMut) {
                        switch (targetMut.type) {
                            case 'ups':
                                // Adjust the server upsert with locally updated values.
                                for (const [propPath, value] of Object.entries(mut.mod)) {
                                    setByKeyPath(targetMut.val, propPath, value);
                                }
                                break;
                            case 'del':
                                // Leave delete.
                                break;
                            case 'upd':
                                // Remove the local update props from the server update mutation.
                                for (const propPath of Object.keys(mut.mod)) {
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
    const txid = randomString$1(16);
    // Convert data into a temporary map to collect mutations of same table and type
    const map = {};
    for (const [table, ops] of Object.entries(inSet)) {
        for (const [key, op] of Object.entries(ops)) {
            const mapEntry = map[table] || (map[table] = {});
            const ops = mapEntry[op.type] || (mapEntry[op.type] = []);
            ops.push(Object.assign({ key }, op)); // DBKeyMutation doesn't contain key, so we need to bring it in.
        }
    }
    // Start computing the resulting format:
    const result = [];
    for (const [table, ops] of Object.entries(map)) {
        const resultEntry = {
            table,
            muts: [],
        };
        for (const [optype, muts] of Object.entries(ops)) {
            switch (optype) {
                case "ups": {
                    const op = {
                        type: "upsert",
                        keys: muts.map(mut => mut.key),
                        values: muts.map(mut => mut.val),
                        txid
                    };
                    resultEntry.muts.push(op);
                    break;
                }
                case "upd": {
                    const op = {
                        type: "update",
                        keys: muts.map(mut => mut.key),
                        changeSpecs: muts.map(mut => mut.mod),
                        txid
                    };
                    resultEntry.muts.push(op);
                    break;
                }
                case "del": {
                    const op = {
                        type: "delete",
                        keys: muts.map(mut => mut.key),
                        txid,
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
    const url = new URL(dbUrl);
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

const b64decode = typeof Buffer !== "undefined"
    ? (base64) => Buffer.from(base64, "base64")
    : (base64) => {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    };
const b64encode = typeof Buffer !== "undefined"
    ? (b) => ArrayBuffer.isView(b)
        ? Buffer.from(b.buffer, b.byteOffset, b.byteLength).toString("base64")
        : Buffer.from(b).toString("base64")
    : (b) => btoa(String.fromCharCode.apply(null, b));

function interactWithUser(userInteraction, req) {
    return new Promise((resolve, reject) => {
        const interactionProps = {
            ...req,
            onSubmit: (res) => {
                userInteraction.next(undefined);
                resolve(res);
            },
            onCancel: () => {
                userInteraction.next(undefined);
                reject(new Dexie.AbortError("User cancelled"));
            },
        };
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
function alertUser(userInteraction, title, ...alerts) {
    return interactWithUser(userInteraction, {
        type: 'message-alert',
        title,
        alerts,
        fields: {}
    });
}
async function promptForEmail(userInteraction, title, emailHint) {
    let email = emailHint || '';
    while (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,10}$/.test(email)) {
        email = (await interactWithUser(userInteraction, {
            type: 'email',
            title,
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
        })).email;
    }
    return email;
}
async function promptForOTP(userInteraction, email, alert) {
    const alerts = [
        {
            type: 'info',
            messageCode: 'OTP_SENT',
            message: `A One-Time password has been sent to {email}`,
            messageParams: { email },
        },
    ];
    if (alert) {
        alerts.push(alert);
    }
    const { otp } = await interactWithUser(userInteraction, {
        type: 'otp',
        title: 'Enter OTP',
        alerts,
        fields: {
            otp: {
                type: 'otp',
                label: 'OTP',
                placeholder: 'Paste OTP here',
            },
        },
    });
    return otp;
}

async function loadAccessToken(db) {
    var _a, _b;
    const currentUser = await db.getCurrentUser();
    const { accessToken, accessTokenExpiration, refreshToken, refreshTokenExpiration, claims, } = currentUser;
    if (!accessToken)
        return;
    const expTime = (_a = accessTokenExpiration === null || accessTokenExpiration === void 0 ? void 0 : accessTokenExpiration.getTime()) !== null && _a !== void 0 ? _a : Infinity;
    if (expTime > Date.now()) {
        return accessToken;
    }
    if (!refreshToken) {
        throw new Error(`Refresh token missing`);
    }
    const refreshExpTime = (_b = refreshTokenExpiration === null || refreshTokenExpiration === void 0 ? void 0 : refreshTokenExpiration.getTime()) !== null && _b !== void 0 ? _b : Infinity;
    if (refreshExpTime <= Date.now()) {
        throw new Error(`Refresh token has expired`);
    }
    const refreshedLogin = await refreshAccessToken(db.cloud.options.databaseUrl, currentUser);
    await db.table('$logins').update(claims.sub, {
        accessToken: refreshedLogin.accessToken,
        accessTokenExpiration: refreshedLogin.accessTokenExpiration,
    });
    return refreshedLogin.accessToken;
}
async function authenticate(url, context, fetchToken, userInteraction, hints) {
    if (context.accessToken &&
        context.accessTokenExpiration.getTime() > Date.now()) {
        return context;
    }
    else if (context.refreshToken &&
        (!context.refreshTokenExpiration ||
            context.refreshTokenExpiration.getTime() > Date.now())) {
        return await refreshAccessToken(url, context);
    }
    else {
        return await userAuthenticate(context, fetchToken, userInteraction, hints);
    }
}
async function refreshAccessToken(url, login) {
    if (!login.refreshToken)
        throw new Error(`Cannot refresh token - refresh token is missing.`);
    if (!login.nonExportablePrivateKey)
        throw new Error(`login.nonExportablePrivateKey is missing - cannot sign refresh token without a private key.`);
    const time_stamp = Date.now();
    const signing_algorithm = 'RSASSA-PKCS1-v1_5';
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(login.refreshToken + time_stamp);
    const binarySignature = await crypto.subtle.sign(signing_algorithm, login.nonExportablePrivateKey, data);
    const signature = b64encode(binarySignature);
    const tokenRequest = {
        grant_type: 'refresh_token',
        refresh_token: login.refreshToken,
        scopes: ['ACCESS_DB'],
        signature,
        signing_algorithm,
        time_stamp,
    };
    const res = await fetch(`${url}/token`, {
        body: JSON.stringify(tokenRequest),
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
    });
    if (res.status !== 200)
        throw new Error(`RefreshToken: Status ${res.status} from ${url}/token`);
    const response = await res.json();
    login.accessToken = response.accessToken;
    login.accessTokenExpiration = response.accessTokenExpiration
        ? new Date(response.accessTokenExpiration)
        : undefined;
    return login;
}
async function userAuthenticate(context, fetchToken, userInteraction, hints) {
    const { privateKey, publicKey } = await crypto.subtle.generateKey({
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: 'SHA-256' },
    }, false, // Non-exportable...
    ['sign', 'verify']);
    context.nonExportablePrivateKey = privateKey; //...but storable!
    const publicKeySPKI = await crypto.subtle.exportKey('spki', publicKey);
    const publicKeyPEM = spkiToPEM(publicKeySPKI);
    context.publicKey = publicKey;
    try {
        const response2 = await fetchToken({
            public_key: publicKeyPEM,
            hints,
        });
        if (response2.type !== 'tokens')
            throw new Error(`Unexpected response type from token endpoint: ${response2.type}`);
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
        if (response2.alerts && response2.alerts.length > 0) {
            await interactWithUser(userInteraction, {
                type: 'message-alert',
                title: 'Authentication Alert',
                fields: {},
                alerts: response2.alerts,
            });
        }
        return context;
    }
    catch (error) {
        await alertUser(userInteraction, 'Authentication Failed', {
            type: 'error',
            messageCode: 'GENERIC_ERROR',
            message: `We're having a problem to authenticate rigth now.`,
            messageParams: {}
        }).catch(() => { });
        throw error;
    }
}
function spkiToPEM(keydata) {
    const keydataB64 = b64encode(keydata);
    const keydataB64Pem = formatAsPem(keydataB64);
    return keydataB64Pem;
}
function formatAsPem(str) {
    let finalString = '-----BEGIN PUBLIC KEY-----\n';
    while (str.length > 0) {
        finalString += str.substring(0, 64) + '\n';
        str = str.substring(64);
    }
    finalString = finalString + '-----END PUBLIC KEY-----';
    return finalString;
}

// Emulate true-private property db. Why? So it's not stored in DB.
const wm = new WeakMap();
class AuthPersistedContext {
    constructor(db, userLogin) {
        wm.set(this, db);
        Object.assign(this, userLogin);
    }
    static load(db, userId) {
        return db
            .table("$logins")
            .get(userId)
            .then((userLogin) => new AuthPersistedContext(db, userLogin || {
            userId,
            claims: {
                sub: userId
            },
            lastLogin: new Date(0)
        }));
    }
    async save() {
        const db = wm.get(this);
        db.table("$logins").put(this);
    }
}

class HttpError extends Error {
    constructor(res, message) {
        super(message || `${res.status} ${res.statusText}`);
        this.httpStatus = res.status;
    }
    get name() {
        return "HttpError";
    }
}

function otpFetchTokenCallback(db) {
    const { userInteraction } = db.cloud;
    return async function otpAuthenticate({ public_key, hints }) {
        var _a;
        let tokenRequest;
        const url = (_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.databaseUrl;
        if (!url)
            throw new Error(`No database URL given.`);
        if ((hints === null || hints === void 0 ? void 0 : hints.grant_type) === 'demo') {
            const demo_user = await promptForEmail(userInteraction, 'Enter a demo user email', (hints === null || hints === void 0 ? void 0 : hints.email) || (hints === null || hints === void 0 ? void 0 : hints.userId));
            tokenRequest = {
                demo_user,
                grant_type: 'demo',
                scopes: ['ACCESS_DB'],
                public_key,
            };
        }
        else {
            const email = await promptForEmail(userInteraction, 'Enter email address', hints === null || hints === void 0 ? void 0 : hints.email);
            tokenRequest = {
                email,
                grant_type: 'otp',
                scopes: ['ACCESS_DB'],
                public_key,
            };
        }
        const res1 = await fetch(`${url}/token`, {
            body: JSON.stringify(tokenRequest),
            method: 'post',
            headers: { 'Content-Type': 'application/json', mode: 'cors' },
        });
        if (res1.status !== 200) {
            const errMsg = await res1.text();
            await alertUser(userInteraction, "Token request failed", {
                type: 'error',
                messageCode: 'GENERIC_ERROR',
                message: errMsg,
                messageParams: {}
            }).catch(() => { });
            throw new HttpError(res1, errMsg);
        }
        const response = await res1.json();
        if (response.type === 'tokens') {
            // Demo user request can get a "tokens" response right away
            return response;
        }
        else if (tokenRequest.grant_type === 'otp') {
            if (response.type !== 'otp-sent')
                throw new Error(`Unexpected response from ${url}/token`);
            const otp = await promptForOTP(userInteraction, tokenRequest.email);
            tokenRequest.otp = otp || '';
            tokenRequest.otp_id = response.otp_id;
            let res2 = await fetch(`${url}/token`, {
                body: JSON.stringify(tokenRequest),
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors',
            });
            while (res2.status === 401) {
                const errorText = await res2.text();
                tokenRequest.otp = await promptForOTP(userInteraction, tokenRequest.email, {
                    type: 'error',
                    messageCode: 'INVALID_OTP',
                    message: errorText,
                    messageParams: {}
                });
                res2 = await fetch(`${url}/token`, {
                    body: JSON.stringify(tokenRequest),
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
            }
            if (res2.status !== 200) {
                const errMsg = await res2.text();
                await alertUser(userInteraction, "OTP Authentication Failed", {
                    type: 'error',
                    messageCode: 'GENERIC_ERROR',
                    message: errMsg,
                    messageParams: {}
                }).catch(() => { });
                throw new HttpError(res2, errMsg);
            }
            const response2 = await res2.json();
            return response2;
        }
        else {
            throw new Error(`Unexpected response from ${url}/token`);
        }
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
async function setCurrentUser(db, user) {
    if (user.userId === db.cloud.currentUserId)
        return; // Already this user.
    const $logins = db.table('$logins');
    await db.transaction('rw', $logins, async (tx) => {
        const existingLogins = await $logins.toArray();
        await Promise.all(existingLogins.filter(login => login.userId !== user.userId && login.isLoggedIn).map(login => {
            login.isLoggedIn = false;
            return $logins.put(login);
        }));
        user.isLoggedIn = true;
        user.lastLogin = new Date();
        await user.save();
        console.debug("Saved new user", user.email);
    });
    await new Promise(resolve => {
        if (db.cloud.currentUserId === user.userId) {
            resolve(null);
        }
        else {
            const subscription = db.cloud.currentUser.subscribe(currentUser => {
                if (currentUser.userId === user.userId) {
                    subscription.unsubscribe();
                    resolve(null);
                }
            });
        }
    });
    // TANKAR!!!!
    // V: Service workern kommer inte ha tillgång till currentUserObservable om den inte istället härrör från ett liveQuery.
    // V: Samma med andra windows.
    // V: Så kanske göra om den till att häröra från liveQuery som läser $logins.orderBy('lastLogin').last().
    // V: Då bara vara medveten om:
    //    V: En sån observable börjar hämta data vid första subscribe
    //    V: Vi har inget "inital value" men kan emulera det till att vara ANONYMOUS_USER
    //    V: Om requireAuth är true, så borde db.on(ready) hålla databasen stängd för alla utom denna observable.
    //    V: Om inte så behöver den inte blocka.
    // Andra tankar:
    //    * Man kan inte byta användare när man är offline. Skulle gå att flytta realms till undanstuff-tabell vid user-change.
    //      men troligen inte värt det.
    //    * Istället: sälj inte inte switch-user funktionalitet utan tala enbart om inloggat vs icke inloggat läge.
    //    * populate $logins med ANONYMOUS så att en påbörjad inloggning inte räknas, alternativt ha en boolean prop!
    //      Kanske bäst ha en boolean prop!
    //    * Alternativ switch-user funktionalitet:
    //      * DBCore gömmer data från realms man inte har tillgång till.
    //      * Cursor impl behövs också då.
    //      * Då blir det snabba user switch.
    //      * claims-settet som skickas till servern blir summan av alla claims. Då måste servern stödja multipla tokens eller
    //        att ens token är ett samlad.
}

async function login(db, hints) {
    const currentUser = await db.getCurrentUser();
    if (currentUser.isLoggedIn) {
        if (hints) {
            if (hints.email && db.cloud.currentUser.value.email !== hints.email) {
                throw new Error(`Must logout before changing user`);
            }
            if (hints.userId && db.cloud.currentUserId !== hints.userId) {
                throw new Error(`Must logout before changing user`);
            }
        }
        // Already authenticated according to given hints.
        return;
    }
    const context = new AuthPersistedContext(db, {
        claims: {},
        lastLogin: new Date(0),
    });
    await authenticate(db.cloud.options.databaseUrl, context, db.cloud.options.fetchTokens || otpFetchTokenCallback(db), db.cloud.userInteraction, hints);
    await context.save();
    await setCurrentUser(db, context);
}

// @ts-ignore
const isFirefox = typeof InstallTrigger !== 'undefined';

const isSafari = typeof navigator !== 'undefined' &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrom(e|ium)\/|Edge\//.test(navigator.userAgent);
const safariVersion = isSafari
    ? // @ts-ignore
        [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1]
    : NaN;

// What we know: Safari 14.1 (version 605) crashes when using dexie-cloud's service worker.
// We don't know what exact call is causing this. Have tried safari-14-idb-fix with no luck.
// Something we do in the service worker is triggering the crash.
// When next Safari version (606) is out we will start enabling SW again, hoping that the bug is solved.
// If not, we might increment 605 to 606.
const DISABLE_SERVICEWORKER_STRATEGY = (isSafari && safariVersion <= 605) || // Disable for Safari for now.
    isFirefox; // Disable for Firefox for now. Seems to have a bug in reading CryptoKeys from IDB from service workers

/* Helper function to subscribe to database close no matter if it was unexpectedly closed or manually using db.close()
 */
function dbOnClosed(db, handler) {
    db.on.close.subscribe(handler);
    const origClose = db.close;
    db.close = function () {
        origClose.call(this);
        handler();
    };
    return () => {
        db.on.close.unsubscribe(handler);
        db.close = origClose;
    };
}

const IS_SERVICE_WORKER = typeof self !== "undefined" && "clients" in self && !self.document;

function throwVersionIncrementNeeded() {
    throw new Dexie.SchemaError(`Version increment needed to allow dexie-cloud change tracking`);
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
const DECODE_TABLE = {
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
const ENCODE_TABLE = {};
for (const c of Object.keys(DECODE_TABLE)) {
    ENCODE_TABLE[DECODE_TABLE[c]] = c;
}

const { toString } = {};
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
const consonants = /b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|x|y|z/i;
function isUpperCase(ch) {
    return ch >= 'A' && ch <= 'Z';
}
function generateTablePrefix(tableName, allPrefixes) {
    let rv = tableName[0].toLocaleLowerCase(); // "users" = "usr", "friends" = "frn", "realms" = "rlm", etc.
    for (let i = 1, l = tableName.length; i < l && rv.length < 3; ++i) {
        if (consonants.test(tableName[i]) || isUpperCase(tableName[i]))
            rv += tableName[i].toLowerCase();
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
        let bitFix = 1;
        let upperFixed = rv;
        while (allPrefixes.has(upperFixed) && bitFix < 8) {
            upperFixed = applyToUpperBitFix(rv, bitFix);
            ++bitFix;
        }
        if (bitFix < 8)
            rv = upperFixed;
        else {
            let nextChar = (rv.charCodeAt(2) + 1) & 127;
            rv = rv.substr(0, 2) + String.fromCharCode(nextChar);
            // Here, in theory we could get an infinite loop if having 127*8 table names with identical 3 first consonants.
        }
    }
    return rv;
}
let time = 0;
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
    const a = new Uint8Array(18);
    const timePart = new Uint8Array(a.buffer, 0, 6);
    const now = Date.now(); // Will fit into 6 bytes until year 10 895.
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
    const randomPart = new Uint8Array(a.buffer, 6);
    crypto.getRandomValues(randomPart);
    const id = new Uint8Array(a.buffer);
    return prefix + b64LexEncode(id) + (shardKey || '');
}
function createIdGenerationMiddleware(db) {
    return {
        stack: 'dbcore',
        name: 'idGenerationMiddleware',
        level: 1,
        create: (core) => {
            return {
                ...core,
                table: (tableName) => {
                    const table = core.table(tableName);
                    function generateOrVerifyAtKeys(req, idPrefix) {
                        let valueClones = null;
                        const keys = getEffectiveKeys(table.schema.primaryKey, req);
                        keys.forEach((key, idx) => {
                            if (key === undefined) {
                                // Generate the key
                                const colocatedId = req.values[idx].realmId || db.cloud.currentUserId;
                                const shardKey = colocatedId.substr(colocatedId.length - 3);
                                keys[idx] = generateKey(idPrefix, shardKey);
                                if (!table.schema.primaryKey.outbound) {
                                    if (!valueClones)
                                        valueClones = req.values.slice();
                                    valueClones[idx] = Dexie.deepClone(valueClones[idx]);
                                    Dexie.setByKeyPath(valueClones[idx], table.schema.primaryKey.keyPath, // TODO: fix typings in dexie-constructor.d.ts!
                                    keys[idx]);
                                }
                            }
                            else if (typeof key !== 'string' ||
                                !key.startsWith(idPrefix)) {
                                // Key was specified by caller. Verify it complies with id prefix.
                                throw new Dexie.ConstraintError(`The ID "${key}" is not valid for table "${tableName}". ` +
                                    `Primary '@' keys requires the key to be prefixed with "${idPrefix}.\n"` +
                                    `If you want to generate IDs programmatically, remove '@' from the schema to get rid of this constraint. Dexie Cloud supports custom IDs as long as they are random and globally unique.`);
                            }
                        });
                        return table.mutate({
                            ...req,
                            keys,
                            values: valueClones || req.values
                        });
                    }
                    return {
                        ...table,
                        mutate: (req) => {
                            var _a, _b;
                            // @ts-ignore
                            if (req.trans.disableChangeTracking) {
                                // Disable ID policy checks and ID generation
                                return table.mutate(req);
                            }
                            if (req.type === 'add' || req.type === 'put') {
                                const cloudTableSchema = (_a = db.cloud.schema) === null || _a === void 0 ? void 0 : _a[tableName];
                                if (!(cloudTableSchema === null || cloudTableSchema === void 0 ? void 0 : cloudTableSchema.generatedGlobalId)) {
                                    if (cloudTableSchema === null || cloudTableSchema === void 0 ? void 0 : cloudTableSchema.markedForSync) {
                                        // Just make sure primary key is of a supported type:
                                        const keys = getEffectiveKeys(table.schema.primaryKey, req);
                                        keys.forEach((key, idx) => {
                                            if (!isValidSyncableID(key)) {
                                                const type = Array.isArray(key) ? key.map(toStringTag).join(',') : toStringTag(key);
                                                throw new Dexie.ConstraintError(`Invalid primary key type ${type} for table ${tableName}. Tables marked for sync has primary keys of type string or Array of string (and optional numbers)`);
                                            }
                                        });
                                    }
                                }
                                else {
                                    if (((_b = db.cloud.options) === null || _b === void 0 ? void 0 : _b.databaseUrl) && !db.initiallySynced) {
                                        // A database URL is configured but no initial sync has been performed.
                                        const keys = getEffectiveKeys(table.schema.primaryKey, req);
                                        // Check if the operation would yield any INSERT. If so, complain! We never want wrong ID prefixes stored.
                                        return table.getMany({ keys, trans: req.trans, cache: "immutable" }).then(results => {
                                            if (results.length < keys.length) {
                                                // At least one of the given objects would be created. Complain since
                                                // the generated ID would be based on a locally computed ID prefix only - we wouldn't
                                                // know if the server would give the same ID prefix until an initial sync has been
                                                // performed.
                                                throw new Error(`Unable to create new objects without an initial sync having been performed.`);
                                            }
                                            return table.mutate(req);
                                        });
                                    }
                                    return generateOrVerifyAtKeys(req, cloudTableSchema.idPrefix);
                                }
                            }
                            return table.mutate(req);
                        }
                    };
                }
            };
        }
    };
}

function createImplicitPropSetterMiddleware(db) {
    return {
        stack: 'dbcore',
        name: 'implicitPropSetterMiddleware',
        level: 1,
        create: (core) => {
            return {
                ...core,
                table: (tableName) => {
                    const table = core.table(tableName);
                    return {
                        ...table,
                        mutate: (req) => {
                            var _a, _b, _c;
                            const trans = req.trans;
                            if (((_b = (_a = db.cloud.schema) === null || _a === void 0 ? void 0 : _a[tableName]) === null || _b === void 0 ? void 0 : _b.markedForSync) &&
                                ((_c = trans.currentUser) === null || _c === void 0 ? void 0 : _c.isLoggedIn)) {
                                if (req.type === 'add' || req.type === 'put') {
                                    // If user is logged in, make sure "owner" and "realmId" props are set properly.
                                    // If not logged in, this will be set upon syncification of the tables (next sync after login)
                                    for (const obj of req.values) {
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
                        }
                    };
                }
            };
        }
    };
}

function getMutationTable(tableName) {
    return `$${tableName}_mutations`;
}

function randomString(bytes) {
    const buf = new Uint8Array(bytes);
    crypto.getRandomValues(buf);
    return btoa(String.fromCharCode.apply(null, buf));
}

function allSettled(possiblePromises) {
    return new Promise(resolve => {
        if (possiblePromises.length === 0)
            resolve([]);
        let remaining = possiblePromises.length;
        const results = new Array(remaining);
        possiblePromises.forEach((p, i) => Promise.resolve(p).then(value => results[i] = { status: "fulfilled", value }, reason => results[i] = { status: "rejected", reason })
            .then(() => --remaining || resolve(results)));
    });
}

let counter$1 = 0;
function guardedTable(table) {
    const prop = "$lock" + (++counter$1);
    return {
        ...table,
        count: readLock(table.count, prop),
        get: readLock(table.get, prop),
        getMany: readLock(table.getMany, prop),
        openCursor: readLock(table.openCursor, prop),
        query: readLock(table.query, prop),
        mutate: writeLock(table.mutate, prop),
    };
}
function readLock(fn, prop) {
    return function readLocker(req) {
        const { readers, writers, } = req.trans[prop] || (req.trans[prop] = { writers: [], readers: [] });
        const numWriters = writers.length;
        const promise = (numWriters > 0
            ? writers[numWriters - 1].then(() => fn(req), () => fn(req))
            : fn(req)).finally(() => readers.splice(readers.indexOf(promise)));
        readers.push(promise);
        return promise;
    };
}
function writeLock(fn, prop) {
    return function writeLocker(req) {
        const { readers, writers, } = req.trans[prop] || (req.trans[prop] = { writers: [], readers: [] });
        let promise = (writers.length > 0
            ? writers[writers.length - 1].then(() => fn(req), () => fn(req))
            : readers.length > 0
                ? allSettled(readers).then(() => fn(req))
                : fn(req)).finally(() => writers.shift());
        writers.push(promise);
        return promise;
    };
}

//const hasSW = 'serviceWorker' in navigator;
let hasComplainedAboutSyncEvent = false;
async function registerSyncEvent(db) {
    try {
        // Send sync event to SW:
        const sw = await navigator.serviceWorker.ready;
        if (sw.sync) {
            await sw.sync.register(`dexie-cloud:${db.name}`);
        }
        else if (sw.active) {
            // Fallback to postMessage (Firefox, Safari):
            sw.active.postMessage({
                type: 'dexie-cloud-sync',
                dbName: db.name
            });
        }
        else {
            console.error(`Dexie Cloud: There's no active service worker. Can this ever happen??`);
        }
        return;
    }
    catch (e) {
        if (!hasComplainedAboutSyncEvent) {
            console.debug(`Dexie Cloud: Could not register sync event`, e);
            hasComplainedAboutSyncEvent = true;
        }
    }
}
async function registerPeriodicSyncEvent(db) {
    var _a;
    try {
        // Register periodicSync event to SW:
        // @ts-ignore
        const { periodicSync } = await navigator.serviceWorker.ready;
        if (periodicSync) {
            try {
                await periodicSync.register(`dexie-cloud:${db.name}`, (_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.periodicSync);
                console.debug(`Dexie Cloud: Successfully registered periodicsync event for ${db.name}`);
            }
            catch (e) {
                console.debug(`Dexie Cloud: Failed to register periodic sync. Your PWA must be installed to allow background sync.`, e);
            }
        }
        else {
            console.debug(`Dexie Cloud: periodicSync not supported.`);
        }
    }
    catch (e) {
        console.debug(`Dexie Cloud: Could not register periodicSync for ${db.name}`, e);
    }
}

const outstandingTransactions = new BehaviorSubject(new Set());

/** Tracks all mutations in the same transaction as the mutations -
 * so it is guaranteed that no mutation goes untracked - and if transaction
 * aborts, the mutations won't be tracked.
 *
 * The sync job will use the tracked mutations as the source of truth when pushing
 * changes to server and cleanup the tracked mutations once the server has
 * ackowledged that it got them.
 */
function createMutationTrackingMiddleware({ currentUserObservable, db }) {
    return {
        stack: 'dbcore',
        name: 'MutationTrackingMiddleware',
        level: 1,
        create: (core) => {
            const ordinaryTables = core.schema.tables.filter((t) => !/^\$/.test(t.name));
            let mutTableMap;
            try {
                mutTableMap = new Map(ordinaryTables.map((tbl) => [
                    tbl.name,
                    core.table(`$${tbl.name}_mutations`)
                ]));
            }
            catch (_a) {
                throwVersionIncrementNeeded();
            }
            return {
                ...core,
                transaction: (tables, mode) => {
                    let tx;
                    if (mode === 'readwrite') {
                        const mutationTables = tables
                            .filter((tbl) => { var _a, _b; return (_b = (_a = db.cloud.schema) === null || _a === void 0 ? void 0 : _a[tbl]) === null || _b === void 0 ? void 0 : _b.markedForSync; })
                            .map((tbl) => getMutationTable(tbl));
                        tx = core.transaction([...tables, ...mutationTables], mode);
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
                        const removeTransaction = () => {
                            tx.removeEventListener('complete', txComplete);
                            tx.removeEventListener('error', removeTransaction);
                            tx.removeEventListener('abort', removeTransaction);
                            outstandingTransactions.value.delete(tx);
                            outstandingTransactions.next(outstandingTransactions.value);
                        };
                        const txComplete = () => {
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
                            removeTransaction();
                        };
                        tx.addEventListener('complete', txComplete);
                        tx.addEventListener('error', removeTransaction);
                        tx.addEventListener('abort', removeTransaction);
                    }
                    return tx;
                },
                table: (tableName) => {
                    const table = core.table(tableName);
                    if (/^\$/.test(tableName)) {
                        if (tableName.endsWith('_mutations')) {
                            // In case application code adds items to ..._mutations tables,
                            // make sure to set the mutationsAdded flag on transaction.
                            // This is also done in mutateAndLog() as that function talks to a
                            // lower level DBCore and wouldn't be catched by this code.
                            return {
                                ...table,
                                mutate: (req) => {
                                    if (req.type === 'add' || req.type === 'put') {
                                        req.trans.mutationsAdded = true;
                                    }
                                    return table.mutate(req);
                                }
                            };
                        }
                        else if (tableName === '$logins') {
                            return {
                                ...table,
                                mutate: (req) => {
                                    console.debug('Mutating $logins table', req);
                                    return table
                                        .mutate(req)
                                        .then((res) => {
                                        console.debug('Mutating $logins');
                                        req.trans.mutationsAdded = true;
                                        console.debug('$logins mutated');
                                        return res;
                                    })
                                        .catch((err) => {
                                        console.debug('Failed mutation $logins', err);
                                        return Promise.reject(err);
                                    });
                                }
                            };
                        }
                        else {
                            return table;
                        }
                    }
                    const { schema } = table;
                    const mutsTable = mutTableMap.get(tableName);
                    return guardedTable({
                        ...table,
                        mutate: (req) => {
                            var _a;
                            const trans = req.trans;
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
                                    .then((res) => {
                                    return mutateAndLog({
                                        type: 'delete',
                                        keys: res.result,
                                        trans: req.trans,
                                        criteria: { index: null, range: req.range }
                                    });
                                })
                                : mutateAndLog(req);
                        }
                    });
                    function mutateAndLog(req) {
                        const trans = req.trans;
                        trans.mutationsAdded = true;
                        const { txid, currentUser: { userId } } = trans;
                        const { type } = req;
                        return table.mutate(req).then((res) => {
                            const { numFailures: hasFailures, failures } = res;
                            let keys = type === 'delete' ? req.keys : res.results;
                            let values = 'values' in req ? req.values : [];
                            let changeSpecs = 'changeSpecs' in req ? req.changeSpecs : [];
                            if (hasFailures) {
                                keys = keys.filter((_, idx) => !failures[idx]);
                                values = values.filter((_, idx) => !failures[idx]);
                                changeSpecs = changeSpecs.filter((_, idx) => !failures[idx]);
                            }
                            const ts = Date.now();
                            const mut = req.type === 'delete'
                                ? {
                                    type: 'delete',
                                    ts,
                                    keys,
                                    criteria: req.criteria,
                                    txid,
                                    userId
                                }
                                : req.type === 'add'
                                    ? {
                                        type: 'insert',
                                        ts,
                                        keys,
                                        txid,
                                        userId,
                                        values
                                    }
                                    : req.criteria && req.changeSpec
                                        ? {
                                            // Common changeSpec for all keys
                                            type: 'modify',
                                            ts,
                                            keys,
                                            criteria: req.criteria,
                                            changeSpec: req.changeSpec,
                                            txid,
                                            userId
                                        }
                                        : req.changeSpecs
                                            ? {
                                                // One changeSpec per key
                                                type: 'update',
                                                ts,
                                                keys,
                                                changeSpecs,
                                                txid,
                                                userId
                                            }
                                            : {
                                                type: 'upsert',
                                                ts,
                                                keys,
                                                values,
                                                txid,
                                                userId
                                            };
                            return keys.length > 0 || ('criteria' in req && req.criteria)
                                ? mutsTable
                                    .mutate({ type: 'add', trans, values: [mut] }) // Log entry
                                    .then(() => res) // Return original response
                                : res;
                        });
                    }
                }
            };
        }
    };
}

function overrideParseStoresSpec(origFunc, dexie) {
    return function (stores, dbSchema) {
        const storesClone = {
            ...DEXIE_CLOUD_SCHEMA,
            ...stores,
        };
        const cloudSchema = dexie.cloud.schema || (dexie.cloud.schema = {});
        const allPrefixes = new Set();
        Object.keys(storesClone).forEach(tableName => {
            const schemaSrc = storesClone[tableName];
            const cloudTableSchema = cloudSchema[tableName] || (cloudSchema[tableName] = {});
            if (schemaSrc != null) {
                if (/^\@/.test(schemaSrc)) {
                    storesClone[tableName] = storesClone[tableName].substr(1);
                    cloudTableSchema.generatedGlobalId = true;
                    cloudTableSchema.idPrefix = generateTablePrefix(tableName, allPrefixes);
                    allPrefixes.add(cloudTableSchema.idPrefix);
                }
                if (!/^\$/.test(tableName)) {
                    storesClone[`$${tableName}_mutations`] = '++rev';
                    cloudTableSchema.markedForSync = true;
                }
                if (cloudTableSchema.deleted) {
                    cloudTableSchema.deleted = false;
                }
            }
            else {
                cloudTableSchema.deleted = true;
                cloudTableSchema.markedForSync = false;
                storesClone[`$${tableName}_mutations`] = null;
            }
        });
        const rv = origFunc.call(this, storesClone, dbSchema);
        return rv;
    };
}

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

const myId = randomString(16);

const GUARDED_JOB_HEARTBEAT = 1 * SECONDS;
const GUARDED_JOB_TIMEOUT = 1 * MINUTES;
async function performGuardedJob(db, jobName, jobsTableName, job, { awaitRemoteJob } = {}) {
    // Start working.
    //
    // Check if someone else is working on this already.
    //
    const jobsTable = db.table(jobsTableName);
    async function aquireLock() {
        const gotTheLock = await db.transaction('rw!', jobsTableName, async () => {
            const currentWork = await jobsTable.get(jobName);
            if (!currentWork) {
                // No one else is working. Let's record that we are.
                await jobsTable.add({
                    nodeId: myId,
                    started: new Date(),
                    heartbeat: new Date()
                }, jobName);
                return true;
            }
            else if (currentWork.heartbeat.getTime() <
                Date.now() - GUARDED_JOB_TIMEOUT) {
                console.warn(`Latest ${jobName} worker seem to have died.\n`, `The dead job started:`, currentWork.started, `\n`, `Last heart beat was:`, currentWork.heartbeat, '\n', `We're now taking over!`);
                // Now, take over!
                await jobsTable.put({
                    nodeId: myId,
                    started: new Date(),
                    heartbeat: new Date()
                }, jobName);
                return true;
            }
            return false;
        });
        if (gotTheLock)
            return true;
        // Someone else took the job.
        if (awaitRemoteJob) {
            try {
                const jobDoneObservable = from$1(liveQuery(() => jobsTable.get(jobName))).pipe(timeout(GUARDED_JOB_TIMEOUT), filter((job) => !job)); // Wait til job is not there anymore.
                await jobDoneObservable.toPromise();
                return false;
            }
            catch (err) {
                if (err.name !== 'TimeoutError') {
                    throw err;
                }
                // Timeout stopped us! Try aquire the lock now.
                // It will likely succeed this time unless
                // another client took it.
                return await aquireLock();
            }
        }
        return false;
    }
    if (await aquireLock()) {
        // We own the lock entry and can do our job undisturbed.
        // We're not within a transaction, but these type of locks
        // spans over transactions.
        // Start our heart beat during the job.
        // Use setInterval to make sure we are updating heartbeat even during long-lived fetch calls.
        const heartbeat = setInterval(() => {
            jobsTable.update(jobName, (job) => job.nodeId === myId && (job.heartbeat = new Date()));
        }, GUARDED_JOB_HEARTBEAT);
        try {
            return await job();
        }
        finally {
            // Stop heartbeat
            clearInterval(heartbeat);
            // Remove the persisted job state:
            await db.transaction('rw!', jobsTableName, async () => {
                const currentWork = await jobsTable.get(jobName);
                if (currentWork && currentWork.nodeId === myId) {
                    jobsTable.delete(jobName);
                }
            });
        }
    }
}

function getSyncableTables(db) {
    return Object.entries(db.cloud.schema || {})
        .filter(([, { markedForSync }]) => markedForSync)
        .map(([tbl]) => db.table(tbl));
}

async function listSyncifiedChanges(tablesToSyncify, currentUser, schema, alreadySyncedRealms) {
    if (currentUser.isLoggedIn) {
        if (tablesToSyncify.length > 0) {
            const ignoredRealms = new Set(alreadySyncedRealms || []);
            const inserts = await Promise.all(tablesToSyncify.map(async (table) => {
                const { extractKey } = table.core.schema.primaryKey;
                if (!extractKey)
                    return { table: table.name, muts: [] }; // Outbound tables are not synced.
                const dexieCloudTableSchema = schema[table.name];
                const query = (dexieCloudTableSchema === null || dexieCloudTableSchema === void 0 ? void 0 : dexieCloudTableSchema.generatedGlobalId)
                    ? table.filter((item) => !ignoredRealms.has(item.realmId || "") && isValidSyncableID(extractKey(item)))
                    : table.filter((item) => !ignoredRealms.has(item.realmId || "") && isValidAtID(extractKey(item), dexieCloudTableSchema === null || dexieCloudTableSchema === void 0 ? void 0 : dexieCloudTableSchema.idPrefix));
                const unsyncedObjects = await query.toArray();
                if (unsyncedObjects.length > 0) {
                    const mut = {
                        type: "insert",
                        values: unsyncedObjects,
                        keys: unsyncedObjects.map(extractKey),
                        userId: currentUser.userId,
                    };
                    return {
                        table: table.name,
                        muts: [mut],
                    };
                }
                else {
                    return {
                        table: table.name,
                        muts: []
                    };
                }
            }));
            return inserts.filter(op => op.muts.length > 0);
        }
    }
    return [];
}

function getTablesToSyncify(db, syncState) {
    const syncedTables = (syncState === null || syncState === void 0 ? void 0 : syncState.syncedTables) || [];
    const syncableTables = getSyncableTables(db);
    const tablesToSyncify = syncableTables.filter((tbl) => !syncedTables.includes(tbl.name));
    return tablesToSyncify;
}

function getTableFromMutationTable(mutationTable) {
    var _a;
    const tableName = (_a = /^\$(.*)_mutations$/.exec(mutationTable)) === null || _a === void 0 ? void 0 : _a[1];
    if (!tableName)
        throw new Error(`Given mutationTable ${mutationTable} is not correct`);
    return tableName;
}

async function listClientChanges(mutationTables, db, { since = {}, limit = Infinity } = {}) {
    const allMutsOnTables = await Promise.all(mutationTables.map(async (mutationTable) => {
        const tableName = getTableFromMutationTable(mutationTable.name);
        const lastRevision = since[tableName];
        let query = lastRevision
            ? mutationTable.where("rev").above(lastRevision)
            : mutationTable;
        if (limit < Infinity)
            query = query.limit(limit);
        const muts = await query.toArray();
        //const objTable = db.table(tableName);
        /*for (const mut of muts) {
          if (mut.type === "insert" || mut.type === "upsert") {
            mut.values = await objTable.bulkGet(mut.keys);
          }
        }*/
        return {
            table: tableName,
            muts,
        };
    }));
    // Filter out those tables that doesn't have any mutations:
    return allMutsOnTables.filter(({ muts }) => muts.length > 0);
}

const { toString: toStr } = {};
function getToStringTag(val) {
    return toStr.call(val).slice(8, -1);
}
function escapeDollarProps(value) {
    const keys = Object.keys(value);
    let dollarKeys = null;
    for (let i = 0, l = keys.length; i < l; ++i) {
        if (keys[i][0] === "$") {
            dollarKeys = dollarKeys || [];
            dollarKeys.push(keys[i]);
        }
    }
    if (!dollarKeys)
        return value;
    const clone = { ...value };
    for (const k of dollarKeys) {
        delete clone[k];
        clone["$" + k] = value[k];
    }
    return clone;
}
const ObjectDef = {
    replace: escapeDollarProps,
};
function TypesonSimplified(...typeDefsInputs) {
    const typeDefs = typeDefsInputs.reduce((p, c) => ({ ...p, ...c }), typeDefsInputs.reduce((p, c) => ({ ...c, ...p }), {}));
    const protoMap = new WeakMap();
    return {
        stringify(value, alternateChannel, space) {
            const json = JSON.stringify(value, function (key) {
                const realVal = this[key];
                const typeDef = getTypeDef(realVal);
                return typeDef
                    ? typeDef.replace(realVal, alternateChannel, typeDefs)
                    : realVal;
            }, space);
            return json;
        },
        parse(tson, alternateChannel) {
            let parent = null;
            let unescapeParentKeys = [];
            return JSON.parse(tson, function (key, value) {
                //
                // Parent Part
                //
                const type = value === null || value === void 0 ? void 0 : value.$t;
                if (type) {
                    const typeDef = typeDefs[type];
                    value = typeDef
                        ? typeDef.revive(value, alternateChannel, typeDefs)
                        : value;
                }
                if (value === parent) {
                    // Do what the kid told us to
                    if (unescapeParentKeys.length > 0) {
                        // Unescape dollar props
                        value = { ...value };
                        for (const k of unescapeParentKeys) {
                            value[k.substr(1)] = value[k];
                            delete value[k];
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
        const type = typeof realVal;
        switch (typeof realVal) {
            case "object":
            case "function": {
                // "object", "function", null
                if (realVal === null)
                    return null;
                const proto = Object.getPrototypeOf(realVal);
                if (!proto)
                    return ObjectDef;
                let typeDef = protoMap.get(proto);
                if (typeDef !== undefined)
                    return typeDef; // Null counts to! So the caching of Array.prototype also counts.
                const toStringTag = getToStringTag(realVal);
                const entry = Object.entries(typeDefs).find(([typeName, typeDef]) => { var _a, _b; return (_b = (_a = typeDef === null || typeDef === void 0 ? void 0 : typeDef.test) === null || _a === void 0 ? void 0 : _a.call(typeDef, realVal, toStringTag)) !== null && _b !== void 0 ? _b : typeName === toStringTag; });
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

const BisonBinaryTypes = {
    Blob: {
        test: (blob, toStringTag) => toStringTag === "Blob",
        replace: (blob, altChannel) => {
            const i = altChannel.length;
            altChannel.push(blob);
            return {
                $t: "Blob",
                mimeType: blob.type,
                i,
            };
        },
        revive: ({ i, mimeType }, altChannel) => new Blob([altChannel[i]], { type: mimeType }),
    },
};

var numberDef = {
    number: {
        replace: (num) => {
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
        revive: ({ v }) => Number(v),
    },
};

const bigIntDef = {
    bigint: {
        replace: (realVal) => {
            return { $t: "bigint", v: "" + realVal };
        },
        revive: (obj) => BigInt(obj.v),
    },
};

var DateDef = {
    Date: {
        replace: (date) => ({
            $t: "Date",
            v: isNaN(date.getTime()) ? "NaN" : date.toISOString(),
        }),
        revive: ({ v }) => new Date(v === "NaN" ? NaN : Date.parse(v)),
    },
};

var SetDef = {
    Set: {
        replace: (set) => ({
            $t: "Set",
            v: Array.from(set.entries()),
        }),
        revive: ({ v }) => new Set(v),
    },
};

var MapDef = {
    Map: {
        replace: (map) => ({
            $t: "Map",
            v: Array.from(map.entries()),
        }),
        revive: ({ v }) => new Map(v),
    },
};

const _global = typeof globalThis !== "undefined"
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
].reduce((specs, typeName) => ({
    ...specs,
    [typeName]: {
        // Replace passes the the typed array into $t, buffer so that
        // the ArrayBuffer typedef takes care of further handling of the buffer:
        // {$t:"Uint8Array",buffer:{$t:"ArrayBuffer",idx:0}}
        // CHANGED ABOVE! Now shortcutting that for more sparse format of the typed arrays
        // to contain the b64 property directly.
        replace: (a, _, typeDefs) => {
            const result = {
                $t: typeName,
                v: typeDefs.ArrayBuffer.replace(a.byteOffset === 0 && a.byteLength === a.buffer.byteLength
                    ? a.buffer
                    : a.buffer.slice(a.byteOffset, a.byteOffset + a.byteLength), _, typeDefs).v,
            };
            return result;
        },
        revive: ({ v }, _, typeDefs) => {
            const TypedArray = _global[typeName];
            return (TypedArray &&
                new TypedArray(typeDefs.ArrayBuffer.revive({ v }, _, typeDefs)));
        },
    },
}), {});

var ArrayBufferDef = {
    ArrayBuffer: {
        replace: (ab) => ({
            $t: "ArrayBuffer",
            v: b64LexEncode(ab),
        }),
        revive: ({ v }) => {
            const ba = b64LexDecode(v);
            return ba.buffer.byteLength === ba.byteLength
                ? ba.buffer
                : ba.buffer.slice(ba.byteOffset, ba.byteOffset + ba.byteLength);
        },
    },
};

class FakeBlob {
    constructor(buf, type) {
        this.buf = buf;
        this.type = type;
    }
}

function readBlobSync(b) {
    const req = new XMLHttpRequest();
    req.overrideMimeType("text/plain; charset=x-user-defined");
    req.open("GET", URL.createObjectURL(b), false); // Sync
    req.send();
    if (req.status !== 200 && req.status !== 0) {
        throw new Error("Bad Blob access: " + req.status);
    }
    return req.responseText;
}

function string2ArrayBuffer(str) {
    const array = new Uint8Array(str.length);
    for (let i = 0; i < str.length; ++i) {
        array[i] = str.charCodeAt(i); // & 0xff;
    }
    return array.buffer;
}

var BlobDef = {
    Blob: {
        test: (blob, toStringTag) => toStringTag === "Blob" || blob instanceof FakeBlob,
        replace: (blob) => ({
            $t: "Blob",
            v: blob instanceof FakeBlob
                ? b64encode(blob.buf)
                : b64encode(string2ArrayBuffer(readBlobSync(blob))),
            type: blob.type,
        }),
        revive: ({ type, v }) => {
            const ab = b64decode(v);
            return typeof Blob !== undefined
                ? new Blob([ab])
                : new FakeBlob(ab.buffer, type);
        },
    },
};

const builtin = {
    ...numberDef,
    ...bigIntDef,
    ...DateDef,
    ...SetDef,
    ...MapDef,
    ...TypedArraysDefs,
    ...ArrayBufferDef,
    ...BlobDef,
};

function Bison(...typeDefsInputs) {
    const tson = TypesonSimplified(builtin, BisonBinaryTypes, ...typeDefsInputs);
    return {
        toBinary(value) {
            const [blob, json] = this.stringify(value);
            const lenBuf = new ArrayBuffer(4);
            new DataView(lenBuf).setUint32(0, blob.size);
            return new Blob([lenBuf, blob, json]);
        },
        stringify(value) {
            const binaries = [];
            const json = tson.stringify(value, binaries);
            const blob = new Blob(binaries.map((b) => {
                const lenBuf = new ArrayBuffer(4);
                new DataView(lenBuf).setUint32(0, "byteLength" in b ? b.byteLength : b.size);
                return new Blob([lenBuf, b]);
            }));
            return [blob, json];
        },
        async parse(json, binData) {
            let pos = 0;
            const arrayBuffers = [];
            const buf = await readBlobBinary(binData);
            const view = new DataView(buf);
            while (pos < buf.byteLength) {
                const len = view.getUint32(pos);
                pos += 4;
                const ab = buf.slice(pos, pos + len);
                pos += len;
                arrayBuffers.push(ab);
            }
            return tson.parse(json, arrayBuffers);
        },
        async fromBinary(blob) {
            const len = new DataView(await readBlobBinary(blob.slice(0, 4))).getUint32(0);
            const binData = blob.slice(4, len + 4);
            const json = await readBlob(blob.slice(len + 4));
            return await this.parse(json, binData);
        },
    };
}
function readBlob(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onabort = (ev) => reject(new Error("file read aborted"));
        reader.onerror = (ev) => reject(ev.target.error);
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsText(blob);
    });
}
function readBlobBinary(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onabort = (ev) => reject(new Error("file read aborted"));
        reader.onerror = (ev) => reject(ev.target.error);
        reader.onload = (ev) => resolve(ev.target.result);
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
        replace: () => {
        },
        revive: () => undefined,
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
const hasBigIntSupport = typeof BigInt !== 'undefined';
class FakeBigInt {
    constructor(value) {
        this.v = value;
    }
    static compare(a, b) {
        if (typeof a === "bigint")
            return a < b ? -1 : a > b ? 1 : 0;
        if (typeof b === "bigint")
            throw new TypeError("Can't compare real bigint with FakeBigInt");
        // Here, we can only compare in best effort.
        return Number(a) < Number(b) ? -1 : Number(a) > Number(b) ? 1 : 0;
    }
    toString() {
        return this.v;
    }
}
const defs = {
    ...undefinedDef,
    ...(hasBigIntSupport
        ? {}
        : {
            bigint: {
                test: (val) => val instanceof FakeBigInt,
                replace: (fakeBigInt) => {
                    return {
                        $t: 'bigint',
                        ...fakeBigInt
                    };
                },
                revive: ({ v, }) => new FakeBigInt(v)
            }
        })
};
const TSON = TypesonSimplified(builtin, defs);
const BISON = Bison(defs);

//import {BisonWebStreamReader} from "dreambase-library/dist/typeson-simplified/BisonWebStreamReader";
async function syncWithServer(changes, syncState, baseRevs, db, databaseUrl, schema) {
    //
    // Push changes to server using fetch
    //
    const headers = {
        Accept: 'application/json, application/x-bison, application/x-bison-stream',
        'Content-Type': 'application/tson'
    };
    const accessToken = await loadAccessToken(db);
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }
    const syncRequest = {
        dbID: syncState === null || syncState === void 0 ? void 0 : syncState.remoteDbId,
        schema: schema || {},
        lastPull: syncState ? {
            serverRevision: syncState.serverRevision,
            realms: syncState.realms,
            inviteRealms: syncState.inviteRealms
        } : undefined,
        baseRevs,
        //baseRevisions: syncState?.baseRevisions || [],
        changes
    };
    console.debug("Sync request", syncRequest);
    db.syncStateChangedEvent.next({
        phase: 'pushing',
    });
    const res = await fetch(`${databaseUrl}/sync`, {
        method: 'post',
        headers,
        body: TSON.stringify(syncRequest)
    });
    //const contentLength = Number(res.headers.get('content-length'));
    db.syncStateChangedEvent.next({
        phase: 'pulling'
    });
    if (!res.ok) {
        throw new HttpError(res);
    }
    switch (res.headers.get('content-type')) {
        case 'application/x-bison':
            return BISON.fromBinary(await res.blob());
        case 'application/x-bison-stream': //return BisonWebStreamReader(BISON, res);
        default:
        case 'application/json': {
            const text = await res.text();
            const syncRes = TSON.parse(text);
            return syncRes;
        }
    }
}

async function modifyLocalObjectsWithNewUserId(syncifiedTables, currentUser, alreadySyncedRealms) {
    const ignoredRealms = new Set(alreadySyncedRealms || []);
    for (const table of syncifiedTables) {
        if (table.name === "members") {
            // members
            await table.toCollection().modify((member) => {
                if (!ignoredRealms.has(member.realmId) && member.userId === UNAUTHORIZED_USER.userId) {
                    member.userId = currentUser.userId;
                }
            });
        }
        else if (table.name === "roles") ;
        else if (table.name === "realms") {
            // realms
            await table.toCollection().modify((realm) => {
                if (!ignoredRealms.has(realm.realmId) && !realm.owner || realm.owner === UNAUTHORIZED_USER.userId) {
                    realm.owner = currentUser.userId;
                }
            });
        }
        else {
            // application entities
            await table.toCollection().modify((obj) => {
                if (!obj.realmId || !ignoredRealms.has(obj.realmId)) {
                    if (!obj.owner || obj.owner === UNAUTHORIZED_USER.userId)
                        obj.owner = currentUser.userId;
                    if (!obj.realmId || obj.realmId === UNAUTHORIZED_USER.userId) {
                        obj.realmId = currentUser.userId;
                    }
                }
            });
        }
    }
}

async function bulkUpdate(table, keys, changeSpecs) {
    const objs = await table.bulkGet(keys);
    const resultKeys = [];
    const resultObjs = [];
    keys.forEach((key, idx) => {
        const obj = objs[idx];
        if (obj) {
            for (const [keyPath, value] of Object.entries(changeSpecs[idx])) {
                if (keyPath === table.schema.primKey.keyPath) {
                    throw new Error(`Cannot change primary key`);
                }
                Dexie.setByKeyPath(obj, keyPath, value);
            }
            resultKeys.push(key);
            resultObjs.push(obj);
        }
    });
    await (table.schema.primKey.keyPath == null
        ? table.bulkPut(resultObjs, resultKeys)
        : table.bulkPut(resultObjs));
}

function throwIfCancelled(cancelToken) {
    if (cancelToken === null || cancelToken === void 0 ? void 0 : cancelToken.cancelled)
        throw new Dexie.AbortError(`Operation was cancelled`);
}

/* Need this because navigator.onLine seems to say "false" when it is actually online.
  This function relies initially on navigator.onLine but then uses online and offline events
  which seem to be more reliable.
*/
let isOnline = navigator.onLine;
self.addEventListener('online', () => isOnline = true);
self.addEventListener('offline', () => isOnline = false);

const isSyncing = new WeakSet();
const CURRENT_SYNC_WORKER = 'currentSyncWorker';
function sync(db, options, schema, syncOptions) {
    return _sync
        .apply(this, arguments)
        .then(() => {
        db.syncStateChangedEvent.next({
            phase: 'in-sync',
        });
    })
        .catch(async (error) => {
        console.debug('Error from _sync', {
            isOnline,
            syncOptions,
            error,
        });
        if (isOnline &&
            (syncOptions === null || syncOptions === void 0 ? void 0 : syncOptions.retryImmediatelyOnFetchError) &&
            (error === null || error === void 0 ? void 0 : error.name) === 'TypeError' &&
            /fetch/.test(error === null || error === void 0 ? void 0 : error.message)) {
            db.syncStateChangedEvent.next({
                phase: 'error',
                error
            });
            // Retry again in 500 ms but if it fails again, don't retry.
            await new Promise((resolve) => setTimeout(resolve, 500));
            return await sync(db, options, schema, {
                ...syncOptions,
                retryImmediatelyOnFetchError: false,
            });
        }
        // Make sure that no matter whether sync() explodes or not,
        // always update the timestamp. Also store the error.
        await db.$syncState.update('syncState', {
            timestamp: new Date(),
            error: '' + error,
        });
        db.syncStateChangedEvent.next({
            phase: isOnline ? 'error' : 'offline',
            error
        });
        return Promise.reject(error);
    });
}
async function _sync(db, options, schema, { isInitialSync, cancelToken, justCheckIfNeeded } = {
    isInitialSync: false,
}) {
    var _a;
    if (!justCheckIfNeeded) {
        console.debug('SYNC STARTED', { isInitialSync });
    }
    if (!((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.databaseUrl))
        throw new Error(`Internal error: sync must not be called when no databaseUrl is configured`);
    const { databaseUrl } = options;
    const currentUser = await db.getCurrentUser(); // Keep same value across entire sync flow:
    const tablesToSync = currentUser.isLoggedIn ? getSyncableTables(db) : [];
    const mutationTables = tablesToSync.map((tbl) => db.table(getMutationTable(tbl.name)));
    // If this is not the initial sync,
    // go through tables that were previously not synced but should now be according to
    // logged in state and the sync table whitelist in db.cloud.options.
    //
    // Prepare for syncification by modifying locally unauthorized objects:
    //
    const persistedSyncState = await db.getPersistedSyncState();
    const tablesToSyncify = !isInitialSync && currentUser.isLoggedIn
        ? getTablesToSyncify(db, persistedSyncState)
        : [];
    throwIfCancelled(cancelToken);
    const doSyncify = tablesToSyncify.length > 0;
    if (doSyncify) {
        if (justCheckIfNeeded)
            return true;
        console.debug('sync doSyncify is true');
        await db.transaction('rw', tablesToSyncify, async (tx) => {
            // @ts-ignore
            tx.idbtrans.disableChangeTracking = true;
            // @ts-ignore
            tx.idbtrans.disableAccessControl = true; // TODO: Take care of this flag in access control middleware!
            await modifyLocalObjectsWithNewUserId(tablesToSyncify, currentUser, persistedSyncState === null || persistedSyncState === void 0 ? void 0 : persistedSyncState.realms);
        });
        throwIfCancelled(cancelToken);
    }
    //
    // List changes to sync
    //
    const [clientChangeSet, syncState, baseRevs] = await db.transaction('r', db.tables, async () => {
        const syncState = await db.getPersistedSyncState();
        const baseRevs = await db.$baseRevs.toArray();
        let clientChanges = await listClientChanges(mutationTables);
        throwIfCancelled(cancelToken);
        if (doSyncify) {
            const syncificationInserts = await listSyncifiedChanges(tablesToSyncify, currentUser, schema, persistedSyncState === null || persistedSyncState === void 0 ? void 0 : persistedSyncState.realms);
            throwIfCancelled(cancelToken);
            clientChanges = clientChanges.concat(syncificationInserts);
            return [clientChanges, syncState, baseRevs];
        }
        return [clientChanges, syncState, baseRevs];
    });
    if (justCheckIfNeeded) {
        const syncIsNeeded = clientChangeSet.some((set) => set.muts.some((mut) => mut.keys.length > 0));
        console.debug('Sync is needed:', syncIsNeeded);
        return syncIsNeeded;
    }
    const latestRevisions = getLatestRevisionsPerTable(clientChangeSet, syncState === null || syncState === void 0 ? void 0 : syncState.latestRevisions);
    //
    // Push changes to server
    //
    throwIfCancelled(cancelToken);
    const res = await syncWithServer(clientChangeSet, syncState, baseRevs, db, databaseUrl, schema);
    console.debug('Sync response', res);
    //
    // Apply changes locally and clear old change entries:
    //
    const done = await db.transaction('rw', db.tables, async (tx) => {
        // @ts-ignore
        tx.idbtrans.disableChangeTracking = true;
        // @ts-ignore
        tx.idbtrans.disableAccessControl = true; // TODO: Take care of this flag in access control middleware!
        // Update db.cloud.schema from server response.
        // Local schema MAY include a subset of tables, so do not force all tables into local schema.
        for (const tableName of Object.keys(schema)) {
            if (res.schema[tableName]) {
                // Write directly into configured schema. This code can only be executed alone.
                schema[tableName] = res.schema[tableName];
            }
        }
        await db.$syncState.put(schema, 'schema');
        // List mutations that happened during our exchange with the server:
        const addedClientChanges = await listClientChanges(mutationTables, db, {
            since: latestRevisions,
        });
        //
        // Delete changes now as server has return success
        // (but keep changes that haven't reached server yet)
        //
        for (const mutTable of mutationTables) {
            const tableName = getTableFromMutationTable(mutTable.name);
            if (!addedClientChanges.some((ch) => ch.table === tableName && ch.muts.length > 0)) {
                // No added mutations for this table during the time we sent changes
                // to the server.
                // It is therefore safe to clear all changes (which is faster than
                // deleting a range)
                await Promise.all([
                    mutTable.clear(),
                    db.$baseRevs.where({ tableName }).delete(),
                ]);
            }
            else if (latestRevisions[mutTable.name]) {
                const latestRev = latestRevisions[mutTable.name] || 0;
                //await mutTable.where('rev').belowOrEqual(latestRev).reverse().offset(1).delete();
                await Promise.all([
                    mutTable.where('rev').belowOrEqual(latestRev).delete(),
                    db.$baseRevs
                        .where(':id')
                        .between([tableName, -Infinity], [tableName, latestRev + 1], true, true)
                        .reverse()
                        .offset(1) // Keep one entry (the one mapping muts that came during fetch --> previous server revision)
                        .delete(),
                ]);
            }
            else ;
        }
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
        await db.$baseRevs.bulkPut(Object.keys(schema)
            .filter((table) => schema[table].markedForSync)
            .map((tableName) => {
            const lastClientRevOnPreviousServerRev = latestRevisions[tableName] || 0;
            return {
                tableName,
                clientRev: lastClientRevOnPreviousServerRev + 1,
                serverRev: res.serverRevision,
            };
        }));
        const syncState = await db.getPersistedSyncState();
        //
        // Delete objects from removed realms
        //
        await deleteObjectsFromRemovedRealms(db, res, syncState);
        //
        // Update syncState
        //
        const newSyncState = syncState || {
            syncedTables: [],
            latestRevisions: {},
            realms: [],
            inviteRealms: [],
        };
        newSyncState.syncedTables = tablesToSync
            .map((tbl) => tbl.name)
            .concat(tablesToSyncify.map((tbl) => tbl.name));
        newSyncState.latestRevisions = latestRevisions;
        newSyncState.remoteDbId = res.dbId;
        newSyncState.initiallySynced = true;
        newSyncState.realms = res.realms;
        newSyncState.inviteRealms = res.inviteRealms;
        newSyncState.serverRevision = res.serverRevision;
        newSyncState.timestamp = new Date();
        delete newSyncState.error;
        const filteredChanges = filterServerChangesThroughAddedClientChanges(res.changes, addedClientChanges);
        //
        // apply server changes
        //
        await applyServerChanges(filteredChanges, db);
        //
        // Update syncState
        //
        db.$syncState.put(newSyncState, 'syncState');
        return addedClientChanges.length === 0;
    });
    if (!done) {
        console.debug('MORE SYNC NEEDED. Go for it again!');
        return await _sync(db, options, schema, { isInitialSync, cancelToken });
    }
    console.debug('SYNC DONE', { isInitialSync });
    return false; // Not needed anymore
}
async function deleteObjectsFromRemovedRealms(db, res, prevState) {
    const deletedRealms = [];
    const previousRealmSet = prevState
        ? prevState.realms.concat(prevState.inviteRealms)
        : [];
    const updatedRealmSet = new Set([...res.realms, ...res.inviteRealms]);
    for (const realmId of previousRealmSet) {
        if (!updatedRealmSet.has(realmId))
            deletedRealms.push(realmId);
    }
    if (deletedRealms.length > 0) {
        const deletedRealmSet = new Set(deletedRealms);
        const tables = getSyncableTables(db);
        for (const table of tables) {
            if (table.schema.indexes.some((idx) => idx.keyPath === 'realmId' ||
                (Array.isArray(idx.keyPath) && idx.keyPath[0] === 'realmId'))) {
                // There's an index to use:
                await table.where('realmId').anyOf(deletedRealms).delete();
            }
            else {
                // No index to use:
                await table
                    .filter((obj) => !!(obj === null || obj === void 0 ? void 0 : obj.realmId) && deletedRealmSet.has(obj.realmId))
                    .delete();
            }
        }
    }
}
function getLatestRevisionsPerTable(clientChangeSet, lastRevisions = {}) {
    for (const { table, muts } of clientChangeSet) {
        const lastRev = muts.length > 0 ? muts[muts.length - 1].rev || 0 : 0;
        lastRevisions[table] = lastRev;
    }
    return lastRevisions;
}
async function applyServerChanges(changes, db) {
    console.debug('Applying server changes', changes, Dexie.currentTransaction);
    for (const { table: tableName, muts } of changes) {
        const table = db.table(tableName);
        const { primaryKey } = table.core.schema;
        for (const mut of muts) {
            switch (mut.type) {
                case 'insert':
                    if (primaryKey.outbound) {
                        await table.bulkAdd(mut.values, mut.keys);
                    }
                    else {
                        mut.keys.forEach((key, i) => {
                            Dexie.setByKeyPath(mut.values[i], primaryKey.keyPath, key);
                        });
                        await table.bulkAdd(mut.values);
                    }
                    break;
                case 'upsert':
                    if (primaryKey.outbound) {
                        await table.bulkPut(mut.values, mut.keys);
                    }
                    else {
                        mut.keys.forEach((key, i) => {
                            Dexie.setByKeyPath(mut.values[i], primaryKey.keyPath, key);
                        });
                        await table.bulkPut(mut.values);
                    }
                    break;
                case 'modify':
                    if (mut.keys.length === 1) {
                        await table.update(mut.keys[0], mut.changeSpec);
                    }
                    else {
                        await table.where(':id').anyOf(mut.keys).modify(mut.changeSpec);
                    }
                    break;
                case 'update':
                    await bulkUpdate(table, mut.keys, mut.changeSpecs);
                    break;
                case 'delete':
                    await table.bulkDelete(mut.keys);
                    break;
            }
        }
    }
}
function filterServerChangesThroughAddedClientChanges(serverChanges, addedClientChanges) {
    const changes = {};
    applyOperations(changes, serverChanges);
    const localPostChanges = {};
    applyOperations(localPostChanges, addedClientChanges);
    subtractChanges(changes, localPostChanges);
    return toDBOperationSet(changes);
}

async function performInitialSync(db, cloudOptions, cloudSchema) {
    console.debug("Performing initial sync");
    await performGuardedJob(db, 'initialSync', '$jobs', async () => {
        // Even though caller has already checked it,
        // Do check again (now within a transaction) that we really do not have a sync state:
        const syncState = await db.getPersistedSyncState();
        if (!(syncState === null || syncState === void 0 ? void 0 : syncState.initiallySynced)) {
            await sync(db, cloudOptions, cloudSchema, { isInitialSync: true });
        }
    }, { awaitRemoteJob: true } // Don't return until the job is done!
    );
    console.debug("Done initial sync");
}

const USER_INACTIVITY_TIMEOUT = 300000; // 300_000;
// This observable will be emitted to later down....
const userIsActive = new BehaviorSubject(true);
//
// First create some corner-stone observables to build the flow on
//
// document.onvisibilitychange:
const visibilityStateIsChanged = typeof document !== 'undefined'
    ? fromEvent(document, 'visibilitychange')
    : of$1({});
// document.onvisibilitychange makes document hidden:
const documentBecomesHidden = visibilityStateIsChanged.pipe(filter(() => document.visibilityState === 'hidden'));
// document.onvisibilitychange makes document visible
const documentBecomesVisible = visibilityStateIsChanged.pipe(filter(() => document.visibilityState === 'hidden'));
// Any of various user-activity-related events happen:
const userDoesSomething = typeof window !== 'undefined'
    ? merge(documentBecomesVisible, fromEvent(window, 'mousemove'), fromEvent(window, 'keydown'), fromEvent(window, 'wheel'), fromEvent(window, 'touchmove'))
    : of$1({});
if (typeof document !== 'undefined') {
    //
    // Now, create a final observable and start subscribing to it in order
    // to make it emit values to userIsActive BehaviourSubject (which is the
    // most important global hot observable we have here)
    //
    // Live test: https://jsitor.com/LboCDHgbn
    //
    merge(of$1(true), // Make sure something is always emitted from start
    documentBecomesHidden, // so that we can eagerly emit false!
    userDoesSomething)
        .pipe(
    // No matter event source, compute whether user is visible using visibilityState:
    map(() => document.visibilityState === 'visible'), 
    // Make sure to emit it
    tap((isActive) => {
        if (userIsActive.value !== isActive) {
            // Emit new value unless it already has that value
            userIsActive.next(isActive);
        }
    }), 
    // Now, if true was emitted, make sure to set a timeout to emit false
    // unless new user activity things happen (in that case, the timeout will be cancelled!)
    switchMap((isActive) => isActive
        ? of$1(true).pipe(delay(USER_INACTIVITY_TIMEOUT), tap(() => userIsActive.next(false)))
        : of$1(false)))
        .subscribe(() => { }); // Unless we subscribe nothing will be propagated to userIsActive observable
}

class TokenExpiredError extends Error {
    constructor() {
        super(...arguments);
        this.name = "TokenExpiredError";
    }
}

const SERVER_PING_TIMEOUT = 20000;
const CLIENT_PING_INTERVAL = 30000;
const FAIL_RETRY_WAIT_TIME = 60000;
class WSObservable extends Observable$1 {
    constructor(databaseUrl, rev, token, tokenExpiration) {
        super((subscriber) => new WSConnection(databaseUrl, rev, token, tokenExpiration, subscriber));
    }
}
let counter = 0;
class WSConnection extends Subscription$1 {
    constructor(databaseUrl, rev, token, tokenExpiration, subscriber) {
        super(() => this.teardown());
        this.id = ++counter;
        console.debug('New WebSocket Connection', this.id, token ? 'authorized' : 'unauthorized');
        this.databaseUrl = databaseUrl;
        this.rev = rev;
        this.token = token;
        this.tokenExpiration = tokenExpiration;
        this.subscriber = subscriber;
        this.lastUserActivity = new Date();
        this.connect();
    }
    teardown() {
        this.disconnect();
        console.debug('Teardown WebSocket Connection', this.id);
    }
    disconnect() {
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
    }
    reconnect() {
        this.disconnect();
        this.connect();
    }
    async connect() {
        this.lastServerActivity = new Date();
        if (this.pauseUntil && this.pauseUntil > new Date())
            return;
        if (this.ws) {
            throw new Error(`Called connect() when a connection is already open`);
        }
        if (!this.databaseUrl)
            throw new Error(`Cannot connect without a database URL`);
        if (this.closed) {
            return;
        }
        if (this.tokenExpiration && this.tokenExpiration < new Date()) {
            this.subscriber.error(new TokenExpiredError()); // Will be handled in connectWebSocket.ts.
            return;
        }
        this.pinger = setInterval(async () => {
            if (this.closed) {
                console.debug('pinger check', this.id, 'CLOSED.');
                this.teardown();
                return;
            }
            console.debug('pinger check', this.id, 'user is active');
            if (this.ws) {
                try {
                    this.ws.send(JSON.stringify({ type: 'ping' }));
                    setTimeout(() => {
                        console.debug('pinger setTimeout', this.id, this.pinger ? `alive` : 'dead');
                        if (!this.pinger)
                            return;
                        if (this.closed) {
                            console.debug('pinger setTimeout', this.id, 'subscription is closed');
                            this.teardown();
                            return;
                        }
                        if (this.lastServerActivity <
                            new Date(Date.now() - SERVER_PING_TIMEOUT)) {
                            // Server inactive. Reconnect if user is active.
                            console.debug('pinger: server is inactive');
                            console.debug('pinger reconnecting');
                            this.reconnect();
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
        }, CLIENT_PING_INTERVAL);
        // The following vars are needed because we must know which callback to ack when server sends it's ack to us.
        const wsUrl = new URL(this.databaseUrl);
        wsUrl.protocol = wsUrl.protocol === 'http:' ? 'ws' : 'wss';
        const searchParams = new URLSearchParams();
        if (this.subscriber.closed)
            return;
        searchParams.set('rev', this.rev);
        if (this.token) {
            searchParams.set('token', this.token);
        }
        // Connect the WebSocket to given url:
        console.debug('dexie-cloud WebSocket create');
        const ws = (this.ws = new WebSocket(`${wsUrl}/revision?${searchParams}`));
        //ws.binaryType = "arraybuffer"; // For future when subscribing to actual changes.
        ws.onclose = (event) => {
            if (!this.pinger)
                return;
            console.debug('dexie-cloud WebSocket onclosed');
            this.reconnect();
        };
        ws.onmessage = (event) => {
            if (!this.pinger)
                return;
            console.debug('dexie-cloud WebSocket onmessage', event.data);
            this.lastServerActivity = new Date();
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'error') {
                    throw new Error(`dexie-cloud WebSocket Error ${msg.error}`);
                }
                if (msg.type === 'rev') {
                    this.rev = msg.rev; // No meaning but seems reasonable.
                }
                if (msg.type !== 'pong') {
                    this.subscriber.next(msg);
                }
            }
            catch (e) {
                this.disconnect();
                this.pauseUntil = new Date(Date.now() + FAIL_RETRY_WAIT_TIME);
            }
        };
        try {
            await new Promise((resolve, reject) => {
                ws.onopen = (event) => {
                    console.debug('dexie-cloud WebSocket onopen');
                    resolve(null);
                };
                ws.onerror = (event) => {
                    const error = event.error || new Error('WebSocket Error');
                    console.debug('dexie-cloud WebSocket error', error);
                    this.disconnect();
                    reject(error);
                };
            });
        }
        catch (error) {
            this.pauseUntil = new Date(Date.now() + FAIL_RETRY_WAIT_TIME);
        }
    }
}

function triggerSync(db) {
    if (db.cloud.usingServiceWorker) {
        registerSyncEvent(db);
    }
    else {
        db.localSyncEvent.next({});
    }
}

function connectWebSocket(db) {
    var _a;
    if (!((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.databaseUrl)) {
        throw new Error(`No database URL to connect WebSocket to`);
    }
    function createObservable() {
        return userIsActive.pipe(filter((isActive) => isActive), // Reconnect when user becomes active
        switchMap(() => db.cloud.currentUser), // Reconnect whenever current user changes
        filter(() => { var _a, _b; return (_b = (_a = db.cloud.persistedSyncState) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.serverRevision; }), // Don't connect before there's no initial sync performed.
        switchMap((userLogin) => {
            var _a, _b;
            return new WSObservable(db.cloud.options.databaseUrl, (_b = (_a = db.cloud.persistedSyncState) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.serverRevision, userLogin.accessToken, userLogin.accessTokenExpiration);
        }), catchError((error) => {
            return from$1(handleError(error)).pipe(switchMap(() => createObservable()), catchError((error) => {
                // Failed to refresh token (network error or so)
                console.error(`WebSocket observable: error but revive when user does some active thing...`, error);
                return of$1(true).pipe(delay(3000), // Give us some breath between errors
                switchMap(() => userDoesSomething), take(1), // Don't reconnect whenever user does something
                switchMap(() => createObservable()) // Relaunch the flow
                );
            }));
            async function handleError(error) {
                if ((error === null || error === void 0 ? void 0 : error.name) === 'TokenExpiredError') {
                    console.debug('WebSocket observable: Token expired. Refreshing token...');
                    const user = db.cloud.currentUser.value;
                    const refreshedLogin = await refreshAccessToken(db.cloud.options.databaseUrl, user);
                    await db.table('$logins').update(user.userId, {
                        accessToken: refreshedLogin.accessToken,
                        accessTokenExpiration: refreshedLogin.accessTokenExpiration,
                    });
                }
                else {
                    console.error('WebSocket observable:', error);
                    throw error;
                }
            }
        }));
    }
    return createObservable().subscribe(async (msg) => {
        var _a, _b;
        const syncState = await db.getPersistedSyncState();
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
    });
}

async function isSyncNeeded(db) {
    var _a;
    return ((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.databaseUrl) && db.cloud.schema
        ? await sync(db, db.cloud.options, db.cloud.schema, { justCheckIfNeeded: true })
        : false;
}

async function syncIfPossible(db, cloudOptions, cloudSchema, options) {
    if (isSyncing.has(db)) {
        // Still working. Existing work will make sure to complete its job
        // and after that, check if new mutations have arrived, and if so complete
        // those as well. So if isSyncing.has(db) is true, we can rely that nothing at
        // all will be needed to perform at this time.
        // Exceptions: If onling sync throws an exception, it's caller will take care of
        // the retry procedure - we shouldn't do that also (would be redundant).
        return;
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
    try {
        if (db.cloud.usingServiceWorker) {
            if (IS_SERVICE_WORKER) {
                await sync(db, cloudOptions, cloudSchema, options);
            }
        }
        else {
            // We use a flow that is better suited for the case when multiple workers want to
            // do the same thing.
            await performGuardedJob(db, CURRENT_SYNC_WORKER, '$jobs', () => sync(db, cloudOptions, cloudSchema, options));
        }
        isSyncing.delete(db);
        console.debug("Done sync");
    }
    catch (error) {
        isSyncing.delete(db);
        console.error(`Failed to sync client changes`, error);
        throw error; // Make sure we rethrow error so that sync event is retried.
        // I don't think we should setTimout or so here.
        // Unless server tells us to in some response.
        // Then we could follow that advice but not by waiting here but by registering
        // Something that triggers an event listened to in startPushWorker()
    }
}

function LocalSyncWorker(db, cloudOptions, cloudSchema) {
    let localSyncEventSubscription = null;
    //let syncHandler: ((event: Event) => void) | null = null;
    //let periodicSyncHandler: ((event: Event) => void) | null = null;
    let cancelToken = { cancelled: false };
    function syncAndRetry(retryNum = 1) {
        syncIfPossible(db, cloudOptions, cloudSchema, {
            cancelToken,
            retryImmediatelyOnFetchError: true, // workaround for "net::ERR_NETWORK_CHANGED" in chrome.
        }).catch((e) => {
            console.error('error in syncIfPossible()', e);
            if (cancelToken.cancelled) {
                stop();
            }
            else if (retryNum < 3) {
                // Mimic service worker sync event: retry 3 times
                // * first retry after 5 minutes
                // * second retry 15 minutes later
                setTimeout(() => syncAndRetry(retryNum + 1), [0, 5, 15][retryNum] * MINUTES);
            }
        });
    }
    const start = () => {
        // Sync eagerly whenever a change has happened (+ initially when there's no syncState yet)
        // This initial subscribe will also trigger an sync also now.
        console.debug('Starting LocalSyncWorker', db.localSyncEvent['id']);
        localSyncEventSubscription = db.localSyncEvent.subscribe(() => {
            try {
                syncAndRetry();
            }
            catch (err) {
                console.error('What-the....', err);
            }
        });
        //setTimeout(()=>db.localSyncEvent.next({}), 5000);
    };
    const stop = () => {
        console.debug('Stopping LocalSyncWorker');
        cancelToken.cancelled = true;
        if (localSyncEventSubscription)
            localSyncEventSubscription.unsubscribe();
    };
    return {
        start,
        stop,
    };
}

function updateSchemaFromOptions(schema, options) {
    if (schema && options) {
        if (options.unsyncedTables) {
            for (const tableName of options.unsyncedTables) {
                if (schema[tableName]) {
                    schema[tableName].markedForSync = false;
                }
            }
        }
    }
}

function verifySchema(db) {
    var _a, _b;
    for (const table of db.tables) {
        if ((_b = (_a = db.cloud.schema) === null || _a === void 0 ? void 0 : _a[table.name]) === null || _b === void 0 ? void 0 : _b.markedForSync) {
            if (table.schema.primKey.auto) {
                throw new Dexie.SchemaError(`Table ${table.name} is both autoIncremented and synced. ` +
                    `Use db.cloud.configure({unsyncedTables: [${JSON.stringify(table.name)}]}) to blacklist it from sync`);
            }
            if (!table.schema.primKey.keyPath) {
                throw new Dexie.SchemaError(`Table ${table.name} cannot be both synced and outbound. ` +
                    `Use db.cloud.configure({unsyncedTables: [${JSON.stringify(table.name)}]}) to blacklist it from sync`);
            }
        }
    }
}

var n,u$1,i$1,t$1,r$1={},f$1=[],e$1=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function c$1(n,l){for(var u in l)n[u]=l[u];return n}function s$1(n){var l=n.parentNode;l&&l.removeChild(n);}function a$1(n,l,u){var i,t,o,r=arguments,f={};for(o in l)"key"==o?i=l[o]:"ref"==o?t=l[o]:f[o]=l[o];if(arguments.length>3)for(u=[u],o=3;o<arguments.length;o++)u.push(r[o]);if(null!=u&&(f.children=u),"function"==typeof n&&null!=n.defaultProps)for(o in n.defaultProps)void 0===f[o]&&(f[o]=n.defaultProps[o]);return v$1(n,f,i,t,null)}function v$1(l,u,i,t,o){var r={type:l,props:u,key:i,ref:t,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==o?++n.__v:o};return null!=n.vnode&&n.vnode(r),r}function y(n){return n.children}function p$1(n,l){this.props=n,this.context=l;}function d$1(n,l){if(null==l)return n.__?d$1(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return "function"==typeof n.type?d$1(n):null}function _(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return _(n)}}function k$1(l){(!l.__d&&(l.__d=!0)&&u$1.push(l)&&!b$1.__r++||t$1!==n.debounceRendering)&&((t$1=n.debounceRendering)||i$1)(b$1);}function b$1(){for(var n;b$1.__r=u$1.length;)n=u$1.sort(function(n,l){return n.__v.__b-l.__v.__b}),u$1=[],n.some(function(n){var l,u,i,t,o,r;n.__d&&(o=(t=(l=n).__v).__e,(r=l.__P)&&(u=[],(i=c$1({},t)).__v=t.__v+1,I(r,t,i,l.__n,void 0!==r.ownerSVGElement,null!=t.__h?[o]:null,u,null==o?d$1(t):o,t.__h),T(u,t),t.__e!=o&&_(t)));});}function m$1(n,l,u,i,t,o,e,c,s,a){var h,p,_,k,b,m,w,A=i&&i.__k||f$1,P=A.length;for(u.__k=[],h=0;h<l.length;h++)if(null!=(k=u.__k[h]=null==(k=l[h])||"boolean"==typeof k?null:"string"==typeof k||"number"==typeof k||"bigint"==typeof k?v$1(null,k,null,null,k):Array.isArray(k)?v$1(y,{children:k},null,null,null):k.__b>0?v$1(k.type,k.props,k.key,null,k.__v):k)){if(k.__=u,k.__b=u.__b+1,null===(_=A[h])||_&&k.key==_.key&&k.type===_.type)A[h]=void 0;else for(p=0;p<P;p++){if((_=A[p])&&k.key==_.key&&k.type===_.type){A[p]=void 0;break}_=null;}I(n,k,_=_||r$1,t,o,e,c,s,a),b=k.__e,(p=k.ref)&&_.ref!=p&&(w||(w=[]),_.ref&&w.push(_.ref,null,k),w.push(p,k.__c||b,k)),null!=b?(null==m&&(m=b),"function"==typeof k.type&&null!=k.__k&&k.__k===_.__k?k.__d=s=g$1(k,s,n):s=x$1(n,k,_,A,b,s),a||"option"!==u.type?"function"==typeof u.type&&(u.__d=s):n.value=""):s&&_.__e==s&&s.parentNode!=n&&(s=d$1(_));}for(u.__e=m,h=P;h--;)null!=A[h]&&("function"==typeof u.type&&null!=A[h].__e&&A[h].__e==u.__d&&(u.__d=d$1(i,h+1)),L(A[h],A[h]));if(w)for(h=0;h<w.length;h++)z(w[h],w[++h],w[++h]);}function g$1(n,l,u){var i,t;for(i=0;i<n.__k.length;i++)(t=n.__k[i])&&(t.__=n,l="function"==typeof t.type?g$1(t,l,u):x$1(u,t,t,n.__k,t.__e,l));return l}function x$1(n,l,u,i,t,o){var r,f,e;if(void 0!==l.__d)r=l.__d,l.__d=void 0;else if(null==u||t!=o||null==t.parentNode)n:if(null==o||o.parentNode!==n)n.appendChild(t),r=null;else {for(f=o,e=0;(f=f.nextSibling)&&e<i.length;e+=2)if(f==t)break n;n.insertBefore(t,o),r=o;}return void 0!==r?r:t.nextSibling}function A(n,l,u,i,t){var o;for(o in u)"children"===o||"key"===o||o in l||C(n,o,null,u[o],i);for(o in l)t&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||C(n,o,l[o],u[o],i);}function P(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||e$1.test(l)?u:u+"px";}function C(n,l,u,i,t){var o;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else {if("string"==typeof i&&(n.style.cssText=i=""),i)for(l in i)u&&l in u||P(n.style,l,"");if(u)for(l in u)i&&u[l]===i[l]||P(n.style,l,u[l]);}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=u,u?i||n.addEventListener(l,o?H:$,o):n.removeEventListener(l,o?H:$,o);else if("dangerouslySetInnerHTML"!==l){if(t)l=l.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l));}}function $(l){this.l[l.type+!1](n.event?n.event(l):l);}function H(l){this.l[l.type+!0](n.event?n.event(l):l);}function I(l,u,i,t,o,r,f,e,s){var a,v,h,d,_,k,b,g,w,x,A,P=u.type;if(void 0!==u.constructor)return null;null!=i.__h&&(s=i.__h,e=u.__e=i.__e,u.__h=null,r=[e]),(a=n.__b)&&a(u);try{n:if("function"==typeof P){if(g=u.props,w=(a=P.contextType)&&t[a.__c],x=a?w?w.props.value:a.__:t,i.__c?b=(v=u.__c=i.__c).__=v.__E:("prototype"in P&&P.prototype.render?u.__c=v=new P(g,x):(u.__c=v=new p$1(g,x),v.constructor=P,v.render=M),w&&w.sub(v),v.props=g,v.state||(v.state={}),v.context=x,v.__n=t,h=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=P.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=c$1({},v.__s)),c$1(v.__s,P.getDerivedStateFromProps(g,v.__s))),d=v.props,_=v.state,h)null==P.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount);else {if(null==P.getDerivedStateFromProps&&g!==d&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(g,x),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(g,v.__s,x)||u.__v===i.__v){v.props=g,v.state=v.__s,u.__v!==i.__v&&(v.__d=!1),v.__v=u,u.__e=i.__e,u.__k=i.__k,u.__k.forEach(function(n){n&&(n.__=u);}),v.__h.length&&f.push(v);break n}null!=v.componentWillUpdate&&v.componentWillUpdate(g,v.__s,x),null!=v.componentDidUpdate&&v.__h.push(function(){v.componentDidUpdate(d,_,k);});}v.context=x,v.props=g,v.state=v.__s,(a=n.__r)&&a(u),v.__d=!1,v.__v=u,v.__P=l,a=v.render(v.props,v.state,v.context),v.state=v.__s,null!=v.getChildContext&&(t=c$1(c$1({},t),v.getChildContext())),h||null==v.getSnapshotBeforeUpdate||(k=v.getSnapshotBeforeUpdate(d,_)),A=null!=a&&a.type===y&&null==a.key?a.props.children:a,m$1(l,Array.isArray(A)?A:[A],u,i,t,o,r,f,e,s),v.base=u.__e,u.__h=null,v.__h.length&&f.push(v),b&&(v.__E=v.__=null),v.__e=!1;}else null==r&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=j$1(i.__e,u,i,t,o,r,f,s);(a=n.diffed)&&a(u);}catch(l){u.__v=null,(s||null!=r)&&(u.__e=e,u.__h=!!s,r[r.indexOf(e)]=null),n.__e(l,u,i);}}function T(l,u){n.__c&&n.__c(u,l),l.some(function(u){try{l=u.__h,u.__h=[],l.some(function(n){n.call(u);});}catch(l){n.__e(l,u.__v);}});}function j$1(n,l,u,i,t,o,e,c){var a,v,h,y,p=u.props,d=l.props,_=l.type,k=0;if("svg"===_&&(t=!0),null!=o)for(;k<o.length;k++)if((a=o[k])&&(a===n||(_?a.localName==_:3==a.nodeType))){n=a,o[k]=null;break}if(null==n){if(null===_)return document.createTextNode(d);n=t?document.createElementNS("http://www.w3.org/2000/svg",_):document.createElement(_,d.is&&d),o=null,c=!1;}if(null===_)p===d||c&&n.data===d||(n.data=d);else {if(o=o&&f$1.slice.call(n.childNodes),v=(p=u.props||r$1).dangerouslySetInnerHTML,h=d.dangerouslySetInnerHTML,!c){if(null!=o)for(p={},y=0;y<n.attributes.length;y++)p[n.attributes[y].name]=n.attributes[y].value;(h||v)&&(h&&(v&&h.__html==v.__html||h.__html===n.innerHTML)||(n.innerHTML=h&&h.__html||""));}if(A(n,d,p,t,c),h)l.__k=[];else if(k=l.props.children,m$1(n,Array.isArray(k)?k:[k],l,u,i,t&&"foreignObject"!==_,o,e,n.firstChild,c),null!=o)for(k=o.length;k--;)null!=o[k]&&s$1(o[k]);c||("value"in d&&void 0!==(k=d.value)&&(k!==n.value||"progress"===_&&!k)&&C(n,"value",k,p.value,!1),"checked"in d&&void 0!==(k=d.checked)&&k!==n.checked&&C(n,"checked",k,p.checked,!1));}return n}function z(l,u,i){try{"function"==typeof l?l(u):l.current=u;}catch(l){n.__e(l,i);}}function L(l,u,i){var t,o,r;if(n.unmount&&n.unmount(l),(t=l.ref)&&(t.current&&t.current!==l.__e||z(t,null,u)),i||"function"==typeof l.type||(i=null!=(o=l.__e)),l.__e=l.__d=void 0,null!=(t=l.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount();}catch(l){n.__e(l,u);}t.base=t.__P=null;}if(t=l.__k)for(r=0;r<t.length;r++)t[r]&&L(t[r],u,i);null!=o&&s$1(o);}function M(n,l,u){return this.constructor(n,u)}function N(l,u,i){var t,o,e;n.__&&n.__(l,u),o=(t="function"==typeof i)?null:i&&i.__k||u.__k,e=[],I(u,l=(!t&&i||u).__k=a$1(y,null,[l]),o||r$1,r$1,void 0!==u.ownerSVGElement,!t&&i?[i]:o?null:u.firstChild?f$1.slice.call(u.childNodes):null,e,!t&&i?i:o?o.__e:u.firstChild,t),T(e,l);}n={__e:function(n,l){for(var u,i,t;l=l.__;)if((u=l.__c)&&!u.__)try{if((i=u.constructor)&&null!=i.getDerivedStateFromError&&(u.setState(i.getDerivedStateFromError(n)),t=u.__d),null!=u.componentDidCatch&&(u.componentDidCatch(n),t=u.__d),t)return u.__E=u}catch(l){n=l;}throw n},__v:0},p$1.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=c$1({},this.state),"function"==typeof n&&(n=n(c$1({},u),this.props)),n&&c$1(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),k$1(this));},p$1.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),k$1(this));},p$1.prototype.render=y,u$1=[],i$1="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,b$1.__r=0,0;

const Styles = {
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

function Dialog({ children }) {
    return (a$1("div", null,
        a$1("div", { style: Styles.Darken }),
        a$1("div", { style: Styles.DialogOuter },
            a$1("div", { style: Styles.DialogInner }, children))));
}

var t,u,r,o=0,i=[],c=n.__b,f=n.__r,e=n.diffed,a=n.__c,v=n.unmount;function m(t,r){n.__h&&n.__h(u,t,o||r),o=0;var i=u.__H||(u.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({}),i.__[t]}function l(n){return o=1,p(w,n)}function p(n,r,o){var i=m(t++,2);return i.t=n,i.__c||(i.__=[o?o(r):w(void 0,r),function(n){var t=i.t(i.__[0],n);i.__[0]!==t&&(i.__=[t,i.__[1]],i.__c.setState({}));}],i.__c=u),i.__}function h(r,o){var i=m(t++,4);!n.__s&&k(i.__H,o)&&(i.__=r,i.__H=o,u.__h.push(i));}function s(n){return o=5,d(function(){return {current:n}},[])}function d(n,u){var r=m(t++,7);return k(r.__H,u)&&(r.__=n(),r.__H=u,r.__h=n),r.__}function x(){i.forEach(function(t){if(t.__P)try{t.__H.__h.forEach(g),t.__H.__h.forEach(j),t.__H.__h=[];}catch(u){t.__H.__h=[],n.__e(u,t.__v);}}),i=[];}n.__b=function(n){u=null,c&&c(n);},n.__r=function(n){f&&f(n),t=0;var r=(u=n.__c).__H;r&&(r.__h.forEach(g),r.__h.forEach(j),r.__h=[]);},n.diffed=function(t){e&&e(t);var o=t.__c;o&&o.__H&&o.__H.__h.length&&(1!==i.push(o)&&r===n.requestAnimationFrame||((r=n.requestAnimationFrame)||function(n){var t,u=function(){clearTimeout(r),b&&cancelAnimationFrame(t),setTimeout(n);},r=setTimeout(u,100);b&&(t=requestAnimationFrame(u));})(x)),u=void 0;},n.__c=function(t,u){u.some(function(t){try{t.__h.forEach(g),t.__h=t.__h.filter(function(n){return !n.__||j(n)});}catch(r){u.some(function(n){n.__h&&(n.__h=[]);}),u=[],n.__e(r,t.__v);}}),a&&a(t,u);},n.unmount=function(t){v&&v(t);var u=t.__c;if(u&&u.__H)try{u.__H.__.forEach(g);}catch(t){n.__e(t,u.__v);}};var b="function"==typeof requestAnimationFrame;function g(n){var t=u;"function"==typeof n.__c&&n.__c(),u=t;}function j(n){var t=u;n.__c=n.__(),u=t;}function k(n,t){return !n||n.length!==t.length||t.some(function(t,u){return t!==n[u]})}function w(n,t){return "function"==typeof t?t(n):t}

function resolveText({ message, messageCode, messageParams }) {
    return message.replace(/\{\w+\}/ig, n => messageParams[n.substr(1, n.length - 2)]);
}

function LoginDialog({ title, alerts, fields, onCancel, onSubmit, }) {
    const [params, setParams] = l({});
    const firstFieldRef = s();
    h(() => { var _a; return (_a = firstFieldRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, []);
    return (a$1(Dialog, null,
        a$1(y, null,
            a$1("h3", { style: Styles.WindowHeader }, title),
            alerts.map((alert) => (a$1("p", { style: Styles.Alert[alert.type] }, resolveText(alert)))),
            a$1("form", { onSubmit: ev => {
                    ev.preventDefault();
                    onSubmit(params);
                } }, Object.entries(fields).map(([fieldName, { type, label, placeholder }], idx) => (a$1("label", { style: Styles.Label },
                label ? `${label}: ` : '',
                a$1("input", { ref: idx === 0 ? firstFieldRef : undefined, type: type, name: fieldName, autoComplete: "on", style: Styles.Input, autoFocus: true, placeholder: placeholder, value: params[fieldName] || '', onInput: (ev) => { var _a; return setParams({ ...params, [fieldName]: valueTransformer(type, (_a = ev.target) === null || _a === void 0 ? void 0 : _a['value']) }); } })))))),
        a$1("div", { style: Styles.ButtonsDiv },
            a$1("button", { type: "submit", style: Styles.Button, onClick: () => onSubmit(params) }, "Submit"),
            a$1("button", { style: Styles.Button, onClick: onCancel }, "Cancel"))));
}
function valueTransformer(type, value) {
    switch (type) {
        case "email": return value.toLowerCase();
        case "otp": return value.toUpperCase();
        default: return value;
    }
}

class LoginGui extends p$1 {
    constructor(props) {
        super(props);
        this.observer = (userInteraction) => this.setState({ userInteraction });
        this.state = { userInteraction: undefined };
    }
    componentDidMount() {
        this.subscription = from$1(this.props.db.cloud.userInteraction).subscribe(this.observer);
    }
    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            delete this.subscription;
        }
    }
    render(props, { userInteraction }) {
        if (!userInteraction)
            return null;
        //if (props.db.cloud.userInteraction.observers.length > 1) return null; // Someone else subscribes.
        return a$1(LoginDialog, Object.assign({}, userInteraction));
    }
}
function setupDefaultGUI(db) {
    const el = document.createElement('div');
    document.body.appendChild(el);
    N(a$1(LoginGui, { db: db.vip }), el);
    let closed = false;
    return {
        unsubscribe() {
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
    const origIdbName = dexie.name;
    //
    //
    //
    const currentUserEmitter = new BehaviorSubject(UNAUTHORIZED_USER);
    const subscriptions = [];
    // local sync worker - used when there's no service worker.
    let localSyncWorker = null;
    dexie.on('ready', async (dexie) => {
        try {
            await onDbReady(dexie);
        }
        catch (error) {
            console.error(error);
            // Make sure to succeed with database open even if network is down.
        }
    }, true // true = sticky
    );
    /** Void starting subscribers after a close has happened. */
    let closed = false;
    function throwIfClosed() {
        if (closed)
            throw new Dexie.DatabaseClosedError();
    }
    dbOnClosed(dexie, () => {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
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
        syncState: new BehaviorSubject({ phase: 'initial' }),
        persistedSyncState: new BehaviorSubject(undefined),
        userInteraction: new BehaviorSubject(undefined),
        async login(hint) {
            const db = DexieCloudDB(dexie);
            await db.cloud.sync();
            await login(db, hint);
        },
        configure(options) {
            dexie.cloud.options = options;
            if (options.databaseUrl) {
                // @ts-ignore
                dexie.name = `${origIdbName}-${getDbNameFromDbUrl(options.databaseUrl)}`;
                DexieCloudDB(dexie).reconfigure(); // Update observable from new dexie.name
            }
            updateSchemaFromOptions(dexie.cloud.schema, dexie.cloud.options);
        },
        async sync({ wait, force } = { wait: true, force: false }) {
            if (wait === undefined)
                wait = true;
            const db = DexieCloudDB(dexie);
            if (force) {
                const syncState = db.cloud.persistedSyncState.value;
                triggerSync(db);
                if (wait) {
                    const newSyncState = await db.cloud.persistedSyncState
                        .pipe(filter((newSyncState) => (newSyncState === null || newSyncState === void 0 ? void 0 : newSyncState.timestamp) != null &&
                        (!syncState || newSyncState.timestamp > syncState.timestamp)), take(1))
                        .toPromise();
                    if (newSyncState === null || newSyncState === void 0 ? void 0 : newSyncState.error) {
                        throw new Error(`Sync error: ` + newSyncState.error);
                    }
                }
            }
            else if (await isSyncNeeded(db)) {
                const syncState = db.cloud.persistedSyncState.value;
                triggerSync(db);
                if (wait) {
                    console.debug('db.cloud.login() is waiting for sync completion...');
                    await from$1(liveQuery(async () => {
                        const syncNeeded = await isSyncNeeded(db);
                        const newSyncState = await db.getPersistedSyncState();
                        if ((newSyncState === null || newSyncState === void 0 ? void 0 : newSyncState.timestamp) !== (syncState === null || syncState === void 0 ? void 0 : syncState.timestamp) &&
                            (newSyncState === null || newSyncState === void 0 ? void 0 : newSyncState.error))
                            throw new Error(`Sync error: ` + newSyncState.error);
                        return syncNeeded;
                    }))
                        .pipe(filter((isNeeded) => !isNeeded), take(1))
                        .toPromise();
                    console.debug('Done waiting for sync completion because we have nothing to push anymore');
                }
            }
        },
    };
    dexie.Version.prototype['_parseStoresSpec'] = Dexie.override(dexie.Version.prototype['_parseStoresSpec'], (origFunc) => overrideParseStoresSpec(origFunc, dexie));
    dexie.use(createMutationTrackingMiddleware({
        currentUserObservable: dexie.cloud.currentUser,
        db: DexieCloudDB(dexie),
    }));
    dexie.use(createImplicitPropSetterMiddleware(DexieCloudDB(dexie)));
    dexie.use(createIdGenerationMiddleware(DexieCloudDB(dexie)));
    async function onDbReady(dexie) {
        var _a, _b, _c, _d, _e, _f;
        closed = false; // As Dexie calls us, we are not closed anymore. Maybe reopened? Remember db.ready event is registered with sticky flag!
        const db = DexieCloudDB(dexie);
        // Setup default GUI:
        if (!IS_SERVICE_WORKER) {
            if (!((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.customLoginGui)) {
                subscriptions.push(setupDefaultGUI(dexie));
            }
            subscriptions.push(db.syncStateChangedEvent.subscribe(dexie.cloud.syncState));
        }
        //verifyConfig(db.cloud.options); Not needed (yet at least!)
        // Verify the user has allowed version increment.
        if (!db.tables.every((table) => table.core)) {
            throwVersionIncrementNeeded();
        }
        const swRegistrations = 'serviceWorker' in navigator
            ? await navigator.serviceWorker.getRegistrations()
            : [];
        const initiallySynced = await db.transaction('rw', db.$syncState, async () => {
            var _a, _b;
            const { options, schema } = db.cloud;
            const [persistedOptions, persistedSchema, persistedSyncState] = await Promise.all([
                db.getOptions(),
                db.getSchema(),
                db.getPersistedSyncState(),
            ]);
            if (!options) {
                // Options not specified programatically (use case for SW!)
                // Take persisted options:
                db.cloud.options = persistedOptions || null;
            }
            else if (!persistedOptions ||
                JSON.stringify(persistedOptions) !== JSON.stringify(options)) {
                // Update persisted options:
                await db.$syncState.put(options, 'options');
            }
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
            if (!schema) {
                // Database opened dynamically (use case for SW!)
                // Take persisted schema:
                db.cloud.schema = persistedSchema || null;
            }
            else if (!persistedSchema ||
                JSON.stringify(persistedSchema) !== JSON.stringify(schema)) {
                // Update persisted schema (but don't overwrite table prefixes)
                const newPersistedSchema = persistedSchema || {};
                for (const [table, tblSchema] of Object.entries(schema)) {
                    const newTblSchema = newPersistedSchema[table];
                    if (!newTblSchema) {
                        newPersistedSchema[table] = { ...tblSchema };
                    }
                    else {
                        newTblSchema.markedForSync = tblSchema.markedForSync;
                        tblSchema.deleted = newTblSchema.deleted;
                        newTblSchema.generatedGlobalId = tblSchema.generatedGlobalId;
                    }
                }
                await db.$syncState.put(newPersistedSchema, 'schema');
                // Make sure persisted table prefixes are being used instead of computed ones:
                // Let's assign all props as the newPersistedSchems should be what we should be working with.
                Object.assign(schema, newPersistedSchema);
            }
            return persistedSyncState === null || persistedSyncState === void 0 ? void 0 : persistedSyncState.initiallySynced;
        });
        if (initiallySynced) {
            db.setInitiallySynced(true);
        }
        verifySchema(db);
        if (((_b = db.cloud.options) === null || _b === void 0 ? void 0 : _b.databaseUrl) && !initiallySynced) {
            await performInitialSync(db, db.cloud.options, db.cloud.schema);
            db.setInitiallySynced(true);
        }
        // Manage CurrentUser observable:
        throwIfClosed();
        if (!IS_SERVICE_WORKER) {
            subscriptions.push(liveQuery(() => db.getCurrentUser()).subscribe(currentUserEmitter));
            // Manage PersistendSyncState observable:
            subscriptions.push(liveQuery(() => db.getPersistedSyncState()).subscribe(db.cloud.persistedSyncState));
        }
        // HERE: If requireAuth, do athentication now.
        if ((_c = db.cloud.options) === null || _c === void 0 ? void 0 : _c.requireAuth) {
            await login(db);
        }
        if (localSyncWorker)
            localSyncWorker.stop();
        localSyncWorker = null;
        throwIfClosed();
        if (db.cloud.usingServiceWorker && ((_d = db.cloud.options) === null || _d === void 0 ? void 0 : _d.databaseUrl)) {
            registerSyncEvent(db).catch(() => { });
            registerPeriodicSyncEvent(db).catch(() => { });
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
            subscriptions.push(fromEvent(self, 'online').subscribe(() => {
                console.debug('online!');
                db.syncStateChangedEvent.next({
                    phase: 'not-in-sync',
                });
                triggerSync(db);
            }), fromEvent(self, 'offline').subscribe(() => {
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
    }
}
dexieCloud.version = '1.0.0-beta.6';
Dexie.Cloud = dexieCloud;

// In case the SW lives for a while, let it reuse already opened connections:
const managedDBs = new Map();
function getDbNameFromTag(tag) {
    return tag.startsWith('dexie-cloud:') && tag.split(':')[1];
}
async function syncDB(dbName) {
    var _a;
    let db = managedDBs.get(dbName);
    if (!db) {
        console.debug('Dexie Cloud SW: Creating new Dexie instance for', dbName);
        const dexie = new Dexie(dbName, { addons: [dexieCloud] });
        db = DexieCloudDB(dexie);
        dexie.on('versionchange', stopManagingDB);
        await db.dx.open(); // Makes sure db.cloud.options and db.cloud.schema are read from db,
        if (!managedDBs.get(dbName)) { // Avoid race conditions.
            managedDBs.set(dbName, db);
        }
    }
    if (!((_a = db.cloud.options) === null || _a === void 0 ? void 0 : _a.databaseUrl)) {
        console.error(`Dexie Cloud: No databaseUrl configured`);
        return; // Nothing to sync.
    }
    if (!db.cloud.schema) {
        console.error(`Dexie Cloud: No schema persisted`);
        return; // Nothing to sync.
    }
    function stopManagingDB() {
        db.dx.on.versionchange.unsubscribe(stopManagingDB);
        if (managedDBs.get(db.name) === db) { // Avoid race conditions.
            managedDBs.delete(db.name);
        }
        db.dx.close();
        return false;
    }
    try {
        console.debug('Dexie Cloud SW: Syncing');
        await syncIfPossible(db, db.cloud.options, db.cloud.schema, { retryImmediatelyOnFetchError: true });
        console.debug('Dexie Cloud SW: Done Syncing');
    }
    catch (e) {
        console.error(`Dexie Cloud SW Error`, e);
        // Error occured. Stop managing this DB until we wake up again by a sync event,
        // which will open a new Dexie and start trying to sync it.
        stopManagingDB();
        if (e.name !== Dexie.errnames.NoSuchDatabase) {
            // Unless the error was that DB doesn't exist, rethrow to trigger sync retry.
            throw e; // Throw e to make syncEvent.waitUntil() receive a rejected promis, so it will retry.
        }
    }
}
// Avoid taking care of events if browser bugs out by using dexie cloud from a service worker.
if (!DISABLE_SERVICEWORKER_STRATEGY) {
    self.addEventListener('sync', (event) => {
        console.debug('SW "sync" Event', event.tag);
        const dbName = getDbNameFromTag(event.tag);
        if (dbName) {
            event.waitUntil(syncDB(dbName));
        }
    });
    self.addEventListener('periodicsync', (event) => {
        console.debug('SW "periodicsync" Event', event.tag);
        const dbName = getDbNameFromTag(event.tag);
        if (dbName) {
            event.waitUntil(syncDB(dbName));
        }
    });
    self.addEventListener('message', (event) => {
        console.debug('SW "message" Event', event.data);
        if (event.data.type === 'dexie-cloud-sync') {
            const { dbName } = event.data;
            // Mimic background sync behavior - retry in X minutes on failure.
            // But lesser timeout and more number of times.
            const syncAndRetry = (num = 1) => {
                return syncDB(dbName).catch(async (e) => {
                    if (num === 3)
                        throw e;
                    await sleep(60000); // 1 minute
                    syncAndRetry(num + 1);
                });
            };
            if ('waitUntil' in event) {
                event.waitUntil(syncAndRetry());
            }
            else {
                syncAndRetry();
            }
        }
    });
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=service-worker.js.map
