export interface PersistedSyncState {
  serverRevision?: any;
  yServerRevision?: string;
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
  yDownloadedRealms?: {
    [realmId: string]: "*" | {
      tbl: string;
      prop: string;
      key: any;
    }
  }
}
