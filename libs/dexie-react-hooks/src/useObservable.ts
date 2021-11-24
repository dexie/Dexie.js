import { Observable } from 'dexie';
import { useSubscription } from './useSubscription';
import React from 'react';

export function useObservable<T, TDefault>(
  observable: Observable<T>
): T | undefined;
export function useObservable<T, TDefault>(
  observable: Observable<T>,
  defaultResult: TDefault
): T | TDefault;
export function useObservable<T>(
  factory: () => Observable<T>,
  deps?: any[]
): T | undefined;
export function useObservable<T, TDefault>(
  factory: () => Observable<T>,
  deps: any[],
  defaultResult: TDefault
): T | TDefault;
export function useObservable<T, TDefault>(
  o: Observable<T> | (() => Observable<T>),
  arg2?: any,
  arg3?: any
) {
  const [deps, defaultResult] =
    typeof o === 'function' ? [arg2 || [], arg3] : [[], arg2];
  const [lastResult, setLastResult] = React.useState(
    defaultResult as T | TDefault
  );
  const subscription = React.useMemo(
    () => {
      // Make it remember previous subscription's default value when
      // resubscribing (á la useTransition())
      const observable = typeof o === 'function' ? o() : o;
      return {
        getCurrentValue: () => {
          // @ts-ignore: Optimize for BehaviorSubject and other observables implementing getValue():
          if (typeof observable.getValue === 'function') {
            // @ts-ignore
            return observable.getValue();
          }
          let currentValue = lastResult;
          observable.subscribe((value) => (currentValue = value)).unsubscribe();
          return currentValue;
        },
        subscribe: (onNext, onError) => {
          const esSubscription = observable.subscribe((value) => {
            setLastResult(value);
            onNext(value);
          }, onError);
          return esSubscription.unsubscribe.bind(esSubscription);
        },
      };
    },

    // Re-subscribe any time any of the given deps change
    deps
  );

  // The value returned by this hook reflects the current result from the observable
  // Our component will automatically be re-rendered when that value changes.
  return useSubscription(subscription);
}
