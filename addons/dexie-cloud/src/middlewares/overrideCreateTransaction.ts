import Dexie, { DbSchema, Transaction } from "dexie";
import { randomString } from './helpers/randomString';

/*export function overrideCreateTransaction(db: Dexie) {
  db._createTransaction = Dexie.override(db._createTransaction, (origCreateTransaction) =>
    function () {
        const tx = origCreateTransaction.apply(this, arguments);

        // Make sure every physical IDB transaction has a globally unique transaction ID
        // "txid". This property is expected to be there in the SyncMiddleware.
        tx.create = Dexie.override(tx.create, origCreate => function() {
          const rv = origCreate.call(this, arguments);
          if (!this.idbtrans.txid) this.idbtrans.txid = randomString(16);
        });

        // Subscribe to commit event
        tx._completion.then(()=>{
          // Transaction has committed.

        });
      }
  );
}*/