// promise-light (https://github.com/taylorhakes/promise-light) by https://github.com/taylorhakes

(function () {
    // Ignore the rest if there is native Promises
    if (window.Promise) {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = window.Promise;
        }
        return;
    }

    var asap = window.setImmediate || function (fn) { setTimeout(fn, 0) };
    function Promise(fn) {
        if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
        if (typeof fn !== 'function') throw new TypeError('not a function');
        this._state = null;
        this._value = null;
        this._deferreds = [];
        var self = this;

        doResolve(fn, function (data) {
            resolve.call(self, data);
        }, function (reason) {
            reject.call(self, reason);
        });
    }

    function handle(deferred) {
        var self = this;
        if (this._state === null) {
            this._deferreds.push(deferred);
            return;
        }
        asap(function () {
            var cb = self._state ? deferred.onFulfilled : deferred.onRejected;
            if (cb === null) {
                (self._state ? deferred.resolve : deferred.reject)(self._value);
                return;
            }
            var ret;
            try {
                ret = cb(self._value);
            }
            catch (e) {
                deferred.reject(e);
                return;
            }
            deferred.resolve(ret);
        })
    }

    function resolve(newValue) {
        var self = this;
        try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
            if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
            if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                if (typeof newValue.then === 'function') {
                    doResolve(function (resolve, reject) {
                        newValue.then(resolve, reject);
                    }, function (data) {
                        resolve.call(self, data);
                    }, function (reason) {
                        reject.call(self, reason);
                    });
                    return;
                }
            }
            this._state = true;
            this._value = newValue;
            finale.call(this);
        } catch (e) { reject(e) }
    }

    function reject(newValue) {
        this._state = false;
        this._value = newValue;
        finale.call(this);
    }

    function finale() {
        for (var i = 0, len = this._deferreds.length; i < len; i++) {
            handle.call(this, this._deferreds[i]);
        }
        this._deferreds = null;
    }

    function Handler(onFulfilled, onRejected, resolve, reject) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
    }

    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     *
     * Makes no guarantees about asynchrony.
     */
    function doResolve(fn, onFulfilled, onRejected) {
        var done = false;
        try {
            fn(function (value) {
                if (done) return;
                done = true;
                onFulfilled(value);
            }, function (reason) {
                if (done) return;
                done = true;
                onRejected(reason);
            })
        } catch (ex) {
            if (done) return;
            onRejected(ex);
        }
    }

    Promise.all = function () {
        var args = Array.prototype.slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments);

        return new Promise(function (resolve, reject) {
            if (args.length === 0) return resolve([]);
            var remaining = args.length;
            function res(i, val) {
                try {
                    if (val && (typeof val === 'object' || typeof val === 'function')) {
                        var then = val.then;
                        if (typeof then === 'function') {
                            then.call(val, function (val) { res(i, val) }, reject);
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
    };

    /* Prototype Methods */
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var self = this;
        return new Promise(function (resolve, reject) {
            handle.call(self, new Handler(onFulfilled, onRejected, resolve, reject));
        })
    };

    Promise.prototype['catch'] = function (onRejected) {
        return this.then(null, onRejected);
    };

    Promise.resolve = function (value) {
        return new Promise(function (resolve) {
            resolve(value);
        });
    };

    Promise.reject = function (value) {
        return new Promise(function (resolve, reject) {
            reject(value);
        });
    };

    Promise.race = function (values) {
        return new Promise(function (resolve, reject) {
            values.map(function (value) {
                value.then(resolve, reject);
            })
        });
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Promise;
    } else {
        window.Promise = Promise;
    }
})();

