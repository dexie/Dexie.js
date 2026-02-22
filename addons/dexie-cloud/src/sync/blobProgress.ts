/**
 * Blob Progress Tracking
 * 
 * Tracks blob download progress for the db.cloud.blobProgress observable.
 */

import { BehaviorSubject } from 'rxjs';
import { BlobProgress } from '../DexieCloudAPI';
import { BlobRef, isBlobRef, isUnresolvedRef, isSerializedTSONRef } from './blobResolve';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { TSONRef } from 'dexie-cloud-common';

/**
 * Unified reference info for both BlobRef and TSONRef
 */
interface RefInfo {
  ref: string;
  size: number;
}

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

  // Use a transaction with disableBlobResolve to read raw data without triggering lazy download
  await db.dx.transaction('r', syncedTables, async (tx) => {
    // Set flag on the underlying IDBTransaction to disable blob resolution
    (tx.idbtrans as any).disableBlobResolve = true;
    
    for (const table of syncedTables) {
      try {
        // Check if table has $hasBlobRefs index
        const hasIndex = !!table.schema.idxByName['$hasBlobRefs'];
        if (!hasIndex) continue;

        // Query objects with $hasBlobRefs marker - middleware will skip resolution due to flag
        const unresolvedObjects = await table
          .where('$hasBlobRefs')
          .equals(1)
          .toArray();

        for (const obj of unresolvedObjects) {
          const blobs = findBlobRefs(obj);
          blobsRemaining += blobs.length;
          bytesRemaining += blobs.reduce((sum, blob) => sum + (blob.size || 0), 0);
        }
      } catch {
        // Table might not have $hasBlobRefs index - skip
      }
    }
  });

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
 * Find all unresolved refs (BlobRef or TSONRef) in an object (recursive).
 * Handles both live TSONRef instances and serialized TSONRefs (after IndexedDB).
 */
function findBlobRefs(obj: unknown): RefInfo[] {
  const refs: RefInfo[] = [];

  function scan(value: unknown): void {
    if (value === null || value === undefined) return;
    if (typeof value !== 'object') return;

    // Check for live TSONRef instance (before IndexedDB storage)
    if (TSONRef.isTSONRef(value)) {
      refs.push({ ref: value.ref, size: value.size });
      return;
    }

    // Check for serialized TSONRef (after IndexedDB structured clone - Symbol is lost)
    if (isSerializedTSONRef(value)) {
      const obj = value as { type: string; ref: string; size: number };
      refs.push({ ref: obj.ref, size: obj.size });
      return;
    }

    // Check for raw BlobRef (from older code paths or before TSON parsing)
    if (isBlobRef(value)) {
      refs.push({ ref: value.ref, size: value.size || 0 });
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
