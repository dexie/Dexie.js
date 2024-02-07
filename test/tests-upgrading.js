﻿import Dexie from 'dexie';
import {module, test, equal, ok, deepEqual} from 'QUnit';
import {resetDatabase, supports, promisedTest, isIE, isEdge} from './dexie-unittest-utils';

module("upgrading");

var Promise = Dexie.Promise;

// tests:
// * separate tests with a commented line of --- up to column 80.
// * put test result checking as a then of the relevant db.open call.
// * db.close at the top of a new section.
// another top-level then should indicate another part of the sequence
// of upgrade actions.
// put db.delete() in its own clause.
test("upgrade", (assert) => {
    let done = assert.async();
    // To test:
    // V Start with empty schema
    // V Add indexes
    // V Remove indexes
    // V Specify the changed object stores only
    // V Run an upgrader function
    // V Run a series of upgrader functions (done when creating DB from scratch with ALL version specs and at least two of them have upgrader functions)
    // V Add object store
    // V Remove object store
    // V Reverse order of specifying versions
    // V Delete DB and open it with ALL version specs specified (check it will run in sequence)
    // V Delete DB and open it with all version specs again but in reverse order
    var DBNAME = "Upgrade-test";
    var db = null;
    // Instead of expecting an empty database to have 0 tables, we read
    // how many an empty database has.
    // Reason: Addons may add meta tables.
    var baseNumberOfTables = 0;
    var baseTables = [];

    // Ensure Dexie verno and backing IDB version are as expected.
    function checkVersion(version) {
        equal(db.verno, version, `DB should be version ${version}`);
        equal(db.backendDB().version, version * 10,
              `idb should be version ${version * 10}`);
    }

    // Ensure object store names are as expected.
    function checkObjectStores(expected) {
        // Add baseTables.
        expected = expected.concat(baseTables).sort();
        // Already sorted.
        var idbNames = [].slice.call(db.backendDB().objectStoreNames);
        var dexieNames = db.tables.map(t => t.name).sort();
        deepEqual(dexieNames,
                  expected,
                  "Dexie.tables must match expected.");
        if (supports("deleteObjectStoreAfterRead")) {
            // Special treatment for IE/Edge where Dexie avoids deleting the actual store to avoid a bug.
            // This special treatment in the unit tests may not need to be here if we can work around Dexie issue #1.
            deepEqual(idbNames,
                    expected,
                    "IDB object stores must match expected.");
        }
    }

    function checkTransactionObjectStores(t, expected) {
        // Add baseTables.
        expected = expected.concat(baseTables).sort();
        deepEqual(t.storeNames.slice().sort(),
                  expected,
                  "Transaction stores must match expected.");
    }

    Promise.resolve(() => {
        return Dexie.delete(DBNAME);
    }).then(() => {
        // --------------------------------------------------------------------
        // Test: Empty schema
        db = new Dexie(DBNAME);
        db.version(1).stores({});
        return db.open().then(function () {
            ok(true, "Could create empty database without any schema");
            // Set so add-on tables don't invalidate checks.
            baseNumberOfTables = db.tables.length;
            baseTables = db.tables.map(t => t.name);
        });
    }).then(() => {
        // --------------------------------------------------------------------
        // Test: Adding version.
        db = new Dexie(DBNAME);
        db.version(1).stores({});
        db.version(2).stores({ store1: "++id" });
        return db.open().then(function () {
            ok(true, "Could upgrade to version 2");
            checkVersion(2);
            //equal(db.verno, 2, "DB should be version 2");
            equal(db.table("store1").schema.primKey.name, "id",
                  "Primary key is 'id'");
        });
    }).then(() => {
        db.close();
        // --------------------------------------------------------------------
        // Test: Adding an index to a store
        db = new Dexie(DBNAME);
        db.version(1).stores({});
        db.version(2).stores({ store1: "++id" });
        // Adding the name index
        db.version(3).stores({ store1: "++id,name" });
        return db.open().then(() => {
            ok(true, "Could upgrade to version 3 (adding an index to a store)");
            checkVersion(3);
        });
    }).then(() => {
        // Testing that the added index is working indeed:
        return db.transaction('rw', "store1", function () {
            db.store1.add({ name: "apa" });
            db.store1.where("name").equals("apa").count(function (count) {
                equal(count, 1,
                    "Apa was found by its new index (The newly added index really works!)");
            });
        });
    }).then(() => {
        db.close();
        // --------------------------------------------------------------------
        // Testing:
        //  1. Place latest version first (order should not matter)
        //  2. Removing the 'name' index.
        db = new Dexie(DBNAME);
        db.version(4).stores({ store1: "++id" });
        db.version(3).stores({ store1: "++id,name" });
        db.version(2).stores({ store1: "++id" });
        db.version(1).stores({});
        return db.open().then(() => {
            ok(true, "Could upgrade to version 4 (removing an index)");
            checkVersion(4);
            equal(db.tables[0].schema.indexes.length, 0, "No indexes in schema now when 'name' index was removed");
        });
    }).then(() => {
        db.close();
        // --------------------------------------------------------------------
        // Test: Running an upgrader function.
        db = new Dexie(DBNAME);
        var upgraders = 0;
        // (Need not to specify earlier versions than 4 because 'I have no users out there running on version below 4'.)
        db.version(4).stores({ store1: "++id" });
        db.version(5).stores({ store1: "++id,&email" }).upgrade(function (trans) {
            upgraders++;
            var counter = 0;
            db.store1.toCollection().modify(function (obj) {
                // Since we have a new primary key we must make sure it's unique on all objects
                obj.email = "user" + (++counter) +"@abc.com";
            });
        });
        return db.open().then(() => {
            ok(true, "Could upgrade to version 5 where an upgrader function was applied");
            checkVersion(5);
            equal(upgraders, 1, "1 upgrade function should have run.");
        });
    }).then(() => {
        return db.table("store1").toArray().then(array => {
            equal(array.length, 1,
                "We still have the object created in version 3 there");
            equal(array[0].email, "user1@abc.com", "The object got its upgrade function running");
            equal(array[0].id, 1, "The object still has the same primary key");
            equal(array[0].name, "apa", "The object still has the name 'apa' that was given to it when it was created");
        });
    }).then(() => {
        db.close();
        // --------------------------------------------------------------------
        // Test: Changing a property of an index
        db = new Dexie(DBNAME);
        db.version(5).stores({ store1: "++id,&email" });
        // Changing email index from unique to multi-valued
        db.version(6).stores({ store1: "++id,*email" }).upgrade(t => {
            t.table("store1").toCollection().modify(obj => {
                // Turning single-valued unique email into an array of
                // emails.
                obj.email = [obj.email];
            });
        }); 
        return db.open().then(() => {
            ok(true, "Could upgrade to version 6");
            checkVersion(6);
            checkObjectStores(["store1"]);
        });
    }).then(() => {
        return db.table('store1').get(1, function (apaUser) {
            ok(Array.isArray(apaUser.email), "email is now an array");
            equal(apaUser.email[0], "user1@abc.com", "First email is user1@abc.com");
        });
    }).then(() => {
        // Test that it is now ok to add two different users with the same email, since we have removed the uniqueness requirement of the index
        return db.table('store1').add({ name: "apa2", email: ["user1@abc.com"] });
    }).then(() => {
        return db.table('store1').toArray().then(array => {
            equal(array.length, 2, "There are now two users in db");
            equal(array[0].email[0], array[1].email[0], "The two users share the same email value");
        });
    }).then((array) => {
        db.close();
        // --------------------------------------------------------------------
        // Test: Only changed object stores need to be specified.
        db = new Dexie(DBNAME);
        // No need to specify an upgrade function when we know it's not
        // gonna run (we are already on ver 5)
        db.version(6).stores({ store1: "++id,*email" });
        db.version(7).stores({ store2: "uuid" });
        return db.open().then(() => {
            ok(true, "Could upgrade to version 7");
            checkVersion(7);
            checkObjectStores(["store1", "store2"]);
        });
    }).then(() => {
        db.close();
        // --------------------------------------------------------------------
        // Test: Object store removal.
        db = new Dexie(DBNAME);
        // Need to keep version 6 or add its missing stores to version 7,
        // 7. Choosing to keep version 6.
        db.version(6).stores({ store1: "++id,*email" });
        db.version(7).stores({ store2: "uuid" });
        // Deleting a version.
        db.version(8).stores({store1: null });
        return db.open().then(() => {
            ok(true, "Could upgrade to version 8 - deleting an object store");
            checkVersion(8);
            checkObjectStores(["store2"]);
        });
    }).then(() => {
        // --------------------------------------------------------------------
        // Test: Use a removed object store while running an upgrade function.
        /*db = new Dexie(DBNAME);
        db.version(7).stores({ store2: "uuid" });
        db.version(8).stores({ store1: null });
        db.version(9).stores({ store1: "++id,email" });
        db.version(10).stores({ store1: null }).upgrade(t => {
            checkTransactionObjectStores(t, ["store1"]);
            // TODO: actually use the object store.
            ok(true, "Upgrade transaction contains deleted store.");
        });
        return db.open().then(() => {
            ok(true, "Could upgrade to version 10 - deleting an object store with upgrade function");
            checkVersion(10);
            checkObjectStores(["store2"]);
        });*/
    }).then(() => {
        // Reset.
        return db.delete();
    }).then(() => {
        // --------------------------------------------------------------------
        // Test:
        // 1. Upgrade transactions should have the correct object
        //    stores available. (future version)
        db = new Dexie(DBNAME);
        
        db.version(1).stores({
            store1: "++id,name"
        });
        return db.open().then(() => {
            // Populate db.
            return db.store1.put({ name: "A B" });
        });
    }).then(() => {
        db.close();
        // Add upgrade functions.
        // Track number of upgrade functions run.
        var upgraders = 0;
        db.version(2).stores({
            store2: "++id,firstname,lastname"
        }).upgrade(t => {
            /*checkTransactionObjectStores(t,
                ["store1", "store2"]);*/
            ok(true, "Upgrade transaction has stores deleted later.");
            upgraders++;
            // TODO: copy value to store2.
        });
        db.version(3).stores({
            store1: null,
            store3: "++id"
        }).upgrade(t => {
            /*checkTransactionObjectStores(t,
                ["store1", "store2", "store3"]);*/
            upgraders++;
            // TODO: Add some value to store3.
        });
        return db.open().then(() => {
            checkVersion(3);
            equal(upgraders, 2, "2 upgrade functions should have run.");
            checkObjectStores(["store2", "store3"]);
            // TODO: Check that the data is as-expected.
        });
    }).then(() => {
        return db.delete();
    }).then(() => {
        // --------------------------------------------------------------------
        // Test: Dexie identifies the correct table name and schema given a
        // sequence of versions to go through.
        db = new Dexie(DBNAME);
        db.version(1).stores({});
        db.version(2).stores({ store1: "++id" });
        // Adding the name index
        db.version(3).stores({ store1: "++id,name" });
        db.version(4).stores({ store1: "++id" });
        db.version(5).stores({ store1: "++id,&email" }).upgrade(t => {
            var counter = 0;
            t.table("store1").toCollection().modify(obj => {
                // Since we have a new primary key we must make sure
                // it's unique on all objects
                obj.email = "user" + (++counter) + "@abc.com";
            });
        });
        // Changing email index from unique to multi-valued
        db.version(6).stores({ store1: "++id,*email" }).upgrade(t => {
            t.table("store1").toCollection().modify(obj => {
                // Turning single-valued unique email into an array of
                // emails.
                obj.email = [obj.email];
            });
        });
        db.version(7).stores({ store2: "uuid" });
        db.version(8).stores({ store1: null });
        return db.open().then(() => {
            ok(true, "Could create new database");
            checkVersion(8);
            checkObjectStores(["store2"]);
            equal(db.table("store2").schema.primKey.name, "uuid", "The prim key is uuid");
        });
    }).then(() => {
        return db.delete();
    }).then(() => {
        // --------------------------------------------------------------------
        // Test: Order of version declaration should not matter.
        db = new Dexie(DBNAME);
        db.version(8).stores({ store1: null });
        db.version(7).stores({ store2: "uuid" });
        db.version(6).stores({ store1: "++id,*email" }).upgrade(function () { // Changing email index from unique to multi-valued
            db.store1.toCollection().modify(function (obj) {
                obj.email = [obj.email]; // Turning single-valued unique email into an array of emails.
            });
        });
        db.version(5).stores({ store1: "++id,&email" }).upgrade(function () {
            var counter = 0;
            db.store1.toCollection().modify(function (obj) {
                // Since we have a new primary key we must make sure it's unique on all objects
                obj.email = "user" + (++counter) + "@abc.com";
            });
        });
        db.version(4).stores({ store1: "++id" });
        db.version(3).stores({ store1: "++id,name" }); // Adding the name index
        db.version(2).stores({ store1: "++id" });
        db.version(1).stores({});
        return db.open().then(() => {
            ok(true, "Could create new database");
            checkVersion(8);
            checkObjectStores(["store2"]);
            equal(db.table("store2").schema.primKey.name, "uuid", "The prim key is uuid");
        });
    }).catch((err) => {
        ok(false, "Error: " + err);
    }).finally(() => {
        if (db) db.close();
        Dexie.delete(DBNAME).then(done);
    });
});

test("Issue #30 - Problem with existing db", (assert) => {
    let done = assert.async();
    if (!supports("compound+multiEntry")) {
        ok(true, "SKIPPED - COMPOUND + MULTIENTRY UNSUPPORTED");
        return done();
    }
    ///<var type="Dexie" />
    var db; // Will be used as a migrated version of the db.

    // Start by deleting the db if it exists:
    Dexie.delete("raw-db").then(function () {

        // Create a bare-bone indexedDB database with custom indexes of various kinds.
        return new Dexie.Promise(function (resolve, reject) {
            var indexedDB = Dexie.dependencies.indexedDB;
            var rawdb, req;

            function error(e) {
                if (rawdb) rawdb.close();
                reject(e.target.error);
            }

            req = indexedDB.open("raw-db", 2);
            req.onupgradeneeded = function (ev) {
                try {
                    console.log("onupgradeneeded called");
                    rawdb = req.result;
                    // Stores
                    var people = rawdb.createObjectStore("people", {keyPath: "_id", autoIncrement: false});
                    var messages = rawdb.createObjectStore("messages", {autoIncrement: true});
                    var umbrellas = rawdb.createObjectStore("umbrellas", {keyPath: ["date", "time"]});
                    // Indexes:
                    messages.createIndex("text_index", "text", {unique: false, multiEntry: false});
                    messages.createIndex("words_index", "words", {unique: false, multiEntry: true});
                    messages.createIndex("id_index", "id", {unique: true, multiEntry: false});
                    umbrellas.createIndex("size_color_index", ["size", "color"], {
                        unique: false,
                        multiEntry: false
                    });
                    // Data:
                    people.add({_id: "9AF56447-66CE-470A-A70F-674A32EF2D51", name: "Kalle"});
                    messages.add({text: "Here is a text", words: ["here", "is", "a", "text"], id: 1});
                    umbrellas.add({
                        date: "2014-11-20",
                        time: "22:18",
                        size: 98,
                        color: "pink",
                        name: "My Fine Umbrella!"
                    });
                } catch (ex) {
                    if (rawdb) rawdb.close();
                    reject(ex);
                }
            }
            req.onsuccess = function () {
                console.log("onsuccess called");
                rawdb = req.result;

                rawdb.close();

                resolve();
            };
            req.onerror = error;
        });
    }).then(function () {
        // Try open the database using Dexie:
        db = new Dexie("raw-db", {addons: []}); // Explicitely don't use addons here. Syncable would fail to open an existing db.
        db.version(0.2).stores({
            people: "_id",
            messages: "++,text,*words,&id",
            umbrellas: "[date+time],[size+color]"
        });
        return db.open();
    }).then(function () {
        // Verify "people" data
        return db.people.toArray(function (people) {
            equal(people.length, 1, "One person in people");
            equal(people[0].name, "Kalle", "The persons' name is Kalle");
        });
    }).then(function () {
        // Verify "messages" data
        return db.messages.toArray(function (messages) {
            equal(messages.length, 1, "One message in messages");
            equal(messages[0].text, "Here is a text", "The message has the correct text");
            equal(messages[0].words.length, 4, "The message has 4 words");
        });
    }).then(function () {
        // Verify "umbrellas" data
        return db.umbrellas.toArray(function (umbrellas) {
            equal(umbrellas.length, 1, "One umbrella in umbrellas");
            equal(umbrellas[0].name, "My Fine Umbrella!", "The umbrella has the correct name");
            equal(umbrellas[0].date, "2014-11-20", "The umbrella has the correct date");
            equal(umbrellas[0].time, "22:18", "The umbrella has the correct time");
            equal(umbrellas[0].size, 98, "The umbrella has the currect size");
            equal(umbrellas[0].color, "pink", "The umbrella has the correct color");
        });
    }).then(function () {
        // Test messages indexes
        return db.messages.orderBy("text").first(function (message) {
            ok(!!message, "Could find a message when iterating the 'text' index");
        });
    }).then(function () {
        // Test words index
        return db.messages.where("words").equals("is").first(function (message) {
            ok(!!message, "Could find a message when querying the 'words' index");
        });
    }).then(function () {
        // Test id index
        return db.messages.where("id").equals(1).count(function (count) {
            equal(count, 1, "Could count id's");
        });
    }).then(function () {
        // Test umbrella compound primary key
        return db.umbrellas.get(["2014-11-20", "22:18"], function (umbrella) {
            ok(!!umbrella, "Umbrella was found by compound primary key");
            equal(umbrella.color, "pink", "Umbrella has the correct color");
        });
    }).then(function () {
        // Test umbrella compound index
        return db.umbrellas.where("[size+color]").above([98, "pina"]).count(function (count) {
            equal(count, 1, "Could count umbrellas based on a query on compound index");
        });
    }).then(function () {
        // Now, let's upgrade the migrated database
        db.close();
        db = new Dexie("raw-db");
        // First, as required with Dexie so far, specify the existing stores:
        db.version(0.2).stores({
            people: "_id",
            messages: "++,text,words,id,[size+color]",
            umbrellas: "[date+time],[size+color]"
        });
        // Then, add the 'name' index to people:
        db.version(3).stores({
            people: "_id,name"
        });
        return db.open();
    }).then(function () {
        // Now test the new name index:
        return db.people.where("name").equalsIgnoreCase("kalle").first();
    }).then(function (kalle) {
        ok(!!kalle, "Could find at least one object by its name index");
        equal(kalle.name, "Kalle", "The found object was Kalle indeed");
    }).catch(function (err) {
        ok(false, "Error: " + err);
    }).finally(function () {
        if (db) db.close();
        Dexie.delete("raw-db").then(done);
    });
});

promisedTest("Issue #713 - how to change table name", async ()=> {
    await Dexie.delete("issue713");
    const db = new Dexie('issue713');
    try {
        db.version(1).stores({
            friends: '++id, name, age'
        });
        await db.friends.bulkAdd([
            {name: "Foo", age: 25},
            {name: "Bar", age: 75}
        ]);
        db.close();
        const db2 = new Dexie('issue713');
        db2.version(1).stores({
            friends: '++id, name, age'
        });
        db2.version(2).stores({
            friends2: 'id, name, age'
        }).upgrade(tx=>{
            return tx.friends.toArray().then(objs => {
                return tx.friends2.bulkAdd(objs);
            });
        });
        db2.version(3).stores({
            friends: null
        });
        const result = await db2.friends2.toArray();
        equal(result.length, 2, "Should get 2 friends");
        equal(result[0].name, "Foo", "First friend is 'Foo'");
        equal(result[1].name, "Bar", "First friend is 'Bar'");
    } finally {
        await db.delete();   
    }
});

promisedTest("Issue #713 - how to change table name (short)", async ()=> {
    await Dexie.delete("issue713Short");
    const db = new Dexie('issue713Short');
    try {
        db.version(1).stores({
            friends: '++id, name, age'
        });
        await db.friends.bulkAdd([
            {name: "Foo", age: 25},
            {name: "Bar", age: 75}
        ]);
        db.close();
        const db2 = new Dexie('issue713Short');
        db2.version(1).stores({
            friends: '++id, name, age'
        });
        db2.version(2).stores({
            friends2: 'id, name, age',
            friends: null // delete after upgrader
        }).upgrade(tx=>{
            return tx.friends.toArray().then(objs => {
                return tx.friends2.bulkAdd(objs);
            });
        });
        const result = await db2.friends2.toArray();
        equal(result.length, 2, "Should get 2 friends");
        equal(result[0].name, "Foo", "First friend is 'Foo'");
        equal(result[1].name, "Bar", "First friend is 'Bar'");
    } finally {
        await db.delete();
    }
});

promisedTest("Changing primary key", async ()=> {
    if (isIE || isEdge) {
        ok(true, "Skipping this test for IE and Edge - it has a bug that prevents it from renaming a table");
        return;
    }

    await Dexie.delete("changePrimKey");

    // First, create the initial version of the DB, populate some data, and then close it.
    let db = new Dexie("changePrimKey");
    db.version(1).stores({
        foos: '++id'
    });
    await db.foos.bulkAdd([{name: "Hola"}, {name: "Hello"}]);
    db.close();

    // To change primary key, let's start by copying the table
    // and then deleting and recreating the original table
    // to copy it back again
    db = new Dexie("changePrimKey");
    db.version(1).stores({
        foos: '++id'
    });

    // Add version 2 that copies the data to foos2
    db.version(2).stores({
        foos2: 'objId'
    }).upgrade(async tx => {
        const foos = await tx.foos.toArray();
        await tx.foos2.bulkAdd(foos.map(foo => ({
            objId: "obj:"+foo.id,
            hello: foo.name
        })));
    });

    // Add version 3 that deletes old "foos"
    db.version(3).stores({
        foos: null
    });

    // Add version 4 that recreates "foos" with wanted primary key
    // and do the copying again
    db.version(4).stores({
        foos: 'objId, hello'
    }).upgrade(async tx => {
        const foos = await tx.foos2.toArray();
        await tx.foos.bulkAdd(foos);
    });

    // Finally delete the temp table
    db.version(5).stores({
        foos2: null
    });

    // Now, verify we have what we expect
    const foos = await db.foos.toArray();
    equal(foos.length, 2, "Should have 2 rows");
    equal(foos[0].objId, "obj:1", "A primary key with an object ID 1 is there");
    equal(foos[1].objId, "obj:2", "A primary key with an object ID 2 is there");
    // Verify we can use the new index as well
    const foo2 = await db.foos.get({hello: "Hello"});
    ok(foo2 != null, "Should get a match");
    equal(foo2.objId, "obj:2", "The expected ID was returned");
});

promisedTest("Changing primary key (short)", async ()=> {
    if (isIE || isEdge) {
        ok(true, "Skipping this test for IE and Edge - it has a bug that prevents it from renaming a table");
        return;
    }

    await Dexie.delete("changePrimKeyShort");

    // First, create the initial version of the DB, populate some data, and then close it.
    let db = new Dexie("changePrimKeyShort");
    db.version(1).stores({
        foos: '++id'
    });
    await db.foos.bulkAdd([{name: "Hola"}, {name: "Hello"}]);
    db.close();

    // To change primary key, let's start by copying the table
    // and then deleting and recreating the original table
    // to copy it back again
    db = new Dexie("changePrimKeyShort");
    db.version(1).stores({
        foos: '++id'
    });

    // Add version 2 that copies the data to foos2
    db.version(2).stores({
        foos: null, // delete after upgrader
        foos2: 'objId'
    }).upgrade(async tx => {
        const foos = await tx.foos.toArray();
        await tx.foos2.bulkAdd(foos.map(foo => ({
            objId: "obj:"+foo.id,
            hello: foo.name
        })));
    });

    // Add version 3 that recreates "foos" with wanted primary key
    // and do the copying again
    db.version(3).stores({
        foos: 'objId, hello',
        foos2: null // delete after upgrader
    }).upgrade(async tx => {
        const foos = await tx.foos2.toArray();
        await tx.foos.bulkAdd(foos);
    });

    // Now, verify we have what we expect
    const foos = await db.foos.toArray();
    equal(foos.length, 2, "Should have 2 rows");
    equal(foos[0].objId, "obj:1", "A primary key with an object ID 1 is there");
    equal(foos[1].objId, "obj:2", "A primary key with an object ID 2 is there");
    // Verify we can use the new index as well
    const foo2 = await db.foos.get({hello: "Hello"});
    ok(foo2 != null, "Should get a match");
    equal(foo2.objId, "obj:2", "The expected ID was returned");
});


promisedTest(
  "Issue 919: Store not found when versions declared in decending order",
  async () => {
    await Dexie.delete("issue919");
    let db = new Dexie("issue919");
    db.version(1).stores({
      friends: "++id,name,age"
    });
    await db.open();
    // succeeds
    ok(true, `Could open v1: ${await db.friends.toArray()}`);
    db.close();

    db = new Dexie("issue919");
    // add a new store, `friends` store remains as before
    db.version(2).stores({
      enemies: "++id,name"
    });
    db.version(1).stores({
      friends: "++id,name,age"
    });

    await db.open();
    // fails with: NotFoundError: `The operation failed because the requested database object could not be found. For example, an object store did not exist but was being opened.`
    ok(true, `Could open version 2: ${await db.friends.toArray()}`);
    await db.delete();
  }
);


promisedTest(
    "PR #959: Dexie should no more require users to keep old versions if they don't attach an upgrader to it",
    async ()=>{
        const DBNAME = "pr959";

        await Dexie.delete(DBNAME);
        let db = new Dexie(DBNAME);
        db.version(1).stores({
            friends: "id"
        });
        await db.open();
        ok(true, "Could open v1");
        await db.friends.add({id: 1, name: "Foo 959"});
        db.close();
        db = new Dexie(DBNAME);
        db.version(2).stores({
            friends: "id, name"
        });
        await db.open();
        ok(true, "Could open v2 without having v1 specified. Name should now be indexed.");
        const foo = await db.friends.where("name").startsWith("Foo").first();
        ok(!!foo, "Could find friend using newly added index");
        equal(foo.id, 1, "Got the right foo here");
        db.close();
    }
);

promisedTest("Issue #959 - Should migrate successfully with an explicit unique modifier of the primary key",
    async () => {
        await Dexie.delete("issue959");
        let db = new Dexie("issue959");

        db.version(1).stores({
            friends: "&name, age"
        });
        await db.friends.bulkAdd([
            { name: "Foo", age: 25, weight: 70 },
            { name: "Bar", age: 75, weight: 100 }
        ]);
        db.close();
    
        db = new Dexie("issue959");
        db.version(1).stores({
            friends: "&name, age"
        });
        db.version(2).stores({
            friends: "&name, age, weight"
        });

        // Now, verify we have what we expect
        const result = await db.friends.orderBy("age").toArray();
        equal(result.length, 2, "Should get 2 friends");
        equal(result[0].name, "Foo", "First friend is 'Foo'");
        equal(result[1].name, "Bar", "First friend is 'Bar'");
        // Verify we can use the new index as well
        const result2 = await db.friends.get({ weight: 100 });
        ok(result2 != null, "Should get a match");
        equal(result2.name, "Bar", "The expected friends was returned");
    }
);


promisedTest(
  "Issue 1145 - Regression: SchemaError during version upgrade",
  async () => {
    const DBNAME = "issue1145";
    await Dexie.delete(DBNAME);
    const db = new Dexie(DBNAME);
    db.version(1).stores({ Y: "id" });
    await db.open();
    await db.close();
    db.version(2).upgrade((trans) => {
      ok(true, "Starting version 2 upgrade.");
      return trans.Y.count();
    });
    db.version(3).stores({
      Y: "id,X",
    });
    db.version(4).upgrade((trans) => {
      ok(true, "Starting version 4 upgrade.");
      return trans.Y.where("X").equals("value").toArray();
    });

    try {
      await db.open();
      ok(true, "Open successful");
    } catch (e) {
      ok(false, "Open Failed:: " + e);
    } finally {
      await db.delete();
    }
  }
);


promisedTest(
    "Issue 1418 - Not deleting all object stores",
    async () => {
      if (!supports("deleteObjectStoreAfterRead")) {
        ok(true, "Skipping this test - buggy browser.");
        return;
      }
      if (Dexie.addons.length > 0) {
        ok(true, "Skipping this test - default addons are acitve and can add more object stores");
        return;
      }
      const DBNAME = "issue1418";
      await Dexie.delete(DBNAME);
      let db = new Dexie(DBNAME);
      db.version(1).stores({
        a: '++',
        b: '++',
        c: '++',
        d: '++',
        e: '++'          
      });
      await db.open();
      equal(db.idbdb.objectStoreNames.length, 5, "There are 5 object stores");
      db.close();

      db = new Dexie(DBNAME);
      db.version(2).stores({
        a: null,
        b: null,
        c: null,
        d: null,
        e: '++'
      });
      await db.open();
      equal(db.idbdb.objectStoreNames.length, 1, "There is only one object store now");
      db.close();
      await Dexie.delete(DBNAME);
    }
  );
    
  promisedTest(
    "Dexie 4: Should not throw VersionError on downgrade",
    async ()=>{
        const DBNAME = "downgradedDB";

        await Dexie.delete(DBNAME);
        let db = new Dexie(DBNAME);
        db.version(2).stores({
            friends: "id, name"
        });
        await db.friends.get(undefined).catch(e => {});
        await db.open();
        ok(true, "Could open v2");
        await db.friends.add({id: 1, name: "Foo 959"});
        db.close();
        db = new Dexie(DBNAME);
        db.version(1).stores({
            friends: "id, age"
        });
        await db.open();
        ok(true, "Could open v1 even though installed version is at verion 2.");
        const friends = await db.friends.toArray();
        equal(friends.length, 1, "Could use the database for querying");
        await db.delete();
    }
);

promisedTest(
    "Dexie 4: It should add indexes and tables also when not incrementing version number",
    async ()=>{
        const DBNAME = "forgettingVerNoIncrease";

        await Dexie.delete(DBNAME);
        let db = new Dexie(DBNAME);
        db.version(1).stores({
            friends: "id"
        });
        await db.open();
        ok(true, "Could open v1 with {friends: 'id'}");
        await db.friends.add({id: 1, name: "Foo 123"});
        db.close();
        db = new Dexie(DBNAME);
        db.version(1).stores({
            friends: "id, name, age",
            pets: 'id, friendId, kind'
        });
        await db.open();
        ok(true, "Could open v1 even though we have added some indexes and a table.");
        await db.friends.add({id: 2, name: "Bar 123", age: 25});
        await db.pets.add({id: 1, friendId: 2, kind: "dog"});
        ok(true, "Could add pets to the new table");
        const pets = await db.pets.toArray();
        const friends = await db.friends.toArray();
        equal(friends.length, 2, "Got the two friends");
        equal(pets.length, 1, "Got the one pet");
        db.close();
    }
);


promisedTest(
    "Dexie 4: It should work having two versions of the DB opened at the same time as long as they have a compatible schema",
    async ()=>{
        if (typeof Dexie.Observable?.version === 'string') {
            ok(true, "Skipping this test - Dexie.Observable bails out when opening two versions of the same database");
            return;
        }
        const DBNAME = "competingDBs";

        await Dexie.delete(DBNAME);
        let db1 = new Dexie(DBNAME);
        db1.version(1).stores({
            friends: "id"
        });
        
        let db2 = new Dexie(DBNAME);
        db2.version(2).stores({
            friends: "id, name, age",
            pets: 'id, friendId, kind'
        })
        await Promise.all(db1.open(), db2.open());
        await db1.friends.add({id: 1, name: "Foo 123"});
        let foo = await db2.friends.where('name').startsWith('Foo').first();
        ok(true, "We could use the 'name' index only declared on db2");
        foo.age = 23;
        await db2.friends.put(foo);
        foo = await db1.friends.get(1);
        equal(foo.age, 23, "We could get the data using db1");

        db1.close();
        db2.close();
        await db1.open();
        await db2.open();

        db1.close();
        db2.close();
        db1.version(1).stores({
            friends: "id, name, age, [name+age]",
            cars: 'id, name'
        });
        await db2.open();
        await db1.open();
        foo = await db1.friends.where('[name+age]').equals(["Foo 123", 23]).first(); // Should be able to use the new index
        equal(foo.age, 23, "We could get the data using db1 and the added index 'name+age' still in v1");
        foo = await db2.friends.get({age: 23}); // Be able to use the age index that db2 declares.
        equal(foo.age, 23, "We could get the data using db2 and the 'name' index");
        const db = await new Dexie(DBNAME).open();
        ok(db.verno < 3, "The database should be at version 2 (or exactly: " + db.verno + ")");

        await Dexie.delete(DBNAME);
    }
);

promisedTest("Dexie 4: An attached upgrader on version 2 and 3 shall run even if version 1 was reused for schema manipulation more than 20 times", async ()=>{
    if (typeof Dexie.Observable?.version === 'string') {
        ok(true, "Skipping this test - Dexie.Observable bails out when database reopen in background");
        return;
    }
    const DBNAME = "attachedUpgrader";
    const NUM_SCHEMA_CHANGES = 31; // 10 works but 11 fails unless we work around it in Dexie with a meta table.

    await Dexie.delete(DBNAME);
    let db = new Dexie(DBNAME);
    for (let i=1; i<=NUM_SCHEMA_CHANGES; ++i) {
        db.version(1) // Yes, reuse version 1. We're testing that reusing version for schema changes is ok.
            .stores({
            friends: "id",
            ["table"+i]: "id"
        });
        await db.open();
        db.close();
    }
    ok(true, `Could change schema a ${NUM_SCHEMA_CHANGES} times while still being on version 1, without error`);
    await db.open();
    equal(db.verno, 1, "The database should be at version 1");
    await db.table("table1").add({id: 1, name: "Foo 123"});
    ok(true, `Could add things to table1`);
    await db.table("table" + NUM_SCHEMA_CHANGES).add({id: 1, name: "Foo 123"});
    ok(true, `Could add things to table${NUM_SCHEMA_CHANGES}`);
    db.close();
    db = new Dexie(DBNAME);
    db.version(2).stores({
        version2Table: "id",
    }).upgrade(async tx => {
        await tx.version2Table.add({id: 1, foo: "bar"});
    });
    await db.open();
    ok(true, "Could open v2");
    const objFromUpgrader = await db.version2Table.get(1);
    ok(!!objFromUpgrader, "The upgrader of version 2 have run");
    db.close();

    db.version(3).stores({
        version3Table: "id",
    }).upgrade(async tx => {
        await tx.version3Table.add({id: 1, foo: "bar"});
    });
    await db.open().catch(err => {
        ok(false, "Failed to upgrade to version 3: " + err); // Would fail here if version 2 was rerun a second time (ConstraintError)
        throw err;
    });
    ok(true, "Could open v3");
    const objFromUpgrader3 = await db.version3Table.get(1);
    ok (!!objFromUpgrader3, "The upgrader of version 3 have run");
    await Dexie.delete(DBNAME);
});
