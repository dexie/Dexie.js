import { deepClone, delByKeyPath, getByKeyPath } from './utils';

// This workaround is needed since obj could be a custom-class instance with an
// uninitialized keyPath. See the following comment for more context:
// https://github.com/dfahlander/Dexie.js/issues/1280#issuecomment-823557881
export function workaroundForUndefinedPrimKey(keyPath: string | ArrayLike<string>) {
  return function (obj: object) {
    // Skip this workaround if obj is NOT a custom class instance
    if (
      Object.getPrototypeOf(obj) === Object.prototype ||
      Object.getPrototypeOf(obj) == null
    ) {
      return obj;
    }

    if (getByKeyPath(obj, keyPath) === undefined) {
      obj = deepClone(obj);
      delByKeyPath(obj, keyPath);
    }
    return obj;
  }
}
  