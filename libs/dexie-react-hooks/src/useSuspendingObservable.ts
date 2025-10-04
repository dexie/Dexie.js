import React from 'react';
import { InteropableObservable } from './useObservable';

const use = (React as any).use as <T>(promise: Promise<T>) => T;

/**
 * Subscribes to an observable and returns the latest value.
 * Suspends until the first value is received.
 *
 * Calls with the same cacheKey will use the same observable.
 * cacheKey must be globally unique.
 */
export function useSuspendingObservable<T>(
  getObservable: () => InteropableObservable<T>,
  cacheKey: React.DependencyList
): T {
  let observable = memoized(OBSERVABLE_CACHE, cacheKey, getObservable);
  const firstValue = useSuspendingPromise(
    () => getFirstValue(observable),
    [observable]
  );
  return useObservableValue(observable, firstValue);
}

const OBSERVABLE_CACHE = new Map<
  React.DependencyList,
  InteropableObservable<any>
>();

/**
 * Returns a promise that resolves with the first value emitted by the observable.
 */
function getFirstValue<T>(observable: InteropableObservable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const sub = observable.subscribe(
      (v) => {
        resolve(v);
        unsub(sub);
      },
      (err) => {
        reject(err);
        unsub(sub);
      }
    );
  });
}

/** Unsubscribes from an observable */
function unsub(sub: (() => unknown) | { unsubscribe: () => unknown }) {
  if (typeof sub === 'function') {
    sub();
  } else {
    sub.unsubscribe();
  }
}

/**
 * Returns the result of a promise.
 * Suspends until the promise is resolved.
 *
 * Calls with the same cacheKey will use the same promise until it resolves.
 * After that, the promise is removed from the cache after 1 second.
 *
 * cacheKey must be globally unique.
 */
export function useSuspendingPromise<T>(
  getPromise: () => Promise<T>,
  cacheKey: React.DependencyList
): T {
  let promise = memoized(PROMISE_CACHE, cacheKey, () =>
    getPromise().finally(() => {
      setTimeout(() => {
        PROMISE_CACHE.delete(cacheKey);
      }, 1000);
    })
  );
  return use(promise);
}

const PROMISE_CACHE = new Map<React.DependencyList, Promise<any>>();

/**
 * Returns a value from the `cache` using the specified `key`.
 * If the key does not exist, the `init` function is called to create the value,
 * which is then stored in the cache and returned.
 *
 * The key is compared using dependency list semantics (like React.useEffect).
 */
function memoized<T>(
  cache: Map<React.DependencyList, T>,
  key: React.DependencyList,
  init: () => T
): T {
  let val: T | undefined;
  // TODO: enable iterators in TS and remove Array.from
  for (const [k, v] of Array.from(cache.entries())) {
    if (depEq(k, key)) {
      val = v;
      break;
    }
  }
  if (!val) {
    val = init();
    cache.set(key, val);
  }
  return val;
}

/** Compares two React dependency lists for equality */
function depEq(a: React.DependencyList, b: React.DependencyList): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}

/**
 * Subscribes to an observable and returns the current latest value.
 *
 * Does not suspend, instead uses the provided initialValue until the first value is received.
 */
function useObservableValue<T>(
  observable: InteropableObservable<T>,
  initialValue: T
): T {
  const [value, setValue] = React.useState(initialValue);
  React.useEffect(() => {
    const sub = observable.subscribe((v) => setValue(v));
    return () => unsub(sub);
  }, [observable]);
  return value;
}
