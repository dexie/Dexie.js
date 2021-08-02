import { Table } from "dexie";
import { EntityCommon } from "../db/entities/EntityCommon";
import { UserLogin } from "../db/entities/UserLogin";
export declare function modifyLocalObjectsWithNewUserId(syncifiedTables: Table<EntityCommon>[], currentUser: UserLogin, alreadySyncedRealms?: string[]): Promise<void>;
