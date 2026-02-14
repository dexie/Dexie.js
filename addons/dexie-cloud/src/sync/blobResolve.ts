/**
 * BlobRef Resolution for Dexie Cloud
 * 
 * Handles lazy resolution of BlobRefs when reading from the database.
 * BlobRefs are symbolic references to blobs stored in blob storage.
 * They get resolved on-demand when the object is read.
 */

import Dexie from 'dexie';

export interface BlobRef {
  $t: 'Blob';
  $url: string;
  $size: number;
  $ct: string; // content-type
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
 * Recursively resolve all BlobRefs in an object
 * Returns a new object with BlobRefs replaced by actual Uint8Array data
 * 
 * BlobRef URLs are signed (SAS tokens) so no auth header needed
 */
export async function resolveAllBlobRefs(
  obj: unknown,
  visited = new WeakMap()
): Promise<unknown> {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Check if this is a BlobRef - resolve it
  if (isBlobRef(obj)) {
    return downloadBlob(obj);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    const result: unknown[] = [];
    for (const item of obj) {
      result.push(await resolveAllBlobRefs(item, visited));
    }
    return result;
  }

  // Handle objects
  if (typeof obj === 'object') {
    // Avoid circular references
    if (visited.has(obj)) {
      return visited.get(obj);
    }

    // Skip special objects that can't contain BlobRefs
    if (obj instanceof Date || obj instanceof RegExp || obj instanceof Blob) {
      return obj;
    }
    if (obj instanceof ArrayBuffer || ArrayBuffer.isView(obj)) {
      return obj;
    }

    const result: Record<string, unknown> = {};
    visited.set(obj, result);

    for (const [key, value] of Object.entries(obj)) {
      // Skip the $unresolved marker itself
      if (key === '$unresolved') {
        continue;
      }
      result[key] = await resolveAllBlobRefs(value, visited);
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
