export interface PersistedSyncState {
  serverRevision?: any;
  latestRevisions: {
    [tableName: string]: number
  };
  realms?: string[];
  initiallySynced?: boolean;
  remoteDbId?: string;
  syncedTables: string[];
}
