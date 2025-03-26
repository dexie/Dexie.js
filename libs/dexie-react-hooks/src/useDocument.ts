import { DexieYProvider, YjsDoc } from 'dexie';
import React from 'react';

const gracePeriod = 100 // 100 ms = grace period to optimize for unload/reload scenarios

const fr = typeof FinalizationRegistry !== 'undefined' && new FinalizationRegistry((provider: DexieYProvider) => {
  // Cleanup when component is garbage collected
  if (provider.doc) {
    DexieYProvider.release(provider.doc, { gracePeriod });
  }
});

export function useDocument<YDoc extends YjsDoc>(
  doc: YDoc | null | undefined
): DexieYProvider<YDoc> | null {
  if (!fr) throw new TypeError('FinalizationRegistry not supported.');
  const providerRef = React.useRef<DexieYProvider | null>(null);
  if (doc) {
    if (doc !== providerRef.current?.doc) {
      if (providerRef.current?.doc) {
        // Doc is changed. Release previous doc.
        // and then also prohibit FinalizationRegistry from releasing it.
        fr.unregister(providerRef.current); // provider is the registry token used when registering
        DexieYProvider.release(providerRef.current.doc, { gracePeriod });
      }
      providerRef.current = DexieYProvider.load(doc);
      fr.register(providerRef, providerRef.current, providerRef.current);
    }
  } else if (providerRef.current?.doc) {
    fr.unregister(providerRef.current); // provider is the registry token used when registering
    DexieYProvider.release(providerRef.current.doc, { gracePeriod });
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
      const provider = DexieYProvider.for(doc);
      if (provider) {
        // Take over the cleanup from here
        fr.unregister(provider); // "provider" is the registry token used when registering
        return () => {
          DexieYProvider.release(doc, { gracePeriod });
        }
      }
    }
  }, [doc]);
  return providerRef.current;
}
