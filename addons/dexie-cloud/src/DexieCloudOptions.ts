import type { TokenFinalResponse } from 'dexie-cloud-common';
import type { LoginHints } from './DexieCloudAPI';

export interface PeriodicSyncOptions {
  // The minimum interval time, in milliseconds, at which the service-worker's
  // periodic sync should occur.
  minInterval?: number;
}
export interface DexieCloudOptions {
  // URL to a database created with `npx dexie-cloud create`
  databaseUrl: string;

  // Whether to require authentication or opt-in to it using db.cloud.login()
  requireAuth?: boolean | LoginHints

  // Whether to use service worker. Combine with registering your own service
  // worker and import "dexie-cloud-addon/dist/modern/service-worker.min.js" from it.
  tryUseServiceWorker?: boolean;

  // Optional customization of periodic sync.
  // See https://developer.mozilla.org/en-US/docs/Web/API/PeriodicSyncManager/register
  periodicSync?: PeriodicSyncOptions;

  // Disable default login GUI and replace it with your own by
  // subscribing to the `db.cloud.userInteraction` observable and render its emitted data.
  customLoginGui?: boolean;

  // Array of table names that should be considered local-only and
  // not be synced with Dexie Cloud
  unsyncedTables?: string[];

  unsyncedProperties?: {
    [tableName: string]: string[];
  }

  // By default Dexie Cloud will suffix the cloud DB ID to your IndexedDB database name
  // in order to ensure that the local database is uniquely tied to the remote one and
  // will use another local database if databaseURL is changed or if dexieCloud addon
  // is not being used anymore.
  //
  // By setting this value to `false`, no suffix will be added to the database name and
  // instead, it will use the exact name that is specified in the Dexie constructor, 
  // without a suffix.
  nameSuffix?: boolean;

  // Disable websocket connection
  disableWebSocket?: boolean;

  // Disable automatic sync on changes
  disableEagerSync?: boolean;

  // Provides a custom way of fetching the JWT tokens. This option
  // can be used when integrating with custom authentication.
  // See https://dexie.org/cloud/docs/db.cloud.configure()#fetchtoken
  fetchTokens?: (tokenParams: {
    public_key: string;
    hints?: { userId?: string; email?: string };
  }) => Promise<TokenFinalResponse>;

  awarenessProtocol?: typeof import('y-protocols/awareness');
}
