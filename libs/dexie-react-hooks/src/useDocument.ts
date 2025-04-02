import { DexieYProvider, YjsDoc } from 'dexie';
import React from 'react';

const gracePeriod = 100 // 100 ms = grace period to optimize for unload/reload scenarios

const fr = typeof FinalizationRegistry !== 'undefined' && new FinalizationRegistry((doc: YjsDoc) => {
  // If coming here, react effect never ran. This is a fallback cleanup mechanism.
  DexieYProvider.release(doc);
});

export function useDocument<YDoc extends YjsDoc>(
  doc: YDoc | null | undefined
): DexieYProvider<YDoc> | null {
  if (!fr) throw new TypeError('FinalizationRegistry not supported.');
  const providerRef = React.useRef<DexieYProvider | null>(null);
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
