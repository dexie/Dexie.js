import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, deepEqual, ok} from 'QUnit';
import {resetDatabase, spawnedTest, promisedTest} from './dexie-unittest-utils';

const async = Dexie.async;

var db = new Dexie("TestIssuesDB");
db.version(1).stores({
    users: "id,first,last,&username,*&email,*pets",
    keyless: ",name",
    foo: "id",
    bars: "++id,text"
    // If required for your test, add more tables here
});

module("misc", {
    setup: () => {
        stop();
        resetDatabase(db).catch(e => {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    },
    teardown: () => {
    }
});

//
// Misc Tests
//

promisedTest("issue#729", async () => {
    const onConsoleWarn = txt => {
        ok(false, 'console warn happened: ' + txt);
    }
    const warnDescriptor = Object.getOwnPropertyDescriptor(console, 'warn');
    console.warn = onConsoleWarn;
    try {
        await db.foo.bulkPut([{
            id: 1,
            foo: 'foo',
          },{
            id: 2,
            foo: 'bar',
          }
        ]);
    } catch (err) {
        ok(false, "Couldn't populate data: " + err);
    }
    try {
        const f = await db.foo.add({id: 1, foo: "bar"}); // id 1 already exists.
    } catch (err) {
        ok(true, "Got the err:" + err);
    }  
    try {
        const f = await db.foo.get(false); // Invalid key used
    } catch (err) {
        ok(true, "Got the err:" + err);
    }
    try {
        const f = await db.foo.where({id: 1})
            .modify({id: 2, foo: "bar"}); // Changing primary key should fail + id 2 already exists.
    } catch (err) {
        ok(true, "Got the err:" + err);
    }
    if (warnDescriptor) {
        Object.defineProperty(console, 'warn', warnDescriptor);
    } else {
        delete console.warn;
    }
});

asyncTest("Adding object with falsy keys", function () {
    db.keyless.add({ name: "foo" }, 1).then(function (id) {
        equal(id, 1, "Normal case ok - Object with key 1 was successfully added.")
        return db.keyless.add({ name: "bar" }, 0);
    }).then(function (id) {
        equal(id, 0, "Could add a numeric falsy value (0)");
        return db.keyless.add({ name: "foobar" }, "");
    }).then(function (id) {
        equal(id, "", "Could add a string falsy value ('')");
        return db.keyless.put({ name: "bar2" }, 0);
    }).then(function (id) {
        equal(id, 0, "Could put a numeric falsy value (0)");
        return db.keyless.put({ name: "foobar2" }, "");
    }).then(function (id) {
        equal(id, "", "Could put a string falsy value ('')");
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

promisedTest("#770", async () => {
    const dbName = 'TestDB-' + Math.random();
    const db = new Dexie(dbName, {addons: []});
    const runnedVersions = [];
    try {
        db.version(1).stores({ test: 'id' });
        await db.test.put({ id: 1 });
        await db.open();
        db.close();
        db = new Dexie(dbName, {addons: []});
        db.version(1).stores({ test: 'id' });
        db.version(2).stores({ test: 'id' }).upgrade(async t => {
            runnedVersions.push(2);
            const rowsToCopy = await t.test.toArray();
            await Dexie.waitFor((async ()=>{
                const otherDB = new Dexie(dbName + '-another-unrelated-db', {addons: []});
                otherDB.version(1).stores({foo: 'id'});
                await otherDB.open();
                await otherDB.foo.bulkAdd(rowsToCopy);
                otherDB.close();
            })());
        });
        db.version(3).stores({ test: 'id' }).upgrade(t => {
            runnedVersions.push(3);
        });

        await db.open();
        deepEqual(runnedVersions, [2, 3], "Versions 3 did indeed proceed (as well as version 2)");
        const otherDB = new Dexie(dbName + '-another-unrelated-db', {addons: []});
        otherDB.version(1).stores({foo: 'id'});
        const otherDbRows = await otherDB.foo.toArray();
        const origDbRows = await db.test.toArray();
        deepEqual(otherDbRows, origDbRows, "All rows was copied atomically");
        db.close();
        otherDB.close();
    } catch (err) {
        ok(false, "Error " + err);
    } finally {
        await db.delete();
        await new Dexie(dbName + '-another-unrelated-db', {addons: []}).delete();
    }
});

asyncTest("#102 Passing an empty array to anyOf throws exception", async(function* () {
    try {
        let count = yield db.users.where("username").anyOf([]).count();
        equal(count, 0, "Zarro items matched the query anyOf([])");
    } catch (err) {
        ok(false, "Error when calling anyOf([]): " + err);
    } finally {
        start();
    }
}));

spawnedTest("#248 'modifications' object in 'updating' hook can be bizarre", function*() {
    var numCreating = 0,
        numUpdating = 0;
    function CustomDate (realDate) {
        this._year = new Date(realDate).getFullYear();
        this._month = new Date(realDate).getMonth();
        this._day = new Date(realDate).getDate();
        this._millisec = new Date(realDate).getTime();
        //...
    }
    
    function creatingHook (primKey, obj) {
        ++numCreating;
        var date = obj.date;
        if (date && date instanceof CustomDate) {
            obj.date = new Date(date._year, date._month, date._day);
        }
    }
    function updatingHook (modifications, primKey, obj) {
        ++numUpdating;
        var date = modifications.date;
        if (date && date instanceof CustomDate) {
            return {date: new Date(date._year, date._month, date._day)};
        }
    }
    function isDate(obj) {
        // obj instanceof Date does NOT work with Safari when Date are retrieved from IDB.
        return obj.getTime && obj.getDate && obj.getFullYear;
    }
    function readingHook (obj) {
        if (obj.date && isDate(obj.date)) {
            obj.date = new CustomDate(obj.date);
        }
        return obj;
    }
    
    db.foo.hook('creating', creatingHook);
    db.foo.hook('reading', readingHook);
    db.foo.hook('updating', updatingHook);
    var testDate = new CustomDate(new Date(2016, 5, 11));
    equal(testDate._year, 2016, "CustomDate has year 2016");
    equal(testDate._month, 5, "CustomDate has month 5");
    equal(testDate._day, 11, "CustomDate has day 11");
    var testDate2 = new CustomDate(new Date(2016, 5, 12));
    try {
        db.foo.add ({id: 1, date: testDate});
        
        var retrieved = yield db.foo.get(1);
        
        ok(retrieved.date instanceof CustomDate, "Got a CustomDate object when retrieving object");
        equal (retrieved.date._day, 11, "The CustomDate is on day 11");
        db.foo.put ({id: 1, date: testDate2});
        
        retrieved = yield db.foo.get(1);
        
        ok(retrieved.date.constructor === CustomDate, "Got a CustomDate object when retrieving object");
        equal (retrieved.date._day, 12, "The CustomDate is now on day 12");
        
        // Check that hooks has been called expected number of times
        equal(numCreating, 1, "creating hook called once");
        equal(numUpdating, 1, "updating hook called once");
    } finally {
        db.foo.hook('creating').unsubscribe(creatingHook);
        db.foo.hook('reading').unsubscribe(readingHook);
        db.foo.hook('updating').unsubscribe(updatingHook);
    }
});

asyncTest("Issue: Broken Promise rejection #264", 1, function () {
    db.open().then(()=>{
        return db.users.where('id')
            .equals('does-not-exist')
            .first()
    }).then(function(result){
        return Promise.reject(undefined);
    }).catch(function (err) {
        equal(err, undefined, "Should catch the rejection");
    }).then(res => {
        start();
    }).catch(err => {
        start();
    });
});

asyncTest ("#323 @gitawego's post. Should not fail unexpectedly on readonly properties", function(){
    class Foo {
        get synced() { return false;}
    }

    db.foo.mapToClass(Foo);
    
    db.transaction('rw', db.foo, function () {
      db.foo.put({id:1});
      db.foo.where('id').equals(1).modify({
        synced: true
      });
    }).catch (e => {
        ok(false, "Could not update it: " + (e.stack || e));
    }).then (() => {
        ok(true, "Could update it");
        return db.foo.get(1);
    }).then (foo => {
        return db.foo.get(1);        
    }).then (foo=>{
        console.log("Wow, it could get it even though it's mapped to a class that forbids writing that property.");
    }).catch(e => {
        ok(true, `Got error from get: ${e.stack || e}`);
    }).then(() => {
        return db.foo.toArray();
    }).then(array => {
        console.log(`Got array of length: ${array.length}`);
    }).catch(e => {
        ok(true, `Got error from toArray: ${e.stack || e}`);
        return db.foo.each(item => console.log(item));
    }).then(array => {
        console.log(`Could do each`);
    }).catch(e => {
        ok(true, `Got error from each(): ${e.stack || e}`);
        return db.foo.toCollection().sortBy('synced');
    }).then(array => {
        console.log(`Could do sortBy`);
    }).catch(e => {
        ok(true, `Got error from sortBy(): ${e.stack || e}`);
    }).finally(start);
    
});

spawnedTest ("#360 DB unresponsive after multiple Table.update() or Collection.modify()", function* () {
    const NUM_UPDATES = 2000;
    let result = yield db.transaction('rw', db.foo, function* () {
        yield db.foo.put({id: 1, value: 0});
        for (var i=0;i<NUM_UPDATES;++i) {
            db.foo.where('id').equals(1).modify(item => ++item.value);
        }
        return yield db.foo.get(1);
    });
    equal(result.value, NUM_UPDATES, `Should have updated id 1 a ${NUM_UPDATES} times`);
});

spawnedTest ("delByKeyPath not working correctly for arrays", function* () {
    const obj = {deepObject: {someArray: ["a", "b"]}};
    const obj2 = {deepObject: {someArray: ["a", "b", "c"]}};
    const jsonResult = JSON.stringify(obj);
    console.log("jsonResult = ", jsonResult);
    Dexie.delByKeyPath(obj2, "deepObject.someArray.2");
    const jsonResult2 = JSON.stringify(obj2);
    console.log("jsonResult2 = ", jsonResult2);
    equal(jsonResult, jsonResult2, `Should be equal ${jsonResult} ${jsonResult2}`);
});

asyncTest ("#1079 mapToClass", function(){
    class Foo {
    }
    db.foo.mapToClass(Foo);

    db.transaction('rw', db.foo, function () {
        db.foo.put({id:1});
    }).catch(e => {
        ok(true, `Unexpected error from put: ${e.stack || e}`);
    }).then(() => {
        return db.foo.get(1);
    }).then (getResult => {
        ok(getResult instanceof Foo, "Result of get not mapped to class");
    }).catch(e => {
        ok(true, `Unexpected error from get: ${e.stack || e}`);
    }).then(() => {
        return db.foo.bulkGet([1]);
    }).then(bulkGetResult => {
        ok(bulkGetResult.length === 1, `Unexpected array length ${bulkGetResult.length} from bulkGet`);
        ok(bulkGetResult[0] instanceof Foo, "Result of bulkGet not mapped to class");
    }).catch(e => {
        ok(true, `Unexpected error from bulkGet: ${e.stack || e}`);
    }).finally(start);

});

asyncTest("PR #1108", async ()=>{
    const origConsoleWarn = console.warn;
    const warnings = [];
    console.warn = function(msg){warnings.push(msg); return origConsoleWarn.apply(this, arguments)};
    try {
        const DBNAME = "PR1108";
        let db = new Dexie(DBNAME);
        db.version(1).stores({
            foo: "id"
        });
        await db.open();
        ok(!warnings.some(x => /SchemaDiff/.test(x)), `${DBNAME} could be opened without SchemaDiff warnings`);
        db.close();

        // Adding an index without updating version number:
        db = new Dexie(DBNAME);
        db.version(1).stores({
            foo: "id,name"
        });
        warnings = [];
        await db.open();
        ok(warnings.some(x => /SchemaDiff/.test(x)), "Should warn when a new index was declared without incrementing version number");
        db.close();
        warnings = [];

        // Adding a table without updating version number:
        db = new Dexie(DBNAME);
        db.version(1).stores({
            foo: "id",
            bar: ""
        });
        await db.open();
        ok(warnings.some(x => /SchemaDiff/.test(x)), "Should warn when a new table was declared without incrementing version number");
        db.close();
        warnings = [];
    } catch(error) {
        ok(false, error);
    } finally {
        console.warn = origConsoleWarn;
        start();
    }
});

asyncTest("Issue #1112", async ()=>{
    function Bar(text) {
        this.id = undefined;
        this.text = text;
    }

    try {
        // Verify the workaround for that IDB will tread explicit undefined as if key was provided,
        // which is not very compatible with classs fields and typescript.
        const id1 = await db.bars.add(new Bar("hello1"));
        ok(!isNaN(id1), "got a real autoincremented id for my bar using add()");
        const id2 = await db.bars.put(new Bar("hello2"));
        ok(!isNaN(id2), "got a real autoincremented id for my bar using put()");
        const id3 = await db.bars.bulkAdd([new Bar("hello3")]);
        ok(!isNaN(id3), "got a real autoincremented id for my bar using bulkAdd()");
        const id4 = await db.bars.bulkPut([new Bar("hello4")]);
        ok(!isNaN(id4), "got a real autoincremented id for my bar using bulkPut()");

        // Regression: possible to put back an item without anything getting destroyed:
        const bar3 = await db.bars.get(id3);
        equal(bar3.text, "hello3", "Should get the object with text hello3");
        bar3.text = "hello3 modified";
        await db.bars.put(bar3);
        const bar3_2 = await db.bars.get(id3);
        equal(bar3_2.text, "hello3 modified", "Could successfully change a prop and put back.");
    } catch (error) {
        ok(false, error);
    } finally {
        start();
    }
});

asyncTest("Issue #1280 - Don't perform deep-clone workaround when adding non-POJO to auto-incrementing table", async () => {
    try {
        await db.bars.add({ text: "hello1", fooProp: function(){} });
        ok(false, "Expected add() to fail since IDB would fail with DOMError if trying to store a function.");
    } catch (error) {
        ok(true);
    } finally {
        start();
    }
});
