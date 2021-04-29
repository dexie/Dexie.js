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
  await performGuardedJob(
    db,
    'initialSync',
    '$jobs',
    async () => {
      // Even though caller has already checked it,
      // Do check again (now within a transaction) that we really do not have a sync state:
      const syncState = await db.getPersistedSyncState();
      if (!syncState?.initiallySynced) {
        await sync(db, cloudOptions, cloudSchema);
      }
    },
    { awaitRemoteJob: true } // Don't return until the job is done!
  );
}
