import { TypesonSimplified } from '../TypesonSimplified';
import { builtInTypeDefs } from '../presets/builtin';

describe('TypesonSimplified', () => {
  const TSON = TypesonSimplified({ ...builtInTypeDefs });

  describe('primitive types', () => {
    test('handles strings', () => {
      const input = 'hello world';
      const json = TSON.stringify(input);
      expect(TSON.parse(json)).toBe(input);
    });

    test('handles numbers', () => {
      expect(TSON.parse(TSON.stringify(42))).toBe(42);
      expect(TSON.parse(TSON.stringify(3.14159))).toBe(3.14159);
      // Note: -0 becomes 0 in JSON (standard JSON limitation)
      expect(TSON.parse(TSON.stringify(Infinity))).toBe(Infinity);
      expect(TSON.parse(TSON.stringify(-Infinity))).toBe(-Infinity);
      expect(Number.isNaN(TSON.parse(TSON.stringify(NaN)))).toBe(true);
    });

    test('handles booleans', () => {
      expect(TSON.parse(TSON.stringify(true))).toBe(true);
      expect(TSON.parse(TSON.stringify(false))).toBe(false);
    });

    test('handles null', () => {
      expect(TSON.parse(TSON.stringify(null))).toBe(null);
    });
  });

  describe('Date', () => {
    test('round-trips Date objects', () => {
      const date = new Date('2024-01-15T12:30:00.000Z');
      const json = TSON.stringify(date);
      const result = TSON.parse(json);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(date.getTime());
    });

    test('handles dates in objects', () => {
      const obj = { created: new Date('2024-01-01'), name: 'test' };
      const result = TSON.parse(TSON.stringify(obj));
      expect(result.created).toBeInstanceOf(Date);
      expect(result.name).toBe('test');
    });
  });

  describe('BigInt', () => {
    test('round-trips BigInt values', () => {
      const bigint = BigInt('9007199254740993'); // Larger than MAX_SAFE_INTEGER
      const json = TSON.stringify(bigint);
      const result = TSON.parse(json);
      expect(result).toBe(bigint);
    });

    test('handles negative BigInt', () => {
      const bigint = BigInt('-123456789012345678901234567890');
      expect(TSON.parse(TSON.stringify(bigint))).toBe(bigint);
    });
  });

  describe('Set', () => {
    test('round-trips Set with primitives', () => {
      const set = new Set([1, 2, 3, 'a', 'b']);
      const result = TSON.parse(TSON.stringify(set));
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(5);
      expect(result.has(1)).toBe(true);
      expect(result.has('a')).toBe(true);
    });

    test('round-trips empty Set', () => {
      const set = new Set();
      const result = TSON.parse(TSON.stringify(set));
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    test('round-trips Set with objects', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const set = new Set([obj1, obj2]);
      const result = TSON.parse(TSON.stringify(set));
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(2);
      const values = Array.from(result);
      expect(values[0]).toEqual({ id: 1 });
      expect(values[1]).toEqual({ id: 2 });
    });
  });

  describe('Map', () => {
    test('round-trips Map with string keys', () => {
      const map = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);
      const result = TSON.parse(TSON.stringify(map));
      expect(result).toBeInstanceOf(Map);
      expect(result.get('key1')).toBe('value1');
      expect(result.get('key2')).toBe('value2');
    });

    test('round-trips Map with object keys', () => {
      const key1 = { id: 1 };
      const key2 = { id: 2 };
      const map = new Map([
        [key1, 'first'],
        [key2, 'second'],
      ]);
      const result = TSON.parse(TSON.stringify(map));
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(2);
    });

    test('round-trips empty Map', () => {
      const map = new Map();
      const result = TSON.parse(TSON.stringify(map));
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });

  describe('TypedArrays', () => {
    test('round-trips Uint8Array', () => {
      const arr = new Uint8Array([1, 2, 3, 255, 0]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([1, 2, 3, 255, 0]);
    });

    test('round-trips Int8Array', () => {
      const arr = new Int8Array([-128, -1, 0, 1, 127]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(Int8Array);
      expect(Array.from(result)).toEqual([-128, -1, 0, 1, 127]);
    });

    test('round-trips Int16Array', () => {
      const arr = new Int16Array([-32768, 0, 32767]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(Int16Array);
      expect(Array.from(result)).toEqual([-32768, 0, 32767]);
    });

    test('round-trips Uint16Array', () => {
      const arr = new Uint16Array([0, 65535, 12345]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(Uint16Array);
      expect(Array.from(result)).toEqual([0, 65535, 12345]);
    });

    test('round-trips Int32Array', () => {
      const arr = new Int32Array([-2147483648, 0, 2147483647]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(Int32Array);
      expect(Array.from(result)).toEqual([-2147483648, 0, 2147483647]);
    });

    test('round-trips Uint32Array', () => {
      const arr = new Uint32Array([0, 4294967295]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(Uint32Array);
      expect(Array.from(result)).toEqual([0, 4294967295]);
    });

    test('round-trips Float32Array', () => {
      const arr = new Float32Array([1.5, -2.5, 0, 3.14159]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(Float32Array);
      // Float32 has limited precision
      expect(result[0]).toBeCloseTo(1.5);
      expect(result[1]).toBeCloseTo(-2.5);
      expect(result[2]).toBe(0);
    });

    test('round-trips Float64Array', () => {
      const arr = new Float64Array([Math.PI, Math.E, Number.MAX_VALUE]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(Float64Array);
      expect(result[0]).toBe(Math.PI);
      expect(result[1]).toBe(Math.E);
      expect(result[2]).toBe(Number.MAX_VALUE);
    });

    test('round-trips BigInt64Array', () => {
      const arr = new BigInt64Array([BigInt('-9223372036854775808'), BigInt(0), BigInt('9223372036854775807')]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(BigInt64Array);
      expect(result[0]).toBe(BigInt('-9223372036854775808'));
      expect(result[2]).toBe(BigInt('9223372036854775807'));
    });

    test('round-trips BigUint64Array', () => {
      const arr = new BigUint64Array([BigInt(0), BigInt('18446744073709551615')]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(BigUint64Array);
      expect(result[0]).toBe(BigInt(0));
      expect(result[1]).toBe(BigInt('18446744073709551615'));
    });

    test('round-trips empty TypedArray', () => {
      const arr = new Uint8Array(0);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });
  });

  describe('ArrayBuffer', () => {
    test('round-trips ArrayBuffer', () => {
      const buffer = new ArrayBuffer(8);
      const view = new Uint8Array(buffer);
      view.set([1, 2, 3, 4, 5, 6, 7, 8]);

      const result = TSON.parse(TSON.stringify(buffer));
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(result)).toEqual(view);
    });

    test('round-trips empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = TSON.parse(TSON.stringify(buffer));
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(0);
    });
  });

  describe('complex nested structures', () => {
    test('handles deeply nested objects', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
              date: new Date('2024-01-01'),
              set: new Set([1, 2, 3]),
            },
          },
        },
      };
      const result = TSON.parse(TSON.stringify(obj));
      expect(result.level1.level2.level3.value).toBe('deep');
      expect(result.level1.level2.level3.date).toBeInstanceOf(Date);
      expect(result.level1.level2.level3.set).toBeInstanceOf(Set);
    });

    test('handles arrays with mixed types', () => {
      const arr = [
        1,
        'string',
        new Date('2024-01-01'),
        new Set([1, 2]),
        new Uint8Array([1, 2, 3]),
        { nested: true },
      ];
      const result = TSON.parse(TSON.stringify(arr));
      expect(result[0]).toBe(1);
      expect(result[1]).toBe('string');
      expect(result[2]).toBeInstanceOf(Date);
      expect(result[3]).toBeInstanceOf(Set);
      expect(result[4]).toBeInstanceOf(Uint8Array);
      expect(result[5]).toEqual({ nested: true });
    });

    test('handles object with TypedArray properties', () => {
      const obj = {
        id: 'test',
        data: new Uint8Array([1, 2, 3, 4]),
        metadata: {
          floats: new Float64Array([1.1, 2.2, 3.3]),
        },
      };
      const result = TSON.parse(TSON.stringify(obj));
      expect(result.id).toBe('test');
      expect(result.data).toBeInstanceOf(Uint8Array);
      expect(result.metadata.floats).toBeInstanceOf(Float64Array);
    });
  });

  describe('edge cases', () => {
    test('handles Infinity and NaN in objects', () => {
      const obj = {
        inf: Infinity,
        negInf: -Infinity,
        nan: NaN,
      };
      const result = TSON.parse(TSON.stringify(obj));
      expect(result.inf).toBe(Infinity);
      expect(result.negInf).toBe(-Infinity);
      expect(Number.isNaN(result.nan)).toBe(true);
    });

    test('handles empty objects and arrays', () => {
      expect(TSON.parse(TSON.stringify({}))).toEqual({});
      expect(TSON.parse(TSON.stringify([]))).toEqual([]);
    });
  });
});
