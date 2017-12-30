
import Dexie, {IndexableType} from '../../src/public/index'; // Imports the source Dexie.d.ts file

//
// Extend Dexie interface
//

// 3.0-style
declare module '../../src/public/types/table' {
    interface Table<T,TKey extends IndexableType> {
        extendedTableMethod() : any;
    }
}

// 2.0-style
declare module '../../src/public/index' {
    module Dexie {
        interface Table<T,TKey extends IndexableType> {
            extendedTableMethod() : any;
        }     
    }
}

// 3.0-style
declare module '../../src/public/types/db-events' { 

    interface DbEvents {
        (eventName: 'changes', subscriber: ()=>any): void;
        (eventName: 'customEvent2', subscriber: ()=>any): void;
        changes: Dexie.DexieEvent;
        customEvent2: Dexie.DexieEvent;
    }
    //var extendedStaticMethod: (param1: string) => string;
}
declare module '../../src/public/types/dexie-constructor' {
    interface DexieConstructor {
        extendedStaticMethod: (param1: string) => string;
    }
}

// 2.0-style
declare module '../../src/public/index' { 
    module Dexie { 
        interface DbEvents {
            (eventName: 'changes', subscriber: ()=>any): void;
            (eventName: 'customEvent2', subscriber: ()=>any): void;
            changes: Dexie.DexieEvent;
            customEvent2: Dexie.DexieEvent;
        }
        var extendedStaticMethod: (param1: string) => string;
    }
}

declare module '../../src/public/types/dexie' {
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

