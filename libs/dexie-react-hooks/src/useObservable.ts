import { Observable } from 'dexie';
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
  const lastResult = React.useRef(defaultResult as T | TDefault);
  const lastError = React.useRef(null as any);
  const [_, triggerUpdate] = React.useState({});
  const observable = React.useMemo(() => {
    // Make it remember previous subscription's default value when
    // resubscribing (á la useTransition())
    const observable = typeof o === 'function' ? o() : o;
    // @ts-ignore: Optimize for BehaviorSubject and other observables implementing getValue():
    if (typeof observable?.getValue === 'function') {
      // @ts-ignore
      lastResult.current = observable.getValue();
    } else {
      // If the observable has a current value, try get it by subscribing and
      // unsubscribing synchronously
      observable.subscribe((val) => (lastResult.current = val)).unsubscribe();
    }
    return observable;
  }, deps);

  React.useDebugValue(lastResult.current);

  React.useEffect(() => {
    const subscription = observable.subscribe(
      (val) => {
        if (lastError.current !== null || lastResult.current !== val) {
          lastError.current = null;
          // @ts-ignore
          //lastResult.current = 'getValue' in observable ? observable.getValue() : val;
          lastResult.current = val;
          //console.debug('Emitt triggerUpdate', lastResult.current);
          //console.debug('Emitt triggerUpdate', val);
          triggerUpdate({});
        }
      },
      (err) => {
        if (lastError.current !== err) {
          lastError.current = err;
          triggerUpdate({});
        }
      }
    );
    return subscription.unsubscribe.bind(subscription);
  }, deps);

  if (lastError.current) throw lastError.current;
  //console.debug('Emitt returning', lastResult.current);

  return lastResult.current;
}
