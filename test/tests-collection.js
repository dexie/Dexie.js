///<reference path="run-unit-tests.html" />

(function () {
    var db = new Dexie("TestDB");
    db.version(1).stores({ users: "++id,first,last,&username,*&email,*pets" });

    var User = db.users.defineClass({
        id:         Number,
        first:      String,
        last:       String,
        username:   String,
        email:      [String],
        pets:       [String],
    });
    db.on("populate", function (trans) {
        trans.users.add({ first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
        trans.users.add({ first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
    });

    module("collection", {
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

    asyncTest("each", 3, function () {
        var array = [];
        db.users.orderBy("id").each(function (user) {
            array.push(user);
        }).then(function () {
            equal(array.length, 2, "Got two users");
            equal(array[0].first, "David", "First is David");
            equal(array[1].first, "Karl", "Second is Karl");
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });
    asyncTest("count", 1, function () {
        db.users.count(function (count) {
            equal(count, 2, "Two objects in table");
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });
    asyncTest("toArray", 3, function () {
        db.users.orderBy("last").toArray(function (a) {
            equal(a.length, 2, "Array length is 2");
            equal(a[0].first, "Karl", "First is Karl");
            equal(a[1].first, "David", "Second is David");
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });
    asyncTest("limit", 6, function () {
        db.transaction("r", db.users, function (users) {

            users.orderBy("last").limit(1).toArray(function (a) {
                equal(a.length, 1, "Array length is 1");
                equal(a[0].first, "Karl", "First is Karl");
            });

            users.orderBy("last").limit(10).toArray(function (a) {
                equal(a.length, 2, "Array length is 2");
            });

            users.orderBy("last").limit(0).toArray(function (a) {
                equal(a.length, 0, "Array length is 0");
            });

            users.orderBy("last").limit(-1).toArray(function (a) {
                equal(a.length, 0, "Array length is -1");
            });

            users.orderBy("id").limit(-1).toArray(function (a) {
                equal(a.length, 0, "Array length is -1");
            });

        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });
    asyncTest("first", 1, function () {
        db.users.orderBy("last").first(function (karlCeder) {
            equal(karlCeder.first, "Karl", "Got Karl");
        }).finally(start);
    });
    asyncTest("last", function () {
        db.users.orderBy("last").last(function (david) {
            equal(david.first, "David", "Got David");
        }).finally(start);
    });
    asyncTest("and", 2, function () {
        db.transaction("r", db.users, function (users) {

            users.where("first")
                .equalsIgnoreCase("david")
                .and(function (user) {
                    return user.email.indexOf("apa") >= 0
                })
                .first(function (user) {
                    equal(user, null, "Found no user with first name 'david' and email 'apa'");
                });

            users.where("first")
                .equalsIgnoreCase("david")
                .and(function (user) {
                    return user.email.indexOf("daw@thridi.com") >= 0
                })
                .first(function (user) {
                    equal(user.first, "David", "Found user with first name 'david' and email 'daw@thridi.com'");
                });

        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

    asyncTest("desc", function () {
        db.transaction("r", db.users, function (users) {

            users.orderBy("first").desc().first(function (user) {
                equal(user.first, "Karl", "Got Karl");
            });

        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

    asyncTest("distinct", function () {
        db.transaction("r", db.users, function (users) {

            users.where("email").startsWithIgnoreCase("d").toArray(function (a) {
                equal(a.length, 2, "Got two duplicates of David since he has two email addresses starting with 'd' (Fails on IE10, IE11 due to not supporting multivalued array indexes)");
            });
            users.where("email").startsWithIgnoreCase("d").distinct().toArray(function (a) {
                equal(a.length, 1, "Got single instance of David since we used the distinct() method. (Fails on IE10, IE11 due to not supporting multivalued array indexes)");
            });

        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

    asyncTest("modify", function () {
        db.transaction("rw", db.users, function (users) {
            var currentTime = new Date();
            users.modify({
                fullName: function (user) { return user.first + " " + user.last },
                lastUpdated: currentTime
            });
            users.toArray(function (a) {
                equal(a.length, 2);
                equal(a[0].first, "David");
                equal(a[0].fullName, "David Fahlander", "Could modify David with a getter function");
                equal(a[0].lastUpdated.getTime(), currentTime.getTime(), "Could set new member lastUpdated on David");
                equal(a[1].lastUpdated.getTime(), currentTime.getTime(), "Could set new member lastUpdated on Karl");
            });
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

    asyncTest("delete", 2, function () {
        db.users.orderBy("id").delete().then(function (numDeleted) {
            equal(numDeleted, 2, "All two records deleted");
            db.users.count(function (count) {
                equal(count, 0, "No users in collection anymore");
            });
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

    asyncTest("delete(2)", 3, function () {
        db.transaction("rw", db.users, function (users) {
            users.add({ first: "dAvid", last: "Helenius", username: "dahel" });
            users.where("first").equalsIgnoreCase("david").delete().then(function (numDeleted) {
                equal(numDeleted, 2, "Two items deleted (Both davids)");
            });
            users.toArray(function (a) {
                equal(a.length, 1, "Deleted one user");
                equal(a[0].first, "Karl", "Only Karl is there now");
            });
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

    asyncTest("delete(3, combine with OR)", 3, function () {
        db.transaction("rw", db.users, function (users) {
            users.add({ first: "dAvid", last: "Helenius", username: "dahel" });
            users.where("first").equals("dAvid").or("username").equals("kceder").delete().then(function (numDeleted) {
                equal(numDeleted, 2, "Two items deleted (Both dAvid Helenius and Karl Cedersköld)");
            });
            users.toArray(function (a) {
                equal(a.length, 1, "Only one item left since dAvid and Karl have been deleted");
                equal(a[0].first, "David", "Only David Fahlander is there now!");
            });
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });


    asyncTest("keys", function () {
        db.users.orderBy("first").keys(function(a) {
            ok(a.length, 2);
            equal(a[0], "David", "First is David");
            equal(a[1], "Karl", "Second is Karl");
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

    asyncTest("uniqueKeys", function () {
        db.transaction("rw", db.users, function (users) {
            users.add({ first: "David", last: "Helenius", username: "dahel" });
            users.orderBy("first").keys(function (a) {
                ok(a.length, 3, "when not using uniqueKeys, length is 3");
                equal(a[0], "David", "First is David");
                equal(a[1], "David", "Second is David");
                equal(a[2], "Karl", "Third is Karl");
            });
            users.orderBy("first").uniqueKeys(function (a) {
                ok(a.length, 2, "when using uniqueKeys, length is 2");
                equal(a[0], "David", "First is David");
                equal(a[1], "Karl", "Second is Karl");
            });
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

    asyncTest("eachKey and eachUniqueKey", function () {
        db.transaction("rw", db.users, function (users) {
            users.add({ first: "Ylva", last: "Fahlander", username: "yfahlander" });
            var a = [];
            users.orderBy("last").eachKey(function (lastName) {
                a.push(lastName);
            }).then(function () {
                equal(a.length, 3, "When using eachKey, number of keys are 3");
            });
            var a2 = [];
            users.orderBy("last").eachUniqueKey(function (lastName) {
                a2.push(lastName);
            }).then(function () {
                equal(a2.length, 2, "When using eachUniqueKey, number of keys are 2");
            });

        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

    asyncTest("or", 14, function () {
        db.transaction("rw", db.users, function (users) {
            users.add({ first: "Apan", last: "Japan", username: "apanjapan" });
            users.where("first").equalsIgnoreCase("david").or("last").equals("Japan").sortBy("first", function (a) {
                equal(a.length, 2, "Got two users");
                equal(a[0].first, "Apan", "First is Apan");
                equal(a[1].first, "David", "Second is David");
            });
            users.where("first").equalsIgnoreCase("david").or("last").equals("Japan").or("id").equals(2).sortBy("id", function (a) {
                equal(a.length, 3, "Got three users");
                equal(a[0].first, "David", "First is David");
                equal(a[1].first, "Karl", "Second is Karl");
                equal(a[2].first, "Apan", "Third is Apan");
            });
            var userArray = [];
            users.where("id").in(1, 2, 3, 4).or("username").in("dfahlander", "kceder", "apanjapan").each(function (user) {
                ok(true, "Found: " + JSON.stringify(user));
                userArray.push(user);
            }).then(function () {
                equal(userArray.length, 3, "Got all three users");
                ok(userArray.some(function (user) { return user.first === "David" }), "David was found");
                ok(userArray.some(function (user) { return user.first === "Karl" }), "Karl was found");
                ok(userArray.some(function (user) { return user.first === "Apan" }), "Apan was found");
            });
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

})();