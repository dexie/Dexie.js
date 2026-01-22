import { DexieCloudDB } from '../db/DexieCloudDB';
import { LoginHints } from '../DexieCloudAPI';
import { triggerSync } from '../sync/triggerSync';
import { authenticate, loadAccessToken } from './authenticate';
import { AuthPersistedContext } from './AuthPersistedContext';
import { logout } from './logout';
import { otpFetchTokenCallback } from './otpFetchTokenCallback';
import { setCurrentUser } from './setCurrentUser';
import { UNAUTHORIZED_USER } from './UNAUTHORIZED_USER';

export async function login(
  db: DexieCloudDB,
  hints?: LoginHints
) {
  const currentUser = await db.getCurrentUser();
  const origUserId = currentUser.userId;
  if (currentUser.isLoggedIn && (!hints || (!hints.email && !hints.userId))) {
    const licenseStatus = currentUser.license?.status || 'ok';
    if (
      licenseStatus === 'ok' &&
      currentUser.accessToken &&
      (!currentUser.accessTokenExpiration ||
        currentUser.accessTokenExpiration.getTime() > Date.now())
    ) {
      // Already authenticated according to given hints. And license is valid.
      return false;
    }
    if (
      currentUser.refreshToken &&
      (!currentUser.refreshTokenExpiration ||
        currentUser.refreshTokenExpiration.getTime() > Date.now())
    ) {
      // Refresh the token
      await loadAccessToken(db);
      return false;
    }
    // No refresh token - must re-authenticate:
  }
  const context = new AuthPersistedContext(db, {
    claims: {},
    lastLogin: new Date(0),
  });
  try {
    await authenticate(
      db.cloud.options!.databaseUrl,
      context,
      db.cloud.options!.fetchTokens || otpFetchTokenCallback(db),
      db.cloud.userInteraction,
      hints
    );
  } catch (err) {
    if (err.name === 'OAuthRedirectError') {
      return false; // Page is redirecting for OAuth login
    }
    throw err;
  }
  if (
    origUserId !== UNAUTHORIZED_USER.userId &&
    context.userId !== origUserId
  ) {
    // User was logged in before, but now logged in as another user.
    await logout(db);
  }

  /*try {
    await context.save();
  } catch (e) {
    try {
      if (e.name === 'DataCloneError') {
        console.debug(`Login context property names:`, Object.keys(context));
        console.debug(`Login context:`, context);
        console.debug(`Login context JSON:`, JSON.stringify(context));
      }
    } catch {}
    throw e;
  }*/
  await setCurrentUser(db, context);
  // Make sure to resync as the new login will be authorized
  // for new realms.
  triggerSync(db, 'pull');
  return context.userId !== origUserId;
}
