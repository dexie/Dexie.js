import {
  DBCoreCountRequest,
  DBCoreCursor,
  DBCoreGetManyRequest,
  DBCoreGetRequest,
  DBCoreMutateRequest,
  DBCoreMutateResponse,
  DBCoreOpenCursorRequest,
  DBCoreQueryRequest,
  DBCoreQueryResponse,
  DBCoreSchema,
  DBCoreTableSchema,
  DBCoreTransaction,
  DbCoreTransactionOptions,
} from './dbcore';

export interface DBQueryCore {
  stack: 'dbquerycore';
  // Transaction and Object Store
  transaction(
    stores: string[],
    mode: 'readonly' | 'readwrite',
    options?: DbCoreTransactionOptions
  ): DBCoreTransaction;

  // Utility methods
  readonly MIN_KEY: any;
  readonly MAX_KEY: any;
  readonly schema: DBCoreSchema;
  table(name: string): DBQueryCoreTable;
}

export interface DBQueryCoreTable {
  readonly name: string;
  readonly schema: DBCoreTableSchema;

  mutate(req: DBQueryCoreMutateRequest): Promise<DBCoreMutateResponse>;
  get(req: DBCoreGetRequest): Promise<any>;
  getMany(req: DBCoreGetManyRequest): Promise<any[]>;
  query(req: DBCoreQueryRequest): Promise<DBCoreQueryResponse>;
  openCursor(req: DBCoreOpenCursorRequest): Promise<DBCoreCursor | null>;
  count(req: DBCoreCountRequest): Promise<number>;
}

export type DBQueryCoreMutateRequest = DBCoreMutateRequest | DBQueryCoreUpdateRequest

export interface DBQueryCoreUpdateRequest {
  type: 'update';
  trans: DBCoreTransaction;
  keys: readonly any[];
  changeSpecs: {[keyPath: string]: any}[]; // changeSpec per key.
}
