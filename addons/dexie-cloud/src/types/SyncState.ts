export type SyncStatePhase = "initial" | "not-in-sync" | "pushing" | "pulling" | "in-sync" | 'error' | 'offline';
export interface SyncState {
  phase: SyncStatePhase;
  progress?: number; // 0..100
}