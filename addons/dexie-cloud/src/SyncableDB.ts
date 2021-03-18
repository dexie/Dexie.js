import Dexie, { Table } from "dexie";
import { GuardedJob } from './types/GuardedJob';
import { UserLogin } from './types/UserLogin';
import { DBOperationsSet } from "./types/DBOperationsSet";
import { SyncState } from './types/SyncState';

export interface SyncableDB extends Dexie {
  table(name: string): Table<any, any>;
  table(name: "$jobs"): Table<GuardedJob, string>;
  table(name: "$logins"): Table<UserLogin, string>;
  table(name: "$syncState"): Table<SyncState, "syncState">;
  //table(name: "$pendingChangesFromServer"): Table<DBOperationsSet, number>;
}
