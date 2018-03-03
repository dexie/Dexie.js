import { assert } from '../../../functions/utils';

export interface BloomFilter<Key=any> {
  readonly bitmap: Uint32Array;
  addKeys(keys: Key[]): void;
  and(other: BloomFilter): BloomFilter;
  or(other: BloomFilter): BloomFilter;
  has(key): boolean;
  filter(keys: Key[]): Key[];
}

export function BloomFilter (
  hash: (a) => number,
  numBuckets: number) : BloomFilter
{
  const bitmap = new Uint32Array(Math.ceil(numBuckets / 32));

  return {
    bitmap,
    addKeys (keys) {
      for (let i=0,l=keys.length; i<l; ++i) {
        const digest = hash(keys[i]) % numBuckets;
        const pos = digest >> 5;
        const dword = 1 << (digest & 31);
        bitmap[pos] |= dword;
      }
    },

    and (other) {
      const resultFilter = BloomFilter(hash, numBuckets);
      const result = resultFilter.bitmap;
      const otherBitmap = other.bitmap;
      assert(otherBitmap.length === bitmap.length);
      for (let i=0, l=bitmap.length; i<l; ++i) {
        result[i] = bitmap[i] & otherBitmap[i];
      }
      return resultFilter;
    },

    or (other) {
      const resultFilter = BloomFilter(hash, numBuckets);
      const result = resultFilter.bitmap;
      const otherBitmap = other.bitmap;
      assert(otherBitmap.length === bitmap.length);
      for (let i=0, l=bitmap.length; i<l; ++i) {
        result[i] = bitmap[i] | otherBitmap[i];
      }
      return resultFilter;
    },

    has(key) {
      const digest = hash(key) % numBuckets;
      return !!(bitmap[digest >> 5] & (1 << (digest & 31)));
    },
    
    filter(keys: any[]) {
      const result = [];
      for (let i=0,l=keys.length; i<l; ++i) {
        const key = keys[i];
        const digest = hash(key) % numBuckets;
        if (bitmap[digest >> 5] & (1 << (digest & 31))) {
          result.push(key);
        }
      }
      return result;
    }
  };
}
