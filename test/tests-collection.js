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
            stop();
            db.delete().then(start);
        }
    });

    asyncTest("each", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("count", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("toArray", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("limit", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("first", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("last", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("and", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("desc", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("distinct", function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("modify", function () {
        var t = db.transaction("rw", db.users);
        t.complete(function () { start(); });
        t.error(function (e) {
            ok(false, "Error: " + e.message);
            start();
        });
        t.users.orderBy("first").desc().limit(1).modify({ helloMessage: function (user) { return "Hello " + user.first; } }).then(function () {
            t.users.orderBy("first").desc().toArray(function (a) {
                equal(a[0].first, "Karl", "First item is Karl");
                equal(a[0].helloMessage, "Hello Karl", "Karl got helloMessage 'Hello Karl'");
                equal(a[1].first, "David", "Second item is David");
                ok(!a[1].helloMessage, "David was not modified due to limit()");
            });
        });
    });
    asyncTest("delete", function () {
        ok(false, "Not implemented");
        start();
    });
})();