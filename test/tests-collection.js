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
        ok(false, "Not implemented");
        start();
    });
    asyncTest("delete", function () {
        ok(false, "Not implemented");
        start();
    });
})();