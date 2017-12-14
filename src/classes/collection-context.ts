import { Table } from './table';
import { Collection } from './collection';


export interface CollectionContext<T=any, TKey extends IDBValidKey=any> {
  table: Table;
  index?: string | null;
  isPrimKey?: boolean;
  range: IDBKeyRange;
  keysOnly: boolean;
  dir: "next" | "prev";
  unique: "" | "unique";
  algorithm?: Function | null;
  filter?: Function | null;
  replayFilter: Function | null;
  justLimit: boolean; // True if a replayFilter is just a filter that performs a "limit" operation (or none at all)
  isMatch: Function | null;
  offset: number,
  limit: number,
  error: any, // If set, any promise must be rejected with this error
  or: Collection,
  valueMapper: (any) => any
}
