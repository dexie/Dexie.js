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
import { cmp } from '../functions/cmp';

export function observeYDocUpdates(
  provider: DexieYProvider,
  doc: DucktypedYDoc,
  db: Dexie,
  parentTableName: string,
  updatesTableName: string,
  parentId: any,
  Y: DucktypedY
): () => void {
  let lastUpdateId = 0;
  let initial = true;
  const subscription = liveQuery(() => {
    throwIfDestroyed(doc);
    const updatesTable = db.table(updatesTableName) as EntityTable<
      YUpdateRow,
      'i'
    >;
    return Promise.all([
      (lastUpdateId > 0
        ? updatesTable
            .where('i')
            .between(lastUpdateId, Infinity, false)
            .toArray()
            .then((updates) =>
              updates.filter((update) => cmp(update.k, parentId) === 0)
            )
        : updatesTable.where({ k: parentId }).toArray()
      ).then((updates) => {
        if (updates.length > 0) lastUpdateId = updates[updates.length - 1].i;
        return updates;
      }),
      db.table(parentTableName).where(':id').equals(parentId).toArray(), // Why not just count() or get()? Because of cache only works with toArray() currently (optimization)
    ]);
  }).subscribe(
    ([updates, parentRow]) => {
      if (parentRow.length === 0) {
        // Row deleted. Destroy Y.Doc.
        doc.destroy();
        return;
      }
      throwIfDestroyed(doc);
      if (updates.length > 0) {
        Y.transact(
          doc,
          () => {
            updates.forEach((update) => {
              Y.applyUpdateV2(doc, update.u);
            });
          },
          provider,
          false
        );
      }
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
    if (origin === provider) return; // Already applied.
    db.table(updatesTableName)
      .add({
        k: parentId,
        u: update,
        f: 1, // Flag as local update (to be included when syncing)
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
