import { DexieCloudSchema } from 'dexie-cloud-common';

/**
 * Merge the schema declared by this client with its previously persisted
 * cloud schema. A table missing from the persisted schema has never been
 * downloaded by this client and must therefore be full-loaded by the server.
 */
export function mergePersistedSchema(
  schema: DexieCloudSchema,
  persistedSchema: DexieCloudSchema | undefined
): DexieCloudSchema {
  const mergedSchema = persistedSchema || {};
  for (const [table, declaredTableSchema] of Object.entries(schema)) {
    const persistedTableSchema = mergedSchema[table];
    if (!persistedTableSchema) {
      mergedSchema[table] = {
        ...declaredTableSchema,
        initiallySynced: false,
      };
    } else {
      persistedTableSchema.markedForSync = declaredTableSchema.markedForSync;
      declaredTableSchema.deleted = persistedTableSchema.deleted;
      persistedTableSchema.generatedGlobalId =
        declaredTableSchema.generatedGlobalId;
    }
  }
  return mergedSchema;
}

/**
 * Apply the server schema without losing a pending initial-table download.
 * Older servers do not acknowledge `initiallySynced`, so only an explicit
 * `true` may clear a locally persisted `false` marker.
 */
export function applyServerSchema(
  schema: DexieCloudSchema,
  serverSchema: DexieCloudSchema
): void {
  for (const table of Object.keys(schema)) {
    const serverTableSchema = serverSchema[table];
    if (!serverTableSchema) continue;
    const initiallySynced =
      serverTableSchema.initiallySynced === true
        ? true
        : schema[table].initiallySynced;
    schema[table] = { ...serverTableSchema, initiallySynced };
  }
}
