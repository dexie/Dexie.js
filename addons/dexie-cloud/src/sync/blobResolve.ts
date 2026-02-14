/**
 * BlobRef Resolution for Dexie Cloud
 * 
 * Handles lazy resolution of BlobRefs when reading from the database.
 * BlobRefs are symbolic references to blobs stored in blob storage.
 * They get resolved on-demand when the object is read.
 * 
 * The server sends offloaded binary data in the format:
 * { $t: 'Uint8Array', ref: 'blobId', size: 1234 }
 * { $t: 'Blob', ref: 'blobId', size: 1234, ct: 'image/png' }
 * 
 * The $t field preserves the original JavaScript type.
 */

import Dexie from 'dexie';
import { BlobSavingQueue } from './BlobSavingQueue';

/**
 * Original type that was offloaded to blob storage.
 * Matches the TSON type names.
 */
export type BlobRefOrigType = 
  | 'Blob'
  | 'ArrayBuffer'
  | 'Uint8Array'
  | 'Int8Array'
  | 'Uint8ClampedArray'
  | 'Int16Array'
  | 'Uint16Array'
  | 'Int32Array'
  | 'Uint32Array'
  | 'Float32Array'
  | 'Float64Array'
  | 'BigInt64Array'
  | 'BigUint64Array'
  | 'DataView';

/**
 * BlobRef represents a reference to binary data stored in blob storage.
 * The $t field contains the original JavaScript type (Uint8Array, Blob, etc.)
 * The presence of 'ref' instead of 'v' indicates this is an offloaded blob.
 */
export interface BlobRef {
  $t: BlobRefOrigType;
  ref: string;           // Blob ID (will be expanded to full URL)
  size: number;          // Size in bytes
  ct?: string;           // Content-type (only for Blob type)
  url?: string;          // Full signed URL (set by server or client)
}

/**
 * Resolved blob with its keyPath for queueing
 */
export interface ResolvedBlob {
  keyPath: string;
  data: Blob | ArrayBuffer | ArrayBufferView;
}

/**
 * Check if a value is a BlobRef (offloaded binary data)
 * A BlobRef has $t (type), ref (blob ID), but no v (inline data)
 */
export function isBlobRef(value: unknown): value is BlobRef {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as any;
  return (
    typeof obj.$t === 'string' &&
    typeof obj.ref === 'string' &&
    obj.v === undefined  // No inline data = it's a reference
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

  if (typeof obj !== 'object') {
    return false;
  }

  // Avoid circular references - check BEFORE processing
  if (visited.has(obj)) {
    return false;
  }
  visited.add(obj);

  // Skip special objects that can't contain BlobRefs
  if (obj instanceof Date || obj instanceof RegExp || obj instanceof Blob) {
    return false;
  }
  if (obj instanceof ArrayBuffer || ArrayBuffer.isView(obj)) {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some(item => hasBlobRefs(item, visited));
  }

  // Only traverse POJOs
  if (obj.constructor === Object) {
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
  const downloadUrl = blobRef.url || blobRef.ref;
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error(`Failed to download blob: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Convert downloaded Uint8Array to the original type specified in BlobRef
 */
export function convertToOriginalType(
  data: Uint8Array, 
  ref: BlobRef
): Blob | ArrayBuffer | ArrayBufferView {
  // Get the underlying ArrayBuffer (handle shared buffer case)
  const buffer = data.buffer.byteLength === data.byteLength
    ? data.buffer as ArrayBuffer
    : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  
  switch (ref.$t) {
    case 'Blob':
      return new Blob([new Uint8Array(buffer)], { type: ref.ct || '' });
    case 'ArrayBuffer':
      return buffer;
    case 'Uint8Array':
      return data;
    case 'Int8Array':
      return new Int8Array(buffer);
    case 'Uint8ClampedArray':
      return new Uint8ClampedArray(buffer);
    case 'Int16Array':
      return new Int16Array(buffer);
    case 'Uint16Array':
      return new Uint16Array(buffer);
    case 'Int32Array':
      return new Int32Array(buffer);
    case 'Uint32Array':
      return new Uint32Array(buffer);
    case 'Float32Array':
      return new Float32Array(buffer);
    case 'Float64Array':
      return new Float64Array(buffer);
    case 'BigInt64Array':
      return new BigInt64Array(buffer);
    case 'BigUint64Array':
      return new BigUint64Array(buffer);
    case 'DataView':
      return new DataView(buffer);
    default:
      // Fallback to Uint8Array for unknown types
      return data;
  }
}

/**
 * Recursively resolve all BlobRefs in an object and collect them for queueing.
 * Returns a new object with BlobRefs replaced by their original type data,
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
    const rawData = await downloadBlob(obj);
    const data = convertToOriginalType(rawData, obj);
    resolvedBlobs.push({ keyPath: currentPath, data });
    return data;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    // Avoid circular references - check and set BEFORE iterating
    if (visited.has(obj)) {
      return visited.get(obj);
    }
    const result: unknown[] = [];
    visited.set(obj, result);  // Set before iterating to handle self-references
    for (let i = 0; i < obj.length; i++) {
      const itemPath = currentPath ? `${currentPath}.${i}` : `${i}`;
      result.push(await resolveAllBlobRefs(obj[i], resolvedBlobs, itemPath, visited));
    }
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
