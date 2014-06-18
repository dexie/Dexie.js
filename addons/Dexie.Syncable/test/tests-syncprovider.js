///<reference path="test-syncable.html" />

(function () {
    /*  To Test:
        * db.sync() using WebSocketSyncProtocol and WebSocketSyncServer with two db's of different names in same window.
            * Add object to db1
            * Make sure it appears in db2
            * Add 1100 objects to db2
            * Make sure they all appear in db1  - ALSO DEBUG THAT:
                                                    * db2 sends it's changes as two chunks where first one is partial and second final
                                                    * SyncServer gets partial and applies to uncommittedChanges
                                                    * SyncServer gets final and commits changes, as well as triggers db1 provider, who
                                                    * calls applyRemoteChanges on all objects.
                                                    * db1.on('changes') gets triggered.
            * Add 1000 objects the same way and debug that:
                                                    * db2 sents it's changes as one or two chunks depending on how I implemented it.
        * Add another db with same name as one of the two dbs.
            * Make sure that the third DB is not master
            * Make sure that sync() on third db will call master and make it sync, or connect to existing syncing.
            * Make sure that the third DB gets changes added to other remote db.
        * Take down master and make sure third DB becomes master and can contiue syncing.
        
    */

    module("tests-syncprovider", {
        setup: function () {
            stop();
            Dexie.Promise.all(Dexie.delete("SyncProviderTest"), Dexie.delete("OtherClientDB")).then(function () {
                start();
            }).catch(function (e) {
                ok(false, "Could not delete database");
                debugger;
            });
        },
        teardown: function () {
            stop(); Dexie.Promise.all(Dexie.delete("SyncProviderTest"), Dexie.delete("OtherClientDB")).then(start);
        }
    });

    asyncTest("testSyncProvider", function () {
        var CREATE = 1,
            UPDATE = 2,
            DELETE = 3;

        var db = new Dexie("SyncProviderTest");
        db.version(1).stores({
            friends: "$$id,name",
            pets: "$$id,kind,name"
        });

        // Setup the sync server
        var server = new SyncServer(5000);
        server.start();

        // Connect our db client to it
        db.syncable.connect("websocket", "http://dummy:5000");
        db.syncable.on('statusChanged', function (newStatus, url) {
            console.log("Sync State Changed: " + Dexie.Syncable.StatusTexts[newStatus]);
        });

        // Open database
        db.open();

        // Create another database to sync with:
        var db2 = new Dexie("OtherClientDB");
        db2.version(1).stores({
            friends: "$$id",
            pets: "$$id"
        });

        db2.syncable.connect("websocket", "http://dummy:5000");
        db2.open().then(function () {
            console.log("db2 opened");
        });
        db2.on.error.subscribe(function (error) {
            console.error("db2 error: " + error);
        });

        db2.on('changes', function (changes, partial) {
            console.log("db2.on('changes'): changes.length: " + changes.length + "\tpartial: " + (partial ? "true" : "false"));
            changes.forEach(function (change) {
                //console.log(JSON.stringify(change));
                db2.checkChange(change);
            });
        });

        db.on('changes', function (changes, partial) {
            console.log("db.on('changes'): changes.length: " + changes.length + "\tpartial: " + (partial ? "true" : "false"));
            changes.forEach(function (change) {
                if (db.checkChange) db.checkChange(change);
            });
        });

        function waitFor(db, params) {
            return new Dexie.Promise(function (resolve, reject) {
                db.checkChange = function (change) {
                    var checker = {};
                    Dexie.extend(checker, change);
                    if (change.type == CREATE) Dexie.extend(checker, change.obj);
                    if (change.type == UPDATE) Dexie.extend(checker, change.mods);
                    var found = true;
                    Object.keys(params).forEach(function (param) {
                        if (!(param in checker)) found = false;
                        if (params[param] != checker[param]) found = false;
                    });
                    if (found) resolve();
                }
            });
        }

        db.friends.add({ name: "David" });

        waitFor(db2, { type: CREATE, name: "David" }).then(function () {
            ok(true, "The CREATE of friend 'David' was sent all the way to server and then back again to db2.");
            db.friends.where('name').equals('David').modify({ name: "Ylva" });
            return waitFor(db2, { type: UPDATE, name: "Ylva" });
        }).then(function () {
            ok(true, "The UPDATE of friend 'David' to 'Ylva' was sent all the way around as well");
            return db.friends.where('name').equals('Ylva').first(function (friend) {
                return friend.id;
            })
        }).then(function (id) {
            db.friends.delete(id);
            return waitFor(db2, { type: DELETE, key: id });
        }).then(function () {
            ok(true, "The DELETE of friend 'Ylva' was sent all the way around as well");
            // Now send 1100 create requests
            db2.transaction('rw', db2.pets, function () {
                for (var i = 0; i < 1100; ++i) {
                    db.pets.add({name: "Josephina" + (i + 1), kind: "Dog"});
                }
            });
            return waitFor(db, { type: CREATE, name: "Josephina1100" });
        }).then(function () {
            ok(true, "All 1100 dogs where sent all the way around (db2-->db this time)");
            // Now check that db2 contains all dogs and that its _uncommittedChanges is emptied
            return db.pets.count(function (count) {
                equal(count, 1100, "DB2 has 1100 pets now");
            });
        }).then(function () {
            return db._uncommittedChanges.count(function (count) {
                equal(count, 0, "DB2 has no uncommitted changes anymore");
            });
        }).then(function () {
            // Now send 1000 create this time (exact number of max changes per chunk)
            db.transaction('rw', db.pets, function () {
                for (var i = 0; i < 1000; ++i) {
                    db.pets.add({ name: "Tito" + (i + 1), kind: "Cat" });
                }
            });
            return waitFor(db, { type: CREATE, name: "Tito1000" });
        }).then(function () {
            ok(true, "All 1000 cats where sent all the way around (db-->db2 this time)");

        }).finally(function () {
            console.log("Closing down");
            db.close();
            db2.close();
            start();
        });
    });

})();