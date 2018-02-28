import { IndexableType } from '../public/types/indexable-type';
import { KeyMap } from './keymap';
import { stringifyKey } from '../functions/stringify-key';
import { _hasOwn, keys } from '../functions/utils';

export interface KeySet {
  add (key: IndexableType): void;
  bulkAdd (keys: IndexableType[]): void;
  bulkAddIntersect (keys: IndexableType[], intersectSet: KeySet);
  delete (key: IndexableType): void;
  has (key: IndexableType): boolean;
  getMap(): {[stringifiedKey: string]: boolean};
}

export function KeySet(): KeySet {
  const map = KeyMap<boolean>();
  const set = map.getMap();
  return {
    add (key: IndexableType) {
      map[stringifyKey(key)] = true;
    },
    bulkAdd (keys: IndexableType[]) {
      for (let i=0,l=keys.length;i<l;++i) {
        set[stringifyKey(keys[i])] = true;
      }
    },
    bulkAddIntersect (keys: IndexableType[], intersectSet: KeySet) {
      const intersectSetRaw = intersectSet.getMap();
      const intersectSetRawHas = _hasOwn.bind(intersectSetRaw);
      for (let i=0,l=keys.length;i<l;++i) {
        const stringifiedKey = stringifyKey(keys[i]);
        if (intersectSetRawHas(stringifiedKey)) {
          set[stringifiedKey] = true;
        }
      }
    },
    delete: map.delete,
    has: map.has,
    getMap: map.getMap
  };
}
