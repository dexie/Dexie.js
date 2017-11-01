import Dexie from 'dexie';
import {Observable} from 'rxjs/Observable';

declare module 'dexie' {
  interface Dexie {
    observe<T> (queryExecutor: ()=>Promise<T>) : Observable<T>;
  }

  module Dexie {
    interface Table<T, Key> {
        observe(): Observable<T[]>;
    }
    interface Collection<T, Key> {
        observe(): Observable<T[]>;
    }    
  }
}
