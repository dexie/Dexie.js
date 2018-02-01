import Promise, {wrap} from '../helpers/promise';
import { IDBObjectStore, IDBRequest, IDBEvent, IDBKeyRange } from '../public/types/indexeddb';
import { preventDefault, eventSuccessHandler } from './event-wrappers';
import { IndexableType } from '../public/types/indexable-type';

export type BulkRequest = BulkAddRequest | BulkPutRequest | BulkDeleteRequest;

export interface BulkAddRequest {
  op: 'add';
  objs: any[];
  keys?: IndexableType[];
}

export interface BulkPutRequest {
  op: 'put';
  objs: any[];
  keys?: IndexableType[];
}

export interface BulkDeleteRequest {
  op: 'delete';
  keys: IndexableType[];
}

export interface BulkFailure {
  pos: number;
  error: Error;
}

export interface BulkResponse {
  failures: BulkFailure[];
  lastResult: IndexableType | undefined;
}

/*function deleteRange (
  store: IDBObjectStore,
  range: IDBKeyRange)
{
  let req: IDBRequest;
  if (breq.range.lower == null && breq.range.upper == null) {
    // Use clear()
    req = store.clear();
    req.onsuccess = eventSuccessHandler(res => resolve({failures: []}));
    req.onerror
  } else {
    // Use delete(range)
    req = store.delete(breq.range);
  }
  req.onsuccess 
}*/

function bulk (store: IDBObjectStore, breq: BulkRequest) : Promise<BulkResponse> {
  return new Promise(resolve => {
    const length = breq.op === 'delete' ? breq.keys.length : breq.objs.length;
    let req: IDBRequest & { _reqno?};
    let i: number;
    const failures: BulkFailure[] = [];
    const errorHandler = (event: IDBEvent) => {
      preventDefault(event);
      failures.push({
        pos: (event.target as any)._reqno,
        error: event.target.error
      });
    };
    const {keys} = breq;
    if (breq.op === 'delete') {
      for (i=0; i<length; ++i) {
        req = store.delete(keys[i]);
        req._reqno = i;
        req.onerror = errorHandler;
      }
    } else {
      // inbound keys
      const {objs} = breq;
      const supplyKeys = store.keyPath == null;
      for (i=0; i<length; ++i) {
        req = supplyKeys ?
          store[breq.op](objs[i], keys[i]) :
          store[breq.op](objs[i]);
        req._reqno = i;
        req.onerror = errorHandler;
      }
    }

    const done = wrap((event: IDBEvent) => {
      resolve({
        failures,
        lastResult: event.target.result
      });
    });

    req.onerror = (event: IDBEvent) => {
      errorHandler(event);
      done(event);
    };
    req.onsuccess = done;
  });
}
