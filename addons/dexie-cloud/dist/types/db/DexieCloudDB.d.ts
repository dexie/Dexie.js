import Dexie, { Table } from 'dexie';
import { GuardedJob } from './entities/GuardedJob';
import { UserLogin } from './entities/UserLogin';
import { PersistedSyncState } from './entities/PersistedSyncState';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { BehaviorSubject } from 'rxjs';
import { BaseRevisionMapEntry } from './entities/BaseRevisionMapEntry';
import { DBRealm, DBRealmMember, DBRealmRole, DexieCloudSchema } from 'dexie-cloud-common';
import { BroadcastedAndLocalEvent } from '../helpers/BroadcastedAndLocalEvent';
import { SyncState } from '../types/SyncState';
declare type SyncStateTable = Table<PersistedSyncState | DexieCloudSchema | DexieCloudOptions, 'syncState' | 'options' | 'schema'>;
export interface DexieCloudDBBase {
    readonly name: Dexie['name'];
    readonly close: Dexie['close'];
    transaction: Dexie['transaction'];
    table: Dexie['table'];
    readonly tables: Dexie['tables'];
    readonly cloud: Dexie['cloud'];
    readonly $jobs: Table<GuardedJob, string>;
    readonly $logins: Table<UserLogin, string>;
    readonly $syncState: SyncStateTable;
    readonly $baseRevs: Table<BaseRevisionMapEntry, [string, number]>;
    readonly realms: Table<DBRealm, string>;
    readonly members: Table<DBRealmMember, string>;
    readonly roles: Table<DBRealmRole, [string, string]>;
    readonly localSyncEvent: BehaviorSubject<any>;
    readonly syncStateChangedEvent: BroadcastedAndLocalEvent<SyncState>;
    readonly dx: Dexie;
    readonly initiallySynced: boolean;
}
export interface DexieCloudDB extends DexieCloudDBBase {
    getCurrentUser(): Promise<UserLogin>;
    getSchema(): Promise<DexieCloudSchema | undefined>;
    getOptions(): Promise<DexieCloudOptions | undefined>;
    getPersistedSyncState(): Promise<PersistedSyncState | undefined>;
    setInitiallySynced(initiallySynced: boolean): void;
    reconfigure(): void;
}
export declare const DEXIE_CLOUD_SCHEMA: {
    realms: string;
    members: string;
    roles: string;
    $jobs: string;
    $syncState: string;
    $baseRevs: string;
    $logins: string;
};
export declare function DexieCloudDB(dx: Dexie): DexieCloudDB;
export {};
