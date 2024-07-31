import { InsertType, YSyncer, YUpdateRow } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { YServerMessage, YUpdateFromClientAck } from 'dexie-cloud-common/src/YMessage';
import { DEXIE_CLOUD_SYNCER_ID } from '../sync/DEXIE_CLOUD_SYNCER_ID';

export async function applyYServerMessages(
  yMessages: YServerMessage[],
  db: DexieCloudDB
): Promise<void> {
  for (const m of yMessages) {
    switch (m.type) {
      case 'u-s': {
        const utbl = getUpdatesTable(db, m.table, m.prop);
        await db.table(utbl).add({
          k: m.k,
          u: m.u,
        } satisfies InsertType<YUpdateRow, 'i'>);
        break;
      }
      case 'u-ack': {
        const utbl = getUpdatesTable(db, m.table, m.prop);
        await db.transaction('rw', utbl, async (tx) => {          
          let syncer = (await tx.table(utbl).get(DEXIE_CLOUD_SYNCER_ID)) as
            | YSyncer
            | undefined;
          await tx.table(utbl).put(DEXIE_CLOUD_SYNCER_ID, {
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
        const utbl = getUpdatesTable(db, m.table, m.prop);
        await db.table(utbl).delete(m.i);
        break;
      }
    }
  }
}
function getUpdatesTable(db: DexieCloudDB, table: string, ydocProp: string) {
  const utbl = db.table(table)?.schema.yProps?.find(p => p.prop === ydocProp)?.updatesTable;
  if (!utbl) throw new Error(`No updatesTable found for ${table}.${ydocProp}`);
  return utbl;
}

