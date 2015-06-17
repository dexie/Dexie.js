///<reference path="../src/Dexie.js" />
///<reference path="dexie-unittest-utils.js" />

(function(){
    var db = new Dexie("TestDBTable");
    db.version(1).stores({ users: "++id,first,last,&username,*&email,*pets" });

    //db.users.mapToClass(User);
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
                ok(false, "Error resetting database: " + e);
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

            db.users.where("email").equals("david@awarica.com").toArray(function (a) { // Fails in IE with 0 due to that IE is not implementing to index string arrays.
                equal(a.length, 1, "Finding items from array members. Expect to fail on IE10/IE11.");
            });
            db.users.where("email").startsWith("da").distinct().toArray(function (a) { // Fails on IE with 0
                equal(a.length, 2, "Found both because both have emails starting with 'da'. Expect to fail on IE10/IE11.");
            });
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
})();
