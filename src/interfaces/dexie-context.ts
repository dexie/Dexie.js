import { Dexie } from '../classes/dexie';
import { TableSchema } from '../../types/table-schema';
import { Transaction } from '../classes/transaction';
import { Table } from '../classes/table';
import { IDBValidKey } from '../../types/indexeddb';

export interface DexieContext {
  db: Dexie;
  createTable<T,TKey extends IDBValidKey> (name: string, tableSchema: TableSchema, trans?: Transaction): Table<any,any>;
}
