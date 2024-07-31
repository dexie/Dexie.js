import { InsertType, YSyncer, YUpdateRow } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { YServerMessage } from 'dexie-cloud-common/src/YMessage';
import { DEXIE_CLOUD_SYNCER_ID } from '../sync/DEXIE_CLOUD_SYNCER_ID';

export async function applyYServerMessages(
  yMessages: YServerMessage[],
  db: DexieCloudDB
): Promise<void> {
  for (const m of yMessages) {
    switch (m.type) {
      case 'u-s': {
        await db.table(m.utbl).add({
          k: m.k,
          u: m.u,
        } satisfies InsertType<YUpdateRow, 'i'>);
        break;
      }
      case 'u-ack': {
        await db.transaction('rw', m.utbl, async (tx) => {
          let syncer = (await tx.table(m.utbl).get(DEXIE_CLOUD_SYNCER_ID)) as
            | YSyncer
            | undefined;
          await tx.table(m.utbl).put(DEXIE_CLOUD_SYNCER_ID, {
            ...(syncer || { i: DEXIE_CLOUD_SYNCER_ID }),
            unsentFrom: Math.max(syncer?.unsentFrom || 1, m.i + 1),
          } as YSyncer);
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
        await db.table(m.utbl).delete(m.i);
        break;
      }
    }
  }
}
