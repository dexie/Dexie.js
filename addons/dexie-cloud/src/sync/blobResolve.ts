import { BlobDownloadTracker } from './BlobDownloadTracker';

/**
 * BlobRef Resolution for Dexie Cloud
 * 
 * Handles lazy resolution of BlobRefs when reading from the database.
 * BlobRefs are symbolic references to blobs stored in blob storage.
 * They get resolved on-demand when the object is read.
 * 
 * The server sends offloaded binary data in the format:
 * { _bt: 'Uint8Array', ref: '1:blobId', size: 1234 }
 * { _bt: 'Blob', ref: '1:blobId', size: 1234, ct: 'image/png' }
 * 
 * The _bt field preserves the original JavaScript type.
 * The ref format is '{version}:{blobId}' where version identifies
 * the storage backend configuration.
 */


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
 * The _bt field contains the original JavaScript type (Uint8Array, Blob, etc.)
 * The presence of 'ref' instead of 'v' indicates this is an offloaded blob.
 */
export interface BlobRef {
  _bt: BlobRefOrigType;
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
 * Check if a value is a BlobRef (offloaded binary data)
 * A BlobRef has _bt (type), ref (blob ID), but no v (inline data)
 */
export function isBlobRef(value: unknown): value is BlobRef {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as any;
  return (
    typeof obj._bt === 'string' &&
    typeof obj.ref === 'string' &&
    obj.v === undefined  // No inline data = it's a reference
  );
}

/**
 * Serialized TSONRef shape (after IndexedDB structured clone).
 * The Symbol is lost but properties remain.
 */
export interface SerializedTSONRef {
  type: string;  // 'Uint8Array', 'Blob', etc.
  ref: string;   // '1:blobId'
  size: number;
  contentType?: string;
}

/**
 * Check if a value is a serialized TSONRef (after IndexedDB storage)
 * Has 'type' instead of '$t', and no Symbol marker
 */
export function isSerializedTSONRef(value: unknown): value is SerializedTSONRef {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as any;
  return (
    typeof obj.type === 'string' &&
    typeof obj.ref === 'string' &&
    typeof obj.size === 'number' &&
    obj._bt === undefined  // Not a raw BlobRef
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
  
  switch (ref._bt) {
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
  resolvedBlobs: ResolvedBlob[] = [],
  currentPath: string = '',
  visited = new WeakMap(),
  tracker: BlobDownloadTracker
): Promise<unknown> {
  if (obj == null) { // null or undefined
    return obj;
  }

  // Check if this is a BlobRef - resolve it and track it
  if (isBlobRef(obj)) {
    const rawData = await tracker.download(obj, dbUrl);
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
      result.push(await resolveAllBlobRefs(obj[i], dbUrl, resolvedBlobs, itemPath, visited, tracker));
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
      // Skip the _hasBlobRefs marker itself
      if (propName === '_hasBlobRefs') {
        continue;
      }
      const propPath = currentPath ? `${currentPath}.${propName}` : propName;
      result[propName] = await resolveAllBlobRefs(value, dbUrl, resolvedBlobs, propPath, visited, tracker);
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
    (obj as any)._hasBlobRefs === 1
  );
}


