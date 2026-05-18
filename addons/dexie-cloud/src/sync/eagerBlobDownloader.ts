/**
 * Eager Blob Downloader
 *
 * Downloads unresolved blobs in the background when blobMode='eager'.
 * Called after sync completes to prefetch blobs for offline access.
 *
 * Strategy: simply read rows with `_hasBlobRefs=1` in chunks via the
 * normal middleware stack. The blob-resolve middleware does all the
 * actual work — downloading blobs (throttled and deduplicated by the
 * shared BlobDownloadTracker) and enqueueing them for persistence via
 * the internal save queue. Between chunks we drain the save queue so
 * the next chunk's query no longer sees the just-persisted rows.
 *
 * This keeps a single, symmetric code path with normal application
 * reads, which is important when other middlewares are present
 * (e.g., a hypothetical encryption middleware): writes from the save
 * queue and reads from this loop both pass through the full middleware
 * stack, so on-disk representation stays consistent.
 *
 * Progress is tracked automatically via liveQuery in blobProgress.ts —
 * no manual progress reporting needed here.
 */

import { BehaviorSubject } from 'rxjs';
import Dexie from 'dexie';
import { setDownloadingState } from './blobProgress';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { MAX_CONCURRENT } from './BlobDownloadTracker';

// One chunk = one full saturation of the tracker's concurrency semaphore.
// Larger chunks would only buffer more downloaded Uint8Arrays in memory
// while waiting for the save queue to persist them, without any throughput
// benefit (the semaphore is the gate, not the query).
const CHUNK_SIZE = MAX_CONCURRENT;

/**
 * Download all unresolved blobs in the background.
 *
 * This is called when blobMode='eager' (default) after sync completes.
 */
export async function downloadUnresolvedBlobs(
  db: DexieCloudDB,
  downloading$: BehaviorSubject<boolean>,
  signal?: AbortSignal
): Promise<void> {
  const debugLog = (msg: string) => console.debug(`[dexie-cloud] ${msg}`);

  debugLog('Eager download: Starting...');

  const syncedTables = getSyncableTables(db).filter((t) =>
    t.schema.indexes.some((idx) => idx.name === '_hasBlobRefs')
  );

  // Quick check: any work at all?
  let hasWork = false;
  for (const table of syncedTables) {
    try {
      const count = await table.where('_hasBlobRefs').equals(1).count();
      if (count > 0) {
        hasWork = true;
        break;
      }
    } catch {
      // skip
    }
  }

  if (!hasWork) {
    debugLog('Eager download: No blobs remaining, exiting');
    return;
  }

  setDownloadingState(downloading$, true);

  try {
    debugLog(
      `Eager download: Found ${syncedTables.length} eligible tables: ${syncedTables
        .map((t) => t.name)
        .join(', ')}`
    );

    for (const table of syncedTables) {
      if (signal?.aborted) break;

      // Guard against an infinite loop when some rows cannot be cleared
      // (e.g., blob 404s persistently on the server). We track keys we've
      // already attempted, and expand the query limit by that count so the
      // chunk window slides past stuck rows and keeps making progress on
      // healthy ones. We bail only when even the expanded query produces
      // no fresh rows, or when too many stuck rows have accumulated.
      //
      // MAX_SEEN caps how many stuck rows we tolerate before giving up on
      // this table. Each stuck row costs one extra download attempt per
      // iteration, so we keep the cap modest.
      const MAX_SEEN = 256;
      const seenKeys = new Set<string>();
      const primKey = table.schema.primKey;
      const keyOf = (obj: any): string => {
        const k = primKey.keyPath
          ? Dexie.getByKeyPath(obj, primKey.keyPath as string)
          : undefined;
        // Stringify so that compound keys (arrays) hash to a stable form.
        return k === undefined ? '' : JSON.stringify(k);
      };

      try {
        // Loop chunks until the table has no more unresolved rows.
        // Each toArray() call triggers the blob-resolve middleware, which
        // downloads (throttled by the tracker) and enqueues saves. We
        // drain the save queue between chunks so the next query no longer
        // returns the rows we just processed.
        while (!signal?.aborted) {
          // Expand the query window past any stuck rows from earlier
          // iterations so we still discover fresh rows beyond them.
          const limit = CHUNK_SIZE + seenKeys.size;
          const chunk = await table
            .where('_hasBlobRefs')
            .equals(1)
            .limit(limit)
            .toArray();

          if (chunk.length === 0) break;

          // Identify rows we have NOT attempted before. If there are none,
          // the entire remaining table is stuck — give up on this table.
          let freshCount = 0;
          for (const obj of chunk) {
            if (!seenKeys.has(keyOf(obj))) freshCount++;
          }
          if (freshCount === 0) {
            console.warn(
              `Eager download: ${table.name} stopped — ${chunk.length} rows could not be cleared (likely persistent blob fetch errors)`
            );
            break;
          }

          for (const obj of chunk) seenKeys.add(keyOf(obj));

          if (seenKeys.size >= MAX_SEEN) {
            console.warn(
              `Eager download: ${table.name} stopped — accumulated ${seenKeys.size} stuck rows (cap ${MAX_SEEN})`
            );
            break;
          }

          debugLog(
            `Eager download: ${table.name} processed chunk of ${chunk.length} (${freshCount} fresh, ${seenKeys.size} total seen)`
          );

          // Wait for the middleware-driven saves to land in IndexedDB
          // before re-querying the index.
          await db.blobDownloadTracker.drainPendingSaves();
        }
      } catch (err) {
        console.error(
          `Eager download: error processing table ${table.name}:`,
          err
        );
      }
    }
  } finally {
    setDownloadingState(downloading$, false);
  }
}
