import { DexieCloudSchema } from 'dexie-cloud-common';
import { DexieCloudDB } from './db/DexieCloudDB';
import { DexieCloudOptions } from './DexieCloudOptions';
import { performGuardedJob } from './sync/performGuardedJob';
import { sync } from './sync/sync';

export async function performInitialSync(
  db: DexieCloudDB,
  cloudOptions: DexieCloudOptions,
  cloudSchema: DexieCloudSchema
) {
  console.debug('Performing initial sync');  
  await sync(db, cloudOptions, cloudSchema, { isInitialSync: true });
  console.debug('Done initial sync');
}
