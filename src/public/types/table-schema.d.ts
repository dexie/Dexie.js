import { IndexSpec } from "./index-spec";

export interface TableSchema {
  name: string;
  primKey: IndexSpec;
  indexes: IndexSpec[];
  yProps?: {prop: string, updatesTable: string}[]; // Available if y-dexie addon is used and schema defines Y.Doc properties.
  mappedClass: Function;
  idxByName: {[name: string]: IndexSpec};
  readHook?: (x:any) => any
}
