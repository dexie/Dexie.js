import { DBCoreTable, DBCoreTransaction } from '../public/types/dbcore';

let counter = 0;

export function LockableTableMiddleware<TQuery> (tableMiddleware: DBCoreTable<TQuery>) : {lock<T> (trans: DBCoreTransaction, p: Promise<T>): Promise<T>, lockableMiddleware: DBCoreTable<TQuery>} {
  const lockableMiddleware = {...tableMiddleware};
  const lockerId = ++counter;
  //const locks = [] as DBCoreTransaction[];
  //const promises = [] as Promise<any>[];
  Object.keys(tableMiddleware).forEach(m => {
    const method = tableMiddleware[m];
    if (typeof method === 'function') {
      const guardedMethod = (req: {trans: DBCoreTransaction}) => {
        const lockPromise = (req.trans["_lock"+lockerId]);
        if (lockPromise) {
          // Method is locked for this transaction.
          // Wait until its promise resolves.
          // Then re-call this guardedMethod to check locks again.
          return lockPromise.then(()=>guardedMethod(req));
        }
        return method(req);
      }
      lockableMiddleware[m] = guardedMethod;
    }
  });
  return {
    lock<T>(trans: DBCoreTransaction, p: Promise<T>){
      function unlock() {
        delete trans["_lock"+lockerId];
      }
      p = p.then(res => {
        // TODO: Use finally() instead.
        unlock();
        return res;
      }).catch(err => {
        unlock();
        return Promise.reject(err);
      });
      trans["_lock"+lockerId] = p;
      return p;
    },
    lockableMiddleware
  };
}
