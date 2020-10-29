import { DbSchema } from 'dexie';
import { DexieCloudSchema } from './DexieCloudSchema';

export function overrideParseStoresSpec(origFunc: Function, cloudSchema: DexieCloudSchema) {
  return function(stores: {[tableName: string]: string}, dbSchema: DbSchema) {
    const storesClone = {
      ...stores,
      _cloud: 'id'
    };
    Object.keys(stores).forEach(tableName => {
      if (/^\@/.test(stores[tableName])) {
        storesClone[tableName] = stores[tableName].substr(1);
        cloudSchema[tableName] = {generatedGlobalId: true};
      }
    });
    return origFunc.call(this, storesClone, dbSchema);
  }
}
