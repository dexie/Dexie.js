export interface PromiseConstructorExtended extends PromiseConstructor {
  new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PromiseExtended<T>;
}

export interface PromiseExtended<T=any> extends Promise<T> {
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseExtended<TResult1 | TResult2>;
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): PromiseExtended<T | TResult>;
  catch<TResult = never>(ConstructorOrName: Function | string, onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): PromiseExtended<T | TResult>;
  finally<U>(onFinally?: () => U | PromiseLike<U>): PromiseExtended<T>;
  timeout (ms: number, msg?: string): PromiseExtended<T>;
}

export default PromiseExtended;
