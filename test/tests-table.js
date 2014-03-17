///<reference path="run-unit-tests.html" />

///<var type="Dexie" />
(function(){
    var db = new Dexie("TestDB");
    db.version(1).stores({ users: "++id,first,last,&username,*&email,*pets" });

    //db.users.mapToClass(User);
    var User = db.users.defineClass({
        id:         Number,
        first:      String,
        last:       String,
        username:   String,
        email:      [String],
        pets:       [String],
    });

    db.on("populate", function (trans) {
        trans.users.add({first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"]});
        trans.users.add({first: "Karl", last: "Faadersköld", username: "kceder", email: ["karl@ceder.what", "dadda@ceder.what"], pets: []});
    });

    module("table", {
        setup: function () {
            stop();
            db.delete().catch(function (e) {
                ok(false, "Could not delete database");
            }).then(function () {
                db.open().error(function (e) {
                    ok(false, "Database Error: " + e);
                });
                start();
            });
        },
        teardown: function () {
            stop();
            db.delete().then(start);
        }
    });

    asyncTest("get", 4, function () {
        db.table("users").get(1, function (obj) {
            equal(obj.first, "David", "Got the first object");
            db.users.get(2).then(function (obj) {
                equal(obj.first, "Karl", "Got the second object");
                db.users.get(100).then(function (obj) {
                    ok(true, "Got then() even when getting non-existing object");
                    equal(obj, undefined, "Result is 'undefined' when not existing");
                    start();
                });
            });
        });
    });
    asyncTest("where", function () {
        var trans = db.transaction("r", db.users);
        trans.users.where("username").equals("kceder").first(function (user) {
            equal(user.first, "Karl", "where().equals()");
        }),
        trans.users.where("id").above(1).toArray(function (a) {
            ok(a.length == 1, "where().above()");
        }),
        trans.users.where("id").aboveOrEqual(1).toArray(function (a) {
            ok(a.length == 2, "where().aboveOrEqual()");
        }),
        trans.users.where("id").below(2).count(function (count) {
            ok(count == 1, "where().below().count()");
        }),
        trans.users.where("id").below(1).count(function (count) {
            ok(count == 0, "where().below().count() should be zero");
        }),
        trans.users.where("id").belowOrEqual(1).count(function (count) {
            ok(count == 1, "where().belowOrEqual()");
        }),
        trans.users.where("id").between(1, 1).count(function (count) {
            ok(count == 0, "where().between(1, 1)");
        }),
        trans.users.where("id").between(0, 100).count(function (count) {
            ok(count == 2, "where().between(0, 100)");
        }),
        trans.users.where("id").between(1, 1, true, true).count(function (count) {
            ok(count == 1, "where().between(1, 1, true, true)");
        }),
        trans.users.where("id").between(1, -1, true, true).count(function (count) {
            ok(count == 0, "where().between(1, -1, true, true)");
        }),
        trans.users.where("id").between(1, 2).count(function (count) {
            ok(count == 1, "where().between(1, 2)");
        }),
        trans.users.where("id").between(1, 2, true, true).count(function (count) {
            ok(count == 2, "where().between(1, 2, true, true)");
        }),
        trans.users.where("id").between(1, 2, false, false).count(function (count) {
            ok(count == 0, "where().between(1, 2, false, false)");
        });
        trans.users.where("last").startsWith("Fah").toArray(function (a) {
            equal(a.length, 1, "where().startsWith(existing) only matches Fahlander, not Faadersköld");
            equal(a[0].first, "David");
        });
        trans.users.where("last").startsWith("Faa").toArray(function (a) {
            equal(a.length, 1, "where().startsWith(existing) only matches Faadersköld, not Fahlander");
            equal(a[0].first, "Karl");
        });
        trans.users.where("last").startsWith("Fa").toArray(function (a) {
            equal(a.length, 2, "length = 2 on: where().startsWith(2 existing)");
            equal(a[0].first, "Karl", "Karl found first on last 'Faadersköld'");
            equal(a[1].first, "David", "David found second on last 'Fahlander'");
        });
        trans.users.where("last").equalsAnyOf("Fahlander", "Faadersköld").toArray(function (a) {
            equal(a.length, 2, "equalsAnyOf() returned expected number of items");
            equal(a[0].last, "Faadersköld", "Faadersköld is first");
        });
        trans.users.where("last").equalsAnyOf("Fahlander", "Faadersköld").desc().toArray(function (a) {
            equal(a.length, 2, "equalsAnyOf().desc() returned expected number of items");
            equal(a[0].last, "Fahlander", "Fahlander is first");
        });
        trans.users.where("last").equalsAnyOf("Faadersköld").toArray(function (a) {
            equal(a.length, 1, "equalsAnyOf() returned expected number of items");
        });

        trans.users.where("email").equals("david@awarica.com").toArray(function (a) { // Fails in IE with 0 due to that IE is not implementing to index string arrays.
            equal(a.length, 1, "Finding items from array members. Expect to fail on IE10/IE11.");
        });
        trans.users.where("email").startsWith("da").distinct().toArray(function (a) { // Fails on IE with 0
            equal(a.length, 2, "Found both because both have emails starting with 'da'");
        });
        trans.complete(start)
             .error(function (e) {
                ok(false, "Transaction failed: " + e);
            });
    });
    asyncTest("count", function () {
        db.users.count(function (count) {
            equal(count, 2, "Table.count()");
            start();
        }).catch(function (e) {
            ok(false, e.message);
            start();
        });;
    });
    asyncTest("count with limit", function () {
        db.users.limit(1).count(function (count) {
            equal(count, 1, "Table.limit().count()");
            start();
        });
    });
    asyncTest("limit(),orderBy(),modify(), abort(), desc()", function () {
        var t = db.transaction("rw", db.users);
        t.complete(function () {
            start();
        });
        t.error(function (e) {
            ok(false, "Error: " + e);
            start();
        });

        // Modify first found user with a helloMessage
        t.users.orderBy("first").desc().limit(1).modify({
            helloMessage: function (user) { return "Hello " + user.first; }
        });

        // Check that the modification went fine:
        t.users.orderBy("first").desc().toArray(function (a) {
            equal(a[0].first, "Karl", "First item is Karl");
            equal(a[0].helloMessage, "Hello Karl", "Karl got helloMessage 'Hello Karl'");
            equal(a[1].first, "David", "Second item is David");
            ok(!a[1].helloMessage, "David was not modified due to limit()");
        });

    });
    asyncTest("each", function () {
        var users = [];
        db.users.each(function (user) {
            users.push(user);
        }).then(function () {
            equal(users.length, 2, "Got 2 users");
            equal(users[0].first, "David", "Got David");
            equal(users[1].first, "Karl", "Got Karl");
            start();
        });
    });
    asyncTest("put", function () {
        var t = db.transaction("rw", db.users);
        /*db.users.get("a", function (a) {
            
        });
        t.users.where("first").equals("a").first(function (ape) {
            
        });*/

        var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };
        t.users.put(newUser).then(function (id) {
            equal(id, 3, "Got id 3 because we didnt supply an id");
            equal(newUser.id, id, "The id property of the new user was set");
        });
        t.users.where("username").equals("aper").first(function (user) {
            equal(user.last, "Persbrant", "The correct item was actually added");
        });

        t.complete(start);
    });
    asyncTest("add", function () {
        var t = db.transaction("rw", db.users);
        var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };

        t.users.add(newUser).then(function (id) {
            equal(id, 3, "Got id 3 because we didnt supply an id");
            equal(newUser.id, id, "The id property of the new user was set");
        });

        t.users.where("username").equals("aper").first(function (user) {
            equal(user.last, "Persbrant", "The correct item was actually added");
        });

        t.complete(start).error(function (e) {
            ok(false, "Error: " + e);
        });
    });
    asyncTest("delete", function () {
        // Without transaction
        db.users.get(1, function (user) {
            notEqual(user, null, "User with id 1 exists");
        }).then(function () {
            db.users.delete(1).then(function () {
                db.users.get(1, function (user) {
                    equal(user, null, "User not found anymore");
                    start();
                });
            });
        });
    });
    asyncTest("delete(using transaction)", function() {
        // With transaction
        var trans = db.transaction("rw", db.users);
        trans.users.get(1, function (user) {
            notEqual(user, null, "User with id 1 exists");
        });
        trans.users.delete(1);
        trans.users.get(1, function (user) {
            equal(user, null, "User not found anymore");
        });
        trans.complete(start);
    });
    asyncTest("clear", function () {
        var trans = db.transaction("rw", db.users);
        trans.users.count(function (count) {
            equal(count, 2, "There are 2 items in database before clearing it");
        });
        trans.users.clear();
        trans.users.count(function (count) {
            equal(count, 0, "There are 0 items in database after it has been cleared");
        });
        trans.complete(start);
    });
})();