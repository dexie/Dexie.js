import {liveQuery} from "dexie";
import {useSubscription} from "./use-subscription";
import {useMemo} from "react";

export function useLiveQuery<T>(querier: ()=>Promise<T> | T, dependencies?: any[]): T | undefined;
export function useLiveQuery<T,TDefault> (querier: ()=>Promise<T> | T, dependencies: any[], defaultResult: TDefault) : T | TDefault;
export function useLiveQuery<T,TDefault> (querier: ()=>Promise<T> | T, dependencies?: any[], defaultResult?: TDefault) : T | TDefault{
  let currentValue: T | TDefault = defaultResult as (T | TDefault);
  const subscription = useMemo(
    () => {
      const observable = liveQuery(querier);
      return {
        getCurrentValue: () => currentValue,
        subscribe: (onNext, onError) => {
          const esSubscription = observable.subscribe(value => {
            currentValue = value;
            onNext(value);
          }, onError);
          return esSubscription.unsubscribe.bind(esSubscription);
        }
      };
    },
 
    // Re-subscribe any time any of the given dependencies change
    dependencies || []
  );
 
  // The value returned by this hook reflects the current result from the querier
  // Our component will automatically be re-rendered when that value changes.
  const value = useSubscription(subscription);
  return value;
}