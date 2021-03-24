import Dexie, { liveQuery, Subscription, Table } from "dexie";
import "./extend-dexie-interface";
import { BehaviorSubject, from, Observable, Subject } from "rxjs";
import { createIdGenerationMiddleware } from "./middlewares/createIdGenerationMiddleware";
import { DexieCloudOptions } from "./DexieCloudOptions";
import { DexieCloudSchema } from "./DexieCloudSchema";
//import { dexieCloudSyncProtocol } from "./dexieCloudSyncProtocol";
import { overrideParseStoresSpec } from "./overrideParseStoresSpec";
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
  let currentUserSubscription: Subscription | null = null;
  db.on(
    "ready",
    async (db: SyncableDB) => {
      if (currentUserSubscription) currentUserSubscription.unsubscribe();
      currentUserSubscription = liveQuery(() =>
        (db.table("$logins") as Table<UserLogin>)
          .toArray()
          .then((logins) => logins.find((l) => l.isLoggedIn) || ANONYMOUS_USER)
      ).subscribe(currentUserEmitter);
    },
    true // true = sticky
  );
  db.on("close", () => {
    currentUserSubscription && currentUserSubscription.unsubscribe();
    currentUserSubscription = null;
    currentUserEmitter.next(ANONYMOUS_USER);
  });

  //db.

  db.cloud = {
    version: "{version}",
    options: { databaseUrl: "" },
    schema: {},
    get currentUserId() {
      return currentUserEmitter.value.userId || ANONYMOUS_USER.userId!;
    },
    currentUser: currentUserEmitter,
    loginState: new BehaviorSubject<LoginState>({type: "silent"}), // fixthis! Or remove this observable?
    configure(options: DexieCloudOptions) {
      db.cloud.options = options;
      //return db.syncable.connect(DEXIE_CLOUD_PROTOCOL_NAME, options.databaseUrl, options);
      //return Promise.resolve();
    },
  };

  db.Version.prototype["_parseStoresSpec"] = Dexie.override(
    db.Version.prototype["_parseStoresSpec"],
    (origFunc) => overrideParseStoresSpec(origFunc, db.cloud.options, db.cloud.schema)
  );

  db.use(createIdGenerationMiddleware(db.cloud.schema));
}

dexieCloud.version = "{version}";

Dexie.Cloud = dexieCloud;

//Dexie.addons.push(dexieCloud);

export default dexieCloud;
