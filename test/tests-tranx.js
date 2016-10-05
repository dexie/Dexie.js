import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, spawnedTest} from './dexie-unittest-utils';

"use strict";

var db = new Dexie("TestDBTranx");
db.version(1).stores({
    items: "id"
});

module("tranx", {
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
    db.tranx('rw', db.items, trans => {
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
        let f = new Function('ok','equal', 'Dexie', 'db', `return db.tranx('rw', db.items, async ()=>{
            let trans = Dexie.currentTransaction;
            ok(!!trans, "Should have a current transaction");
            await db.items.add({id: 'foo'});
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of Dexie.Promise");
            await window.Promise.resolve();
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of global Promise");
            await (async ()=>{})();
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of native Promise");
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
    ok(Dexie.currentTransaction === null, "Should not have an ongoing transaction to start with")
    let hiddenDiv = document.createElement("div");
    let mutationObserverPromise = new Promise(resolve=>{
        (new MutationObserver(() => {
            ok(Dexie.currentTransaction === null, "Must not leak zones in patched await microtasks");
            resolve();
        })).observe(hiddenDiv, { attributes: true });
    });
    
    db.tranx('rw', db.items, ()=>{
        let trans = Dexie.currentTransaction;
        ok(trans !== null, "Should have a current transaction");
        let otherZonePromise;
        Dexie.ignoreTransaction(()=>{
            ok(Dexie.currentTransaction == null, "No Transaction in this zone");
            function promiseFlow () {
                return NativePromise.resolve().then(()=>{
                    if(Dexie.currentTransaction !== null) ok(false, "PSD zone leaked");
                    return NativePromise.resolve();
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
            let f = new Function('ok', 'equal', 'Dexie', 'trans', 'hiddenDiv', 'mutationObserverPromise','NativePromise',
            `return (async ()=>{
                ok(Dexie.currentTransaction === trans, "Still same transaction 2");
                await NativePromise.resolve();
                ok(Dexie.currentTransaction === trans, "Still same transaction 3");
                await Dexie.Promise.resolve();
                ok(Dexie.currentTransaction === trans, "Still same transaction 4");
                await window.Promise.resolve();
                ok(Dexie.currentTransaction === trans, "Still same transaction 5");
                hiddenDiv.setAttribute('i', '1'); // Trigger mutation observer
                return mutationObserverPromise;
            })()`);
            return f(ok, equal, Dexie, trans, hiddenDiv, mutationObserverPromise, NativePromise);
        }).catch (e => {
            // Could not test native async functions in this browser.
            debugger;
            ok(true, "Native async function not supported in this browser");
        }).then(()=>{
            // NativePromise
            ok(Dexie.currentTransaction === trans, "Still same transaction");
            return Promise.resolve();
        }).then(()=>{
            // window.Promise
            ok(Dexie.currentTransaction === trans, "Still same transaction");
            return Dexie.Promise.resolve();
        }).then(()=>{
            // Dexie.Promise
            ok(Dexie.currentTransaction === trans, "Still same transaction");
            return otherZonePromise; // wait for the foreign zone promise to complete.
        }).then(()=>{
            ok(Dexie.currentTransaction === trans, "Still same transaction");
        });
    }).catch(e => {
        ok(false, `Error: ${e.stack || e}`);
    }).then(start);
});

spawnedTest("Should use Promise.all where applicable", function* (){
   yield db.tranx('rw', db.items, function* () {
       let x = yield Promise.resolve(3);
       yield db.items.bulkAdd([{id: 'a'}, {id: 'b'}]);
       let all = yield Promise.all(db.items.get('a'), db.items.get('b'));
       equal (all.length, 2);
       equal (all[0].id, 'a');
       equal (all[1].id, 'b');
   });
});
