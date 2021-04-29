const { toString } = {};
export function toStringTag(o: Object) {
  return toString.call(o).slice(8, -1);
}
