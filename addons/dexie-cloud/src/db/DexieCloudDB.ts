import Dexie, { Table } from "dexie";
import { GuardedJob } from "./entities/GuardedJob";
import { UserLogin } from "./entities/UserLogin";
import { DBOperationsSet } from "../types/move-to-dexie-cloud-common/DBOperationsSet";
import { PersistedSyncState } from "./entities/PersistedSyncState";
import { Realm } from "./entities/Realm";
import { Member } from "./entities/Member";
import { Role } from "./entities/Role";
import { UNAUTHORIZED_USER } from "../authentication/UNAUTHORIZED_USER";
import { DexieCloudOptions } from "../DexieCloudOptions";
import { DexieCloudSchema } from "../DexieCloudSchema";
import { BehaviorSubject } from "rxjs";
import { BaseRevisionMapEntry } from "./entities/BaseRevisionMapEntry";

/*export interface DexieCloudDB extends Dexie {
  table(name: string): Table<any, any>;
  table(name: "$jobs"): Table<GuardedJob, string>;
  table(name: "$logins"): Table<UserLogin, string>;
  table(name: "$syncState"): Table<SyncState, "syncState">;
  //table(name: "$pendingChangesFromServer"): Table<DBOperationsSet, number>;
}
*/

export interface DexieCloudDBBase {
  readonly name: Dexie["name"];
  close: Dexie["close"],
  transaction: Dexie["transaction"],
  table: Dexie["table"],
  readonly tables: Dexie["tables"],
  cloud: Dexie["cloud"],
  $jobs: Table<GuardedJob, string>;
  $logins: Table<UserLogin, string>;
  $syncState: Table<PersistedSyncState | DexieCloudSchema | DexieCloudOptions, "syncState" | "options" | "schema">;
  $baseRevs: Table<BaseRevisionMapEntry, [string, number]>;

  realms: Table<Realm, string>;
  members: Table<Member, string>;
  roles: Table<Role, [string, string]>;

  readonly localSyncEvent: BehaviorSubject<any>;
  readonly dx: Dexie;
}

export interface DexieCloudDB extends DexieCloudDBBase {
  getCurrentUser(): Promise<UserLogin>;
  getSchema(): Promise<DexieCloudSchema | undefined>;
  getOptions(): Promise<DexieCloudOptions | undefined>;
  getPersistedSyncState(): Promise<PersistedSyncState | undefined>;
}

const wm = new WeakMap<Dexie, DexieCloudDB>();

export const DEXIE_CLOUD_SCHEMA = {
  realms: "@realmId",
  members: "@id",
  roles: "[realmId+name]",
  $jobs: '',
  $syncState: '',
  $baseRevs: '[tableName+clientRev]',
  $logins: 'claims.sub, lastLogin',
};

export function DexieCloudDB(dx: Dexie): DexieCloudDB {
  let db = wm.get(dx);
  if (!db) {
    const localSyncEvent = new BehaviorSubject({});
    const _db: DexieCloudDBBase = {
      get name() { return dx.name; },
      close() { return dx.close(); },
      transaction: dx.transaction.bind(dx),
      table: dx.table.bind(dx),
      get tables () { return dx.tables; },
      cloud: dx.cloud,
      $jobs: dx.table("$jobs"),
      $syncState: dx.table("$syncState"),
      $baseRevs: dx.table("$baseRevs"),
      $logins: dx.table("$logins"),
  
      realms: dx.table("realms"),
      members: dx.table("members"),
      roles: dx.table("roles"),

      localSyncEvent,
      dx
    };
    db = {
      ..._db,
      getCurrentUser() {
        return _db.$logins
          .toArray()
          .then((logins) => logins.find((l) => l.isLoggedIn) || UNAUTHORIZED_USER);
      },
      getPersistedSyncState() {
        return _db.$syncState.get("syncState") as Promise<PersistedSyncState | undefined>;
      },
      getSchema() {
        return _db.$syncState.get("schema") as Promise<DexieCloudSchema | undefined>;
      },
      getOptions() {
        return _db.$syncState.get("options") as Promise<DexieCloudOptions | undefined>;
      }
    }
    wm.set(dx, db);
  }
  return db;
}
