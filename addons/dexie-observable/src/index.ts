import Dexie from 'dexie';
import * as pubsub from './pubsub';
import { subscribe } from './pubsub';
import './dexie-api-extension';
import { collectionObserve } from './collection-observe';
import { dbObserve } from './db-observe';

export default function dexieObservable (db: Dexie) {
  db.Collection.prototype.observe = collectionObserve;
  db.observe = dbObserve;

  // TODO in dexie before continuing here:
  // Define _createTransaction in Dexie.d.ts
  // Implement "A simple writing hook" from https://github.com/dfahlander/Dexie.js/issues/427
  // Implement options to deleting hook in order to not having to fetch objects prior to react on a deletion
  
  
  /* Remove the following code: Don't think we need to hook into _createTransaction(). We need only to
    add hooks on all tables (table.hook('creating'), table.hook('writing') table.hook('simple deleting'))
  
  let dbAsAny = db as any;
  dbAsAny._createTransaction = Dexie.override(dbAsAny._createTransaction, _createTransaction =>{
    return function () {
      const trans : Dexie.Transaction = _createTransaction.apply(this, arguments);
      const storeNames = trans.storeNames;
      trans.on('complete', ()=>{

      });
    }
  })*/
}
