import { IDBValidKey, IndexableTypeArray, IndexableTypeArrayReadonly } from "./indexeddb";
import { Collection } from "./collection";

export interface WhereClause<T=any, TKey extends IDBValidKey=IDBValidKey> {
  above(key: IDBValidKey): Collection<T, TKey>;
  aboveOrEqual(key: IDBValidKey): Collection<T, TKey>;
  anyOf(keys: IndexableTypeArrayReadonly): Collection<T, TKey>;
  anyOf(...keys: IndexableTypeArray): Collection<T, TKey>;
  anyOfIgnoreCase(keys: string[]): Collection<T, TKey>;
  anyOfIgnoreCase(...keys: string[]): Collection<T, TKey>;
  below(key: IDBValidKey): Collection<T, TKey>;
  belowOrEqual(key: IDBValidKey): Collection<T, TKey>;
  between(lower: IDBValidKey, upper: IDBValidKey, includeLower?: boolean, includeUpper?: boolean): Collection<T, TKey>;
  equals(key: IDBValidKey): Collection<T, TKey>;
  equalsIgnoreCase(key: string): Collection<T, TKey>;
  inAnyRange(ranges: ReadonlyArray<{0: IDBValidKey, 1: IDBValidKey}>): Collection<T, TKey>;
  startsWith(key: string): Collection<T, TKey>;
  startsWithAnyOf(prefixes: string[]): Collection<T, TKey>;
  startsWithAnyOf(...prefixes: string[]): Collection<T, TKey>;
  startsWithIgnoreCase(key: string): Collection<T, TKey>;
  startsWithAnyOfIgnoreCase(prefixes: string[]): Collection<T, TKey>;
  startsWithAnyOfIgnoreCase(...prefixes: string[]): Collection<T, TKey>;
  noneOf(keys: Array<IDBValidKey>): Collection<T, TKey>;
  notEqual(key: IDBValidKey): Collection<T, TKey>;
}
