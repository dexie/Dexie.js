import { DBCore, WriteFailure, WriteResponse, Cursor, InsertRequest, UpsertRequest, OpenCursorRequest, QueryRequest, CountRequest, Schema, IndexSchema, KeyRange, QueryResponse } from './dbcore';
import { IDBObjectStore, IDBRequest, IDBCursor, IDBTransaction, IDBKeyRange } from '../../../public/types/indexeddb';
//import { getCountAndGetAllEmulation } from './utils/index';
import { isArray } from '../../../functions/utils';

const cmp = indexedDB.cmp.bind(indexedDB);

// Move these to separate module(s)
export function eventRejectHandler(reject) {
  return event => {
      event.preventDefault();
      event.stopPropagation();
      reject (event.target.error);
  };
}
export function trycatcher(fn, reject) {
  return function () {
      try {
          fn.apply(this, arguments);
      } catch (e) {
          reject(e);
      }
  };
}
export function trycatch(reject, fn) {
  try {
    fn();
  } catch (err) {
    reject(err);
  }
};
export function arrayify<T>(arrayLike: {length: number, [index: number]: T}): T[] {
  return [].slice.call(arrayLike);
}
export function pick<T,Prop extends keyof T>(obj: T, props: Prop[]): Pick<T, Prop> {
  const result = {} as Pick<T, Prop>;
  props.forEach(prop => result[prop] = obj[prop]);
  return result;
}


// Into own module:
function mutate (op: 'add' | 'put' | 'delete', store: IDBObjectStore, args1: any[], args2?: any) : Promise<WriteResponse> {
  return new Promise((resolve, reject) => {
    const length = args1.length;
    let req: IDBRequest & { _reqno?};
    let i: number;
    const failures: WriteFailure[] = [];
    const errorHandler = op === 'delete' ?
      // It would be abnormal with an error on a delete operation
      eventRejectHandler(reject) :
      // Errors on put() and add() can be catchable constraint violations
      event => {
        event.stopPropagation();
        event.preventDefault();
        failures.push({
          pos: (event.target as any)._reqno,
          reason: event.target.error
        });
      };
    const mutateOp = store[op].bind(store);
    if (args2) {
      for (i=0; i<length; ++i) {
        req = mutateOp(args1[i], args2[i]);
        req._reqno = i;
        req.onerror = errorHandler;
      }
    } else {
      for (i=0; i<length; ++i) {
        req = mutateOp(args1[i]);
        req._reqno = i;
        req.onerror = errorHandler;
      }
    }

    const done = (event) => {
      resolve({
        failures,
        lastKey: event.target.result
      });
    };

    req.onerror = (event) => {
      errorHandler(event);
      done(event);
    };

    req.onsuccess = done;
  });
}

function openCursor ({trans, table, index, values, query, reverse, unique}: OpenCursorRequest): Promise<Cursor>
{
  return new Promise((resolve, reject) => {
    const store = (trans as IDBTransaction).objectStore(table);
    // source
    const source = index == null ? store : store.index(index);
    // direction
    const direction = reverse ?
      unique ?
        "prevunique" :
        "prev" :
      unique ?
        "nextunique" :
        "next";
    // request
    const req = values ?
    source.openCursor(makeIDBKeyRange(query), direction) :
    source.openKeyCursor(makeIDBKeyRange(query), direction);
      
    // iteration
    req.onerror = eventRejectHandler(reject);
    req.onsuccess = trycatcher(ev => {
      const cursor = req.result as Cursor;
      if (!cursor) {
        resolve(null);
        return;
      }
      (cursor as any).done = false;
      let veryFirst = true;
      const _cursorContinue = cursor.continue.bind(cursor);
      const _cursorContinuePrimaryKey = cursor.continuePrimaryKey.bind(cursor);
      const _cursorAdvance = cursor.advance.bind(cursor);
      const doThrowCursorIsStopped = ()=>{throw new Error("Cursor not started");}
      (cursor as any).trans = trans;
      cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
      cursor.start = (callback, key?, primaryKey?) => {
        const iterationPromise = new Promise<void>((resolveIteration, rejectIteration) =>{
          req.onerror = eventRejectHandler(rejectIteration);
          cursor.stop = value => {
            cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
            cursor.fail = req.onerror = rejectIteration;
            resolveIteration(value);
          }
        });
        // Now change req.onsuccess to a callback that doesn't call initCursor but just observer.next()
        const guardedCallback = () => {
          if (req.result) {
            try {
              callback();
            } catch (err) {
              cursor.fail(err);
            }
          } else {
            (cursor as any).done = true;
            cursor.start = ()=>{throw new Error("Cursor behind last entry");}
            cursor.stop();
          }
        }
        req.onsuccess = () => {
          cursor.continue = _cursorContinue;
          cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
          cursor.advance = _cursorAdvance;
          req.onsuccess = guardedCallback;
          guardedCallback();
        };
        // Call it once for the first entry, so it can call cursor.continue()
        const isAtGivenKeys = (
          key == null ||
          (cmp(key, cursor.key) === 0 && 
            (primaryKey == null || cmp(primaryKey, cursor.primaryKey) === 0))
        );
        if (veryFirst) {
          veryFirst = false;
          if (isAtGivenKeys) {
            // Either user did not specify key/primaryKey as optional args to cursor.start(),
            // so we should provide the first entry it landed on already. OR, user provided key /primaryKey
            // but the cursor happens to be exactly on that key/primaryKey! Then we must callback!
            guardedCallback();
            return iterationPromise;
          }
        }
        // This is the second time cursor.start() is called OR, it's the first, but we're not yet at given keys.
        // We did not call guardedCallback() so 
        // we must do the call to cursor.continue() ourselves we should ever see anything happen.
        // Depending on whether a key/primaryKey is given, call the proper continue method:
        if (primaryKey != null) {
          // Both key and primaryKey was given.
          cursor.continuePrimaryKey(key, primaryKey);
        } else {
          // key may be given. Or not.
          cursor.continue(key || null);
        }
        return iterationPromise;
      };
      resolve(cursor);
    }, reject);     
  });
}

//const polyfills = getCountAndGetAllEmulation(openCursor);

function getAll (request: QueryRequest) {
  return new Promise<QueryResponse>((resolve, reject) => {
    const {trans, table, index, values, limit, query} = request;
    const store = (trans as IDBTransaction).objectStore(table);
    const source = index == null ? store : store.index(index);
    const req = values ?
      source.getAll(makeIDBKeyRange(query), limit) :
      source.getAllKeys(makeIDBKeyRange(query), limit);
    req.onsuccess = event => resolve({result: event.target.result});
    req.onerror = event => eventRejectHandler(reject);
  });
}

function extractSchema(db: IDBDatabase) : Schema {
  const tables = arrayify(db.objectStoreNames);
  const trans = db.transaction(tables, 'readonly');
  return {
    name: db.name,
    tables: tables.map(table => trans.objectStore(table)).map(store => ({
      name: store.name,
      primaryKey: {
        isPrimaryKey: true,
        name: null,
        unique: true,
        compound: isArray(store.keyPath),
        ...pick(store, ["keyPath", "autoIncrement"])
      } as IndexSchema,
      indexes: arrayify(store.indexNames).map(indexName => store.index(indexName))
        .map(index => ({
          ...pick(index, ["name", "keyPath", "unique", "multiEntry"]),
          compound: isArray(index.keyPath)
        } as IndexSchema))
      }))
  };
}


function makeIDBKeyRange (range: KeyRange) : IDBKeyRange | null {
  if (!range) return null; // TODO: Make KeyRange have a "type" to inspect instead.
  const {lower, upper, lowerOpen, upperOpen} = range;
  const idbRange = lower === undefined ?
    upper === undefined ?
      null :
      IDBKeyRange.lowerBound(lower, !!lowerOpen) :
    upper === undefined ?
      IDBKeyRange.upperBound(upper, !!upperOpen) :
      IDBKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
  return idbRange as IDBKeyRange;
}

function rangeIncludes (range: KeyRange) {
  const idbRange = makeIDBKeyRange(range);
  if (idbRange === null) return ()=>true;
  return key => {
    try {
      return idbRange.includes(key);
    } catch (err) {
      return false;
    }
  };
}

export function createDBCore (db: IDBDatabase, indexedDB: IDBFactory, schema: Schema) : DBCore {
  return {
    transaction: db.transaction.bind(db),

    write ({trans, table, op, values, keys}) {
      return mutate(op === 'insert' ? 'add' : 'put',
        (trans as IDBTransaction).objectStore(table),
        values,
        keys);
    },

    delete ({trans, table, keys}) {
      return mutate(
        "delete",
        (trans as IDBTransaction).objectStore(table),
        keys)
      .then(({failures}) =>
        failures.length > 0 && Promise.reject(failures[0]));
    },

    deleteRange({trans, table, range}) {
      return mutate(
        "delete",
        (trans as IDBTransaction).objectStore(table),
        [range]
      ).then(({failures})=> failures.length && Promise.reject(failures[0]));
    },

    get ({trans, table, keys}) {
      return new Promise<any[]>((resolve, reject) => {
        const store = (trans as IDBTransaction).objectStore(table);
        const length = keys.length;
        const result = new Array(length);
        let resultPos = 0;
        let req: IDBRequest;
  
        const successHandler = event => {
          result[resultPos++] = event.target.result;
          if (resultPos === length) resolve(result);
        };
        const errorHandler = eventRejectHandler(reject);
  
        for (let i=0; i<length; ++i) {
          req = store.get(keys[i]);
          req.onsuccess = successHandler;
          req.onerror = errorHandler;
        }
      });
    },

    query: getAll,
    
    openCursor,

    count (query) {
      return new Promise<number>((resolve, reject) => {
        const store = (query.trans as IDBTransaction).objectStore(query.table);
        const source = query.index == null ? store : store.index(query.index);
        const req = source.count(makeIDBKeyRange(query.query));
        req.onsuccess = ev => resolve(ev.target.result);
        req.onerror = eventRejectHandler(reject);
      });
    },

    //comparer: () => indexedDB.cmp.bind(indexedDB),
    cmp,

    rangeIncludes,

    schema: extractSchema(db)

  };
}
