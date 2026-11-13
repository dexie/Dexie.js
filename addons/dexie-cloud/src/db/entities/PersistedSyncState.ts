export interface PersistedSyncState {
  serverRevision?: any;
  yServerRevision?: string;
  latestRevisions: {
    [tableName: string]: number;
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
    [realmId: string]:
      | '*'
      | {
          tbl: string;
          prop: string;
          key: any;
        };
  };

  /**
   * Paginated sync v4: ongoing realm downloads.
   * Map from realmId → resume info. Absent/empty when no downloads are in progress.
   * Persisted in the same `$syncState` record as the rest of sync state.
   */
  realmDownloads?: { [realmId: string]: RealmDownloadState };
}

/**
 * Persistent state for an ongoing realm download.
 * Used to resume an interrupted download on page-reload.
 */
export interface RealmDownloadState {
  /**
   * The serverRevision the server indicated in the realm-start header.
   * Sent back to the server on resume to get delta objects.
   */
  serverRevision: string;

  /**
   * Opaque cursor: "tableName:objectId" — the last object written to IDB.
   * Format: `${tbl}:${id}` — the server parses this to jump to the right position.
   * Null if the download just started (no cursor yet).
   */
  resumeCursor: string | null;

  /** Total number of objects to download (from estimate in sync-start) */
  totalCount: number;

  /** Number of objects downloaded so far */
  downloadedCount: number;

  /**
   * When the download started (ISO string for JSON serialization in $syncState).
   */
  startedAt: string;
}
