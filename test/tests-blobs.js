import Dexie from 'dexie';
import {module, stop, start, asyncTest, equal, ok} from 'QUnit';
import {resetDatabase, promisedTest} from './dexie-unittest-utils';

var db = new Dexie("TestDBBinary");
db.version(1).stores({
    items: "id",
    songs: "++id, name"
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

function readBlob (blob, resultFormat) {
    return new Promise ((resolve, reject) => {
        let reader = new FileReader();
        reader.onloadend = ev => resolve (ev.target.result);
        reader.onerror = ev => reject(ev.target.error);
        reader.onabort = ev => reject(new Error("Blob Aborted"));
        switch ((resultFormat||"arraybuffer").toLowerCase()) {
            case 'text':
                reader.readAsText(blob);
                break;
            case 'dataurl':
                reader.readAsDataURL(blob);
                break;
            case 'binarystring':
                reader.readAsBinaryString(blob);
                break;
            default:
            case 'arraybuffer':
                reader.readAsArrayBuffer(blob);
                break;
        }        
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

promisedTest (`Issue #618 - Safari 11 add blob becomes null`, async ()=>{
    var debug = {hello: "world"};
    var blob = new Blob([JSON.stringify(debug, null, 2)], {type : 'application/json'});
    const obj = {
        name: 'foo',
        blob
    }
    let id = await db.songs.add(obj);
    const retrieved = await db.songs.get(id);
    equal(retrieved.name, obj.name, `Blob name is '${obj.name}'`);
    ok(!!retrieved.blob, `Retrieved blob is truthy`);
    if (retrieved.blob) {
        const dataBack = JSON.parse(await readBlob(retrieved.blob, "text"));
        equal(dataBack.hello, debug.hello, `Blob could be retrieved and decoded back`);
    }
});
