import Dexie from 'dexie';
import {module, test, equal, ok} from 'QUnit';
import {resetDatabase, spawnedTest, promisedTest} from './dexie-unittest-utils';

const hasNativeAsyncFunctions = false;
try {
    hasNativeAsyncFunctions = !!new Function(`return (async ()=>{})();`)().then;
} catch (e) {}

var db = new Dexie("TestDBTranx");
db.version(1).stores({
    items: "id"
});

module("asyncawait", {
    setup: function (assert) {
        let done = assert.async();
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(done);
    },
    teardown: function () {
    }
});

test("Should be able to use global Promise within transaction scopes", function(assert) {
    let done = assert.async();
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
    }).finally(done);
});

test("Should be able to use native async await", function(assert) {
    let done = assert.async();
    Promise.resolve().then(()=>{
        let f = new Function('ok','equal', 'Dexie', 'db', `return db.transaction('rw', db.items, async ()=>{
            let trans = Dexie.currentTransaction;
            ok(!!trans, "Should have a current transaction");
            await db.items.add({id: 'foo'});
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of Dexie.Promise");
            await Dexie.Promise.resolve();
            ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of Dexie.Promise synch");
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
    }).then(done);
});

const NativePromise = (()=>{
    try {
        return new Function("return (async ()=>{})().constructor")();
    } catch(e) {
        return window.Promise; 
    }
})();

test("Must not leak PSD zone", function(assert) {
    let done = assert.async();
    if (!hasNativeAsyncFunctions) {
        ok(true, "Browser doesnt support native async-await");
        done();
        return;
    }
    let F = new Function('ok','equal', 'Dexie', 'db', `
        ok(Dexie.currentTransaction === null, "Should not have an ongoing transaction to start with");
        var trans1, trans2;
        var p1 = db.transaction('r', db.items, async ()=> {
            var trans = trans1 = Dexie.currentTransaction;
            await 3;
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 1.0 - after await 3");
            await 4;
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 1.0 - after await 4");
            await 5;
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 1.0 - after await 5");
            await db.items.get(1);
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 1.1 - after db.items.get(1)");
            await 6;
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 1.1 - after await 6");
            await subFunc(1);
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 1.2 - after async subFunc()");
            await Promise.all([subFunc(11), subFunc(12), subFunc(13)]);
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 1.3 - after Promise.all()");
            await subFunc2_syncResult();
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 1.4 - after async subFunc_syncResult()");
            await Promise.all([subFunc2_syncResult(), subFunc2_syncResult(), subFunc2_syncResult()]);
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 1.5 - after Promise.all(sync results)");
        });
        var p2 = db.transaction('r', db.items, async ()=> {
            var trans = trans2 = Dexie.currentTransaction;
            ok(trans1 !== trans2, "Parallell transactions must be different from each other");
            await 3;
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 2.0 - after await 3");
            await db.items.get(1);
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 2.1 - after db.items.get(1)");
            await subFunc(2);
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 2.2 - after async subFunc()");
            await Promise.all([subFunc(21), subFunc(22), subFunc(23)]);
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 2.3 - after Promise.all()");
            await subFunc2_syncResult();
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 2.4 - after async subFunc_syncResult()");
            await Promise.all([subFunc2_syncResult(), subFunc2_syncResult(), subFunc2_syncResult()]);
            ok(Dexie.currentTransaction === trans, "Should still be in same transaction 2.5 - after Promise.all(sync results)");
        });
        //var p2 = Promise.resolve();
        ok(Dexie.currentTransaction === null, "Should not have an ongoing transaction after transactions");

        async function subFunc(n) {
            await 3;
            let result = await db.items.get(2);
            return result;
        }

        async function subFunc2_syncResult() {
            let result = await 3;
            return result;
        }
        
        return Promise.all([p1, p2]);
    `);
    F(ok, equal, Dexie, db).catch(e => ok(false, e.stack || e)).then(done);
});

test("Must not leak PSD zone2", function(assert) {
    let done = assert.async();
    ok(Dexie.currentTransaction === null, "Should not have an ongoing transaction to start with");
    
    db.transaction('rw', db.items, ()=>{
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
        return Promise.resolve().then(()=> {
            ok(Dexie.currentTransaction === trans, "Still same transaction 1");
            // Make sure native async functions maintains the zone:
            let f = new Function('ok', 'equal', 'Dexie', 'trans','NativePromise', 'db',
            `return (async ()=>{
                ok(Dexie.currentTransaction === trans, "Still same transaction 1.1");
                await Promise.resolve();
                ok(Dexie.currentTransaction === trans, "Still same transaction 1.2");
                await Dexie.Promise.resolve();
                ok(Dexie.currentTransaction === trans, "Still same transaction 1.3");
                await window.Promise.resolve();
                ok(Dexie.currentTransaction === trans, "Still same transaction 1.4");
                await db.items.get(1);
            })()`);
            return f(ok, equal, Dexie, trans, NativePromise, db);
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
    }).catch(e => {
        ok(false, `Error: ${e.stack || e}`);
    }).then(done);
});

test("Should be able to await Promise.all()", (assert) => {
    let done = assert.async();
    if (!hasNativeAsyncFunctions) {
        ok(true, "Browser doesnt support native async-await");
        done();
        return;
    }    
    (new Function('ok', 'equal', 'Dexie', 'db',
    `return db.transaction('r', db.items, async (trans)=>{
        ok(Dexie.currentTransaction === trans, "Correct initial transaction.");
        var promises = [];
        for (var i=0; i<50; ++i) {
            promises.push(subAsync1(trans));
        }
        for (var i=0; i<50; ++i) {
            promises.push(subAsync2(trans));
        }
        await Promise.all(promises);
        ok(Dexie.currentTransaction === trans, "Still same transaction 1 - after await Promise.all([100 promises...]);");
        await Promise.all([1,2,3, db.items.get(2)]);
        ok(Dexie.currentTransaction === trans, "Still same transaction 2 - after Promise.all(1,2,3,db.items.get(2))");
        await db.items.get(1);
        ok(Dexie.currentTransaction === trans, "Still same transaction 3 - after await db.items.get(1);");
        await 3;
        ok(Dexie.currentTransaction === trans, "Still same transaction 4 - after await 3;");
    });

    async function subAsync1 (trans) {
        await 1;
        await 2;
        await 3;
        if (Dexie.currentTransaction !== trans) ok(false, "Not in transaction");
    }

    async function subAsync2 (trans) {
        await 1;
        await 2;
        if (Dexie.currentTransaction !== trans) ok(false, "Not in transaction 2");
        await db.items.get(1);
    }
    `))(ok, equal, Dexie, db)
    .catch(e => {
        ok(false, e.stack || e);
    }).then(done);
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

promisedTest ("Should patch global Promise within transaction scopes but leave them intact outside", async() => {
    ok(Promise !== Dexie.Promise, "At global scope. Promise should not be Dexie.Promise");
    ok(window.Promise !== Dexie.Promise, "At global scope. Promise should not be Dexie.Promise");
    var GlobalPromise = window.Promise;
    await db.transaction('rw', db.items, async() =>{
        ok(Promise === Dexie.Promise, "Within transaction scope, Promise should be Dexie.Promise.");
        ok(window.Promise === Dexie.Promise, "Within transaction scope, window.Promise should be Dexie.Promise.");
        ok(GlobalPromise !== Promise, "Promises are different");
        ok(GlobalPromise.resolve === Promise.resolve, "If holding a reference to the real global promise and doing Promise.resolve() it should be Dexie.Promise.resolve withing transaction scopes")   
        ok(GlobalPromise.reject === Promise.reject, "If holding a reference to the real global promise and doing Promise.reject() it should be Dexie.Promise.reject withing transaction scopes")
        ok(GlobalPromise.all === Promise.all, "If holding a reference to the real global promise and doing Promise.all() it should be Dexie.Promise.all withing transaction scopes")
        ok(GlobalPromise.race === Promise.race, "If holding a reference to the real global promise and doing Promise.race() it should be Dexie.Promise.race withing transaction scopes")
    });
});

promisedTest ("Should be able to use transpiled async await", async () => {
    await db.transaction('rw', db.items, async ()=>{
        let trans = Dexie.currentTransaction;
        ok(!!trans, "Should have a current transaction");
        await db.items.add({id: 'foo'});
        ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of Dexie.Promise");
        await Promise.resolve();
        ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of Promise.resolve()");
        await 3;
        ok(Dexie.currentTransaction === trans, "Transaction persisted after await 3");
        await db.transaction('r', db.items, async (innerTrans) => {
            ok(!!innerTrans, "Should have inner transaction");
            equal(Dexie.currentTransaction, innerTrans, "Inner transaction should be there");
            equal(innerTrans.parent, trans, "Parent transaction should be correct");
            let x = await db.items.get(1);
            ok(Dexie.currentTransaction === innerTrans, "Transaction persisted in inner transaction");
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

        await Promise.resolve().then(()=>{
            ok(Dexie.currentTransaction === trans, "Transaction persisted after window.Promise.resolve().then()");
            return (async ()=>{})(); // Resolve with native promise
        }).then(()=>{
            ok(Dexie.currentTransaction === trans, "Transaction persisted after native promise completion");
            return Promise.resolve();
        }).then(()=>{
            ok(Dexie.currentTransaction === trans, "Transaction persisted after window.Promise.resolve().then()");
            return (async ()=>{})();
        });
        ok(Dexie.currentTransaction === trans, "Transaction persisted between await calls of mixed promises");

    }).catch ('PrematureCommitError', ()=> {
        ok(true, "PROMISE IS INCOMPATIBLE WITH INDEXEDDB (https://github.com/dfahlander/Dexie.js/issues/317). Ignoring test.");
    })
});

promisedTest ("Should be able to use some simpe native async await even without zone echoing ", async () => {
    if (!hasNativeAsyncFunctions) {
        ok(true, "Browser doesnt support native async-await");
        return;
    }    
    await (new Function('ok', 'equal', 'Dexie', 'db',
    `return db.transaction('r', db.items, trans=> (async (trans) => {
        ok(Dexie.currentTransaction === trans, "Correct initial transaction.");
        await Promise.all([1,2,3, db.items.get(2), Promise.resolve()]);
        ok(Dexie.currentTransaction === trans, "Still same transaction 1 - after Promise.all(1,2,3,db.items.get(2))");
        await db.items.get(1);
        ok(Dexie.currentTransaction === trans, "Still same transaction 2 - after await db.items.get(1);");
    })(trans));`))(ok, equal, Dexie, db)
});

const GlobalPromise = window.Promise;
promisedTest ("Should behave outside transactions as well", async () => {
    if (!hasNativeAsyncFunctions) {
        ok(true, "Browser doesnt support native async-await");
        return;
    }    
    await (new Function('ok', 'equal', 'Dexie', 'db', 'GlobalPromise',
    `async function doSomething() {
        ok(!Dexie.currentTransaction, "Should be at global scope.");
        ok(window.Promise !== Dexie.Promise, "window.Promise should be original");
        ok(window.Promise === GlobalPromise, "window.Promise should be original indeed");
        await db.items.get(1);
        ok(!Dexie.currentTransaction, "Should be at global scope.");
        await 3;
        ok(!Dexie.currentTransaction, "Should be at global scope.");
        await db.items.put({id:1, aj: "aj"});
        ok(true, "Could put an item");
        await db.items.update(1, {aj: "oj"});
        ok(true, "Could query an item");
        ok(!Dexie.currentTransaction, "Should be at global scope.");
        await 4;
        ok(!Dexie.currentTransaction, "Should be at global scope.");
    }

    return doSomething();
    `))(ok, equal, Dexie, db, GlobalPromise)
});
