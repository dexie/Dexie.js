/**
 * BlobRef Resolution for Dexie Cloud
 * 
 * Handles lazy resolution of BlobRefs and TSONRefs when reading from the database.
 * These are symbolic references to blobs stored in blob storage.
 * They get resolved on-demand when the object is read.
 * 
 * The server sends offloaded binary data in the format:
 * { $t: 'Uint8Array', ref: '1:blobId', size: 1234 }
 * { $t: 'Blob', ref: '1:blobId', size: 1234, ct: 'image/png' }
 * 
 * After TSON parsing with blobRefTypeDefs, these become TSONRef objects:
 * new TSONRef('Uint8Array', '1:blobId', 1234)
 * new TSONRef('Blob', '1:blobId', 1234, 'image/png')
 * 
 * The $t/type field preserves the original JavaScript type.
 * The ref format is '{version}:{blobId}' where version identifies
 * the storage backend configuration.
 */

import { TSONRef } from 'dexie-cloud-common';

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
  ref: string;           // Versioned ref: '{version}:{blobId}'
  size: number;          // Size in bytes
  ct?: string;           // Content-type (only for Blob type)
}

/**
 * Resolved blob with its keyPath for queueing
 */
export interface ResolvedBlob {
  keyPath: string;
  data: Blob | ArrayBuffer | ArrayBufferView;
  ref: string;
}

/**
 * Check if a value is a raw BlobRef object (offloaded binary data)
 * A BlobRef has $t (type), ref (blob ID), but no v (inline data)
 * 
 * Note: After TSON parsing with blobRefTypeDefs, BlobRefs become TSONRef objects.
 * Use isUnresolvedRef() to check for both.
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
 * Check if a value is an unresolved blob reference (BlobRef or TSONRef)
 */
export function isUnresolvedRef(value: unknown): boolean {
  return isBlobRef(value) || TSONRef.isTSONRef(value);
}

/**
 * Recursively check if an object contains any BlobRefs (raw format)
 * 
 * Note: For checking TSONRef objects (after TSON parsing), use hasTSONRefs from dexie-cloud-common.
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
 * Recursively check if an object contains any unresolved refs (BlobRef or TSONRef)
 */
export function hasUnresolvedRefs(obj: unknown, visited = new WeakSet()): boolean {
  if (obj === null || obj === undefined) {
    return false;
  }

  if (isUnresolvedRef(obj)) {
    return true;
  }

  if (typeof obj !== 'object') {
    return false;
  }

  // Avoid circular references
  if (visited.has(obj)) {
    return false;
  }
  visited.add(obj);

  // Skip special objects that can't contain refs
  if (obj instanceof Date || obj instanceof RegExp || obj instanceof Blob) {
    return false;
  }
  if (obj instanceof ArrayBuffer || ArrayBuffer.isView(obj)) {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some(item => hasUnresolvedRefs(item, visited));
  }

  // Only traverse POJOs
  if (obj.constructor === Object) {
    return Object.values(obj).some(value => hasUnresolvedRefs(value, visited));
  }

  return false;
}

/**
 * Download blob data from server via proxy endpoint.
 * Uses auth header for authentication (same as sync).
 * 
 * @param refId - The blob reference ID (e.g., '1:uuid')
 * @param dbUrl - Base URL for the database (e.g., 'https://mydb.dexie.cloud')
 * @param accessToken - Access token for authentication
 */
export async function downloadBlobByRef(
  refId: string, 
  dbUrl: string, 
  accessToken: string
): Promise<ArrayBuffer> {
  const downloadUrl = `${dbUrl}/blob/${refId}`;
  const response = await fetch(downloadUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download blob: ${response.status} ${response.statusText}`);
  }

  return response.arrayBuffer();
}

/**
 * Download blob data from server via proxy endpoint.
 * Uses auth header for authentication (same as sync).
 * 
 * @param blobRef - The BlobRef to download
 * @param dbUrl - Base URL for the database (e.g., 'https://mydb.dexie.cloud')
 * @param accessToken - Access token for authentication
 * @deprecated Use downloadBlobByRef instead
 */
export async function downloadBlob(
  blobRef: BlobRef, 
  dbUrl: string, 
  accessToken: string
): Promise<Uint8Array> {
  const arrayBuffer = await downloadBlobByRef(blobRef.ref, dbUrl, accessToken);
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
 * Recursively resolve all BlobRefs and TSONRefs in an object and collect them for queueing.
 * Returns a new object with refs replaced by their original type data,
 * and populates the resolvedBlobs array with keyPath info for each blob.
 * 
 * @param obj - Object to resolve
 * @param dbUrl - Base URL for the database
 * @param accessToken - Access token for blob downloads
 * @param resolvedBlobs - Array to collect resolved blob info
 * @param currentPath - Current property path (for tracking)
 * @param visited - WeakMap for circular reference detection
 */
export async function resolveAllBlobRefs(
  obj: unknown,
  dbUrl: string,
  accessToken: string,
  resolvedBlobs: ResolvedBlob[] = [],
  currentPath: string = '',
  visited = new WeakMap()
): Promise<unknown> {
  if (obj == null) { // null or undefined
    return obj;
  }

  // Check if this is a TSONRef - resolve it and track it
  if (TSONRef.isTSONRef(obj)) {
    const arrayBuffer = await downloadBlobByRef(obj.ref, dbUrl, accessToken);
    const data = obj.reconstruct(arrayBuffer);
    resolvedBlobs.push({ keyPath: currentPath, data, ref: obj.ref });
    return data;
  }

  // Check if this is a raw BlobRef - resolve it and track it
  if (isBlobRef(obj)) {
    const rawData = await downloadBlob(obj, dbUrl, accessToken);
    const data = convertToOriginalType(rawData, obj);
    resolvedBlobs.push({ keyPath: currentPath, data, ref: obj.ref });
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
      result.push(await resolveAllBlobRefs(obj[i], dbUrl, accessToken, resolvedBlobs, itemPath, visited));
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

    for (const [propName, value] of Object.entries(obj)) {
      // Skip the $hasBlobRefs marker itself
      if (propName === '$hasBlobRefs') {
        continue;
      }
      const propPath = currentPath ? `${currentPath}.${propName}` : propName;
      result[propName] = await resolveAllBlobRefs(value, dbUrl, accessToken, resolvedBlobs, propPath, visited);
    }

    return result;
  }

  return obj;
}

/**
 * Check if an object has unresolved BlobRefs (marked with $hasBlobRefs)
 */
export function hasUnresolvedBlobRefs(obj: unknown): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (obj as any).$hasBlobRefs === 1
  );
}
