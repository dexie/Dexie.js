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
        db.transaction("rw", db.users, function (users) {
            users.add({ username: "dfahlander" }).then(function () {
                ok(false, "Should not be able to add two users with same username");
            });
        }).then(function () {
            ok(false, "Transaction should not complete since an error should have occurred");
        }).catch(function (e) {
            ok(true, "Got transaction error: " + e);
        }).finally(start);
    });
    
    asyncTest("eventError-request-catch", function () {
        db.transaction("rw", db.users, function (users) {
            users.add({ username: "dfahlander" }).then(function () {
                ok(false, "Should not be able to add two users with same username");
            }).catch(function (e) {
                ok(true, "Got request error: " + e);
            });
            users.add({ first: "Trazan", last: "Apansson", username: "tapan", email: ["trazan@apansson.barnarne"], pets: ["monkey"] }).then(function (id) {
                ok(id > 2, "Could continue transaction and add Trazan since last error event was catched");
            });
        }).then(function () {
            ok(true, "Transaction should complete since the only error that occurred was catched");
        }).catch(function (e) {
            ok(false, "Should not get transaction error since we have catched the error. Got Transaction error: " + e);
        }).finally(start);
    });


    asyncTest("exceptionThrown-transaction-catch", function () {
        db.transaction("r", db.users, function (users) {
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
        db.transaction("r", db.users, function (users) {
            users.where("username").equals("apa").toArray(function () {
                users.where("username").equals("kceder").toArray().then(function () {
                    return "a";
                }).then(function(){
                    NonExistingSymbol.EnotherIdioticError = "Why not make an exception for a change?";
                });
            });
        }).then(function () {
            ok(false, "Transaction should not complete since an error should have occurred");
        }).catch(function (e) {
            ok(true, "Transaction got error: " + e);
        }).finally(start);
    });

    asyncTest("catch-all with db.on('error')", 3, function () {
        var ourDB = new Dexie("TestDB2");
        ourDB.version(1).stores({ users: "++id,first,last,&username,&*email,*pets" });
        ourDB.on("populate", function (trans) {
            var users = trans.table("users");
            users.add({ first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
            users.add({ first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
        });
        var errorCount = 0;
        ourDB.on("error", function (e) {
            ok(errorCount < 3, "Uncatched error successfully bubbled to db.on('error'): " + e);
            if (++errorCount == 3) {
                ourDB.delete().then(start);
            }
        });

        ourDB.open();

        ourDB.transaction("rw", ourDB.users, function (users) {
            users.add({ username: "dfahlander" }).then(function () {
                ok(false, "Should not be able to add two users with same username");
            });
        }).then(function () {
            ok(false, "Transaction should not complete since errors wasnt catched");
        });
        ourDB.transaction("rw", ourDB.users, function (users) {
            users.add({ username: "dfahlander" }).then(function () {
                ok(false, "Should not be able to add two users with same username");
            });
        }).then(function () {
            ok(false, "Transaction should not complete since errors wasnt catched");
        });
        ourDB.transaction("rw", ourDB.users, function (users) {
            users.add({ username: "dfahlander" }).then(function () {
                ok(false, "Should not be able to add two users with same username");
            });
        }).then(function () {
            ok(false, "Transaction should not complete since errors wasnt catched");
        });

    });
})();

