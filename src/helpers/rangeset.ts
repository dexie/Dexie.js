import { cmp } from "../functions/cmp";
import { extend, iteratorSymbol, props } from '../functions/utils';
import { IndexableType } from '../public';
import {
  EmptyRange,
  RangeBtree,
  RangeBtreeNode,
  RangeSetConstructor,
  RangeSetPrototype,
} from "../public/types/rangeset";

function isEmptyRange(node: RangeBtree | {from: IndexableType, to: IndexableType}): node is EmptyRange {
  return !("from" in node);
}

export type RangeSet = RangeSetPrototype & RangeBtree;

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
  add(rangeSet: RangeBtree | {from: IndexableType, to: IndexableType}) {
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

  [iteratorSymbol](): Iterator<RangeBtreeNode, undefined, IndexableType | undefined> {
    return getRangeSetIterator(this);
  }
});

function addRange(target: RangeBtree, from: IndexableType, to: IndexableType) {
  if (cmp(from, to) > 0) throw RangeError();
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
  // Re-add left?
  if (left && !target.l) {
    //Ranges to the left may be swallowed. Cut it of and re-add all.
    //Could probably be done more efficiently!
    mergeRanges(target, left);
  }
  // Re-add right?
  if (right && !target.r) {
    //Ranges to the right may be swallowed. Cut it of and re-add all.
    //Could probably be done more efficiently!
    mergeRanges(target, right);
  }
}

export function mergeRanges(target: RangeBtree, newSet: RangeBtree | {from: IndexableType, to: IndexableType}) {
  function _addRangeSet(
    target: RangeBtree,
    { from, to, l, r }: RangeBtreeNode | {from: IndexableType, to: IndexableType, l?: undefined, r?: undefined}
  ) {
    addRange(target, from, to);
    if (l) _addRangeSet(target, l);
    if (r) _addRangeSet(target, r);
  }

  if(!isEmptyRange(newSet)) _addRangeSet(target, newSet);
}

export function rangesOverlap(
  rangeSet1: RangeBtree,
  rangeSet2: RangeBtree
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
      n: RangeBtreeNode;
      s: 0 | 1 | 2 | 3;
    }
  | undefined
  | null;
export function getRangeSetIterator(
  node: EmptyRange | RangeBtreeNode
): Generator<RangeBtreeNode, undefined, IndexableType | undefined> {
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
  } as Generator<RangeBtreeNode, undefined, IndexableType>;
}

function rebalance(target: RangeBtreeNode) {
  const clone = { ...target };
  const diff = (target.r?.d || 0) - (target.l?.d || 0);
  const r = diff > 1 ? "r" : diff < -1 ? "l" : "";
  if (r) {
    // Rotate
    const l = r === "r" ? "l" : "r";
    extend(target, clone[r]);
    extend(clone[r], clone);
    clone[r]![r] = target[l];
    target[l] = clone[r];
    clone[r]!.d = computeDepth(clone[r]!);
  }
  target.d = computeDepth(target);
}

function computeDepth({ r, l }: Pick<RangeBtreeNode, "l" | "r">) {
  return (r ? (l ? Math.max(r.d, l.d) : r.d) : l ? l.d : 0) + 1;
}
