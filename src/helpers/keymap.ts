import { IndexableType } from '../public/types/indexable-type';
import { stringifyKey } from '../functions/stringify-key';
import { hasOwn, _hasOwn, keys } from '../functions/utils';

export interface KeyMap<T=any> {
  set (key: IndexableType, value: T): void;
  delete (key: IndexableType): void;
  has (key: IndexableType): boolean;
  get (key: IndexableType): T;
  values (): T[];
  getMap(): {[stringifiedKey: string]: T};
}

export function KeyMap<T> (): KeyMap<T> {
  const map: {[stringifiedKey: string]: any} = {};
  const mapHasOwn = _hasOwn.bind(map);
  return {
    set (key: IndexableType, value) {
      map[stringifyKey(key)] = value;
    },
    delete (key: IndexableType) {
      delete map[stringifyKey(key)];
    },
    has (key: IndexableType) {
      return mapHasOwn(stringifyKey(key));
    },
    get (key: IndexableType) {
      const stringifiedKey = stringifyKey(key);
      return mapHasOwn(stringifiedKey) && map[stringifiedKey];
    },
    values () {
      return keys(map).map(key => map[key]);
    },
    getMap() {
      return map;
    }
  }
}

