import { DexieCloudDB } from '../db/DexieCloudDB';
import { prodLog } from '../prodLog';
import { AuthPersistedContext } from './AuthPersistedContext';
import { waitUntil } from './waitUntil';

/** This function changes or sets the current user as requested.
 *
 * Use cases:
 * * Initially on db.ready after reading the current user from db.$logins.
 *   This will make sure that any unsynced operations from the previous user is synced before
 *   changing the user.
 * * Upon user request
 *
 * @param db
 * @param newUser
 */
export async function setCurrentUser(
  db: DexieCloudDB,
  user: AuthPersistedContext
) {
  const $logins = db.table('$logins');
  await db.transaction('rw', $logins, async (tx) => {
    const existingLogins = await $logins.toArray();
    await Promise.all(
      existingLogins
        .filter((login) => login.userId !== user.userId && login.isLoggedIn)
        .map((login) => {
          login.isLoggedIn = false;
          return $logins.put(login);
        })
    );
    user.isLoggedIn = true;
    user.lastLogin = new Date();
    try {
      await user.save();
    } catch (e) {
      try {
        if (e.name === 'DataCloneError') {
          // We've seen this buggy behavior in some browsers and in case it happens
          // again we really need to collect the details to understand what's going on.
          prodLog('debug', `Login context property names:`, Object.keys(user));
          prodLog('debug', `Login context property names:`, Object.keys(user));
          prodLog('debug', `Login context:`, user);
          prodLog('debug', `Login context JSON:`, JSON.stringify(user));
        }
      } catch {}
      throw e;
    }
    console.debug('Saved new user', user.email);
  });
  await waitUntil(
    db.cloud.currentUser,
    (currentUser) => currentUser.userId === user.userId
  );
}
