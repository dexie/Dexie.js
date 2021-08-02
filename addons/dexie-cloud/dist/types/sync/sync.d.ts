import { DexieCloudDB } from '../db/DexieCloudDB';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { DBOperationsSet, DexieCloudSchema } from 'dexie-cloud-common';
export declare const isSyncing: WeakSet<DexieCloudDB>;
export declare const CURRENT_SYNC_WORKER = "currentSyncWorker";
export interface SyncOptions {
    isInitialSync?: boolean;
    cancelToken?: {
        cancelled: boolean;
    };
    justCheckIfNeeded?: boolean;
    retryImmediatelyOnFetchError?: boolean;
}
export declare function sync(db: DexieCloudDB, options: DexieCloudOptions, schema: DexieCloudSchema, syncOptions?: SyncOptions): Promise<boolean>;
export declare function applyServerChanges(changes: DBOperationsSet, db: DexieCloudDB): Promise<void>;
