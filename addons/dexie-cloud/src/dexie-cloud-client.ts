import Dexie, { liveQuery, Subscription } from 'dexie';
import { getDbNameFromDbUrl } from 'dexie-cloud-common';
import { BehaviorSubject, combineLatest, from, fromEvent } from 'rxjs';
import { filter, map, skip, startWith, switchMap, take } from 'rxjs/operators';
import { login } from './authentication/login';
import { UNAUTHORIZED_USER } from './authentication/UNAUTHORIZED_USER';
import { DexieCloudDB } from './db/DexieCloudDB';
import { PersistedSyncState } from './db/entities/PersistedSyncState';
import { DexieCloudOptions } from './DexieCloudOptions';
import { DISABLE_SERVICEWORKER_STRATEGY } from './DISABLE_SERVICEWORKER_STRATEGY';
import './extend-dexie-interface';
import { DexieCloudSyncOptions } from './extend-dexie-interface';
import { dbOnClosed } from './helpers/dbOnClosed';
import { IS_SERVICE_WORKER } from './helpers/IS_SERVICE_WORKER';
import { throwVersionIncrementNeeded } from './helpers/throwVersionIncrementNeeded';
import { createIdGenerationMiddleware } from './middlewares/createIdGenerationMiddleware';
import { createImplicitPropSetterMiddleware } from './middlewares/createImplicitPropSetterMiddleware';
import { createMutationTrackingMiddleware } from './middlewares/createMutationTrackingMiddleware';
//import { dexieCloudSyncProtocol } from "./dexieCloudSyncProtocol";
import { overrideParseStoresSpec } from './overrideParseStoresSpec';
import { performInitialSync } from './performInitialSync';
import { connectWebSocket } from './sync/connectWebSocket';
import { isSyncNeeded } from './sync/isSyncNeeded';
import { LocalSyncWorker } from './sync/LocalSyncWorker';
import {
  registerPeriodicSyncEvent,
  registerSyncEvent,
} from './sync/registerSyncEvent';
import { triggerSync } from './sync/triggerSync';
import { DXCUserInteraction } from './types/DXCUserInteraction';
import { SyncState } from './types/SyncState';
import { updateSchemaFromOptions } from './updateSchemaFromOptions';
import { verifySchema } from './verifySchema';
import { setupDefaultGUI } from './default-ui';
import { DXCWebSocketStatus } from './DXCWebSocketStatus';
import { computeSyncState } from './computeSyncState';

export { DexieCloudTable } from './extend-dexie-interface';

export function dexieCloud(dexie: Dexie) {
  const origIdbName = dexie.name;
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
      try {
        await onDbReady(dexie);
      } catch (error) {
        console.error(error);
        // Make sure to succeed with database open even if network is down.
      }
    },
    true // true = sticky
  );

  /** Void starting subscribers after a close has happened. */
  let closed = false;
  function throwIfClosed() {
    if (closed) throw new Dexie.DatabaseClosedError();
  }

  dbOnClosed(dexie, () => {
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    closed = true;
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
    syncState: new BehaviorSubject<SyncState>({
      phase: 'initial',
      status: 'not-started',
    }),
    persistedSyncState: new BehaviorSubject<PersistedSyncState | undefined>(
      undefined
    ),
    userInteraction: new BehaviorSubject<DXCUserInteraction | undefined>(
      undefined
    ),
    webSocketStatus: new BehaviorSubject<DXCWebSocketStatus>('not-started'),
    async login(hint) {
      const db = DexieCloudDB(dexie);
      await db.cloud.sync();
      await login(db, hint);
    },
    configure(options: DexieCloudOptions) {
      dexie.cloud.options = options;
      if (options.databaseUrl) {
        // @ts-ignore
        dexie.name = `${origIdbName}-${getDbNameFromDbUrl(
          options.databaseUrl
        )}`;
        DexieCloudDB(dexie).reconfigure(); // Update observable from new dexie.name
      }
      updateSchemaFromOptions(dexie.cloud.schema, dexie.cloud.options);
    },
    async sync(
      { wait, purpose }: DexieCloudSyncOptions = { wait: true, purpose: "push" }
    ) {
      if (wait === undefined) wait = true;
      const db = DexieCloudDB(dexie);
      if (purpose === "pull") {
        const syncState = db.cloud.persistedSyncState.value;
        triggerSync(db, purpose);
        if (wait) {
          const newSyncState = await db.cloud.persistedSyncState
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
        const syncState = db.cloud.persistedSyncState.value;
        triggerSync(db, purpose);
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
    },
  };

  dexie.Version.prototype['_parseStoresSpec'] = Dexie.override(
    dexie.Version.prototype['_parseStoresSpec'],
    (origFunc) => overrideParseStoresSpec(origFunc, dexie)
  );

  dexie.use(
    createMutationTrackingMiddleware({
      currentUserObservable: dexie.cloud.currentUser,
      db: DexieCloudDB(dexie),
    })
  );
  dexie.use(createImplicitPropSetterMiddleware(DexieCloudDB(dexie)));
  dexie.use(createIdGenerationMiddleware(DexieCloudDB(dexie)));

  async function onDbReady(dexie: Dexie) {
    closed = false; // As Dexie calls us, we are not closed anymore. Maybe reopened? Remember db.ready event is registered with sticky flag!
    const db = DexieCloudDB(dexie);
    // Setup default GUI:
    if (!IS_SERVICE_WORKER) {
      if (!db.cloud.options?.customLoginGui) {
        subscriptions.push(setupDefaultGUI(dexie));
      }
      subscriptions.push(computeSyncState(db).subscribe(dexie.cloud.syncState));
    }

    //verifyConfig(db.cloud.options); Not needed (yet at least!)
    // Verify the user has allowed version increment.
    if (!db.tables.every((table) => table.core)) {
      throwVersionIncrementNeeded();
    }
    const swRegistrations =
      'serviceWorker' in navigator
        ? await navigator.serviceWorker.getRegistrations()
        : [];

    const initiallySynced = await db.transaction(
      'rw',
      db.$syncState,
      async () => {
        const { options, schema } = db.cloud;
        const [persistedOptions, persistedSchema, persistedSyncState] =
          await Promise.all([
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
          await db.$syncState.put(options, 'options');
        }
        if (
          db.cloud.options?.tryUseServiceWorker &&
          'serviceWorker' in navigator &&
          swRegistrations.length > 0 &&
          !DISABLE_SERVICEWORKER_STRATEGY
        ) {
          // * Configured for using service worker if available.
          // * Browser supports service workers
          // * There are at least one service worker registration
          console.debug('Dexie Cloud Addon: Using service worker');
          db.cloud.usingServiceWorker = true;
        } else {
          // Not configured for using service worker or no service worker
          // registration exists. Don't rely on service worker to do any job.
          // Use LocalSyncWorker instead.
          if (db.cloud.options?.tryUseServiceWorker && !IS_SERVICE_WORKER) {
            console.debug(
              'dexie-cloud-addon: Not using service worker.',
              swRegistrations.length === 0
                ? 'No SW registrations found.'
                : 'serviceWorker' in navigator && DISABLE_SERVICEWORKER_STRATEGY
                ? 'Avoiding SW background sync and SW periodic bg sync for this browser due to browser bugs.'
                : 'navigator.serviceWorker not present'
            );
          }
          db.cloud.usingServiceWorker = false;
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
          // Update persisted schema (but don't overwrite table prefixes)
          const newPersistedSchema = persistedSchema || {};
          for (const [table, tblSchema] of Object.entries(schema)) {
            const newTblSchema = newPersistedSchema[table];
            if (!newTblSchema) {
              newPersistedSchema[table] = { ...tblSchema };
            } else {
              newTblSchema.markedForSync = tblSchema.markedForSync;
              tblSchema.deleted = newTblSchema.deleted;
              newTblSchema.generatedGlobalId = tblSchema.generatedGlobalId;
            }
          }
          await db.$syncState.put(newPersistedSchema, 'schema');

          // Make sure persisted table prefixes are being used instead of computed ones:
          // Let's assign all props as the newPersistedSchems should be what we should be working with.
          Object.assign(schema, newPersistedSchema);
        }
        return persistedSyncState?.initiallySynced;
      }
    );

    if (initiallySynced) {
      db.setInitiallySynced(true);
    }

    verifySchema(db);

    if (db.cloud.options?.databaseUrl && !initiallySynced) {
      await performInitialSync(db, db.cloud.options, db.cloud.schema!);
      db.setInitiallySynced(true);
    }

    // Manage CurrentUser observable:
    throwIfClosed();
    if (!IS_SERVICE_WORKER) {
      subscriptions.push(
        liveQuery(() => db.getCurrentUser()).subscribe(currentUserEmitter)
      );
      // Manage PersistendSyncState observable:
      subscriptions.push(
        liveQuery(() => db.getPersistedSyncState()).subscribe(
          db.cloud.persistedSyncState
        )
      );
      // Wait till currentUser and persistedSyncState gets populated
      // with things from the database and not just the default values.
      // This is so that when db.open() completes, user should be safe
      // to subscribe to these observables and get actual data.
      await combineLatest([
        currentUserEmitter.pipe(skip(1), take(1)),
        db.cloud.persistedSyncState.pipe(skip(1), take(1))
      ]).toPromise();
    }

    // HERE: If requireAuth, do athentication now.
    if (db.cloud.options?.requireAuth) {
      await login(db);
    }

    if (localSyncWorker) localSyncWorker.stop();
    localSyncWorker = null;
    throwIfClosed();
    if (db.cloud.usingServiceWorker && db.cloud.options?.databaseUrl) {
      registerSyncEvent(db, "push").catch(() => {});
      registerPeriodicSyncEvent(db).catch(() => {});
    } else if (
      db.cloud.options?.databaseUrl &&
      db.cloud.schema &&
      !IS_SERVICE_WORKER
    ) {
      // There's no SW. Start SyncWorker instead.
      localSyncWorker = LocalSyncWorker(db, db.cloud.options, db.cloud.schema!);
      localSyncWorker.start();
      triggerSync(db, "push");
    }

    // Listen to online event and do sync.
    throwIfClosed();
    if (!IS_SERVICE_WORKER) {
      subscriptions.push(
        fromEvent(self, 'online').subscribe(() => {
          console.debug('online!');
          db.syncStateChangedEvent.next({
            phase: 'not-in-sync',
          });
          triggerSync(db, "push");
        }),
        fromEvent(self, 'offline').subscribe(() => {
          console.debug('offline!');
          db.syncStateChangedEvent.next({
            phase: 'offline',
          });
        })
      );
    }

    // Connect WebSocket only if we're a browser window
    if (
      typeof window !== 'undefined' &&
      !IS_SERVICE_WORKER &&
      db.cloud.options?.databaseUrl
    ) {
      subscriptions.push(connectWebSocket(db));
    }
  }
}

dexieCloud.version = '{version}';

Dexie.Cloud = dexieCloud;

//Dexie.addons.push(dexieCloud);

export default dexieCloud;
