/**
 * Blob Reference Type Definitions
 *
 * These type definitions enable automatic blob offloading for large binary data.
 * Data >= BLOB_THRESHOLD is stored separately and replaced with a reference.
 *
 * Usage:
 * ```typescript
 * import { TypesonSimplified } from '../TypesonSimplified.js';
 * import { blobRefTypeDefs, createBlobRefContext } from './BlobRef.js';
 *
 * const tson = TypesonSimplified(blobRefTypeDefs);
 *
 * // Server-side: serialize with blob offloading
 * const context = createBlobRefContext(blobStore);
 * const json = tson.stringify(data, context);
 *
 * // Client-side: parse (creates TSONRef for large data)
 * const parsed = tson.parse(json);
 * await resolveAllRefs(parsed); // Fetch and replace refs
 * ```
 */

import { b64LexDecode, b64LexEncode } from '../../common/b64lex.js';
import { b64decode } from '../../common/base64.js';
import { TSONRef, TSONRefData } from '../TSONRef.js';
import type { TypeDefSet } from '../TypeDefSet.js';

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

/**
 * Helper to check if we should use blob ref for this data.
 */
function shouldUseBlobRef(
  byteLength: number,
  context: BlobRefContext | undefined
): boolean {
  if (!context?.blobStore) return false;
  if (context.forceInline) return false;
  const threshold = context.threshold ?? BLOB_THRESHOLD;
  return byteLength >= threshold;
}

// ============================================================
// ArrayBuffer with blob ref support
// ============================================================

export const arrayBufferBlobRefDef = {
  ArrayBuffer: {
    replace: (ab: ArrayBuffer, ctx: BlobRefContext | undefined) => {
      if (shouldUseBlobRef(ab.byteLength, ctx)) {
        const blobId = ctx!.blobStore!.store(ab);
        // Handle both sync and async store
        if (typeof blobId === 'string') {
          return { $t: 'ArrayBuffer', ref: blobId, size: ab.byteLength };
        }
        // For async, we need to await - but replace is sync!
        // This means blobStore.store() must be sync for serialization.
        // Alternatively, use a two-pass approach.
        throw new Error(
          'BlobStore.store() must be synchronous during serialization. ' +
            'Pre-store blobs before calling stringify().'
        );
      }

      // Check maxInlineSize if forceInline
      if (ctx?.forceInline && ctx.maxInlineSize != null && ab.byteLength > ctx.maxInlineSize) {
        throw new Error(
          `ArrayBuffer size ${ab.byteLength} exceeds maxInlineSize ${ctx.maxInlineSize}`
        );
      }

      return { $t: 'ArrayBuffer', v: b64LexEncode(ab) };
    },

    revive: (
      val: { v?: string; ref?: string; size?: number },
      _ctx: unknown,
      _typeDefs: TypeDefSet
    ): ArrayBuffer => {
      // Blob reference - return TSONRef for lazy resolution
      // TSONRef is cast to ArrayBuffer since it's a stand-in that will be resolved later
      if (val.ref) {
        return new TSONRef<ArrayBuffer>(
          'ArrayBuffer',
          val.ref,
          val.size ?? 0
        ) as unknown as ArrayBuffer;
      }

      // Inline data
      if (val.v) {
        const ba = b64LexDecode(val.v);
        return ba.buffer.byteLength === ba.byteLength
          ? (ba.buffer as ArrayBuffer)
          : (ba.buffer as ArrayBuffer).slice(ba.byteOffset, ba.byteOffset + ba.byteLength);
      }

      throw new Error('Invalid ArrayBuffer encoding: missing v or ref');
    },
  },
};

// ============================================================
// Blob with blob ref support
// ============================================================

export const blobBlobRefDef = {
  Blob: {
    test: (val: unknown, toStringTag: string) =>
      toStringTag === 'Blob' || toStringTag === 'File',

    replace: (blob: Blob, ctx: BlobRefContext | undefined) => {
      // We can't read Blob content synchronously, so for serialization
      // the Blob must be pre-converted to ArrayBuffer and stored.
      // This type def handles the reference format.
      throw new Error(
        'Cannot serialize Blob directly. Convert to ArrayBuffer first, or ' +
          'pre-store the blob and replace with TSONRef before serialization.'
      );
    },

    revive: (
      val: { v?: string; ref?: string; size?: number; ct?: string },
      _ctx: unknown,
      _typeDefs: TypeDefSet
    ): Blob => {
      // Blob reference - return TSONRef cast to Blob for lazy resolution
      if (val.ref) {
        return new TSONRef<Blob>(
          'Blob',
          val.ref,
          val.size ?? 0,
          val.ct
        ) as unknown as Blob;
      }

      // Inline data - use normal base64 (not b64Lex) since Blobs are never indexed
      if (val.v) {
        const ba = b64decode(val.v);
        return new Blob([new Uint8Array(ba.buffer as ArrayBuffer, ba.byteOffset, ba.byteLength)], { type: val.ct });
      }

      throw new Error('Invalid Blob encoding: missing v or ref');
    },
  },
};

// ============================================================
// TypedArrays with blob ref support
// ============================================================

type TypedArrayConstructor =
  | typeof Int8Array
  | typeof Uint8Array
  | typeof Uint8ClampedArray
  | typeof Int16Array
  | typeof Uint16Array
  | typeof Int32Array
  | typeof Uint32Array
  | typeof Float32Array
  | typeof Float64Array
  | typeof BigInt64Array
  | typeof BigUint64Array;

const typedArrayTypes: Array<[string, TypedArrayConstructor]> = [
  ['Int8Array', Int8Array],
  ['Uint8Array', Uint8Array],
  ['Uint8ClampedArray', Uint8ClampedArray],
  ['Int16Array', Int16Array],
  ['Uint16Array', Uint16Array],
  ['Int32Array', Int32Array],
  ['Uint32Array', Uint32Array],
  ['Float32Array', Float32Array],
  ['Float64Array', Float64Array],
  ['BigInt64Array', BigInt64Array],
  ['BigUint64Array', BigUint64Array],
];

function createTypedArrayBlobRefDef(
  name: string,
  Ctor: TypedArrayConstructor
): Record<string, unknown> {
  return {
    [name]: {
      replace: (arr: InstanceType<TypedArrayConstructor>, ctx: BlobRefContext | undefined) => {
        const buffer =
          arr.buffer.byteLength === arr.byteLength
            ? (arr.buffer as ArrayBuffer)
            : (arr.buffer as ArrayBuffer).slice(arr.byteOffset, arr.byteOffset + arr.byteLength);

        if (shouldUseBlobRef(buffer.byteLength, ctx)) {
          const blobId = ctx!.blobStore!.store(buffer);
          if (typeof blobId === 'string') {
            return { $t: name, ref: blobId, size: buffer.byteLength };
          }
          throw new Error('BlobStore.store() must be synchronous');
        }

        if (ctx?.forceInline && ctx.maxInlineSize != null && buffer.byteLength > ctx.maxInlineSize) {
          throw new Error(
            `${name} size ${buffer.byteLength} exceeds maxInlineSize ${ctx.maxInlineSize}`
          );
        }

        return { $t: name, v: b64LexEncode(buffer) };
      },

      revive: (
        val: { v?: string; ref?: string; size?: number },
        _ctx: unknown,
        _typeDefs: TypeDefSet
      ): InstanceType<TypedArrayConstructor> => {
        // TSONRef is cast to TypedArray since it's a stand-in for lazy resolution
        if (val.ref) {
          return new TSONRef(name, val.ref, val.size ?? 0) as unknown as InstanceType<TypedArrayConstructor>;
        }

        if (val.v) {
          const ba = b64LexDecode(val.v);
          return new Ctor(
            ba.buffer as ArrayBuffer,
            ba.byteOffset,
            ba.byteLength / Ctor.BYTES_PER_ELEMENT
          );
        }

        throw new Error(`Invalid ${name} encoding: missing v or ref`);
      },
    },
  };
}

export const typedArrayBlobRefDefs = typedArrayTypes.reduce(
  (acc, [name, Ctor]) => ({ ...acc, ...createTypedArrayBlobRefDef(name, Ctor) }),
  {}
);

// ============================================================
// Combined export
// ============================================================

/**
 * All blob-ref-aware type definitions.
 * Use this with TypesonSimplified for blob offloading support.
 */
export const blobRefTypeDefs = {
  ...arrayBufferBlobRefDef,
  ...blobBlobRefDef,
  ...typedArrayBlobRefDefs,
};

export default blobRefTypeDefs;
