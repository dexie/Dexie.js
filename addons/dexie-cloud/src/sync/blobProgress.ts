/**
 * Blob Progress Tracking
 * 
 * Tracks blob download progress for the db.cloud.blobProgress observable.
 */

import { BehaviorSubject } from 'rxjs';
import { BlobProgress } from '../DexieCloudAPI';
import { BlobRef, isBlobRef, isUnresolvedRef } from './blobResolve';
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
  const debugLog = (msg: string) => {
    console.log(`[dexie-cloud] ${msg}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dexie-cloud-debug', { detail: msg }));
    }
  };
  
  let blobsRemaining = 0;
  let bytesRemaining = 0;

  // Get synced tables (exclude internal tables)
  const syncedTables = getSyncableTables(db);
  debugLog(`BlobProgress: Found ${syncedTables.length} syncable tables: ${syncedTables.map(t => t.name).join(', ')}`);

  // Use a transaction with disableBlobResolve to read raw data without triggering lazy download
  await db.dx.transaction('r', syncedTables, async (trans: any) => {
    trans.disableBlobResolve = true; // Prevent middleware from resolving BlobRefs during this query
    
    for (const table of syncedTables) {
      try {
        // Check if table has $hasBlobRefs index
        const hasIndex = !!table.schema.idxByName['$hasBlobRefs'];
        debugLog(`BlobProgress: Table ${table.name} has $hasBlobRefs index: ${hasIndex}`);
        if (!hasIndex) continue;

        // Query objects with $hasBlobRefs marker
        const unresolvedObjects = await table
          .where('$hasBlobRefs')
          .equals(1)
          .toArray();

        debugLog(`BlobProgress: Table ${table.name} has ${unresolvedObjects.length} unresolved objects`);

        for (const obj of unresolvedObjects) {
          const blobs = findBlobRefs(obj);
          debugLog(`BlobProgress: Object has ${blobs.length} BlobRefs`);
          blobsRemaining += blobs.length;
          bytesRemaining += blobs.reduce((sum, blob) => sum + (blob.size || 0), 0);
        }
      } catch (err) {
        debugLog(`BlobProgress: Error querying table ${table.name}: ${err}`);
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
 */
function findBlobRefs(obj: unknown): RefInfo[] {
  const refs: RefInfo[] = [];

  function scan(value: unknown): void {
    if (value === null || value === undefined) return;
    if (typeof value !== 'object') return;

    // Check for TSONRef (after TSON parsing with blobRefTypeDefs)
    if (TSONRef.isTSONRef(value)) {
      refs.push({ ref: value.ref, size: value.size });
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
