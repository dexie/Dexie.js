import { Dexie } from '../public/types/dexie';
//import Promise from '../helpers/promise';
import type { Table } from '../public/types/table';
import type {
  YLastCompressed,
  YSyncer,
  YUpdateRow,
} from '../public/types/yjs-related';
import { PromiseExtended } from '../public/types/promise-extended';
import { getYLibrary } from './getYLibrary';
import { RangeSet, getRangeSetIterator } from '../helpers/rangeset';
import { cmp } from '../functions/cmp';

/** Go through all Y.Doc tables in the entire local db and compress updates
 *
 * @param db Dexie
 * @returns
 */
export function compressYDocs(db: Dexie) {
  return db.tables.reduce(
    (promise, table) =>
      promise.then(() =>
        table.schema.yProps?.reduce(
          (prom2, yProp) => prom2.then(() => compressYDocsTable(db, yProp)),
          Promise.resolve()
        )
      ),
    Promise.resolve()
  ) as PromiseExtended<void>;
}

/** Compress an individual Y.Doc table */
function compressYDocsTable(
  db: Dexie,
  { updTable }: { prop: string; updTable: string }
) {
  const updTbl = db.table(updTable);
  return Promise.all([
    // syncers (for example dexie-cloud-addon or other 3rd part syncers) They may have unsentFrom set.
    updTbl
      .where('i')
      .startsWith('') // Syncers have string primary keys while updates have auto-incremented numbers.
      .toArray(),
    // lastCompressed (pointer to the last compressed update)
    updTbl.get(0),
  ]).then(([syncers, lastCompressed]: [YSyncer[], YLastCompressed]) => {
    const unsentFrom = Math.min(
      ...syncers.map((s) => s.unsentFrom || Infinity)
    );
    const compressedUntil = lastCompressed?.compressedUntil || 0;
    // Per updates-table:
    // 1. Find all updates after lastCompressedId. Run toArray() on them.
    // 2. IF there are any "mine" (flagged) updates AFTER unsentFrom, skip all from including this entry, else include all regardless of unsentFrom.
    // 3. Now we know which keys have updates since last compression. We also know how far we're gonna go (max unsentFrom unless all additional updates are foreign).
    // 4. For every key that had updates, load their main update (this is one single update per key before the lastCompressedId marker)
    // 5. For every key that had updates: Compress main update along with additional updates until and including the number that was computed on step 2 (could be Infinity).
    // 6. Update lastCompressedId to the i of the latest compressed entry.
    return updTbl
      .where('i')
      .between(compressedUntil, Infinity, false, false)
      .toArray()
      .then((addedUpdates: YUpdateRow[]) => {
        if (addedUpdates.length <= 1) return; // For sure no updates to compress if there would be only 1.
        const docIdsToCompress = new RangeSet();
        let lastUpdateToCompress = compressedUntil + 1;
        for (let j = 0; j < addedUpdates.length; ++j) {
          const { i, f, k } = addedUpdates[j];
          if (i >= unsentFrom) if (f) break; // An update that need to be synced was found. Stop here and let dontCompressFrom stay.
          docIdsToCompress.addKey(k);
          lastUpdateToCompress = i;
        }
        let promise = Promise.resolve();
        let iter = getRangeSetIterator(docIdsToCompress);
        for (
          let keyIterRes = iter.next();
          !keyIterRes.done;
          keyIterRes = iter.next()
        ) {
          const key = keyIterRes.value.from; // or keyIterRes.to - they are same.
          const addedUpdatesForDoc = addedUpdates.filter(
            (update) => cmp(update.k, key) === 0
          );
          if (addedUpdatesForDoc.length > 0) {
            promise = promise.then(() =>
              compressUpdatesForDoc(db, updTable, key, addedUpdatesForDoc)
            );
          }
        }
        return promise.then(() => {
          // Update lastCompressed atomically to the value we computed.
          // Do it with respect to the case when another job was done in parallel
          // that maybe compressed one or more extra updates and updated lastCompressed
          // before us.
          return db.transaction('rw', updTbl, () =>
            updTbl.get(0).then(
              (current) =>
                lastUpdateToCompress > current.compressedUntil &&
                updTbl.put({
                  i: 0,
                  compressedUntil: lastUpdateToCompress,
                })
            )
          );
        });
      });
  });
}

export function compressUpdatesForDoc(
  db: Dexie,
  updTable: string,
  docRowId: any,
  addedUpdatesToCompress: YUpdateRow[]
) {
  if (addedUpdatesToCompress.length < 1) throw new Error('Invalid input');
  return db.transaction('rw', updTable, (tx) => {
    const updTbl = tx.table(updTable);
    return updTbl.where({ k: docRowId }).first((mainUpdate: YUpdateRow) => {
      const updates = [mainUpdate].concat(addedUpdatesToCompress); // in some situations, mainUpdate will be included twice here. But Y.js doesn't care!
      const Y = getYLibrary(db);
      const doc = new Y.Doc({ gc: true });
      updates.forEach((update) => {
        if (cmp(update.k, docRowId) !== 0) {
          throw new Error('Invalid update');
        }
        Y.applyUpdateV2(doc, update.u);
      });
      const compressedUpdate = Y.encodeStateAsUpdateV2(doc);
      const lastUpdate = updates.pop();
      return updTbl
        .put({
          i: lastUpdate.i,
          k: docRowId,
          u: compressedUpdate
        })
        .then(() => updTbl.bulkDelete(updates.map((update) => update.i)));
    });
  });
}
