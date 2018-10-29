
import Dexie from 'dexie';
import { getSchemaString, extractDbSchema } from './helpers';
import { DexieExportedTable, DexieExportJsonStructure } from './json-structure';
import { TSON } from './tson';

export interface ExportOptions {
  numRowsPerChunk?: number;
  noTransaction?: boolean;
  filter?: (table: string, value: any, key?: any) => boolean;
  progressCallback?: (progress: ExportProgress) => boolean;
}

export interface ExportProgress {
  totalTables: number;
  completedTables: number;
  totalRows: number | undefined;
  completedRows: number;
  done: boolean;
}

export async function exportDB(db: Dexie, options?: ExportOptions): Promise<Blob> {
  options = options || {};
  const slices: (string | Blob)[] = [];
  const tables = db.tables.map(table => ({
    name: table.name,
    schema: getSchemaString(table),
    rowCount: 0
  }));
  const emptyExport: DexieExportJsonStructure = {
    formatName: "dexie",
    formatVersion: 1,
    data: {
      databaseName: db.name,
      databaseVersion: db.verno,
      tables: tables,
      data: []}};
  
  const lastJsonSlice = "]}}";// End of array + end of object + end of object.
  const {progressCallback} = options!;
  const progress: ExportProgress = {
    done: false,
    completedRows: 0,
    completedTables: 0,
    totalRows: NaN,
    totalTables: db.tables.length
  };

  if (options!.noTransaction) {
    await exportAll();
  } else {
    await db.transaction('r', db.tables, exportAll);
  }

  if (progressCallback) {
    if (progressCallback(progress)) throw new Error("Operation aborted");
  }
  slices.push(lastJsonSlice);
  return new Blob(slices,{type: "text/json"});

  async function exportAll() {
    // Count rows:
    const tablesRowCounts = await Promise.all(db.tables.map(table => table.count()));
    tablesRowCounts.forEach((rowCount, i) => tables[i].rowCount = rowCount);
    progress.totalRows = tablesRowCounts.reduce((p,c)=>p+c);

    // Write first JSON slice
    const emptyExportJson = JSON.stringify(emptyExport);
    const firstJsonSlice = emptyExportJson.substring(0, emptyExportJson.length - lastJsonSlice.length);
    slices.push(firstJsonSlice);

    const filter = options!.filter;

    for (const {name: tableName} of tables) {
      const table = db.table(tableName);
      const {primKey} = table.schema;
      const inbound = !!primKey.keyPath;
      const LIMIT = options!.numRowsPerChunk || 2000;
      const emptyTableExport: DexieExportedTable = inbound ? {
        tableName: table.name,
        inbound: true,
        rows: []
      } : {
        tableName: table.name,
        inbound: false,
        rows: []
      };
      const lastTableJsonSlice = "]}";
      const emptyTableExportJson = JSON.stringify(emptyTableExport);
      slices.push(emptyExportJson.substring(0, emptyTableExportJson.length - lastTableJsonSlice.length));
      let lastKey: any = null;
      let hasMore = true;
      while (hasMore) {
        if (progressCallback) {
          if (progressCallback(progress)) throw new Error("Operation aborted");
        }
        const chunkedCollection = lastKey == null ?
          table.limit(LIMIT) :
          table.where(':id').above(lastKey).limit(LIMIT);

        const values = await chunkedCollection.toArray();
        hasMore = values.length === LIMIT;
        if (inbound) {
          const filteredValues = filter ?
            values.filter(value => filter(tableName, value)) :
            values;
          const tsonValues = values.map(value => TSON.encapsulate(value));
          const json = JSON.stringify(tsonValues);

          // By generating a blob here, we give web platform the opportunity to store the contents
          // on disk and release RAM.
          slices.push(new Blob([json.substring(1, json.length - 2)]));
          lastKey = Dexie.getByKeyPath(values[values.length -1], primKey.keyPath as string);
        } else {
          const keys = await chunkedCollection.primaryKeys();
          let keyvals = keys.map((key, i) => [key, values[i]]);
          if (filter) keyvals = keyvals.filter(([key, value]) => filter(tableName, value, key));
          const tsonTuples = keyvals.map(tuple => TSON.encapsulate(tuple));
          const json = JSON.stringify(tsonTuples);

          // By generating a blob here, we give web platform the opportunity to store the contents
          // on disk and release RAM.
          slices.push(new Blob([json.substring(1, json.length - 2)]));
          lastKey = keys[keys.length - 1];
        }
        progress.completedRows += values.length;
      }
      slices.push(lastTableJsonSlice);
      progress.completedTables += 1;
    }
    progress.done = true;
    if (progressCallback) {
      if (progressCallback(progress)) throw new Error("Operation aborted");
    }
  }
}
