import {Transaction} from '../interfaces/transaction';
import Promise from "../interfaces/promise-extended";

export class TransactionImpl implements Transaction {
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