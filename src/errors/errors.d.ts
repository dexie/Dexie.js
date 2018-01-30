import {
  DexieError,
  DexieErrorConstructor,
  ModifyError,
  ModifyErrorConstructor,
  BulkError,
  BulkErrorConstructor,
  ExceptionAliasSet,
  ExceptionSet
} from "../public/types/errors";

export declare const DexieError: DexieErrorConstructor;
export declare const ModifyError: ModifyErrorConstructor;
export declare const BulkError: BulkErrorConstructor;
export declare const exceptions : ExceptionAliasSet & {
  Syntax: ErrorConstructor,
  Type: ErrorConstructor,
  Range: ErrorConstructor
};
export declare const errnames : {[P in keyof ExceptionSet]: P};
export declare const fullNameExceptions : ExceptionSet;
export declare function mapError (domError, message?) : DexieError;
