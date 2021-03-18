import { DBCoreKeyRange } from "dexie";

export type DBOperation =
  | DBInsertOperation
  | DBUpsertOperation
  | DBUpdateOperation
  | DBDeleteOperation;

export interface DBOperationCommon {
  rev?: number;
  keys: any[]; // Needed also in delete and update operations when criteria is specificied: for server->client rollback operation
  txid: string;
  userId?: string;
}
export interface DBInsertOperation extends DBOperationCommon {
  type: "insert";
  values?: any[];
}

export interface DBUpsertOperation extends DBOperationCommon {
  type: "upsert";
  values?: any[];
}

export interface DBUpdateOperation extends DBOperationCommon {
  type: "update";
  criteria?:
    | {
        index: string | null;
        range: DBCoreKeyRange;
      }
    | false;
  changeSpec: { [keyPath: string]: any };
}

export interface DBDeleteOperation extends DBOperationCommon {
  type: "delete";
  criteria?:
    | {
        index: string | null;
        range: DBCoreKeyRange;
      }
    | false;
}
