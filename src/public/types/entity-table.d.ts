import { IndexableType } from "..";
import { InsertType } from "./insert-type";
import { IsStrictlyAny } from "./is-strictly-any";
import { Table } from "./table";

/** IDType extract the actual type of the primary key:
 *  * If TKey is a literal type that names a property of T, extract the type using T[TKey]
 *  * Else, use TKey as is.
 */
export type IDType<T, TKeyPropNameOrKeyType> = IsStrictlyAny<T> extends true
  ? TKeyPropNameOrKeyType
  : TKeyPropNameOrKeyType extends string
  ? TKeyPropNameOrKeyType extends keyof T
    ? T[TKeyPropNameOrKeyType]
    : TKeyPropNameOrKeyType
  : TKeyPropNameOrKeyType;

export type EntityTable<T, TKeyPropName extends keyof T = never, TInsertType = InsertType<T, TKeyPropName>> = Table<T, IDType<T, TKeyPropName>, TInsertType>;

