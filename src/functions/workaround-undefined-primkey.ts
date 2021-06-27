import { deepClone, delByKeyPath, getByKeyPath } from './utils';

// This workaround is needed since obj could be a custom-class instance with an
// uninitialized keyPath. See the following comment for more context:
// https://github.com/dfahlander/Dexie.js/issues/1280#issuecomment-823557881
export function workaroundForUndefinedPrimKey(keyPath: string | ArrayLike<string>) {
  // Workaround only needed for plain non-dotted keyPaths
  return typeof keyPath === "string" && !/\./.test(keyPath) 
  ? (obj: object) => {
    if (obj[keyPath] === undefined && (keyPath in obj)) {
      // property exists but is undefined. This will not be liked by Indexeddb.
      // Need to remove the property before adding it but we need to clone it before
      // doing that to not be intrusive.
      obj = deepClone(obj);
      delete obj[keyPath];
    }
    return obj;
  }
  : (obj: object) => obj;
}