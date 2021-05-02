import { BaseRevisionMapEntry } from './BaseRevisionMapEntry.js';
import { DBOperationsSet } from './DBOperationsSet.js';
import { DexieCloudSchema } from './DexieCloudSchema.js';

export interface SyncRequest {
  dbID?: string;
  schema: DexieCloudSchema;
  lastPull?: {
    serverRevision: any;
    realms: string[];
  };
  baseRevs: BaseRevisionMapEntry[];
  //baseRevisions: syncState?.baseRevisions || [],
  changes: DBOperationsSet;
}
