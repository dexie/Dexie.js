import { CursorObserver, ObjectStore, RangeQuery, KeyRange } from './idbcore';

/* Motsvarar expresion engine på högsta nivå.
Kan ha liknande metoder som idbcore, men troligen inte identiskt.*/

export type Expression =
  MultiRangeExpression |
  ArithmeticExpression |
  LogicalExpression;

export const enum ExpressionType {
  MultiRange =1,
  Arithmetic = 2,
  Logical = 3
}

export interface MultiRangeExpression {
  type: ExpressionType.MultiRange;
  op: 'inRanges';
  keyPath: string;
  ranges: KeyRange[];
  ignoreCase?: boolean; // Överkurs för nu. Behövs ett ignoreCase lager samt att ANDOR-matrix skiljer dessa som om de vore annan keyPath.
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

export interface Query {
  table: string;
  expr: Expression; // Only Key
  orderBy?: { // Not allowed in IDBCore
    keyPaths: string[];
    reverse?: boolean;
  };
  limit?: number;
  want: {
    pageToken?: boolean;
    count?: boolean;
    keys?: boolean;
    values?: boolean;
  }
}

export interface DBCore {
  //transaction(), put(), add(), delete() samma som IDCore's!
  //även get() samma!
  // MEN: Det som skiljer är:
  getAll(req: Query | RangeQuery): Promise<any[]>;
  openCursor(req: Query | RangeQuery, observer: CursorObserver): void;
  count(req: Query): Promise<number>;
  createComparer(table: string, property: string): (a: any, b: any) => number;
}
