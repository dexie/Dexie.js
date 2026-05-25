/**
 * Eager Blob Downloader
 *
 * Downloads unresolved blobs in the background when blobMode='eager'.
 * Called after sync completes to prefetch blobs for offline access.
 *
 * Strategy:
 *   1. Snapshot the primary keys of all rows currently flagged
 *      `_hasBlobRefs=1` for each syncable table.
 *   2. Walk that key list in chunks via `bulkGet`. Each `bulkGet`
 *      triggers the blob-resolve middleware, which does all the actual
 *      work — downloading blobs (throttled and deduplicated by the
 *      shared BlobDownloadTracker) and enqueueing them for persistence
 *      via the internal save queue.
 *
 * This keeps a single, symmetric code path with normal application
 * reads, which is important when other middlewares are present
 * (e.g., a hypothetical encryption middleware): writes from the save
 * queue and reads from this loop both pass through the full middleware
 * stack, so on-disk representation stays consistent.
 *
 * Why a snapshot of primary keys (rather than re-querying the index)?
 *   - Rows that get resolved by parallel application reads simply
 *     disappear from the table contents we're about to re-fetch; the
 *     middleware skips them since `_hasBlobRefs` is already cleared.
 *   - Stuck rows (e.g., blob 404s) are naturally bypassed: we just
 *     advance to the next chunk in the snapshot. No `seenKeys`
 *     bookkeeping required.
 *   - The snapshot is `string[]`-shaped for typical Dexie Cloud rows
 *     (~36 bytes/UUID), so ~28K keys per MB. Acceptable for any
 *     realistic dataset.
 *
 * Progress is tracked automatically via liveQuery in blobProgress.ts —
 * no manual progress reporting needed here.
 *
 * --- Throughput note ---
 * The chunk loop is sequential: bulkGet → wait for all downloads to
 * settle → next bulkGet. The save queue drains in the background and
 * does not block iteration (saves no longer need to be persisted before
 * the next iteration, since we don't re-query the index). For typical
 * blob sizes (10 KB – 10 MB) the network dominates total time. If
 * real-world profiling later shows the per-chunk fixed cost matters,
 * the next bulkGet could be kicked off in parallel with the current
 * one's middleware work — but we keep it simple until measurements
 * justify otherwise.
 */

import { BehaviorSubject } from 'rxjs';
import { setDownloadingState } from './blobProgress';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { MAX_CONCURRENT } from './BlobDownloadTracker';

// One chunk = one full saturation of the tracker's concurrency semaphore.
// Larger chunks would only buffer more downloaded Uint8Arrays in memory
// while waiting for the save queue to persist them, without any throughput
// benefit (the semaphore is the gate, not the bulkGet).
const CHUNK_SIZE = MAX_CONCURRENT - 1; // Leave one slot for parallel app reads that might also trigger downloads

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

  let started = false;
  let totalProcessed = 0;

  try {
    for (const table of syncedTables) {
      if (signal?.aborted) break;

      let keys: any[];
      try {
        keys = await table.where('_hasBlobRefs').equals(1).primaryKeys();
      } catch (err) {
        console.error(
          `Eager download: failed to list unresolved rows for ${table.name}:`,
          err
        );
        continue;
      }
      if (keys.length === 0) continue;

      if (!started) {
        setDownloadingState(downloading$, true);
        started = true;
      }

      debugLog(`Eager download: ${table.name} has ${keys.length} row(s)`);

      for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
        if (signal?.aborted) break;
        const slice = keys.slice(i, i + CHUNK_SIZE);
        try {
          // bulkGet triggers the blob-resolve middleware for each row that
          // still has `_hasBlobRefs=1`. Rows already resolved by parallel
          // reads come back without the marker and the middleware no-ops.
          // Rows that have been deleted return `undefined` and are
          // likewise skipped.
          await table.bulkGet(slice);
        } catch (err) {
          console.error(`Eager download: ${table.name} chunk failed:`, err);
          continue;
        }
        totalProcessed += slice.length;
        debugLog(
          `Eager download: ${table.name} ${Math.min(
            i + CHUNK_SIZE,
            keys.length
          )}/${keys.length}`
        );
      }
    }

    if (started) {
      // Make sure all middleware-enqueued saves have landed before we flip
      // `downloading$` to false — otherwise observers might see a "done"
      // signal while writes are still in flight.
      await db.blobDownloadTracker.drainPendingSaves();
      debugLog(`Eager download: done (${totalProcessed} row(s) processed)`);
    } else {
      debugLog('Eager download: No blobs remaining, exiting');
    }
  } finally {
    if (started) setDownloadingState(downloading$, false);
  }
}
