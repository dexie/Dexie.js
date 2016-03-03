///<reference path="../../dist/dexie.js" />
///<reference path="../dist/dexie-observable.js" />
//debugger;
(function () {

    module("tests-observable-misc", {
        setup: function () {
            stop();
            Dexie.delete("ObservableTest").then(function () {
                start();
            }).catch(function (e) {
                ok(false, "Could not delete database");
            });
        },
        teardown: function () {
            stop(); Dexie.delete("ObservableTest").then(start);
        }
    });

    function createDB() {
        var db = new Dexie("ObservableTest");
        db.version(1).stores({
            friends: "++id,name,shoeSize",
            CapitalIdTest: "$$Id,name"
            //pets: "++id,name,kind",
            //$emailWords: "",
        });
        return db;
    }
    
    asyncTest("test1", 4, function () {
        var db1 = createDB();
        var db2 = createDB();

        db2.on('changes', function (changes, partitial) {
            changes.forEach(function (change) {
                switch (change.type) {
                    case 1:
                        ok(true, "obj created: " + JSON.stringify(change.obj));
                        break;
                    case 2:
                        ok(true, "obj updated: " + JSON.stringify(change.mods));
                        equal(JSON.stringify(change.mods), JSON.stringify({ name: "David" }), "Only modifying the name property");
                        break;
                    case 3:
                        ok(true, "obj deleted: " + JSON.stringify(change.oldObj));
                        db1.close();
                        db2.close();
                        start();
                        break;
                }
            });
        });
        db1.open();
        db2.open();

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

    asyncTest("Capital$$Id-test", function() {
        var db = createDB();
        db.open();
        db.CapitalIdTest.put({ name: "Hilda" }).then(function() {
            return db.CapitalIdTest.toCollection().first();
        }).then(function(firstItem) {
            ok(firstItem.name == "Hilda", "Got first item");
            ok(firstItem.Id, "First item has a primary key set: " + firstItem.Id);
        }).catch(function(e) {
            ok(false, "Error: " + e);
        }).finally(function() {
            db.close();
            start();
        });
    });

    (function () {
        // ...and the winner is:
        function TicketList() {
            var source = Dexie.Observable.createUUID();

            db.on('changes', function (changes) {
                changes.forEach(function (change) {
                    if (change.table == 'tickets' && change.source !== source) {
                        switch (change.type) {
                            case CREATED:
                            case UPDATED:
                            case DELETED:
                        }
                    }
                });
            });

            db.transaction('rw', db.tickets, function (tickets, trans) {
                trans.source = source;
                trans.undoView = undoView;
                tickets.put({ name: component.input.vale });
            });
        }

        // ...but we can also build an Observer class upon the previous sample:
        function TicketList() {
            var observer = db.friends.observe({
                'create': function (obj, key) {
                    if (!isInDom(ticketList.elem)) return observer.stop();
                },
                'update': function (oldObj, mods, newObj, key) {
                    if (!isInDom(ticketList.elem)) return observer.stop();
                },
                'delete': function (obj, key) {
                    if (!isInDom(ticketList.elem)) return observer.stop();
                },
                'change': function (change) {
                    if (!isInDom(ticketList.elem)) return observer.stop();
                }
            });

            observer.ignore(function () {
                db.put(obj);
            });

            observer.stop();
        }
        /* Uteståënde funderingar:
        
        * ILocalDatabase.sync(changes):
            0. Öppna skrivtransaktion mot innehållande tabeller + _changes.
            1. Sätt trans.source = remoteNodeId
            2. Sätt trans.remote = true
            3. Använd trans.table(t).put/update/delete, allt efter vad changes innehåller
            4. Inom samma transaktion, läs alla förändringar som inte är våra (kanske kan göras först)
            5. Kompaktera dessa förändringar.
            6. Skicka tillbaka kompakterade förändringar (kan skickas som IEnumerable, eller som Array)
            7. Om du blir återuppringd med "onhandled", spara om revision i Node objektet.

        * Sync Server:
            1. Ta emot klientändringar samt vilken revision de bygger på
            2. Enumrera alla ändringar efter medskickad transaktion
            3. Lös alla konflikter från medskickade förändringar så att serverns förändringar efteråt
               vinner alla fajter utom delete som övervinner allt.
            4. Applicera resolvade konflikter
            5. Returnera alla enumrerade serverförändringar

        * SyncProvider.connect()
            1. Anropa sync() lokalt utan server-ändringar
            2. POST /server/sync med föregående server-revision
            3a: Om servern ackar våra förändringar, anropa onhandled()
            3b. Anropa sync() lokalt igen
            3c. När ILocalServer.sync() ackar, spara persistedContext med server revision från POST response ovan
            4. Om klient hade nya ändringar, anropa Server.sync() igen, men med föregående server revision eftersom de lokala ändringarna gjorts baserat på denna.
            5. Resolva promise
            6. Starta poll eller WebSocket connect beroende på implementation

        * SyncProvider.onLocalChange()
            1. POST /server/sync

        * SyncProvider.poll()
            1. 
        */
    })

    (function(){
        // ...and the losers were:
        function TicketList() {
            /*this.draw = function () {
                db.tickets.where("blabla").equals("blublu").offest(10).limit(10).observe(function (ticket) {
                    append(ticket);
                });
            }*/

        }

        function TicketList() {
            var observer = db.friends.observe();
            observer.on("changed", function (obj) {
            });
            observer.create(obj);
            observer.update(obj);
            observer.delete(key);
            observer.stop();
       }







        var observer = db1.friends.where("name").startsWithIgnoreCase("d").observe();
        var divs = {};
        observer.on("create", function (obj, key) {
            divs[key] = $(div).append($('<p>').text(obj.name));
        });
        observer.on("update", function (obj, mods, key) {
            if (mods.name) divs[key].find('p').text(mods.name);
        });
        observer.on("delete", function (obj, key) {
            divs[key].remove();
            delete divs[key];
        });

        observer.clear(); // Tar bort alla objekt inom observationen
        observer.filter(fn).modify();//...
        observer.put(obj, [key]);
        observer.add(obj, [key]);
    });
})();