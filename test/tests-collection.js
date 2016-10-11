import Dexie from 'dexie';
import {module, stop, start, test, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, supports, spawnedTest} from './dexie-unittest-utils';

var db = new Dexie("TestDBCollection");
db.version(1).stores({ users: "id,first,last,&username,*&email,*pets" });

var User = db.users.defineClass({
    id:         Number,
    first:      String,
    last:       String,
    username:   String,
    email:      [String],
    pets:       [String],
});
db.on("populate", function () {
    db.users.add({ id: 1, first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"] });
    db.users.add({ id: 2, first: "Karl", last: "Cedersköld", username: "kceder", email: ["karl@ceder.what"], pets: [] });
});

module("collection", {
    setup: function () {
        stop();
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    },
    teardown: function () {
    }
});

spawnedTest("and with values", function*(){
    let array = yield db.users.where("last").inAnyRange([["a","g"],["A","G"]])
        .and(user => user.username === "dfahlander")
        .toArray();
    equal (array.length, 1, "Should find one user with given criteria");
});

spawnedTest("and with keys", function*(){
    let keys = yield db.users.where("last").inAnyRange([["a","g"],["A","G"]])
        .and(user => user.username === "dfahlander")
        .keys();
    equal (keys.length, 1, "Should find one user with given criteria");
});

spawnedTest("and with delete", function*() {
    yield db.users.orderBy('username')
        .and(u => ok(!!u, "User should exist here"))
        .delete();
});

asyncTest("each", 3, function () {
    var array = [];
    db.users.orderBy("id").each(function (user) {
        array.push(user);
    }).then(function () {
        equal(array.length, 2, "Got two users");
        equal(array[0].first, "David", "First is David");
        equal(array[1].first, "Karl", "Second is Karl");
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});
asyncTest("count", 1, function () {
    db.users.count(function (count) {
        equal(count, 2, "Two objects in table");
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});
asyncTest("toArray", 3, function () {
    db.users.orderBy("last").toArray(function (a) {
        equal(a.length, 2, "Array length is 2");
        equal(a[0].first, "Karl", "First is Karl");
        equal(a[1].first, "David", "Second is David");
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});
asyncTest("limit", 6, function () {
    db.transaction("r", db.users, function () {
        db.users.orderBy("last").limit(1).toArray(function (a) {
            equal(a.length, 1, "Array length is 1");
            equal(a[0].first, "Karl", "First is Karl");
        });

        db.users.orderBy("last").limit(10).toArray(function (a) {
            equal(a.length, 2, "Array length is 2");
        });

        db.users.orderBy("last").limit(0).toArray(function (a) {
            equal(a.length, 0, "Array length is 0");
        });

        db.users.orderBy("last").limit(-1).toArray(function (a) {
            equal(a.length, 0, "Array length is 0");
        });

        db.users.orderBy("id").limit(-1).toArray(function (a) {
            equal(a.length, 0, "Array length is 0");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("offset().limit() with advanced combinations", 22, function () {
    db.transaction("rw", db.users, function () {
        for (var i = 0; i < 10; ++i) {
            db.users.add({ id: 3+i, first: "First" + i, last: "Last" + i, username: "user" + i, email: ["user" + i + "@abc.se"] });
        }

        // Using algorithm + count()
        db.users.where("first").startsWithIgnoreCase("first").count(function (count) {
            equal(count, 10, "Counting all 10");
        });
        db.users.where("first").startsWithIgnoreCase("first").limit(5).count(function (count) {
            equal(count, 5, "algorithm + count(): limit(5).count()");
        });
        db.users.where("first").startsWithIgnoreCase("first").offset(7).count(function (count) {
            equal(count, 3, "algorithm + count(): offset(7).count()");
        });
        db.users.where("first").startsWithIgnoreCase("first").offset(6).limit(4).count(function (count) {
            equal(count, 4, "algorithm + count(): offset(6).limit(4)");
        });
        db.users.where("first").startsWithIgnoreCase("first").offset(7).limit(4).count(function (count) {
            equal(count, 3, "algorithm + count(): offset(7).limit(4)");
        });
        db.users.where("first").startsWithIgnoreCase("first").offset(17).limit(4).count(function (count) {
            equal(count, 0, "algorithm + count(): offset(17).limit(4)");
        });
        // Using algorithm + toArray()
        db.users.where("first").startsWithIgnoreCase("first").limit(5).toArray(function (a) {
            equal(a.length, 5, "algorithm + toArray(): limit(5)");
        });
        db.users.where("first").startsWithIgnoreCase("first").offset(7).toArray(function (a) {
            equal(a.length, 3, "algorithm + toArray(): offset(7)");
        });
        db.users.where("first").startsWithIgnoreCase("first").offset(6).limit(4).toArray(function (a) {
            equal(a.length, 4, "algorithm + toArray(): offset(6).limit(4)");
        });
        db.users.where("first").startsWithIgnoreCase("first").offset(7).limit(4).toArray(function (a) {
            equal(a.length, 3, "algorithm + toArray(): offset(7).limit(4)");
        });
        db.users.where("first").startsWithIgnoreCase("first").offset(17).limit(4).toArray(function (a) {
            equal(a.length, 0, "algorithm + toArray(): offset(17).limit(4)");
        });
        // Using IDBKeyRange + count()
        db.users.where("first").startsWith("First").count(function (count) {
            equal(count, 10, "IDBKeyRange + count() - count all 10");
        });
        db.users.where("first").startsWith("First").limit(5).count(function (count) {
            equal(count, 5, "IDBKeyRange + count(): limit(5)");
        });
        db.users.where("first").startsWith("First").offset(7).count(function (count) {
            equal(count, 3, "IDBKeyRange + count(): offset(7)");
        });
        db.users.where("first").startsWith("First").offset(6).limit(4).count(function (count) {
            equal(count, 4, "IDBKeyRange + count(): offset(6)");
        });
        db.users.where("first").startsWith("First").offset(7).limit(4).count(function (count) {
            equal(count, 3, "IDBKeyRange + count(): offset(7).limit(4)");
        });
        db.users.where("first").startsWith("First").offset(17).limit(4).count(function (count) {
            equal(count, 0, "IDBKeyRange + count(): offset(17).limit(4)");
        });
        // Using IDBKeyRange + toArray()
        db.users.where("first").startsWith("First").limit(5).toArray(function (a) {
            equal(a.length, 5, "IDBKeyRange + toArray(): limit(5)");
        });
        db.users.where("first").startsWith("First").offset(7).toArray(function (a) {
            equal(a.length, 3, "IDBKeyRange + toArray(): offset(7)");
        });
        db.users.where("first").startsWith("First").offset(6).limit(4).toArray(function (a) {
            equal(a.length, 4, "IDBKeyRange + toArray(): offset(6).limit(4)");
        });
        db.users.where("first").startsWith("First").offset(7).limit(4).toArray(function (a) {
            equal(a.length, 3, "IDBKeyRange + toArray(): offset(7).limit(4)");
        });
        db.users.where("first").startsWith("First").offset(17).limit(4).toArray(function (a) {
            equal(a.length, 0, "IDBKeyRange + toArray(): offset(17).limit(4)");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("first", 1, function () {
    db.users.orderBy("last").first(function (karlCeder) {
        equal(karlCeder.first, "Karl", "Got Karl");
    }).finally(start);
});
asyncTest("last", function () {
    db.users.orderBy("last").last(function (david) {
        equal(david.first, "David", "Got David");
    }).finally(start);
});
asyncTest("and", 2, function () {
    db.transaction("r", db.users, function () {

        db.users.where("first")
            .equalsIgnoreCase("david")
            .and(function (user) {
                return user.email.indexOf("apa") >= 0
            })
            .first(function (user) {
                equal(user, null, "Found no user with first name 'david' and email 'apa'");
            });

        db.users.where("first")
            .equalsIgnoreCase("david")
            .and(function (user) {
                return user.email.indexOf("daw@thridi.com") >= 0
            })
            .first(function (user) {
                equal(user.first, "David", "Found user with first name 'david' and email 'daw@thridi.com'");
            });

    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("reverse", function () {
    db.transaction("r", db.users, function () {
        db.users.orderBy("first").reverse().first(function (user) {
            equal(user.first, "Karl", "Got Karl");
        });

    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

if (!supports("multiEntry")) {
    test("distinct", ()=>ok(true, "SKIPPED - MULTIENTRY UNSUPPORTED"));
} else {
    asyncTest("distinct", function () {
        db.transaction("r", db.users, function () {

            db.users.where("email").startsWithIgnoreCase("d").toArray(function (a) {
                equal(a.length, 2, "Got two duplicates of David since he has two email addresses starting with 'd' (Fails on IE10, IE11 due to not supporting multivalued array indexes)");
            });
            db.users.where("email").startsWithIgnoreCase("d").distinct().toArray(function (a) {
                equal(a.length, 1, "Got single instance of David since we used the distinct() method. (Fails on IE10, IE11 due to not supporting multivalued array indexes)");
            });

        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });
}

asyncTest("modify", function () {
    db.transaction("rw", db.users, function () {
        var currentTime = new Date();
        db.users.toCollection().modify({
            lastUpdated: currentTime
        }).then(function (count) {
            equal(count, 2, "Promise supplied the number of modifications made");
        });
        db.users.toArray(function (a) {
            equal(a.length, 2, "Length ok");
            equal(a[0].first, "David", "First is David");
            equal(a[0].lastUpdated.getTime(), currentTime.getTime(), "Could set new member lastUpdated on David");
            equal(a[1].lastUpdated.getTime(), currentTime.getTime(), "Could set new member lastUpdated on Karl");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("modify-using-function", function () {
    db.transaction("rw", db.users, function () {
        var currentTime = new Date();
        db.users.toCollection().modify(function(user) {
            user.fullName = user.first + " " + user.last;
            user.lastUpdated = currentTime;
        });
        db.users.toArray(function (a) {
            equal(a.length, 2);
            equal(a[0].first, "David");
            equal(a[0].fullName, "David Fahlander", "Could modify David with a getter function");
            equal(a[0].lastUpdated.getTime(), currentTime.getTime(), "Could set new member lastUpdated on David");
            equal(a[1].lastUpdated.getTime(), currentTime.getTime(), "Could set new member lastUpdated on Karl");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("modify-causing-error", 2, function () {
    db.transaction("rw", db.users, function () {
        var currentTime = new Date();
        db.users.toCollection().modify(function (user) {
            user.id = 1;
            user.fullName = user.first + " " + user.last;
            user.lastUpdated = currentTime;
        });
        db.users.toArray(function (a) {
            ok(false, "Should not come here, beacuse we should get error when setting all primkey to 1");
        });
    }).catch(Dexie.ModifyError, function (e) {
        ok(true, "Got ModifyError: " + e);
        equal(e.successCount, 1, "Succeeded with the first entry but not the second");
    }).catch(function (e) {
        ok(false, "Another error than the expected was thrown: " + e);
    }).finally(start);
});


asyncTest("delete", 2, function () {
    db.users.orderBy("id").delete().then(function (count) {
        equal(count, 2, "All two records deleted");
        return db.users.count(function (count) {
            equal(count, 0, "No users in collection anymore");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("delete(2)", 3, function () {
    db.transaction("rw", db.users, function () {
        db.users.add({ id: 3, first: "dAvid", last: "Helenius", username: "dahel" });
        db.users.where("first").equalsIgnoreCase("david").delete().then(function (deleteCount) {
            equal(deleteCount, 2, "Two items deleted (Both davids)");
        });
        db.users.toArray(function (a) {
            equal(a.length, 1, "Deleted one user");
            equal(a[0].first, "Karl", "Only Karl is there now");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("delete(3, combine with OR)", 3, function () {
    db.transaction("rw", db.users, function () {
        db.users.add({ id: 3, first: "dAvid", last: "Helenius", username: "dahel" });
        db.users.where("first").equals("dAvid").or("username").equals("kceder").delete().then(function (deleteCount) {
            equal(deleteCount, 2, "Two items deleted (Both dAvid Helenius and Karl Cedersköld)");
        });
        db.users.toArray(function (a) {
            equal(a.length, 1, "Only one item left since dAvid and Karl have been deleted");
            equal(a[0].first, "David", "Only David Fahlander is there now!");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});


asyncTest("keys", function () {
    db.users.orderBy("first").keys(function(a) {
        ok(a.length, 2);
        equal(a[0], "David", "First is David");
        equal(a[1], "Karl", "Second is Karl");
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("uniqueKeys", function () {
    db.transaction("rw", db.users, function () {
        db.users.add({ id: 3, first: "David", last: "Helenius", username: "dahel" });
        db.users.orderBy("first").keys(function (a) {
            ok(a.length, 3, "when not using uniqueKeys, length is 3");
            equal(a[0], "David", "First is David");
            equal(a[1], "David", "Second is David");
            equal(a[2], "Karl", "Third is Karl");
        });
        db.users.orderBy("first").uniqueKeys(function (a) {
            ok(a.length, 2, "when using uniqueKeys, length is 2");
            equal(a[0], "David", "First is David");
            equal(a[1], "Karl", "Second is Karl");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("primaryKeys", function () {
    db.users.orderBy("last").primaryKeys(function(a) {
        ok(a.length, 2);
        equal(a[0], 2, "Second is Karl");
        equal(a[1], 1, "First is David");
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("primaryKeys2", function () {
    db.users.orderBy("first").primaryKeys(function(a) {
        ok(a.length, 2);
        equal(a[0], 1, "First is David");
        equal(a[1], 2, "Second is Karl");
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("eachKey and eachUniqueKey", function () {
    db.transaction("rw", db.users, function () {
        db.users.add({ id: 3, first: "Ylva", last: "Fahlander", username: "yfahlander" });
        var a = [];
        db.users.orderBy("last").eachKey(function (lastName) {
            a.push(lastName);
        }).then(function () {
            equal(a.length, 3, "When using eachKey, number of keys are 3");
        });
        var a2 = [];
        db.users.orderBy("last").eachUniqueKey(function (lastName) {
            a2.push(lastName);
        }).then(function () {
            equal(a2.length, 2, "When using eachUniqueKey, number of keys are 2");
        });

    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("or", 14, function () {
    db.transaction("rw", db.users, function () {
        db.users.add({ id: 3, first: "Apan", last: "Japan", username: "apanjapan" });
        db.users.where("first").equalsIgnoreCase("david").or("last").equals("Japan").sortBy("first", function (a) {
            equal(a.length, 2, "Got two users");
            equal(a[0].first, "Apan", "First is Apan");
            equal(a[1].first, "David", "Second is David");
        });
        db.users.where("first").equalsIgnoreCase("david").or("last").equals("Japan").or("id").equals(2).sortBy("id", function (a) {
            equal(a.length, 3, "Got three users");
            equal(a[0].first, "David", "First is David");
            equal(a[1].first, "Karl", "Second is Karl");
            equal(a[2].first, "Apan", "Third is Apan");
        });
        var userArray = [];
        db.users.where("id").anyOf(1, 2, 3, 4).or("username").anyOf("dfahlander", "kceder", "apanjapan").each(function (user) {
            ok(true, "Found: " + JSON.stringify(user));
            userArray.push(user);
        }).then(function () {
            equal(userArray.length, 3, "Got all three users");
            ok(userArray.some(function (user) { return user.first === "David" }), "David was found");
            ok(userArray.some(function (user) { return user.first === "Karl" }), "Karl was found");
            ok(userArray.some(function (user) { return user.first === "Apan" }), "Apan was found");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("or-issue#15-test", function () {
    var db = new Dexie("MyDB_issue15");
    db.version(1).stores({
        phones: "++id, additionalFeatures, android, availability, battery, camera, connectivity, description, display, hardware, id, images, name, sizeAndWeight, storage"
    });
    db.on('populate', function () {
        ok(true, "on(populate) called");
        for (var i = 0; i < 100; ++i) {
            db.phones.add({ id: 3 + i, name: "Name" + randomString(16), additionalFeatures: [randomString(10)], android: 1, availability: 0, battery: 1, camera: 1 });
        }

        function randomString(count) {
            var ms = [];
            for (var i = 0; i < count; ++i) {
                ms.push(String.fromCharCode(32 + Math.floor(Math.random() * 96)));
            }
            return ms.join('');
        }
    });

    db.open().catch(function (err) {
        ok(false, "DB ERROR: " + err);
    });


    var numRuns = 10;

    for (var i = 0; i < numRuns; ++i) {

        db.phones.where("name").startsWithIgnoreCase("name").or("id").below(50).toArray(function (a) {

            equal(a.length, 100, "Found 100 phones");

        }).catch(function (err) {

            ok(false, "error:" + err.stack);

        }).finally(function () {
            if (--numRuns == 0) {
                // All test runs finished. Delete DB and exit unit test.
                db.delete();
                start();
            }
        });
    }

});

asyncTest("until", function () {
    db.transaction("rw", db.users, function () {
        db.users.add({ id: 3, first: "Apa1", username: "apa1" });
        db.users.add({ id: 4, first: "Apa2", username: "apa2" });
        db.users.add({ id: 5, first: "Apa3", username: "apa3" });

        // Checking that it stops immediately when first item is the stop item:
        db.users.orderBy(":id").until(function (user) { return user.first == "David" }).toArray(function (a) {
            equal(0, a.length, "Stopped immediately because David has ID 1");
        });

        // Checking that specifying includeStopEntry = true will include the stop entry.
        db.users.orderBy(":id").until(function (user) { return user.first == "David" }, true).toArray(function (a) {
            equal(1, a.length, "Got the stop entry when specifying includeStopEntry = true");
            equal("David", a[0].first, "Name is David");
        });

        // Checking that when sorting on first name and stopping on David, we'll get the apes.
        db.users.orderBy("first").until(function (user) { return user.first == "David" }).toArray(function (a) {
            equal(3, a.length, "Got 3 users only (3 apes) because the Apes comes before David and Karl when ordering by first name");
            equal("apa1", a[0].username, "First is apa1");
            equal("apa2", a[1].username, "Second is apa2");
            equal("apa3", a[2].username, "Third is apa3");
        });

        // Checking that reverse() affects the until() method as expected:
        db.users.orderBy("first").reverse().until(function (user) { return user.username == "apa2" }).toArray(function (a) {
            equal(3, a.length, "Got 3 users only (David, Karl and Apa3)");
            equal("Karl", a[0].first, "When reverse(), First is Karl.");
            equal("David", a[1].first, "When reverse(), Second is David");
            equal("Apa3", a[2].first, "When reverse(), Third is Apa3");
        });
    }).catch(function (e) {
        ok(false, e.stack || e);
    }).finally(start);
});

asyncTest("firstKey", function () {
    db.users.orderBy('last').firstKey(function (key) {
        equal("Cedersköld", key, "First lastName is Cedersköld");
    }).catch(function (e) {
        ok(false, e.stack || e);
    }).finally(function () {
        start();
    });
});

asyncTest("lastKey", function () {
    db.users.orderBy('last').lastKey(function (key) {
        equal("Fahlander", key, "Last lastName is Fahlander");
    }).catch(function (e) {
        ok(false, e.stack || e);
    }).finally(function () {
        start();
    });
});

asyncTest("firstKey on primary key", function () {
    db.users.toCollection().firstKey(function (key) {
        equal(key, 1, "First key is 1");
    }).catch(function (e) {
        ok(false, e.stack || e);
    }).finally(function () {
        start();
    });
});

asyncTest("lastKey on primary key", function () {
    db.users.toCollection().lastKey(function (key) {
        equal(key, 2, "lastKey is 2");
    }).catch(function (e) {
        ok(false, e.stack || e);
    }).finally(function () {
        start();
    });
});

asyncTest("Promise chain from within each() operation", 2, function () {
    db.transaction('r', db.users, function() {
        db.users.each(function(user) {
            db.users.where('id').equals(user.id).first(function(usr) {
                return db.users.where('id').equals(usr.id).first();
            }).then(function(u) {
                return u;
            }).then(function(u2) {
                equal(u2.id, user.id, "Could get the same user after some chains of Promise.resolve()");
            });
        });
    }).catch(function(err) {
        ok(false, err.stack || err);
    }).finally(start);
});

