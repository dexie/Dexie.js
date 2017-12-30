export interface PromiseExtendedConstructor extends PromiseConstructor {
  readonly prototype: PromiseExtended;
  new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PromiseExtended<T>;
  all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): PromiseExtended<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
  all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): PromiseExtended<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
  all<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): PromiseExtended<[T1, T2, T3, T4, T5, T6, T7, T8]>;
  all<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): PromiseExtended<[T1, T2, T3, T4, T5, T6, T7]>;
  all<T1, T2, T3, T4, T5, T6>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): PromiseExtended<[T1, T2, T3, T4, T5, T6]>;
  all<T1, T2, T3, T4, T5>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>]): PromiseExtended<[T1, T2, T3, T4, T5]>;
  all<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>]): PromiseExtended<[T1, T2, T3, T4]>;
  all<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): PromiseExtended<[T1, T2, T3]>;
  all<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): PromiseExtended<[T1, T2]>;
  all<T>(values: (T | PromiseLike<T>)[]): PromiseExtended<T[]>;
  race<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): PromiseExtended<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>;
  race<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): PromiseExtended<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
  race<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): PromiseExtended<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
  race<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): PromiseExtended<T1 | T2 | T3 | T4 | T5 | T6 | T7>;
  race<T1, T2, T3, T4, T5, T6>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): PromiseExtended<T1 | T2 | T3 | T4 | T5 | T6>;
  race<T1, T2, T3, T4, T5>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>]): PromiseExtended<T1 | T2 | T3 | T4 | T5>;
  race<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): PromiseExtended<T1 | T2 | T3 | T4>;
  race<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): PromiseExtended<T1 | T2 | T3>;
  race<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): PromiseExtended<T1 | T2>;
  race<T>(values: (T | PromiseLike<T>)[]): PromiseExtended<T>;
  reject(reason: any): PromiseExtended<never>;
  reject<T>(reason: any): PromiseExtended<T>;
  resolve<T>(value: T | PromiseLike<T>): PromiseExtended<T>;
  resolve(): PromiseExtended<void>;
}

/** The interface of Dexie.Promise, which basically extends standard Promise with methods:
 *  
 *  finally() - also subject for standardization
 *  timeout() - set a completion timeout
 *  catch(ErrorClass, handler) - java style error catching
 *  catch(errorName, handler) - cross-domain safe type error catching (checking error.name instead of instanceof)
 * 
 */
export interface PromiseExtended<T=any> extends Promise<T> {
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseExtended<TResult1 | TResult2>;
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): PromiseExtended<T | TResult>;
  catch<TResult = never>(ErrorConstructor: Function, onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): PromiseExtended<T | TResult>;
  catch<TResult = never>(errorName: string, onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): PromiseExtended<T | TResult>;
  finally<U>(onFinally?: () => U | PromiseLike<U>): PromiseExtended<T>;
  timeout (ms: number, msg?: string): PromiseExtended<T>;
}

