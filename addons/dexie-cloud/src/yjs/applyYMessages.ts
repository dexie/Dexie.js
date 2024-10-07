import { DexieYProvider, InsertType, YSyncState, YUpdateRow } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { YServerMessage } from 'dexie-cloud-common';
import { DEXIE_CLOUD_SYNCER_ID } from '../sync/DEXIE_CLOUD_SYNCER_ID';
import { getUpdatesTable } from './getUpdatesTable';

export async function applyYServerMessages(
  yMessages: YServerMessage[],
  db: DexieCloudDB
): Promise<{ [yTable: string]: number }> {
  const result: { [yTable: string]: number } = {};
  for (const m of yMessages) {
    switch (m.type) {
      case 'u-s': {
        const utbl = getUpdatesTable(db, m.table, m.prop);
        result[utbl.name] = await utbl.add({
          k: m.k,
          u: m.u,
        } satisfies InsertType<YUpdateRow, 'i'>);
        break;
      }
      case 'u-ack': {
        const utbl = getUpdatesTable(db, m.table, m.prop);
        await db.transaction('rw', utbl, async (tx) => {
          let syncer = (await tx
            .table(utbl.name)
            .get(DEXIE_CLOUD_SYNCER_ID)) as YSyncState | undefined;
          await tx.table(utbl.name).put({
            ...(syncer || { i: DEXIE_CLOUD_SYNCER_ID }),
            unsentFrom: Math.max(syncer?.unsentFrom || 1, m.i + 1),
          } as YSyncState);
        });
        break;
      }
      case 'u-reject': {
        // Acces control or constraint rejected the update.
        // We delete it. It's not going to be sent again.
        // What's missing is a way to notify consumers, such as Tiptap editor, that the update was rejected.
        // This is only an issue when the document is open. We could find the open document and
        // in a perfect world, we should send a reverse update to the open document to undo the change.
        // See my question in https://discuss.yjs.dev/t/generate-an-inverse-update/2765
        console.debug(`Y update rejected. Deleting it.`);
        const utbl = getUpdatesTable(db, m.table, m.prop);
        await utbl.delete(m.i);
        break;
      }
      case 'in-sync': {
        const doc = DexieYProvider.getDocCache(db.dx).find(
          m.table,
          m.k,
          m.prop
        );
        if (doc && !doc.isSynced) {
          doc.emit('sync', [true]);
        }
        break;
      }
    }
  }
  return result;
}
