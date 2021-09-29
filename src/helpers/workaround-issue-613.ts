import Dexie from "..";
import { errnames } from "../errors";

/** Workaround for chrome issue.
 * 
 * This function is called from tempTransaction
 * and enterTransactionScope - to be able to
 * detect invalid database state and, if so, reopen
 * the database and redo the operation or transaction.
 * In case of a full transaction scope function,
 * the application scope function will be re-executed
 * from start after reopening the database.
 * 
 * In case of a sub transaction, the topmost parent
 * transaction will be the one to be executed from start,
 * and call the sub transactions again.
 * 
 * In case of a simple operation outside a transaction scope,
 * the operation will be re-executed after reopening the database.
 * 
 * In the best of worlds, this workaround should completely hide
 * the chrome issue from the end users - they would never experience
 * this kind of error. But this really needs to be tested in production
 * apps before reaching a stable dexie version.
 * 
 * See https://github.com/dfahlander/Dexie.js/issues/613
 * 
 * @param db 
 * @param error 
 * @returns 
 */
export function workaroundIssue613(db: Dexie, error: any): Promise<any> | void {
  if (error && error.name === errnames.InvalidState && db.isOpen()) {
    // Do this: https://github.com/dfahlander/Dexie.js/issues/613#issuecomment-841608979
    try {
      if (db.tables.length > 0) db.idbdb.transaction(db.tables[0].name).abort();
    } catch (_) {
      // The database was closed for unknown reason.
      // Try reopen it in and let caller redo the transaction or operation.
      db.close();
      return db.open();
    }
  }
}

