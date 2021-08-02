import { DexieCloudDB } from '../db/DexieCloudDB';
import { PersistedSyncState } from '../db/entities/PersistedSyncState';
import { BaseRevisionMapEntry } from '../db/entities/BaseRevisionMapEntry';
import { DBOperationsSet, DexieCloudSchema, SyncResponse } from 'dexie-cloud-common';
export declare function syncWithServer(changes: DBOperationsSet, syncState: PersistedSyncState | undefined, baseRevs: BaseRevisionMapEntry[], db: DexieCloudDB, databaseUrl: string, schema: DexieCloudSchema | null): Promise<SyncResponse>;
