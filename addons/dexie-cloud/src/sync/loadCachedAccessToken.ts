import Dexie from 'dexie';
import { loadAccessToken } from '../authentication/authenticate';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { MINUTES } from '../helpers/date-constants';

export function loadCachedAccessToken(db: DexieCloudDB): Promise<string | null> {
  const cached = db.cloud.currentUser.value;
  if (cached && cached.accessToken && (cached.accessTokenExpiration?.getTime() ?? Infinity) > Date.now() + 5 * MINUTES) {
    return Promise.resolve(cached.accessToken);
  }
  return Dexie.ignoreTransaction(() => loadAccessToken(db).then(user => {
    return user?.accessToken || null;
  }));
}
