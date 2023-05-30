// There typings are extracted from https://github.com/tc39/proposal-observable

declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

interface Subscribable<T> {
  subscribe(observer: Partial<Observer<T>>): Unsubscribable;
}
interface Unsubscribable {
  unsubscribe(): void;
}
export interface Observable<T = any> {
  subscribe(observerOrNext?: Observer<T> | ((value: T) => void)): Subscription;
  subscribe(next?: ((value: T) => void) | null, error?: ((error: any) => void) | null, complete?: (() => void) | null): Subscription;
  getValue?(): T;
  hasValue?(): boolean;

	[Symbol.observable]: () => Subscribable<T>;
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
