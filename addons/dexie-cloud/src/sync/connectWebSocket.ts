import {
  BehaviorSubject,
  firstValueFrom,
  from,
  Observable,
  of,
  throwError,
  merge,
} from 'rxjs';
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
    filter((isReady) => isReady),
    switchMap(() =>
      db.cloud.persistedSyncState.pipe(
        filter((syncState) => !!(syncState && syncState.serverRevision)),
        take(1)
      )
    ),
    switchMap<PersistedSyncState, Promise<ReadyForChangesMessage>>(
      async (syncState) =>
        ({
          // Produce the message to trigger server to send us new messages to consume:
          type: 'ready',
          rev: syncState.serverRevision,
          realmSetHash: await computeRealmSetHash(syncState),
        }) satisfies ReadyForChangesMessage
    )
  );

  const messageProducer = merge(readyForChangesMessage, db.messageProducer);

  function createObservable(): Observable<WSConnectionMsg | null> {
    return db.cloud.persistedSyncState.pipe(
      filter((syncState) => !!(syncState?.serverRevision)), // Don't connect before initial sync performed.
      // Small debounce to let realms settle (e.g. initial sync emits 1 realm, then 3 in rapid succession)
      debounceTime(50),
      // Compute realm set hash reactively - reconnects when realms change
      // (which happens on login, logout, user switch, sharing changes)
      switchMap((syncState) =>
        from(computeRealmSetHash(syncState!)).pipe(
          map((hash) => [syncState!, hash] as const)
        )
      ),
      distinctUntilChanged(
        ([, prevHash], [, currHash]) => prevHash === currHash
      ),
      switchMap(([syncState, realmSetHash]) => {
        // Get current user imperatively - realms already tell us about access changes
        const userLogin = db.cloud.currentUser.value;
        if (
          userLogin?.isLoggedIn &&
          !syncState.realms.includes(userLogin.userId!)
        ) {
          // In-between state: user logged in but realms not yet synced.
          // Wait for realms to include the user.
          return db.cloud.persistedSyncState.pipe(
            filter(
              (ss) => ss?.realms.includes(userLogin!.userId!) || false
            ),
            take(1),
            map((ss) => [userLogin, ss!, realmSetHash] as const)
          );
        }
        return of([userLogin, syncState, realmSetHash] as const);
      }),
      switchMap(([userLogin, syncState, realmSetHash]) => {
        const effectiveUser = userLogin?.isLoggedIn ? userLogin : db.cloud.currentUser.value;
        return userIsReallyActive.pipe(
          switchMap((isActive) => {
            if (!isActive) {
              return from([] as WSConnectionMsg[]);
            }
            return new WSObservable(
              db,
              syncState.serverRevision,
              syncState.yServerRevision,
              realmSetHash,
              syncState.clientIdentity,
              messageProducer,
              db.cloud.webSocketStatus,
              effectiveUser
            );
          })
        );
      }),
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
                data: refreshedLogin.data,
              });
            }),
            switchMap(() => createObservable())
          );
        } else {
          return throwError(() => error);
        }
      }),
      catchError((error) => {
        db.cloud.webSocketStatus.next('error');
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
