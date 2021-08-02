import { DexieCloudSchema } from 'dexie-cloud-common';
import { DexieCloudDB } from './db/DexieCloudDB';
import { DexieCloudOptions } from './DexieCloudOptions';
export declare function performInitialSync(db: DexieCloudDB, cloudOptions: DexieCloudOptions, cloudSchema: DexieCloudSchema): Promise<void>;
