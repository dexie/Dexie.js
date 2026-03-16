/**
 * Eager Blob Downloader
 * 
 * Downloads unresolved blobs in the background when blobMode='eager'.
 * Called after sync completes to prefetch blobs for offline access.
 * 
 * Progress is tracked automatically via liveQuery in blobProgress.ts —
 * no manual progress reporting needed here.
 */

import Dexie, { UpdateSpec } from 'dexie';
import { BehaviorSubject } from 'rxjs';
import { TSONRef, hasTSONRefs } from 'dexie-cloud-common';
import {
  BlobRef,
  isBlobRef,
  hasBlobRefs,
  hasUnresolvedBlobRefs,
  isSerializedTSONRef,
  resolveAllBlobRefs,
  ResolvedBlob,
} from './blobResolve';
import { loadCachedAccessToken } from './loadCachedAccessToken';
import { setDownloadingState } from './blobProgress';
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
  downloading$: BehaviorSubject<boolean>,
  signal?: AbortSignal
): Promise<void> {
  const debugLog = (msg: string) => console.debug(`[dexie-cloud] ${msg}`);
  
  debugLog('Eager download: Starting...');

  // Scan for unresolved blobs
  const syncedTables = getSyncableTables(db);
  let hasWork = false;

  for (const table of syncedTables) {
    try {
      const hasIndex = !!table.schema.idxByName['_hasBlobRefs'];
      if (!hasIndex) continue;
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
    debugLog(`Eager download: Found ${syncedTables.length} syncable tables: ${syncedTables.map(t => t.name).join(', ')}`);
  
    for (const table of syncedTables) {
      if (signal?.aborted) break;

      try {
        // Check if table has _hasBlobRefs index
        const hasIndex = table.schema.indexes.some(idx => idx.name === '_hasBlobRefs');
        if (!hasIndex) continue;

        // Query objects with _hasBlobRefs marker
        const unresolvedObjects = await table
          .where('_hasBlobRefs')
          .equals(1)
          .toArray();

        debugLog(`Eager download: Table ${table.name} has ${unresolvedObjects.length} unresolved objects`);

        const databaseUrl = db.cloud.options?.databaseUrl;
        if (!databaseUrl) throw new Error('Database URL is required to download blobs');

        // Download up to MAX_CONCURRENT blobs in parallel
        const MAX_CONCURRENT = 6;
        const primaryKey = table.schema.primKey;

        // Filter to actionable objects first
        const pending = unresolvedObjects.filter(obj => {
          if (!hasUnresolvedBlobRefs(obj)) return false;
          const key = primaryKey.keyPath
            ? Dexie.getByKeyPath(obj, primaryKey.keyPath as string)
            : undefined;
          return key !== undefined;
        });

        // Process in parallel with concurrency limit
        let i = 0;
        const runNext = async (): Promise<void> => {
          while (i < pending.length) {
            if (signal?.aborted) return;
            const obj = pending[i++];
            const key = Dexie.getByKeyPath(obj, primaryKey.keyPath as string);

            try {
              // Refresh token per object — cheap (returns cached) but ensures
              // we pick up renewed tokens during long download sessions.
              const resolvedBlobs: ResolvedBlob[] = [];
              await resolveAllBlobRefs(obj, databaseUrl, resolvedBlobs, '', new WeakMap(), db.blobDownloadTracker);

              const updateSpec: UpdateSpec<any> = {
                _hasBlobRefs: undefined,
              };
              for (const blob of resolvedBlobs) {
                updateSpec[blob.keyPath] = blob.data;
              }

              debugLog(`Eager download: Updating ${table.name}:${key} with ${resolvedBlobs.length} blobs`);
              await table.update(key, updateSpec);
              // liveQuery in blobProgress.ts auto-detects this change
            } catch (err) {
              console.error(`Failed to download blobs for ${table.name}:${key}:`, err);
            }
          }
        };

        // Launch up to MAX_CONCURRENT workers
        const workers: Promise<void>[] = [];
        for (let w = 0; w < Math.min(MAX_CONCURRENT, pending.length); w++) {
          workers.push(runNext());
        }
        await Promise.all(workers);
      } catch (err) {
        // Table might not have _hasBlobRefs index or other issues - skip silently
      }
    }
  } finally {
    setDownloadingState(downloading$, false);
  }
}
