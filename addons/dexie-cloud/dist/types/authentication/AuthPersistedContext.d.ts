import { DexieCloudDB } from "../db/DexieCloudDB";
import { UserLogin } from "../db/entities/UserLogin";
export interface AuthPersistedContext extends UserLogin {
    save(): Promise<void>;
}
export declare class AuthPersistedContext {
    constructor(db: DexieCloudDB, userLogin: UserLogin);
    static load(db: DexieCloudDB, userId: string): import("dexie").PromiseExtended<AuthPersistedContext>;
}
