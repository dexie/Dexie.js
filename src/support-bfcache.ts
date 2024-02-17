import { Dexie } from "./classes/dexie";
import { connections } from "./globals/constants";
import { debug } from "./helpers/debug";
import { RangeSet } from "./helpers/rangeset";
import { bc, createBC } from "./live-query/enable-broadcast";
import { propagateLocally } from "./live-query/propagate-locally";


if (typeof addEventListener !== 'undefined') {
  addEventListener('pagehide', (event) => {
    if (!Dexie.disableBfCache && event.persisted) {
      if (debug) console.debug('Dexie: handling persisted pagehide');
      bc?.close();
      for (const db of connections) {
        db.close({disableAutoOpen: false});
      }
    }
  });
  addEventListener('pageshow', (event) => {
    if (!Dexie.disableBfCache && event.persisted) {
      if (debug) console.debug('Dexie: handling persisted pageshow');
      createBC();
      propagateLocally({all: new RangeSet(-Infinity, [[]])}); // Trigger all queries to requery
    }
  });
}
