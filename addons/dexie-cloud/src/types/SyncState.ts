export interface SyncState {
  id: "syncState";
  serverRevision: any;
  realms: string[];
  initiallySynced: boolean;
  tableAliases: {[tableName: string]: string};
}
