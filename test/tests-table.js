///<reference path="run-unit-tests.html" />

///<var type="Dexie" />
(function(){
    var db = new Dexie("TestDB");
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

    db.on("populate", function (trans) {
        trans.users.add({first: "David", last: "Fahlander", username: "dfahlander", email: ["david@awarica.com", "daw@thridi.com"], pets: ["dog"]});
        trans.users.add({first: "Karl", last: "Faadersköld", username: "kceder", email: ["karl@ceder.what", "dadda@ceder.what"], pets: []});
    });

    module("table", {
        setup: function () {
            stop();
            db.delete().then(function () {
                db.open().error(function (e) {
                    ok(false, "Database Error: " + e);
                });
            }).catch(function (e) {
                ok(false, "Could not delete database");
            }).finally(function () {
                start();
            });
        },
        teardown: function () {
            stop();
            db.delete().finally(function () {
                start();
            });
        }
    });

    asyncTest("get", 4, function () {
        db.table("users").get(1, function (obj) {
            equal(obj.first, "David", "Got the first object");
            db.users.get(2).then(function (obj) {
                equal(obj.first, "Karl", "Got the second object");
                db.users.get(100).then(function (obj) {
                    ok(true, "Got then() even when getting non-existing object");
                    equal(obj, undefined, "Result is 'undefined' when not existing");
                    start();
                });
            });
        });
    });

    asyncTest("where", function () {
        db.transaction("r", db.users).try(function (users) {
            users.where("username").equals("kceder").first(function (user) {
                equal(user.first, "Karl", "where().equals()");
            }),
            users.where("id").above(1).toArray(function (a) {
                ok(a.length == 1, "where().above()");
            }),
            users.where("id").aboveOrEqual(1).toArray(function (a) {
                ok(a.length == 2, "where().aboveOrEqual()");
            }),
            users.where("id").below(2).count(function (count) {
                ok(count == 1, "where().below().count()");
            }),
            users.where("id").below(1).count(function (count) {
                ok(count == 0, "where().below().count() should be zero");
            }),
            users.where("id").belowOrEqual(1).count(function (count) {
                ok(count == 1, "where().belowOrEqual()");
            }),
            users.where("id").between(1, 1).count(function (count) {
                ok(count == 0, "where().between(1, 1)");
            }),
            users.where("id").between(0, 100).count(function (count) {
                ok(count == 2, "where().between(0, 100)");
            }),
            users.where("id").between(1, 1, true, true).count(function (count) {
                ok(count == 1, "where().between(1, 1, true, true)");
            }),
            users.where("id").between(1, -1, true, true).count(function (count) {
                ok(count == 0, "where().between(1, -1, true, true)");
            }),
            users.where("id").between(1, 2).count(function (count) {
                ok(count == 1, "where().between(1, 2)");
            }),
            users.where("id").between(1, 2, true, true).count(function (count) {
                ok(count == 2, "where().between(1, 2, true, true)");
            }),
            users.where("id").between(1, 2, false, false).count(function (count) {
                ok(count == 0, "where().between(1, 2, false, false)");
            });
            users.where("last").startsWith("Fah").toArray(function (a) {
                equal(a.length, 1, "where().startsWith(existing) only matches Fahlander, not Faadersköld");
                equal(a[0].first, "David");
            });
            users.where("last").startsWith("Faa").toArray(function (a) {
                equal(a.length, 1, "where().startsWith(existing) only matches Faadersköld, not Fahlander");
                equal(a[0].first, "Karl");
            });
            users.where("last").startsWith("Fa").toArray(function (a) {
                equal(a.length, 2, "length = 2 on: where().startsWith(2 existing)");
                equal(a[0].first, "Karl", "Karl found first on last 'Faadersköld'");
                equal(a[1].first, "David", "David found second on last 'Fahlander'");
            });
            users.where("last").equalsAnyOf("Fahlander", "Faadersköld").toArray(function (a) {
                equal(a.length, 2, "equalsAnyOf() returned expected number of items");
                equal(a[0].last, "Faadersköld", "Faadersköld is first");
            });
            users.where("last").equalsAnyOf("Fahlander", "Faadersköld").desc().toArray(function (a) {
                equal(a.length, 2, "equalsAnyOf().desc() returned expected number of items");
                equal(a[0].last, "Fahlander", "Fahlander is first");
            });
            users.where("last").equalsAnyOf("Faadersköld").toArray(function (a) {
                equal(a.length, 1, "equalsAnyOf() returned expected number of items");
            });

            users.where("email").equals("david@awarica.com").toArray(function (a) { // Fails in IE with 0 due to that IE is not implementing to index string arrays.
                equal(a.length, 1, "Finding items from array members. Expect to fail on IE10/IE11.");
            });
            users.where("email").startsWith("da").distinct().toArray(function (a) { // Fails on IE with 0
                equal(a.length, 2, "Found both because both have emails starting with 'da'");
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
    asyncTest("limit(),orderBy(),modify(), abort(), desc()", function () {
        db.transaction("rw", db.users)
          .try(function (users) {
              // Modify first found user with a helloMessage
              users.orderBy("first").desc().limit(1).modify({
                  helloMessage: function (user) { return "Hello " + user.first; }
              });

              // Check that the modification went fine:
              users.orderBy("first").desc().toArray(function (a) {
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
        db.transaction("rw", db.users).try(function (users) {
            var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };
            users.put(newUser).then(function (id) {
                equal(id, 3, "Got id 3 because we didnt supply an id");
                equal(newUser.id, id, "The id property of the new user was set");
            });
            users.where("username").equals("aper").first(function (user) {
                equal(user.last, "Persbrant", "The correct item was actually added");
            });
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });

    asyncTest("add", function () {
        db.transaction("rw", db.users).try(function (users) {
            var newUser = { first: "Åke", last: "Persbrant", username: "aper", email: ["aper@persbrant.net"] };

            users.add(newUser).then(function (id) {
                equal(id, 3, "Got id 3 because we didnt supply an id");
                equal(newUser.id, id, "The id property of the new user was set");
            });

            users.where("username").equals("aper").first(function (user) {
                equal(user.last, "Persbrant", "The correct item was actually added");
            });

        }).catch(function (e) {
            ok(false, "Error: " + e);
        }).finally(start);
    });
    asyncTest("delete", function () {
        // Without transaction
        db.users.get(1, function (user) {
            notEqual(user, null, "User with id 1 exists");
        }).then(function () {
            db.users.delete(1).then(function () {
                db.users.get(1, function (user) {
                    equal(user, null, "User not found anymore");
                    start();
                });
            });
        });
    });
    asyncTest("delete(using transaction)", function() {
        // With transaction
        db.transaction("rw", db.users).try(function (users) {
            users.get(1, function (user) {
                notEqual(user, null, "User with id 1 exists");
            });
            users.delete(1);
            users.get(1, function (user) {
                equal(user, null, "User not found anymore");
            });
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });
    asyncTest("clear", function () {
        db.transaction("rw", "users").try(function (users) {
            users.count(function (count) {
                equal(count, 2, "There are 2 items in database before clearing it");
            });
            users.clear();
            users.count(function (count) {
                equal(count, 0, "There are 0 items in database after it has been cleared");
            });
        }).catch(function (e) {
            ok(false, e);
        }).finally(start);
    });
})();
