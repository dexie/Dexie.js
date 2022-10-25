import { IndexableType, Table } from 'dexie';


export type DexieCloudTable<T = any, TKey extends IndexableType = string> = Table<
  T, TKey, 'realmId' | 'owner'
>;
