import Dexie, {liveQuery, rangesOverlap, RangeSet} from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, supports, promisedTest} from './dexie-unittest-utils';
import sortedJSON from "sorted-json";
import {from} from "rxjs";
import {map} from "rxjs/operators";

const db = new Dexie("TestLiveQuery");
db.version(2).stores({
    items: "id, name",
    foo: "++id",
    outbound: "++,name"
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

function rangeSet(ranges) {
  const set = new RangeSet();
  for (const range of ranges) {
    set.add({from: range[0], to: range[range.length-1]});
  }
  return set;
}

function hasKey(set, key) {
  return rangesOverlap(set, new RangeSet(key))
}

function hasAllKeys(set, keys) {
  keys.every(key => hasKey(set, key));
}

function objectify(map) {
  const rv = {};
  map.forEach((value, name) => {
    rv[name] = value;
  });
  return rv;
}

export function deepEqual(actual, expected, description) {
  actual = sortedJSON.sortify(actual, {sortArray: false});
  expected = sortedJSON.sortify(expected, {sortArray: false});
  equal(JSON.stringify(actual, null, 2), JSON.stringify(expected, null, 2), description);
}

class Signal {
  promise = new Promise(resolve => this.resolve = resolve);
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
  let signal = new Signal();
  let subscription = liveQuery(()=>db.items.toArray()).subscribe(result => {
    signal.resolve(result);
  });
  let result = await signal.promise;
  deepEqual(result, [{id:1},{id:2},{id:3}], "First callback should give initally populated content");
  signal = new Signal();
  db.items.add({id:-1});
  result = await signal.promise;
  deepEqual(result, [{id:-1},{id:1},{id:2},{id:3}], "2nd callback should give updated content");

  signal = new Signal();
  db.items.delete(2);
  result = await signal.promise;
  deepEqual(result, [{id:-1},{id:1},{id:3}], "3rd callback should wake up when deletion was made");
  subscription.unsubscribe();
});

promisedTest("subscribe to keys", async ()=>{
  let signal1 = new Signal(), signal2 = new Signal();
  let count1 = 0, count2 = 0;
  const debugTxCommitted = set => console.debug("txcommitted", set);
  Dexie.on('txcommitted', debugTxCommitted);
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
  ok(subscription.closed, "Subscription should have been closed after error has occurred");
  subscription.unsubscribe();
});

/* Use cases to cover:

  Queries
    get
    getMany
    query
    queryKeys
    openCursor
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
const mutsAndExpects = [
  // add
  [
    ()=>db.items.add({id: -1, name: "A"}),
    {
      get: [{id: 1}, {id: -1, name: "A"}],
      query: [{id: -1, name: "A"}],
      queryKeys: [-1],
      openCursor: [],
      openKeyCursor: ["A"],
      count: 1
    }
  ],
  // addAuto
  [
    ()=>db.outbound.add({name: "Abba"}).then(id=>abbaKey = id),
    {
      queryOutbound: [{name: "A", num: 1}, {name: "Abba"}]
    }
  ], [
    ()=>db.outbound.bulkAdd([{name: "Benny"}, {name: "C"}], [-1, 0]),
    {
      queryOutboundByPKey: [{name: "Benny"}, {name: "C"}, {name: "A", num: 1}, {name: "B", num: 2}],
      openCursorOutbound: ["B", "C", "C"]
    }
  ],
  // update
  [
    ()=>db.outbound.update(abbaKey, {name: "Zlatan"}),
    {
      queryOutbound: [{name: "A", num: 1}]
    }
  ],
  [
    // Testing that keys-only queries don't get bothered
    ()=>db.items.update(-1, {foo: "bar"}),
    {
      get: [{id: 1}, {id: -1, name: "A", foo: "bar"}],
      query: [{id: -1, name: "A", foo: "bar"}],
      //queryKeys: [-1], should not have to be updated!
      //openKeyCursor: ["A"] should not have to be updated!
    }
  ],
  [
    // Update an index property (name) should trigger
    // listeners to that index:
    ()=>db.items.update(-1, {foo: undefined, name: "B"}),
    {
      get: [{id: 1}, {id: -1, name: "B"}],
      query: [],
      queryKeys: [],
      openCursor: [],
      openKeyCursor: [],
      count: 0
    }
  ],
  [
    // Restoring and re-checking.
    ()=>db.items.update(-1, {name: "A"}),
    {
      get: [{id: 1}, {id: -1, name: "A"}],
      query: [{id: -1, name: "A"}],
      queryKeys: [-1],
      openCursor: [],
      openKeyCursor: ["A"],
      count: 1
    }
  ],
  // add again
  [
    ()=>db.items.bulkAdd([{id: 4, name: "Abbot"},{id: 5, name: "Assot"},{id: 6, name: "Ambros"}]).then(lastId => {}),
    {
      query: [{id: -1, name: "A"}, {id: 4, name: "Abbot"}, {id: 6, name: "Ambros"}, {id: 5, name: "Assot"}],
      queryKeys: [-1, 4, 6, 5],
      openCursor: [{id: 5, name: "Assot"}], // offset 3
      openKeyCursor: ["A", "Abbot", "Ambros", "Assot"],
      count: 4
    }
  ],
  // delete:
  [
    ()=>db.transaction('rw', db.items, db.outbound, ()=>{
      db.items.delete(-1);
    }),
    {
      get: [{id: 1}, null],
      query: [{id: 4, name: "Abbot"}, {id: 6, name: "Ambros"}, {id: 5, name: "Assot"}],
      queryKeys: [4, 6, 5],
      openKeyCursor: ["Abbot", "Ambros", "Assot"],
      count: 3
    },
    // Allowed extras:
    // If hooks is listened to we'll get an even more correct update of the openCursor query
    // since oldVal will be available and offset-queries will be correcly triggered for deleted index keys before the offset.
    {
      openCursor: [] 
    }
  ],
  // Special case for more fine grained keys observation of put (not knowing oldObjs
  [
    ()=>db.items.put({id: 5, name: "Azlan"}),
    {
      query: [{id: 4, name: "Abbot"}, {id: 6, name: "Ambros"}, {id: 5, name: "Azlan"}],
      openKeyCursor: ["Abbot", "Ambros", "Azlan"],
    }, {
      // Things that optionally can be matched in result (if no hooks specified):
      queryKeys: [4, 6, 5], 
      count: 3,
      openCursor: []
    }
  ],
  [
    ()=>db.items.put({id: 5}),
    {
      query: [{id: 4, name: "Abbot"}, {id: 6, name: "Ambros"}],
      queryKeys: [4, 6],
      openKeyCursor: ["Abbot", "Ambros"],
      count: 2
    }
  ],
  [
    ()=>db.items.delete(5),
    {
    },
    {
      count: 2
    }
  ]
  // deleteRange: TODO this
]

promisedTest("Full use case matrix", async ()=>{
  const queries = {
    get: () => Promise.all(db.items.get(1), db.items.get(-1)),
    getMany: () => db.items.bulkGet([1,2,3]),
    query: () => db.items.where('name').startsWith("A").toArray(),
    queryKeys: () => db.items.where('name').startsWith("A").primaryKeys(),
    openCursor: () => db.items.where('name').startsWith("A").offset(3).toArray(),
    openKeyCursor: () => db.items.where('name').startsWith("A").keys(),
    count: () => db.items.where('name').startsWith("A").count(),
    queryOutbound: () => db.outbound.where('name').startsWith("A").toArray(),
    queryOutboundByPKey: () => db.outbound.where(':id').between(-1, 2, true, true).toArray(),
    openCursorOutbound: () => db.outbound.where('name').anyOf("B", "C", "D").keys(),
  };
  const expectedInitialResults = {
    get: [{id: 1}, undefined],
    getMany: [{id: 1}, {id: 2}, {id: 3}],
    query: [],
    queryKeys: [],
    openCursor: [],
    openKeyCursor: [],
    count: 0,
    queryOutbound: [{num: 1, name: "A"}],
    queryOutboundByPKey: [{num: 1, name: "A"}, {num: 2, name: "B"}],
    openCursorOutbound: ["B", "C"]
  }
  let flyingNow = 0;
  let signal = new Signal();
  const actualResults = objectify(new Map(Object.keys(queries).map(name => [name, undefined])));
  const observables = new Map(Object.keys(queries).map(name => [
    name,
    liveQuery(async () => {
      ++flyingNow;
      try {
        const res = await queries[name]();
        actualResults[name] = res;
        return res;
      } finally {
        if (--flyingNow === 0) signal.resolve();
      }
    })
  ]));

  const subscriptions = Object.keys(queries).map(name => observables.get(name).subscribe({
    next: res => {},
    error: error => ok(false, ''+error)
  }));
  try {
    await signal.promise;
    deepEqual(actualResults, expectedInitialResults, "Initial results as expected");
    let prevActual = Dexie.deepClone(actualResults);
    for (const [mut, expects, allowedExtra] of mutsAndExpects) {
      actualResults = {};
      signal = new Signal();
      mut();
      await signal.promise;
      const expected = Dexie.deepClone(expects);
      if (allowedExtra) Array.isArray(allowedExtra) ? allowedExtra.forEach(key => {
        if (actualResults[key]) expected[key] = prevActual[key];
      }) : Object.keys(allowedExtra).forEach(key => {
        if (actualResults[key]) expected[key] = allowedExtra[key];
      });
      deepEqual(actualResults, expected, `${mut.toString()} ==> ${JSON.stringify(expects, null, 2)}`);
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
