import { exceptions } from '../../../errors';
import { isArray, getByKeyPath } from '../../../functions/utils';
import { Key } from '../L1-dbcore/dbcore';

export function getKeyExtractor (keyPaths: string[]) : (a: any) => Key {
  if (keyPaths.length === 0) {
    return ()=>{throw new exceptions.Internal("Outbound primary keys cannot be extraced from objects")};
  } else if (keyPaths.length === 1) {
    return getSinglePathKeyExtractor(keyPaths[0]);
  } else {
    return obj => getByKeyPath(obj, keyPaths);
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
