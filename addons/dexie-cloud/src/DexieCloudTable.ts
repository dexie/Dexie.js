import { Table } from 'dexie';


export type DexieCloudTable<T = any, TKey = string> = Table<
  T & { realmId: string; owner: string; }, TKey, 'realmId' | 'owner'
>;
