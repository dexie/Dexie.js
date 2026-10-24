import Dexie, { liveQuery } from 'dexie';
import { equal, module, ok, start, stop } from 'QUnit';
import { from } from "rxjs";
import { map } from "rxjs/operators";
import { deepEqual, isDeepEqual } from './deepEqual';
import { isIE, promisedTest, resetDatabase } from './dexie-unittest-utils';

const db = new Dexie("TestLiveQuery", {
  cache: 'immutable' // Using immutable cache in tests because it is most likely to fail if not using properly.
});
db.version(2).stores({
    items: "id, name",
    foo: "++id",
    outbound: "++,name",
    friends: "++id, name, age",
    multiEntry: "id, *tags",
    issue1946: "++id, [name+age], [name+age+id]",
    issue2058: "id, &[a+b]"
});

db.on('populate', ()=> {
  db.items.bulkAdd([
      {id: 1},
      {id: 2},
      {id: 3}
  ]);
  db.outbound.bulkAdd([
    {num: 1, name: "A"},
    {num: 2, name: "B"},
    {num: 3, name: "C"}
  ], [1, 2, 3]);
});

function objectify(map) {
  const rv = {};
  map.forEach((value, name) => {
    rv[name] = value;
  });
  return rv;
}

class Signal {
  promise = new Promise(resolve => this.resolve = resolve);
}

function liveQueryUnitTester(lq, {graceTime}={graceTime: 0}) {
  const lq = liveQuery(lq)
  return {
    waitTilDeepEqual(expected, description, timeout=500) {
      return new Promise((resolve, reject) => {
        let latestValue;
        const subscription = lq.subscribe(value => {
          latestValue = value;
          if (isDeepEqual(value, expected)) {
            deepEqual(value, expected, description);
            clearTimeout(timer);
            subscription.unsubscribe();
            resolve();
          }
        });
        let timer = setTimeout(() => {
          subscription.unsubscribe();
          try {
            deepEqual(latestValue, expected, description);
            resolve();
          } catch (e) {
            reject(e);
          }
        }, timeout);
      });
    }
  }
}

module("live-query", {
  setup: function () {
      stop();
      resetDatabase(db).catch(function (e) {
          ok(false, "Error resetting database: " + e.stack);
      }).finally(start);
  },
  teardown: function () {
  }
});

/*promisedTest("txcommitted event", async ()=>{
  let signal = new Signal();
  let os = {};
  function txCommitted(observabilitySet) {
    Dexie.extendObservabilitySet(os, observabilitySet);
    signal.resolve(observabilitySet);
  }
  await db.open();
  Dexie.on('txcommitted', txCommitted);
  await db.transaction('rw', db.items, db.foo, async ()=>{
    await db.items.add({id: 4, name: "aiwo1"});
    await db.items.add({id: 7, name: "kjlj"});
    await db.foo.add({name: "jkll"});
    await db.items.update(1, {name: "A"});
  });
  while (!os.TestLiveQuery || !os.TestLiveQuery.items || !hasKey(os.TestLiveQuery.items.keys, 4)) {
    // When Dexie.Observable is active, we might see intermediate transactions taking place
    // before our transaction.
    signal = new Signal();
    await signal.promise;
    console.log("got new os:", os);
  }
  ok(!!os.TestLiveQuery, "Got changes in our table name TestLiveQuery");
  let itemsChanges = os.TestLiveQuery.items;
  ok(itemsChanges, "Got changes for items table");
  deepEqual(itemsChanges.keys, rangeSet([[4], [7], [1]]), "Item changes on concattenated keys");
  deepEqual(itemsChanges.indexes, {"": rangeSet([[4],[7]]),name: rangeSet([["aiwo1"],["kjlj"],["A"]])}, "Index changes present");

  // Foo changes (auto-incremented id)
  let fooChanges = os.TestLiveQuery.foo;
  ok(fooChanges, "Got changes for foo table");

  os = {};
  let fooIds = await db.foo.toCollection().primaryKeys();
  await db.transaction('rw', db.items, db.foo, async ()=>{
    await db.items.update(4, {name: "aiwo2"});
    await db.foo.where('id').between(0, 1000).delete();
  });
  while (!os.TestLiveQuery || !os.TestLiveQuery.items || !hasKey(os.TestLiveQuery.items.keys, 4)) {
    // When Dexie.Observable is active, we might see intermediate transactions taking place
    // before our transaction.
    signal = new Signal();
    await signal.promise;
  }
  itemsChanges = os.TestLiveQuery.items;
  ok(hasKey(itemsChanges.keys, 4), "Item 4 was updated");
  ok(hasKey(itemsChanges.indexes.name, "aiwo1"), "Old value of name index were triggered");
  ok(hasKey(itemsChanges.indexes.name, "aiwo2"), "New value of name index were triggered");

  fooChanges = os.TestLiveQuery.foo;
  ok(!!fooChanges, "Foo table changed");
  if (hasKey(fooChanges.keys, 0) && hasKey(fooChanges.keys, 1000)) {
    // Without addons:
    deepEqual(fooChanges.keys, rangeSet([[0, 1000]]), "Got a range update of foo keys 0..1000");
  } else {
    // With hooks / addons or browser workarounds:
    deepEqual(fooChanges.keys, rangeSet(fooIds.map(id => [id])), "Got individual delete updates of foo keys ", fooIds.join(','));
  }

  Dexie.on('txcommitted').unsubscribe(txCommitted);
});*/

promisedTest("subscribe to range", async ()=> {
  let tester = liveQueryUnitTester(()=>db.items.toArray());
  await tester.waitTilDeepEqual([{id: 1}, {id: 2}, {id: 3}], "First callback should give initally populated content");
  db.items.add({id:-1});
  await tester.waitTilDeepEqual([{id:-1}, {id: 1}, {id: 2}, {id: 3}], "2nd callback should give updated content");
  db.items.delete(2);
  await tester.waitTilDeepEqual([{id:-1}, {id: 1}, {id: 3}], "3rd callback should wake up when deletion was made");
});

promisedTest("subscribe to keys", async ()=>{
  if (isIE) {
    // The IE implementation becomes shaky here.
    // Maybe becuase we launch several parallel queries to IDB.
    ok(true, "Skipping this test for IE - too shaky for the CI");
    return;
  }
  let signal1 = new Signal(), signal2 = new Signal();
  let count1 = 0, count2 = 0;
  //const debugTxCommitted = set => console.debug("txcommitted", set);
  //Dexie.on('txcommitted', debugTxCommitted);
  let sub1 = liveQuery(()=>db.items.get(1)).subscribe(result => {
    ++count1;
    signal1.resolve(result);
  });
  let res1 = await signal1.promise;
  equal(res1.id, 1, "First result for ID 1 ok");
  equal(count1, 1, "Callback called once");
  let sub2 = liveQuery(()=>db.items.get(2)).subscribe(result => {
    ++count2;
    signal2.resolve(result);
  });
  let res2 = await signal2.promise;
  equal(res2.id, 2, "2nd result for ID 2 ok");
  equal(count2, 1, "2nd callback called once");
  equal(count1, 1, "First callback wasn't called again");
  
  // Now mutate using update - verify listeners don't wake up on other than the keys the subscribe
  signal1 = new Signal();
  signal2 = new Signal();
  await db.items.update(1, {name: "one"});
  ok(true, "Could update item 1");
  res1 = await signal1.promise;
  equal(count1, 2, "First should have been called 2 times now");
  equal(count2, 1, "2nd callback should still only have been called once");
  equal(res1.name, "one", "We got the updated value from the expression");
  await db.items.update(2, {name: "two"});
  res2 = await signal2.promise;
  equal(count1, 2, "First should have been called 2 times now");
  equal(count2, 2, "2nd callback should have been called twice also");
  equal(res2.name, "two", "We got the updated value from the 2nd expression");

  // Now mutate using delete
  signal1 = new Signal();
  signal2 = new Signal();
  await db.items.delete(1);
  res1 = await signal1.promise;
  equal(count1, 3, "First should have been called 3 times now");
  equal(count2, 2, "2nd callback should still only have been called twice");
  ok(res1 === undefined, "The updated result of db.items.get(1) should return undefined after the deletion");

  await db.items.delete(2);
  res2 = await signal2.promise;
  equal(count1, 3, "First should still have been called 3 times");
  equal(count2, 3, "2nd callback should have been called 3 times also now");
  ok(res2 === undefined, "The updated result of db.items.get(2) should return undefined after the deletion");
  
  // Verify that no more callbacks are called after unsubscribing
  sub1.unsubscribe();
  sub2.unsubscribe();
  await db.items.update(1, {name: "fljkds"});
  equal(count1, 3, "No more calls after having unsubscribed");
  await db.items.update(1, {name: "sfdfs"});
  equal(count1, 3, "Just double-checking - no more calls after having unsubscribed");
});

promisedTest("subscribe and error occur", async ()=> {
  let signal = new Signal();
  let subscription = liveQuery(
    ()=>db.items.get(NaN) // NaN is not a valid key
  ).subscribe({
    next: result => signal.resolve("success"),
    error: result => signal.resolve("error"),
    complete: ()=> signal.resolve("complete")
  });
  ok(!subscription.closed, "Subscription should not yet be closed");
  let result = await signal.promise;
  equal(result, "error", "The observable's error callback should have been called");
  //No. Should not close errored subscriptions. What if they did a fetch call in it that failed? SHould keep subscribing.
  //ok(subscription.closed, "Subscription should have been closed after error has occurred");
  subscription.unsubscribe();
});

promisedTest("optimistic updates that eventually fail must be reverted (Issue #1823)", async ()=>{
  const log = [];
  let subscription = liveQuery(
    ()=>db.items.toArray()
  ).subscribe({
    next: result => {
      log.push(result);
      console.log("optimistic result (from #1823 test)", result);
    },
  });

  await db.transaction('rw', db.items, async ()=>{
    // Simple test a catched failing operation
    await db.items.add(
      {id: 1, iWillFail: true} // Contraint error (key 1 already exists)
    ).catch(()=>{});
    // Test another code path in adjustOptimisticFromFailures() where some operations succeed and some not.
    await db.items.bulkAdd([
      {id: 2, iWillFail: true}, // Constraint error (key 2 already exists)
      {id: 99, iWillSucceed: true}
    ]).catch(()=>{});
  });
  // Wait for a successful readonly transaction to complete after the write transaction.
  // This will make sure that the liveQuery has been updated with the final result.
  await db.transaction('r', db.items, ()=>db.items.toArray());
  subscription.unsubscribe();
  deepEqual(log.at(-1), [{id: 1},{id:2},{id:3},{id: 99, iWillSucceed: true}], "Last log entry contains the correct result. There might be optimistic updates before though.");
});

/* Use cases to cover:

  Queries
    get
    getMany
    query
    queryKeys
    itemsStartsWithAOffset3
    openKeyCursor
    count
    queryOutbound
    queryOutboundByPKey
    openCursorOutbound

  Mutations
    add
    addAuto
    update
    delete
    deleteRange
 */

let abbaKey = 0;
let lastFriendId = 0;
let barbarFriendId = 0;
const bulkFriends = [];
for (let i=0; i<51; ++i) {
  bulkFriends.push({name: `name${i}`, age: i});
}
const bulkOutbounds = [];
for (let i=0; i<51; ++i) {
  bulkOutbounds.push({name: "z"+i.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  })});
}
const mutsAndExpects = () => [
  // add
  [
    ()=>db.items.add({id: -1, name: "A"}),
    {
      itemsToArray: [{id: -1,name:"A"}, {id: 1}, {id: 2}, {id: 3}],
      itemsGet1And2: [{id: 1}, {id: -1, name: "A"}],
      itemsStartsWithA: [{id: -1, name: "A"}],
      itemsStartsWithAPrimKeys: [-1],
      itemsStartsWithAOffset3: [],
      itemsStartsWithAKeys: ["A"],
      itemsStartsWithACount: 1
    }
  ],
  // addAuto
  [
    ()=>db.outbound.add({name: "Abba"}).then(id=>abbaKey = id),
    {
      outboundToArray: [{num:1,name:"A"},{num:2,name:"B"},{num:3,name:"C"},{name:"Abba"}],
      outboundStartsWithA: [{name: "A", num: 1}, {name: "Abba"}]
    }
  ], [
    ()=>db.outbound.bulkAdd([{name: "Benny"}, {name: "C"}], [-1, 0]),
    {
      outboundToArray: [{name:"Benny"},{name: "C"},{num:1,name:"A"},{num:2,name:"B"},{num:3,name:"C"},{name:"Abba"}],
      outboundIdBtwnMinus1And2: [{name: "Benny"}, {name: "C"}, {name: "A", num: 1}, {name: "B", num: 2}],
      outboundAnyOf_BCD_keys: ["B", "C", "C"]
    }
  ],
  // update
  [
    ()=>db.outbound.update(abbaKey, {name: "Zlatan"}),
    {
      outboundToArray: [{name:"Benny"},{name: "C"},{num:1,name:"A"},{num:2,name:"B"},{num:3,name:"C"},{name:"Zlatan"}],
      outboundStartsWithA: [{name: "A", num: 1}]
    }
  ],
  [
    // Testing that keys-only queries don't get bothered
    ()=>db.items.update(-1, {foo: "bar"}),
    {
      itemsToArray: [{id: -1,name:"A", foo: "bar"}, {id: 1}, {id: 2}, {id: 3}],
      itemsGet1And2: [{id: 1}, {id: -1, name: "A", foo: "bar"}],
      itemsStartsWithA: [{id: -1, name: "A", foo: "bar"}],
      //itemsStartsWithAPrimKeys: [-1], should not have to be updated!
      //itemsStartsWithAKeys: ["A"] should not have to be updated!
    }
  ],
  [
    // Update an index property (name) should trigger
    // listeners to that index:
    ()=>db.items.update(-1, {foo: undefined, name: "B"}),
    {
      itemsToArray: [{id: -1, name: "B"}, {id: 1}, {id: 2}, {id: 3}],
      itemsGet1And2: [{id: 1}, {id: -1, name: "B"}],
      itemsStartsWithA: [],
      itemsStartsWithAPrimKeys: [],
      itemsStartsWithAOffset3: [],
      itemsStartsWithAKeys: [],
      itemsStartsWithACount: 0
    }
  ],
  [
    // Restoring and re-checking.
    ()=>db.items.update(-1, {name: "A"}),
    {
      itemsToArray: [{id: -1, name: "A"}, {id: 1}, {id: 2}, {id: 3}],
      itemsGet1And2: [{id: 1}, {id: -1, name: "A"}],
      itemsStartsWithA: [{id: -1, name: "A"}],
      itemsStartsWithAPrimKeys: [-1],
      itemsStartsWithAOffset3: [],
      itemsStartsWithAKeys: ["A"],
      itemsStartsWithACount: 1
    }
  ],
  // add again
  [
    ()=>db.items.bulkAdd([{id: 4, name: "Abbot"},{id: 5, name: "Assot"},{id: 6, name: "Ambros"}]).then(lastId => {}),
    {
      itemsToArray: [{id:-1,name:"A"},{id:1},{id:2},{id:3},{id:4,name:"Abbot"},{id:5,name:"Assot"},{id:6,name:"Ambros"}],
      itemsStartsWithA: [{id: -1, name: "A"}, {id: 4, name: "Abbot"}, {id: 6, name: "Ambros"}, {id: 5, name: "Assot"}],
      itemsStartsWithAPrimKeys: [-1, 4, 6, 5],
      itemsStartsWithAOffset3: [{id: 5, name: "Assot"}], // offset 3
      itemsStartsWithAKeys: ["A", "Abbot", "Ambros", "Assot"],
      itemsStartsWithACount: 4
    }
  ],
  // delete:
  [
    ()=>db.transaction('rw', db.items, db.outbound, ()=>{
      db.items.delete(-1);
    }),
    {
      itemsToArray: [{id:1},{id:2},{id:3},{id:4,name:"Abbot"},{id:5,name:"Assot"},{id:6,name:"Ambros"}],
      itemsGet1And2: [{id: 1}, null],
      itemsStartsWithA: [{id: 4, name: "Abbot"}, {id: 6, name: "Ambros"}, {id: 5, name: "Assot"}],
      itemsStartsWithAPrimKeys: [4, 6, 5],
      itemsStartsWithAKeys: ["Abbot", "Ambros", "Assot"],
      itemsStartsWithACount: 3
    },
    // Allowed extras:
    // If hooks is listened to we'll get an even more correct update of the itemsStartsWithAOffset3 query
    // since oldVal will be available and offset-queries will be correcly triggered for deleted index keys before the offset.
    {
      itemsStartsWithAOffset3: [] 
    }
  ],
  // Special case for more fine grained keys observation of put (not knowing oldObjs
  [
    ()=>db.items.put({id: 5, name: "Azlan"}),
    {
      itemsToArray: [{id:1},{id:2},{id:3},{id:4,name:"Abbot"},{id:5,name:"Azlan"},{id:6,name:"Ambros"}],
      itemsStartsWithA: [{id: 4, name: "Abbot"}, {id: 6, name: "Ambros"}, {id: 5, name: "Azlan"}],
      itemsStartsWithAKeys: ["Abbot", "Ambros", "Azlan"],
    }, {
      // Things that optionally can be matched in result (if no hooks specified):
      itemsStartsWithAPrimKeys: [4, 6, 5], 
      itemsStartsWithACount: 3,
      itemsStartsWithAOffset3: []
    }
  ],
  [
    ()=>db.transaction('rw', db.items, db.outbound, ()=>{
      db.items.bulkPut([{id: 5}]);
    }),
    {
      itemsToArray: [{id:1},{id:2},{id:3},{id:4,name:"Abbot"},{id:5},{id:6,name:"Ambros"}],
      itemsStartsWithA: [{id: 4, name: "Abbot"}, {id: 6, name: "Ambros"}],
      itemsStartsWithAPrimKeys: [4, 6],
      itemsStartsWithAKeys: ["Abbot", "Ambros"],
      itemsStartsWithACount: 2
    }, {
      itemsStartsWithAOffset3: [] // This is
    }
  ],
  [
    ()=>db.transaction('rw', db.items, db.outbound, ()=>{
      db.items.delete(5);
      db.outbound.bulkDelete([abbaKey,-1,0]);
    }),
    {
      itemsToArray: [{id:1},{id:2},{id:3},{id:4,name:"Abbot"},{id:6,name:"Ambros"}],
      // (allOutbound was:
      //  [{name:"Benny"},{name: "C"},{num:1,name:"A"},{num:2,name:"B"},{num:3,name:"C"},{name:"Zlatan"}])
      // )
      outboundToArray: [{num:1,name:"A"},{num:2,name:"B"},{num:3,name:"C"}],
      //outboundStartsWithA: [{num:1,name:"A"}],
      outboundIdBtwnMinus1And2: [{num:1,name:"A"},{num:2,name:"B"}],
      outboundAnyOf_BCD_keys: ["B", "C"]
    },[
      "itemsStartsWithACount",
      // Like count(), a query with offset() depends on deletes of rows in front of
      // its window, which are not known when the deleted row was not read.
      "itemsStartsWithAOffset3"
    ]
  ],
  [
    ()=>db.friends.add({name: "Foo", age: 20}).then(id => lastFriendId = id),
    {
      friendsOver18: [{get id(){return lastFriendId}, name: "Foo", age: 20}]
    }
  ],
  [
    ()=>db.friends.put({name: "Barbar", age: 21}).then(id => barbarFriendId = id),
    {
      friendsOver18: [
        {get id(){return lastFriendId}, name: "Foo", age: 20},
        {get id(){return barbarFriendId}, name: "Barbar", age: 21}
      ]
    }
  ],
  [
    // bulkPut
    ()=>db.friends.bulkPut(bulkFriends, {allKeys: true}).then(ids => {
      // Record the actual ids here
      for (let i=0; i<ids.length; ++i) {
        bulkFriends[i].id = ids[i];
      }
    }),
    {
      friendsOver18: [
        {get id(){return lastFriendId}, name: "Foo", age: 20},
        {get id(){return barbarFriendId}, name: "Barbar", age: 21},
        ...bulkFriends.map(f => ({name: f.name, age: f.age, get id() { return f.id; }})).filter(f => f.age > 18)
      ].sort((a,b) => a.age - b.age)
    }
  ],
  // bulkPut over 50 items on an outbound table:
  [
    ()=>db.outbound.bulkPut(bulkOutbounds),
    {
      outboundToArray: [{num:1,name:"A"},{num:2,name:"B"},{num:3,name:"C"}, ...bulkOutbounds],
      outbound_above_z49: [...bulkOutbounds.filter(o => o.name > "z49")]
    },["outboundStartsWithA", "outboundIdBtwnMinus1And2", "outboundAnyOf_BCD_keys"]
  ],
  // deleteRange
  [
    ()=>db.friends.where('id').between(0, barbarFriendId, true, true).delete(),
    {
      friendsOver18: [...bulkFriends.filter(f => f.age > 18)]
    }
  ],
  // bulkDelete
  [
    // Delete all but one:
    ()=>db.friends.bulkDelete(bulkFriends.filter(f => f.age !== 20).map(f => f.id)),
    {
      friendsOver18: [...bulkFriends.filter(f => f.age === 20)]
    }
  ],
  // multiEntry
  [
    () => db.multiEntry.add({id: 1, tags: ["fooTag", "Apa"]}),
    {
      multiEntry1: [1],
      multiEntry2: [1]
    }
  ],
  [
    () => db.multiEntry.bulkPut([
      {id: 1, tags: []},
      {id: 2, tags: ["Apa", "x", "y"]},
      {id: 3, tags: ["barTag", "fooTag"]}
    ]),
    {
      multiEntry1: [2],
      multiEntry2: [3],
      multiEntry3: [{id: 2, tags: ["Apa", "x", "y"]}]
    }
  ],
  // Issue https://github.com/dexie/Dexie.js/issues/1946
  [
    () => db.issue1946.add({name: "A", age: 20}),
    {
      compoundOrderBy: [{name: "A", age: 20, id: 1}],
      compoundOrderByWithAutoIncKey: [{name: "A", age: 20, id: 1}]
    }
  ],
  // Check that the order is valid in the 1946-case:
  [
    () => db.issue1946.bulkAdd([
      {name: "A", age: 19},
      {name: "A", age: 19, mark: "x"},
      {name: "C", age: 18},
      {name: "A", age: 20, id: -1} // Override auto-increment
    ]),
    {
      compoundOrderBy: [
        {name: "A", age: 19, id: 2},
        {name: "A", age: 19, mark: "x", id: 3}, // Even if cmp(["A",19],["A",19]) === 0, IDB orders implicitly by id.
        {name: "A", age: 20, id: -1}, // Same here: order should implicitly be by PK last.
        {name: "A", age: 20, id: 1},
        {name: "C", age: 18, id: 4},
      ],
      compoundOrderByWithAutoIncKey: [
        {name: "A", age: 19, id: 2},
        {name: "A", age: 19, mark: "x", id: 3},
        {name: "A", age: 20, id: -1},
        {name: "A", age: 20, id: 1},
        {name: "C", age: 18, id: 4},
      ]
    }
  ],
  // Issue 2011 / 2012
  [
    () => db.items.bulkPut([
      {id: 6, name: "One"},
      {id: 6, name: "Two"},
      {id: 6, name: "Three"}
    ]),
    {
      itemsToArray: [{id:1},{id:2},{id:3},{id:4,name:"Abbot"},{id:6,name:"Three"}],
      itemsStartsWithA: [{id: 4, name: "Abbot"}],
      itemsStartsWithAPrimKeys: [4],
      itemsStartsWithAKeys: ["Abbot"],
      itemsStartsWithACount: 1
    },[
      "itemsStartsWithAOffset3" // Should not be updated but need to be ignored because otherwise it fails in dexie-syncable's integration tests that expects it to update to another empty array
    ]
  ]
]

promisedTest("Full use case matrix", async ()=>{
  const queries = {
    itemsToArray: () => db.items.toArray(),
    itemsGet1And2: () => Promise.all([db.items.get(1), db.items.get(-1)]),
    itemsBulkGet123: () => db.items.bulkGet([1,2,3]),
    itemsStartsWithA: () => db.items.where('name').startsWith("A").toArray(),
    itemsStartsWithAPrimKeys: () => db.items.where('name').startsWith("A").primaryKeys(),
    itemsStartsWithAOffset3: () => db.items.where('name').startsWith("A").offset(3).toArray(),
    itemsStartsWithAKeys: () => db.items.where('name').startsWith("A").keys(),
    itemsStartsWithACount: () => db.items.where('name').startsWith("A").count(),
    
    outboundToArray: () => db.outbound.toArray(),
    outboundStartsWithA: () => db.outbound.where('name').startsWith("A").toArray(),
    outboundIdBtwnMinus1And2: () => db.outbound.where(':id').between(-1, 2, true, true).toArray(),
    outboundAnyOf_BCD_keys: () => db.outbound.where('name').anyOf("B", "C", "D").keys(),
    outbound_above_z49: () => db.outbound.where('name').above("z49").toArray(),

    friendsOver18: () => db.friends.where('age').above(18).toArray(),

    multiEntry1: () => db.multiEntry.where('tags').startsWith('A').primaryKeys(),
    multiEntry2: () => db.multiEntry.where({tags: "fooTag"}).primaryKeys(),
    multiEntry3: () => db.multiEntry.where({tags: "x"}).toArray(),

    // Issue https://github.com/dexie/Dexie.js/issues/1946
    compoundOrderBy: () => db.issue1946.orderBy('[name+age]').toArray(),
    compoundOrderByWithAutoIncKey: () => db.issue1946.orderBy('[name+age+id]').toArray(),
  };
  const expectedInitialResults = {
    itemsToArray: [{id: 1}, {id: 2}, {id: 3}],
    itemsGet1And2: [{id: 1}, undefined],
    itemsBulkGet123: [{id: 1}, {id: 2}, {id: 3}],
    itemsStartsWithA: [],
    itemsStartsWithAPrimKeys: [],
    itemsStartsWithAOffset3: [],
    itemsStartsWithAKeys: [],
    itemsStartsWithACount: 0,

    outboundToArray: [
      {num: 1, name: "A"},
      {num: 2, name: "B"},
      {num: 3, name: "C"}
    ],
    outboundStartsWithA: [{num: 1, name: "A"}],
    outboundIdBtwnMinus1And2: [{num: 1, name: "A"}, {num: 2, name: "B"}],
    outboundAnyOf_BCD_keys: ["B", "C"],
    outbound_above_z49: [],

    friendsOver18: [],

    multiEntry1: [],
    multiEntry2: [],
    multiEntry3: [],

    // Issue https://github.com/dexie/Dexie.js/issues/1946
    compoundOrderBy: [],
    compoundOrderByWithAutoIncKey: []
  }
  let flyingNow = 0;
  //let signal = new Signal();
  let eventTarget = new EventTarget();
  let actualResults = objectify(new Map(Object.keys(queries).map(name => [name, undefined])));
  const observables = new Map(Object.keys(queries).map(name => [
    name,
    liveQuery(async () => {
      ++flyingNow;
      try {
        const res = await queries[name]();
        console.log(`Setting actual result of ${name} to ${JSON.stringify(res)}`);
        actualResults[name] = res;
        return res;
      } finally {
        if (--flyingNow === 0) eventTarget.dispatchEvent(new CustomEvent('zeroflyers'));
      }
    })
  ]));

  function zeroFlyers(abortSignal) {
    return new Promise((resolve, reject) => {
      eventTarget.addEventListener('zeroflyers', resolve, {once: true});
      abortSignal.addEventListener('abort', () => reject(new Error('flyers timeout')), { once: true});
    });
  }

  function timeout(ms) {
    const ac = new AbortController();
    setTimeout(()=>ac.abort(), ms);
    return ac.signal;
  }
  
  async function allValuesOk(actual, expected, allowedExtra, prevActual, abortSignal) {
    while (flyingNow > 0) await zeroFlyers(abortSignal);
    while (!isDeepEqual(actual, expected, allowedExtra, prevActual)) {
      await zeroFlyers(abortSignal);
    }
  }

  const subscriptions = Object.keys(queries).map(name => {
    let gotAnyData = false;
    ++flyingNow;
    const subscription = observables.get(name).subscribe({
      next: res => {
        if (!gotAnyData) {
          gotAnyData = true;
          if (--flyingNow === 0) eventTarget.dispatchEvent(new CustomEvent('zeroflyers'));
        }
      },
      error: error => {
        ok(false, ''+error)
      }
    });
    return subscription;
  });
  try {
    await zeroFlyers(timeout(200));
    deepEqual(actualResults, expectedInitialResults, "Initial results as expected");
    let prevActual = Dexie.deepClone(actualResults);
    for (const [mut, expects, allowedExtra] of mutsAndExpects()) {
      console.log(`RUNNING: ${mut.toString()}`);
      console.log(`---------------------------------`);
      actualResults = {};
      await mut();
      try {
        await allValuesOk(actualResults, expects, allowedExtra, prevActual, timeout(200));
      } catch {}
      const expected = Dexie.deepClone(expects);
      if (allowedExtra) Array.isArray(allowedExtra) ? allowedExtra.forEach(key => {
        if (actualResults[key]) expected[key] = prevActual[key];
      }) : Object.keys(allowedExtra).forEach(key => {
        if (actualResults[key]) expected[key] = allowedExtra[key];
      });
      deepEqual(actualResults, expected, `${mut.toString()}`);
      Object.assign(prevActual, actualResults);
    }
  } finally {
    subscriptions.forEach(s => s.unsubscribe());
  }
});

promisedTest("RxJS compability", async ()=>{
  let signal = new Signal();
  const o = from(liveQuery(
    ()=>db.items.toArray()
  )).pipe(
   map(items => items.map(item => item.id)) 
  );

  const s = o.subscribe(results => signal.resolve(results));
  const result = await signal.promise;
  deepEqual(result, [1, 2, 3], "We should have get a mapped result");
  signal = new Signal();
  db.items.add({id: 4});
  const res2 = await signal.promise;
  deepEqual(res2, [1, 2, 3, 4], "We should have get an updated mapped result");
  s.unsubscribe();
});

promisedTest("Isolation: Explicit rw transactions do not affect live queries before committed", async ()=> {
  let log = [];
  let signal = new Signal();
  let subscription = liveQuery(()=>db.items.toArray()).subscribe(result => {
    log.push({type: "emit", result});
    signal.resolve(result);
  });
  let result = await signal.promise;
  deepEqual(result, [{id:1},{id:2},{id:3}], "First callback should give initally populated content");
  deepEqual(log, [{type: "emit", result: [{id:1},{id:2},{id:3}]}], "First callback should give initally populated content");
  signal = new Signal();
  await db.transaction('rw', db.items, async ()=>{
    await db.items.add({id: 4});
    await db.items.update(4, {name: "A"});
    await db.items.toArray(); // Make some additional work in the transaction
    await db.items.count(); // Make some additional work in the transaction
    equal(log.length, 1, "No new emit should have been made yet");
  });
  await signal.promise;
  deepEqual(log, [
    {type: "emit", result: [{id:1},{id:2},{id:3}]},
    {type: "emit", result: [{id:1},{id:2},{id:3},{id:4, name: "A"}]}
  ], "The committed transaction should now have been made");
  //signal = new Signal();
  await db.transaction('rw', db.items, async (tx)=>{
    await db.items.add({id: 5});
    equal(log.length, 2, "No new emit should have been made");
    tx.abort(); // Aborting the transaction should make no new emit
  }).catch(()=>{});
  equal(log.length, 2, "No new emit should have been made");
  subscription.unsubscribe();
});

promisedTest("Issue 1821: liveQuery containing primaryKeys should not emit when content on one element is changed", async ()=>{
  let log = [];
  let signal = new Signal();
  let subscription = liveQuery(()=>db.items.orderBy('id').primaryKeys()).subscribe(result => {
    log.push({type: "emit", result});
    signal.resolve(result);
  });
  let result = await signal.promise;
  deepEqual(result, [1, 2, 3], "First callback should give initally populated content");
  deepEqual(log, [{type: "emit", result: [1, 2, 3]}], "First callback should give initally populated content");
  await db.items.update(1, {name: "A"}); // This should not emit anything since the primary key is not changed.
  equal(log.length, 1, "No new emit should have been made");
  await new Promise(resolve => setTimeout(resolve, 25));
  signal = new Signal();
  await db.items.add({id: 4}); // This should emit though.
  await signal.promise;
  equal(log.length, 2, "Only one extra emit should have been made");
  deepEqual(log, [
    {type: "emit", result: [1, 2, 3]},
    {type: "emit", result: [1, 2, 3, 4]}
  ], "No new emit should have been made");
  subscription.unsubscribe();
});

promisedTest("Issue 2067: useLiveQuery does not update when multiple items are deleted", async () => {
  let items = await db.items.reverse().toArray();
  deepEqual(items, [{id:3},{id:2},{id:1}], "Initial items are correct");
  const tester = liveQueryUnitTester(()=>db.items.reverse().toArray());
  db.items.where('id').above(0).delete();
  await tester.waitTilDeepEqual([], "Items are deleted");
  db.items.bulkAdd([{id: -10},{id: 0},{id: 10}]);
  await tester.waitTilDeepEqual([{id: 10},{id: 0},{id: -10}], "Reacts on bulkAdd");
  db.items.where('id').above(0).delete();
  await tester.waitTilDeepEqual([{id: 0},{id: -10}], "Should have deleted items where id > 0");
});

promisedTest("Issue 2058 - related but with bulkAdd and constraint error on duplicate primary keys.", async () => {
  const tester = liveQueryUnitTester(
    ()=>db.items.toArray(), { graceTime: 100 }
  );
  await tester.waitTilDeepEqual([{id:1},{id:2},{id:3}], "Initial items are correct");
  await db.items.bulkAdd([
    {id:3}, // This one won't be added (constraint violation)
    {id:88} // This one will be added
  ]).catch(error => {
    equal(error.failuresByPos[0].name, "ConstraintError", "Expected constraint error for the first operation");
  });
  await tester.waitTilDeepEqual([{id:1},{id:2},{id:3},{id:88}], "The livequery emitted correct result after bulk operation");
  // Now making sure we go through a different code path (where the number of items > 50 in cache-middleware.ts)
  const itemsToAdd = new Array(51)
  .fill({id: 1}, 0, 40) // Positions 0..40 is constraint violations agains existing data + themselves
  .fill({id:99}, 40, 49) // Positions 40 is new value but 41...49 is constraint violation of pos 40.
  .fill({id:100}, 49, 50) // Position 50 is ok.
  .fill({id:101}, 50) // Position 51 is ok.

  await db.items.bulkAdd(itemsToAdd).catch(error => {
    deepEqual(Object.keys(error.failuresByPos).map(Number),[
      0,1,2,3,4,5,6,7,8,9,
      10,11,12,13,14,15,16,17,18,19,
      20,21,22,23,24,25,26,27,28,29,
      30,31,32,33,34,35,36,37,38,39,
      41,42,43,44,45,46,47,48
    ]
    , "We get errors on the expected positions");
  });
  
  console.log("Before await promise", performance.now());
  await tester.waitTilDeepEqual([
    {id:1},
    {id:2},
    {id:3},
    {id:88},
    {id:99},
    {id:100},
    {id:101}
  ], "Correct state after trying to add these half baked entries");
  console.log("After await promise", performance.now());
});

promisedTest("Issue 2058: Cache error after bulkPut failures", async () => {
  const tester = liveQueryUnitTester(
    ()=>db.issue2058.toArray(),
    {graceTime: 10}
  );
  await db.issue2058.bulkAdd([
    {id:"1.1",a:1,b:1},
    {id:"1.2",a:1,b:2},
    {id:"2.1",a:2,b:1},
  ]);
  await tester.waitTilDeepEqual([
    {id:"1.1",a:1,b:1},
    {id:"1.2",a:1,b:2},
    {id:"2.1",a:2,b:1}
  ], "Initial items are correct");
  await db.issue2058.bulkPut([
    {id:"2.2",a:2,b:2},
    {id:"foo", a: 1, b: 1}
  ]).catch(error => {
    equal(error.failuresByPos[1].name, "ConstraintError", "Expected constraint error for the first operation");
  });
  await tester.waitTilDeepEqual([
    {id:"1.1",a:1,b:1},
    {id:"1.2",a:1,b:2},
    {id:"2.1",a:2,b:1},
    {id:"2.2",a:2,b:2}
  ], "The livequery emitted correct result after bulk operation");
});

promisedTest("Issue 2309: useLiveQuery stops updating when mutating returned object in-place and putting it", async () => {
  // We run the test for both 'cloned' (Dexie 4.4 cache mode) and 'disabled' (representing Dexie 4.3 behavior)
  for (const cacheMode of ['cloned', 'disabled']) {
    const dbCloned = new Dexie('TestLiveQueryIssue2309_' + cacheMode, {
      cache: cacheMode
    });
    dbCloned.version(1).stores({
      items: 'id, name'
    });
    await dbCloned.items.add({ id: 1, name: 'Initial' });

    let log = [];
    let signal = new Signal();
    let subscription = liveQuery(() => dbCloned.items.get(1)).subscribe(
      (result) => {
        log.push(result);
        signal.resolve(result);
      }
    );

    let val1 = await signal.promise;
    equal(val1.name, 'Initial', `[${cacheMode}] Initial value is correct`);

    // Mutate in place
    val1.name = 'Mutated';

    signal = new Signal();
    await dbCloned.items.put(val1);
    let val2 = await signal.promise;

    equal(val2.name, 'Mutated', `[${cacheMode}] Mutated value is received`);
    ok(
      val1 !== val2,
      `[${cacheMode}] Returned value must be a new reference (cloned)`
    );
    equal(log.length, 2, `[${cacheMode}] Should have emitted twice`);

    subscription.unsubscribe();
    await dbCloned.delete();
  }
});

promisedTest("Issue 2021: liveQuery must react on mutations of falsy but valid primary keys", async () => {
  // Number 0 and empty string are falsy in javascript but perfectly valid IndexedDB keys.
  for (const id of [0, ""]) {
    const idStr = JSON.stringify(id);
    await db.items.put({id, name: "before"});
    const log = [];
    let signal = new Signal();
    const subscription = liveQuery(
      () => db.items.where('id').equals(id).toArray()
    ).subscribe(result => {
      log.push(result);
      signal.resolve(result);
    });
    await signal.promise;
    deepEqual(log[0], [{id, name: "before"}], `Initial emit for primary key ${idStr}`);

    signal = new Signal();
    await db.items.update(id, {name: "after"});
    await Promise.race([signal.promise, new Promise(resolve => setTimeout(resolve, 300))]);
    equal(log.length, 2, `liveQuery re-emitted after updating the item with primary key ${idStr}`);
    deepEqual(log[log.length - 1], [{id, name: "after"}], `Latest emit holds the updated value for primary key ${idStr}`);

    subscription.unsubscribe();
  }
});

promisedTest("Issue 2352: an aborted run that rejects late should not reach observer.error", async () => {
  const db2352 = new Dexie('TestLiveQueryIssue2352');
  db2352.version(1).stores({ items: '++id' });
  await db2352.open();

  let hold = null;
  let failHeldRun;
  let gateReached = new Signal();
  let valueSignal = new Signal();
  const values = [];
  const errors = [];
  const subscription = liveQuery(async () => {
    const gate = hold;
    hold = null;
    const count = await db2352.items.count();
    if (gate) {
      gateReached.resolve();
      await gate;
    }
    return count;
  }).subscribe({
    next: (value) => {
      values.push(value);
      valueSignal.resolve(value);
    },
    error: (err) => errors.push(err),
  });

  equal(await valueSignal.promise, 0, 'Initial run emitted 0');
  valueSignal = new Signal();
  hold = new Promise((_, reject) => { failHeldRun = reject; });
  hold.catch(() => {});
  await db2352.items.add({});
  await gateReached.promise;
  await db2352.items.add({});
  equal(await valueSignal.promise, 2, 'Replacing run emitted 2');
  failHeldRun(new Error('late failure of aborted run'));
  await new Promise((resolve) => setTimeout(resolve, 50));

  deepEqual(values, [0, 2], 'Got values from the initial and the replacing run');
  equal(errors.length, 0, 'The aborted run did not report an error');

  subscription.unsubscribe();
  await db2352.delete();
});

function waitForLiveValue(getLatest, expected, description, timeout = 1000) {
  return new Promise((resolve) => {
    const started = Date.now();
    (function check() {
      if (isDeepEqual(getLatest(), expected) || Date.now() - started > timeout) {
        deepEqual(getLatest(), expected, description);
        resolve(isDeepEqual(getLatest(), expected));
      } else {
        setTimeout(check, 5);
      }
    })();
  });
}

promisedTest("liveQuery with limit must refill the window when a row moves out of it", async () => {
  for (const cacheMode of ['immutable', 'cloned']) {
    const db2 = new Dexie('TestLiveQueryLimitWindow_' + cacheMode, { cache: cacheMode });
    db2.version(1).stores({ friends: 'id, age, [name+age]' });
    await db2.friends.bulkAdd([
      { id: 1, name: 'x', age: 1 },
      { id: 2, name: 'x', age: 2 },
      { id: 3, name: 'x', age: 3 },
    ]);
    const queries = {
      orderByLimit: () => db2.friends.orderBy('age').limit(2).toArray(),
      reverseLimit: () => db2.friends.orderBy('age').reverse().limit(2).toArray(),
      compoundLimit: () =>
        db2.friends
          .where('[name+age]')
          .between(['x', Dexie.minKey], ['x', Dexie.maxKey])
          .limit(2)
          .toArray(),
    };
    const latest = {};
    const subscriptions = Object.keys(queries).map((name) =>
      liveQuery(queries[name]).subscribe((value) => (latest[name] = value))
    );
    const ids = (rows) => rows && rows.map((row) => row.id);
    await waitForLiveValue(() => ids(latest.orderByLimit), [1, 2], `[${cacheMode}] initial orderBy().limit()`);
    await waitForLiveValue(() => ids(latest.reverseLimit), [3, 2], `[${cacheMode}] initial reverse().limit()`);
    await waitForLiveValue(() => ids(latest.compoundLimit), [1, 2], `[${cacheMode}] initial compound limit`);

    // Row 1 moves behind row 3, which is not part of the limited results.
    await db2.friends.put({ id: 1, name: 'x', age: 10 });
    await waitForLiveValue(() => ids(latest.orderByLimit), [2, 3], `[${cacheMode}] orderBy().limit() is refilled with row 3`);
    await waitForLiveValue(() => ids(latest.compoundLimit), [2, 3], `[${cacheMode}] compound limit is refilled with row 3`);
    await waitForLiveValue(() => ids(latest.reverseLimit), [1, 3], `[${cacheMode}] reverse().limit() puts row 1 first`);

    // Row 1 moves in front of row 2, which is the last row of the reverse window.
    await db2.friends.put({ id: 1, name: 'x', age: 0 });
    await waitForLiveValue(() => ids(latest.reverseLimit), [3, 2], `[${cacheMode}] reverse().limit() is refilled with row 2`);
    await waitForLiveValue(() => ids(latest.orderByLimit), [1, 2], `[${cacheMode}] orderBy().limit() puts row 1 first`);

    subscriptions.forEach((s) => s.unsubscribe());
    await db2.delete();
  }
});

promisedTest("liveQuery results equal fresh query results after random writes", async () => {
  let seed = 42;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (const cacheMode of ['immutable', 'cloned']) {
    const db2 = new Dexie('TestLiveQueryRandomWrites_' + cacheMode, { cache: cacheMode });
    db2.version(1).stores({ friends: 'id, age, name, [name+age]' });
    const names = ['a', 'b', 'c'];
    const randomFriend = (id) => ({
      id,
      name: names[Math.floor(random() * names.length)],
      age: Math.floor(random() * 50),
      note: 'n' + Math.floor(random() * 1000),
    });
    const initial = [];
    for (let id = 0; id < 40; id++) initial.push(randomFriend(id));
    await db2.friends.bulkAdd(initial);

    const queries = {
      orderByLimit: () => db2.friends.orderBy('age').limit(5).toArray(),
      reverseLimit: () => db2.friends.orderBy('age').reverse().limit(5).toArray(),
      rangeLimit: () => db2.friends.where('age').between(10, 30).limit(7).toArray(),
      range: () => db2.friends.where('age').between(10, 30).toArray(),
      all: () => db2.friends.orderBy('age').toArray(),
      equalsLimit: () => db2.friends.where('name').equals('b').limit(3).toArray(),
      compoundLimit: () =>
        db2.friends
          .where('[name+age]')
          .between(['a', Dexie.minKey], ['a', Dexie.maxKey])
          .limit(4)
          .toArray(),
      primaryKeyLimit: () => db2.friends.where('id').above(10).limit(5).toArray(),
    };
    const latest = {};
    const subscriptions = Object.keys(queries).map((name) =>
      liveQuery(queries[name]).subscribe((value) => (latest[name] = value))
    );

    let nextId = 40;
    let failed = false;
    for (let i = 0; i < 60 && !failed; i++) {
      const r = random();
      const existingId = Math.floor(random() * nextId);
      if (r < 0.2) {
        await db2.friends.add(randomFriend(nextId++));
      } else if (r < 0.45) {
        // change the sort field only
        await db2.friends.where('id').equals(existingId).modify((f) => {
          f.age = Math.floor(random() * 50);
        });
      } else if (r < 0.6) {
        // change a field that is not indexed
        await db2.friends.update(existingId, { note: 'u' + i });
      } else if (r < 0.75) {
        // change several fields
        await db2.friends.put(randomFriend(existingId));
      } else if (r < 0.85) {
        await db2.friends.bulkPut([randomFriend(existingId), randomFriend(nextId++)]);
      } else {
        await db2.friends.delete(existingId);
      }
      for (const name of Object.keys(queries)) {
        const expected = await db2.transaction('r', db2.friends, queries[name]);
        if (!(await waitForLiveValue(() => latest[name], expected, `[${cacheMode}] ${name} after write #${i}`))) {
          failed = true; // stop at the first wrong result instead of piling up timeouts
          break;
        }
      }
    }
    subscriptions.forEach((s) => s.unsubscribe());
    await db2.delete();
  }
});

promisedTest("liveQuery results equal fresh query results for compound, nested and Date keys and multiEntry indexes", async () => {
  let seed = 7;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const randomInt = (max) => Math.floor(random() * max);
  const tags = ['x', 'y', 'z'];
  const tables = {
    compound: {
      schema: '[team+num], age, *tags',
      row: (n) => ({ team: ['a', 'b'][n % 2], num: n, age: randomInt(50), tags: [tags[randomInt(3)]] }),
      key: (row) => [row.team, row.num],
    },
    nested: {
      schema: 'meta.id, age, *tags',
      row: (n) => ({ meta: { id: 'k' + n }, age: randomInt(50), tags: [tags[randomInt(3)]] }),
      key: (row) => row.meta.id,
    },
    dates: {
      schema: 'when, age, *tags',
      row: (n) => ({ when: new Date(1700000000000 + n * 1000), age: randomInt(50), tags: [tags[randomInt(3)], tags[randomInt(3)]] }),
      key: (row) => row.when,
    },
  };
  for (const cacheMode of ['immutable', 'cloned']) {
    for (const tableName of Object.keys(tables)) {
      const { schema, row, key } = tables[tableName];
      const db2 = new Dexie(`TestLiveQueryKeyTypes_${tableName}_${cacheMode}`, { cache: cacheMode });
      db2.version(1).stores({ items: schema });
      const initial = [];
      for (let n = 0; n < 30; n++) initial.push(row(n));
      await db2.items.bulkAdd(initial);
      const queries = {
        orderByLimit: () => db2.items.orderBy('age').limit(4).toArray(),
        reverseLimit: () => db2.items.orderBy('age').reverse().limit(4).toArray(),
        rangeLimit: () => db2.items.where('age').between(10, 30).limit(3).toArray(),
        all: () => db2.items.orderBy('age').toArray(),
        multiEntry: () => db2.items.where('tags').equals('x').toArray(),
        multiEntryLimit: () => db2.items.where('tags').equals('y').limit(3).toArray(),
      };
      const latest = {};
      const subscriptions = Object.keys(queries).map((name) =>
        liveQuery(queries[name]).subscribe((value) => (latest[name] = value))
      );
      let nextNum = 30;
      let failed = false;
      for (let i = 0; i < 40 && !failed; i++) {
        const r = random();
        const existing = await db2.items.toArray();
        const target = existing[randomInt(existing.length)];
        if (r < 0.25 || !target) {
          await db2.items.add(row(nextNum++));
        } else if (r < 0.65) {
          // same key, new sort field and tags
          await db2.items.put({ ...row(0), ...pickKey(target), age: randomInt(50), tags: [tags[randomInt(3)]] });
        } else if (r < 0.9) {
          await db2.items.delete(key(target));
        } else {
          await db2.items.clear();
          await db2.items.bulkAdd([row(nextNum++), row(nextNum++), row(nextNum++)]);
        }
        for (const name of Object.keys(queries)) {
          const expected = await db2.transaction('r', db2.items, queries[name]);
          if (!(await waitForLiveValue(() => latest[name], expected, `[${cacheMode}] ${tableName} ${name} after write #${i}`))) {
            failed = true;
            break;
          }
        }
      }
      subscriptions.forEach((s) => s.unsubscribe());
      await db2.delete();

      function pickKey(target) {
        if (tableName === 'compound') return { team: target.team, num: target.num };
        if (tableName === 'nested') return { meta: target.meta };
        return { when: target.when };
      }
    }
  }
});

function countReadsMiddleware(counter, level) {
  return {
    stack: 'dbcore',
    name: 'countReads',
    level, // A level below the cache middleware (0) only counts reads that reach IndexedDB.
    create: (down) => ({
      ...down,
      table: (tableName) => {
        const table = down.table(tableName);
        return {
          ...table,
          // Count reads of queries, not the reads of writes like update().
          openCursor: (req) => {
            if (req.trans.mode === 'readonly') counter.reads++;
            return table.openCursor(req);
          },
          query: (req) => {
            if (req.trans.mode === 'readonly') counter.reads++;
            return table.query(req);
          },
        };
      },
    }),
  };
}

promisedTest("liveQuery applies writes to filter() results without reading them again", async () => {
  const counter = { reads: 0 };
  const db2 = new Dexie('TestLiveQueryReducedReads');
  db2.use(countReadsMiddleware(counter));
  db2.version(1).stores({ friends: 'id, age' });
  await db2.friends.bulkAdd([
    { id: 1, age: 20, active: true },
    { id: 2, age: 30, active: false },
    { id: 3, age: 40, active: true },
    { id: 5, age: 50, active: true },
    { id: 6, age: 60, active: true },
  ]);
  let latest;
  // Limit 2 keeps 1 row after the window (getRecommendedResultWindowBufferSize(2) of EventReduce).
  const subscription = liveQuery(() =>
    db2.friends.where('age').above(18).filter((f) => f.active).limit(2).toArray()
  ).subscribe((value) => (latest = value));
  const ids = () => latest && latest.map((f) => f.id);
  await waitForLiveValue(ids, [1, 3], 'initial result');

  let reads = counter.reads;
  await db2.friends.put({ id: 4, age: 19, active: true }); // sorts in front of the window
  await waitForLiveValue(ids, [4, 1], 'row 4 is inserted first, row 3 drops out');
  equal(counter.reads - reads, 0, 'Inserting in front of the window did not read from the database');

  reads = counter.reads;
  await db2.friends.update(1, { name: 'One' }); // changes a field that is neither sorted nor filtered
  await waitForLiveValue(() => latest && latest.map((f) => f.name), [undefined, 'One'], 'row 1 is replaced');
  equal(counter.reads - reads, 0, 'Updating a row of the result did not read from the database');

  reads = counter.reads;
  await db2.friends.update(1, { active: false }); // leaves the full window, which is refilled
  await waitForLiveValue(ids, [4, 3], 'row 1 left, row 3 came from the buffer');
  equal(counter.reads - reads, 0, 'Refilling the limit window from the buffer did not read from the database');

  reads = counter.reads;
  await db2.friends.update(4, { active: false }); // the buffer is used up
  await waitForLiveValue(ids, [3, 5], 'row 4 left, row 5 is read');
  equal(counter.reads - reads, 1, 'Refilling the limit window read from the database once');

  subscription.unsubscribe();
  await db2.delete();
});

promisedTest("liveQuery results equal fresh query results for filter(), offset() and sortBy()", async () => {
  let seed = 11;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const randomInt = (max) => Math.floor(random() * max);
  const randomFriend = (id) => ({
    id,
    age: randomInt(60),
    score: randomInt(1000) / 10,
    team: ['a', 'b', 'c'][randomInt(3)],
    active: random() < 0.5,
  });
  for (const cacheMode of ['immutable', 'cloned']) {
    const name = 'TestLiveQueryReducedQueries_' + cacheMode;
    const db2 = new Dexie(name, { cache: cacheMode });
    db2.version(1).stores({ friends: 'id, age, team', virtual: 'id, [team+score]' });
    const otherInstance = new Dexie(name, { cache: cacheMode });
    otherInstance.version(1).stores({ friends: 'id, age, team', virtual: 'id, [team+score]' });
    const initial = [];
    for (let id = 0; id < 40; id++) initial.push(randomFriend(id));
    await db2.friends.bulkAdd(initial);
    await db2.virtual.bulkAdd(initial);

    const queries = {
      filterLimit: () => db2.friends.where('age').between(20, 50).filter((f) => f.active).limit(5).toArray(),
      filterAll: () => db2.friends.where('age').above(10).and((f) => f.team !== 'b').toArray(),
      twoFilters: () => db2.friends.where('age').below(40).filter((f) => f.active).filter((f) => f.score > 30).reverse().toArray(),
      offsetLimit: () => db2.friends.where('age').above(5).offset(3).limit(4).toArray(),
      offsetOnly: () => db2.friends.orderBy('age').offset(30).toArray(),
      sortBy: () => db2.friends.where('age').above(18).sortBy('score'),
      reverseSortBy: () => db2.friends.where('team').equals('b').filter((f) => f.active).reverse().sortBy('score'),
      first: () => db2.friends.where('age').above(25).filter((f) => f.active).first(),
      tableFilter: () => db2.friends.filter((f) => f.active).toArray(),
      tableSortBy: () => db2.friends.toCollection().sortBy('age'),
      virtualIndex: () => db2.virtual.where('team').equals('a').filter((f) => f.age > 10).toArray(),
      // Not reduced, must stay correct:
      limitBeforeOffset: () => db2.friends.where('age').above(5).limit(6).offset(2).toArray(),
      until: () => db2.friends.orderBy('age').until((f) => f.age > 30).toArray(),
    };
    const latest = {};
    const subscriptions = Object.keys(queries).map((queryName) =>
      liveQuery(queries[queryName]).subscribe((value) => (latest[queryName] = value))
    );
    let nextId = 40;
    let failed = false;
    for (let i = 0; i < 60 && !failed; i++) {
      const r = random();
      const table = random() < 0.8 ? db2.friends : db2.virtual;
      const writer = random() < 0.2 ? otherInstance : db2;
      const writerTable = writer.table(table.name);
      const existingId = randomInt(nextId);
      const kind = (writer === db2 ? '' : 'other instance ') + table.name + ' ' +
        (r < 0.2 ? 'add' : r < 0.4 ? 'modify sort fields' : r < 0.55 ? 'update filtered fields' : r < 0.7 ? 'put' : r < 0.8 ? 'bulkPut' : r < 0.97 ? 'delete' : 'clear');
      if (r < 0.2) {
        await writerTable.add(randomFriend(nextId++));
      } else if (r < 0.4) {
        // change the sort fields only
        await writerTable.where('id').equals(existingId).modify((f) => {
          f.age = randomInt(60);
          f.score = randomInt(1000) / 10;
        });
      } else if (r < 0.55) {
        // change the filtered fields only
        await writerTable.update(existingId, { active: random() < 0.5, team: ['a', 'b', 'c'][randomInt(3)] });
      } else if (r < 0.7) {
        await writerTable.put(randomFriend(existingId));
      } else if (r < 0.8) {
        await writerTable.bulkPut([randomFriend(existingId), randomFriend(nextId++)]);
      } else if (r < 0.97) {
        await writerTable.delete(existingId);
      } else {
        await writerTable.clear();
        await writerTable.bulkAdd([randomFriend(nextId++), randomFriend(nextId++), randomFriend(nextId++)]);
      }
      for (const queryName of Object.keys(queries)) {
        const expected = await db2.transaction('r', db2.friends, db2.virtual, queries[queryName]);
        if (!(await waitForLiveValue(() => latest[queryName], expected, `[${cacheMode}] ${queryName} after write #${i} (${kind})`))) {
          failed = true;
          break;
        }
      }
    }
    subscriptions.forEach((s) => s.unsubscribe());
    otherInstance.close();
    await db2.delete();
  }
});

promisedTest("liveQuery with an open-ended range is served from the cache", async () => {
  const counter = { reads: 0 };
  const db2 = new Dexie('TestLiveQueryOpenEndedRange');
  db2.use(countReadsMiddleware(counter, -10));
  db2.version(1).stores({ friends: 'id, age' });
  const rows = [];
  for (let id = 0; id < 30; id++) rows.push({ id, age: id, name: 'n' + id });
  await db2.friends.bulkAdd(rows);
  let latest;
  // above() and below() create ranges with an undefined upper / lower bound.
  const subscription = liveQuery(() => db2.friends.where('age').above(18).limit(5).toArray()).subscribe(
    (value) => (latest = value)
  );
  await waitForLiveValue(() => latest && latest.map((f) => f.id), [19, 20, 21, 22, 23], 'initial result');
  const reads = counter.reads;
  await db2.friends.put({ id: 20, age: 20, name: 'renamed' });
  await waitForLiveValue(() => latest && latest[1].name, 'renamed', 'the renamed row is emitted');
  equal(counter.reads - reads, 0, 'The live query did not read from IndexedDB again');
  subscription.unsubscribe();
  await db2.delete();
});

promisedTest("liveQuery with limit refills the window from the rows after it", async () => {
  const counter = { reads: 0 };
  const db2 = new Dexie('TestLiveQueryWindowBuffer');
  db2.use(countReadsMiddleware(counter, -10));
  db2.version(1).stores({ friends: 'id, age' });
  const rows = [];
  for (let id = 0; id < 30; id++) rows.push({ id, age: id, name: 'n' + id });
  await db2.friends.bulkAdd(rows);
  let latest;
  // Limit 5 keeps 2 rows after the window (getRecommendedResultWindowBufferSize(5) of EventReduce).
  const subscription = liveQuery(() => db2.friends.where('age').above(18).limit(5).toArray()).subscribe(
    (value) => (latest = value)
  );
  await waitForLiveValue(() => latest && latest.map((f) => f.id), [19, 20, 21, 22, 23], 'initial result');
  const reads = counter.reads;
  await db2.friends.put({ id: 19, age: 100, name: 'n19' });
  await waitForLiveValue(() => latest.map((f) => f.id), [20, 21, 22, 23, 24], 'row 24 came from the buffer');
  await db2.friends.delete(20);
  await waitForLiveValue(() => latest.map((f) => f.id), [21, 22, 23, 24, 25], 'row 25 came from the buffer');
  equal(counter.reads - reads, 0, 'The live query did not read from IndexedDB again');
  // An insert into the window moves its last row into the buffer.
  await db2.friends.put({ id: 30, age: 24.5, name: 'n30' });
  await waitForLiveValue(() => latest.map((f) => f.id), [21, 22, 23, 24, 30], 'row 30 was inserted');
  await db2.friends.put({ id: 21, age: 200, name: 'n21' });
  await waitForLiveValue(() => latest.map((f) => f.id), [22, 23, 24, 30, 25], 'row 25 came from the buffer');
  equal(counter.reads - reads, 0, 'The live query still did not read from IndexedDB again');
  // The buffer is used up now.
  await db2.friends.put({ id: 22, age: 300, name: 'n22' });
  await waitForLiveValue(() => latest.map((f) => f.id), [23, 24, 30, 25, 26], 'row 26 was read');
  equal(counter.reads - reads, 1, 'The live query read from IndexedDB once');
  subscription.unsubscribe();
  await db2.delete();
});
