///<reference path="run-unit-tests.html" />


(function () {
    var db = new Dexie("TestDB");
    db.version(1).stores({ users: "++id,first,last,&username,&*email,*pets" });
    db.on("populate", function (trans) {
        var users = trans.table("users");
        users.add({ first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
        users.add({ first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
    });
    db.on("error", function (e) {
        ok(false, "An error bubbled out to the db.on('error'). Should not happen because all tests should catch their errors themselves. " + e);
    });

    module("exception-handling", {
        setup: function () {
            stop();
            db.delete().then(function () {
                db.open().catch(function (e) { ok(false, "Got bubbled!");});
                start();
            }).catch(function (e) {
                ok(false, "Error deleting database: " + e);
                start();
            });
        },
        teardown: function () {
            stop(); db.delete().finally(start);
        }
    });

    asyncTest("eventError-transaction-catch", function () {
        db.transaction("rw", db.users, function () {
            db.users.add({ username: "dfahlander" }).then(function () {
                ok(false, "Should not be able to add two users with same username");
            });
        }).then(function () {
            ok(false, "Transaction should not complete since an error should have occurred");
        }).catch(function (e) {
            ok(true, "Got transaction error: " + e);
        }).finally(start);
    });
    
    asyncTest("eventError-request-catch", function () {
        db.transaction("rw", db.users, function () {
            db.users.add({ username: "dfahlander" }).then(function () {
                ok(false, "Should not be able to add two users with same username");
            }).catch(function (e) {
                ok(true, "Got request error: " + e);
            });
            db.users.add({ first: "Trazan", last: "Apansson", username: "tapan", email: ["trazan@apansson.barnarne"], pets: ["monkey"] }).then(function (id) {
                ok(id > 2, "Could continue transaction and add Trazan since last error event was catched");
            });
        }).then(function () {
            ok(true, "Transaction should complete since the only error that occurred was catched");
        }).catch(function (e) {
            ok(false, "Should not get transaction error since we have catched the error. Got Transaction error: " + e);
        }).finally(start);
    });


    asyncTest("exceptionThrown-transaction-catch", function () {
        db.transaction("r", db.users, function () {
            throw new SyntaxError("Why not throw an exception for a change?");
        }).then(function () {
            ok(false, "Transaction should not complete since an error should have occurred");
        }).catch(TypeError, function (e) {
            ok(false, "Should not happen. The thrown error was not a TypeError");
        }).catch(SyntaxError, function (e) {
            ok(true, "Transaction got SyntaxError: " + e);
        }).catch(function (e) {
            ok(false, "Should not come here! The error should already have been catched above()");
        }).finally(start);
    });

    asyncTest("exceptionThrown-request-catch", function () {
        db.transaction("r", db.users, function () {
            db.users.where("username").equals("apa").toArray(function () {
                db.users.where("username").equals("kceder").toArray().then(function () {
                    return "a";
                }).then(function () {
                    NonExistingSymbol.EnotherIdioticError = "Why not make an exception for a change?";
                });
            });
        }).then(function () {
            ok(false, "Transaction should not complete since an error should have occurred");
        }).catch(function (e) {
            ok(true, "Transaction got error: " + e);
        }).finally(start);
    });

    asyncTest("exceptionThrown-iteration-should-abort-when-using-hook", function () {
        db.users.hook('deleting', function () {
            // Testing with 
        })
        db.transaction('rw', db.users, function () {

            function deleteKarls() {
                db.users.toCollection().modify(function (user) {
                    delete this.value;
                    throw "Throwing something";
                });
            }
            
            db.users.delete(1);
            deleteKarls();

        }).then(function () {
            ok(false, "Transaction should not complete!");
        }).catch(function (err) {
            ok(true, "Transaction aborted");
        }).finally(start);
    });

    asyncTest("exceptionThrown-iteration-should-not-abort-when-using-hook", function () {
        db.users.hook('deleting', function () {
            // Testing with 
        })
        db.transaction('rw', db.users, function () {

            function deleteKarls() {
                db.users.toCollection().modify(function (user) {
                    delete this.value;
                    throw "Throwing something";
                }).catch(function (err) {
                    // Catching error should prevent transaction from aborting.
                });
            }

            db.users.delete(1);
            deleteKarls();

        }).then(function () {
            ok(true, "Transaction completed");
        }).catch(function (err) {
            ok(false, "Transaction should not abort!");
        }).finally(start);
    });

    /*asyncTest("promise-test", function () {
        var p = new Dexie.Promise(function (resolve, reject) {
            setTimeout(function () {
                reject("apa error");
            }, 0);
        });
        p.catch(function (err) {
            return Dexie.Promise.reject(err);
        });
        p.then(function(){}).catch(function (err) {
            return Dexie.Promise.reject(err);
        });
        p.onuncatched = function () {
            debugger;
        }
        p.finally(start);
    });*/


    asyncTest("exception in upgrader", function () {
        // Create a database:
        var db = new Dexie("TestUpgrader");
        db.version(1).stores({ cars: "++id,name,brand" });
        db.open().then(function(){
            // Once it opens, close it and create an upgraded version that will fail to upgrade.
            db.close();
            db = new Dexie("TestUpgrader");
            db.version(1).stores({ cars: "++id,name,brand" });
            db.version(2).upgrade(function (trans) { trans.cars.add({ name: "My car", brand: "Pegeut" }); });
            db.version(3).upgrade(function (trans) {
                throw new Error("Oops. Failing in upgrade function");
            });
            return db.open();
        }).catch(function (err) {
            // Got error
            ok(err.toString().indexOf("Oops. Failing in upgrade function") != -1, "Got error: " + err);
            // Create 3rd instance of db that will only read from the existing DB.
            // What we want to check here is that the DB is there but is still
            // only on version 1.
            db = new Dexie("TestUpgrader");
            return db.open();
        }).then(function (){
            equal(db.verno, 1, "Database is still on version 1 since it failed to upgrade to version 2.");
        }).finally(function () {
            db.delete().then(start);
        });
    });

    asyncTest("exception in on('populate')", function () {
        // Create a database:
        var db = new Dexie("TestUpgrader");
        db.version(1).stores({ cars: "++id,name,brand" });
        db.on('populate', function () {
            throw new Error("Oops. Failing in upgrade function");
        });
        db.open().catch(function (err) {
            // Got error
            ok(err.toString().indexOf("Oops. Failing in upgrade function") != -1, "Got error: " + err);
            // Create 3rd instance of db that will only read from the existing DB.
            // What we want to check here is that the DB is there but is still
            // only on version 1.
            db = new Dexie("TestUpgrader");
            return db.open();
        }).then(function () {
            ok(false, "The database should not have been created");
        }).catch(function (err) {
            ok(err.toString().indexOf("doesnt exist") != -1, "The database doesnt exist");
        }).finally(function () {
            db.delete().then(start);
        });
    });


    asyncTest("catch-all with db.on('error')", 3, function () {
        var ourDB = new Dexie("TestDB2");
        ourDB.version(1).stores({ users: "++id,first,last,&username,&*email,*pets" });
        ourDB.on("populate", function () {
            ourDB.users.add({ first: "Daniel", last: "Fahlenius", username: "dfahlenius", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
            ourDB.users.add({ first: "Carl", last: "Cedersköld", username: "cceder", email: ["karl@ceder.what"], pets: [] });
        });
        var errorCount = 0;
        ourDB.on("error", function (e) {
            ok(errorCount < 3, "Uncatched error successfully bubbled to ourDB.on('error'): " + e);
            if (++errorCount == 3) {
                ourDB.delete().then(start);
            }
        });

        ourDB.open();

        ourDB.transaction("rw", ourDB.users, function () {
            ourDB.users.add({ username: "dfahlenius" }).then(function () {
                ok(false, "Should not be able to add two users with same username");
            });
        }).then(function () {
            ok(false, "Transaction should not complete since errors wasnt catched");
        });
        ourDB.transaction("rw", ourDB.users, function () {
            ourDB.users.add({ username: "dfahlenius" }).then(function () {
                ok(false, "Should not be able to add two users with same username");
            });
        }).then(function () {
            ok(false, "Transaction should not complete since errors wasnt catched");
        });
        ourDB.transaction("rw", ourDB.users, function () {
            ourDB.users.add({ username: "dfahlenius" }).then(function () {
                ok(false, "Should not be able to add two users with same username");
            });
        }).then(function () {
            ok(false, "Transaction should not complete since errors wasnt catched");
        });

    });

    asyncTest("Issue #32: db.on('error') doesnt catch 'not found index' DOMExceptions", function () {
        var ourDB = new Dexie("TestDB2");
        new Dexie.Promise(function (finalResolve) {
            ourDB.version(1).stores({ users: "++id" });
            ourDB.on("populate", function() {
                db.users.add({ first: "David", last: "Fahlander" });
            });
            var errorHasBubbled = false;
            ourDB.on("error", function(e) {
                errorHasBubbled = true;
                ok(true, "Uncatched error successfully bubbled to db.on('error'): " + e);
                finalResolve();
            });

            ourDB.open().then(function () {

                // Make the db fail by not finding a correct index:
                ourDB.users.where("I am a little frog!").equals(18).toArray();

                setTimeout(function() {
                    if (!errorHasBubbled) {
                        ok(false, "Timeout! Error never bubbled to db.on('error')");
                    }
                    finalResolve();
                }, 300);
            });
        }).then(function() {
            ourDB.delete().then(start);
        });
    });

    asyncTest("Error in on('populate') should abort database creation", function () {
        var popufail = new Dexie("PopufailDB");
        popufail.version(1).stores({ users: "++id,first,last,&username,&*email,*pets" });
        popufail.on('populate', function () {
            popufail.users.add({ first: NaN, last: undefined, username: function () { } }).catch(function (e) {
                ok(true, "Got error when catching add() operation: " + e);
                return Dexie.Promise.reject(e);
            });
        });
        popufail.open().catch(function (err) {
            ok(true, "Got error (as expected):" + err);
        });
        popufail.users.count(function (count) {
            ok(false, "Could query database even though an error happened in the populate event!");
        }).catch(function (err) {
            ok(true, "Got error when trying to query: " + err);
        }).finally(function () {
            popufail.delete();
            start();
        });
    });


})();

