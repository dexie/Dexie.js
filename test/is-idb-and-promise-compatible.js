import Dexie from 'dexie';
import {NativePromise} from '../src/helpers/promise';

var _resolve = NativePromise.resolve.bind(NativePromise);
var _then = NativePromise.prototype.then;

export class IdbPromiseIncompatibleError extends Error {
    constructor() {
        super("IndexedDB and Promise are incompatible on this browser");
        this.name = "IdbPromiseIncompatibleError";
    }
}

export async function isIdbAndPromiseCompatible() {
    let db = new Dexie("idbPromiseCompatTest");
    db.version(1).stores({foo:'bar'});
    await db.delete();
    await db.open();
    return await db.transaction('r', db.foo, async ()=>{
        let x = await db.foo.count();
        let p = _resolve(0);
        for (let i=0;i<10;++i) {
            p = _then.call(p, x => x + 1);
        }
        let result = await p;
        console.log("Result: "+ result + " (should be 10");
        try {
            await db.foo.count();
            db.close();
            return true;
        } catch (ex) {
            db.close();
            throw new IdbPromiseIncompatibleError();
        }
    });
}
