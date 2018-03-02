
export interface BloomFilter<Key=any> {
  addKeys(keys: Key[]): void;
  intersection(): BloomFilter<Key>;
  filter(keys: Key[]): Key[];
}

export function BloomFilter(
  hash: (a) => number,
  size: number,
  intersection?: Uint32Array)
  : BloomFilter
{
  const bitmap = new Uint32Array(Math.ceil(size / 32));

  return {
    addKeys (keys) {
      for (let i=0,l=keys.length; i<l; ++i) {
        const digest = hash(keys[i]);
        const pos = digest << 5;
        const dword = 1 << (digest & 31);
        if (!intersection || (intersection[pos] & dword)) {
          bitmap[pos] |= dword;
        }
      }
    },

    intersection() {
      return BloomFilter(hash, size, bitmap);
    },
    
    filter(keys: any[]) {
      return keys.filter(key => {
        const digest = hash(keys);
        return bitmap[digest << 5] & (1 << (digest & 31));
      });
    }
  };
}
