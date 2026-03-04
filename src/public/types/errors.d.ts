import { IndexableTypeArrayReadonly } from "./indexable-type";

/** DexieError
 * 
 * Common base class for all errors originating from Dexie.js except TypeError,
 * SyntaxError and RangeError.
 * 
 * https://dexie.org/docs/DexieErrors/DexieError
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
 * Each error should be documented at https://dexie.org/docs/DexieErrors/Dexie.<errname>
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
  // https://dexie.org/docs/DexieErrors/Dexie.OpenFailedError
  OpenFailed: 'OpenFailedError',

  // https://dexie.org/docs/DexieErrors/Dexie.VersionChangeError
  VersionChange: 'VersionChangeError',

  // https://dexie.org/docs/DexieErrors/Dexie.SchemaError
  Schema: 'SchemaError',

  // https://dexie.org/docs/DexieErrors/Dexie.UpgradeError
  Upgrade: 'UpgradeError',

  // https://dexie.org/docs/DexieErrors/Dexie.InvalidTableError
  InvalidTable: 'InvalidTableError',

  // https://dexie.org/docs/DexieErrors/Dexie.MissingAPIError
  MissingAPI: 'MissingAPIError',

  // https://dexie.org/docs/DexieErrors/Dexie.NoSuchDatabaseError
  NoSuchDatabase: 'NoSuchDatabaseError',

  // https://dexie.org/docs/DexieErrors/Dexie.InvalidArgumentError
  InvalidArgument: 'InvalidArgumentError',

  // https://dexie.org/docs/DexieErrors/Dexie.SubTransactionError
  SubTransaction: 'SubTransactionError',

  // https://dexie.org/docs/DexieErrors/Dexie.UnsupportedError
  Unsupported: 'UnsupportedError',

  // https://dexie.org/docs/DexieErrors/Dexie.InternalError
  Internal: 'InternalError',

  // https://dexie.org/docs/DexieErrors/Dexie.DatabaseClosedError
  DatabaseClosed: 'DatabaseClosedError',

  // https://dexie.org/docs/DexieErrors/Dexie.PrematureCommitError
  PrematureCommit: 'PrematureCommitError',

  // https://dexie.org/docs/DexieErrors/Dexie.ForeignAwaitError
  ForeignAwait: 'ForeignAwaitError',

  // https://dexie.org/docs/DexieErrors/Dexie.UnknownError
  Unknown: 'UnknownError',

  // https://dexie.org/docs/DexieErrors/Dexie.ConstraintError
  Constraint: 'ConstraintError',

  // https://dexie.org/docs/DexieErrors/Dexie.DataError
  Data: 'DataError',

  // https://dexie.org/docs/DexieErrors/Dexie.TransactionInactiveError
  TransactionInactive: 'TransactionInactiveError',

  // https://dexie.org/docs/DexieErrors/Dexie.ReadOnlyError
  ReadOnly: 'ReadOnlyError',
  
  // https://dexie.org/docs/DexieErrors/Dexie.VersionError
  Version: 'VersionError',

  // https://dexie.org/docs/DexieErrors/Dexie.NotFoundError
  NotFound: 'NotFoundError',

  // https://dexie.org/docs/DexieErrors/Dexie.InvalidStateError
  InvalidState: 'InvalidStateError',

  // https://dexie.org/docs/DexieErrors/Dexie.InvalidAccessError
  InvalidAccess: 'InvalidAccessError',

  // https://dexie.org/docs/DexieErrors/Dexie.AbortError
  Abort: 'AbortError',

  // https://dexie.org/docs/DexieErrors/Dexie.TimeoutError
  Timeout: 'TimeoutError',

  // https://dexie.org/docs/DexieErrors/Dexie.QuotaExceededError
  QuotaExceeded: 'QuotaExceededError',

  // https://dexie.org/docs/DexieErrors/Dexie.DataCloneError
  DataClone: 'DataCloneError'
}

/** ModifyError
 * 
 * https://dexie.org/docs/DexieErrors/Dexie.ModifyError
 */
export interface ModifyError extends DexieError {
  failures: Array<any>;
  failedKeys: IndexableTypeArrayReadonly;
  successCount: number;
}

/** BulkError
 * 
 * https://dexie.org/docs/DexieErrors/Dexie.BulkError
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
