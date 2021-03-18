import Dexie, { liveQuery, Subscription, Table } from "dexie";
import "./extend-dexie-interface";
import { BehaviorSubject, from, Observable, Subject } from "rxjs";
import { createIdGenerationMiddleware } from "./middlewares/createIdGenerationMiddleware";
import { DexieCloudOptions } from "./DexieCloudOptions";
import { DexieCloudSchema } from "./DexieCloudSchema";
//import { dexieCloudSyncProtocol } from "./dexieCloudSyncProtocol";
import { overrideParseStoresSpec } from "./overrideParseStoresSpect";
import { SyncableDB } from "./SyncableDB";
import { UserLogin } from "./types/UserLogin";
import { ANONYMOUS_USER } from "./authentication/ANONYMOUS_USER";
import { login } from "./authentication/login";
import { OTPTokenRequest, TokenFinalResponse, TokenOtpSentResponse, TokenResponse } from 'dexie-cloud-common';
import { LoginState } from './types/LoginState';

export function dexieCloud(db: Dexie) {
  //
  //
  //
  const currentUserEmitter = new BehaviorSubject(ANONYMOUS_USER);
  const currentUserQuery = liveQuery(() =>
    (db.table("$logins") as Table<UserLogin>)
      .toArray()
      .then((logins) => logins.find((l) => l.isLoggedIn) || ANONYMOUS_USER)
  );
  let subscription: Subscription | null = null;
  db.on(
    "ready",
    async (db: SyncableDB) => {
      subscription = currentUserQuery.subscribe({
        next: (user) => currentUserEmitter.next(user),
        error: (error) => currentUserEmitter.error(error),
      });
      if (db.cloud.options.requireAuth) {
        // If require auth, make sure authentication is done before allowing DB interaction.
        const user = await from(currentUserQuery).toPromise();
        if (user.userId === ANONYMOUS_USER.userId) {
          await login(db);
        }
      }
      // Make sure initial sync is done before letting user get the database opened:
      // TODO: HOW TO DO THAT? What we want is just server-->client here! And wait for it to complete!
      // Nästa steg är att gå tillbaka till sync-flödet igen, nu med fokus på server-client.
      //   Här vill vi typ ha en initial fetch om vår databas är helt o-connectad (aldrig syncat)
      //   Om vi har syncat tidigare så är initial-fetch inget vi behöver vänta på för att öppna db!
      //   Vi måste också stödja offline i det fallet!
      const $syncState = db.table("$syncState");
      let wasInitial = false;
      await db.transaction("rw", $syncState, async () => {
        let syncState = await $syncState.get("syncState");
        if (!syncState) {
          wasInitial = true;
          // Initial sync required. Online required!
          syncState = {
            id: "syncState",
            realms: [],
            serverRevision: null,
            initiallySynced: false
          };
          await $syncState.add(syncState);
        }
      });
      if (wasInitial) {
        // TODO: Make sure a sync operation happens IN APP, not in SW (unless we are the SW)!
        // När jag sedan skriver bootstrap koden för SW, se till att inte börja något förrän
        // syncStatae.initiallySynced är true.

      }
    },
    true // true = sticky
  );
  db.on("close", () => {
    subscription && subscription.unsubscribe();
    subscription = null;
    currentUserEmitter.next(ANONYMOUS_USER);
  });

  //db.

  db.cloud = {
    version: "{version}",
    options: { databaseUrl: "" },
    schema: {},
    get currentUser() {
      return currentUserEmitter.value;
    },
    currentUserObservable: currentUserEmitter,
    loginStateObservable: new Subject<LoginState>(), // fixthis!
    configure(options: DexieCloudOptions) {
      db.cloud.options = options;
      //return db.syncable.connect(DEXIE_CLOUD_PROTOCOL_NAME, options.databaseUrl, options);
      //return Promise.resolve();
    },
  };

  db.Version.prototype["_parseStoresSpec"] = Dexie.override(
    db.Version.prototype["_parseStoresSpec"],
    (origFunc) => overrideParseStoresSpec(origFunc, db.cloud.schema)
  );

  db.use(createIdGenerationMiddleware(db.cloud.schema));
}

dexieCloud.version = "{version}";

Dexie.Cloud = dexieCloud;

//Dexie.addons.push(dexieCloud);

export default dexieCloud;
