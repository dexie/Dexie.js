import { DBCore, DBCoreAddRequest, DBCoreDeleteRequest, DBCoreIndex, DBCorePutRequest, Middleware } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
export declare function toStringTag(o: Object): any;
export declare function getEffectiveKeys(primaryKey: DBCoreIndex, req: (Pick<DBCoreAddRequest | DBCorePutRequest, 'type' | 'values'> & {
    keys?: any[];
}) | Pick<DBCoreDeleteRequest, 'keys' | 'type'>): any[];
export declare function generateTablePrefix(tableName: string, allPrefixes: Set<string>): string;
export declare function createIdGenerationMiddleware(db: DexieCloudDB): Middleware<DBCore>;
