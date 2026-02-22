import { 
  TypesonSimplified, 
  undefinedTypeDef,
  blobTypeDef,
  typedArrayBlobRefDefs,
  arrayBufferBlobRefDef,
  blobBlobRefDef,
  TSONRef,
  TypeDefSet,
  fileTypeDef,
  dateTypeDef,
  setTypeDef,
  mapTypeDef,
  numberTypeDef,
  b64decode,
} from 'dexie-cloud-common';
import { PropModSpec, PropModification } from 'dexie';

/**
 * Hybrid Blob type definition for client-side TSON.
 * - replace: Use original blobTypeDef to serialize Blobs inline as base64
 * - revive: Handle both inline data (v) AND blob references (ref)
 */
const hybridBlobDef = {
  Blob: {
    // Use original test from blobTypeDef
    test: blobTypeDef.Blob.test,
    // Use original replace for inline serialization
    replace: blobTypeDef.Blob.replace,
    // Custom revive that handles both inline and references
    revive: (
      val: { v?: string; ref?: string; size?: number; ct?: string; type?: string },
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
        const buf = ba.buffer.byteLength === ba.byteLength
          ? (ba.buffer as ArrayBuffer)
          : (ba.buffer as ArrayBuffer).slice(ba.byteOffset, ba.byteOffset + ba.byteLength);
        return new Blob([new Uint8Array(buf)], { type: val.type || val.ct || '' });
      }

      throw new Error('Invalid Blob encoding: missing v or ref');
    },
  },
};

// Since server revisions are stored in bigints, we need to handle clients without
// bigint support to not fail when serverRevision is passed over to client.
// We need to not fail when reviving it and we need to somehow store the information.
// Since the revived version will later on be put into indexedDB we have another
// issue: When reading it back from indexedDB we will get a poco object that we
// cannot replace correctly when sending it to server. So we will also need
// to do an explicit workaround in the protocol where a bigint is supported.
// The workaround should be there regardless if browser supports BigInt or not, because
// the serverRev might have been stored in IDB before the browser was upgraded to support bigint.
//
// if (typeof serverRev.rev !== "bigint")
//   if (hasBigIntSupport)
//     serverRev.rev = bigIntDef.bigint.revive(server.rev)
//   else
//     serverRev.rev = new FakeBigInt(server.rev)
export const hasBigIntSupport =
  typeof BigInt === 'function' && typeof BigInt(0) === 'bigint';

function getValueOfBigInt(x: bigint | FakeBigInt | string) {
  if (typeof x === 'bigint') {
    return x;
  }
  if (hasBigIntSupport) {
    return typeof x === 'string' ? BigInt(x) : BigInt(x.v);
  } else {
    return typeof x === 'string' ? Number(x) : Number(x.v);
  }
}

export function compareBigInts(
  a: bigint | FakeBigInt | string,
  b: bigint | FakeBigInt | string
) {
  const valA = getValueOfBigInt(a);
  const valB = getValueOfBigInt(b);
  return valA < valB ? -1 : valA > valB ? 1 : 0;
}
export class FakeBigInt {
  v: string;
  toString() {
    return this.v;
  }
  constructor(value: string) {
    this.v = value;
  }
}

const bigIntDef = hasBigIntSupport
  ? {}
  : {
      bigint: {
        test: (val: any) => val instanceof FakeBigInt,
        replace: (fakeBigInt: any) => {
          return {
            $t: 'bigint',
            ...fakeBigInt,
          };
        },
        revive: ({ v }: { $t: 'bigint'; v: string }) =>
          new FakeBigInt(v) as any as bigint,
      },
    };

const defs: TypeDefSet = {
  ...undefinedTypeDef,
  ...bigIntDef,
  ...fileTypeDef,
  PropModification: {
    test: (val: any) => val instanceof PropModification,
    replace: (propModification: any) => {
      return {
        $t: 'PropModification',
        ...propModification['@@propmod'],
      };
    },
    revive: ({
      $t, // strip '$t'
      ...propModSpec // keep the rest
    }: {
      $t: 'PropModification';
    } & PropModSpec) => new PropModification(propModSpec),
  },
};

export const TSON = TypesonSimplified(
  // Use blob-ref-aware type definitions for TypedArrays and ArrayBuffer
  // These handle both inline data (v property) and blob references (ref property)
  typedArrayBlobRefDefs,
  arrayBufferBlobRefDef,
  // Use hybrid Blob handler: original serialization + ref-aware deserialization
  hybridBlobDef,
  // Include non-binary built-in types
  numberTypeDef,
  dateTypeDef,
  setTypeDef,
  mapTypeDef,
  // Custom type definitions
  defs
);
