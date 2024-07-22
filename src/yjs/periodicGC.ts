import { Dexie } from '../classes/dexie/dexie';
import { compressYDocs } from './compressYDocs';

const INTERVAL = 10_000; // Every 10 seconds

export function periodicGC(db: Dexie) {
  let timer = null;
  db.on(
    'ready',
    (db: Dexie) => {
      if (db.tables.some(tbl => tbl.schema.yProps)) {
        const gc = () => {
          if (!db.isOpen()) return;
          compressYDocs(db).catch(err => {
            console.debug('Error during periodic GC', err);
          }).then(() => {
            timer = setTimeout(gc, INTERVAL);
          });
        };
        timer = setTimeout(gc, INTERVAL);
      }
    },
    true
  );
  db.on('close', () => {
    if (timer) clearTimeout(timer);
    timer = null;
  });
}
