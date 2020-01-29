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


// Missing FileReaderSync type in standard typescript libs:
interface FileReaderSync {
  readAsArrayBuffer(blob: Blob): ArrayBuffer;
  readAsBinaryString(blob: Blob): string;
  readAsDataURL(blob: Blob): string;
  readAsText(blob: Blob, encoding?: string): string;
}
declare var FileReaderSync: {
  prototype: FileReaderSync;
  new(): FileReaderSync;
};
// -----------------------------------------------

export interface TypeMapper {
  binary: ArrayBuffer;
  text: string;
}

export function readBlobAsync<T extends keyof TypeMapper>(blob: Blob, type: T): Promise<TypeMapper[T]> {
  return new Promise<TypeMapper[T]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = ev => reject(new Error("file read aborted"));
    reader.onerror = ev => reject((ev.target as any).error);
    reader.onload = ev => resolve((ev.target as any).result);
    if (type === 'binary')
      reader.readAsArrayBuffer(blob);
    else
      reader.readAsText(blob);
  });
}

export function readBlobSync<T extends keyof TypeMapper>(blob: Blob, type: T): TypeMapper[T] {
  if (typeof FileReaderSync === 'undefined') {
    throw new Error('FileReaderSync missing. Reading blobs synchronously requires code to run from within a web worker. Use TSON.encapsulateAsync() to do it from the main thread.');
  }
  const reader = new FileReaderSync(); // Requires worker environment
  const data = type === 'binary' ?
    reader.readAsArrayBuffer(blob) :
    reader.readAsText(blob);

  return data as TypeMapper[T];
}
