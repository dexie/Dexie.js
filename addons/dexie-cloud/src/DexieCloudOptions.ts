import Dexie, { Collection, Table } from 'dexie';
import { TokenFinalResponse } from 'dexie-cloud-common';

export interface PeriodicSyncOptions {
  minInterval?: number;
}
export interface DexieCloudOptions {
  databaseUrl: string;
  requireAuth?: boolean;
  usingServiceWorker?: boolean;
  customLoginGui?: boolean;
  syncedTables?: string[];
  unsyncedTables?: string[];
  periodicSync?: PeriodicSyncOptions;
  fetchTokens?: (tokenParams: any) => Promise<TokenFinalResponse>;
}
