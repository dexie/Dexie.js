import Dexie, {liveQuery} from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, supports, promisedTest} from './dexie-unittest-utils';
import { deepEqual } from './tests-table';

const db = new Dexie("TestLiveQuery");
db.version(2).stores({
    items: "id",
    foo: "++id"
});

db.on('populate', ()=> {
  db.items.bulkAdd([
      {id: 1},
      {id: 2},
      {id: 3}
  ]);
});

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

promisedTest("txcommitted event", async ()=>{
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
  });
  while (!os.TestLiveQuery || !os.TestLiveQuery.items || os.TestLiveQuery.items.keys.indexOf(4) === -1) {
    // When Dexie.Observable is active, we might see intermediate transactions taking place
    // before our transaction.
    signal = new Signal();
    await signal.promise;
  }
  ok(!!os.TestLiveQuery, "Got changes in our table name TestLiveQuery");
  const itemsChanges = os.TestLiveQuery.items;
  ok(itemsChanges, "Got changes for items table");
  deepEqual(itemsChanges.keys, [4, 7], "Item changes on concattenated keys");
  const fooChanges = os.TestLiveQuery.foo;
  ok(fooChanges, "Got changes for foo table");
  Dexie.on('txcommitted').unsubscribe(txCommitted);
});

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
