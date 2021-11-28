import { IndexableType, TableProp } from 'dexie';
import {
  DBRealm,
  DBRealmMember,
  DBRealmRole,
} from 'dexie-cloud-common';
import { Member } from './db/entities/Member';
import { Role } from './db/entities/Role';
import { EntityCommon } from './db/entities/EntityCommon';
import { DexieCloudAPI } from './DexieCloudAPI';
import { DexieCloudTable } from './DexieCloudTable';

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
