import { Table } from 'dexie';
export declare function bulkUpdate(table: Table, keys: any[], changeSpecs: {
    [keyPath: string]: any;
}[]): Promise<void>;
