import { IndexableTypeArray, IndexableTypeArrayReadonly } from "./indexable-type";
import { Collection } from "./collection";
import { IndexableType } from "./indexable-type";

export interface WhereClause<T=any, TKey=IndexableType, TInsertType=T> {
  above(key: any): Collection<T, TKey, TInsertType>;
  aboveOrEqual(key: any): Collection<T, TKey, TInsertType>;
  anyOf(keys: ReadonlyArray<IndexableType>): Collection<T, TKey, TInsertType>;
  anyOf(...keys: Array<IndexableType>): Collection<T, TKey, TInsertType>;
  anyOfIgnoreCase(keys: string[]): Collection<T, TKey, TInsertType>;
  anyOfIgnoreCase(...keys: string[]): Collection<T, TKey, TInsertType>;
  below(key: any): Collection<T, TKey, TInsertType>;
  belowOrEqual(key: any): Collection<T, TKey, TInsertType>;
  between(lower: any, upper: any, includeLower?: boolean, includeUpper?: boolean): Collection<T, TKey, TInsertType>;
  equals(key: IndexableType): Collection<T, TKey, TInsertType>;
  equalsIgnoreCase(key: string): Collection<T, TKey, TInsertType>;
  inAnyRange(ranges: ReadonlyArray<{0: any, 1: any}>, options?: { includeLowers?: boolean, includeUppers?: boolean }): Collection<T, TKey, TInsertType>;
  startsWith(key: string): Collection<T, TKey, TInsertType>;
  startsWithAnyOf(prefixes: string[]): Collection<T, TKey, TInsertType>;
  startsWithAnyOf(...prefixes: string[]): Collection<T, TKey, TInsertType>;
  startsWithIgnoreCase(key: string): Collection<T, TKey, TInsertType>;
  startsWithAnyOfIgnoreCase(prefixes: string[]): Collection<T, TKey, TInsertType>;
  startsWithAnyOfIgnoreCase(...prefixes: string[]): Collection<T, TKey, TInsertType>;
  noneOf(keys: ReadonlyArray<IndexableType>): Collection<T, TKey, TInsertType>;
  notEqual(key: IndexableType): Collection<T, TKey, TInsertType>;
}
