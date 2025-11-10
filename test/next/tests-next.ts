import Dexie from 'dexie';
import { NextDexie, QueryPlan } from 'dexie/next';
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

promisedTest("next with query", async () => {
    const friends = await db.friends
        .where("age").above(30)
        .where("shoeSize").below(45)
        .orderBy("name")
        .desc()
        .toArray();
    equal(friends.length, 2, "Should have 2 friends above 30 years with shoe size below 45");
    equal(friends[0].name, "Bengt", "First should be Bengt");
    equal(friends[1].name, "Arne3", "Second should be Arne3");
});

promisedTest("explain() - simple toArray", async () => {
    const plan = await db.friends.explain();
    console.log("Plan for toArray():", JSON.stringify(plan, null, 2));
    
    equal(plan.strategy, "Full table scan", "Should use full table scan");
    ok(plan.index, "Should have an index");
    equal(plan.estimatedComplexity, "O(n)", "Should be O(n)");
});

promisedTest("explain() - where with startsWith", async () => {
    const plan = await db.friends.where("name").startsWith("A").explain();
    console.log("Plan for where startsWith:", JSON.stringify(plan, null, 2));
    
    equal(plan.strategy, "Direct index query (fast path)", "Should use direct index query");
    ok(plan.index, "Should have an index");
    equal(plan.index?.name, "name", "Should use 'name' index, not compound");
    equal(plan.index?.compound, false, "Should not be a compound index");
    ok(plan.ranges, "Should have ranges");
    equal(plan.ranges?.length, 1, "Should have 1 range");
    equal(plan.estimatedComplexity, "O(log n + k)", "Should be O(log n + k)");
});

promisedTest("explain() - where with orderBy", async () => {
    const plan = await db.friends.where("age").above(30).orderBy("name").explain();
    console.log("Plan for where + orderBy:", JSON.stringify(plan, null, 2));
    
    ok(plan.index, "Should have an index");
    ok(plan.strategy, "Should have a strategy");
    ok(plan.notes && plan.notes.length > 0, "Should have notes explaining the strategy");
});

promisedTest("explain() - orderBy without where", async () => {
    const plan = await db.friends.orderBy("age").desc().explain();
    console.log("Plan for orderBy only:", JSON.stringify(plan, null, 2));
    
    ok(plan.index, "Should have an index");
    equal(plan.index?.name, "age", "Should use 'age' index");
    equal(plan.direction, "desc", "Should be descending");
    ok(plan.strategy.includes("Index scan"), "Should use index scan");
});

promisedTest("explain() - complex query", async () => {
    const plan = await db.friends
        .where("age").above(30)
        .where("shoeSize").below(45)
        .orderBy("name")
        .desc()
        .explain();
    console.log("Plan for complex query:", JSON.stringify(plan, null, 2));
    
    ok(plan.index, "Should have an index");
    ok(plan.where, "Should have where clause in plan");
    equal(plan.direction, "desc", "Should be descending");
    ok(plan.notes && plan.notes.length > 0, "Should have explanatory notes");
});

