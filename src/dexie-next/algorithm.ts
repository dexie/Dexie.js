import {CursorFilter} from './cursor-filter';
import {ReversibleCompareTools} from './compare-tools';

export type Algorithm = (reverse: boolean, tools: ReversibleCompareTools) => CursorFilter;
