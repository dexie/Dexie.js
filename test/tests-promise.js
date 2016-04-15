import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';

module("promise");

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

asyncTest("Promise.track", ()=>{
    var Promise = Dexie.Promise;
    class Tracker {
        constructor() {
            this.counter = 0;
        }
        
        oncreate (promise) {
            promise.ID = ++this.counter;
            ok(true, `Promise ${promise.ID} created: ${promise.stack}`);
        }
        onresolve (promise, value) {
            ok(true, `Promise ${promise.ID} resolved to ${value}`);
        }
        onreject (promise, reason) {
            ok(true, `Promise ${promise.ID} rejected with ${reason}`);
        }
    }
    
    var tracker = new Tracker();
    
    Promise.track(() => {
        Promise.resolve("test")
            .then(x => x + ":")
            .then(x => Promise.reject("rejection"))
            .then(()=>ok(false, "Should not come here"))
            .catch(e => equal(e, "rejection", "Should catch rejection"));
    }, tracker).then(()=>ok(true, "Scope ended"))
      .then(start);
});

asyncTest ("Promise.track chained", ()=>{
    var Promise = Dexie.Promise;
    //Promise._rootExec(()=>{
    var createdPromises = 0,
        createdPromises2 = 0,
        resolvedPromises = 0,
        resolvedPromises2 = 0,
        rejectedPromises = 0,
        rejectedPromises2 = 0;
        
    Promise.track(()=>{
        new Promise(resolve => resolve())
            .then(()=>Promise.track(()=>{
                Promise.PSD.inner = true;
                new Promise(resolve => resolve())
                    .then(x => 3)
                    .then(null, e => "catched")
                    .then(x => {}) 
                }, {
                    oncreate: p => ++createdPromises2,
                    onresolve: p => ++resolvedPromises2,
                    onreject: p => ++rejectedPromises2
                })
        );
    }, {
        oncreate: p => (p.ID = ++createdPromises) &&
            ok(true, `Promise ${p.ID} created: ${p.stack}`),
        onresolve: p => ++resolvedPromises,
        onreject: p => ++rejectedPromises
    }).then(()=>{
        equal(createdPromises2, 4, "Should be 4 promises in inner scope");
        equal(resolvedPromises2, 4, "Should be 4 resolved promises in inner scope");
        equal(rejectedPromises2 + resolvedPromises2, createdPromises2, "created and (rejected + resolved) must be same");
        equal(createdPromises, 7, "Should be 7 promises in outmost scope");
        start();
    });
    //});
});

asyncTest("Promise.on.error should propagate once", 1, function(){
    var Promise = Dexie.Promise;
    function logErr (e) {
        ok(true, e);
        return false;
    }
    Promise.on('error', logErr);
    var p = new Promise((resolve, reject)=>{
        reject("apa");
    }).finally(()=>{

    }).finally(()=>{

    });
    var p2 = p.finally(()=>{});
    var p3 = p.then(()=>{});
    var p4 = p.then(()=>{

    }).then(()=>{

    });
    Promise.all([p, p2, p3, p4]).finally(()=>{
        setTimeout(()=>{
            Promise.on('error').unsubscribe(logErr);
            start();
        }, 1);
    });
});

asyncTest("Promise.on.error should not propagate if catched after finally", 1, function(){
    var Promise = Dexie.Promise;
    function logErr (e) {
        ok(false, "Should already be catched:" + e);
    }
    Promise.on('error', logErr);
    var p = new Promise((resolve, reject)=>{
        reject("apa");
    }).finally(()=>{

    }).finally(()=>{

    }).catch(e => {
        ok(true, "Catching it here: " + e);
    });

    var p2 = p.finally(()=>{});
    var p3 = p.then(()=>{});
    var p4 = p.then(()=>{

    }).then(()=>{

    });

    Promise.all([p, p2, p3, p4]).finally(()=>{
        setTimeout(()=>{
            Promise.on('error').unsubscribe(logErr);
            start();
        }, 1);
    });
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

