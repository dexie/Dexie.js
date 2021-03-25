import Dexie, { liveQuery, Subscription, Table } from "dexie";
import "./extend-dexie-interface";
import { BehaviorSubject, from, Observable, Subject } from "rxjs";
import { createIdGenerationMiddleware } from "./middlewares/createIdGenerationMiddleware";
import { DexieCloudOptions } from "./DexieCloudOptions";
import { DexieCloudSchema } from "./DexieCloudSchema";
//import { dexieCloudSyncProtocol } from "./dexieCloudSyncProtocol";
import { overrideParseStoresSpec } from "./overrideParseStoresSpec";
import { DexieCloudDB } from "./db/DexieCloudDB";
import { UserLogin } from "./db/entities/UserLogin";
import { ANONYMOUS_USER } from "./authentication/ANONYMOUS_USER";
import { login } from "./authentication/login";
import { OTPTokenRequest, TokenFinalResponse, TokenOtpSentResponse, TokenResponse } from 'dexie-cloud-common';
import { LoginState } from './types/LoginState';
import { SyncState } from "./types/SyncState";

export function dexieCloud(dexie: Dexie) {
  //
  //
  //
  const currentUserEmitter = new BehaviorSubject(ANONYMOUS_USER);
  let currentUserSubscription: Subscription | null = null;
  dexie.on(
    "ready",
    async (dexie: Dexie) => {
      const db = DexieCloudDB(dexie);

      // Manage CurrentUser observable:
      if (currentUserSubscription) currentUserSubscription.unsubscribe();
      currentUserSubscription = liveQuery(() =>
        db.$logins
          .toArray()
          .then((logins) => logins.find((l) => l.isLoggedIn) || ANONYMOUS_USER)
      ).subscribe(currentUserEmitter);
    },
    true // true = sticky
  );
  
  dexie.on("close", () => {
    currentUserSubscription && currentUserSubscription.unsubscribe();
    currentUserSubscription = null;
    currentUserEmitter.next(ANONYMOUS_USER);
  });

  dexie.cloud = {
    version: "{version}",
    options: { databaseUrl: "" },
    schema: {},
    get currentUserId() {
      return currentUserEmitter.value.userId || ANONYMOUS_USER.userId!;
    },
    currentUser: currentUserEmitter,
    syncState: new BehaviorSubject<SyncState>({phase: "initial"}),
    loginState: new BehaviorSubject<LoginState>({type: "silent"}), // fixthis! Or remove this observable?
    configure(options: DexieCloudOptions) {
      dexie.cloud.options = options;
    },
  };

  dexie.Version.prototype["_parseStoresSpec"] = Dexie.override(
    dexie.Version.prototype["_parseStoresSpec"],
    (origFunc) => overrideParseStoresSpec(origFunc, dexie.cloud.options, dexie.cloud.schema)
  );

  dexie.use(createIdGenerationMiddleware(dexie.cloud.schema));
}

dexieCloud.version = "{version}";

Dexie.Cloud = dexieCloud;

//Dexie.addons.push(dexieCloud);

export default dexieCloud;
