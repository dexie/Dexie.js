
import Dexie from 'dexie';
import { getSchemaString, extractDbSchema } from './helpers';
import { DexieExportedTable, DexieExportJsonStructure } from './json-structure';
import { TSON } from './tson';

export interface ExportOptions {
  noTransaction?: boolean;
  numRowsPerChunk?: number;
  prettyJson?: boolean;
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

const DEFAULT_ROWS_PER_CHUNK = 2000;

export async function exportDB(db: Dexie, options?: ExportOptions): Promise<Blob> {
  options = options || {};
  const slices: (string | Blob)[] = [];
  const tables = db.tables.map(table => ({
    name: table.name,
    schema: getSchemaString(table),
    rowCount: 0
  }));
  const {prettyJson} = options!;
  const emptyExport: DexieExportJsonStructure = {
    formatName: "dexie",
    formatVersion: 1,
    data: {
      databaseName: db.name,
      databaseVersion: db.verno,
      tables: tables,
      data: []
    }
  };
  
  const {progressCallback} = options!;
  const progress: ExportProgress = {
    done: false,
    completedRows: 0,
    completedTables: 0,
    totalRows: NaN,
    totalTables: db.tables.length
  };

  try {
    if (options!.noTransaction) {
      await exportAll();
    } else {
      await db.transaction('r', db.tables, exportAll);
    }
  } finally {
    TSON.finalize(); // Free up mem if error has occurred
  }

  if (progressCallback) {
    // Keep ongoing transaction private
    Dexie.ignoreTransaction(()=>progressCallback(progress));
  }
  return new Blob(slices,{type: "text/json"});

  async function exportAll() {
    // Count rows:
    const tablesRowCounts = await Promise.all(db.tables.map(table => table.count()));
    tablesRowCounts.forEach((rowCount, i) => tables[i].rowCount = rowCount);
    progress.totalRows = tablesRowCounts.reduce((p,c)=>p+c);

    // Write first JSON slice
    const emptyExportJson = JSON.stringify(emptyExport, undefined, prettyJson ? 2 : undefined);
    const posEndDataArray = emptyExportJson.lastIndexOf(']');
    const firstJsonSlice = emptyExportJson.substring(0, posEndDataArray);
    slices.push(firstJsonSlice);

    const filter = options!.filter;

    for (const {name: tableName} of tables) {
      const table = db.table(tableName);
      const {primKey} = table.schema;
      const inbound = !!primKey.keyPath;
      const LIMIT = options!.numRowsPerChunk || DEFAULT_ROWS_PER_CHUNK;
      const emptyTableExport: DexieExportedTable = inbound ? {
        tableName: table.name,
        inbound: true,
        rows: []
      } : {
        tableName: table.name,
        inbound: false,
        rows: []
      };
      let emptyTableExportJson = JSON.stringify(emptyTableExport, undefined, prettyJson ? 2 : undefined);
      if (prettyJson) {
        // Increase indentation according to this:
        // {
        //   ...
        //   data: [
        //     ...
        //     data: [
        // 123456<---- here
        //     ] 
        //   ]
        // }
        emptyTableExportJson = emptyTableExportJson.split('\n').join('\n    ');
      }
      const posEndRowsArray = emptyTableExportJson.lastIndexOf(']');
      slices.push(emptyTableExportJson.substring(0, posEndRowsArray));
      let lastKey: any = null;
      let lastNumRows = 0;
      let mayHaveMoreRows = true;
      while (mayHaveMoreRows) {
        if (progressCallback) {
          // Keep ongoing transaction private
          Dexie.ignoreTransaction(()=>progressCallback(progress));
        }
        const chunkedCollection = lastKey == null ?
          table.limit(LIMIT) :
          table.where(':id').above(lastKey).limit(LIMIT);

        const values = await chunkedCollection.toArray();

        if (values.length === 0) break;

        if (lastKey != null && lastNumRows > 0) {
          // Not initial chunk. Must add a comma:
          slices.push(",");
          if (prettyJson) {
            slices.push("\n      ");
          }
        }

        mayHaveMoreRows = values.length === LIMIT;
        
        if (inbound) {
          const filteredValues = filter ?
            values.filter(value => filter(tableName, value)) :
            values;

          const tsonValues = filteredValues.map(value => TSON.encapsulate(value));
          if (TSON.mustFinalize()) {
            await Dexie.waitFor(TSON.finalize(tsonValues));
          }

          let json = JSON.stringify(tsonValues, undefined, prettyJson ? 2 : undefined);
          if (prettyJson) json = json.split('\n').join('\n      ');

          // By generating a blob here, we give web platform the opportunity to store the contents
          // on disk and release RAM.
          slices.push(new Blob([json.substring(1, json.length - 1)]));
          lastNumRows = filteredValues.length;
          lastKey = values.length > 0 ?
            Dexie.getByKeyPath(values[values.length -1], primKey.keyPath as string) :
            null;
        } else {
          const keys = await chunkedCollection.primaryKeys();
          let keyvals = keys.map((key, i) => [key, values[i]]);
          if (filter) keyvals = keyvals.filter(([key, value]) => filter(tableName, value, key));

          const tsonTuples = keyvals.map(tuple => TSON.encapsulate(tuple));
          if (TSON.mustFinalize()) {
            await Dexie.waitFor(TSON.finalize(tsonTuples));
          }

          let json = JSON.stringify(tsonTuples, undefined, prettyJson ? 2 : undefined);
          if (prettyJson) json = json.split('\n').join('\n      ');

          // By generating a blob here, we give web platform the opportunity to store the contents
          // on disk and release RAM.
          slices.push(new Blob([json.substring(1, json.length - 1)]));
          lastNumRows = keyvals.length;
          lastKey = keys.length > 0 ?
            keys[keys.length - 1] :
            null;
        }
        progress.completedRows += values.length;
      }
      slices.push(emptyTableExportJson.substr(posEndRowsArray)); // "]}"
      progress.completedTables += 1;
      if (progress.completedTables < progress.totalTables) {
        slices.push(",");
      }
    }
    slices.push(emptyExportJson.substr(posEndDataArray));
    progress.done = true;
    if (progressCallback) {
      // Keep ongoing transaction private
      Dexie.ignoreTransaction(()=>progressCallback(progress));
    }
  }
}
