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
export async function setCurrentUser(db: DexieCloudDB, user: AuthPersistedContext) {
  if (user.userId === db.cloud.currentUserId) return; // Already this user.

  const $logins = db.table('$logins');
  await db.transaction('rw', $logins, async tx => {
    const existingLogins = await $logins.toArray();
    await Promise.all(existingLogins.filter(login => login.userId !== user.userId && login.isLoggedIn).map(login => {
      login.isLoggedIn = false;
      return $logins.put(login);
    }));
    user.isLoggedIn = true;
    user.lastLogin = new Date();
    await user.save();
    console.debug("Saved new user", user.email);
  });
  await new Promise(resolve=>{
    if (db.cloud.currentUserId === user.userId) {
      resolve(null);
    } else {
      const subscription = db.cloud.currentUser.subscribe(currentUser=>{
        if (currentUser.userId === user.userId) {
          subscription.unsubscribe();
          resolve(null);
        }
      });
    }
  });

  // TANKAR!!!!
  // V: Service workern kommer inte ha tillgång till currentUserObservable om den inte istället härrör från ett liveQuery.
  // V: Samma med andra windows.
  // V: Så kanske göra om den till att häröra från liveQuery som läser $logins.orderBy('lastLogin').last().
  // V: Då bara vara medveten om:
  //    V: En sån observable börjar hämta data vid första subscribe
  //    V: Vi har inget "inital value" men kan emulera det till att vara ANONYMOUS_USER
  //    V: Om requireAuth är true, så borde db.on(ready) hålla databasen stängd för alla utom denna observable.
  //    V: Om inte så behöver den inte blocka.

  // Andra tankar:
  //    * Man kan inte byta användare när man är offline. Skulle gå att flytta realms till undanstuff-tabell vid user-change.
  //      men troligen inte värt det.
  //    * Istället: sälj inte inte switch-user funktionalitet utan tala enbart om inloggat vs icke inloggat läge.
  //    * populate $logins med ANONYMOUS så att en påbörjad inloggning inte räknas, alternativt ha en boolean prop!
  //      Kanske bäst ha en boolean prop!
  //    * Alternativ switch-user funktionalitet:
  //      * DBCore gömmer data från realms man inte har tillgång till.
  //      * Cursor impl behövs också då.
  //      * Då blir det snabba user switch.
  //      * claims-settet som skickas till servern blir summan av alla claims. Då måste servern stödja multipla tokens eller
  //        att ens token är ett samlad.
}
