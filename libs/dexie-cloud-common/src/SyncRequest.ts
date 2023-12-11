import { BaseRevisionMapEntry } from './BaseRevisionMapEntry.js';
import { DBOperationsSet } from './DBOperationsSet.js';
import { DexieCloudSchema } from './DexieCloudSchema.js';

export interface SyncRequest {
  v?: number;
  dbID?: string;
  clientIdentity?: string;
  schema: DexieCloudSchema;
  lastPull?: {
    serverRevision: string | bigint;
    realms: string[];
    inviteRealms: string[];
  };
  baseRevs: BaseRevisionMapEntry[];
  changes: DBOperationsSet;
  //invites: {[inviteId: string]: "accept" | "reject"}
}
