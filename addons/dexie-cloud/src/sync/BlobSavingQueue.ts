/**
 * BlobSavingQueue - Queues resolved blobs for saving back to IndexedDB.
 *
 * This is an internal collaborator of BlobDownloadTracker and is not
 * intended to be used directly by middleware or other code. See
 * BlobDownloadTracker.enqueueSave().
 *
 * Uses setTimeout(fn, 0) instead of queueMicrotask to completely isolate
 * from Dexie's Promise.PSD context. This prevents the save operation
 * from inheriting any ongoing transaction.
 *
 * Each blob is saved atomically using downCore transaction with the specific
 * keyPath to avoid race conditions with other property changes.
 */

import Dexie, { UpdateSpec } from 'dexie';
import { isBlobRef, ResolvedBlob } from './blobResolve';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { TXExpandos } from '../types/TXExpandos';

interface QueuedBlob {
  tableName: string;
  primaryKey: any;
  resolvedBlobs: ResolvedBlob[];
}

export class BlobSavingQueue {
  private queue: QueuedBlob[] = [];
  private isProcessing = false;
  private db: DexieCloudDB;
  private onPersisted: (refs: string[]) => void;
  private drainResolvers: Array<() => void> = [];

  constructor(db: DexieCloudDB, onPersisted: (refs: string[]) => void) {
    this.db = db;
    this.onPersisted = onPersisted;
  }

  /**
   * Queue a resolved blob for saving.
   * Only the specific blob property will be updated atomically.
   */
  saveBlobs(
    tableName: string,
    primaryKey: any,
    resolvedBlobs: ResolvedBlob[]
  ): void {
    this.queue.push({
      tableName,
      primaryKey,
      resolvedBlobs,
    });
    this.startConsumer();
  }

  /**
   * Returns a promise that resolves when the queue is empty AND no item
   * is currently being processed. Used by callers that need to know when
   * all previously enqueued saves have been persisted to IndexedDB before
   * making decisions based on the on-disk state (e.g., the eager blob
   * downloader looping over `_hasBlobRefs=1` rows in chunks).
   *
   * Note: New work enqueued AFTER drain() is called does NOT extend the
   * wait. Callers that race against concurrent producers should treat the
   * returned promise as "queue was empty at some point after this call".
   */
  drain(): Promise<void> {
    if (!this.isProcessing && this.queue.length === 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.drainResolvers.push(resolve);
    });
  }

  /**
   * Start the consumer if not already processing.
   * Uses setTimeout(fn, 0) to completely break out of any
   * Dexie transaction context (Promise.PSD).
   */
  private startConsumer(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;

    // Use setTimeout to completely isolate from Dexie's PSD context
    // queueMicrotask would risk inheriting the current transaction
    setTimeout(() => {
      this.processQueue();
    }, 0);
  }

  /**
   * Process all queued blobs.
   * Runs in a completely isolated context (no inherited transaction).
   * Uses atomic updates to avoid race conditions.
   */
  private processQueue(): void {
    const item = this.queue.shift();
    if (!item) {
      this.isProcessing = false;
      // Fire any pending drain() waiters. New saveBlobs() calls that
      // arrive after this point will start a fresh processing cycle
      // and have their own drain() semantics.
      const resolvers = this.drainResolvers;
      if (resolvers.length > 0) {
        this.drainResolvers = [];
        for (const resolve of resolvers) resolve();
      }
      return;
    }

    // Atomic update of just the blob property
    this.db
      .transaction('rw', item.tableName, (tx) => {
        const trans = tx.idbtrans as IDBTransaction & TXExpandos;
        trans.disableChangeTracking = true; // Don't regard this as a change for sync purposes
        trans.disableAccessControl = true; // Bypass any access control checks since this is an internal operation
        trans.disableBlobResolve = true; // Custom flag to skip blob resolve middleware during this transaction
        const updateSpec: UpdateSpec<any> = {};
        for (const blob of item.resolvedBlobs) {
          updateSpec[blob.keyPath] = blob.data;
        }
        tx.table(item.tableName).update(item.primaryKey, (obj) => {
          // Check that object still has the same unresolved blob refs before applying update (i.e. it hasn't been modified since we read it)
          for (const blob of item.resolvedBlobs) {
            // Verify atomicity - none of the blob properties has been modified since we read it. If any of them was modified, skip updating this item to avoid overwriting user changes.
            const currentValue = Dexie.getByKeyPath(obj, blob.keyPath);
            if (currentValue === undefined) {
              // Blob property was removed - skip updating this blob
              continue;
            }
            if (!isBlobRef(currentValue)) {
              // Blob property was modified to a non-blob-ref value - skip updating this blob
              continue;
            }
            if (currentValue.ref !== blob.ref) {
              // Blob property was modified - skip updating this blob
              return; // Stop. Another items has been queued to fully fix the object.
            }
            Dexie.setByKeyPath(obj, blob.keyPath, blob.data);
          }
          delete obj._hasBlobRefs; // Clear the _hasBlobRefs marker if all refs was resolved.
        });
        // Note: we intentionally do NOT clear trans.mutatedParts here.
        // Letting the normal mutation signal through means the
        // blobProgress liveQuery (and any user-defined liveQuery that
        // depends on the resolved fields) wakes up and reflects progress
        // as blobs land in IndexedDB.
      })
      .catch((error) => {
        console.error(
          `Error saving resolved blobs on ${item.tableName}:${item.primaryKey}:`,
          error
        );
      })
      .finally(() => {
        // At this point, the transaction has completed (either successfully or with error),
        // and the blobs have been saved (or failed to save).
        // Notify the owner (BlobDownloadTracker) so it can release the
        // in-flight download cache entries for these refs. The cache was
        // kept alive until now to maximize reuse while the blob was still
        // in-flight (downloading or queued for save).
        this.onPersisted(item.resolvedBlobs.map((b) => b.ref));
        // Process next item in the queue
        return this.processQueue();
      });
  }
}
