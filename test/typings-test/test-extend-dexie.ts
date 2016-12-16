
import Dexie from '../../src/Dexie'; // Imports the source Dexie.d.ts file

//
// Extend Dexie interface
//
declare module '../../src/Dexie' {
    module Dexie {
        interface Table<T,Key> {
            extendedTableMethod() : any;
        }
        interface DbEvents {
            (eventName: 'changes', subscriber: ()=>any): void;
            (eventName: 'customEvent2', subscriber: ()=>any): void;
            changes: Dexie.DexieEvent;
            customEvent2: Dexie.DexieEvent;
        }
        var extendedStaticMethod: (param1: string) => string;
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

