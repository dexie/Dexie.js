import { IndexableType } from '../public/types/indexable-type';
import { stringifyKey } from '../functions/stringify-key';
import { hasOwn } from '../functions/utils';

export function KeyMap () {
  const map: {[stringifiedKey: string]: any} = {};
  return {
    set (key: IndexableType, value) {
      map[stringifyKey(key)] = value;
    },
    has (key: IndexableType) {
      return hasOwn(map, stringifyKey(key));
    },
    get (key: IndexableType) {
      return map[stringifyKey(key)];
    },
    getMap() {
      return map;
    }
  }
}
