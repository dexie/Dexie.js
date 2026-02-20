/**
 * Eager Blob Downloader
 * 
 * Downloads unresolved blobs in the background when blobMode='eager'.
 * Called after sync completes to prefetch blobs for offline access.
 */

import Dexie, { UpdateSpec } from 'dexie';
import { BehaviorSubject } from 'rxjs';
import { BlobProgress } from '../DexieCloudAPI';
import {
  BlobRef,
  isBlobRef,
  hasBlobRefs,
  resolveAllBlobRefs,
  ResolvedBlob,
} from './blobResolve';
import { loadCachedAccessToken } from './loadCachedAccessToken';
import {
  updateBlobProgress,
  reportBlobDownloaded,
  setDownloadingState,
} from './blobProgress';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { getSyncableTables } from '../helpers/getSyncableTables';

/**
 * Download all unresolved blobs in the background.
 * 
 * This is called when blobMode='eager' (default) after sync completes.
 * BlobRef URLs are signed (SAS tokens) so no auth header needed.
 * 
 * Each blob is saved atomically using Table.update() to avoid race conditions.
 */
export async function downloadUnresolvedBlobs(
  db: DexieCloudDB,
  progress$: BehaviorSubject<BlobProgress>,
  signal?: AbortSignal
): Promise<void> {
  // First, update progress to get accurate counts
  await updateBlobProgress(db, progress$);

  if (progress$.value.blobsRemaining === 0) {
    return;
  }

  setDownloadingState(progress$, true);

  try {
    // Get synced tables (exclude internal tables that don't have $hasBlobRefs)
    // Get synced tables (exclude internal tables)
    const syncedTables = getSyncableTables(db);
  
    for (const table of syncedTables) {
      if (signal?.aborted) break;

      try {
        // Check if table has $hasBlobRefs index
        const hasIndex = table.schema.indexes.some(idx => idx.name === '$hasBlobRefs');
        if (!hasIndex) continue;

        // Query objects with $hasBlobRefs marker
        const unresolvedObjects = await table
          .where('$hasBlobRefs')
          .equals(1)
          .toArray();

        for (const obj of unresolvedObjects) {
          if (signal?.aborted) break;

          // Skip if no BlobRefs (shouldn't happen but be safe - we're not in transaction)
          if (!hasBlobRefs(obj)) continue;

          // Get primary key
          const primaryKey = table.schema.primKey;
          const key = primaryKey.keyPath
            ? Dexie.getByKeyPath(obj, primaryKey.keyPath as string)
            : undefined;

          if (key === undefined) continue;

          // Calculate bytes to download for this object
          const bytesToDownload = calculateBlobBytes(obj);

          // Resolve all BlobRefs and collect them with their keyPaths
          const resolvedBlobs: ResolvedBlob[] = [];
          const accessToken = await loadCachedAccessToken(db);
          const databaseUrl = db.cloud.options?.databaseUrl;
          if (!databaseUrl) throw new Error('Database URL is required to download blobs');
          if (!accessToken) throw new Error('Access token is required to download blobs');
          try {
            await resolveAllBlobRefs(obj, databaseUrl, accessToken, resolvedBlobs);

            // Save each blob atomically using update()
            const updateSpec: UpdateSpec<any> = {
              $hasBlobRefs: undefined, // Clear the $hasBlobRefs marker
            };
            for (const blob of resolvedBlobs) {
              updateSpec[blob.keyPath] = blob.data;
            }

            // Clear the $hasBlobRefs marker
            await table.update(key, updateSpec);

            // Update progress
            reportBlobDownloaded(progress$, bytesToDownload);
          } catch (err) {
            console.error(`Failed to download blobs for ${table.name}:${key}:`, err);
            // If download fails, we can choose to either:
            // - Leave the $hasBlobRefs marker so it will be retried next time
            // - Clear the $hasBlobRefs marker to avoid blocking other blobs from downloading
            // Here we choose to clear the marker to avoid blocking, but in a real implementation you might want to track failures and retry logic.

            // TODO: FIXTHIS:
            //  If error is a 4xx, we should stop retying. Set $hasBlobRefs to undefined to avoid retrying on next sync, since it will likely fail again.
            //  If error is a 5xx, we should no nothing here except possibly increment a retry count
            //  If error is network error, we should throw here to cancel the entire loop.
            //  If error is anything else, it's unexpected and we should log it, clear the marker or maybe retry a few times before clearing the marker, but not throw.
            
            //await table.update(key, { $hasBlobRefs: undefined });
          }
        }
      } catch (err) {
        // Table might not have $hasBlobRefs index or other issues - skip silently
      }
    }
  } finally {
    setDownloadingState(progress$, false);
    // Final progress update
    await updateBlobProgress(db, progress$);
  }
}

/**
 * Calculate total blob bytes in an object.
 */
function calculateBlobBytes(obj: unknown): number {
  let total = 0;

  function scan(value: unknown): void {
    if (value === null || value === undefined) return;
    if (typeof value !== 'object') return;

    if (isBlobRef(value)) {
      total += value.size || 0;
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(scan);
    } else {
      Object.values(value).forEach(scan);
    }
  }

  scan(obj);
  return total;
}
