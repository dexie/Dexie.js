import { DexieCloudDB } from '../db/DexieCloudDB';
export declare function login(db: DexieCloudDB, hints?: {
    email?: string;
    userId?: string;
    grant_type?: string;
}): Promise<void>;
