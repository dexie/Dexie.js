import { DexieCloudDB } from '../db/DexieCloudDB';
import { SyncOptions } from './sync';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { DexieCloudSchema } from 'dexie-cloud-common';
export declare function syncIfPossible(db: DexieCloudDB, cloudOptions: DexieCloudOptions, cloudSchema: DexieCloudSchema, options?: SyncOptions): Promise<void>;
