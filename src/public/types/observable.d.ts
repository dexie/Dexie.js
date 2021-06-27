// There typings are extracted from https://github.com/tc39/proposal-observable

export interface Observable<T = any> {
  subscribe(
    onNext?: ((value: T) => void) | null,
    onError?: ((error: any) => void) | null,
    onComplete?: (() => void) | null
  ): Subscription;
  subscribe(observer?: Observer<T> | null): Subscription;
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
