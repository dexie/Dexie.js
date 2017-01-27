import {KeyRange} from './keyrange';

export interface CursorFilter {
    keyRange: Partial<KeyRange>;
    filter (currentKeys: {key, primaryKey}) : CursorFilterResult;
    done: boolean;
}

export type CursorFilterResult =
    { match: true,  wantedKey?: undefined, wantedPrimaryKey?: undefined} |
    { match: false, wantedKey: any,        wantedPrimaryKey?: undefined} |
    { match: false, wantedKey: any,        wantedPrimaryKey: any};


