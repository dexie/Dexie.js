(function (global, define, undefined) {

    define('Dexie.Yield', ["Dexie"], function (Dexie) {

        function DexieYield(db) {
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

        function spawn(generatorFn) {
            return iterate(generatorFn());
        }

        function iterate(iter) {
            var onSuccess,
                onError;

            function step(getNext) {
                return function(val) {
                    var next = getNext(val);
                    if (next.done) {
                        if (next.value && typeof next.value.then === 'function')
                            throw new TypeError("Illegal to return a promise without yield");
                        return Promise.resolve(next.value);
                    }
                    if (!next.value || typeof next.value.then !== 'function')
                        throw new TypeError("Only acceptable to yield a Promise");
                    return next.value.then(onSuccess, onError);
                }
            }

            onSuccess = step(function(result) { return iter.next(result); });
            onError = step(function(error) { return iter.throw(error); });

            try {
                return onSuccess();
            } catch (e) {
                return Promise.reject(e);
            }
        }

        function async(generatorFn) {
            return function() {
                return iterate(generatorFn.apply(this, arguments));
            }
        }


        DexieYield.async = async;
        DexieYield.spawn = spawn;
        DexieYield.iterate = iterate;

        return DexieYield;
    });

}).apply(null,
    // AMD:
    typeof define === 'function' && define.amd ? [self, define] :
    // CommonJS:
    typeof global !== 'undefined' && typeof module !== 'undefined' && typeof require != 'undefined' ?
        [global, function (name, modules, fn) {
            module.exports = fn.apply(null, modules.map(function (id) { return require(id); }));
        }] :
    // Vanilla HTML and WebWorkers:
    [self, function (name, modules, fn) {
        var addon = fn.apply(null, modules.map(function (m) { return m.split('.').reduce(function (p, c) { return p && p[c]; }, self); })),
            path = name.split('.'),
            nsHost = path.slice(0, path.length - 1).reduce(function (p, c) { return p && p[c]; }, self);
        Dexie.addons.push(addon);
        nsHost[path[path.length - 1]] = addon;
    }]
);
