import Dexie from 'dexie';
import { DexieExportJsonMeta, DexieExportJsonStructure } from './json-structure';
import { JsonStream } from './json-stream';
export interface StaticImportOptions {
    noTransaction?: boolean;
    chunkSizeBytes?: number;
    filter?: (table: string, value: any, key?: any) => boolean;
    transform?: (table: string, value: any, key?: any) => ({
        value: any;
        key?: any;
    });
    progressCallback?: (progress: ImportProgress) => boolean;
    name?: string;
}
export interface ImportOptions extends StaticImportOptions {
    acceptMissingTables?: boolean;
    acceptVersionDiff?: boolean;
    acceptNameDiff?: boolean;
    acceptChangedPrimaryKey?: boolean;
    overwriteValues?: boolean;
    clearTablesBeforeImport?: boolean;
    skipTables?: string[];
    noTransaction?: boolean;
    chunkSizeBytes?: number;
    filter?: (table: string, value: any, key?: any) => boolean;
    transform?: (table: string, value: any, key?: any) => ({
        value: any;
        key?: any;
    });
    progressCallback?: (progress: ImportProgress) => boolean;
}
export interface ImportProgress {
    totalTables: number;
    completedTables: number;
    totalRows: number | undefined;
    completedRows: number;
    done: boolean;
}
export declare function importDB(exportedData: Blob | JsonStream<DexieExportJsonStructure>, options?: StaticImportOptions): Promise<Dexie>;
export declare function peakImportFile(exportedData: Blob): Promise<DexieExportJsonMeta>;
export declare function importInto(db: Dexie, exportedData: Blob | JsonStream<DexieExportJsonStructure>, options?: ImportOptions): Promise<void>;
