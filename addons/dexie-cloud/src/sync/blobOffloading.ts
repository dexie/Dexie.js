/**
 * Blob Offloading for Dexie Cloud
 * 
 * Handles uploading large blobs to blob storage before sync,
 * and resolving BlobRefs when reading from the database.
 */

import { newId } from 'dexie-cloud-common';

// Blobs >= 4KB are offloaded to blob storage
const BLOB_OFFLOAD_THRESHOLD = 4096;

export interface BlobRef {
  $t: 'Blob';
  $url: string;
  $size: number;
  $ct: string; // content-type
}

export function isBlobRef(value: unknown): value is BlobRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as any).$t === 'Blob' &&
    typeof (value as any).$url === 'string'
  );
}

export function shouldOffloadBlob(value: unknown): value is Blob | ArrayBuffer | Uint8Array {
  if (value instanceof Blob) {
    return value.size >= BLOB_OFFLOAD_THRESHOLD;
  }
  if (value instanceof ArrayBuffer) {
    return value.byteLength >= BLOB_OFFLOAD_THRESHOLD;
  }
  if (value instanceof Uint8Array) {
    return value.byteLength >= BLOB_OFFLOAD_THRESHOLD;
  }
  return false;
}

/**
 * Upload a blob to the blob storage endpoint
 */
export async function uploadBlob(
  databaseUrl: string,
  accessToken: string,
  blob: Blob | ArrayBuffer | Uint8Array
): Promise<BlobRef> {
  const blobId = newId();
  // URL format: {databaseUrl}/blob/{blobId}
  const url = `${databaseUrl}/blob/${blobId}`;
  
  let body: Blob | ArrayBuffer;
  let contentType: string;
  let size: number;
  
  if (blob instanceof Blob) {
    body = blob;
    contentType = blob.type || 'application/octet-stream';
    size = blob.size;
  } else if (blob instanceof ArrayBuffer) {
    body = blob;
    contentType = 'application/octet-stream';
    size = blob.byteLength;
  } else {
    // Uint8Array - create a proper ArrayBuffer copy
    const arrayBuffer = new ArrayBuffer(blob.byteLength);
    new Uint8Array(arrayBuffer).set(blob);
    body = arrayBuffer;
    contentType = 'application/octet-stream';
    size = blob.byteLength;
  }
  
  // Add content type as query param for the server to store
  const uploadUrl = `${url}?ct=${encodeURIComponent(contentType)}`;
  
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': contentType,
    },
    body,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload blob: ${response.status} ${response.statusText}`);
  }
  
  // The server returns the canonical URL
  const result = await response.json();
  
  return {
    $t: 'Blob',
    $url: result.url || url,
    $size: size,
    $ct: contentType,
  };
}

/**
 * Download blob data from a BlobRef
 */
export async function downloadBlob(
  blobRef: BlobRef,
  accessToken: string
): Promise<Blob> {
  const response = await fetch(blobRef.$url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download blob: ${response.status} ${response.statusText}`);
  }
  
  return response.blob();
}

/**
 * Recursively scan an object for large blobs and upload them
 * Returns a new object with blobs replaced by BlobRefs
 */
export async function offloadBlobs(
  obj: unknown,
  databaseUrl: string,
  accessToken: string,
  visited = new WeakSet()
): Promise<unknown> {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Check if this is a blob that should be offloaded
  if (shouldOffloadBlob(obj)) {
    return uploadBlob(databaseUrl, accessToken, obj);
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    const result: unknown[] = [];
    for (const item of obj) {
      result.push(await offloadBlobs(item, databaseUrl, accessToken, visited));
    }
    return result;
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    // Avoid circular references
    if (visited.has(obj)) {
      return obj;
    }
    visited.add(obj);
    
    // Skip special objects
    if (obj instanceof Date || obj instanceof RegExp) {
      return obj;
    }
    
    // Skip small blobs
    if (obj instanceof Blob || obj instanceof ArrayBuffer || ArrayBuffer.isView(obj)) {
      return obj;
    }
    
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = await offloadBlobs(value, databaseUrl, accessToken, visited);
    }
    return result;
  }
  
  return obj;
}

/**
 * Recursively resolve BlobRefs in an object
 * Returns a new object with BlobRefs replaced by actual Blob data
 */
export async function resolveBlobs(
  obj: unknown,
  accessToken: string,
  visited = new WeakSet()
): Promise<unknown> {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Check if this is a BlobRef
  if (isBlobRef(obj)) {
    return downloadBlob(obj, accessToken);
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    const result: unknown[] = [];
    for (const item of obj) {
      result.push(await resolveBlobs(item, accessToken, visited));
    }
    return result;
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    // Avoid circular references
    if (visited.has(obj)) {
      return obj;
    }
    visited.add(obj);
    
    // Skip special objects
    if (obj instanceof Date || obj instanceof RegExp || obj instanceof Blob) {
      return obj;
    }
    
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = await resolveBlobs(value, accessToken, visited);
    }
    return result;
  }
  
  return obj;
}
