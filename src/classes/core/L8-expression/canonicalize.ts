import { DisjunctiveNormalForm } from './disjunctive-normal-form';

export function canonicalizeDnf ({operands}: DisjunctiveNormalForm): DisjunctiveNormalForm {
  /* TODO:
    1. Group each AtomicFormula by keyPath
    2. intersect each group logically, reducing number of AtomicFormulas.
    3. If an AtomicFormula logically evaluates to false, remove entire Conjunction from operands.
    4. If an AtomicFormula logically evaluates to true, remove the AtomicFormula from conjunctions.
    5. Group each Conjunction by sameness. If two are equivalent, remove one of them.
    6. If all but one AtomicFormula are equal and the differing one uses same keyPath, unify the Conjunctions
        into a single one, by converting the differing atoms to their union.
    7. If any Conjunction comprises a subset of another Conjunction, remove the Conjunction with the highest
       number of AtomicFormulas.
    8. Do an iteration again to check above reducable properties. If no further reduction could be made by
       any of these criterias, the canonicalization is considered complete.
  */
}
