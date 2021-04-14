import { DBCoreMutateRequest } from "dexie";
import { UserLogin } from '../db/entities/UserLogin';
import { DexieCloudSchema } from "../DexieCloudSchema";

export interface TXExpandos {
  txid: string;
  currentUser: UserLogin;
  schema: DexieCloudSchema
  disableChangeTracking?: boolean;
  disableAccessControl?: boolean;
}
