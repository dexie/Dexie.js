
import Dexie from 'dexie';
import { getSchemaString } from './helpers';
import { DexieExportedTable, DexieExportJsonStructure } from './json-structure';
import { TSON } from './tson';
import { FORMAT_HEADER, FORMAT_FOOTER } from './data-format';

export interface ExportOptions {
  progressCallback?: (progress: ExportProgress) => boolean;
}

export interface ExportProgress {
  totalTables: number;
  completedTables: number;
  totalRows: number | undefined;
  completedRows: number;
}

export async function exportDB(db: Dexie, options?: ExportOptions): Promise<Blob> {
  options = options || {};
  const {progressCallback} = options;
  const progress: ExportProgress = {
    completedRows: 0,
    completedTables: 0,
    totalRows: NaN,
    totalTables: db.tables.length
  };

  const tableExports = await db.transaction('r', db.tables, async ()=>{
    if (progressCallback) {
      progress.totalRows = await db.tables.reduce((p,c) => p.then(count => c.count().then(count2 => count + count2)), Promise.resolve(0));
      if (progressCallback(progress)) throw new Error("Operation aborted");
    }
    return await Promise.all(db.tables.map(async table => {
      const rows = await table.toArray();
      const tsonRows = rows.map(row => TSON.encapsulate(row));
      const result: DexieExportedTable = {
        name: table.name,
        schema: getSchemaString(table),
        values: tsonRows
      }
      if (!table.schema.primKey.keyPath) {
        result.keys = await table.toCollection().primaryKeys();
      }
      if (progressCallback) {
        progress.completedRows += rows.length;
        progress.completedTables += 1;
        if (progressCallback(progress)) throw new Error("Operation aborted");
      }
      return result;
    }));
  });
  const exportFormat: DexieExportJsonStructure = {
    name: db.name,
    version: db.verno,
    data: tableExports
  };

  return new Blob([
    FORMAT_HEADER,
    JSON.stringify(exportFormat),
    FORMAT_FOOTER
  ],{
    type: "text/json"
  });
}


