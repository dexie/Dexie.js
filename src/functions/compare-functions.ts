import { IDBFactory, IndexableType } from '../public/types/indexeddb';

export function simpleCompare(a, b) {
  return a < b ? -1 : a === b ? 0 : 1;
}

export function simpleCompareReverse(a, b) {
  return a > b ? -1 : a === b ? 0 : 1;
}
