import { IndexableType } from '../public/types/indexable-type';
import { Transaction } from '../classes/transaction';
import { eventRejectHandler, hookedEventRejectHandler, hookedEventSuccessHandler } from './event-wrappers';
import { wrap } from '../helpers/promise';
import { tryCatch } from '../functions/utils';

export function bulkDelete(
  idbstore: IDBObjectStore,
  trans: Transaction,
  keysOrTuples: ReadonlyArray<IndexableType> | {0: IndexableType, 1: any}[],
  hasDeleteHook: boolean, deletingHook)
{
  // If hasDeleteHook, keysOrTuples must be an array of tuples: [[key1, value2],[key2,value2],...],
  // else keysOrTuples must be just an array of keys: [key1, key2, ...].
  return new Promise<void>((resolve, reject)=>{
      const len = keysOrTuples.length;
      const lastItem = len - 1;
      if (len === 0) return resolve();
      if (!hasDeleteHook) {
          for (let i=0; i < len; ++i) {
              const req = idbstore.delete(keysOrTuples[i] as IDBValidKey);
              req.onerror = eventRejectHandler(reject);
              if (i === lastItem) req.onsuccess = wrap(()=>resolve());
          }
      } else {
          let hookCtx;
          const errorHandler = hookedEventRejectHandler(reject);
          const successHandler = hookedEventSuccessHandler(null);
          tryCatch(()=> {
              for (let i = 0; i < len; ++i) {
                  hookCtx = {onsuccess: null, onerror: null};
                  const tuple = keysOrTuples[i];
                  deletingHook.call(hookCtx, tuple[0], tuple[1], trans);
                  const req = idbstore.delete(tuple[0]) as IDBRequest & { _hookCtx?};
                  req._hookCtx = hookCtx;
                  req.onerror = errorHandler;
                  if (i === lastItem)
                      req.onsuccess = hookedEventSuccessHandler(resolve);
                  else
                      req.onsuccess = successHandler;
              }
          }, err=>{
              hookCtx.onerror && hookCtx.onerror(err);
              throw err;
          });
      }
  });
}    
