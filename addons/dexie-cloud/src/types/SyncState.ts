export type SyncStatePhase =
  | 'initial'
  | 'not-in-sync'
  | 'pushing'
  | 'pulling'
  | 'downloading-ydocs'
  | 'downloading-blobs'
  | 'in-sync'
  | 'error'
  | 'offline';
export type SyncStatus =
  | 'not-started'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'offline';
export interface SyncProgress {
  objs: { downloaded: number; total: number };
  ydocs: { downloaded: number; total: number };
  blobs: { downloaded: number; total: number };
}
export interface SyncState {
  status: SyncStatus;
  phase: SyncStatePhase;
  /**
   * Three independent counters: objects (incl. members), Y-docs, blobs.
   * UI may render three progress bars side by side.
   * UI should cap rendered values to `total` (Math.min(downloaded, total))
   * until `realm-complete` corrects `total` via `total += actual - estimate`.
   */
  progress?: SyncProgress;
  error?: Error; // If phase === "error"
  license?: 'ok' | 'expired' | 'deactivated';
}
