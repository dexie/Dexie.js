import { IndexableTypeArray, IndexableTypeArrayReadonly } from "./indexable-type";
import { Collection } from "./collection";
import { IndexableType } from "./indexable-type";

export interface WhereClause<T=any, TKey=IndexableType> {
  above(key: any): Collection<T, TKey>;
  aboveOrEqual(key: any): Collection<T, TKey>;
  anyOf(keys: IndexableTypeArrayReadonly): Collection<T, TKey>;
  anyOf(...keys: IndexableTypeArray): Collection<T, TKey>;
  anyOfIgnoreCase(keys: string[]): Collection<T, TKey>;
  anyOfIgnoreCase(...keys: string[]): Collection<T, TKey>;
  below(key: any): Collection<T, TKey>;
  belowOrEqual(key: any): Collection<T, TKey>;
  between(lower: any, upper: any, includeLower?: boolean, includeUpper?: boolean): Collection<T, TKey>;
  equals(key: any): Collection<T, TKey>;
  equalsIgnoreCase(key: string): Collection<T, TKey>;
  inAnyRange(ranges: ReadonlyArray<{0: any, 1: any}>): Collection<T, TKey>;
  startsWith(key: string): Collection<T, TKey>;
  startsWithAnyOf(prefixes: string[]): Collection<T, TKey>;
  startsWithAnyOf(...prefixes: string[]): Collection<T, TKey>;
  startsWithIgnoreCase(key: string): Collection<T, TKey>;
  startsWithAnyOfIgnoreCase(prefixes: string[]): Collection<T, TKey>;
  startsWithAnyOfIgnoreCase(...prefixes: string[]): Collection<T, TKey>;
  noneOf(keys: Array<any>): Collection<T, TKey>;
  notEqual(key: any): Collection<T, TKey>;
}
