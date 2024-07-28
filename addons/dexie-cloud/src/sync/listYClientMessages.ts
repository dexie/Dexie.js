import { DexieYProvider, Table, YSyncer, YUpdateRow } from 'dexie';
import { getTableFromMutationTable } from '../helpers/getTableFromMutationTable';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { DBOperation, DBOperationsSet } from 'dexie-cloud-common';
import { flatten } from '../helpers/flatten';
import { YClientMessage } from 'dexie-cloud-common/src/YMessage';
import { DEXIE_CLOUD_SYNCER_ID } from './DEXIE_CLOUD_SYNCER_ID';

export async function listYClientMessages(
  db: DexieCloudDB
): Promise<YClientMessage[]> {
  const result: YClientMessage[] = [];
  for (const table of db.tables) {
    for (const yProp of table.schema.yProps || []) {
      const yTable = db.table(yProp.updTable);
      const syncer = (await yTable.get(DEXIE_CLOUD_SYNCER_ID)) as YSyncer | undefined;
      const unsentFrom = syncer?.unsentFrom || 0;
      const updates = await yTable
        .where('i')
        .aboveOrEqual(unsentFrom)
        .toArray();
      result.push(
        ...updates
          .filter((update) => update.f & 0x01) // Don't send back updates that we got from server or other clients.
          .map(({ i, k, u }: YUpdateRow) => {
            return {
              type: 'u-c',
              utbl: yProp.updTable,
              i,
              k,
              u,
            } satisfies YClientMessage;
          })
      );
    }
  }
  return result;
}
