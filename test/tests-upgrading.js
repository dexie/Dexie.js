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

})();