///<reference path="qunit.js" />
///<reference path="../src/Dexie.js" />

(function () {
    module("upgrading");

    var Promise = Dexie.Promise;

    asyncTest("upgrade", function () {
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
        var baseNumberOfTables = 0; // Instead of expecting an empty database to have 0 tables, we read how many an empty database has. Reason: Addons may add meta tables.

        Promise.resolve(function () {
            return Dexie.delete("Upgrade-test");
        }).then(function () {
            // Empty Schema
            db = new Dexie(DBNAME);
            db.version(1).stores({});
            return db.open();
        }).then(function () {
            ok(true, "Could create empty database without any schema");
            baseNumberOfTables = db.tables.length;
            db.close();
            db = new Dexie(DBNAME);
            db.version(1).stores({});
            db.version(2).stores({ store1: "++id" });
            return db.open();
        }).then(function () {
            ok(true, "Succeeded to upgrade");
            equal(db.verno, 2, "Version = 2");
            equal(db.table("store1").schema.primKey.name, "id", "Primary key is 'id'");
            db.close();
            //
            // Add indexes
            //
            db = new Dexie(DBNAME);
            db.version(1).stores({});
            db.version(2).stores({ store1: "++id" });
            db.version(3).stores({ store1: "++id,name" }); // Adding the name index
            return db.open();
        }).then(function () {
            ok(true, "Could upgrade to version 3 (adding an index to a store)");
            // Testing that the added index is working indeed:
            return db.transaction('rw', "store1", function () {
                db.store1.add({ name: "apa" });
                db.store1.where("name").equals("apa").count(function (count) {
                    equal(count, 1, "Apa was found by its new index (The newly added index really works!)");
                });
            });
        }).then(function () {
            db.close();
            db = new Dexie(DBNAME);
            // Testing:
            //  1. Place latest version first (order should not matter)
            //  2. Removing the 'name' index.
            db.version(4).stores({ store1: "++id" });
            db.version(3).stores({ store1: "++id,name" });
            db.version(2).stores({ store1: "++id" });
            db.version(1).stores({});
            return db.open();
        }).then(function () {
            ok(true, "Could upgrade to version 4 (removing an index)");
            equal(db.tables[0].schema.indexes.length, 0, "No indexes in schema now when 'name' index was removed");
            db.close();
            //
            // Testing to run an upgrader function
            //
            db = new Dexie(DBNAME);
            // (Need not to specify earlier versions than 4 because 'I have no users out there running on version below 4'.)
            db.version(4).stores({ store1: "++id" });
            db.version(5).stores({ store1: "++id,&email" }).upgrade(function (trans) {
                var counter = 0;
                trans.table("store1").toCollection().modify(function (obj) {
                    // Since we have a new primary key we must make sure it's unique on all objects
                    obj.email = "user" + (++counter) +"@abc.com";
                });
            });
            return db.open();
        }).then(function () {
            ok(true, "Could upgrade to version 5 where an upgrader function was applied");
            return db.table("store1").toArray();
        }).then(function (array) {
            equal(array.length, 1, "We still have the object created in version 3 there");
            equal(array[0].email, "user1@abc.com", "The object got its upgrade function running");
            equal(array[0].id, 1, "The object still has the same primary key");
            equal(array[0].name, "apa", "The object still has the name 'apa' that was given to it when it was created");
            db.close();

            //
            // Now, test to change a property of an index
            //
            db = new Dexie(DBNAME);
            db.version(5).stores({ store1: "++id,&email" }); // Need not to specify an upgrader function when we know it's not gonna run (we are already on ver 5)
            db.version(6).stores({ store1: "++id,*email" }).upgrade(function (trans) { // Changing email index from unique to multi-valued
                trans.table("store1").toCollection().modify(function(obj) {
                    obj.email = [obj.email]; // Turning single-valued unique email into an array of emails.
                });
            }); 
            return db.open();
        }).then(function () {
            ok(true, "Could upgrade to version 6");
            equal(db.tables.length, baseNumberOfTables + 1, "There should be 1 store now");
            return db.table('store1').get(1, function (apaUser) {
                ok(apaUser.email instanceof Array, "email is now an array");
                equal(apaUser.email[0], "user1@abc.com", "First email is user1@abc.com");
            });
        }).then(function () {
            // Test that it is now ok to add two different users with the same email, since we have removed the uniqueness requirement of the index
            return db.table('store1').add({ name: "apa2", email: ["user1@abc.com"] });
        }).then(function () {
            return db.table('store1').toArray();
        }).then(function (array) {
            equal(array.length, 2, "There are now two users in db");
            equal(array[0].email[0], array[1].email[0], "The two users share the same email value");
            db.close();

            //
            // Now, test that we may specify the changed object stores only
            //
            db = new Dexie(DBNAME);
            db.version(6).stores({ store1: "++id,*email" }); // Need not to specify an upgrader function when we know it's not gonna run (we are already on ver 5)
            db.version(7).stores({ store2: "uuid" });
            return db.open();
        }).then(function () {
            ok(true, "Could upgrade to version 7");
            equal(db.tables.length, baseNumberOfTables + 2, "There should be 2 stores now");
            db.close();

            //
            // Now, test to remove an object store
            //
            db = new Dexie(DBNAME);
            db.version(6).stores({ store1: "++id,*email" }); // Need to keep version 6 or add its missing stores to version 7. Choosing to keep versoin 6.
            db.version(7).stores({ store2: "uuid" });
            db.version(8).stores({ store1: null }); // Deleting a version.
            return db.open();
        }).then(function () {
            ok(true, "Could upgrade to version 8 - deleting an object store");
            equal(db.tables.length, baseNumberOfTables + 1, "There should only be 1 store now");

            // Now test: Delete DB and open it with ALL versions specs specified (check it will run in sequence)
            return db.delete();
        }).then(function () {
            db = new Dexie(DBNAME);
            db.version(1).stores({});
            db.version(2).stores({ store1: "++id" });
            db.version(3).stores({ store1: "++id,name" }); // Adding the name index
            db.version(4).stores({ store1: "++id" });
            db.version(5).stores({ store1: "++id,&email" }).upgrade(function (trans) {
                var counter = 0;
                trans.table("store1").toCollection().modify(function (obj) {
                    // Since we have a new primary key we must make sure it's unique on all objects
                    obj.email = "user" + (++counter) + "@abc.com";
                });
            });
            db.version(6).stores({ store1: "++id,*email" }).upgrade(function (trans) { // Changing email index from unique to multi-valued
                trans.table("store1").toCollection().modify(function (obj) {
                    obj.email = [obj.email]; // Turning single-valued unique email into an array of emails.
                });
            });
            db.version(7).stores({ store2: "uuid" });
            db.version(8).stores({ store1: null });
            return db.open();
        }).then(function () {
            ok(true, "Could create new database");
            equal(db.verno, 8, "Version is 8");
            equal(db.tables.length, baseNumberOfTables + 1, "There should only be 1 store now");
            var store2Table = db.tables.filter(function (table) { return table.name == "store2" })[0];
            ok(store2Table, "The store we have is store2");
            equal(store2Table.schema.primKey.name, "uuid", "The prim key is uuid");
            return db.delete();
        }).then(function() {
            // Once recreate the database but now use a reverse order of the versions:
            db = new Dexie(DBNAME);
            db.version(8).stores({ store1: null });
            db.version(7).stores({ store2: "uuid" });
            db.version(6).stores({ store1: "++id,*email" }).upgrade(function (trans) { // Changing email index from unique to multi-valued
                trans.table("store1").toCollection().modify(function (obj) {
                    obj.email = [obj.email]; // Turning single-valued unique email into an array of emails.
                });
            });
            db.version(5).stores({ store1: "++id,&email" }).upgrade(function (trans) {
                var counter = 0;
                trans.table("store1").toCollection().modify(function (obj) {
                    // Since we have a new primary key we must make sure it's unique on all objects
                    obj.email = "user" + (++counter) + "@abc.com";
                });
            });
            db.version(4).stores({ store1: "++id" });
            db.version(3).stores({ store1: "++id,name" }); // Adding the name index
            db.version(2).stores({ store1: "++id" });
            db.version(1).stores({});
            return db.open();
        }).then(function () {
            ok(true, "Could create new database");
            equal(db.verno, 8, "Version is 8");
            equal(db.tables.length, baseNumberOfTables + 1, "There should only be 1 store now");
            var store2Table = db.tables.filter(function (table) { return table.name == "store2" })[0];
            ok(store2Table, "The store we have is store2");
            equal(store2Table.schema.primKey.name, "uuid", "The prim key is uuid");
        }).catch(function (err) {
            ok(false, "Error: " + err);
        }).finally(function () {
            if (db) db.close();
            Dexie.delete(DBNAME).then(start);
        });

    });

    asyncTest("Issue #30 - Problem with existing db", function () {
        ///<var type="Dexie" />
        var db; // Will be used as a migrated version of the db.

        // Start by deleting the db if it exists:
        Dexie.delete("raw-db").then(function () {

            // Create a bare-bone indexedDB database with custom indexes of various kinds.
            return new Dexie.Promise(function(resolve, reject) {
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
                        var people = rawdb.createObjectStore("people", { keyPath: "_id", autoIncrement: false });
                        var messages = rawdb.createObjectStore("messages", { autoIncrement: true });
                        var umbrellas = rawdb.createObjectStore("umbrellas", { keyPath: ["date", "time"] });
                        // Indexes:
                        messages.createIndex("text_index", "text", { unique: false, multiEntry: false });
                        messages.createIndex("words_index", "words", { unique: false, multiEntry: true });
                        messages.createIndex("id_index", "id", { unique: true, multiEntry: false });
                        umbrellas.createIndex("size_color_index", ["size", "color"], { unique: false, multiEntry: false });
                        // Data:
                        people.add({ _id: "9AF56447-66CE-470A-A70F-674A32EF2D51", name: "Kalle" });
                        messages.add({ text: "Here is a text", words: ["here", "is", "a", "text"], id: 1 });
                        umbrellas.add({ date: "2014-11-20", time: "22:18", size: 98, color: "pink", name: "My Fine Umbrella!" });
                    } catch (ex) {
                        if (rawdb) rawdb.close();
                        reject(ex);
                    }
                }
                req.onsuccess = function() {
                    console.log("onsuccess called");
                    rawdb = req.result;

                    rawdb.close();

                    resolve();
                };
                req.onerror = error;
            });
        }).then(function() {
            // Try open the database using Dexie:
            db = new Dexie("raw-db");
            db.version(0.2).stores({
                people: "_id",
                messages: "++,text,words,id,[size+color]",
                umbrellas: "[date+time],[size+color]"
            });
            return db.open();
        }).then(function() {
            // Verify "people" data
            return db.people.toArray(function(people) {
                equal(people.length, 1, "One person in people");
                equal(people[0].name, "Kalle", "The persons' name is Kalle");
            });
        }).then(function() {
            // Verify "messages" data
            return db.messages.toArray(function(messages) {
                equal(messages.length, 1, "One message in messages");
                equal(messages[0].text, "Here is a text", "The message has the correct text");
                equal(messages[0].words.length, 4, "The message has 4 words");
            });
        }).then(function() {
            // Verify "umbrellas" data
            return db.umbrellas.toArray(function(umbrellas) {
                equal(umbrellas.length, 1, "One umbrella in umbrellas");
                equal(umbrellas[0].name, "My Fine Umbrella!", "The umbrella has the correct name");
                equal(umbrellas[0].date, "2014-11-20", "The umbrella has the correct date");
                equal(umbrellas[0].time, "22:18", "The umbrella has the correct time");
                equal(umbrellas[0].size, 98, "The umbrella has the currect size");
                equal(umbrellas[0].color, "pink", "The umbrella has the correct color");
            });
        }).then(function() {
            // Test messages indexes
            return db.messages.orderBy("text").first(function(message) {
                ok(!!message, "Could find a message when iterating the 'text' index");
            });
        }).then(function () {
            // Test words index
            return db.messages.where("words").equals("is").first(function(message) {
                ok(!!message, "Could find a message when querying the 'words' index");
            });
        }).then(function () {
            // Test id index
            return db.messages.where("id").equals(1).count(function(count) {
                equal(count, 1, "Could count id's");
            });
        }).then(function () {
            // Test umbrella compound primary key
            return db.umbrellas.get(["2014-11-20", "22:18"], function(umbrella) {
                ok(!!umbrella, "Umbrella was found by compound primary key");
                equal(umbrella.color, "pink", "Umbrella has the correct color");
            });
        }).then(function() {
            // Test umbrella compound index
            return db.umbrellas.where("[size+color]").above([98, "pina"]).count(function(count) {
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
            ok(false, "Error (expected in IE10/IE11 without iegap polyfill because we are testing compound indexes): " + err);
        }).finally(function () {
            if (db) db.close();
            Dexie.delete("raw-db").then(start);
        });
    });

})();