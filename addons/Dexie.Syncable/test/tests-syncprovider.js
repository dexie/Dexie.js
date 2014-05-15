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
        var syncer = db.sync("websocket", "http://dummy:5000");
        console.log("Sync called. Current status: " + Dexie.Syncable.StatusTexts[syncer.status]);
        syncer.statusChanged(function (newStatus) {
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

        db2.sync("websocket", "http://dummy:5000");
        db2.open().then(function () {
            console.log("db2 opened");
        });
        db2.on.error.subscribe(function (error) {
            console.error("db2 error: " + error);
        });

        db2.on('changes', function (changes, partial) {
            console.log("db2.on('changes'): changes.length: " + changes.length + "\tpartial: " + (partial ? "true" : "false"));
            changes.forEach(function (change) {
                console.log(JSON.stringify(change));
                db2.checkChange(change);
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
            ok(true, "Got David");
        }).finally(function () {
            console.log("Closing down");
            db.close();
            db2.close();
            start();
        });
    });

})();