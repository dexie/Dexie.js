import {
  Observable as IObservable,
  Observer,
  Subscription,
} from "../../public/types/observable";

const symbolObservable: typeof Symbol.observable =
  typeof Symbol !== "undefined" && "observable" in Symbol
    ? Symbol.observable
    : "@@observable" as any;

export class Observable<T> implements IObservable<T> {
  private _subscribe: (observer: Observer<T>) => Subscription;
  constructor(subscribe: (observer: Observer<T>) => Subscription) {
    this._subscribe = subscribe;
  }

  subscribe(
    onNext?: ((value: T) => void) | null,
    onError?: ((error: any) => void) | null,
    onComplete?: (() => void) | null
  ): Subscription;
  subscribe(observer?: Observer<T> | null): Subscription;
  subscribe(x?: any, error?: any, complete?: any): Subscription {
    return this._subscribe(
      !x || typeof x === "function" ? { next: x, error, complete } : x
    );
  }

  [symbolObservable]() {
    return this;
  }
}
