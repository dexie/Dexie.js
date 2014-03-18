///<reference path="run-unit-tests.html" />

(function () {
    var db = new Dexie("TestDB");
    db.version(1).stores({ users: "++id,first,last,&username,&*email,*pets" });
    db.populate(function (trans) {
        trans.users.add({ first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
        trans.users.add({ first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
    });
    var Promise = window.Promise || db.classes.Promise;

    /* To test:
        * That e in db.error(e) and promise.catch(e) is an error string
        * Test that if an error event or exception occur on any operation during a transaction, the error will bubble to the transaction
        * Test that in case modify() or delete() operations are trapped using trap(), the exception should not bubble.
        * Test that if an exception occur during modify() or each sub-operation, catch() or trap() will trigger.
    */

    module("advanced", {
        setup: function () {
            stop();
            db.delete().then(function () {
                db.open().catch(function (e) {
                    ok(false, "Error opening database: " + e);
                }).finally(start);
            }).catch(function (e) {
                ok(false, "Error deleting database: " + e);
                start();
            });
        },
        teardown: function () {
            stop(); db.delete().finally(start);
        }
    });
});
