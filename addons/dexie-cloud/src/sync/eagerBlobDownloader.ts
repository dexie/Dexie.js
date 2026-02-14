/**
 * Eager Blob Downloader
 * 
 * Downloads unresolved blobs in the background when blobMode='eager'.
 * Called after sync completes to prefetch blobs for offline access.
 */

import Dexie from 'dexie';
import { BehaviorSubject } from 'rxjs';
import { BlobProgress } from '../DexieCloudAPI';
import {
  BlobRef,
  isBlobRef,
  hasBlobRefs,
  resolveAllBlobRefs,
  ResolvedBlob,
} from './blobResolve';
import {
  updateBlobProgress,
  reportBlobDownloaded,
  setDownloadingState,
} from './blobProgress';

/**
 * Download all unresolved blobs in the background.
 * 
 * This is called when blobMode='eager' (default) after sync completes.
 * BlobRef URLs are signed (SAS tokens) so no auth header needed.
 * 
 * Each blob is saved atomically using Table.update() to avoid race conditions.
 */
export async function downloadUnresolvedBlobs(
  db: Dexie,
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
    // Get synced tables (exclude internal tables that don't have $unresolved)
    const unsyncedTables = (db as any).cloud.options?.unsyncedTables || [];
    const internalTables = ['$syncState', '$jobs', '$baseRevs', '$logins'];
    const syncedTables = db.tables.filter(
      (table) => 
        !unsyncedTables.includes(table.name) &&
        !internalTables.includes(table.name) &&
        !table.name.endsWith('_mutations') // Skip mutation tables
    );

    for (const table of syncedTables) {
      if (signal?.aborted) break;

      try {
        // Check if table has $unresolved index
        const hasIndex = table.schema.indexes.some(idx => idx.name === '$unresolved');
        if (!hasIndex) continue;

        // Query objects with $unresolved marker
        const unresolvedObjects = await table
          .where('$unresolved')
          .equals(1)
          .toArray();

        for (const obj of unresolvedObjects) {
          if (signal?.aborted) break;

          // Skip if no BlobRefs (shouldn't happen but be safe)
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
          await resolveAllBlobRefs(obj, resolvedBlobs);

          // Save each blob atomically using update()
          for (const blob of resolvedBlobs) {
            await table.update(key, {
              [blob.keyPath]: blob.data
            });
          }

          // Clear the $unresolved marker
          await table.update(key, { $unresolved: undefined });

          // Update progress
          reportBlobDownloaded(progress$, bytesToDownload);
        }
      } catch (err) {
        // Table might not have $unresolved index or other issues - skip silently
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
