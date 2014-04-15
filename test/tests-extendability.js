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

        db.transaction("rw", db.activities, db.tasks, function (acts, tasks, trans) {
            //trans._ctx.tf.createPromise(function (resolve, reject) {
            var outerPLS = Dexie.Promise.pls();
            try {
                trans._lock();
                acts.where("Type").equals(2).modify({ Flags: 2 }).finally(function () {
                    trans._unlock();
                });
            } finally {
                Dexie.Promise.PLS = outerPLS;
            }
            acts.where("Flags").equals(2).count(function (count) {
                equal(count, 1, "Should have put one entry there now");
            });
            acts.where("Flags").equals(2).each(function (act) {
                equal(act.Type, 2, "The entry is correct");
            });

        }).catch(function (e) {
            ok(false, e.stack || e);
        }).finally(function () {
            db.delete().then(start);
        });
    });
})();