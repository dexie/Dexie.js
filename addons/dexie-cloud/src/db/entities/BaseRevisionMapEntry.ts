// This interface has been moved to dexie-cloud-common. TODO: Remove file and update imports.
export interface BaseRevisionMapEntry {
  tableName: string;
  clientRev: number;
  serverRev: any;
}