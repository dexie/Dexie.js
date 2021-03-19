import { DBOperationsSet } from "./DBOperationsSet";

export interface SyncResponse {
  serverRevision: any;
  realms: string[];
  changes: DBOperationsSet;
}
