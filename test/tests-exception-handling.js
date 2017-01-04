import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, spawnedTest} from './dexie-unittest-utils';

var db = new Dexie("TestDBException");
db.version(1).stores({ users: "id,first,last,&username,&*email,*pets" });
db.on("populate", function (trans) {
    db.users.add({ id: 1, first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
    db.users.add({ id: 2, first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
});

module("exception-handling", {
    setup: function () {
        stop();
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    },
    teardown: function () {
    }
});

asyncTest("Uncaught promise should signal 'unhandledrejection'", function(){
    // We must not use finally or catch here because then we don't test what we should.
    var onErrorSignals = 0;
    function onerror(ev) {
        ++onErrorSignals;
        ev.preventDefault();
    }
    var prevUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = onerror;
    db.users.add({ id: 1 });
    setTimeout(()=> {
        equal(onErrorSignals, 1, "unhandledrejection should have been signaled");
        window.onunhandledrejection = prevUnhandledRejection;
        start();
    }, 100);
});

spawnedTest("transaction should abort on collection error", function*(){
    yield db.transaction("rw", db.users, function*() {
        let id = yield db.users.add({id: 3, first: "Foo", last: "Bar", username: "foobar"});
        equal (id, 3);
        yield db.users.where('id').equals(null).toArray();
        ok(false, "Should not come here");
    }).catch(e => {
        ok(true, "Got error because WhereClause.equals(null) should throw DataError: " + e);
    });
    equal (yield db.users.where('first').equals("Foo").count(), 0, "Should not have succeeded to add when transaction was aborted");

    yield db.transaction("rw", db.users, function() {
        db.users.add({id: 3, first: "Foo", last: "Bar", username: "foobar"});
        db.users.where('id').equals(null).toArray(res=> {
            ok(false, "Not possible to query null");
        });
    }).then(()=>{
        ok(false, "Transaction shouldnt commit");
    }).catch(e => {
        ok(true, "Got error because WhereClause.equals(null) should throw TypeError");
    });

    equal (yield db.users.where('first').equals("Foo").count(), 0, "Should not have succeeded to add when transaction was aborted");
});

asyncTest("eventError-transaction-catch", function () {
    db.transaction("rw", db.users, function () {
        db.users.add({ id: 100, username: "dfahlander" }).then(function () {
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
        db.users.add({ id: 100, username: "dfahlander" }).then(function () {
            ok(false, "Should not be able to add two users with same username");
        }).catch(function (e) {
            ok(true, "Got request error: " + e);
        });
        db.users.add({ id: 101, first: "Trazan", last: "Apansson", username: "tapan", email: ["trazan@apansson.barnarne"], pets: ["monkey"] }).then(function (id) {
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
    function deletingHook () {
        // Testing with 
    };
    db.users.hook('deleting', deletingHook);
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
    }).finally(()=>{
        db.users.hook('deleting').unsubscribe(deletingHook);
        start();
    });
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
        db.version(2).upgrade(function () { db.cars.add({ name: "My car", brand: "Pegeut" }); });
        db.version(3).upgrade(function () {
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
        ok(err.toString().indexOf("Oops. Failing in upgrade function") != -1, "Got error: " + err.stack);
        // Create 3rd instance of db that will only read from the existing DB.
        // What we want to check here is that the DB is there but is still
        // only on version 1.
        db = new Dexie("TestUpgrader");
        return db.open();
    }).then(function () {
        ok(false, "The database should not have been created");
    }).catch(err => {
        ok(err instanceof Dexie.NoSuchDatabaseError, "The database doesnt exist");
    }).finally(function () {
        db.delete().then(start);
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

asyncTest("Issue#73 Catching default error where specific error has already been declared in a previous catch clause(A)", function () {
    function CustomError() { }

    var wasCatched = false;
    new Dexie.Promise(function (resolve, reject) {
        setTimeout(function () {
            reject(new Error("apa"));
        }, 0);
    }).then(function () {
        ok(false, "Should not come here");
    }).catch(CustomError, function (e) {
        ok(false, "Should not come here");
    }).catch(function (e) {
        wasCatched = true;
    }).finally(function () {
        ok(wasCatched, "The error was catched in the generic catcher");
        start();
    });
});

asyncTest("Issue#73 Catching default error where specific error has already been declared in a previous catch clause(B)", function () {
    function CustomError() { }

    var wasCatched = false;
    Dexie.Promise.resolve(null).then(function () {
        throw new Error("apa");
    }).then(function () {
        ok(false, "Should not come here");
    }).catch(CustomError, function (e) {
        ok(false, "Should not come here");
    }).catch(function (e) {
        wasCatched = true;
    }).finally(function () {
        ok(wasCatched, "The error was catched in the generic catcher");
        start();
    });
});

asyncTest("Issue #67 - Exception can be thrown in WhereClause methods", function() {
    try {
        Dexie.Promise.all([
            // WhereClause.equals()
            db.users.where('first').equals(false) // Using a non-valid key (boolean) must fail but as a Promise rejection, not an exception.
            .toArray()
            .catch(function(err) {
                ok(true, "Invalid key passed to WhereClause.equals() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.above()
            db.users.where('first').above(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray()
            .catch(function(err) {
                ok(true, "Invalid key passed to WhereClause.above() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.aboveOrEqual()
            db.users.where('first').aboveOrEqual(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray()
            .catch(function(err) {
                ok(true, "Invalid key passed to WhereClause.aboveOrEqual() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.below()
            db.users.where('first').below(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray()
            .catch(function(err) {
                ok(true, "Invalid key passed to WhereClause.below() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.belowOrEqual()
            db.users.where('first').belowOrEqual(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray()
            .catch(function(err) {
                ok(true, "Invalid key passed to WhereClause.belowOrEqual() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.anyOf()
            db.users.where('first').anyOf([undefined, null, false]) // Using a non-valid key (undefined, false) must fail but as a Promise rejection, not an exception.
            .toArray()
            .catch(function(err) {
                ok(true, "Invalid key passed to WhereClause.anyOf() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.between()
            db.users.where('first').between(false, true) // Using a non-valid key (boolean) must fail but as a Promise rejection, not an exception.
            .toArray()
            .catch(function(err) {
                ok(true, "Invalid key passed to WhereClause.between() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.equalsIgnoreCase()
            db.users.where('first').equalsIgnoreCase(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray()
            .catch(function(err) {
                ok(true, "Invalid key passed to WhereClause.equalsIgnoreCase() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.startsWith()
            db.users.where('first').startsWith(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray()
            .catch(function(err) {
                ok(true, "Invalid key passed to WhereClause.startsWith() returned as a failed Promise and not an exception.");
            }),
            // WhereClause.startsWithIgnoreCase()
            db.users.where('first').startsWithIgnoreCase(undefined) // Using a non-valid key (undefined) must fail but as a Promise rejection, not an exception.
            .toArray()
            .catch(function(err) {
                ok(true, "Invalid key passed to WhereClause.startsWithIgnoreCase() returned as a failed Promise and not an exception.");
            })
        ]).catch(function() {
            ok(false, "No promise should finally reject because we catch them all explicitely.")
        }).finally(start);
    } catch (ex) {
        ok(false, "Error was not encapsulated as a Promise failure: " + (ex.stack || ex));
        start();
    }
});

asyncTest("Issue #67 - Regression test - Transaction still fails if error in key", function () {
    db.transaction('rw', db.users, function () {
        db.users.where('first').above("").delete().then(function (num) {
            ok(true, num + " users deleted");
            db.users.where('first').above(undefined).delete();
        });
    }).then(function() {
        ok(false, "Transaction should not commit when we an unhandled error has happened");
    }).catch(function(err) {
        ok(true, "Good, transaction failed as expected");
    }).finally(start);
});

asyncTest("Issue #69 Global exception handler for promises", function () {
    var errorList = [];
    function globalRejectionHandler(ev) {
        console.log("Got error: " + ev.reason);
        if (errorList.indexOf(ev.reason) === -1) // Current implementation: accept multiple redundant triggers
            errorList.push(ev.reason);
        ev.preventDefault();
    }

    window.addEventListener('unhandledrejection', globalRejectionHandler);
        
    // The most simple case: Any Promise reject that is not catched should
    // be handled by the global error listener.
    new Dexie.Promise(function(resolve, reject) {
        reject("first error (by reject)");
    });

    // Also if the rejection was caused by a throw...
    new Dexie.Promise(function() {
        throw "second error (throw)";
    });

    // But when catched it should not trigger the global event:
    new Dexie.Promise(function(resolve, reject) {
        reject("third error (catched)");
    }).catch(function(e) {
        ok(true, "Catched error explicitely: " + e);
    });

    // If catching an explicit error type that was not thrown, it should be triggered
    new Dexie.Promise(function(resolve, reject) {
        reject("Simple error 1");
    }).catch(TypeError, function(e) {
        ok(false, "Error should not have been TypeError");
    });// Real error slip away... should be handled by global handler

    new Dexie.Promise(function(resolve, reject) {
        reject(new TypeError("Type Error 1"));
    }).catch(TypeError, function(e) {
        ok(true, "Catched the TypeError");
        // Now we have handled it. Not bubble to global handler!
    });

    Dexie.Promise.resolve(Promise.reject(new Error("Converting a rejected standard promise to Dexie.Promise but don't catch it")))
    .finally(()=>{    
        // With finally, it should yet trigger the global event:
        return new Dexie.Promise(function(resolve, reject) {
            reject("forth error (uncatched but with finally)");
        });
    }).finally(function() {
        // From issue #43:
        // Prepare by cleaning up any unfinished previous run:
        Dexie.delete("testdb").then(function() {
            // Now just do some Dexie stuff...
            var db = new Dexie("testdb");
            db.version(1).stores({ table1: "id" });
            db.open().then(function() {
                console.log("before");
                throw new Error("FOO"); // Here a generic error is thrown (not a DB error)
                //console.log("after");
            });
            db.delete().finally(function() {
                equal(errorList.length, 6, "THere should be 6 global errors triggered");
                equal(errorList[0], "first error (by reject)", "first error (by reject)");
                equal(errorList[1], "second error (throw)", "second error (throw)");
                equal(errorList[2], "Simple error 1", "Simple error 1");
                equal(errorList[3].message, "Converting a rejected standard promise to Dexie.Promise but don't catch it", "Converting a rejected standard promise to Dexie.Promise but don't catch it");
                equal(errorList[4], "forth error (uncatched but with finally)", "forth error (uncatched but with finally)");
                equal(errorList[5].message, "FOO", "FOO");
                errorList.slice(6).map((e, i)=>`Unexpected error: ${(i+6) + ": " + e.stack}`).forEach(txt => {
                    console.error(txt);
                    ok(false, txt);
                });
                // cleanup:
                window.removeEventListener('unhandledrejection', globalRejectionHandler);
                start();
            });
        });
    });
});
