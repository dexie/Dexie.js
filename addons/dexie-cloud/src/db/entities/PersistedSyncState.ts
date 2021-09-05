export interface PersistedSyncState {
  serverRevision?: any;
  latestRevisions: {
    [tableName: string]: number
  };
  realms: string[];
  inviteRealms: string[];
  clientIdentity: string;
  initiallySynced?: boolean;
  remoteDbId?: string;
  syncedTables: string[];
  timestamp?: Date;
  error?: string;
}
