import Dexie, { TableProp } from 'dexie';
import { DexieCloudOptions } from './DexieCloudOptions';
import { DBPermissionSet, DBRealm, DBRealmMember, DBRealmRole, DexieCloudSchema } from 'dexie-cloud-common';
import { UserLogin } from './db/entities/UserLogin';
import * as Rx from 'rxjs';
import { PersistedSyncState } from './db/entities/PersistedSyncState';
import { SyncState } from './types/SyncState';
import { DexieCloudServerState } from './DexieCloudServerState';
import { DXCUserInteraction } from './types/DXCUserInteraction';
import { DXCWebSocketStatus } from './DXCWebSocketStatus';
import { PermissionChecker } from './PermissionChecker';
import { DexieCloudSyncOptions } from "./DexieCloudSyncOptions";
import { Invite } from './Invite';
export interface DexieCloudAPI {
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
  /*access: Rx.Observable<{
    invites: (DBRealmMember & {realm: DBRealm})[];
    permissions: (DBRealm & {permissions: DBPermissionSet})[];
  }>;*/
  invites: Rx.Observable<Invite[]>;
  roles: Rx.Observable<{[roleName: string]: DBRealmRole}>;
  //realms: Rx.Observable<DBRealm[]>;
  //loginState: Rx.BehaviorSubject<LoginState>;
  usingServiceWorker?: boolean;
  isServiceWorkerDB?: boolean;

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

  permissions<T extends { owner: string; realmId: string; table: () => string; }>(entity: T): Rx.Observable<PermissionChecker<T>>;
  permissions<T>(obj: T, table: string): Rx.Observable<PermissionChecker<T, string>>;
}
