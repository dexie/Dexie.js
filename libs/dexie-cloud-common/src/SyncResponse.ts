import { DBOperationsSet } from './DBOperationsSet.js';
import { DexieCloudSchema } from './DexieCloudSchema.js';
import { YServerMessage } from './yjs/YMessage.js';

export interface SyncResponse {
  serverRevision: string; // string "[1,\"2823\"]" in protocol version 2. (was bigint in version 1).
  dbId: string;
  realms: string[];
  inviteRealms: string[];
  schema: DexieCloudSchema;
  changes: DBOperationsSet<string>;
  rejections: { name: string; message: string; txid: string }[];
  yMessages: YServerMessage[];
}
