import { IndexableTypeArrayReadonly } from "./types/indexable-type";

/**
 * List of errors types that can be thrown when using Dexie. To add a new subclass of DexieError,
 * (without special constructor parameters), just add your name to this list, as well as to the
 * corresponding list in errors.js.
 * 
 * If you need a special error like BulkError and ModifyError, search how BulkError is defined and
 * where you will need to patch types in this module.
 */
export type DexieErrors = {
  Dexie: 'DexieError',
  OpenFailed: 'OpenFailedError',
  VersionChange: 'VersionChangeError',
  Schema: 'SchemaError',
  Upgrade: 'UpgradeError',
  InvalidTable: 'InvalidTableError',
  MissingAPI: 'MissingAPIError',
  NoSuchDatabase: 'NoSuchDatabaseError',
  InvalidArgument: 'InvalidArgumentError',
  SubTransaction: 'SubTransactionError',
  Unsupported: 'UnsupportedError',
  Internal: 'InternalError',
  DatabaseClosed: 'DatabaseClosedError',
  PrematureCommit: 'PrematureCommitError',
  ForeignAwait: 'ForeignAwaitError',
  Unknown: 'UnknownError',
  Constraint: 'ConstraintError',
  Data: 'DataError',
  TransactionInactive: 'TransactionInactiveError',
  ReadOnly: 'ReadOnlyError',
  Version: 'VersionError',
  NotFound: 'NotFoundError',
  InvalidState: 'InvalidStateError',
  InvalidAccess: 'InvalidAccessError',
  Abort: 'AbortError',
  Timeout: 'TimeoutError',
  QuotaExceeded: 'QuotaExceededError',
  Syntax: 'SyntaxError',
  DataClone: 'DataCloneError'
}

export class ModifyError extends DexieError {
  constructor (msg?:string, failures?: any[], successCount?: number, failedKeys?: IndexableTypeArrayReadonly);
  failures: Array<any>;
  failedKeys: IndexableTypeArrayReadonly;
  successCount: number;
}

export interface ModifyErrorConstructor {
  new (
    msg?:string,
    failures?: any[],
    successCount?: number,
    failedKeys?: IndexableTypeArrayReadonly) : ModifyError
}
  
export class BulkError extends DexieError {
  constructor (msg?:string, failures?: any[]);
  failures: Array<any>;
}

export interface BulkErrorConstructor {
  new (msg?:string, failures?: any[]) : BulkError
}

export interface DexieErrorConstructor {
  new(msg?: string, inner?: Object) : DexieError;
  new(inner: Object): DexieError
}

export class DexieError extends Error {
  name: string;
  message: string;
  stack: string;
  inner: any;

  constructor (name?:string, message?:string);
  toString(): string;
}


export type ExceptionAliasSet = {[ShortName in keyof DexieErrors]: DexieErrorConstructor} & {
  Modify: ModifyErrorConstructor;
  Bulk: BulkErrorConstructor;
}

export declare const exceptions : ExceptionAliasSet & {Type: ErrorConstructor, Range: ErrorConstructor};

export type ExceptionSet = {[P in DexieErrors[keyof DexieErrors]]: DexieErrorConstructor};

export declare const errnames : {[P in keyof ExceptionSet]: P};

export declare const fullNameExceptions : ExceptionSet;

export declare function mapError (domError, message) : DexieError;
