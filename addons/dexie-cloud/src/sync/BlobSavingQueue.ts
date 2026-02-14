/**
 * BlobSavingQueue - Queues resolved blobs for saving back to IndexedDB
 * 
 * Uses setTimeout(fn, 0) instead of queueMicrotask to completely isolate
 * from Dexie's Promise.PSD context. This prevents the save operation
 * from inheriting any ongoing transaction.
 * 
 * Each blob is saved atomically using Table.update() with the specific
 * keyPath to avoid race conditions with other property changes.
 */

import { DexieCloudDB } from '../db/DexieCloudDB';

interface QueuedBlob {
  tableName: string;
  primaryKey: any;
  blobKeyPath: string;
  blobData: Uint8Array | Blob;
}

export class BlobSavingQueue {
  private queue: QueuedBlob[] = [];
  private isProcessing = false;
  private db: DexieCloudDB;

  constructor(db: DexieCloudDB) {
    this.db = db;
  }

  /**
   * Queue a resolved blob for saving.
   * Only the specific blob property will be updated atomically.
   */
  saveBlob(tableName: string, primaryKey: any, blobKeyPath: string, blobData: Uint8Array | Blob): void {
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
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        // Atomic update of just the blob property
        await this.db.table(item.tableName).update(item.primaryKey, {
          [item.blobKeyPath]: item.blobData
        });
      } catch (err) {
        console.warn(
          `Failed to save resolved blob for ${item.tableName}:${item.primaryKey}:${item.blobKeyPath}:`,
          err
        );
      }
    }
    
    this.isProcessing = false;
  }
}
