import {Cursor} from '../cursor';
import {CursorObserver} from '../cursor-observer';
import {Algorithm} from '../algorithm';
import {getReversibleCompareTools} from '../compare-tools';
import {createAlgorithmCursor} from '../cursors/algorithm-cursor';

/**
 * Converts an Algorithm to a CursorObserver.
 */
export function createAlgorithmCursorObserver (
    reverse: boolean,
    observer: CursorObserver,
    algorithm: Algorithm) : CursorObserver
{
    const filter = algorithm(reverse, getReversibleCompareTools(reverse));
    let _cursor: Cursor;

    return {
        initCursor (cursor: Cursor) {
            _cursor = createAlgorithmCursor (cursor, this);
            observer.initCursor(_cursor);
        },

        keyRange: filter.keyRange,

        onNext(cursor) {
            const {match, wantedKey, wantedPrimaryKey} = filter.filter(cursor);
            if (match)
                observer.onNext(_cursor);
            else if (filter.done) {
                this.done = true;
            } else if (wantedPrimaryKey !== undefined) {
                cursor.continuePrimaryKey(wantedKey, wantedPrimaryKey);
            } else if (wantedKey !== undefined) {
                cursor.continue(wantedKey);
            } else {
                cursor.continue();
            }
        },

        done: false
    };
}
