import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';

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
    Promise.track(()=>{
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

asyncTest("Promise.track", ()=>{
    var Promise = Dexie.Promise;
    class Tracker {
        constructor() {
            this.counter = 0;
        }
        
        onunhandled (promise) {
            ok(false, `Promise was unhandled: ${promise.stack}`);
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
    var createdTasks = 0,
        createdTasks2 = 0,
        completedTasks = 0,
        completedTasks2 = 0,
        unhandleds = [],
        unhandleds2 = [];
        
        
    Promise.track(()=>{
        new Promise(resolve => resolve())
            .then(()=>Promise.track(()=>{
                Promise.PSD.inner = true;
                // Unresolved rejection, where error is undefined
                new Promise((_,reject)=>reject(undefined));
                
                // Chains and rejection
                new Promise(resolve => resolve())
                    .then(x => 3)
                    .then(null, e => "catched")
                    .then(x => {}) 
                    .then(()=>{throw new TypeError("oops");})
                }, {
                    onbeforetask: task => ++createdTasks2,
                    onaftertask: task => ++completedTasks2,
                    onunhandled: (error, promise) => {
                        unhandleds2.push(promise);
                        if (error === undefined) {
                            ok(true, `undefined was unhandled (inner scope): ${promise.stack} `);
                            return false; // Returning false should prevent bubbling to outer scope
                        } else {
                            ok(true, `Promise was unhandled (inner scope): ${error.stack} `);
                            // Don't return - bubble to outer scope.
                        }
                    }
                })
        );
    }, {
        onbeforetask: task => (task.ID = ++createdTasks) &&
            ok(true, `Task ${task.ID} created: ${task.stack || task.p.stack}`),
        onaftertask: task => ++completedTasks &&
            ok(true, `Task ${task.ID} completed: ${task.stack || task.p.stack}`),
        onunhandled: (err,promise) => {
            unhandleds.push(promise);
            ok(true, `Promise was unhandled (outer scope): ${err.stack}`);
            return false; // Returning false should prevent from bubbling to Promise.on.error.
        }
    }).then(()=>{
        equal(unhandleds.length, 1, "Should be on unhandled at outer scope");
        equal(unhandleds2.length, 2, "SHould be 2 unhandleds at inner scope");
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

