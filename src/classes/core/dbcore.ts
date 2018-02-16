import { CursorObserver, RangeQuery, KeyRange, DBCore } from './L1-dbcore/dbcore';

/* Motsvarar expresion engine på högsta nivå.
Kan ha liknande metoder som idbcore, men troligen inte identiskt.*/

export type Expression =
  ArithmeticExpression |
  LogicalExpression;

export const enum ExpressionType {
  Arithmetic = 1,
  Logical = 2
}

export interface ArithmeticExpression {
  type: ExpressionType.Arithmetic;
  op: string;
  keyPath: string;
  rvalues: any[];
}

export interface LogicalExpression {
  type: ExpressionType.Logical;
  op: string;
  operands: Expression[];
}

export interface MultiRangeQuery {
  table: string;
  index?: string;
  ranges: KeyRange[];
  reverse?: boolean;
  limit?: number;
  want: {
    pageToken?: boolean;
    count?: boolean;
    keys?: boolean;
    primaryKeys?: boolean;
    values?: boolean;
  }
}

export interface InsersectionQuery {
  table: string;
  ranges: KeyRange[];
  reverse?: boolean;
  limit?: number;
  want: {
    pageToken?: boolean;
    count?: boolean;
    keys?: boolean;
    primaryKeys?: boolean;
    values?: boolean;
  }
}

export interface ExpressionQuery {
  table: string;
  expr: Expression;
  orderBy?: { // Not allowed in IDBCore
    keyPaths: string[];
    reverse?: boolean;
  };
  limit?: number;
  want: {
    pageToken?: boolean;
    count?: boolean;
    keys?: boolean;
    primaryKeys?: boolean;
    values?: boolean;
  }
}

export interface QueryResponse {
  pageToken?: any;
  count?: number;
  keys?: any[];
  primaryKeys?: any[];
  values?: any[];
}

export type Query = ExpressionQuery | RangeQuery;

export interface MultiRangeCore extends DBCore {
  queryRanges(req: MultiRangeExpression): Promise<QueryResponse>;
}

//export interface 

export interface ExpressionCore extends DBCore {
  // MEN: Det som skiljer är:
  expression(req: ExpressionQuery): Promise<QueryResponse>;
}

