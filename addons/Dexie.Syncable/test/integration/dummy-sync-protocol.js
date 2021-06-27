Dexie.Syncable.registerSyncProtocol("logger", {
    sync: function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
        /// <param name="changes" type="Array" elementType="IDatabaseChange"></param>
        /// <param name="applyRemoteChanges" value="function (changes, lastRevision, partial, clear) {}"></param>
        /// <param name="onSuccess" value="function (continuation) {}"></param>
        console.log("sync(changes.length: "+ changes.length + ", baseRevision:" + baseRevision + ", " + (partial ? "partial" : "full") + ", syncedRevision:" + syncedRevision + ")");
        changes.forEach(function (change) {
            console.log(JSON.stringify(change, null, true));
        });
    
        setTimeout(function () {
            var dummyRev = 1,
                CREATE = 1,
                UPDATE = 2,
                DELETE = 3;

            onChangesAccepted().catch('DatabaseClosedError', function () {
                console.log("Got DatabaseClosedError while calling onChangesAccepted()");
            });

            applyRemoteChanges([], "ServerRevision" + dummyRev++, true, false).catch('DatabaseClosedError', function() {
                console.log("Got DatabaseClosedError while calling applyRemoteChanges()");
            });
            applyRemoteChanges([], "ServerRevision" + dummyRev++, false, false).catch('DatabaseClosedError', function(){
                console.log("Got DatabaseClosedError while calling applyRemoteChanges()");
            })

            /*var dummyPoller = setInterval(function(){
            applyRemoteChanges([], "ServerRevision" + dummyRev++, true, false);
            applyRemoteChanges([], "ServerRevision" + dummyRev++, false, false);
        }, 10);*/
        
            onSuccess({
                react: function (changes, baseRevision, partial, onChangesAccepted) {
                    console.log("react(changes.length: " + changes.length + ", baseRevision:" + baseRevision + ", " + (partial ? "partial" : "full") + ")");
                    changes.forEach(function (change) {
                        console.log(JSON.stringify(change, null, true));
                    });
                    setTimeout(onChangesAccepted, 0);
                },
                disconnect: function () {
                    console.log("disconned()");
                    //clearInterval(dummyPoller);
                }
            });
        }, 0);
    }
});

// Make sure to always call sync() before any call to open().
Dexie.addons.push(function (db) {
    db.open = Dexie.override(db.open, function (origFunc) {
        return function () {
            if (!db.dynamicallyOpened() && !db.connectAlreadyCalled) {
                db.connectAlreadyCalled = true;
                console.log("Calling db.sync() on " + db.name);
                db.syncable.connect("logger", "logger").then(function() {
                    console.log("connect() promise was resolved (database=" + db.name + ")");
                }).catch('DatabaseClosedError', function(){
                }).catch(function(err) {
                    console.error("Error from connect() (database=" + db.name + "): " + err.stack || err);
                });
            }
            return origFunc.apply(this, arguments);
        }
    });
    db.close = Dexie.override(db.close, function (origFunc) {
        return function() {
            db.connectAlreadyCalled = false;
            return origFunc.apply(this, arguments);
        }
    });
});
