import type { Dexie } from '../public/types/dexie';
import type {
  DexieYProvider,
  DucktypedY,
  DucktypedYDoc,
  YUpdateRow,
} from '../public/types/yjs-related';
import type { EntityTable } from '../public/types/entity-table';
import { throwIfDestroyed } from './docCache';
import { liveQuery } from '../live-query';

export function observeYDocUpdates(
  provider: DexieYProvider,
  doc: DucktypedYDoc,
  db: Dexie,
  parentTableName: string,
  updatesTableName: string,
  id: any,
  Y: DucktypedY
): () => void {
  let lastUpdateId = 0;
  let initial = true;
  const subscription = liveQuery(() => {
    throwIfDestroyed(doc);
    return Promise.all([(db.table(updatesTableName) as EntityTable<YUpdateRow, 'i'>)
      .where('[k+i]')
      .between([id, lastUpdateId], [id, Infinity], false)
      .toArray()
      .then((updates) => {
        if (updates.length > 0) lastUpdateId = updates[updates.length - 1].i;
        return updates;
      }), db.table(parentTableName).where(':id').equals(id).count()])
  }).subscribe(
    ([updates, parentRowExists]) => {
      if (!parentRowExists) {
        // Row deleted. Destroy Y.Doc.
        doc.destroy();
        return;
      }
      throwIfDestroyed(doc);
      Y.transact(
        doc,
        () => {
          updates.forEach((update) => {
            Y.applyUpdateV2(doc, update.u);
          });
        },
        subscription,
        false
      );
      if (initial) {
        initial = false;
        provider.on('load').fire(provider);
        doc.emit('load', [doc]);
      }
    },
    (error) => {
      provider.on('error').fire(error);
    }
  );

  const onUpdate = (update: Uint8Array, origin: any) => {
    if (origin === subscription) return; // Already applied.
    db.table(updatesTableName)
      .add({
        k: id,
        u: update,
        f: 1, // Flag as local update (not yet synced)
      })
      .then((i: number) => {
        // Optimization (not critical): Don't query for this update to put it back into the doc.
        // However, skip this optimization if the lastUpdateId is behind the current update.
        // In that case, next liveQuery emission will include also this update and re-apply it into doc,
        // but it will not be an issue because Y.Doc will ignore duplicate updates.
        if (i === lastUpdateId - 1) ++lastUpdateId;
      })
      .catch((error) => {
        provider.on('error').fire(error);
      });
  };

  const stopObserving = () => {
    subscription.unsubscribe();
    doc.off('updateV2', onUpdate);
    doc.off('destroy', stopObserving);
  };

  doc.on('updateV2', onUpdate);
  doc.on('destroy', stopObserving);

  return stopObserving;
}
