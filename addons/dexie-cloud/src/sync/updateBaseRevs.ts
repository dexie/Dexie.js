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
}
