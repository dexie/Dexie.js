import {slice, isArray, doFakeAutoComplete, miniTryCatch, extendProto, setProp, _global} from './utils';
import {reverseStoppableEventChain} from './chaining-functions';
import Events from './Events';
import {debug, prettyStack} from './debug';
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
// tick. In Dexie v1.4.0, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
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

// Just a pointer that only this module knows about.
// Used in Promise constructor to emulate a private constructor.
var INTERNAL = {};

// Async stacks (long stacks) must not grow infinitely.
var LONG_STACKS_CLIP_LIMIT = 100,
    // When calling error.stack or promise.stack, limit the number of asyncronic stacks to print out. 
    MAX_LONG_STACKS = 20,
    stack_being_generated = false;

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
        
// Confifurable through Promise.scheduler.
var asap = function (callback, args) {
    deferredCallbacks.push([callback, args]);
    if (needsNewPhysicalTick) {
        schedulePhysicalTick();
        needsNewPhysicalTick = false;
    }
}

var isOutsideMicroTick = true, // True when NOT in a virtual microTick.
    needsNewPhysicalTick = true, // True when a push to deferredCallbacks must also schedulePhysicalTick()
    unhandledErrors = [], // Rejected promises that has occured. Used for firing Promise.on.error and promise.onuncatched.
    currentFulfiller = null;
    
export var PSD = null;
export var deferredCallbacks = []; // Callbacks to call in this tick.
export var numScheduledCalls = 0;
export var flowFinalizers = []; // Finalizers to call when there are no more async calls scheduled.

export var wrapperDefaults = [];
export var wrappers = (() => {
    var wrappers = [];

    return {
        read: () => {
            var i = wrappers.length,
                result = new Array(i);
            while (i--) result[i] = wrappers[i].read();
            return result;
        },
        write: values => {
            var i = wrappers.length;
            while (i--) wrappers[i].write(values[i]);
        },
        fork: () => wrappers.map(w => w.fork()),
        add: wrapper => {
            wrappers.push(wrapper);
        }
    };
})();

export default function Promise(fn, _internalState, _internalValue) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');    
    this._deferreds = [];
    var psd = (this._PSD = PSD);
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
    //psd && ++psd.refcount && console.log("constructor() ++refcount: " + psd.refcount);
    //psd && psd.oncreate && psd.oncreate.call(null, this);
    psd && psd.onbeforetask && psd.onbeforetask(this);
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
                                handle(value, new Listener(null, null, resolve, reject, this)) :
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
        var promise = this;
        debug && reason !== null && typeof(reason) === 'object' && miniTryCatch(()=>{
            var origProp =
                Object.getOwnPropertyDescriptor(reason, "stack") ||
                Object.getOwnPropertyDescriptor(Object.getPrototypeOf(reason), "stack");
                
            setProp(reason, "stack", {
                get: () =>
                    stack_being_generated ?
                        origProp && (origProp.get ?
                                    origProp.get.apply(reason) :
                                    origProp.value) :
                        promise.stack
            });
        });
        this._finale();
    },

    _finale: function () {
        debug && linkToPreviousPromise(this);
        //var wasRootExec = beginMicroTickScope();
        // If this is a failure, add the failure to a list of possibly uncaught errors
        !this._state && addPossiblyUnhandledError(this);
        for (var i = 0, len = this._deferreds.length; i < len; ++i) {
            handle(this, this._deferreds[i]);
        }
        this._deferreds = [];
        //wasRootExec && endMicroTickScope(); // TODO: Remove. Istället, gör en wrap() metod och använd på alla IDB events.
        var psd = this._PSD;//, onfullfill;
        //psd && (onfullfill = psd.onfullfill) && onfullfill(this);
        //psd && (--psd.refcount,1) && (console.log("finale --refcount: " + psd.refcount),1) && psd.refcount === 0 && psd.oncomplete && psd.oncomplete();
        psd && psd.onaftertask && psd.onaftertask(this);
        if (numScheduledCalls === 0) {
            // If numScheduledCalls is 0, it means that our stack is not in a callback of a scheduled call,
            // and that no deferreds where listening to this rejection or success.
            // Since there is a risk that our stack can contain application code that may
            // do stuff after this code is finished that may generate new calls, we cannot
            // call finalizers here.
            ++numScheduledCalls;
            asap(()=>{
                if (--numScheduledCalls === 0) finalize();                
            }, []);
        }
    },
    
    then: function (onFulfilled, onRejected) {
        return new Promise((resolve, reject) => {
            handle(this, new Listener(onFulfilled, onRejected, resolve, reject, this));
        });
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
    
    stack: {
        get: function() {
            if (this._stack) return this._stack;
            try {
                stack_being_generated = true;
                var stacks = this._getStack ([], MAX_LONG_STACKS);
                var stack = stacks.join("\nFrom previous:");
                if (this._state !== null) this._stack = stack; // Stack may be updated on reject.
                return stack;
            } finally {
                stack_being_generated = false;
            }
        }
    },
    
    _getStack: function (stacks, limit) {
        if (stacks.length === limit) return stacks;
        var stack = "";
        if (this._state === false) {
            var failure = this._value,
                errorName,
                message;
            
            if (failure != null) {
                errorName = failure.name || "Error";
                message = failure.message || failure;
                stack = prettyStack(failure);
            } else {
                errorName = failure; // If error is undefined or null, show that.
                message = ""
            }
            stacks.push(errorName + (message ? ": " + message : "") + stack);
        }
        if (debug) {
            stack = prettyStack(this._e);
            if (stack && stacks.indexOf(stack) === -1) stacks.push(stack);
            if (this._prev) this._prev._getStack(stacks, limit);
        }
        return stacks;
    }
});

function handle(promise, listener) {
    if (promise._state === null) {
        promise._deferreds.push(listener);
        return;
    }

    var cb = promise._state ? listener.onFulfilled : listener.onRejected;
    if (cb === null) {
        // This Listener doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
        return (promise._state ? listener.resolve : listener.reject)(promise._value);
    }
    var psd;
    (psd = listener.psd) && psd.onbeforetask && psd.onbeforetask(listener);
    ++numScheduledCalls;
    asap (call, [cb, promise, listener]);
}

function call (cb, promise, listener) {
    var outerScope = PSD;
    var valuesToRestore;
    var psd = listener.psd;
    try {
        if (psd !== outerScope) {
            PSD = psd;
            valuesToRestore = wrappers.read();
            if (!outerScope) wrapperDefaults = valuesToRestore;
            wrappers.write(psd ? psd.wrappedValues : wrapperDefaults);
        }
        
        // Set static variable currentFulfiller to the promise that is being fullfilled,
        // so that we connect the chain of promises.
        currentFulfiller = promise;
        
        // Call callback and resolve our listener with it's return value.
        var ret = cb(promise._value);
        if (!promise._state && (                // This was a rejection and...
                !ret ||                         // handler didn't return something that could be a Promise
                !(ret instanceof Promise) ||    // handler didnt return a Promise
                ret._state !== false ||         // handler returned promise that didnt fail (yet at least)
                ret._value !== promise._value)) // handler didn't return a promise with same error as the one being rejected
            markErrorAsHandled (promise);       // If all above criterias are true, mark error as resolved.

        listener.resolve(ret);
    } catch (e) {
        // Exception thrown in callback. Reject our listener.
        listener.reject(e);
    } finally {
        // Restore PSD, wrappedValues and currentFulfiller.
        if (psd !== outerScope) {
            wrappers.write(valuesToRestore);
            PSD = outerScope;
        }
        currentFulfiller = null;
        psd && psd.onaftertask && psd.onaftertask(listener);
        if (--numScheduledCalls === 0) finalize();
    }
}

function finalize() {
    unhandledErrors.forEach(p => {
        try {
            var psd = p._PSD,
                onunhandled;
            if (!psd || !(onunhandled = psd.onunhandled) || onunhandled(p._value, p) !== false)
                Promise.on.error.fire(p._value, p); // TODO: Deprecated and use same global handler as bluebird.
        } catch (e) {}
    });
    unhandledErrors = [];
    var finalizers = flowFinalizers.slice(0); // Clone first because finalizer may remove itself from list.
    var i = finalizers.length;
    while (i) finalizers[--i]();    
}


function Listener(onFulfilled, onRejected, resolve, reject, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
    this.psd = PSD;
    this.p = promise;
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
    
    PSD: {
        get: ()=>PSD,
        set: value => PSD = value
    },
    
    newPSD: newScope,
    
    usePSD: usePSD,
    
    scheduler: {
        get: () => asap,
        set: value => {asap = value}
    },
            
    track: (fn, tracker) => {
        // This closure is used: fn, tracker. Ok. Happens only on track() which is not frequent.
        return new Promise(resolve => {
            return newScope(resolve=>{
                // This closure is useed: refCount, parentOnCreate, parentOnFulfilled.
                // Ok. Happens only on track() which is not frequent.
                var psd = PSD;
                var refCount = 0;
                function finalizer() {
                    if (refCount === 0) {
                        flowFinalizers.splice(flowFinalizers.indexOf(finalizer), 1);
                        resolve();
                    }
                }
                flowFinalizers.push(finalizer);
                
                var parentOnUnhandled = psd.onunhandled,
                    parentOnBeforeTask = psd.onbeforetask,
                    parentOnAfterTask = psd.onaftertask;
                    
                psd.onbeforetask = function(t) {
                    ++refCount;
                    parentOnBeforeTask && parentOnBeforeTask(t);
                    tracker && tracker.onbeforetask && tracker.onbeforetask(t);
                }
                psd.onaftertask = function (t) {
                    parentOnAfterTask && parentOnAfterTask(t);
                    tracker && tracker.onaftertask && tracker.onaftertask(t);
                    --refCount;
                }
                                
                if (tracker && tracker.onunhandled) psd.onunhandled = (err,p) => {
                    var handled = false;
                    try {handled = tracker.onunhandled(err,p) === false;} catch(e){}
                    if (!handled) handled = parentOnUnhandled && parentOnUnhandled(err,p) === false;
                    return !handled;
                };
                
                fn(tracker);
                
            }, resolve);
        });
    },

    _rootExec: _rootExec,
    
    on: Events(null, {"error": [
        reverseStoppableEventChain,
        defaultErrorHandler] // Default to defaultErrorHandler
    }),
    
    // TODO: Remove!
    _isRootExec: {get: ()=> isOutsideMicroTick}
    
    //debug: {get: ()=>debug.de, set: val => debug = val},
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
                item[0].apply(null, item[1]);
            }
        }
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

function addPossiblyUnhandledError(promise) {
    // Only add to unhandledErrors if not already there. The first one to add to this list
    // will be upon the first rejection so that the root cause (first promise in the
    // rejection chain) is the one listed.
    if (!unhandledErrors.some(p => p._value === promise._value))
        unhandledErrors.push(promise);
}

function markErrorAsHandled(promise) {
    // Called when a reject handled is actually being called.
    // Search in unhandledErrors for any promise whos _value is this promise_value (list
    // contains only rejected promises, and only one item per error)
    var i = unhandledErrors.length;
    while (i) if (unhandledErrors[--i]._value === promise._value) {
        // Found a promise that failed with this same error object pointer,
        // Remove that since there is a listener that actually takes care of it.
        unhandledErrors.splice(i, 1);
        return;
    }
}

// By default, log uncaught errors to the console
function defaultErrorHandler(e) {
    console.warn(`Uncaught Promise: ${e.stack || e}`);
}

export function wrap (fn) {
    return _wrap(fn, PSD, wrappers.read());
}

function _wrap (fn, psd, wrappedValues) {
    return function() {
        var wasRootExec = beginMicroTickScope(),
            valuesToRestore,
            outerScope = PSD;
                
        try {
            if (outerScope !== psd) {
                PSD = psd;
                valuesToRestore = wrappers.read();
                if (!outerScope) wrapperDefaults = valuesToRestore;
                wrappers.write(wrappedValues);
            }
            return fn.apply(this, arguments);
        } finally {
            if (outerScope !== psd) {
                wrappers.write(valuesToRestore);
                PSD = outerScope;
            }
            if (wasRootExec) endMicroTickScope();
        }
    };
}
    
export function newScope (fn, a1, a2, a3) {
    var psd = PSD ? Object.create(PSD) : {};
    psd.wrappedValues = wrappers.fork(psd);
    return usePSD (fn, psd, a1, a2, a3);
}

export function usePSD (fn, psd, a1, a2, a3) {
    var outerScope = PSD;
    var valuesToRestore;
    try {
        if (psd !== outerScope) {
            PSD = psd;
            valuesToRestore = wrappers.read();
            if (!outerScope) wrapperDefaults = valuesToRestore;
            wrappers.write(psd ? psd.wrappedValues : wrapperDefaults);
        }
        return fn(a1, a2, a3);
    } finally {
        if (psd !== outerScope) {
            wrappers.write(valuesToRestore);
            PSD = outerScope;
        }
    }
}

export function wrapPromise(PromiseClass) {
    var proto = PromiseClass.prototype;
    var origThen = proto.then;
    
    wrappers.add({
        read: () => proto.then,
        write: value => {proto.then = value;},
        fork: () => patchedThen
    });
    
    function patchedThen (onFulfilled, onRejected) {
        var task = this; // Just need an object to pass as task. Use this Promise instance.
        var onFulfilledProxy = wrap(function(){
            PSD && PSD.onaftertask && PSD.onaftertask(task);
            onFulfilled && onFulfilled.apply(this, arguments);
        });
        var onRejectedProxy = wrap(function(){
            PSD && PSD.onaftertask && PSD.onaftertask(task);
            onRejected && onRejected.apply(this, arguments);
        });
        PSD && PSD.onbeforetask && PSD.onbeforetask(task);
        return origThen.call(this, onFulfilledProxy, onRejectedProxy);
    }
}

// Global Promise wrapper
if (_global.Promise) wrapPromise(_global.Promise);

doFakeAutoComplete(() => {
    // Simplify the job for VS Intellisense. This piece of code is one of the keys to the new marvellous intellisense support in Dexie.
    schedulePhysicalTick = () => {
        setTimeout(physicalTick, 0);
    };
});
