// Unit test for shouldOffloadBlob behavior
// Verifies: Blob/File always offloaded; ArrayBuffer/TypedArray use 4KB threshold

import { shouldOffloadBlob } from '../../src/sync/blobOffloading';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error('FAIL: ' + msg);
  console.log('OK: ' + msg);
}

// Blob - always offloaded regardless of size
assert(shouldOffloadBlob(new Blob([])), 'empty Blob (0 bytes) is offloaded');
assert(shouldOffloadBlob(new Blob(['x'])), '1-byte Blob is offloaded');
assert(shouldOffloadBlob(new Blob([new Uint8Array(1024)])), '1KB Blob is offloaded');
assert(shouldOffloadBlob(new Blob([new Uint8Array(8192)])), '8KB Blob is offloaded');

// File - always offloaded
assert(shouldOffloadBlob(new File(['x'], 'test.txt')), '1-byte File is offloaded');

// ArrayBuffer - threshold at 4096
assert(!shouldOffloadBlob(new ArrayBuffer(1)), '1-byte ArrayBuffer is NOT offloaded');
assert(!shouldOffloadBlob(new ArrayBuffer(4095)), '4095-byte ArrayBuffer is NOT offloaded');
assert(shouldOffloadBlob(new ArrayBuffer(4096)), '4096-byte ArrayBuffer IS offloaded');
assert(shouldOffloadBlob(new ArrayBuffer(8192)), '8KB ArrayBuffer IS offloaded');

// Uint8Array - threshold at 4096
assert(!shouldOffloadBlob(new Uint8Array(1)), '1-byte Uint8Array is NOT offloaded');
assert(shouldOffloadBlob(new Uint8Array(4096)), '4096-byte Uint8Array IS offloaded');

// Primitives - never offloaded
assert(!shouldOffloadBlob(null), 'null is not offloaded');
assert(!shouldOffloadBlob('string'), 'string is not offloaded');
assert(!shouldOffloadBlob(42), 'number is not offloaded');
assert(!shouldOffloadBlob({}), 'plain object is not offloaded');

console.log('\nAll tests passed!');
