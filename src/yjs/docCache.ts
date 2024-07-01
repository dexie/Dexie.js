import type { DucktypedYDoc } from '../public/types/yjs-related';

// The cache
export let docCache: { [key: string]: WeakRef<DucktypedYDoc>; } = {};
// The finalization registry
export const registry = new FinalizationRegistry<string>((heldValue) => {
  delete docCache[heldValue];
});
// The weak map
//export const doc2ProviderWeakMap = new WeakMap<object, WeakRef<DexieYProvider<any>>>();
export const destroyed = new WeakSet<object>();

export function throwIfDestroyed(doc: object) {
  if (destroyed.has(doc))
    throw new Error('Y.Doc has been destroyed');
}
