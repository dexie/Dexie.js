export type SyncStatePhase = "initial" | "not-in-sync" | "pushing" | "pulling" | "in-sync" | 'error' | 'offline';
export type SyncStatus = "not-started" | "connecting" | "connected" | "disconnected" | "error" | "offline";
export interface SyncState {
  status: SyncStatus;
  phase: SyncStatePhase;
  progress?: number; // 0..100
  error?: Error; // If phase === "error"
}
