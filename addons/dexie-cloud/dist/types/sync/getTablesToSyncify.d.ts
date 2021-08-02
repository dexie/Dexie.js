import { DexieCloudDB } from "../db/DexieCloudDB";
import { PersistedSyncState } from "../db/entities/PersistedSyncState";
export declare function getTablesToSyncify(db: DexieCloudDB, syncState: PersistedSyncState | undefined): import("dexie").Table<import("../db/entities/EntityCommon").EntityCommon, import("dexie").IndexableType>[];
