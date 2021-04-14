import Dexie, { Collection, Table } from 'dexie';
import { TokenFinalResponse } from 'dexie-cloud-common';

export interface DexieCloudOptions {
  databaseUrl: string;
  requireAuth?: boolean;
  usingServiceWorker?: boolean;
  customLoginGui?: boolean;
  syncedTables?: string[];
  fetchTokens?: (tokenParams: any) => Promise<TokenFinalResponse>;
}
