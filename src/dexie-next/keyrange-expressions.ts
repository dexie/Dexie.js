import {PlainExpression} from './expression';
import {KeyRange} from './keyrange';

const KEYRANGE_EXPRESSIONS : {[operation: string] : (value:any) => Partial<KeyRange>} = {
    above: value => IDBKeyRange.lowerBound(value, true),
    aboveOrEqual: value => IDBKeyRange.lowerBound(value, false),
    below: value => IDBKeyRange.upperBound(value, true),
    belowOrEqual: value => IDBKeyRange.lowerBound(value, false),
    btween: value => IDBKeyRange.bound(value[0], value[1], false, false),
    equals: value => IDBKeyRange.only(value)
}

export function getKeyPathAndKeyRange (expression: PlainExpression) {
    const initKeyRange = KEYRANGE_EXPRESSIONS[expression.op];
    return {
        keyPath: (expression as PlainExpression).keyPath,
        keyRange: initKeyRange && initKeyRange((expression as PlainExpression).value)
    };
}
