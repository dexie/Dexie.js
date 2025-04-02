import { Dexie } from '../classes/dexie/dexie';
import { compressYDocs } from './compressYDocs';

const GC_DELAY = 10_000; // Delay before starting GC when DB is started
const GC_INTERVAL = 300_000; // Every 5 minutes

export function periodicGC(db: Dexie) {
  let timer = null;
  db.on(
    'ready',
    (db: Dexie) => {
      if (db.tables.some(tbl => tbl.schema.yProps)) {
        const gc = () => {
          if (!db.isOpen()) return;
          compressYDocs(db, GC_INTERVAL).catch(err => {
            if (err && err.name === 'DatabaseClosedError') return;
            console.debug('Error during periodic GC', err);
          }).then(() => {
            timer = setTimeout(gc, GC_INTERVAL);
          });
        };
        timer = setTimeout(gc, GC_DELAY);
      }
    },
    true
  );
  db.on('close', () => {
    if (timer) clearTimeout(timer);
    timer = null;
  });
}
