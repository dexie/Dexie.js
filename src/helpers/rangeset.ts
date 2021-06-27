import { cmp } from "../functions/cmp";
import { extend, iteratorSymbol, props } from '../functions/utils';
import { IndexableType } from '../public';
import {
  EmptyRange,
  IntervalTree,
  IntervalTreeNode,
  RangeSetConstructor,
  RangeSetPrototype,
} from "../public/types/rangeset";

/* An interval tree implementation to efficiently detect overlapping ranges of queried indexes.
 *
 * https://en.wikipedia.org/wiki/Interval_tree
 * 
 */

function isEmptyRange(node: IntervalTree | {from: IndexableType, to: IndexableType}): node is EmptyRange {
  return !("from" in node);
}

export type RangeSet = RangeSetPrototype & IntervalTree;

export const RangeSet = function(fromOrTree: any, to?: any) {
  if (this) {
    // Called with new()
    extend(this, arguments.length ? {d:1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree} : {d:0});
  } else {
    // Called without new()
    const rv = new RangeSet();
    if (fromOrTree && ("d" in fromOrTree)) {
      extend(rv, fromOrTree);
    }
    return rv;
  }
} as RangeSetConstructor;

props(RangeSet.prototype, {
  add(rangeSet: IntervalTree | {from: IndexableType, to: IndexableType}) {
    mergeRanges(this, rangeSet);
    return this;
  },
  addKey(key: IndexableType) {
    addRange(this, key, key);
    return this;
  },
  addKeys(keys: IndexableType[]) {
    keys.forEach(key => addRange(this, key, key));
    return this;
  },

  [iteratorSymbol](): Iterator<IntervalTreeNode, undefined, IndexableType | undefined> {
    return getRangeSetIterator(this);
  }
});

function addRange(target: IntervalTree, from: IndexableType, to: IndexableType) {
  const diff = cmp(from, to);
  // cmp() returns NaN if one of the args are IDB-invalid keys.
  // Avoid storing invalid keys in rangeset:
  if (isNaN(diff)) return;

  // Caller is trying to add a range where from is greater than to:
  if (diff > 0) throw RangeError();
  
  if (isEmptyRange(target)) return extend(target, { from, to, d: 1 });
  const left = target.l;
  const right = target.r;
  if (cmp(to, target.from) < 0) {
    left
      ? addRange(left, from, to)
      : (target.l = { from, to, d: 1, l: null, r: null });
    return rebalance(target);
  }
  if (cmp(from, target.to) > 0) {
    right
      ? addRange(right, from, to)
      : (target.r = { from, to, d: 1, l: null, r: null });
    return rebalance(target);
  }
  // Now we have some kind of overlap. We will be able to merge the new range into the node or let it be swallowed.

  // Grow left?
  if (cmp(from, target.from) < 0) {
    target.from = from;
    target.l = null; // Cut off for now. Re-add later.
    target.d = right ? right.d + 1 : 1;
  }
  // Grow right?
  if (cmp(to, target.to) > 0) {
    target.to = to;
    target.r = null; // Cut off for now. Re-add later.
    target.d = target.l ? target.l.d + 1 : 1;
  }
  const rightWasCutOff = !target.r;
  // Re-add left?
  if (left && !target.l) {
    //Ranges to the left may be swallowed. Cut it of and re-add all.
    //Could probably be done more efficiently!
    mergeRanges(target, left);
  }
  // Re-add right?
  if (right && rightWasCutOff) {
    //Ranges to the right may be swallowed. Cut it of and re-add all.
    //Could probably be done more efficiently!
    mergeRanges(target, right);
  }
}

export function mergeRanges(target: IntervalTree, newSet: IntervalTree | {from: IndexableType, to: IndexableType}) {
  function _addRangeSet(
    target: IntervalTree,
    { from, to, l, r }: IntervalTreeNode | {from: IndexableType, to: IndexableType, l?: undefined, r?: undefined}
  ) {
    addRange(target, from, to);
    if (l) _addRangeSet(target, l);
    if (r) _addRangeSet(target, r);
  }

  if(!isEmptyRange(newSet)) _addRangeSet(target, newSet);
}

export function rangesOverlap(
  rangeSet1: IntervalTree,
  rangeSet2: IntervalTree
): boolean {
    // Start iterating other from scratch.
    const i1 = getRangeSetIterator(rangeSet2);
    let nextResult1 = i1.next();
    if (nextResult1.done) return false;
    let a = nextResult1.value;

    // Start iterating this from start of other
    const i2 = getRangeSetIterator(rangeSet1);
    let nextResult2 = i2.next(a.from); // Start from beginning of other range
    let b = nextResult2.value;

    while (!nextResult1.done && !nextResult2.done) {
      if (cmp(b!.from, a.to) <= 0 && cmp(b!.to, a.from) >= 0) return true;
      cmp(a.from, b!.from) < 0
        ? (a = (nextResult1 = i1.next(b!.from)).value!) // a is behind. forward it to beginning of next b-range
        : (b = (nextResult2 = i2.next(a.from)).value); // b is behind. forward it to beginning of next a-range
    }
  return false;
}

type RangeSetIteratorState =
  | {
      up?: RangeSetIteratorState;
      n: IntervalTreeNode;
      s: 0 | 1 | 2 | 3;
    }
  | undefined
  | null;
export function getRangeSetIterator(
  node: EmptyRange | IntervalTreeNode
): Generator<IntervalTreeNode, undefined, IndexableType | undefined> {
  let state: RangeSetIteratorState = isEmptyRange(node) ? null : { s: 0, n: node };

  return {
    next(key?) {
      const keyProvided = arguments.length > 0;
      while (state) {
        switch (state.s) {
          case 0:
            // Initial state for node.
            // Fast forward to leftmost node.
            state.s = 1;
            if (keyProvided) {
              while (state.n.l && cmp(key, state.n.from) < 0)
                state = { up: state, n: state.n.l, s: 1 };
            } else {
              while (state.n.l) state = { up: state, n: state.n.l, s: 1 };
            }
          // intentionally fall into case 1:
          case 1:
            // We're on a node where it's left part is already handled or does not exist.
            state.s = 2;
            if (!keyProvided || cmp(key, state.n.to) <= 0)
              return { value: state.n, done: false };
          case 2:
            // We've emitted our node and should continue with the right part or let parent take over from it's state 1
            if (state.n.r) {
              state.s = 3; // So when child is done, we know we're done.
              state = { up: state, n: state.n.r, s: 0 };
              continue; // Will fall in to case 0 with fast forward to left leaf of this subtree.
            }
          // intentionally fall into case 3:
          case 3:
            state = state.up;
        }
      }
      return { done: true };
    },
  } as Generator<IntervalTreeNode, undefined, IndexableType>;
}

function rebalance(target: IntervalTreeNode) {
  const diff = (target.r?.d || 0) - (target.l?.d || 0);
  const r = diff > 1 ? "r" : diff < -1 ? "l" : "";
  if (r) {

    // Rotate (https://en.wikipedia.org/wiki/Tree_rotation)
    //
    // 
    //                    [OLDROOT]
    //       [OLDROOT.L]            [NEWROOT]
    //                        [NEWROOT.L] [NEWROOT.R]
    //
    // Is going to become:
    //
    // 
    //                    [NEWROOT]
    //        [OLDROOT]             [NEWROOT.R]
    // [OLDROOT.L] [NEWROOT.L]  

    // * clone now has the props of OLDROOT
    // Plan:
    // * target must be given the props of NEWROOT
    // * target[l] must point to a new OLDROOT
    // * target[r] must point to NEWROOT.R
    // * OLDROOT[r] must point to NEWROOT.L
    const l = r === "r" ? "l" : "r"; // Support both left/right rotation
    const rootClone = { ...target };
    // We're gonna copy props from target's right node into target so that target will
    // have same range as old target[r] (instead of changing pointers, we copy values.
    // that way we do not need to adjust pointers in parents).
    const oldRootRight = target[r]; 
    target.from = oldRootRight.from;
    target.to = oldRootRight.to;
    target[r] = oldRootRight[r];
    rootClone[r] = oldRootRight[l];
    target[l] = rootClone;
    rootClone.d = computeDepth(rootClone);
  }
  target.d = computeDepth(target);
}

function computeDepth({ r, l }: Pick<IntervalTreeNode, "l" | "r">) {
  return (r ? (l ? Math.max(r.d, l.d) : r.d) : l ? l.d : 0) + 1;
}
