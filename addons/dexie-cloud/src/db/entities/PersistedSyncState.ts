export interface PersistedSyncState {
  serverRevision?: any;
  baseRevisions?: {
    [table: string]: {
      prevServerRev?: any;
      clientRev: number;
      newServerRev?: any;
    }
  };
  realms?: string[];
  initiallySynced?: boolean;
  remoteDbId?: string;
  syncedTables: string[];
}
