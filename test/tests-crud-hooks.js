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
    table2: ",&idx",
    table3: "++id,&idx",
    table4: "++,&idx",
    table5: ""
});

var ourTables = [db.table1, db.table2, db.table3, db.table4, db.table5];

var opLog = [],
    successLog = [],
    errorLog = [],
    watchSuccess = false,
    watchError = false,
    deliverKeys = [],
    deliverModifications = null,
    deliverKeys2 = [],
    deliverModifications2 = null,
    opLog2 = [],
    successLog2 = [],
    errorLog2 = [],
    transLog = [];

function unsubscribeHooks() {
    ourTables.forEach(table => {
        table.hook('creating').unsubscribe(creating2);
        table.hook('creating').unsubscribe(creating1);
        table.hook('reading').unsubscribe(reading1);
        table.hook('reading').unsubscribe(reading2);
        table.hook('updating').unsubscribe(updating1);
        table.hook('updating').unsubscribe(updating2);
        table.hook('deleting').unsubscribe(deleting2);
        table.hook('deleting').unsubscribe(deleting1);
    });
}

function subscrubeHooks() {
    ourTables.forEach(table => {
        table.hook('creating', creating1);
        table.hook('creating', creating2);
        table.hook('reading', reading1);
        table.hook('reading', reading2);
        table.hook('updating', updating1);
        table.hook('updating', updating2);
        table.hook('deleting', deleting1);
        table.hook('deleting', deleting2);
    });
}
const reset = async(function* reset () {
    unsubscribeHooks();
    yield all(ourTables.map(table => table.clear()));
    subscrubeHooks();
    opLog = [];
    successLog = [];
    errorLog = [];
    watchSuccess = false;
    watchError = false;
    deliverKeys = [];
    deliverModifications = null;
    deliverKeys2 = [];
    deliverModifications2 = null;
    opLog2 = [];
    successLog2 = [];
    errorLog2 = [];
    transLog = [];
});

/*function stack() {
    if (Error.captureStackTrace) {
        let obj = {};
        Error.captureStackTrace(obj, stack);
        return obj.stack;
    }
    var e = new Error("");
    if (e.stack) return e.stack;
    try{throw e}catch(ex){return ex.stack || "";}
}*/

function nop(){}

function creating1 (primKey, obj, transaction) {
    // You may do additional database operations using given transaction object.
    // You may also modify given obj
    // You may set this.onsuccess = function (primKey){}. Called when autoincremented key is known.
    // You may set this.onerror = callback if create operation fails.
    // If returning any value other than undefined, the returned value will be used as primary key
    transLog.push({trans: transaction, current: Dexie.currentTransaction});
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
    if (deliverKeys[opLog.length-1])
        return deliverKeys[opLog.length-1];
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
    if (deliverKeys2[opLog2.length-1])
        return deliverKeys2[opLog2.length-1];
}

function reading1 (obj) {
    opLog.push({
        op: "read",
        obj: Dexie.deepClone(obj)
    });
    return {theObject: obj};
}

function reading2 (obj) {
    opLog2.push({
        op: "read",
        obj: Dexie.deepClone(obj)
    });
    return obj.theObject;
}

function updating1 (modifications, primKey, obj, transaction) {
    // You may use transaction to do additional database operations.
    // You may not do any modifications on any of the given arguments.
    // You may set this.onsuccess = callback when update operation completes.
    // You may set this.onerror = callback if update operation fails.
    // If you want to make additional modifications, return another modifications object
    // containing the additional or overridden modifications to make. Any returned
    // object will be merged to the given modifications object.
    transLog.push({trans: transaction, current: Dexie.currentTransaction});
    let op = {
        op: "update",
        key: primKey,
        obj: Dexie.deepClone(obj),
        mods: Dexie.shallowClone(modifications),
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
        obj: Dexie.deepClone(obj),
        mods: Dexie.shallowClone(modifications)
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
    transLog.push({trans: transaction, current: Dexie.currentTransaction});
    let op = {
        op: "delete",
        key: primKey,
        obj: obj
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
        obj: obj
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
            ok(false, "Error resetting database: " + e.stack);
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
    ok(transLog.every(x => x.trans && x.current === x.trans), "transaction argument is valid and same as Dexie.currentTransaction");
    yield reset();
    watchSuccess = true;
    watchError = true;
    yield modifyer();
    equal (errorLog.length + errorLog2.length, 0, "No errors should have been registered");
    equal (successLog.length, expected.filter(op => op.op !== 'read').length, "First hook got success events");
    equal (successLog2.length, expected.filter(op => op.op !== 'read').length, "Second hook got success events");
    expected.forEach((x, i) => {
        if (x.op === "create" && x.key !== undefined) {
            equal(successLog[i], x.key, "Success events got the correct key");
            equal(successLog2[i], x.key, "Success events got the correct key (2)");
        }
    });

    if (expected.some(x => x.op === "create" && x.key === undefined)) {
        // Test to deliver prim key from both hooks and expect the second hook's key to win.
        yield reset();
        deliverKeys = expected.map((x,i)=>"Hook1Key"+ i);
        deliverKeys2 = expected.map((x,i)=>"Hook2Key"+ i);
        watchSuccess = true;
        watchError = true;
        yield modifyer();
        equal (errorLog.length + errorLog2.length, 0, "No errors should have been registered");
        expected.forEach((x, i) => {
            if (x.op === "create" && x.key === undefined) {
                equal(opLog[i].key, expected[i].key, "First hook got expected key delivered");
                equal(opLog2[i].key, deliverKeys[i], "Second hook got key delivered from first hook");
                equal(successLog[i], deliverKeys2[i], "Success event got delivered key from hook2");
                equal(successLog2[i], deliverKeys2[i], "Success event got delivered key from hook2 (2)");
            }
        });
    }

    if (expected.some(x => x.op === "update")) {
        yield reset();
        deliverModifications = {"someProp.someSubProp": "someValue"};
        yield modifyer();
        expected.forEach((x, i) => {
           if (x.op === "update") {
               equal(
                   JSON.stringify(opLog[i].obj),
                   JSON.stringify(opLog2[i].obj),
                   "Object has not yet been changed in hook2");
               ok(Object.keys(opLog[i].mods).every(prop =>
                    JSON.stringify(opLog[i].mods[prop]) ===
                    JSON.stringify(opLog2[i].mods[prop])),
                   "All mods that were originally sent to hook1, are also sent to hook2");
               ok("someProp.someSubProp" in opLog2[i].mods, "oplog2 got first hook's additional modifications");
           }
        });
    }
});

const verifyErrorFlows = async (function* (modifyer) {
    yield reset();
    ok(true, "Verifying ERROR flows");
    watchSuccess = true;
    watchError = true;
    yield modifyer();
    equal (opLog.length, opLog2.length, "Number of ops same for hook1 and hook2: " + opLog.length);
    equal (successLog.length + errorLog.length, opLog.length, "Either onerror or onsuccess must have been called for every op. onerror: " +
        errorLog.length + ". onsuccess: " + successLog.length + ". opLog: " + JSON.stringify(opLog));
    equal (successLog2.length + errorLog2.length, opLog2.length, "Either onerror or onsuccess must have been called for every op (hook2). onerror: " +
        errorLog2.length + ". onsuccess: " + successLog2.length+ ". opLog: " + JSON.stringify(opLog2));
});





//
//
//   Tests goes here...
//
//

//
// CREATING hook tests...
//
// Ways to produce CREATEs:
//  Table.add()
//  Table.put()
//  Table.bulkAdd()
//  Table.bulkPut()

spawnedTest("creating using Table.add()", function*() {

    yield expect([{
        op: "create",
        key: 1,
        value: {id: 1, idx: 11}
    }, {
        op: "create",
        key: 2,
        value: {idx: 12}
    }, {
        op: "create",
        value: {idx: 13}
    }, {
        op: "create",
        value: {idx: 14}
    }], () => db.transaction('rw', db.tables, ()=> {
        db.table1.add({id: 1, idx: 11});
        db.table2.add({idx: 12}, 2);
        db.table3.add({idx: 13});
        db.table4.add({idx: 14});
    }));

    yield verifyErrorFlows(()=>db.transaction('rw', db.tables, function* () {
        yield db.table1.add({id: 1}); // success
        yield db.table1.add({id: 1}).catch(nop); // Trigger error event (constraint)
        yield db.table2.add({}, 1); // sucesss
        yield db.table2.add({}, 1).catch(nop); // Trigger error event (constraint)
        yield db.table1.add({id: {}}).catch(nop);// Trigger direct exception (invalid key type)
    }).catch(nop));
});

spawnedTest("creating using Table.put()", function*(){
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

    yield verifyErrorFlows(()=>db.transaction('rw', db.tables, function* () {
        yield db.table3.put({idx: 1}); // success
        yield db.table3.put({idx: 1}).catch(nop); // Trigger error event (constraint)
        yield db.table2.put({}, 1); // sucesss
        yield db.table2.put({}, 1).catch(nop); // Trigger error event (constraint)
        yield db.table3.put({id: {}}).catch(nop);// Trigger direct exception (invalid key type)
    }).catch(nop));
});

spawnedTest("creating using Table.bulkAdd()", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id: 1, idx: 11}
    },{
        op: "create",
        key: 1.2,
        value: {id: 1.2, idx: 11.2}
    },{
        op: "create",
        key: 2,
        value: {idx: 12}
    },{
        op: "create",
        key: 2.2,
        value: {idx: 12.2}
    },{
        op: "create",
        value: {idx: 13}
    },{
        op: "create",
        value: {idx: 13.2}
    },{
        op: "create",
        value: {idx: 14}
    },{
        op: "create",
        value: {idx: 14.2}
    }], () => db.transaction('rw', db.tables, function* () {
        db.table1.bulkAdd([{id: 1, idx: 11},{id: 1.2, idx: 11.2}]);
        db.table2.bulkAdd([{idx: 12},{idx: 12.2}], [2, 2.2]);
        db.table3.bulkAdd([{idx: 13},{idx: 13.2}]);
        db.table4.bulkAdd([{idx: 14},{idx: 14.2}]);
    }));

    yield verifyErrorFlows(()=>db.transaction('rw', db.tables, function* () {
        yield db.table1.bulkAdd([{id:1},{id:1}]).catch(nop); // 1. success, 2. error event.
        yield db.table1.bulkAdd([{id:2},{id:2},{id:3}]).catch(nop); // 1. success, 2. error event., 3. success
        yield db.table2.bulkAdd([{}, {}], [1,1]).catch(nop); // 1. success, 2. error event.
        yield db.table2.bulkAdd([{}, {}, {}], [2,2,3]).catch(nop); // 1. success, 2. error event. 3. success.
        yield db.table1.bulkAdd([{id:{}}]).catch(nop);// Trigger direct exception (invalid key type)
    }).catch(nop));
});

spawnedTest("creating using Table.bulkPut()", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id: 1, idx: 11}
    },{
        op: "create",
        key: 1.2,
        value: {id: 1.2, idx: 11.2}
    },{
        op: "create",
        key: 2,
        value: {idx: 12}
    },{
        op: "create",
        key: 2.2,
        value: {idx: 12.2}
    },{
        op: "create",
        value: {idx: 13}
    },{
        op: "create",
        value: {idx: 13.2}
    },{
        op: "create",
        value: {idx: 14}
    },{
        op: "create",
        value: {idx: 14.2}
    }], () => db.transaction('rw', db.tables, function* () {
        yield db.table1.bulkPut([{id: 1, idx: 11},{id: 1.2, idx: 11.2}]);
        yield db.table2.bulkPut([{idx: 12},{idx: 12.2}], [2, 2.2]);
        yield db.table3.bulkPut([{idx: 13},{idx: 13.2}]);
        yield db.table4.bulkPut([{idx: 14},{idx: 14.2}]);
    }));

    yield verifyErrorFlows(()=>db.transaction('rw', db.tables, function* () {
        yield db.table3.bulkPut([{idx:1},{idx:1}]).catch(nop); // 1. success, 2. error event.
        yield db.table3.bulkPut([{idx:2},{idx:2},{idx:3}]).catch(nop); // 1. success, 2. error event., 3. success
        yield db.table1.bulkPut([{id:{}}]).catch(nop);// Trigger direct exception (invalid key type)
    }).catch(nop));
});

//
// READING hooks test
// Ways to produce READs:
//  Table.get()
//  Collection.toArray()
//  Collection.each()
//  Collection.first()
//  Collection.last()
// But not:
//  Table.filter() / Collection.and()

spawnedTest("reading tests", function* (){
    yield expect([{
        op: "create",
        key: 1,
        value: {foo: "bar"}
    },{
        op: "create",
        key: 2,
        value: {fee: "bore"}
    },{
        op: "read", // toArray() (1)
        obj: {foo: "bar"}
    },{
        op: "read", // toArray() (2)
        obj: {fee: "bore"}
    },{
        op: "read", // reverse.each() (1)
        obj: {fee: "bore"}
    },{
        op: "read", // reverse.each() (2)
        obj: {foo: "bar"}
    },{
        op: "read", // first()
        obj: {foo: "bar"}
    },{
        op: "read", // last()
        obj: {fee: "bore"}
    }], ()=> db.transaction('rw', 'table5', function*(){
        yield db.table5.bulkAdd([{foo: "bar"}, {fee: "bore"}], [1, 2]);
        yield db.table5.toArray();
        yield db.table5.reverse().each(x => {});
        yield db.table5.orderBy(':id').first();
        yield db.table5.orderBy(':id').last();
        yield db.table5.filter(x => false).toArray();
    }));

    let readOps = opLog.filter(o => o.op === 'read'),
        readOps2 = opLog2.filter(o => o.op === 'read');

    ok (readOps.every ((o,i)=>
        JSON.stringify(readOps2[i].obj.theObject) === JSON.stringify(o.obj)),
        "hook2 should have got hook1's return value");

});

//
// UPDATING hooks test
// Ways to produce UPDATEs:
//  Table.put()
//  Table.bulkPut()
//  Table.update()
//  Collection.modify()

spawnedTest("updating using Table.put()", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id:1, address: {city: 'A'}}
    },{
        op: "update",
        key: 1,
        obj: {id:1, address: {city: 'A'}},
        mods: {"address.city": "B"},
    }], ()=>db.transaction('rw', db.tables, function* (){
        db.table1.put({id:1, address: {city: 'A'}}); // create
        db.table1.put({id:1, address: {city: 'B'}}); // update
    }));

    yield verifyErrorFlows(()=>db.transaction('rw', db.tables, function* () {
        yield db.table3.add({id:1, idx:1});
        yield db.table3.put({id:2, idx:1}).catch(nop); // error event (constraint)
        yield db.table3.put({id:{}}).catch(nop); // Trigger direct exception (invalid key type)
    }).catch(nop));
});

spawnedTest("updating using Table.bulkPut()", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id:1, address: {city: 'A'}}
    },{
        op: "update",
        key: 1,
        obj: {id:1, address: {city: 'A'}},
        mods: {"address.city": "B"},
    }], ()=>db.transaction('rw', db.tables, function* (){
        db.table1.put({id:1, address: {city: 'A'}}); // create
        db.table1.put({id:1, address: {city: 'B'}}); // update
    }));

    yield verifyErrorFlows(()=>db.transaction('rw', db.tables, function* () {
        yield db.table4.add({idx:1}, 1);
        yield db.table4.bulkPut([{idx:1}], [2]).catch(nop); // error event (DataError)
        yield db.table3.bulkPut([{}],[{}]).catch(nop); // Trigger direct exception (invalid key type)
    }).catch(nop));
});

spawnedTest("updating using Table.update()", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id:1, address: {city: 'A'}}
    },{
        op: "update",
        key: 1,
        obj: {id:1, address: {city: 'A'}},
        mods: {"address.city": "B"},
    }], ()=>db.transaction('rw', db.tables, function* (){
        yield db.table1.add({id:1, address: {city: 'A'}}); // create
        yield db.table1.update(1, {"address.city": "B"}); // update
    }));

    yield verifyErrorFlows(()=>db.transaction('rw', db.tables, function* () {
        yield db.table3.bulkAdd([{id:1, idx:1},{id:2, idx:2}]);
        yield db.table3.update(1, {idx:2}).catch(nop); // error event (constraint)
        yield db.table3.update(1, 3).catch(nop); // Trigger direct exception?
    }).catch(nop));
});

spawnedTest("updating using Collection.modify()", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id:1, address: {city: 'A'}}
    },{
        op: "update",
        key: 1,
        obj: {id:1, address: {city: 'A'}},
        mods: {"address.city": "B"},
    }], ()=>db.transaction('rw', db.tables, function* (){
        yield db.table1.add({id:1, address: {city: 'A'}}); // create
        yield db.table1.where('id').equals(1).modify({"address.city": "B"}); // update
    }));

    yield verifyErrorFlows(()=>db.transaction('rw', db.tables, function* () {
        yield db.table3.bulkAdd([{id:1, idx:1},{id:2, idx:2}]);
        yield db.table3.where('id').equals(1).modify({idx: 2}).catch(nop); // error event (constraint)
        yield db.table3.where('id').equals(1).modify(()=>{throw "apa";}).catch(nop); // Trigger direct exception
    }).catch(nop));
});

//
// DELETING hook tests
//
// Ways to produce DELETEs:
//  Table.delete(key)
//  Table.bulkDetele(keys)
//  Table.clear()
//  Collection.modify()
//  Collection.delete()

spawnedTest("deleting using Table.delete(key)", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id:1}
    },{
        op: "delete",
        key: 1,
        obj: {id:1}
    }], ()=>db.transaction('rw', db.tables, function* (){
        yield db.table1.add({id:1}); // create
        yield db.table1.delete(1); // delete
    }));

    // No error flows to verify. If anything is ever found, there's no way to make a deletion of it fail.
});

spawnedTest("deleting using Table.bulkDelete(key)", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id:1}
    },{
        op: "delete",
        key: 1,
        obj: {id:1}
    }], ()=>db.transaction('rw', db.tables, function* (){
        yield db.table1.add({id:1}); // create
        yield db.table1.bulkDelete([1]); // delete
    }));

    // No error flows to verify. If anything is ever found, there's no way to make a deletion of it fail.
});

spawnedTest("deleting using Table.clear()", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id:1}
    },{
        op: "delete",
        key: 1,
        obj: {id:1}
    }], ()=>db.transaction('rw', db.tables, function* (){
        yield db.table1.add({id:1}); // create
        yield db.table1.clear(); // delete
    }));
});

spawnedTest("deleting using Table.modify()", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id:1}
    },{
        op: "delete",
        key: 1,
        obj: {id:1}
    }], ()=>db.transaction('rw', db.tables, function* (){
        yield db.table1.add({id:1}); // create
        yield db.table1.where('id').between(0,2).modify(function (){
            delete this.value;
        }); // delete
    }));
});

spawnedTest("deleting using Collection.delete()", function*(){
    yield expect ([{
        op: "create",
        key: 1,
        value: {id:1}
    },{
        op: "delete",
        key: 1,
        obj: {id:1}
    }], ()=>db.transaction('rw', db.tables, function* (){
        yield db.table1.add({id:1}); // create
        yield db.table1.where('id').between(0,2).delete(); // delete
    }));
});
