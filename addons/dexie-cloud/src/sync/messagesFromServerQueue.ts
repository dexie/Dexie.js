import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { WSConnectionMsg } from '../WSObservable';
import { triggerSync } from './triggerSync';
import Dexie from 'dexie';
import { computeRealmSetHash } from '../helpers/computeRealmSetHash';
import { DBOperationsSet } from 'dexie-cloud-common';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { getMutationTable } from '../helpers/getMutationTable';
import { listClientChanges } from './listClientChanges';
import {
  applyServerChanges,
  filterServerChangesThroughAddedClientChanges,
} from './sync';
import { updateBaseRevs } from './updateBaseRevs';
import { getLatestRevisionsPerTable } from './getLatestRevisionsPerTable';
import { refreshAccessToken } from '../authentication/authenticate';

export type MessagesFromServerConsumer = ReturnType<
  typeof MessagesFromServerConsumer
>;

export function MessagesFromServerConsumer(db: DexieCloudDB) {
  const queue: WSConnectionMsg[] = [];
  const readyToServe = new BehaviorSubject(true);
  const event = new BehaviorSubject(null);
  let isWorking = false;

  let loopWarning = 0;
  let loopDetection = [0,0,0,0,0,0,0,0,0,Date.now()];

  event.subscribe(async () => {
    if (isWorking) return;
    if (queue.length > 0) {
      isWorking = true;
      loopDetection.shift();
      loopDetection.push(Date.now());
      readyToServe.next(false);
      try {
        await consumeQueue();
      } finally {
        if (loopDetection[loopDetection.length-1] - loopDetection[0] < 10000) {
          // Ten loops within 10 seconds. Slow down!
          if (Date.now() - loopWarning < 5000) {
            // Last time we did this, we ended up here too. Wait for a minute.
            console.warn(`Slowing down websocket loop for one minute`)
            loopWarning = Date.now() + 60000;
            await new Promise(resolve => setTimeout(resolve, 60000));
          } else {
            // This is a one-time event. Just pause 10 seconds.
            console.warn(`Slowing down websocket loop for 10 seconds`);
            loopWarning = Date.now() + 10000;
            await new Promise(resolve => setTimeout(resolve, 10000));
          }
        }
        isWorking = false;
        readyToServe.next(true);
      }
    }
  });

  function enqueue(msg: WSConnectionMsg) {
    queue.push(msg);
    event.next(null);
  }

  async function consumeQueue() {
    while (queue.length > 0) {
      const msg = queue.shift();
      try {
        console.debug('processing msg', msg);
        // If the sync worker or service worker is syncing, wait 'til thei're done.
        // It's no need to have two channels at the same time - even though it wouldnt
        // be a problem - this is an optimization.
        await db.cloud.syncState
          .pipe(
            filter(({ phase }) => phase === 'in-sync' || phase === 'error'),
            take(1)
          )
          .toPromise();
        console.debug('processing msg', msg);
        const persistedSyncState = db.cloud.persistedSyncState.value;
        //syncState.
        if (!msg) continue;
        switch (msg.type) {
          case 'token-expired':
            console.debug(
              'WebSocket observable: Token expired. Refreshing token...'
            );
            const user = db.cloud.currentUser.value;
            // Refresh access token
            const refreshedLogin = await refreshAccessToken(
              db.cloud.options!.databaseUrl,
              user
            );
            // Persist updated access token
            await db.table('$logins').update(user.userId, {
              accessToken: refreshedLogin.accessToken,
              accessTokenExpiration: refreshedLogin.accessTokenExpiration,
            });
            // Updating $logins will trigger emission of db.cloud.currentUser observable, which
            // in turn will lead to that connectWebSocket.ts will reconnect the socket with the
            // new token. So we don't need to do anything more here.
            break;
          case 'realm-added':
            if (!persistedSyncState?.realms?.includes(msg.realm)) {
              triggerSync(db, 'pull');
            }
            break;
          case 'realm-removed':
            if (persistedSyncState?.realms?.includes(msg.realm)) {
              triggerSync(db, 'pull');
            }
            break;
          case 'realms-changed':
            triggerSync(db, 'pull');
            break;
          case 'changes':
            console.debug('changes');
            if (db.cloud.syncState.value?.phase === 'error') {
              triggerSync(db, 'pull');
              break;
            }
            await db.transaction('rw', db.dx.tables, async (tx) => {
              // @ts-ignore
              tx.idbtrans.disableChangeTracking = true;
              // @ts-ignore
              tx.idbtrans.disableAccessControl = true;
              const [schema, syncState, currentUser] = await Promise.all([
                db.getSchema(),
                db.getPersistedSyncState(),
                db.getCurrentUser(),
              ]);
              console.debug('ws message queue: in transaction');
              if (!syncState || !schema || !currentUser) {
                console.debug('required vars not present', {
                  syncState,
                  schema,
                  currentUser,
                });
                return; // Initial sync must have taken place - otherwise, ignore this.
              }
              // Verify again in ACID tx that we're on same server revision.
              if (msg.baseRev !== syncState.serverRevision) {
                console.debug(
                  `baseRev (${msg.baseRev}) differs from our serverRevision in syncState (${syncState.serverRevision})`
                );
                // Should we trigger a sync now? No. This is a normal case
                // when another local peer (such as the SW or a websocket channel on other tab) has
                // updated syncState from new server information but we are not aware yet. It would
                // be unnescessary to do a sync in that case. Instead, the caller of this consumeQueue()
                // function will do readyToServe.next(true) right after this return, which will lead
                // to a "ready" message being sent to server with the new accurate serverRev we have,
                // so that the next message indeed will be correct.
                if (
                  typeof msg.baseRev === 'string' && // v2 format
                  (typeof syncState.serverRevision === 'bigint' || // v1 format
                    typeof syncState.serverRevision === 'object') // v1 format old browser
                ) {
                  // The reason for the diff seems to be that server has migrated the revision format.
                  // Do a full sync to update revision format.
                  // If we don't do a sync request now, we could stuck in an endless loop.
                  triggerSync(db, 'pull');
                }
                return; // Ignore message
              }
              // Verify also that the message is based on the exact same set of realms
              const ourRealmSetHash = await Dexie.waitFor(
                // Keep TX in non-IDB work
                computeRealmSetHash(syncState)
              );
              console.debug('ourRealmSetHash', ourRealmSetHash);
              if (ourRealmSetHash !== msg.realmSetHash) {
                console.debug('not same realmSetHash', msg.realmSetHash);
                triggerSync(db, 'pull');
                // The message isn't based on the same realms.
                // Trigger a sync instead to resolve all things up.
                return;
              }

              // Get clientChanges
              let clientChanges: DBOperationsSet = [];
              if (currentUser.isLoggedIn) {
                const mutationTables = getSyncableTables(db).map((tbl) =>
                  db.table(getMutationTable(tbl.name))
                );
                clientChanges = await listClientChanges(mutationTables, db);
                console.debug('msg queue: client changes', clientChanges);
              }
              if (msg.changes.length > 0) {
                const filteredChanges =
                  filterServerChangesThroughAddedClientChanges(
                    msg.changes,
                    clientChanges
                  );

                //
                // apply server changes
                //
                console.debug(
                  'applying filtered server changes',
                  filteredChanges
                );
                await applyServerChanges(filteredChanges, db);
              }

              // Update latest revisions per table in case there are unsynced changes
              // This can be a real case in future when we allow non-eagery sync.
              // And it can actually be realistic now also, but very rare.
              syncState.latestRevisions = getLatestRevisionsPerTable(
                clientChanges,
                syncState.latestRevisions
              );

              syncState.serverRevision = msg.newRev;

              // Update base revs
              console.debug('Updating baseRefs', syncState.latestRevisions);
              await updateBaseRevs(
                db,
                schema!,
                syncState.latestRevisions,
                msg.newRev
              );

              //
              // Update syncState
              //
              console.debug('Updating syncState', syncState);
              await db.$syncState.put(syncState, 'syncState');
            });
            console.debug('msg queue: done with rw transaction');
            break;
        }
      } catch (error) {
        console.error(`Error in msg queue`, error);
      }
    }
  }

  return {
    enqueue,
    readyToServe,
  };
}
