import { b64encode, b64decode } from '../../common/base64';
import { b64LexEncode, b64LexDecode } from '../../common/b64lex';
import { buf2bigint, bigint2Buf, bigint2B64, b64ToBigInt } from '../../common/bigint-conversion';

describe('base64', () => {
  describe('b64encode/b64decode', () => {
    test('round-trips empty buffer', () => {
      const input = new Uint8Array(0);
      const encoded = b64encode(input);
      const decoded = b64decode(encoded);
      expect(decoded.length).toBe(0);
    });

    test('round-trips simple data', () => {
      const input = new Uint8Array([1, 2, 3, 4, 5]);
      const encoded = b64encode(input);
      const decoded = b64decode(encoded);
      expect(Array.from(decoded)).toEqual([1, 2, 3, 4, 5]);
    });

    test('round-trips all byte values', () => {
      const input = new Uint8Array(256);
      for (let i = 0; i < 256; i++) input[i] = i;
      const encoded = b64encode(input);
      const decoded = b64decode(encoded);
      expect(Array.from(decoded)).toEqual(Array.from(input));
    });

    test('handles ArrayBuffer input', () => {
      const buffer = new ArrayBuffer(4);
      const view = new Uint8Array(buffer);
      view.set([10, 20, 30, 40]);
      const encoded = b64encode(buffer);
      const decoded = b64decode(encoded);
      expect(Array.from(decoded)).toEqual([10, 20, 30, 40]);
    });
  });
});

describe('b64lex', () => {
  describe('b64LexEncode/b64LexDecode', () => {
    test('round-trips empty buffer', () => {
      const input = new Uint8Array(0);
      const encoded = b64LexEncode(input);
      const decoded = b64LexDecode(encoded);
      expect(decoded.length).toBe(0);
    });

    test('round-trips simple data', () => {
      const input = new Uint8Array([1, 2, 3, 4, 5]);
      const encoded = b64LexEncode(input);
      const decoded = b64LexDecode(encoded);
      expect(Array.from(decoded)).toEqual([1, 2, 3, 4, 5]);
    });

    test('produces lexicographically sortable output', () => {
      // Lower values should produce lexicographically smaller strings
      const small = new Uint8Array([0, 0, 0, 1]);
      const large = new Uint8Array([0, 0, 0, 2]);
      const smallEncoded = b64LexEncode(small);
      const largeEncoded = b64LexEncode(large);
      expect(smallEncoded < largeEncoded).toBe(true);
    });

    test('larger buffers sort after smaller with same prefix', () => {
      const short = new Uint8Array([1, 2, 3]);
      const long = new Uint8Array([1, 2, 3, 4]);
      const shortEncoded = b64LexEncode(short);
      const longEncoded = b64LexEncode(long);
      // With b64lex, longer should come after shorter with same prefix
      expect(shortEncoded < longEncoded).toBe(true);
    });
  });
});

describe('bigint-conversion', () => {
  describe('buf2bigint', () => {
    test('converts empty buffer to 0n', () => {
      const buf = new Uint8Array(0);
      expect(buf2bigint(buf)).toBe(BigInt(0));
    });

    test('converts single byte', () => {
      expect(buf2bigint(new Uint8Array([0]))).toBe(BigInt(0));
      expect(buf2bigint(new Uint8Array([1]))).toBe(BigInt(1));
      expect(buf2bigint(new Uint8Array([255]))).toBe(BigInt(255));
    });

    test('converts multi-byte buffer (big-endian)', () => {
      // 0x0102 = 258
      expect(buf2bigint(new Uint8Array([1, 2]))).toBe(BigInt(258));
      // 0x010203 = 66051
      expect(buf2bigint(new Uint8Array([1, 2, 3]))).toBe(BigInt(66051));
    });

    test('handles ArrayBuffer input', () => {
      const buf = new ArrayBuffer(2);
      new Uint8Array(buf).set([1, 2]);
      expect(buf2bigint(buf)).toBe(BigInt(258));
    });

    test('handles TypedArray views correctly', () => {
      // Even though it's a Uint16Array, we iterate bytes
      const u16 = new Uint16Array([0x0201]); // Little-endian: bytes are [1, 2]
      const result = buf2bigint(u16);
      // Should read bytes [1, 2] → 0x0102 = 258 (big-endian interpretation)
      expect(result).toBe(BigInt(258));
    });
  });

  describe('bigint2Buf', () => {
    test('converts 0n to single zero byte', () => {
      // Note: bigint2Buf(0n) produces [0], not empty array
      // This is because hex representation of 0 is "0" which becomes one byte
      const buf = bigint2Buf(BigInt(0));
      expect(buf.length).toBe(1);
      expect(buf[0]).toBe(0);
    });

    test('converts small values', () => {
      expect(Array.from(bigint2Buf(BigInt(1)))).toEqual([1]);
      expect(Array.from(bigint2Buf(BigInt(255)))).toEqual([255]);
      expect(Array.from(bigint2Buf(BigInt(256)))).toEqual([1, 0]);
    });

    test('converts large values', () => {
      // 0x123456789ABCDEF0
      const bigint = BigInt('0x123456789ABCDEF0');
      const buf = bigint2Buf(bigint);
      expect(buf.length).toBe(8);
      expect(buf[0]).toBe(0x12);
      expect(buf[7]).toBe(0xF0);
    });

    test('throws on negative BigInt', () => {
      expect(() => bigint2Buf(BigInt(-1))).toThrow(TypeError);
    });
  });

  describe('bigint2B64 / b64ToBigInt round-trip', () => {
    test('round-trips zero', () => {
      const bi = BigInt(0);
      expect(b64ToBigInt(bigint2B64(bi))).toBe(bi);
    });

    test('round-trips small values', () => {
      for (const val of [1, 42, 255, 256, 65535]) {
        const bi = BigInt(val);
        expect(b64ToBigInt(bigint2B64(bi))).toBe(bi);
      }
    });

    test('round-trips large values', () => {
      const bi = BigInt('123456789012345678901234567890');
      expect(b64ToBigInt(bigint2B64(bi))).toBe(bi);
    });

    test('round-trips MAX_SAFE_INTEGER + 1', () => {
      const bi = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1);
      expect(b64ToBigInt(bigint2B64(bi))).toBe(bi);
    });
  });
});
