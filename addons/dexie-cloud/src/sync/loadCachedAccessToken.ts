import Dexie from 'dexie';
import { loadAccessToken } from '../authentication/authenticate';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { MINUTES } from '../helpers/date-constants';

const wm = new WeakMap<
  DexieCloudDB,
  { accessToken: string; expiration: number }
>();
export function loadCachedAccessToken(
  db: DexieCloudDB
): Promise<string | null> {
  let cached = wm.get(db);
  if (cached && cached.expiration > Date.now() + 5 * MINUTES) {
    return Promise.resolve(cached.accessToken);
  }
  const currentUser = db.cloud.currentUser.value;
  if (
    currentUser &&
    currentUser.accessToken &&
    (currentUser.accessTokenExpiration?.getTime() ?? Infinity) >
      Date.now() + 5 * MINUTES
  ) {
    wm.set(db, {
      accessToken: currentUser.accessToken,
      expiration: currentUser.accessTokenExpiration?.getTime() ?? Infinity,
    });
    return Promise.resolve(currentUser.accessToken);
  }
  // If the current user is not logged in (no isLoggedIn flag), there's no
  // token to load from the database — skip the Dexie.ignoreTransaction() call.
  // This avoids a crash in service worker context where Dexie's Promise zone
  // (PSD.transless.env) may be undefined when called from within an active
  // rw transaction (e.g. during applyServerChanges).
  if (!currentUser?.isLoggedIn) {
    return Promise.resolve(null);
  }
  return Dexie.ignoreTransaction(() =>
    loadAccessToken(db).then((user) => {
      if (user?.accessToken) {
        wm.set(db, {
          accessToken: user.accessToken,
          expiration: user.accessTokenExpiration?.getTime() ?? Infinity,
        });
      }
      return user?.accessToken || null;
    })
  );
}
