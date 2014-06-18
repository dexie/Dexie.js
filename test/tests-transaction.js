///<reference path="qunit.js" />
///<reference path="../src/Dexie.js" />
(function () {
    var db = new Dexie("TestDB");
    db.version(1).stores({
        users: "username",
        pets: "++id,kind",
        petsPerUser: "++,user,pet"
    });

    module("transaction", {
        setup: function () {
            stop();
            db.delete().then(function () {
                db.open();
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
                ok(true, "Got error since we tried using a table not in transaction: " + err);
            });
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
            ok(true, "Got error since we tried to write to users when in a readonly transaction: " + err);
        }).finally(start);
    });

    asyncTest("Inactive transaction", function () {
        return db.transaction('rw', db.users, function () {
            return new Dexie.Promise(function (resolve, reject) {
                // Wait a little with resolving this custom promise.... (so that IDB framework must commit the transaction)
                setTimeout(resolve, 100);

                // Notify log when transaction completes too early
                Dexie.currentTransaction.complete(function () {
                    ok(true, "Transaction committing too early...");
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
            ok(true, "Got error because the transaction has already committed: " + err);
        }).finally(start);
    });

    asyncTest("Inactive transaction 2", function () {
        return db.transaction('rw', db.users, function () {
            // First make an operation so that transaction is internally created (this is the thing differing from the previous test case
            return db.users.add({ username: "arne" }).then(function () {

                // Create a custom promise that will use setTimeout() so that IDB transaction will commit
                return new Dexie.Promise(function (resolve, reject) {
                    // Wait a little with resolving this custom promise.... (so that IDB framework must commit the transaction)
                    setTimeout(resolve, 100);

                    // Notify log when transaction completes too early
                    Dexie.currentTransaction.complete(function () {
                        ok(true, "Transaction committing too early...");
                    })
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
            ok(true, "Got error because the transaction has already committed: " + err);
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
            db.users.count(function (count) {
                equal(count, 5, "There are five users in db");
            });
            db.pets.count(function (count) {
                equal(count, 3, "There are three pets in db");
            });
            db.petsPerUser.count(function (count) {
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
        db.transaction('rw', db.users, function () {
            db.users.add({ username: "bertil" });
            db.transaction('rw', db.users, db.pets, function () {
                db.pets.add({ kind: "cat" });
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
    
    asyncTest("Transaction bound to different db instance", function () {

        var counter = 0;
        var db2 = new Dexie("TestDB");
        db2.open();        
        db.transaction('rw', "users", "pets", function () {
            ok(true, "Entered outer transaction scope");
            db2.transaction('rw', "users", "pets", function () {
                ok(false, "Should not enter transaction scope when incompatible database instances");
            }).catch(function (err) {
                ok(true, "Got error: " + err);
            }).finally(function () {
                db2.close();
                if (++counter == 2) start();
            });
        }).then(function () {
            ok(false, "Main transaction should not resolve due to error in sub transaction");
        }).catch(function (err) {
            ok(true, "Got error: " + err);
        }).finally(function() {
            if (++counter == 2) start();
        });
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
        db2.open();
        db.transaction('rw', "users", "pets", function () {
            db2.transaction('rw!', "users", "pets", function () {
                ok(true, "Possible to enter a transaction in db2");
            }).catch(function (err) {
                ok(false, "Got error: " + err);
            }).finally(function () {
                db2.delete().then(function () {
                    if (++counter == 2) start();
                });
            });
        }).finally(function () {
            if (++counter == 2) start();
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
                db2.delete().then(function () {
                    if (++counter == 2) start();
                });
            });
        }).finally(function () {
            if (++counter == 2) start();
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

})();
//debugger;