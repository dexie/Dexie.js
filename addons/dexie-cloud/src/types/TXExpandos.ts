import { DBCoreMutateRequest } from "dexie";
import { DexieCloudSchema } from "dexie-cloud-common";
import { UserLogin } from '../db/entities/UserLogin';

export interface TXExpandos {
  txid: string;
  currentUser: UserLogin;
  schema: DexieCloudSchema
  disableChangeTracking?: boolean;
  disableAccessControl?: boolean;
  mutationsAdded?: boolean;
}
