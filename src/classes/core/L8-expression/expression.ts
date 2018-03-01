import { KeyRange } from '../L1-dbcore/dbcore';

export type Expression =
  AtomicFormula |
  OrExpression |
  AndExpression |
  NotExpression;

export interface AtomicFormula {
  type: 'atom';
  keyPath: string | string[];
  ranges: KeyRange[]; // Precondition: ranges must be sorted!
}

export interface OrExpression {
  type: 'or';
  operands: Expression[];
}

export interface AndExpression {
  type: 'and';
  operands: Expression[];
}

export interface NotExpression {
  type: 'not';
  operand: Expression;
}

