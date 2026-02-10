import { TSONRef, TSONRefData, collectTSONRefs, replaceTSONRefs } from '../TSONRef';

describe('TSONRef', () => {
  describe('constructor and properties', () => {
    test('creates TSONRef with required properties', () => {
      const ref = new TSONRef('Uint8Array', 'ref-123', 1024);
      expect(ref.type).toBe('Uint8Array');
      expect(ref.ref).toBe('ref-123');
      expect(ref.size).toBe(1024);
      expect(ref.contentType).toBeUndefined();
    });

    test('creates TSONRef with contentType for Blob', () => {
      const ref = new TSONRef('Blob', 'ref-456', 2048, 'image/png');
      expect(ref.type).toBe('Blob');
      expect(ref.contentType).toBe('image/png');
    });
  });

  describe('isTSONRef', () => {
    test('returns true for TSONRef instances', () => {
      const ref = new TSONRef('ArrayBuffer', 'ref-1', 100);
      expect(TSONRef.isTSONRef(ref)).toBe(true);
    });

    test('returns false for plain objects', () => {
      expect(TSONRef.isTSONRef({})).toBe(false);
      expect(TSONRef.isTSONRef({ $ref: 'test' })).toBe(false);
      expect(TSONRef.isTSONRef(null)).toBe(false);
      expect(TSONRef.isTSONRef(undefined)).toBe(false);
    });
  });

  describe('isTSONRefData', () => {
    test('returns true for valid TSONRefData', () => {
      const data: TSONRefData = {
        $t: 'Uint8Array',
        $ref: 'ref-123',
        $size: 100,
      };
      expect(TSONRef.isTSONRefData(data)).toBe(true);
    });

    test('returns true for TSONRefData with contentType', () => {
      const data: TSONRefData = {
        $t: 'Blob',
        $ref: 'ref-456',
        $size: 200,
        $ct: 'application/pdf',
      };
      expect(TSONRef.isTSONRefData(data)).toBe(true);
    });

    test('returns false for incomplete data', () => {
      expect(TSONRef.isTSONRefData({ $t: 'Uint8Array' })).toBe(false);
      expect(TSONRef.isTSONRefData({ $ref: 'ref' })).toBe(false);
      expect(TSONRef.isTSONRefData({})).toBe(false);
    });
  });

  describe('fromData', () => {
    test('creates TSONRef from TSONRefData', () => {
      const data: TSONRefData = {
        $t: 'Float64Array',
        $ref: 'ref-789',
        $size: 64,
      };
      const ref = TSONRef.fromData(data);
      expect(ref.type).toBe('Float64Array');
      expect(ref.ref).toBe('ref-789');
      expect(ref.size).toBe(64);
    });
  });

  describe('toJSON', () => {
    test('serializes to TSONRefData format', () => {
      const ref = new TSONRef('Int32Array', 'ref-abc', 128);
      const json = ref.toJSON();
      expect(json).toEqual({
        $t: 'Int32Array',
        $ref: 'ref-abc',
        $size: 128,
      });
    });

    test('includes contentType for Blob', () => {
      const ref = new TSONRef('Blob', 'ref-def', 256, 'text/plain');
      const json = ref.toJSON();
      expect(json.$ct).toBe('text/plain');
    });
  });

  describe('reconstruct', () => {
    test('reconstructs ArrayBuffer', () => {
      const ref = new TSONRef('ArrayBuffer', 'ref', 4);
      const data = new ArrayBuffer(4);
      new Uint8Array(data).set([1, 2, 3, 4]);
      
      const result = ref.reconstruct(data);
      expect(result).toBe(data); // Same reference
    });

    test('reconstructs Uint8Array', () => {
      const ref = new TSONRef('Uint8Array', 'ref', 4);
      const data = new ArrayBuffer(4);
      new Uint8Array(data).set([1, 2, 3, 4]);
      
      const result = ref.reconstruct(data);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result as Uint8Array)).toEqual([1, 2, 3, 4]);
    });

    test('reconstructs Blob with contentType', () => {
      const ref = new TSONRef('Blob', 'ref', 4, 'application/octet-stream');
      const data = new ArrayBuffer(4);
      
      const result = ref.reconstruct(data);
      expect(result).toBeInstanceOf(Blob);
      expect((result as Blob).type).toBe('application/octet-stream');
      expect((result as Blob).size).toBe(4);
    });

    test('reconstructs Int16Array with alignment validation', () => {
      const ref = new TSONRef('Int16Array', 'ref', 4);
      const data = new ArrayBuffer(4); // 4 bytes = 2 Int16 elements, aligned
      
      const result = ref.reconstruct(data);
      expect(result).toBeInstanceOf(Int16Array);
    });

    test('throws on misaligned Int16Array', () => {
      const ref = new TSONRef('Int16Array', 'ref', 3);
      const data = new ArrayBuffer(3); // 3 bytes is not aligned to 2
      
      expect(() => ref.reconstruct(data)).toThrow(RangeError);
    });

    test('throws on misaligned Int32Array', () => {
      const ref = new TSONRef('Int32Array', 'ref', 5);
      const data = new ArrayBuffer(5); // 5 bytes is not aligned to 4
      
      expect(() => ref.reconstruct(data)).toThrow(RangeError);
    });

    test('throws on misaligned Float64Array', () => {
      const ref = new TSONRef('Float64Array', 'ref', 7);
      const data = new ArrayBuffer(7); // 7 bytes is not aligned to 8
      
      expect(() => ref.reconstruct(data)).toThrow(RangeError);
    });

    test('handles unknown type gracefully', () => {
      const ref = new TSONRef('UnknownType' as any, 'ref', 4);
      const data = new ArrayBuffer(4);
      
      // Should return ArrayBuffer and log warning
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = ref.reconstruct(data);
      expect(result).toBe(data);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

describe('collectTSONRefs', () => {
  test('returns empty array for primitives', () => {
    expect(collectTSONRefs(null)).toEqual([]);
    expect(collectTSONRefs(undefined)).toEqual([]);
    expect(collectTSONRefs(42)).toEqual([]);
    expect(collectTSONRefs('string')).toEqual([]);
  });

  test('collects TSONRef from object', () => {
    const ref = new TSONRef('Uint8Array', 'ref-1', 100);
    const obj = { data: ref };
    
    const refs = collectTSONRefs(obj);
    expect(refs).toHaveLength(1);
    expect(refs[0]).toBe(ref);
  });

  test('collects TSONRefData from object', () => {
    const data: TSONRefData = { $t: 'Uint8Array', $ref: 'ref-2', $size: 200 };
    const obj = { data };
    
    const refs = collectTSONRefs(obj);
    expect(refs).toHaveLength(1);
    expect(refs[0].ref).toBe('ref-2');
  });

  test('collects multiple refs from nested structure', () => {
    const ref1 = new TSONRef('Uint8Array', 'ref-1', 100);
    const ref2 = new TSONRef('ArrayBuffer', 'ref-2', 200);
    const obj = {
      level1: {
        data1: ref1,
        level2: {
          data2: ref2,
        },
      },
    };
    
    const refs = collectTSONRefs(obj);
    expect(refs).toHaveLength(2);
  });

  test('collects refs from arrays', () => {
    const ref1 = new TSONRef('Uint8Array', 'ref-1', 100);
    const ref2 = new TSONRef('Uint8Array', 'ref-2', 100);
    const arr = [ref1, { nested: ref2 }];
    
    const refs = collectTSONRefs(arr);
    expect(refs).toHaveLength(2);
  });
});

describe('replaceTSONRefs', () => {
  const mockResolver = jest.fn(async (ref: TSONRef) => {
    const data = new ArrayBuffer(ref.size);
    const view = new Uint8Array(data);
    // Fill with pattern based on ref id
    for (let i = 0; i < ref.size; i++) {
      view[i] = parseInt(ref.ref.slice(-1)) + i;
    }
    return data;
  });

  beforeEach(() => {
    mockResolver.mockClear();
  });

  test('replaces TSONRef in object', async () => {
    const ref = new TSONRef('Uint8Array', 'ref-1', 4);
    const obj: any = { data: ref };
    
    await replaceTSONRefs(obj, mockResolver);
    
    expect(obj.data).toBeInstanceOf(Uint8Array);
    expect(mockResolver).toHaveBeenCalledTimes(1);
  });

  test('replaces TSONRefData in object', async () => {
    const obj: any = {
      data: { $t: 'Uint8Array', $ref: 'ref-2', $size: 4 },
    };
    
    await replaceTSONRefs(obj, mockResolver);
    
    expect(obj.data).toBeInstanceOf(Uint8Array);
  });

  test('handles root-level TSONRef by returning value', async () => {
    const ref = new TSONRef('Uint8Array', 'ref-3', 4);
    
    const result = await replaceTSONRefs(ref, mockResolver);
    
    expect(result).toBeInstanceOf(Uint8Array);
  });

  test('handles object with no refs', async () => {
    const obj = { a: 1, b: 'test' };
    
    const result = await replaceTSONRefs(obj, mockResolver);
    
    expect(result).toBeUndefined();
    expect(mockResolver).not.toHaveBeenCalled();
  });

  test('deduplicates identical refs', async () => {
    const obj: any = {
      data1: new TSONRef('Uint8Array', 'same-ref', 4),
      data2: new TSONRef('Uint8Array', 'same-ref', 4),
    };
    
    await replaceTSONRefs(obj, mockResolver);
    
    // Should only fetch once despite two refs with same id
    expect(mockResolver).toHaveBeenCalledTimes(1);
  });

  test('respects concurrency limit', async () => {
    let concurrent = 0;
    let maxConcurrent = 0;
    
    const slowResolver = jest.fn(async (ref: TSONRef) => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise(r => setTimeout(r, 10));
      concurrent--;
      return new ArrayBuffer(ref.size);
    });
    
    const refs = Array.from({ length: 10 }, (_, i) => 
      new TSONRef('Uint8Array', `ref-${i}`, 4)
    );
    const obj: any = Object.fromEntries(refs.map((r, i) => [`data${i}`, r]));
    
    await replaceTSONRefs(obj, slowResolver, 3);
    
    expect(maxConcurrent).toBeLessThanOrEqual(3);
    expect(slowResolver).toHaveBeenCalledTimes(10);
  });
});
