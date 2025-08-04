import { Dexie } from 'dexie';
import React from 'react';

// Using import('y-dexie') and import('yjs') to not break the build if y-dexie or yjs are not installed.
// (these two libries are truly optional and not listed in neither peerDependencies nor optionalDependencies)
// We want the compiler to not complain about missing imports, so we use type imports.
// Runtime, we will detect if y-dexie is available and use it via Dexie['DexieYProvider'].

type DexieYProvider = import('y-dexie').DexieYProvider;
type DexieYProviderConstructor = typeof import('y-dexie').DexieYProvider;
type YDoc = import('yjs').Doc;

const gracePeriod = 100 // 100 ms = grace period to optimize for unload/reload scenarios

const fr = typeof FinalizationRegistry !== 'undefined' && new FinalizationRegistry((doc: YDoc) => {
  // If coming here, react effect never ran. This is a fallback cleanup mechanism.
  const DexieYProvider = Dexie['DexieYProvider'] as DexieYProviderConstructor;
  if (DexieYProvider) DexieYProvider.release(doc);
});

export function useDocument(
  doc: YDoc | null | undefined
): DexieYProvider | null {
  if (!fr) throw new TypeError('FinalizationRegistry not supported.');
  const providerRef = React.useRef<DexieYProvider | null>(null);
  const DexieYProvider = Dexie['DexieYProvider'] as DexieYProviderConstructor;
  if (!DexieYProvider) {
    throw new Error('DexieYProvider is not available. Make sure `y-dexie` is installed and imported.');
  }
  let unregisterToken: object | undefined = undefined;
  if (doc) {
    if (doc !== providerRef.current?.doc) {
      providerRef.current = DexieYProvider.load(doc, { gracePeriod });
      unregisterToken = Object.create(null);
      fr.register(providerRef, doc, unregisterToken);
    }
  } else if (providerRef.current?.doc) {
    providerRef.current = null;
  }
  React.useEffect(() => {
    if (doc) {
      // Doc is set or changed. Unregister provider from FinalizationRegistry
      // and instead take over from here to release the doc when component is unmounted
      // or when doc is changed. What we're doing here is to avoid relying on FinalizationRegistry
      // in all the normal cases and instead rely on React's lifecycle to release the doc.
      // But there can be situations when react never calls this effect and therefore, we
      // need to rely on FinalizationRegistry to release the doc as a fallback.
      // We cannot wait with loading the document until the effect happens, because the doc
      // could have been destroyed in the meantime.
      if (unregisterToken) fr.unregister(unregisterToken);
      let provider = DexieYProvider.for(doc);
      if (provider) {
        return () => {
          DexieYProvider.release(doc);
        }
      } else {
        // Maybe the doc was destroyed in the meantime.
        // Can not happen if React and FinalizationRegistry works as we expect them to.
        // Except if a user had called DexieYProvider.release() on the doc
        throw new Error(`FATAL. DexieYProvider.release() has been called somewhere in application code, making us lose the document.`);
      }
    }
  }, [doc, unregisterToken]);
  return providerRef.current;
}
