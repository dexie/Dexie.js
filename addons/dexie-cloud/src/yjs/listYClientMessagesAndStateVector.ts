import type { Table, YSyncState, YUpdateRow } from 'dexie';
import type { YClientMessage } from 'dexie-cloud-common';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { DEXIE_CLOUD_SYNCER_ID } from '../sync/DEXIE_CLOUD_SYNCER_ID';
import { listUpdatesSince } from './listUpdatesSince';
import { $Y } from './Y';
import { EntityCommon } from '../db/entities/EntityCommon';

/** Queries the local database for YMessages to send to server.
 * 
 * There are 2 messages that this function can provide:
 *   YUpdateFromClientRequest ( for local updates )
 *   YStateVector ( for state vector of foreign updates so that server can reduce the number of udpates to send back )
 *
 * Notice that we do not do a step 1 sync phase here to get a state vector from the server. Reason we can avoid
 * the 2-step sync is that we are client-server and not client-client here and we keep track of the client changes
 * sent to server by letting server acknowledge them. There is always a chance that some client update has already
 * been sent and that the client failed to receive the ack. However, if this happens it does not matter - the change
 * would be sent again and Yjs handles duplicate changes anyway. And it's rare so we earn the cost of roundtrips by
 * avoiding the step1 sync and instead keep track of this in the `unsentFrom` property of the SyncState.
 * 
 * @param db 
 * @returns 
 */
export async function listYClientMessagesAndStateVector(
  db: DexieCloudDB,
  tablesToSync: Table<EntityCommon>[]
): Promise<{yMessages: YClientMessage[], lastUpdateIds: {[yTable: string]: number}}> {
  const result: YClientMessage[] = [];
  const lastUpdateIds: {[yTable: string]: number} = {};
  for (const table of tablesToSync) {
    if (table.schema.yProps) {
      for (const yProp of table.schema.yProps) {
        const Y = $Y(db); // This is how we retrieve the user-provided Y library
        const yTable = db.table(yProp.updatesTable); // the updates-table for this combo of table+propName
        const syncState = (await yTable.get(DEXIE_CLOUD_SYNCER_ID)) as
          | YSyncState
          | undefined;

        // unsentFrom = the `i` value of updates that aren't yet sent to server (or at least not acked by the server yet)
        const unsentFrom = syncState?.unsentFrom || 1;
        // receivedUntil = the `i` value of updates that both we and the server knows we already have (we know it by the outcome from last syncWithServer() because server keep track of its revision numbers
        const receivedUntil = syncState?.receivedUntil || 0;
        // Compute the least value of these two (but since receivedUntil is inclusive we need to add +1 to it)
        const unsyncedFrom = Math.min(unsentFrom, receivedUntil + 1);
        // Query all these updates for all docs of this table+prop combination
        const updates = await listUpdatesSince(yTable, unsyncedFrom);
        if (updates.length > 0) lastUpdateIds[yTable.name] = updates[updates.length -1].i;

        // Now sort them by document and whether they are local or not + ignore local updates already sent:
        const perDoc: {
          [docKey: string]: {
            i: number;
            k: any;
            isLocal: boolean;
            u: Uint8Array[];
          };
        } = {};
        for (const update of updates) {
          // Sort updates into buckets of the doc primary key + the flag (whether it's local or foreign)
          const isLocal = ((update.f || 0) & 0x01) === 0x01;
          if (isLocal && update.i < unsentFrom) continue; // This local update has already been sent and acked.
          const docKey = JSON.stringify(update.k) + '/' + isLocal;
          let entry = perDoc[docKey];
          if (!entry) {
            perDoc[docKey] = entry = {
              i: update.i,
              k: update.k,
              isLocal,
              u: [],
            };
            entry.u.push(update.u);
          } else {
            entry.u.push(update.u);
            entry.i = Math.max(update.i, entry.i);
          }
        }

        // Now, go through all these and:
        // * For local updates, compute a merged update per document.
        // * For foreign updates, compute a state vector to pass to server, so that server can
        //   avoid re-sending updates that we already have (they might have been sent of websocket
        //   and when that happens, we do not mark them in any way nor do we update receivedUntil -
        //   we only update receivedUntil after a "full sync" (syncWithServer()))
        for (const { k, isLocal, u, i } of Object.values(perDoc)) {
          const mergedUpdate = u.length === 1 ? u[0] : Y.mergeUpdatesV2(u);
          if (isLocal) {
            result.push({
              type: 'u-c',
              table: table.name,
              prop: yProp.prop,
              k,
              u: mergedUpdate,
              i,
            });
          } else {
            const stateVector = Y.encodeStateVectorFromUpdateV2(mergedUpdate);
            result.push({
              type: 'sv',
              table: table.name,
              prop: yProp.prop,
              k,
              sv: stateVector,
            });
          }
        }
      }
    }
  }
  return {
    yMessages: result,
    lastUpdateIds
  };
}
