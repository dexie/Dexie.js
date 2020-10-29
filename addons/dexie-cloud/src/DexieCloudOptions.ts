export interface DexieCloudOptions {
  databaseUrl: string;
  requireAuth?: boolean;
  fetchToken?: (email?: string) => Promise<any>;
}
