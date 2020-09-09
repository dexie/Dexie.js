import { deepClone, delByKeyPath, getByKeyPath } from './utils';

export function workaroundForUndefinedPrimKey(keyPath: string | ArrayLike<string>) {
  return function (obj: object) {
    if (getByKeyPath(obj, keyPath) === undefined) {
      obj = deepClone(obj);
      delByKeyPath(obj, keyPath);
    }
    return obj;
  }
}
  