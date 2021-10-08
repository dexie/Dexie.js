import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { refreshAccessToken } from '../authentication/authenticate';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { PersistedSyncState } from '../db/entities/PersistedSyncState';
import { computeRealmSetHash } from '../helpers/computeRealmSetHash';
import {
  userDoesSomething,
  userIsActive,
  userIsReallyActive,
} from '../userIsActive';
import {
  ReadyForChangesMessage,
  WSConnectionMsg,
  WSObservable,
} from '../WSObservable';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitAndReconnectWhenUserDoesSomething(error: Error) {
  console.error(
    `WebSocket observable: error but revive when user does some active thing...`,
    error
  );
  // Sleep some seconds...
  await sleep(3000);
  // Wait til user does something (move mouse, tap, scroll, click etc)
  console.debug('waiting for someone to do something');
  await userDoesSomething.pipe(take(1)).toPromise();
  console.debug('someone did something!');
}

export function connectWebSocket(db: DexieCloudDB) {
  if (!db.cloud.options?.databaseUrl) {
    throw new Error(`No database URL to connect WebSocket to`);
  }

  const messageProducer = db.messageConsumer.readyToServe.pipe(
    filter((isReady) => isReady), // When consumer is ready for new messages, produce such a message to inform server about it
    switchMap(() => db.getPersistedSyncState()), // We need the info on which server revision we are at:
    filter((syncState) => syncState && syncState.serverRevision), // We wont send anything to server before inital sync has taken place
    map<PersistedSyncState, ReadyForChangesMessage>((syncState) => ({
      // Produce the message to trigger server to send us new messages to consume:
      type: 'ready',
      rev: syncState.serverRevision,
    }))
  );

  function createObservable(): Observable<WSConnectionMsg | null> {
    return db.cloud.persistedSyncState.pipe(
      filter(syncState => syncState?.serverRevision),// Don't connect before there's no initial sync performed.
      take(1), // Don't continue waking up whenever syncState change
      switchMap((syncState)=> db.cloud.currentUser.pipe(map(userLogin => [userLogin, syncState] as const))),
      switchMap(([userLogin, syncState]) =>
        userIsReallyActive.pipe(
          map((isActive) => ([isActive ? userLogin : null, syncState] as const))
        )
      ),
      switchMap(async ([userLogin, syncState]) => [userLogin, await computeRealmSetHash(syncState!)] as const),
      switchMap(([userLogin, realmSetHash]) =>
        // Let server end query changes from last entry of same client-ID and forward.
        // If no new entries, server won't bother the client. If new entries, server sends only those
        // and the baseRev of the last from same client-ID.
        userLogin
          ? new WSObservable(
              db.cloud.options!.databaseUrl,
              db.cloud.persistedSyncState!.value!.serverRevision,
              realmSetHash,
              db.cloud.persistedSyncState!.value!.clientIdentity,
              messageProducer,
              db.cloud.webSocketStatus,
              userLogin.accessToken,
              userLogin.accessTokenExpiration
            )
          : from([] as WSConnectionMsg[])
      ),
      catchError((error) => {
        if (error?.name === 'TokenExpiredError') {
          console.debug(
            'WebSocket observable: Token expired. Refreshing token...'
          );
          return of(true).pipe(
            switchMap(async () => {
              // Refresh access token
              const user = await db.getCurrentUser();
              const refreshedLogin = await refreshAccessToken(
                db.cloud.options!.databaseUrl,
                user
              );
              // Persist updated access token
              await db.table('$logins').update(user.userId, {
                accessToken: refreshedLogin.accessToken,
                accessTokenExpiration: refreshedLogin.accessTokenExpiration,
              });
            }),
            switchMap(() => createObservable())
          );
        } else {
          return throwError(error);
        }
      }),
      catchError((error) =>
        from(waitAndReconnectWhenUserDoesSomething(error)).pipe(
          switchMap(() => createObservable())
        )
      )
    );
  }

  return createObservable().subscribe(
    (msg) => {
      if (msg) {
        console.debug('WS got message', msg);
        db.messageConsumer.enqueue(msg);
      }
    },
    (error) => {
      console.error('Oops! The main observable errored!', error);
    },
    () => {
      console.error('Oops! The main observable completed!');
    }
  );
}
