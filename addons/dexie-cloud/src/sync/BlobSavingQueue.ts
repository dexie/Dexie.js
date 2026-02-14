/**
 * BlobSavingQueue - Queues resolved blobs for saving back to IndexedDB
 * 
 * Uses setTimeout(fn, 0) instead of queueMicrotask to completely isolate
 * from Dexie's Promise.PSD context. This prevents the save operation
 * from inheriting any ongoing transaction.
 * 
 * Each blob is saved atomically using downCore transaction with the specific
 * keyPath to avoid race conditions with other property changes.
 */

import Dexie, { DBCore } from 'dexie';

interface QueuedBlob {
  tableName: string;
  primaryKey: any;
  blobKeyPath: string;
  blobData: Blob | ArrayBuffer | ArrayBufferView;
}

export class BlobSavingQueue {
  private queue: QueuedBlob[] = [];
  private isProcessing = false;
  private dbCore: DBCore;

  constructor(dbCore: DBCore) {
    this.dbCore = dbCore;
  }

  /**
   * Queue a resolved blob for saving.
   * Only the specific blob property will be updated atomically.
   */
  saveBlob(tableName: string, primaryKey: any, blobKeyPath: string, blobData: Blob | ArrayBuffer | ArrayBufferView): void {
    this.queue.push({ tableName, primaryKey, blobKeyPath, blobData });
    this.startConsumer();
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
      return;
    }

    // Atomic update of just the blob property
    const tx = this.dbCore.transaction([item.tableName], 'readwrite');
    const coreTable = this.dbCore.table(item.tableName);
    coreTable.get({
      key: item.primaryKey,
      trans: tx
    }).then((obj) => {
      if (!obj) {
        // Object might have been deleted, skip if not found
        return;
      }
      Dexie.setByKeyPath(obj, item.blobKeyPath, item.blobData);
      return coreTable.mutate({ type: 'put', keys: [item.primaryKey], values: [obj], trans: tx });
    }).then(() => {
       this.processQueue();
    }).catch((err) => {
      console.warn(
        `Failed to save resolved blob for ${item.tableName}:${item.primaryKey}:${item.blobKeyPath}:`,
        err
      );
      this.processQueue();
    });
  }
}
