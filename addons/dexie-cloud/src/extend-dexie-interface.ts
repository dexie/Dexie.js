import Dexie, { Table } from 'dexie';
import { DexieCloudOptions } from './DexieCloudOptions';
import {
  DBRealm,
  DBRealmMember,
  DBRealmRole,
  DexieCloudSchema
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

export interface DexieCloudSyncOptions {
  wait: boolean;
  purpose: "push" | "pull"
}

export type DexieCloudTable<T = any> = Table<T & EntityCommon, string>;

//
// Extend Dexie interface
//
declare module 'dexie' {
  interface Dexie {
    cloud: {
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
    };

    realms: Table<Partial<DBRealm>, string>;
    members: Table<Partial<DBRealmMember>, string>;
    roles: Table<DBRealmRole, [string, string]>;
  }

  interface DexieConstructor {
    Cloud: {
      (db: Dexie): void;

      version: string;
    };
  }
}
