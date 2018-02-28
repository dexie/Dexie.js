import { IndexableType } from './indexable-type';
import { IDBKeyRange, IDBObjectStore } from './indexeddb';
import { MiddlewareStack } from './middleware';

/* Fundering:
  1. Låt mutation-core bara heta "core" och representera alla middlewares.
  2. Döp om TableMiddleware till DexieMiddleware och ta med Transaction och tableName.
  3. Lägg till middleware för att skapa transaction (createTransaction()).
  4. Låt table.add(),put() etc implementeras som sådant:
      1) return this._trans('readwrite', (resolve, reject, trans) => this.db._stack.write.invoke({
        trans,
        table: this.table,
        op: 'add',
        keys: key != null && [key], 
        values: [obj]
      }) eller motsvarande. _trans i sin tur anropar this.db._stack.trans.invoke({mode, tables})

      Erbjud locking-funktion med en public lock() metod på transaktionen som returnerar ett Promise
        och tar en callback. En operation så som modify() eller (sub-)transaction kan köra som nu,
        men ett legacy-hook middleware som vill se befintliga värden innan förändringar, kan göra:
          const keys = req.keys || req.values.map(val => getByKeyPath(this.schema.primKey.keyPath, val))
           .filter (key => key != null);
          return req.trans.lock(async ()=>{
            const keyMap = await this.where(':id').anyOf(keys).toKeyMap();
            this.hooks.creating...
            return next({...req, oldObjs: keyMap});
          });
  5. 
     
 */
export interface WriteRequest {
  store: IDBObjectStore;
  op: 'add' | 'put';
  objs: any[];
  keys?: IndexableType[];
}

export interface DeleteRequest {
  store: IDBObjectStore;
  keys: IndexableType[];
}

export interface DeleteRangeRequest {
  store: IDBObjectStore;
  range: IDBKeyRange;
}

export interface MutationFailure {
  pos: number;
  error: Error;
}

export interface MutationResponse {
  failures: MutationFailure[];
  lastResult?: IndexableType;
}

export interface MutationCore {
  write: MiddlewareStack<WriteRequest, Promise<MutationResponse>>;
  delete: MiddlewareStack<DeleteRequest, Promise<MutationResponse>>;
  deleteRange: MiddlewareStack<DeleteRangeRequest, Promise<void>>;
}
