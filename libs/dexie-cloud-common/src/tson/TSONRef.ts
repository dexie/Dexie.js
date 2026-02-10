/**
 * TSONRef - Reference to a blob stored separately from the main data.
 *
 * When TSON parses data containing blob references, it creates TSONRef
 * instances instead of the actual binary data. The client can then
 * resolve these refs asynchronously.
 *
 * @example
 * ```typescript
 * // Configure resolver
 * TSONRef.resolver = async (ref) => {
 *   const response = await fetch(`/blob/${ref.ref}`);
 *   return response.arrayBuffer();
 * };
 *
 * // After parsing, resolve all refs in an object
 * await resolveAllRefs(data);
 * ```
 */

/** Serialized format of a blob reference */
export interface TSONRefData {
  /** Type marker */
  $t: string;
  /** Blob reference ID */
  $ref: string;
  /** Size in bytes */
  $size: number;
  /** Content-Type (for Blob type) */
  $ct?: string;
}

/** Function type for resolving blob refs */
export type TSONRefResolver = (ref: TSONRef) => Promise<ArrayBuffer>;

/** Symbol for type checking TSONRef instances */
const TSON_REF_SYMBOL = Symbol.for('TSONRef');

/**
 * TSONRef represents a reference to binary data stored as a blob.
 */
export class TSONRef<T extends ArrayBuffer | Blob | Uint8Array = ArrayBuffer> {
  /** Symbol for type checking */
  static readonly TYPE_SYMBOL = TSON_REF_SYMBOL;

  /** Type brand for runtime identification */
  readonly [TSON_REF_SYMBOL] = true;

  /** Global resolver function - must be configured before resolving */
  static resolver: TSONRefResolver | null = null;

  constructor(
    /** Original TSON type: 'ArrayBuffer', 'Blob', 'Uint8Array', etc */
    public readonly type: string,
    /** Blob reference ID (UUID) */
    public readonly ref: string,
    /** Size in bytes */
    public readonly size: number,
    /** Content-Type (for Blob type) */
    public readonly contentType?: string
  ) {
    Object.freeze(this);
  }

  /**
   * Resolve this reference to actual data.
   * Requires TSONRef.resolver to be configured.
   */
  async resolve(): Promise<T> {
    if (!TSONRef.resolver) {
      throw new Error(
        'TSONRef.resolver not configured. ' +
          'Set TSONRef.resolver to a function that fetches blobs.'
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await TSONRef.resolver(this as any);
    return this.reconstruct(data) as T;
  }

  /**
   * Reconstruct the original type from ArrayBuffer.
   * Validates byte alignment for TypedArrays that require it.
   */
  reconstruct(data: ArrayBuffer): ArrayBuffer | Blob | Uint8Array {
    // Helper to validate alignment for multi-byte TypedArrays
    const validateAlignment = (bytesPerElement: number, typeName: string) => {
      if (data.byteLength % bytesPerElement !== 0) {
        throw new RangeError(
          `Buffer length ${data.byteLength} is not aligned to ${bytesPerElement} bytes for ${typeName}`
        );
      }
    };

    switch (this.type) {
      case 'ArrayBuffer':
        return data;

      case 'Uint8Array':
        return new Uint8Array(data);

      case 'Blob':
        return new Blob([data], { type: this.contentType });

      // Handle other TypedArrays with alignment validation
      case 'Int8Array':
        return new Int8Array(data) as unknown as Uint8Array;
      case 'Uint8ClampedArray':
        return new Uint8ClampedArray(data) as unknown as Uint8Array;
      case 'Int16Array':
        validateAlignment(2, 'Int16Array');
        return new Int16Array(data) as unknown as Uint8Array;
      case 'Uint16Array':
        validateAlignment(2, 'Uint16Array');
        return new Uint16Array(data) as unknown as Uint8Array;
      case 'Int32Array':
        validateAlignment(4, 'Int32Array');
        return new Int32Array(data) as unknown as Uint8Array;
      case 'Uint32Array':
        validateAlignment(4, 'Uint32Array');
        return new Uint32Array(data) as unknown as Uint8Array;
      case 'Float32Array':
        validateAlignment(4, 'Float32Array');
        return new Float32Array(data) as unknown as Uint8Array;
      case 'Float64Array':
        validateAlignment(8, 'Float64Array');
        return new Float64Array(data) as unknown as Uint8Array;
      case 'BigInt64Array':
        validateAlignment(8, 'BigInt64Array');
        return new BigInt64Array(data) as unknown as Uint8Array;
      case 'BigUint64Array':
        validateAlignment(8, 'BigUint64Array');
        return new BigUint64Array(data) as unknown as Uint8Array;

      default:
        console.warn(`Unknown TSONRef type: ${this.type}, returning ArrayBuffer`);
        return data;
    }
  }

  /**
   * Check if a value is a TSONRef instance.
   */
  static isTSONRef(value: unknown): value is TSONRef {
    return (
      value !== null &&
      typeof value === 'object' &&
      TSON_REF_SYMBOL in value &&
      (value as Record<symbol, unknown>)[TSON_REF_SYMBOL] === true
    );
  }

  /**
   * Check if a value is TSONRef serialized data (has $ref).
   */
  static isTSONRefData(value: unknown): value is TSONRefData {
    return (
      value !== null &&
      typeof value === 'object' &&
      '$ref' in value &&
      '$t' in value &&
      '$size' in value
    );
  }

  /**
   * Create TSONRef from serialized data.
   */
  static fromData(data: TSONRefData): TSONRef {
    return new TSONRef(data.$t, data.$ref, data.$size, data.$ct);
  }

  /**
   * Serialize to JSON-compatible format.
   */
  toJSON(): TSONRefData {
    const result: TSONRefData = {
      $t: this.type,
      $ref: this.ref,
      $size: this.size,
    };
    if (this.contentType) {
      result.$ct = this.contentType;
    }
    return result;
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Check if an object tree contains any TSONRef instances.
 */
export function hasTSONRefs(obj: unknown): boolean {
  if (obj === null || obj === undefined) return false;
  if (TSONRef.isTSONRef(obj) || TSONRef.isTSONRefData(obj)) return true;

  if (Array.isArray(obj)) {
    return obj.some(hasTSONRefs);
  }

  if (typeof obj === 'object') {
    return Object.values(obj).some(hasTSONRefs);
  }

  return false;
}

/**
 * Collect all TSONRef instances from an object tree.
 */
export function collectTSONRefs(obj: unknown, refs: TSONRef[] = []): TSONRef[] {
  if (obj === null || obj === undefined) return refs;

  if (TSONRef.isTSONRef(obj)) {
    refs.push(obj);
    return refs;
  }

  if (TSONRef.isTSONRefData(obj)) {
    refs.push(TSONRef.fromData(obj));
    return refs;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectTSONRefs(item, refs);
    }
    return refs;
  }

  if (typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      collectTSONRefs(value, refs);
    }
  }

  return refs;
}

/**
 * Replace TSONRef instances with resolved data in-place.
 * 
 * Note: If the root object itself is a TSONRef, it cannot be replaced in-place.
 * In that case, use the returned value instead.
 *
 * @param obj - Object tree to process
 * @param resolver - Function to fetch blob data
 * @param concurrency - Max concurrent fetches (default 5)
 * @returns The resolved value if root is a TSONRef, otherwise undefined
 */
export async function replaceTSONRefs(
  obj: unknown,
  resolver: TSONRefResolver,
  concurrency = 5
): Promise<ArrayBuffer | Blob | Uint8Array | undefined> {
  const refs = collectTSONRefs(obj);
  if (refs.length === 0) return undefined;

  // Fetch all unique refs with concurrency limit
  const resolved = new Map<string, ArrayBuffer>();
  const uniqueRefs = [...new Map(refs.map((r) => [r.ref, r])).values()];

  for (let i = 0; i < uniqueRefs.length; i += concurrency) {
    const batch = uniqueRefs.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (ref) => {
        const data = await resolver(ref);
        resolved.set(ref.ref, data);
      })
    );
  }

  // Handle root-level TSONRef - cannot replace in-place, return resolved value
  if (TSONRef.isTSONRef(obj)) {
    const data = resolved.get(obj.ref);
    return data ? obj.reconstruct(data) : undefined;
  }
  if (TSONRef.isTSONRefData(obj)) {
    const ref = TSONRef.fromData(obj);
    const data = resolved.get(ref.ref);
    return data ? ref.reconstruct(data) : undefined;
  }

  // Replace refs with resolved data in nested objects
  replaceRefsInPlace(obj, resolved);
  return undefined;
}

function replaceRefsInPlace(
  obj: unknown,
  resolved: Map<string, ArrayBuffer>,
  parent?: Record<string, unknown> | unknown[],
  key?: string | number
): void {
  if (obj === null || obj === undefined) return;

  // Handle TSONRef instance
  if (TSONRef.isTSONRef(obj)) {
    const data = resolved.get(obj.ref);
    if (data && parent !== undefined && key !== undefined) {
      (parent as Record<string | number, unknown>)[key] = obj.reconstruct(data);
    }
    return;
  }

  // Handle serialized $ref format
  if (TSONRef.isTSONRefData(obj)) {
    const ref = TSONRef.fromData(obj);
    const data = resolved.get(ref.ref);
    if (data && parent !== undefined && key !== undefined) {
      (parent as Record<string | number, unknown>)[key] = ref.reconstruct(data);
    }
    return;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      replaceRefsInPlace(obj[i], resolved, obj, i);
    }
    return;
  }

  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      replaceRefsInPlace(
        (obj as Record<string, unknown>)[k],
        resolved,
        obj as Record<string, unknown>,
        k
      );
    }
  }
}

/**
 * Resolve all TSONRef instances in an object tree.
 * Convenience function that uses TSONRef.resolver.
 */
export async function resolveAllRefs(obj: unknown, concurrency = 5): Promise<void> {
  if (!TSONRef.resolver) {
    throw new Error('TSONRef.resolver not configured');
  }
  await replaceTSONRefs(obj, TSONRef.resolver, concurrency);
}
