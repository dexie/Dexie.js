import Dexie from "dexie";

/* Helper function to subscribe to database close no matter if it was unexpectedly closed or manually using db.close()
 */
export function dbOnClosed(db: Dexie, handler: () => void) {
  db.on.close.subscribe(handler);
  const origClose = db.close;
  db.close = function () {
    origClose.call(this);
    handler();
  };
  return () => {
    db.on.close.unsubscribe(handler);
    db.close = origClose;
  };
}
