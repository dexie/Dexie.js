import { _global } from '../../functions/utils';
import { DexieDOMDependencies } from '../../public/types/dexie-dom-dependencies';

export let domDeps: DexieDOMDependencies

try {
  domDeps = {
    // Required:
    indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
    IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
  };
} catch (e) {
  domDeps = { indexedDB: null, IDBKeyRange: null };
}
