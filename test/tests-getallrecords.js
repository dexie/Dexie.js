/**
 * Tests for IDB 3.0 getAll/getAllKeys direction optimization
 * @see https://github.com/dexie/Dexie.js/issues/2183
 */
import Dexie from 'dexie';
import { module, stop, start, asyncTest, ok, equal, deepEqual } from 'QUnit';
import { spawnedTest } from './dexie-unittest-utils';

module("getAllRecords", {
    setup: function () {
        stop();
        Dexie.delete("TestDB-getAllRecords").then(start);
    },
    teardown: function () {
        stop();
        Dexie.delete("TestDB-getAllRecords").then(start);
    }
});

spawnedTest("reverse toArray() should work correctly", function* () {
    const db = new Dexie("TestDB-getAllRecords");
    db.version(1).stores({
        items: '++id, name'
    });
    
    yield db.open();
    
    // Add test data
    yield db.items.bulkAdd([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
        { name: 'Diana' },
        { name: 'Eve' }
    ]);
    
    // Test forward toArray
    const forward = yield db.items.toArray();
    equal(forward.length, 5, "Forward toArray returns 5 items");
    equal(forward[0].name, 'Alice', "First item is Alice");
    equal(forward[4].name, 'Eve', "Last item is Eve");
    
    // Test reverse toArray - this should now use getAllRecords() when available
    const reverse = yield db.items.reverse().toArray();
    equal(reverse.length, 5, "Reverse toArray returns 5 items");
    equal(reverse[0].name, 'Eve', "First item in reverse is Eve");
    equal(reverse[4].name, 'Alice', "Last item in reverse is Alice");
    
    db.close();
});

spawnedTest("reverse primaryKeys() should work correctly", function* () {
    const db = new Dexie("TestDB-getAllRecords");
    db.version(1).stores({
        items: '++id, name'
    });
    
    yield db.open();
    
    // Add test data
    const ids = yield db.items.bulkAdd([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' }
    ], { allKeys: true });
    
    // Test forward primaryKeys
    const forwardKeys = yield db.items.primaryKeys();
    deepEqual(forwardKeys, ids, "Forward primaryKeys returns correct order");
    
    // Test reverse primaryKeys - should use getAllRecords() when available
    const reverseKeys = yield db.items.reverse().primaryKeys();
    deepEqual(reverseKeys, [...ids].reverse(), "Reverse primaryKeys returns reversed order");
    
    db.close();
});

spawnedTest("reverse toArray() with limit should work correctly", function* () {
    const db = new Dexie("TestDB-getAllRecords");
    db.version(1).stores({
        items: '++id, value'
    });
    
    yield db.open();
    
    // Add test data
    for (let i = 1; i <= 10; i++) {
        yield db.items.add({ value: i });
    }
    
    // Test reverse with limit
    const result = yield db.items.reverse().limit(3).toArray();
    equal(result.length, 3, "Limit works with reverse");
    equal(result[0].value, 10, "First item is 10 (highest)");
    equal(result[1].value, 9, "Second item is 9");
    equal(result[2].value, 8, "Third item is 8");
    
    db.close();
});

spawnedTest("reverse on index should work correctly", function* () {
    const db = new Dexie("TestDB-getAllRecords");
    db.version(1).stores({
        items: '++id, name'
    });
    
    yield db.open();
    
    // Add test data
    yield db.items.bulkAdd([
        { name: 'Charlie' },
        { name: 'Alice' },
        { name: 'Bob' }
    ]);
    
    // Test forward orderBy on index
    const forward = yield db.items.orderBy('name').toArray();
    equal(forward[0].name, 'Alice', "Forward orderBy: first is Alice");
    equal(forward[2].name, 'Charlie', "Forward orderBy: last is Charlie");
    
    // Test reverse orderBy on index
    const reverse = yield db.items.orderBy('name').reverse().toArray();
    equal(reverse[0].name, 'Charlie', "Reverse orderBy: first is Charlie");
    equal(reverse[2].name, 'Alice', "Reverse orderBy: last is Alice");
    
    db.close();
});
