import { IndexableTypeArrayReadonly } from "./indexable-type";

/** DexieError
 * 
 * Common base class for all errors originating from Dexie.js except TypeError,
 * SyntaxError and RangeError.
 * 
 * http://dexie.org/docs/DexieErrors/DexieError
 * 
 */
export interface DexieError extends Error {
  name: string;
  message: string;
  stack: string;
  inner: any;
  toString(): string;
}

/**
 * List of the names of auto-generated error classes that extends DexieError
 * and shares the interface of DexieError.
 * 
 * Each error should be documented at http://dexie.org/docs/DexieErrors/Dexie.<errname>
 * 
 * The generic type DexieExceptionClasses is a map of full error name to
 * error constructor. The DexieExceptionClasses is mixed in into Dexie,
 * so that it is always possible to throw or catch certain errors via
 * Dexie.ErrorName. Example:
 * 
 * try {
 *   throw new Dexie.InvalidTableError("Invalid table foo", innerError?);
 * } catch (err) {
 *   if (err instanceof Dexie.InvalidTableError) {
 *     // Could also have check for err.name === "InvalidTableError", or
 *     // err.name === Dexie.errnames.InvalidTableError.
 *     console.log("Seems to be an invalid table here...");
 *   } else {
 *     throw err;
 *   }
 * }
 */
export type DexieErrors = {
  // http://dexie.org/docs/DexieErrors/Dexie.OpenFailedError
  OpenFailed: 'OpenFailedError',

  // http://dexie.org/docs/DexieErrors/Dexie.VersionChangeError
  VersionChange: 'VersionChangeError',

  // http://dexie.org/docs/DexieErrors/Dexie.SchemaError
  Schema: 'SchemaError',

  // http://dexie.org/docs/DexieErrors/Dexie.UpgradeError
  Upgrade: 'UpgradeError',

  // http://dexie.org/docs/DexieErrors/Dexie.InvalidTableError
  InvalidTable: 'InvalidTableError',

  // http://dexie.org/docs/DexieErrors/Dexie.MissingAPIError
  MissingAPI: 'MissingAPIError',

  // http://dexie.org/docs/DexieErrors/Dexie.NoSuchDatabaseError
  NoSuchDatabase: 'NoSuchDatabaseError',

  // http://dexie.org/docs/DexieErrors/Dexie.InvalidArgumentError
  InvalidArgument: 'InvalidArgumentError',

  // http://dexie.org/docs/DexieErrors/Dexie.SubTransactionError
  SubTransaction: 'SubTransactionError',

  // http://dexie.org/docs/DexieErrors/Dexie.UnsupportedError
  Unsupported: 'UnsupportedError',

  // http://dexie.org/docs/DexieErrors/Dexie.InternalError
  Internal: 'InternalError',

  // http://dexie.org/docs/DexieErrors/Dexie.DatabaseClosedError
  DatabaseClosed: 'DatabaseClosedError',

  // http://dexie.org/docs/DexieErrors/Dexie.PrematureCommitError
  PrematureCommit: 'PrematureCommitError',

  // http://dexie.org/docs/DexieErrors/Dexie.ForeignAwaitError
  ForeignAwait: 'ForeignAwaitError',

  // http://dexie.org/docs/DexieErrors/Dexie.UnknownError
  Unknown: 'UnknownError',

  // http://dexie.org/docs/DexieErrors/Dexie.ConstraintError
  Constraint: 'ConstraintError',

  // http://dexie.org/docs/DexieErrors/Dexie.DataError
  Data: 'DataError',

  // http://dexie.org/docs/DexieErrors/Dexie.TransactionInactiveError
  TransactionInactive: 'TransactionInactiveError',

  // http://dexie.org/docs/DexieErrors/Dexie.ReadOnlyError
  ReadOnly: 'ReadOnlyError',
  
  // http://dexie.org/docs/DexieErrors/Dexie.VersionError
  Version: 'VersionError',

  // http://dexie.org/docs/DexieErrors/Dexie.NotFoundError
  NotFound: 'NotFoundError',

  // http://dexie.org/docs/DexieErrors/Dexie.InvalidStateError
  InvalidState: 'InvalidStateError',

  // http://dexie.org/docs/DexieErrors/Dexie.InvalidAccessError
  InvalidAccess: 'InvalidAccessError',

  // http://dexie.org/docs/DexieErrors/Dexie.AbortError
  Abort: 'AbortError',

  // http://dexie.org/docs/DexieErrors/Dexie.TimeoutError
  Timeout: 'TimeoutError',

  // http://dexie.org/docs/DexieErrors/Dexie.QuotaExceededError
  QuotaExceeded: 'QuotaExceededError',

  // http://dexie.org/docs/DexieErrors/Dexie.DataCloneError
  DataClone: 'DataCloneError'
}

/** ModifyError
 * 
 * http://dexie.org/docs/DexieErrors/Dexie.ModifyError
 */
export interface ModifyError extends DexieError {
  failures: Array<any>;
  failedKeys: IndexableTypeArrayReadonly;
  successCount: number;
}

/** BulkError
 * 
 * http://dexie.org/docs/DexieErrors/Dexie.BulkError
 */
export interface BulkError extends DexieError {
  failures: Error[];
  failuresByPos: {[operationNumber: number]: Error};
}

export interface DexieErrorConstructor {
  new(msg?: string, inner?: Object) : DexieError;
  new(inner: Object): DexieError;
  prototype: DexieError;
}

export interface ModifyErrorConstructor {
  new (
    msg?:string,
    failures?: any[],
    successCount?: number,
    failedKeys?: IndexableTypeArrayReadonly) : ModifyError;
  prototype: ModifyError;
}

export interface BulkErrorConstructor {
  new (msg?:string, failures?: {[operationNumber: number]: Error}) : BulkError;
  prototype: BulkError;
}

export type ExceptionAliasSet = {[ShortName in keyof DexieErrors]: DexieErrorConstructor} & {
  Dexie: DexieErrorConstructor,
  Modify: ModifyErrorConstructor;
  Bulk: BulkErrorConstructor;
}

export type ExceptionSet = {[P in DexieErrors[keyof DexieErrors]]: DexieErrorConstructor};

export type DexieExceptionClasses = ExceptionSet & {
  DexieError: DexieErrorConstructor,
  ModifyError: ModifyErrorConstructor;
  BulkError: BulkErrorConstructor;
}
