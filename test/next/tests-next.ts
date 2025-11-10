import Dexie from 'dexie';
import { NextDexie } from 'dexie/next';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, supports, spawnedTest, promisedTest, isSafari, isSafariPrivateMode} from '../dexie-unittest-utils';


const _db = new Dexie("Apansson") as Dexie & {
    friends: Dexie.Table<{id?: number, name: string, age: number, shoeSize: number}, number>;
}
_db.version(1).stores({friends: '++id,name,age,[name+age+shoeSize]'});
_db.on("populate", function() {
    _db.friends.bulkAdd([
        {name: "Arne1", age: 42, shoeSize: 46},
        {name: "Arne2", age: 43, shoeSize: 45},
        {name: "Arne3", age: 44, shoeSize: 44},
        {name: "Bengt", age: 36, shoeSize: 43},
        {name: "Cecilia", age: 25, shoeSize: 38}
    ]);
});
const db = NextDexie(_db);

module("next");

promisedTest("basic next", async () => {
    const friends = await db.friends.toArray();
    equal(friends.length, 5, "Should have 5 friends in database");

    const f2 = await db.friends.where("name").startsWith("A").toArray();
    equal(f2.length, 3, "Should have 3 friends with name starting with A");

    const f3 = await db.friends.orderBy("age").desc().toArray();
    equal(f3[0].name, "Arne3", "Oldest friend should be Arne3");
});

