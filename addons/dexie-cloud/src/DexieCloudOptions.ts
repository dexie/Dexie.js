import Dexie, { Collection, Table } from 'dexie';
import { TokenFinalResponse } from 'dexie-cloud-common';

export interface PeriodicSyncOptions {
  minInterval?: number;
}
export interface DexieCloudOptions {
  databaseUrl: string;
  requireAuth?: boolean;
  tryUseServiceWorker?: boolean;
  customLoginGui?: boolean;
  unsyncedTables?: string[];
  periodicSync?: PeriodicSyncOptions;
  fetchTokens?: (tokenParams: {
    public_key: string;
    hints?: { userId?: string; email?: string };
  }) => Promise<TokenFinalResponse>;
}
