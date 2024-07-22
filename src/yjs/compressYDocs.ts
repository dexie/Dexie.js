import { Dexie } from '../public/types/dexie';
import Promise from '../helpers/promise';
import type { Table } from '../public/types/table';
import type { YSyncer, YUpdateRow } from '../public/types/yjs-related';
import { PromiseExtended } from '../public/types/promise-extended';
import { getYLibrary } from './getYLibrary';

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
  );
}

/** Compress an individual Y.Doc table */
function compressYDocsTable(
  db: Dexie,
  { updTable }: { prop: string; updTable: string }
) {
  return db
    .table(updTable)
    .where('i')
    .startsWith('')
    .toArray((syncers) => {
      const unsentFrom = Math.min(
        ...syncers.map((s) => s.unsentFrom || Infinity)
      );
      return db
        .table(updTable)
        .orderBy('k')
        .uniqueKeys((docIdsToCompress) => {
          return docIdsToCompress.reduce((promise, docId) => {
            return promise.then(() =>
              compressYDoc(db, updTable, docId, unsentFrom)
            );
          }, Promise.resolve());
        });
    });
}

/** Compress an individual Y.Doc.
 *
 * Lists all updates for the Y.Doc and replaces them with a single compressed update if there are more than one updates.
 *
 * If there is a Syncer entry in the updates table (an entry where primary key `i` is a string, not a number),
 * then the `unsentFrom` value is used to determine the last update that has not been sent to the server and therefore
 * should not be compressed. Sync addons may store their syncers in the update table and name them in the primary key,
 * with a string value instead of a number, to keep track of which updates have been sent to its server. This is a bit
 * special that we reuse the same table that we have for updates also for syncers, but it's a way to keep track of
 * which updates have been sent to the server without having to create a separate table for that.
 *
 * @param db Dexie instance
 * @param updTable Name of the table where updates are stored
 * @param k The primary key of the related table that holds the virtual Y.Doc property.
 * @param dontCompressFrom Infinity if all updates can be compressed, otherwise id of the first update not to compress.
 * @returns
 */
function compressYDoc(
  db: Dexie,
  updTable: string,
  k: any,
  dontCompressFrom: number
): PromiseExtended<void> {
  const Y = getYLibrary(db);
  return db.transaction('rw', updTable, (tx) => {
    const updTbl = tx.table(updTable);
    return updTbl
      .where('k')
      .equals(k) // Could have been using where('[k+i]').between([k, 0], [k, dontCompressFrom], true, false) but that would not work in older FF browsers.
      .until((s) => s.i >= dontCompressFrom, false) // It's naturally ordered by i, as it is the primary key of updates
      .toArray((updates) => {
        const doc = new Y.Doc({gc: true});
        if (updates.length > 1) {
          // 1. compress updates where i is between these values
          updates.forEach((update) => {
            Y.applyUpdateV2(doc, update.u);
          });
          const compressedUpdate = Y.encodeStateAsUpdateV2(doc);
          // 2. replace the last update with the compressed update
          const lastUpdate = updates[updates.length - 1];
          updTbl.put({
            i: lastUpdate.i,
            k,
            u: compressedUpdate,
            f: 2,
          });
          // 3. delete the compressed updates
          updTbl
            .where('i')
            .between(updates[0].i, lastUpdate.i, true, false)
            .delete();
        }
      });
  });
}
