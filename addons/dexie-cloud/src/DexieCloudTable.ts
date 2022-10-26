import { IndexableType, Table, Extract, Optional } from 'dexie';

type Indexable<T> = T extends IndexableType ? T : string;
type IDType<TKey, TEntity> = Indexable<Extract<TEntity, TKey>>;

export type DexieCloudTable<T, TKey extends keyof T> = Table<
  T, IDType<TKey, T>, Optional<T & {realmId: string, owner: string}, TKey | 'realmId' | 'owner'>
>;
