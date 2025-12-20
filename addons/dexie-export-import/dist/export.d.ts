import Dexie from 'dexie';
export interface ExportOptions {
    skipTables?: string[];
    noTransaction?: boolean;
    numRowsPerChunk?: number;
    prettyJson?: boolean;
    filter?: (table: string, value: any, key?: any) => boolean;
    transform?: (table: string, value: any, key?: any) => ({
        value: any;
        key?: any;
    });
    progressCallback?: (progress: ExportProgress) => boolean;
}
export interface ExportProgress {
    totalTables: number;
    completedTables: number;
    totalRows: number | undefined;
    completedRows: number;
    done: boolean;
}
export declare function exportDB(db: Dexie, options?: ExportOptions): Promise<Blob>;
