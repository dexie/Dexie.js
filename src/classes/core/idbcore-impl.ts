import { IDBCore, BulkFailure, BulkResponse, GetAllQuery, ObjectStore, OpenCursorQuery, Cursor } from './idbcore';
import { IDBObjectStore, IDBRequest, IDBCursor } from '../../public/types/indexeddb';

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

export function getIDBCoreImpl (db: IDBDatabase, indexedDB: IDBFactory) : IDBCore {

  return {
    transaction: db.transaction.bind(db),

    add: mutate.bind(null, 'add'),

    put: mutate.bind(null, 'put'),

    delete (store, keys) {
      return mutate("delete", store as IDBObjectStore, keys).then(x => {
        if (x.failures.length > 0) {
          return Promise.reject(x.failures[0]);
        }
      });
    },

    get (store: IDBObjectStore, keys) {
      return new Promise<any[]>((resolve, reject) => {
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

    getAll (store: IDBObjectStore, {index, wantKeys, limit, range}: GetAllQuery) {
      return new Promise<any[]>((resolve, reject) => {
        const source = index == null ? store : store.index(index);
        const req = wantKeys ?
          source.getAllKeys(range, limit) :
          source.getAll(range, limit);
        req.onsuccess = event => resolve(event.target.result);
        req.onerror = event => eventRejectHandler(reject);
      });
    },
    
    openCursor: (store: IDBObjectStore, {index, wantKeysOnly, observer, range, reverse, unique} : OpenCursorQuery) => {
      const {onInitCursor, onNext, onError, onDone} = observer;
      trycatch(onError.bind(observer), ()=>{
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
        const req = wantKeysOnly ?
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
    },

    cmp: indexedDB.cmp.bind(indexedDB)

  } as any as IDBCore;

  function mutate (op: 'add' | 'put' | 'delete', store: IDBObjectStore, args1: any[], args2?: any) : Promise<BulkResponse> {
    return new Promise((resolve, reject) => {
      const length = args1.length;
      let req: IDBRequest & { _reqno?};
      let i: number;
      const failures: BulkFailure[] = [];
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
}
