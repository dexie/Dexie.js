import { TableSchema } from "./table-schema";

export interface Table<T, Key> {
  name: string;
  schema: TableSchema;
  hook: TableHooks<T, Key>;

  get(key: Key): Promise<T | undefined>;
  get<R>(key: Key, thenShortcut: ThenShortcut<T | undefined,R>): Promise<R>;
  get(equalityCriterias: {[key:string]:IndexableType}): Promise<T | undefined>;
  get<R>(equalityCriterias: {[key:string]:IndexableType}, thenShortcut: ThenShortcut<T | undefined, R>): Promise<R>;
  where(index: string | string[]): WhereClause<T, Key>;
  where(equalityCriterias: {[key:string]:IndexableType}): Collection<T, Key>;

  filter(fn: (obj: T) => boolean): Collection<T, Key>;

  count(): Promise<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): Promise<R>;

  offset(n: number): Collection<T, Key>;

  limit(n: number): Collection<T, Key>;

  each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;

  toArray(): Promise<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>): Promise<R>;

  toCollection(): Collection<T, Key>;
  orderBy(index: string | string[]): Collection<T, Key>;
  reverse(): Collection<T, Key>;
  mapToClass(constructor: Function): Function;
  add(item: T, key?: Key): Promise<Key>;
  update(key: Key, changes: { [keyPath: string]: any }): Promise<number>;
  put(item: T, key?: Key): Promise<Key>;
  delete(key: Key): Promise<void>;
  clear(): Promise<void>;
  bulkAdd(items: T[], keys?: IndexableTypeArrayReadonly): Promise<Key>;
  bulkPut(items: T[], keys?: IndexableTypeArrayReadonly): Promise<Key>;
  bulkDelete(keys: IndexableTypeArrayReadonly) : Promise<void>;
}
