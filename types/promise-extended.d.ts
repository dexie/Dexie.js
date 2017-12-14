export interface PromiseExtendedConstructor extends PromiseConstructor {
  new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): PromiseExtended<T>;
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

export default PromiseExtended;
