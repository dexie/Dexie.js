import { IndexableType, Table, Extract } from 'dexie';

type Indexable<T> = T extends IndexableType ? T : string;
type IDType<TKey, TEntity> = Indexable<Extract<TEntity, TKey>>;

export type DexieCloudTable<T = any, TKey extends string=string> = Table<
  T, IDType<TKey, T>, Omit<T, TKey | 'realmId' | 'owner'> & {realmId?: string, owner?: string} & {[P in TKey]?: IDType<TKey, T>}
>;
