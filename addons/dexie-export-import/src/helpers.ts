import Dexie from 'dexie';
import { DexieExportJsonStructure } from './json-structure';

export function getSchemaString(table: Dexie.Table<any, any>) {
  const primKeyAndIndexes = [table.schema.primKey].concat(table.schema.indexes);
  return primKeyAndIndexes.map(index => index.src).join(',');
}

export function extractDbSchema(exportFormat: DexieExportJsonStructure) {
  const schema: {
    [tableName: string]: string;
  } = {};
  for (const table of exportFormat.data) {
    schema[table.name] = table.schema;
  }
  return schema;
}

export function readBlob(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => resolve((ev.target as any).result);
    reader.onabort = ev => reject(new Error("file read aborted"));
    reader.onerror = ev => reject((ev.target as any).error);
    reader.readAsText(blob);
  });
}

