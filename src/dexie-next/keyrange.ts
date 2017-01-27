import {cmp} from './compare-tools';

/**
 * Interface similar to IDBKeyRange, but more correct as the bounds can optionally be undefined, which is not specified in the
 * global typescript defintion.
 */
export interface KeyRange {
    readonly lower: any;
    readonly lowerOpen: boolean;
    readonly upper: any;
    readonly upperOpen: boolean;
}

/** Generates the union of two key ranges */
export function keyRangeUnion(a: Partial<KeyRange> | undefined, b: Partial<KeyRange> | undefined) {
    if (!a || !b) return {lower: undefined, upper: undefined}; // undefined keyrange means all.
    const lowerCompare = a.lower === undefined ? -1 : b.lower === undefined ? 1 : cmp(a.lower, b.lower);
    const upperCompare = a.upper === undefined ? 1 : b.upper === undefined ? -1 : cmp(a.upper, b.upper);
    return {
        lower: lowerCompare < 0 ? a.lower : b.lower,
        lowerOpen:
            lowerCompare < 0 ? a.lowerOpen :
            lowerCompare > 0 ? b.lowerOpen :
            a.lowerOpen && b.lowerOpen,
        upper: upperCompare > 0 ? a.upper : b.upper,
        upperOpen:
            upperCompare > 0 ? a.upperOpen :
            upperCompare < 0 ? b.upperOpen :
            a.upperOpen && b.upperOpen,
    };
}

/** Generates the intersection of two key ranges. The result may be invalid, i.e. lower can be greater than upper.
 * Caller needs to check validity before passing the results to IndexedDB API, since it will throw if invalid.
 */
export function keyRangeIntersection (a: Partial<KeyRange> | undefined, b: Partial<KeyRange> | undefined) {
    if (!a) return b;
    if (!b) return a;
    const lowerCompare = a.lower === undefined ? -1 : b.lower === undefined ? 1 : cmp(a.lower, b.lower);
    const upperCompare = a.upper === undefined ? 1 : b.upper === undefined ? -1 : cmp(a.upper, b.upper);
    return {
        lower: lowerCompare < 0 ? b.lower : a.lower,
        lowerOpen:
            lowerCompare < 0 ? b.lowerOpen :
            lowerCompare > 0 ? a.lowerOpen :
            a.lowerOpen || b.lowerOpen,
        upper: upperCompare > 0 ? b.upper : a.upper,
        upperOpen:
            upperCompare > 0 ? b.upperOpen :
            upperCompare < 0 ? a.upperOpen :
            a.upperOpen || b.upperOpen,
    };
}
