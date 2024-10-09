import { Observable, merge, mergeMap } from 'rxjs';
import { YClientMessage, YUpdateFromClientRequest } from 'dexie-cloud-common';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { flatten } from '../helpers/flatten';
import { liveQuery } from 'dexie';
import { DEXIE_CLOUD_SYNCER_ID } from '../sync/DEXIE_CLOUD_SYNCER_ID';
import { listUpdatesSince } from './listUpdatesSince';

export function createYClientUpdateObservable(
  db: DexieCloudDB
): Observable<YClientMessage> {
  const yTableRecords = flatten(
    db.tables
      .filter(
        (table) =>
          db.cloud.schema?.[table.name]?.markedForSync && table.schema.yProps
      )
      .map((table) =>
        table.schema.yProps!.map((p) => ({
          table: table.name,
          ydocProp: p.prop,
          updatesTable: p.updatesTable,
        }))
      )
  );
  return merge(
    ...yTableRecords.map(({ table, ydocProp, updatesTable }) => {
      let currentUnsentFrom = 1;
      return liveQuery(async () => {
        const yTbl = db.table(updatesTable);
        const unsentFrom = await yTbl
          .where({ i: DEXIE_CLOUD_SYNCER_ID })
          .first()
          .then((syncer) => syncer?.unsentFrom || 1);
        currentUnsentFrom = Math.max(currentUnsentFrom, unsentFrom);
        const addedUpdates = await listUpdatesSince(yTbl, currentUnsentFrom);
        // Update currentUnsentFrom to only listen for updates that will be newer than the ones we emitted.
        currentUnsentFrom = Math.max(
          currentUnsentFrom,
          ...addedUpdates.map((update) => update.i + 1)
        );
        return addedUpdates
          .filter((update) => update.f && update.f & 1) // Only include local updates
          .map((update) => {
            return {
              type: 'u-c',
              table,
              prop: ydocProp,
              k: update.k,
              u: update.u,
              i: update.i,
            } satisfies YUpdateFromClientRequest;
          });
      });
    })
  ).pipe(
    // Flatten the array of messages.
    // If messageProducer emits empty array, nothing is emitted
    // but if messageProducer emits array of messages, they are
    // emitted one by one.
    mergeMap((messages) => messages)
  ); 
}
