const concat = [].concat;
export function flatten<T>(a: (T | T[])[]): T[] {
  return concat.apply([], a);
}
