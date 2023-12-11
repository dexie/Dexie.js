import { DBPermissionSet } from "../DBPermissionSet.js";
import { DBSyncedObject } from "./DBSyncedObject.js";

export interface DBRealmRole extends DBSyncedObject {
  name: string;
  permissions: DBPermissionSet;
  description?: string;
  displayName?: string;
  sortOrder?: number;
}
