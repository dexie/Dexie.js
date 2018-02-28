import { AtomicFormula, Expression } from './expression';
import { VirtualIndexLookup, VirtualIndex } from '../L2-virtual-indexes';
import { KeyRange, DBCore } from '../L1-dbcore/dbcore';
import { isArray, assert } from '../../../functions/utils';
import { KeyMap } from '../../../helpers/keymap';
import { Conjunction } from './disjunctive-normal-form';

//const MAX_COMPOUND_COMBOS = 100; // BORT! Acceptera bara ett range! Lös resten i ett övre lager annars!

/** What we need to solve here:
 * 
 * Input: operands: array of MultiRangeCriterias
 * Output: operands: array of MultiRangeCriterias with fewer items
 * 
 * Reason for the fewer items in the Output, is that some properties can be combined using some of
 * the available compound indexes found in given lookup.
 * 
 * If an orderBy hint was given, a compound index based on the orderBy 
 * 
 */
export function utilizeCompoundIndexes(
  con: Conjunction,
  lookup: VirtualIndexLookup,
  orderByHint?: string) : Conjunction
{
  const {operands} = con;
  const propMap = KeyMap<AtomicFormula>();
  operands.forEach(op => propMap.set(op.keyPath, op));
  const possibleCompounds: string[][] = [];
  let longestKey = 0;
  operands.filter(c => !isArray(c.keyPath)).forEach(criteria => {
    const {keyPath, ranges} = criteria;
    const idxs = lookup[keyPath as string];
    if (!idxs) return; // Silently ignore. We're not the one to judge non-existing indexes.
    if (ranges.length !== 1 || !KeyRange.isSingleValued(ranges[0])) {
      // This compound index does not qualify for being utilized.
      return;
    }
    idxs.forEach(({keyLength, keyPaths}) => {
      for (let i=1; i<keyLength; ++i) {
        let {ranges} = propMap.get(keyPaths[i]);
        if (!ranges && keyPath[i] === orderByHint) {
          // allow a long compound index where the last keyPath is equal to orderByHint, even
          // though there's no such criteria. Add such criteria if so.
          const op: AtomicFormula = {keyPath: keyPath[i], type: 'atom', ranges: [KeyRange.whatever()]};
          propMap.set(keyPath[i], op);
          ranges = op.ranges;
        }
        if (ranges) {
          possibleCompounds.push(keyPaths.slice(0, i+1));
          if (i > longestKey) longestKey = i;
          if (ranges.length !== 1 || !KeyRange.isSingleValued(ranges[0])) {
            // This part does not qualify for further compoundization...
            break;
          }
        }
      }
    })
  });
  // OK, so now we may have some candidates in possibleCompounds.
  // Let's consume them one by one:
  // We're most interested in the longest ones.
  if (longestKey === 0) return con; // No compound key found
  let groupedCompounds: string[][][] = new Array(longestKey+1);
  possibleCompounds.forEach(c => {
    const {length} = c;
    const compoundsWithCertainLength = groupedCompounds[length] = groupedCompounds[length] || [];
    compoundsWithCertainLength.push(c);
  });
  for (let length = longestKey; length > 0; --length) {
    const candidates = groupedCompounds[length];
    if (!candidates) continue;
    // Make the one with orderByHint match come first:
    candidates.sort((a,b) => a[length - 1] === orderByHint ? -1 : 1);
    applyCompoundIndex(candidates[0]);
  }

  function applyCompoundIndex(keyPaths: string[]) {
    const ops = keyPaths.map(keyPath => propMap.get(keyPath));
    if (!ops.every(op => !!op)) {
      // Parts of this compound index has already been swallowed into another compound index.
      return;
    }
    // Remove existing ones
    ops.forEach(op => propMap.delete(op.keyPath));
    // Add the new one
    const steeringRanges = ops.pop().ranges;
    assert (ops.every(op => op.ranges.length === 1 && KeyRange.isSingleValued(op.ranges[0])));
    const groundKey = ops.map(({ranges}) => ranges[0].lower);
    propMap.set(keyPaths, {
      type: 'atom' as 'atom',
      keyPath: keyPaths,
      ranges: steeringRanges.map(range => ({
        lower: [...groundKey, range.lower],
        lowerOpen: range.lowerOpen,
        upper: [...groundKey, range.upper],
        upperOpen: range.upperOpen
      }))
    });
  }

  return {
    type: 'CON',
    operands: propMap.values()
  };
}

