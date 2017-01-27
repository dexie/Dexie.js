import {Cursor} from './cursor';
import {KeyRange} from './keyrange';

export interface CursorObserver {
    initCursor(cursor: Cursor) : void;
    keyRange: Partial<KeyRange>;
    onNext(cursor: Cursor);
    done: boolean;
}
