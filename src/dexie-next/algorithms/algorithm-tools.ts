import {PlainExpression} from '../expression';
import {CursorObserver} from '../cursor-observer';
import {Cursor} from '../cursor';
import {exceptions} from '../exceptions';
import {initIgnoreCaseAlgorithm} from './ignore-case-algorithm';

//import {CursorFilter, CursorFilterFactory, createFilteredCursorObserver} from '../cursor-filter';

// TODO: Rewrite this!

export function getAlgorithm (expression: PlainExpression, reverse: boolean, observer: CursorObserver) {
    switch (expression.op) {
        case "equalsIgnoreCase":
            return initIgnoreCaseAlgorithm (expression, reverse, observer, (x, a) => x === a[0], [expression.value], "");
        case "startsWithIgnoreCase":
            //if (expression.value === "") return this.startsWith(""); // needed?
            return initIgnoreCaseAlgorithm (expression, reverse, observer, (x, a) => x.indexOf(a[0]) === 0, [expression.value], String.fromCharCode(65535));
    }    
}

