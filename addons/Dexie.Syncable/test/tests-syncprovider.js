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
            Dexie.delete("SyncProviderTest").then(function () {
                start();
            }).catch(function (e) {
                ok(false, "Could not delete database");
            });
        },
        teardown: function () {
            stop(); Dexie.delete("SyncProviderTest").then(start);
        }
    });

    asyncTest("doSumthin", function () {
        var db = new Dexie("SyncProviderTest");
        db.version(1).stores({
            friends: "sync:$$id,name",
            pets: "sync:$$id,kind,name"
        });
        
        var memdb = new MemoryDatabase("dummy-url");
        memdb.create("friends", "abc123", {name: "Friend from memory"});
        db.sync("memdb", "dummy-url", { continous: true, direction: 'bidirectional' });
        db.open();
        db.friends.toCollection().each(function (friend) {
            ok(friend.name, "Friend found: " + friend.name);
            start();
        });
    });

})();