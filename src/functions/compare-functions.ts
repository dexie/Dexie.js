export function cmp(key1, key2) {
  return indexedDB.cmp(key1, key2);
}

export function min(a, b) {
  return cmp(a, b) < 0 ? a : b;
}

export function max(a, b) {
  return cmp(a, b) > 0 ? a : b;
}

export function ascending(a,b) {
  return indexedDB.cmp(a,b);
}

export function descending(a, b) {
  return indexedDB.cmp(b,a);
}

export function simpleCompare(a, b) {
  return a < b ? -1 : a === b ? 0 : 1;
}

export function simpleCompareReverse(a, b) {
  return a > b ? -1 : a === b ? 0 : 1;
}
