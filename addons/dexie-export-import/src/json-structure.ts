export const VERSION = 1;

export interface DexieExportJsonStructure {
  formatName: 'dexie';
  formatVersion: typeof VERSION;
  data: {
    databaseName: string;
    databaseVersion: number;
    tables: Array<{
      name: string;
      schema: string;
      rowCount: number;
    }>;
    data: Array<{
      tableName: string;
      inbound: boolean;
      rows: any[];
    }>;
  }
}

export type DexieExportedDatabase = DexieExportJsonStructure["data"];
export type DexieExportedTable = DexieExportedDatabase["data"][number];
