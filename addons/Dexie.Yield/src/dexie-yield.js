
import Dexie from 'dexie';

var Promise = Dexie.Promise;

export function spawn(generatorFn) {
    return iterate(generatorFn());
}

export function async(generatorFn) {
    return function () {
        return iterate(generatorFn.apply(this, arguments));
    }
}
        
export function iterate (iterable) {
    var callNext = function (result) { return iterable.next(result); },
        doThrow = function (error) { return iterable.throw(error); },
        onSuccess = step(callNext),
        onError = step(doThrow);

    function step(getNext, initial) {
        return function (val) {
            var next = getNext(val);
            if (next.done)
                return initial ? Promise.resolve(next.value) : next.value;

            if (!next.value || typeof next.value.then !== 'function')
                if (Array.isArray(next.value))
                    return Promise.all(next.value).then(onSuccess, onError);
                else
                    return Promise.resolve(next.value).then(onSuccess, onError);
            return next.value.then(onSuccess, onError);
        }
    }

    try {
        return step(callNext, true)();
    } catch (e) {
        return Promise.reject(e);
    }
}

export default function DexieYield(db) {
    db.transaction = Dexie.override(db.transaction, function (origDbTransaction) {
        return function () {
            var scopeFunc = arguments[arguments.length - 1];

            function proxyScope() {
                var rv = scopeFunc.apply(this, arguments);
                if (!rv.next || !rv.throw) return rv; // Not an iterable
                return iterate(rv);
            }

            proxyScope.toString = function () {
                return scopeFunc.toString(); // Because original db.transaction may use fn.toString() when error occur.
            }
            arguments[arguments.length - 1] = proxyScope;
            return origDbTransaction.apply(this, arguments);
        }
    });
}
