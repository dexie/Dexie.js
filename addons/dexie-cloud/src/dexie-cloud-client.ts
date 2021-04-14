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
import { verifySchema } from "./to_remove_verifySchema";
import { throwVersionIncrementNeeded } from "./helpers/throwVersionIncrementNeeded";
import { performInitialSync } from "./performInitialSync";
import { startSyncWorker } from "./sync/startSyncWorker";
import { dexieCloudGlobalDB } from "./dexieCloudGlobalDB";
import { dbOnClosed } from "./helpers/dbOnClosed";
import { IS_SERVICE_WORKER } from "./helpers/IS_SERVICE_WORKER";
import { authenticate } from "./authentication/authenticate";

export function dexieCloud(dexie: Dexie) {
  //
  //
  //
  const currentUserEmitter = new BehaviorSubject(UNAUTHORIZED_USER);
  let currentUserSubscription: Subscription | null = null;
  let syncWorker: { stop: () => void } | null = null;
  dexie.on(
    "ready",
    async (dexie: Dexie) => {
      const db = DexieCloudDB(dexie);
      //verifyConfig(db.cloud.options); Not needed (yet at least!)
      // Verify the user has allowed version increment.
      if (!db.tables.every((table) => table.core)) {
        throwVersionIncrementNeeded();
      }

      const initiallySynced = await db.transaction("rw", db.$syncState, async () => {
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
      });
      //await verifySchema(db); // TODO: Can we remove this?!

      if (db.cloud.options?.databaseUrl && !initiallySynced) {
        await performInitialSync(db);
      }

      // HERE: If requireAuth, do athentication now.
      if (db.cloud.options?.requireAuth) {
        // TODO: Do authentication here. BUT! Wait with this part for now!
        // First, make sure all other sync flows are complete!
        //await authenticate(db.cloud.options.databaseUrl, db.cloud.currentUser.value, )
      }

      if (!dexie.dynamicallyOpened() && !IS_SERVICE_WORKER) {
        // Communicate to serviceWorker to take care of sync if options.serviceWorker is set.
        await dexieCloudGlobalDB.transaction(
          "rw",
          dexieCloudGlobalDB.swManagedDBs,
          async () => {
            if (db.cloud.options?.usingServiceWorker) {
              if (!(await dexieCloudGlobalDB.swManagedDBs.get(dexie.name))) {
                // Communicate to service worker that it has a new DB to manage:
                await dexieCloudGlobalDB.swManagedDBs.add({ db: dexie.name });
              }
            } else {
              if (await dexieCloudGlobalDB.swManagedDBs.get(dexie.name)) {
                // Communicate to service worker that it no longer need to manage this DB:
                await dexieCloudGlobalDB.swManagedDBs.delete(dexie.name);
              }
            }
          }
        );
      }

      if (syncWorker) syncWorker.stop();
      syncWorker = await startSyncWorker(db); // Will be a noop if options.serviceWorker and we're not the SW.

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
    syncWorker && syncWorker.stop();
    syncWorker = null;
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
    },
  };

  dexie.Version.prototype["_parseStoresSpec"] = Dexie.override(
    dexie.Version.prototype["_parseStoresSpec"],
    (origFunc) => overrideParseStoresSpec(origFunc, dexie)
  );

  dexie.use(
    createIdGenerationMiddleware(
      () => dexie.cloud.schema,
      () => dexie.cloud.serverState
    )
  );
}

dexieCloud.version = "{version}";

Dexie.Cloud = dexieCloud;

//Dexie.addons.push(dexieCloud);

export default dexieCloud;
