import Dexie, { liveQuery, Subscription, Table } from 'dexie';
import {
  DBPermissionSet,
  DBRealmMember,
  getDbNameFromDbUrl,
} from 'dexie-cloud-common';
import { BehaviorSubject, combineLatest, firstValueFrom, from, fromEvent, Subject } from 'rxjs';
import { filter, map, skip, startWith, switchMap, take } from 'rxjs/operators';
import { login } from './authentication/login';
import { UNAUTHORIZED_USER } from './authentication/UNAUTHORIZED_USER';
import { DexieCloudDB } from './db/DexieCloudDB';
import { PersistedSyncState } from './db/entities/PersistedSyncState';
import { DexieCloudOptions } from './DexieCloudOptions';
import { DISABLE_SERVICEWORKER_STRATEGY } from './DISABLE_SERVICEWORKER_STRATEGY';
import './extend-dexie-interface';
import { DexieCloudSyncOptions } from './DexieCloudSyncOptions';
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
import { generateKey } from './middleware-helpers/idGenerationHelpers';
import { permissions } from './permissions';
import { getCurrentUserEmitter } from './currentUserEmitter';
import { NewIdOptions } from './types/NewIdOptions';
import { getInvitesObservable } from './getInvitesObservable';
import { getGlobalRolesObservable } from './getGlobalRolesObservable';
import { UserLogin } from './db/entities/UserLogin';
import { InvalidLicenseError } from './InvalidLicenseError';
import { logout, _logout } from './authentication/logout';
import { loadAccessToken } from './authentication/authenticate';
import { isEagerSyncDisabled } from './isEagerSyncDisabled';
import { createYHandler } from "./yjs/createYHandler";
import { DexieYProvider } from 'y-dexie';
import { parseOAuthCallback, cleanupOAuthUrl } from './authentication/handleOAuthCallback';
import { OAuthError } from './errors/OAuthError';
import { alertUser } from './authentication/interactWithUser';
import { fetchAuthProviders } from './authentication/fetchAuthProviders';
export { DexieCloudTable } from './DexieCloudTable';
export * from './getTiedRealmId';
export {
  DBRealm,
  DBRealmMember,
  DBRealmRole,
  DBSyncedObject,
  DBPermissionSet,
  AuthProvidersResponse,
  OAuthProviderInfo,
} from 'dexie-cloud-common';
export { resolveText } from './helpers/resolveText';
export { Invite } from './Invite';
export type { UserLogin, DXCWebSocketStatus, SyncState };
export type { DexieCloudSyncOptions };
export type { DexieCloudOptions, PeriodicSyncOptions } from './DexieCloudOptions';
export * from './types/DXCAlert';
export * from './types/DXCInputField';
export * from './types/DXCUserInteraction';
export { defineYDocTrigger } from './define-ydoc-trigger';

const DEFAULT_OPTIONS: Partial<DexieCloudOptions> = {
  nameSuffix: true,
};

export function dexieCloud(dexie: Dexie) {
  const origIdbName = dexie.name;
  //
  //
  //
  const currentUserEmitter = getCurrentUserEmitter(dexie);
  const subscriptions: Subscription[] = [];
  let configuredProgramatically = false;
  
  // Pending OAuth auth code from dxc-auth redirect (detected in configure())
  let pendingOAuthCode: { code: string; provider: string } | null = null;
  
  // Pending OAuth error from dxc-auth redirect (detected in configure())
  let pendingOAuthError: OAuthError | null = null;

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

  dexie.once('close', () => {
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    subscriptions.splice(0, subscriptions.length);
    closed = true;
    localSyncWorker && localSyncWorker.stop();
    localSyncWorker = null;
    currentUserEmitter.next(UNAUTHORIZED_USER);
  });

  const syncComplete = new Subject<void>();

  dexie.cloud = {
    // @ts-ignore
    version: __VERSION__,
    options: { ...DEFAULT_OPTIONS } as DexieCloudOptions,
    schema: null,
    get currentUserId() {
      return currentUserEmitter.value.userId || UNAUTHORIZED_USER.userId!;
    },
    currentUser: currentUserEmitter,
    syncState: new BehaviorSubject<SyncState>({
      phase: 'initial',
      status: 'not-started',
    }),

    events: {
      syncComplete,
    },

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
    invites: getInvitesObservable(dexie),
    roles: getGlobalRolesObservable(dexie),
    configure(options: DexieCloudOptions) {
      options = dexie.cloud.options = { ...dexie.cloud.options, ...options };
      configuredProgramatically = true;
      if (options.databaseUrl && options.nameSuffix) {
        // @ts-ignore
        dexie.name = `${origIdbName}-${getDbNameFromDbUrl(
          options.databaseUrl
        )}`;
        DexieCloudDB(dexie).reconfigure(); // Update observable from new dexie.name
      }
      updateSchemaFromOptions(dexie.cloud.schema, dexie.cloud.options);
      
      // Check for OAuth callback (dxc-auth query parameter)
      // Only check in DOM environment, not workers
      if (typeof window !== 'undefined' && window.location) {
        try {
          const callback = parseOAuthCallback();
          if (callback) {
            // Store the pending auth code for processing when db is ready
            pendingOAuthCode = { code: callback.code, provider: callback.provider };
            console.debug('[dexie-cloud] OAuth callback detected, auth code stored for processing');
          }
        } catch (error) {
          // parseOAuthCallback throws OAuthError on error callbacks
          if (error instanceof OAuthError) {
            pendingOAuthError = error;
            console.error('[dexie-cloud] OAuth callback error:', error.message);
          } else {
            console.error('[dexie-cloud] OAuth callback error:', error);
          }
        }
      }
    },
    async logout({ force } = {}) {
      force
        ? await _logout(DexieCloudDB(dexie), { deleteUnsyncedData: true })
        : await logout(DexieCloudDB(dexie));
    },
    async getAuthProviders() {
      const options = dexie.cloud.options;
      if (!options?.databaseUrl) {
        throw new Error('Dexie Cloud not configured. Call db.cloud.configure() first.');
      }
      const socialAuthEnabled = options.socialAuth !== false;
      return fetchAuthProviders(options.databaseUrl, socialAuthEnabled);
    },
    async sync(
      { wait, purpose }: DexieCloudSyncOptions = { wait: true, purpose: 'push' }
    ) {
      if (wait === undefined) wait = true;
      const db = DexieCloudDB(dexie);
      const licenseStatus = db.cloud.currentUser.value.license?.status || 'ok';
      if (licenseStatus !== 'ok') {
        // Refresh access token to check for updated license
        await loadAccessToken(db);
      }
      if (purpose === 'pull') {
        const syncState = db.cloud.persistedSyncState.value;
        triggerSync(db, purpose);
        if (wait) {
          const newSyncState = await firstValueFrom(
            db.cloud.persistedSyncState.pipe(
              filter(
                (newSyncState) =>
                  newSyncState?.timestamp != null &&
                  (!syncState || newSyncState.timestamp > syncState.timestamp!)
              )
            )
          );
          if (newSyncState?.error) {
            throw new Error(`Sync error: ` + newSyncState.error);
          }
        }
      } else if (await isSyncNeeded(db)) {
        const syncState = db.cloud.persistedSyncState.value;
        triggerSync(db, purpose);
        if (wait) {
          console.debug('db.cloud.login() is waiting for sync completion...');
          await firstValueFrom(
            from(
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
            ).pipe(filter((isNeeded) => !isNeeded))
          );
          console.debug(
            'Done waiting for sync completion because we have nothing to push anymore'
          );
        }
      }
    },
    permissions(
      obj: { owner: string; realmId: string; table?: () => string },
      tableName?: string
    ) {
      return permissions(dexie._novip, obj, tableName);
    },
  };

  dexie.Version.prototype['_parseStoresSpec'] = Dexie.override(
    dexie.Version.prototype['_parseStoresSpec'],
    (origFunc) => overrideParseStoresSpec(origFunc, dexie)
  );

  dexie.Table.prototype.newId = function (
    this: Table<any>,
    { colocateWith }: NewIdOptions = {}
  ) {
    const shardKey =
      colocateWith && colocateWith.substr(colocateWith.length - 3);
    return generateKey(dexie.cloud.schema![this.name].idPrefix || '', shardKey);
  };

  dexie.Table.prototype.idPrefix = function (this: Table<any>) {
    return this.db.cloud.schema?.[this.name]?.idPrefix || '';
  };

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
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (!db.cloud.options?.customLoginGui) {
        subscriptions.push(setupDefaultGUI(dexie));
      }
    }
    if (!db.cloud.isServiceWorkerDB) {
      subscriptions.push(computeSyncState(db).subscribe(dexie.cloud.syncState));
    }

    // Forward db.syncCompleteEvent to be publicly consumable via db.cloud.events.syncComplete:
    subscriptions.push(db.syncCompleteEvent.subscribe(syncComplete));

    //verifyConfig(db.cloud.options); Not needed (yet at least!)
    // Verify the user has allowed version increment.
    if (!db.tables.every((table) => table.core)) {
      throwVersionIncrementNeeded();
    }
    const swRegistrations =
      'serviceWorker' in navigator
        ? await navigator.serviceWorker.getRegistrations()
        : [];

    const [initiallySynced, lastSyncedRealms] = await db.transaction(
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
        if (!configuredProgramatically) {
          // Options not specified programatically (use case for SW!)
          // Take persisted options:
          db.cloud.options = persistedOptions || null;
        } else if (
          !persistedOptions ||
          JSON.stringify(persistedOptions) !== JSON.stringify(options)
        ) {
          // Update persisted options:
          if (!options) throw new Error(`Internal error`); // options cannot be null if configuredProgramatically is set.
          const newPersistedOptions: DexieCloudOptions = {
            ...options,
          };
          delete newPersistedOptions.fetchTokens;
          delete newPersistedOptions.awarenessProtocol;
          await db.$syncState.put(newPersistedOptions, 'options');
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
          if (
            db.cloud.options?.tryUseServiceWorker &&
            !db.cloud.isServiceWorkerDB
          ) {
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
        return [persistedSyncState?.initiallySynced, persistedSyncState?.realms];
      }
    );

    if (initiallySynced) {
      db.setInitiallySynced(true);
    }

    verifySchema(db);

    // Manage CurrentUser observable:
    throwIfClosed();
    if (!db.cloud.isServiceWorkerDB) {
      subscriptions.push(
        liveQuery(() => db.getCurrentUser().then(user => {
          if (!user.isLoggedIn && typeof location !== 'undefined' && /dxc-auth\=/.test(location.search)) {
            // Still loading user because OAuth redirect just happened.
            // Keep isLoading true.
            return { ...user, isLoading: true };
          }
          return user;
        })).subscribe(currentUserEmitter)
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
      await firstValueFrom(combineLatest([
        currentUserEmitter.pipe(skip(1), take(1)),
        db.cloud.persistedSyncState.pipe(skip(1), take(1)),
      ]));

      const yHandler = createYHandler(db);
      DexieYProvider.on.new.subscribe(yHandler);
      db.dx.once('close', () => {
        DexieYProvider.on.new.unsubscribe(yHandler);
      });
    }

    // HERE: If requireAuth, do athentication now.
    let changedUser = false;
    let user = await db.getCurrentUser();
    
    // Show pending OAuth error if present (from dxc-auth redirect)
    if (pendingOAuthError && !db.cloud.isServiceWorkerDB) {
      const error = pendingOAuthError;
      pendingOAuthError = null; // Clear pending error
      console.debug('[dexie-cloud] Showing OAuth error:', error.message);
      // Show alert to user about the OAuth error
      // Guard so UI errors don't abort initialization
      try {
        await alertUser(db.cloud.userInteraction, 'Authentication Error', {
          type: 'error',
          messageCode: 'GENERIC_ERROR',
          message: error.message,
          messageParams: { provider: error.provider || 'unknown' }
        });
        // Clean up URL (remove dxc-auth param)
        cleanupOAuthUrl();
      } catch (uiError) {
        console.error('[dexie-cloud] Failed to show OAuth error alert:', uiError);
      }
    }
    
    // Process pending OAuth callback if present (from dxc-auth redirect)
    if (pendingOAuthCode && !db.cloud.isServiceWorkerDB) {
      const { code, provider } = pendingOAuthCode;
      pendingOAuthCode = null; // Clear pending code
      console.debug('[dexie-cloud] Processing OAuth callback, provider:', provider);
      try {
        changedUser = await login(db, { oauthCode: code, provider });
        user = await db.getCurrentUser();
        // Clean up URL (remove dxc-auth param)
        cleanupOAuthUrl();
      } catch (error) {
        console.error('[dexie-cloud] OAuth login failed:', error);
        // Continue with normal flow - user can try again
      }
    }
    
    const requireAuth = db.cloud.options?.requireAuth;
    if (requireAuth) {
      if (db.cloud.isServiceWorkerDB) {
        // If this is a service worker DB, we can't do authentication here,
        // we just wait until the application has done it.
        console.debug('Dexie Cloud Service worker. Waiting for application to authenticate.');
        await firstValueFrom(currentUserEmitter.pipe(filter((user) => !!user.isLoggedIn), take(1)));
        console.debug('Dexie Cloud Service worker. Application has authenticated.');
      } else {
        if (typeof requireAuth === 'object') {
          // requireAuth contains login hints. Check if we already fulfil it:
          if (
            !user.isLoggedIn ||
            (requireAuth.userId && user.userId !== requireAuth.userId) ||
            (requireAuth.email && user.email !== requireAuth.email)
          ) {
            // If not, login the configured user:
            changedUser = await login(db, requireAuth);
          }
        } else if (!user.isLoggedIn) {
          // requireAuth is true and user is not logged in
          changedUser = await login(db);
        }
      }
    }
    if (user.isLoggedIn && (!lastSyncedRealms || !lastSyncedRealms.includes(user.userId!))) {
      // User has been logged in but this is not reflected in the sync state.
      // This can happen if page is reloaded after login but before the sync call following
      // the login was complete.
      // The user is to be viewed as changed becuase current syncState does not reflect the presence
      // of the logged-in user.
      changedUser = true; // Set changedUser to true to trigger a pull-sync later down.
    }

    if (localSyncWorker) localSyncWorker.stop();
    localSyncWorker = null;
    throwIfClosed();

    const doInitialSync = db.cloud.options?.databaseUrl && (!initiallySynced || changedUser);
    if (doInitialSync) {
      // Do the initial sync directly in the browser thread no matter if we are using service worker or not.
      await performInitialSync(db, db.cloud.options!, db.cloud.schema!);
      db.setInitiallySynced(true);
    }

    throwIfClosed();
    if (db.cloud.usingServiceWorker && db.cloud.options?.databaseUrl) {
      if (!doInitialSync) {
        registerSyncEvent(db, 'push').catch(() => {});
      }
      registerPeriodicSyncEvent(db).catch(() => {});
    } else if (
      db.cloud.options?.databaseUrl &&
      db.cloud.schema &&
      !db.cloud.isServiceWorkerDB
    ) {
      // There's no SW. Start SyncWorker instead.
      localSyncWorker = LocalSyncWorker(db, db.cloud.options, db.cloud.schema!);
      localSyncWorker.start();
      if (!doInitialSync) {
        triggerSync(db, 'push');
      }
    }

    // Listen to online event and do sync.
    throwIfClosed();
    if (!db.cloud.isServiceWorkerDB) {
      subscriptions.push(
        fromEvent(self, 'online').subscribe(() => {
          console.debug('online!');
          db.syncStateChangedEvent.next({
            phase: 'not-in-sync',
          });
          if (!isEagerSyncDisabled(db)) {
            triggerSync(db, 'push');
          }
        }),
        fromEvent(self, 'offline').subscribe(() => {
          console.debug('offline!');
          db.syncStateChangedEvent.next({
            phase: 'offline',
          });
        })
      );
    }

    // Connect WebSocket unless we are in a service worker or websocket is disabled.
    if (
      db.cloud.options?.databaseUrl &&
      !db.cloud.options?.disableWebSocket &&
      !IS_SERVICE_WORKER
    ) {
      subscriptions.push(connectWebSocket(db));
    }
  }
}

// @ts-ignore
dexieCloud.version = __VERSION__;

Dexie.Cloud = dexieCloud;

export default dexieCloud;
