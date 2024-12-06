import { Dexie } from '../public/types/dexie';
import type {
  YLastCompressed,
  YSyncState,
  YUpdateRow,
} from '../public/types/yjs-related';
import { getYLibrary } from './getYLibrary';
import { cmp } from '../functions/cmp';

/** Go through all Y.Doc tables in the entire local db and compress updates
 *
 * @param db Dexie
 * @returns
 */
export function compressYDocs(db: Dexie, interval?: number) {
  let p: Promise<any> = Promise.resolve();
  for (const table of db.tables) {
    for (const yProp of table.schema.yProps || []) {
      p = p.then(() => compressYDocsTable(db, yProp, interval));
    }
  }
  return p;
}

/** Compress an individual Y.Doc table */
function compressYDocsTable(
  db: Dexie,
  { updatesTable }: { prop: string; updatesTable: string },
  skipIfRunnedSince?: number // milliseconds
) {
  const updTbl = db.table(updatesTable);
  return Promise.all([
    // syncers (for example dexie-cloud-addon or other 3rd part syncers) They may have unsentFrom set.
    updTbl
      .where('i')
      .startsWith('') // Syncers have string primary keys while updates have auto-incremented numbers.
      .toArray(),

    // lastCompressed (pointer to the last compressed update)
    db.transaction('rw', updatesTable, () =>
      updTbl.get(0).then((lastCompressed: YLastCompressed | undefined) => {
        if (
          lastCompressed &&
          skipIfRunnedSince &&
          lastCompressed.lastRun.getTime() > Date.now() - skipIfRunnedSince
        ) {
          // Skip it. It has run recently or is still running.
          return null;
        }
        // isRunning might be true but we don't respect it if started before skipIfRunningSince.
        lastCompressed = lastCompressed || { i: 0, lastCompressed: 0 };
        return updTbl
          .put({
            ...lastCompressed,
            lastRun: new Date(),
          })
          .then(() => lastCompressed);
      })
    ),
  ]).then(([syncers, stamp]: [YSyncState[], YLastCompressed]) => {
    if (!stamp) return; // Skip. Already running.
    const lastCompressedUpdate = stamp.lastCompressed;
    const unsyncedFrom = Math.min(
      ...syncers.map((s) =>
        Math.min(
          s.unsentFrom || Infinity,
          s.receivedUntil != null ? s.receivedUntil + 1 : Infinity
        )
      )
    );
    // Per updates-table:
    // 1. Find all updates after lastCompressedId. Run toArray() on them.
    // 2. IF there are any "mine" (flagged) updates AFTER unsentFrom, skip all from including this entry, else include all regardless of unsentFrom.
    // 3. Now we know which keys have updates since last compression. We also know how far we're gonna go (max unsentFrom unless all additional updates are foreign).
    // 4. For every key that had updates, load their main update (this is one single update per key before the lastCompressedId marker)
    // 5. For every key that had updates: Compress main update along with additional updates until and including the number that was computed on step 2 (could be Infinity).
    // 6. Update lastCompressedId to the i of the latest compressed entry.
    return updTbl
      .where('i')
      .between(lastCompressedUpdate, Infinity, false)
      .toArray((addedUpdates: YUpdateRow[]) => {
        if (addedUpdates.length === 0) return; // No more updates where added
        const docsToCompress: { docId: any; updates: YUpdateRow[] }[] = [];
        let lastUpdateToCompress = lastCompressedUpdate;
        for (let j = 0; j < addedUpdates.length; ++j) {
          const updateRow = addedUpdates[j];
          const { i, f, k } = updateRow;
          if (i >= unsyncedFrom && f & 0x01) break; // An update that need to be synced was found. Stop here and let dontCompressFrom stay.
          const entry = docsToCompress.find(
            (entry) => cmp(entry.docId, k) === 0
          );
          if (entry) entry.updates.push(updateRow);
          else docsToCompress.push({ docId: k, updates: [updateRow] });
          lastUpdateToCompress = i;
        }
        if (lastUpdateToCompress === lastCompressedUpdate) return; // No updates to compress
        let p = Promise.resolve();
        for (const { docId, updates } of docsToCompress) {
          p = p.then(() =>
            compressUpdatesForDoc(db, updatesTable, docId, updates)
          );
        }
        return p.then(() => {
          // Update lastCompressed atomically to the value we computed.
          // Do it with respect to the case when another job was done in parallel
          // that maybe compressed one or more extra updates and updated lastCompressed
          // before us.
          return db.transaction('rw', updTbl, () =>
            updTbl.get(0).then((current: YLastCompressed) => {
              if (current && lastUpdateToCompress <= current.lastCompressed) {
                // No need to update. Nothing was done, or another job did more.
                return;
              }
              return updTbl.put({
                ...current,
                lastCompressed: lastUpdateToCompress,
              });
            })
          );
        });
      });
  });
}

export function compressUpdatesForDoc(
  db: Dexie,
  updatesTable: string,
  parentId: any,
  addedUpdatesToCompress: YUpdateRow[]
) {
  if (addedUpdatesToCompress.length < 1) throw new Error('Invalid input');
  return db.transaction('rw', updatesTable, (tx) => {
    const updTbl = tx.table(updatesTable);
    return updTbl.where({ k: parentId }).first((mainUpdate: YUpdateRow) => {
      const updates = [mainUpdate].concat(
        addedUpdatesToCompress.filter((u) => u.i !== mainUpdate.i)
      ); // avoid duplicating the main update (can happen sometimes)
      const Y = getYLibrary(db);
      const doc = new Y.Doc({ gc: true });
      //Y.transact(doc, ()=>{
      updates.forEach((update) => {
        //if (cmp(update.k, docRowId) !== 0) {
        //  throw new Error('Invalid update');
        //}
        Y.applyUpdateV2(doc, update.u);
      });
      //}, "compressYDocs"); // Don't think anyone could be listening to this local doc.
      const compressedUpdate = Y.encodeStateAsUpdateV2(doc);
      const lastUpdate = updates.pop();
      return updTbl
        .put({
          i: lastUpdate.i,
          k: parentId,
          u: compressedUpdate,
        })
        .then(() => updTbl.bulkDelete(updates.map((update) => update.i)));
    });
  });
}
