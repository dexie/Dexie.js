import Dexie from "dexie";
import { DexieCloudOptions } from './DexieCloudOptions';
import { DBRealm, DBRealmMember, DBRealmRole, DexieCloudSchema } from 'dexie-cloud-common';
import { LoginState } from './types/LoginState';
import { UserLogin } from './db/entities/UserLogin';
import * as Rx from "rxjs";
import { PersistedSyncState } from "./db/entities/PersistedSyncState";
import { SyncState } from "./types/SyncState";
import { DexieCloudServerState } from "./DexieCloudServerState";
import { Member } from "./db/entities/Member";
import { Role } from "./db/entities/Role";

export interface DexieCloudSyncOptions {
  wait: boolean
}
//
// Extend Dexie interface
//
declare module "dexie" {
  interface Dexie {
    cloud: {
      version: string;
      options: DexieCloudOptions | null;
      schema: DexieCloudSchema | null;
      serverState: DexieCloudServerState | null;
      currentUserId: string;
      currentUser: Rx.BehaviorSubject<UserLogin>;
      syncState: Rx.BehaviorSubject<SyncState>;
      loginState: Rx.BehaviorSubject<LoginState>;
      /** Login using Dexie Cloud OTP or Demo user.
       * 
       * @param email Email to authenticate
       */
      login(hint?: {email?: string, userId?: string, grant_type?: "demo" | "otp"}): Promise<void>;
      /**
       * Connect to given URL
       */
      configure(options: DexieCloudOptions ): void;
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
