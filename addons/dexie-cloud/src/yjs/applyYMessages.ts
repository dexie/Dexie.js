import { cmp, DexieYProvider, InsertType, YSyncState, YUpdateRow } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { YServerMessage } from 'dexie-cloud-common';
import { DEXIE_CLOUD_SYNCER_ID } from '../sync/DEXIE_CLOUD_SYNCER_ID';
import { getUpdatesTable } from './getUpdatesTable';

export async function applyYServerMessages(
  yMessages: YServerMessage[],
  db: DexieCloudDB
): Promise<{
  receivedUntils: { [yTable: string]: number };
  resyncNeeded: boolean;
  yServerRevision?: string;
}> {
  const receivedUntils: { [yTable: string]: number } = {};
  let resyncNeeded = false;
  let yServerRevision: string | undefined;
  for (const m of yMessages) {
    try {
      switch (m.type) {
        case 'u-s': {
          const utbl = getUpdatesTable(db, m.table, m.prop);
          if (utbl) {
            const updateRow: InsertType<YUpdateRow, 'i'> = {
              k: m.k,
              u: m.u,
            };
            if (m.r) {
              // @ts-ignore
              updateRow.r = m.r;
              yServerRevision = m.r;
            }
            receivedUntils[utbl.name] = await utbl.add(updateRow);
          }
          break;
        }
        case 'u-ack': {
          const utbl = getUpdatesTable(db, m.table, m.prop);
          if (utbl) {
            await db.transaction('rw', utbl, async (tx) => {
              let syncer = (await tx
                .table(utbl.name)
                .get(DEXIE_CLOUD_SYNCER_ID)) as YSyncState | undefined;
              await tx.table(utbl.name).put({
                ...(syncer || { i: DEXIE_CLOUD_SYNCER_ID }),
                unsentFrom: Math.max(syncer?.unsentFrom || 1, m.i + 1),
              } as YSyncState);
            });
          }
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
          if (!utbl) break;
          // Delete the rejected update and all local updates since (avoid holes in the CRDT)
          // and destroy it's open document if there is one.
          const primaryKey = (await utbl.get(m.i))?.k;
          if (primaryKey != null) {
            await db.transaction('rw', utbl, (tx) => {
              // @ts-ignore
              tx.idbtrans._rejecting_y_ypdate = true; // Inform ydoc triggers that we delete because of a rejection and not GC
              return utbl
                .where('i')
                .aboveOrEqual(m.i)
                .filter(
                  (u) => cmp(u.k, primaryKey) === 0 && ((u.f || 0) & 1) === 1
                )
                .delete();
            });
            // Destroy active doc
            const activeDoc = DexieYProvider.getDocCache(db.dx).find(
              m.table,
              primaryKey,
              m.prop
            );
            if (activeDoc) activeDoc.destroy(); // Destroy the document so that editors don't continue to work on it
          }
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
        case 'y-complete-sync-done': {
          yServerRevision = m.yServerRev;
          break;
        }
        case 'outdated-server-rev':
          resyncNeeded = true;
          break;
      }
    } catch (e) {
      console.error(`Failed to apply YMessage`, m, e);
    }
  }

  return {
    receivedUntils,
    resyncNeeded,
    yServerRevision,
  };
}
