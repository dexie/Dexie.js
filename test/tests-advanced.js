///<reference path="run-unit-tests.html" />

///<var type="StraightForwardDB" />
(function () {
    var db = new StraightForwardDB("TestDB");
    db.version(1).schema({ users: "++id,first,last,!username,!*email,*pets" });
    db.populate(function (trans) {
        trans.users.add({ first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
        trans.users.add({ first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
    });
    var Promise = window.Promise || db.classes.Promise;

    module("advanced", {
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
            db.delete();
        }
    });
});