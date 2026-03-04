import { Dexie } from "./classes/dexie";
import { getConnectionsArray } from "./globals/connections";
import { debug } from "./helpers/debug";
import { RangeSet } from "./helpers/rangeset";
import { bc, createBC } from "./live-query/enable-broadcast";
import { propagateLocally } from "./live-query/propagate-locally";


if (typeof addEventListener !== 'undefined') {
  addEventListener('pagehide', (event) => {
    if (!Dexie.disableBfCache && event.persisted) {
      if (debug) console.debug('Dexie: handling persisted pagehide');
      bc?.close();
      // Use [...connections] to iterate on a copy of the connections array,
      // since the original array will be modified during iteration.
      for (const db of getConnectionsArray()) {
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
