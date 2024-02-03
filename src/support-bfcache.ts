import { connections } from "./globals/constants";
import { RangeSet } from "./helpers/rangeset";
import { bc, createBC } from "./live-query/enable-broadcast";
import { propagateLocally } from "./live-query/propagate-locally";


if (typeof addEventListener !== 'undefined') {
  addEventListener('pagehide', (event) => {
    if (event.persisted) {
      bc?.close();
    }
    for (const db of connections) {
      db.close({disableAutoOpen: false});
    }
  });
  addEventListener('pageshow', (event) => {
    if (event.persisted) {
      createBC();
      propagateLocally({all: new RangeSet(-Infinity, [[]])}); // Trigger all queries to requery
    }
  });
}
