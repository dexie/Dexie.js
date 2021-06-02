import Dexie from "dexie";
import { DexieCloudOptions } from './DexieCloudOptions';
import { DexieCloudSchema } from 'dexie-cloud-common/dist';
import { LoginState } from './types/LoginState';
import { UserLogin } from './db/entities/UserLogin';
import * as Rx from "rxjs";
import { PersistedSyncState } from "./db/entities/PersistedSyncState";
import { SyncState } from "./types/SyncState";
import { DexieCloudServerState } from "./DexieCloudServerState";

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
      login(email?: string): Promise<void>;
      /**
       * Connect to given URL
       */
      configure(options: DexieCloudOptions): void;
    };
  }

  interface DexieConstructor {
    Cloud: {
      (db: Dexie): void;

      version: string;
    };
  }
}
