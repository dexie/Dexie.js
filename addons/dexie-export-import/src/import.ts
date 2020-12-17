import Dexie from 'dexie';
import { extractDbSchema } from './helpers';
import { DexieExportJsonMeta, DexieExportJsonStructure, VERSION } from './json-structure';
import { TSON } from './tson';
import { JsonStream } from './json-stream';

export interface StaticImportOptions {
  noTransaction?: boolean;
  chunkSizeBytes?: number; // Default: DEFAULT_KILOBYTES_PER_CHUNK ( 1MB )
  filter?: (table: string, value: any, key?: any) => boolean;
  progressCallback?: (progress: ImportProgress) => boolean;
}

export interface ImportOptions extends StaticImportOptions {
  acceptMissingTables?: boolean;
  acceptVersionDiff?: boolean;
  acceptNameDiff?: boolean;
  acceptChangedPrimaryKey?: boolean;
  overwriteValues?: boolean;
  clearTablesBeforeImport?: boolean;
  noTransaction?: boolean;
  chunkSizeBytes?: number; // Default: DEFAULT_KILOBYTES_PER_CHUNK ( 1MB )
  filter?: (table: string, value: any, key?: any) => boolean;
  progressCallback?: (progress: ImportProgress) => boolean;
}

const DEFAULT_KILOBYTES_PER_CHUNK = 1024;

export interface ImportProgress {
  totalTables: number;
  completedTables: number;
  totalRows: number | undefined;
  completedRows: number;
  done: boolean;
}

export async function importDB(exportedData: Blob | JsonStream<DexieExportJsonStructure>, options?: StaticImportOptions): Promise<Dexie> {
  options = options || {}; // All booleans defaults to false.
  const CHUNK_SIZE = options!.chunkSizeBytes || (DEFAULT_KILOBYTES_PER_CHUNK * 1024);
  const stream = await loadUntilWeGotEnoughData(exportedData, CHUNK_SIZE);
  const dbExport = stream.result.data!;
  const db = new Dexie(dbExport.databaseName);
  db.version(dbExport.databaseVersion).stores(extractDbSchema(dbExport));
  await importInto(db, stream, options);
  return db;
}

export async function peakImportFile(exportedData: Blob): Promise<DexieExportJsonMeta> {
  const stream = JsonStream<DexieExportJsonStructure>(exportedData);
  while (!stream.eof()) {
    await stream.pullAsync(5 * 1024); // 5 k is normally enough for the headers. If not, it will just do another go.
    if (stream.result.data && stream.result.data!.data) {
      // @ts-ignore - TS won't allow us to delete a required property - but we are going to cast it.
      delete stream.result.data.data; // Don't return half-baked data array.
      break;
    }
  }
  return stream.result as DexieExportJsonMeta;
}

export async function importInto(db: Dexie, exportedData: Blob | JsonStream<DexieExportJsonStructure>, options?: ImportOptions): Promise<void> {
  options = options || {}; // All booleans defaults to false.
  const CHUNK_SIZE = options!.chunkSizeBytes || (DEFAULT_KILOBYTES_PER_CHUNK * 1024);
  const jsonStream = await loadUntilWeGotEnoughData(exportedData, CHUNK_SIZE);
  let dbExportFile = jsonStream.result;
  const readBlobsSynchronously = 'FileReaderSync' in self; // true in workers only.

  const dbExport = dbExportFile.data!;

  if (!options!.acceptNameDiff && db.name !== dbExport.databaseName)
    throw new Error(`Name differs. Current database name is ${db.name} but export is ${dbExport.databaseName}`);
  if (!options!.acceptVersionDiff && db.verno !== dbExport.databaseVersion) {
    // Possible feature: Call upgraders in some isolated way if this happens... ?
    throw new Error(`Database version differs. Current database is in version ${db.verno} but export is ${dbExport.databaseVersion}`);
  }
  
  const { progressCallback } = options;
  const progress: ImportProgress = {
    done: false,
    completedRows: 0,
    completedTables: 0,
    totalRows: dbExport.tables.reduce((p, c) => p + c.rowCount, 0),
    totalTables: dbExport.tables.length
  };
  if (progressCallback) {
    // Keep ongoing transaction private
    Dexie.ignoreTransaction(()=>progressCallback(progress));
  }

  if (options.noTransaction) {
    await importAll();
  } else {
    await db.transaction('rw', db.tables, importAll);
  }  

  async function importAll () {
    do {
      for (const tableExport of dbExport.data) {
        if (!tableExport.rows) break; // Need to pull more!
        if (!(tableExport.rows as any).incomplete && tableExport.rows.length === 0)
          continue;

        if (progressCallback) {
          // Keep ongoing transaction private
          Dexie.ignoreTransaction(()=>progressCallback(progress));
        }
        const tableName = tableExport.tableName;
        const table = db.table(tableName);
        const tableSchemaStr = dbExport.tables.filter(t => t.name === tableName)[0].schema;
        if (!table) {
          if (!options!.acceptMissingTables)
            throw new Error(`Exported table ${tableExport.tableName} is missing in installed database`);
          else
            continue;
        }
        if (!options!.acceptChangedPrimaryKey &&
          tableSchemaStr.split(',')[0] != table.schema.primKey.src) {
          throw new Error(`Primary key differs for table ${tableExport.tableName}. `);
        }

        const sourceRows = tableExport.rows
        
        // Our rows may be partial, so we need to ensure each one is completed before using it
        const rows: any[] = [];
        for(let i = 0; i < sourceRows.length; i++) {
          const obj = sourceRows[i];
          if (!obj.incomplete) {
            rows.push(TSON.revive(obj));
          } else {
            break;
          }
        }

        const filter = options!.filter;
        const filteredRows = filter ?
          tableExport.inbound ?
            rows.filter(value => filter(tableName, value)) :
            rows.filter(([key, value]) => filter(tableName, value, key)) :
          rows;
        const [keys, values] = tableExport.inbound ?
          [undefined, filteredRows] :
          [filteredRows.map(row=>row[0]), rows.map(row=>row[1])];

        if (options!.clearTablesBeforeImport) {
          await table.clear();
        }
        if (options!.overwriteValues)
          await table.bulkPut(values, keys);
        else
          await table.bulkAdd(values, keys);
          
        progress.completedRows += rows.length;
        if (!(rows as any).incomplete) {
          progress.completedTables += 1;
        }
        sourceRows.splice(0, rows.length); // Free up RAM, keep existing array instance.
      }

      // Avoid unnescessary loops in "for (const tableExport of dbExport.data)" 
      while (dbExport.data.length > 0 && dbExport.data[0].rows && !(dbExport.data[0].rows as any).incomplete) {
        // We've already imported all rows from the first table. Delete its occurrence
        dbExport.data.splice(0, 1); 
      }
      if (!jsonStream.done() && !jsonStream.eof()) {
        // Pull some more (keeping transaction alive)
        if (readBlobsSynchronously) {
          // If we can pull from blob synchronically, we don't have to
          // keep transaction alive using Dexie.waitFor().
          // This will only be possible in workers.
          jsonStream.pullSync(CHUNK_SIZE);
        } else {
          await Dexie.waitFor(jsonStream.pullAsync(CHUNK_SIZE));
        }
      } else break;
    } while (true)
  }
  progress.done = true;
  if (progressCallback) {
    // Keep ongoing transaction private
    Dexie.ignoreTransaction(()=>progressCallback(progress));
  }
}

async function loadUntilWeGotEnoughData(exportedData: Blob | JsonStream<DexieExportJsonStructure>, CHUNK_SIZE: number): Promise<JsonStream<DexieExportJsonStructure>> {
  const stream = ('slice' in exportedData ?
    JsonStream<DexieExportJsonStructure>(exportedData) :
    exportedData);

  while (!stream.eof()) {
    await stream.pullAsync(CHUNK_SIZE);

    if (stream.result.data && stream.result.data!.data)
      break;
  }
  const dbExportFile = stream.result;
  if (!dbExportFile || dbExportFile.formatName != "dexie")
    throw new Error(`Given file is not a dexie export`);
  if (dbExportFile.formatVersion! > VERSION) {
    throw new Error(`Format version ${dbExportFile.formatVersion} not supported`);
  }
  if (!dbExportFile.data!) {
    throw new Error(`No data in export file`);
  }
  if (!dbExportFile.data!.databaseName) {
    throw new Error(`Missing databaseName in export file`);
  }
  if (!dbExportFile.data!.databaseVersion) {
    throw new Error(`Missing databaseVersion in export file`);
  }
  if (!dbExportFile.data!.tables) {
    throw new Error(`Missing tables in export file`);
  }
  return stream;  
}
