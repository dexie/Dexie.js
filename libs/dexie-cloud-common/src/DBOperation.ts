
export type DBOpPrimaryKey = string | (string | number)[];

const enum DBCoreRangeType {
  Equal = 1,
  Range = 2,
  Any = 3,
  Never = 4
}

/** This interface must be identical to the interface with same name in dexie.
 * If DBCore ever gets moved out from dexie we could let it be referenced.
 * We could also be dependent on dexie but it would be a pitty just for this reason.
*/
interface DBCoreKeyRange {
  readonly type: DBCoreRangeType | number;
  readonly lower: any;
  readonly lowerOpen?: boolean;
  readonly upper: any;
  readonly upperOpen?: boolean;
}

export type DBOperation<PK=DBOpPrimaryKey> =
  | DBInsertOperation<PK>
  | DBUpsertOperation<PK>
  | DBUpdateOperation<PK>
  | DBModifyOperation<PK>
  | DBDeleteOperation<PK>;

export interface DBOperationCommon<PK=DBOpPrimaryKey> {
  rev?: number;
  ts?: number | null; // timestamp
  keys: PK[]; // Needed also in delete and update operations when criteria is specificied: for server->client rollback operation
  txid?: string | null;
  userId?: string | null;
  opNo?: number;
  isAdditionalChunk?: boolean;
}
export interface DBInsertOperation<PK=DBOpPrimaryKey> extends DBOperationCommon<PK> {
  type: "insert";
  values: readonly any[];
}

export interface DBUpsertOperation<PK=DBOpPrimaryKey> extends DBOperationCommon<PK> {
  type: "upsert";
  values: readonly any[];
  changeSpecs?: ({ [keyPath: string]: any } | null)[];
}

export interface DBUpdateOperation<PK=DBOpPrimaryKey> extends DBOperationCommon<PK> {
  type: "update";
  changeSpecs: { [keyPath: string]: any }[];
}

export interface DBModifyOperation<PK=DBOpPrimaryKey> extends DBOperationCommon<PK> {
  type: "modify";
  criteria: {
    index: string | null;
    range: DBCoreKeyRange;
  },
  changeSpec: { [keyPath: string]: any };
}


export interface DBDeleteOperation<PK=DBOpPrimaryKey> extends DBOperationCommon<PK> {
  type: "delete";
  criteria?:
    | {
        index: string | null;
        range: DBCoreKeyRange;
      }
    | false;
}
