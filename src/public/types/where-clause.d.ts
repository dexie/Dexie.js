import { IndexableTypeArray, IndexableTypeArrayReadonly } from "./indexable-type";
import { Collection } from "./collection";
import { IndexableType } from "./indexable-type";

export interface WhereClause<T = any, TKey extends IndexableType = any, TEntity = T> {
  above(key: any): Collection<T, TKey, TEntity>;
  aboveOrEqual(key: any): Collection<T, TKey, TEntity>;
  anyOf(keys: ReadonlyArray<IndexableType>): Collection<T, TKey, TEntity>;
  anyOf(...keys: Array<IndexableType>): Collection<T, TKey, TEntity>;
  anyOfIgnoreCase(keys: string[]): Collection<T, TKey, TEntity>;
  anyOfIgnoreCase(...keys: string[]): Collection<T, TKey, TEntity>;
  below(key: any): Collection<T, TKey, TEntity>;
  belowOrEqual(key: any): Collection<T, TKey, TEntity>;
  between(lower: any, upper: any, includeLower?: boolean, includeUpper?: boolean): Collection<T, TKey, TEntity>;
  equals(key: IndexableType): Collection<T, TKey>;
  equalsIgnoreCase(key: string): Collection<T, TKey>;
  inAnyRange(ranges: ReadonlyArray<{0: any, 1: any}>, options?: { includeLowers?: boolean, includeUppers?: boolean }): Collection<T, TKey, TEntity>;
  startsWith(key: string): Collection<T, TKey, TEntity>;
  startsWithAnyOf(prefixes: string[]): Collection<T, TKey, TEntity>;
  startsWithAnyOf(...prefixes: string[]): Collection<T, TKey, TEntity>;
  startsWithIgnoreCase(key: string): Collection<T, TKey, TEntity>;
  startsWithAnyOfIgnoreCase(prefixes: string[]): Collection<T, TKey, TEntity>;
  startsWithAnyOfIgnoreCase(...prefixes: string[]): Collection<T, TKey, TEntity>;
  noneOf(keys: ReadonlyArray<IndexableType>): Collection<T, TKey, TEntity>;
  notEqual(key: IndexableType): Collection<T, TKey, TEntity>;
}
