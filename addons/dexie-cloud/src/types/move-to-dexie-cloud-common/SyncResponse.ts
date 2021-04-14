import { DBOperationsSet } from "./DBOperationsSet";

export interface SyncResponse {
  serverRevision: any;
  dbId: string;
  realms: string[];
  changes: DBOperationsSet;
}
