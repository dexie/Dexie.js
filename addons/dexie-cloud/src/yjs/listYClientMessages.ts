import { YSyncer, YUpdateRow } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { YClientMessage } from 'dexie-cloud-common/src/YMessage';
import { DEXIE_CLOUD_SYNCER_ID } from '../sync/DEXIE_CLOUD_SYNCER_ID';
import { listUpdatesSince } from './listUpdatesSince';

export async function listYClientMessages(
  db: DexieCloudDB
): Promise<YClientMessage[]> {
  const result: YClientMessage[] = [];
  for (const table of db.tables) {
    if (table.schema.yProps && db.cloud.schema?.[table.name].markedForSync) {
      for (const yProp of table.schema.yProps) {
        const yTable = db.table(yProp.updatesTable);
        const syncer = (await yTable.get(DEXIE_CLOUD_SYNCER_ID)) as YSyncer | undefined;
        const unsentFrom = syncer?.unsentFrom || 1;
        const updates = await listUpdatesSince(yTable, unsentFrom);
        result.push(
          ...updates
            .filter((update) => (update.f || 0) & 0x01) // Only locla updates. Don't send back updates that we got from server or other clients.
            .map(({ i, k, u }: YUpdateRow) => {
              return {
                type: 'u-c',
                table: table.name,
                prop: yProp.prop,
                k,
                u,
                i,
              } satisfies YClientMessage;
            })
        );
      }
    }
  }
  return result;
}
