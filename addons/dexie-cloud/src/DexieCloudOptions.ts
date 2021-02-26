export interface DexieCloudOptions {
  databaseUrl: string;
  requireAuth?: boolean;
  serviceWorker?: boolean;
  fetchToken?: (email?: string) => Promise<any>;
}
