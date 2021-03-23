import { TokenFinalResponse } from 'dexie-cloud-common';

export interface DexieCloudOptions {
  databaseUrl: string;
  requireAuth?: boolean;
  serviceWorker?: boolean;
  customLoginGui?: boolean;
  nonSyncedTables?: string[];
  fetchTokens?: (tokenParams: any) => Promise<TokenFinalResponse>;
}
