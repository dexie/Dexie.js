import Dexie from 'dexie';
import { DexieExportedDatabase } from './json-structure';

export function getSchemaString(table: Dexie.Table<any, any>) {
  const primKeyAndIndexes = [table.schema.primKey].concat(table.schema.indexes);
  return primKeyAndIndexes.map(index => index.src).join(',');
}

export function extractDbSchema(exportedDb: DexieExportedDatabase) {
  const schema: {
    [tableName: string]: string;
  } = {};
  for (const table of exportedDb.tables) {
    schema[table.name] = table.schema;
  }
  return schema;
}

