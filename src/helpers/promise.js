/*
 * Copyright (c) 2014-2017 David Fahlander
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/LICENSE-2.0
 */
import { _global } from '../globals/global';
import {tryCatch, props, setProp,
    getPropertyDescriptor, getArrayOf, extend, getProto} from '../functions/utils';
import {nop, callBoth, mirror} from '../functions/chaining-functions';
import {debug} from './debug';
import {exceptions} from '../errors';

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

const
    ZONE_ECHO_LIMIT = 100,
    [resolvedNativePromise, nativePromiseProto, resolvedGlobalPromise] = typeof Promise === 'undefined' ?
        [] :
        (()=>{
            let globalP = Promise.resolve();
            if (typeof crypto === 'undefined' || !crypto.subtle)
                return [globalP, getProto(globalP), globalP];
            // Generate a native promise (as window.Promise may have been patched)
            const nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
            return [
                nativeP,
                getProto(nativeP),
                globalP
            ];
        })(),
    nativePromiseThen = nativePromiseProto && nativePromiseProto.then;

export const NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
const patchGlobalPromise = !!resolvedGlobalPromise;

/* The default function used only for the very first promise in a promise chain.
   As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
   emulated in this module. For indexedDB compatibility, this means that every method needs to 
   execute at least one promise before doing an indexedDB operation. Dexie will always call 
   db.ready().then() for every operation to make sure the indexedDB event is started in an
   indexedDB-compatible emulated micro task loop.
*/
function schedulePhysicalTick() {
    queueMicrotask(physicalTick);
}

// Configurable through Promise.scheduler.
// Don't export because it would be unsafe to let unknown
// code call it unless they do try..catch within their callback.
// This function can be retrieved through getter of Promise.scheduler though,
// but users must not do Promise.scheduler = myFuncThatThrowsException
var asap = function (callback, args) {
    microtickQueue.push([callback, args]);
    if (needsNewPhysicalTick) {
        schedulePhysicalTick();
        needsNewPhysicalTick = false;
    }
};

var isOutsideMicroTick = true, // True when NOT in a virtual microTick.
    needsNewPhysicalTick = true, // True when a push to microtickQueue must also schedulePhysicalTick()
    unhandledErrors = [], // Rejected promises that has occured. Used for triggering 'unhandledrejection'.
    rejectingErrors = [], // Tracks if errors are being re-rejected during onRejected callback.
    rejectionMapper = mirror; // Remove in next major when removing error mapping of DOMErrors and DOMExceptions
    
export var globalPSD = {
    id: 'global',
    global: true,
    ref: 0,
    unhandleds: [],
    onunhandled: nop,
    pgp: false,
    env: {},
    finalize: nop
};

export var PSD = globalPSD;

export var microtickQueue = []; // Callbacks to call in this or next physical tick.
export var numScheduledCalls = 0; // Number of listener-calls left to do in this physical tick.
export var tickFinalizers = []; // Finalizers to call when there are no more async calls scheduled within current physical tick.

export default function DexiePromise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');    
    this._listeners = [];
    
    // A library may set `promise._lib = true;` after promise is created to make resolve() or reject()
    // execute the microtask engine implicitely within the call to resolve() or reject().
    // To remain A+ compliant, a library must only set `_lib=true` if it can guarantee that the stack
    // only contains library code when calling resolve() or reject().
    // RULE OF THUMB: ONLY set _lib = true for promises explicitely resolving/rejecting directly from
    // global scope (event handler, timer etc)!
    this._lib = false;
    // Current async scope
    var psd = (this._PSD = PSD);
    
    if (typeof fn !== 'function') {
        if (fn !== INTERNAL) throw new TypeError('Not a function');
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
const thenProp = {
    get: function() {
        var psd = PSD, microTaskId = totalEchoes;

        function then (onFulfilled, onRejected) {
            var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
            const cleanup = possibleAwait && !decrementExpectedAwaits();
            var rv = new DexiePromise((resolve, reject) => {
                propagateToListener(this, new Listener(
                    nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup),
                    nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup),
                    resolve,
                    reject,
                    psd));
            });
            if (this._consoleTask) rv._consoleTask = this._consoleTask;
            return rv;
        }

        then.prototype = INTERNAL; // For idempotense, see setter below.

        return then;
    },
    // Be idempotent and allow another framework (such as zone.js or another instance of a Dexie.Promise module) to replace Promise.prototype.then
    // and when that framework wants to restore the original property, we must identify that and restore the original property descriptor.
    set: function (value) {
        setProp (this, 'then', value && value.prototype === INTERNAL ?
            thenProp : // Restore to original property descriptor.
            {
                get: function(){
                    return value; // Getter returning provided value (behaves like value is just changed)
                },
                set: thenProp.set // Keep a setter that is prepared to restore original.
            }
        );
    }
};

props(DexiePromise.prototype, {
    then: thenProp, // Defined above.
    _then: function (onFulfilled, onRejected) {
        // A little tinier version of then() that don't have to create a resulting promise.
        propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));        
    },

    catch: function (onRejected) {
        if (arguments.length === 1) return this.then(null, onRejected);
        // First argument is the Error type to catch
        var type = arguments[0],
            handler = arguments[1];
        return typeof type === 'function' ? this.then(null, err =>
            // Catching errors by its constructor type (similar to java / c++ / c#)
            // Sample: promise.catch(TypeError, function (e) { ... });
            err instanceof type ? handler(err) : PromiseReject(err))
        : this.then(null, err =>
            // Catching errors by the error.name property. Makes sense for indexedDB where error type
            // is always DOMError but where e.name tells the actual error type.
            // Sample: promise.catch('ConstraintError', function (e) { ... });
            err && err.name === type ? handler(err) : PromiseReject(err));
    },

    finally: function (onFinally) {
        return this.then(value => {
            return DexiePromise.resolve(onFinally()).then(()=>value);
        }, err => {
            return DexiePromise.resolve(onFinally()).then(()=>PromiseReject(err));
        });
    },
    
    timeout: function (ms, msg) {
        return ms < Infinity ?
            new DexiePromise((resolve, reject) => {
                var handle = setTimeout(() => reject(new exceptions.Timeout(msg)), ms);
                this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
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
props (DexiePromise, {
    all: function () {
        var values = getArrayOf.apply(null, arguments) // Supports iterables, implicit arguments and array-like.
            .map(onPossibleParallellAsync); // Handle parallell async/awaits 
        return new DexiePromise(function (resolve, reject) {
            if (values.length === 0) resolve([]);
            var remaining = values.length;
            values.forEach((a,i) => DexiePromise.resolve(a).then(x => {
                values[i] = x;
                if (!--remaining) resolve(values);
            }, reject));
        });
    },
    
    resolve: value => {
        if (value instanceof DexiePromise) return value;
        if (value && typeof value.then === 'function') return new DexiePromise((resolve, reject)=>{
            value.then(resolve, reject);
        });
        var rv = new DexiePromise(INTERNAL, true, value);
        return rv;
    },
    
    reject: PromiseReject,
    
    race: function () {
        var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
        return new DexiePromise((resolve, reject) => {
            values.map(value => DexiePromise.resolve(value).then(resolve, reject));
        });
    },

    PSD: {
        get: ()=>PSD,
        set: value => PSD = value
    },

    totalEchoes: {get: ()=>totalEchoes},

    //task: {get: ()=>task},
    
    newPSD: newScope,
    
    usePSD: usePSD,
    
    scheduler: {
        get: () => asap,
        set: value => {asap = value}
    },
    
    rejectionMapper: {
        get: () => rejectionMapper,
        set: value => {rejectionMapper = value;} // Map reject failures
    },
            
    follow: (fn, zoneProps) => {
        return new DexiePromise((resolve, reject) => {
            return newScope((resolve, reject) => {
                var psd = PSD;
                psd.unhandleds = []; // For unhandled standard- or 3rd party Promises. Checked at psd.finalize()
                psd.onunhandled = reject; // Triggered directly on unhandled promises of this library.
                psd.finalize = callBoth(function () {
                    // Unhandled standard or 3rd part promises are put in PSD.unhandleds and
                    // examined upon scope completion while unhandled rejections in this Promise
                    // will trigger directly through psd.onunhandled
                    run_at_end_of_this_or_next_physical_tick(()=>{
                        this.unhandleds.length === 0 ? resolve() : reject(this.unhandleds[0]);
                    });
                }, psd.finalize);
                fn();
            }, zoneProps, resolve, reject);
        });
    }
});

if (NativePromise) {
    if (NativePromise.allSettled) setProp (DexiePromise, "allSettled", function() {
        const possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
        return new DexiePromise(resolve => {
            if (possiblePromises.length === 0) resolve([]);
            let remaining = possiblePromises.length;
            const results = new Array(remaining);
            possiblePromises.forEach((p, i) => DexiePromise.resolve(p).then(
                value => results[i] = {status: "fulfilled", value},
                reason => results[i] = {status: "rejected", reason})
                .then(()=>--remaining || resolve(results)));
        });
    });
    if (NativePromise.any && typeof AggregateError !== 'undefined') setProp(DexiePromise, "any", function() {
        const possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
        return new DexiePromise((resolve, reject) => {
            if (possiblePromises.length === 0) reject(new AggregateError([]));
            let remaining = possiblePromises.length;
            const failures = new Array(remaining);
            possiblePromises.forEach((p, i) => DexiePromise.resolve(p).then(
                value => resolve(value),
                failure => {
                    failures[i] = failure;
                    if (!--remaining) reject(new AggregateError(failures));
                }));
        });
    });
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
    if (NativePromise.withResolvers) DexiePromise.withResolvers = NativePromise.withResolvers;
}

/**
* Take a potentially misbehaving resolver function and make sure
* onFulfilled and onRejected are only called once.
*
* Makes no guarantees about asynchrony.
*/
function executePromiseTask (promise, fn) {
    // Promise Resolution Procedure:
    // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    try {
        fn(value => {
            if (promise._state !== null) return; // Already settled
            if (value === promise) throw new TypeError('A promise cannot be resolved with itself.');
            var shouldExecuteTick = promise._lib && beginMicroTickScope();
            if (value && typeof value.then === 'function') {
                executePromiseTask(promise, (resolve, reject) => {
                    value instanceof DexiePromise ?
                        value._then(resolve, reject) :
                        value.then(resolve, reject);
                });
            } else {
                promise._state = true;
                promise._value = value;
                propagateAllListeners(promise);
            }
            if (shouldExecuteTick) endMicroTickScope();
        }, handleRejection.bind(null, promise)); // If Function.bind is not supported. Exception is handled in catch below
    } catch (ex) {
        handleRejection(promise, ex);
    }
}

function handleRejection (promise, reason) {
    rejectingErrors.push(reason);
    if (promise._state !== null) return;
    var shouldExecuteTick = promise._lib && beginMicroTickScope();
    reason = rejectionMapper(reason);
    promise._state = false;
    promise._value = reason;
    // Add the failure to a list of possibly uncaught errors
    addPossiblyUnhandledError(promise);
    propagateAllListeners(promise);
    if (shouldExecuteTick) endMicroTickScope();
}

function propagateAllListeners (promise) {
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
        asap(()=>{
            if (--numScheduledCalls === 0) finalizePhysicalTick(); // Will detect unhandled errors
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
        return (promise._state ? listener.resolve : listener.reject) (promise._value);
    }
    ++listener.psd.ref;
    ++numScheduledCalls;
    asap (callListener, [cb, promise, listener]);
}

function callListener (cb, promise, listener) {
    try {
        // Call callback and resolve our listener with it's return value.
        var ret, value = promise._value;
            
        if (!promise._state && rejectingErrors.length) rejectingErrors = [];
        // cb is onResolved
        ret = debug && promise._consoleTask ? promise._consoleTask.run(()=>cb (value)) : cb (value);
        if (!promise._state && rejectingErrors.indexOf(value) === -1) {
            markErrorAsHandled(promise); // Callback didnt do Promise.reject(err) nor reject(err) onto another promise.
        }
        listener.resolve(ret);
    } catch (e) {
        // Exception thrown in callback. Reject our listener.
        listener.reject(e);
    } finally {
        if (--numScheduledCalls === 0) finalizePhysicalTick();
        --listener.psd.ref || listener.psd.finalize();
    }
}

/* The callback to schedule with queueMicrotask().
   It runs a virtual microtick and executes any callback registered in microtickQueue.
 */
function physicalTick() {
    usePSD(globalPSD, ()=>{
        // Make sure to reset the async context to globalPSD before
        // executing any of the microtick subscribers.
        beginMicroTickScope() && endMicroTickScope();
    });
}

export function beginMicroTickScope() {
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
export function endMicroTickScope() {
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
    unhandledErrs.forEach(p => {
        p._PSD.onunhandled.call(null, p._value, p);
    });
    var finalizers = tickFinalizers.slice(0); // Clone first because finalizer may remove itself from list.
    var i = finalizers.length;
    while (i) finalizers[--i]();    
}

function run_at_end_of_this_or_next_physical_tick (fn) {
    function finalizer() {
        fn();
        tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
    }
    tickFinalizers.push(finalizer);
    ++numScheduledCalls;
    asap(()=>{
        if (--numScheduledCalls === 0) finalizePhysicalTick();
    }, []);
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

function PromiseReject (reason) {
    return new DexiePromise(INTERNAL, false, reason);
}

export function wrap (fn, errorCatcher) {
    var psd = PSD;
    return function() {
        var wasRootExec = beginMicroTickScope(),
            outerScope = PSD;

        try {
            switchToZone(psd, true);
            return fn.apply(this, arguments);
        } catch (e) {
            errorCatcher && errorCatcher(e);
        } finally {
            switchToZone(outerScope, false);
            if (wasRootExec) endMicroTickScope();
        }
    };
}


//
// variables used for native await support
//
const task = { awaits: 0, echoes: 0, id: 0}; // The ongoing macro-task when using zone-echoing.
var taskCounter = 0; // ID counter for macro tasks.
var zoneStack = []; // Stack of left zones to restore asynchronically.
var zoneEchoes = 0; // When > 0, zoneLeaveEcho is queued. When 0 and task.echoes is also 0, nothing is queued.
var totalEchoes = 0; // ID counter for micro-tasks. Used to detect possible native await in our Promise.prototype.then.


var zone_id_counter = 0;
export function newScope (fn, props, a1, a2) {
    var parent = PSD,
        psd = Object.create(parent);
    psd.parent = parent;
    psd.ref = 0;
    psd.global = false;
    psd.id = ++zone_id_counter;
    // Prepare for promise patching (done in usePSD):
    var globalEnv = globalPSD.env;
    psd.env = patchGlobalPromise ? {
        Promise: DexiePromise, // Changing window.Promise could be omitted for Chrome and Edge, where IDB+Promise plays well!
        PromiseProp: {value: DexiePromise, configurable: true, writable: true},
        all: DexiePromise.all,
        race: DexiePromise.race,
        allSettled: DexiePromise.allSettled,
        any: DexiePromise.any,
        resolve: DexiePromise.resolve,
        reject: DexiePromise.reject,
    } : {};
    if (props) extend(psd, props);
    
    // unhandleds and onunhandled should not be specifically set here.
    // Leave them on parent prototype.
    // unhandleds.push(err) will push to parent's prototype
    // onunhandled() will call parents onunhandled (with this scope's this-pointer though!)
    ++parent.ref;
    psd.finalize = function () {
        --this.parent.ref || this.parent.finalize();
    }
    var rv = usePSD (psd, fn, a1, a2);
    if (psd.ref === 0) psd.finalize();
    return rv;
}

// Function to call if scopeFunc returns NativePromise
// Also for each NativePromise in the arguments to Promise.all()
export function incrementExpectedAwaits() {
    if (!task.id) task.id = ++taskCounter;
    ++task.awaits;
    task.echoes += ZONE_ECHO_LIMIT;
    return task.id;
}

// Function to call when 'then' calls back on a native promise where onAwaitExpected() had been called.
// Also call this when a native await calls then method on a promise. In that case, don't supply
// sourceTaskId because we already know it refers to current task.
export function decrementExpectedAwaits() {
    if (!task.awaits) return false;
    if (--task.awaits === 0) task.id = 0;
    task.echoes = task.awaits * ZONE_ECHO_LIMIT; // Will reset echoes to 0 if awaits is 0.
    return true;
}

if ((''+nativePromiseThen).indexOf('[native code]') === -1) {
    // If the native promise' prototype is patched, we cannot rely on zone echoing.
    // Disable that here:
    incrementExpectedAwaits = decrementExpectedAwaits = nop;
}

// Call from Promise.all() and Promise.race()
export function onPossibleParallellAsync (possiblePromise) {
    if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
        incrementExpectedAwaits(); 
        return possiblePromise.then(x => {
            decrementExpectedAwaits();
            return x;
        }, e => {
            decrementExpectedAwaits();
            return rejection(e);
        });
    }
    return possiblePromise;
}

function zoneEnterEcho(targetZone) {
    ++totalEchoes;
    //console.log("Total echoes ", totalEchoes);
    //if (task.echoes === 1) console.warn("Cancelling echoing of async context.");
    if (!task.echoes || --task.echoes === 0) {
        task.echoes = task.awaits = task.id = 0; // Cancel echoing.
    }

    zoneStack.push(PSD);
    switchToZone(targetZone, true);
}

function zoneLeaveEcho() {
    var zone = zoneStack[zoneStack.length-1];
    zoneStack.pop();
    switchToZone(zone, false);
}

function switchToZone (targetZone, bEnteringZone) {
    var currentZone = PSD;
    if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
        // Enter or leave zone asynchronically as well, so that tasks initiated during current tick
        // will be surrounded by the zone when they are invoked.
        queueMicrotask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
    }
    if (targetZone === PSD) return;

    PSD = targetZone; // The actual zone switch occurs at this line.

    // Snapshot on every leave from global zone.
    if (currentZone === globalPSD) globalPSD.env = snapShot();

    if (patchGlobalPromise) {
        // Let's patch the global and native Promises (may be same or may be different)
        var GlobalPromise = globalPSD.env.Promise;
        // Swich environments (may be PSD-zone or the global zone. Both apply.)
        var targetEnv = targetZone.env;

        if (currentZone.global || targetZone.global) {
            // Leaving or entering global zone. It's time to patch / restore global Promise.

            // Set this Promise to window.Promise so that transiled async functions will work on Firefox, Safari and IE, as well as with Zonejs and angular.
            Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp);

            // Support Promise.all() etc to work indexedDB-safe also when people are including es6-promise as a module (they might
            // not be accessing global.Promise but a local reference to it)
            GlobalPromise.all = targetEnv.all;
            GlobalPromise.race = targetEnv.race;
            GlobalPromise.resolve = targetEnv.resolve;
            GlobalPromise.reject = targetEnv.reject;
            if (targetEnv.allSettled) GlobalPromise.allSettled = targetEnv.allSettled;
            if (targetEnv.any) GlobalPromise.any = targetEnv.any;
        }
    }
}

function snapShot () {
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
    } : {};
}

export function usePSD (psd, fn, a1, a2, a3) {
    var outerScope = PSD;
    try {
        switchToZone(psd, true);
        return fn(a1, a2, a3);
    } finally {
        switchToZone(outerScope, false);
    }
}

function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
    return typeof fn !== 'function' ? fn : function () {
        var outerZone = PSD;
        if (possibleAwait) incrementExpectedAwaits();
        switchToZone(zone, true);
        try {
            return fn.apply(this, arguments);
        } finally {
            switchToZone(outerZone, false);
            if (cleanup) queueMicrotask(decrementExpectedAwaits);
        }
    };
}

/** Execute callback in global context */
export function execInGlobalContext(cb) {
    if (Promise === NativePromise && task.echoes === 0) {
        if (zoneEchoes === 0) {
            cb();
        } else {
            enqueueNativeMicroTask(cb);
        }
    } else {
        setTimeout(cb, 0);
    }
}

export var rejection = DexiePromise.reject;

export {DexiePromise};
