/**
 * Blob Reference Support
 *
 * Provides context types and helpers for blob offloading during TSON serialization.
 * Large binary data (>= BLOB_THRESHOLD) can be stored separately and replaced
 * with a _bt reference object: { _bt: 'Uint8Array', ref: '1:blobId', size: 1234 }
 *
 * These references are plain POJOs — TSON does not revive them.
 * Resolution is handled by blobResolveMiddleware in dexie-cloud-addon.
 */

/** Threshold for blob offloading (4KB) */
export const BLOB_THRESHOLD = 4 * 1024;

/**
 * Interface for blob storage backend.
 */
export interface BlobStore {
  /** Store blob and return its ID */
  store(data: ArrayBuffer, contentType?: string): Promise<string> | string;
}

/**
 * Context passed via alternateChannel during serialization.
 */
export interface BlobRefContext {
  /** Blob storage backend */
  blobStore?: BlobStore;
  /** Threshold override (default: BLOB_THRESHOLD) */
  threshold?: number;
  /** Force inline even for large data (for old clients) */
  forceInline?: boolean;
  /** Maximum inline size when forceInline is true (error if exceeded) */
  maxInlineSize?: number;
}

/**
 * Create a blob ref context for serialization.
 */
export function createBlobRefContext(
  blobStore: BlobStore,
  options?: { threshold?: number }
): BlobRefContext {
  return {
    blobStore,
    threshold: options?.threshold ?? BLOB_THRESHOLD,
  };
}
