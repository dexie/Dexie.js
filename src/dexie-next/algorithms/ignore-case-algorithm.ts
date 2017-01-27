import {PlainExpression} from '../expression';
import {CursorObserver} from '../cursor-observer';
import {Cursor} from '../cursor';
import {exceptions} from '../exceptions';
import {cmp, reverseCmp} from '../cmp';
import {keyRangeIntersection} from '../keyrange';

// Needs review!

function upperFactory(reverse: boolean) {
    return reverse ? s => s.toLowerCase() : s => s.toUpperCase();
}
function lowerFactory(reverse: boolean) {
    return reverse ? s => s.toUpperCase() : s => s.toLowerCase();
}

const STRING_EXPECTED = "String expected.";

function nextCasing(key: string, lowerKey: string, upperNeedle: string, lowerNeedle: string, cmp: (a,b)=>number, reverse: boolean) {
    var length = Math.min(key.length, lowerNeedle.length);
    var llp = -1;
    for (var i = 0; i < length; ++i) {
        var lwrKeyChar = lowerKey[i];
        if (lwrKeyChar !== lowerNeedle[i]) {
            if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
            if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
            if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
            return null;
        }
        if (cmp(key[i], lwrKeyChar) < 0) llp = i;
    }
    if (length < lowerNeedle.length && !reverse) return key + upperNeedle.substr(key.length);
    if (length < key.length && reverse) return key.substr(0, upperNeedle.length);
    return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
}

export function initIgnoreCaseAlgorithm (
        expr: PlainExpression,
        reverse: boolean, 
        observer: CursorObserver,
        match: (x,a) => boolean,
        needles: string[],
        suffix: string) : CursorObserver
{
    const needlesLen = needles.length;
    const upper = reverse ? s => s.toLowerCase() : s => s.toUpperCase();
    const lower = reverse ? s => s.toUpperCase() : s => s.toLowerCase();
    const compare = reverse ? reverseCmp : cmp;
    const needleBounds = needles
        .map(needle => ({lower: lower(needle), upper: upper(needle)}))
        .sort((a, b) => compare(a.lower, b.lower));
    const upperNeedles = needleBounds.map(nb => nb.upper);
    const lowerNeedles = needleBounds.map(nb => nb.lower);
    const nextKeySuffix = reverse ? suffix : "";
    let done = false;
    let firstPossibleNeedle = 0;

    return {
        initCursor: observer.initCursor, // TODO: Need to rewrite cursor.advance as well!

        get cursor () { return observer.cursor; },

        keyRange: keyRangeIntersection(
            observer.keyRange,
            IDBKeyRange.bound(upperNeedles[0], lowerNeedles[needlesLen-1] + suffix)),

        onNext (cursor: Cursor) {
            const key = cursor.key;
            if (typeof key !== 'string') return;
            const lowerKey = lower(key);
            if (match(lowerKey, lowerNeedles)) {
                observer.onNext (cursor);
            } else {
                let lowestPossibleCasing: string | null = null;
                for (var i=firstPossibleNeedle; i<needlesLen; ++i) {
                    var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                    if (casing === null && lowestPossibleCasing === null)
                        firstPossibleNeedle = i + 1;
                    else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                        lowestPossibleCasing = casing;
                    }
                }
                if (lowestPossibleCasing !== null) {
                    cursor.continue(lowestPossibleCasing + nextKeySuffix);
                } else {
                    done = true;
                }             
            }
        },

        get done() {
            return observer.done || done;
        }
    }
}
