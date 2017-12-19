import { IDBFactory, IDBValidKey } from '../public/types/indexeddb';

export const Comparer = (indexedDB: IDBFactory) => ({
  cmp: indexedDB.cmp.bind(indexedDB),

  min (a: IDBValidKey, b: IDBValidKey) {
    return indexedDB.cmp(a, b) < 0 ? a : b;
  },

  max (a: IDBValidKey, b: IDBValidKey) {
    return indexedDB.cmp(a, b) > 0 ? a : b;
  },

  ascending (a: IDBValidKey, b: IDBValidKey) {
    return indexedDB.cmp(a,b);
  },
  
  descending(a: IDBValidKey, b: IDBValidKey) {
    return indexedDB.cmp(b,a);
  }
});
