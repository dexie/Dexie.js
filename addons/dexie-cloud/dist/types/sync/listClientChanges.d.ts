import { Table } from "dexie";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { DBOperationsSet } from "dexie-cloud-common";
export declare function listClientChanges(mutationTables: Table[], db: DexieCloudDB, { since, limit }?: {
    since?: {
        [table: string]: number;
    } | undefined;
    limit?: number | undefined;
}): Promise<DBOperationsSet>;
