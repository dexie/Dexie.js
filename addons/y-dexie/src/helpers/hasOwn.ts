const _hasOwn = {}.hasOwnProperty;
export const hasOwn = (obj: object, prop: PropertyKey): boolean => {
  return _hasOwn.call(obj, prop);
};
