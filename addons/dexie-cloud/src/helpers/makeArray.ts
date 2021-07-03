
export function makeArray<T>(iterable: Iterable<T>): T[] {
  return [].slice.call(iterable);
}
