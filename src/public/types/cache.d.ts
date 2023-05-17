import { ObservabilitySet } from './db-events';
import {
  DBCoreCountRequest,
  DBCoreGetManyRequest,
  DBCoreGetRequest,
  DBCoreKeyRange,
  DBCoreMutateRequest,
  DBCoreQueryRequest,
} from './dbcore';
import { IntervalTree } from './rangeset';

export type GlobalQueryCache = {
  [part: string]: TblQueryCache; // part is `idb://${dbName}/${tableName}`
};

export interface TblQueryCache {
  queries: {
    query: {[indexName: string]: CacheEntry[]};
    count: {[indexName: string]: CacheEntry[]};
  },
  objs: Map<string | number, object>;
  optimisticOps: DBCoreMutateRequest[];
  unsignaledParts: ObservabilitySet;
  signalTimer?: number;
}

interface CacheEntryCommon {
  subscribers: Set<() => void>;
  obsSet: ObservabilitySet;
  promise: Promise<any>;
  dirty: boolean;
}

export type CacheEntry = CacheEntryCommon &
  (
    | {
        type: 'query';
        req: DBCoreQueryRequest;
        res?: readonly any[];
      }
    | {
        type: 'count';
        req: DBCoreCountRequest;
        res?: number;
      }
  );
