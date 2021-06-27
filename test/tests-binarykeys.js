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

promisedTest('Binary Primary Key (Int32Array)', async () => {
    if (!supports("binarykeys")) {
        ok(true, "This browser does not support IndexedDB 2.0");
        return;
    }
    try {
        const id = new Int32Array([4, 2]);
        equal (id[0], 4, "Sanity check 1");
        equal (id[1], 2, "Sanity check 2");
        
        await db.items.add({id, data: "string"});

        let back = await db.items.where({id: new Int32Array([4, 2])}).first();
        equal (back.data, "string", "Should retrieve an object by its binary primary key");
        equal (back.id[0], 4, "Should get correct value 4");
        equal (back.id[1], 2, "Should get correcg value 2");
    } finally {
        // Cleanup. This is only needed because of a firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1395071
        await db.items.clear();
    }
});

promisedTest('Binary Primary Key (Float32Array)', async () => {
    if (!supports("binarykeys")) {
        ok(true, "This browser does not support IndexedDB 2.0");
        return;
    }
    try {
        const id = new Float32Array([4.3, 2.5]);
        equal (Math.round(id[0] * 100), 4.3 * 100, "Sanity check 1");
        equal (Math.round(id[1] * 100), 2.5 * 100, "Sanity check 2");
        
        await db.items.add({id, data: "string"});

        let back = await db.items // avoiding db.items.get(key) because it triggers bug in Firefox 55.
            .where({id: new Float32Array([4.3, 2.5])})
            .first();
        equal (back.data, "string", "Should retrieve an object by its binary primary key");
        equal (Math.round(back.id[0] * 100), 4.3 * 100, "Should get correct float value 4.3");
        equal (Math.round(back.id[1] * 100), 2.5 * 100, "Should get correcg float value 2.5");
    } finally {
        // Cleanup. This is only needed because of a firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1395071
        await db.items.clear();        
    }
});


promisedTest('Binary Index', async () => {
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

promisedTest('OR-query', async () => {
    if (!supports("binarykeys")) {
        ok(true, "This browser does not support IndexedDB 2.0");
        return;
    }
    try {
        await db.items.bulkAdd([
            {
                id: new Float32Array([6.3, 10.5]),
                data: "something"
            },
            {
                id: new Uint8Array([1,2,3]),
                data: "somethingelse"
            }
        ]);
        

        let a = await db.items.where('data').equals("something")
            .or('id').equals(new Uint8Array([1,2,3]))
            .toArray();
        
        equal (a.length, 2, "Should get two entries");
        ok (a.some(x => x.data === "something"), "Should get 'something' in the result");
        ok (a.some(x => x.data === "somethingelse"), "Should get 'somethingelse' in the result");
    } finally {
        // Cleanup. This is only needed because of a firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1395071
        await db.items.clear();        
    }
});