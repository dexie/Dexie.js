import {Cursor} from '../cursor';
import {CursorObserver} from '../cursor-observer';
import {TableSchema} from '../schema';
import {exceptions} from '../exceptions';
import {eventRejectHandler} from '../tools/eventwrappers';
import {wrap} from '../../promise';
import {equals, getReversibleCompareTools} from '../compare-tools';
import {KeyRange} from '../keyrange';

export function iterate (
    objectStore: IDBObjectStore,
    schema: TableSchema,
    keyPath: string | string[] | null,
    keyRange: Partial<KeyRange> | null,
    options: {keysOnly: boolean, reverse: boolean, unique: boolean},
    observer: Partial<CursorObserver>,
    onError: (err) => void,
    onDone: () => void)
{
    const indexOrStore = getIndexOrStore(keyPath, objectStore, schema);
    const method = options.keysOnly && ("openKeyCursor" in indexOrStore) ?
        "openKeyCursor" : "openCursor";
    const direction = (options.reverse ? "prev" : "next") + (options.unique ? "unique" : "");
    const req = indexOrStore[method](keyRange, direction);
    req.onerror = eventRejectHandler(onError);
    
    const {cmp} = getReversibleCompareTools(options.reverse);

    // Final success callback to switch to once the first success call is complete:
    function onCursorSuccess (ev) {
        if (!req.result) return onDone();
        observer.onNext && observer.onNext(req.result);
        if (observer.done) onDone();
    }

    req.onsuccess = wrap(ev => {
        const cursor: Cursor = ev.target.result;
        if (!cursor) return onDone();


        // Now change req.onsuccess to a callback that doesn't call initCursor but just observer.next()
        req.onsuccess = wrap(onCursorSuccess, onError);
        
        //
        // <Polyfill continuePrimaryKey()>
        //
        if (!cursor.continuePrimaryKey) cursor.continuePrimaryKey = (key, primaryKey) => {
            const keyCompare = cmp(key, cursor.key);
            if (keyCompare < 0)
                cursor.continue(key);
            else if (keyCompare === 0 && cmp(primaryKey, cursor.primaryKey < 0))
                cursor.continue();
            else
                cursor.continue(key);// Trigger DOMException trying to continue to a lower key
            
            // Redirect onsuccess temporary to a fast-forwarder algorithm:
            req.onsuccess = wrap(ev => {
                if (cmp(key, cursor.key) <= 0 &&
                    cmp(primaryKey, cursor.primaryKey) < 0)
                {
                    cursor.continue(); // Continue until primaryKey is reached.
                } else {
                    // Done continuing to primary key or beyond. Call success callback
                    // and restore correct callback again.
                    req.onsuccess = wrap(onCursorSuccess, onError);
                    return onCursorSuccess(ev);
                }
            }, onError);
        };
        //
        // </Polyfill>
        //

        if (observer.initCursor) observer.initCursor(cursor);

        observer.onNext && observer.onNext(cursor);
    }, onError);
}

function getIndexOrStore(keyPath: string | string[] | null, objectStore: IDBObjectStore, schema: TableSchema) {
    if (!keyPath || keyPath.length === 0) return objectStore;
    if (objectStore.keyPath && equals(keyPath, objectStore.keyPath))
        return objectStore;
    const indexName = typeof keyPath === 'string' ? keyPath : '[' + keyPath.join('+') + ']';
    const indexSpec = schema.idxByName[indexName];
    if (!indexSpec) throw new exceptions.Schema("KeyPath " + indexName + " on object store " + schema.name + " is not indexed");
    return objectStore.index(indexSpec.name); // indexSpec.name (native index name) may differ from indexName (declared index name)
}

