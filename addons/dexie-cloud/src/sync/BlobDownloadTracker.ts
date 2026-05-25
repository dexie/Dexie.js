import type { DexieCloudDB } from '../db/DexieCloudDB';
import { BlobRef, ResolvedBlob } from './blobResolve';
import { BlobSavingQueue } from './BlobSavingQueue';
import { loadCachedAccessToken } from './loadCachedAccessToken';

/**
 * Owns the full lifecycle of downloaded blobs:
 *   1. Deduplicates concurrent downloads for the same ref.
 *   2. Bounds the number of concurrent network fetches (MAX_CONCURRENT)
 *      so that ad-hoc reads can't starve the HTTP connection pool. Calls
 *      beyond the cap queue in FIFO order as slots free. The slot is held
 *      only for the duration of the fetch — NOT until persistence — to
 *      avoid deadlocks when a single object contains more blob refs than
 *      MAX_CONCURRENT (a sequential resolver would otherwise hold every
 *      slot itself while waiting for the next).
 *   3. Keeps the in-flight promise alive after the network fetch completes,
 *      until the blob has been persisted back to IndexedDB. This way,
 *      readers that ask for the same ref while it is queued for saving
 *      can piggyback on the existing promise instead of refetching.
 *      In-flight membership and slot ownership are independent: a piggyback
 *      reader consumes neither a slot nor extra memory beyond the existing
 *      cached Uint8Array.
 *   4. Persists resolved blobs via an internal BlobSavingQueue, and
 *      releases the in-flight entry when persistence completes.
 *
 * Both the blob-resolve middleware and the eager blob downloader use this
 * tracker. Instantiate once per DexieCloudDB.
 */

/**
 * Maximum number of concurrent blob fetches.
 *
 * Historically 6 to match the HTTP/1.1 same-origin connection cap that
 * browsers enforce. With HTTP/2 (the typical transport for Dexie Cloud
 * today) many streams multiplex over a single TCP connection, so the
 * old cap is overly conservative. 10 is a modest bump that still keeps
 * memory pressure (in-flight Uint8Arrays) and server load bounded.
 * Can be made configurable via DexieCloudOptions if a real need arises.
 */
export const MAX_CONCURRENT = 10;

export class BlobDownloadTracker {
  private inFlight = new Map<string, Promise<Uint8Array>>();
  private db: DexieCloudDB;
  private savingQueue: BlobSavingQueue;
  private activeFetches = 0;
  private waiting: Array<() => void> = [];

  constructor(db: DexieCloudDB) {
    this.db = db;
    this.savingQueue = new BlobSavingQueue(db, (refs) => {
      // Called by the queue when a save transaction has completed
      // (regardless of success). Drop the in-flight cache entries now —
      // any future reader will go through IndexedDB instead.
      for (const ref of refs) {
        this.inFlight.delete(ref);
      }
    });
  }

  /**
   * Download a blob, deduplicating concurrent requests for the same ref
   * and respecting the global fetch concurrency cap.
   *
   * Lifecycle:
   *   - Slot is acquired before the fetch and released as soon as the
   *     fetch settles (success or failure).
   *   - The in-flight entry survives a successful fetch and lives on
   *     until persistence completes (via enqueueSave) or releaseRefs
   *     is called. On fetch failure, the entry is removed immediately
   *     so a future call can retry.
   *
   * @param blobRef - The BlobRef to download
   * @param dbUrl - Base URL for the database (e.g., 'https://mydb.dexie.cloud')
   */
  download(blobRef: BlobRef, dbUrl: string): Promise<Uint8Array> {
    let promise = this.inFlight.get(blobRef.ref);
    if (!promise) {
      promise = this.acquireSlot()
        .then(() =>
          this.downloadBlob(blobRef, dbUrl).finally(() => this.releaseSlot())
        )
        .catch((err) => {
          // On error, remove immediately so a future call can retry.
          // (Slot already released by the .finally above.)
          this.inFlight.delete(blobRef.ref);
          throw err;
        });
      this.inFlight.set(blobRef.ref, promise);
    }
    return promise;
  }

  /**
   * Queue resolved blobs for persisting back to IndexedDB.
   * When the save transaction completes, the corresponding in-flight
   * entries are released.
   */
  enqueueSave(
    tableName: string,
    primaryKey: any,
    resolvedBlobs: ResolvedBlob[]
  ): void {
    this.savingQueue.saveBlobs(tableName, primaryKey, resolvedBlobs);
  }

  /**
   * Wait until all previously enqueued saves have been persisted to
   * IndexedDB. Used by callers that need to make decisions based on
   * on-disk state — e.g., the eager downloader looping over rows with
   * `_hasBlobRefs=1` in chunks, where each iteration must see the
   * previous chunk's writes before re-querying.
   *
   * New saves enqueued AFTER drainPendingSaves() is called do NOT extend
   * the wait.
   */
  drainPendingSaves(): Promise<void> {
    return this.savingQueue.drain();
  }

  /**
   * Release in-flight entries without going through the internal saving
   * queue. Used when the caller persists the blobs itself, or when no
   * primary key was available and the data won't be persisted at all.
   */
  releaseRefs(refs: string[]): void {
    for (const ref of refs) {
      this.inFlight.delete(ref);
    }
  }

  private acquireSlot(): Promise<void> {
    if (this.activeFetches < MAX_CONCURRENT) {
      this.activeFetches++;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.waiting.push(() => {
        this.activeFetches++;
        resolve();
      });
    });
  }

  private releaseSlot(): void {
    this.activeFetches--;
    const next = this.waiting.shift();
    if (next) next();
  }

  /**
   * Download blob data from server via proxy endpoint.
   * Uses auth header for authentication (same as sync).
   * When accessToken is null, the request is made without Authorization header —
   * this allows downloading blobs from public realms (rlm-public) for
   * unauthenticated users.
   *
   * @param blobRef - The BlobRef to download
   * @param dbUrl - Base URL for the database (e.g., 'https://mydb.dexie.cloud')
   */

  private async downloadBlob(
    blobRef: BlobRef,
    dbUrl: string
  ): Promise<Uint8Array> {
    const accessToken = await loadCachedAccessToken(this.db);
    const downloadUrl = `${dbUrl}/blob/${blobRef.ref}`;
    const headers: HeadersInit = {};
    if (accessToken) {
      // accessToken may be null for anonymous/unauthenticated users.
      // Public realm blobs (rlm-public) are accessible without auth.
      // downloadBlob will omit the Authorization header when token is null.
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    // cache: 'no-store' prevents the browser from storing this response in its
    // HTTP cache. The server sets a long Expires/Cache-Control header on blob
    // responses (blobs are immutable and content-addressed), which would
    // otherwise cause the browser to keep a copy in its disk cache in addition
    // to the copy we persist to IndexedDB — doubling storage for every blob.
    // Since we always persist to IndexedDB and subsequent reads go through
    // IndexedDB (never re-fetch), the browser cache copy is pure overhead.
    const response = await fetch(downloadUrl, { headers, cache: 'no-store' });

    if (!response.ok) {
      throw new Error(
        `Failed to download blob ${blobRef.ref}: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
}
