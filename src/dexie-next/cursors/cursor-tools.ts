import {Cursor} from '../cursor';
import {CursorObserver} from '../cursor-observer';

/**
 * Only IDBCursor has a native advance() method. In order to support Cursor.advance() on all methods
 * we provide, we must 'polyfill' advance by invoking cursor.continue() N number of times on each call
 * to CursorObserver.onNext().
 * 
 * This function creates a manual Cursor.advance() method to set on your proxy cursor instance. It needs
 * a reference to the CursorObserver to be used in conjunction with the cursor, so that the CursorObserver
 * can be patched while advancing.
 */
export function createManualCursorAdvanceMethod (cursor: Cursor, observer: CursorObserver) {
    return function advance (count: number) {
        const origOnNext = observer.onNext;
        if (count > 1) observer.onNext = () => {
            if (--count === 1) observer.onNext = origOnNext;
            this.continue();
        }
        this.continue();
    }
}
