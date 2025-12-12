export type SyncChange = UpsertSyncChange | UpdateSyncChange | DeleteSyncChange;

export interface UpsertSyncChange {
  type: 'upsert';
  realmId: string;
  table: string;
  key: string;
  value: object;
}
export interface UpdateSyncChange {
  type: 'update';
  realmId: string;
  table: string;
  key: string;
  updates: { [keyPath: string]: any };
}
export interface DeleteSyncChange {
  type: 'delete';
  realmId: string;
  table: string;
  key: string;
}
