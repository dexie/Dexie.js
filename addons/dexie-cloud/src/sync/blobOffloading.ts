/**
 * Blob Offloading for Dexie Cloud
 * 
 * Handles uploading large blobs to blob storage before sync,
 * and resolving BlobRefs when reading from the database.
 */

import { newId, DBOperationsSet, DBOperation } from 'dexie-cloud-common';
import { BlobRef, BlobRefOrigType, isBlobRef as isBlobRefFromResolve } from './blobResolve';

// Blobs >= 4KB are offloaded to blob storage
const BLOB_OFFLOAD_THRESHOLD = 4096;

// Re-export BlobRef type
export type { BlobRef, BlobRefOrigType };

// Re-export isBlobRef from blobResolve
export const isBlobRef = isBlobRefFromResolve;

/**
 * Cross-realm type detection helpers (performance-optimized)
 * 
 * When code runs in different JavaScript realms (e.g., Service Worker context),
 * `instanceof` checks can fail because each realm has its own global constructors.
 * We use Object.prototype.toString which works reliably across realms.
 * 
 * Performance considerations (this is a hot path - every property is checked):
 * - Early return for primitives via typeof
 * - Static Set for O(1) TypedArray tag lookup
 * - Single typeTag call per check
 */

// Static Set for O(1) lookup of binary type tags
const BINARY_TYPE_TAGS = new Set([
  'Blob', 'File', 'ArrayBuffer',
  'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
  'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array',
  'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array',
  'DataView'
]);

// TypedArray/DataView tags for size check
const ARRAYBUFFER_VIEW_TAGS = new Set([
  'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
  'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array',
  'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array',
  'DataView'
]);

/**
 * Get the [[Class]] internal property via Object.prototype.toString
 */
function getTypeTag(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1);
}

/**
 * Get the original type name for a value
 */
function getOrigType(value: Blob | ArrayBuffer | ArrayBufferView): BlobRefOrigType {
  const tag = getTypeTag(value);
  if (tag === 'Blob' || tag === 'File') return 'Blob';
  if (tag === 'ArrayBuffer') return 'ArrayBuffer';
  return tag as BlobRefOrigType;
}

/**
 * Check if a value should be offloaded to blob storage
 * Performance-optimized for hot path traversal.
 */
export function shouldOffloadBlob(value: unknown): value is Blob | ArrayBuffer | ArrayBufferView {
  // Fast path: primitives (most common case)
  // typeof returns: "string", "number", "boolean", "undefined", "symbol", "bigint", "function", "object"
  const t = typeof value;
  if (t !== 'object' || value === null) return false;
  
  // Get type tag once (cross-realm safe)
  const tag = getTypeTag(value);
  
  // Quick check: is this even a binary type?
  if (!BINARY_TYPE_TAGS.has(tag)) return false;
  
  // Check size threshold based on type
  if (tag === 'Blob' || tag === 'File') {
    return (value as Blob).size >= BLOB_OFFLOAD_THRESHOLD;
  }
  if (tag === 'ArrayBuffer') {
    return (value as ArrayBuffer).byteLength >= BLOB_OFFLOAD_THRESHOLD;
  }
  // TypedArray or DataView
  return (value as ArrayBufferView).byteLength >= BLOB_OFFLOAD_THRESHOLD;
}

/**
 * Upload a blob to the blob storage endpoint
 */
export async function uploadBlob(
  databaseUrl: string,
  getCachedAccessToken: () => Promise<string | null>,
  blob: Blob | ArrayBuffer | ArrayBufferView
): Promise<BlobRef> {
  const accessToken = await getCachedAccessToken();
  if (!accessToken) {
    throw new Error('Failed to load access token for blob upload');
  }

  const blobId = newId();
  // URL format: {databaseUrl}/blob/{blobId}
  const url = `${databaseUrl}/blob/${blobId}`;
  
  let body: Blob | ArrayBuffer;
  let contentType: string;
  let size: number;
  const origType = getOrigType(blob);
  
  // Use type tag for cross-realm compatible checks
  const tag = getTypeTag(blob);
  if (tag === 'Blob' || tag === 'File') {
    body = blob as Blob;
    contentType = (blob as Blob).type || 'application/octet-stream';
    size = (blob as Blob).size;
  } else if (tag === 'ArrayBuffer') {
    body = blob as ArrayBuffer;
    contentType = 'application/octet-stream';
    size = (blob as ArrayBuffer).byteLength;
  } else if (ARRAYBUFFER_VIEW_TAGS.has(tag)) {
    // ArrayBufferView (TypedArray or DataView) - create a proper ArrayBuffer copy
    const view = blob as ArrayBufferView;
    const arrayBuffer = new ArrayBuffer(view.byteLength);
    new Uint8Array(arrayBuffer).set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
    body = arrayBuffer;
    contentType = 'application/octet-stream';
    size = view.byteLength;
  } else {
    throw new Error(`Unsupported blob type: ${tag}`);
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
  
  // The server returns the ref with version prefix (e.g., "1:blobId")
  const result = await response.json();
  
  // Return BlobRef with server's ref (includes version) and original type preserved in $t
  return {
    $t: origType,
    ref: result.ref,
    size: size,
    ...(origType === 'Blob' ? { ct: contentType } : {}) // Only include content type for Blobs
  };
}

export async function offloadBlobsAndMarkDirty(
  obj: unknown,
  databaseUrl: string,
  getCachedAccessToken: () => Promise<string | null>
): Promise<unknown> {
  const dirtyFlag = { dirty: false };
  const result = await offloadBlobs(obj, databaseUrl, getCachedAccessToken, dirtyFlag);  
  // Mark the object as dirty for sync if any blobs were offloaded
  if (dirtyFlag.dirty && typeof result === 'object' && result !== null && result.constructor === Object) {
    (result as any).$hasBlobRefs = 1;
  }
  
  return result;
}

/**
 * Recursively scan an object for large blobs and upload them
 * Returns a new object with blobs replaced by BlobRefs
 */
export async function offloadBlobs(
  obj: unknown,
  databaseUrl: string,
  getCachedAccessToken: () => Promise<string | null>,
  dirtyFlag = { dirty: false },
  visited = new WeakSet()
): Promise<unknown> {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Check if this is a blob that should be offloaded
  if (shouldOffloadBlob(obj)) {
    dirtyFlag.dirty = true;
    return uploadBlob(databaseUrl, getCachedAccessToken, obj);
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Avoid circular references - check BEFORE processing
  if (visited.has(obj)) {
    return obj;
  }
  visited.add(obj);
  
  // Handle arrays
  if (Array.isArray(obj)) {
    const result: unknown[] = [];
    for (const item of obj) {
      result.push(await offloadBlobs(item, databaseUrl, getCachedAccessToken, dirtyFlag, visited));
    }
    return result;
  }
    
  // Traverse plain objects (POJO-like) - use prototype check since IndexedDB
  // may return objects where constructor !== Object
  const proto = Object.getPrototypeOf(obj);
  if (proto !== Object.prototype && proto !== null) {
    return obj;
  }
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = await offloadBlobs(value, databaseUrl, getCachedAccessToken, dirtyFlag, visited);
  }
  return result;
}

/**
 * Process a DBOperationsSet and offload any large blobs
 * Returns a new DBOperationsSet with blobs replaced by BlobRefs
 */
export async function offloadBlobsInOperations(
  operations: DBOperationsSet,
  databaseUrl: string,
  getCachedAccessToken: () => Promise<string | null>
): Promise<DBOperationsSet> {
  const result: DBOperationsSet = [];
  
  for (const tableOps of operations) {
    const processedMuts: DBOperation[] = [];
    
    for (const mut of tableOps.muts) {
      const processedMut = await offloadBlobsInOperation(mut, databaseUrl, getCachedAccessToken);
      processedMuts.push(processedMut);
    }
    
    result.push({
      table: tableOps.table,
      muts: processedMuts,
    });
  }
  
  return result;
}

async function offloadBlobsInOperation(
  op: DBOperation,
  databaseUrl: string,
  getCachedAccessToken: ()=> Promise<string | null>
): Promise<DBOperation> {
  switch (op.type) {
    case 'insert':
    case 'upsert': {
      const processedValues = await Promise.all(
        op.values.map(value => offloadBlobsAndMarkDirty(value, databaseUrl, getCachedAccessToken))
      );
      return {
        ...op,
        values: processedValues,
      };
    }
    
    case 'update': {
      const processedChangeSpecs = await Promise.all(
        op.changeSpecs.map(spec => offloadBlobsAndMarkDirty(spec, databaseUrl, getCachedAccessToken))
      );
      return {
        ...op,
        changeSpecs: processedChangeSpecs as { [keyPath: string]: any }[],
      };
    }
    
    case 'modify': {
      const processedChangeSpec = await offloadBlobsAndMarkDirty(op.changeSpec, databaseUrl, getCachedAccessToken);
      return {
        ...op,
        changeSpec: processedChangeSpec as { [keyPath: string]: any },
      };
    }
    
    case 'delete':
      // No blobs in delete operations
      return op;
    
    default:
      return op;
  }
}

/**
 * Check if there are any large blobs in the operations that need offloading
 * This is a quick check to avoid unnecessary processing
 */
export function hasLargeBlobsInOperations(operations: DBOperationsSet): boolean {
  for (const tableOps of operations) {
    for (const mut of tableOps.muts) {
      if (hasLargeBlobsInOperation(mut)) {
        return true;
      }
    }
  }
  return false;
}

function hasLargeBlobsInOperation(op: DBOperation): boolean {
  switch (op.type) {
    case 'insert':
    case 'upsert':
      return op.values.some(value => hasLargeBlobs(value));
    case 'update':
      return op.changeSpecs.some(spec => hasLargeBlobs(spec));
    case 'modify':
      return hasLargeBlobs(op.changeSpec);
    default:
      return false;
  }
}

function hasLargeBlobs(obj: unknown, visited = new WeakSet()): boolean {
  if (obj === null || obj === undefined) {
    return false;
  }
  
  if (shouldOffloadBlob(obj)) {
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
  
  if (Array.isArray(obj)) {
    return obj.some(item => hasLargeBlobs(item, visited));
  }
  
  // Traverse plain objects (POJO-like) - use duck typing since IndexedDB
  // may return objects where constructor !== Object
  const proto = Object.getPrototypeOf(obj);
  if (proto === Object.prototype || proto === null) {
    return Object.values(obj).some(value => hasLargeBlobs(value, visited));
  }
  
  return false;
}
