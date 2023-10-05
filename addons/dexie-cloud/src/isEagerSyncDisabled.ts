import { DexieCloudDB } from './db/DexieCloudDB';

export function isEagerSyncDisabled(db: DexieCloudDB) {
  return (
    db.cloud.options?.disableEagerSync ||
    db.cloud.currentUser.value?.userId !== 'ok' ||
    !db.cloud.options?.databaseUrl
  );
}
