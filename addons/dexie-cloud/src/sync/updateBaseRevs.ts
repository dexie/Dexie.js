import { DexieCloudDB } from '../db/DexieCloudDB';
import { DexieCloudSchema, SyncResponse } from 'dexie-cloud-common';

export async function updateBaseRevs(db: DexieCloudDB, schema: DexieCloudSchema, latestRevisions: { [table: string]: number; }, serverRev: any) {
  await db.$baseRevs.bulkPut(
    Object.keys(schema)
      .filter((table) => schema[table].markedForSync)
      .map((tableName) => {
        const lastClientRevOnPreviousServerRev = latestRevisions[tableName] || 0;
        return {
          tableName,
          clientRev: lastClientRevOnPreviousServerRev + 1,
          serverRev,
        };
      })
  );
  // Clean up baseRevs for tables that do not exist anymore or are no longer marked for sync
  // Resolve #2168 by also cleaning up baseRevs for tables that are not marked for sync
  await db.$baseRevs.where('tableName').noneOf(
    Object.keys(schema).filter((table) => schema[table].markedForSync)
  ).delete();
}
