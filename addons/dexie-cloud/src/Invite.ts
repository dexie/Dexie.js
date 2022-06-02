import { DBPermissionSet, DBRealm, DBRealmMember } from 'dexie-cloud-common';

export interface Invite extends DBRealmMember {
  realm?: DBRealm & { permissions: DBPermissionSet };
  accept(): Promise<void>;
  reject(): Promise<void>;
}
