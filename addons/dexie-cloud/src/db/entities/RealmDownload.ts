/**
 * Persistent state for an ongoing realm download.
 * Used to resume an interrupted download on page-reload.
 */
export interface RealmDownload {
  /** Primary key */
  realmId: string;

  /**
   * The serverRevision that the server indicated in the realm-start header.
   * Sent back to the server on resume to get delta objects.
   */
  serverRevision: string;

  /**
   * Opaque cursor: "tableName:objectId" — the last object written to IDB.
   * Format: `${tbl}:${id}` — server parses this to jump to the right position.
   * Null if the download just started (no cursor yet).
   */
  resumeCursor: string | null;

  /** Total number of objects to download (from estimatedCount in realm-start) */
  totalCount: number;

  /** Number of objects downloaded so far */
  downloadedCount: number;

  /** When the download started */
  startedAt: Date;
}
