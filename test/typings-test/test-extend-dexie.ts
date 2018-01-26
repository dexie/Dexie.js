
import {Dexie, Table, DexieConstructor, IndexableType} from '../../dist/dexie';

//
// Extend Dexie interface
//
declare module '../../dist/dexie' {
    interface Table<T, TKey> {
        extendedTableMethod() : any;
    }
    interface DbEvents {
        (eventName: 'changes', subscriber: ()=>any): void;
        (eventName: 'customEvent2', subscriber: ()=>any): void;
        changes: DexieEvent;
        customEvent2: DexieEvent;
    }
    interface DexieConstructor {
        extendedStaticMethod (param1: string) : string;    
    }
    
    interface Dexie {
        extendedDBMethod() : any;
    }
}

Dexie.addons.push(db => {
    db.Table.prototype.extendedTableMethod = ()=>{};
    db.extendedDBMethod = ()=>{};
    db.on.addEventType({
        changes: 'asap'
    });
    db.on.addEventType('customEvent2', (a,b)=>()=>{a(); b();}, ()=>{});
});

Dexie.extendedStaticMethod = param1 => param1;


//var x: Dexie.Table<{name: string, age: number}, number>;
var db: Dexie = null as any as Dexie;

var x: Dexie.Promise = null as any as Dexie.Promise;
var x2 = Dexie.Promise.all([1]);
x = x2;


var y: Dexie.Table<{hello: any}, number>;
var y2: Table<{hello: any}, number>;
var y3 = db.table<{hello: any}, number>("hello");
y2 = y3;
y = y2;

