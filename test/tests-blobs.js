import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, promisedTest} from './dexie-unittest-utils';

var db = new Dexie("TestDBBinary");
db.version(1).stores({
    items: "id"
});

module("blobs", {
    setup: function () {
        stop();
        resetDatabase(db).catch(function (e) {
            ok(false, "Error resetting database: " + e.stack);
        }).finally(start);
    },
    teardown: function () {
    }
});

function readBlob (blob) {
    return new Promise ((resolve, reject) => {
        let reader = new FileReader();
        reader.onloadend = ev => resolve (ev.target.result);
        reader.onerror = ev => reject(ev.target.error);
        reader.onabort = ev => reject(new Error("Blob Aborted"));
        reader.readAsArrayBuffer(blob);
    });
}

function arraysAreEqual (a1, a2) {
    let length = a1.length;
    if (a2.length !== length) return false;
    for (var i=0; i<length; ++i) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
}

promisedTest (`Test blobs`, async ()=>{
    let binaryData = new Uint8Array([1,2,3,4]);
    let blob = new Blob([binaryData], {type: 'application/octet-binary'});
    await db.items.add ({id: 1, blob: blob });
    let back = await db.items.get(1);
    let arrayBuffer = await readBlob(back.blob);
    let resultBinaryData = new Uint8Array(arrayBuffer);
    ok(arraysAreEqual(resultBinaryData, binaryData), "Arrays should be equal");
});

promisedTest (`Test blob with creating hook applied`, async ()=>{
    function updatingHook (modifications, primKey, obj, trans) {
        ok (modifications.blob instanceof Blob, "When hook is called, the modifications should point to a Blob object");
    }
    try {
        db.items.hook('updating', updatingHook);
        let binaryData = new Uint8Array([1,2,3,4]);
        let blob = new Blob([binaryData], {type: 'application/octet-binary'});
        await db.items.add ({id: 1 });
        await db.items.put ({id: 1, blob: blob });
        let back = await db.items.get(1);
        let arrayBuffer = await readBlob(back.blob);
        let resultBinaryData = new Uint8Array(arrayBuffer);
        ok(arraysAreEqual(resultBinaryData, binaryData), "Arrays should be equal");
    } finally {
        db.items.hook('updating').unsubscribe(updatingHook);
    }
});

