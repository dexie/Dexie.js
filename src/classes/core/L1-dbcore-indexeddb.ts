import { DBCore, WriteFailure, WriteResponse, Cursor, InsertRequest, UpsertRequest, RangeQuery, CursorObserver, Schema } from './L1-dbcore/dbcore';
import { IDBObjectStore, IDBRequest, IDBCursor, IDBTransaction } from '../../public/types/indexeddb';

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

function openCursor ({trans, table, index, wantKeys, limit, range, reverse, unique}: RangeQuery,
  observer: CursorObserver)
{
  trycatch(observer.onError.bind(observer), ()=>{
    const {onInitCursor, onNext, onError, onDone} = observer;
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

    function onCursorSuccess () {
      if (!req.result) return onDone();
      onNext(req.result);
    }
      
    // iteration
    req.onerror = eventRejectHandler(observer.onError.bind(observer));
    req.onsuccess = trycatcher(ev => {
      const cursor: IDBCursor = req.result;
      if (!cursor) {
        onDone();
        return;
      }
      req.onsuccess = trycatcher(event => {
        onNext(req.result);
      }, onError);

      // Now change req.onsuccess to a callback that doesn't call initCursor but just observer.next()
      req.onsuccess = trycatcher(onCursorSuccess, onError);

      if (onInitCursor) observer.onInitCursor(cursor);

      observer.onNext(cursor);
        
    }, onError);          
  });
}

function simulateGetAll(query: RangeQuery): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const result = new Array();
    openCursor(query, {
      onError: reject,
      onDone: ()=>resolve(result),
      onNext: query.wantKeys ?
        cursor => {
          result.push(cursor.primaryKey);
          cursor.continue();
        } :
        cursor => {
          result.push(cursor.value);
          cursor.continue();
        }
    });
  });
}

function simulateCount(query: RangeQuery): Promise<number> {
  return new Promise((resolve, reject) => {
    let result = 0;
    openCursor({...query, wantKeys: true}, {
      onError: reject,
      onDone: ()=>resolve(result),
      onNext(cursor) {
        ++result;
        cursor.continue();
      }
    });
  });
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


export function getIDBCoreImpl (db: IDBDatabase, indexedDB: IDBFactory, schema: Schema) : DBCore {
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

    comparer: () => indexedDB.cmp.bind(indexedDB),

    schema

  };
}
