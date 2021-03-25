import Dexie, { Table } from "dexie";
import { GuardedJob } from "./entities/GuardedJob";
import { UserLogin } from "./entities/UserLogin";
import { DBOperationsSet } from "../types/move-to-dexie-cloud-common/DBOperationsSet";
import { PersistedSyncState } from "./entities/PersistedSyncState";
import { Realm } from "./entities/Realm";
import { Member } from "./entities/Member";
import { Role } from "./entities/Role";
import { Schema } from "./entities/Schema";

/*export interface DexieCloudDB extends Dexie {
  table(name: string): Table<any, any>;
  table(name: "$jobs"): Table<GuardedJob, string>;
  table(name: "$logins"): Table<UserLogin, string>;
  table(name: "$syncState"): Table<SyncState, "syncState">;
  //table(name: "$pendingChangesFromServer"): Table<DBOperationsSet, number>;
}
*/

export interface DexieCloudDB {
  transaction: Dexie["transaction"],
  table: Dexie["table"],
  cloud: Dexie["cloud"],
  $jobs: Table<GuardedJob, string>;
  $logins: Table<UserLogin, string>;
  $syncState: Table<PersistedSyncState, "syncState">;
  $schema: Table<Schema, "schema">;

  realms: Table<Realm, string>;
  members: Table<Member, string>;
  roles: Table<Role, [string, string]>;
}

const wm = new WeakMap<Dexie, DexieCloudDB>();

export function DexieCloudDB(dx: Dexie): DexieCloudDB {
  let db = wm.get(dx);
  if (!db) {
    db = {
      transaction: dx.transaction.bind(dx),
      table: dx.table.bind(dx),
      cloud: dx.cloud,
      $jobs: dx.table("$jobs"),
      $logins: dx.table("$logins"),
      $syncState: dx.table("$syncState"),
      $schema: dx.table("$schema"),
  
      realms: dx.table("realms"),
      members: dx.table("members"),
      roles: dx.table("roles"),
    };
    wm.set(dx, db);
  }
  return db;
}
