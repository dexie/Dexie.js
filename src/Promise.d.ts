
import {PromiseExtended, PromiseExtendedConstructor} from '../api/promise-extended';

export const NativePromise : PromiseConstructor;
export const AsyncFunction : FunctionConstructor;
export var globalPSD;
export var PSD;
export function wrap<F extends Function>(f: F, errorCatcher?: (err) => void) : F;
export function newScope<T> (fn: (...args)=>T, props?, a1?, a2?) : T;
export function usePSD<T> (psd, fn: (...args)=>T, a1?, a2?, a3?) : T;
export function rejection (failure: any) : PromiseExtended<never>;

declare var Promise : PromiseExtendedConstructor;
export default Promise;
