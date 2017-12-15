import {Transaction as ITransaction} from './public/types/transaction';
import Promise from "./public/types/promise-extended";
import { DbSchema } from './public/types/db-schema';

export class Transaction implements ITransaction {
  idbtrans: IDBTransaction;
  
  constructor (
    mode: IDBTransactionMode,
    storeNames: string[],
    dbschema: DbSchema,
    parent?: Transaction)
  {

  }
  create() {
    throw new Error("Method not implemented.");
  }
  _promise(
    mode: IDBTransactionMode,
    fn: (resolve: any, reject: any) => void,
    bWriteLock?: string | boolean): Promise<any>
  {
    throw new Error("Method not implemented.");
  }
  
  active: boolean;
  db: any;
  mode: string;
  idbtrans: IDBTransaction;
  tables: { [type: string]: any; };
  storeNames: string[];
  on: any;
  abort(): void {
    throw new Error("Method not implemented.");
  }
  table(tableName: string);
  table<T>(tableName: string);
  table<T, Key>(tableName: string);
  table(tableName: any) {
    throw new Error("Method not implemented.");
  }

}