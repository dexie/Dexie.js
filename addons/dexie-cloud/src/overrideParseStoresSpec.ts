import { DbSchema } from 'dexie';
import { DexieCloudOptions } from './DexieCloudOptions';
import { DexieCloudSchema } from './DexieCloudSchema';

export function overrideParseStoresSpec(origFunc: Function, cloudOptions: DexieCloudOptions, cloudSchema: DexieCloudSchema) {
  return function(stores: {[tableName: string]: string}, dbSchema: DbSchema) {
    const storesClone = {
      ...stores,
      $jobs: '',
      $logins: 'claims.sub, lastLogin',
      $syncState: 'id'
      // $pendingChangesFromServer: '++' // Wait a while with this. The thought is: if server has loads of changes, we might want to add them all at once in single transaction.
    };
    Object.keys(stores).forEach(tableName => {
      const schemaSrc = stores[tableName];
      if (schemaSrc != null) {
        const cloudTableSchema = cloudSchema[tableName] || (cloudSchema[tableName] = {});
        if (cloudSchema)
        if (/^\@/.test(schemaSrc)) {
          storesClone[tableName] = stores[tableName].substr(1);
          cloudTableSchema.generatedGlobalId = true;
        }
        if (!/^\$/.test(tableName)) {
          cloudTableSchema.sync = true;
          storesClone[`$${tableName}_mutations`] = '++rev';
        }
        if (cloudOptions.nonSyncedTables?.includes(tableName)) {
          cloudTableSchema.sync = false;
        }
      } else {
        delete cloudSchema[tableName];
      }
    });
    const rv = origFunc.call(this, storesClone, dbSchema);
    return rv;
  }
}
