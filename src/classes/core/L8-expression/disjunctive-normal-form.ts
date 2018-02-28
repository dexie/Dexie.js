import { Expression, NotExpression, AtomicFormula, Formula, OrExpression, AndExpression } from "./expression";
import { eliminateNot } from './eliminate-not';
import { assert } from '../../../functions/utils';
import { exceptions } from '../../../errors';

export interface DisjunctiveNormalForm extends Formula {
  type: 'DIS';
  operands: Conjunction[];
}

export interface Conjunction extends Formula {
  type: 'CON';
  operands: AtomicFormula[];
}

/** Converts given expression https://en.wikipedia.org/wiki/Disjunctive_normal_form
 * 
 * @param expression Expression to normalize
 */
export function disjunctiveNormalForm(expression: Expression): DisjunctiveNormalForm {
  // Convert the expression to an equivalent expression without NOT operators involved:
  const expressionWithoutNot = eliminateNot(expression);
  // All NOT expressions are now eliminated recursively by replacing them with their
  // inverted operand.

  // Recursively put a switch property on each OR-operator, representing state, current path.
  const expressionWithSwitches = addSwitches(expressionWithoutNot);
  // Now every OR-operation has a switch cursor on it (a state)

  // Collect all conjunctions based on all switch values:
  const conjunctions: Conjunction[] = [];
  for(;;){
    const [conjunction, hasMore] = getNextConjunction(expressionWithSwitches);
    conjunctions.push(conjunction);
    if (!hasMore) break;
  }
  
  return {
    type: "DIS",
    operands: conjunctions
  } as DisjunctiveNormalForm;
}

// Need to locally extend OrExpression interface with a switch
declare module './expression' {
  interface OrExpression {
    switch?: number;
  }
}

/** Deep clone given expression, but let each OrExpressions in clone
 * get a property "switch" (number) initialized to 0. This property will
 * point out one of the operands to follow. to create one of the conjunctions
 * in the discunctive normal form. The first OrExpression closes to the tree-leafs
 * will get its switch incremented for next run, unless it already points to
 * the last path. If so, the next OrExpression in the treewalk will get
 * its switch incremented, and so on... until all OrExpression's switches
 * points to their final path.
 */
function addSwitches(expr: Expression): Expression {
  if (expr.type === 'or') {
    return {type: 'or', switch: 0, operands: expr.operands.map(addSwitches)};
  } else if (expr.type === 'and') {
    return {type: 'and', operands: expr.operands.map(addSwitches)}
  }
}

/** 
 * 
 * @param expr Expression, where each OrOperation has a switch on it. 
 */
function getNextConjunction(expr: Expression) : [Conjunction, boolean] {
  let switchedOne = false;
  const rv = followPath([], expr);
  return [{type: 'CON', operands: rv}, switchedOne];
  
  function followPath (path: AtomicFormula[], opr: Expression) : AtomicFormula[] {
    if (opr.type === 'and') {
      return [].concat(opr.operands.map(opr => followPath(getPath(opr), opr)));
    } else if (opr.type === 'or') {
      const currentOp = opr.operands[opr.switch];
      const rv = followPath(getPath(currentOp), currentOp);
      if (!switchedOne && opr.switch < opr.operands.length - 1) {
        switchedOne = true;
        ++opr.switch; // update state: switch to next operand
      }
      return rv;
    } else {
      return path;
    }
  }

  function getPath(opr: Expression): AtomicFormula[] {
    if (opr.type === 'and') {
      return [].concat(opr.operands.map(opr => getPath(opr)));
    } else if (opr.type === 'or') {
      return getPath(opr.operands[opr.switch]);
    } else {
      return [].concat(opr);
    }
  }
}

