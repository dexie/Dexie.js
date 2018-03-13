import { ExpressionQuery, AtomicFormula, OrExpression, NotExpression, AndExpression } from "./expression";
import { invertRanges } from './invert-ranges';

interface NotTable {
  atom: {
    0: (a: AtomicFormula) => AtomicFormula, // if negate = false
    1: (a: AtomicFormula) => AtomicFormula},// if negate = true
  or: {
    0: (a: OrExpression) => OrExpression,
    1: (a: OrExpression) => AndExpression},
  and: {
    0: (a: AndExpression) => AndExpression,
    1: (a: AndExpression) => OrExpression},
  not: {
    0: (a: NotExpression) => ExpressionQuery,
    1: (a: NotExpression) => ExpressionQuery}
};
        
const NotTable: NotTable = {
  atom: [
    a => a, // if negate == false
    a => ({...a, ranges: invertRanges(a.ranges)})], // if negate == true
  or: [
    or => ({type: "or", operands: or.operands.map(opr => eliminateNot(opr))}),
    or => ({type: "and", operands: or.operands.map(opr => eliminateNot(opr, true))}),
  ],
  and: [
    and => ({type: "and", operands: and.operands.map(opr => eliminateNot(opr))}),
    and => ({type: "or", operands: and.operands.map(opr => eliminateNot(opr, true))}),
  ],
  not: [
    not => eliminateNot(not.operand, true),
    not => eliminateNot(not.operand)
  ]
}

export function eliminateNot(opr: ExpressionQuery, negate?: boolean) : ExpressionQuery {
  const func = NotTable[opr.type][negate ? 1 : 0] as (x: ExpressionQuery) => ExpressionQuery;
  if (!func) throw new Error('Invalid expression type: ' + opr.type);
  return func(opr);
}
