/**
 * Blob Progress Tracking
 * 
 * Tracks blob download progress for the db.cloud.blobProgress observable.
 */

import { BehaviorSubject } from 'rxjs';
import { BlobProgress } from '../DexieCloudAPI';
import { BlobRef, isBlobRef } from './blobResolve';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { DexieCloudDB } from '../db/DexieCloudDB';

const initialProgress: BlobProgress = {
  isDownloading: false,
  blobsRemaining: 0,
  bytesRemaining: 0,
  bytesDownloaded: 0,
  blobsDownloaded: 0,
};

/**
 * Create a BlobProgress BehaviorSubject for a database.
 */
export function createBlobProgress(): BehaviorSubject<BlobProgress> {
  return new BehaviorSubject<BlobProgress>({ ...initialProgress });
}

/**
 * Scan database for unresolved BlobRefs and update progress.
 */
export async function updateBlobProgress(
  db: DexieCloudDB,
  progress$: BehaviorSubject<BlobProgress>
): Promise<void> {
  let blobsRemaining = 0;
  let bytesRemaining = 0;

  // Get synced tables (exclude internal tables)
  const syncedTables = getSyncableTables(db);

  for (const table of syncedTables) {
    try {
      // Check if table has $unresolved index
      const hasIndex = !!table.schema.idxByName['$unresolved'];
      if (!hasIndex) continue;

      // Query objects with $unresolved marker
      const unresolvedObjects = await table
        .where('$unresolved')
        .equals(1)
        .toArray();

      for (const obj of unresolvedObjects) {
        const blobs = findBlobRefs(obj);
        blobsRemaining += blobs.length;
        bytesRemaining += blobs.reduce((sum, blob) => sum + (blob.size || 0), 0);
      }
    } catch {
      // Table might not have $unresolved index - skip
    }
  }

  const current = progress$.value;
  progress$.next({
    ...current,
    blobsRemaining,
    bytesRemaining,
    isDownloading: current.isDownloading && blobsRemaining > 0,
  });
}

/**
 * Report that a blob download has completed.
 */
export function reportBlobDownloaded(
  progress$: BehaviorSubject<BlobProgress>,
  bytesDownloaded: number
): void {
  const current = progress$.value;
  progress$.next({
    ...current,
    blobsDownloaded: current.blobsDownloaded + 1,
    bytesDownloaded: current.bytesDownloaded + bytesDownloaded,
    blobsRemaining: Math.max(0, current.blobsRemaining - 1),
    bytesRemaining: Math.max(0, current.bytesRemaining - bytesDownloaded),
  });
}

/**
 * Set downloading state.
 */
export function setDownloadingState(
  progress$: BehaviorSubject<BlobProgress>,
  isDownloading: boolean
): void {
  const current = progress$.value;
  if (current.isDownloading !== isDownloading) {
    progress$.next({
      ...current,
      isDownloading,
      // Reset session counters when starting new download batch
      ...(isDownloading && !current.isDownloading
        ? { blobsDownloaded: 0, bytesDownloaded: 0 }
        : {}),
    });
  }
}

/**
 * Find all BlobRefs in an object (recursive).
 */
function findBlobRefs(obj: unknown): BlobRef[] {
  const refs: BlobRef[] = [];

  function scan(value: unknown): void {
    if (value === null || value === undefined) return;
    if (typeof value !== 'object') return;

    if (isBlobRef(value)) {
      refs.push(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(scan);
    } else if (value.constructor === Object) {
      Object.values(value).forEach(scan);
    }
  }

  scan(obj);
  return refs;
}
