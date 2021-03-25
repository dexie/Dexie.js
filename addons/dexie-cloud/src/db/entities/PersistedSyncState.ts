export interface PersistedSyncState {
  id: "syncState";
  serverRevision: any;
  realms: string[];
  initiallySynced: boolean;
}
