///<reference path="run-unit-tests.html" />

(function () {
    module("extendability");
    asyncTest("recursive-pause", function () {
        var db = new Dexie("TestDB");

        db.version(1).stores({
            activities: "Oid,Task,Tick,Tock,Type,Flags",
            tasks: "Oid,Name,Parent"
        });

        var Activity = db.activities.defineClass({
            Oid: String,
            Task: String,
            Tick: Number,
            Tock: Number,
            Type: Number,
            Flags: Number
        });

        db.on('populate', function (trans) {
            var tasks = trans.table("tasks");
            var activities = trans.table("activities");
            tasks.add({ Oid: "T1", Name: "The root task" });
            tasks.add({ Oid: "T2", Name: "The child task", Parent: "T1" });
            activities.add({ Oid: "A1", Task: "T2", Tick: 0, Tock: 10, Type: 1 });
            activities.add({ Oid: "A2", Task: "T2", Tick: 100, Tock: 110, Type: 1 });
            activities.add({ Oid: "A3", Task: "T2", Tick: 200, Tock: 210, Type: 2 });
        });

        db.delete().then(function () { db.open(); });
        
        db.transaction("rw", db.activities, db.tasks, function () {
            Dexie.Promise.newPSD(function () {
                Dexie.currentTransaction._lock();
                db.activities.where("Type").equals(2).modify({ Flags: 2 }).finally(function () {
                    Dexie.currentTransaction._unlock();
                });
            });
            db.activities.where("Flags").equals(2).count(function (count) {
                equal(count, 1, "Should have put one entry there now");
            });
            db.activities.where("Flags").equals(2).each(function (act) {
                equal(act.Type, 2, "The entry is correct");
            });

        }).catch(function (e) {
            ok(false, e.stack || e);
        }).finally(function () {
            db.delete().then(start);
        });
    });

    test("protochain", function () {
        var Promise=Dexie.Promise;
        var root,
            branch1,
            branch2;

        Promise.newPSD(function () {
            root = Promise.PSD;
            root.constructor = function () { }
            root.constructor.prototype = root;

            Promise.newPSD(function () {
                branch1 = Promise.PSD;
                branch1.constructor = function () { }
                branch1.constructor.prototype = branch1;
            });
            Promise.newPSD(function () {
                branch2 = Promise.PSD;
                branch2.constructor = function () { }
                branch2.constructor.prototype = branch2;
            });
        });

        ok(branch1 instanceof root.constructor, "branch1 instanceof root.constructor");
        ok(branch2 instanceof root.constructor, "branch2 instanceof root.constructor");
        ok(!(root instanceof branch1.constructor), "!(root instanceof branch1.constructor)");
        ok(!(root instanceof branch2.constructor), "!(root instanceof branch2.constructor)");
        ok(!(branch1 instanceof branch2.constructor), "!(branch1 instanceof branch2.constructor)");
        ok(!(branch2 instanceof branch1.constructor), "!(branch2 instanceof branch1.constructor)");


    });

    test("protochain2", function () {
        var derive = Dexie.derive;

        function Root() { }
        function Branch1() { }
        function Branch2() { }

        derive(Branch1).from(Root);
        derive(Branch2).from(Root);

        var root = new Root();
        var branch1 = new Branch1();
        var branch2 = new Branch2();

        ok(branch1 instanceof root.constructor, "branch1 instanceof root.constructor");
        ok(branch2 instanceof root.constructor, "branch2 instanceof root.constructor");
        ok(!(root instanceof branch1.constructor), "!(root instanceof branch1.constructor)");
        ok(!(root instanceof branch2.constructor), "!(root instanceof branch2.constructor)");
        ok(!(branch1 instanceof branch2.constructor), "!(branch1 instanceof branch2.constructor)");
        ok(!(branch2 instanceof branch1.constructor), "!(branch2 instanceof branch1.constructor)");

    });


})();