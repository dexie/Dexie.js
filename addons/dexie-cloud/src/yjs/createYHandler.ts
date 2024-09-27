import {
  DexieYProvider,
  DexieYDocMeta,
  YUpdateRow,
  liveQuery,
  cmp,
} from 'dexie';
import type { DexieCloudDB } from '../db/DexieCloudDB';
import { getAwarenessLibrary, awarenessWeakMap } from './awareness';
import { DEXIE_CLOUD_SYNCER_ID } from '../sync/DEXIE_CLOUD_SYNCER_ID';
import { $Y } from './Y';
import { filter, firstValueFrom } from 'rxjs';
import { YDocumentOpen } from 'dexie-cloud-common';
import { DXCWebSocketStatus } from '../DXCWebSocketStatus';

type YDoc = import('yjs').Doc;

export function createYHandler(db: DexieCloudDB) {
  const awap = getAwarenessLibrary(db);
  return (provider: DexieYProvider<YDoc>) => {
    const doc = provider.doc;
    const { parentTable, parentId, parentProp, updatesTable } =
      doc.meta as DexieYDocMeta;
    if (!db.cloud.schema?.[parentTable].markedForSync) {
      return; // The table that holds the doc is not marked for sync - leave it to dexie. No syncing, no awareness.
    }
    let awareness = new awap.Awareness(doc);
    awarenessWeakMap.set(doc, awareness);
    provider.awareness = awareness;
    awareness.on('update', ({ added, updated, removed }, origin: any) => {
      // Send the update
      const changedClients = added.concat(updated).concat(removed);
      if (origin !== 'server') {
        const update = awap.encodeAwarenessUpdate(awareness!, changedClients);
        db.messageProducer.next({
          type: 'aware',
          table: parentTable,
          prop: parentProp,
          k: doc.meta.parentId,
          u: update,
        });
        if (provider.destroyed) {
          // We're called from awareness.on('destroy') that did
          // removeAwarenessStates. 
          // It's time to also send the doc-close message that dexie-cloud understands
          // and uses to stop subscribing for updates and awareness updates and brings
          // down the cached information in memory on the WS connection for this.
          db.messageProducer.next({
            type: 'doc-close',
            table: parentTable,
            prop: parentProp,
            k: doc.meta.parentId
          })
        }
      }
    });
    awareness.on('destroy', () => {
      // Signal to server that this provider is destroyed (the update event will be triggered, which
      // in turn will trigger db.messageProducer that will send the message to the server if WS is connected)
      awap.removeAwarenessStates(
        awareness!,
        [doc.clientID],
        'provider destroyed'
      );
    });

    // Now wait til document is loaded and then open the document on the server
    provider.on('load', async () => {
      if (provider.destroyed) return;
      let connected = false;
      let currentFlowId = 1;
      const subscription = db.cloud.webSocketStatus.subscribe((wsStatus) => {
        if (provider.destroyed) return;
        // Keep "connected" state in a variable so we can check it after async operations
        connected = wsStatus === 'connected';

        // We are or got connected. Open the document on the server.
        if (wsStatus === "connected") {
          ++currentFlowId;
          openDocumentOnServer(wsStatus).catch(error => {
            console.warn(`Error catched in createYHandler.ts: ${error}`);
          });
        }
      })
      // Wait until WebSocket is connected
      provider.addCleanupHandler(subscription);

      /** Sends an 'doc-open' message to server whenever websocket becomes
       * connected, or if it is already connected.
       * The flow is aborted in case websocket is disconnected while querying
       * information required to compute the state vector. Flow is also
       * aborted in case document or provider has been destroyed during
       * the async parts of the task.
       * 
       * The state vector is only computed from the updates that have occured
       * after the last full sync - which could very often be zero - in which
       * case no state vector is sent (then the server already knows us by
       * revision)
       * 
       * When server gets the doc-open message, it will authorized us for
       * whether we are allowed to read / write to this document, and then
       * keep the cached information in memory on the WS connection for this
       * particular document, as well as subscribe to updates and awareness updates
       * from other clients on the document.
       */
      async function openDocumentOnServer(wsStatus: DXCWebSocketStatus) {
        const myFlow = currentFlowId; // So we can abort when a new flow is started
        const yTbl = db.table(updatesTable);
        const syncState = await yTbl.get(DEXIE_CLOUD_SYNCER_ID);
        // After every await, check if we still should be working on this task.
        if (provider.destroyed || currentFlowId !== myFlow || !connected) return;

        const receivedUntil = syncState?.receivedUntil || 0;
        const docOpenMsg: YDocumentOpen = {
          type: 'doc-open',
          table: parentTable,
          prop: parentProp,
          k: parentId,
          serverRev: syncState?.serverRev,
        };
        const serverUpdatesSinceLastSync = await yTbl
          .where('i')
          .between(receivedUntil, Infinity, false)
          .filter(
            (update) =>
              cmp(update.k, parentId) === 0 && // Only updates for this document
              ((update.f || 0) & 1) === 0 // Don't include local changes
          ) 
          .toArray();
        // After every await, check if we still should be working on this task.
        if (provider.destroyed || currentFlowId !== myFlow || !connected) return;

        if (serverUpdatesSinceLastSync.length > 0) {
          const Y = $Y(db); // Get the Yjs library from Dexie constructor options
          const mergedUpdate = Y.mergeUpdatesV2(
            serverUpdatesSinceLastSync.map((update) => update.u)
          );
          const stateVector = Y.encodeStateVectorFromUpdateV2(mergedUpdate);
          docOpenMsg.sv = stateVector;
        }
        db.messageProducer.next(docOpenMsg);
      }
    });
  };
}
