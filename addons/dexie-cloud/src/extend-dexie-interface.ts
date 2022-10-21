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
import { NewIdOptions } from './types/NewIdOptions';

//
// Extend Dexie interface
//
type DBRealmEntity = Omit<DBRealm, 'realmId' | 'owner'> & { realmId?: string, owner?: string };
type DBRealmMemberEntity = Omit<DBRealmMember, 'id'| 'realmId' | 'owner'> & { id?: string, realmId?: string, owner?: string };
type DBRealmRoleEntity = Omit<DBRealmRole, 'owner'> & { owner?: string };

declare module 'dexie' {
  interface Dexie {
    cloud: DexieCloudAPI;
    realms: Table<DBRealm, string, DBRealmEntity>;
    members: Table<DBRealmMember, string, DBRealmMemberEntity >;
    roles: Table<DBRealmRole, [string, string], DBRealmRoleEntity>;
  }

  interface Table {
    newId(options: NewIdOptions): string;
    idPrefix(): string;
  }

  interface DexieConstructor {
    Cloud: {
      (db: Dexie): void;

      version: string;
    };
  }
}
