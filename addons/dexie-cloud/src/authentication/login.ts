import { DexieCloudDB } from '../db/DexieCloudDB';
import { authenticate, dummyAuthDialog } from './authenticate';
import { AuthPersistedContext } from './AuthPersistedContext';
import { setCurrentUser } from './setCurrentUser';

export async function login(
  db: DexieCloudDB,
  hints?: {email?: string, userId?: string, grant_type?: string}
) {
  if (db.cloud.currentUser.value.isLoggedIn) {
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
    lastLogin: new Date(0)
  });
  await authenticate(
    db.cloud.options!.databaseUrl,
    context,
    dummyAuthDialog, // TODO: Fixthis!
    db.cloud.options!.fetchTokens,
    hints
  );
  await context.save();
  await setCurrentUser(db, context);
}
