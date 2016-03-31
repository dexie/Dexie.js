/**
 * Created by David on 3/31/2016.
 */
import Dexie from 'dexie';
import {module, stop, start, test, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, supports, spawnedTest} from './dexie-unittest-utils';

let Promise = Dexie.Promise,
    all = Promise.all,
    async = Dexie.async,
    spawn = Dexie.spawn;

var db = new Dexie("TestDBCrudHooks");
db.version(1).stores({
    table1: "id,idx",
    table2: ",idx",
    table3: "++id,idx",
    table4: "++,idx"
});

var opLog = [],
    successLog = [],
    errorLog = [],
    watchSuccess = false,
    watchError = false,
    deliverKey = null,
    deliverModifications = null,
    deliverKey2 = null,
    deliverModifications2 = null,
    opLog2 = [],
    successLog2 = [],
    errorLog2 = [];

function unsubscribeHooks() {
    db.tables.forEach(table => {
        table.hook('creating').unsubscribe(creating2);
        table.hook('creating').unsubscribe(creating1);
        table.hook('updating').unsubscribe(updating1);
        table.hook('updating').unsubscribe(updating2);
        table.hook('deleting').unsubscribe(deleting2);
        table.hook('deleting').unsubscribe(deleting1);
    });
}

function subscrubeHooks() {
    db.tables.forEach(table => {
        table.hook('creating', creating1);
        table.hook('creating', creating2);
        table.hook('updating', updating1);
        table.hook('updating', updating2);
        table.hook('deleting', deleting1);
        table.hook('deleting', deleting2);
    });
}
const reset = async(function* reset () {
    unsubscribeHooks();
    yield all(db.tables.map(table => table.clear()));
    subscrubeHooks();
    opLog = [];
    successLog = [];
    errorLog = [];
    watchSuccess = false;
    watchError = false;
    deliverKey = null;
    deliverModifications = null;
    deliverKey2 = null;
    deliverModifications2 = null;
    opLog2 = [];
    successLog2 = [];
    errorLog2 = [];
});

function creating1 (primKey, obj, transaction) {
    // You may do additional database operations using given transaction object.
    // You may also modify given obj
    // You may set this.onsuccess = function (primKey){}. Called when autoincremented key is known.
    // You may set this.onerror = callback if create operation fails.
    // If returning any value other than undefined, the returned value will be used as primary key
    ok(transaction && transaction === Dexie.currentTransaction, "creating: Dexie.currentTransaction points correctly");
    let op = {
        op: "create",
        key: primKey,
        value: Dexie.deepClone(obj)
    };
    opLog.push(op);

    if (watchSuccess) {
        this.onsuccess = primKey => successLog.push(primKey);
    }
    if (watchError) {
        this.onerror = e => errorLog.push(e);
    }
    if (deliverKey !== null)
        return deliverKey;
}


// Check that chaining several hooks works
function creating2 (primKey, obj, transaction) {
    let op = {
        op: "create",
        key: primKey,
        value: Dexie.deepClone(obj)
    };
    opLog2.push(op);

    if (watchSuccess) {
        this.onsuccess = primKey => successLog2.push(primKey);
    }
    if (watchError) {
        this.onerror = e => errorLog2.push(e);
    }
    if (deliverKey2 !== null)
        return deliverKey2;
}

function updating1 (modifications, primKey, obj, transaction) {
    // You may use transaction to do additional database operations.
    // You may not do any modifications on any of the given arguments.
    // You may set this.onsuccess = callback when update operation completes.
    // You may set this.onerror = callback if update operation fails.
    // If you want to make additional modifications, return another modifications object
    // containing the additional or overridden modifications to make. Any returned
    // object will be merged to the given modifications object.
    ok(transaction && transaction === Dexie.currentTransaction, "updating: Dexie.currentTransaction points correctly");
    let op = {
        op: "update",
        key: primKey,
        mods: Dexie.shallowClone(modifications),
        value: Dexie.deepClone(obj)
    };
    opLog.push(op);

    if (watchSuccess) {
        this.onsuccess = () => successLog.push(undefined);
    }
    if (watchError) {
        this.onerror = e => errorLog.push(e);
    }
    if (deliverModifications) return deliverModifications;
}

// Chaining:
function updating2 (modifications, primKey, obj, transaction) {
    // You may use transaction to do additional database operations.
    // You may not do any modifications on any of the given arguments.
    // You may set this.onsuccess = callback when update operation completes.
    // You may set this.onerror = callback if update operation fails.
    // If you want to make additional modifications, return another modifications object
    // containing the additional or overridden modifications to make. Any returned
    // object will be merged to the given modifications object.
    let op = {
        op: "update",
        key: primKey,
        mods: Dexie.shallowClone(modifications),
        value: Dexie.deepClone(obj)
    };
    opLog2.push(op);

    if (watchSuccess) {
        this.onsuccess = () => successLog2.push(undefined);
    }
    if (watchError) {
        this.onerror = e => errorLog2.push(e);
    }
    if (deliverModifications2) return deliverModifications2;
}

function deleting1 (primKey, obj, transaction) {
    // You may do additional database operations using given transaction object.
    // You may set this.onsuccess = callback when delete operation completes.
    // You may set this.onerror = callback if delete operation fails.
    // Any modification to obj is ignored.
    // Any return value is ignored.
    // throwing exception will make the db operation fail.
    ok(transaction && transaction === Dexie.currentTransaction, "deleting: Dexie.currentTransaction points correctly");
    let op = {
        op: "delete",
        key: primKey,
        value: obj
    };
    opLog.push(op);
    if (watchSuccess) {
        this.onsuccess = () => successLog.push(undefined);
    }
    if (watchError) {
        this.onerror = e => errorLog.push(e);
    }
}

// Chaining:
function deleting2 (primKey, obj, transaction) {
    // You may do additional database operations using given transaction object.
    // You may set this.onsuccess = callback when delete operation completes.
    // You may set this.onerror = callback if delete operation fails.
    // Any modification to obj is ignored.
    // Any return value is ignored.
    // throwing exception will make the db operation fail.
    let op = {
        op: "delete",
        key: primKey,
        value: obj
    };
    opLog2.push(op);
    if (watchSuccess) {
        this.onsuccess = () => successLog2.push(undefined);
    }
    if (watchError) {
        this.onerror = e => errorLog2.push(e);
    }
}

module("crud-hooks", {
    setup: function () {
        stop();
        resetDatabase(db).then(()=>reset()).catch(e => {
            ok(false, "Error resetting database: " + e);
        }).finally(start);
    },
    teardown: function () {
        unsubscribeHooks();
    }
});

const expect = async (function* (expected, modifyer) {
    yield reset();
    yield modifyer();
    equal(JSON.stringify(opLog, null, 2), JSON.stringify(expected, null, 2), "Expected oplog: " + JSON.stringify(expected));
    yield reset();
    watchSuccess = true;
    yield modifyer();
    equal (successLog.length, expected.length, "First hook got success events");
    equal (successLog2.length, expected.length, "Second hook got success events");
    expected.forEach((x, i) => {
        if (x.op === "create" && x.key !== undefined) {
            equal(successLog[i], x.key, "Success events got the correct key");
            equal(successLog2[i], x.key, "Success events got the correct key (2)");
        }
    });

    if (expected.some(x => x.op === "create" && x.key === undefined)) {
        // Test to deliver prim key from both hooks and expect the second hook's key to win.
        yield reset();
        deliverKey = Math.random();
        deliverKey2 = Math.random();
        watchSuccess = true;
        yield modifyer();
        expected.forEach((x, i) => {
            if (x.op === "create" && x.key === undefined) {
                equal(opLog[i].key, expected[i].key, "First hook got expected key delivered");
                equal(opLog2[i].key, deliverKey, "Second hook got key delivered from first hook");
                equal(successLog[i], deliverKey2, "Success event got delivered key from hook2");
                equal(successLog2[i], deliverKey2, "Success event got delivered key from hook2 (2)");
            }
        });
    }

    if (expected.some(x => x.op === "update")) {
        yield reset();
        deliverModifications = {"someProp.someSubProp": "someValue"};
        yield modifyer();
        expected.forEach((x, i) => {
           if (x.op === "update") {
               ok("someProp.someSubProp" in opLog2[i].modifications, "oplog2 got first hook's modifications");
               equal(opLog2[i].value.someProp.someSubProp, "someValue", "oplog2 got first hook's mods into its value");
           }
        });
    }
});

spawnedTest("creating using Table.add()", function*(){
    // Ways to produce CREATEs:
    //  Table.add()
    //  Table.put()
    //  Table.bulkAdd()

    yield expect ([{
        op: "create",
        key: 1,
        value: {id: 1, idx: 11}
    },{
        op: "create",
        key: 2,
        value: {idx: 12}
    },{
        op: "create",
        value: {idx: 13}
    },{
        op: "create",
        value: {idx: 14}
    }], () => db.transaction('rw', db.tables, ()=>{
        db.table1.add({id:1, idx:11});
        db.table2.add({idx:12}, 2);
        db.table3.add({idx:13});
        db.table4.add({idx:14});
    }));
});

spawnedTest("creating using Table.put()", function*(){
    // Ways to produce CREATEs:
    //  Table.add()
    //  Table.put()
    //  Table.bulkAdd()

    yield expect ([{
        op: "create",
        key: 1,
        value: {id: 1, idx: 11}
    },{
        op: "create",
        key: 2,
        value: {idx: 12}
    },{
        op: "create",
        value: {idx: 13}
    },{
        op: "create",
        value: {idx: 14}
    }], () => db.transaction('rw', db.tables, ()=>{
        db.table1.put({id:1, idx:11});
        db.table2.put({idx:12}, 2);
        db.table3.put({idx:13});
        db.table4.put({idx:14});
    }));
});

spawnedTest("creating using Table.bulkAdd()", function*(){
    // Ways to produce CREATEs:
    //  Table.add()
    //  Table.put()
    //  Table.bulkAdd()

    yield expect ([{
        op: "create",
        key: 1,
        value: {id: 1, idx: 11}
    },{
        op: "create",
        key: 2,
        value: {idx: 12}
    },{
        op: "create",
        value: {idx: 13}
    },{
        op: "create",
        value: {idx: 14}
    }], () => db.transaction('rw', db.tables, ()=> {
        db.table1.bulkAdd([{id: 1, idx: 11}]);
        db.table2.bulkAdd([{idx: 12}], [2]);
        db.table3.bulkAdd([{idx: 13}]);
        db.table4.bulkAdd([{idx: 14}]);
    }));
});

/*spawnedTest("updating", function*(){
    // Ways to produce UPDATEs:
    //  Table.put()
    //  Table.update()
    //  Collection.modify()
});

spawnedTest("deleting", function*(){
    // Ways to produce DELETEs:
    //  Table.delete()
    //  Table.clear()
    //  Collection.modify()
    //  Collection.delete()
});
*/
