import { DBCoreTable } from "dexie";
export declare function guardedTable(table: DBCoreTable): {
    count: (req: import("dexie").DBCoreCountRequest) => Promise<number>;
    get: (req: import("dexie").DBCoreGetRequest) => Promise<any>;
    getMany: (req: import("dexie").DBCoreGetManyRequest) => Promise<any[]>;
    openCursor: (req: import("dexie").DBCoreOpenCursorRequest) => Promise<import("dexie").DBCoreCursor | null>;
    query: (req: import("dexie").DBCoreQueryRequest) => Promise<import("dexie").DBCoreQueryResponse>;
    mutate: (req: import("dexie").DBCoreMutateRequest) => Promise<import("dexie").DBCoreMutateResponse>;
    name: string;
    schema: import("dexie").DBCoreTableSchema;
};
