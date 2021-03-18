import { DbSchema } from 'dexie';
import { DexieCloudSchema } from './DexieCloudSchema';

export function overrideParseStoresSpec(origFunc: Function, cloudSchema: DexieCloudSchema) {
  return function(stores: {[tableName: string]: string}, dbSchema: DbSchema) {
    const storesClone = {
      ...stores,
      $jobs: '',
      $logins: 'claims.sub, lastLogin',
      $syncState: 'id'
      // $pendingChangesFromServer: '++' // Wait a while with this. The thought is: if server has loads of changes, we might want to add them all at once in single transaction.
    };
    Object.keys(stores).forEach(tableName => {
      if (/^\@/.test(stores[tableName])) {
        storesClone[tableName] = stores[tableName].substr(1);
        cloudSchema[tableName] = {generatedGlobalId: true};
      }
      if (!/^\$/.test(tableName)) {
        storesClone[`$${tableName}_mutations`] = '++rev';
      }
    });
    return origFunc.call(this, storesClone, dbSchema);
  }
}
