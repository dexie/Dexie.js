import { Table } from 'dexie';


export type DexieCloudTable<T = any, TKey = string> = Table<
  T, TKey, 'realmId' | 'owner'
>;
