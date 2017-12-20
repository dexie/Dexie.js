import { IndexSpec } from '../public/types/index-spec';
import { IDBKeyPath } from '../public/types/indexeddb';

export function createIndexSpec(
  name: string,
  keyPath?: IDBKeyPath,
  unique?: boolean,
  multi?: boolean,
  auto?: boolean,
  compound?: boolean,
  dotted?: boolean
): IndexSpec {
  return {
    name,
    keyPath,
    unique,
    multi,
    auto,
    compound,
    src: (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + nameFromKeyPath(keyPath)
  }
}

export function nameFromKeyPath (keyPath: IDBKeyPath): string {
  return typeof keyPath === 'string' ?
    keyPath :
    keyPath && ('[' + [].join.call(keyPath, '+') + ']');
}
