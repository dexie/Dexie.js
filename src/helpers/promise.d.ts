
import {PromiseExtended, PromiseExtendedConstructor} from '../public/types/promise-extended';

export interface DexiePromise<T=any> extends PromiseExtended<T> {
  _state: null | true | false;
  _lib?: boolean;
}

export interface DexiePromiseConstructor extends PromiseExtendedConstructor {
  new <T>(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): DexiePromise<T>;
  follow<R> (fn: (...args)=>R, zoneProps): R;
  PSD,
  newPSD<R> (zoneProps, fn: (...args)=>R, ...args) : R;
  usePSD<R> (psd, fn: (...args)=>R, ...args): R;
  rejectionMapper: (e?: any) => Error;
}

export const NativePromise : PromiseConstructor;
export const AsyncFunction : FunctionConstructor;
export var globalPSD;
export var PSD;
export function wrap<F extends Function>(f: F, errorCatcher?: (err) => void) : F;
export function newScope<T> (fn: (...args)=>T, props?, a1?, a2?) : T;
export function usePSD<T> (psd, fn: (...args)=>T, a1?, a2?, a3?) : T;
export function rejection (failure: any) : DexiePromise<never>;

export declare var DexiePromise : DexiePromiseConstructor;

export default DexiePromise;
