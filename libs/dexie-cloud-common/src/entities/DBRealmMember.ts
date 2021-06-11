import { DBPermissionSet } from '../DBPermissionSet.js';
import { DBSyncedObject } from './DBSyncedObject.js';

export interface DBRealmMember extends DBSyncedObject {
  id?: string;
  userId?: string;
  email?: string;
  name?: string;
  invite?: boolean;
  invited?: Date;
  accepted?: Date;
  rejected?: Date;
  roles?: string[];
  permissions?: DBPermissionSet;
}
