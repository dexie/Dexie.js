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
  let observable: InteropableObservable<T> | undefined;
  // TODO: enable iterators in TS and remove Array.from
  for (const [key, val] of Array.from(OBSERVABLES.entries())) {
    if (
      key.length === cacheKey.length &&
      key.every((k, i) => Object.is(k, cacheKey[i]))
    ) {
      observable = val;
      break;
    }
  }
  if (!observable) {
    observable = getObservable();
    OBSERVABLES.set(cacheKey, observable);
  }

  const incrementRef = () => {
    const timeout = TIMEOUTS.get(observable);
    if (timeout != null) clearTimeout(timeout);

    let refCount = REF_COUNTS.get(observable) ?? 0;
    refCount += 1;
    REF_COUNTS.set(observable, refCount);
  };

  const decrementRef = () => {
    let refCount = REF_COUNTS.get(observable)!;
    refCount -= 1;
    REF_COUNTS.set(observable, refCount);

    if (refCount <= 0) {
      const timeout = setTimeout(() => {
        for (const [key, val] of Array.from(OBSERVABLES.entries())) {
          if (val === observable) {
            OBSERVABLES.delete(key);
            break;
          }
        }
        PROMISES.delete(observable);
        VALUES.delete(observable);
        TIMEOUTS.delete(observable);
      }, 1000);
      TIMEOUTS.set(observable, timeout);
    }
  };

  let promise: Promise<T> | undefined = PROMISES.get(observable);
  if (!promise) {
    promise = new Promise<T>((resolve, reject) => {
      if (VALUES.has(observable)) {
        resolve(VALUES.get(observable)!);
        return;
      }

      incrementRef();

      const sub = observable.subscribe(
        (val) => {
          resolve(val);
          VALUES.set(observable, val);
          unsub(sub);
          decrementRef();
        },
        (err) => {
          reject(err);
          unsub(sub);
          decrementRef();
        }
      );
    });

    PROMISES.set(observable, promise);
  }

  use(promise);

  const [value, setValue] = React.useState<T>(VALUES.get(observable));
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    incrementRef();

    const sub = observable.subscribe(
      (val) => {
        VALUES.set(observable, val);
        setValue(val);
      },
      (err) => {
        setError(err);
      }
    );

    return () => {
      unsub(sub);
      decrementRef();
    };
  }, [observable]);

  if (error) throw error;
  return value;
}

const OBSERVABLES = new Map<React.DependencyList, InteropableObservable<any>>();

const PROMISES = new WeakMap<InteropableObservable<any>, Promise<any>>();

const VALUES = new WeakMap<InteropableObservable<any>, any>();

const TIMEOUTS = new WeakMap<
  InteropableObservable<any>,
  ReturnType<typeof setTimeout>
>();

const REF_COUNTS = new WeakMap<InteropableObservable<any>, number>();

/** Unsubscribes from an observable */
function unsub(sub: (() => unknown) | { unsubscribe: () => unknown }) {
  if (typeof sub === 'function') {
    sub();
  } else {
    sub.unsubscribe();
  }
}
