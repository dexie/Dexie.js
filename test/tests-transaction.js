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
            db.users.get("arne", function (user) {
                equal(user.username, "arne", "Got user arne the line after adding it - we must be in a transaction");
            });
        }).finally(start);
    });

    /*asyncTest("sub-transactions", function () {
        var parentTrans;

        function addUser(user, pets) {
            return db.transaction('rw', db.users, db.pets, function () {
                ok(parentTrans._locked(), "Parent transaction is locked");
                db.users.add(user);
                pets.forEach(function (pet) {
                    db.pets.add(pet).then(function (petId) {
                        db.petsPerUser.add({ user: user.username, pet: petId });
                    });
                });
            }).then(function () {
                ok(!parentTrans._locked(), "Parent transaction not locked anymore");
                return "hello...";
            });
        }
        
        db.transaction('rw', db.users, db.pets, function () {
            var trans = Dexie.currentTransaction;
            parentTrans = Dexie.currentTransaction;
            ok(!trans._locked(), "Main transaction not locked yet");
            addUser({ username: "user1" }, [{ kind: "dog" }, { kind: "cat" }]).then(function () {
                db.users.get("someoneelse", function (someone) {
                    equal(someone.username, "someoneelse", "Someonelse was recently added");
                });
            });
            ok(trans._locked(), "Main transaction is now locked");
            db.users.get("someoneelse", function (someone) {
                ok(!someone, "Someoneelse not yet added");
            });
            db.users.add({ username: "someoneelse" });
            return addUser({ username: "user2" }, [{ kind: "giraff" }]).then(function () {
                ok(!trans._locked(), "Main transaction not locked anymore");
            });
        }).then(function (retval) {
            equal(retval, "hello...", "Return value went all the way down to transaction resolvance");
            db.users.count(function (count) {
                equal(count, 3, "There are three users in db");
            });
            db.pets.count(function (count) {
                equal(count, 3, "There are three pets in db");
            });
            db.petsPerUser.count(function (count) {
                equal(count, 3, "There are three pets-to-user relations");
            });
        }).finally(start);
    });*/


})();