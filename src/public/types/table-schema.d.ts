import { IndexSpec } from "./index-spec";

export interface TableSchema {
  name: string;
  primKey: IndexSpec;
  indexes: IndexSpec[];
  yProps?: {prop: string, updTable: string}[];
  mappedClass: Function;
  idxByName: {[name: string]: IndexSpec};
  readHook?: (x:any) => any
}
