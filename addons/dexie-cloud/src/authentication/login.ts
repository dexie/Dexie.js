import { DexieCloudDB } from "../db/DexieCloudDB";
import { authenticate, dummyAuthDialog } from "./authenticate";
import { AuthPersistedContext } from "./AuthPersistedContext";
import { setCurrentUser } from "./setCurrentUser";

export async function login(db: DexieCloudDB) {
  if (db.cloud.currentUser.value.isLoggedIn) return;
  const context = new AuthPersistedContext(db, {
    claims: {},
    lastLogin: new Date(0),
  });
  await authenticate(
    db.cloud.options!.databaseUrl,
    context,
    dummyAuthDialog, // TODO: Fixthis!
    db.cloud.options!.fetchTokens
  );
  await context.save();
  await setCurrentUser(db, context);
}
