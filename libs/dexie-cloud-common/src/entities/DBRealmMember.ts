import { DBPermissionSet } from '../DBPermissionSet.js';
import { DBSyncedObject } from './DBSyncedObject.js';

export interface DBRealmMember extends DBSyncedObject {
  id?: string;
  userId?: string;
  email?: string;
  name?: string;
  invite?: boolean;
  invitedDate?: Date; // Set by system in in processInvites
  invitedBy?: { // Set by system in in processInvites
    name: string;
    email: string;
    userId: string;
  }
  accepted?: Date;
  rejected?: Date;
  roles?: string[];
  permissions?: DBPermissionSet;
}
