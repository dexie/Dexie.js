
export { IndexableType } from './types/indexable-type';
import { DexieConstructor} from './types/dexie-constructor';
import { Table } from './types/table';
import { Collection } from './types/collection';
import { PromiseExtended } from './types/promise-extended';

declare var Dexie: DexieConstructor;

interface _Table<T, TKey> extends Table<T, TKey> {}
interface _Collection<T,TKey> extends Collection<T,TKey> {}

/** For backard compatibility: */
export declare module Dexie {
  type Promise<T=any> = PromiseExtended<T> // Because many samples have been Dexie.Promise.
  interface Table<T=any,TKey=any> extends _Table<T,TKey> {} // Because all samples have been Dexie.Table<...>
  interface Collection<T=any,TKey=any> extends _Collection<T, TKey> {} // Because app-code may declare it.
}

export default Dexie;
