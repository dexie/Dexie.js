import {_global, slice, isArray, doFakeAutoComplete, messageAndStack} from './utils';
import { nop } from './chaining-functions';
import Events from './Events';

//
// Promise Class
//
// A variant of promise-light (https://github.com/taylorhakes/promise-light) by https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
//
// Modified by David Fahlander to be indexedDB compliant (See discussion: https://github.com/promises-aplus/promises-spec/issues/45) .
// This implementation will not use setTimeout or setImmediate when it's not needed. The behavior is 100% Promise/A+ compliant since
// the caller of new Promise() can be certain that the promise wont be triggered the lines after constructing the promise. We fix this by using the member variable constructing to check
// whether the object is being constructed when reject or resolve is called. If so, the use setTimeout/setImmediate to fulfill the promise, otherwise, we know that it's not needed.
//
// This topic was also discussed in the following thread: https://github.com/promises-aplus/promises-spec/issues/45 and this implementation solves that issue.
//
// Another feature with this Promise implementation is that reject will return false in case no one catched the reject call. This is used
// to stopPropagation() on the IDBRequest error event in case it was catched but not otherwise.
//
// Also, the event new Promise().onuncatched is called in case no one catches a reject call. This is used for us to manually bubble any request
// errors to the transaction. We must not rely on IndexedDB implementation to do this, because it only does so when the source of the rejection
// is an error event on a request, not in case an ordinary exception is thrown.

var _asap = _global.setImmediate || function(fn) {
    var args = slice(arguments, 1);

        // If not FF13 and earlier failed, we could use this call here instead: setTimeout.call(this, [fn, 0].concat(arguments));
    setTimeout(function() {
        fn.apply(_global, args);
    }, 0);
};

doFakeAutoComplete(function () {
    // Simplify the job for VS Intellisense. This piece of code is one of the keys to the new marvellous intellisense support in Dexie.
    _asap = asap = enqueueImmediate = function(fn) {
        var args = arguments; setTimeout(function() { fn.apply(_global, slice(args, 1)); }, 0);
    };
});

var asap = _asap,
    isRootExecution = true;

var operationsQueue = [];
var tickFinalizers = [];
var enqueueImmediate = function (fn) {
    operationsQueue.push([fn, slice(arguments, 1)]);
}

function executeOperationsQueue() {
    var queue = operationsQueue;
    operationsQueue = [];
    for (var i = 0, l = queue.length; i < l; ++i) {
        var item = queue[i];
        item[0].apply(_global, item[1]);
    }
}

export default function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = null; // null (=pending), false (=rejected) or true (=resolved)
    this._value = null; // error or result
    this._deferreds = [];
    this._catched = false; // for onuncatched
    //this._id = ++PromiseID;
    var self = this;
    var constructing = true;
    this._PSD = Promise.PSD;

    try {
        doResolve(this, fn, function (data) {
            if (constructing)
                asap(resolve, self, data);
            else
                resolve(self, data);
        }, function (reason) {
            if (constructing) {
                asap(reject, self, reason);
                return false;
            } else {
                return reject(self, reason);
            }
        });
    } finally {
        constructing = false;
    }
}

function handle(self, deferred) {
    if (self._state === null) {
        self._deferreds.push(deferred);
        return;
    }

    var cb = self._state ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
        // This Deferred doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
        return (self._state ? deferred.resolve : deferred.reject)(self._value);
    }
    var ret, isRootExec = isRootExecution;
    isRootExecution = false;
    asap = enqueueImmediate;
    try {
        var outerPSD = Promise.PSD;
        Promise.PSD = self._PSD;
        ret = cb(self._value);
        if (!self._state && (!ret || typeof ret.then !== 'function' || ret._state !== false)) setCatched(self); // Caller did 'return Promise.reject(err);' - don't regard it as catched!
        deferred.resolve(ret);
    } catch (e) {
        deferred.reject(e);
    } finally {
        Promise.PSD = outerPSD;
        if (isRootExec) {
            do {
                while (operationsQueue.length > 0) executeOperationsQueue();
                var finalizer = tickFinalizers.pop();
                if (finalizer) try {finalizer();} catch(e){}
            } while (tickFinalizers.length > 0 || operationsQueue.length > 0);
            asap = _asap;
            isRootExecution = true;
        }
    }
}

function _rootExec(fn) {
    var isRootExec = isRootExecution;
    isRootExecution = false;
    asap = enqueueImmediate;
    try {
        return fn();
    } finally {
        if (isRootExec) {
            do {
                while (operationsQueue.length > 0) executeOperationsQueue();
                var finalizer = tickFinalizers.pop();
                if (finalizer) try { finalizer(); } catch (e) { }
            } while (tickFinalizers.length > 0 || operationsQueue.length > 0);
            asap = _asap;
            isRootExecution = true;
        }
    }
}

function setCatched(promise) {
    promise._catched = true;
    if (promise._parent && !promise._parent._catched) setCatched(promise._parent);
}

function resolve(promise, newValue) {
    var outerPSD = Promise.PSD;
    Promise.PSD = promise._PSD;
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        if (newValue === promise) throw new TypeError('A promise cannot be resolved with itself.');
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            if (typeof newValue.then === 'function') {
                if (newValue instanceof Promise && newValue._state !== null) {
                    promise._state = newValue._state;
                    promise._value = newValue._value;
                    finale.call(promise);
                    return;
                }
                doResolve(promise, function (resolve, reject) {
                    //newValue instanceof Promise ? newValue._then(resolve, reject) : newValue.then(resolve, reject);
                    newValue.then(resolve, reject);
                }, function (data) {
                    resolve(promise, data);
                }, function (reason) {
                    reject(promise, reason);
                });
                return;
            }
        }
        promise._state = true;
        promise._value = newValue;
        finale.call(promise);
    } catch (e) { reject(e); } finally {
        Promise.PSD = outerPSD;
    }
}

function reject(promise, newValue) {
    var outerPSD = Promise.PSD;
    Promise.PSD = promise._PSD;
    promise._state = false;
    promise._value = newValue;

    finale.call(promise);
    if (!promise._catched ) {
        try {
            if (promise.onuncatched)
                promise.onuncatched(promise._value);
            else
                Promise.on.error.fire(promise._value);
        } catch (e) {
        }
    }
    Promise.PSD = outerPSD;
    return promise._catched;
}

function finale() {
    for (var i = 0, len = this._deferreds.length; i < len; i++) {
        handle(this, this._deferreds[i]);
    }
    this._deferreds = [];
}

function Deferred(onFulfilled, onRejected, resolve, reject) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
}

/**
    * Take a potentially misbehaving resolver function and make sure
    * onFulfilled and onRejected are only called once.
    *
    * Makes no guarantees about asynchrony.
    */
function doResolve(promise, fn, onFulfilled, onRejected) {
    var done = false;
    try {
        fn(function Promise_resolve(value) {
            if (done) return;
            done = true;
            onFulfilled(value);
        }, function Promise_reject(reason) {
            if (done) return promise._catched;
            done = true;
            return onRejected(reason);
        });
    } catch (ex) {
        if (done) return;
        return onRejected(ex);
    }
}

Promise.all = function () {
    var args = slice(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

    return new Promise(function (resolve, reject) {
        if (args.length === 0) return resolve([]);
        var remaining = args.length;
        function res(i, val) {
            try {
                if (val && (typeof val === 'object' || typeof val === 'function')) {
                    var then = val.then;
                    if (typeof then === 'function') {
                        then.call(val, function (val) { res(i, val); }, reject);
                        return;
                    }
                }
                args[i] = val;
                if (--remaining === 0) {
                    resolve(args);
                }
            } catch (ex) {
                reject(ex);
            }
        }
        for (var i = 0; i < args.length; i++) {
            res(i, args[i]);
        }
    });
};

/* Prototype Methods */
Promise.prototype.then = function (onFulfilled, onRejected) {
    var self = this;
    var p = new Promise(function (resolve, reject) {
        if (self._state === null)
            handle(self, new Deferred(onFulfilled, onRejected, resolve, reject));
        else
            asap(handle, self, new Deferred(onFulfilled, onRejected, resolve, reject));
    });
    p._PSD = this._PSD;
    p.onuncatched = this.onuncatched; // Needed when exception occurs in a then() clause of a successful parent promise. Want onuncatched to be called even in callbacks of callbacks of the original promise.
    p._parent = this; // Used for recursively calling onuncatched event on self and all parents.
    return p;
};

Promise.prototype._then = function (onFulfilled, onRejected) {
    handle(this, new Deferred(onFulfilled, onRejected, nop,nop));
};

Promise.prototype['catch'] = function (onRejected) {
    if (arguments.length === 1) return this.then(null, onRejected);
    // First argument is the Error type to catch
    var type = arguments[0], callback = arguments[1];
    if (typeof type === 'function') return this.then(null, function (e) {
        // Catching errors by its constructor type (similar to java / c++ / c#)
        // Sample: promise.catch(TypeError, function (e) { ... });
        if (e instanceof type) return callback(e); else return Promise.reject(e);
    });
    else return this.then(null, function (e) {
        // Catching errors by the error.name property. Makes sense for indexedDB where error type
        // is always DOMError but where e.name tells the actual error type.
        // Sample: promise.catch('ConstraintError', function (e) { ... });
        if (e && e.name === type) return callback(e); else return Promise.reject(e);
    });
};

Promise.prototype['finally'] = function (onFinally) {
    return this.then(function (value) {
        onFinally();
        return value;
    }, function (err) {
        onFinally();
        return Promise.reject(err);
    });
};

Promise.prototype.onuncatched = null; // Optional event triggered if promise is rejected but no one listened.

Promise.resolve = function (value) {
    if (value && typeof value.then === 'function') return value;
    var p = new Promise(function () { });
    p._state = true;
    p._value = value;
    return p;
};

Promise.reject = function (value) {
    var p = new Promise(function () { });
    p._state = false;
    p._value = value;
    return p;
};

Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
        values.map(function (value) {
            value.then(resolve, reject);
        });
    });
};

Promise.PSD = null; // Promise Specific Data - a TLS Pattern (Thread Local Storage) for Promises. TODO: Rename Promise.PSD to Promise.data

Promise.newPSD = function (fn) {
    // Create new PSD scope (Promise Specific Data)
    var outerScope = Promise.PSD;
    Promise.PSD = outerScope ? Object.create(outerScope) : {};
    try {
        return fn();
    } finally {
        Promise.PSD = outerScope;
    }
};

Promise.usePSD = function (psd, fn) {
    var outerScope = Promise.PSD;
    Promise.PSD = psd;
    try {
        return fn();
    } finally {
        Promise.PSD = outerScope;
    }
};

Promise._rootExec = _rootExec;
Promise._tickFinalize = function(callback) {
    if (isRootExecution) throw new Error("Not in a virtual tick");
    tickFinalizers.push(callback);
};

Promise.on = Events(null, {"error": [
    (f1,f2)=>f2, // Only use the most recent handler (only allow one handler at a time).
    defaultErrorHandler] // Default to defaultErrorHandler
});

// By default, log uncaught errors to the console
function defaultErrorHandler(e) {
    console.warn(`Uncaught Promise: ${messageAndStack(e)}`);
}
