import Dexie, { liveQuery, Subscription, Table } from "dexie";
import "./extend-dexie-interface";
import { BehaviorSubject, from, Observable, Subject } from "rxjs";
import {
  createIdGenerationMiddleware,
  generateTablePrefix,
} from "./middlewares/createIdGenerationMiddleware";
import { DexieCloudOptions } from "./DexieCloudOptions";
import { DexieCloudSchema } from "./DexieCloudSchema";
//import { dexieCloudSyncProtocol } from "./dexieCloudSyncProtocol";
import { overrideParseStoresSpec } from "./overrideParseStoresSpec";
import { DexieCloudDB } from "./db/DexieCloudDB";
import { UserLogin } from "./db/entities/UserLogin";
import { UNAUTHORIZED_USER } from "./authentication/UNAUTHORIZED_USER";
import { login } from "./authentication/login";
import {
  OTPTokenRequest,
  TokenFinalResponse,
  TokenOtpSentResponse,
  TokenResponse,
} from "dexie-cloud-common";
import { LoginState } from "./types/LoginState";
import { SyncState } from "./types/SyncState";
import { verifySchema } from "./verifySchema";
import { throwVersionIncrementNeeded } from "./helpers/throwVersionIncrementNeeded";
import { performInitialSync } from "./performInitialSync";
import { LocalSyncWorker } from "./sync/LocalSyncWorker";
import { dbOnClosed } from "./helpers/dbOnClosed";
import { IS_SERVICE_WORKER } from "./helpers/IS_SERVICE_WORKER";
import { authenticate } from "./authentication/authenticate";
import { createMutationTrackingMiddleware } from "./middlewares/createMutationTrackingMiddleware";
import { updateSchemaFromOptions } from "./updateSchemaFromOptions";
import { registerPeriodicSyncEvent, registerSyncEvent } from "./sync/registerSyncEvent";

export function dexieCloud(dexie: Dexie) {
  //
  //
  //
  const currentUserEmitter = new BehaviorSubject(UNAUTHORIZED_USER);
  let currentUserSubscription: Subscription | null = null;

  // local sync worker - used when there's no service worker.
  let localSyncWorker: { start: () => void, stop: () => void } | null = null;
  dexie.on(
    "ready",
    async (dexie: Dexie) => {
      const db = DexieCloudDB(dexie);
      //verifyConfig(db.cloud.options); Not needed (yet at least!)
      // Verify the user has allowed version increment.
      if (!db.tables.every((table) => table.core)) {
        throwVersionIncrementNeeded();
      }

      const initiallySynced = await db.transaction(
        "rw",
        db.$syncState,
        async () => {
          const { options, schema } = db.cloud;
          const [
            persistedOptions,
            persistedSchema,
            persistedSyncState,
          ] = await Promise.all([
            db.getOptions(),
            db.getSchema(),
            db.getPersistedSyncState(),
          ]);
          if (!options) {
            // Options not specified programatically (use case for SW!)
            // Take persisted options:
            db.cloud.options = persistedOptions || null;
          } else if (
            !persistedOptions ||
            JSON.stringify(persistedOptions) !== JSON.stringify(options)
          ) {
            // Update persisted options:
            await db.$syncState.put(options, "options");
          }
          updateSchemaFromOptions(schema, db.cloud.options);
          updateSchemaFromOptions(persistedSchema, db.cloud.options);
          if (!schema) {
            // Database opened dynamically (use case for SW!)
            // Take persisted schema:
            db.cloud.schema = persistedSchema || null;
          } else if (
            !persistedSchema ||
            JSON.stringify(persistedSchema) !== JSON.stringify(schema)
          ) {
            // Update persisted schema
            await db.$syncState.put(schema, "schema");
          }
          return persistedSyncState?.initiallySynced;
        }
      );

      verifySchema(db);

      if (db.cloud.options?.databaseUrl && !initiallySynced) {
        await performInitialSync(db);
      }

      // HERE: If requireAuth, do athentication now.
      if (db.cloud.options?.requireAuth) {
        // TODO: Do authentication here. BUT! Wait with this part for now!
        // First, make sure all other sync flows are complete!
        //await authenticate(db.cloud.options.databaseUrl, db.cloud.currentUser.value, )
      }

      if (localSyncWorker) localSyncWorker.stop();
      localSyncWorker = null;
      if (db.cloud.options?.usingServiceWorker && ("serviceWorker" in navigator)) {
        registerSyncEvent(db);
        registerPeriodicSyncEvent(db);
      } else {
        // There's no SW. Start SyncWorker instead.
        localSyncWorker = LocalSyncWorker(db);
        localSyncWorker.start();
      }

      // Manage CurrentUser observable:
      if (currentUserSubscription) currentUserSubscription.unsubscribe();
      currentUserSubscription = liveQuery(() => db.getCurrentUser()).subscribe(
        currentUserEmitter
      );
    },
    true // true = sticky
  );

  dbOnClosed(dexie, () => {
    currentUserSubscription && currentUserSubscription.unsubscribe();
    currentUserSubscription = null;
    localSyncWorker && localSyncWorker.stop();
    localSyncWorker = null;
    currentUserEmitter.next(UNAUTHORIZED_USER);
  });

  dexie.cloud = {
    version: "{version}",
    options: null,
    schema: null,
    serverState: null,
    get currentUserId() {
      return currentUserEmitter.value.userId || UNAUTHORIZED_USER.userId!;
    },
    currentUser: currentUserEmitter,
    syncState: new BehaviorSubject<SyncState>({ phase: "initial" }),
    loginState: new BehaviorSubject<LoginState>({ type: "silent" }), // fixthis! Or remove this observable?
    configure(options: DexieCloudOptions) {
      dexie.cloud.options = options;
      updateSchemaFromOptions(dexie.cloud.schema, dexie.cloud.options);
    },
  };

  dexie.Version.prototype["_parseStoresSpec"] = Dexie.override(
    dexie.Version.prototype["_parseStoresSpec"],
    (origFunc) => overrideParseStoresSpec(origFunc, dexie)
  );

  dexie.use(
    createMutationTrackingMiddleware({
      currentUserObservable: dexie.cloud.currentUser,
      db: DexieCloudDB(dexie),
    })
  );
  dexie.use(createIdGenerationMiddleware(DexieCloudDB(dexie)));
}

dexieCloud.version = "{version}";

Dexie.Cloud = dexieCloud;

//Dexie.addons.push(dexieCloud);

export default dexieCloud;
