import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {spawnedTest, supports} from './dexie-unittest-utils';

module("promise");

//Dexie.debug = "dexie";

function createDirectlyResolvedPromise() {
    return new Dexie.Promise(function(resolve) {
        resolve();
    });
}

asyncTest("Promise basics", ()=>{
   new Dexie.Promise(resolve => resolve("value"))
   .then(value => {
      equal(value, "value", "Promise should be resolved with 'value'");
   }).then(()=>{
      start(); 
   });
});

asyncTest("return Promise.resolve() from Promise.then(...)", ()=>{
    new Dexie.Promise(resolve => resolve("value"))
    .then (value => {
        return Dexie.Promise.resolve(value);
    }).then (value => {
        equal (value, "value", "returning Dexie.Promise.resolve() from then handler should work");
        start();
    })
});

asyncTest("return unresolved Promise from Promise.then(...)", ()=>{
    new Dexie.Promise(resolve => resolve("value"))
    .then (value => {
        return new Dexie.Promise(resolve => setTimeout(resolve, 0, "value"));
    }).then (value => {
        equal (value, "value", "When unresolved promise is resolved, this promise should resolve with its value");
        start();
    })
});

asyncTest("Compatibility with other promises", ()=>{
    Dexie.Promise.resolve().then(()=>{
       return window.Promise.resolve(3); 
    }).then(x => {
        equal(x, 3, "returning a window.Promise should be ok");
        start();
    })
});

asyncTest("When to promise resolve", ()=>{
    var Promise = Dexie.Promise;
    var res = [];
    Promise.follow(()=>{
        new Promise (resolve => resolve()).then(()=>res.push("B1"));
        res.push("A1");
        new Promise (resolve => resolve()).then(()=>res.push("B2"));
        res.push("A2");
    }).then(()=>{
        equal(JSON.stringify(res), JSON.stringify([
            "A1",
            "A2",
            "B1",
            "B2"
        ]), "Resolves come in expected order.");
    }).catch(e => {
        ok(false, e.stack || e);
    }).then(start);
});

asyncTest("Promise.follow()", ()=>{
    var Promise = Dexie.Promise;
    Promise.follow(() => {
        Promise.resolve("test")
            .then(x => x + ":")
            .then(x => Promise.reject("rejection"))
            .then(()=>ok(false, "Should not come here"))
            .catch(e => equal(e, "rejection", "Should catch rejection"));
    }).then(()=>ok(true, "Scope ended"))
      .catch(e => ok(false, "Error: " + e.stack))
      .then(start);
});

asyncTest("Promise.follow() 2", ()=>{
    var Promise = Dexie.Promise;
    Promise.follow(() => {
        Promise.resolve("test")
            .then(x => x + ":")
            .then(x => Promise.reject("rejection"))
            .then(()=>ok(false, "Should not come here"))
    }).then(()=>ok(false, "Scope should not resolve"))
      .catch(e => ok(true, "Got error: " + e.stack))
      .then(start);
});

asyncTest("Promise.follow() 3 (empty)", ()=>{
    Dexie.Promise.follow(()=>{})
        .then(()=>ok(true, "Promise resolved when nothing was done"))
        .then(start); 
});

asyncTest ("Promise.follow chained", ()=>{
    var Promise = Dexie.Promise;
    //Promise._rootExec(()=>{        
    //Promise.scheduler = (fn, args) => setTimeout(fn, 0, args[0], args[1], args[2]);
        
    Promise.follow(()=>{
        new Promise(resolve => resolve()).then(()=>Promise.follow(()=>{
            Promise.PSD.inner = true;
            
            // Chains and rejection
            new Promise(resolve => resolve())
                .then(x => 3)
                .then(null, e => "catched")
                .then(x => {}) 
                .then(()=>{throw new TypeError("oops");})
            }).then(()=>ok(false, "Promise.follow() should not resolve since an unhandled rejection should have been detected"))
        ).then(()=>ok(false, "Promise.follow() should not resolve since an unhandled rejection should have been detected"))
        .catch (TypeError, err => {
            ok(true, "Got TypeError: " + err.stack);
        });
    }).then (()=> ok(true, "Outer Promise.follow() should resolve because inner was catched"))
    .catch (err => {
        ok(false, "Should have catched TypeError: " + err.stack);
    }).then(()=>{
        start();
    });
    //});
});

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
