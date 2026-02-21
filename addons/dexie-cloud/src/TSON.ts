import { 
  TypesonSimplified, 
  undefinedTypeDef,
  builtInTypeDefs,
  TypeDefSet,
  fileTypeDef
} from 'dexie-cloud-common';
import { PropModSpec, PropModification } from 'dexie';

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

/**
 * BlobRef-aware type definitions for binary types.
 * 
 * When server sends BlobRefs ({$t, ref, size}) instead of inline data ({$t, v}),
 * we preserve the BlobRef as a POJO for later lazy/eager resolution.
 * This is critical for blob offloading to work across sync.
 */
const blobRefAwareTypeDefs: TypeDefSet = {
  // Override ArrayBuffer to handle BlobRefs
  ArrayBuffer: {
    replace: builtInTypeDefs.ArrayBuffer!.replace,
    revive: (val: { v?: string; ref?: string; size?: number; $t?: string }, ctx: any, typeDefs: any) => {
      // If this is a BlobRef, preserve it as-is for later resolution
      if (val.ref !== undefined) {
        return val as any; // Return BlobRef POJO
      }
      // Otherwise use standard inline revive
      return builtInTypeDefs.ArrayBuffer!.revive(val as any, ctx, typeDefs);
    },
  },
  // Override Blob to handle BlobRefs
  Blob: {
    ...builtInTypeDefs.Blob!,
    revive: (val: { v?: string; ref?: string; size?: number; ct?: string; $t?: string }, ctx: any, typeDefs: any) => {
      if (val.ref !== undefined) {
        return val as any; // Return BlobRef POJO
      }
      return builtInTypeDefs.Blob!.revive(val as any, ctx, typeDefs);
    },
  },
};

// Override TypedArray types to handle BlobRefs
const typedArrayNames = [
  'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
  'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array',
  'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array',
  'DataView'
];

for (const name of typedArrayNames) {
  const typeDef = builtInTypeDefs[name];
  if (typeDef) {
    blobRefAwareTypeDefs[name] = {
      ...typeDef,
      revive: (val: { v?: string; ref?: string; size?: number; $t?: string }, ctx: any, typeDefs: any) => {
        if (val.ref !== undefined) {
          return val as any; // Return BlobRef POJO
        }
        return typeDef.revive(val as any, ctx, typeDefs);
      },
    };
  }
}

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

// Use BlobRef-aware typedefs to handle both inline data and BlobRefs from server
export const TSON = TypesonSimplified(builtInTypeDefs, blobRefAwareTypeDefs, defs);
