import Dexie, { liveQuery, Subscription, Table } from 'dexie';
import './extend-dexie-interface';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import {
  createIdGenerationMiddleware,
  generateTablePrefix
} from './middlewares/createIdGenerationMiddleware';
import { DexieCloudOptions } from './DexieCloudOptions';
//import { dexieCloudSyncProtocol } from "./dexieCloudSyncProtocol";
import { overrideParseStoresSpec } from './overrideParseStoresSpec';
import { DexieCloudDB } from './db/DexieCloudDB';
import { UserLogin } from './db/entities/UserLogin';
import { UNAUTHORIZED_USER } from './authentication/UNAUTHORIZED_USER';
import { login } from './authentication/login';
import {
  OTPTokenRequest,
  TokenFinalResponse,
  TokenOtpSentResponse,
  TokenResponse
} from 'dexie-cloud-common';
import { LoginState } from './types/LoginState';
import { SyncState } from './types/SyncState';
import { verifySchema } from './verifySchema';
import { throwVersionIncrementNeeded } from './helpers/throwVersionIncrementNeeded';
import { performInitialSync } from './performInitialSync';
import { LocalSyncWorker } from './sync/LocalSyncWorker';
import { dbOnClosed } from './helpers/dbOnClosed';
import { IS_SERVICE_WORKER } from './helpers/IS_SERVICE_WORKER';
import { authenticate, loadAccessToken } from './authentication/authenticate';
import { createMutationTrackingMiddleware } from './middlewares/createMutationTrackingMiddleware';
import { updateSchemaFromOptions } from './updateSchemaFromOptions';
import {
  registerPeriodicSyncEvent,
  registerSyncEvent
} from './sync/registerSyncEvent';
import { createImplicitPropSetterMiddleware } from './middlewares/createImplicitPropSetterMiddleware';
import { sync } from './sync/sync';
import { filter, map, take } from 'rxjs/operators';
import { triggerSync } from './sync/triggerSync';
import { DexieCloudSyncOptions } from './extend-dexie-interface';
import { isSyncNeeded } from './sync/isSyncNeeded';
import { connectWebSocket } from './sync/connectWebSocket';

export { DexieCloudTable } from './extend-dexie-interface';

export function dexieCloud(dexie: Dexie) {
  //
  //
  //
  const currentUserEmitter = new BehaviorSubject(UNAUTHORIZED_USER);
  const subscriptions: Subscription[] = [];

  // local sync worker - used when there's no service worker.
  let localSyncWorker: { start: () => void; stop: () => void } | null = null;
  dexie.on(
    'ready',
    async (dexie: Dexie) => {
      const db = DexieCloudDB(dexie);
      //verifyConfig(db.cloud.options); Not needed (yet at least!)
      // Verify the user has allowed version increment.
      if (!db.tables.every((table) => table.core)) {
        throwVersionIncrementNeeded();
      }

      const initiallySynced = await db.transaction(
        'rw',
        db.$syncState,
        async () => {
          const { options, schema } = db.cloud;
          const [persistedOptions, persistedSchema, persistedSyncState] =
            await Promise.all([
              db.getOptions(),
              db.getSchema(),
              db.getPersistedSyncState()
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
            await db.$syncState.put(options, 'options');
          }
          if (
            db.cloud.options?.usingServiceWorker &&
            !('serviceWorker' in navigator)
          ) {
            // Configured to use service worker, but this browser doesn't support it.
            // Act as if usingServiceWorker is configured falsy:
            db.cloud.options.usingServiceWorker = false;
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
            await db.$syncState.put(schema, 'schema');
          }
          return persistedSyncState?.initiallySynced;
        }
      );

      verifySchema(db);

      if (db.cloud.options?.databaseUrl && !initiallySynced) {
        await performInitialSync(db, db.cloud.options, db.cloud.schema!);
      }

      // Manage CurrentUser observable:
      subscriptions.push(
        liveQuery(() => db.getCurrentUser()).subscribe(currentUserEmitter)
      );

      // HERE: If requireAuth, do athentication now.
      if (db.cloud.options?.requireAuth) {
        // TODO: Do authentication here. BUT! Wait with this part for now!
        // First, make sure all other sync flows are complete!
        await login(db);
      }

      if (localSyncWorker) localSyncWorker.stop();
      localSyncWorker = null;
      if (
        db.cloud.options?.usingServiceWorker &&
        db.cloud.options.databaseUrl
      ) {
        registerSyncEvent(db).catch(() => {});
        registerPeriodicSyncEvent(db).catch(() => {});
        subscriptions.push(
          db.syncStateChangedEvent.subscribe(dexie.cloud.syncState)
        );
      } else if (db.cloud.options?.databaseUrl && db.cloud.schema) {
        // There's no SW. Start SyncWorker instead.
        localSyncWorker = LocalSyncWorker(
          db,
          db.cloud.options,
          db.cloud.schema!
        );
        localSyncWorker.start();
      }

      // Connect WebSocket only if we're a browser window
      if (
        typeof window !== 'undefined' &&
        !IS_SERVICE_WORKER &&
        db.cloud.options?.databaseUrl
      ) {
        subscriptions.push(connectWebSocket(db));
      }
    },
    true // true = sticky
  );

  dbOnClosed(dexie, () => {
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    localSyncWorker && localSyncWorker.stop();
    localSyncWorker = null;
    currentUserEmitter.next(UNAUTHORIZED_USER);
  });

  dexie.cloud = {
    version: '{version}',
    options: null,
    schema: null,
    serverState: null,
    get currentUserId() {
      return currentUserEmitter.value.userId || UNAUTHORIZED_USER.userId!;
    },
    currentUser: currentUserEmitter,
    syncState: new BehaviorSubject<SyncState>({ phase: 'initial' }),
    loginState: new BehaviorSubject<LoginState>({ type: 'silent' }), // fixthis! Or remove this observable?
    async login(hint) {
      const db = DexieCloudDB(dexie);
      await db.cloud.sync();
      await login(db, hint);
    },
    configure(options: DexieCloudOptions) {
      dexie.cloud.options = options;
      updateSchemaFromOptions(dexie.cloud.schema, dexie.cloud.options);
    },
    async sync(
      { wait, force }: DexieCloudSyncOptions = { wait: true, force: false }
    ) {
      if (wait === undefined) wait = true;
      const db = DexieCloudDB(dexie);
      if (force) {
        const syncState = await db.getPersistedSyncState();
        triggerSync(db);
        if (wait) {
          const newSyncState = await from(
            liveQuery(() => db.getPersistedSyncState())
          )
            .pipe(
              filter(
                (newSyncState) =>
                  newSyncState?.timestamp != null &&
                  (!syncState || newSyncState.timestamp > syncState.timestamp!)
              ),
              take(1)
            )
            .toPromise();
          if (newSyncState?.error) {
            throw new Error(`Sync error: ` + newSyncState.error);
          }
        }
      } else if (await isSyncNeeded(db)) {
        const syncState = await db.getPersistedSyncState();
        triggerSync(db);
        if (wait) {
          console.debug('db.cloud.login() is waiting for sync completion...');
          await from(
            liveQuery(async () => {
              const syncNeeded = await isSyncNeeded(db);
              const newSyncState = await db.getPersistedSyncState();
              if (
                newSyncState?.timestamp !== syncState?.timestamp &&
                newSyncState?.error
              )
                throw new Error(`Sync error: ` + newSyncState.error);
              return syncNeeded;
            })
          )
            .pipe(
              filter((isNeeded) => !isNeeded),
              take(1)
            )
            .toPromise();
          console.debug(
            'Done waiting for sync completion because we have nothing to push anymore'
          );
        }
      }
    }
  };

  dexie.Version.prototype['_parseStoresSpec'] = Dexie.override(
    dexie.Version.prototype['_parseStoresSpec'],
    (origFunc) => overrideParseStoresSpec(origFunc, dexie)
  );

  dexie.use(
    createMutationTrackingMiddleware({
      currentUserObservable: dexie.cloud.currentUser,
      db: DexieCloudDB(dexie)
    })
  );
  dexie.use(createImplicitPropSetterMiddleware(DexieCloudDB(dexie)));
  dexie.use(createIdGenerationMiddleware(DexieCloudDB(dexie)));
}

dexieCloud.version = '{version}';

Dexie.Cloud = dexieCloud;

//Dexie.addons.push(dexieCloud);

export default dexieCloud;
