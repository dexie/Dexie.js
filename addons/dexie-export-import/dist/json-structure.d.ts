export declare const VERSION = 1;
/** Same as DexieExportJsonStructure but without the data.data array */
export interface DexieExportJsonMeta {
    formatName: 'dexie';
    formatVersion: typeof VERSION;
    data: {
        databaseName: string;
        databaseVersion: number;
        tables: Array<{
            name: string;
            schema: string;
            rowCount: number;
        }>;
    };
}
export interface DexieExportJsonStructure extends DexieExportJsonMeta {
    formatName: 'dexie';
    formatVersion: typeof VERSION;
    data: {
        databaseName: string;
        databaseVersion: number;
        tables: Array<{
            name: string;
            schema: string;
            rowCount: number;
        }>;
        data: Array<{
            tableName: string;
            inbound: boolean;
            rows: any[];
        }>;
    };
}
export type DexieExportedDatabase = DexieExportJsonStructure["data"];
export type DexieExportedTable = DexieExportedDatabase["data"][number];
