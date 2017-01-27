import {Expression} from '../expression';

export class Query {
    expr: Expression | null;
    orderBy: string | string[] | null;
    offset: number;
    limit: number;
    keysOnly: boolean;
    reverse: boolean;
    unique: boolean;

    constructor (query: Partial<Query>, baseQuery?: Query) {
        if (!baseQuery) baseQuery = {
            expr: null,
            orderBy: null,
            offset: 0,
            limit: Infinity,
            keysOnly: false,
            reverse: false,
            unique: false
        };
        this.expr = query.expr || baseQuery.expr;
        this.orderBy = query.orderBy || baseQuery.orderBy;
        this.offset = 'offset' in query ? query.offset as number: baseQuery.offset;
        this.limit = 'limit' in query ? query.limit as number : baseQuery.limit;
        this.keysOnly = 'keysOnly' in query ? query.keysOnly as boolean : baseQuery.keysOnly;
        this.reverse = 'reverse' in query ? query.reverse as boolean : baseQuery.reverse;
        this.unique = 'unique' in query ? query.unique as boolean : baseQuery.unique;
    }
}
