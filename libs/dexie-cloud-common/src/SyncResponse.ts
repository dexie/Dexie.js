import { DBOperationsSet } from './DBOperationsSet.js';
import { DexieCloudSchema } from './DexieCloudSchema.js';

export interface SyncResponse {
  serverRevision: string | bigint; // string "[1,\"2823\"]" in protocol version 2. bigint in version 1.
  dbId: string;
  realms: string[];
  inviteRealms: string[];
  schema: DexieCloudSchema;
  changes: DBOperationsSet;
  rejections: { name: string; message: string; txid: string }[];
  //invites: DBInvite[];
}
