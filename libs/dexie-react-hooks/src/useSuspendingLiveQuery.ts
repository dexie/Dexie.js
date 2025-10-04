import { Dexie } from 'dexie';
import { useSuspendingObservable } from './useSuspendingObservable';

/**
 * Observe IndexedDB data in your React component. Make the component re-render when the observed data changes.
 *
 * Suspends until first value is available.
 */
export function useSuspendingLiveQuery<T>(
  querier: () => Promise<T> | T,
  cacheKey: React.DependencyList
): T {
  return useSuspendingObservable(
    () => Dexie.liveQuery(querier),
    ['dexie', ...cacheKey]
  );
}
