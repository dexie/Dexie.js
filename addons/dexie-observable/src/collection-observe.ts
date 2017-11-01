import Dexie from 'dexie';
import {Observable} from 'rxjs/Observable';

export function collectionObserve <T> (this: Dexie.Collection<T, any>) : Observable<T[]> {
  return new Observable<T[]>(subscriber => subscriber.complete());
}
