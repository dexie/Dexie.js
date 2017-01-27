import {isArray} from './tools/utils';

export const MAX_STRING = String.fromCharCode(65535);

export const MAX_KEY = (()=>{try {IDBKeyRange.only([[]]); return [[]];} catch (e) { return MAX_STRING; }})();

export const MIN_KEY = -Infinity;

export const supportsArrayKeys = typeof MAX_KEY !== 'string';

export const cmp = (a,b) => indexedDB.cmp(a,b);

/*export const cmp = supportsArrayKeys ?
    (a, b) => indexedDB.cmp(a, b) :
    (a, b) => {
        if (isArray(a)) {
            if (isArray(b)) {
                for (let i=0,l=a.length;i<l;++i) {
                    let bItem = b[i];
                    let diff = cmp(a[i], b[i]);
                    if (diff) return diff;
                }
                return 0;
                return 
            }
        }
    };*/


export function equals (a, b) {
    return indexedDB.cmp(a, b) === 0;
}

export function reverseCmp (a, b) {
    return 0 - cmp(a, b);
}

export function max (a, b) {
    return cmp(a,b) > 0 ? a : b;
}

export function min (a, b) {
    return cmp(a,b) < 0 ? a : b;
}

export function minOrUndefined (a, b) {
    return a === undefined ? a :
           b === undefined ? b :
           min(a,b);
}

export function maxOrUndefined (a, b) {
    return a === undefined ? a :
           b === undefined ? b :
           max(a,b);
}

export interface ReversibleCompareTools {
    min (a, b)
    max (a, b);
    readonly MIN_KEY;
    readonly MAX_KEY;
    cmp (a, b);
    minOrUndefined (a, b);
}

export function getReversibleCompareTools (reverse: boolean) : ReversibleCompareTools {
    return reverse ? {
        min: max,
        max: min,
        MIN_KEY: MAX_KEY,
        MAX_KEY: MIN_KEY,
        cmp: reverseCmp,
        minOrUndefined: maxOrUndefined
    } : {
        min: min,
        max: max,
        MIN_KEY: MIN_KEY,
        MAX_KEY: MAX_KEY,
        cmp: cmp,
        minOrUndefined: minOrUndefined
    }
}
