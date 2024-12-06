import { Observable, from, merge, mergeMap, switchMap, tap } from 'rxjs';
import { YClientMessage, YUpdateFromClientRequest } from 'dexie-cloud-common';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { flatten } from '../helpers/flatten';
import { liveQuery } from 'dexie';
import { DEXIE_CLOUD_SYNCER_ID } from '../sync/DEXIE_CLOUD_SYNCER_ID';
import { listUpdatesSince } from './listUpdatesSince';
import { YDexieCloudSyncState } from './YDexieCloudSyncState';

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
      // Per updates table (table+prop combo), we first read syncer.unsentFrom,
      // and then start listening for updates since that number.
      const yTbl = db.table(updatesTable);
      return from(yTbl.get(DEXIE_CLOUD_SYNCER_ID)).pipe(
        switchMap((syncer: YDexieCloudSyncState) => {
          let currentUnsentFrom = syncer?.unsentFrom || 1;
          return from(
            liveQuery(async () => {
              const addedUpdates = await listUpdatesSince(
                yTbl,
                currentUnsentFrom
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
            })
          ).pipe(
            tap((addedUpdates) => {
              // Update currentUnsentFrom to only listen for updates that will be newer than the ones we emitted.
              // (Before, we did this within the liveQuery, but that caused a bug because
              // a cancelled emittion of a liveQuery would update the currentUnsentFrom without
              // emitting anything, leading to that we jumped over some updates. Here we update it
              // after the liveQuery has emitted its updates)
              if (addedUpdates.length > 0) {
                currentUnsentFrom = addedUpdates.at(-1)!.i + 1;
              }
            })
          );
        })
      );
    })
  ).pipe(
    // Flatten the array of messages.
    // If messageProducer emits empty array, nothing is emitted
    // but if messageProducer emits array of messages, they are
    // emitted one by one.
    mergeMap((messages) => messages)
  );
}
