import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, supports, spawnedTest} from './dexie-unittest-utils';

var db = new Dexie("TestDBTable");
db.version(1).stores({
    users: "++id,first,last,&username,*&email,*pets",
    folks: "++,first,last"
});

var User = db.users.defineClass({
    id:         Number,
    first:      String,
    last:       String,
    username:   String,
    email:      [String],
    pets:       [String],
});
var idOfFirstUser = 0,
    idOfLastUser = 0;

db.on("populate", function (trans) {
    db.users.add({first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"]}).then(function(id) {
        idOfFirstUser = id;
    });
    db.users.add({first: "Karl", last: "Faadersköld", username: "kceder", email: ["karl@ceder.what", "dadda@ceder.what"], pets: []}).then(function(id) {
        idOfLastUser = id;
    });
});

module("table", {
    setup: function () {
        stop();
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    },
    teardown: function () {
    }
});

asyncTest("get", 4, function () {
    db.table("users").get(idOfFirstUser).then(function(obj) {
        equal(obj.first, "David", "Got the first object");
        return db.users.get(idOfLastUser);
    }).then(function(obj) {
        equal(obj.first, "Karl", "Got the second object");
        return db.users.get("nonexisting key");
    }).then(function(obj) {
        ok(true, "Got then() even when getting non-existing object");
        equal(obj, undefined, "Result is 'undefined' when not existing");
    }).catch(function(err) {
        ok(false, "Error: " + err);
    }).finally(start);
});

asyncTest("where", function () {
    db.transaction("r", db.users, function () {
        db.users.where("username").equals("kceder").first(function (user) {
            equal(user.first, "Karl", "where().equals()");
        }),
        db.users.where("id").above(idOfFirstUser).toArray(function (a) {
            ok(a.length == 1, "where().above()");
        }),
        db.users.where("id").aboveOrEqual(idOfFirstUser).toArray(function (a) {
            ok(a.length == 2, "where().aboveOrEqual()");
        }),
        db.users.where("id").below(idOfLastUser).count(function (count) {
            ok(count == 1, "where().below().count()");
        }),
        db.users.where("id").below(idOfFirstUser).count(function (count) {
            ok(count == 0, "where().below().count() should be zero");
        }),
        db.users.where("id").belowOrEqual(idOfFirstUser).count(function (count) {
            ok(count == 1, "where().belowOrEqual()");
        }),
        db.users.where("id").between(idOfFirstUser, idOfFirstUser).count(function (count) {
            ok(count == 0, "where().between(1, 1)");
        }),
        db.users.where("id").between(0, Infinity).count(function (count) {
            ok(count == 2, "where().between(0, Infinity)");
        }),
        db.users.where("id").between(idOfFirstUser, idOfFirstUser, true, true).count(function (count) {
            ok(count == 1, "where().between(1, 1, true, true)");
        }),
        db.users.where("id").between(1, -1, true, true).count(function (count) {
            ok(count == 0, "where().between(1, -1, true, true)");
        }),
        db.users.where("id").between(idOfFirstUser, idOfLastUser).count(function (count) {
            ok(count == 1, "where().between(1, 2)");
        }),
        db.users.where("id").between(idOfFirstUser, idOfLastUser, true, true).count(function (count) {
            ok(count == 2, "where().between(1, 2, true, true)");
        }),
        db.users.where("id").between(idOfFirstUser, idOfLastUser, false, false).count(function (count) {
            ok(count == 0, "where().between(1, 2, false, false)");
        });
        db.users.where("last").startsWith("Fah").toArray(function (a) {
            equal(a.length, 1, "where().startsWith(existing) only matches Fahlander, not Faadersköld");
            equal(a[0].first, "David");
        });
        db.users.where("last").startsWith("Faa").toArray(function (a) {
            equal(a.length, 1, "where().startsWith(existing) only matches Faadersköld, not Fahlander");
            equal(a[0].first, "Karl");
        });
        db.users.where("last").startsWith("Fa").toArray(function (a) {
            equal(a.length, 2, "length = 2 on: where().startsWith(2 existing)");
            equal(a[0].first, "Karl", "Karl found first on last 'Faadersköld'");
            equal(a[1].first, "David", "David found second on last 'Fahlander'");
        });
        db.users.where("last").anyOf("Fahlander", "Faadersköld").toArray(function (a) {
            equal(a.length, 2, "in() returned expected number of items");
            equal(a[0].last, "Faadersköld", "Faadersköld is first");
        });
        db.users.where("last").anyOf("Fahlander", "Faadersköld").reverse().toArray(function (a) {
            equal(a.length, 2, "in().reverse() returned expected number of items");
            equal(a[0].last, "Fahlander", "Fahlander is first");
        });
        db.users.where("last").anyOf("Faadersköld").toArray(function (a) {
            equal(a.length, 1, "in() returned expected number of items");
        });

        if (supports("multiEntry")) {
            db.users.where("email").equals("david@awarica.com").toArray(function (a) { // Fails in IE with 0 due to that IE is not implementing to index string arrays.
                equal(a.length, 1, "Finding items from array members. Expect to fail on IE10/IE11.");
            });
            db.users.where("email").startsWith("da").distinct().toArray(function (a) { // Fails on IE with 0
                equal(a.length, 2, "Found both because both have emails starting with 'da'. Expect to fail on IE10/IE11.");
            });
        } else {
            ok(true, "SKIPPED - MULTIENTRY UNSUPPORTED");
            ok(true, "SKIPPED - MULTIENTRY UNSUPPORTED");
        }
    }).catch(function (e) {
        ok(false, "Transaction failed: " + e);
    }).finally(function () {
        start();
    });
});

asyncTest("count", function () {
    db.users.count(function (count) {
        equal(count, 2, "Table.count()");
    }).catch(function (e) {
        ok(false, e.message);
    }).finally(function(){
        start();
    });;
});
asyncTest("count with limit", function () {
    db.users.limit(1).count(function (count) {
        equal(count, 1, "Table.limit().count()");
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});
asyncTest("limit(),orderBy(),modify(), abort(), reverse()", function () {
    db.transaction("rw", db.users, function () {
        // Modify first found user with a helloMessage
        db.users.orderBy("first").reverse().limit(1).modify(function (user) {
            user.helloMessage = "Hello " + user.first;
        });

        // Check that the modification went fine:
        db.users.orderBy("first").reverse().toArray(function (a) {
            equal(a[0].first, "Karl", "First item is Karl");
            equal(a[0].helloMessage, "Hello Karl", "Karl got helloMessage 'Hello Karl'");
            equal(a[1].first, "David", "Second item is David");
            ok(!a[1].helloMessage, "David was not modified due to limit()");
        });
    }).catch(function (e) {
        ok(false, "Error: " + e);
    }).finally(function () {
        start();
    });
});

asyncTest("filter", function () {
    db.users.filter(function (user) { return user.email.indexOf("david@awarica.com") != -1 }).toArray(function (davids) {
        equal(1, davids.length, "Got one David");
        equal("David", davids[0].first, "The name of the David is David");
    }).catch(function (e) {
        ok(false, e.stack || e);
    }).finally(start);
});

asyncTest("each", function () {
    var users = [];
    db.users.each(function (user) {
        users.push(user);
    }).then(function () {
        equal(users.length, 2, "Got 2 users");
        equal(users[0].first, "David", "Got David");
        equal(users[1].first, "Karl", "Got Karl");
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("put", function () {
    db.transaction("rw", db.users, function () {
        var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };
        db.users.put(newUser).then(function (id) {
            ok(id > idOfLastUser, "Got id " + id + " because we didnt supply an id");
            equal(newUser.id, id, "The id property of the new user was set");
        });
        db.users.where("username").equals("aper").first(function (user) {
            equal(user.last, "Persbrant", "The correct item was actually added");
            user.last = "ChangedLastName";
            var currentId = user.id;
            db.users.put(user).then(function (id) {
                equal(id, currentId, "Still got same id because we update same object");
            });
            db.users.where("last").equals("ChangedLastName").first(function (user) {
                equal(user.last, "ChangedLastName", "LastName was successfully changed");
            });
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

asyncTest("put-no-transaction", function () {
    var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };
    db.users.put(newUser).then(function(id) {
        ok(id > idOfLastUser, "Got id " + id + " because we didnt supply an id");
        equal(newUser.id, id, "The id property of the new user was set");
        return db.users.where("username").equals("aper").first(function(user) {
            equal(user.last, "Persbrant", "The correct item was actually added");
            user.last = "ChangedLastName";
            var userId = user.id;
            return db.users.put(user).then(function(id) {
                equal(id, userId, "Still got same id because we update same object");
                return db.users.where("last").equals("ChangedLastName").first(function(user) {
                    equal(user.last, "ChangedLastName", "LastName was successfully changed");
                });
            });
        });
    }).catch(function(e) {
        ok(false, e);
    }).finally(start);
});


asyncTest("add", function () {
    db.transaction("rw", db.users, function () {
        var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };

        db.users.add(newUser).then(function (id) {
            ok(id > idOfLastUser, "Got id " + id + " because we didnt supply an id");
            equal(newUser.id, id, "The id property of the new user was set");
        });

        db.users.where("username").equals("aper").first(function (user) {
            equal(user.last, "Persbrant", "The correct item was actually added");
        });

    }).catch(function (e) {
        ok(false, "Error: " + e);
    }).finally(start);
});

spawnedTest("bulkAdd", function*(){
    var highestKey = yield db.users.add({username: "fsdkljfd", email: ["fjkljslk"]});
    ok(true, "Highest key was: " + highestKey);
    // Delete test item.
    yield db.users.delete(highestKey);
    ok(true, "Deleted test item");
    var result = yield db.users.bulkAdd([
        { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
        { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }
    ]);
    equal (result, highestKey + 2, "Result of bulkAdd() operation was equal to highestKey + 2");
});

spawnedTest("bulkAdd-catching errors", function*() {
    yield db.transaction("rw", db.users, function() {
        var newUsers = [
            { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
            { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
            { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // Should fail
            { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }
        ];
        db.users.bulkAdd(newUsers).then(()=> {
            ok(false, "Should not resolve when one operation failed");
        }).catch(Dexie.BulkError, e=>{
            ok(true, "Got BulkError: " + e.message);
            equal(e.failures.length, 1, "One error due to a duplicate username: " + e.failures[0]);
        });

        // Now, since we catched the error, the transaction should continue living.
        db.users.where("username").startsWith("aper").count(function(count) {
            equal(count, 3, "Got three matches now when users are bulk-added");
        });
    });

    equal(yield db.users.where("username").startsWith('aper').count(), 3, "Previous transaction committed");

    var newUsersX = [
        {first: "Xke1", last: "Persbrant1", username: "xper1", email: ["xper1@persbrant.net"]},
        {first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"]},
        {first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"]}, // Should fail
        {first: "Xke3", last: "Persbrant3", username: "xper3", email: ["xper3@persbrant.net"]}
    ];
    try {
        yield db.transaction("rw", db.users, () => {
            db.users.bulkAdd(newUsersX).then(()=> {
                ok(false, "Should not resolve");
            });
        });
        ok(false, "Should not come here");
    } catch (e) {
        ok(true, "Got: " + e);
    }

    equal(yield db.users.where('username').startsWith('xper').count(), 0, "0 users! Good, means that previous transaction did not commit");

    yield db.users.bulkAdd(newUsersX).catch(e => {
        ok(true, "Got error. Catching it should make the successors work.")
    });

    equal(yield db.users.where('username').startsWith('xper').count(), 3, "3 users! Good - means that previous operation catched and therefore committed");

    var newUsersY = [
        {first: "Yke1", last: "Persbrant1", username: "yper1", email: ["yper1@persbrant.net"]},
        {first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"]},
        {first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"]}, // Should fail
        {first: "Yke3", last: "Persbrant3", username: "yper3", email: ["yper3@persbrant.net"]}
    ];

    // Now check that catching the operation via try..catch should also make it succeed.
    try {
        yield db.users.bulkAdd(newUsersY);
    } catch (e) {
        ok(true, "Got: " + e);
    }
    equal(yield db.users.where('username').startsWith('yper').count(), 3, "3 users! Good - means that previous operation catched (via try..yield..catch this time, and therefore committed");

    // Now check that catching and rethrowing should indeed make it fail
    var newUsersZ = [
        {first: "Zke1", last: "Persbrant1", username: "zper1", email: ["zper1@persbrant.net"]},
        {first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"]},
        {first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"]}, // Should fail
        {first: "Zke3", last: "Persbrant3", username: "zper3", email: ["zper3@persbrant.net"]}
    ];

    yield db.transaction('rw', db.users, function*() {
        try {
            yield db.users.bulkAdd(newUsersZ);
        } catch (e) {
            throw e;
        }
    }).catch(Dexie.BulkError, e => {
        ok(true, "Got rethrown BulkError: " + e.stack);
    });

    equal(yield db.users.where('username').startsWith('zper').count(), 0, "0 users! Good - means that previous operation rethrown (via try..yield..catch--throw this time, and therefore not committed");
});

spawnedTest("bulkAdd-non-inbound-autoincrement", function*(){
    yield db.folks.bulkAdd([
        { first: "Foo", last: "Bar"},
        { first: "Foo", last: "Bar2"},
        { first: "Foo", last: "Bar3"},
        { first: "Foo", last: "Bar4"}
    ]);
    equal (yield db.folks.where('first').equals('Foo').count(), 4, "Should be 4 Foos");
    equal (yield db.folks.where('last').equals('Bar').count(), 1, "Shoudl be 1 Bar");
});

spawnedTest("bulkAdd-catch sub transaction", function*(){
    yield db.transaction('rw', db.users, ()=>{
        var newUsers = [
            { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
            { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
            { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // Should fail
            { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }
        ];
        db.transaction('rw', db.users, ()=>{
            db.users.bulkAdd(newUsers);
        }).then(()=>{
            ok(false, "Should not succeed with all these operations");
        }).catch(e => {
            equal(e.failures.length, 1, "Should get one failure");
        });
    }).catch(e => {
        ok(true, "Outer transaction aborted due to inner transaction abort. This is ok: " + e);
    });

    equal(yield db.users.where('username').startsWith('aper').count(), 0, "0 users! Good, means that inner transaction did not commit");
});

spawnedTest("bulkPut", function*(){
    var highestKey = yield db.users.add({username: "fsdkljfd", email: ["fjkljslk"]});
    ok(true, "Highest key was: " + highestKey);
    // Delete test item.
    yield db.users.delete(highestKey);
    ok(true, "Deleted test item");
    let existingFirstUserToReplace = yield db.users.get(idOfFirstUser);
    equal (existingFirstUserToReplace.username, "dfahlander", "Existing user should be dfahlander");
    var result = yield db.users.bulkPut([
        { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
        { id: idOfFirstUser, first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
        { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }
    ]);
    equal (result, highestKey + 2, "Result of bulkPut() operation was equal to highestKey + 2");
    let ourAddedUsers = yield db.users.where('username').startsWith("aper").toArray();
    equal(ourAddedUsers.length, 3, "Should have put 3 users there (two additions and one replaced");
    let replacedDfahlander = yield db.users.get(idOfFirstUser);
    equal(replacedDfahlander.username, "aper2", "dfahlander Should now be aper2 instead");
});

spawnedTest("bulkPut with overlapping objects", function*(){
    yield db.users.bulkPut([{
        id: "sdjls83",
        first: "Daveious"
    },{
        id: "sdjls83",
        last: "Olvono"
    }]);
    let theOne = yield db.users.get("sdjls83");
    equal (theOne.last, "Olvono", "Last item is the one inserted");
    ok (theOne.first === undefined, "Object doesnt have a first property");
});

spawnedTest("bulkPut-catching errors", function*() {
    yield db.transaction("rw", db.users, function() {
        var newUsers = [
            { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
            { id: idOfLastUser, first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // update success
            { id: idOfFirstUser, first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // update should fail
            { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // Add should fail
            { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }
        ];
        db.users.bulkPut(newUsers).then(()=> {
            ok(false, "Should not resolve when one operation failed");
        }).catch(Dexie.BulkError, e=>{
            ok(true, "Got BulkError: " + e.message);
            equal(e.failures.length, 2, "Two errors due to a duplicate username: " + e.failures[0]);
        });

        // Now, since we catched the error, the transaction should continue living.
        db.users.where("username").startsWith("aper").count(function(count) {
            equal(count, 3, "Got three matches now when users are bulk-putted");
        });
    });

    equal(yield db.users.where("username").startsWith('aper').count(), 3, "Previous transaction committed");

    var newUsersX = [
        {first: "Xke1", last: "Persbrant1", username: "xper1", email: ["xper1@persbrant.net"]},
        {id: idOfLastUser, first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"]},
        {first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"]}, // Should fail (add)
        {id: idOfFirstUser, first: "Xke2", last: "Persbrant2", username: "xper2", email: ["xper2@persbrant.net"]}, // Should fail (update)
        {first: "Xke3", last: "Persbrant3", username: "xper3", email: ["xper3@persbrant.net"]}
    ];
    try {
        yield db.transaction("rw", db.users, () => {
            db.users.bulkPut(newUsersX).then(()=> {
                ok(false, "Should not resolve");
            });
        });
        ok(false, "Should not come here");
    } catch (e) {
        ok(true, "Got: " + e);
    }

    equal(yield db.users.where('username').startsWith('xper').count(), 0, "0 users! Good, means that previous transaction did not commit");

    yield db.users.bulkPut(newUsersX).catch(e => {
        ok(true, "Got error. Catching it should make the successors work.")
    });

    equal(yield db.users.where('username').startsWith('xper').count(), 3,
        "Should count to 3 users because previous operation was catched and therefore should have been committed");

    var newUsersY = [
        {first: "Yke1", last: "Persbrant1", username: "yper1", email: ["yper1@persbrant.net"]},
        {first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"]},
        {id: idOfFirstUser, first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"]}, // Should fail
        {first: "Yke2", last: "Persbrant2", username: "yper2", email: ["yper2@persbrant.net"]}, // Should fail
        {first: "Yke3", last: "Persbrant3", username: "yper3", email: ["yper3@persbrant.net"]}
    ];

    // Now check that catching the operation via try..catch should also make it succeed.
    try {
        yield db.users.bulkPut(newUsersY);
    } catch (e) {
        ok(true, "Got: " + e);
    }
    equal(yield db.users.where('username').startsWith('yper').count(), 3,
        "Should count to 3 users because previous previous operation catched (via try..yield..catch this time, and therefore should have been committed");

    // Now check that catching and rethrowing should indeed make it fail
    var newUsersZ = [
        {first: "Zke1", last: "Persbrant1", username: "zper1", email: ["zper1@persbrant.net"]},
        {first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"]},
        {first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"]}, // Should fail
        {id: idOfLastUser, first: "Zke2", last: "Persbrant2", username: "zper2", email: ["zper2@persbrant.net"]}, // Should fail
        {first: "Zke3", last: "Persbrant3", username: "zper3", email: ["zper3@persbrant.net"]}
    ];

    yield db.transaction('rw', db.users, function*() {
        try {
            yield db.users.bulkPut(newUsersZ);
        } catch (e) {
            throw e;
        }
    }).catch(Dexie.BulkError, e => {
        ok(true, "Got rethrown BulkError: " + e.stack);
    });

    equal(yield db.users.where('username').startsWith('zper').count(), 0, "0 users! Good - means that previous operation rethrown (via try..yield..catch--throw this time, and therefore not committed");
});

spawnedTest("bulkPut-non-inbound-autoincrement", function*(){
    yield db.folks.bulkPut([
        { first: "Foo", last: "Bar"},
        { first: "Foo", last: "Bar2"},
        { first: "Foo", last: "Bar3"},
        { first: "Foo", last: "Bar4"}
    ]);
    equal (yield db.folks.where('first').equals('Foo').count(), 4, "Should be 4 Foos");
    equal (yield db.folks.where('last').equals('Bar').count(), 1, "Should be 1 Bar");
});

spawnedTest("bulkPut - mixed inbound autoIncrement", function* () {
    let lastId = yield db.users.bulkPut([
        { first: "Foo", last: "Bar"},
        { first: "Foo", last: "Bar2"},
        { first: "Foo", last: "Bar3"},
        { first: "Foo", last: "Bar4"}
    ]);
    equal (yield db.users.where('first').equals('Foo').count(), 4, "Should be 4 Foos");
    equal (yield db.users.where('last').equals('Bar').count(), 1, "Should be 1 Bar");
    let newLastId = yield db.users.bulkPut([
        { id: lastId - 3, first: "Foo2", last: "BarA"}, // Will update "Foo Bar" to "Foo2 BarA"
        { first: "Foo2", last: "BarB"}, // Will create
        { id: lastId - 1, first: "Foo2", last: "BarC"}, // Will update "Foo Bar3" to "Foo2 BarC"
        { first: "Foo2", last: "BarD"}  // Will create
    ]);
    equal (newLastId, lastId + 2, "Should have incremented last ID twice now");
    equal (yield db.users.where('first').equals('Foo').count(), 2, "Should be 2 Foos now");
    equal (yield db.users.where('first').equals('Foo2').count(), 4, "Should be 4 Foo2s now");
    let foo2s = yield db.users.where('first').equals('Foo2').toArray();
    equal (foo2s[0].last, "BarA", "BarA should be first (updated previous ID)");
    equal (foo2s[1].last, "BarC", "BarC should be second (updated previous ID");
    equal (foo2s[2].last, "BarB", "BarB should be third (got new key)");
    equal (foo2s[3].last, "BarD", "BarD should be forth (got new key)");
});

spawnedTest("bulkPut-catch sub transaction", function*(){
    yield db.transaction('rw', db.users, ()=>{
        var newUsers = [
            { first: "Åke1", last: "Persbrant1", username: "aper1", email: ["aper1@persbrant.net"] },
            { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] },
            { first: "Åke2", last: "Persbrant2", username: "aper2", email: ["aper2@persbrant.net"] }, // Should fail
            { first: "Åke3", last: "Persbrant3", username: "aper3", email: ["aper3@persbrant.net"] }
        ];
        db.transaction('rw', db.users, ()=>{
            db.users.bulkPut(newUsers);
        }).then(()=>{
            ok(false, "Should not succeed with all these operations");
        }).catch(e => {
            equal(e.failures.length, 1, "Should get one failure");
        });
    }).catch(e => {
        ok(true, "Outer transaction aborted due to inner transaction abort. This is ok: " + e);
    });

    equal(yield db.users.where('username').startsWith('aper').count(), 0, "0 users! Good, means that inner transaction did not commit");
});

spawnedTest("bulkDelete", function*(){
    let userKeys = yield db.users.orderBy('id').keys();
    ok(userKeys.length > 0, "User keys found: " + userKeys.join(','));
    yield db.users.bulkDelete(userKeys);
    let userCount = yield db.users.count();
    equal (userCount, 0, "Should be no users there now");
});

spawnedTest("bulkDelete - nonexisting keys", function*(){
    let userKeys = ["nonexisting1", "nonexisting2", yield db.users.orderBy(':id').lastKey()];
    yield db.users.bulkDelete(userKeys);
    let userCount = yield db.users.count();
    equal (userCount, 1, "Should be one user there now. (the other should have been deleted)");
});

spawnedTest("bulkDelete-faulty-key", function*(){
    let userKeys = [{faulty: "ohyes"}];
    yield db.users.bulkDelete(userKeys).then (()=>{
        ok (false, "Should not succeed");
    }).catch('DataError', e => {
        ok (true, "Should get error: " + e);
    });
});

asyncTest("delete", function () {
    // Without transaction
    db.users.get(idOfFirstUser, function (user) {
        notEqual(user, null, "User with id 1 exists");
    }).then(function () {
        db.users.delete(1).then(function () {
            db.users.get(1, function (user) {
                equal(user, null, "User not found anymore");
                start();
            });
        });
    }).catch(function (e) {
        ok(false, e);
        start();
    });
});
asyncTest("delete(using transaction)", function() {
    // With transaction
    db.transaction("rw", db.users, function () {
        db.users.get(idOfFirstUser, function (user) {
            notEqual(user, null, "User with id 1 exists");
        });
        db.users.delete(idOfFirstUser);
        db.users.get(idOfFirstUser, function (user) {
            equal(user, null, "User not found anymore");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});
asyncTest("delete nonexisting item", 3, function () {
	var numUsers;
	db.users.count().then(function(count) {
		numUsers = count;
		ok(true, "Number of users before delete: " + count);
	}).then(function() {
		return db.users.delete("nonexisting key");
	}).then(function(){
		ok(true, "Success even though nothing was deleted");
	}).then(function(){
		return db.users.count();
	}).then(function(count){
		equal(numUsers, count, "Just verifying number of items in user table is still same");
	}).catch(function (err) {
		ok(false, "Got error: " + err);
	}).finally (start);
});
asyncTest("clear", function () {
    db.transaction("rw", "users", function () {
        db.users.count(function (count) {
            equal(count, 2, "There are 2 items in database before clearing it");
        });
        db.users.clear();
        db.users.count(function (count) {
            equal(count, 0, "There are 0 items in database after it has been cleared");
        });
    }).catch(function (e) {
        ok(false, e);
    }).finally(start);
});

spawnedTest("failReadonly", function*(){
    yield db.transaction('r', 'users', function*() {
        yield db.users.bulkAdd([{first: "Foo", last: "Bar"}]);
    }).then(()=>{
        ok(false, "Should not happen");
    }).catch ('ReadOnlyError', e => {
        ok(true, "Got ReadOnlyError: " + e.stack);
    });
});

spawnedTest("failNotIncludedStore", function*(){
    yield db.transaction('rw', 'folks', function*() {
        yield db.users.bulkAdd([{first: "Foo", last: "Bar"}]);
    }).then(()=>{
        ok(false, "Should not happen");
    }).catch ('NotFoundError', e => {
        ok(true, "Got NotFoundError: " + e.stack);
    });
});

asyncTest("failNotIncludedStoreTrans", () => {
    db.transaction('rw', 'foodassaddas', ()=>{
    }).then(()=>{
        ok(false, "Should not happen");
    }).catch ('NotFoundError', e => {
        ok(true, "Got NotFoundError: " + e.stack);
    }).catch (e => {
        ok(false, "Oops: " + e.stack);
    }).then(start);
});
