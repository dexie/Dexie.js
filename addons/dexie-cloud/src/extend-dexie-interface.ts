import Dexie, { IndexableType, Table, TableProp } from 'dexie';
import { DexieCloudOptions } from './DexieCloudOptions';
import {
  DBRealm,
  DBRealmMember,
  DBRealmRole,
  DexieCloudSchema,
} from 'dexie-cloud-common';
import { UserLogin } from './db/entities/UserLogin';
import * as Rx from 'rxjs';
import { PersistedSyncState } from './db/entities/PersistedSyncState';
import { SyncState } from './types/SyncState';
import { DexieCloudServerState } from './DexieCloudServerState';
import { Member } from './db/entities/Member';
import { Role } from './db/entities/Role';
import { EntityCommon } from './db/entities/EntityCommon';
import { DXCUserInteraction } from './types/DXCUserInteraction';
import { DXCWebSocketStatus } from './DXCWebSocketStatus';
import { PermissionChecker } from './PermissionChecker';

export interface DexieCloudSyncOptions {
  wait: boolean;
  purpose: 'push' | 'pull';
}

export type DexieCloudTable<T = any, TKey = string> = Table<
  T & { realmId: string; owner: string },
  TKey,
  'realmId' | 'owner'
>;

export interface DexieCloudAPI<TDexieSubClass extends Dexie> {
  version: string;
  options: DexieCloudOptions | null;
  schema: DexieCloudSchema | null;
  serverState: DexieCloudServerState | null;
  currentUserId: string;
  currentUser: Rx.BehaviorSubject<UserLogin>;
  webSocketStatus: Rx.BehaviorSubject<DXCWebSocketStatus>;
  syncState: Rx.BehaviorSubject<SyncState>;
  persistedSyncState: Rx.BehaviorSubject<PersistedSyncState | undefined>;
  userInteraction: Rx.BehaviorSubject<DXCUserInteraction | undefined>;
  //loginState: Rx.BehaviorSubject<LoginState>;
  usingServiceWorker?: boolean;

  /** Login using Dexie Cloud OTP or Demo user.
   *
   * @param email Email to authenticate
   */
  login(hint?: {
    email?: string;
    userId?: string;
    grant_type?: 'demo' | 'otp';
  }): Promise<void>;
  /**
   * Connect to given URL
   */
  configure(options: DexieCloudOptions): void;
  /** Wait until a full sync is done.
   *
   */
  sync(options?: DexieCloudSyncOptions): Promise<void>;

  permissions<T extends {owner: string, realmId: string, table: ()=>string}>(entity: T): Rx.Observable<PermissionChecker<T>>;
  permissions(realmId: string, tableName: string, owner: string): Rx.Observable<PermissionChecker<any>>;
}

//
// Extend Dexie interface
//
declare module 'dexie' {
  interface Dexie {
    cloud: DexieCloudAPI<this>;
    realms: DexieCloudTable<DBRealm, string>;
    members: DexieCloudTable<DBRealmMember, string>;
    roles: DexieCloudTable<DBRealmRole, [string, string]>;
  }

  interface Table<T, TKeyPropNameOrKeyType, TOpt> {
    newId(colocateWith?: string): string;
  }

  interface DexieConstructor {
    Cloud: {
      (db: Dexie): void;

      version: string;
    };
  }
}
