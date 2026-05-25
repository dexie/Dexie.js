import { DBCoreMutateRequest, ObservabilitySet } from 'dexie';
import { DexieCloudSchema } from 'dexie-cloud-common';
import { UserLogin } from '../db/entities/UserLogin';

export interface TXExpandos {
  txid: string;
  currentUser: UserLogin;
  schema: DexieCloudSchema;
  disableChangeTracking?: boolean;
  disableAccessControl?: boolean;
  disableBlobResolve?: boolean;
  mutationsAdded?: boolean;
  mutatedParts?: ObservabilitySet;
  opCount: number;
}
