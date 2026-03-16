/**
 * Blob Progress Tracking
 *
 * Uses liveQuery to reactively track unresolved blob refs.
 * Any change to _hasBlobRefs in any syncable table automatically
 * triggers a re-scan — no manual updateBlobProgress() needed.
 */

import { BehaviorSubject, Observable, combineLatest, from, timer } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { liveQuery } from 'dexie';
import { BlobProgress } from '../DexieCloudAPI';
import { isBlobRef, isSerializedTSONRef } from './blobResolve';
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

/**
 * BehaviorSubject for the isDownloading flag, controlled by eagerBlobDownloader.
 */
export function createDownloadingState(): BehaviorSubject<boolean> {
  return new BehaviorSubject<boolean>(false);
}

/**
 * Set downloading state.
 */
export function setDownloadingState(
  downloading$: BehaviorSubject<boolean>,
  isDownloading: boolean
): void {
  if (downloading$.value !== isDownloading) {
    downloading$.next(isDownloading);
  }
}

/**
 * Create a liveQuery-based Observable<BlobProgress>.
 *
 * Combines a liveQuery (blobsRemaining, bytesRemaining) with an external
 * isDownloading flag controlled by the eager downloader.
 */
export function observeBlobProgress(
  db: DexieCloudDB,
  downloading$: BehaviorSubject<boolean>
): Observable<BlobProgress> {
  const blobStats$ = from(liveQuery(async () => {
    let blobsRemaining = 0;
    let bytesRemaining = 0;

    const syncedTables = getSyncableTables(db);

    await db.dx.transaction('r', syncedTables, async (tx) => {
      (tx.idbtrans as any).disableBlobResolve = true;

      for (const table of syncedTables) {
        try {
          const hasIndex = !!table.schema.idxByName['_hasBlobRefs'];
          if (!hasIndex) continue;

          const unresolvedObjects = await table
            .where('_hasBlobRefs')
            .equals(1)
            .toArray();

          for (const obj of unresolvedObjects) {
            const blobs = findBlobRefs(obj);
            blobsRemaining += blobs.length;
            bytesRemaining += blobs.reduce(
              (sum, blob) => sum + (blob.size || 0),
              0
            );
          }
        } catch {
          // Table might not have _hasBlobRefs index - skip
        }
      }
    });

    return { blobsRemaining, bytesRemaining };
  }));

  return combineLatest([blobStats$, downloading$]).pipe(
    map(([stats, isDownloading]) => ({
      isDownloading: isDownloading && stats.blobsRemaining > 0,
      blobsRemaining: stats.blobsRemaining,
      bytesRemaining: stats.bytesRemaining,
    })),
    share({ resetOnRefCountZero: () => timer(2000) }) // Keep alive for 2s after last unsubscription to avoid rapid re-subscriptions during UI updates  
  );
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

    if (TSONRef.isTSONRef(value)) {
      refs.push({ ref: value.ref, size: value.size });
      return;
    }

    if (isSerializedTSONRef(value)) {
      const obj = value as { type: string; ref: string; size: number };
      refs.push({ ref: obj.ref, size: obj.size });
      return;
    }

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
