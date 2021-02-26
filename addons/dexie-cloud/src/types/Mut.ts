import { DBCoreKeyRange } from "dexie";

export type Mut = AddMut | PutMut | DeleteMut;

export interface DeleteMut {
  rev: number;
  type: "delete";
  keys: any[];
  txid: string;
  criteria?:
    | {
        index: string | null;
        range: DBCoreKeyRange;
      }
    | false;
}

export interface PutMut {
  rev: number;
  type: "put";
  keys: any[];
  txid: string;
  criteria?:
    | {
        index: string | null;
        range: DBCoreKeyRange;
      }
    | false;
  changeSpec?: { [keyPath: string]: any } | false;
  values?: any[];
}

export interface AddMut {
  rev: number;
  type: "add";
  keys: any[];
  txid: string;
  values?: any[];
}
