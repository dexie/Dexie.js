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
