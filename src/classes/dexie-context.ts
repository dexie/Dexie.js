import { Dexie } from '../classes/dexie';
import { TableSchema } from '../../api/table-schema';
import { Transaction } from '../classes/transaction';
import { Table } from '../classes/table';
import { IDBValidKey } from '../../api/indexeddb';
import { Collection } from './collection';

function createChildClass (Parent: {new()}, context) {
  return class extends Parent {
    constructor(...args) {
      super(context, ...args);
    }
  }
}

function createContext(db: Dexie) {
  db.Table
}