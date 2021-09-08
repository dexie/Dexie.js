import { DexieCloudDB } from '../db/DexieCloudDB';
import { triggerSync } from '../sync/triggerSync';
import { authenticate } from './authenticate';
import { AuthPersistedContext } from './AuthPersistedContext';
import { otpFetchTokenCallback } from './otpFetchTokenCallback';
import { setCurrentUser } from './setCurrentUser';

export async function login(
  db: DexieCloudDB,
  hints?: { email?: string; userId?: string; grant_type?: string }
) {
  const currentUser = await db.getCurrentUser();
  if (currentUser.isLoggedIn) {
    if (hints) {
      if (hints.email && db.cloud.currentUser.value.email !== hints.email) {
        throw new Error(`Must logout before changing user`);
      }
      if (hints.userId && db.cloud.currentUserId !== hints.userId) {
        throw new Error(`Must logout before changing user`);
      }
    }
    // Already authenticated according to given hints.
    return;
  }
  const context = new AuthPersistedContext(db, {
    claims: {},
    lastLogin: new Date(0),
  });
  await authenticate(
    db.cloud.options!.databaseUrl,
    context,
    db.cloud.options!.fetchTokens || otpFetchTokenCallback(db),
    db.cloud.userInteraction,
    hints
  );
  await context.save();
  await setCurrentUser(db, context);
  // Make sure to resync as the new login will be authorized
  // for new realms.
  triggerSync(db, "pull");
}
