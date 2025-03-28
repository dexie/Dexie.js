import { BaseRevisionMapEntry } from './BaseRevisionMapEntry.js';
import { DBOperationsSet } from './DBOperationsSet.js';
import { DexieCloudSchema } from './DexieCloudSchema.js';
import { YClientMessage } from './yjs/YMessage.js';

export interface SyncRequest {
  v?: number;
  dbID?: string;
  clientIdentity?: string;
  schema: DexieCloudSchema;
  lastPull?: {
    serverRevision: string | bigint;
    yServerRevision?: string;
    realms: string[];
    inviteRealms: string[];
  };
  baseRevs: BaseRevisionMapEntry[];
  changes: DBOperationsSet;
  y?: YClientMessage[];
  dxcv?: string; // dexie libs and versions
  //invites: {[inviteId: string]: "accept" | "reject"}
}
