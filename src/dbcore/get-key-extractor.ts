import { getByKeyPath } from '../functions/utils';

export function getKeyExtractor (keyPath: null | string | string[]) : (a: any) => any {
  if (keyPath == null) {
    return () => undefined;
  } else if (typeof keyPath === 'string') {
    return getSinglePathKeyExtractor(keyPath);
  } else {
    return obj => getByKeyPath(obj, keyPath);
  }
}

export function getSinglePathKeyExtractor(keyPath: string) {
  const split = keyPath.split('.');
  if (split.length === 1) {
    return obj => obj[keyPath];
  } else {
    return obj => getByKeyPath(obj, keyPath);
  }
}
