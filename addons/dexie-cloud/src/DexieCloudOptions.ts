import { TokenFinalResponse } from 'dexie-cloud-common';

export interface DexieCloudOptions {
  databaseUrl: string;
  requireAuth?: boolean;
  serviceWorker?: boolean;
  customLoginGui?: boolean;
  fetchTokens?: (tokenParams: any) => Promise<TokenFinalResponse>;
}
