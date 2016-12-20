/**
 * This file is only meant to compile, not run!
 * It tests Dexie.d.ts.
 */

import Dexie from '../../src/Dexie'; // Imports the source Dexie.d.ts file
import './test-extend-dexie';

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
        oid: string;
        prop1: Date;
    }

    class MyDatabase extends Dexie {
        friends: Dexie.Table<Friend, number>;
        table2: Dexie.Table<Entity2, string>;

        constructor () {
            super ('MyDatabase');
            this.version(1).stores({
                table1: '++id',
                table2: 'oid'
            });
        }
    }

    let db = new MyDatabase();

    // Extended table method
    db.friends.extendedTableMethod();
    // Extended DB method
    db.extendedDBMethod();
    // Extended event
    db.on('customEvent2', ()=>{});

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

    // Hooks
    db.friends.hook('creating', (key, friend) => {
        key.toFixed();
        friend.isGoodFriend;
        friend.address.city;
    });
    db.friends.hook('reading', friend => {friend.isGoodFriend = true; return friend; });
    db.friends.hook('updating', (mods, key, friend) => {
        mods.valueOf();
        key.toExponential();
        friend.isGoodFriend;
        friend.address.city;
    });
    db.friends.hook('deleting', (key, friend) => {
        key.toExponential();
        friend.isGoodFriend;
        friend.address.city;
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
}

