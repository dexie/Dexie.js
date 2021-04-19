import { DexieCloudSchema } from "../../DexieCloudSchema";
import { DBOperationsSet } from "./DBOperationsSet";

export interface SyncResponse {
  serverRevision: any;
  dbId: string;
  realms: string[];
  schema: DexieCloudSchema,
  changes: DBOperationsSet;
}
