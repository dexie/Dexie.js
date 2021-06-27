import { BaseRevisionMapEntry } from './BaseRevisionMapEntry.js';
import { DBOperationsSet } from './DBOperationsSet.js';
import { DexieCloudSchema } from './DexieCloudSchema.js';

export interface SyncRequest {
  dbID?: string;
  schema: DexieCloudSchema;
  lastPull?: {
    serverRevision: any;
    realms: string[];
    inviteRealms: string[];
  };
  baseRevs: BaseRevisionMapEntry[];
  changes: DBOperationsSet;
  //invites: {[inviteId: string]: "accept" | "reject"}
}
