import { DexieCloudSchema } from 'dexie-cloud-common';
import { DexieCloudDB } from './db/DexieCloudDB';
import { DexieCloudOptions } from './DexieCloudOptions';
import { CURRENT_SYNC_WORKER, sync } from './sync/sync';
import { performGuardedJob } from './sync/performGuardedJob';

export async function performInitialSync(
  db: DexieCloudDB,
  cloudOptions: DexieCloudOptions,
  cloudSchema: DexieCloudSchema
) {
  console.debug('Performing initial sync');  
  await performGuardedJob(
    db,
    CURRENT_SYNC_WORKER,
    () => sync(db, cloudOptions, cloudSchema, { isInitialSync: true })
  );
  console.debug('Done initial sync');
}
