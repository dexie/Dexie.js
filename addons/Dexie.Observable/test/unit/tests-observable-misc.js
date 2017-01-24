import {module, asyncTest, equal, strictEqual, deepEqual, ok, start} from 'QUnit';
import Dexie from 'dexie';
import 'dexie-observable';

module("tests-observable-misc", {
  setup: function () {
    stop();
    Dexie.delete("ObservableTest").then(function () {
      start();
    }).catch(function (e) {
      ok(false, "Could not delete database");
    });
  },
  teardown: function () {
    stop();
    Dexie.delete("ObservableTest").then(start);
  }
});

function createDB() {
  var db = new Dexie("ObservableTest");
  db.version(1).stores({
    friends: "++id,name,shoeSize",
    CapitalIdTest: "$$Id,name"
    //pets: "++id,name,kind",
    //$emailWords: "",
  });
  return db;
}

// Basically check if Dexie.Observable adds a 'changes' event
// Test works because of the second parameter to asyncTest which expects 4 assertions
asyncTest("changes in on DB instance should trigger a change event in an other instance", 4, function () {
  var db1 = createDB();
  var db2 = createDB();

  db2.on('changes', function (changes, partitial) {
    changes.forEach(function (change) {
      switch (change.type) {
        case 1:
          ok(true, "obj created: " + JSON.stringify(change.obj));
          break;
        case 2:
          ok(true, "obj updated: " + JSON.stringify(change.mods));
          equal(JSON.stringify(change.mods), JSON.stringify({name: "David"}), "Only modifying the name property");
          break;
        case 3:
          ok(true, "obj deleted: " + JSON.stringify(change.oldObj));
          db1.close();
          db2.close();
          start();
          break;
      }
    });
  });

  db1.open();
  db2.open();

  db1.friends.put({name: "Dave", shoeSize: 43}).then(function (id) {
    // Update object:
    return db1.friends.put({id: id, name: "David", shoeSize: 43});
  }).then(function (id) {
    // Delete object:
    return db1.friends.delete(id);
  }).catch(function (e) {
    ok(false, "Error: " + e.stack || e);
    start();
  });
});

// Test UUID primary key
asyncTest("Capital$$Id-test", function () {
  var db = createDB();
  db.open();
  db.CapitalIdTest.put({name: "Hilda"}).then(function () {
    return db.CapitalIdTest.toCollection().first();
  }).then(function (firstItem) {
    ok(firstItem.name == "Hilda", "Got first item");
    ok(firstItem.Id, "First item has a primary key set: " + firstItem.Id);
    // Note that this regex is not spec compliant but should be good enough for this test
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    ok(regex.test(firstItem.Id), 'We got a UUID');
  }).catch(function (e) {
    ok(false, "Error: " + e);
  }).finally(function () {
    db.close();
    start();
  });
});

//
// Test intercomm in same window
//
asyncTest('should receive a message from the first sync node', 4, () => {
  const db1 = createDB();
  const db2 = createDB();
  let senderID;
  let receiverID;
  db2.on('message', (msg) => {
    strictEqual(msg.message, 'foobar', 'We got the correct message');
    strictEqual(msg.sender, senderID, 'We got the right sender ID');
    strictEqual(msg.type, 'request', 'We got the correct type');
    strictEqual(msg.destinationNode, receiverID, 'We got the correct destination node');
    start();
  });

  db1.on('message', () => {
    ok(false, 'We should not receive a message');
  });

  db1._syncNodes.toArray()
      .then((arr) => {
        senderID = arr[0].id;
        return db2._syncNodes.toArray();
      })
      .then((arr) => {
        receiverID = arr.filter((node) => node.id !== senderID)[0].id;
        db1.observable.sendMessage('request', 'foobar', receiverID, {});
      })
      .catch((e) => {
        ok(false, 'Error: ' + e);
      });
});

asyncTest('master node should receive the message if the destination is not present and we want a reply', 5, () => {
  const db1 = createDB();
  let senderID;
  db1.on('message', (msg) => {
    deepEqual(msg.message, {foo: 'foobar'}, 'We got the correct message');
    strictEqual(msg.sender, senderID, 'We got the right sender ID');
    strictEqual(msg.type, 'request', 'We got the correct type');
    strictEqual(msg.destinationNode, senderID, 'We got the correct destination node');
    start();
  });

  db1._syncNodes.toArray()
      .then((arr) => {
        senderID = arr[0].id;
        strictEqual(arr[0].isMaster, 1, 'We are master');
        db1.observable.sendMessage('request', {foo: 'foobar'}, 10, {wantReply: true});
      })
      .catch((e) => {
        ok(false, 'Error: ' + e);
      });
});

asyncTest('sender should react on successful reply', 1, () => {
  const db1 = createDB();
  const db2 = createDB();
  let senderID;
  let receiverID;
  db2.on('message', (msg) => {
    msg.resolve('reply msg');
  });

  db1._syncNodes.toArray()
      .then((arr) => {
        senderID = arr[0].id;
        return db2._syncNodes.toArray();
      })
      .then((arr) => {
        receiverID = arr.filter((node) => node.id !== senderID)[0].id;
        return db1.observable.sendMessage('request', {foo: 'foobar'}, receiverID, {wantReply: true});
      })
      .then((result) => {
        strictEqual(result, 'reply msg', 'We got the correct result msg');
      })
      .catch((e) => {
        ok(false, 'Error: ' + e);
      })
      .finally(start);
});

asyncTest('sender should react on failure reply', 1, () => {
  const db1 = createDB();
  const db2 = createDB();
  let senderID;
  let receiverID;
  db2.on('message', (msg) => {
    msg.reject('error msg');
  });

  db1._syncNodes.toArray()
      .then((arr) => {
        senderID = arr[0].id;
        return db2._syncNodes.toArray();
      })
      .then((arr) => {
        receiverID = arr.filter((node) => node.id !== senderID)[0].id;
        return db1.observable.sendMessage('request', {foo: 'foobar'}, receiverID, {wantReply: true});
      })
      .catch((msg) => {
        strictEqual(msg, 'error msg');
      })
      .finally(start);
});

asyncTest('sync nodes should react on broadcast', 4, () => {
  const db1 = createDB();
  const db2 = createDB();
  let senderID;
  let receiverID;
  db2.on('message', (msg) => {
    deepEqual(msg.message, {foo: 'foobar'}, 'We got the correct message');
    strictEqual(msg.sender, senderID, 'We got the right sender ID');
    strictEqual(msg.type, 'request', 'We got the correct type');
    strictEqual(msg.destinationNode, receiverID, 'We got the correct destination node');
    start();
  });

  db1.on('message', () => {
    ok(false, 'We should not receive a message');
  });

  db1._syncNodes.toArray()
      .then((arr) => {
        senderID = arr[0].id;
        return db2._syncNodes.toArray();
      })
      .then((arr) => {
        receiverID = arr.filter((node) => node.id !== senderID)[0].id;
        db1.observable.broadcastMessage('request', {foo: 'foobar'});
      })
      .catch((e) => {
        ok(false, 'Error: ' + e);
      });
});

asyncTest('sender should be able to react on broadcast if bIncludeSelf is true', 4, () => {
  const db1 = createDB();
  const db2 = createDB();
  let senderID;
  let receiverID;

  db1.on('message', (msg) => {
      deepEqual(msg.message, {foo: 'foobar'}, 'We got the correct message');
      strictEqual(msg.sender, senderID, 'We got the right sender ID');
      strictEqual(msg.type, 'broadcast', 'We got the correct type');
      strictEqual(msg.destinationNode, senderID, 'We got the correct destination node');
      start();
  });

  db1._syncNodes.toArray()
      .then((arr) => {
        senderID = arr[0].id;
        return db2._syncNodes.toArray();
      })
      .then((arr) => {
        receiverID = arr.filter((node) => node.id !== senderID)[0].id;
        const bIncludeSelf = true;
        db1.observable.broadcastMessage('broadcast', {foo: 'foobar'}, bIncludeSelf);
      })
      .catch((e) => {
        ok(false, 'Error: ' + e);
      });
});

// This tests relates to https://github.com/dfahlander/Dexie.js/issues/429#issuecomment-269793599
// If db2 receives its message multiple times qunit will error as start() is called multiple times
asyncTest('no matter how many times sendMessage is called a receiver should receive its message only once', 4, () => {
  const db1 = createDB();
  const db2 = createDB();
  let senderID;
  let receiverID;
  db2.on('message', (msg) => {
    deepEqual(msg.message, {foo: 'foobar'}, 'We got the correct message');
    strictEqual(msg.sender, senderID, 'We got the right sender ID');
    strictEqual(msg.type, 'request', 'We got the correct type');
    strictEqual(msg.destinationNode, receiverID, 'We got the correct destination node');
    start();
  });

  db1._syncNodes.toArray()
      .then((arr) => {
        senderID = arr[0].id;
        return db2._syncNodes.toArray();
      })
      .then((arr) => {
        receiverID = arr.filter((node) => node.id !== senderID)[0].id;
        db1.observable.sendMessage('request', {foo: 'foobar'}, receiverID, {});
        // Send messages for receivers that don't exist
        db1.observable.sendMessage('request', {foo: 'foobar'}, 'foobar', {});
        db1.observable.sendMessage('request', {foo: 'foobar'}, 'barbaz', {});
      })
      .catch((e) => {
        ok(false, 'Error: ' + e);
      });
});
