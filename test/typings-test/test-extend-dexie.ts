
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
var x: Dexie.Promise;
var y: Dexie.Table<{hello: any}, number>;
