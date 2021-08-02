import { UserLogin } from "../db/entities/UserLogin";
import { EntityCommon } from "../db/entities/EntityCommon";
import { Table } from "dexie";
import { DBOperationsSet, DexieCloudSchema } from "dexie-cloud-common";
export declare function listSyncifiedChanges(tablesToSyncify: Table<EntityCommon>[], currentUser: UserLogin, schema: DexieCloudSchema, alreadySyncedRealms?: string[]): Promise<DBOperationsSet>;
