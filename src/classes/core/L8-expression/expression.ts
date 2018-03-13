import { KeyRange } from '../L1-dbcore/dbcore';

export type ExpressionQuery =
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
  operands: ExpressionQuery[];
}

export interface AndExpression {
  type: 'and';
  operands: ExpressionQuery[];
}

export interface NotExpression {
  type: 'not';
  operand: ExpressionQuery;
}

