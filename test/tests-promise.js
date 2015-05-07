///<reference path="run-unit-tests.html" />
///<reference path="qunit.js" />
///<reference path="../src/Dexie.js" />

(function() {
    module("promise");

    function createDirectlyResolvedPromise() {
        return new Dexie.Promise(function(resolve) {
            resolve();
        });
    }

    asyncTest("Issue#27(A) - Then handlers are called synchronously for already resolved promises", function () {
        // Test with plain Dexie.Promise()
        var expectedLog = ['1', '3', '2', 'a', 'c', 'b'];
        var log = [];

        var promise = createDirectlyResolvedPromise();
        log.push('1');
        promise.then(function() {
            log.push('2');
            log.push('a');
            promise.then(function() {
                log.push('b');
                check();
            });
            log.push('c');
            check();
        });
        log.push('3');
        check();

        function check() {
            if (log.length == expectedLog.length) {
                for (var i = 0; i < log.length; ++i) {
                    equal(log[i], expectedLog[i], "Position " + i + " is " + log[i] + " and was expected to be " + expectedLog[i]);
                }
                start();
            }
        }
    });

    asyncTest("Issue#27(B) - Then handlers are called synchronously for already resolved promises", function () {
        // Test with a Promise returned from the Dexie library
        var expectedLog = ['1', '3', '2', 'a', 'c', 'b'];
        var log = [];

        var db = new Dexie("Promise-test");
        db.version(1).stores({ friends: '++id' });
        db.on('populate', function () {
            db.friends.add({ name: "one" });
            db.friends.add({ name: "two" });
            db.friends.add({ name: "three" });
        });
        db.delete().then(function () {
            return db.open();
        }).then(function () {
            var promise = db.friends.toCollection().each(function() {});
            log.push('1');
            promise.then(function () {
                log.push('2');
                log.push('a');
                promise.then(function() {
                    log.push('b');
                    check();
                }).catch(function(e) {
                    ok(false, "error: " + e);
                    start();
                });
                log.push('c');
                check();
            }).catch(function(e) {
                ok(false, "error: " + e);
                start();
            });
            log.push('3');
            check();

            function check() {
                if (log.length == expectedLog.length) {
                    for (var i = 0; i < log.length; ++i) {
                        equal(log[i], expectedLog[i], "Position " + i + " is " + log[i] + " and was expected to be " + expectedLog[i]);
                    }
                    db.delete().then(start);
                }
            }
        });
    });

    asyncTest("Issue #97 A transaction may be lost after calling Dexie.Promise.resolve().then(...)", function() {
        Dexie.Promise.newPSD(function () {

            Dexie.Promise.PSD.hello = "promise land";

            Dexie.Promise.resolve().then(function () {
                ok(!!Dexie.Promise.PSD, "We should have a Dexie.Promise.PSD");
                equal(Dexie.Promise.PSD.hello, "promise land");
            }).catch(function(e) {
                ok(false, "Error: " + e);
            }).finally(start);

        });
    });
})();
