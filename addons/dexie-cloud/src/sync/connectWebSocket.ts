import { DexieCloudDB } from '../db/DexieCloudDB';
import { WSObservable } from '../WSObservable';
import { FakeBigInt } from '../TSON';
import { triggerSync } from './triggerSync';
import { catchError, filter, mergeMap, switchMap } from 'rxjs/operators';
import {
  loadAccessToken,
  refreshAccessToken,
} from '../authentication/authenticate';

export function connectWebSocket(db: DexieCloudDB) {
  if (!db.cloud.options?.databaseUrl) {
    throw new Error(`No database URL to connect WebSocket to`);
  }

  function createObservable() {
    return db.cloud.currentUser.pipe(
      filter(
        (userLogin) =>
          !userLogin.accessToken || // Anonymous users can also subscribe to changes - OK.
          !userLogin.accessTokenExpiration || // If no expiraction on access token - OK.
          userLogin.accessTokenExpiration > new Date()
      ), // If not expired - OK.
      switchMap(
        (userLogin) =>
          new WSObservable(
            db.cloud.options!.databaseUrl,
            db.cloud.persistedSyncState?.value?.serverRevision,
            userLogin.accessToken,
            userLogin.accessTokenExpiration
          )
      ),
      catchError(async (error) => {
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
          // Return a fresh observable from here (reconnect)
          return createObservable();
        } else {
          console.error('WebSocket observable:', error);
          throw error;
        }
      })
    );
  }

  return createObservable().subscribe(async (msg) => {
    const syncState = await db.getPersistedSyncState();
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
  });
}
