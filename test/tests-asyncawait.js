import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, spawnedTest} from './dexie-unittest-utils';

"use strict";

const hasNativeAsyncFunctions = false;
try {
    hasNativeAsyncFunctions = !!new Function(`return (async ()=>{})();`)().then;
} catch (e) {}

var db = new Dexie("TestDBTranx");
db.version(1).stores({
    items: "id"
});

module("asyncawait", {
    setup: function () {
        stop();
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    },
    teardown: function () {
    }
});

asyncTest("Should be able to use global Promise within transaction scopes", function(){
    db.transaction('rw', db.items, trans => {
        return window.Promise.resolve().then(()=> {
            ok(Dexie.currentTransaction == trans, "Transaction scopes should persist through Promise.resolve()");
            return db.items.add({ id: "foobar" });
        }).then(()=>{
            return Promise.resolve();
        }).then(()=>{
            ok(Dexie.currentTransaction == trans, "Transaction scopes should persist through Promise.resolve()");
            return db.items.get('foobar');
        });
    }).then (function(foobar){
        equal(foobar.id, 'foobar', "Transaction should have lived throughout the Promise.resolve() chain");
    }).catch (e => {
        ok(false, `Error: ${e.stack || e}`);
    }).finally(start);
});

asyncTest("Should be able to use native async await", function() {
    Promise.resolve().then(()=>{
        let f = new Function('ok','equal', 'Dexie', 'db', `return db.transaction('rw', db.items, async ()=>{
            let trans = Dexie.currentTransaction;
            ok(!!trans, "Should have a current transaction");
            await db.items.add({id: 'foo'});
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of Dexie.Promise");
            await window.Promise.resolve();
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of global Promise");
            await 3;
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of primitive(!)");
            await db.transaction('r', db.items, async innerTrans => {
                ok(!!innerTrans, "SHould have inner transaction");
                equal(Dexie.currentTransaction, innerTrans, "Inner transaction should be there");
                equal(innerTrans.parent, trans, "Parent transaction should be correct");
                let x = await db.items.get(1);
                ok(Dexie.currentTransaction === innerTrans, "Transaction persisted in inner transaction");
                console.log(">>Last line in sub transaction");
            });
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of sub transaction");
            await (async ()=>{
                return await db.items.get(1);
            })();
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of async function");
            await (async ()=>{
                await Promise.all([db.transaction('r', db.items, async() => {
                    await db.items.get(1);
                    await db.items.get(2);
                }), db.transaction('r', db.items, async() => {
                    return await db.items.get(1);
                })]);
            })();
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of async function 2");

            await window.Promise.resolve().then(()=>{
                ok(Dexie.currentTransaction === trans, "Transaction persisted after window.Promise.resolve().then()");
                return (async ()=>{})(); // Resolve with native promise
            }).then(()=>{
                ok(Dexie.currentTransaction === trans, "Transaction persisted after native promise completion");
                return window.Promise.resolve();
            }).then(()=>{
                ok(Dexie.currentTransaction === trans, "Transaction persisted after window.Promise.resolve().then()");
                return (async ()=>{})();
            });
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of mixed promises");
            
            try {
                let foo = await db.items.get('foo');
                ok(true, "YOUR BROWSER HAS COMPATIBILITY BETWEEN NATIVE PROMISES AND INDEXEDDB!");
            } catch (e) {
                ok(true, "Browser has no compatibility between native promises and indexedDB.");
            }
        })`);
        return f(ok, equal, Dexie, db);
    }).catch(e => {
        if (hasNativeAsyncFunctions)
            ok(false, `Error: ${e.stack || e}`);
        else 
            ok(true, `This browser does not support native async functions`);
    }).then(start);
});

const NativePromise = (()=>{
    try {
        return new Function("return (async ()=>{})().constructor")();
    } catch(e) {
        return window.Promise; 
    }
})();

asyncTest("Must not leak PSD zone", function() {
    ok(Dexie.currentTransaction === null, "Should not have an ongoing transaction to start with");

    function TheAsyncFunction () 
    {
        let trans = Dexie.currentTransaction;
        ok(trans !== null, "Should have a current transaction");
        let otherZonePromise;
        Dexie.ignoreTransaction(()=>{
            ok(Dexie.currentTransaction == null, "No Transaction in this zone");
            function promiseFlow () {
                return NativePromise.resolve().then(()=>{
                    if(Dexie.currentTransaction !== null) ok(false, "PSD zone leaked");
                    return new NativePromise(resolve => NativePromise.resolve().then(resolve));
                });
            };
            otherZonePromise = promiseFlow();
            for (let i=0;i<100;++i) {
                otherZonePromise = otherZonePromise.then(promiseFlow);
            }
        });
        // In parallell with the above 2*100 async tasks are being executed and verified,
        // maintain the transaction zone below:
        return NativePromise.resolve().then(()=> {
            ok(Dexie.currentTransaction === trans, "Still same transaction 1");
            // Make sure native async functions maintains the zone:
            let f = new Function('ok', 'equal', 'Dexie', 'trans','NativePromise',
            `return (async ()=>{
                ok(Dexie.currentTransaction === trans, "Still same transaction 1.1");
                debugger;
                await Promise.resolve();
                ok(Dexie.currentTransaction === trans, "Still same transaction 1.2");
                await Dexie.Promise.resolve();
                ok(Dexie.currentTransaction === trans, "Still same transaction 1.3");
                await window.Promise.resolve();
                ok(Dexie.currentTransaction === trans, "Still same transaction 1.4");
            })()`);
            return f(ok, equal, Dexie, trans, NativePromise);
        }).catch (e => {
            // Could not test native async functions in this browser.
            if (hasNativeAsyncFunctions)
                ok(false, `Error: ${e.stack || e}`);
            else 
                ok(true, `This browser does not support native async functions`);
        }).then(()=>{
            // NativePromise
            ok(Dexie.currentTransaction === trans, "Still same transaction 2");
            return Promise.resolve();
        }).then(()=>{
            // window.Promise
            ok(Dexie.currentTransaction === trans, "Still same transaction 3");
            return Dexie.Promise.resolve();
        }).then(()=>{
            // Dexie.Promise
            ok(Dexie.currentTransaction === trans, "Still same transaction 4");
            return otherZonePromise; // wait for the foreign zone promise to complete.
        }).then(()=>{
            ok(Dexie.currentTransaction === trans, "Still same transaction 5");
        });
    }
    TheAsyncFunction.isAsync = true;
    debugger;
    db.transaction('rw', db.items, TheAsyncFunction).then(()=>{
        debugger;
    }).catch(e => {
        ok(false, `Error: ${e.stack || e}`);
    }).then(start);
});

spawnedTest("Should use Promise.all where applicable", function* (){
    yield db.transaction('rw', db.items, function* () {
        let x = yield Promise.resolve(3);
        yield db.items.bulkAdd([{id: 'a'}, {id: 'b'}]);
        let all = yield Promise.all([db.items.get('a'), db.items.get('b')]);
        equal (all.length, 2);
        equal (all[0].id, 'a');
        equal (all[1].id, 'b');
        all = yield Promise.all([db.items.get('a'), db.items.get('b')]);
        equal (all.length, 2);
        equal (all[0].id, 'a');
        equal (all[1].id, 'b');
    });
});

spawnedTest("Even when keeping a reference to global Promise, still maintain PSD zone states", function* (){
   let Promise = window.Promise;
   yield db.transaction('rw', db.items, () => {
       var trans = Dexie.currentTransaction;
       ok (trans !== null, "Have a transaction");
       return Promise.resolve().then(()=>{
           ok (Dexie.currentTransaction === trans, "Still have the same current transaction.");
           return Promise.resolve().then(()=>Promise.resolve());
       }).then(()=>{
           ok (Dexie.currentTransaction === trans, "Still have the same current transaction after multiple global.Promise.resolve() calls");
       });
   });
});

spawnedTest ("Sub Transactions with async await", function*() {
    try {
        yield new Function ('equal', 'ok', 'Dexie', 'db', `return (async ()=>{
            await db.items.bulkAdd([{id: 1}, {id:2}, {id: 3}]);
            let result = await db.transaction('rw', db.items, async ()=>{
                let items = await db.items.toArray();
                let numItems = await db.transaction('r', db.items, async ()=>{
                    equal(await db.items.count(), await db.items.count(), "Two awaits of count should equal");
                    equal(await db.items.count(), 3, "Should be 3 items");
                    return await db.items.count();
                });
                let numItems2 = await db.transaction('r', db.items, async ()=>{
                    equal(await db.items.count(), await db.items.count(), "Two awaits of count should equal");
                    equal(await db.items.count(), 3, "Should be 3 items");
                    return await db.items.count();
                });
                equal (numItems, numItems2, "The total two inner transactions should be possible to run after each other");
                return numItems;
            });
            equal (result, 3, "Result should be 3");
        })();`)(equal, ok, Dexie, db);
    } catch (e) {
        ok(e.name === 'SyntaxError', "No support for native async functions in this browser");        
    }
});
