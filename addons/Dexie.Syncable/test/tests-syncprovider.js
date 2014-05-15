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
                debugger;
            });
        },
        teardown: function () {
            stop(); Dexie.delete("SyncProviderTest").then(start);
        }
    });

    asyncTest("testSyncServer", function () {
        /*var db = new Dexie("SyncProviderTest");
        db.version(1).stores({
            friends: "sync:$$id,name",
            pets: "sync:$$id,kind,name"
        });*/

        var server = new SyncServer(1234);
        server.start();
        
        var ws = new WebSocket("http://dummy:1234");
        ws.onopen = function () {
            ok(true, "WebSocket opened");
            ws.send(JSON.stringify({
                type: "clientIdentity",
                clientIdentity: null
            }));
            ws.send(JSON.stringify({
                type: "subscribe",
                syncedRevision: null
            }));
        }
        ws.onclose = function (reason) {
            ok(true, "WebSocket closed. Reason: " + reason);
            start();
        }
        ws.onerror = function (event) {
            ok(false, "Error: " + event.reason);
            start();
        }

        ws.onmessage = function (event) {
            var requestFromServer = JSON.parse(event.data);
            if (requestFromServer.type === "clientIdentity") {
                ok(true, "Got client identity: " + requestFromServer.clientIdentity);
                // Now send changes to server
                ws.send(JSON.stringify({
                    type: "changes",
                    changes: [],
                    partial: false,
                    baseRevision: null,
                    requestId: 1
                }));
            } else if (requestFromServer.type == "ack") {
                ok(true, "Got ack from server: " + requestFromServer.requestId);
                equal(requestFromServer.requestId, 1, "The request ID 1 was acked");

                // Now connect another WebSocket and send its changes to server so that server will react and send us the changes:
                var ws2 = new WebSocket("http://dummy:1234");
                ws2.onopen = function () {
                    ws2.send(JSON.stringify({
                        type: "clientIdentity",
                        clientIdentity: null
                    }));
                    ws2.send(JSON.stringify({
                        type: "changes",
                        changes: [{ type: 1, table: "UllaBella", key: "apa", obj: {name: "Apansson"}}],
                        partial: false,
                        baseRevision: null,
                        requestId: 1
                    }));
                }
            } else if (requestFromServer.type == "changes") {
                if (requestFromServer.currentRevision == 0) {
                    ok(true, "Got initial changes sent to us with current revision 0");
                } else {
                    ok(true, "Got changes from server: " + JSON.stringify(requestFromServer.changes));
                    equal(JSON.stringify(requestFromServer.changes), JSON.stringify([
                        {
                            rev: 1,
                            source: 2, // WebSocket2 was the source of the changes.
                            type: 1,
                            table: "UllaBella",
                            key: "apa",
                            obj: { name: "Apansson" }
                        }
                    ]), "Changes where the same as the ones sent by WebSocket2");
                    start();
                }
            }
        }

    });

})();