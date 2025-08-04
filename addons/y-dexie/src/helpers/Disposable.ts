export type Disposable = typeof Symbol extends {
  dispose: symbol;
}
  //@ts-ignore
  ? {[Symbol.dispose]: () => void;
  }
  : {};
// @ts-ignore
if (typeof Symbol.dispose !== 'symbol') {
  // @ts-ignore
  try {Symbol.dispose = Symbol('dispose');} catch {}
}
