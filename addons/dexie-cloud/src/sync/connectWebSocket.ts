import { DexieCloudDB } from '../db/DexieCloudDB';
import { WSObservable } from '../WSObservable';
import { authenticate, loadAccessToken } from '../authentication/authenticate';
import { FakeBigInt } from '../TSON';
import { triggerSync } from './triggerSync';
import { switchMap } from 'rxjs/operators';

export function connectWebSocket(db: DexieCloudDB) {
  if (!db.cloud.options?.databaseUrl) {
    throw new Error(`No database URL to connect WebSocket to`);
  }

  const observable = db.cloud.currentUser.pipe(
    switchMap(
      (userLogin) =>
        new WSObservable(
          db.cloud.options!.databaseUrl,
          userLogin.accessToken
        )
    )
  );
  const subscription = observable.subscribe(async (msg) => {
    const syncState = await db.getPersistedSyncState();
    switch (msg.type) {
      case 'rev':
        if (
          !syncState?.serverRevision ||
          FakeBigInt.compare(syncState.serverRevision, msg.rev) < 0
        ) {
          triggerSync(db);
        }
        break;
      case 'realms': {
          const currentRealms = [...(syncState?.realms || [])].sort().join(',')
          const newRealms = [...msg.realms].sort().join(',');
          if (currentRealms !== newRealms) {
            triggerSync(db);
          }
        }
        break;
    }
  });
  return subscription;
}
