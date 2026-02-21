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
 * Get the original type name for a value
 */
function getOrigType(value: Blob | ArrayBuffer | ArrayBufferView): BlobRefOrigType {
  if (value instanceof Blob) return 'Blob';
  if (value instanceof ArrayBuffer) return 'ArrayBuffer';
  // TypedArrays and DataView
  return value.constructor.name as BlobRefOrigType;
}

export function shouldOffloadBlob(value: unknown): value is Blob | ArrayBuffer | ArrayBufferView {
  if (value instanceof Blob) {
    return value.size >= BLOB_OFFLOAD_THRESHOLD;
  }
  if (value instanceof ArrayBuffer) {
    return value.byteLength >= BLOB_OFFLOAD_THRESHOLD;
  }
  if (ArrayBuffer.isView(value)) {
    return value.byteLength >= BLOB_OFFLOAD_THRESHOLD;
  }
  return false;
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
  
  if (blob instanceof Blob) {
    body = blob;
    contentType = blob.type || 'application/octet-stream';
    size = blob.size;
  } else if (blob instanceof ArrayBuffer) {
    body = blob;
    contentType = 'application/octet-stream';
    size = blob.byteLength;
  } else {
    // ArrayBufferView (TypedArray or DataView) - create a proper ArrayBuffer copy
    const arrayBuffer = new ArrayBuffer(blob.byteLength);
    new Uint8Array(arrayBuffer).set(new Uint8Array(blob.buffer, blob.byteOffset, blob.byteLength));
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
  
  // The server returns the canonical URL but we only store the blobId since the URL can be reconstructed and we want to avoid storing the databaseUrl in the BlobRef
  await response.json();
  
  // Return BlobRef with original type preserved in $t
  return {
    $t: origType,
    ref: blobId,
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
    
  // Only traverse POJOs
  if (obj.constructor !== Object) {
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
  
  // Only traverse POJOs
  if (obj.constructor === Object) {
    return Object.values(obj).some(value => hasLargeBlobs(value, visited));
  }
  
  return false;
}
