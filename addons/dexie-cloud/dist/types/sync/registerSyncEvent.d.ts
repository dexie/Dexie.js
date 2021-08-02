import { DexieCloudDB } from '../db/DexieCloudDB';
export declare function registerSyncEvent(db: DexieCloudDB): Promise<void>;
export declare function registerPeriodicSyncEvent(db: DexieCloudDB): Promise<void>;
