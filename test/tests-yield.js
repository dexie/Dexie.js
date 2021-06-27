import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase} from './dexie-unittest-utils';

const db = new Dexie("TestYieldDb");
const async = Dexie.async;
const spawn = Dexie.spawn;

db.version(1).stores({
    friends: '++id,name,*groups',
    pets: '++id,name'
});

module("yield", {
    setup: function () {
        stop();
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    },
    teardown: function () {
    }
});

asyncTest ("db.transaction() with yield", async(function* () {
    var finallyWasReached = false;
    try {
        yield db.transaction('rw', 'friends', 'pets', function* () {
            // Add a cat and store it's final ID
            var catId = yield db.pets.add({ name: "Tito", kind: "cat" });
            // Add a dog in the same way.
            var dogId = yield db.pets.add({ name: "Josephina", kind: "dog" });
            // Add a friend who owns the pets
            db.friends.add({ name: "Gurra G", pets: [catId, dogId] });

            var gurra = yield db.friends.where('name').equals("Gurra G").first();
            ok(!!gurra, "Gurra could be found with yield");

            // Now retrieve the pet objects that Gurra is referring to:
            var gurrasPets = yield db.pets.where('id').anyOf(gurra.pets).toArray();
            equal(gurrasPets.length, 2, "Gurras all two pets could be retrieved via yield");
            equal(gurrasPets[0].kind, "cat", "Gurras first pet is a cat");
            equal(gurrasPets[1].kind, "dog", "Gurras second pet is a dog");
        });

    } catch(e) {
        ok(false, "Caught error: " + e);
    } finally {
        finallyWasReached = true;
    }
    ok(finallyWasReached, "finally was reached");
    start();
}));

asyncTest ("Catching indexedDB error event", 2, async(function* ()
{
    try {
        yield db.pets.add({id: 1, name: "Tidi", kind: "Honeybadger"});
        ok(true, "Should come so far");
        yield db.pets.add({id: 1, name: "Todoo", kind: "Snake"}); // Should generate an IDB error event!
        ok(false, "Should not come here");
    } catch (e) {
        equal(e.name, "ConstraintError", "Caught indexedDB DOMError event ConstraintError");
    }
    start();
}));

asyncTest ("Catching error prevents transaction from aborting", 5, async(function* () {
    try {
        yield db.transaction('rw', 'pets', function*(){
            try {
                yield db.pets.add({id: 1, name: "Tidi", kind: "Honeybadger"});
                ok(true, "Should come so far");
                yield db.pets.add({id: 1, name: "Todoo", kind: "Snake"}); // Should generate an IDB error event!
                ok(false, "Should not come here");
            } catch (e) {
                equal(e.name, "ConstraintError", "Caught indexedDB DOMError event ConstraintError");
            }
        });
        ok (true, "Should come here - transaction committed because we caught the error");

        ok ((yield db.pets.get(1)), "A pet with ID 1 exists in DB");
        equal ((yield db.pets.get(1)).name, "Tidi", "It was Tidi in the first position");
    } finally {
        start();
    }
}));

asyncTest("Transaction not committing when not catching error event", 4, async(function* ()
{
    try {
        yield db.transaction('rw', 'pets', function* ()
        {
            yield db.pets.add({id: 1, name: "Tidi", kind: "Honeybadger"});
            ok(true, "Should come so far");
            yield db.pets.add({id: 1, name: "Todoo", kind: "Snake"}); // Should generate an IDB error event!
            ok(false, "Should not come here");
        });
        ok(false, "Should not come here");

    } catch (e) {

        ok(true, "Transaction should fail");
        equal (e.name, "ConstraintError", "Error caught was a ConstraintError!");
        equal ((yield db.pets.count()), 0, "Pets table should still be empty because transaction failed");

    } finally {
        start();
    }
}));

asyncTest("Should allow yielding a non-promise", async(function* () {
    try {
        var x = yield 3;
        equal(x, 3, "Could yield a non-promise");
    } catch (e) {
        ok(false, "Yielding a non-Thenable wasn't be allowed");
    } finally {
        start();
    }
}));

asyncTest("Should allow yielding an array with a mix of values and thenables", async(function* () {
    try {
        var results = yield [1, 2, Dexie.Promise.resolve(3)];
        equal(results.length, 3, "Yielded array is of size 3");
        equal(results[0], 1, "First value is 1");
        equal(results[1], 2, "Second value is 2");
        equal(results[2], 3, "Third value is 3");
    } catch (e) {
        ok(false, "Got exception when trying to do yield an array of mixed values/promises");
    } finally {
        start();
    }
}));

asyncTest("Should allow yielding an array of non-promises only", async(function* () {
    try {
        var results = yield [1,2,3];
        equal(results.length, 3, "Yielded array is of size 3");
        equal(results[0], 1, "First value is 1");
        equal(results[1], 2, "Second value is 2");
        equal(results[2], 3, "Third value is 3");
    } catch (e) {
        ok(false, e);
    } finally {
        start();
    }
}));

asyncTest("Should allow yielding an empty array", async(function* () {
    try {
        var results = yield [];
        equal(results.length, 0, "Yielded array is of size 0");
    } catch (e) {
        ok(false, e);
    } finally {
        start();
    }
}));


asyncTest("Should allow yielding an array of different kind of any kind of promise", function () {
    spawn (function*()
    {
        var results = yield [Promise.resolve(1), Dexie.Promise.resolve(2), Promise.resolve(3)];
        equal(results.length, 3, "Yielded array is of size 3");
        equal(results[0], 1, "First value is 1");
        equal(results[1], 2, "Second value is 2");
        equal(results[2], 3, "Third value is 3");
        return 4;
    }).then (function(x) {
        equal(x, 4, "Finally got the value 4");
    }).catch (function(e) {
        ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(start);
});

asyncTest("Throw after yield 1", function () {
    spawn (function*()
    {
        try {
            yield Promise.resolve(3);
            ok(true, "yielded a value");
            throw "error";
        } catch (e) {
            ok(e === "error", "Catched exception: " + e);
        }
        return 4;
    }).then (function(x) {
        equal(x, 4, "Finally got the value 4");
    }).catch (function(e) {
        ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(start);
});

asyncTest("Throw after yield 2", function () {
    Promise.resolve(spawn (function*()
    {
        try {
            yield 3;
            ok(true, "yielded a value");
            throw "error";
        } catch (e) {
            ok(e === "error", "Catched exception: " + e);
        }
        return 4;
    })).then (function(x) {
        equal(x, 4, "Finally got the value 4");
    }).catch (function(e) {
        ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(start);
});
        
asyncTest("Throw before yield", function () {
    Promise.resolve(spawn (function*()
    {
        try {
            throw "error";
        } catch (e) {
            ok(e === "error", "Catched exception: " + e);
        }
        return 4;
    })).then (function(x) {
        equal(x, 4, "Finally got the value 4");
    }).catch (function(e) {
        ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(start);
});

asyncTest("Catch rejected promise", function () {
    spawn (function*() {
        try {
            yield new Promise(function(resolve, reject) { reject("fault fault!"); });
            ok(false, "Shouldn't come here");
        } catch (e) {
            ok(e === "fault fault!", "Catched exception: " + e);
        }
        return 4;
    }).then (function(x) {
        equal(x, 4, "Finally got the value 4");
    }).catch (function(e) {
        ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(start);
});

asyncTest("Catch rejected promise in an array", function () {
    spawn (function*() {
        try {
            yield [1, 2, new Promise(function(resolve, reject) { reject("fault fault!"); }), 4];
            ok(false, "Shouldn't come here");
        } catch (e) {
            ok(e === "fault fault!", "Catched exception: " + e);
        }
        return 4;
    }).then (function(x) {
        equal(x, 4, "Finally got the value 4");
    }).catch (function(e) {
        ok(false, "Something is rotten in the state of Denmark: " + e);
    }).then(start);
});

asyncTest("Should allow returning a promise", function () {
    spawn (function*()
    {
        return Promise.resolve(3);
    }).then (function(result) {
        equal(result, 3, "Returning a directly should also be allowed");
    }).catch (function(e) {
        ok(false, e);
    }).then(start);
});

asyncTest("Should be able to do 'return yield Promise.resolve(x);'", function () {
    spawn (function*()
    {
        return yield Promise.resolve(3);
    }).then (function() {
        ok(true, "Should be able to do 'return yield Promise.resolve(x);'");
    }).catch (function(e) {
        ok(false, "Error occurred: " + e);
    }).then(start);
});

asyncTest("Arrow functions and let", async(function*() {
    let x = yield [1, 2, Promise.resolve(3)];
    let y = x.map(a => a - 1);
    equal(y[0], 0);
    equal(y[1], 1);
    equal(y[2], 2);
    start();
}));

asyncTest("Calling sub async function", async(function*(){
    var addFriend = async(function* addFriend(friend) {
        let friendId = yield db.friends.add(friend);
        return yield db.friends.get (friendId);
    });

    var deleteFriends = async(function* deleteFriends() {
        return yield db.friends.where('name').anyOf("Foo", "Bar").delete();
    });

    try {
        let foo = yield addFriend({name: "Foo"});
        let bar = yield addFriend({name: "Bar"});
        ok(foo.name == "Foo", "Foo got its name");
        ok(bar.name == "Bar", "Bar got its name");
        let numDeleted = yield deleteFriends();
        ok (true, numDeleted + " friends successfully deleted")
    } catch (e) {
        ok(false, e);
    } finally {
        start();
    }
}));
