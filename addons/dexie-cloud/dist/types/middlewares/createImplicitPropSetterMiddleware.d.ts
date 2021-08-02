import { DBCore, Middleware } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
export declare function createImplicitPropSetterMiddleware(db: DexieCloudDB): Middleware<DBCore>;
