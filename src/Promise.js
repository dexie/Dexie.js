import {slice, isArray, doFakeAutoComplete, miniTryCatch, extendProto, setProp, prettyStack} from './utils';
import {reverseStoppableEventChain} from './chaining-functions';
import Events from './Events';

//
// Promise Class for Dexie library
//
// I started out writing this Promise class by copying promise-light (https://github.com/taylorhakes/promise-light) by
// https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
//
// Modifications needed to be done to support indexedDB because it wont accept setTimeout()
// (See discussion: https://github.com/promises-aplus/promises-spec/issues/45) .
// This topic was also discussed in the following thread: https://github.com/promises-aplus/promises-spec/issues/45
//
// This implementation will not use setTimeout or setImmediate when it's not needed. The behavior is 100% Promise/A+ compliant since
// the caller of new Promise() can be certain that the promise wont be triggered the lines after constructing the promise.
//
// In previous versions this was fixed by not calling setTimeout when knowing that the resolve() or reject() came from another
// tick. In Dexie v1.3.7+, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
// another strategy now that simplifies everything a lot: to always execute callbacks in a new tick, but have an own microTick
// engine that is used instead of setImmediate() or setTimeout().
// Promise class has also been optimized a lot with inspiration from bluebird - to avoid closures as much as possible.
// Also with inspiration from bluebird, asyncronic stacks in debug mode.
//
// Specific non-standard features of this Promise class:
// * Async static context support (Promise.PSD)
// * Event triggered when a rejection isn't handled (onuncatched and Promise.on('error'))
// * Promise.track() method built upon PSD, that allows user to track all promises created from current stack frame
//   and above + all promises that those promises starts in turn. 
//
// David Fahlander, https://github.com/dfahlander
//

/* The default "nextTick" function used only for the very first promise in a promise chain.
   As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
   emulated in this module. For indexedDB compatibility, this means that every method needs to 
   execute at least one promise before doing an indexedDB operation. Dexie will always call 
   db.ready().then() for every operation to make sure the indexedDB event is started in an
   emulated micro tick.
*/
var schedulePhysicalTick = (typeof setImmediate === 'undefined' ?
    // No support for setImmediate. No worry, setTimeout is only called
    // once time. Every tick that follows will be our emulated micro tick.
    // Could have uses setTimeout.bind(null, 0, physicalTick) if it wasnt for that FF13 and below has a bug 
    ()=>{setTimeout(physicalTick,0);} : 
    // setImmediate supported. Modern platform. Also supports Function.bind().
    setImmediate.bind(null, physicalTick));
        
        
var isOutsideMicroTick = true, // True when NOT in a virtual microTick.
    needsNewPhysicalTick = true, // True when a push to deferredCallbacks must also schedulePhysicalTick()
    unhandledErrors = [], // Rejected promises that has occured. Used for firing Promise.on.error and promise.onuncatched.
    unhandledErrorsNextTick = [], // Rejected promises with some may be catched in next physical tick.
    // Private representation of public static Promise.debug.
    // By default, it will be true only if platform is a web platform and its page is served from localhost.
    // When debug = true, error's stacks will contain asyncronic long stacks.
    debug = typeof location !== 'undefined' &&
        // By default, use debug mode if served from localhost.
        /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href),
    currentFulfiller = null; // To be able to have long stacks and follow async flow.

// Just a pointer that only this module knows about.
// Used in Promise constructor to emulate a private constructor.
var INTERNAL = {};

// Async stacks (long stacks) must not grow infinitely.
var LONG_STACKS_CLIP_LIMIT = 100,
    // When calling error.stack or promise.stack, limit the number of asyncronic stacks to print out. 
    MAX_LONG_STACKS = 20;

var deferredCallbacks = []; // Callbacks to call in this tick.
var tickFinalizers = []; // Finalizers to call after all microticks are executed.

export default function Promise(fn, _internalState, _internalValue) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');    
    this._deferreds = [];
    var psd = (this._PSD = Promise.PSD);
    this.onuncatched = null; // Optional event triggered if promise is rejected but no one listened.

    if (debug) {
        this._e = new Error();
        this._prev = null;
        this._numPrev = 0;
    }
    
    if (typeof fn !== 'function') {
        if (fn !== INTERNAL) throw new TypeError('not a function');
        // Private constructor (INTERNAL, state, value).
        // Used internally by Promise.resolve() and Promise.reject().
        this._state = _internalState;
        this._value = _internalValue;
        debug && linkToPreviousPromise(this);
        return;
    }
    
    this._state = null; // null (=pending), false (=rejected) or true (=resolved)
    this._value = null; // error or result
    psd && psd.oncreate && psd.oncreate.call(null, this);
    this._doResolve(fn);
    this._constructed = true;
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
        try {
            fn(value => {
                if (this._state !== null) return;
                if (value === this) throw new TypeError('A promise cannot be resolved with itself.');
                if (value && (typeof value === 'object' || typeof value === 'function')) {
                    if (typeof value.then === 'function') {
                        this._doResolve((resolve, reject) => {
                            value instanceof Promise ?
                                handle(value, new Deferred(null, null, resolve, reject)) :
                                value.then(resolve, reject);
                        });
                        return;
                    }
                }
                this._state = true;
                this._value = value;
                this._finale();
            }, this._reject.bind(this)); // If Function.bind is not supported. Exception is thrown here
        } catch (ex) {
            this._reject(ex);
        }
    },
    
    _reject: function (reason) {
        if (this._state !== null) return;
        this._state = false;
        this._value = reason;
        debug && reason !== null && typeof(reason) === 'object' && miniTryCatch(()=>setProp(reason, "stack", {
            get: function (){
                return this.stack;
            }
        }));
        this._finale();
    },

    _finale: function () {
        debug && linkToPreviousPromise(this);
        var wasRootExec = beginMicroTickScope();
        // If this is a failure, add the failure to a list of possibly uncaught errors
        !this._state && addPossiblyUnhandledError(this);
        for (var i = 0, len = this._deferreds.length; i < len; ++i) {
            handle(this, this._deferreds[i]);
        }
        this._deferreds = [];
        var onfulfilled;
        this._PSD && (onfulfilled = this._PSD.onfulfilled) && onfulfilled(this);
        wasRootExec && endMicroTickScope();
    },
    
    then: function (onFulfilled, onRejected) {
        var p = new Promise((resolve, reject) => {
            handle(this, new Deferred(onFulfilled, onRejected, resolve, reject));
        });
        p._PSD = this._PSD;
        p.onuncatched = this.onuncatched; // Needed when exception occurs in a then() clause of a successful parent promise. Want onuncatched to be called even in callbacks of callbacks of the original promise.
        p._parent = this; // Used for recursively calling markErrorAsHandled() on self and all parents.
        return p;
    },

    catch: function (onRejected) {
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

    finally: function (onFinally) {
        return this.then(function (value) {
            onFinally();
            return value;
        }, function (err) {
            onFinally();
            return Promise.reject(err);
        });
    },
    
    _recuStacks: function (stacks, limit) {
        if (stacks.length === limit) return stacks;
        if (this._state === false) {
            var failure = this._value,
                error,
                message;
            
            if (failure != null) {
                error = failure.name || "Error";
                message = failure.message || failure;
            } else {
                error = failure; // If error is undefined or null, show that.
                message = ""
            }
            stacks.push(error + (message ? ": \n" + message : "\n") + prettyStack(failure));
        }
        if (debug) {
            var stack = prettyStack(this._e);
            if (stack) stacks.push(stack);
            if (this._prev) this._prev._recuStacks(stacks, limit);
        }
        return stacks;
    },
    
    stack: {
        get: function() {
            if (this._stack) return this._stack;
            var stacks = this._recuStacks ([], MAX_LONG_STACKS);
            return (this._stack = stacks.join("From previous:\n"));
        }
    }
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
    deferredCallbacks.push([cb, promise, deferred]);
    if (needsNewPhysicalTick) {
        schedulePhysicalTick();
        needsNewPhysicalTick = false;
    }
}

function call (cb, promise, deferred) {
    var outerPSD = Promise.PSD;
    try {
        Promise.PSD = promise._PSD;
        // We're gonna call the catcher here. Mark it as catched.
        // Even if the catcher throws or returns Promise.reject(e),
        // this will work because then another promise is resolved with the
        // rejection and addPossiblyUnhandledError() is called again.
        if (!promise._state) markErrorAsHandled (promise);
        
        // Set static variable currentFulfiller to the promise that is being fullfilled,
        // so that we connect the chain of promises.
        currentFulfiller = promise;
        
        // Call callback and resolve our deferred with it's return value.
        var ret = cb(promise._value);
        deferred.resolve(ret);
    } catch (e) {
        // Exception thrown in callback. Reject our deferred.
        deferred.reject(e);
    } finally {
        // Restore Promise.PSD and currentFulfiller.
        Promise.PSD = outerPSD;
        currentFulfiller = null;
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
        return new Promise(INTERNAL, true, value);
    },
    
    reject: reason => {
        return new Promise(INTERNAL, false, reason);
    },
    
    race: values => new Promise((resolve, reject) => {
        values.map(value => Promise.resolve(value).then(resolve, reject));
    }),
    
    PSD: null,// Promise Specific Data - a TLS Pattern (Thread Local Storage) for Promises.
    
    newPSD: (fn,arg) => {
        // Create new PSD scope (Promise Specific Data)
        var outerScope = Promise.PSD;
        Promise.PSD = outerScope ? Object.create(outerScope) : {};
        try {
            return fn(arg);
        } finally {
            Promise.PSD = outerScope;
        }
    },
    
    usePSD: usePSD,
    
    track: (fn, tracker) => {
        // This closure is used: fn, tracker. Ok. Happens only on track() which is not frequent.
        return new Promise(resolve => {
            return Promise.newPSD(resolve=>{
                // This closure is useed: refCount, parentOnCreate, parentOnFulfilled.
                // Ok. Happens only on track() which is not frequent.
                var psd = Promise.PSD;
                var refCount = 0;
                function tickFinalizer() {
                    if (refCount === 0) {
                        tickFinalizers.splice(tickFinalizers.indexOf(tickFinalizer), 1);
                        resolve();
                    }
                }
                tickFinalizers.push(tickFinalizer);
                var parentOnCreate = psd.oncreate,
                    parentOnFulfilled = psd.onfulfilled;
                
                psd.oncreate = p => {
                    // THIS CLOSURE HAPPENS FOR EACH PROMISE. OPTIMIZE AWAY ALL ITS CLOSURES!
                    // Support chaining oncreate hooks, by calling already registered hook.
                    parentOnCreate && parentOnCreate(p);
                    ++refCount;
                    tracker && tracker.oncreate && tracker.oncreate(p);
                };
                
                psd.onfulfilled = p => {
                    parentOnFulfilled && parentOnFulfilled(p);
                    --refCount;
                    tracker && (p._state ?
                        tracker.onresolve && tracker.onresolve(p, p._value) :
                        tracker.onreject && tracker.onreject(p, p._value));                        
                }
                fn(tracker);
            }, resolve);
        });
    },

    // TODO: Remove!
    _rootExec: _rootExec,
    
    on: Events(null, {"error": [
        reverseStoppableEventChain,
        defaultErrorHandler] // Default to defaultErrorHandler
    }),
    
    _isRootExec: {get: ()=> isOutsideMicroTick},
    
    debug: {get: ()=>debug, set: val => debug = val}
});

function linkToPreviousPromise(promise) {
    // Support long stacks by linking to previous completed promise.
    var prev = currentFulfiller,
        numPrev = prev ? prev._numPrev + 1 : 0;
    if (numPrev < LONG_STACKS_CLIP_LIMIT) { // Prohibit infinite Promise loops to get an infinite long memory consuming "tail".
        promise._prev = prev;
        promise._numPrev = numPrev;
    }
}

function usePSD (psd, fn, arg) {
    var outerScope = Promise.PSD;
    Promise.PSD = psd;
    try {
        return fn(arg);
    } finally {
        Promise.PSD = outerScope;
    }
}

/* The callback to schedule with setImmediate() or setTimeout().
   It runs a virtual microtick and executes any callback registered in deferredCallbacks.
 */
function physicalTick() {
    beginMicroTickScope() && endMicroTickScope();
}

function beginMicroTickScope() {
    var wasRootExec = isOutsideMicroTick;
    isOutsideMicroTick = false;
    needsNewPhysicalTick = false;
    if (wasRootExec) {
        unhandledErrors = unhandledErrorsNextTick;
        unhandledErrorsNextTick = [];
    }
    return wasRootExec;
}

function endMicroTickScope() {
    var callbacks, i, l;
    do {
        while (deferredCallbacks.length > 0) {
            callbacks = deferredCallbacks;
            deferredCallbacks = [];
            l = callbacks.length;
            for (i = 0; i < l; ++i) {
                var item = callbacks[i];
                call (item[0], item[1], item[2]);
            }
        }
        unhandledErrors.forEach(p => {
            try {
                (!p.onuncatched || p.onuncatched(p._value)) &&
                Promise.on.error.fire(p._value, p);
            } catch (e){}
        });
        unhandledErrors = [];
        tickFinalizers.forEach(tf => tf());
    } while (deferredCallbacks.length > 0);
    isOutsideMicroTick = true;
    needsNewPhysicalTick = true;
}

// TODO: Remove!
function _rootExec(fn) {
    var isRootExec = beginMicroTickScope();
    try {
        return fn();
    } finally {
        if (isRootExec) endMicroTickScope();
    }
}

function addPossiblyUnhandledError(promise, wasRootExec) {
    // If promise is still being constructed outside a virtual microtick,
    // we know that there will not be any then handlers attatched to this
    // promise during current virtual tick. So we should defer uncaught-checking
    // til next physical tick.
    var list = wasRootExec && !promise._constructed ?
        unhandledErrorsNextTick : unhandledErrors;

    // Only add to list if not already there. The first one to add to this list
    // will be upon the first rejection so that the root cause (first promise in the
    // rejection chain) is the one listed.
    if (!list.some(p => p._value === promise._value))
        list.push(promise);
}

function markErrorAsHandled(promise) {
    // Called when a reject handled is actually being called.
    // Search in unhandledErrors for any promise whos _value is this promise_value (list
    // contains only rejected promises, and only one item per error)
    var i = unhandledErrors.length;
    do {
        if (unhandledErrors[--i]._value === promise._value) {
            // Found a promise that failed with this same error object pointer,
            // Remove that since there is a listener that actually takes care of it.
            unhandledErrors.splice(i, 1);
            return;
            // But? What if the callback throws or returns Promise.reject(e) again? Shouldn't
            // we set it as unhandled again then?! Yes! But that will be done automatically;
            // Review the code in call(). It will then:
            //   1. deferred.reject(ex) (or deferred.resolve(rejectedPromise))
            //   [defered.reject/resolve points leads to one of the callbacks in _doResolve() ]
            //   2. _reject will be called (directly or indirectly via resolve...then...reject)
            //   3. _finale will be called and see its state as false, and call addPossiblyUnhandledError()
            //      again!. Now pointing to THAT promise instead. And it's true our promise WAS handled in
            //      a way that rejected another Promise.
            //      Long stack will show the path all the way on how rejection happened.
        }
    } while (i);
}

// By default, log uncaught errors to the console
function defaultErrorHandler(e) {
    console.warn(`Uncaught Promise: ${e.stack || e}`);
}

doFakeAutoComplete(() => {
    // Simplify the job for VS Intellisense. This piece of code is one of the keys to the new marvellous intellisense support in Dexie.
    schedulePhysicalTick = () => {
        setTimeout(physicalTick, 0);
    };
});
