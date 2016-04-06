/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * By David Fahlander, david.fahlander@gmail.com
 *
 * Version {version}, {date}
 * www.dexie.com
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 */
import Promise from './Promise';
import {exceptions} from './errors';

export var keys = Object.keys;
export var isArray = Array.isArray;
export var _global =
    typeof self !== 'undefined' ? self :
    typeof window !== 'undefined' ? window :
    global;

export function extend(obj, extension) {
    if (typeof extension !== 'object') return obj;
    keys(extension).forEach(function (key) {
        obj[key] = extension[key];
    });
    return obj;
}

export function extendProto (proto, extension) {
    if (typeof extension === 'function') extension = extension(Object.getPrototypeOf(proto));
    keys(extension).forEach(key => {
        setProp(proto, key, extension[key]);
    });
}

export function setProp(obj, prop, functionOrGetSet, options) {
    Object.defineProperty(obj, prop, extend(typeof functionOrGetSet.get === 'function' ?
        {get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true} :
        {value: functionOrGetSet, configurable: true, writable: true}, options));
}

export function derive(Child) {
    return {
        from: function (Parent) {
            Child.prototype = Object.create(Parent.prototype);
            setProp(Child.prototype, "constructor", Child);
            return {
                extend: extendProto.bind(null, Child.prototype)
            };
        }
    };
}

var _slice = [].slice;
export function slice(args, start, end) {
    return _slice.call(args, start, end);
}

export function override(origFunc, overridedFactory) {
    return overridedFactory(origFunc);
}

export function doFakeAutoComplete(fn) {
    var to = setTimeout(fn, 1000);
    clearTimeout(to);
}

export function assert(b) {
    if (!b) throw new exceptions.Internal("Assertion failed");
}

export function asap(fn) {
    if (_global.setImmediate) setImmediate(fn); else setTimeout(fn, 0);
}

export function miniTryCatch(fn, onerror) {
    try {
        fn();
    } catch (ex) {
        onerror && onerror(ex);
    }
}

export function messageAndStack (e) {
    var stack = e && e.stack;
    return stack ?
        stack.indexOf(e+'') > 0 ?
            stack :
        e + ". " + stack :
        e;
}

export function stack(error) {
    if (error.stack) return error; // Provided error already has a stack
    try {
        var err = new Error(error.message || error); // In Chrome, stack is generated here.
        if (err.stack) { error.stack = err.stack; return error; } // If stack was generated, set it.
        // No stack. Other browsers only put the stack if we throw the error:
        throw err;
    } catch (e) {
        error.stack = e.stack;
    }
    return error;
}

export function fail(err) {
    // Get the call stack and return a rejected promise.
    return Promise.reject(stack(err));
}

export function getByKeyPath(obj, keyPath) {
    // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
    if (obj.hasOwnProperty(keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
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
        return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
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
                if (value === undefined) delete obj[currentKeyPath]; else obj[currentKeyPath] = value;
            else {
                var innerObj = obj[currentKeyPath];
                if (!innerObj) innerObj = (obj[currentKeyPath] = {});
                setByKeyPath(innerObj, remainingKeyPath, value);
            }
        } else {
            if (value === undefined) delete obj[keyPath]; else obj[keyPath] = value;
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
        if (obj.hasOwnProperty(m)) rv[m] = obj[m];
    }
    return rv;
}

export function deepClone(any) {
    if (!any || typeof any !== 'object') return any;
    var rv;
    if (isArray(any)) {
        rv = [];
        for (var i = 0, l = any.length; i < l; ++i) {
            rv.push(deepClone(any[i]));
        }
    } else if (any instanceof Date) {
        rv = new Date();
        rv.setTime(any.getTime());
    } else {
        rv = any.constructor ? Object.create(any.constructor.prototype) : {};
        for (var prop in any) {
            if (any.hasOwnProperty(prop)) {
                rv[prop] = deepClone(any[prop]);
            }
        }
    }
    return rv;
}

export function getObjectDiff(a, b, rv, prfx) {
    // Compares objects a and b and produces a diff object.
    rv = rv || {};
    prfx = prfx || '';
    for (var prop in a) if (a.hasOwnProperty(prop)) {
        if (!b.hasOwnProperty(prop))
            rv[prfx+prop] = undefined; // Property removed
        else {
            var ap = a[prop],
                bp = b[prop];
            if (typeof ap === 'object' && typeof bp === 'object')
                getObjectDiff(ap, bp, rv, prfx + prop + ".");
            else if (ap !== bp)
                rv[prfx + prop] = b[prop];// Primitive value changed
        }
    }
    for (prop in b) if (b.hasOwnProperty(prop) && !a.hasOwnProperty(prop)) {
        rv[prfx+prop] = b[prop]; // Property added
    }
    return rv;
}

export function idbp(idbOperation) {
    return new Promise((resolve,reject) => {
        var req = idbOperation();
        req.onerror = reject;
        req.onsuccess = resolve;
    });
}
