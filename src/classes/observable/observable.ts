import {
  Observable as IObservable,
  Observer,
  Subscription,
} from "../../public/types/observable";

const symbolObservable =
  typeof Symbol !== "undefined" && "observable" in Symbol
    ? Symbol["observable"]
    : "@@observable";

export class Observable<T> implements IObservable<T> {
  private _subscribe: (observer: Observer<T>) => Subscription;
  constructor(subscribe: (observer: Observer<T>) => Subscription) {
    this._subscribe = subscribe;
  }

  subscribe(
    onNext: (value: T) => void,
    onError?: (error: any) => void,
    onComplete?: () => void
  ): Subscription;
  subscribe(observer: Observer<T>): Subscription;
  subscribe(x: any, error?: any, complete?: any): Subscription {
    return this._subscribe(
      typeof x === "function" ? { next: x, error, complete } : x
    );
  }

  [symbolObservable]() {
    return this;
  }
}
