/**
 * Blob Progress Tracking
 * 
 * Tracks blob download progress for the db.cloud.blobProgress observable.
 */

import { BehaviorSubject } from 'rxjs';
import Dexie from 'dexie';
import { BlobProgress } from '../DexieCloudAPI';
import { BlobRef, isBlobRef } from './blobResolve';

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
  db: Dexie,
  progress$: BehaviorSubject<BlobProgress>
): Promise<void> {
  let blobsRemaining = 0;
  let bytesRemaining = 0;

  // Get synced tables (exclude internal tables)
  const unsyncedTables = (db as any).cloud?.options?.unsyncedTables || [];
  const internalTables = ['$syncState', '$jobs', '$baseRevs', '$logins'];
  const syncedTables = db.tables.filter(
    (table) => 
      !unsyncedTables.includes(table.name) &&
      !internalTables.includes(table.name) &&
      !table.name.endsWith('_mutations')
  );

  for (const table of syncedTables) {
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
    } else {
      Object.values(value).forEach(scan);
    }
  }

  scan(obj);
  return refs;
}
