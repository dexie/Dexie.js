import Dexie, { DbSchema } from 'dexie';
import { DEXIE_CLOUD_SCHEMA } from './db/DexieCloudDB';
import { generateTablePrefix } from './middleware-helpers/idGenerationHelpers';

export function overrideParseStoresSpec(origFunc: Function, dexie: Dexie) {
  return function(stores: {[tableName: string]: string}, dbSchema: DbSchema) {
    const storesClone = {
      ...DEXIE_CLOUD_SCHEMA,
      ...stores,
    };
    // Merge indexes of DEXIE_CLOUD_SCHEMA with stores
    Object.keys(DEXIE_CLOUD_SCHEMA).forEach((tableName: keyof typeof DEXIE_CLOUD_SCHEMA) => {
      const schemaSrc = storesClone[tableName];
      // Verify that they don't try to delete a table that is needed for access control of Dexie Cloud
      if (schemaSrc == null) {
        // They try to delete one of the built-in schema tables.
        throw new Error(`Cannot delete table ${tableName} as it is needed for access control of Dexie Cloud`);
      }
      // If not trying to override a built-in table, then we can skip this and continue to next table.
      if (!stores[tableName]) {
        // They haven't tried to declare this table. No need to merge indexes.
        return; // Continue
      }

      // They have declared this table. Merge indexes in case they didn't declare all indexes we need.
      const requestedIndexes = schemaSrc.split(',').map(spec => spec.trim());
      const builtInIndexes = DEXIE_CLOUD_SCHEMA[tableName].split(',').map(spec => spec.trim());
      const requestedIndexSet = new Set(requestedIndexes.map(index => index.replace(/([&*]|\+\+)/g, "")));
      // Verify that primary key is unchanged
      if (requestedIndexes[0] !== builtInIndexes[0]) {
        // Primary key must match exactly
        throw new Error(`Cannot override primary key of table ${tableName}. Please declare it as {${
          tableName}: ${
            JSON.stringify(DEXIE_CLOUD_SCHEMA[tableName])
          }`);
      }
      // Merge indexes
      for (let i=1; i<builtInIndexes.length; ++i) {
        const builtInIndex = builtInIndexes[i];
        if (!requestedIndexSet.has(builtInIndex.replace(/([&*]|\+\+)/g, ""))) {
          // Add built-in index if not already requested
          storesClone[tableName] += `,${builtInIndex}`;
        }
      }
    });

    // Populate dexie.cloud.schema
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
    for (const [tableName, spec] of Object.entries(dbSchema)) {
      if (spec.yProps?.length) {
        const cloudTableSchema = cloudSchema[tableName];
        if (cloudTableSchema) {
          cloudTableSchema.yProps = spec.yProps.map((yProp) => yProp.prop);
        }
      }
    }
    return rv;
  }
}
