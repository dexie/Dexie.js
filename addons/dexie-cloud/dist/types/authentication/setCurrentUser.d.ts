import { DexieCloudDB } from "../db/DexieCloudDB";
import { AuthPersistedContext } from "./AuthPersistedContext";
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
export declare function setCurrentUser(db: DexieCloudDB, user: AuthPersistedContext): Promise<void>;
