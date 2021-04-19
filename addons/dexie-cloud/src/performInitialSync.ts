import { DexieCloudDB } from './db/DexieCloudDB';
import { DexieCloudOptions } from './DexieCloudOptions';
import { DexieCloudSchema } from './DexieCloudSchema';
import { performGuardedJob } from './sync/performGuardedJob';
import { sync } from './sync/sync';

export async function performInitialSync(
  db: DexieCloudDB,
  cloudOptions: DexieCloudOptions,
  cloudSchema: DexieCloudSchema
) {
  // Att tänka på här:
  //  Om klienten INTE har någon databaseUrl så ska detta inte göras.
  //  Om klienten HAR databaseUrl så måste detta göras.
  //  Om klienten INTE har någon databaseUrl men ändå har gjort en initial sync - ja då
  //   borde allt vara frid och fröjd här, men då ska vi aldrig utföra någon sync. Då ska allt
  //   vara som om det vore offline.
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
    { awaitRemoteJob: true }
  );
}
