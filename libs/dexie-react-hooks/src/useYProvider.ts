import { DexieYProvider, DucktypedYDoc } from 'dexie';
import React from 'react';

export function useYProvider<YDoc extends DucktypedYDoc>(
  doc: YDoc | null | undefined
): DexieYProvider<YDoc> | null {
  const [provider, setProvider] = React.useState<DexieYProvider<YDoc> | null>(
    null
  );
  React.useEffect(() => {
    if (doc) {
      // Doc is set or changed. Create a new provider.
      const provider = new DexieYProvider(doc);
      setProvider(provider);
      return () => provider.destroy();
    } else if (provider) {
      // In case doc is set to null, don't keep the provider around.
      setProvider(null);
      return () => provider.destroy();
    } else {
      // Support undefined/null since doc can be undefined initially if the same component loads it in a liveQuery.
      // In that case, we just do nothing. Will be called again when doc is set.
      // No need to set provider to null since it's already null.
    }
  }, [doc]);
  return provider;
}
