/** A simple range without lowerOpen or upperOpen - only lowerBound and upperBound represented as a 1 or 2-items array.
 * Range is always inclusive (lowerOpen and upperOpen are always false)
 * First item represents lower bound.
 * Second item represents upper bound.
 * If array only has single item, it represents a single value where lower and upper bounds are the same.
 * 
 * This type of range is used in liveQuery.
 * 
 * Note also:
 *   * DBCore uses DBCoreKeyRange which is similar to IDBKeyRange
 *   * IndexedDB natively uses IDBKeyRange.
 **/
export type SimpleRange = [any] | [any, any];
