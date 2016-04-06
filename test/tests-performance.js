import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {spawnedTest} from './dexie-unittest-utils';

module("performance", {
    setup: function () {
    },
    teardown: function () {
        stop(); Dexie.delete("PerformanceDB").onblocked(function() {
            //alert("Please close other browsers and tabs! Another browser or tab is blocking the database from being deleted. ");
        }).catch(function (e) {
            ok(false, e);
        }).finally(function () {
            start();
        });
    }
});

var tick = 0,lastPerf=false;
function log(txt, noPerf) {
    let logstr = (tick && lastPerf ? "took " + (Date.now()-tick) + "ms.\n" :"") + txt + (noPerf?"\n":"");
    ok(true, logstr);
    tick = Date.now();
    lastPerf = !noPerf;
}

spawnedTest("Collection.delete()", function* () {
    const db = new Dexie("dedatabase");
    const Promise = Dexie.Promise;
    db.version(1).stores({
        storage: "id",
    });

    const MAX = 10000;
    var data = [];
    for(let i = 0; i<MAX; i++) {
        data.push({id: i});
    }

    try {
        log("Deleting db");
        yield db.delete();
        log(`Inserting data (${MAX} items):`);
        yield db.storage.bulkAdd(data);
        log(`done. Deleting items using db.storage.where("id").between(100, ${MAX - 100}).delete()`);
        yield db.storage.where("id").between(100, MAX - 100).delete();
        log("done");
        equal (yield db.storage.count(), 200, "Should be just 200 items left now after deletion");
    } catch (e) {
        ok(false, "Uh oh ERROR: " + e);
    } finally {
        yield db.delete();
    }
});

asyncTest("performance: add/equalsIgnoreCase/each", function () {
    var db = new Dexie("PerformanceDB");
    db.version(1).stores({ emails: "++id,from,to,subject,message,shortStr" });
    db.on("blocked", function() {
        alert("Please close other browsers and tabs! Another browser or tab is blocking the database from being upgraded or deleted.");
    });

    var tick;
    function randomString(count) {
        return function () {
            var ms = [];
            for (var i = 0; i < count; ++i) {
                ms.push(String.fromCharCode(32 + Math.floor(Math.random() * 96)));
            }
            return ms.join('');
        }
    }
    db.delete().then(function () {
        return db.open();
    }).then(function(){

        var i;
        var bulkArray = new Array(10000);
        for (i = 1; i <= 10000; ++i) {
            bulkArray[i - 1] = {
                from: "from" + i + "@test.com",
                to: "to" + i + "@test.com",
                subject: "subject" + i,
                message: "message" + i,
                shortStr: randomString(2)()
            };
        }

        tick = Date.now();

        // Create 10,000 emails
        ok(true, "Creating 10,000 emails");
        return db.emails.bulkAdd(bulkArray);
    }).then(function () {
        ok(true, "Time taken: " + (Date.now() - tick));

        // Speed of equals()
        ok(true, "Speed of equals()");
        tick = Date.now();
        return db.emails.where("shortStr").equals("yk").toArray();

    }).then(function (a) {
        var tock = Date.now();
        ok(true, "Time taken: " + (tock - tick));
        ok(true, "Num emails found: " + a.length);
        ok(true, "Time taken per found item: " + (tock - tick) / a.length);

        // Speed of equalsIgnoreCase()
        ok(true, "Speed of equalsIgnoreCase()");
        tick = Date.now();
        return db.emails.where("shortStr").equalsIgnoreCase("yk").toArray();

    }).then (function (a) {
        var tock = Date.now();
        ok(true, "Time taken: " + (tock - tick));
        ok(true, "Num emails found: " + a.length);
        ok(true, "Time taken per found item: " + (tock - tick) / a.length);
                        

        // Speed of manual filter case insensitive search
        ok(true, "Speed of manual filter case insensitive search");
        tick = Date.now();
        var foundEmails = [];
        return db.emails.each(function (email) {
            if (email.shortStr.toLowerCase() === "yk")
                foundEmails.push(email);
        }).then(function () { return foundEmails; });

    }).then (function(foundEmails) {
        var tock = Date.now();
        ok(true, "Time taken: " + (tock - tick));
        ok(true, "Num emails found: " + foundEmails.length);
        ok(true, "Time taken per found item: " + (tock - tick) / foundEmails.length);
        // Measure the time it takes for db.emails.toArra():
        ok(true, "Speed of db.emails.toArray()");
        tick = Date.now();
        return db.emails.toArray();
    }).then(function(result) {
        var tock = Date.now();
        ok(true, "Time taken: " + (tock - tick));
        ok(true, "Num emails found: " + result.length);
        // Measure the time it takes for db.emails.where('message').startsWith('message').toArray()
        ok(true, "Speed of db.emails.where('message').startsWith('message').toArray();");
        tick = Date.now();
        return db.emails.where('message').startsWith('message').toArray();
    }).then(function (result) {
        var tock = Date.now();
        ok(true, "Time taken: " + (tock - tick));
        ok(true, "Num emails found: " + result.length);
    }).catch(Error, function (e) {
        ok(false, e.name + ":" + e.message + " " + e.stack);
    }).catch(function (e) {
        ok(false, e.toString());

    }).finally(function() {
        db.close();
        start();
    });
});
