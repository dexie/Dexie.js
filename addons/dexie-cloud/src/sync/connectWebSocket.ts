import { BehaviorSubject, firstValueFrom, from, Observable, of, throwError, merge } from 'rxjs';
import {
  catchError,
  combineLatestAll,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
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
import { InvalidLicenseError } from '../InvalidLicenseError';
import { read } from 'fs';

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
  await firstValueFrom(userDoesSomething);
  console.debug('someone did something!');
}

export function connectWebSocket(db: DexieCloudDB) {
  if (!db.cloud.options?.databaseUrl) {
    throw new Error(`No database URL to connect WebSocket to`);
  }

  const readyForChangesMessage = db.messageConsumer.readyToServe.pipe(
    filter((isReady) => isReady), // When consumer is ready for new messages, produce such a message to inform server about it
    switchMap(() => db.getPersistedSyncState()), // We need the info on which server revision we are at:
    filter((syncState) => syncState && syncState.serverRevision), // We wont send anything to server before inital sync has taken place
    switchMap<PersistedSyncState, Promise<ReadyForChangesMessage>>(async (syncState) => ({
      // Produce the message to trigger server to send us new messages to consume:
      type: 'ready',
      rev: syncState.serverRevision,
      realmSetHash: await computeRealmSetHash(syncState)
    } satisfies ReadyForChangesMessage))
  );

  const messageProducer = merge(
    readyForChangesMessage,
    db.messageProducer
  );

  function createObservable(): Observable<WSConnectionMsg | null> {
    return db.cloud.persistedSyncState.pipe(
      filter((syncState) => syncState?.serverRevision), // Don't connect before there's no initial sync performed.
      take(1), // Don't continue waking up whenever syncState change
      switchMap((syncState) =>
        db.cloud.currentUser.pipe(
          map((userLogin) => [userLogin, syncState] as const)
        )
      ),
      switchMap(([userLogin, syncState]) => {
        /*if (userLogin.license?.status && userLogin.license.status !== 'ok') {
          throw new InvalidLicenseError();
        }*/
        return userIsReallyActive.pipe(
          map((isActive) => [isActive ? userLogin : null, syncState] as const)
        );
      }),
      switchMap(([userLogin, syncState]) => {
        if (userLogin?.isLoggedIn && !syncState?.realms.includes(userLogin.userId!)) {
          // We're in an in-between state when user is logged in but the user's realms are not yet synced.
          // Don't make this change reconnect the websocket just yet. Wait till syncState is updated
          // to iclude the user's realm.
          return db.cloud.persistedSyncState.pipe(
            filter((syncState) => syncState?.realms.includes(userLogin!.userId!) || false),
            take(1),
            map((syncState) => [userLogin, syncState] as const)
          );
        }
        return new BehaviorSubject([userLogin, syncState] as const);
      }),
      switchMap(
        async ([userLogin, syncState]) =>
          [userLogin, await computeRealmSetHash(syncState!)] as const
      ),
      distinctUntilChanged(([prevUser, prevHash], [currUser, currHash]) => prevUser === currUser && prevHash === currHash ),
      switchMap(([userLogin, realmSetHash]) => {
        if (!db.cloud.persistedSyncState?.value) {
          // Restart the flow if persistedSyncState is not yet available.
          return createObservable();
        }
        // Let server end query changes from last entry of same client-ID and forward.
        // If no new entries, server won't bother the client. If new entries, server sends only those
        // and the baseRev of the last from same client-ID.
        if (userLogin) {
          return new WSObservable(
              db,
              db.cloud.persistedSyncState!.value!.serverRevision,
              db.cloud.persistedSyncState!.value!.yServerRevision,
              realmSetHash,
              db.cloud.persistedSyncState!.value!.clientIdentity,
              messageProducer,
              db.cloud.webSocketStatus,
              userLogin
            );
        } else {
          return from([] as WSConnectionMsg[]);
        }}),
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
                claims: refreshedLogin.claims,
                license: refreshedLogin.license,
                data: refreshedLogin.data
              });
            }),
            switchMap(() => createObservable())
          );
        } else {
          return throwError(()=>error);
        }
      }),
      catchError((error) => {
        db.cloud.webSocketStatus.next("error");
        if (error instanceof InvalidLicenseError) {
          // Don't retry. Just throw and don't try connect again.
          return throwError(() => error);
        }
        return from(waitAndReconnectWhenUserDoesSomething(error)).pipe(
          switchMap(() => createObservable())
        );
      })
    ) as Observable<WSConnectionMsg | null>;
  }

  return createObservable().subscribe({
    next: (msg) => {
      if (msg) {
        console.debug('WS got message', msg);
        db.messageConsumer.enqueue(msg);
      }
    },
    error: (error) => {
      console.error('WS got error', error);
    },
    complete: () => {
      console.debug('WS observable completed');
    },
  });
}
