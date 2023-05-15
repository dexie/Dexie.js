import { DBCoreCountRequest, DBCoreGetRequest, DBCoreMutateRequest, DBCoreQueryRequest, DBCoreQueryResponse } from "./dbcore";

export type GlobalQueryCache = {
  [part: string]: TblQueryCache; // part is `idb://${dbName}/${tableName}`
}

export interface TblQueryCache {
  queries: CacheEntry[];
  ops: OptimisticOperation[];
}

export interface OptimisticOperation {
  req: DBCoreMutateRequest;
  tx: IDBTransaction;
}

export interface CacheEntry {
  req: DBCoreQueryRequest | DBCoreGetRequest | DBCoreCountRequest;
  res: DBCoreQueryResponse;
  subscribers: Set<()=>void>;
}
