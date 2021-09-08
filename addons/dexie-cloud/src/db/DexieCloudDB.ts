import Dexie, { Table } from 'dexie';
import { GuardedJob } from './entities/GuardedJob';
import { UserLogin } from './entities/UserLogin';
import { PersistedSyncState } from './entities/PersistedSyncState';
import { Realm } from './entities/Realm';
import { Member } from './entities/Member';
import { Role } from './entities/Role';
import { UNAUTHORIZED_USER } from '../authentication/UNAUTHORIZED_USER';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { BehaviorSubject, Subject } from 'rxjs';
import { BaseRevisionMapEntry } from './entities/BaseRevisionMapEntry';
import {
  DBRealm,
  DBRealmMember,
  DBRealmRole,
  DexieCloudSchema,
} from 'dexie-cloud-common';
import { BroadcastedAndLocalEvent } from '../helpers/BroadcastedAndLocalEvent';
import { SyncState, SyncStatePhase } from '../types/SyncState';
import { MessagesFromServerConsumer } from '../sync/messagesFromServerQueue';

/*export interface DexieCloudDB extends Dexie {
  table(name: string): Table<any, any>;
  table(name: "$jobs"): Table<GuardedJob, string>;
  table(name: "$logins"): Table<UserLogin, string>;
  table(name: "$syncState"): Table<SyncState, "syncState">;
  //table(name: "$pendingChangesFromServer"): Table<DBOperationsSet, number>;
}
*/

export interface SyncStateChangedEventData {
  phase: SyncStatePhase;
  error?: Error;
  progress?: number;
}

type SyncStateTable = Table<
  PersistedSyncState | DexieCloudSchema | DexieCloudOptions,
  'syncState' | 'options' | 'schema'
>;
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

  readonly localSyncEvent: BehaviorSubject<{ purpose?: 'pull' | 'push' }>;
  readonly syncStateChangedEvent: BroadcastedAndLocalEvent<SyncStateChangedEventData>;
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
  messageConsumer: MessagesFromServerConsumer;
}

const wm = new WeakMap<object, DexieCloudDB>();

export const DEXIE_CLOUD_SCHEMA = {
  realms: '@realmId',
  members: '@id',
  roles: '[realmId+name]',
  $jobs: '',
  $syncState: '',
  $baseRevs: '[tableName+clientRev]',
  $logins: 'claims.sub, lastLogin',
};

let static_counter = 0;
export function DexieCloudDB(dx: Dexie): DexieCloudDB {
  if ('vip' in dx) dx = dx['vip']; // Avoid race condition. Always map to a vipped dexie that don't block during db.on.ready().
  let db = wm.get(dx.cloud);
  if (!db) {
    const localSyncEvent = new Subject<{ purpose: 'push' | 'pull' }>();
    let syncStateChangedEvent =
      new BroadcastedAndLocalEvent<SyncStateChangedEventData>(
        `syncstatechanged-${dx.name}`
      );
    localSyncEvent['id'] = ++static_counter;
    let initiallySynced = false;
    db = {
      get name() {
        return dx.name;
      },
      close() {
        return dx.close();
      },
      transaction: dx.transaction.bind(dx),
      table: dx.table.bind(dx),
      get tables() {
        return dx.tables;
      },
      cloud: dx.cloud,
      get $jobs() {
        return dx.table('$jobs') as Table<GuardedJob, string>;
      },
      get $syncState() {
        return dx.table('$syncState') as SyncStateTable;
      },
      get $baseRevs() {
        return dx.table('$baseRevs') as Table<
          BaseRevisionMapEntry,
          [string, number]
        >;
      },
      get $logins() {
        return dx.table('$logins') as Table<UserLogin, string>;
      },

      get realms() {
        return dx.realms;
      },
      get members() {
        return dx.members;
      },
      get roles() {
        return dx.roles;
      },
      get initiallySynced() {
        return initiallySynced;
      },
      localSyncEvent,
      get syncStateChangedEvent() {
        return syncStateChangedEvent;
      },
      dx,
    } as DexieCloudDB;

    const helperMethods: Partial<DexieCloudDB> = {
      getCurrentUser() {
        return db!.$logins
          .toArray()
          .then(
            (logins) => logins.find((l) => l.isLoggedIn) || UNAUTHORIZED_USER
          );
      },
      getPersistedSyncState() {
        return db!.$syncState.get('syncState') as Promise<
          PersistedSyncState | undefined
        >;
      },
      getSchema() {
        return db!.$syncState.get('schema') as Promise<
          DexieCloudSchema | undefined
        >;
      },
      getOptions() {
        return db!.$syncState.get('options') as Promise<
          DexieCloudOptions | undefined
        >;
      },
      setInitiallySynced(value) {
        initiallySynced = value;
      },
      reconfigure() {
        syncStateChangedEvent = new BroadcastedAndLocalEvent<SyncState>(
          `syncstatechanged-${dx.name}`
        );
      },
    };

    Object.assign(db, helperMethods);
    db.messageConsumer = MessagesFromServerConsumer(db);
    wm.set(dx.cloud, db);
  }
  return db;
}
