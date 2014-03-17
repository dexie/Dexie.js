///<reference path="run-unit-tests.html" />

module("objectmapping");

asyncTest("defineClass", function () {
    var db = new Dexie("TestDB");

    db.version(1).schema({
        user: "++id,first,last,&username,*&email,*pets"
    });

    var User = db.users.defineClass({
        id: Number,
        first: String,
        last: String,
        username: String,
        email: [String],
        pets: [String],
    });


});

(function(){
    var db = new Dexie("TestDB");
    db.version(1).schema({
        tasks: "++id,first,last,!username,!*email,*pets"
    });

    var User = db.users.defineClass({
        id: Number,
        first: String,
        last: String,
        username: String,
        email: [String],
        pets: [String],
    });

    db.on("populate", function (trans) {
        trans.users.add({ first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
        trans.users.add({ first: "Karl", last: "Faadersköld", username: "kceder", email: ["karl@ceder.what", "dadda@ceder.what"], pets: [] });
    });
    var Promise = window.Promise || db.classes.Promise;

    module("table", {
        setup: function () {
            stop();
            db.delete().then(function () {
                db.open().ready(function () {
                    start();
                });
                db.error(function (e) {
                    ok(false, "Error: " + e);
                });
            }).catch(function (e) {
                ok(false, "Could not delete database");
            });
        },
        teardown: function () {
            stop(); db.delete().then(start);
        }
    });

    asyncTest("get", 4, function () {
        db.table("users").get(1).then(function (obj) {
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
        /*
        trans.users.where("email").equals("david@awarica.com").toArray(function (a) { // Fails in IE with 0 due to that IE is not implementing to index string arrays.
            equal(a.length, 1, "Finding items from array members. Expect to fail on IE10/IE11.");
        });
        trans.users.where("email").startsWith("da").distinct().toArray(function (a) { // Fails on IE with 0 and on Chrome with 3 even though we use "distinct" here. Chrome seems to handle "nextunique" same as "next".
            equal(a.length, 2, "Found both because both have emails starting with 'da'");
        });*/
        trans.complete(start)
             .error(function (e) {
                 ok(false, "Transaction failed: " + e.message);
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
            ok(false, "Error: " + e.message);
            start();
        });
        t.users.orderBy("first").desc().limit(1).modify({ helloMessage: function (user) { return "Hello " + user.first; } })
            .trap(function (e) {
                ok(false, "Trap: " + e);
                return false;
            }).then(function () {
                t.users.orderBy("first").desc().toArray(function (a) {
                    equal(a[0].first, "Karl", "First item is Karl");
                    equal(a[0].helloMessage, "Hello Karl", "Karl got helloMessage 'Hello Karl'");
                    equal(a[1].first, "David", "Second item is David");
                    ok(!a[1].helloMessage, "David was not modified due to limit()");
                }).catch(function (e) {
                    ok(false, "Inner catch: " + e.message);
                });
            }).catch(function (e) {
                ok(false, "Outer catch: " + e.message);
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
        var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };
        t.users.put(newUser).then(function (id) {
            equal(id, 3, "Got id 3 because we didnt supply an id");
            equal(newUser.id, id, "The id property of the new user was set");
            t.users.where("username").equals("aper").first(function (user) {
                equal(user.last, "Persbrant", "The correct item was actually added");
            });
        });

        ok(false, "Not implemented");
        start();
    });
    asyncTest("add", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("delete", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("clear", function () {
        ok(false, "Not implemented");
        start();
    });
})();