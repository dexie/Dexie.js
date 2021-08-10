import { from, of } from 'rxjs';
import {
  catchError,
  delay,
  filter,
  finalize,
  switchMap,
  take,
} from 'rxjs/operators';
import { refreshAccessToken } from '../authentication/authenticate';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { FakeBigInt } from '../TSON';
import { userDoesSomething, userIsActive } from '../userIsActive';
import { WSConnectionMsg, WSObservable } from '../WSObservable';
import { syncServerToClientOnly } from './syncServerToClientOnly';
import { triggerSync } from './triggerSync';

export function connectWebSocket(db: DexieCloudDB) {
  if (!db.cloud.options?.databaseUrl) {
    throw new Error(`No database URL to connect WebSocket to`);
  }

  function createObservable() {
    return userIsActive.pipe(
      filter((isActive) => isActive), // Reconnect when user becomes active
      switchMap(() => db.cloud.currentUser), // Reconnect whenever current user changes
      filter(() => db.cloud.persistedSyncState?.value?.serverRevision), // Don't connect before there's no initial sync performed.
      switchMap(
        (userLogin) =>
          // TODO! Send a client-ID along with serverRevision.
          // Track clientId in server change log.
          // Let server end query changes from last entry of same client-ID and forward.
          // If no new entries, server won't bother the client. If new entries, server sends only those
          // and the baseRev of the last from same client-ID.
          new WSObservable(
            db.cloud.options!.databaseUrl,
            db.cloud.persistedSyncState?.value?.serverRevision,
            userLogin.accessToken,
            userLogin.accessTokenExpiration
          )
      ),
      switchMap((msg) => {
        if (msg.type === 'changes') {
          // New version - includes changes from other clients in the message.
          return syncServerToClientOnly(db, msg);
        } else {
          return from(db.getPersistedSyncState()).pipe(
            switchMap(async syncState => {
              switch (msg.type) {
                case 'rev':
                  if (
                    !syncState?.serverRevision ||
                    FakeBigInt.compare(
                      syncState.serverRevision,
                      typeof BigInt === 'undefined'
                        ? new FakeBigInt(msg.rev)
                        : BigInt(msg.rev)
                    ) < 0
                  ) {
                    triggerSync(db);
                  }
                  break;
                case 'realm-added':
                  {
                    if (!syncState?.realms?.includes(msg.realm)) {
                      triggerSync(db);
                    }
                  }
                  break;
                case 'realm-removed':
                  if (syncState?.realms?.includes(msg.realm)) {
                    triggerSync(db);
                  }
                  break;
              }
              return msg;
            }));
        }
      }),
      catchError((error) => {
        return from(handleError(error)).pipe(
          switchMap(() => createObservable()),
          catchError((error) => {
            // Failed to refresh token (network error or so)
            console.error(
              `WebSocket observable: error but revive when user does some active thing...`,
              error
            );
            return of(true).pipe(
              delay(3000), // Give us some breath between errors
              switchMap(() => userDoesSomething),
              take(1), // Don't reconnect whenever user does something
              switchMap(() => createObservable()) // Relaunch the flow
            );
          })
        );

        async function handleError(error: any) {
          if (error?.name === 'TokenExpiredError') {
            console.debug(
              'WebSocket observable: Token expired. Refreshing token...'
            );
            const user = db.cloud.currentUser.value;
            const refreshedLogin = await refreshAccessToken(
              db.cloud.options!.databaseUrl,
              user
            );
            await db.table('$logins').update(user.userId, {
              accessToken: refreshedLogin.accessToken,
              accessTokenExpiration: refreshedLogin.accessTokenExpiration,
            });
          } else {
            console.error('WebSocket observable:', error);
            throw error;
          }
        }
      })
    );
  }

  return createObservable().subscribe(() => {});
}
