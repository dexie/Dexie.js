import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, supports, promisedTest} from './dexie-unittest-utils';

var db = new Dexie("TestDBBinaryKeys");
db.version(1).stores({
    items: "id,data"
});

db.on('populate', ()=> {
    db.items.bulkAdd([
        {id: 'Uint8Array', data: new Uint8Array([1,2,3])},
        {id: 'ArrayBuffer', data: new Uint8Array([4,5,6]).buffer},
    ]);
});

module("binarykeys", {
    setup: function () {
        stop();
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    },
    teardown: function () {
    }
});

promisedTest('binaryPrimaryKey', async () => {
    if (!supports("binarykeys")) {
        ok(true, "This browser does not support IndexedDB 2.0");
        return;
    }

    await db.items.add({id: new Float32Array([4.3, 2.5]), data: "string"});

    let back = db.items.get(new Float32Array([4.3, 2.5]));
    equal (back[0], 4.3, "Should get float value");
    equal (back[1], 2.5, "Should get float value");
});

promisedTest('binaryIndex', async () => {
    if (!supports("binarykeys")) {
        ok(true, "This browser does not support IndexedDB 2.0");
        return;
    }

    equal (await db.items.where('data').equals(new Uint8Array([1,2,3])).count(), 1, "Should be able to query on binary key");
    let x = await db.items.where('data')
        .anyOf([new Uint8Array([1,2,3]), new Uint8Array([4,5,6])])
        .toArray();
    equal (x.length, 2, "Should find both keys even though the second has another binary type (IndexedDB should not distinguish them)");
});

promisedTest('or query', async () => {
    if (!supports("binarykeys")) {
        ok(true, "This browser does not support IndexedDB 2.0");
        return;
    }

    await db.items.add({id: new Float32Array([6.3, 10.5]), data: "something"});

    let a = await db.items.where('data').equals("something")
        .or('id').equals(new Uint8Array([1,2,3]))
        .toArray();
    
    equal (a.length, 2, "Should get two entries");
    ok (a.some(x => x.id instanceof Float32Array), "Should get the Float32Array id in the result");
    ok (a.some(x => x.id == "Uint8Array"), "Should get the string-primary key in the result");
});