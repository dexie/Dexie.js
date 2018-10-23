import Dexie from 'dexie';
import { extractDbSchema, readBlob } from './helpers';
import { DexieExportJsonStructure } from './json-structure';
import { TSON } from './tson';
import { FORMAT_HEADER, VERSION, FORMAT_FOOTER } from './data-format';

export interface ImportOptions {
  acceptMissingTables?: boolean;
  acceptVersionDiff?: boolean;
  acceptNameDiff?: boolean;
  acceptChangedPrimaryKey?: boolean;
  overwriteValues?: boolean;
  clearTablesBeforeImport?: boolean;
  progressCallback?: (progress: ImportProgress) => boolean;
}

export interface ImportProgress {
  totalTables: number;
  completedTables: number;
  totalRows: number | undefined;
  completedRows: number;
}

export async function importDB(exportedData: Blob | DexieExportJsonStructure): Promise<Dexie> {
  const dbExport = await getDbExport(exportedData);
  const db = new Dexie(dbExport.name);
  db.version(dbExport.version).stores(extractDbSchema(dbExport));
  await importInto(dbExport, db);
  return db;
}

export async function importInto(exportedData: DexieExportJsonStructure | Blob, db: Dexie, options?: ImportOptions): Promise<void> {
  const dbExport = await getDbExport(exportedData);
  options = options || {}; // All booleans defaults to false.
  if (!options.acceptNameDiff && db.name !== dbExport.name)
    throw new Error(`Name differs. Current database name is ${db.name} but export is ${dbExport.name}`);
  if (!options.acceptVersionDiff && db.verno !== dbExport.version) {
    // Possible feature: Call upgraders in some isolated way if this happens... ?
    throw new Error(`Database version differs. Current database is in version ${db.verno} but export is ${dbExport.version}`);
  }
  const { progressCallback } = options;
  const progress: ImportProgress = {
    completedRows: 0,
    completedTables: 0,
    totalRows: dbExport.data.reduce((p, c) => p + c.values.length, 0),
    totalTables: dbExport.data.length
  };
  if (progressCallback) {
    if (progressCallback(progress))
      throw new Error("Operation aborted");
  }
  await db.transaction('rw', db.tables, async () => {
    if (progressCallback) {
      if (progressCallback(progress))
        throw new Error("Operation aborted");
    }
    for (const tableExport of dbExport.data) {
      const table = db.table(tableExport.name);
      if (!table) {
        if (!options.acceptMissingTables)
          throw new Error(`Exported table ${tableExport.name} is missing in installed database`);
        else
          continue;
      }
      if (!options.acceptChangedPrimaryKey &&
        tableExport.schema.split(',')[0] != table.schema.primKey.src) {
        throw new Error(`Primary key differs for table ${tableExport.name}. `);
      }
      const rows = tableExport.values.map(row => TSON.revive(row));
      const keys = tableExport.keys && tableExport.keys.map(key => TSON.revive(key));
      if (options.overwriteValues)
        await table.bulkPut(rows, keys);
      else
        await table.bulkAdd(rows, keys);
      if (progressCallback) {
        progress.completedRows += rows.length;
        progress.completedTables += 1;
        if (progressCallback(progress))
          throw new Error("Operation aborted");
      }
    }
  });
}

async function getDbExport(dbExportOrFile: DexieExportJsonStructure | Blob): Promise<DexieExportJsonStructure> {
  if ('slice' in dbExportOrFile) {
    // Blob
    const formatHeaderBlob = dbExportOrFile.slice(0, FORMAT_HEADER.length);
    const formatHeaderJson = await readBlob(formatHeaderBlob);
    let formatHeader: {
      format: "dexie";
      v: number;
      payload: DexieExportJsonStructure;
    };
    try {
      formatHeader = JSON.parse(formatHeaderJson);
    }
    catch (error) {
      throw new Error("Given file is not a dexie export");
    }
    if (formatHeader.format !== "dexie")
      throw new Error(`Given file is not a dexie export`);
    if (formatHeader.v > VERSION)
      throw new Error(`Format version ${formatHeader.v} not supported`);
    const exportBlob = dbExportOrFile.slice(FORMAT_HEADER.length, dbExportOrFile.size - FORMAT_HEADER.length - FORMAT_FOOTER.length);
    const json = await readBlob(exportBlob);
    return JSON.parse(json) as DexieExportJsonStructure;
  }
  else {
    return dbExportOrFile as DexieExportJsonStructure;
  }
}
