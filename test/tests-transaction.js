import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, spawnedTest, promisedTest} from './dexie-unittest-utils';

"use strict";

var db = new Dexie("TestDBTrans");
db.version(1).stores({
    users: "username",
    pets: "++id,kind",
    petsPerUser: "++,user,pet"
});

module("transaction", {
    setup: function () {
        stop();
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    },
    teardown: function () {
    }
});

var NativePromise = window.Promise;

asyncTest("Transaction should work when returning native Promise in transaction scope", function() {
    if (!NativePromise) {
        ok(true, "Current Browser doesn't have a native Promise");
        return start();
    }
    db.transaction('rw', db.users, trans => {
        ok(Dexie.currentTransaction === trans, "First argument to transaction callback should be the transaction instance itself");
        return NativePromise.resolve().then(()=> {
            ok(Dexie.currentTransaction === trans, "Dexie.currentTransaction should persted through the native promise!");
        }).then(()=>{
            return db.users.add({ username: "barfoo" }); // Will only work on Chrome, Opera and Edge as of Oktober 6, 2016.
        }).then(()=>{
            ok(Dexie.currentTransaction === trans, "Dexie.currentTransaction should persted through the native promise!");
            return db.users.count();
        })
    }).then (count => {
        ok(true, `User count: ${count}. REJOICE! YOUR BROWSER'S INDEXEDDB PLAYS BALL WITH PROMISES!`);
    }).catch ('TransactionInactiveError', e => {
        ok(true, "Your browser has native incompatibility between native Promise and IndexedDB. This is why we still avoid returning native promises.");
    }).catch (e => {
        ok(false, `Failed: ${e.stack || e}`);
    }).finally(start);
});

asyncTest("empty transaction block", function () {
    db.transaction('rw', db.users, db.pets, function () {
        ok(true, "Entering transaction block but dont start any transaction");
        // Leave it empty. 
    }).catch(function (err) {
        ok(false, err);
    }).finally(function () {
        setTimeout(start, 10);
    });
});

asyncTest("db.transaction()", function () {
    db.transaction('rw', db.users, function () {
        db.users.add({ username: "arne" });
        return db.users.get("arne", function (user) {
            equal(user.username, "arne", "Got user arne the line after adding it - we must be in a transaction");
            ok(Dexie.currentTransaction != null, "Current Transaction must be set");
        });
    }).then(function () {
        ok(Dexie.currentTransaction == null, "Current Transaction must be null even when transaction scope returned a Promise that was bound to the transaction");
    }).finally(start);
});

asyncTest("Table not in transaction", function () {
    db.pets.add({kind: "dog"}).then(function() {
        return db.transaction('rw', db.users, function () {
            db.users.add({ username: "arne" });
            return db.pets.get(1, function (pet) {
                ok(false, "Should not be able to get a pet because pets is not in transaction");
            });
        }).then(function () {
            ok(false, "Transaction should not commit because I made an error");
        }).catch(function (err) {
            ok(true, "Got error since we tried using a table not in transaction: " + err.stack);
        });
    }).finally(start);
});

asyncTest("Table not in transaction 2", function () {
    return db.transaction('rw', db.users, function () {
    db.pets.add({kind: "dog"});
    }).then(function () {
    ok(false, "Transaction should not commit because I made an error");
    }).catch(function (err) {
    ok(true, "Got error since we tried using a table not in transaction: " + err.stack);
    }).finally(start);
});

asyncTest("Write into readonly transaction", function () {
    return db.transaction('r', db.users, function () {
        db.users.add({ username: "arne" }).then(function(){
            ok(false, "Should not be able to get a here because we tried to write to users when in a readonly transaction");
        });
    }).then(function () {
        ok(false, "Transaction should not commit because I made an error");
    }).catch(function (err) {
        ok(true, "Got error since we tried to write to users when in a readonly transaction: " + err.stack);
    }).finally(start);
});

asyncTest("Inactive transaction", function () {
    return db.transaction('rw', db.users, function () {
        return new Dexie.Promise(function (resolve, reject) {

            // Notify log when transaction completes too early
            Dexie.currentTransaction.complete(function () {
                ok(true, "Transaction committing too early...");
                // Resolve the promise after transaction commit.
                // Flow will continue in the same Transaction scope but with an
                // inactive transaction
                resolve();
            });

        }).then(function () {
            // Now when transaction has already committed, try to add a user with the current transaction:
            return db.users.add({ username: "arne" });
        }).then(function () {
            ok(false, "Should not be able to get a here transaction has become inactive");
        });
    }).then(function () {
        ok(false, "Should not be able to get a here transaction has become inactive");
    }).catch(function (err) {
        ok(true, "Got error because the transaction has already committed: " + err.stack);
    }).finally(start);
});

asyncTest("Inactive transaction 2", function () {
    return db.transaction('rw', db.users, function () {
        // First make an operation so that transaction is internally created (this is the thing differing from the previous test case
        return db.users.add({ username: "arne" }).then(function () {

            // Create a custom promise that will use setTimeout() so that IDB transaction will commit
            return new Dexie.Promise(function (resolve, reject) {
                // Notify log when transaction completes too early
                Dexie.currentTransaction.complete(function() {
                    ok(true, "Transaction committing too early...");
                    resolve();
                });
            });
        }).then(function () {
            // Now when transaction has already committed, try to add a user with the current transaction:
            return db.users.add({ username: "arne" });
        }).then(function () {
            ok(false, "Should not be able to get a here transaction has become inactive");
        });
    }).then(function () {
        ok(false, "Should not be able to get a here transaction has become inactive");
    }).catch(function (err) {
        ok(true, "Got error because the transaction has already committed: " + err.stack);
    }).finally(start);
});

asyncTest("sub-transactions", function () {
    var parentTrans;

    function addUser(user, pets) {
        return db.transaction('rw', db.users, db.pets, db.petsPerUser, function () {
            ok(parentTrans._reculock > 0, "Parent transaction is locked");
            db.users.add(user);
            pets.forEach(function (pet) {
                db.pets.add(pet).then(function (petId) {
                    return db.petsPerUser.add({ user: user.username, pet: petId });
                });
            });
        }).then(function () {
            return db.transaction('rw', db.users, function () {
                db.users.add({ username: user.username + "2" });
                return "hello...";
            });
        });
    }
        
    db.transaction('rw', db.users, db.pets, db.petsPerUser, function () {
        var trans = Dexie.currentTransaction;
        parentTrans = Dexie.currentTransaction;
        ok(trans._reculock === 0, "Main transaction not locked yet");
        addUser({ username: "user1" }, [{ kind: "dog" }, { kind: "cat" }]).then(function () {
            db.users.get("someoneelse", function (someone) {
                equal(someone.username, "someoneelse", "Someonelse was recently added");
            });
        });
        ok(trans._reculock > 0, "Main transaction is now locked");
        db.users.get("someoneelse", function (someone) {
            ok(!someone, "Someoneelse not yet added");
        });
        db.users.add({ username: "someoneelse" });
        return addUser({ username: "user2" }, [{ kind: "giraff" }]).then(function (val) {
            ok(trans._reculock == 0, "Main transaction not locked anymore");
            return val;
        });
    }).then(function (retval) {
        equal(retval, "hello...", "Return value went all the way down to transaction resolvance");
        ok(Dexie.currentTransaction == null, "Dexie.currentTransaction is null");
        db.users.count(function (count) { // Transaction-less operation!
            equal(count, 5, "There are five users in db");
        });
        db.pets.count(function (count) {// Transaction-less operation!
            equal(count, 3, "There are three pets in db");
        });
        db.petsPerUser.count(function (count) {// Transaction-less operation!
            equal(count, 3, "There are three pets-to-user relations");
        });
    }).then(function () {
        ok(Dexie.currentTransaction == null, "Dexie.currentTransaction is null");
        // Start an outer transaction
        return db.transaction('rw', db.users, function () {
            // Do an add operation
            db.users.add({ username: "sune" });//.then(function () {
            // Start an inner transaction
            db.transaction('rw', db.users, function () {
                // Do an add-operation that will result in ConstraintError:
                db.users.add({ username: "sune" });
            }).then(function () {
                ok(false, "Transaction shouldn't have committed");
            }).catch("ConstraintError", function (err) {
                ok(true, "Got ContraintError when trying to add multiple users with same username");
            }).catch(function (err) {
                ok(false, "Got unknown error: " + err);
            });
            //});
        }).catch("ConstraintError", function (err) {
            // Yes, it should fail beause of limited rollback support on nested transactions:
            // https://github.com/dfahlander/Dexie.js/wiki/Dexie.transaction()#limitations-with-nested-transactions
            ok(true, "Got constraint error on outer transaction as well");
        });
    }).catch(function (err) {
        ok(false, "Error: " + err);
    }).finally(start);
});

asyncTest("Three-level sub transactions", function () {
    db.transaction('rw', db.users, db.pets, db.petsPerUser, function () {
        db.users.add({ username: "ojsan" });
        db.transaction('rw', db.users, db.pets, function () {
            db.users.add({ username: "ojsan2" });
            db.users.toCollection().delete();
            db.transaction('r', db.users, function () {
                db.users.toArray(function (usersArray) {
                    equal(usersArray.length, 0, "All users should be deleted");
                    Dexie.currentTransaction.abort();
                });
            });
        });
    }).then(function () {
        ok(false, "Shouldnt work");
    }).catch(function (err) {
        ok(true, "Got error: " + err);
    }).finally(start);
});


asyncTest("Table not in main transactions", function () {
    Dexie.Promise.resolve().then(()=>{
        return db.transaction('rw', db.users, function () {
            db.users.add({username: "bertil"});
            db.transaction('rw', db.users, db.pets, function () {
                db.pets.add({kind: "cat"});
            });
        });
    }).then(function () {
        ok(false, "Shouldnt work");
    }).catch(function (err) {
        ok(true, "Got error: " + err);
    }).finally(start);
});

asyncTest("Transaction is not in read-mode", function () {
    db.transaction('r', db.users, db.pets, function () {
        db.users.toArray();
        db.transaction('rw', db.users, db.pets, function () {
            db.pets.add({ kind: "cat" });
        });
    }).then(function () {
        ok(false, "Shouldnt work");
    }).catch(function (err) {
        ok(true, "Got error: " + err);
    }).finally(start);
});
    
//
// Testing the "!" mode
//

asyncTest("'!' mode: Table not in main transactions", function () {
    var counter = 0;
    db.transaction('rw', db.users, function () {
        db.users.add({ username: "bertil" });
        db.transaction('rw!', db.users, db.pets, function () {
            db.pets.add({ kind: "cat" });
        }).then(function () {
            ok(true, "Inner transaction complete");
        }).catch(function (err) {
            ok(false, "Got error in inner transaction: " + err);
        }).finally(function () {
            if (++counter == 2) start();
        });
        Dexie.currentTransaction.abort(); // Aborting outer transaction should not abort inner.

    }).then(function () {
        ok(false, "Outer transaction should not complete");
    }).catch(function (err) {
        ok(true, "Got Abort Error: " + err);
    }).finally(function () {
        if (++counter == 2) start();
    });
});

asyncTest("'!' mode: Transaction is not in read-mode", function () {
    var counter = 0;
    db.transaction('r', db.users, db.pets, function () {
        db.users.toArray();
        db.transaction('rw!', db.users, db.pets, function () {
            db.pets.add({ kind: "cat" });
        }).then(function () {
            ok(true, "Inner transaction complete");
        }).catch(function (err) {
            ok(false, "Got error: " + err);
        }).finally(function () {
            if (++counter == 2) start();
        });
    }).then(function () {
        ok(true, "Outer transaction complete");
    }).catch(function (err) {
        ok(false, "Got error: " + err);
    }).finally(function () {
        if (++counter == 2) start();
    });
});

asyncTest("'!' mode: Transaction bound to different db instance", function () {
    var counter = 0;
    var db2 = new Dexie("TestDB2");
    db2.version(1).stores({
        users: "username",
        pets: "++id,kind",
        petsPerUser: "++,user,pet"
    });
    
    db2.delete()
    .then(()=>db2.open())
    .then(()=>db.transaction('rw', "users", "pets", function () {
        db2.transaction('rw!', "users", "pets", function () {
            ok(true, "Possible to enter a transaction in db2");
        }).catch(function (err) {
            ok(false, "Got error: " + err);
        }).finally(function () {
            if (++counter == 2) db2.delete().then(start);
            console.log("finally() in db2.transaction(). counter == " + counter);
        });
    })).finally(function () {
        if (++counter == 2) db2.delete().then(start);
        console.log("finally() in db.transaction(). counter == " + counter);
    });
});

//
// Testing the "?" mode
//

asyncTest("'?' mode: Table not in main transactions", function () {
    var counter = 0;
    db.transaction('rw', db.users, function () {
        db.users.add({ username: "bertil" });
        db.transaction('rw?', db.users, db.pets, function () {
            db.pets.add({ kind: "cat" });
        }).then(function () {
            ok(true, "Inner transaction complete");
        }).catch(function (err) {
            ok(false, "Got error in inner transaction: " + err);
        }).finally(function () {
            if (++counter == 2) start();
        });
        Dexie.currentTransaction.abort(); // Aborting outer transaction should not abort inner.

    }).then(function () {
        ok(false, "Outer transaction should not complete");
    }).catch(function (err) {
        ok(true, "Got Abort Error: " + err);
    }).finally(function () {
        if (++counter == 2) start();
    });
});

asyncTest("'?' mode: Transaction is not in read-mode", function () {
    var counter = 0;
    db.transaction('r', db.users, db.pets, function () {
        db.users.toArray();
        db.transaction('rw?', db.users, db.pets, function () {
            db.pets.add({ kind: "cat" });
        }).then(function () {
            ok(true, "Inner transaction complete");
        }).catch(function (err) {
            ok(false, "Got error: " + err);
        }).finally(function () {
            if (++counter == 2) start();
        });
    }).then(function () {
        ok(true, "Outer transaction complete");
    }).catch(function (err) {
        ok(false, "Got error: " + err);
    }).finally(function () {
        if (++counter == 2) start();
    });
});

asyncTest("'?' mode: Transaction bound to different db instance", function () {
    var counter = 0;
    var db2 = new Dexie("TestDB2");
    db2.version(1).stores({
        users: "username",
        pets: "++id,kind",
        petsPerUser: "++,user,pet"
    });
    db2.open();
    db.transaction('rw', "users", "pets", function () {
        db2.transaction('rw?', "users", "pets", function () {
            ok(true, "Possible to enter a transaction in db2");
        }).catch(function (err) {
            ok(false, "Got error: " + err);
        }).finally(function () {
            if (++counter == 2) db2.delete().then(start);
        });
    }).finally(function () {
        if (++counter == 2) db2.delete().then(start);
    });
});

asyncTest("'?' mode: Three-level sub transactions", function () {
    db.transaction('rw', db.users, db.pets, db.petsPerUser, function () {
        db.users.add({ username: "ojsan" });
        db.transaction('rw?', db.users, db.pets, function () {
            db.users.add({ username: "ojsan2" });
            db.users.toCollection().delete();
            db.transaction('r?', db.users, function () {
                db.users.toArray(function (usersArray) {
                    equal(usersArray.length, 0, "All users should be deleted");
                    Dexie.currentTransaction.abort();
                });
            });
        });
    }).then(function () {
        ok(false, "Shouldnt work");
    }).catch(function (err) {
        ok(true, "Got error: " + err);
    }).finally(start);
});

asyncTest("Transactions in multiple databases", function () {
	var logDb = new Dexie("logger");
	logDb.version(1).stores({
		log: "++,time,type,message"
	});
	var lastLogAddPromise;
	logDb.open().then(()=>{
	    return db.transaction('rw', db.pets, function () {
            // Test that a non-transactional add in the other DB can coexist with
            // the current transaction on db:
            logDb.log.add({time: new Date(), type: "info", message: "Now adding a dog"});
            db.pets.add({kind: "dog"}).then(function(petId){
                // Test that a transactional add in the other DB can coexist with
                // the current transaction on db:
                lastLogAddPromise = logDb.transaction('rw!', logDb.log, function (){
                    logDb.log.add({time: new Date(), type: "info", message: "Added dog got key " + petId});
                });
            });
        });
	}).then(function() {
		return lastLogAddPromise; // Need to wait for the transaction of the other database to complete as well.
	}).then(function(){
		return logDb.log.toArray();
	}).then(function (logItems) {
		equal(logItems.length, 2, "Log has two items");
		equal(logItems[0].message, "Now adding a dog", "First message in log is: " + logItems[0].message);
		ok(logItems[1].message.indexOf("Added dog got key ") === 0, "Second message in log is: " + logItems[1].message);
	}).catch(function (err) {
		ok(false, err);
	}).finally(function(){
		return logDb.delete();
	}).finally(start);
});

asyncTest("Issue #71 If returning a Promise from from a sub transaction, parent transaction will abort", function () {
    db.transaction('rw', db.users, db.pets, function () {
        ok(true, "Entered parent transaction");
        ok(true, "Now adding Gunnar in parent transaction");
        db.users.add({ username: "Gunnar" }).then(function() {
            ok(true, "First add on parent transaction finished. Now adding another object in parent transaction.");
            db.pets.add({ kind: "cat", name: "Garfield" }).then(function() {
                ok(true, "Successfully added second object in parent transaction.");
            }).catch(function(err) {
                ok(false, "Failed to add second object in parent transaction: " + err.stack || err);
            });
        });

        db.transaction('rw', db.users, function() {
            ok(true, "Entered sub transaction");
            return db.users.add({ username: "JustAnnoyingMyParentTransaction" }).then(function() {
                ok(true, "Add on sub transaction succeeded");
            }).catch(function(err) {
                ok(false, "Failed to add object in sub transaction: " + err.stack || err);
            });
        });
    }).finally(start);
});

asyncTest("Issue #91 Promise.resolve() from within parent transaction", function () {
	db.transaction('rw', db.users, db.pets, function () {
	    ok(true, "Entered parent transaction");
	    var trans = Dexie.currentTransaction;

	    return db.transaction('rw', db.users, function() {
	        ok(true, "Entered sub transaction");
	        ok(Dexie.currentTransaction !== trans, "We are not in parent transaction");
	        ok(Dexie.currentTransaction.parent === trans, "...but in a sub transaction");
	        return Dexie.Promise.resolve(3);
	    }).then(function (result) {
	        equal(result, 3, "Got 3");
	        ok(Dexie.currentTransaction === trans, "Now we are in parent transaction");
	        db.users.add({ username: "Gunnar" });
	        return db.users.where("username").equals("Gunnar").first();
	    }).then(function(result) {
	        ok(!!result, "Got result");
	        equal(result.username, "Gunnar", "Got the Gunnar we expected");
	        return Dexie.Promise.resolve(result);
	    }).catch(function(e) {
	        ok(false, "Error: " + e.stack);
	    });
	}).then(function(result) {
	    ok(!!result, "Got result");
	    equal(result.username, "Gunnar", "Got the Gunnar we expected");
	}).catch(function(e) {
	    ok(false, "Error at root scope: " + e.stack);
	}).finally(start);
});

asyncTest("Issue #95 Nested transactions fails if parent transaction don't execute any operation", function () {
    function smallChild() {
        return db.transaction('rw', db.users, db.pets, function () {
            console.log("Entering small child");
            return db.users.add({ // Here: Test succeeded if removing the 'return' statement here!
                username: 123,
                value: 'val'
            }).then(function (res) {
                ok(true, "smallChild() could add user with primary key " + res);
                return res;
            }).catch(function (err) {
                ok(false, 'SCCA' + err);
            });
        }).then(function(res) {
            ok(true, "smallChild's 3rd level nested transaction commited with result " + res);
        }).catch (function (err) {
            ok(false, 'SCTR' + err);
        });
    }

    function middleChild() {
        return db.transaction('rw', db.users, db.pets, function () {
            console.log("Entering middle child");
            return db.pets.add({
                id: 321,
                value: 'anotherval'
            }).catch (function (err) {
                ok(false, 'MCCA' + err);
            });
        }).catch (function (err) {
            ok(false, 'MCTR' + err);
        });
    }

    function bigParent() {
        // Nesting transaction without starting the real indexedDB transaction cause an error?
        return db.transaction('rw', db.users, db.pets, function () { // Here: Test succeeded if skipping the outermost transaction scope.
            console.log("Entering root transaction");
            return db.transaction('rw', db.users, db.pets, function () {
                console.log("Entering first sub transaction");
                return smallChild().then(function () {
                    return middleChild();
                }).catch (function (err) {
                    ok(false, 'BPCA ' + err);
                });
            }).catch (function (err) {
                ok(false, 'BPTRI ' + err);
            });
        }).catch (function (err) {
            ok(false, 'BPTRX ' + err);
        });
    }

    bigParent().then(function(res) {
        ok(true, "done");
    }).catch(function(e) {
        ok(false, "Final error: " + e);
    }).finally(start);
});

asyncTest("Issue #91 / #95 with Dexie.Promise.resolve() mixed in here and there...", function () {
	ok(!Dexie.currentTransaction, "There is no ongoing transaction");
    db.transaction('rw', db.pets, function () {
        var rootLevelTransaction = Dexie.currentTransaction;
        ok(true, "Entered root transaction scope");
        return db.transaction('rw', db.pets, function() {
            ok(true, "Entered sub scope");
            var level2Transaction = Dexie.currentTransaction;
            ok(level2Transaction.parent === rootLevelTransaction, "Level2 transaction's parent is the root level transaction");
            return db.transaction('rw', db.pets, function() {
                ok(true, "Entered sub of sub scope");
                var innermostTransaction = Dexie.currentTransaction;
                ok(!!innermostTransaction, "There is an ongoing transaction (direct in 3rd level scope)");
                ok(innermostTransaction.parent === level2Transaction, "Parent is level2 transaction");
                return Dexie.Promise.resolve().then(function() {
                    ok(true, "Sub of sub scope: Promise.resolve().then() called");
                    ok(!!Dexie.currentTransaction, "There is an ongoing transaction");
                    ok(Dexie.currentTransaction === innermostTransaction, "Still in innermost transaction");
                    return db.pets.add({
                        id: 123,
                        value: 'val'
                    }).then(function(resultId) {
                        ok(true, "Sub of sub scope: add() resolved");
                        ok(Dexie.currentTransaction === innermostTransaction, "Still in innermost transaction");
                        return Dexie.Promise.resolve(resultId).then(function(res) {
                            return Dexie.Promise.resolve(res);
                        });
                    }).then(function(resultId) {
                        ok(true, "Sub if sub scope: Promise.resolve() after add() resolve");
                        ok(Dexie.currentTransaction === innermostTransaction, "Still in innermost transaction");
                        return Dexie.Promise.resolve(resultId);
                    });
                }).then(function() {
                    ok(true, "sub of sub scope chaining further in promise chains...");
                    ok(Dexie.currentTransaction === innermostTransaction, "Still in innermost transaction");
                    return Dexie.Promise.resolve(db.pets.get(123));
                }).then(function(pet) {
                    ok(true, "sub of sub scope chaining further in promise chains 2...");
                    ok(Dexie.currentTransaction === innermostTransaction, "Still in innermost transaction");
                    return Dexie.Promise.resolve(pet.id);
                });
            }).then(function(resultId) {
                ok(true, "Innermost transaction completed");
                ok(Dexie.currentTransaction == level2Transaction, "We should now be executing within level 2 sub transaction");
                return Dexie.Promise.resolve(resultId);
            }).then(function(resultId) {
                ok(Dexie.currentTransaction == level2Transaction, "We should still be executing within level 2 sub transaction");
                return Dexie.Promise.resolve(resultId);
            }).then(function(resultId) {
                equal(resultId, 123, "Result was 123 as expected");
            }).then(function() {
                return db.transaction('rw', db.pets, function() {
                    var innermostTransaction2 = Dexie.currentTransaction;
                    ok(innermostTransaction2.parent == level2Transaction, "Another 3rd level transaction has parent set to our level2 transaction");
                    return db.pets.add({
                        id: 321,
                        value: 'val'
                    }).then(function(resultId2) {
                        return Dexie.Promise.resolve(resultId2);
                    }).then(function(resultId2) {
                        ok(Dexie.currentTransaction === innermostTransaction2, "We're still in the innermostTransaction (second one)");
                        return Dexie.Promise.resolve(resultId2).then(function(x) {
                            ok(Dexie.currentTransaction === innermostTransaction2, "We're still in the innermostTransaction (second one)");
                            return x;
                        });
                    });
                }).then(function(resultId2) {
                    equal(resultId2, 321, "Result2 was 321 as expected");
                    ok(Dexie.currentTransaction === level2Transaction, "We should still be executing within level 2 sub transaction");
                    return "finalResult";
                });
            });
        }).then(function(x) {

            ok(Dexie.currentTransaction === rootLevelTransaction, "Now we're at the root level transaction and can do some more stuff here");

            return db.pets.clear().then(function() {
                return x;
            }).then(function(y) {
                ok(true, "Could clear the pets table for example.");
                return y;
            }).catch(function(e) {
                ok(false, "oops, this was not what I expected!: " + e);
            });
        });

    }).then(function(finalResult) {
        equal(finalResult, "finalResult", "Got the final result");
        ok(!Dexie.currentTransaction, "No ongoing transaction now");
        ok(true, "done");
    }).catch(function(error) {
        ok(false, error.stack);
    }).finally(start);
    ok(!Dexie.currentTransaction, "After main transaction scope: Still no ongoing transaction at this scope");
});

asyncTest("Issue #137 db.table() does not respect current transaction", function() {
    db.transaction('rw', db.users, function() {
        db.users.add({ username: "erictheviking", color: "blue" }).then(function() {
            db.table('users').get('erictheviking', function (eric) {
                ok(eric, "Got back an object");
                equal(eric.color, "blue", "eric.color is still blue. If red, the getter must have been run from another transaction.");
            });
            db.users.put({ username: "erictheviking", color: "red" });
        });
    }).catch(function(e) {
        ok(false, "Error: " + e);
    }).finally(start);
});

asyncTest("Dexie.currentTransaction in CRUD hooks", 53, function () {

    function CurrentTransChecker(scope, trans) {
        return function() {
            ok(Dexie.currentTransaction === trans, "Dexie.currentTransaction correct in " + scope);
        }
    }

    function onCreating(primKey, obj, transaction) {
        ok(!!Dexie.currentTransaction, "Dexie.currentTransaction should exist in creating");
        ok(Dexie.currentTransaction === transaction,
            "Dexie.currentTransaction correct in creating");
        this.onerror = CurrentTransChecker("creating.onerror", transaction);
        this.onsuccess = CurrentTransChecker("creating.onsuccess", transaction);
    }

    function onReading(obj) {
        ok(!!Dexie.currentTransaction, "Dexie.currentTransaction should exist in reading");
        return obj;
    }

    function onUpdating(modifications, primKey, obj, transaction) {
        ok(Dexie.currentTransaction === transaction,
            "Dexie.currentTransaction correct in updating");
        this.onerror = CurrentTransChecker("updating.onerror", transaction);
        this.onsuccess = CurrentTransChecker("updating.onsuccess", transaction);
    }

    function onDeleting(primKey, obj, transaction) {
        ok(Dexie.currentTransaction === transaction,
            "Dexie.currentTransaction correct in deleting");
        this.onsuccess = CurrentTransChecker("deleting.onsuccess", transaction);
    }

    db.users.hook.creating.subscribe(onCreating);
    db.users.hook.reading.subscribe(onReading);
    db.users.hook.updating.subscribe(onUpdating);
    db.users.hook.deleting.subscribe(onDeleting);

    async function doTheTests() {
        await db.users.add({ username: "monkey1" });
        await db.users.add({ username: "monkey1" }).catch(function(ex) {
            ok(true, "Should fail adding a second monkey1");
        }); // Trigger creating.onerror
        // Test bulkAdd as well:
        ok(true, "Testing bulkAdd");
        await db.users.bulkAdd([{ username: "monkey1" }, { username: "monkey2" }])
            .then(()=>ok(false, "Should get error on one of the adds"))
            .catch(Dexie.BulkError, e=>{
                ok(true, "Got BulkError");
                ok(e.failures.length === 1, "One error out of two: " + e);
        });
        await db.users.where("username").equals("monkey1").modify({
            name: "Monkey 1"
        });
        await db.users.where("username").equals("monkey1").modify(user => {
            user.username = "monkey2";// trigger updating.onerror
        }).catch(function(ex) {
            ok(true, "Should fail modifying primary key");
        });
        await db.users.toArray();
        await db.users.delete("monkey2");
        await db.users.delete("monkey1");
    };

    doTheTests().then(function () {
        ok(true, "Now in an explicit transaction block...");
        return db.transaction('rw', db.users, async () => {
            await doTheTests();
        });
    }).catch(function(ex) {
        ok(false, ex);
    }).then(() => {
        db.users.hook.creating.unsubscribe(onCreating);
        db.users.hook.reading.unsubscribe(onReading);
        db.users.hook.updating.unsubscribe(onUpdating);
        db.users.hook.deleting.unsubscribe(onDeleting);
        start();
    });
});

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

promisedTest("waitFor()", async ()=>{
    await db.transaction('rw', db.users, async trans =>{
        // Wait for a promise:
        await trans.waitFor(sleep(100));
        // Do an operation on transaction
        await trans.users.put({username: "testingtesting"});
        await trans.waitFor(sleep(100));
        let result = await trans.users.get("testingtesting");
        ok(result && result.username === "testingtesting", "Should be able to continue transaction after waiting for non-indexedDB promise");
        ok(true, `Waiting spin count:${trans._spinCount}`);

        // With timeout
        await Dexie.waitFor(sleep(2000), 10) // Timeout of 10 ms.
            .then (()=>ok(false, "Should have timed out!"))
            .catch('TimeoutError', ex => ok(true, "Timed out as expected"));
        
        // Wait for function
        await Dexie.waitFor(async ()=>{ 
            ok(Dexie.currentTransaction === null,
                "We should not be in the transaction zone here because transaction can be in a temporary inactive state here");
            await sleep(10);
            ok (true, "Slept 10 ms")
            // Let's test if we can access the transaction from here.
            // The transaction should be alive indeed but not in an active state.
            await trans.users.count().then(()=>{
                // This happens on IE11
                ok(true, "Could access transaction within the wait callback. Nice for you, but you were just lucky!");
            }).catch(ex => {
                // This happens on Firefox and Chrome
                ok(true, "Could NOT access transaction within the wait callback. As expected. Error: " + ex);
            });
            ok(Dexie.currentTransaction === null,
                "We should not be in the transaction zone here because transaction can be in inactive state here");
        });
        
        result = await trans.users.get("testingtesting");
        ok(result && result.username === "testingtesting", "Should still be able to operate on the transaction");
        ok(true, `Waiting spin count:${trans._spinCount}`);
        ok(Dexie.currentTransaction === trans, "Zone info should still be correct");

        // Subtransaction
        await db.transaction('r', db.users, function* (subTrans) {
            ok(subTrans !== trans, "Should be in a sub transaction");
            ok(Dexie.currentTransaction === subTrans, "Should be in a sub transaction");
            let count = yield trans.users.count();
            ok(true, "Should be able to operate on sub transaction. User count = " + count);
            yield subTrans.waitFor(sleep(10));
            ok(true, "Should be able to call waitFor() on sub transaction");
            count = yield trans.users.count();
            ok(true, "Should be able to operate on sub transaction. User count = " + count);
        });

        // Calling waitFor multiple times in parallell
        await Promise.all([
            trans.waitFor(sleep(10)),
            trans.waitFor(sleep(10)),
            trans.waitFor(sleep(10))]);
        ok (true, "Could wait for several tasks in parallell");
        
        result = await trans.users.get("testingtesting");
        ok(result && result.username === "testingtesting", "Should still be able to operate on the transaction");
        //await sleep(100);
        //ok(true, `Waiting spin count:${trans._spinCount}`);
    }).then(()=>ok(true, "Transaction committed"));
});

promisedTest("Dexie.waitFor() outside transaction", async ()=> {
    // Test that waitFor can be called when not in a transaction as well.
    // The meaning of this is that sometimes a function does db operations without
    // a transaction, but should be able to call also within the caller's transaction.
    // A function should therefore be able to call Dexie.waitFor() no matter if is executing
    // within a transaction or not.
    let result = await Dexie.waitFor(sleep(10).then(()=>true));
    ok(result, "Could call waitFor outside a transaction as well");
    let codeExecuted = false;
    await Dexie.waitFor(async ()=>{
        await sleep(10);
        codeExecuted = true;
    });
    ok(codeExecuted, "Could call waitFor(function) outside a transation as well");
});

promisedTest("Dexie.waitFor() TransactionInactiveError", async() => {
    await db.transaction('r', db.users, async ()=>{
        await sleep(100); // Force transaction to become inactive
        try {
            await Dexie.waitFor(sleep(10));
            ok(false, 'After sleeping, transaction just cannot be alive.');
        } catch (err) {
            ok(err.name == 'TransactionInactiveError' || err.name == 'InvalidStateError',
            `Got TransactionInactiveError or InvalidStateError as expected`);
        }
    }).then (()=>{
        ok(false, 'The transaction should not possibly succeed even though catching, because it was too late.');
    }).catch ('PrematureCommitError', err => {
        ok(true, 'Got PrematureCommitError as expected');
    });
});

promisedTest("Promise.follow() should omit promises spawned under Dexie.ignoreTransaction()", async ()=>{
    let resolve, reject;
    const p = new Promise((res, rej) => { resolve = res; reject = rej; });
    const log = [];

    await db.transaction('r', db.users, function () {
        // Since we do not return a promise here,
        // Promise.follow() will be used for awaitint all tasks.
        // However, tasks spawned under Dexie.ignoreTransacion() should not be included in promises to wait for.
        Dexie.ignoreTransaction(()=>{
            return new Dexie.Promise(resolve => setTimeout(resolve, 50)).then(()=>{
                return db.pets.put({kind: "dog"});
            }).then(()=>{
                return db.pets.count();
            }).then(numPets => {
                ok(true, `num pets: ${numPets}`);
                log.push("inner-task-done");
            }).then(resolve, reject);
        });
        // The following promise should be awaited for though (because new Promise is spawned from withing a zone or sub-zone to current transaction.)
        new Dexie.Promise(resolve => setTimeout(resolve, 25)).then(()=>{
            //return db.users.get(1);
        }).then(()=>{
            ok(true, "followed promise done");
            log.push("spawned-promise-done");
        }).catch(e => {
            ok(false, e);
        });
    });

    log.push("outer-task-done");
    ok(true, "transaction done");

    await p;

    equal(log.join(','), "spawned-promise-done,outer-task-done,inner-task-done", "outer-task-done should have happened before inner-task-done");

});

promisedTest("db.transaction() should not wait for non-awaited new top-level transactions to commit", async ()=>{
    let resolve, reject;
    const p = new Promise((res, rej) => { resolve = res; reject = rej; });
    const log = [];

    await db.transaction('r', db.users, () => {
        // Since we do not return a promise here,
        // Promise.follow() will be used for awaitint all tasks.
        // However, if we spawn a new top-level transaction. It should be omitted and not waited for:
        db.transaction('rw!', db.pets, () => {
            return db.pets.put({kind: "dog"}).then(()=>{
                return db.pets.count();
            }).then(numPets => {
                ok(true, `num pets: ${numPets}`);
            }).then(()=>{
                return Dexie.waitFor(sleep(50)); // In IE, it sometimes happens that outer transaction is slow to commit (even though it doesnt to anything)
            }).then(()=>{
                log.push("inner-transaction-done");
            }).then(resolve, reject);
        });
    });

    log.push("outer-transaction-done");
    ok(true, "transaction done");

    await p;

    equal(log.join(','), "outer-transaction-done,inner-transaction-done", "outer-transaction-done should have happened before inner-transaction-done");
});
