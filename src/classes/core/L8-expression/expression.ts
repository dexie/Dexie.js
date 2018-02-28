import { KeyRange } from '../L1-dbcore/dbcore';

export type Expression =
  AtomicFormula |
  OrExpression |
  AndExpression |
  NotExpression;

export interface Formula {
  type: string;
}

export interface AtomicFormula extends Formula {
  keyPath: string | string[];
  type: 'atom';
  ranges: KeyRange[]; // Precondition: ranges must be sorted!
}

export interface OrExpression extends Formula {
  type: 'or';
  operands: Expression[];
}

export interface AndExpression extends Formula {
  type: 'and';
  operands: Expression[];
}

export interface NotExpression extends Formula {
  type: 'not';
  operand: Expression;
}

