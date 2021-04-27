import { IndexableType } from "./indexable-type";

export type IntervalTree = IntervalTreeNode | EmptyRange;
export interface IntervalTreeNode {
  from: IndexableType; // lower bound
  to: IndexableType; // upper bound
  l: IntervalTreeNode | null; // left
  r: IntervalTreeNode | null; // right
  d: number; // depth
}
export interface EmptyRange {
  d: 0
}

export interface RangeSetPrototype {
  add(rangeSet: IntervalTree | {from: IndexableType, to: IndexableType}): RangeSet;
  addKey(key: IndexableType): RangeSet;
  addKeys(keys: IndexableType[]): RangeSet;
  [Symbol.iterator](): Iterator<IntervalTreeNode, undefined, IndexableType | undefined>;
}

export type RangeSet = RangeSetPrototype & IntervalTree;

export interface RangeSetConstructor {
  (tree: IntervalTree): RangeSet;
  new (): RangeSet;
  new (from: IndexableType, to?: IndexableType): RangeSet;
}
