import { liveQuery } from 'dexie';
import { useObservable } from './useObservable';

export function useLiveQuery<T>(
  querier: () => Promise<T> | T,
  deps?: any[]
): T | undefined;
export function useLiveQuery<T, TDefault>(
  querier: () => Promise<T> | T,
  deps: any[],
  defaultResult: TDefault
): T | TDefault;
export function useLiveQuery<T, TDefault>(
  querier: () => Promise<T> | T,
  deps?: any[],
  defaultResult?: TDefault
): T | TDefault {
  return useObservable(
    () => liveQuery(querier),
    deps || [],
    defaultResult as TDefault
  );
}
