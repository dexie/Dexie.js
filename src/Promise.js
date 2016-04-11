import {_global, slice, isArray, doFakeAutoComplete, messageAndStack, miniTryCatch, extendProto} from './utils';
import {reverseStoppableEventChain} from './chaining-functions';
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

var _asap = (typeof setImmediate === 'undefined' ? function(fn, args) {
    // BUGBUG: FF13 and earlier fails passing correct arguments to setTimout callback. TODO: Should safe up here and use closure and upgrade after successful test. 
    setTimeout(function(fn, args){
        isRootExecution = false;
        asap = enqueueImmediate;
        fn.apply(null, args);
        endMicroTickScope();
    }, 0, fn, args);
} : function (fn, args) {
    setImmediate(function(fn, args){
        //try {
        isRootExecution = false;
        asap = enqueueImmediate;
        fn.apply(null, args);
        endMicroTickScope();
        //} catch (e) {alert (e);}
    }, fn, args);
});

doFakeAutoComplete(function () {
    // Simplify the job for VS Intellisense. This piece of code is one of the keys to the new marvellous intellisense support in Dexie.
    _asap = asap = enqueueImmediate = function(fn) {
        var args = arguments; setTimeout(function() { fn.apply(_global, slice(args, 1)); }, 0);
    };
});

var asap = _asap,
    isRootExecution = true,
    tickErrors = [];

var operationsQueue = [];
var tickFinalizers = [];
var enqueueImmediate = function (fn, args) {
    operationsQueue.push([fn, args]);
}

export default function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = null; // null (=pending), false (=rejected) or true (=resolved)
    this._value = null; // error or result
    this._deferreds = [];//new Array(1); // Normally there will only be one deferred. Optimize for this.
    this._catched = false; // for onuncatched
    this._PSD = Promise.PSD;

    this._doResolve(fn);
}


extendProto(Promise.prototype, {
    /**
    * Take a potentially misbehaving resolver function and make sure
    * onFulfilled and onRejected are only called once.
    *
    * Makes no guarantees about asynchrony.
    */
    _doResolve: function (fn) {
        // Promise Resolution Procedure:
        // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        var done = false;
        try {
            fn(value => {
                if (done) return;
                this._state = true;
                this._value = value;
                if (value === this) throw new TypeError('A promise cannot be resolved with itself.');
                if (value && (typeof value === 'object' || typeof value === 'function')) {
                    if (typeof value.then === 'function') {
                        this._doResolve((resolve, reject) => {
                            value.then(resolve, reject);
                        });
                        return;
                    }
                }
                done = true;
                this._finale();
            }, reason => {
                if (done) return;
                done = true;
                this._state = false;
                this._value = reason;
                this._finale();
            });
        } catch (ex) {
            if (done) return;
            done = true;
            this._state = false;
            this._value = ex;
            this._finale();
        }
    },

    _finale: function () {
        var wasRootExec = beginMicroTickScope();
        for (var i = 0, len = this._deferreds.length; i < len; i++) {
            handle(this, this._deferreds[i]);
        }
        this._deferreds = [];
        if (wasRootExec) endMicroTickScope();
        else if (this._state === false) {
            addTickError(this);
        }
    },
    
    then: function (onFulfilled, onRejected) {
        var p = new Promise((resolve, reject) => {
            handle(this, new Deferred(onFulfilled, onRejected, resolve, reject));
        });
        p._PSD = this._PSD;
        p.onuncatched = this.onuncatched; // Needed when exception occurs in a then() clause of a successful parent promise. Want onuncatched to be called even in callbacks of callbacks of the original promise.
        p._parent = this; // Used for recursively calling setCatched() on self and all parents.
        return p;
    },

    'catch': function (onRejected) {
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
    },

    'finally': function (onFinally) {
        return this.then(function (value) {
            onFinally();
            return value;
        }, function (err) {
            onFinally();
            return Promise.reject(err);
        });
    },

    onuncatched: null // Optional event triggered if promise is rejected but no one listened.
});

function handle(promise, deferred) {
    if (promise._state === null) {
        promise._deferreds.push(deferred);
        return;
    }

    var cb = promise._state ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
        // This Deferred doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
        return (promise._state ? deferred.resolve : deferred.reject)(promise._value);
    }
    asap(call, [promise, cb, deferred]);
}

function call (promise, cb, deferred) {
    var outerPSD = Promise.PSD;
    try {
        Promise.PSD = promise._PSD;
        var ret = cb(promise._value);
        if (!promise._state && (!ret ||
              typeof ret.then !== 'function' ||
              ret._state !== false)) // If 'return Promise.reject(err);' - don't regard it as catched!
            setCatched(promise); 
        deferred.resolve(ret);
    } catch (e) {
        deferred.reject(e);
    } finally {
        Promise.PSD = outerPSD;
    }
}

function Deferred(onFulfilled, onRejected, resolve, reject) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
}

extendProto(Promise, {
    all: function () {
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
    },
    
    resolve: value => {
        if (value && typeof value.then === 'function') return value;
        var p = new Promise(function () { });
        p._state = true;
        p._value = value;
        return p;
    },
    
    reject: reason => {
        var p = new Promise(function () { });
        p._state = false;
        p._value = reason;
        return p;
    },
    
    race: values => new Promise((resolve, reject) => {
        values.map(value => Promise.resolve(value).then(resolve, reject));
    }),
    
    PSD: null,// Promise Specific Data - a TLS Pattern (Thread Local Storage) for Promises.
    
    newPSD: fn => {
        // Create new PSD scope (Promise Specific Data)
        var outerScope = Promise.PSD;
        Promise.PSD = outerScope ? Object.create(outerScope) : {};
        try {
            return fn();
        } finally {
            Promise.PSD = outerScope;
        }
    },

    usePSD: (psd, fn) => {
        var outerScope = Promise.PSD;
        Promise.PSD = psd;
        try {
            return fn();
        } finally {
            Promise.PSD = outerScope;
        }
    },

    _rootExec: _rootExec,
    
    _tickFinalize: callback => {
        if (isRootExecution) throw new Error("Not in a virtual tick");
        tickFinalizers.push(callback);
    },
    
    on: Events(null, {"error": [
        reverseStoppableEventChain,
        defaultErrorHandler] // Default to defaultErrorHandler
    }),
    
    _isRootExec: {get: ()=> isRootExecution}
});

function addTickError(promise) {
    // If this error was already added, replace it with given promise, because
    // parents are added later and the topmost parent promise is the interesting one.
    // Else push p to tickErrors.
    if (!tickErrors.some((p,i) =>
        p._value === promise._value && (tickErrors[i] = promise) 
    )) tickErrors.push(promise);
}

function beginMicroTickScope() {
    var isRootExec = isRootExecution;
    isRootExecution = false;
    asap = enqueueImmediate;
    return isRootExec;
}

function endMicroTickScope() {
    var queue, i, l;
    do {
        while (operationsQueue.length > 0) {
            queue = operationsQueue;
            operationsQueue = [];
            l = queue.length;
            for (i = 0; i < l; ++i) {
                var item = queue[i];
                item[0].apply(null, item[1]);
            }
        }
        var finalizer = tickFinalizers.pop();
        if (finalizer) try { finalizer(); } catch (e) { }
    } while (tickFinalizers.length > 0 || operationsQueue.length > 0);
    asap = _asap;
    isRootExecution = true;
    if (tickErrors.length) {
        tickErrors.forEach(p => {
            if (!p._catched) miniTryCatch(()=>{
                (!p.onuncatched || p.onuncatched(p._value))
                && Promise.on.error.fire(p._value, p);
            });
        });
        tickErrors = [];
    }
}

function _rootExec(fn) {
    var isRootExec = beginMicroTickScope();
    try {
        return fn();
    } finally {
        if (isRootExec) endMicroTickScope();
    }
}

function setCatched(promise) {
    promise._catched = true;
    if (promise._parent && !promise._parent._catched) setCatched(promise._parent);
}

// By default, log uncaught errors to the console
function defaultErrorHandler(e) {
    console.warn(`Uncaught Promise: ${messageAndStack(e)}`);
}
