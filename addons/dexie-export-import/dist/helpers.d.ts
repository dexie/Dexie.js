import Dexie from 'dexie';
import { DexieExportedDatabase } from './json-structure';
export declare function getSchemaString(table: Dexie.Table<any, any>): string;
export declare function extractDbSchema(exportedDb: DexieExportedDatabase): {
    [tableName: string]: string;
};
export interface TypeMapper {
    binary: ArrayBuffer;
    text: string;
}
export declare function readBlobAsync<T extends keyof TypeMapper>(blob: Blob, type: T): Promise<TypeMapper[T]>;
export declare function readBlobSync<T extends keyof TypeMapper>(blob: Blob, type: T): TypeMapper[T];
