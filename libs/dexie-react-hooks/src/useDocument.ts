import Dexie, { DexieYProvider, YjsDoc } from 'dexie';
import React from 'react';

export function useDocument<YDoc extends YjsDoc>(
  doc: YDoc | null | undefined
): DexieYProvider<YDoc> | null {
  const [provider, setProvider] = React.useState<DexieYProvider<YDoc> | null>(
    null
  );
  React.useEffect(() => {
    if (doc) {
      // Doc is set or changed. Create or hook into a provider for it.
      const provider = DexieYProvider.load(doc);
      setProvider(provider);
      return () => {
        DexieYProvider.release(doc, {
          gracePeriod: 100 // Grace period to optimize for unload/reload scenarios
        });
      }
    } else if (provider) {
      // In case doc is set to null, don't keep the provider around.
      setProvider(null);
    } else {
      // Support undefined/null since doc can be undefined initially if the same component loads it in a liveQuery.
      // In that case, we just do nothing. Will be called again when doc is set.
      // No need to set provider to null since it's already null.
    }
  }, [doc]);
  return provider;
}
