import { DexieCloudDB } from '../db/DexieCloudDB';
import { WSObservable } from '../WSObservable';
import { authenticate, loadAccessToken } from '../authentication/authenticate';
import { FakeBigInt } from '../TSON';
import { triggerSync } from './triggerSync';
import { filter, switchMap } from 'rxjs/operators';

export function connectWebSocket(db: DexieCloudDB) {
  if (!db.cloud.options?.databaseUrl) {
    throw new Error(`No database URL to connect WebSocket to`);
  }

  const observable = db.cloud.currentUser.pipe(
    filter(
      (userLogin) =>
        !userLogin.accessToken || // Anonymous users can also subscribe to changes - OK.
        !userLogin.accessTokenExpiration || // If no expiraction on access token - OK.
        userLogin.accessTokenExpiration > new Date()
    ), // If not expired - OK.
    switchMap(
      (userLogin) =>
        new WSObservable(db.cloud.options!.databaseUrl, userLogin.accessToken)
    )
  );
  const subscription = observable.subscribe(async (msg) => {
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
  return subscription;
}
