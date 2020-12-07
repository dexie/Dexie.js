import { IndexableType } from "./indexable-type";

export type RangeBtree = RangeBtreeNode | EmptyRange;
export interface RangeBtreeNode {
  from: IndexableType; // lower bound
  to: IndexableType; // upper bound
  l: RangeBtreeNode | null; // left
  r: RangeBtreeNode | null; // right
  d: number; // depth
}
export interface EmptyRange {
  d: 0
}

export interface RangeSetPrototype {
  add(rangeSet: RangeBtree | {from: IndexableType, to: IndexableType}): RangeSet;
  addKey(key: IndexableType): RangeSet;
  addKeys(keys: IndexableType[]): RangeSet;
  [Symbol.iterator](): Iterator<RangeBtreeNode, undefined, IndexableType | undefined>;
}

export type RangeSet = RangeSetPrototype & RangeBtree;

export interface RangeSetConstructor {
  (tree: RangeBtree): RangeSet;
  new (): RangeSet;
  new (from: IndexableType, to?: IndexableType): RangeSet;
}
