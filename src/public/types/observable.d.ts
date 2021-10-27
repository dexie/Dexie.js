// There typings are extracted from https://github.com/tc39/proposal-observable

declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}
export interface Observable<T = any> {
  subscribe(
    onNext?: ((value: T) => void) | null,
    onError?: ((error: any) => void) | null,
    onComplete?: (() => void) | null
  ): Subscription;
  subscribe(observer?: Observer<T> | null): Subscription;
  [Symbol.observable]: () => Observable<T>;
}

export interface Subscription {
  unsubscribe(): void;
  readonly closed: boolean;
}

export interface Observer<T = any> {
  start?: (subscription: Subscription) => void;
  next?: (value: T) => void;
  error?: (error: any) => void;
  complete?: () => void;
}
