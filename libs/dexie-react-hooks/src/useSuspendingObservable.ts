import { Observer, Subscribable, Unsubscribable } from 'dexie';
import * as React from 'react';
import { usePromise } from './usePromise';

const observableCache = new Map<React.DependencyList, Subscribable<any>>();
const promiseCache = new Map<Subscribable<any>, Promise<any>>();
const valueCache = new Map<Subscribable<any>, any>();

const CLEANUP_DELAY = 3000; // Time to wait before cleaning up unused observables

/**
 * Subscribes to an observable and returns the latest value.
 * Suspends until the first value is received.
 *
 * Calls with the same cache key will reuse the same observable.
 * Cache key must be globally unique.
 */
export function useSuspendingObservable<T>(
  getObservable: (() => Subscribable<T>) | Subscribable<T>,
  cacheKey: React.DependencyList
): T {
  let observable: Subscribable<T> | undefined;

  // Try to find an existing observable for this cache key
  for (const [key, value] of observableCache) {
    if (
      key.length === cacheKey.length &&
      key.every((k, i) => Object.is(k, cacheKey[i]))
    ) {
      observable = value;
      break;
    }
  }

  // If no observable was found, create a new one
  if (!observable) {
    // Create a multicast observable which subscribes to source at most once.
    const source =
      typeof getObservable === 'function' ? getObservable() : getObservable;
    let subscription: Unsubscribable | undefined;
    const observers = new Set<Observer<T>>();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const newObservable: Subscribable<T> = {
      subscribe: (observer) => {
        observers.add(observer);
        // Cancel the cleanup timer if it's running
        if (timeout) {
          clearTimeout(timeout);
          timeout = undefined;
        }
        // If this is the first subscriber, subscribe to the source observable
        if (!subscription) {
          subscription = source.subscribe({
            next: (val) => {
              valueCache.set(newObservable, val);
              // Clone observers in case the list changes during emission
              for (const obs of [...observers]) obs.next?.(val);
            },
            error: (err) => {
              for (const obs of [...observers]) obs.error?.(err);
            },
            complete: () => {
              for (const obs of [...observers]) obs.complete?.();
            },
          });
        }
        // Otherwise, emit the current value to the new subscriber if any
        else if (valueCache.has(newObservable)) {
          observer.next?.(valueCache.get(newObservable)!);
        }
        // Return the unsubscriber
        return {
          unsubscribe: () => {
            if (!observers.has(observer)) return;
            observers.delete(observer);
            // If this was the last subscriber, schedule cleanup
            if (observers.size === 0) {
              timeout = setTimeout(() => {
                // Unsubscribe source
                subscription?.unsubscribe();
                subscription = undefined;
                // Clean caches
                valueCache.delete(newObservable);
                promiseCache.delete(newObservable);
                for (const [key, value] of observableCache) {
                  if (value === observable) {
                    observableCache.delete(key);
                    break;
                  }
                }
              }, CLEANUP_DELAY);
            }
          },
        };
      },
    };
    observable = newObservable;
    observableCache.set(cacheKey, newObservable);
  }

  // Get or initialize promise for first value
  let promise = promiseCache.get(observable);
  if (!promise) {
    promise = new Promise<T>((resolve, reject) => {
      const subscription = observable.subscribe({
        next: (val) => {
          resolve(val);
          // Unsubscribe in next tick because subscription might not be assigned yet
          queueMicrotask(() => subscription.unsubscribe());
        },
        error: (err) => reject(err),
      });
    });
    promiseCache.set(observable, promise);
  }

  const initialValue = usePromise(promise);

  const value = React.useRef<T>(initialValue);
  const [error, setError] = React.useState<unknown>();
  const rerender = React.useReducer((x) => x + 1, 0)[1];

  // Set the value immediately on every render.
  // This avoids waiting for effect to run.
  value.current = valueCache.has(observable)
    ? valueCache.get(observable)!
    : initialValue;

  // Subscribe to live updates until the source observable changes.
  React.useEffect(() => {
    const subscription = observable.subscribe({
      next: (val) => {
        if (!Object.is(val, value.current)) {
          value.current = val;
          rerender();
        }
      },
      error: (err) => setError(err),
    });
    return () => subscription.unsubscribe();
  }, [observable]);

  if (error) throw error;
  return value.current;
}
