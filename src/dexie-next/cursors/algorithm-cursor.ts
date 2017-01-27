import {Cursor} from '../cursor';
import {CursorObserver} from '../cursor-observer';
import {createManualCursorAdvanceMethod} from './cursor-tools';

/**
 * Creates a Cursor with a manual advance() method that invokes this.continue() N times
 * to emulate the native IDBCursor.advance().
 */
export function createAlgorithmCursor (cursor: Cursor, observer: CursorObserver) {
    return Object.create(cursor, {
        advance: {
            value: createManualCursorAdvanceMethod(cursor, observer)
        }
    })
}
