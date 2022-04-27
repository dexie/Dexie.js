/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * By David Fahlander, david.fahlander@gmail.com
 *
 * Version 3.2.2, Wed Apr 27 2022
 *
 * https://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 */
 
const _global = typeof globalThis !== 'undefined' ? globalThis :
    typeof self !== 'undefined' ? self :
        typeof window !== 'undefined' ? window :
            global;

const keys = Object.keys;
const isArray = Array.isArray;
if (typeof Promise !== 'undefined' && !_global.Promise) {
    _global.Promise = Promise;
}
function extend(obj, extension) {
    if (typeof extension !== 'object')
        return obj;
    keys(extension).forEach(function (key) {
        obj[key] = extension[key];
    });
    return obj;
}
const getProto = Object.getPrototypeOf;
const _hasOwn = {}.hasOwnProperty;
function hasOwn(obj, prop) {
    return _hasOwn.call(obj, prop);
}
function props(proto, extension) {
    if (typeof extension === 'function')
        extension = extension(getProto(proto));
    (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(key => {
        setProp(proto, key, extension[key]);
    });
}
const defineProperty = Object.defineProperty;
function setProp(obj, prop, functionOrGetSet, options) {
    defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ?
        { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } :
        { value: functionOrGetSet, configurable: true, writable: true }, options));
}
function derive(Child) {
    return {
        from: function (Parent) {
            Child.prototype = Object.create(Parent.prototype);
            setProp(Child.prototype, "constructor", Child);
            return {
                extend: props.bind(null, Child.prototype)
            };
        }
    };
}
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
function getPropertyDescriptor(obj, prop) {
    const pd = getOwnPropertyDescriptor(obj, prop);
    let proto;
    return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
}
const _slice = [].slice;
function slice(args, start, end) {
    return _slice.call(args, start, end);
}
function override(origFunc, overridedFactory) {
    return overridedFactory(origFunc);
}
function assert(b) {
    if (!b)
        throw new Error("Assertion Failed");
}
function asap$1(fn) {
    if (_global.setImmediate)
        setImmediate(fn);
    else
        setTimeout(fn, 0);
}
function arrayToObject(array, extractor) {
    return array.reduce((result, item, i) => {
        var nameAndValue = extractor(item, i);
        if (nameAndValue)
            result[nameAndValue[0]] = nameAndValue[1];
        return result;
    }, {});
}
function tryCatch(fn, onerror, args) {
    try {
        fn.apply(null, args);
    }
    catch (ex) {
        onerror && onerror(ex);
    }
}
function getByKeyPath(obj, keyPath) {
    if (hasOwn(obj, keyPath))
        return obj[keyPath];
    if (!keyPath)
        return obj;
    if (typeof keyPath !== 'string') {
        var rv = [];
        for (var i = 0, l = keyPath.length; i < l; ++i) {
            var val = getByKeyPath(obj, keyPath[i]);
            rv.push(val);
        }
        return rv;
    }
    var period = keyPath.indexOf('.');
    if (period !== -1) {
        var innerObj = obj[keyPath.substr(0, period)];
        return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
    }
    return undefined;
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
            if (remainingKeyPath === "")
                if (value === undefined) {
                    if (isArray(obj) && !isNaN(parseInt(currentKeyPath)))
                        obj.splice(currentKeyPath, 1);
                    else
                        delete obj[currentKeyPath];
                }
                else
                    obj[currentKeyPath] = value;
            else {
                var innerObj = obj[currentKeyPath];
                if (!innerObj || !hasOwn(obj, currentKeyPath))
                    innerObj = (obj[currentKeyPath] = {});
                setByKeyPath(innerObj, remainingKeyPath, value);
            }
        }
        else {
            if (value === undefined) {
                if (isArray(obj) && !isNaN(parseInt(keyPath)))
                    obj.splice(keyPath, 1);
                else
                    delete obj[keyPath];
            }
            else
                obj[keyPath] = value;
        }
    }
}
function delByKeyPath(obj, keyPath) {
    if (typeof keyPath === 'string')
        setByKeyPath(obj, keyPath, undefined);
    else if ('length' in keyPath)
        [].map.call(keyPath, function (kp) {
            setByKeyPath(obj, kp, undefined);
        });
}
function shallowClone(obj) {
    var rv = {};
    for (var m in obj) {
        if (hasOwn(obj, m))
            rv[m] = obj[m];
    }
    return rv;
}
const concat = [].concat;
function flatten(a) {
    return concat.apply([], a);
}
const intrinsicTypeNames = "Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey"
    .split(',').concat(flatten([8, 16, 32, 64].map(num => ["Int", "Uint", "Float"].map(t => t + num + "Array")))).filter(t => _global[t]);
const intrinsicTypes = intrinsicTypeNames.map(t => _global[t]);
arrayToObject(intrinsicTypeNames, x => [x, true]);
let circularRefs = null;
function deepClone(any) {
    circularRefs = typeof WeakMap !== 'undefined' && new WeakMap();
    const rv = innerDeepClone(any);
    circularRefs = null;
    return rv;
}
function innerDeepClone(any) {
    if (!any || typeof any !== 'object')
        return any;
    let rv = circularRefs && circularRefs.get(any);
    if (rv)
        return rv;
    if (isArray(any)) {
        rv = [];
        circularRefs && circularRefs.set(any, rv);
        for (var i = 0, l = any.length; i < l; ++i) {
            rv.push(innerDeepClone(any[i]));
        }
    }
    else if (intrinsicTypes.indexOf(any.constructor) >= 0) {
        rv = any;
    }
    else {
        const proto = getProto(any);
        rv = proto === Object.prototype ? {} : Object.create(proto);
        circularRefs && circularRefs.set(any, rv);
        for (var prop in any) {
            if (hasOwn(any, prop)) {
                rv[prop] = innerDeepClone(any[prop]);
            }
        }
    }
    return rv;
}
const { toString } = {};
function toStringTag(o) {
    return toString.call(o).slice(8, -1);
}
const iteratorSymbol = typeof Symbol !== 'undefined' ?
    Symbol.iterator :
    '@@iterator';
const getIteratorOf = typeof iteratorSymbol === "symbol" ? function (x) {
    var i;
    return x != null && (i = x[iteratorSymbol]) && i.apply(x);
} : function () { return null; };
const NO_CHAR_ARRAY = {};
function getArrayOf(arrayLike) {
    var i, a, x, it;
    if (arguments.length === 1) {
        if (isArray(arrayLike))
            return arrayLike.slice();
        if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string')
            return [arrayLike];
        if ((it = getIteratorOf(arrayLike))) {
            a = [];
            while ((x = it.next()), !x.done)
                a.push(x.value);
            return a;
        }
        if (arrayLike == null)
            return [arrayLike];
        i = arrayLike.length;
        if (typeof i === 'number') {
            a = new Array(i);
            while (i--)
                a[i] = arrayLike[i];
            return a;
        }
        return [arrayLike];
    }
    i = arguments.length;
    a = new Array(i);
    while (i--)
        a[i] = arguments[i];
    return a;
}
const isAsyncFunction = typeof Symbol !== 'undefined'
    ? (fn) => fn[Symbol.toStringTag] === 'AsyncFunction'
    : () => false;

var debug = typeof location !== 'undefined' &&
    /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
function setDebug(value, filter) {
    debug = value;
    libraryFilter = filter;
}
var libraryFilter = () => true;
const NEEDS_THROW_FOR_STACK = !new Error("").stack;
function getErrorWithStack() {
    if (NEEDS_THROW_FOR_STACK)
        try {
            getErrorWithStack.arguments;
            throw new Error();
        }
        catch (e) {
            return e;
        }
    return new Error();
}
function prettyStack(exception, numIgnoredFrames) {
    var stack = exception.stack;
    if (!stack)
        return "";
    numIgnoredFrames = (numIgnoredFrames || 0);
    if (stack.indexOf(exception.name) === 0)
        numIgnoredFrames += (exception.name + exception.message).split('\n').length;
    return stack.split('\n')
        .slice(numIgnoredFrames)
        .filter(libraryFilter)
        .map(frame => "\n" + frame)
        .join('');
}

var dexieErrorNames = [
    'Modify',
    'Bulk',
    'OpenFailed',
    'VersionChange',
    'Schema',
    'Upgrade',
    'InvalidTable',
    'MissingAPI',
    'NoSuchDatabase',
    'InvalidArgument',
    'SubTransaction',
    'Unsupported',
    'Internal',
    'DatabaseClosed',
    'PrematureCommit',
    'ForeignAwait'
];
var idbDomErrorNames = [
    'Unknown',
    'Constraint',
    'Data',
    'TransactionInactive',
    'ReadOnly',
    'Version',
    'NotFound',
    'InvalidState',
    'InvalidAccess',
    'Abort',
    'Timeout',
    'QuotaExceeded',
    'Syntax',
    'DataClone'
];
var errorList = dexieErrorNames.concat(idbDomErrorNames);
var defaultTexts = {
    VersionChanged: "Database version changed by other database connection",
    DatabaseClosed: "Database has been closed",
    Abort: "Transaction aborted",
    TransactionInactive: "Transaction has already completed or failed",
    MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
};
function DexieError(name, msg) {
    this._e = getErrorWithStack();
    this.name = name;
    this.message = msg;
}
derive(DexieError).from(Error).extend({
    stack: {
        get: function () {
            return this._stack ||
                (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
        }
    },
    toString: function () { return this.name + ": " + this.message; }
});
function getMultiErrorMessage(msg, failures) {
    return msg + ". Errors: " + Object.keys(failures)
        .map(key => failures[key].toString())
        .filter((v, i, s) => s.indexOf(v) === i)
        .join('\n');
}
function ModifyError(msg, failures, successCount, failedKeys) {
    this._e = getErrorWithStack();
    this.failures = failures;
    this.failedKeys = failedKeys;
    this.successCount = successCount;
    this.message = getMultiErrorMessage(msg, failures);
}
derive(ModifyError).from(DexieError);
function BulkError(msg, failures) {
    this._e = getErrorWithStack();
    this.name = "BulkError";
    this.failures = Object.keys(failures).map(pos => failures[pos]);
    this.failuresByPos = failures;
    this.message = getMultiErrorMessage(msg, failures);
}
derive(BulkError).from(DexieError);
var errnames = errorList.reduce((obj, name) => (obj[name] = name + "Error", obj), {});
const BaseException = DexieError;
var exceptions = errorList.reduce((obj, name) => {
    var fullName = name + "Error";
    function DexieError(msgOrInner, inner) {
        this._e = getErrorWithStack();
        this.name = fullName;
        if (!msgOrInner) {
            this.message = defaultTexts[name] || fullName;
            this.inner = null;
        }
        else if (typeof msgOrInner === 'string') {
            this.message = `${msgOrInner}${!inner ? '' : '\n ' + inner}`;
            this.inner = inner || null;
        }
        else if (typeof msgOrInner === 'object') {
            this.message = `${msgOrInner.name} ${msgOrInner.message}`;
            this.inner = msgOrInner;
        }
    }
    derive(DexieError).from(BaseException);
    obj[name] = DexieError;
    return obj;
}, {});
exceptions.Syntax = SyntaxError;
exceptions.Type = TypeError;
exceptions.Range = RangeError;
var exceptionMap = idbDomErrorNames.reduce((obj, name) => {
    obj[name + "Error"] = exceptions[name];
    return obj;
}, {});
function mapError(domError, message) {
    if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
        return domError;
    var rv = new exceptionMap[domError.name](message || domError.message, domError);
    if ("stack" in domError) {
        setProp(rv, "stack", { get: function () {
                return this.inner.stack;
            } });
    }
    return rv;
}
var fullNameExceptions = errorList.reduce((obj, name) => {
    if (["Syntax", "Type", "Range"].indexOf(name) === -1)
        obj[name + "Error"] = exceptions[name];
    return obj;
}, {});
fullNameExceptions.ModifyError = ModifyError;
fullNameExceptions.DexieError = DexieError;
fullNameExceptions.BulkError = BulkError;

function nop() { }
function mirror(val) { return val; }
function pureFunctionChain(f1, f2) {
    if (f1 == null || f1 === mirror)
        return f2;
    return function (val) {
        return f2(f1(val));
    };
}
function callBoth(on1, on2) {
    return function () {
        on1.apply(this, arguments);
        on2.apply(this, arguments);
    };
}
function hookCreatingChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res !== undefined)
            arguments[0] = res;
        var onsuccess = this.onsuccess,
        onerror = this.onerror;
        this.onsuccess = null;
        this.onerror = null;
        var res2 = f2.apply(this, arguments);
        if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        return res2 !== undefined ? res2 : res;
    };
}
function hookDeletingChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function () {
        f1.apply(this, arguments);
        var onsuccess = this.onsuccess,
        onerror = this.onerror;
        this.onsuccess = this.onerror = null;
        f2.apply(this, arguments);
        if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    };
}
function hookUpdatingChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function (modifications) {
        var res = f1.apply(this, arguments);
        extend(modifications, res);
        var onsuccess = this.onsuccess,
        onerror = this.onerror;
        this.onsuccess = null;
        this.onerror = null;
        var res2 = f2.apply(this, arguments);
        if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
        if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        return res === undefined ?
            (res2 === undefined ? undefined : res2) :
            (extend(res, res2));
    };
}
function reverseStoppableEventChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function () {
        if (f2.apply(this, arguments) === false)
            return false;
        return f1.apply(this, arguments);
    };
}
function promisableChain(f1, f2) {
    if (f1 === nop)
        return f2;
    return function () {
        var res = f1.apply(this, arguments);
        if (res && typeof res.then === 'function') {
            var thiz = this, i = arguments.length, args = new Array(i);
            while (i--)
                args[i] = arguments[i];
            return res.then(function () {
                return f2.apply(thiz, args);
            });
        }
        return f2.apply(this, arguments);
    };
}

var INTERNAL = {};
const LONG_STACKS_CLIP_LIMIT = 100,
MAX_LONG_STACKS = 20, ZONE_ECHO_LIMIT = 100, [resolvedNativePromise, nativePromiseProto, resolvedGlobalPromise] = typeof Promise === 'undefined' ?
    [] :
    (() => {
        let globalP = Promise.resolve();
        if (typeof crypto === 'undefined' || !crypto.subtle)
            return [globalP, getProto(globalP), globalP];
        const nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
        return [
            nativeP,
            getProto(nativeP),
            globalP
        ];
    })(), nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
const NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
const patchGlobalPromise = !!resolvedGlobalPromise;
var stack_being_generated = false;
var schedulePhysicalTick = resolvedGlobalPromise ?
    () => { resolvedGlobalPromise.then(physicalTick); }
    :
        _global.setImmediate ?
            setImmediate.bind(null, physicalTick) :
            _global.MutationObserver ?
                () => {
                    var hiddenDiv = document.createElement("div");
                    (new MutationObserver(() => {
                        physicalTick();
                        hiddenDiv = null;
                    })).observe(hiddenDiv, { attributes: true });
                    hiddenDiv.setAttribute('i', '1');
                } :
                () => { setTimeout(physicalTick, 0); };
var asap = function (callback, args) {
    microtickQueue.push([callback, args]);
    if (needsNewPhysicalTick) {
        schedulePhysicalTick();
        needsNewPhysicalTick = false;
    }
};
var isOutsideMicroTick = true,
needsNewPhysicalTick = true,
unhandledErrors = [],
rejectingErrors = [],
currentFulfiller = null, rejectionMapper = mirror;
var globalPSD = {
    id: 'global',
    global: true,
    ref: 0,
    unhandleds: [],
    onunhandled: globalError,
    pgp: false,
    env: {},
    finalize: function () {
        this.unhandleds.forEach(uh => {
            try {
                globalError(uh[0], uh[1]);
            }
            catch (e) { }
        });
    }
};
var PSD = globalPSD;
var microtickQueue = [];
var numScheduledCalls = 0;
var tickFinalizers = [];
function DexiePromise(fn) {
    if (typeof this !== 'object')
        throw new TypeError('Promises must be constructed via new');
    this._listeners = [];
    this.onuncatched = nop;
    this._lib = false;
    var psd = (this._PSD = PSD);
    if (debug) {
        this._stackHolder = getErrorWithStack();
        this._prev = null;
        this._numPrev = 0;
    }
    if (typeof fn !== 'function') {
        if (fn !== INTERNAL)
            throw new TypeError('Not a function');
        this._state = arguments[1];
        this._value = arguments[2];
        if (this._state === false)
            handleRejection(this, this._value);
        return;
    }
    this._state = null;
    this._value = null;
    ++psd.ref;
    executePromiseTask(this, fn);
}
const thenProp = {
    get: function () {
        var psd = PSD, microTaskId = totalEchoes;
        function then(onFulfilled, onRejected) {
            var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
            const cleanup = possibleAwait && !decrementExpectedAwaits();
            var rv = new DexiePromise((resolve, reject) => {
                propagateToListener(this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
            });
            debug && linkToPreviousPromise(rv, this);
            return rv;
        }
        then.prototype = INTERNAL;
        return then;
    },
    set: function (value) {
        setProp(this, 'then', value && value.prototype === INTERNAL ?
            thenProp :
            {
                get: function () {
                    return value;
                },
                set: thenProp.set
            });
    }
};
props(DexiePromise.prototype, {
    then: thenProp,
    _then: function (onFulfilled, onRejected) {
        propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
    },
    catch: function (onRejected) {
        if (arguments.length === 1)
            return this.then(null, onRejected);
        var type = arguments[0], handler = arguments[1];
        return typeof type === 'function' ? this.then(null, err =>
        err instanceof type ? handler(err) : PromiseReject(err))
            : this.then(null, err =>
            err && err.name === type ? handler(err) : PromiseReject(err));
    },
    finally: function (onFinally) {
        return this.then(value => {
            onFinally();
            return value;
        }, err => {
            onFinally();
            return PromiseReject(err);
        });
    },
    stack: {
        get: function () {
            if (this._stack)
                return this._stack;
            try {
                stack_being_generated = true;
                var stacks = getStack(this, [], MAX_LONG_STACKS);
                var stack = stacks.join("\nFrom previous: ");
                if (this._state !== null)
                    this._stack = stack;
                return stack;
            }
            finally {
                stack_being_generated = false;
            }
        }
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
globalPSD.env = snapShot();
function Listener(onFulfilled, onRejected, resolve, reject, zone) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
    this.psd = zone;
}
props(DexiePromise, {
    all: function () {
        var values = getArrayOf.apply(null, arguments)
            .map(onPossibleParallellAsync);
        return new DexiePromise(function (resolve, reject) {
            if (values.length === 0)
                resolve([]);
            var remaining = values.length;
            values.forEach((a, i) => DexiePromise.resolve(a).then(x => {
                values[i] = x;
                if (!--remaining)
                    resolve(values);
            }, reject));
        });
    },
    resolve: value => {
        if (value instanceof DexiePromise)
            return value;
        if (value && typeof value.then === 'function')
            return new DexiePromise((resolve, reject) => {
                value.then(resolve, reject);
            });
        var rv = new DexiePromise(INTERNAL, true, value);
        linkToPreviousPromise(rv, currentFulfiller);
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
        get: () => PSD,
        set: value => PSD = value
    },
    totalEchoes: { get: () => totalEchoes },
    newPSD: newScope,
    usePSD: usePSD,
    scheduler: {
        get: () => asap,
        set: value => { asap = value; }
    },
    rejectionMapper: {
        get: () => rejectionMapper,
        set: value => { rejectionMapper = value; }
    },
    follow: (fn, zoneProps) => {
        return new DexiePromise((resolve, reject) => {
            return newScope((resolve, reject) => {
                var psd = PSD;
                psd.unhandleds = [];
                psd.onunhandled = reject;
                psd.finalize = callBoth(function () {
                    run_at_end_of_this_or_next_physical_tick(() => {
                        this.unhandleds.length === 0 ? resolve() : reject(this.unhandleds[0]);
                    });
                }, psd.finalize);
                fn();
            }, zoneProps, resolve, reject);
        });
    }
});
if (NativePromise) {
    if (NativePromise.allSettled)
        setProp(DexiePromise, "allSettled", function () {
            const possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(resolve => {
                if (possiblePromises.length === 0)
                    resolve([]);
                let remaining = possiblePromises.length;
                const results = new Array(remaining);
                possiblePromises.forEach((p, i) => DexiePromise.resolve(p).then(value => results[i] = { status: "fulfilled", value }, reason => results[i] = { status: "rejected", reason })
                    .then(() => --remaining || resolve(results)));
            });
        });
    if (NativePromise.any && typeof AggregateError !== 'undefined')
        setProp(DexiePromise, "any", function () {
            const possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise((resolve, reject) => {
                if (possiblePromises.length === 0)
                    reject(new AggregateError([]));
                let remaining = possiblePromises.length;
                const failures = new Array(remaining);
                possiblePromises.forEach((p, i) => DexiePromise.resolve(p).then(value => resolve(value), failure => {
                    failures[i] = failure;
                    if (!--remaining)
                        reject(new AggregateError(failures));
                }));
            });
        });
}
function executePromiseTask(promise, fn) {
    try {
        fn(value => {
            if (promise._state !== null)
                return;
            if (value === promise)
                throw new TypeError('A promise cannot be resolved with itself.');
            var shouldExecuteTick = promise._lib && beginMicroTickScope();
            if (value && typeof value.then === 'function') {
                executePromiseTask(promise, (resolve, reject) => {
                    value instanceof DexiePromise ?
                        value._then(resolve, reject) :
                        value.then(resolve, reject);
                });
            }
            else {
                promise._state = true;
                promise._value = value;
                propagateAllListeners(promise);
            }
            if (shouldExecuteTick)
                endMicroTickScope();
        }, handleRejection.bind(null, promise));
    }
    catch (ex) {
        handleRejection(promise, ex);
    }
}
function handleRejection(promise, reason) {
    rejectingErrors.push(reason);
    if (promise._state !== null)
        return;
    var shouldExecuteTick = promise._lib && beginMicroTickScope();
    reason = rejectionMapper(reason);
    promise._state = false;
    promise._value = reason;
    debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(() => {
        var origProp = getPropertyDescriptor(reason, "stack");
        reason._promise = promise;
        setProp(reason, "stack", {
            get: () => stack_being_generated ?
                origProp && (origProp.get ?
                    origProp.get.apply(reason) :
                    origProp.value) :
                promise.stack
        });
    });
    addPossiblyUnhandledError(promise);
    propagateAllListeners(promise);
    if (shouldExecuteTick)
        endMicroTickScope();
}
function propagateAllListeners(promise) {
    var listeners = promise._listeners;
    promise._listeners = [];
    for (var i = 0, len = listeners.length; i < len; ++i) {
        propagateToListener(promise, listeners[i]);
    }
    var psd = promise._PSD;
    --psd.ref || psd.finalize();
    if (numScheduledCalls === 0) {
        ++numScheduledCalls;
        asap(() => {
            if (--numScheduledCalls === 0)
                finalizePhysicalTick();
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
        return (promise._state ? listener.resolve : listener.reject)(promise._value);
    }
    ++listener.psd.ref;
    ++numScheduledCalls;
    asap(callListener, [cb, promise, listener]);
}
function callListener(cb, promise, listener) {
    try {
        currentFulfiller = promise;
        var ret, value = promise._value;
        if (promise._state) {
            ret = cb(value);
        }
        else {
            if (rejectingErrors.length)
                rejectingErrors = [];
            ret = cb(value);
            if (rejectingErrors.indexOf(value) === -1)
                markErrorAsHandled(promise);
        }
        listener.resolve(ret);
    }
    catch (e) {
        listener.reject(e);
    }
    finally {
        currentFulfiller = null;
        if (--numScheduledCalls === 0)
            finalizePhysicalTick();
        --listener.psd.ref || listener.psd.finalize();
    }
}
function getStack(promise, stacks, limit) {
    if (stacks.length === limit)
        return stacks;
    var stack = "";
    if (promise._state === false) {
        var failure = promise._value, errorName, message;
        if (failure != null) {
            errorName = failure.name || "Error";
            message = failure.message || failure;
            stack = prettyStack(failure, 0);
        }
        else {
            errorName = failure;
            message = "";
        }
        stacks.push(errorName + (message ? ": " + message : "") + stack);
    }
    if (debug) {
        stack = prettyStack(promise._stackHolder, 2);
        if (stack && stacks.indexOf(stack) === -1)
            stacks.push(stack);
        if (promise._prev)
            getStack(promise._prev, stacks, limit);
    }
    return stacks;
}
function linkToPreviousPromise(promise, prev) {
    var numPrev = prev ? prev._numPrev + 1 : 0;
    if (numPrev < LONG_STACKS_CLIP_LIMIT) {
        promise._prev = prev;
        promise._numPrev = numPrev;
    }
}
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
    var finalizers = tickFinalizers.slice(0);
    var i = finalizers.length;
    while (i)
        finalizers[--i]();
}
function run_at_end_of_this_or_next_physical_tick(fn) {
    function finalizer() {
        fn();
        tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
    }
    tickFinalizers.push(finalizer);
    ++numScheduledCalls;
    asap(() => {
        if (--numScheduledCalls === 0)
            finalizePhysicalTick();
    }, []);
}
function addPossiblyUnhandledError(promise) {
    if (!unhandledErrors.some(p => p._value === promise._value))
        unhandledErrors.push(promise);
}
function markErrorAsHandled(promise) {
    var i = unhandledErrors.length;
    while (i)
        if (unhandledErrors[--i]._value === promise._value) {
            unhandledErrors.splice(i, 1);
            return;
        }
}
function PromiseReject(reason) {
    return new DexiePromise(INTERNAL, false, reason);
}
function wrap(fn, errorCatcher) {
    var psd = PSD;
    return function () {
        var wasRootExec = beginMicroTickScope(), outerScope = PSD;
        try {
            switchToZone(psd, true);
            return fn.apply(this, arguments);
        }
        catch (e) {
            errorCatcher && errorCatcher(e);
        }
        finally {
            switchToZone(outerScope, false);
            if (wasRootExec)
                endMicroTickScope();
        }
    };
}
const task = { awaits: 0, echoes: 0, id: 0 };
var taskCounter = 0;
var zoneStack = [];
var zoneEchoes = 0;
var totalEchoes = 0;
var zone_id_counter = 0;
function newScope(fn, props, a1, a2) {
    var parent = PSD, psd = Object.create(parent);
    psd.parent = parent;
    psd.ref = 0;
    psd.global = false;
    psd.id = ++zone_id_counter;
    var globalEnv = globalPSD.env;
    psd.env = patchGlobalPromise ? {
        Promise: DexiePromise,
        PromiseProp: { value: DexiePromise, configurable: true, writable: true },
        all: DexiePromise.all,
        race: DexiePromise.race,
        allSettled: DexiePromise.allSettled,
        any: DexiePromise.any,
        resolve: DexiePromise.resolve,
        reject: DexiePromise.reject,
        nthen: getPatchedPromiseThen(globalEnv.nthen, psd),
        gthen: getPatchedPromiseThen(globalEnv.gthen, psd)
    } : {};
    if (props)
        extend(psd, props);
    ++parent.ref;
    psd.finalize = function () {
        --this.parent.ref || this.parent.finalize();
    };
    var rv = usePSD(psd, fn, a1, a2);
    if (psd.ref === 0)
        psd.finalize();
    return rv;
}
function incrementExpectedAwaits() {
    if (!task.id)
        task.id = ++taskCounter;
    ++task.awaits;
    task.echoes += ZONE_ECHO_LIMIT;
    return task.id;
}
function decrementExpectedAwaits() {
    if (!task.awaits)
        return false;
    if (--task.awaits === 0)
        task.id = 0;
    task.echoes = task.awaits * ZONE_ECHO_LIMIT;
    return true;
}
if (('' + nativePromiseThen).indexOf('[native code]') === -1) {
    incrementExpectedAwaits = decrementExpectedAwaits = nop;
}
function onPossibleParallellAsync(possiblePromise) {
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
    if (!task.echoes || --task.echoes === 0) {
        task.echoes = task.id = 0;
    }
    zoneStack.push(PSD);
    switchToZone(targetZone, true);
}
function zoneLeaveEcho() {
    var zone = zoneStack[zoneStack.length - 1];
    zoneStack.pop();
    switchToZone(zone, false);
}
function switchToZone(targetZone, bEnteringZone) {
    var currentZone = PSD;
    if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
        enqueueNativeMicroTask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
    }
    if (targetZone === PSD)
        return;
    PSD = targetZone;
    if (currentZone === globalPSD)
        globalPSD.env = snapShot();
    if (patchGlobalPromise) {
        var GlobalPromise = globalPSD.env.Promise;
        var targetEnv = targetZone.env;
        nativePromiseProto.then = targetEnv.nthen;
        GlobalPromise.prototype.then = targetEnv.gthen;
        if (currentZone.global || targetZone.global) {
            Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp);
            GlobalPromise.all = targetEnv.all;
            GlobalPromise.race = targetEnv.race;
            GlobalPromise.resolve = targetEnv.resolve;
            GlobalPromise.reject = targetEnv.reject;
            if (targetEnv.allSettled)
                GlobalPromise.allSettled = targetEnv.allSettled;
            if (targetEnv.any)
                GlobalPromise.any = targetEnv.any;
        }
    }
}
function snapShot() {
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
        nthen: nativePromiseProto.then,
        gthen: GlobalPromise.prototype.then
    } : {};
}
function usePSD(psd, fn, a1, a2, a3) {
    var outerScope = PSD;
    try {
        switchToZone(psd, true);
        return fn(a1, a2, a3);
    }
    finally {
        switchToZone(outerScope, false);
    }
}
function enqueueNativeMicroTask(job) {
    nativePromiseThen.call(resolvedNativePromise, job);
}
function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
    return typeof fn !== 'function' ? fn : function () {
        var outerZone = PSD;
        if (possibleAwait)
            incrementExpectedAwaits();
        switchToZone(zone, true);
        try {
            return fn.apply(this, arguments);
        }
        finally {
            switchToZone(outerZone, false);
            if (cleanup)
                enqueueNativeMicroTask(decrementExpectedAwaits);
        }
    };
}
function getPatchedPromiseThen(origThen, zone) {
    return function (onResolved, onRejected) {
        return origThen.call(this, nativeAwaitCompatibleWrap(onResolved, zone), nativeAwaitCompatibleWrap(onRejected, zone));
    };
}
const UNHANDLEDREJECTION = "unhandledrejection";
function globalError(err, promise) {
    var rv;
    try {
        rv = promise.onuncatched(err);
    }
    catch (e) { }
    if (rv !== false)
        try {
            var event, eventData = { promise: promise, reason: err };
            if (_global.document && document.createEvent) {
                event = document.createEvent('Event');
                event.initEvent(UNHANDLEDREJECTION, true, true);
                extend(event, eventData);
            }
            else if (_global.CustomEvent) {
                event = new CustomEvent(UNHANDLEDREJECTION, { detail: eventData });
                extend(event, eventData);
            }
            if (event && _global.dispatchEvent) {
                dispatchEvent(event);
                if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
                    try {
                        _global.onunhandledrejection(event);
                    }
                    catch (_) { }
            }
            if (debug && event && !event.defaultPrevented) {
                console.warn(`Unhandled rejection: ${err.stack || err}`);
            }
        }
        catch (e) { }
}
var rejection = DexiePromise.reject;

function tempTransaction(db, mode, storeNames, fn) {
    if (!db.idbdb || (!db._state.openComplete && (!PSD.letThrough && !db._vip))) {
        if (db._state.openComplete) {
            return rejection(new exceptions.DatabaseClosed(db._state.dbOpenError));
        }
        if (!db._state.isBeingOpened) {
            if (!db._options.autoOpen)
                return rejection(new exceptions.DatabaseClosed());
            db.open().catch(nop);
        }
        return db._state.dbReadyPromise.then(() => tempTransaction(db, mode, storeNames, fn));
    }
    else {
        var trans = db._createTransaction(mode, storeNames, db._dbSchema);
        try {
            trans.create();
            db._state.PR1398_maxLoop = 3;
        }
        catch (ex) {
            if (ex.name === errnames.InvalidState && db.isOpen() && --db._state.PR1398_maxLoop > 0) {
                console.warn('Dexie: Need to reopen db');
                db._close();
                return db.open().then(() => tempTransaction(db, mode, storeNames, fn));
            }
            return rejection(ex);
        }
        return trans._promise(mode, (resolve, reject) => {
            return newScope(() => {
                PSD.trans = trans;
                return fn(resolve, reject, trans);
            });
        }).then(result => {
            return trans._completion.then(() => result);
        });
    }
}

const DEXIE_VERSION = '3.2.2';
const maxString = String.fromCharCode(65535);
const minKey = -Infinity;
const INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
const STRING_EXPECTED = "String expected.";
const connections = [];
const isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
const hasIEDeleteObjectStoreBug = isIEOrEdge;
const hangsOnDeleteLargeKeyRange = isIEOrEdge;
const dexieStackFrameFilter = frame => !/(dexie\.js|dexie\.min\.js)/.test(frame);
const DBNAMES_DB = '__dbnames';
const READONLY = 'readonly';
const READWRITE = 'readwrite';

function combine(filter1, filter2) {
    return filter1 ?
        filter2 ?
            function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments); } :
            filter1 :
        filter2;
}

const AnyRange = {
    type: 3 ,
    lower: -Infinity,
    lowerOpen: false,
    upper: [[]],
    upperOpen: false
};

function workaroundForUndefinedPrimKey(keyPath) {
    return typeof keyPath === "string" && !/\./.test(keyPath)
        ? (obj) => {
            if (obj[keyPath] === undefined && (keyPath in obj)) {
                obj = deepClone(obj);
                delete obj[keyPath];
            }
            return obj;
        }
        : (obj) => obj;
}

class Table {
    _trans(mode, fn, writeLocked) {
        const trans = this._tx || PSD.trans;
        const tableName = this.name;
        function checkTableInTransaction(resolve, reject, trans) {
            if (!trans.schema[tableName])
                throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
            return fn(trans.idbtrans, trans);
        }
        const wasRootExec = beginMicroTickScope();
        try {
            return trans && trans.db === this.db ?
                trans === PSD.trans ?
                    trans._promise(mode, checkTableInTransaction, writeLocked) :
                    newScope(() => trans._promise(mode, checkTableInTransaction, writeLocked), { trans: trans, transless: PSD.transless || PSD }) :
                tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
        }
        finally {
            if (wasRootExec)
                endMicroTickScope();
        }
    }
    get(keyOrCrit, cb) {
        if (keyOrCrit && keyOrCrit.constructor === Object)
            return this.where(keyOrCrit).first(cb);
        return this._trans('readonly', (trans) => {
            return this.core.get({ trans, key: keyOrCrit })
                .then(res => this.hook.reading.fire(res));
        }).then(cb);
    }
    where(indexOrCrit) {
        if (typeof indexOrCrit === 'string')
            return new this.db.WhereClause(this, indexOrCrit);
        if (isArray(indexOrCrit))
            return new this.db.WhereClause(this, `[${indexOrCrit.join('+')}]`);
        const keyPaths = keys(indexOrCrit);
        if (keyPaths.length === 1)
            return this
                .where(keyPaths[0])
                .equals(indexOrCrit[keyPaths[0]]);
        const compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(ix => ix.compound &&
            keyPaths.every(keyPath => ix.keyPath.indexOf(keyPath) >= 0) &&
            ix.keyPath.every(keyPath => keyPaths.indexOf(keyPath) >= 0))[0];
        if (compoundIndex && this.db._maxKey !== maxString)
            return this
                .where(compoundIndex.name)
                .equals(compoundIndex.keyPath.map(kp => indexOrCrit[kp]));
        if (!compoundIndex && debug)
            console.warn(`The query ${JSON.stringify(indexOrCrit)} on ${this.name} would benefit of a ` +
                `compound index [${keyPaths.join('+')}]`);
        const { idxByName } = this.schema;
        const idb = this.db._deps.indexedDB;
        function equals(a, b) {
            try {
                return idb.cmp(a, b) === 0;
            }
            catch (e) {
                return false;
            }
        }
        const [idx, filterFunction] = keyPaths.reduce(([prevIndex, prevFilterFn], keyPath) => {
            const index = idxByName[keyPath];
            const value = indexOrCrit[keyPath];
            return [
                prevIndex || index,
                prevIndex || !index ?
                    combine(prevFilterFn, index && index.multi ?
                        x => {
                            const prop = getByKeyPath(x, keyPath);
                            return isArray(prop) && prop.some(item => equals(value, item));
                        } : x => equals(value, getByKeyPath(x, keyPath)))
                    : prevFilterFn
            ];
        }, [null, null]);
        return idx ?
            this.where(idx.name).equals(indexOrCrit[idx.keyPath])
                .filter(filterFunction) :
            compoundIndex ?
                this.filter(filterFunction) :
                this.where(keyPaths).equals('');
    }
    filter(filterFunction) {
        return this.toCollection().and(filterFunction);
    }
    count(thenShortcut) {
        return this.toCollection().count(thenShortcut);
    }
    offset(offset) {
        return this.toCollection().offset(offset);
    }
    limit(numRows) {
        return this.toCollection().limit(numRows);
    }
    each(callback) {
        return this.toCollection().each(callback);
    }
    toArray(thenShortcut) {
        return this.toCollection().toArray(thenShortcut);
    }
    toCollection() {
        return new this.db.Collection(new this.db.WhereClause(this));
    }
    orderBy(index) {
        return new this.db.Collection(new this.db.WhereClause(this, isArray(index) ?
            `[${index.join('+')}]` :
            index));
    }
    reverse() {
        return this.toCollection().reverse();
    }
    mapToClass(constructor) {
        this.schema.mappedClass = constructor;
        const readHook = obj => {
            if (!obj)
                return obj;
            const res = Object.create(constructor.prototype);
            for (var m in obj)
                if (hasOwn(obj, m))
                    try {
                        res[m] = obj[m];
                    }
                    catch (_) { }
            return res;
        };
        if (this.schema.readHook) {
            this.hook.reading.unsubscribe(this.schema.readHook);
        }
        this.schema.readHook = readHook;
        this.hook("reading", readHook);
        return constructor;
    }
    defineClass() {
        function Class(content) {
            extend(this, content);
        }
        return this.mapToClass(Class);
    }
    add(obj, key) {
        const { auto, keyPath } = this.schema.primKey;
        let objToAdd = obj;
        if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
        }
        return this._trans('readwrite', trans => {
            return this.core.mutate({ trans, type: 'add', keys: key != null ? [key] : null, values: [objToAdd] });
        }).then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult)
            .then(lastResult => {
            if (keyPath) {
                try {
                    setByKeyPath(obj, keyPath, lastResult);
                }
                catch (_) { }
            }
            return lastResult;
        });
    }
    update(keyOrObject, modifications) {
        if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
            const key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
            if (key === undefined)
                return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
            try {
                if (typeof modifications !== "function") {
                    keys(modifications).forEach(keyPath => {
                        setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                    });
                }
                else {
                    modifications(keyOrObject, { value: keyOrObject, primKey: key });
                }
            }
            catch (_a) {
            }
            return this.where(":id").equals(key).modify(modifications);
        }
        else {
            return this.where(":id").equals(keyOrObject).modify(modifications);
        }
    }
    put(obj, key) {
        const { auto, keyPath } = this.schema.primKey;
        let objToAdd = obj;
        if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
        }
        return this._trans('readwrite', trans => this.core.mutate({ trans, type: 'put', values: [objToAdd], keys: key != null ? [key] : null }))
            .then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult)
            .then(lastResult => {
            if (keyPath) {
                try {
                    setByKeyPath(obj, keyPath, lastResult);
                }
                catch (_) { }
            }
            return lastResult;
        });
    }
    delete(key) {
        return this._trans('readwrite', trans => this.core.mutate({ trans, type: 'delete', keys: [key] }))
            .then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined);
    }
    clear() {
        return this._trans('readwrite', trans => this.core.mutate({ trans, type: 'deleteRange', range: AnyRange }))
            .then(res => res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined);
    }
    bulkGet(keys) {
        return this._trans('readonly', trans => {
            return this.core.getMany({
                keys,
                trans
            }).then(result => result.map(res => this.hook.reading.fire(res)));
        });
    }
    bulkAdd(objects, keysOrOptions, options) {
        const keys = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
        options = options || (keys ? undefined : keysOrOptions);
        const wantResults = options ? options.allKeys : undefined;
        return this._trans('readwrite', trans => {
            const { auto, keyPath } = this.schema.primKey;
            if (keyPath && keys)
                throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
            if (keys && keys.length !== objects.length)
                throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            const numObjects = objects.length;
            let objectsToAdd = keyPath && auto ?
                objects.map(workaroundForUndefinedPrimKey(keyPath)) :
                objects;
            return this.core.mutate({ trans, type: 'add', keys: keys, values: objectsToAdd, wantResults })
                .then(({ numFailures, results, lastResult, failures }) => {
                const result = wantResults ? results : lastResult;
                if (numFailures === 0)
                    return result;
                throw new BulkError(`${this.name}.bulkAdd(): ${numFailures} of ${numObjects} operations failed`, failures);
            });
        });
    }
    bulkPut(objects, keysOrOptions, options) {
        const keys = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
        options = options || (keys ? undefined : keysOrOptions);
        const wantResults = options ? options.allKeys : undefined;
        return this._trans('readwrite', trans => {
            const { auto, keyPath } = this.schema.primKey;
            if (keyPath && keys)
                throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
            if (keys && keys.length !== objects.length)
                throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            const numObjects = objects.length;
            let objectsToPut = keyPath && auto ?
                objects.map(workaroundForUndefinedPrimKey(keyPath)) :
                objects;
            return this.core.mutate({ trans, type: 'put', keys: keys, values: objectsToPut, wantResults })
                .then(({ numFailures, results, lastResult, failures }) => {
                const result = wantResults ? results : lastResult;
                if (numFailures === 0)
                    return result;
                throw new BulkError(`${this.name}.bulkPut(): ${numFailures} of ${numObjects} operations failed`, failures);
            });
        });
    }
    bulkDelete(keys) {
        const numKeys = keys.length;
        return this._trans('readwrite', trans => {
            return this.core.mutate({ trans, type: 'delete', keys: keys });
        }).then(({ numFailures, lastResult, failures }) => {
            if (numFailures === 0)
                return lastResult;
            throw new BulkError(`${this.name}.bulkDelete(): ${numFailures} of ${numKeys} operations failed`, failures);
        });
    }
}

function Events(ctx) {
    var evs = {};
    var rv = function (eventName, subscriber) {
        if (subscriber) {
            var i = arguments.length, args = new Array(i - 1);
            while (--i)
                args[i - 1] = arguments[i];
            evs[eventName].subscribe.apply(null, args);
            return ctx;
        }
        else if (typeof (eventName) === 'string') {
            return evs[eventName];
        }
    };
    rv.addEventType = add;
    for (var i = 1, l = arguments.length; i < l; ++i) {
        add(arguments[i]);
    }
    return rv;
    function add(eventName, chainFunction, defaultFunction) {
        if (typeof eventName === 'object')
            return addConfiguredEvents(eventName);
        if (!chainFunction)
            chainFunction = reverseStoppableEventChain;
        if (!defaultFunction)
            defaultFunction = nop;
        var context = {
            subscribers: [],
            fire: defaultFunction,
            subscribe: function (cb) {
                if (context.subscribers.indexOf(cb) === -1) {
                    context.subscribers.push(cb);
                    context.fire = chainFunction(context.fire, cb);
                }
            },
            unsubscribe: function (cb) {
                context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
                context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
            }
        };
        evs[eventName] = rv[eventName] = context;
        return context;
    }
    function addConfiguredEvents(cfg) {
        keys(cfg).forEach(function (eventName) {
            var args = cfg[eventName];
            if (isArray(args)) {
                add(eventName, cfg[eventName][0], cfg[eventName][1]);
            }
            else if (args === 'asap') {
                var context = add(eventName, mirror, function fire() {
                    var i = arguments.length, args = new Array(i);
                    while (i--)
                        args[i] = arguments[i];
                    context.subscribers.forEach(function (fn) {
                        asap$1(function fireEvent() {
                            fn.apply(null, args);
                        });
                    });
                });
            }
            else
                throw new exceptions.InvalidArgument("Invalid event config");
        });
    }
}

function makeClassConstructor(prototype, constructor) {
    derive(constructor).from({ prototype });
    return constructor;
}

function createTableConstructor(db) {
    return makeClassConstructor(Table.prototype, function Table(name, tableSchema, trans) {
        this.db = db;
        this._tx = trans;
        this.name = name;
        this.schema = tableSchema;
        this.hook = db._allTables[name] ? db._allTables[name].hook : Events(null, {
            "creating": [hookCreatingChain, nop],
            "reading": [pureFunctionChain, mirror],
            "updating": [hookUpdatingChain, nop],
            "deleting": [hookDeletingChain, nop]
        });
    });
}

function isPlainKeyRange(ctx, ignoreLimitFilter) {
    return !(ctx.filter || ctx.algorithm || ctx.or) &&
        (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
}
function addFilter(ctx, fn) {
    ctx.filter = combine(ctx.filter, fn);
}
function addReplayFilter(ctx, factory, isLimitFilter) {
    var curr = ctx.replayFilter;
    ctx.replayFilter = curr ? () => combine(curr(), factory()) : factory;
    ctx.justLimit = isLimitFilter && !curr;
}
function addMatchFilter(ctx, fn) {
    ctx.isMatch = combine(ctx.isMatch, fn);
}
function getIndexOrStore(ctx, coreSchema) {
    if (ctx.isPrimKey)
        return coreSchema.primaryKey;
    const index = coreSchema.getIndexByKeyPath(ctx.index);
    if (!index)
        throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
    return index;
}
function openCursor(ctx, coreTable, trans) {
    const index = getIndexOrStore(ctx, coreTable.schema);
    return coreTable.openCursor({
        trans,
        values: !ctx.keysOnly,
        reverse: ctx.dir === 'prev',
        unique: !!ctx.unique,
        query: {
            index,
            range: ctx.range
        }
    });
}
function iter(ctx, fn, coreTrans, coreTable) {
    const filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
    if (!ctx.or) {
        return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
    }
    else {
        const set = {};
        const union = (item, cursor, advance) => {
            if (!filter || filter(cursor, advance, result => cursor.stop(result), err => cursor.fail(err))) {
                var primaryKey = cursor.primaryKey;
                var key = '' + primaryKey;
                if (key === '[object ArrayBuffer]')
                    key = '' + new Uint8Array(primaryKey);
                if (!hasOwn(set, key)) {
                    set[key] = true;
                    fn(item, cursor, advance);
                }
            }
        };
        return Promise.all([
            ctx.or._iterate(union, coreTrans),
            iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
        ]);
    }
}
function iterate(cursorPromise, filter, fn, valueMapper) {
    var mappedFn = valueMapper ? (x, c, a) => fn(valueMapper(x), c, a) : fn;
    var wrappedFn = wrap(mappedFn);
    return cursorPromise.then(cursor => {
        if (cursor) {
            return cursor.start(() => {
                var c = () => cursor.continue();
                if (!filter || filter(cursor, advancer => c = advancer, val => { cursor.stop(val); c = nop; }, e => { cursor.fail(e); c = nop; }))
                    wrappedFn(cursor.value, cursor, advancer => c = advancer);
                c();
            });
        }
    });
}

function cmp(a, b) {
    try {
        const ta = type(a);
        const tb = type(b);
        if (ta !== tb) {
            if (ta === 'Array')
                return 1;
            if (tb === 'Array')
                return -1;
            if (ta === 'binary')
                return 1;
            if (tb === 'binary')
                return -1;
            if (ta === 'string')
                return 1;
            if (tb === 'string')
                return -1;
            if (ta === 'Date')
                return 1;
            if (tb !== 'Date')
                return NaN;
            return -1;
        }
        switch (ta) {
            case 'number':
            case 'Date':
            case 'string':
                return a > b ? 1 : a < b ? -1 : 0;
            case 'binary': {
                return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
            }
            case 'Array':
                return compareArrays(a, b);
        }
    }
    catch (_a) { }
    return NaN;
}
function compareArrays(a, b) {
    const al = a.length;
    const bl = b.length;
    const l = al < bl ? al : bl;
    for (let i = 0; i < l; ++i) {
        const res = cmp(a[i], b[i]);
        if (res !== 0)
            return res;
    }
    return al === bl ? 0 : al < bl ? -1 : 1;
}
function compareUint8Arrays(a, b) {
    const al = a.length;
    const bl = b.length;
    const l = al < bl ? al : bl;
    for (let i = 0; i < l; ++i) {
        if (a[i] !== b[i])
            return a[i] < b[i] ? -1 : 1;
    }
    return al === bl ? 0 : al < bl ? -1 : 1;
}
function type(x) {
    const t = typeof x;
    if (t !== 'object')
        return t;
    if (ArrayBuffer.isView(x))
        return 'binary';
    const tsTag = toStringTag(x);
    return tsTag === 'ArrayBuffer' ? 'binary' : tsTag;
}
function getUint8Array(a) {
    if (a instanceof Uint8Array)
        return a;
    if (ArrayBuffer.isView(a))
        return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    return new Uint8Array(a);
}

class Collection {
    _read(fn, cb) {
        var ctx = this._ctx;
        return ctx.error ?
            ctx.table._trans(null, rejection.bind(null, ctx.error)) :
            ctx.table._trans('readonly', fn).then(cb);
    }
    _write(fn) {
        var ctx = this._ctx;
        return ctx.error ?
            ctx.table._trans(null, rejection.bind(null, ctx.error)) :
            ctx.table._trans('readwrite', fn, "locked");
    }
    _addAlgorithm(fn) {
        var ctx = this._ctx;
        ctx.algorithm = combine(ctx.algorithm, fn);
    }
    _iterate(fn, coreTrans) {
        return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
    }
    clone(props) {
        var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
        if (props)
            extend(ctx, props);
        rv._ctx = ctx;
        return rv;
    }
    raw() {
        this._ctx.valueMapper = null;
        return this;
    }
    each(fn) {
        var ctx = this._ctx;
        return this._read(trans => iter(ctx, fn, trans, ctx.table.core));
    }
    count(cb) {
        return this._read(trans => {
            const ctx = this._ctx;
            const coreTable = ctx.table.core;
            if (isPlainKeyRange(ctx, true)) {
                return coreTable.count({
                    trans,
                    query: {
                        index: getIndexOrStore(ctx, coreTable.schema),
                        range: ctx.range
                    }
                }).then(count => Math.min(count, ctx.limit));
            }
            else {
                var count = 0;
                return iter(ctx, () => { ++count; return false; }, trans, coreTable)
                    .then(() => count);
            }
        }).then(cb);
    }
    sortBy(keyPath, cb) {
        const parts = keyPath.split('.').reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
        function getval(obj, i) {
            if (i)
                return getval(obj[parts[i]], i - 1);
            return obj[lastPart];
        }
        var order = this._ctx.dir === "next" ? 1 : -1;
        function sorter(a, b) {
            var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
            return aVal < bVal ? -order : aVal > bVal ? order : 0;
        }
        return this.toArray(function (a) {
            return a.sort(sorter);
        }).then(cb);
    }
    toArray(cb) {
        return this._read(trans => {
            var ctx = this._ctx;
            if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                const { valueMapper } = ctx;
                const index = getIndexOrStore(ctx, ctx.table.core.schema);
                return ctx.table.core.query({
                    trans,
                    limit: ctx.limit,
                    values: true,
                    query: {
                        index,
                        range: ctx.range
                    }
                }).then(({ result }) => valueMapper ? result.map(valueMapper) : result);
            }
            else {
                const a = [];
                return iter(ctx, item => a.push(item), trans, ctx.table.core).then(() => a);
            }
        }, cb);
    }
    offset(offset) {
        var ctx = this._ctx;
        if (offset <= 0)
            return this;
        ctx.offset += offset;
        if (isPlainKeyRange(ctx)) {
            addReplayFilter(ctx, () => {
                var offsetLeft = offset;
                return (cursor, advance) => {
                    if (offsetLeft === 0)
                        return true;
                    if (offsetLeft === 1) {
                        --offsetLeft;
                        return false;
                    }
                    advance(() => {
                        cursor.advance(offsetLeft);
                        offsetLeft = 0;
                    });
                    return false;
                };
            });
        }
        else {
            addReplayFilter(ctx, () => {
                var offsetLeft = offset;
                return () => (--offsetLeft < 0);
            });
        }
        return this;
    }
    limit(numRows) {
        this._ctx.limit = Math.min(this._ctx.limit, numRows);
        addReplayFilter(this._ctx, () => {
            var rowsLeft = numRows;
            return function (cursor, advance, resolve) {
                if (--rowsLeft <= 0)
                    advance(resolve);
                return rowsLeft >= 0;
            };
        }, true);
        return this;
    }
    until(filterFunction, bIncludeStopEntry) {
        addFilter(this._ctx, function (cursor, advance, resolve) {
            if (filterFunction(cursor.value)) {
                advance(resolve);
                return bIncludeStopEntry;
            }
            else {
                return true;
            }
        });
        return this;
    }
    first(cb) {
        return this.limit(1).toArray(function (a) { return a[0]; }).then(cb);
    }
    last(cb) {
        return this.reverse().first(cb);
    }
    filter(filterFunction) {
        addFilter(this._ctx, function (cursor) {
            return filterFunction(cursor.value);
        });
        addMatchFilter(this._ctx, filterFunction);
        return this;
    }
    and(filter) {
        return this.filter(filter);
    }
    or(indexName) {
        return new this.db.WhereClause(this._ctx.table, indexName, this);
    }
    reverse() {
        this._ctx.dir = (this._ctx.dir === "prev" ? "next" : "prev");
        if (this._ondirectionchange)
            this._ondirectionchange(this._ctx.dir);
        return this;
    }
    desc() {
        return this.reverse();
    }
    eachKey(cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        return this.each(function (val, cursor) { cb(cursor.key, cursor); });
    }
    eachUniqueKey(cb) {
        this._ctx.unique = "unique";
        return this.eachKey(cb);
    }
    eachPrimaryKey(cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        return this.each(function (val, cursor) { cb(cursor.primaryKey, cursor); });
    }
    keys(cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        var a = [];
        return this.each(function (item, cursor) {
            a.push(cursor.key);
        }).then(function () {
            return a;
        }).then(cb);
    }
    primaryKeys(cb) {
        var ctx = this._ctx;
        if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
            return this._read(trans => {
                var index = getIndexOrStore(ctx, ctx.table.core.schema);
                return ctx.table.core.query({
                    trans,
                    values: false,
                    limit: ctx.limit,
                    query: {
                        index,
                        range: ctx.range
                    }
                });
            }).then(({ result }) => result).then(cb);
        }
        ctx.keysOnly = !ctx.isMatch;
        var a = [];
        return this.each(function (item, cursor) {
            a.push(cursor.primaryKey);
        }).then(function () {
            return a;
        }).then(cb);
    }
    uniqueKeys(cb) {
        this._ctx.unique = "unique";
        return this.keys(cb);
    }
    firstKey(cb) {
        return this.limit(1).keys(function (a) { return a[0]; }).then(cb);
    }
    lastKey(cb) {
        return this.reverse().firstKey(cb);
    }
    distinct() {
        var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
        if (!idx || !idx.multi)
            return this;
        var set = {};
        addFilter(this._ctx, function (cursor) {
            var strKey = cursor.primaryKey.toString();
            var found = hasOwn(set, strKey);
            set[strKey] = true;
            return !found;
        });
        return this;
    }
    modify(changes) {
        var ctx = this._ctx;
        return this._write(trans => {
            var modifyer;
            if (typeof changes === 'function') {
                modifyer = changes;
            }
            else {
                var keyPaths = keys(changes);
                var numKeys = keyPaths.length;
                modifyer = function (item) {
                    var anythingModified = false;
                    for (var i = 0; i < numKeys; ++i) {
                        var keyPath = keyPaths[i], val = changes[keyPath];
                        if (getByKeyPath(item, keyPath) !== val) {
                            setByKeyPath(item, keyPath, val);
                            anythingModified = true;
                        }
                    }
                    return anythingModified;
                };
            }
            const coreTable = ctx.table.core;
            const { outbound, extractKey } = coreTable.schema.primaryKey;
            const limit = this.db._options.modifyChunkSize || 200;
            const totalFailures = [];
            let successCount = 0;
            const failedKeys = [];
            const applyMutateResult = (expectedCount, res) => {
                const { failures, numFailures } = res;
                successCount += expectedCount - numFailures;
                for (let pos of keys(failures)) {
                    totalFailures.push(failures[pos]);
                }
            };
            return this.clone().primaryKeys().then(keys => {
                const nextChunk = (offset) => {
                    const count = Math.min(limit, keys.length - offset);
                    return coreTable.getMany({
                        trans,
                        keys: keys.slice(offset, offset + count),
                        cache: "immutable"
                    }).then(values => {
                        const addValues = [];
                        const putValues = [];
                        const putKeys = outbound ? [] : null;
                        const deleteKeys = [];
                        for (let i = 0; i < count; ++i) {
                            const origValue = values[i];
                            const ctx = {
                                value: deepClone(origValue),
                                primKey: keys[offset + i]
                            };
                            if (modifyer.call(ctx, ctx.value, ctx) !== false) {
                                if (ctx.value == null) {
                                    deleteKeys.push(keys[offset + i]);
                                }
                                else if (!outbound && cmp(extractKey(origValue), extractKey(ctx.value)) !== 0) {
                                    deleteKeys.push(keys[offset + i]);
                                    addValues.push(ctx.value);
                                }
                                else {
                                    putValues.push(ctx.value);
                                    if (outbound)
                                        putKeys.push(keys[offset + i]);
                                }
                            }
                        }
                        const criteria = isPlainKeyRange(ctx) &&
                            ctx.limit === Infinity &&
                            (typeof changes !== 'function' || changes === deleteCallback) && {
                            index: ctx.index,
                            range: ctx.range
                        };
                        return Promise.resolve(addValues.length > 0 &&
                            coreTable.mutate({ trans, type: 'add', values: addValues })
                                .then(res => {
                                for (let pos in res.failures) {
                                    deleteKeys.splice(parseInt(pos), 1);
                                }
                                applyMutateResult(addValues.length, res);
                            })).then(() => (putValues.length > 0 || (criteria && typeof changes === 'object')) &&
                            coreTable.mutate({
                                trans,
                                type: 'put',
                                keys: putKeys,
                                values: putValues,
                                criteria,
                                changeSpec: typeof changes !== 'function'
                                    && changes
                            }).then(res => applyMutateResult(putValues.length, res))).then(() => (deleteKeys.length > 0 || (criteria && changes === deleteCallback)) &&
                            coreTable.mutate({
                                trans,
                                type: 'delete',
                                keys: deleteKeys,
                                criteria
                            }).then(res => applyMutateResult(deleteKeys.length, res))).then(() => {
                            return keys.length > offset + count && nextChunk(offset + limit);
                        });
                    });
                };
                return nextChunk(0).then(() => {
                    if (totalFailures.length > 0)
                        throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
                    return keys.length;
                });
            });
        });
    }
    delete() {
        var ctx = this._ctx, range = ctx.range;
        if (isPlainKeyRange(ctx) &&
            ((ctx.isPrimKey && !hangsOnDeleteLargeKeyRange) || range.type === 3 ))
         {
            return this._write(trans => {
                const { primaryKey } = ctx.table.core.schema;
                const coreRange = range;
                return ctx.table.core.count({ trans, query: { index: primaryKey, range: coreRange } }).then(count => {
                    return ctx.table.core.mutate({ trans, type: 'deleteRange', range: coreRange })
                        .then(({ failures, lastResult, results, numFailures }) => {
                        if (numFailures)
                            throw new ModifyError("Could not delete some values", Object.keys(failures).map(pos => failures[pos]), count - numFailures);
                        return count - numFailures;
                    });
                });
            });
        }
        return this.modify(deleteCallback);
    }
}
const deleteCallback = (value, ctx) => ctx.value = null;

function createCollectionConstructor(db) {
    return makeClassConstructor(Collection.prototype, function Collection(whereClause, keyRangeGenerator) {
        this.db = db;
        let keyRange = AnyRange, error = null;
        if (keyRangeGenerator)
            try {
                keyRange = keyRangeGenerator();
            }
            catch (ex) {
                error = ex;
            }
        const whereCtx = whereClause._ctx;
        const table = whereCtx.table;
        const readingHook = table.hook.reading.fire;
        this._ctx = {
            table: table,
            index: whereCtx.index,
            isPrimKey: (!whereCtx.index || (table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name)),
            range: keyRange,
            keysOnly: false,
            dir: "next",
            unique: "",
            algorithm: null,
            filter: null,
            replayFilter: null,
            justLimit: true,
            isMatch: null,
            offset: 0,
            limit: Infinity,
            error: error,
            or: whereCtx.or,
            valueMapper: readingHook !== mirror ? readingHook : null
        };
    });
}

function simpleCompare(a, b) {
    return a < b ? -1 : a === b ? 0 : 1;
}
function simpleCompareReverse(a, b) {
    return a > b ? -1 : a === b ? 0 : 1;
}

function fail(collectionOrWhereClause, err, T) {
    var collection = collectionOrWhereClause instanceof WhereClause ?
        new collectionOrWhereClause.Collection(collectionOrWhereClause) :
        collectionOrWhereClause;
    collection._ctx.error = T ? new T(err) : new TypeError(err);
    return collection;
}
function emptyCollection(whereClause) {
    return new whereClause.Collection(whereClause, () => rangeEqual("")).limit(0);
}
function upperFactory(dir) {
    return dir === "next" ?
        (s) => s.toUpperCase() :
        (s) => s.toLowerCase();
}
function lowerFactory(dir) {
    return dir === "next" ?
        (s) => s.toLowerCase() :
        (s) => s.toUpperCase();
}
function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
    var length = Math.min(key.length, lowerNeedle.length);
    var llp = -1;
    for (var i = 0; i < length; ++i) {
        var lwrKeyChar = lowerKey[i];
        if (lwrKeyChar !== lowerNeedle[i]) {
            if (cmp(key[i], upperNeedle[i]) < 0)
                return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
            if (cmp(key[i], lowerNeedle[i]) < 0)
                return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
            if (llp >= 0)
                return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
            return null;
        }
        if (cmp(key[i], lwrKeyChar) < 0)
            llp = i;
    }
    if (length < lowerNeedle.length && dir === "next")
        return key + upperNeedle.substr(key.length);
    if (length < key.length && dir === "prev")
        return key.substr(0, upperNeedle.length);
    return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
}
function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
    var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
    if (!needles.every(s => typeof s === 'string')) {
        return fail(whereClause, STRING_EXPECTED);
    }
    function initDirection(dir) {
        upper = upperFactory(dir);
        lower = lowerFactory(dir);
        compare = (dir === "next" ? simpleCompare : simpleCompareReverse);
        var needleBounds = needles.map(function (needle) {
            return { lower: lower(needle), upper: upper(needle) };
        }).sort(function (a, b) {
            return compare(a.lower, b.lower);
        });
        upperNeedles = needleBounds.map(function (nb) { return nb.upper; });
        lowerNeedles = needleBounds.map(function (nb) { return nb.lower; });
        direction = dir;
        nextKeySuffix = (dir === "next" ? "" : suffix);
    }
    initDirection("next");
    var c = new whereClause.Collection(whereClause, () => createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix));
    c._ondirectionchange = function (direction) {
        initDirection(direction);
    };
    var firstPossibleNeedle = 0;
    c._addAlgorithm(function (cursor, advance, resolve) {
        var key = cursor.key;
        if (typeof key !== 'string')
            return false;
        var lowerKey = lower(key);
        if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
            return true;
        }
        else {
            var lowestPossibleCasing = null;
            for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
                var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                if (casing === null && lowestPossibleCasing === null)
                    firstPossibleNeedle = i + 1;
                else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                    lowestPossibleCasing = casing;
                }
            }
            if (lowestPossibleCasing !== null) {
                advance(function () { cursor.continue(lowestPossibleCasing + nextKeySuffix); });
            }
            else {
                advance(resolve);
            }
            return false;
        }
    });
    return c;
}
function createRange(lower, upper, lowerOpen, upperOpen) {
    return {
        type: 2 ,
        lower,
        upper,
        lowerOpen,
        upperOpen
    };
}
function rangeEqual(value) {
    return {
        type: 1 ,
        lower: value,
        upper: value
    };
}

class WhereClause {
    get Collection() {
        return this._ctx.table.db.Collection;
    }
    between(lower, upper, includeLower, includeUpper) {
        includeLower = includeLower !== false;
        includeUpper = includeUpper === true;
        try {
            if ((this._cmp(lower, upper) > 0) ||
                (this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)))
                return emptyCollection(this);
            return new this.Collection(this, () => createRange(lower, upper, !includeLower, !includeUpper));
        }
        catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
        }
    }
    equals(value) {
        if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
        return new this.Collection(this, () => rangeEqual(value));
    }
    above(value) {
        if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
        return new this.Collection(this, () => createRange(value, undefined, true));
    }
    aboveOrEqual(value) {
        if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
        return new this.Collection(this, () => createRange(value, undefined, false));
    }
    below(value) {
        if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
        return new this.Collection(this, () => createRange(undefined, value, false, true));
    }
    belowOrEqual(value) {
        if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
        return new this.Collection(this, () => createRange(undefined, value));
    }
    startsWith(str) {
        if (typeof str !== 'string')
            return fail(this, STRING_EXPECTED);
        return this.between(str, str + maxString, true, true);
    }
    startsWithIgnoreCase(str) {
        if (str === "")
            return this.startsWith(str);
        return addIgnoreCaseAlgorithm(this, (x, a) => x.indexOf(a[0]) === 0, [str], maxString);
    }
    equalsIgnoreCase(str) {
        return addIgnoreCaseAlgorithm(this, (x, a) => x === a[0], [str], "");
    }
    anyOfIgnoreCase() {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0)
            return emptyCollection(this);
        return addIgnoreCaseAlgorithm(this, (x, a) => a.indexOf(x) !== -1, set, "");
    }
    startsWithAnyOfIgnoreCase() {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0)
            return emptyCollection(this);
        return addIgnoreCaseAlgorithm(this, (x, a) => a.some(n => x.indexOf(n) === 0), set, maxString);
    }
    anyOf() {
        const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        let compare = this._cmp;
        try {
            set.sort(compare);
        }
        catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
        }
        if (set.length === 0)
            return emptyCollection(this);
        const c = new this.Collection(this, () => createRange(set[0], set[set.length - 1]));
        c._ondirectionchange = direction => {
            compare = (direction === "next" ?
                this._ascending :
                this._descending);
            set.sort(compare);
        };
        let i = 0;
        c._addAlgorithm((cursor, advance, resolve) => {
            const key = cursor.key;
            while (compare(key, set[i]) > 0) {
                ++i;
                if (i === set.length) {
                    advance(resolve);
                    return false;
                }
            }
            if (compare(key, set[i]) === 0) {
                return true;
            }
            else {
                advance(() => { cursor.continue(set[i]); });
                return false;
            }
        });
        return c;
    }
    notEqual(value) {
        return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], { includeLowers: false, includeUppers: false });
    }
    noneOf() {
        const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0)
            return new this.Collection(this);
        try {
            set.sort(this._ascending);
        }
        catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
        }
        const ranges = set.reduce((res, val) => res ?
            res.concat([[res[res.length - 1][1], val]]) :
            [[minKey, val]], null);
        ranges.push([set[set.length - 1], this.db._maxKey]);
        return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
    }
    inAnyRange(ranges, options) {
        const cmp = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min, max = this._max;
        if (ranges.length === 0)
            return emptyCollection(this);
        if (!ranges.every(range => range[0] !== undefined &&
            range[1] !== undefined &&
            ascending(range[0], range[1]) <= 0)) {
            return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
        }
        const includeLowers = !options || options.includeLowers !== false;
        const includeUppers = options && options.includeUppers === true;
        function addRange(ranges, newRange) {
            let i = 0, l = ranges.length;
            for (; i < l; ++i) {
                const range = ranges[i];
                if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
                    range[0] = min(range[0], newRange[0]);
                    range[1] = max(range[1], newRange[1]);
                    break;
                }
            }
            if (i === l)
                ranges.push(newRange);
            return ranges;
        }
        let sortDirection = ascending;
        function rangeSorter(a, b) { return sortDirection(a[0], b[0]); }
        let set;
        try {
            set = ranges.reduce(addRange, []);
            set.sort(rangeSorter);
        }
        catch (ex) {
            return fail(this, INVALID_KEY_ARGUMENT);
        }
        let rangePos = 0;
        const keyIsBeyondCurrentEntry = includeUppers ?
            key => ascending(key, set[rangePos][1]) > 0 :
            key => ascending(key, set[rangePos][1]) >= 0;
        const keyIsBeforeCurrentEntry = includeLowers ?
            key => descending(key, set[rangePos][0]) > 0 :
            key => descending(key, set[rangePos][0]) >= 0;
        function keyWithinCurrentRange(key) {
            return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
        }
        let checkKey = keyIsBeyondCurrentEntry;
        const c = new this.Collection(this, () => createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers));
        c._ondirectionchange = direction => {
            if (direction === "next") {
                checkKey = keyIsBeyondCurrentEntry;
                sortDirection = ascending;
            }
            else {
                checkKey = keyIsBeforeCurrentEntry;
                sortDirection = descending;
            }
            set.sort(rangeSorter);
        };
        c._addAlgorithm((cursor, advance, resolve) => {
            var key = cursor.key;
            while (checkKey(key)) {
                ++rangePos;
                if (rangePos === set.length) {
                    advance(resolve);
                    return false;
                }
            }
            if (keyWithinCurrentRange(key)) {
                return true;
            }
            else if (this._cmp(key, set[rangePos][1]) === 0 || this._cmp(key, set[rangePos][0]) === 0) {
                return false;
            }
            else {
                advance(() => {
                    if (sortDirection === ascending)
                        cursor.continue(set[rangePos][0]);
                    else
                        cursor.continue(set[rangePos][1]);
                });
                return false;
            }
        });
        return c;
    }
    startsWithAnyOf() {
        const set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (!set.every(s => typeof s === 'string')) {
            return fail(this, "startsWithAnyOf() only works with strings");
        }
        if (set.length === 0)
            return emptyCollection(this);
        return this.inAnyRange(set.map((str) => [str, str + maxString]));
    }
}

function createWhereClauseConstructor(db) {
    return makeClassConstructor(WhereClause.prototype, function WhereClause(table, index, orCollection) {
        this.db = db;
        this._ctx = {
            table: table,
            index: index === ":id" ? null : index,
            or: orCollection
        };
        const indexedDB = db._deps.indexedDB;
        if (!indexedDB)
            throw new exceptions.MissingAPI();
        this._cmp = this._ascending = indexedDB.cmp.bind(indexedDB);
        this._descending = (a, b) => indexedDB.cmp(b, a);
        this._max = (a, b) => indexedDB.cmp(a, b) > 0 ? a : b;
        this._min = (a, b) => indexedDB.cmp(a, b) < 0 ? a : b;
        this._IDBKeyRange = db._deps.IDBKeyRange;
    });
}

function eventRejectHandler(reject) {
    return wrap(function (event) {
        preventDefault(event);
        reject(event.target.error);
        return false;
    });
}
function preventDefault(event) {
    if (event.stopPropagation)
        event.stopPropagation();
    if (event.preventDefault)
        event.preventDefault();
}

const DEXIE_STORAGE_MUTATED_EVENT_NAME = 'storagemutated';
const STORAGE_MUTATED_DOM_EVENT_NAME = 'x-storagemutated-1';
const globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);

class Transaction {
    _lock() {
        assert(!PSD.global);
        ++this._reculock;
        if (this._reculock === 1 && !PSD.global)
            PSD.lockOwnerFor = this;
        return this;
    }
    _unlock() {
        assert(!PSD.global);
        if (--this._reculock === 0) {
            if (!PSD.global)
                PSD.lockOwnerFor = null;
            while (this._blockedFuncs.length > 0 && !this._locked()) {
                var fnAndPSD = this._blockedFuncs.shift();
                try {
                    usePSD(fnAndPSD[1], fnAndPSD[0]);
                }
                catch (e) { }
            }
        }
        return this;
    }
    _locked() {
        return this._reculock && PSD.lockOwnerFor !== this;
    }
    create(idbtrans) {
        if (!this.mode)
            return this;
        const idbdb = this.db.idbdb;
        const dbOpenError = this.db._state.dbOpenError;
        assert(!this.idbtrans);
        if (!idbtrans && !idbdb) {
            switch (dbOpenError && dbOpenError.name) {
                case "DatabaseClosedError":
                    throw new exceptions.DatabaseClosed(dbOpenError);
                case "MissingAPIError":
                    throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                default:
                    throw new exceptions.OpenFailed(dbOpenError);
            }
        }
        if (!this.active)
            throw new exceptions.TransactionInactive();
        assert(this._completion._state === null);
        idbtrans = this.idbtrans = idbtrans ||
            (this.db.core
                ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })
                : idbdb.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }));
        idbtrans.onerror = wrap(ev => {
            preventDefault(ev);
            this._reject(idbtrans.error);
        });
        idbtrans.onabort = wrap(ev => {
            preventDefault(ev);
            this.active && this._reject(new exceptions.Abort(idbtrans.error));
            this.active = false;
            this.on("abort").fire(ev);
        });
        idbtrans.oncomplete = wrap(() => {
            this.active = false;
            this._resolve();
            if ('mutatedParts' in idbtrans) {
                globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
            }
        });
        return this;
    }
    _promise(mode, fn, bWriteLock) {
        if (mode === 'readwrite' && this.mode !== 'readwrite')
            return rejection(new exceptions.ReadOnly("Transaction is readonly"));
        if (!this.active)
            return rejection(new exceptions.TransactionInactive());
        if (this._locked()) {
            return new DexiePromise((resolve, reject) => {
                this._blockedFuncs.push([() => {
                        this._promise(mode, fn, bWriteLock).then(resolve, reject);
                    }, PSD]);
            });
        }
        else if (bWriteLock) {
            return newScope(() => {
                var p = new DexiePromise((resolve, reject) => {
                    this._lock();
                    const rv = fn(resolve, reject, this);
                    if (rv && rv.then)
                        rv.then(resolve, reject);
                });
                p.finally(() => this._unlock());
                p._lib = true;
                return p;
            });
        }
        else {
            var p = new DexiePromise((resolve, reject) => {
                var rv = fn(resolve, reject, this);
                if (rv && rv.then)
                    rv.then(resolve, reject);
            });
            p._lib = true;
            return p;
        }
    }
    _root() {
        return this.parent ? this.parent._root() : this;
    }
    waitFor(promiseLike) {
        var root = this._root();
        const promise = DexiePromise.resolve(promiseLike);
        if (root._waitingFor) {
            root._waitingFor = root._waitingFor.then(() => promise);
        }
        else {
            root._waitingFor = promise;
            root._waitingQueue = [];
            var store = root.idbtrans.objectStore(root.storeNames[0]);
            (function spin() {
                ++root._spinCount;
                while (root._waitingQueue.length)
                    (root._waitingQueue.shift())();
                if (root._waitingFor)
                    store.get(-Infinity).onsuccess = spin;
            }());
        }
        var currentWaitPromise = root._waitingFor;
        return new DexiePromise((resolve, reject) => {
            promise.then(res => root._waitingQueue.push(wrap(resolve.bind(null, res))), err => root._waitingQueue.push(wrap(reject.bind(null, err)))).finally(() => {
                if (root._waitingFor === currentWaitPromise) {
                    root._waitingFor = null;
                }
            });
        });
    }
    abort() {
        if (this.active) {
            this.active = false;
            if (this.idbtrans)
                this.idbtrans.abort();
            this._reject(new exceptions.Abort());
        }
    }
    table(tableName) {
        const memoizedTables = (this._memoizedTables || (this._memoizedTables = {}));
        if (hasOwn(memoizedTables, tableName))
            return memoizedTables[tableName];
        const tableSchema = this.schema[tableName];
        if (!tableSchema) {
            throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
        }
        const transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
        transactionBoundTable.core = this.db.core.table(tableName);
        memoizedTables[tableName] = transactionBoundTable;
        return transactionBoundTable;
    }
}

function createTransactionConstructor(db) {
    return makeClassConstructor(Transaction.prototype, function Transaction(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
        this.db = db;
        this.mode = mode;
        this.storeNames = storeNames;
        this.schema = dbschema;
        this.chromeTransactionDurability = chromeTransactionDurability;
        this.idbtrans = null;
        this.on = Events(this, "complete", "error", "abort");
        this.parent = parent || null;
        this.active = true;
        this._reculock = 0;
        this._blockedFuncs = [];
        this._resolve = null;
        this._reject = null;
        this._waitingFor = null;
        this._waitingQueue = null;
        this._spinCount = 0;
        this._completion = new DexiePromise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        this._completion.then(() => {
            this.active = false;
            this.on.complete.fire();
        }, e => {
            var wasActive = this.active;
            this.active = false;
            this.on.error.fire(e);
            this.parent ?
                this.parent._reject(e) :
                wasActive && this.idbtrans && this.idbtrans.abort();
            return rejection(e);
        });
    });
}

function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey) {
    return {
        name,
        keyPath,
        unique,
        multi,
        auto,
        compound,
        src: (unique && !isPrimKey ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + nameFromKeyPath(keyPath)
    };
}
function nameFromKeyPath(keyPath) {
    return typeof keyPath === 'string' ?
        keyPath :
        keyPath ? ('[' + [].join.call(keyPath, '+') + ']') : "";
}

function createTableSchema(name, primKey, indexes) {
    return {
        name,
        primKey,
        indexes,
        mappedClass: null,
        idxByName: arrayToObject(indexes, index => [index.name, index])
    };
}

function safariMultiStoreFix(storeNames) {
    return storeNames.length === 1 ? storeNames[0] : storeNames;
}
let getMaxKey = (IdbKeyRange) => {
    try {
        IdbKeyRange.only([[]]);
        getMaxKey = () => [[]];
        return [[]];
    }
    catch (e) {
        getMaxKey = () => maxString;
        return maxString;
    }
};

function getKeyExtractor(keyPath) {
    if (keyPath == null) {
        return () => undefined;
    }
    else if (typeof keyPath === 'string') {
        return getSinglePathKeyExtractor(keyPath);
    }
    else {
        return obj => getByKeyPath(obj, keyPath);
    }
}
function getSinglePathKeyExtractor(keyPath) {
    const split = keyPath.split('.');
    if (split.length === 1) {
        return obj => obj[keyPath];
    }
    else {
        return obj => getByKeyPath(obj, keyPath);
    }
}

function arrayify(arrayLike) {
    return [].slice.call(arrayLike);
}
let _id_counter = 0;
function getKeyPathAlias(keyPath) {
    return keyPath == null ?
        ":id" :
        typeof keyPath === 'string' ?
            keyPath :
            `[${keyPath.join('+')}]`;
}
function createDBCore(db, IdbKeyRange, tmpTrans) {
    function extractSchema(db, trans) {
        const tables = arrayify(db.objectStoreNames);
        return {
            schema: {
                name: db.name,
                tables: tables.map(table => trans.objectStore(table)).map(store => {
                    const { keyPath, autoIncrement } = store;
                    const compound = isArray(keyPath);
                    const outbound = keyPath == null;
                    const indexByKeyPath = {};
                    const result = {
                        name: store.name,
                        primaryKey: {
                            name: null,
                            isPrimaryKey: true,
                            outbound,
                            compound,
                            keyPath,
                            autoIncrement,
                            unique: true,
                            extractKey: getKeyExtractor(keyPath)
                        },
                        indexes: arrayify(store.indexNames).map(indexName => store.index(indexName))
                            .map(index => {
                            const { name, unique, multiEntry, keyPath } = index;
                            const compound = isArray(keyPath);
                            const result = {
                                name,
                                compound,
                                keyPath,
                                unique,
                                multiEntry,
                                extractKey: getKeyExtractor(keyPath)
                            };
                            indexByKeyPath[getKeyPathAlias(keyPath)] = result;
                            return result;
                        }),
                        getIndexByKeyPath: (keyPath) => indexByKeyPath[getKeyPathAlias(keyPath)]
                    };
                    indexByKeyPath[":id"] = result.primaryKey;
                    if (keyPath != null) {
                        indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
                    }
                    return result;
                })
            },
            hasGetAll: tables.length > 0 && ('getAll' in trans.objectStore(tables[0])) &&
                !(typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
                    !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
                    [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
        };
    }
    function makeIDBKeyRange(range) {
        if (range.type === 3 )
            return null;
        if (range.type === 4 )
            throw new Error("Cannot convert never type to IDBKeyRange");
        const { lower, upper, lowerOpen, upperOpen } = range;
        const idbRange = lower === undefined ?
            upper === undefined ?
                null :
                IdbKeyRange.upperBound(upper, !!upperOpen) :
            upper === undefined ?
                IdbKeyRange.lowerBound(lower, !!lowerOpen) :
                IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
        return idbRange;
    }
    function createDbCoreTable(tableSchema) {
        const tableName = tableSchema.name;
        function mutate({ trans, type, keys, values, range }) {
            return new Promise((resolve, reject) => {
                resolve = wrap(resolve);
                const store = trans.objectStore(tableName);
                const outbound = store.keyPath == null;
                const isAddOrPut = type === "put" || type === "add";
                if (!isAddOrPut && type !== 'delete' && type !== 'deleteRange')
                    throw new Error("Invalid operation type: " + type);
                const { length } = keys || values || { length: 1 };
                if (keys && values && keys.length !== values.length) {
                    throw new Error("Given keys array must have same length as given values array.");
                }
                if (length === 0)
                    return resolve({ numFailures: 0, failures: {}, results: [], lastResult: undefined });
                let req;
                const reqs = [];
                const failures = [];
                let numFailures = 0;
                const errorHandler = event => {
                    ++numFailures;
                    preventDefault(event);
                };
                if (type === 'deleteRange') {
                    if (range.type === 4 )
                        return resolve({ numFailures, failures, results: [], lastResult: undefined });
                    if (range.type === 3 )
                        reqs.push(req = store.clear());
                    else
                        reqs.push(req = store.delete(makeIDBKeyRange(range)));
                }
                else {
                    const [args1, args2] = isAddOrPut ?
                        outbound ?
                            [values, keys] :
                            [values, null] :
                        [keys, null];
                    if (isAddOrPut) {
                        for (let i = 0; i < length; ++i) {
                            reqs.push(req = (args2 && args2[i] !== undefined ?
                                store[type](args1[i], args2[i]) :
                                store[type](args1[i])));
                            req.onerror = errorHandler;
                        }
                    }
                    else {
                        for (let i = 0; i < length; ++i) {
                            reqs.push(req = store[type](args1[i]));
                            req.onerror = errorHandler;
                        }
                    }
                }
                const done = event => {
                    const lastResult = event.target.result;
                    reqs.forEach((req, i) => req.error != null && (failures[i] = req.error));
                    resolve({
                        numFailures,
                        failures,
                        results: type === "delete" ? keys : reqs.map(req => req.result),
                        lastResult
                    });
                };
                req.onerror = event => {
                    errorHandler(event);
                    done(event);
                };
                req.onsuccess = done;
            });
        }
        function openCursor({ trans, values, query, reverse, unique }) {
            return new Promise((resolve, reject) => {
                resolve = wrap(resolve);
                const { index, range } = query;
                const store = trans.objectStore(tableName);
                const source = index.isPrimaryKey ?
                    store :
                    store.index(index.name);
                const direction = reverse ?
                    unique ?
                        "prevunique" :
                        "prev" :
                    unique ?
                        "nextunique" :
                        "next";
                const req = values || !('openKeyCursor' in source) ?
                    source.openCursor(makeIDBKeyRange(range), direction) :
                    source.openKeyCursor(makeIDBKeyRange(range), direction);
                req.onerror = eventRejectHandler(reject);
                req.onsuccess = wrap(ev => {
                    const cursor = req.result;
                    if (!cursor) {
                        resolve(null);
                        return;
                    }
                    cursor.___id = ++_id_counter;
                    cursor.done = false;
                    const _cursorContinue = cursor.continue.bind(cursor);
                    let _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
                    if (_cursorContinuePrimaryKey)
                        _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
                    const _cursorAdvance = cursor.advance.bind(cursor);
                    const doThrowCursorIsNotStarted = () => { throw new Error("Cursor not started"); };
                    const doThrowCursorIsStopped = () => { throw new Error("Cursor not stopped"); };
                    cursor.trans = trans;
                    cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
                    cursor.fail = wrap(reject);
                    cursor.next = function () {
                        let gotOne = 1;
                        return this.start(() => gotOne-- ? this.continue() : this.stop()).then(() => this);
                    };
                    cursor.start = (callback) => {
                        const iterationPromise = new Promise((resolveIteration, rejectIteration) => {
                            resolveIteration = wrap(resolveIteration);
                            req.onerror = eventRejectHandler(rejectIteration);
                            cursor.fail = rejectIteration;
                            cursor.stop = value => {
                                cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                                resolveIteration(value);
                            };
                        });
                        const guardedCallback = () => {
                            if (req.result) {
                                try {
                                    callback();
                                }
                                catch (err) {
                                    cursor.fail(err);
                                }
                            }
                            else {
                                cursor.done = true;
                                cursor.start = () => { throw new Error("Cursor behind last entry"); };
                                cursor.stop();
                            }
                        };
                        req.onsuccess = wrap(ev => {
                            req.onsuccess = guardedCallback;
                            guardedCallback();
                        });
                        cursor.continue = _cursorContinue;
                        cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
                        cursor.advance = _cursorAdvance;
                        guardedCallback();
                        return iterationPromise;
                    };
                    resolve(cursor);
                }, reject);
            });
        }
        function query(hasGetAll) {
            return (request) => {
                return new Promise((resolve, reject) => {
                    resolve = wrap(resolve);
                    const { trans, values, limit, query } = request;
                    const nonInfinitLimit = limit === Infinity ? undefined : limit;
                    const { index, range } = query;
                    const store = trans.objectStore(tableName);
                    const source = index.isPrimaryKey ? store : store.index(index.name);
                    const idbKeyRange = makeIDBKeyRange(range);
                    if (limit === 0)
                        return resolve({ result: [] });
                    if (hasGetAll) {
                        const req = values ?
                            source.getAll(idbKeyRange, nonInfinitLimit) :
                            source.getAllKeys(idbKeyRange, nonInfinitLimit);
                        req.onsuccess = event => resolve({ result: event.target.result });
                        req.onerror = eventRejectHandler(reject);
                    }
                    else {
                        let count = 0;
                        const req = values || !('openKeyCursor' in source) ?
                            source.openCursor(idbKeyRange) :
                            source.openKeyCursor(idbKeyRange);
                        const result = [];
                        req.onsuccess = event => {
                            const cursor = req.result;
                            if (!cursor)
                                return resolve({ result });
                            result.push(values ? cursor.value : cursor.primaryKey);
                            if (++count === limit)
                                return resolve({ result });
                            cursor.continue();
                        };
                        req.onerror = eventRejectHandler(reject);
                    }
                });
            };
        }
        return {
            name: tableName,
            schema: tableSchema,
            mutate,
            getMany({ trans, keys }) {
                return new Promise((resolve, reject) => {
                    resolve = wrap(resolve);
                    const store = trans.objectStore(tableName);
                    const length = keys.length;
                    const result = new Array(length);
                    let keyCount = 0;
                    let callbackCount = 0;
                    let req;
                    const successHandler = event => {
                        const req = event.target;
                        if ((result[req._pos] = req.result) != null)
                            ;
                        if (++callbackCount === keyCount)
                            resolve(result);
                    };
                    const errorHandler = eventRejectHandler(reject);
                    for (let i = 0; i < length; ++i) {
                        const key = keys[i];
                        if (key != null) {
                            req = store.get(keys[i]);
                            req._pos = i;
                            req.onsuccess = successHandler;
                            req.onerror = errorHandler;
                            ++keyCount;
                        }
                    }
                    if (keyCount === 0)
                        resolve(result);
                });
            },
            get({ trans, key }) {
                return new Promise((resolve, reject) => {
                    resolve = wrap(resolve);
                    const store = trans.objectStore(tableName);
                    const req = store.get(key);
                    req.onsuccess = event => resolve(event.target.result);
                    req.onerror = eventRejectHandler(reject);
                });
            },
            query: query(hasGetAll),
            openCursor,
            count({ query, trans }) {
                const { index, range } = query;
                return new Promise((resolve, reject) => {
                    const store = trans.objectStore(tableName);
                    const source = index.isPrimaryKey ? store : store.index(index.name);
                    const idbKeyRange = makeIDBKeyRange(range);
                    const req = idbKeyRange ? source.count(idbKeyRange) : source.count();
                    req.onsuccess = wrap(ev => resolve(ev.target.result));
                    req.onerror = eventRejectHandler(reject);
                });
            }
        };
    }
    const { schema, hasGetAll } = extractSchema(db, tmpTrans);
    const tables = schema.tables.map(tableSchema => createDbCoreTable(tableSchema));
    const tableMap = {};
    tables.forEach(table => tableMap[table.name] = table);
    return {
        stack: "dbcore",
        transaction: db.transaction.bind(db),
        table(name) {
            const result = tableMap[name];
            if (!result)
                throw new Error(`Table '${name}' not found`);
            return tableMap[name];
        },
        MIN_KEY: -Infinity,
        MAX_KEY: getMaxKey(IdbKeyRange),
        schema
    };
}

function createMiddlewareStack(stackImpl, middlewares) {
    return middlewares.reduce((down, { create }) => ({ ...down, ...create(down) }), stackImpl);
}
function createMiddlewareStacks(middlewares, idbdb, { IDBKeyRange, indexedDB }, tmpTrans) {
    const dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
    return {
        dbcore
    };
}
function generateMiddlewareStacks({ _novip: db }, tmpTrans) {
    const idbdb = tmpTrans.db;
    const stacks = createMiddlewareStacks(db._middlewares, idbdb, db._deps, tmpTrans);
    db.core = stacks.dbcore;
    db.tables.forEach(table => {
        const tableName = table.name;
        if (db.core.schema.tables.some(tbl => tbl.name === tableName)) {
            table.core = db.core.table(tableName);
            if (db[tableName] instanceof db.Table) {
                db[tableName].core = table.core;
            }
        }
    });
}

function setApiOnPlace({ _novip: db }, objs, tableNames, dbschema) {
    tableNames.forEach(tableName => {
        const schema = dbschema[tableName];
        objs.forEach(obj => {
            const propDesc = getPropertyDescriptor(obj, tableName);
            if (!propDesc || ("value" in propDesc && propDesc.value === undefined)) {
                if (obj === db.Transaction.prototype || obj instanceof db.Transaction) {
                    setProp(obj, tableName, {
                        get() { return this.table(tableName); },
                        set(value) {
                            defineProperty(this, tableName, { value, writable: true, configurable: true, enumerable: true });
                        }
                    });
                }
                else {
                    obj[tableName] = new db.Table(tableName, schema);
                }
            }
        });
    });
}
function removeTablesApi({ _novip: db }, objs) {
    objs.forEach(obj => {
        for (let key in obj) {
            if (obj[key] instanceof db.Table)
                delete obj[key];
        }
    });
}
function lowerVersionFirst(a, b) {
    return a._cfg.version - b._cfg.version;
}
function runUpgraders(db, oldVersion, idbUpgradeTrans, reject) {
    const globalSchema = db._dbSchema;
    const trans = db._createTransaction('readwrite', db._storeNames, globalSchema);
    trans.create(idbUpgradeTrans);
    trans._completion.catch(reject);
    const rejectTransaction = trans._reject.bind(trans);
    const transless = PSD.transless || PSD;
    newScope(() => {
        PSD.trans = trans;
        PSD.transless = transless;
        if (oldVersion === 0) {
            keys(globalSchema).forEach(tableName => {
                createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
            });
            generateMiddlewareStacks(db, idbUpgradeTrans);
            DexiePromise.follow(() => db.on.populate.fire(trans)).catch(rejectTransaction);
        }
        else
            updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans).catch(rejectTransaction);
    });
}
function updateTablesAndIndexes({ _novip: db }, oldVersion, trans, idbUpgradeTrans) {
    const queue = [];
    const versions = db._versions;
    let globalSchema = db._dbSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
    let anyContentUpgraderHasRun = false;
    const versToRun = versions.filter(v => v._cfg.version >= oldVersion);
    versToRun.forEach(version => {
        queue.push(() => {
            const oldSchema = globalSchema;
            const newSchema = version._cfg.dbschema;
            adjustToExistingIndexNames(db, oldSchema, idbUpgradeTrans);
            adjustToExistingIndexNames(db, newSchema, idbUpgradeTrans);
            globalSchema = db._dbSchema = newSchema;
            const diff = getSchemaDiff(oldSchema, newSchema);
            diff.add.forEach(tuple => {
                createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
            });
            diff.change.forEach(change => {
                if (change.recreate) {
                    throw new exceptions.Upgrade("Not yet support for changing primary key");
                }
                else {
                    const store = idbUpgradeTrans.objectStore(change.name);
                    change.add.forEach(idx => addIndex(store, idx));
                    change.change.forEach(idx => {
                        store.deleteIndex(idx.name);
                        addIndex(store, idx);
                    });
                    change.del.forEach(idxName => store.deleteIndex(idxName));
                }
            });
            const contentUpgrade = version._cfg.contentUpgrade;
            if (contentUpgrade && version._cfg.version > oldVersion) {
                generateMiddlewareStacks(db, idbUpgradeTrans);
                trans._memoizedTables = {};
                anyContentUpgraderHasRun = true;
                let upgradeSchema = shallowClone(newSchema);
                diff.del.forEach(table => {
                    upgradeSchema[table] = oldSchema[table];
                });
                removeTablesApi(db, [db.Transaction.prototype]);
                setApiOnPlace(db, [db.Transaction.prototype], keys(upgradeSchema), upgradeSchema);
                trans.schema = upgradeSchema;
                const contentUpgradeIsAsync = isAsyncFunction(contentUpgrade);
                if (contentUpgradeIsAsync) {
                    incrementExpectedAwaits();
                }
                let returnValue;
                const promiseFollowed = DexiePromise.follow(() => {
                    returnValue = contentUpgrade(trans);
                    if (returnValue) {
                        if (contentUpgradeIsAsync) {
                            var decrementor = decrementExpectedAwaits.bind(null, null);
                            returnValue.then(decrementor, decrementor);
                        }
                    }
                });
                return (returnValue && typeof returnValue.then === 'function' ?
                    DexiePromise.resolve(returnValue) : promiseFollowed.then(() => returnValue));
            }
        });
        queue.push(idbtrans => {
            if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
                const newSchema = version._cfg.dbschema;
                deleteRemovedTables(newSchema, idbtrans);
            }
            removeTablesApi(db, [db.Transaction.prototype]);
            setApiOnPlace(db, [db.Transaction.prototype], db._storeNames, db._dbSchema);
            trans.schema = db._dbSchema;
        });
    });
    function runQueue() {
        return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) :
            DexiePromise.resolve();
    }
    return runQueue().then(() => {
        createMissingTables(globalSchema, idbUpgradeTrans);
    });
}
function getSchemaDiff(oldSchema, newSchema) {
    const diff = {
        del: [],
        add: [],
        change: []
    };
    let table;
    for (table in oldSchema) {
        if (!newSchema[table])
            diff.del.push(table);
    }
    for (table in newSchema) {
        const oldDef = oldSchema[table], newDef = newSchema[table];
        if (!oldDef) {
            diff.add.push([table, newDef]);
        }
        else {
            const change = {
                name: table,
                def: newDef,
                recreate: false,
                del: [],
                add: [],
                change: []
            };
            if ((
            '' + (oldDef.primKey.keyPath || '')) !== ('' + (newDef.primKey.keyPath || '')) ||
                (oldDef.primKey.auto !== newDef.primKey.auto && !isIEOrEdge))
             {
                change.recreate = true;
                diff.change.push(change);
            }
            else {
                const oldIndexes = oldDef.idxByName;
                const newIndexes = newDef.idxByName;
                let idxName;
                for (idxName in oldIndexes) {
                    if (!newIndexes[idxName])
                        change.del.push(idxName);
                }
                for (idxName in newIndexes) {
                    const oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                    if (!oldIdx)
                        change.add.push(newIdx);
                    else if (oldIdx.src !== newIdx.src)
                        change.change.push(newIdx);
                }
                if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                    diff.change.push(change);
                }
            }
        }
    }
    return diff;
}
function createTable(idbtrans, tableName, primKey, indexes) {
    const store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ?
        { keyPath: primKey.keyPath, autoIncrement: primKey.auto } :
        { autoIncrement: primKey.auto });
    indexes.forEach(idx => addIndex(store, idx));
    return store;
}
function createMissingTables(newSchema, idbtrans) {
    keys(newSchema).forEach(tableName => {
        if (!idbtrans.db.objectStoreNames.contains(tableName)) {
            createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
        }
    });
}
function deleteRemovedTables(newSchema, idbtrans) {
    [].slice.call(idbtrans.db.objectStoreNames).forEach(storeName => newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName));
}
function addIndex(store, idx) {
    store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
}
function buildGlobalSchema(db, idbdb, tmpTrans) {
    const globalSchema = {};
    const dbStoreNames = slice(idbdb.objectStoreNames, 0);
    dbStoreNames.forEach(storeName => {
        const store = tmpTrans.objectStore(storeName);
        let keyPath = store.keyPath;
        const primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
        const indexes = [];
        for (let j = 0; j < store.indexNames.length; ++j) {
            const idbindex = store.index(store.indexNames[j]);
            keyPath = idbindex.keyPath;
            var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
            indexes.push(index);
        }
        globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
    });
    return globalSchema;
}
function readGlobalSchema({ _novip: db }, idbdb, tmpTrans) {
    db.verno = idbdb.version / 10;
    const globalSchema = db._dbSchema = buildGlobalSchema(db, idbdb, tmpTrans);
    db._storeNames = slice(idbdb.objectStoreNames, 0);
    setApiOnPlace(db, [db._allTables], keys(globalSchema), globalSchema);
}
function verifyInstalledSchema(db, tmpTrans) {
    const installedSchema = buildGlobalSchema(db, db.idbdb, tmpTrans);
    const diff = getSchemaDiff(installedSchema, db._dbSchema);
    return !(diff.add.length || diff.change.some(ch => ch.add.length || ch.change.length));
}
function adjustToExistingIndexNames({ _novip: db }, schema, idbtrans) {
    const storeNames = idbtrans.db.objectStoreNames;
    for (let i = 0; i < storeNames.length; ++i) {
        const storeName = storeNames[i];
        const store = idbtrans.objectStore(storeName);
        db._hasGetAll = 'getAll' in store;
        for (let j = 0; j < store.indexNames.length; ++j) {
            const indexName = store.indexNames[j];
            const keyPath = store.index(indexName).keyPath;
            const dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
            if (schema[storeName]) {
                const indexSpec = schema[storeName].idxByName[dexieName];
                if (indexSpec) {
                    indexSpec.name = indexName;
                    delete schema[storeName].idxByName[dexieName];
                    schema[storeName].idxByName[indexName] = indexSpec;
                }
            }
        }
    }
    if (typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
        !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
        _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope &&
        [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
        db._hasGetAll = false;
    }
}
function parseIndexSyntax(primKeyAndIndexes) {
    return primKeyAndIndexes.split(',').map((index, indexNum) => {
        index = index.trim();
        const name = index.replace(/([&*]|\+\+)/g, "");
        const keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;
        return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), indexNum === 0);
    });
}

class Version {
    _parseStoresSpec(stores, outSchema) {
        keys(stores).forEach(tableName => {
            if (stores[tableName] !== null) {
                var indexes = parseIndexSyntax(stores[tableName]);
                var primKey = indexes.shift();
                if (primKey.multi)
                    throw new exceptions.Schema("Primary key cannot be multi-valued");
                indexes.forEach(idx => {
                    if (idx.auto)
                        throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                    if (!idx.keyPath)
                        throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                });
                outSchema[tableName] = createTableSchema(tableName, primKey, indexes);
            }
        });
    }
    stores(stores) {
        const db = this.db;
        this._cfg.storesSource = this._cfg.storesSource ?
            extend(this._cfg.storesSource, stores) :
            stores;
        const versions = db._versions;
        const storesSpec = {};
        let dbschema = {};
        versions.forEach(version => {
            extend(storesSpec, version._cfg.storesSource);
            dbschema = (version._cfg.dbschema = {});
            version._parseStoresSpec(storesSpec, dbschema);
        });
        db._dbSchema = dbschema;
        removeTablesApi(db, [db._allTables, db, db.Transaction.prototype]);
        setApiOnPlace(db, [db._allTables, db, db.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
        db._storeNames = keys(dbschema);
        return this;
    }
    upgrade(upgradeFunction) {
        this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
        return this;
    }
}

function createVersionConstructor(db) {
    return makeClassConstructor(Version.prototype, function Version(versionNumber) {
        this.db = db;
        this._cfg = {
            version: versionNumber,
            storesSource: null,
            dbschema: {},
            tables: {},
            contentUpgrade: null
        };
    });
}

function getDbNamesTable(indexedDB, IDBKeyRange) {
    let dbNamesDB = indexedDB["_dbNamesDB"];
    if (!dbNamesDB) {
        dbNamesDB = indexedDB["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
            addons: [],
            indexedDB,
            IDBKeyRange,
        });
        dbNamesDB.version(1).stores({ dbnames: "name" });
    }
    return dbNamesDB.table("dbnames");
}
function hasDatabasesNative(indexedDB) {
    return indexedDB && typeof indexedDB.databases === "function";
}
function getDatabaseNames({ indexedDB, IDBKeyRange, }) {
    return hasDatabasesNative(indexedDB)
        ? Promise.resolve(indexedDB.databases()).then((infos) => infos
            .map((info) => info.name)
            .filter((name) => name !== DBNAMES_DB))
        : getDbNamesTable(indexedDB, IDBKeyRange).toCollection().primaryKeys();
}
function _onDatabaseCreated({ indexedDB, IDBKeyRange }, name) {
    !hasDatabasesNative(indexedDB) &&
        name !== DBNAMES_DB &&
        getDbNamesTable(indexedDB, IDBKeyRange).put({ name }).catch(nop);
}
function _onDatabaseDeleted({ indexedDB, IDBKeyRange }, name) {
    !hasDatabasesNative(indexedDB) &&
        name !== DBNAMES_DB &&
        getDbNamesTable(indexedDB, IDBKeyRange).delete(name).catch(nop);
}

function vip(fn) {
    return newScope(function () {
        PSD.letThrough = true;
        return fn();
    });
}

function idbReady() {
    var isSafari = !navigator.userAgentData &&
        /Safari\//.test(navigator.userAgent) &&
        !/Chrom(e|ium)\//.test(navigator.userAgent);
    if (!isSafari || !indexedDB.databases)
        return Promise.resolve();
    var intervalId;
    return new Promise(function (resolve) {
        var tryIdb = function () { return indexedDB.databases().finally(resolve); };
        intervalId = setInterval(tryIdb, 100);
        tryIdb();
    }).finally(function () { return clearInterval(intervalId); });
}

function dexieOpen(db) {
    const state = db._state;
    const { indexedDB } = db._deps;
    if (state.isBeingOpened || db.idbdb)
        return state.dbReadyPromise.then(() => state.dbOpenError ?
            rejection(state.dbOpenError) :
            db);
    debug && (state.openCanceller._stackHolder = getErrorWithStack());
    state.isBeingOpened = true;
    state.dbOpenError = null;
    state.openComplete = false;
    const openCanceller = state.openCanceller;
    function throwIfCancelled() {
        if (state.openCanceller !== openCanceller)
            throw new exceptions.DatabaseClosed('db.open() was cancelled');
    }
    let resolveDbReady = state.dbReadyResolve,
    upgradeTransaction = null, wasCreated = false;
    return DexiePromise.race([openCanceller, (typeof navigator === 'undefined' ? DexiePromise.resolve() : idbReady()).then(() => new DexiePromise((resolve, reject) => {
            throwIfCancelled();
            if (!indexedDB)
                throw new exceptions.MissingAPI();
            const dbName = db.name;
            const req = state.autoSchema ?
                indexedDB.open(dbName) :
                indexedDB.open(dbName, Math.round(db.verno * 10));
            if (!req)
                throw new exceptions.MissingAPI();
            req.onerror = eventRejectHandler(reject);
            req.onblocked = wrap(db._fireOnBlocked);
            req.onupgradeneeded = wrap(e => {
                upgradeTransaction = req.transaction;
                if (state.autoSchema && !db._options.allowEmptyDB) {
                    req.onerror = preventDefault;
                    upgradeTransaction.abort();
                    req.result.close();
                    const delreq = indexedDB.deleteDatabase(dbName);
                    delreq.onsuccess = delreq.onerror = wrap(() => {
                        reject(new exceptions.NoSuchDatabase(`Database ${dbName} doesnt exist`));
                    });
                }
                else {
                    upgradeTransaction.onerror = eventRejectHandler(reject);
                    var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
                    wasCreated = oldVer < 1;
                    db._novip.idbdb = req.result;
                    runUpgraders(db, oldVer / 10, upgradeTransaction, reject);
                }
            }, reject);
            req.onsuccess = wrap(() => {
                upgradeTransaction = null;
                const idbdb = db._novip.idbdb = req.result;
                const objectStoreNames = slice(idbdb.objectStoreNames);
                if (objectStoreNames.length > 0)
                    try {
                        const tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), 'readonly');
                        if (state.autoSchema)
                            readGlobalSchema(db, idbdb, tmpTrans);
                        else {
                            adjustToExistingIndexNames(db, db._dbSchema, tmpTrans);
                            if (!verifyInstalledSchema(db, tmpTrans)) {
                                console.warn(`Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Some queries may fail.`);
                            }
                        }
                        generateMiddlewareStacks(db, tmpTrans);
                    }
                    catch (e) {
                    }
                connections.push(db);
                idbdb.onversionchange = wrap(ev => {
                    state.vcFired = true;
                    db.on("versionchange").fire(ev);
                });
                idbdb.onclose = wrap(ev => {
                    db.on("close").fire(ev);
                });
                if (wasCreated)
                    _onDatabaseCreated(db._deps, dbName);
                resolve();
            }, reject);
        }))]).then(() => {
        throwIfCancelled();
        state.onReadyBeingFired = [];
        return DexiePromise.resolve(vip(() => db.on.ready.fire(db.vip))).then(function fireRemainders() {
            if (state.onReadyBeingFired.length > 0) {
                let remainders = state.onReadyBeingFired.reduce(promisableChain, nop);
                state.onReadyBeingFired = [];
                return DexiePromise.resolve(vip(() => remainders(db.vip))).then(fireRemainders);
            }
        });
    }).finally(() => {
        state.onReadyBeingFired = null;
        state.isBeingOpened = false;
    }).then(() => {
        return db;
    }).catch(err => {
        state.dbOpenError = err;
        try {
            upgradeTransaction && upgradeTransaction.abort();
        }
        catch (_a) { }
        if (openCanceller === state.openCanceller) {
            db._close();
        }
        return rejection(err);
    }).finally(() => {
        state.openComplete = true;
        resolveDbReady();
    });
}

function awaitIterator(iterator) {
    var callNext = result => iterator.next(result), doThrow = error => iterator.throw(error), onSuccess = step(callNext), onError = step(doThrow);
    function step(getNext) {
        return (val) => {
            var next = getNext(val), value = next.value;
            return next.done ? value :
                (!value || typeof value.then !== 'function' ?
                    isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) :
                    value.then(onSuccess, onError));
        };
    }
    return step(callNext)();
}

function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
    var i = arguments.length;
    if (i < 2)
        throw new exceptions.InvalidArgument("Too few arguments");
    var args = new Array(i - 1);
    while (--i)
        args[i - 1] = arguments[i];
    scopeFunc = args.pop();
    var tables = flatten(args);
    return [mode, tables, scopeFunc];
}
function enterTransactionScope(db, mode, storeNames, parentTransaction, scopeFunc) {
    return DexiePromise.resolve().then(() => {
        const transless = PSD.transless || PSD;
        const trans = db._createTransaction(mode, storeNames, db._dbSchema, parentTransaction);
        const zoneProps = {
            trans: trans,
            transless: transless
        };
        if (parentTransaction) {
            trans.idbtrans = parentTransaction.idbtrans;
        }
        else {
            try {
                trans.create();
                db._state.PR1398_maxLoop = 3;
            }
            catch (ex) {
                if (ex.name === errnames.InvalidState && db.isOpen() && --db._state.PR1398_maxLoop > 0) {
                    console.warn('Dexie: Need to reopen db');
                    db._close();
                    return db.open().then(() => enterTransactionScope(db, mode, storeNames, null, scopeFunc));
                }
                return rejection(ex);
            }
        }
        const scopeFuncIsAsync = isAsyncFunction(scopeFunc);
        if (scopeFuncIsAsync) {
            incrementExpectedAwaits();
        }
        let returnValue;
        const promiseFollowed = DexiePromise.follow(() => {
            returnValue = scopeFunc.call(trans, trans);
            if (returnValue) {
                if (scopeFuncIsAsync) {
                    var decrementor = decrementExpectedAwaits.bind(null, null);
                    returnValue.then(decrementor, decrementor);
                }
                else if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
                    returnValue = awaitIterator(returnValue);
                }
            }
        }, zoneProps);
        return (returnValue && typeof returnValue.then === 'function' ?
            DexiePromise.resolve(returnValue).then(x => trans.active ?
                x
                : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn")))
            : promiseFollowed.then(() => returnValue)).then(x => {
            if (parentTransaction)
                trans._resolve();
            return trans._completion.then(() => x);
        }).catch(e => {
            trans._reject(e);
            return rejection(e);
        });
    });
}

function pad(a, value, count) {
    const result = isArray(a) ? a.slice() : [a];
    for (let i = 0; i < count; ++i)
        result.push(value);
    return result;
}
function createVirtualIndexMiddleware(down) {
    return {
        ...down,
        table(tableName) {
            const table = down.table(tableName);
            const { schema } = table;
            const indexLookup = {};
            const allVirtualIndexes = [];
            function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
                const keyPathAlias = getKeyPathAlias(keyPath);
                const indexList = (indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || []);
                const keyLength = keyPath == null ? 0 : typeof keyPath === 'string' ? 1 : keyPath.length;
                const isVirtual = keyTail > 0;
                const virtualIndex = {
                    ...lowLevelIndex,
                    isVirtual,
                    keyTail,
                    keyLength,
                    extractKey: getKeyExtractor(keyPath),
                    unique: !isVirtual && lowLevelIndex.unique
                };
                indexList.push(virtualIndex);
                if (!virtualIndex.isPrimaryKey) {
                    allVirtualIndexes.push(virtualIndex);
                }
                if (keyLength > 1) {
                    const virtualKeyPath = keyLength === 2 ?
                        keyPath[0] :
                        keyPath.slice(0, keyLength - 1);
                    addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
                }
                indexList.sort((a, b) => a.keyTail - b.keyTail);
                return virtualIndex;
            }
            const primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
            indexLookup[":id"] = [primaryKey];
            for (const index of schema.indexes) {
                addVirtualIndexes(index.keyPath, 0, index);
            }
            function findBestIndex(keyPath) {
                const result = indexLookup[getKeyPathAlias(keyPath)];
                return result && result[0];
            }
            function translateRange(range, keyTail) {
                return {
                    type: range.type === 1  ?
                        2  :
                        range.type,
                    lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
                    lowerOpen: true,
                    upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
                    upperOpen: true
                };
            }
            function translateRequest(req) {
                const index = req.query.index;
                return index.isVirtual ? {
                    ...req,
                    query: {
                        index,
                        range: translateRange(req.query.range, index.keyTail)
                    }
                } : req;
            }
            const result = {
                ...table,
                schema: {
                    ...schema,
                    primaryKey,
                    indexes: allVirtualIndexes,
                    getIndexByKeyPath: findBestIndex
                },
                count(req) {
                    return table.count(translateRequest(req));
                },
                query(req) {
                    return table.query(translateRequest(req));
                },
                openCursor(req) {
                    const { keyTail, isVirtual, keyLength } = req.query.index;
                    if (!isVirtual)
                        return table.openCursor(req);
                    function createVirtualCursor(cursor) {
                        function _continue(key) {
                            key != null ?
                                cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) :
                                req.unique ?
                                    cursor.continue(cursor.key.slice(0, keyLength)
                                        .concat(req.reverse
                                        ? down.MIN_KEY
                                        : down.MAX_KEY, keyTail)) :
                                    cursor.continue();
                        }
                        const virtualCursor = Object.create(cursor, {
                            continue: { value: _continue },
                            continuePrimaryKey: {
                                value(key, primaryKey) {
                                    cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey);
                                }
                            },
                            primaryKey: {
                                get() {
                                    return cursor.primaryKey;
                                }
                            },
                            key: {
                                get() {
                                    const key = cursor.key;
                                    return keyLength === 1 ?
                                        key[0] :
                                        key.slice(0, keyLength);
                                }
                            },
                            value: {
                                get() {
                                    return cursor.value;
                                }
                            }
                        });
                        return virtualCursor;
                    }
                    return table.openCursor(translateRequest(req))
                        .then(cursor => cursor && createVirtualCursor(cursor));
                }
            };
            return result;
        }
    };
}
const virtualIndexMiddleware = {
    stack: "dbcore",
    name: "VirtualIndexMiddleware",
    level: 1,
    create: createVirtualIndexMiddleware
};

function getObjectDiff(a, b, rv, prfx) {
    rv = rv || {};
    prfx = prfx || '';
    keys(a).forEach((prop) => {
        if (!hasOwn(b, prop)) {
            rv[prfx + prop] = undefined;
        }
        else {
            var ap = a[prop], bp = b[prop];
            if (typeof ap === 'object' && typeof bp === 'object' && ap && bp) {
                const apTypeName = toStringTag(ap);
                const bpTypeName = toStringTag(bp);
                if (apTypeName !== bpTypeName) {
                    rv[prfx + prop] = b[prop];
                }
                else if (apTypeName === 'Object') {
                    getObjectDiff(ap, bp, rv, prfx + prop + '.');
                }
                else if (ap !== bp) {
                    rv[prfx + prop] = b[prop];
                }
            }
            else if (ap !== bp)
                rv[prfx + prop] = b[prop];
        }
    });
    keys(b).forEach((prop) => {
        if (!hasOwn(a, prop)) {
            rv[prfx + prop] = b[prop];
        }
    });
    return rv;
}

function getEffectiveKeys(primaryKey, req) {
    if (req.type === 'delete')
        return req.keys;
    return req.keys || req.values.map(primaryKey.extractKey);
}

const hooksMiddleware = {
    stack: "dbcore",
    name: "HooksMiddleware",
    level: 2,
    create: (downCore) => ({
        ...downCore,
        table(tableName) {
            const downTable = downCore.table(tableName);
            const { primaryKey } = downTable.schema;
            const tableMiddleware = {
                ...downTable,
                mutate(req) {
                    const dxTrans = PSD.trans;
                    const { deleting, creating, updating } = dxTrans.table(tableName).hook;
                    switch (req.type) {
                        case 'add':
                            if (creating.fire === nop)
                                break;
                            return dxTrans._promise('readwrite', () => addPutOrDelete(req), true);
                        case 'put':
                            if (creating.fire === nop && updating.fire === nop)
                                break;
                            return dxTrans._promise('readwrite', () => addPutOrDelete(req), true);
                        case 'delete':
                            if (deleting.fire === nop)
                                break;
                            return dxTrans._promise('readwrite', () => addPutOrDelete(req), true);
                        case 'deleteRange':
                            if (deleting.fire === nop)
                                break;
                            return dxTrans._promise('readwrite', () => deleteRange(req), true);
                    }
                    return downTable.mutate(req);
                    function addPutOrDelete(req) {
                        const dxTrans = PSD.trans;
                        const keys = req.keys || getEffectiveKeys(primaryKey, req);
                        if (!keys)
                            throw new Error("Keys missing");
                        req = req.type === 'add' || req.type === 'put' ?
                            { ...req, keys } :
                            { ...req };
                        if (req.type !== 'delete')
                            req.values = [...req.values];
                        if (req.keys)
                            req.keys = [...req.keys];
                        return getExistingValues(downTable, req, keys).then(existingValues => {
                            const contexts = keys.map((key, i) => {
                                const existingValue = existingValues[i];
                                const ctx = { onerror: null, onsuccess: null };
                                if (req.type === 'delete') {
                                    deleting.fire.call(ctx, key, existingValue, dxTrans);
                                }
                                else if (req.type === 'add' || existingValue === undefined) {
                                    const generatedPrimaryKey = creating.fire.call(ctx, key, req.values[i], dxTrans);
                                    if (key == null && generatedPrimaryKey != null) {
                                        key = generatedPrimaryKey;
                                        req.keys[i] = key;
                                        if (!primaryKey.outbound) {
                                            setByKeyPath(req.values[i], primaryKey.keyPath, key);
                                        }
                                    }
                                }
                                else {
                                    const objectDiff = getObjectDiff(existingValue, req.values[i]);
                                    const additionalChanges = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans);
                                    if (additionalChanges) {
                                        const requestedValue = req.values[i];
                                        Object.keys(additionalChanges).forEach(keyPath => {
                                            if (hasOwn(requestedValue, keyPath)) {
                                                requestedValue[keyPath] = additionalChanges[keyPath];
                                            }
                                            else {
                                                setByKeyPath(requestedValue, keyPath, additionalChanges[keyPath]);
                                            }
                                        });
                                    }
                                }
                                return ctx;
                            });
                            return downTable.mutate(req).then(({ failures, results, numFailures, lastResult }) => {
                                for (let i = 0; i < keys.length; ++i) {
                                    const primKey = results ? results[i] : keys[i];
                                    const ctx = contexts[i];
                                    if (primKey == null) {
                                        ctx.onerror && ctx.onerror(failures[i]);
                                    }
                                    else {
                                        ctx.onsuccess && ctx.onsuccess(req.type === 'put' && existingValues[i] ?
                                            req.values[i] :
                                            primKey
                                        );
                                    }
                                }
                                return { failures, results, numFailures, lastResult };
                            }).catch(error => {
                                contexts.forEach(ctx => ctx.onerror && ctx.onerror(error));
                                return Promise.reject(error);
                            });
                        });
                    }
                    function deleteRange(req) {
                        return deleteNextChunk(req.trans, req.range, 10000);
                    }
                    function deleteNextChunk(trans, range, limit) {
                        return downTable.query({ trans, values: false, query: { index: primaryKey, range }, limit })
                            .then(({ result }) => {
                            return addPutOrDelete({ type: 'delete', keys: result, trans }).then(res => {
                                if (res.numFailures > 0)
                                    return Promise.reject(res.failures[0]);
                                if (result.length < limit) {
                                    return { failures: [], numFailures: 0, lastResult: undefined };
                                }
                                else {
                                    return deleteNextChunk(trans, { ...range, lower: result[result.length - 1], lowerOpen: true }, limit);
                                }
                            });
                        });
                    }
                }
            };
            return tableMiddleware;
        },
    })
};
function getExistingValues(table, req, effectiveKeys) {
    return req.type === "add"
        ? Promise.resolve([])
        : table.getMany({ trans: req.trans, keys: effectiveKeys, cache: "immutable" });
}

function getFromTransactionCache(keys, cache, clone) {
    try {
        if (!cache)
            return null;
        if (cache.keys.length < keys.length)
            return null;
        const result = [];
        for (let i = 0, j = 0; i < cache.keys.length && j < keys.length; ++i) {
            if (cmp(cache.keys[i], keys[j]) !== 0)
                continue;
            result.push(clone ? deepClone(cache.values[i]) : cache.values[i]);
            ++j;
        }
        return result.length === keys.length ? result : null;
    }
    catch (_a) {
        return null;
    }
}
const cacheExistingValuesMiddleware = {
    stack: "dbcore",
    level: -1,
    create: (core) => {
        return {
            table: (tableName) => {
                const table = core.table(tableName);
                return {
                    ...table,
                    getMany: (req) => {
                        if (!req.cache) {
                            return table.getMany(req);
                        }
                        const cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
                        if (cachedResult) {
                            return DexiePromise.resolve(cachedResult);
                        }
                        return table.getMany(req).then((res) => {
                            req.trans["_cache"] = {
                                keys: req.keys,
                                values: req.cache === "clone" ? deepClone(res) : res,
                            };
                            return res;
                        });
                    },
                    mutate: (req) => {
                        if (req.type !== "add")
                            req.trans["_cache"] = null;
                        return table.mutate(req);
                    },
                };
            },
        };
    },
};

function isEmptyRange(node) {
    return !("from" in node);
}
const RangeSet = function (fromOrTree, to) {
    if (this) {
        extend(this, arguments.length ? { d: 1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree } : { d: 0 });
    }
    else {
        const rv = new RangeSet();
        if (fromOrTree && ("d" in fromOrTree)) {
            extend(rv, fromOrTree);
        }
        return rv;
    }
};
props(RangeSet.prototype, {
    add(rangeSet) {
        mergeRanges(this, rangeSet);
        return this;
    },
    addKey(key) {
        addRange(this, key, key);
        return this;
    },
    addKeys(keys) {
        keys.forEach(key => addRange(this, key, key));
        return this;
    },
    [iteratorSymbol]() {
        return getRangeSetIterator(this);
    }
});
function addRange(target, from, to) {
    const diff = cmp(from, to);
    if (isNaN(diff))
        return;
    if (diff > 0)
        throw RangeError();
    if (isEmptyRange(target))
        return extend(target, { from, to, d: 1 });
    const left = target.l;
    const right = target.r;
    if (cmp(to, target.from) < 0) {
        left
            ? addRange(left, from, to)
            : (target.l = { from, to, d: 1, l: null, r: null });
        return rebalance(target);
    }
    if (cmp(from, target.to) > 0) {
        right
            ? addRange(right, from, to)
            : (target.r = { from, to, d: 1, l: null, r: null });
        return rebalance(target);
    }
    if (cmp(from, target.from) < 0) {
        target.from = from;
        target.l = null;
        target.d = right ? right.d + 1 : 1;
    }
    if (cmp(to, target.to) > 0) {
        target.to = to;
        target.r = null;
        target.d = target.l ? target.l.d + 1 : 1;
    }
    const rightWasCutOff = !target.r;
    if (left && !target.l) {
        mergeRanges(target, left);
    }
    if (right && rightWasCutOff) {
        mergeRanges(target, right);
    }
}
function mergeRanges(target, newSet) {
    function _addRangeSet(target, { from, to, l, r }) {
        addRange(target, from, to);
        if (l)
            _addRangeSet(target, l);
        if (r)
            _addRangeSet(target, r);
    }
    if (!isEmptyRange(newSet))
        _addRangeSet(target, newSet);
}
function rangesOverlap(rangeSet1, rangeSet2) {
    const i1 = getRangeSetIterator(rangeSet2);
    let nextResult1 = i1.next();
    if (nextResult1.done)
        return false;
    let a = nextResult1.value;
    const i2 = getRangeSetIterator(rangeSet1);
    let nextResult2 = i2.next(a.from);
    let b = nextResult2.value;
    while (!nextResult1.done && !nextResult2.done) {
        if (cmp(b.from, a.to) <= 0 && cmp(b.to, a.from) >= 0)
            return true;
        cmp(a.from, b.from) < 0
            ? (a = (nextResult1 = i1.next(b.from)).value)
            : (b = (nextResult2 = i2.next(a.from)).value);
    }
    return false;
}
function getRangeSetIterator(node) {
    let state = isEmptyRange(node) ? null : { s: 0, n: node };
    return {
        next(key) {
            const keyProvided = arguments.length > 0;
            while (state) {
                switch (state.s) {
                    case 0:
                        state.s = 1;
                        if (keyProvided) {
                            while (state.n.l && cmp(key, state.n.from) < 0)
                                state = { up: state, n: state.n.l, s: 1 };
                        }
                        else {
                            while (state.n.l)
                                state = { up: state, n: state.n.l, s: 1 };
                        }
                    case 1:
                        state.s = 2;
                        if (!keyProvided || cmp(key, state.n.to) <= 0)
                            return { value: state.n, done: false };
                    case 2:
                        if (state.n.r) {
                            state.s = 3;
                            state = { up: state, n: state.n.r, s: 0 };
                            continue;
                        }
                    case 3:
                        state = state.up;
                }
            }
            return { done: true };
        },
    };
}
function rebalance(target) {
    var _a, _b;
    const diff = (((_a = target.r) === null || _a === void 0 ? void 0 : _a.d) || 0) - (((_b = target.l) === null || _b === void 0 ? void 0 : _b.d) || 0);
    const r = diff > 1 ? "r" : diff < -1 ? "l" : "";
    if (r) {
        const l = r === "r" ? "l" : "r";
        const rootClone = { ...target };
        const oldRootRight = target[r];
        target.from = oldRootRight.from;
        target.to = oldRootRight.to;
        target[r] = oldRootRight[r];
        rootClone[r] = oldRootRight[l];
        target[l] = rootClone;
        rootClone.d = computeDepth(rootClone);
    }
    target.d = computeDepth(target);
}
function computeDepth({ r, l }) {
    return (r ? (l ? Math.max(r.d, l.d) : r.d) : l ? l.d : 0) + 1;
}

const observabilityMiddleware = {
    stack: "dbcore",
    level: 0,
    create: (core) => {
        const dbName = core.schema.name;
        const FULL_RANGE = new RangeSet(core.MIN_KEY, core.MAX_KEY);
        return {
            ...core,
            table: (tableName) => {
                const table = core.table(tableName);
                const { schema } = table;
                const { primaryKey } = schema;
                const { extractKey, outbound } = primaryKey;
                const tableClone = {
                    ...table,
                    mutate: (req) => {
                        const trans = req.trans;
                        const mutatedParts = trans.mutatedParts || (trans.mutatedParts = {});
                        const getRangeSet = (indexName) => {
                            const part = `idb://${dbName}/${tableName}/${indexName}`;
                            return (mutatedParts[part] ||
                                (mutatedParts[part] = new RangeSet()));
                        };
                        const pkRangeSet = getRangeSet("");
                        const delsRangeSet = getRangeSet(":dels");
                        const { type } = req;
                        let [keys, newObjs] = req.type === "deleteRange"
                            ? [req.range]
                            : req.type === "delete"
                                ? [req.keys]
                                : req.values.length < 50
                                    ? [[], req.values]
                                    : [];
                        const oldCache = req.trans["_cache"];
                        return table.mutate(req).then((res) => {
                            if (isArray(keys)) {
                                if (type !== "delete")
                                    keys = res.results;
                                pkRangeSet.addKeys(keys);
                                const oldObjs = getFromTransactionCache(keys, oldCache);
                                if (!oldObjs && type !== "add") {
                                    delsRangeSet.addKeys(keys);
                                }
                                if (oldObjs || newObjs) {
                                    trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
                                }
                            }
                            else if (keys) {
                                const range = { from: keys.lower, to: keys.upper };
                                delsRangeSet.add(range);
                                pkRangeSet.add(range);
                            }
                            else {
                                pkRangeSet.add(FULL_RANGE);
                                delsRangeSet.add(FULL_RANGE);
                                schema.indexes.forEach(idx => getRangeSet(idx.name).add(FULL_RANGE));
                            }
                            return res;
                        });
                    },
                };
                const getRange = ({ query: { index, range }, }) => {
                    var _a, _b;
                    return [
                        index,
                        new RangeSet((_a = range.lower) !== null && _a !== void 0 ? _a : core.MIN_KEY, (_b = range.upper) !== null && _b !== void 0 ? _b : core.MAX_KEY),
                    ];
                };
                const readSubscribers = {
                    get: (req) => [primaryKey, new RangeSet(req.key)],
                    getMany: (req) => [primaryKey, new RangeSet().addKeys(req.keys)],
                    count: getRange,
                    query: getRange,
                    openCursor: getRange,
                };
                keys(readSubscribers).forEach(method => {
                    tableClone[method] = function (req) {
                        const { subscr } = PSD;
                        if (subscr) {
                            const getRangeSet = (indexName) => {
                                const part = `idb://${dbName}/${tableName}/${indexName}`;
                                return (subscr[part] ||
                                    (subscr[part] = new RangeSet()));
                            };
                            const pkRangeSet = getRangeSet("");
                            const delsRangeSet = getRangeSet(":dels");
                            const [queriedIndex, queriedRanges] = readSubscribers[method](req);
                            getRangeSet(queriedIndex.name || "").add(queriedRanges);
                            if (!queriedIndex.isPrimaryKey) {
                                if (method === "count") {
                                    delsRangeSet.add(FULL_RANGE);
                                }
                                else {
                                    const keysPromise = method === "query" &&
                                        outbound &&
                                        req.values &&
                                        table.query({
                                            ...req,
                                            values: false,
                                        });
                                    return table[method].apply(this, arguments).then((res) => {
                                        if (method === "query") {
                                            if (outbound && req.values) {
                                                return keysPromise.then(({ result: resultingKeys }) => {
                                                    pkRangeSet.addKeys(resultingKeys);
                                                    return res;
                                                });
                                            }
                                            const pKeys = req.values
                                                ? res.result.map(extractKey)
                                                : res.result;
                                            if (req.values) {
                                                pkRangeSet.addKeys(pKeys);
                                            }
                                            else {
                                                delsRangeSet.addKeys(pKeys);
                                            }
                                        }
                                        else if (method === "openCursor") {
                                            const cursor = res;
                                            const wantValues = req.values;
                                            return (cursor &&
                                                Object.create(cursor, {
                                                    key: {
                                                        get() {
                                                            delsRangeSet.addKey(cursor.primaryKey);
                                                            return cursor.key;
                                                        },
                                                    },
                                                    primaryKey: {
                                                        get() {
                                                            const pkey = cursor.primaryKey;
                                                            delsRangeSet.addKey(pkey);
                                                            return pkey;
                                                        },
                                                    },
                                                    value: {
                                                        get() {
                                                            wantValues && pkRangeSet.addKey(cursor.primaryKey);
                                                            return cursor.value;
                                                        },
                                                    },
                                                }));
                                        }
                                        return res;
                                    });
                                }
                            }
                        }
                        return table[method].apply(this, arguments);
                    };
                });
                return tableClone;
            },
        };
    },
};
function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
    function addAffectedIndex(ix) {
        const rangeSet = getRangeSet(ix.name || "");
        function extractKey(obj) {
            return obj != null ? ix.extractKey(obj) : null;
        }
        const addKeyOrKeys = (key) => ix.multiEntry && isArray(key)
            ? key.forEach(key => rangeSet.addKey(key))
            : rangeSet.addKey(key);
        (oldObjs || newObjs).forEach((_, i) => {
            const oldKey = oldObjs && extractKey(oldObjs[i]);
            const newKey = newObjs && extractKey(newObjs[i]);
            if (cmp(oldKey, newKey) !== 0) {
                if (oldKey != null)
                    addKeyOrKeys(oldKey);
                if (newKey != null)
                    addKeyOrKeys(newKey);
            }
        });
    }
    schema.indexes.forEach(addAffectedIndex);
}

class Dexie$1 {
    constructor(name, options) {
        this._middlewares = {};
        this.verno = 0;
        const deps = Dexie$1.dependencies;
        this._options = options = {
            addons: Dexie$1.addons,
            autoOpen: true,
            indexedDB: deps.indexedDB,
            IDBKeyRange: deps.IDBKeyRange,
            ...options
        };
        this._deps = {
            indexedDB: options.indexedDB,
            IDBKeyRange: options.IDBKeyRange
        };
        const { addons, } = options;
        this._dbSchema = {};
        this._versions = [];
        this._storeNames = [];
        this._allTables = {};
        this.idbdb = null;
        this._novip = this;
        const state = {
            dbOpenError: null,
            isBeingOpened: false,
            onReadyBeingFired: null,
            openComplete: false,
            dbReadyResolve: nop,
            dbReadyPromise: null,
            cancelOpen: nop,
            openCanceller: null,
            autoSchema: true,
            PR1398_maxLoop: 3
        };
        state.dbReadyPromise = new DexiePromise(resolve => {
            state.dbReadyResolve = resolve;
        });
        state.openCanceller = new DexiePromise((_, reject) => {
            state.cancelOpen = reject;
        });
        this._state = state;
        this.name = name;
        this.on = Events(this, "populate", "blocked", "versionchange", "close", { ready: [promisableChain, nop] });
        this.on.ready.subscribe = override(this.on.ready.subscribe, subscribe => {
            return (subscriber, bSticky) => {
                Dexie$1.vip(() => {
                    const state = this._state;
                    if (state.openComplete) {
                        if (!state.dbOpenError)
                            DexiePromise.resolve().then(subscriber);
                        if (bSticky)
                            subscribe(subscriber);
                    }
                    else if (state.onReadyBeingFired) {
                        state.onReadyBeingFired.push(subscriber);
                        if (bSticky)
                            subscribe(subscriber);
                    }
                    else {
                        subscribe(subscriber);
                        const db = this;
                        if (!bSticky)
                            subscribe(function unsubscribe() {
                                db.on.ready.unsubscribe(subscriber);
                                db.on.ready.unsubscribe(unsubscribe);
                            });
                    }
                });
            };
        });
        this.Collection = createCollectionConstructor(this);
        this.Table = createTableConstructor(this);
        this.Transaction = createTransactionConstructor(this);
        this.Version = createVersionConstructor(this);
        this.WhereClause = createWhereClauseConstructor(this);
        this.on("versionchange", ev => {
            if (ev.newVersion > 0)
                console.warn(`Another connection wants to upgrade database '${this.name}'. Closing db now to resume the upgrade.`);
            else
                console.warn(`Another connection wants to delete database '${this.name}'. Closing db now to resume the delete request.`);
            this.close();
        });
        this.on("blocked", ev => {
            if (!ev.newVersion || ev.newVersion < ev.oldVersion)
                console.warn(`Dexie.delete('${this.name}') was blocked`);
            else
                console.warn(`Upgrade '${this.name}' blocked by other connection holding version ${ev.oldVersion / 10}`);
        });
        this._maxKey = getMaxKey(options.IDBKeyRange);
        this._createTransaction = (mode, storeNames, dbschema, parentTransaction) => new this.Transaction(mode, storeNames, dbschema, this._options.chromeTransactionDurability, parentTransaction);
        this._fireOnBlocked = ev => {
            this.on("blocked").fire(ev);
            connections
                .filter(c => c.name === this.name && c !== this && !c._state.vcFired)
                .map(c => c.on("versionchange").fire(ev));
        };
        this.use(virtualIndexMiddleware);
        this.use(hooksMiddleware);
        this.use(observabilityMiddleware);
        this.use(cacheExistingValuesMiddleware);
        this.vip = Object.create(this, { _vip: { value: true } });
        addons.forEach(addon => addon(this));
    }
    version(versionNumber) {
        if (isNaN(versionNumber) || versionNumber < 0.1)
            throw new exceptions.Type(`Given version is not a positive number`);
        versionNumber = Math.round(versionNumber * 10) / 10;
        if (this.idbdb || this._state.isBeingOpened)
            throw new exceptions.Schema("Cannot add version when database is open");
        this.verno = Math.max(this.verno, versionNumber);
        const versions = this._versions;
        var versionInstance = versions.filter(v => v._cfg.version === versionNumber)[0];
        if (versionInstance)
            return versionInstance;
        versionInstance = new this.Version(versionNumber);
        versions.push(versionInstance);
        versions.sort(lowerVersionFirst);
        versionInstance.stores({});
        this._state.autoSchema = false;
        return versionInstance;
    }
    _whenReady(fn) {
        return (this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip)) ? fn() : new DexiePromise((resolve, reject) => {
            if (this._state.openComplete) {
                return reject(new exceptions.DatabaseClosed(this._state.dbOpenError));
            }
            if (!this._state.isBeingOpened) {
                if (!this._options.autoOpen) {
                    reject(new exceptions.DatabaseClosed());
                    return;
                }
                this.open().catch(nop);
            }
            this._state.dbReadyPromise.then(resolve, reject);
        }).then(fn);
    }
    use({ stack, create, level, name }) {
        if (name)
            this.unuse({ stack, name });
        const middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
        middlewares.push({ stack, create, level: level == null ? 10 : level, name });
        middlewares.sort((a, b) => a.level - b.level);
        return this;
    }
    unuse({ stack, name, create }) {
        if (stack && this._middlewares[stack]) {
            this._middlewares[stack] = this._middlewares[stack].filter(mw => create ? mw.create !== create :
                name ? mw.name !== name :
                    false);
        }
        return this;
    }
    open() {
        return dexieOpen(this);
    }
    _close() {
        const state = this._state;
        const idx = connections.indexOf(this);
        if (idx >= 0)
            connections.splice(idx, 1);
        if (this.idbdb) {
            try {
                this.idbdb.close();
            }
            catch (e) { }
            this._novip.idbdb = null;
        }
        state.dbReadyPromise = new DexiePromise(resolve => {
            state.dbReadyResolve = resolve;
        });
        state.openCanceller = new DexiePromise((_, reject) => {
            state.cancelOpen = reject;
        });
    }
    close() {
        this._close();
        const state = this._state;
        this._options.autoOpen = false;
        state.dbOpenError = new exceptions.DatabaseClosed();
        if (state.isBeingOpened)
            state.cancelOpen(state.dbOpenError);
    }
    delete() {
        const hasArguments = arguments.length > 0;
        const state = this._state;
        return new DexiePromise((resolve, reject) => {
            const doDelete = () => {
                this.close();
                var req = this._deps.indexedDB.deleteDatabase(this.name);
                req.onsuccess = wrap(() => {
                    _onDatabaseDeleted(this._deps, this.name);
                    resolve();
                });
                req.onerror = eventRejectHandler(reject);
                req.onblocked = this._fireOnBlocked;
            };
            if (hasArguments)
                throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
            if (state.isBeingOpened) {
                state.dbReadyPromise.then(doDelete);
            }
            else {
                doDelete();
            }
        });
    }
    backendDB() {
        return this.idbdb;
    }
    isOpen() {
        return this.idbdb !== null;
    }
    hasBeenClosed() {
        const dbOpenError = this._state.dbOpenError;
        return dbOpenError && (dbOpenError.name === 'DatabaseClosed');
    }
    hasFailed() {
        return this._state.dbOpenError !== null;
    }
    dynamicallyOpened() {
        return this._state.autoSchema;
    }
    get tables() {
        return keys(this._allTables).map(name => this._allTables[name]);
    }
    transaction() {
        const args = extractTransactionArgs.apply(this, arguments);
        return this._transaction.apply(this, args);
    }
    _transaction(mode, tables, scopeFunc) {
        let parentTransaction = PSD.trans;
        if (!parentTransaction || parentTransaction.db !== this || mode.indexOf('!') !== -1)
            parentTransaction = null;
        const onlyIfCompatible = mode.indexOf('?') !== -1;
        mode = mode.replace('!', '').replace('?', '');
        let idbMode, storeNames;
        try {
            storeNames = tables.map(table => {
                var storeName = table instanceof this.Table ? table.name : table;
                if (typeof storeName !== 'string')
                    throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                return storeName;
            });
            if (mode == "r" || mode === READONLY)
                idbMode = READONLY;
            else if (mode == "rw" || mode == READWRITE)
                idbMode = READWRITE;
            else
                throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
            if (parentTransaction) {
                if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                    if (onlyIfCompatible) {
                        parentTransaction = null;
                    }
                    else
                        throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                }
                if (parentTransaction) {
                    storeNames.forEach(storeName => {
                        if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                            if (onlyIfCompatible) {
                                parentTransaction = null;
                            }
                            else
                                throw new exceptions.SubTransaction("Table " + storeName +
                                    " not included in parent transaction.");
                        }
                    });
                }
                if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                    parentTransaction = null;
                }
            }
        }
        catch (e) {
            return parentTransaction ?
                parentTransaction._promise(null, (_, reject) => { reject(e); }) :
                rejection(e);
        }
        const enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
        return (parentTransaction ?
            parentTransaction._promise(idbMode, enterTransaction, "lock") :
            PSD.trans ?
                usePSD(PSD.transless, () => this._whenReady(enterTransaction)) :
                this._whenReady(enterTransaction));
    }
    table(tableName) {
        if (!hasOwn(this._allTables, tableName)) {
            throw new exceptions.InvalidTable(`Table ${tableName} does not exist`);
        }
        return this._allTables[tableName];
    }
}

const symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol
    ? Symbol.observable
    : "@@observable";
class Observable {
    constructor(subscribe) {
        this._subscribe = subscribe;
    }
    subscribe(x, error, complete) {
        return this._subscribe(!x || typeof x === "function" ? { next: x, error, complete } : x);
    }
    [symbolObservable]() {
        return this;
    }
}

function extendObservabilitySet(target, newSet) {
    keys(newSet).forEach(part => {
        const rangeSet = target[part] || (target[part] = new RangeSet());
        mergeRanges(rangeSet, newSet[part]);
    });
    return target;
}

function liveQuery(querier) {
    return new Observable((observer) => {
        const scopeFuncIsAsync = isAsyncFunction(querier);
        function execute(subscr) {
            if (scopeFuncIsAsync) {
                incrementExpectedAwaits();
            }
            const exec = () => newScope(querier, { subscr, trans: null });
            const rv = PSD.trans
                ?
                    usePSD(PSD.transless, exec)
                : exec();
            if (scopeFuncIsAsync) {
                rv.then(decrementExpectedAwaits, decrementExpectedAwaits);
            }
            return rv;
        }
        let closed = false;
        let accumMuts = {};
        let currentObs = {};
        const subscription = {
            get closed() {
                return closed;
            },
            unsubscribe: () => {
                closed = true;
                globalEvents.storagemutated.unsubscribe(mutationListener);
            },
        };
        observer.start && observer.start(subscription);
        let querying = false, startedListening = false;
        function shouldNotify() {
            return keys(currentObs).some((key) => accumMuts[key] && rangesOverlap(accumMuts[key], currentObs[key]));
        }
        const mutationListener = (parts) => {
            extendObservabilitySet(accumMuts, parts);
            if (shouldNotify()) {
                doQuery();
            }
        };
        const doQuery = () => {
            if (querying || closed)
                return;
            accumMuts = {};
            const subscr = {};
            const ret = execute(subscr);
            if (!startedListening) {
                globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
                startedListening = true;
            }
            querying = true;
            Promise.resolve(ret).then((result) => {
                querying = false;
                if (closed)
                    return;
                if (shouldNotify()) {
                    doQuery();
                }
                else {
                    accumMuts = {};
                    currentObs = subscr;
                    observer.next && observer.next(result);
                }
            }, (err) => {
                querying = false;
                observer.error && observer.error(err);
                subscription.unsubscribe();
            });
        };
        doQuery();
        return subscription;
    });
}

let domDeps;
try {
    domDeps = {
        indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
        IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
    };
}
catch (e) {
    domDeps = { indexedDB: null, IDBKeyRange: null };
}

const Dexie = Dexie$1;
props(Dexie, {
    ...fullNameExceptions,
    delete(databaseName) {
        const db = new Dexie(databaseName, { addons: [] });
        return db.delete();
    },
    exists(name) {
        return new Dexie(name, { addons: [] }).open().then(db => {
            db.close();
            return true;
        }).catch('NoSuchDatabaseError', () => false);
    },
    getDatabaseNames(cb) {
        try {
            return getDatabaseNames(Dexie.dependencies).then(cb);
        }
        catch (_a) {
            return rejection(new exceptions.MissingAPI());
        }
    },
    defineClass() {
        function Class(content) {
            extend(this, content);
        }
        return Class;
    },
    ignoreTransaction(scopeFunc) {
        return PSD.trans ?
            usePSD(PSD.transless, scopeFunc) :
            scopeFunc();
    },
    vip,
    async: function (generatorFn) {
        return function () {
            try {
                var rv = awaitIterator(generatorFn.apply(this, arguments));
                if (!rv || typeof rv.then !== 'function')
                    return DexiePromise.resolve(rv);
                return rv;
            }
            catch (e) {
                return rejection(e);
            }
        };
    },
    spawn: function (generatorFn, args, thiz) {
        try {
            var rv = awaitIterator(generatorFn.apply(thiz, args || []));
            if (!rv || typeof rv.then !== 'function')
                return DexiePromise.resolve(rv);
            return rv;
        }
        catch (e) {
            return rejection(e);
        }
    },
    currentTransaction: {
        get: () => PSD.trans || null
    },
    waitFor: function (promiseOrFunction, optionalTimeout) {
        const promise = DexiePromise.resolve(typeof promiseOrFunction === 'function' ?
            Dexie.ignoreTransaction(promiseOrFunction) :
            promiseOrFunction)
            .timeout(optionalTimeout || 60000);
        return PSD.trans ?
            PSD.trans.waitFor(promise) :
            promise;
    },
    Promise: DexiePromise,
    debug: {
        get: () => debug,
        set: value => {
            setDebug(value, value === 'dexie' ? () => true : dexieStackFrameFilter);
        }
    },
    derive: derive,
    extend: extend,
    props: props,
    override: override,
    Events: Events,
    on: globalEvents,
    liveQuery,
    extendObservabilitySet,
    getByKeyPath: getByKeyPath,
    setByKeyPath: setByKeyPath,
    delByKeyPath: delByKeyPath,
    shallowClone: shallowClone,
    deepClone: deepClone,
    getObjectDiff: getObjectDiff,
    cmp,
    asap: asap$1,
    minKey: minKey,
    addons: [],
    connections: connections,
    errnames: errnames,
    dependencies: domDeps,
    semVer: DEXIE_VERSION,
    version: DEXIE_VERSION.split('.')
        .map(n => parseInt(n))
        .reduce((p, c, i) => p + (c / Math.pow(10, i * 2))),
});
Dexie.maxKey = getMaxKey(Dexie.dependencies.IDBKeyRange);

if (typeof dispatchEvent !== 'undefined' && typeof addEventListener !== 'undefined') {
    globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, updatedParts => {
        if (!propagatingLocally) {
            let event;
            if (isIEOrEdge) {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, true, true, updatedParts);
            }
            else {
                event = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
                    detail: updatedParts
                });
            }
            propagatingLocally = true;
            dispatchEvent(event);
            propagatingLocally = false;
        }
    });
    addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, ({ detail }) => {
        if (!propagatingLocally) {
            propagateLocally(detail);
        }
    });
}
function propagateLocally(updateParts) {
    let wasMe = propagatingLocally;
    try {
        propagatingLocally = true;
        globalEvents.storagemutated.fire(updateParts);
    }
    finally {
        propagatingLocally = wasMe;
    }
}
let propagatingLocally = false;

if (typeof BroadcastChannel !== 'undefined') {
    const bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
    globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, (changedParts) => {
        if (!propagatingLocally) {
            bc.postMessage(changedParts);
        }
    });
    bc.onmessage = (ev) => {
        if (ev.data)
            propagateLocally(ev.data);
    };
}
else if (typeof self !== 'undefined' && typeof navigator !== 'undefined') {
    globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, (changedParts) => {
        try {
            if (!propagatingLocally) {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(STORAGE_MUTATED_DOM_EVENT_NAME, JSON.stringify({
                        trig: Math.random(),
                        changedParts,
                    }));
                }
                if (typeof self['clients'] === 'object') {
                    [...self['clients'].matchAll({ includeUncontrolled: true })].forEach((client) => client.postMessage({
                        type: STORAGE_MUTATED_DOM_EVENT_NAME,
                        changedParts,
                    }));
                }
            }
        }
        catch (_a) { }
    });
    if (typeof addEventListener !== 'undefined') {
        addEventListener('storage', (ev) => {
            if (ev.key === STORAGE_MUTATED_DOM_EVENT_NAME) {
                const data = JSON.parse(ev.newValue);
                if (data)
                    propagateLocally(data.changedParts);
            }
        });
    }
    const swContainer = self.document && navigator.serviceWorker;
    if (swContainer) {
        swContainer.addEventListener('message', propagateMessageLocally);
    }
}
function propagateMessageLocally({ data }) {
    if (data && data.type === STORAGE_MUTATED_DOM_EVENT_NAME) {
        propagateLocally(data.changedParts);
    }
}

DexiePromise.rejectionMapper = mapError;
setDebug(debug, dexieStackFrameFilter);

export { Dexie$1 as Dexie, RangeSet, Dexie$1 as default, liveQuery, mergeRanges, rangesOverlap };
//# sourceMappingURL=dexie.mjs.map
