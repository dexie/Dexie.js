import { DBCore, WriteFailure, WriteResponse, Cursor, InsertRequest, UpsertRequest, RangeQuery, Schema, OpenCursorResponse } from './dbcore';
import { IDBObjectStore, IDBRequest, IDBCursor, IDBTransaction } from '../../../public/types/indexeddb';

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

function openCursor ({trans, table, index, wantKeys, limit, range, reverse, unique}: RangeQuery): Promise<OpenCursorResponse>
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
    const req = wantKeys ?
      source.openKeyCursor(range, direction) :
      source.openCursor(range, direction);
      
    // iteration
    req.onerror = eventRejectHandler(reject);
    req.onsuccess = trycatcher(ev => {
      const cursor: IDBCursor = req.result;
      if (!cursor) {
        resolve({cursor: null, iterate: ()=>Promise.resolve()});
        return;
      }
      req.onsuccess = ()=>resolve({
        cursor: req.result,
        iterate (callback) {
          return new Promise((resolve, reject) => {
            // Now change req.onsuccess to a callback that doesn't call initCursor but just observer.next()
            const guardedCallback = trycatcher(callback, reject);
            req.onsuccess = guardedCallback;
            // Call it once for the first entry, so it can call cursor.continue()
            guardedCallback();
          });
        }
      });
    }, reject);          
  });
}

function simulateGetAll(query: RangeQuery): Promise<any[]> {
  const result = [];
  return openCursor(query).then(({iterate, cursor}) => {
    return iterate(query.wantKeys ? ()=>{
      result.push(cursor.primaryKey);
      cursor.continue();
    } : ()=>{
      result.push(cursor.value);
      cursor.continue();
    });
  }).then(()=>result);
}

function simulateCount(query: RangeQuery): Promise<number> {
  let result = 0;
  return openCursor({...query, wantKeys: true}).then(({iterate, cursor}) => {
    return iterate(()=>{
      ++result;
      cursor.continue();
    });
  }).then(()=>result);
}

function getAll (query: RangeQuery) {
  return new Promise<any[]>((resolve, reject) => {
    if (query.reverse || query.unique) {
      return simulateGetAll(query);
    }
    const {trans, table, index, wantKeys, limit, range} = query;
    const store = (trans as IDBTransaction).objectStore(table);
    const source = index == null ? store : store.index(index);
    const req = wantKeys ?
      source.getAllKeys(range, limit) :
      source.getAll(range, limit);
    req.onsuccess = event => resolve(event.target.result);
    req.onerror = event => eventRejectHandler(reject);
  });
}

function extractSchema(db: IDBDatabase) : Schema {
  const tables = arrayify(db.objectStoreNames);
  const trans = db.transaction(tables, 'readonly');
  return {
    name: db.name,
    tables: tables.map(table => trans.objectStore(table)).map(store => ({
      ...pick(store, ["name", "keyPath", "autoIncrement"]),
      indexes: arrayify(store.indexNames).map(indexName => store.index(indexName))
        .map(index => pick(index, ["name", "keyPath", "unique", "multiEntry"]))
      }))
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

    getAll,
    
    openCursor,

    count (query) {
      return new Promise<number>((resolve, reject) => {
        const store = (query.trans as IDBTransaction).objectStore(query.table);
        const source = query.index == null ? store : store.index(query.index);
        if (query.unique) return simulateCount(query);
        const req = source.count(query.range);
        req.onsuccess = ev => resolve(ev.target.result);
        req.onerror = eventRejectHandler(reject);
      });
    },

    //comparer: () => indexedDB.cmp.bind(indexedDB),
    cmp: indexedDB.cmp.bind(indexedDB),

    schema: extractSchema(db)

  };
}
