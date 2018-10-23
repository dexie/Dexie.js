export interface DexieExportJsonStructure {
  name: string;
  version: number;
  data: DexieExportedTable[];
}

export interface DexieExportedTable {
  name: string;
  schema: string;
  values: any[];
  keys?: any[];
}
