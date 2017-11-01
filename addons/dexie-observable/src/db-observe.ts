import Dexie from 'dexie';
import {Observable} from 'rxjs/Observable';

export function dbObserve <T> (this: Dexie, queryExecutor: ()=>Promise<T>) : Observable<T> {
  return new Observable<T>(subscriber => subscriber.complete());
}
