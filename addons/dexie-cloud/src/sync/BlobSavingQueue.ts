/**
 * BlobSavingQueue - Queues resolved blobs for saving back to IndexedDB
 * 
 * Uses setTimeout(fn, 0) instead of queueMicrotask to completely isolate
 * from Dexie's Promise.PSD context. This prevents the save operation
 * from inheriting any ongoing transaction.
 */

import { DexieCloudDB } from '../db/DexieCloudDB';

interface QueuedBlob {
  tableName: string;
  obj: any;
  key: any;
}

export class BlobSavingQueue {
  private queue: QueuedBlob[] = [];
  private isProcessing = false;
  private db: DexieCloudDB;

  constructor(db: DexieCloudDB) {
    this.db = db;
  }

  /**
   * Queue a resolved blob object for saving.
   * Automatically starts the consumer if not already running.
   */
  saveBlob(tableName: string, obj: any, key: any): void {
    this.queue.push({ tableName, obj, key });
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
   */
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        await this.db.table(item.tableName).put(item.obj);
      } catch (err) {
        console.warn(
          `Failed to save resolved blob for ${item.tableName}:${item.key}:`,
          err
        );
      }
    }
    
    this.isProcessing = false;
  }
}
