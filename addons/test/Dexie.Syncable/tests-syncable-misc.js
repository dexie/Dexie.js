///<reference path="../../src/Dexie.js" />
///<reference path="../Dexie.Syncable.js" />
//debugger;
(function () {

    module("tests-syncable-misc", {
        setup: function () {
            stop();
            Dexie.delete("SyncableTest").then(function () {
                start();
            }).catch(function (e) {
                ok(false, "Could not delete database");
            });
        },
        teardown: function () {
            stop(); Dexie.delete("SyncableTest").then(start);
        }
    });

    function createDB() {
        var db = new Dexie("SyncableTest");
        db.version(1).stores({ friends: "sync:$$id,name,shoeSize" });
        return db;
    }

    asyncTest("test1", 4, function () {
        var db1 = createDB();
        var db2 = createDB();

        db2.friends.on("created", function (key, obj) {
            ok(true, "obj created: " + JSON.stringify(obj));
        });
        db2.friends.on("updated", function (key, mods, oldObj, newObj) {
            ok(true, "obj updated: " + JSON.stringify(mods));
            equal(JSON.stringify(mods), JSON.stringify({ name: "David" }), "Only modifying the name property");
        });
        db2.friends.on("deleted", function (key, obj) {
            ok(true, "obj deleted: " + JSON.stringify(obj));
            db1.close();
            db2.close();
            start();
        });
        db2.open();
        db1.open();

        db1.friends.put({ name: "Dave", shoeSize: 43 }).then(function (id) {
            // Update object:
            return db1.friends.put({ id: id, name: "David", shoeSize: 43 });
        }).then(function (id) {
            // Delete object:
            return db1.friends.delete(id);
        }).catch(function (e) {
            ok(false, "Error: " + e.stack || e);
            start();
        });
    });
})();