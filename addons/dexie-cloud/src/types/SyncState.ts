export interface SyncState {
  id: "syncState";
  serverRevision: any;
  realms: string[];
  initiallySynced: boolean;
}