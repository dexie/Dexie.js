import { IndexableType } from '../public/types/indexable-type';
import { stringifyKey } from '../functions/stringify-key';
import { hasOwn } from '../functions/utils';

export interface KeyMap<T=any> {
  set (key: IndexableType, value: T): this;
  has (key: IndexableType): boolean;
  get (key: IndexableType): T;
  getMap(): {[stringifiedKey: string]: T};
}

export function KeyMap (): KeyMap {
  const map: {[stringifiedKey: string]: any} = {};
  return {
    set (key: IndexableType, value) {
      map[stringifyKey(key)] = value;
      return this;
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

