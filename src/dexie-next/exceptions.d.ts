
export class DexieError extends Error {
    name: string;
    message: string;
    stack: string;
    inner: any;

    constructor (name?:string, message?:string);
    toString(): string;
}

export module exceptions {
    
    class Modify extends DexieError{
        constructor (msg?:string, failures?: any[], successCount?: number, failedKeys?: any[]);
        failures: any[];
        failedKeys: any[];
        successCount: number;
    }
    
    class Bulk extends DexieError{
        constructor (msg?:string, failures?: any[]);
        failures: Array<any>;
    }
    
    class OpenFailed extends DexieError {constructor (msg?: string, inner?: Object);constructor (inner: Object);}
    class VersionChange extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Schema extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Upgrade extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class InvalidTable extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class MissingAPI extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class NoSuchDatabase extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class InvalidArgument extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class SubTransaction extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Unsupported extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Internal extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class DatabaseClosed extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Unknown extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Constraint extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Data extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class TransactionInactive extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class ReadOnly extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Version extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class NotFound extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class InvalidState extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class InvalidAccess extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Abort extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Timeout extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class QuotaExceeded extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class Syntax extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
    class DataClone extends DexieError {constructor (msg?: string, inner?: Object);	constructor (inner: Object);}
}