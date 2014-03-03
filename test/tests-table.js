///<reference path="run-unit-tests.html" />

///<var type="StraightForwardDB" />
(function(){
    var db = new StraightForwardDB("TestDB");
    db.version(1).schema({ employees: "++id,first,last,!username,!*email,*pets" });

    module("table", {
        setup: function () {
            stop();
            StraightForwardDB.delete("TestDB").done(function () {
                db = new StraightForwardDB("TestDB");
                db.version(1).schema({ employees: "++id,first,last,!username,!*email,*pets" });
                db.populate(function(trans){
                    trans.employees.add({first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"]});
                    trans.employees.add({first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: []});
                });
                db.open();
                db.ready(function () {
                    start();
                });
            }).fail(function (e) {
                ok(false, "Could not delete database");
            });
        },
        teardown: function () {
            db.close();
        }
    });

    asyncTest("get", 4, function () {
        db.table("employees").get(1).done(function (obj) {
            equal(obj.first, "David", "Got the first object");
            db.employees.get(2).done(function (obj) {
                equal(obj.first, "Karl", "Got the second object");
                db.employees.get(100).done(function (obj) {
                    ok(true, "Got done() even when getting non-existing object");
                    equal(obj, undefined, "Result is 'undefined' when not existing");
                    start();
                });
            });
        });
    });
    asyncTest("where", 1, function () {
        //db.transaction("rw", db.employees).employees.
        ok(false, "Not implemented");
        start();
    });
    asyncTest("count", 1, function () {
        ok(false, "Not implemented");
        start();
    });
    asyncTest("limit", 1, function () {
        ok(false, "Not implemented");
        start();
    });
})();