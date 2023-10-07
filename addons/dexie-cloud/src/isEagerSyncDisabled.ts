import { DexieCloudDB } from './db/DexieCloudDB';

export function isEagerSyncDisabled(db: DexieCloudDB) {
  return (
    db.cloud.options?.disableEagerSync ||
    db.cloud.currentUser.value?.license?.status !== 'ok' ||
    !db.cloud.options?.databaseUrl
  );
}
