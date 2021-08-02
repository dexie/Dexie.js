import { Table } from "dexie";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { EntityCommon } from "../db/entities/EntityCommon";
export declare function getSyncableTables(db: DexieCloudDB): Table<EntityCommon>[];
