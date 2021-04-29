import { DBOperationsSet } from "./DBOperationsSet.js";
import { DexieCloudSchema } from "./DexieCloudSchema.js";

export interface SyncResponse {
  serverRevision: any;
  dbId: string;
  realms: string[];
  schema: DexieCloudSchema,
  changes: DBOperationsSet;
}
