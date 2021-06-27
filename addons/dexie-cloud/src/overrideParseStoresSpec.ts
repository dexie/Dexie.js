import Dexie, { DbSchema } from 'dexie';
import { DEXIE_CLOUD_SCHEMA } from './db/DexieCloudDB';
import { generateTablePrefix } from './middlewares/createIdGenerationMiddleware';

export function overrideParseStoresSpec(origFunc: Function, dexie: Dexie) {
  return function(stores: {[tableName: string]: string}, dbSchema: DbSchema) {
    const storesClone = {
      ...DEXIE_CLOUD_SCHEMA,
      ...stores,
    };
    const cloudSchema = dexie.cloud.schema || (dexie.cloud.schema = {});
    const allPrefixes = new Set<string>();
    Object.keys(storesClone).forEach(tableName => {
      const schemaSrc = storesClone[tableName];
      const cloudTableSchema = cloudSchema[tableName] || (cloudSchema[tableName] = {});
      if (schemaSrc != null) {
        if (/^\@/.test(schemaSrc)) {
          storesClone[tableName] = storesClone[tableName].substr(1);
          cloudTableSchema.generatedGlobalId = true;
          cloudTableSchema.idPrefix = generateTablePrefix(tableName, allPrefixes);
          allPrefixes.add(cloudTableSchema.idPrefix);
        }
        if (!/^\$/.test(tableName)) {
          storesClone[`$${tableName}_mutations`] = '++rev';
          cloudTableSchema.markedForSync = true;
        }
        if (cloudTableSchema.deleted) {
          cloudTableSchema.deleted = false;
        }
      } else {
        cloudTableSchema.deleted = true;
        cloudTableSchema.markedForSync = false;
        storesClone[`$${tableName}_mutations`] = null;
      }
    });
    const rv = origFunc.call(this, storesClone, dbSchema);
    return rv;
  }
}
