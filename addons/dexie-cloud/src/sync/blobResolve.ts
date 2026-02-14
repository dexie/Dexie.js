/**
 * BlobRef Resolution for Dexie Cloud
 * 
 * Handles lazy resolution of BlobRefs when reading from the database.
 * BlobRefs are symbolic references to blobs stored in blob storage.
 * They get resolved on-demand when the object is read.
 */

import Dexie from 'dexie';
import { BlobSavingQueue } from './BlobSavingQueue';

export interface BlobRef {
  $t: 'Blob';
  $url: string;
  $size: number;
  $ct: string; // content-type
}

/**
 * Resolved blob with its keyPath for queueing
 */
export interface ResolvedBlob {
  keyPath: string;
  data: Uint8Array;
}

/**
 * Check if a value is a BlobRef
 */
export function isBlobRef(value: unknown): value is BlobRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as any).$t === 'Blob' &&
    typeof (value as any).$url === 'string'
  );
}

/**
 * Recursively check if an object contains any BlobRefs
 */
export function hasBlobRefs(obj: unknown, visited = new WeakSet()): boolean {
  if (obj === null || obj === undefined) {
    return false;
  }

  if (isBlobRef(obj)) {
    return true;
  }

  if (Array.isArray(obj)) {
    return obj.some(item => hasBlobRefs(item, visited));
  }

  if (typeof obj === 'object') {
    // Avoid circular references
    if (visited.has(obj)) {
      return false;
    }
    visited.add(obj);

    // Skip special objects
    if (obj instanceof Date || obj instanceof RegExp || obj instanceof Blob) {
      return false;
    }
    if (obj instanceof ArrayBuffer || ArrayBuffer.isView(obj)) {
      return false;
    }

    return Object.values(obj).some(value => hasBlobRefs(value, visited));
  }

  return false;
}

/**
 * Mark an object as having unresolved BlobRefs
 * Returns true if the object was marked (had BlobRefs)
 */
export function markUnresolvedBlobRefs<T extends object>(obj: T): boolean {
  if (hasBlobRefs(obj)) {
    (obj as any).$unresolved = 1;
    return true;
  }
  return false;
}

/**
 * Download blob data from a BlobRef URL
 * The URL is a signed URL (SAS token) that already contains authentication
 */
export async function downloadBlob(blobRef: BlobRef): Promise<Uint8Array> {
  const response = await fetch(blobRef.$url);

  if (!response.ok) {
    throw new Error(`Failed to download blob: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Recursively resolve all BlobRefs in an object and collect them for queueing.
 * Returns a new object with BlobRefs replaced by actual Uint8Array data,
 * and populates the resolvedBlobs array with keyPath info for each blob.
 * 
 * BlobRef URLs are signed (SAS tokens) so no auth header needed
 */
export async function resolveAllBlobRefs(
  obj: unknown,
  resolvedBlobs: ResolvedBlob[] = [],
  currentPath: string = '',
  visited = new WeakMap()
): Promise<unknown> {
  if (obj == null) { // null or undefined
    return obj;
  }

  // Check if this is a BlobRef - resolve it and track it
  if (isBlobRef(obj)) {
    const data = await downloadBlob(obj);
    resolvedBlobs.push({ keyPath: currentPath, data });
    return data;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    // Avoid circular references
    if (visited.has(obj)) {
      return visited.get(obj);
    }
    const result: unknown[] = [];
    for (let i = 0; i < obj.length; i++) {
      const itemPath = currentPath ? `${currentPath}.${i}` : `${i}`;
      result.push(await resolveAllBlobRefs(obj[i], resolvedBlobs, itemPath, visited));
    }
    visited.set(obj, result);
    return result;
  }

  // Handle POJO objects only (not Date, RegExp, Blob, ArrayBuffer, etc.)
  if (typeof obj === 'object' && obj.constructor === Object) {
    // Avoid circular references
    if (visited.has(obj)) {
      return visited.get(obj);
    }

    const result: Record<string, unknown> = {};
    visited.set(obj, result);

    for (const [key, value] of Object.entries(obj)) {
      // Skip the $unresolved marker itself
      if (key === '$unresolved') {
        continue;
      }
      const propPath = currentPath ? `${currentPath}.${key}` : key;
      result[key] = await resolveAllBlobRefs(value, resolvedBlobs, propPath, visited);
    }

    return result;
  }

  return obj;
}

/**
 * Check if an object has unresolved BlobRefs
 */
export function hasUnresolvedBlobRefs(obj: unknown): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (obj as any).$unresolved === 1
  );
}
