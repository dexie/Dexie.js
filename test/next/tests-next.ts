import Dexie from 'dexie';
import { NextDexie, QueryPlan, getSuggestedIndexes, clearSuggestedIndexes } from 'dexie/next';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, supports, spawnedTest, promisedTest, isSafari, isSafariPrivateMode} from '../dexie-unittest-utils';


const _db = new Dexie("Apansson") as Dexie & {
    friends: Dexie.Table<{id?: number, name: string, age: number, shoeSize: number}, number>;
}
_db.version(13).stores({friends: '++id,age,name,[name+age+shoeSize]'});
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
    equal(plan.index?.name, ":id", "Should use primary key (alias :id)");
    equal(plan.estimatedComplexity, "O(n)", "Should be O(n)");
    ok(plan.notes && plan.notes.length > 0, "Should have notes");
    ok(plan.notes.some(n => n.includes("primary key")), "Should mention primary key in notes");
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
    ok(!plan.suggestedIndexes || plan.suggestedIndexes.length === 0, "Should not suggest indexes for optimal query");
});

promisedTest("explain() - where with orderBy", async () => {
    const plan = await db.friends.where("age").above(30).orderBy("name").explain();
    console.log("Plan for where + orderBy:", JSON.stringify(plan, null, 2));
    
    ok(plan.index, "Should have an index");
    equal(plan.index?.name, "age", "Should use 'age' index for filtering");
    ok(plan.strategy, "Should have a strategy");
    ok(plan.notes && plan.notes.length > 0, "Should have notes explaining the strategy");
    ok(plan.notes.some(n => n.includes("sort")), "Should mention manual sort in notes");
    // No suggested index for range + orderBy since compound index won't help with ordering
    // (IndexedDB requires equality on all components before orderBy component for ordering to work)
    ok(!plan.suggestedIndexes || plan.suggestedIndexes.length === 0, "Should not suggest compound index for range query");
    console.log("Suggested indexes:", plan.suggestedIndexes);
});

promisedTest("explain() - where with orderBy and limit", async () => {
    const plan = await db.friends
        .where("age").above(30)
        .orderBy("name")
        .limit(2)
        .explain();
    console.log("Plan for where + orderBy + limit:", JSON.stringify(plan, null, 2));
    
    // With limit, strategy should prioritize orderBy index and filter manually
    equal(plan.strategy, "OrderBy index with filtering", "Should use orderBy index strategy with limit");
    ok(plan.index, "Should have an index");
    equal(plan.index?.name, "name", "Should use 'name' index for ordering");
    equal(plan.index?.compound, false, "Should use simple name index, not compound");
    ok(plan.cursorBased, "Should use cursor-based iteration with limit");
    equal(plan.limit, 2, "Should have limit in plan");
    equal(plan.estimatedComplexity, "O(log n + m)", "Should be O(log n + m) for cursor with filter");
    ok(plan.notes && plan.notes.some(n => n.includes("cursor")), "Should mention cursor iteration in notes");
    ok(plan.notes && plan.notes.some(n => n.includes("filter")), "Should mention manual filtering in notes");
    
    // Should NOT suggest any indexes since this strategy is already efficient
    ok(!plan.suggestedIndexes || plan.suggestedIndexes.length === 0, 
       "Should not suggest indexes - orderBy index with cursor is efficient for small limits");
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
    // Without limit, should use 'age' index to filter efficiently, then sort manually
    // (Using 'name' index would require full scan + manual filtering on both conditions)
    ok(plan.index?.name === "age" || plan.index?.name === "name", "Should use 'age' (optimal) or 'name' index");
    ok(plan.where, "Should have where clause in plan");
    equal(plan.direction, "desc", "Should be descending");
    ok(plan.notes && plan.notes.length > 0, "Should have explanatory notes");
    
    // Should NOT suggest indexes since age already has an index that can be used
    // Adding shoeSize index wouldn't help since we can only use one range in a compound index
    ok(!plan.suggestedIndexes || plan.suggestedIndexes.length === 0, 
       "Should not suggest indexes - age index can be used, and compound index wouldn't help with multiple ranges");
    console.log("Suggested indexes:", plan.suggestedIndexes);
});

promisedTest("explain() - complex query with limit", async () => {
    const plan = await db.friends
        .where("age").above(30)
        .where("shoeSize").below(45)
        .orderBy("name")
        .desc()
        .limit(2)
        .explain();
    console.log("Plan for complex query with limit:", JSON.stringify(plan, null, 2));
    
    ok(plan.index, "Should have an index");
    // With limit, should use 'name' index with cursor iteration for efficient early exit
    // Filter manually on age and shoeSize while iterating
    equal(plan.index?.name, "name", "Should use 'name' index for ordering with limit");
    ok(plan.where, "Should have where clause in plan");
    equal(plan.direction, "desc", "Should be descending");
    equal(plan.limit, 2, "Should have limit in plan");
    ok(plan.cursorBased, "Should use cursor-based iteration with limit");
    ok(plan.notes && plan.notes.length > 0, "Should have explanatory notes");
    ok(plan.notes.some(n => n.includes("cursor") || n.includes("filter")), 
       "Should mention cursor or filtering in notes");
    ok(plan.estimatedComplexity, "Should have complexity estimate");
    
    // Should NOT suggest indexes - using orderBy index with cursor is efficient for small limits
    ok(!plan.suggestedIndexes || plan.suggestedIndexes.length === 0, 
       "Should not suggest indexes - orderBy index with cursor is efficient for small limits");
    console.log("Suggested indexes:", plan.suggestedIndexes);
});

promisedTest("explain() - complex query with offset", async () => {
    const plan = await db.friends
        .where("age").above(30)
        .where("shoeSize").below(45)
        .orderBy("name")
        .desc()
        .offset(1)
        .explain();
    console.log("Plan for complex query with offset:", JSON.stringify(plan, null, 2));
    
    ok(plan.index, "Should have an index");
    // With offset, must use 'name' index with cursor iteration to maintain correct order
    // Cannot load all and skip - must iterate in order with filtering
    equal(plan.index?.name, "name", "Should use 'name' index for ordering with offset");
    ok(plan.where, "Should have where clause in plan");
    equal(plan.direction, "desc", "Should be descending");
    equal(plan.offset, 1, "Should have offset in plan");
    ok(plan.cursorBased, "Should use cursor-based iteration with offset");
    ok(plan.notes && plan.notes.length > 0, "Should have explanatory notes");
    ok(plan.notes.some(n => n.includes("cursor") || n.includes("filter")), 
       "Should mention cursor or filtering in notes");
    
    // Should NOT suggest indexes - using orderBy index with cursor is necessary for offset
    ok(!plan.suggestedIndexes || plan.suggestedIndexes.length === 0, 
       "Should not suggest indexes - orderBy index with cursor is necessary for correct offset");
    console.log("Suggested indexes:", plan.suggestedIndexes);
});


promisedTest("getSuggestedIndexes() - collect from actual queries", async () => {
    clearSuggestedIndexes();
    
    // Run some queries that should trigger suggestions
    await db.friends.orderBy("shoeSize").toArray();
    await db.friends.where("age").above(30).orderBy("name").toArray();
    
    const suggestions = getSuggestedIndexes();
    console.log("Collected suggestions:", JSON.stringify(suggestions, null, 2));
    
    ok(suggestions.length > 0, "Should have collected suggestions");
    ok(suggestions.some(s => s.table === "friends"), "Should have suggestions for friends table");
    ok(suggestions.every(s => s.priority >= 1 && s.priority <= 10), "All priorities should be 1-10");
    ok(suggestions.every(s => s.reason), "All suggestions should have a reason");
    
    // Verify they're sorted by priority
    for (let i = 1; i < suggestions.length; i++) {
        ok(suggestions[i-1].priority >= suggestions[i].priority, "Should be sorted by priority descending");
    }
});

