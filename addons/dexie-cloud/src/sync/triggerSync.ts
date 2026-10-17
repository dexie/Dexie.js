import { DexieCloudDB } from '../db/DexieCloudDB';
import { registerSyncEvent } from './registerSyncEvent';

export function triggerSync(db: DexieCloudDB, purpose: 'push' | 'pull', immediate = false) {
  if (db.cloud.usingServiceWorker) {
    console.debug('registering sync event');
    registerSyncEvent(db, purpose);
  } else {
    db.localSyncEvent.next({ purpose, immediate });
  }
}
