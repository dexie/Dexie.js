import Dexie from "dexie";
import { DexieCloudOptions } from './DexieCloudOptions';
import { DexieCloudSchema } from './DexieCloudSchema';
import { LoginState } from './types/LoginState';
import { UserLogin } from './types/UserLogin';
import * as Rx from "rxjs";
import { SyncState } from "./types/SyncState";

//
// Extend Dexie interface
//
declare module "dexie" {
  interface Dexie {
    cloud: {
      version: string;
      options: DexieCloudOptions;
      schema: DexieCloudSchema;
      currentUserId: string;
      currentUser: Rx.BehaviorSubject<UserLogin>;
      loginState: Rx.BehaviorSubject<LoginState>;
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
