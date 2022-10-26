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
declare module 'dexie' {
  interface Dexie {
    cloud: DexieCloudAPI;
    realms: Table<DBRealm, 'realmId', 'owner'>;
    members: Table<DBRealmMember, 'id', 'realmId' | 'owner'>;
    roles: Table<DBRealmRole, [string, string], 'owner'>;
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
