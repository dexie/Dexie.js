/**
 * This file is only meant to compile, not run!
 * It tests Dexie.d.ts.
 */

import Dexie, { IndexableType, Table } from '../../dist/dexie'; // Imports the source Dexie.d.ts file
import './test-extend-dexie';
import './test-updatespec';

// constructor overloads:
{
    let db = new Dexie('dbname');
    db = new Dexie('dbname', {addons: []});
    db = new Dexie('dbname', {autoOpen: false});
    db = new Dexie('dbname', {indexedDB: indexedDB, IDBKeyRange: IDBKeyRange});
    // Testing db.open(), but also catching its returned promise:
    db.open().catch('OpenFailedError', ex => {
        // ex will be Error interface
        ex.name;
    }).catch(ex => {
        // ex will be ProbablyError interface, which helps out nicely with code completion.
        console.error(ex.stack);
    }).catch(Dexie.BulkError, ex => {
        // When catching a specific error type, ex will implicitly have that type!
        console.error(ex.failures.join(','));
    });

    // name
    (()=>{let x:string = db.name;});
    // tables
    (()=>{let x:Dexie.Table<any,any>[] = db.tables;});
    // verno
    (()=>{let x:number = db.verno;});

    //
    // Use extended API from './test-extend-dexie.ts'
    //
    db.table('someTable').extendedTableMethod();
    db.on.customEvent2.subscribe(x => {});
    db.on('customEvent2', ()=>{});
    Dexie.extendedStaticMethod('foo').toLowerCase();

    // Promise compatibility
    {
        const func = (promise: Promise<any>) => {};
        func(db.open());
        class SomeClass {
            method<T> (promise: Promise<T>) { return promise; }
        }
        new SomeClass().method(db.open()).then(db => db.backendDB().createObjectStore("something"));
    } 

    // version
    db.version(1).stores({
        table: 'anything here',
    }).upgrade(trans => {
        return trans.table('table').add({something: 1});
    });

}

{
    //
    // Inherit Dexie
    //
    interface Friend {
        id?: number;
        name: string;
        isGoodFriend: boolean;
        address: {
            city: string;
        }
    }

    class Entity2 {
        oid!: string;
        prop1!: Date;
    }

    class BaseEntity {
        oid!: string;
        prop2!: Date;
        foo(): void {
            console.log('foo');
        }
    }

    class Entity3 extends BaseEntity {
        prop1!: Date;
        foo2(): void {
            console.log('foo');
        }
    }
    interface CompoundKeyEntity {
        firstName: string;
        lastName: string;
    }

    class MyDatabase extends Dexie {
        friends!: Dexie.Table<Friend, number>;
        table2!: Dexie.Table<Entity2, string>;
        table3!: Dexie.Table<Entity3, 'oid'>;
        table4!: Dexie.Table<Entity3, string>;
        table5!: Table;
        compoundTable!: Dexie.Table<CompoundKeyEntity, [string, string]>;

        constructor () {
            super ('MyDatabase');
            this.version(1).stores({
                table1: '++id',
                table2: 'oid',
                table3: '++oid',
                compoundTable: '[firstName+lastName]'
            });
        }
    }

    const fooAny: string = 'null'
    const foo: IndexableType = fooAny

    let db = new MyDatabase();

    // Extended table method
    db.friends.extendedTableMethod();
    // Extended DB method
    db.extendedDBMethod();
    // Extended event
    db.on('customEvent2', ()=>{});
    // Transaction
    db.transaction('rw', db.friends, ()=>{});

    // Table.get
    db.friends.get(1).then(friend => friend && friend.address.city);
    db.friends.get(2, friend => friend ? friend.address.city : "otherString")
        .then(friend => friend.charCodeAt(2))
        .finally(()=>{});
    db.friends.get({name: 'Kalle'})
        .then(friend => friend && friend.name.toLowerCase() == "kalle")
        .finally(()=>{});
    db.friends.get({name: 'Kalle'}, friend => friend && friend.name.toLowerCase() == "kalle")
        .catch(Dexie.AbortError, e => e.inner)
        .finally(()=>{});

    // Table.where
    db.friends.where('name').equalsIgnoreCase('kalle').count(count => count.toExponential());
    // Table.where with compound key
    db.compoundTable.where('[firstName+lastName]').anyOf([['Kalle', 'Smith'], ['Fred', 'Smith']]);
    db.compoundTable.where('[firstName+lastName]').anyOf(['Kalle', 'Smith'], ['Fred', 'Smith']);
    db.compoundTable.where('[firstName+lastName]').noneOf([['Kalle', 'Smith'], ['Fred', 'Smith']]);
    db.compoundTable.where('[firstName+lastName]').equals(['Kalle', 'Smith'])
    db.compoundTable.where('[firstName+lastName]').notEqual(['Kalle', 'Smith'])
    // Table.filter
    db.friends.filter(friend => /kalle/.test(friend.name)).count();
    // Table.count
    db.friends.count();
    db.friends.count(count => count.toExponential());
    db.friends.count(count => count.toExponential()).then(exp => exp.toLowerCase());
    db.friends.count(count => {count.toExponential(); return 7;}).then(exp => exp.toExponential());
    // Table.offset
    db.friends.offset(1).toArray();
    // Table.limit
    db.friends.limit(10).toArray();
    // Table.each
    db.friends.each(friend => friend.address);
    // Table.toArray
    db.friends.toArray().then(friends => friends[0].address);
    db.friends.toArray(friends => friends[0].address).finally(()=>{});
    // Table.toCollection
    db.friends.toCollection().eachPrimaryKey(key => key.toExponential());
    // Table.orderBy
    db.friends.orderBy('name').eachPrimaryKey(key => key.toFixed());
    // Table.bulkGet
    db.friends.bulkGet([1, 2, 3]).then(friends => friends.map(
        // friend => friend.address // should cause TS2532: Object is possibly 'undefined'
        friend => friend === undefined ? "missing" : friend.address
    ));

    // Hooks
    db.friends.hook('creating', function(key, friend) {
        key.toFixed();
        friend.isGoodFriend;
        friend.address.city;
        this.onsuccess = function(primKey) {
            primKey.toFixed();
        };
        this.onerror = function(err) {
            console.log('creating error', err);
        };
    });
    db.friends.hook('reading', friend => {friend.isGoodFriend = true; return friend; });
    db.friends.hook('updating', function(mods, key, friend) {
        mods.valueOf();
        key.toExponential();
        friend.isGoodFriend;
        friend.address.city;
        this.onsuccess = function(updatedObj) {
            updatedObj.isGoodFriend;
            updatedObj.address.city;
        };
        this.onerror = function(err) {
            console.log('updating error', err);
        };
    });
    db.friends.hook('deleting', function(key, friend) {
        key.toExponential();
        friend.isGoodFriend;
        friend.address.city;
        this.onsuccess = function() {
            console.log('deleting success');
        };
        this.onerror = function(err) {
            console.log('deleting error', err);
        };
    });

    // Issue #404
    class NotFoundError extends Error {
        constructor() {
            super ("Not found");
        }
        get name() {
            return "NotFoundError";
        }
    }

    db.friends.get({keyPath1: 'value1', keyPath2: 'value2'}, friend => {
        if (!friend) throw new NotFoundError();
        return friend;
    }).then (friend => {
        console.log(friend.address.city);
    }).catch (NotFoundError, err => {
        console.log("Could not find the friend");
    }).catch (err => {
        console.log(`Error: ${err}`);
    });


    const takeFriend = (friend: Friend) => {
        //friend.address = {city: "x"}; // would compile.
        return friend.address.city;
    }

    const retrieveFriend = async () => {
        const friend = await db.friends.get(1);
        if (!friend) throw "";
        //friend.address.city = "x"; // wouldn't compile.
        return takeFriend(friend); // Allowed in TS despite that friend is Readonly<Friend>. This is maybe good. But could be a headache for users if TS changes this.
    };

}

// Issue 756
// Also that Dexie.currentTransaction is given as first argument.
{
    let db = new Dexie('dbname');
    db.transaction('rw', 'foo', 'baa', trans=>{
        trans.abort();
    });
}
