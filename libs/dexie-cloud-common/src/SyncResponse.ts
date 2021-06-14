import { DBOperationsSet } from './DBOperationsSet.js';
import { DexieCloudSchema } from './DexieCloudSchema.js';
import { DBInvite } from './entities/DBInvite.js';

export interface SyncResponse {
  serverRevision: any;
  dbId: string;
  realms: string[];
  inviteRealms: string[];
  schema: DexieCloudSchema;
  changes: DBOperationsSet;
  rejections: { name: string; message: string; txid: string }[];
  //invites: DBInvite[];
}
