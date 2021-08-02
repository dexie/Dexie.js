import { DexieCloudDB } from '../db/DexieCloudDB';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { DexieCloudSchema } from 'dexie-cloud-common';
export declare function LocalSyncWorker(db: DexieCloudDB, cloudOptions: DexieCloudOptions, cloudSchema: DexieCloudSchema): {
    start: () => void;
    stop: () => void;
};
