// Implementation of https://www.w3.org/TR/IndexedDB-3/#compare-two-keys

import { toStringTag } from './utils';

// ... with the adjustment to return NaN instead of throwing.
export function cmp(a: any, b: any): number {
  try {
    const ta = type(a);
    const tb = type(b);
    if (ta !== tb) {
      if (ta === 'Array') return 1;
      if (tb === 'Array') return -1;
      if (ta === 'binary') return 1;
      if (tb === 'binary') return -1;
      if (ta === 'string') return 1;
      if (tb === 'string') return -1;
      if (ta === 'Date') return 1;
      if (tb !== 'Date') return NaN;
      return -1;
    }
    switch (ta) {
      case 'number':
      case 'Date':
      case 'string':
        return a > b ? 1 : a < b ? -1 : 0;
      case 'binary': {
        return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
      }
      case 'Array':
        return compareArrays(a, b);
    }
  } catch {}
  return NaN; // Return value if any given args are valid keys.
}

export function compareArrays(a: any[], b: any[]): number {
  const al = a.length;
  const bl = b.length;
  const l = al < bl ? al : bl;
  for (let i = 0; i < l; ++i) {
    const res = cmp(a[i], b[i]);
    if (res !== 0) return res;
  }
  return al === bl ? 0 : al < bl ? -1 : 1;
}

export function compareUint8Arrays(
  a: Uint8Array,
  b: Uint8Array
) {
  const al = a.length;
  const bl = b.length;
  const l = al < bl ? al : bl;
  for (let i = 0; i < l; ++i) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return al === bl ? 0 : al < bl ? -1 : 1;
}

// Implementation of https://www.w3.org/TR/IndexedDB-3/#key-type
function type(x: any) {
  const t = typeof x;
  if (t !== 'object') return t;
  if (ArrayBuffer.isView(x)) return 'binary';
  const tsTag = toStringTag(x); // Cannot use instanceof in Safari
  return tsTag === 'ArrayBuffer' ? 'binary' : (tsTag as 'Array' | 'Date');
}

type BinaryType =
  | ArrayBuffer
  | DataView
  | Uint8ClampedArray
  | ArrayBufferView
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array;

function getUint8Array(a: BinaryType): Uint8Array {
  if (a instanceof Uint8Array) return a;
  if (ArrayBuffer.isView(a))
    // TypedArray or DataView
    return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  return new Uint8Array(a); // ArrayBuffer
}
