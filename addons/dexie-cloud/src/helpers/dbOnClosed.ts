import Dexie from "dexie";

/* Helper function to subscribe to database close no matter if it was unexpectedly closed or manually using db.close()
 */
export function dbOnClosed(db: Dexie, handler: () => void) {
  db.on.close.subscribe(handler);
  /*// @ts-ignore
  const origClose = db._close;
  // @ts-ignore
  db._close = function () {
    origClose.call(this);
    handler();
  };*/
  return () => {
    db.on.close.unsubscribe(handler);
    // @ts-ignore
    //db._close = origClose;
  };
}
