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

    test('handles plain numbers same as JSON', () => {
      expect(TSON.stringify(88)).toBe(JSON.stringify(88));
      expect(TSON.parse('88')).toBe(88);
      expect(TSON.parse(TSON.stringify(42))).toBe(42);
      expect(TSON.parse(TSON.stringify(3.14159))).toBe(3.14159);
    });

    test('handles booleans same as JSON', () => {
      expect(TSON.stringify(false)).toBe(JSON.stringify(false));
      expect(TSON.stringify(true)).toBe(JSON.stringify(true));
      expect(TSON.parse('false')).toStrictEqual(false);
      expect(TSON.parse('true')).toStrictEqual(true);
    });

    test('handles null same as JSON', () => {
      expect(TSON.stringify(null)).toBe('null');
      expect(TSON.parse('null')).toBeNull();
      const objWithNullValue = { foo: null };
      expect(TSON.stringify(objWithNullValue)).toBe(
        JSON.stringify(objWithNullValue)
      );
      expect(TSON.parse(TSON.stringify(null))).toBe(null);
    });

    test('stringifies plain objects same as JSON', () => {
      const plainObject = { foo: 'bar' };
      const tson = TSON.stringify(plainObject);
      expect(tson).toBe(JSON.stringify(plainObject));
      expect(TSON.parse(tson)).toStrictEqual(plainObject);
    });

    test('stringifies plain arrays same as JSON', () => {
      const plainArray = [{ foo: 'bar' }, 5, 'dfd'];
      const tson = TSON.stringify(plainArray);
      expect(tson).toBe(JSON.stringify(plainArray));
      expect(TSON.parse(tson)).toStrictEqual(plainArray);
    });

    test('stringifies object with null value', () => {
      const objWithNullValue = { foo: null };
      const tson = TSON.stringify(objWithNullValue);
      expect(tson).toBe(JSON.stringify(objWithNullValue));
      expect(TSON.parse(tson)).toStrictEqual(objWithNullValue);
    });

    test('should not stringify undefined in objects (default behavior)', () => {
      // Without undefined type def, undefined properties are omitted (like JSON)
      expect(TSON.stringify({ foo: null, bar: undefined })).toBe(
        JSON.stringify({ foo: null })
      );
    });
  });

  describe('$ escaping', () => {
    test('escapes props named $t', () => {
      const input = { $t: 'fakeType' };
      const tson = TSON.stringify(input);
      expect(tson).toBe(JSON.stringify({ $$t: 'fakeType' }));
      expect(TSON.parse(tson)).toStrictEqual(input);
    });

    test('escapes props starting with $', () => {
      const tson = TSON.stringify({ $hello: 'world' });
      expect(tson).toBe(JSON.stringify({ $$hello: 'world' }));
      expect(TSON.parse(tson)).toStrictEqual({ $hello: 'world' });
    });

    test('escapes props named $', () => {
      const tson = TSON.stringify({ $: 3 });
      expect(tson).toBe(JSON.stringify({ $$: 3 }));
      expect(TSON.parse(tson)).toStrictEqual({ $: 3 });
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

    test('handles epoch date', () => {
      const date = new Date(0);
      const tson = TSON.stringify(date);
      expect(tson).toBe(
        JSON.stringify({ $t: 'Date', v: '1970-01-01T00:00:00.000Z' })
      );
      expect(TSON.parse(tson)).toStrictEqual(date);
    });

    test('handles invalid Date', () => {
      const invalidDate = new Date(NaN);
      const tson = TSON.stringify(invalidDate);
      expect(tson).toBe(JSON.stringify({ $t: 'Date', v: 'NaN' }));
      expect(TSON.parse(tson).getTime()).toBeNaN();
    });

    test('handles Date in object with invalid Date', () => {
      const date = new Date(0);
      const invalidDate = new Date(NaN);
      const plainObject = { foo: date, bar: invalidDate };
      const tson = TSON.stringify(plainObject);
      expect(TSON.parse(tson).foo).toStrictEqual(plainObject.foo);
      expect(TSON.parse(tson).bar.getTime()).toBeNaN();
    });
  });

  describe('special numbers', () => {
    test('stringifies NaN with exact output', () => {
      const tson = TSON.stringify(NaN);
      expect(tson).toBe(JSON.stringify({ $t: 'number', v: 'NaN' }));
      expect(Number.isNaN(TSON.parse(tson))).toBe(true);
    });

    test('stringifies Infinity with exact output', () => {
      const tson = TSON.stringify(Infinity);
      expect(tson).toBe(JSON.stringify({ $t: 'number', v: 'Infinity' }));
      expect(TSON.parse(tson)).toBe(Infinity);
    });

    test('stringifies -Infinity with exact output', () => {
      const tson = TSON.stringify(-Infinity);
      expect(tson).toBe(JSON.stringify({ $t: 'number', v: '-Infinity' }));
      expect(TSON.parse(tson)).toBe(-Infinity);
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

    test('handles array of BigInts including special values', () => {
      const golem96 =
        (BigInt(0xabcd_1234) << BigInt(64)) |
        (BigInt(0x0000_9876) << BigInt(32)) |
        BigInt(0x8888_7776);
      const input = [BigInt(0), BigInt(1), BigInt(-1), BigInt(16), golem96];
      const tson = TSON.stringify(input);
      const back: typeof input = TSON.parse(tson);
      expect(back[0]).toBe(BigInt(0));
      expect(back[1]).toBe(BigInt(1));
      expect(back[2]).toBe(BigInt(-1));
      expect(back[3]).toBe(BigInt(16));
      expect(back[4]).toBe(golem96);
      expect(tson).toBe(
        JSON.stringify([
          { $t: 'bigint', v: '0' },
          { $t: 'bigint', v: '1' },
          { $t: 'bigint', v: '-1' },
          { $t: 'bigint', v: '16' },
          { $t: 'bigint', v: '53169852434298556854127064950' },
        ])
      );
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

    test('handles Map with nested special types', () => {
      const m = new Map<string, { foo: Array<number> }>();
      m.set('foo', { foo: [1, 2, 3, Infinity] });
      const tson = TSON.stringify(m);
      expect(tson).toBe(
        JSON.stringify({
          $t: 'Map',
          v: [['foo', { foo: [1, 2, 3, { $t: 'number', v: 'Infinity' }] }]],
        })
      );
      expect(TSON.parse(tson)).toStrictEqual(m);
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

    test('round-trips Float64Array with specific value', () => {
      const fa = new Float64Array([19.6]);
      const fa2 = new Float64Array([19.6]);
      const tson = TSON.stringify(fa);
      const back = TSON.parse(tson);
      expect(back).toStrictEqual(fa2);
    });

    test('round-trips BigInt64Array', () => {
      const arr = new BigInt64Array([
        BigInt('-9223372036854775808'),
        BigInt(0),
        BigInt('9223372036854775807'),
      ]);
      const result = TSON.parse(TSON.stringify(arr));
      expect(result).toBeInstanceOf(BigInt64Array);
      expect(result[0]).toBe(BigInt('-9223372036854775808'));
      expect(result[2]).toBe(BigInt('9223372036854775807'));
    });

    test('round-trips BigUint64Array', () => {
      const arr = new BigUint64Array([
        BigInt(0),
        BigInt('18446744073709551615'),
      ]);
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

  describe('TSON transparency (TSON through TSON)', () => {
    // TSON must be 100% transparent: a POJO that happens to have a $t property
    // matching a registered type must survive a TSON round-trip as a plain object,
    // not be revived as that type. This is critical for blob offloading where the
    // server stores BlobRefs as {$t: "Uint8Array", ref: "...", size: ...} and
    // those POJOs must pass through TSON unchanged.

    test('POJO with $t: "Date" is NOT revived as Date', () => {
      const input = { $t: 'Date', foo: 'bar' };
      const result = TSON.parse(TSON.stringify(input));
      expect(result).toStrictEqual(input);
      expect(result).not.toBeInstanceOf(Date);
    });

    test('POJO with $t: "ArrayBuffer" is NOT revived as ArrayBuffer', () => {
      const input = { $t: 'ArrayBuffer', ref: 'abc123', size: 1024 };
      const result = TSON.parse(TSON.stringify(input));
      expect(result).toStrictEqual(input);
      expect(result).not.toBeInstanceOf(ArrayBuffer);
    });

    test('POJO with $t: "Uint8Array" (BlobRef format) is NOT revived as Uint8Array', () => {
      const input = { $t: 'Uint8Array', ref: '1:abc123', size: 4096 };
      const result = TSON.parse(TSON.stringify(input));
      expect(result).toStrictEqual(input);
      expect(result).not.toBeInstanceOf(Uint8Array);
    });

    test('POJO with $t: "Blob" (BlobRef format) is NOT revived as Blob', () => {
      const input = {
        $t: 'Blob',
        ref: '1:abc123',
        size: 8192,
        ct: 'image/png',
      };
      const result = TSON.parse(TSON.stringify(input));
      expect(result).toStrictEqual(input);
    });

    test('object containing BlobRef survives TSON round-trip unchanged', () => {
      const input = {
        id: 'doc1',
        name: 'photo',
        image: { $t: 'Uint8Array', ref: '1:blobid', size: 65536 },
        $hasBlobRefs: 1,
      };
      const result = TSON.parse(TSON.stringify(input));
      expect(result).toStrictEqual(input);
      expect(result.image).not.toBeInstanceOf(Uint8Array);
      expect(result.$hasBlobRefs).toBe(1);
    });

    test('running TSON.stringify output through TSON.parse again yields same result', () => {
      // A real Uint8Array serialized by TSON, then passed through TSON again as a POJO
      const arr = new Uint8Array([1, 2, 3]);
      const tson1 = TSON.stringify(arr); // produces {"$t":"Uint8Array","$v":"AQID"}
      const pojo = JSON.parse(tson1); // plain POJO: {$t: "Uint8Array", $v: "AQID"}
      // Now this POJO goes through TSON (simulating server→client scenario)
      const tson2 = TSON.stringify(pojo);
      const result = TSON.parse(tson2);
      // Must come back as the same POJO, not a Uint8Array
      expect(result).toStrictEqual(pojo);
      expect(result).not.toBeInstanceOf(Uint8Array);
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
