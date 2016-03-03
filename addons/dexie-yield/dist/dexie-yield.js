(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('dexie')) :
    typeof define === 'function' && define.amd ? define(['exports', 'dexie'], factory) :
    factory((global.Dexie.Yield = {}),global.Dexie);
}(this, function (exports,Dexie) { 'use strict';

    Dexie = 'default' in Dexie ? Dexie['default'] : Dexie;

    // Prefer standard promise, but fallback to Dexie Promise.
    // The standard Promise will only be used in case the async function throws or returns value before yielding a thenable.
    // If writing the async functions correctly, async() will adapt to the type of promise returned, such as Q, WinJS or Dexie.

    var Promise = (typeof self === 'undefined' ? global : (self || window)).Promise || Dexie.Promise; 

    function async(generatorFn) {
        return function () {
            try {
                var rv = iterate(generatorFn.apply(this, arguments));
                if (!rv || typeof rv.then !== 'function')
                    return Promise.resolve(rv);
                return rv;
            } catch (e) {
                return Promise.reject(e);
            }
        }
    }

    function spawn(generatorFn, args, thiz) {
        try {
            var rv = iterate(generatorFn.apply(thiz, args || []));
            if (!rv || typeof rv.then !== 'function')
                return Dexie.Promise.resolve(rv);
            return rv;
        } catch (e) {
            return Dexie.Promise.reject(e);
        }
    }

    function iterate (iterable) {
        var callNext = result => iterable.next(result),
            doThrow = error => iterable.throw(error),
            onSuccess = step(callNext),
            onError = step(doThrow);

        function step(getNext) {
            return val => {
                var next = getNext(val),
                    value = next.value;

                return next.done ? value :
                    (!value || typeof value.then !== 'function' ?
                        Array.isArray(value) ? awaitAll(value, 0) : onSuccess(value) :
                        value.then(onSuccess, onError));
            }
        }

        function awaitAll (values, i) {
            if (i === values.length) return onSuccess(values);
            var value = values[i];
            return value.constructor && typeof value.constructor.all == 'function' ?
                value.constructor.all(values).then(onSuccess, onError) :
                awaitAll (values, i + 1);
        }

        return step(callNext)();
    }

    Dexie.addons.push(function (db) {
        //
        // Adjust db.transaction() to handle iterable functions as async without explicitely having to write async() around the transaction scope func:
        //  db.transaction('rw', db.friends, async(function*(){})); - not needed.
        //  db.transaction('rw', db.friends, function*(){}); // prettier.
        //
        db.transaction = Dexie.override(db.transaction, function (origDbTransaction) {
            return function () {
                var scopeFunc = arguments[arguments.length - 1];

                function proxyScope() {
                    var rv = scopeFunc.apply(this, arguments);
                    if (!rv.next || !rv.throw) return rv; // Not an iterable
                    return iterate(rv);
                }

                proxyScope.toString =
                    () => scopeFunc.toString(); // Because original db.transaction may use fn.toString() when error occur.
                    
                arguments[arguments.length - 1] = proxyScope;
                return origDbTransaction.apply(this, arguments);
            }
        });
    });

    exports.async = async;
    exports.spawn = spawn;
    exports.iterate = iterate;

}));
//# sourceMappingURL=dexie-yield.js.map