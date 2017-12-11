import { IndexableType, IndexableTypeArray, IndexableTypeArrayReadonly } from "../types/indexable-type";
import { Collection } from "./collection";

export interface WhereClause<T, Key> {
  above(key: IndexableType): Collection<T, Key>;
  aboveOrEqual(key: IndexableType): Collection<T, Key>;
  anyOf(keys: IndexableTypeArrayReadonly): Collection<T, Key>;
  anyOf(...keys: IndexableTypeArray): Collection<T, Key>;
  anyOfIgnoreCase(keys: string[]): Collection<T, Key>;
  anyOfIgnoreCase(...keys: string[]): Collection<T, Key>;
  below(key: IndexableType): Collection<T, Key>;
  belowOrEqual(key: IndexableType): Collection<T, Key>;
  between(lower: IndexableType, upper: IndexableType, includeLower?: boolean, includeUpper?: boolean): Collection<T, Key>;
  equals(key: IndexableType): Collection<T, Key>;
  equalsIgnoreCase(key: string): Collection<T, Key>;
  inAnyRange(ranges: Array<IndexableTypeArrayReadonly>): Collection<T, Key>;
  startsWith(key: string): Collection<T, Key>;
  startsWithAnyOf(prefixes: string[]): Collection<T, Key>;
  startsWithAnyOf(...prefixes: string[]): Collection<T, Key>;
  startsWithIgnoreCase(key: string): Collection<T, Key>;
  startsWithAnyOfIgnoreCase(prefixes: string[]): Collection<T, Key>;
  startsWithAnyOfIgnoreCase(...prefixes: string[]): Collection<T, Key>;
  noneOf(keys: Array<IndexableType>): Collection<T, Key>;
  notEqual(key: IndexableType): Collection<T, Key>;
}
