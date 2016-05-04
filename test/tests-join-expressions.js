import Dexie from 'dexie';
import {module, stop, start, test, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, supports, spawnedTest} from './dexie-unittest-utils';

var db = new Dexie("TestJoinExpression");
db.version(1).stores({
    users: "id,firstName,lastName"
});

module("join-expressions", {
    setup: () => {
        stop();
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    }
});

db.on("populate", function () {
    db.users.add({ id: 1, firstName: "Hillary", lastName: "Clinton"});
    db.users.add({ id: 2, firstName: "George", lastName: "Bush"});
    db.users.add({ id: 3, firstName: "Barack", lastName: "Obama"});
    db.users.add({ id: 4, firstName: "Olof", lastName: "Palme"});
    db.users.add({ id: 5, firstName: "z", lastName: "z"});
});

spawnedTest("Collection.orderBy() different index than querying", function*(){
    var users = yield db.users.where('firstName').between('B', 'I')
      .orderBy('lastName')
      .toArray();
    
    equal(users.length, 3, "It should return three users");
    equal(users[0].lastName, "Bush", "First should be Bush in lastName order");
    equal(users[1].lastName, "Clinton", "Second should be Clinton");
    equal(users[2].lastName, "Obama", "Third should be Obama");
});

spawnedTest("Collection.orderBy() same index as querying", function*(){
    var users = yield db.users.where('firstName').between('B', 'I')
      .orderBy('firstName') // Simple case - order by the same index as indexing on.
      .toArray();
      
    equal(users.length, 3, "It should return three users");
    equal(users[0].firstName, "Barack", "First should be Barack in firstName order");
    equal(users[1].firstName, "George", "Second should be George");
    equal(users[2].firstName, "Hillary", "Third should be Hillary");    
});

spawnedTest("Collection.orderBy() with advanced query", function*(){
    var users = yield db.users
      .where('lastName').equals('z').and('firstName').equalsIgnoreCase('z')
      .or(
          db.users.where('firstName')
            .startsWithAnyOfIgnoreCase('h','g','o')
            .and('lastName').startsWithAnyOfIgnoreCase('p','c')
      )
      .orderBy('lastName').reverse()
      .toArray();
    
    equal(users.length, 4, "It should return four users");
    equal(users[0].lastName, "z", "First should be z in lastName reverse order");
    equal(users[1].lastName, "Palme", "Second should be Palme");
    equal(users[2].lastName, "Clinton", "Third should be Clinton");
    equal(users[3].lastName, "Bush", "Forth should be Bush");
});
