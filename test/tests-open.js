///<reference path="run-unit-tests.html" />

module("open", {
    setup: function () {
        stop();
        Dexie.delete("TestDB").then(function () {
            start();
        }).catch(function (e) {
            ok(false, "Could not delete database");
        });
    },
    teardown: function () {
    }
});

asyncTest("open, add and query data without transaction", 7, function () {
    var db = new Dexie("TestDB");
    db.version(1).stores({ employees: "++id,first,last" });
    ok(true, "Simple version() and stores() passed");
    db.open().on("error", function () {
        ok(false, "Could not open database");
        start();
    });

    db.ready(function () {
        ok(true, "Database could be opened");
        db.employees.add({ first: "David", last: "Fahlander" }).then(function () {
            ok(true, "Could add employee");
            db.employees.where("first").equals("David").toArray(function (a) {
                ok(true, "Could retrieve employee based on where() clause");
                var first = a[0].first;
                var last = a[0].last;
                ok(first == "David" && last == "Fahlander", "Could get the same object");
                equal(a.length, 1, "Length of returned answer is 1");
                ok(a[0].id, "Got an autoincremented id value from the object");
                db.close();
                start();
            });
        });
    });
});

asyncTest("open, add and query data using transaction", function () {
    var db = new Dexie("TestDB");
    db.version(1).stores({ employees: "++id,first,last" });
    db.open().on("error", function () {
        ok(false, "Could not open database");
        start();
    });

    db.transaction("rw", db.employees, function (employees) {

        // Add employee
        employees.add({ first: "David", last: "Fahlander" });

        // Query employee
        employees.where("first").equals("David").toArray(function (a) {
            equal(a.length, 1, "Could retrieve employee based on where() clause");
            var first = a[0].first;
            var last = a[0].last;
            ok(first == "David" && last == "Fahlander", "Could get the same object");
            equal(a.length, 1, "Length of returned answer is 1");
            ok(a[0].id, "Got an autoincremented id value from the object");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(function() {
        db.close();
        start();
    });
});
