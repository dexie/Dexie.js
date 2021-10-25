import {
  DBCore,
  DBCoreCursor,
  DBCoreQuery,
  DBCoreQueryRequest,
  DBCoreQueryResponse,
  DBCoreSchema,
  DBCoreTable,
  DBCoreTransaction,
  DbCoreTransactionOptions,
} from '../public/types/dbcore';
import { DexieMango } from './DexieMango';

export interface QueryCore {
  stack: 'querycore';
  transaction(
    stores: string[],
    mode: 'readonly' | 'readwrite',
    options?: DbCoreTransactionOptions
  ): DBCoreTransaction;
  readonly MIN_KEY: any;
  readonly MAX_KEY: any;
  readonly schema: DBCoreSchema;
  table(name: string): QueryCoreTable;
}

export interface QueryCoreTable
  extends Omit<DBCoreTable, 'query' | 'openCursor' | 'count'> {
  query(req: QueryCoreQueryRequest): Promise<DBCoreQueryResponse>;
  openCursor(req: QueryCoreOpenCursorRequest): Promise<DBCoreCursor>;
  count(req: QueryCoreCountRequest): Promise<number>;
}

export interface QueryCoreQueryRequest
  extends Omit<DBCoreQueryRequest, 'query'> {
  offset?: number;
  query: DexieMango;
  orderBy?: {
    keyPath: string;
  }[];
  options: QueryCoreQueryOptions;
}

export interface QueryCoreQueryOptions {
  conserveMemory?: boolean;
}

export interface Query