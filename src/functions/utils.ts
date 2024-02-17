import { _global } from "../globals/global";
export const keys = Object.keys;
export const isArray = Array.isArray;
if (typeof Promise !== 'undefined' && !_global.Promise){
    // In jsdom, this it can be the case that Promise is not put on the global object.
    // If so, we need to patch the global object for the rest of the code to work as expected.
    // Other dexie code expects Promise to be on the global object (like normal browser environments)
    _global.Promise = Promise;
}
export { _global }

export function extend<T extends object,X extends object>(obj: T, extension: X): T & X  {
    if (typeof extension !== 'object') return obj as T & X;
    keys(extension).forEach(function (key) {
        obj[key] = extension[key];
    });
    return obj as T & X;
}

export const getProto = Object.getPrototypeOf;
export const _hasOwn = {}.hasOwnProperty;
export function hasOwn(obj, prop) {
    return _hasOwn.call(obj, prop);
}

export function props (proto, extension) {
    if (typeof extension === 'function') extension = extension(getProto(proto));
    (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(key => {
        setProp(proto, key, extension[key]);
    });
}

export const defineProperty = Object.defineProperty;

export function setProp(obj, prop, functionOrGetSet, options?) {
    defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ?
        {get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true} :
        {value: functionOrGetSet, configurable: true, writable: true}, options));
}

export function derive(Child) {
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

export const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

export function getPropertyDescriptor(obj, prop) {
    const pd = getOwnPropertyDescriptor(obj, prop);
    let proto;
    return pd || (proto = getProto(obj)) && getPropertyDescriptor (proto, prop);
}

const _slice = [].slice;
export function slice(args, start?, end?) {
    return _slice.call(args, start, end);
}

export function override(origFunc, overridedFactory) {
    return overridedFactory(origFunc);
}

export function assert (b) {
    if (!b) throw new Error("Assertion Failed");
}

export function asap(fn) {
    // @ts-ignore
    if (_global.setImmediate) setImmediate(fn); else setTimeout(fn, 0);
}

export function getUniqueArray(a) {
    return a.filter((value, index, self) => self.indexOf(value) === index);
}

/** Generate an object (hash map) based on given array.
 * @param extractor Function taking an array item and its index and returning an array of 2 items ([key, value]) to
 *        instert on the resulting object for each item in the array. If this function returns a falsy value, the
 *        current item wont affect the resulting object.
 */
export function arrayToObject<T,R> (array: T[], extractor: (x:T, idx: number)=>[string, R]): {[name: string]: R} {
    return array.reduce((result, item, i) => {
        var nameAndValue = extractor(item, i);
        if (nameAndValue) result[nameAndValue[0]] = nameAndValue[1];
        return result;
    }, {});
}

export function trycatcher(fn, reject) {
    return function () {
        try {
            fn.apply(this, arguments);
        } catch (e) {
            reject(e);
        }
    };
}

export function tryCatch(fn: (...args: any[])=>void, onerror, args?) : void {
    try {
        fn.apply(null, args);
    } catch (ex) {
        onerror && onerror(ex);
    }
}

export function getByKeyPath(obj, keyPath) {
    // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
    if (typeof keyPath === 'string' && hasOwn(obj, keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
    if (!keyPath) return obj;
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
        return innerObj == null ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
    }
    return undefined;
}

export function setByKeyPath(obj, keyPath, value) {
    if (!obj || keyPath === undefined) return;
    if ('isFrozen' in Object && Object.isFrozen(obj)) return;
    if (typeof keyPath !== 'string' && 'length' in keyPath) {
        assert(typeof value !== 'string' && 'length' in value);
        for (var i = 0, l = keyPath.length; i < l; ++i) {
            setByKeyPath(obj, keyPath[i], value[i]);
        }
    } else {
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var currentKeyPath = keyPath.substr(0, period);
            var remainingKeyPath = keyPath.substr(period + 1);
            if (remainingKeyPath === "")
                if (value === undefined) {
                    if (isArray(obj) && !isNaN(parseInt(currentKeyPath))) obj.splice(currentKeyPath, 1);
                    else delete obj[currentKeyPath];
                } else obj[currentKeyPath] = value;
            else {
                var innerObj = obj[currentKeyPath];
                if (!innerObj || !hasOwn(obj, currentKeyPath)) innerObj = (obj[currentKeyPath] = {});
                setByKeyPath(innerObj, remainingKeyPath, value);
            }
        } else {
            if (value === undefined) {
                if (isArray(obj) && !isNaN(parseInt(keyPath))) obj.splice(keyPath, 1);
                else delete obj[keyPath];
            } else obj[keyPath] = value;
        }
    }
}

export function delByKeyPath(obj, keyPath) {
    if (typeof keyPath === 'string')
        setByKeyPath(obj, keyPath, undefined);
    else if ('length' in keyPath)
        [].map.call(keyPath, function(kp) {
            setByKeyPath(obj, kp, undefined);
        });
}

export function shallowClone(obj) {
    var rv = {};
    for (var m in obj) {
        if (hasOwn(obj, m)) rv[m] = obj[m];
    }
    return rv;
}

const concat = [].concat;
export function flatten<T> (a: (T | T[])[]) : T[] {
    return concat.apply([], a);
}

//https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
const intrinsicTypeNames =
    "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey"
    .split(',').concat(
        flatten([8,16,32,64].map(num=>["Int","Uint","Float"].map(t=>t+num+"Array")))
    ).filter(t=>_global[t]);
const intrinsicTypes = new Set(intrinsicTypeNames.map(t=>_global[t]));

/** Deep clone a simple object tree.
 * 
 * Copies object tree deeply, but does not deep-copy arrays,
 * typed arrays, Dates or other intrinsic types.
 * 
 * Does not check for cyclic references.
 * 
 * This function is 6 times faster than structuredClone() on chromium 111.
 * 
 * This function can safely be used for cloning ObservabilitySets and RangeSets.
 * 
 * @param o Object to clone
 * @returns Cloned object
 */
export function cloneSimpleObjectTree<T extends object>(o: T): T {
    const rv = {} as T;
    for (const k in o) if (hasOwn(o, k)) {
        const v = o[k];
        rv[k] = !v || typeof v !== 'object' || intrinsicTypes.has(v.constructor) ? v : cloneSimpleObjectTree(v);
    }
    return rv;
}

export function objectIsEmpty(o: object) {
    for (const k in o) if (hasOwn(o, k)) return false;
    return true;
}

let circularRefs: null | WeakMap<any,any> = null;

/** Deep clone an object or array.
 * 
 * 
 * @param any 
 * @returns 
 */
export function deepClone<T>(any: T): T {
    circularRefs = new WeakMap();
    const rv = innerDeepClone(any);
    circularRefs = null;
    return rv;
}

function innerDeepClone<T>(x: T): T {
    if (!x || typeof x !== 'object') return x;
    let rv = circularRefs.get(x); // Resolve circular references
    if (rv) return rv;
    if (isArray(x)) {
        rv = [];
        circularRefs.set(x, rv);
        for (var i = 0, l = x.length; i < l; ++i) {
            rv.push(innerDeepClone(x[i]));
        }
    } else if (intrinsicTypes.has(x.constructor)) {
        // For performance, we're less strict than structuredClone - we're only
        // cloning arrays and custom objects.
        // Typed arrays, Dates etc are not cloned.
        rv = x;
    } else {
        // We're nicer to custom classes than what structuredClone() is -
        // we preserve the proto of each object.
        const proto = getProto(x);
        rv = proto === Object.prototype ? {} : Object.create(proto);
        circularRefs.set(x, rv);
        for (var prop in x) {
            if (hasOwn(x, prop)) {
                rv[prop] = innerDeepClone(x[prop]);
            }
        }
    }
    return rv;
}

const {toString} = {};
export function toStringTag(o: Object) {
    return toString.call(o).slice(8, -1);
}

// If first argument is iterable or array-like, return it as an array
export const iteratorSymbol = typeof Symbol !== 'undefined' ?
    Symbol.iterator :
    '@@iterator';
export const getIteratorOf = typeof iteratorSymbol === "symbol" ? function(x) {
    var i;
    return x != null && (i = x[iteratorSymbol]) && i.apply(x);
} : function () { return null; };
export const asyncIteratorSymbol = typeof Symbol !== 'undefined'
    ? Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator")
    : '@asyncIterator';

export function delArrayItem(a: any[], x: any) {
    const i = a.indexOf(x);
    if (i >= 0) a.splice(i, 1);
    return i >= 0;
}

export const NO_CHAR_ARRAY = {};
// Takes one or several arguments and returns an array based on the following criteras:
// * If several arguments provided, return arguments converted to an array in a way that
//   still allows javascript engine to optimize the code.
// * If single argument is an array, return a clone of it.
// * If this-pointer equals NO_CHAR_ARRAY, don't accept strings as valid iterables as a special
//   case to the two bullets below.
// * If single argument is an iterable, convert it to an array and return the resulting array.
// * If single argument is array-like (has length of type number), convert it to an array.
export function getArrayOf (arrayLike) {
    var i, a, x, it;
    if (arguments.length === 1) {
        if (isArray(arrayLike)) return arrayLike.slice();
        if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string') return [arrayLike];
        if ((it = getIteratorOf(arrayLike))) {
            a = [];
            while ((x = it.next()), !x.done) a.push(x.value);
            return a;
        }
        if (arrayLike == null) return [arrayLike];
        i = arrayLike.length;
        if (typeof i === 'number') {
            a = new Array(i);
            while (i--) a[i] = arrayLike[i];
            return a;
        }
        return [arrayLike];
    }
    i = arguments.length;
    a = new Array(i);
    while (i--) a[i] = arguments[i];
    return a;
}
export const isAsyncFunction = typeof Symbol !== 'undefined'
    ? (fn: Function) => fn[Symbol.toStringTag] === 'AsyncFunction'
    : ()=>false;
